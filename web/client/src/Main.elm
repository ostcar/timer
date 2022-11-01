module Main exposing (main)

import Browser
import Duration
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http
import Json.Decode as Decode
import Json.Encode as Encode
import Jwt
import Mony
import Periode
import SingleDatePicker
import String
import Time
import Time.Format
import Time.Format.Config.Config_de_de
import TimeZone
import YearMonth exposing (YearMonthSelect(..))


timeZone : Time.Zone
timeZone =
    TimeZone.europe__berlin ()


main : Program String Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type alias Model =
    { periodes : List Periode.Periode
    , current : Periode.Current
    , fetchErrMsg : Maybe String
    , comment : String
    , insert : Maybe Insert
    , currentTime : Time.Posix
    , permission : Permission
    , inputPassword : String
    , selectedYearMonth : YearMonth.YearMonthSelect
    , viewBody : ViewBody
    }


type alias Insert =
    { start : Maybe Time.Posix
    , duration : String
    , comment : String
    , picker : SingleDatePicker.DatePicker
    , error : Maybe String
    }


type Permission
    = PermissionWrite
    | PermissionRead
    | PermissionNone


type Msg
    = ReceiveState (Result Http.Error Periode.State)
    | Tick Time.Posix
    | SaveComment String
    | SendStart
    | SendStop
    | SendContinue Periode.ID
    | SendDelete Periode.ID
    | ReceiveEvent (Result Http.Error ())
    | OpenInsert
    | CloseInsert
    | OpenPicker
    | UpdatePicker ( SingleDatePicker.DatePicker, Maybe Time.Posix )
    | SaveInsertDuration String
    | SaveInsertComment String
    | SendInsert
    | SavePassword String
    | SendPassword
    | ReceiveAuth (Result Http.Error String)
    | Logout
    | SelectYearMonth String
    | SetBody ViewBody


init : String -> ( Model, Cmd Msg )
init token =
    let
        permission =
            permissionFromJWT token

        cmd =
            case permission of
                PermissionRead ->
                    Periode.fetch ReceiveState

                PermissionWrite ->
                    Periode.fetch ReceiveState

                PermissionNone ->
                    Cmd.none
    in
    ( { periodes = []
      , current = Periode.Stopped
      , fetchErrMsg = Nothing
      , comment = ""
      , insert = Nothing
      , currentTime = Time.millisToPosix 0
      , permission = permission
      , inputPassword = ""
      , selectedYearMonth = YearMonth.All
      , viewBody = ViewPeriodes
      }
    , cmd
    )


permissionFromString : String -> Permission
permissionFromString permRaw =
    let
        perm =
            String.trim permRaw
    in
    if perm == "write" then
        PermissionWrite

    else if perm == "read" then
        PermissionRead

    else
        PermissionNone


