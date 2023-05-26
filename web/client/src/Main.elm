module Main exposing (main)

import Browser
import Duration
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http
import Iso8601
import Json.Decode as Decode
import Json.Encode as Encode
import Jwt
import Mony
import Periode
import Platform.Cmd as Cmd
import String
import Time
import Time.Format
import Time.Format.Config.Config_de_de
import TimeZone
import YearMonth exposing (YearMonthSelect(..))


timeZone : Time.Zone
timeZone =
    TimeZone.europe__berlin ()


main : Program ( String, Int ) Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type alias Model =
    { periodes : List Periode.Periode
    , periodeAction : ModelPeriodeAction -- TODO: Make it a list
    , current : Periode.Current
    , insert : Maybe ModelInsert
    , permission : Permission
    , currentTime : Time.Posix
    , viewBody : ViewBody
    , errMsg : Maybe String
    , formComment : String
    , formLoginPassword : String
    , formYearMonth : YearMonth.YearMonthSelect
    }


type ModelPeriodeAction
    = ActionNone
    | ActionEdit ModelEdit
    | ActionDelete Periode.Periode


type alias ModelInsert =
    { start : String
    , duration : String
    , comment : String
    , error : Maybe String
    }


type alias ModelEdit =
    { id : Periode.ID
    , start : String
    , duration : String
    , comment : String
    , error : Maybe String
    }


type Msg
    = CurrentTime Time.Posix
      -- Network responses
    | ReceivedData (Result Http.Error Periode.State)
    | ReceivedActionResponse (Result Http.Error ())
      -- Authentication
    | InsertedLoginPassword String
    | ClickedLogin
    | ReceivedAuthResponse (Result Http.Error String)
    | ClickedLogout
      -- Navigation
    | SelectedYearMonthFilter String
    | ClickedBodyNav ViewBody
      -- Current Periode
    | ClickedStart
    | ClickedStop
    | InsertedCurrentComment String
      -- Add Periode
    | ClickedAddPeriode
    | InsertedAddPeriodeStartTime String
    | InsertedAddPeriodeDuration String
    | InsertedAddPeriodeComment String
    | ClickedAddPeriodeSubmit
    | ClickedAddPeriodeUntilNow
      -- Periode Actions
    | ClickedActionContinue Periode.Periode
    | ClickedActionEdit Periode.Periode
    | ClickedActionDelete Periode.Periode
    | ClickedActionSubmit
    | ClickedActionAbort
    | InsertedActionEditStartTime String
    | InsertedActionEditDuration String
    | InsertedActionEditComment String


init : ( String, Int ) -> ( Model, Cmd Msg )
init ( jwt, millis ) =
    let
        permission =
            permissionFromJWT jwt
    in
    ( emptyModel permission (Time.millisToPosix millis)
    , updateDataCommand permission
    )


