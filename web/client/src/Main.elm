module Main exposing (main)

import Browser
import DurationDatePicker
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http
import Json.Decode as Decode
import Json.Encode as Encode
import Jwt
import Periode
import Time
import Time.Format
import Time.Format.Config.Config_de_de
import TimeZone


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
    }


type alias Insert =
    { startStop : Maybe ( Time.Posix, Time.Posix )
    , comment : String
    , picker : DurationDatePicker.DatePicker
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
    | SendDelete Periode.ID
    | ReceiveEvent (Result Http.Error ())
    | OpenInsert
    | CloseInsert
    | OpenPicker
    | UpdatePicker ( DurationDatePicker.DatePicker, Maybe ( Time.Posix, Time.Posix ) )
    | SaveInsertComment String
    | SendInsert
    | SavePassword String
    | SendPassword
    | ReceiveAuth (Result Http.Error String)


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

        SendDelete id ->
            ( model
            , sendDelete ReceiveEvent id
            )

        ReceiveEvent response ->
            case response of
                Ok _ ->
                    ( model
                    , Periode.fetch ReceiveState
                    )

                Err e ->
                    ( { model | periodes = [], current = Periode.Stopped, fetchErrMsg = Just (buildErrorMessage e) }
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

                ( start, stop ) =
                    case insert.startStop of
                        Nothing ->
                            ( Nothing, Nothing )

                        Just ( s, t ) ->
                            ( Just s, Just t )
            in
            ( { model | insert = Just { insert | picker = DurationDatePicker.openPicker (DurationDatePicker.defaultSettings timeZone UpdatePicker) model.currentTime start stop insert.picker } }
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
                    Maybe.map (\rt -> Just rt) maybeRuntime |> Maybe.withDefault insert.startStop
            in
            ( { model | insert = Just { insert | picker = newPicker, startStop = runtime } }
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

                cmd =
                    case insert.startStop of
                        Nothing ->
                            Cmd.none

                        Just ( start, stop ) ->
                            sendInsert ReceiveEvent start stop (Just insert.comment)
            in
            ( { model | insert = Nothing }
            , cmd
            )

        SavePassword pass ->
            ( { model | inputPassword = pass }
            , Cmd.none
            )

        SendPassword ->
            ( model
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


emptyInsert : Insert
emptyInsert =
    { startStop = Nothing
    , comment = ""
    , picker = DurationDatePicker.init
    }


sendStartStop : String -> (Result Http.Error () -> Msg) -> String -> Cmd Msg
sendStartStop startStop result comment =
    Http.post
        { url = "/api/" ++ startStop
        , body = Http.jsonBody (commentEncoder comment)
        , expect = Http.expectWhatever result
        }


sendInsert : (Result Http.Error () -> Msg) -> Time.Posix -> Time.Posix -> Maybe String -> Cmd Msg
sendInsert result start stop comment =
    Http.post
        { url = "/api/periode"
        , body = Http.jsonBody (insertEncoder start stop comment)
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


insertEncoder : Time.Posix -> Time.Posix -> Maybe String -> Encode.Value
insertEncoder start stop maybeComment =
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
         , ( "stop", (Time.posixToMillis stop // 1000) |> Encode.int )
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


view : Model -> Html Msg
view model =
    case model.permission of
        PermissionNone ->
            viewLogin model.inputPassword

        _ ->
            div []
                [ viewCurrent model.current model.comment |> canWrite model.permission
                , viewInsert model.insert |> canWrite model.permission
                , viewPeriodes model.permission model.periodes model.fetchErrMsg
                ]

canWrite : Permission -> Html Msg -> Html Msg
canWrite permission html =
    case permission of
        PermissionWrite ->
            html
        _ ->
            viewEmpty

viewEmpty : Html Msg
viewEmpty = text ""

viewLogin : String -> Html Msg
viewLogin pass =
    div []
        [ input
            [ type_ "password"
            , value pass
            , onInput SavePassword
            ]
            []
        , button [ class "btn btn-primary", onClick SendPassword ] [ text "Anmelden" ]
        ]


viewCurrent : Periode.Current -> String -> Html Msg
viewCurrent current comment =
    case current of
        Periode.Stopped ->
            viewStartStopButton Start comment

        Periode.Started start maybeComment ->
            let
                currentComment =
                    Maybe.withDefault "" maybeComment
            in
            div []
                [ viewStartStopButton Stop comment
                , div [] [ text ("running since " ++ posixToString start ++ ": " ++ currentComment) ]
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
                    ( SendStart, "Start" )

                Stop ->
                    ( SendStop, "Stop" )
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


viewPeriodes : Permission -> List Periode.Periode -> Maybe String -> Html Msg
viewPeriodes permission periodes error =
    case error of
        Just err ->
            div [] [ text err ]

        Nothing ->
            table [ Html.Attributes.class "table" ]
                [ viewPeriodeHeader permission
                , tbody [] (List.map (viewPeriodeLine permission) (Periode.sort periodes))
                ]


viewPeriodeHeader : Permission -> Html Msg
viewPeriodeHeader permission =
    thead []
        [ tr []
            [ th [ scope "col", class "time" ] [ text "Start" ]
            , th [ scope "col", class "time" ] [ text "Stop" ]
            , th [ scope "col" ] [ text "Comment" ]
            , th [ scope "col", class "actions" ] [ text "#" ] |> canWrite permission
            ]
        ]


viewPeriodeLine : Permission -> Periode.Periode -> Html Msg
viewPeriodeLine permission periode =
    tr []
        [ td [] [ text (posixToString periode.start) ]
        , td [] [ text (posixToString periode.stop) ]
        , td [] [ text (Maybe.withDefault "" periode.comment) ]
        , td [] [ button [ type_ "button", class "btn btn-danger", onClick (SendDelete periode.id) ] [ text "X" ] ] |> canWrite permission
        ]


viewInsert : Maybe Insert -> Html Msg
viewInsert maybeInsert =
    case maybeInsert of
        Nothing ->
            div [ class "btn btn-secondary", onClick OpenInsert ] [ text "Add" ]

        Just insert ->
            let
                startStopTime =
                    case insert.startStop of
                        Nothing ->
                            "No time selected"

                        Just ( s, t ) ->
                            posixToString s ++ " - " ++ posixToString t
            in
            div []
                [ span [ onClick OpenPicker ] [ text startStopTime ]
                , DurationDatePicker.view (DurationDatePicker.defaultSettings timeZone UpdatePicker) insert.picker
                , input
                    [ id "comment"
                    , type_ "text"
                    , value insert.comment
                    , onInput SaveInsertComment
                    ]
                    []
                , button [ class "btn btn-primary", onClick SendInsert ] [ text "Insert" ]
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
        [ DurationDatePicker.subscriptions (DurationDatePicker.defaultSettings timeZone UpdatePicker) UpdatePicker insert.picker
        , Time.every 1000 Tick
        ]