permissionFromJWT : String -> Permission
permissionFromJWT token =
    let
        decoder =
            Decode.field "level" Decode.string
    in
    case Jwt.decodeToken decoder token of
        Ok pass ->
            permissionFromString pass

        Err _ ->
            PermissionNone


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ReceiveState response ->
            case response of
                Ok a ->
                    let
                        comment =
                            case a.current of
                                Periode.Stopped ->
                                    ""

                                Periode.Started _ text ->
                                    Maybe.withDefault "" text
                    in
                    ( { model | periodes = a.periodes, current = a.current, comment = comment, fetchErrMsg = Nothing }
                    , Cmd.none
                    )

                Err e ->
                    ( { model | periodes = [], current = Periode.Stopped, fetchErrMsg = Just (buildErrorMessage e) }
                    , Cmd.none
                    )

        Tick newTime ->
            ( { model | currentTime = newTime }, Cmd.none )

        SaveComment comment ->
            ( { model | comment = comment }
            , Cmd.none
            )

        SendStart ->
            ( model
            , sendStartStop "start" ReceiveEvent model.comment
            )

        SendStop ->
            ( model
            , sendStartStop "stop" ReceiveEvent model.comment
            )

        SendContinue id ->
            ( model
            , List.filter (\p -> p.id == id) model.periodes
                |> List.head
                |> Maybe.andThen (\p -> p.comment |> Just)
                |> Maybe.andThen (\c -> Maybe.withDefault "" c |> Just)
                |> Maybe.andThen (\c -> sendStartStop "start" ReceiveEvent c |> Just)
                |> Maybe.withDefault Cmd.none
            )

        SendDelete id ->
            ( model
            , sendDelete ReceiveEvent id
            )

        ReceiveEvent response ->
            case response of
                Ok _ ->
                    ( model
                    , case model.permission of
                        PermissionNone ->
                            Cmd.none

                        _ ->
                            Periode.fetch ReceiveState
                    )

                Err e ->
                    ( { model | periodes = [], current = Periode.Stopped, fetchErrMsg = Just (buildErrorMessage e), permission = PermissionNone }
                    , Cmd.none
                    )

        OpenInsert ->
            ( { model | insert = Just emptyInsert }
            , Cmd.none
            )

        CloseInsert ->
            ( { model | insert = Nothing }
            , Cmd.none
            )

        OpenPicker ->
            let
                insert =
                    case model.insert of
                        Nothing ->
                            emptyInsert

                        Just i ->
                            i
            in
            ( { model | insert = Just { insert | picker = SingleDatePicker.openPicker (SingleDatePicker.defaultSettings timeZone UpdatePicker) model.currentTime insert.start insert.picker } }
            , Cmd.none
            )

        UpdatePicker ( newPicker, maybeRuntime ) ->
            let
                insert =
                    case model.insert of
                        Nothing ->
                            emptyInsert

                        Just i ->
                            i

                runtime =
                    Maybe.map (\rt -> Just rt) maybeRuntime |> Maybe.withDefault insert.start
            in
            ( { model | insert = Just { insert | picker = newPicker, start = runtime } }
            , Cmd.none
            )

        SaveInsertDuration durationStr ->
            let
                insert =
                    case model.insert of
                        Nothing ->
                            emptyInsert

                        Just i ->
                            i
            in
            ( { model | insert = Just { insert | duration = durationStr } }
            , Cmd.none
            )

        SaveInsertComment comment ->
            let
                insert =
                    case model.insert of
                        Nothing ->
                            emptyInsert

                        Just i ->
                            i
            in
            ( { model | insert = Just { insert | comment = comment } }
            , Cmd.none
            )

        SendInsert ->
            let
                insert =
                    case model.insert of
                        Nothing ->
                            emptyInsert

                        Just i ->
                            i

                insertCMD =
                    case insert.start of
                        Nothing ->
                            Result.Err "No start time selected"

                        Just start ->
                            if insert.duration == "" then
                                Result.Err "No duration providedd"

                            else
                                insert.duration
                                    |> String.toFloat
                                    |> Result.fromMaybe "no number"
                                    |> Result.andThen (\n -> Result.Ok (Duration.minutes n))
                                    |> Result.andThen (\duration -> sendInsert ReceiveEvent start duration (Just insert.comment) |> Result.Ok)
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

        SavePassword pass ->
            ( { model | inputPassword = pass }
            , Cmd.none
            )

        SendPassword ->
            ( { model | inputPassword = "" }
            , sendPassword ReceiveAuth model.inputPassword
            )

        ReceiveAuth response ->
            case response of
                Ok level ->
                    ( { model | permission = permissionFromString level }
                    , Periode.fetch ReceiveState
                    )

                Err e ->
                    ( { model | periodes = [], current = Periode.Stopped, fetchErrMsg = Just (buildErrorMessage e) }
                    , Cmd.none
                    )

        Logout ->
            ( { model | permission = PermissionNone }
            , Http.get
                { url = "/api/auth/logout"
                , expect = Http.expectWhatever ReceiveEvent
                }
            )

        SelectYearMonth value ->
            ( { model | selectedYearMonth = YearMonth.fromAttr value }
            , Cmd.none
            )

        SetBody value ->
            ( { model | viewBody = value }
            , Cmd.none
            )


emptyInsert : Insert
emptyInsert =
    { start = Nothing
    , duration = ""
    , comment = ""
    , picker = SingleDatePicker.init
    , error = Nothing
    }


sendStartStop : String -> (Result Http.Error () -> Msg) -> String -> Cmd Msg
sendStartStop startStop result comment =
    Http.post
        { url = "/api/" ++ startStop
        , body = Http.jsonBody (commentEncoder comment)
        , expect = Http.expectWhatever result
        }