emptyModel : Permission -> Time.Posix -> Model
emptyModel permission time =
    { periodes = []
    , periodeAction = ActionNone
    , current = Periode.Stopped
    , permission = permission
    , currentTime = time
    , viewBody = ViewPeriodes
    , errMsg = Nothing
    , formComment = ""
    , insert = Nothing
    , formLoginPassword = ""
    , formYearMonth = YearMonth.All
    }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        CurrentTime newTime ->
            ( { model | currentTime = newTime }
            , Cmd.none
            )

        -- Network responses
        ReceivedData response ->
            case response of
                Ok state ->
                    ( { model
                        | periodes = state.periodes
                        , current = state.current
                        , formComment = Periode.stateComment state
                        , errMsg = Nothing
                      }
                    , Cmd.none
                    )

                Err e ->
                    ( cleanModelWithError model (buildHTTPResponseErrorMessage e)
                    , Cmd.none
                    )

        ReceivedActionResponse response ->
            case response of
                Ok _ ->
                    -- If an action returns 200, then reload all data.
                    ( model
                    , updateDataCommand model.permission
                    )

                Err e ->
                    ( cleanModelWithError model (buildHTTPResponseErrorMessage e)
                    , Cmd.none
                    )

        -- Authentication
        InsertedLoginPassword password ->
            ( { model | formLoginPassword = password }
            , Cmd.none
            )

        ClickedLogin ->
            ( { model | formLoginPassword = "" }
            , sendPassword ReceivedAuthResponse model.formLoginPassword
            )

        ReceivedAuthResponse response ->
            case response of
                Ok permissionLevel ->
                    ( { model | permission = permissionFromString permissionLevel }
                    , Periode.fetch ReceivedData
                    )

                Err e ->
                    ( cleanModelWithError model (buildHTTPResponseErrorMessage e)
                    , Cmd.none
                    )

        ClickedLogout ->
            ( { model | permission = PermissionNone }
            , Http.get
                { url = "/api/auth/logout"
                , expect = Http.expectWhatever ReceivedActionResponse
                }
            )

        -- Navigation
        SelectedYearMonthFilter selectAttr ->
            ( { model | formYearMonth = YearMonth.fromSelectAttr selectAttr }
            , Cmd.none
            )

        ClickedBodyNav value ->
            ( { model | viewBody = value }
            , Cmd.none
            )

        -- Current Periode
        ClickedStart ->
            ( model
            , sendStartStop "start" ReceivedActionResponse model.formComment
            )

        ClickedStop ->
            ( model
            , sendStartStop "stop" ReceivedActionResponse model.formComment
            )

        InsertedCurrentComment comment ->
            ( { model | formComment = comment }
            , Cmd.none
            )

        -- Add Periode
        ClickedAddPeriode ->
            ( { model | insert = Just <| emptyAddPeriode model.currentTime }
            , Cmd.none
            )

        InsertedAddPeriodeStartTime startStr ->
            let
                insert =
                    modelInsert model
            in
            ( { model | insert = Just { insert | start = startStr } }
            , Cmd.none
            )

        InsertedAddPeriodeDuration duration ->
            let
                insert =
                    modelInsert model
            in
            ( { model | insert = Just { insert | duration = duration } }
            , Cmd.none
            )

        InsertedAddPeriodeComment comment ->
            let
                insert =
                    modelInsert model
            in
            ( { model | insert = Just { insert | comment = comment } }
            , Cmd.none
            )

        ClickedAddPeriodeSubmit ->
            let
                insert =
                    modelInsert model

                mayDuration =
                    stringToDuration insert.duration
                        |> Result.mapError (\_ -> "Duration is wrong")

                mayStart =
                    Iso8601.toTime insert.start
                        |> Result.mapError (\_ -> "Start is wrong")

                insertCmd =
                    combineResult
                        (\duration start -> sendInsert ReceivedActionResponse start duration insert.comment)
                        mayDuration
                        mayStart
            in
            case insertCmd of
                Ok cmd ->
                    ( { model | insert = Nothing }
                    , cmd
                    )

                Err errMSG ->
                    ( { model | insert = Just { insert | error = Just errMSG } }
                    , Cmd.none
                    )

        ClickedAddPeriodeUntilNow ->
            let
                insert =
                    modelInsert model

                newInsert =
                    insert.duration
                        |> stringToDuration
                        |> Result.map
                            (\duration -> Duration.subtractFrom model.currentTime duration)
                        |> Result.map
                            (\time -> { insert | start = posix2timevalue time, error = Nothing })
                        |> handleError
                            (\errMSG -> { insert | error = Just errMSG })
            in
            ( { model | insert = Just newInsert }
            , Cmd.none
            )

        --Periode Actions
        ClickedActionContinue periode ->
            ( model
            , sendStartStop "start" ReceivedActionResponse periode.comment
            )

        ClickedActionEdit periode ->
            ( { model | periodeAction = ActionEdit <| emptyActionEdit periode }
            , Cmd.none
            )

        ClickedActionDelete periode ->
            ( { model | periodeAction = ActionDelete periode }
            , Cmd.none
            )

        ClickedActionSubmit ->
            case model.periodeAction of
                ActionEdit ep ->
                    let
                        mayDuration =
                            stringToDuration ep.duration
                                |> Result.mapError (\_ -> "Duration is wrong")

                        mayStart =
                            Iso8601.toTime ep.start
                                |> Result.mapError (\_ -> "Start is wrong")

                        editCmd =
                            combineResult
                                (\duration start -> sendEdit ReceivedActionResponse ep.id (Just start) (Just duration) (Just ep.comment))
                                mayDuration
                                mayStart
                    in
                    case editCmd of
                        Ok cmd ->
                            ( { model | periodeAction = ActionNone }
                            , cmd
                            )

                        Err err ->
                            ( { model | periodeAction = ActionEdit { ep | error = Just err } }
                            , Cmd.none
                            )

                ActionDelete periode ->
                    ( model
                    , sendDelete ReceivedActionResponse periode.id
                    )

                _ ->
                    ( model
                    , Cmd.none
                    )

        ClickedActionAbort ->
            ( { model | periodeAction = ActionNone }
            , Cmd.none
            )

        InsertedActionEditComment comment ->
            case model.periodeAction of
                ActionEdit ep ->
                    ( { model | periodeAction = ActionEdit { ep | comment = comment } }
                    , Cmd.none
                    )

                _ ->
                    ( model
                    , Cmd.none
                    )

        InsertedActionEditStartTime start ->
            case model.periodeAction of
                ActionEdit ep ->
                    ( { model | periodeAction = ActionEdit { ep | start = start } }
                    , Cmd.none
                    )

                _ ->
                    ( model
                    , Cmd.none
                    )

        InsertedActionEditDuration duration ->
            case model.periodeAction of
                ActionEdit ep ->
                    ( { model | periodeAction = ActionEdit { ep | duration = duration } }
                    , Cmd.none
                    )

                _ ->
                    ( model
                    , Cmd.none
                    )


