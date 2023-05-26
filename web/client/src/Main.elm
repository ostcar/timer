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
    , periodeAction : ModelPeriodeAction
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
    | ActionDelete Periode.ID


type alias ModelInsert =
    { formDuration : String
    , formComment : String
    , formStart : String
    , error : Maybe String
    }


type alias ModelEdit =
    { id : Periode.ID
    , start : String
    , minutes : String
    , comment : String
    , error : Maybe String
    }


type Msg
    = CurrentTime Time.Posix
      -- Network responses
    | ReceivedState (Result Http.Error Periode.State)
    | ReceivedEvent (Result Http.Error ()) -- Response for every action
      -- Login
    | InsertedLoginPassword String
    | ClickedLogin
    | ReceivedAuth (Result Http.Error String)
    | ClickedLogout
      -- Navigation
    | SelectedYearMonthFilter String
    | ClickedBodyNav ViewBody
      -- Current Periode
    | InsertedCurrentComment String
    | ClickedStart
    | ClickedStop
      -- Add Periode
    | ClickAddPeriode
    | InsertedAddPeriodeStartTime String
    | InsertedAddPeriodeDuration String
    | InsertedAddPeriodeComment String
    | ClickedAddPeriodeSubmit
    | ClickedAddPeriodeUntilNow
      -- Periode Actions
    | ClickedActionContinue Periode.ID
    | ClickedActionEdit Periode.Periode
    | ClickedActionDelete Periode.ID
    | ClickedActionSubmit Periode.ID
    | ClickedActionAbort
    | ClickedActionSubmit2
    | InsertedActionEditStartTime String
    | InsertedActionEditDuration String
    | InsertedActionEditComment String


init : ( String, Int ) -> ( Model, Cmd Msg )
init ( jwt, millis ) =
    let
        permission =
            permissionFromJWT jwt
    in
    ( { periodes = []
      , periodeAction = ActionNone
      , current = Periode.Stopped
      , permission = permission
      , currentTime = Time.millisToPosix millis
      , viewBody = ViewPeriodes
      , errMsg = Nothing
      , formComment = ""
      , insert = Nothing
      , formLoginPassword = ""
      , formYearMonth = YearMonth.All
      }
    , updateStateIfPermission permission
    )


insertForm : Model -> ModelInsert
insertForm model =
    model.insert
        |> Maybe.withDefault (emptyInsert model.currentTime)


