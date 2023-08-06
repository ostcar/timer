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
    , error : Maybe String
    , formComment : String
    , formLoginPassword : String
    , formYearMonth : YearMonth.YearMonthSelect
    }


type ModelPeriodeAction
    = ActionNone
    | ActionEdit ModelEdit
    | ActionDelete Periode.Periode


type alias ModelInsert =
    { start : String -- This is the local time formatted for the datetime-local element. It does not have a timezone.
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
    | ClickedAddPeriodeUntilNow
    | ClickedAddPeriodeSubmit
    | ClickedAddPeriodeAbort
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
    , fetchDataCommand permission
    )


emptyModel : Permission -> Time.Posix -> Model
emptyModel permission time =
    { periodes = []
    , periodeAction = ActionNone
    , current = Periode.Stopped
    , permission = permission
    , currentTime = time
    , viewBody = ViewPeriodes
    , error = Nothing
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
                        , error = Nothing
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
                    , fetchDataCommand model.permission
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
            , authRequest ReceivedAuthResponse model.formLoginPassword
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
            , startStopRequest "start" ReceivedActionResponse model.formComment
            )

        ClickedStop ->
            ( model
            , startStopRequest "stop" ReceivedActionResponse model.formComment
            )

        InsertedCurrentComment comment ->
            ( { model | formComment = comment }
            , Cmd.none
            )

        -- Add Periode
        ClickedAddPeriode ->
            ( { model | insert = Just <| emptyModelInsert model.currentTime }
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
                            (\time -> { insert | start = formatTimeForInputDateTimeLocal time, error = Nothing })
                        |> handleError
                            (\errMSG -> { insert | error = Just errMSG })
            in
            ( { model | insert = Just newInsert }
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
                    localStringToPosix timeZone insert.start
                        |> Result.mapError (\_ -> "Start is wrong")

                insertCmd =
                    Result.map2
                        (\duration start -> addPeriodeRequest ReceivedActionResponse start duration insert.comment)
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

        ClickedAddPeriodeAbort ->
            ( { model | insert = Nothing }
            , Cmd.none
            )

        --Periode Actions
        ClickedActionContinue periode ->
            ( model
            , startStopRequest "start" ReceivedActionResponse periode.comment
            )

        ClickedActionEdit periode ->
            ( { model | periodeAction = ActionEdit <| modelEdit periode }
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
                            localStringToPosix timeZone ep.start
                                |> Result.mapError (\_ -> "Start is wrong")

                        editCmd =
                            Result.map2
                                (\duration start -> editPeriodeRequest ReceivedActionResponse ep.id start duration ep.comment)
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
                    , deletePeriodeRequest ReceivedActionResponse periode.id
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
        | error = Just err
    }


emptyModelInsert : Time.Posix -> ModelInsert
emptyModelInsert currentTime =
    { duration = ""
    , comment = ""
    , start = formatTimeForInputDateTimeLocal currentTime
    , error = Nothing
    }


modelInsert : Model -> ModelInsert
modelInsert model =
    model.insert
        |> Maybe.withDefault (emptyModelInsert model.currentTime)


modelEdit : Periode.Periode -> ModelEdit
modelEdit periode =
    { id = periode.id
    , start = formatTimeForInputDateTimeLocal periode.start
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


fetchDataCommand : Permission -> Cmd Msg
fetchDataCommand perm =
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


authRequest : (Result Http.Error String -> Msg) -> String -> Cmd Msg
authRequest result pass =
    Http.post
        { url = "/api/auth"
        , body =
            Http.jsonBody (Encode.object [ ( "password", Encode.string pass ) ])
        , expect = Http.expectString result
        }



-- Action requests


startStopRequest : String -> (Result Http.Error () -> Msg) -> String -> Cmd Msg
startStopRequest startStop result comment =
    Http.post
        { url = "/api/" ++ startStop
        , body =
            Http.jsonBody
                (Encode.object
                    [ ( "comment", Encode.string comment ) ]
                )
        , expect = Http.expectWhatever result
        }


addPeriodeRequest : (Result Http.Error () -> Msg) -> Time.Posix -> Duration.Duration -> String -> Cmd Msg
addPeriodeRequest result start duration comment =
    Http.post
        { url = "/api/periode"
        , body = Http.jsonBody (periodeEncoder start duration comment)
        , expect = Http.expectWhatever result
        }


editPeriodeRequest : (Result Http.Error () -> Msg) -> Periode.ID -> Time.Posix -> Duration.Duration -> String -> Cmd Msg
editPeriodeRequest result id start duration comment =
    Http.request
        { method = "PUT"
        , headers = []
        , url = "/api/periode/" ++ Periode.idToString id
        , body = Http.jsonBody (periodeEncoder start duration comment)
        , expect = Http.expectWhatever result
        , timeout = Nothing
        , tracker = Nothing
        }


periodeEncoder : Time.Posix -> Duration.Duration -> String -> Encode.Value
periodeEncoder start duration comment =
    Encode.object
        [ ( "start", (Time.posixToMillis start // 1000) |> Encode.int )
        , ( "duration", (Duration.inSeconds duration |> round) |> Encode.int )
        , ( "comment", Encode.string comment )
        ]


deletePeriodeRequest : (Result Http.Error () -> Msg) -> Periode.ID -> Cmd Msg
deletePeriodeRequest result id =
    Http.request
        { method = "DELETE"
        , headers = []
        , url = "/api/periode/" ++ Periode.idToString id
        , body = Http.emptyBody
        , expect = Http.expectWhatever result
        , timeout = Nothing
        , tracker = Nothing
        }



-- view Helpers


formatTimeForInputDateTimeLocal : Time.Posix -> String
formatTimeForInputDateTimeLocal time =
    -- YYYY
    toPaddedString 4 (Time.toYear timeZone time)
        ++ "-"
        -- MM
        ++ toPaddedString 2 (YearMonth.monthToInt (Time.toMonth timeZone time))
        ++ "-"
        -- DD
        ++ toPaddedString 2 (Time.toDay timeZone time)
        ++ "T"
        -- HH
        ++ toPaddedString 2 (Time.toHour timeZone time)
        ++ ":"
        -- mm
        ++ toPaddedString 2 (Time.toMinute timeZone time)


formatTimeForUser : Time.Posix -> String
formatTimeForUser time =
    -- YYYY
    toPaddedString 4 (Time.toYear timeZone time)
        ++ "-"
        -- MM
        ++ toPaddedString 2 (YearMonth.monthToInt (Time.toMonth timeZone time))
        ++ "-"
        -- DD
        ++ toPaddedString 2 (Time.toDay timeZone time)
        ++ " "
        -- HH
        ++ toPaddedString 2 (Time.toHour timeZone time)
        ++ ":"
        -- mm
        ++ toPaddedString 2 (Time.toMinute timeZone time)


millisFromPosix : Time.Zone -> Time.Posix -> Int
millisFromPosix zone posix =
    Time.toHour zone posix * 3600000 + Time.toMinute zone posix * 60000 + Time.toSecond zone posix * 1000 + Time.toMillis zone posix


localStringToPosix : Time.Zone -> String -> Result String Time.Posix
localStringToPosix tz str =
    case Iso8601.toTime str of
        Ok wrongPosix ->
            let
                utcMilli =
                    millisFromPosix Time.utc wrongPosix

                localMilli =
                    millisFromPosix tz wrongPosix

                diff =
                    utcMilli - localMilli

                correctPosix =
                    Time.posixToMillis wrongPosix |> (+) diff |> Time.millisToPosix
            in
            Ok correctPosix

        Err _ ->
            Err "Invalid time string"


toPaddedString : Int -> Int -> String
toPaddedString digits value =
    String.padLeft digits '0' (String.fromInt value)


{-| intToFormattedString converts an int to a string that has a . at every third
place.
-}
toFormattedString : Int -> String
toFormattedString int =
    int
        |> String.fromInt
        |> String.foldr
            (\c acc ->
                let
                    last =
                        List.head acc |> Maybe.withDefault ""
                in
                if String.length last == 3 then
                    String.fromChar c :: acc

                else
                    String.cons c last :: List.drop 1 acc
            )
            []
        |> String.join "."


centToString : Int -> String
centToString euroCent =
    let
        euroString =
            toFormattedString (euroCent // 100)

        cent =
            remainderBy 100 euroCent
    in
    euroString ++ "," ++ toPaddedString 2 cent ++ " €"


durationToMonyString : Duration.Duration -> String
durationToMonyString duration =
    Mony.durationToCent duration
        |> centToString


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
    String.fromInt hours ++ ":" ++ toPaddedString 2 minutes


canWrite : Permission -> Html Msg -> Html Msg
canWrite permission html =
    case permission of
        PermissionWrite ->
            html

        _ ->
            text ""


htmlList : List (Html msg) -> Html msg
htmlList list =
    div []
        list



-- View


view : Model -> Html Msg
view model =
    case model.error of
        Just err ->
            div [] [ text err ]

        Nothing ->
            case model.permission of
                PermissionNone ->
                    viewLogin model.formLoginPassword

                _ ->
                    viewPage model


viewLogin : String -> Html Msg
viewLogin pass =
    htmlList
        [ h5 [] [ text "Login" ]
        , input
            [ type_ "password"
            , value pass
            , onInput InsertedLoginPassword
            ]
            []
        , button [ class "btn btn-primary", onClick ClickedLogin ] [ text "Anmelden" ]
        ]


viewPage : Model -> Html Msg
viewPage model =
    htmlList
        [ canWrite model.permission <| viewCurrent model.currentTime model.current model.formComment
        , canWrite model.permission <| viewInsert model.insert
        , viewBody model
        , viewFooter
        ]


type StartStop
    = Start
    | Stop


viewCurrent : Time.Posix -> Periode.Current -> String -> Html Msg
viewCurrent currentTime current insertedComment =
    case current of
        Periode.Stopped ->
            viewStartStopForm Start insertedComment

        Periode.Started startTime _ ->
            htmlList
                [ viewStartStopForm Stop insertedComment
                , viewStartStopInfo
                    startTime
                    (Duration.from startTime currentTime |> durationToMonyString)
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
    htmlList
        [ button [ class "btn btn-primary", onClick event ] [ text buttonText ]
        , input
            [ id "comment"
            , type_ "text"
            , value comment
            , onInput InsertedCurrentComment
            ]
            []
        ]


viewStartStopInfo : Time.Posix -> String -> Html Msg
viewStartStopInfo startTime mony =
    text ("Gestartet um " ++ formatTimeForUser startTime ++ " = " ++ mony)


viewInsert : Maybe ModelInsert -> Html Msg
viewInsert maybeInsert =
    case maybeInsert of
        Nothing ->
            div [ class "btn btn-secondary", onClick ClickedAddPeriode ] [ text "Einfügen" ]

        Just insert ->
            htmlList
                [ input [ type_ "datetime-local", value insert.start, onInput InsertedAddPeriodeStartTime ] []
                , input
                    [ type_ "text"
                    , placeholder "minuten"
                    , value insert.duration
                    , onInput InsertedAddPeriodeDuration
                    ]
                    []
                , button [ class "btn btn-secondary", onClick ClickedAddPeriodeUntilNow, title "Setze Start auf jetzt beenden" ] [ text "↺" ]
                , input
                    [ id "comment"
                    , type_ "text"
                    , placeholder "Kommentar"
                    , value insert.comment
                    , onInput InsertedAddPeriodeComment
                    ]
                    []
                , button [ class "btn btn-primary", onClick ClickedAddPeriodeSubmit ] [ text "Insert" ]
                , button [ type_ "button", class "btn btn-danger", onClick ClickedAddPeriodeAbort ] [ text "✖" ]
                , div [] [ text <| Maybe.withDefault "" insert.error ]
                ]


type ViewBody
    = ViewMonthly
    | ViewPeriodes


viewBody : Model -> Html Msg
viewBody model =
    htmlList
        [ viewNavigation model.viewBody
        , case model.viewBody of
            ViewPeriodes ->
                viewPeriodes model.permission model.formYearMonth model.periodeAction model.periodes

            ViewMonthly ->
                viewMonthly model.periodes
        ]


viewNavigation : ViewBody -> Html Msg
viewNavigation body =
    ul [ class "nav nav-tabs" ]
        [ navLink ViewPeriodes body
        , navLink ViewMonthly body
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


viewPeriodes : Permission -> YearMonthSelect -> ModelPeriodeAction -> List Periode.Periode -> Html Msg
viewPeriodes permission selected action periodes =
    let
        sorted =
            Periode.sort periodes

        yearMonthSelect =
            sorted
                |> List.map .start
                |> YearMonth.viewYearMonthSelect timeZone selected SelectedYearMonthFilter
    in
    htmlList
        [ yearMonthSelect
        , table [ class "table" ]
            [ viewPeriodeHeader permission
            , viewPeriodeBody permission selected action sorted
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
            , canWrite permission <| th [ scope "col", class "actions buttons" ] [ text "" ]
            ]
        ]


viewPeriodeBody : Permission -> YearMonthSelect -> ModelPeriodeAction -> List Periode.Periode -> Html Msg
viewPeriodeBody permission selected action periodes =
    let
        filtered =
            Periode.filterYearMonth timeZone selected periodes

        summary =
            viewPeriodeSummary permission filtered

        periodeLines =
            List.map (viewPeriodeLine permission action) filtered
    in
    tbody []
        (summary :: periodeLines)


viewPeriodeSummary : Permission -> List Periode.Periode -> Html Msg
viewPeriodeSummary permission periodes =
    let
        duration =
            periodes
                |> List.map .duration
                |> combineDurations
    in
    tr []
        [ td [] [ text "Gesamt" ]
        , td [] [ text <| durationToTimeString duration ]
        , td [] [ text <| durationToMonyString duration ]
        , td [] [ text "" ]
        , canWrite permission <| td [] [ text "" ]
        ]


viewPeriodeLine : Permission -> ModelPeriodeAction -> Periode.Periode -> Html Msg
viewPeriodeLine permission action periode =
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
    viewPeriodeShowElements
        periode
        (canWrite permission <| viewActionButtons periode)


viewPeriodeDeleteLine : Periode.Periode -> Html Msg
viewPeriodeDeleteLine periode =
    viewPeriodeShowElements
        periode
        (viewConfirmButtons "Löschen?")


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
                [ type_ "text"
                , placeholder "Minuten"
                , value edit.duration
                , onInput InsertedActionEditDuration
                ]
                []
            ]
        , td [] [ text monyString ]
        , td []
            [ input
                [ type_ "text"
                , placeholder "Kommentar"
                , value edit.comment
                , onInput InsertedActionEditComment
                ]
                []
            ]
        , viewConfirmButtons "Bearbeiten?"
        ]


viewPeriodeShowElements : Periode.Periode -> Html Msg -> Html Msg
viewPeriodeShowElements periode buttons =
    tr []
        [ td [] [ text <| formatTimeForUser periode.start ]
        , td [] [ text <| durationToTimeString periode.duration ]
        , td [] [ text <| durationToMonyString periode.duration ]
        , td [] [ text periode.comment ]
        , buttons
        ]


viewActionButtons : Periode.Periode -> Html Msg
viewActionButtons periode =
    td [ class "buttons" ]
        [ button [ type_ "button", class "btn btn-info", onClick (ClickedActionContinue periode) ] [ text "→" ]
        , button [ type_ "button", class "btn btn-warning", onClick (ClickedActionEdit periode) ] [ text "✎" ]
        , button [ type_ "button", class "btn btn-danger", onClick (ClickedActionDelete periode) ] [ text "✖" ]
        ]


viewConfirmButtons : String -> Html Msg
viewConfirmButtons message =
    td [ class "buttons" ]
        [ text message
        , button [ type_ "button", class "btn btn-danger", onClick ClickedActionAbort ] [ text "✖" ]
        , button [ type_ "button", class "btn btn-success", onClick ClickedActionSubmit ] [ text "⏎" ]
        ]


viewMonthly : List Periode.Periode -> Html Msg
viewMonthly periodes =
    let
        lines =
            Periode.sort periodes
                |> Periode.byYearMonth timeZone
                |> List.map viewMonthlyLine
    in
    table [ class "table" ]
        (tr []
            [ th [ class "month" ] [ text "Monat" ]
            , th [ class "time" ] [ text "Zeiten" ]
            , th [ class "mony" ] [ text "Euro" ]
            ]
            :: lines
        )


viewMonthlyLine : ( String, List Periode.Periode ) -> Html Msg
viewMonthlyLine ( yearMonth, periodes ) =
    let
        duration =
            periodes
                |> List.map .duration
                |> combineDurations
    in
    tr []
        [ td [] [ text yearMonth ]
        , td [ class "time" ] [ text <| durationToTimeString duration ]
        , td [ class "mony" ] [ text <| durationToMonyString duration ]
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