sendInsert : (Result Http.Error () -> Msg) -> Time.Posix -> Duration.Duration -> Maybe String -> Cmd Msg
sendInsert result start duration comment =
    Http.post
        { url = "/api/periode"
        , body = Http.jsonBody (insertEncoder start duration comment)
        , expect = Http.expectWhatever result
        }


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


commentEncoder : String -> Encode.Value
commentEncoder comment =
    Encode.object
        [ ( "comment", Encode.string comment ) ]


insertEncoder : Time.Posix -> Duration.Duration -> Maybe String -> Encode.Value
insertEncoder start duration maybeComment =
    let
        comment =
            case maybeComment of
                Nothing ->
                    []

                Just s ->
                    [ ( "comment", Encode.string s ) ]
    in
    Encode.object
        ([ ( "start", (Time.posixToMillis start // 1000) |> Encode.int )
         , ( "duration", (Duration.inSeconds duration |> round) |> Encode.int )
         ]
            ++ comment
        )


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


intToString2 : Int -> String
intToString2 n =
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
    euroString ++ "," ++ intToString2 cent ++ " €"


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


view : Model -> Html Msg
view model =
    case model.fetchErrMsg of
        Just err ->
            div [] [ text err ]

        Nothing ->
            case model.permission of
                PermissionNone ->
                    viewLogin model.inputPassword

                _ ->
                    div []
                        [ viewCurrent model.current model.comment model.currentTime |> canWrite model.permission
                        , viewInsert model.insert |> canWrite model.permission
                        , viewBody model
                        , viewFooter
                        ]


canWrite : Permission -> Html Msg -> Html Msg
canWrite permission html =
    case permission of
        PermissionWrite ->
            html

        _ ->
            viewEmpty


viewEmpty : Html msg
viewEmpty =
    text ""


viewLogin : String -> Html Msg
viewLogin pass =
    div []
        [ h5 [] [ text "Login" ]
        , input
            [ type_ "password"
            , value pass
            , onInput SavePassword
            ]
            []
        , button [ class "btn btn-primary", onClick SendPassword ] [ text "Anmelden" ]
        ]


viewCurrent : Periode.Current -> String -> Time.Posix -> Html Msg
viewCurrent current comment currentTime =
    case current of
        Periode.Stopped ->
            viewStartStopButton Start comment

        Periode.Started start maybeComment ->
            let
                currentComment =
                    Maybe.withDefault "" maybeComment

                mony =
                    Duration.from start currentTime |> durationToMonyString
            in
            div []
                [ viewStartStopButton Stop comment
                , div [] [ text ("running since " ++ posixToString start ++ ": " ++ currentComment ++ ": " ++ mony) ]
                ]


type StartStop
    = Start
    | Stop


viewStartStopButton : StartStop -> String -> Html Msg
viewStartStopButton startStop comment =
    let
        ( event, buttonText ) =
            case startStop of
                Start ->
                    ( SendStart
                    , "Start"
                    )

                Stop ->
                    ( SendStop
                    , "Stop"
                    )
    in
    div []
        [ button [ class "btn btn-primary", onClick event ] [ text buttonText ]
        , input
            [ id "comment"
            , type_ "text"
            , value comment
            , onInput SaveComment
            ]
            []
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
                viewPeriodes timeZone model.selectedYearMonth model.permission model.periodes
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
    li [ class "nav-item" ] [ a [ class linkClass, href "#", onClick (SetBody myViewBody) ] [ text viewText ] ]


viewMonthly : Time.Zone -> List Periode.Periode -> Html Msg
viewMonthly zone periodes =
    div []
        [ table [ class "table" ]
            (tr []
                [ th [] [ text "Monat" ]
                , th [ class "time" ] [ text "Zeiten" ]
                , th [ class "mony" ] [ text "Euro" ]
                ]
                :: (Periode.sort periodes
                        |> Periode.byYearMonth zone
                        |> List.map viewMonthlyLine
                   )
            )
        ]


combineDurations : List Duration.Duration -> Duration.Duration
combineDurations durations =
    durations
        |> List.map Duration.inMilliseconds
        |> List.foldl (+) 0
        |> Duration.milliseconds


viewMonthlyLine : ( String, List Periode.Periode ) -> Html Msg
viewMonthlyLine ( yearMonthText, periodes ) =
    let
        duration =
            List.map .duration periodes |> combineDurations
    in
    tr []
        [ td [] [ text yearMonthText ]
        , td [ class "time" ] [ durationToTimeString duration |> text ]
        , td [ class "mony" ] [ durationToMonyString duration |> text ]
        ]


viewPeriodes : Time.Zone -> YearMonthSelect -> Permission -> List Periode.Periode -> Html Msg
viewPeriodes zone selected permission periodes =
    let
        sorted =
            Periode.sort periodes

        filtered =
            Periode.filterYearMonth timeZone selected sorted

        tableBody =
            viewPeriodeSummary permission filtered :: List.map (viewPeriodeLine permission) filtered
    in
    div []
        [ sorted |> List.map (\p -> p.start) |> YearMonth.viewYearMonthSelect zone selected SelectYearMonth
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


viewPeriodeLine : Permission -> Periode.Periode -> Html Msg
viewPeriodeLine permission periode =
    tr []
        [ td [] [ text (posixToString periode.start) ]
        , td [] [ div [] [ text (durationToTimeString periode.duration) ] ]
        , td [] [ text (durationToMonyString periode.duration) ]
        , td [] [ text (Maybe.withDefault "" periode.comment) ]
        , td [ class "buttons" ]
            [ button [ type_ "button", class "btn btn-danger", onClick (SendDelete periode.id) ] [ text "✖" ]
            , button [ type_ "button", class "btn btn-danger", onClick (SendContinue periode.id) ] [ text "→" ]
            ]
            |> canWrite permission
        ]


durationToTimeString : Duration.Duration -> String
durationToTimeString duration =
    let
        ( hours, minutes ) =
            Mony.durationInHourMinutes duration
    in
    String.fromInt hours ++ ":" ++ intToString2 minutes


viewPeriodeSummary : Permission -> List Periode.Periode -> Html Msg
viewPeriodeSummary permission periodes =
    let
        duration =
            List.map .duration periodes |> combineDurations
    in
    tr []
        [ td [] [ text "Gesamt" ]
        , td [] [ text (durationToTimeString duration) ]
        , td [] [ text (durationToMonyString duration) ]
        , td [] [ text "" ]
        , td [] [ text "" ] |> canWrite permission
        ]


viewInsert : Maybe Insert -> Html Msg
viewInsert maybeInsert =
    case maybeInsert of
        Nothing ->
            div [ class "btn btn-secondary", onClick OpenInsert ] [ text "Add" ]

        Just insert ->
            let
                startTime =
                    case insert.start of
                        Nothing ->
                            "No time selected"

                        Just s ->
                            posixToString s
            in
            div []
                [ span [ onClick OpenPicker ] [ text startTime ]
                , SingleDatePicker.view (SingleDatePicker.defaultSettings timeZone UpdatePicker) insert.picker
                , input
                    [ id "duration"
                    , type_ "text"
                    , placeholder "minutes"
                    , value insert.duration
                    , onInput SaveInsertDuration
                    ]
                    []
                , input
                    [ id "comment"
                    , type_ "text"
                    , placeholder "comment"
                    , value insert.comment
                    , onInput SaveInsertComment
                    ]
                    []
                , button [ class "btn btn-primary", onClick SendInsert ] [ text "Insert" ]
                , div [] [ Maybe.withDefault "" insert.error |> text ]
                ]


viewFooter : Html Msg
viewFooter =
    footer [ class "fixed-bottom container" ]
        [ a [ href "https://github.com/ostcar/timer" ] [ text "github" ]
        , text " · "
        , a [ href "#", class "link-primary", onClick Logout ] [ text "logout" ]
        ]


posixToString : Time.Posix -> String
posixToString time =
    Time.Format.format Time.Format.Config.Config_de_de.config "%Y-%m-%d %H:%M" timeZone time


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


subscriptions : Model -> Sub Msg
subscriptions model =
    let
        insert =
            case model.insert of
                Nothing ->
                    emptyInsert

                Just i ->
                    i
    in
    Sub.batch
        [ SingleDatePicker.subscriptions (SingleDatePicker.defaultSettings timeZone UpdatePicker) UpdatePicker insert.picker
        , Time.every 100 Tick
        ]