handleError : (x -> a) -> Result x a -> a
handleError fn result =
    case result of
        Ok v ->
            v

        Err err ->
            fn err


combineResult : (a1 -> a2 -> a) -> Result x a1 -> Result x a2 -> Result x a
combineResult fnGood r1 r2 =
    case ( r1, r2 ) of
        ( Ok a, Ok b ) ->
            Ok <| fnGood a b

        ( Err a, _ ) ->
            Err a

        ( _, Err b ) ->
            Err b


buildHTTPResponseErrorMessage : Http.Error -> String
buildHTTPResponseErrorMessage httpError =
    case httpError of
        Http.BadUrl message ->
            message

        Http.Timeout ->
            "Server is taking too long to respond. Please try again later."

        Http.NetworkError ->
            "Unable to reach server."

        Http.BadStatus statusCode ->
            "Request failed with status code: " ++ String.fromInt statusCode

        Http.BadBody message ->
            message


cleanModelWithError : Model -> String -> Model
cleanModelWithError model err =
    let
        cleanModel =
            emptyModel model.permission model.currentTime
    in
    { cleanModel
        | errMsg = Just err
    }


emptyAddPeriode : Time.Posix -> ModelInsert
emptyAddPeriode currentTime =
    { duration = ""
    , comment = ""
    , start = posix2timevalue currentTime
    , error = Nothing
    }


modelInsert : Model -> ModelInsert
modelInsert model =
    model.insert
        |> Maybe.withDefault (emptyAddPeriode model.currentTime)


emptyActionEdit : Periode.Periode -> ModelEdit
emptyActionEdit periode =
    { id = periode.id
    , start = posix2timevalue periode.start
    , duration = periode.duration |> durationToString
    , comment = periode.comment
    , error = Nothing
    }


stringToDuration : String -> Result String Duration.Duration
stringToDuration =
    String.toFloat
        >> Result.fromMaybe "Duration has to be a number"
        >> Result.map Duration.minutes


durationToString : Duration.Duration -> String
durationToString =
    Duration.inMinutes
        >> String.fromFloat


updateDataCommand : Permission -> Cmd Msg
updateDataCommand perm =
    case perm of
        PermissionNone ->
            Cmd.none

        _ ->
            Periode.fetch ReceivedData



-- Auth and permission handling


type Permission
    = PermissionWrite
    | PermissionRead
    | PermissionNone


permissionFromString : String -> Permission
permissionFromString permStr =
    case String.trim permStr of
        "write" ->
            PermissionWrite

        "read" ->
            PermissionRead

        _ ->
            PermissionNone