emptyEdit : Periode.Periode -> ModelEdit
emptyEdit periode =
    { id = periode.id
    , start = posix2timevalue periode.start
    , minutes = periode.duration |> durationToString
    , comment = periode.comment
    , error = Nothing
    }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ReceivedState response ->
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
                    ( { model
                        | periodes = []
                        , current = Periode.Stopped
                        , errMsg = Just (buildErrorMessage e)
                      }
                    , Cmd.none
                    )

        -- If an action returns 200, then reload all data.
        ReceivedEvent response ->
            case response of
                Ok _ ->
                    ( model
                    , updateStateIfPermission model.permission
                    )

                Err e ->
                    ( { model
                        | periodes = []
                        , current = Periode.Stopped
                        , errMsg = Just (buildErrorMessage e)
                        , permission = PermissionNone
                      }
                    , Cmd.none
                    )

        CurrentTime newTime ->
            ( { model | currentTime = newTime }
            , Cmd.none
            )

        InsertedCurrentComment comment ->
            ( { model | formComment = comment }
            , Cmd.none
            )

        ClickedStart ->
            ( model
            , sendStartStop "start" ReceivedEvent model.formComment
            )

        ClickedStop ->
            ( model
            , sendStartStop "stop" ReceivedEvent model.formComment
            )

        ClickedActionContinue id ->
            ( model
            , List.filter (\p -> p.id == id) model.periodes
                |> List.head
                |> Maybe.andThen
                    (\p ->
                        p.comment
                            |> sendStartStop "start" ReceivedEvent
                            |> Just
                    )
                |> Maybe.withDefault Cmd.none
            )

        ClickedActionEdit periode ->
            ( { model | periodeAction = ActionEdit (emptyEdit periode) }
            , Cmd.none
            )

        ClickedActionDelete id ->
            ( { model | periodeAction = ActionDelete id }
            , Cmd.none
            )

        ClickedActionSubmit id ->
            ( model
            , sendDelete ReceivedEvent id
            )

        ClickedActionAbort ->
            ( { model | periodeAction = ActionNone }
            , Cmd.none
            )

        ClickedActionSubmit2 ->
            case model.periodeAction of
                ActionEdit ep ->
                    let
                        mayDuration =
                            stringToDuration ep.minutes

                        mayStart =
                            Iso8601.toTime ep.start
                    in
                    case ( mayDuration, mayStart ) of
                        ( Ok duration, Ok start ) ->
                            ( { model | periodeAction = ActionNone }
                            , sendEdit ReceivedEvent ep.id (Just start) (Just duration) (Just ep.comment)
                            )

                        _ ->
                            ( model
                            , Cmd.none
                            )

                _ ->
                    ( model
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

        InsertedActionEditDuration minutes ->
            case model.periodeAction of
                ActionEdit ep ->
                    ( { model | periodeAction = ActionEdit { ep | minutes = minutes } }
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

        ClickAddPeriode ->
            ( { model | insert = emptyInsert model.currentTime |> Just }
            , Cmd.none
            )

        InsertedAddPeriodeStartTime startStr ->
            let
                insert =
                    insertForm model
            in
            ( { model | insert = Just { insert | formStart = startStr } }
            , Cmd.none
            )

        InsertedAddPeriodeDuration durationStr ->
            let
                insert =
                    insertForm model
            in
            ( { model | insert = Just { insert | formDuration = durationStr } }
            , Cmd.none
            )

        InsertedAddPeriodeComment comment ->
            let
                insert =
                    insertForm model
            in
            ( { model | insert = Just { insert | formComment = comment } }
            , Cmd.none
            )

        ClickedAddPeriodeUntilNow ->
            let
                insert =
                    insertForm model

                newStartResult =
                    insert.formDuration
                        |> stringToDuration
                        |> Result.map (\duration -> Duration.subtractFrom model.currentTime duration)

                newFormInsert =
                    case newStartResult of
                        Ok time ->
                            { insert | formStart = posix2timevalue time, error = Nothing }

                        Err errMSG ->
                            { insert | error = Just errMSG }
            in
            ( { model | insert = Just newFormInsert }
            , Cmd.none
            )

        ClickedAddPeriodeSubmit ->
            let
                insert =
                    insertForm model

                insertCMD =
                    Iso8601.toTime insert.formStart
                        |> Result.mapError (\_ -> "Start is wrong")
                        |> Result.andThen
                            (\start ->
                                resultFromEmptyString "No duration provided" insert.formDuration
                                    |> Result.andThen
                                        (stringToDuration
                                            >> Result.map (\duration -> sendInsert ReceivedEvent start duration insert.formComment)
                                        )
                            )
            in
            case insertCMD of
                Ok cmd ->
                    ( { model | insert = Nothing }
                    , cmd
                    )

                Err errMSG ->
                    ( { model | insert = Just { insert | error = Just errMSG } }
                    , Cmd.none
                    )

        InsertedLoginPassword password ->
            ( { model | formLoginPassword = password }
            , Cmd.none
            )

        ClickedLogin ->
            ( { model | formLoginPassword = "" }
            , sendPassword ReceivedAuth model.formLoginPassword
            )

        ReceivedAuth response ->
            case response of
                Ok permissionLevel ->
                    ( { model | permission = permissionFromString permissionLevel }
                    , Periode.fetch ReceivedState
                    )

                Err e ->
                    ( { model
                        | periodes = []
                        , current = Periode.Stopped
                        , errMsg = Just (buildErrorMessage e)
                      }
                    , Cmd.none
                    )

        ClickedLogout ->
            ( { model | permission = PermissionNone }
            , Http.get
                { url = "/api/auth/logout"
                , expect = Http.expectWhatever ReceivedEvent
                }
            )

        SelectedYearMonthFilter value ->
            ( { model | formYearMonth = YearMonth.fromAttr value }
            , Cmd.none
            )

        ClickedBodyNav value ->
            ( { model | viewBody = value }
            , Cmd.none
            )


stringToDuration : String -> Result String Duration.Duration
stringToDuration =
    String.toFloat
        >> Result.fromMaybe "Duration has to be a number"
        >> Result.map Duration.minutes


durationToString : Duration.Duration -> String
durationToString =
    Duration.inMinutes
        >> String.fromFloat


updateStateIfPermission : Permission -> Cmd Msg
updateStateIfPermission perm =
    case perm of
        PermissionNone ->
            Cmd.none

        _ ->
            Periode.fetch ReceivedState


resultFromEmptyString : x -> String -> Result x String
resultFromEmptyString error str =
    if str == "" then
        Result.Err error

    else
        Result.Ok str


buildErrorMessage : Http.Error -> String
buildErrorMessage httpError =
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


emptyInsert : Time.Posix -> ModelInsert
emptyInsert currentTime =
    { formDuration = ""
    , formComment = ""
    , formStart = posix2timevalue currentTime
    , error = Nothing
    }


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
            div [ class "btn btn-secondary", onClick ClickAddPeriode ] [ text "Add" ]

        Just insert ->
            div []
                [ input [ type_ "datetime-local", value insert.formStart, onInput InsertedAddPeriodeStartTime ] []
                , input
                    [ id "duration"
                    , type_ "text"
                    , placeholder "minutes"
                    , value insert.formDuration
                    , onInput InsertedAddPeriodeDuration
                    ]
                    []
                , button [ class "btn btn-secondary", onClick ClickedAddPeriodeUntilNow, title "Set start minutes before now" ] [ text "↺" ]
                , input
                    [ id "comment"
                    , type_ "text"
                    , placeholder "comment"
                    , value insert.formComment
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

        ( ActionDelete id, PermissionWrite ) ->
            if id == periode.id then
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
            [ button [ type_ "button", class "btn btn-info", onClick (ClickedActionContinue periode.id) ] [ text "→" ]
            , button [ type_ "button", class "btn btn-warning", onClick (ClickedActionEdit periode) ] [ text "✎" ]
            , button [ type_ "button", class "btn btn-danger", onClick (ClickedActionDelete periode.id) ] [ text "✖" ]
            ]
            |> canWrite permission
        ]


viewPeriodeEditLine : ModelEdit -> Html Msg
viewPeriodeEditLine edit =
    let
        monyString =
            case stringToDuration edit.minutes of
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
                , value edit.minutes
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
            , button [ type_ "button", class "btn btn-success", onClick ClickedActionSubmit2 ] [ text "⏎" ]
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
            , button [ type_ "button", class "btn btn-success", onClick (ClickedActionSubmit periode.id) ] [ text "⏎" ]
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