permissionFromJWT : String -> Permission
permissionFromJWT token =
    let
        decoder =
            Decode.field "level" Decode.string
    in
    Jwt.decodeToken decoder token
        |> Result.andThen (permissionFromString >> Result.Ok)
        |> Result.withDefault PermissionNone


sendPassword : (Result Http.Error String -> Msg) -> String -> Cmd Msg
sendPassword result pass =
    Http.post
        { url = "/api/auth"
        , body = Http.jsonBody (passwordEncoder pass)
        , expect = Http.expectString result
        }


passwordEncoder : String -> Encode.Value
passwordEncoder pass =
    Encode.object
        [ ( "password", Encode.string pass ) ]



-- Start Stop


sendStartStop : String -> (Result Http.Error () -> Msg) -> String -> Cmd Msg
sendStartStop startStop result comment =
    Http.post
        { url = "/api/" ++ startStop
        , body = Http.jsonBody (commentEncoder comment)
        , expect = Http.expectWhatever result
        }


commentEncoder : String -> Encode.Value
commentEncoder comment =
    Encode.object
        [ ( "comment", Encode.string comment ) ]



-- Insert


sendInsert : (Result Http.Error () -> Msg) -> Time.Posix -> Duration.Duration -> String -> Cmd Msg
sendInsert result start duration comment =
    Http.post
        { url = "/api/periode"
        , body = Http.jsonBody (insertEncoder start duration comment)
        , expect = Http.expectWhatever result
        }


sendEdit : (Result Http.Error () -> Msg) -> Periode.ID -> Maybe Time.Posix -> Maybe Duration.Duration -> Maybe String -> Cmd Msg
sendEdit result id start mayDuration mayComment =
    Http.request
        { method = "PUT"
        , headers = []
        , url = "/api/periode/" ++ Periode.idToString id
        , body = Http.jsonBody (editEncoder start mayDuration mayComment)
        , expect = Http.expectWhatever result
        , timeout = Nothing
        , tracker = Nothing
        }



-- Periode Actions


sendDelete : (Result Http.Error () -> Msg) -> Periode.ID -> Cmd Msg
sendDelete result id =
    Http.request
        { method = "DELETE"
        , headers = []
        , url = "/api/periode/" ++ Periode.idToString id
        , body = Http.emptyBody
        , expect = Http.expectWhatever result
        , timeout = Nothing
        , tracker = Nothing
        }


insertEncoder : Time.Posix -> Duration.Duration -> String -> Encode.Value
insertEncoder start duration comment =
    Encode.object
        [ ( "start", (Time.posixToMillis start // 1000) |> Encode.int )
        , ( "duration", (Duration.inSeconds duration |> round) |> Encode.int )
        , ( "comment", Encode.string comment )
        ]


editEncoder : Maybe Time.Posix -> Maybe Duration.Duration -> Maybe String -> Encode.Value
editEncoder mayStart mayDuration mayComment =
    let
        encodedStart =
            Maybe.map (\start -> ( "start", (Time.posixToMillis start // 1000) |> Encode.int )) mayStart

        encodedDuration =
            Maybe.map (\duration -> ( "duration", (Duration.inSeconds duration |> round) |> Encode.int )) mayDuration

        encodedComment =
            Maybe.map (\comment -> ( "comment", Encode.string comment )) mayComment
    in
    [ encodedStart, encodedDuration, encodedComment ]
        |> List.filterMap identity
        |> Encode.object



-- view Helpers


intToPadding2String : Int -> String
intToPadding2String n =
    let
        str =
            String.fromInt n

        formatted =
            if String.length str < 2 then
                "0" ++ str

            else
                str
    in
    formatted


centToString : Int -> String
centToString euroCent =
    let
        euro =
            euroCent // 100

        euroString =
            intToFormattedString euro

        cent =
            remainderBy 100 euroCent
    in
    euroString ++ "," ++ intToPadding2String cent ++ " €"


{-| intToFormattedString converts an int to a string that has a . at every third
place.
-}
intToFormattedString : Int -> String
intToFormattedString int =
    String.fromInt int
        |> String.foldr
            (\c list ->
                let
                    last =
                        List.head list |> Maybe.withDefault ""
                in
                if String.length last == 3 then
                    String.fromChar c :: list

                else
                    String.cons c last :: List.drop 1 list
            )
            []
        |> String.join "."


durationToMonyString : Duration.Duration -> String
durationToMonyString duration =
    Mony.durationToCent duration
        |> centToString


canWrite : Permission -> Html Msg -> Html Msg
canWrite permission html =
    case permission of
        PermissionWrite ->
            html

        _ ->
            text ""


combineDurations : List Duration.Duration -> Duration.Duration
combineDurations durations =
    durations
        |> List.map Duration.inMilliseconds
        |> List.foldl (+) 0
        |> Duration.milliseconds


durationToTimeString : Duration.Duration -> String
durationToTimeString duration =
    let
        ( hours, minutes ) =
            Mony.durationInHourMinutes duration
    in
    String.fromInt hours ++ ":" ++ intToPadding2String minutes


posixToString : Time.Posix -> String
posixToString time =
    Time.Format.format Time.Format.Config.Config_de_de.config "%Y-%m-%d %H:%M" timeZone time



-- View


view : Model -> Html Msg
view model =
    case model.errMsg of
        Just err ->
            div [] [ text err ]

        Nothing ->
            case model.permission of
                PermissionNone ->
                    viewLogin model.formLoginPassword

                _ ->
                    div []
                        [ viewCurrent model.current model.formComment model.currentTime |> canWrite model.permission
                        , viewInsert model.insert |> canWrite model.permission
                        , viewBody model
                        , viewFooter
                        ]


viewLogin : String -> Html Msg
viewLogin pass =
    div []
        [ h5 [] [ text "Login" ]
        , input
            [ type_ "password"
            , value pass
            , onInput InsertedLoginPassword
            ]
            []
        , button [ class "btn btn-primary", onClick ClickedLogin ] [ text "Anmelden" ]
        ]


type StartStop
    = Start
    | Stop


viewCurrent : Periode.Current -> String -> Time.Posix -> Html Msg
viewCurrent current insertedComment currentTime =
    case current of
        Periode.Stopped ->
            viewStartStopForm Start insertedComment

        Periode.Started start serverComment ->
            let
                mony =
                    Duration.from start currentTime |> durationToMonyString
            in
            div []
                [ viewStartStopForm Stop insertedComment
                , div [] [ text ("running since " ++ posixToString start ++ ": " ++ serverComment ++ ": " ++ mony) ]
                ]


viewStartStopForm : StartStop -> String -> Html Msg
viewStartStopForm startStop comment =
    let
        ( event, buttonText ) =
            case startStop of
                Start ->
                    ( ClickedStart
                    , "Start"
                    )

                Stop ->
                    ( ClickedStop
                    , "Stop"
                    )
    in
    div []
        [ button [ class "btn btn-primary", onClick event ] [ text buttonText ]
        , input
            [ id "comment"
            , type_ "text"
            , value comment
            , onInput InsertedCurrentComment
            ]
            []
        ]


viewInsert : Maybe ModelInsert -> Html Msg
viewInsert maybeInsert =
    case maybeInsert of
        Nothing ->
            div [ class "btn btn-secondary", onClick ClickedAddPeriode ] [ text "Add" ]

        Just insert ->
            div []
                [ input [ type_ "datetime-local", value insert.start, onInput InsertedAddPeriodeStartTime ] []
                , input
                    [ id "duration"
                    , type_ "text"
                    , placeholder "minutes"
                    , value insert.duration
                    , onInput InsertedAddPeriodeDuration
                    ]
                    []
                , button [ class "btn btn-secondary", onClick ClickedAddPeriodeUntilNow, title "Set start minutes before now" ] [ text "↺" ]
                , input
                    [ id "comment"
                    , type_ "text"
                    , placeholder "comment"
                    , value insert.comment
                    , onInput InsertedAddPeriodeComment
                    ]
                    []
                , button [ class "btn btn-primary", onClick ClickedAddPeriodeSubmit ] [ text "Insert" ]
                , div [] [ text <| Maybe.withDefault "" insert.error ]
                ]


type ViewBody
    = ViewMonthly
    | ViewPeriodes


viewBody : Model -> Html Msg
viewBody model =
    div []
        [ ul [ class "nav nav-tabs" ]
            [ navLink ViewMonthly model.viewBody
            , navLink ViewPeriodes model.viewBody
            ]
        , case model.viewBody of
            ViewMonthly ->
                viewMonthly timeZone model.periodes

            ViewPeriodes ->
                viewPeriodes timeZone model.formYearMonth model.periodeAction model.permission model.periodes
        ]


navLink : ViewBody -> ViewBody -> Html Msg
navLink myViewBody activeViewBody =
    let
        linkClass =
            if myViewBody == activeViewBody then
                "nav-link active"

            else
                "nav-link"

        viewText =
            case myViewBody of
                ViewMonthly ->
                    "Monate"

                ViewPeriodes ->
                    "Zeiten"
    in
    li [ class "nav-item" ] [ a [ class linkClass, href "#", onClick (ClickedBodyNav myViewBody) ] [ text viewText ] ]


viewMonthly : Time.Zone -> List Periode.Periode -> Html Msg
viewMonthly zone periodes =
    div []
        [ table [ class "table" ]
            (tr []
                [ th [ class "month" ] [ text "Monat" ]
                , th [ class "time" ] [ text "Zeiten" ]
                , th [ class "mony" ] [ text "Euro" ]
                ]
                :: (Periode.sort periodes
                        |> Periode.byYearMonth zone
                        |> List.map viewMonthlyLine
                   )
            )
        ]


viewMonthlyLine : ( String, List Periode.Periode ) -> Html Msg
viewMonthlyLine ( yearMonthText, periodes ) =
    let
        duration =
            List.map .duration periodes
                |> combineDurations
    in
    tr []
        [ td [] [ text yearMonthText ]
        , td [ class "time" ] [ text <| durationToTimeString duration ]
        , td [ class "mony" ] [ text <| durationToMonyString duration ]
        ]


viewPeriodes : Time.Zone -> YearMonthSelect -> ModelPeriodeAction -> Permission -> List Periode.Periode -> Html Msg
viewPeriodes zone selected edit permission periodes =
    let
        sorted =
            Periode.sort periodes

        filtered =
            Periode.filterYearMonth timeZone selected sorted

        tableBody =
            viewPeriodeSummary permission filtered :: List.map (viewPeriodeLine edit permission) filtered
    in
    div []
        [ sorted
            |> List.map .start
            |> YearMonth.viewYearMonthSelect zone selected SelectedYearMonthFilter
        , table [ class "table" ]
            [ viewPeriodeHeader permission
            , tbody [] tableBody
            ]
        ]


viewPeriodeHeader : Permission -> Html Msg
viewPeriodeHeader permission =
    thead []
        [ tr []
            [ th [ scope "col", class "time" ] [ text "Start" ]
            , th [ scope "col", class "time" ] [ text "Dauer" ]
            , th [ scope "col" ] [ text "Euros" ]
            , th [ scope "col" ] [ text "Comment" ]
            , th [ scope "col", class "actions buttons" ] [ text "#" ] |> canWrite permission
            ]
        ]


viewPeriodeSummary : Permission -> List Periode.Periode -> Html Msg
viewPeriodeSummary permission periodes =
    let
        duration =
            List.map .duration periodes |> combineDurations
    in
    tr []
        [ td [] [ text "Gesamt" ]
        , td [] [ text <| durationToTimeString duration ]
        , td [] [ text <| durationToMonyString duration ]
        , td [] [ text "" ]
        , td [] [ text "" ] |> canWrite permission
        ]


viewPeriodeLine : ModelPeriodeAction -> Permission -> Periode.Periode -> Html Msg
viewPeriodeLine action permission periode =
    case ( action, permission ) of
        ( ActionEdit edit, PermissionWrite ) ->
            if edit.id == periode.id then
                viewPeriodeEditLine edit

            else
                viewPeriodeShowLine permission periode

        ( ActionDelete p, PermissionWrite ) ->
            if periode == p then
                viewPeriodeDeleteLine periode

            else
                viewPeriodeShowLine permission periode

        _ ->
            viewPeriodeShowLine permission periode


viewPeriodeShowLine : Permission -> Periode.Periode -> Html Msg
viewPeriodeShowLine permission periode =
    tr []
        [ td [] [ text <| posixToString periode.start ]
        , td [] [ text <| durationToTimeString periode.duration ]
        , td [] [ text <| durationToMonyString periode.duration ]
        , td [] [ text periode.comment ]
        , td [ class "buttons" ]
            [ button [ type_ "button", class "btn btn-info", onClick (ClickedActionContinue periode) ] [ text "→" ]
            , button [ type_ "button", class "btn btn-warning", onClick (ClickedActionEdit periode) ] [ text "✎" ]
            , button [ type_ "button", class "btn btn-danger", onClick (ClickedActionDelete periode) ] [ text "✖" ]
            ]
            |> canWrite permission
        ]


viewPeriodeEditLine : ModelEdit -> Html Msg
viewPeriodeEditLine edit =
    let
        monyString =
            case stringToDuration edit.duration of
                Ok duration ->
                    durationToMonyString duration

                Err _ ->
                    "-"
    in
    tr []
        [ td []
            [ input [ type_ "datetime-local", value edit.start, onInput InsertedActionEditStartTime ] []
            ]
        , td []
            [ input
                [ id "edit-duration"
                , type_ "text"
                , placeholder "minutes"
                , value edit.duration
                , onInput InsertedActionEditDuration
                ]
                []
            ]
        , td [] [ text monyString ]
        , td []
            [ input
                [ id "edit-comment"
                , type_ "text"
                , placeholder "comment"
                , value edit.comment
                , onInput InsertedActionEditComment
                ]
                []
            ]
        , td [ class "buttons" ]
            [ text "Edit?"
            , button [ type_ "button", class "btn btn-danger", onClick ClickedActionAbort ] [ text "✖" ]
            , button [ type_ "button", class "btn btn-success", onClick ClickedActionSubmit ] [ text "⏎" ]
            ]
        ]


viewPeriodeDeleteLine : Periode.Periode -> Html Msg
viewPeriodeDeleteLine periode =
    tr []
        [ td [] [ text <| posixToString periode.start ]
        , td [] [ text <| durationToTimeString periode.duration ]
        , td [] [ text <| durationToMonyString periode.duration ]
        , td [] [ text periode.comment ]
        , td [ class "buttons" ]
            [ text "Delete?"
            , button [ type_ "button", class "btn btn-danger", onClick ClickedActionAbort ] [ text "✖" ]
            , button [ type_ "button", class "btn btn-success", onClick ClickedActionSubmit ] [ text "⏎" ]
            ]
        ]


viewFooter : Html Msg
viewFooter =
    footer [ class "fixed-bottom container" ]
        [ a [ href "https://github.com/ostcar/timer" ] [ text "github" ]
        , text " · "
        , a [ href "#", class "link-primary", onClick ClickedLogout ] [ text "logout" ]
        ]


subscriptions : Model -> Sub Msg
subscriptions _ =
    Time.every 1000 CurrentTime


posix2timevalue : Time.Posix -> String
posix2timevalue time =
    ---- YYYY
    toPaddedString 4 (Time.toYear timeZone time)
        ++ "-"
        -- MM
        ++ toPaddedString 2 (fromMonth (Time.toMonth timeZone time))
        ++ "-"
        -- DD
        ++ toPaddedString 2 (Time.toDay timeZone time)
        ++ "T"
        -- HH
        ++ toPaddedString 2 (Time.toHour timeZone time)
        ++ ":"
        -- mm
        ++ toPaddedString 2 (Time.toMinute timeZone time)


toPaddedString : Int -> Int -> String
toPaddedString digits time =
    String.padLeft digits '0' (String.fromInt time)


fromMonth : Time.Month -> Int
fromMonth month =
    case month of
        Time.Jan ->
            1

        Time.Feb ->
            2

        Time.Mar ->
            3

        Time.Apr ->
            4

        Time.May ->
            5

        Time.Jun ->
            6

        Time.Jul ->
            7

        Time.Aug ->
            8

        Time.Sep ->
            9

        Time.Oct ->
            10

        Time.Nov ->
            11

        Time.Dec ->
            12
