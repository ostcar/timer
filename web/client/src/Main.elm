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
import Platform.Cmd as Cmd
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
    , permission : Permission
    , currentTime : Time.Posix
    , viewBody : ViewBody
    , errMsg : Maybe String
    , formComment : String
    , formInsert : Maybe Insert
    , formPassword : String
    , formYearMonth : YearMonth.YearMonthSelect
    }


insertForm : Model -> Insert
insertForm model =
    model.formInsert |> Maybe.withDefault (emptyInsert model.currentTime)


type alias Insert =
    { start : Time.Posix
    , formDuration : String
    , formComment : String
    , picker : SingleDatePicker.DatePicker
    , error : Maybe String
    }


type Msg
    = ReceiveState (Result Http.Error Periode.State)
    | ReceiveEvent (Result Http.Error ()) -- Response for every action
    | BrowserTick Time.Posix
      -- Login
    | InsertLoginPassword String
    | ClickLogin
    | ReceiveAuth (Result Http.Error String)
    | ClickLogout
      -- Navigation
    | SelectYearMonth String
    | ClickBodyNav ViewBody
      -- Start Stop
    | InsertComment String
    | ClickStart
    | ClickStop
      -- Periode Actions
    | ClickContinue Periode.ID
    | ClickDelete Periode.ID
      -- Add Periode
    | ClickAdd
    | ClickDatePicker
    | UpdateDatePicker ( SingleDatePicker.DatePicker, Maybe Time.Posix )
    | InsertAddDuration String
    | InsertAddComment String
    | ClickInsert
    | ClickUntilNow


init : String -> ( Model, Cmd Msg )
init token =
    let
        permission =
            permissionFromJWT token
    in
    ( { periodes = []
      , current = Periode.Stopped
      , permission = permission
      , currentTime = Time.millisToPosix 0
      , viewBody = ViewPeriodes
      , errMsg = Nothing
      , formComment = ""
      , formInsert = Nothing
      , formPassword = ""
      , formYearMonth = YearMonth.All
      }
    , updateStateIfPermission permission
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ReceiveState response ->
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
        ReceiveEvent response ->
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

        BrowserTick newTime ->
            ( { model | currentTime = newTime }
            , Cmd.none
            )

        InsertComment comment ->
            ( { model | formComment = comment }
            , Cmd.none
            )

        ClickStart ->
            ( model
            , sendStartStop "start" ReceiveEvent model.formComment
            )

        ClickStop ->
            ( model
            , sendStartStop "stop" ReceiveEvent model.formComment
            )

        ClickContinue id ->
            ( model
            , List.filter (\p -> p.id == id) model.periodes
                |> List.head
                |> Maybe.andThen
                    (\p ->
                        p.comment
                            |> sendStartStop "start" ReceiveEvent
                            |> Just
                    )
                |> Maybe.withDefault Cmd.none
            )

        ClickDelete id ->
            ( model
            , sendDelete ReceiveEvent id
            )

        ClickAdd ->
            ( { model | formInsert = emptyInsert model.currentTime |> Just }
            , Cmd.none
            )

        ClickDatePicker ->
            let
                insert =
                    insertForm model

                picker =
                    SingleDatePicker.openPicker
                        (SingleDatePicker.defaultSettings timeZone UpdateDatePicker)
                        model.currentTime
                        (Just insert.start)
                        insert.picker
            in
            ( { model | formInsert = Just { insert | picker = picker } }
            , Cmd.none
            )

        UpdateDatePicker ( updatedPicker, maybePickedTime ) ->
            let
                insert =
                    insertForm model

                pickedTime =
                    Maybe.withDefault insert.start maybePickedTime
            in
            ( { model | formInsert = Just { insert | picker = updatedPicker, start = pickedTime } }
            , Cmd.none
            )

        InsertAddDuration durationStr ->
            let
                insert =
                    insertForm model
            in
            ( { model | formInsert = Just { insert | formDuration = durationStr } }
            , Cmd.none
            )

        InsertAddComment comment ->
            let
                insert =
                    insertForm model
            in
            ( { model | formInsert = Just { insert | formComment = comment } }
            , Cmd.none
            )

        ClickUntilNow ->
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
                            { insert | start = time, error = Nothing }

                        Err errMSG ->
                            { insert | error = Just errMSG }
            in
            ( { model | formInsert = Just newFormInsert }
            , Cmd.none
            )

        ClickInsert ->
            let
                insert =
                    insertForm model

                insertCMD =
                    resultFromEmptyString "No duration provided" insert.formDuration
                        |> Result.andThen
                            (stringToDuration
                                >> Result.map (\duration -> sendInsert ReceiveEvent insert.start duration insert.formComment)
                            )
            in
            case insertCMD of
                Ok cmd ->
                    ( { model | formInsert = Nothing }
                    , cmd
                    )

                Err errMSG ->
                    ( { model | formInsert = Just { insert | error = Just errMSG } }
                    , Cmd.none
                    )

        InsertLoginPassword password ->
            ( { model | formPassword = password }
            , Cmd.none
            )

        ClickLogin ->
            ( { model | formPassword = "" }
            , sendPassword ReceiveAuth model.formPassword
            )

        ReceiveAuth response ->
            case response of
                Ok permissionLevel ->
                    ( { model | permission = permissionFromString permissionLevel }
                    , Periode.fetch ReceiveState
                    )

                Err e ->
                    ( { model
                        | periodes = []
                        , current = Periode.Stopped
                        , errMsg = Just (buildErrorMessage e)
                      }
                    , Cmd.none
                    )

        ClickLogout ->
            ( { model | permission = PermissionNone }
            , Http.get
                { url = "/api/auth/logout"
                , expect = Http.expectWhatever ReceiveEvent
                }
            )

        SelectYearMonth value ->
            ( { model | formYearMonth = YearMonth.fromAttr value }
            , Cmd.none
            )

        ClickBodyNav value ->
            ( { model | viewBody = value }
            , Cmd.none
            )


stringToDuration : String -> Result String Duration.Duration
stringToDuration s =
    s
        |> String.toFloat
        |> Result.fromMaybe "Duration has to be a number"
        |> Result.map Duration.minutes


updateStateIfPermission : Permission -> Cmd Msg
updateStateIfPermission perm =
    case perm of
        PermissionNone ->
            Cmd.none

        _ ->
            Periode.fetch ReceiveState


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


emptyInsert : Time.Posix -> Insert
emptyInsert currentTime =
    { start = currentTime
    , formDuration = ""
    , formComment = ""
    , picker = SingleDatePicker.init
    , error = Nothing
    }


sendInsert : (Result Http.Error () -> Msg) -> Time.Posix -> Duration.Duration -> String -> Cmd Msg
sendInsert result start duration comment =
    Http.post
        { url = "/api/periode"
        , body = Http.jsonBody (insertEncoder start duration comment)
        , expect = Http.expectWhatever result
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
                    viewLogin model.formPassword

                _ ->
                    div []
                        [ viewCurrent model.current model.formComment model.currentTime |> canWrite model.permission
                        , viewInsert model.formInsert |> canWrite model.permission
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
            , onInput InsertLoginPassword
            ]
            []
        , button [ class "btn btn-primary", onClick ClickLogin ] [ text "Anmelden" ]
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
                    ( ClickStart
                    , "Start"
                    )

                Stop ->
                    ( ClickStop
                    , "Stop"
                    )
    in
    div []
        [ button [ class "btn btn-primary", onClick event ] [ text buttonText ]
        , input
            [ id "comment"
            , type_ "text"
            , value comment
            , onInput InsertComment
            ]
            []
        ]


viewInsert : Maybe Insert -> Html Msg
viewInsert maybeInsert =
    case maybeInsert of
        Nothing ->
            div [ class "btn btn-secondary", onClick ClickAdd ] [ text "Add" ]

        Just insert ->
            div []
                [ span [ onClick ClickDatePicker ] [ text <| posixToString insert.start ]
                , SingleDatePicker.view (SingleDatePicker.defaultSettings timeZone UpdateDatePicker) insert.picker
                , input
                    [ id "duration"
                    , type_ "text"
                    , placeholder "minutes"
                    , value insert.formDuration
                    , onInput InsertAddDuration
                    ]
                    []
                , button [ class "btn btn-secondary", onClick ClickUntilNow, title "Set start minutes before now" ] [ text "↺" ]
                , input
                    [ id "comment"
                    , type_ "text"
                    , placeholder "comment"
                    , value insert.formComment
                    , onInput InsertAddComment
                    ]
                    []
                , button [ class "btn btn-primary", onClick ClickInsert ] [ text "Insert" ]
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
                viewPeriodes timeZone model.formYearMonth model.permission model.periodes
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
    li [ class "nav-item" ] [ a [ class linkClass, href "#", onClick (ClickBodyNav myViewBody) ] [ text viewText ] ]


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
        [ sorted
            |> List.map .start
            |> YearMonth.viewYearMonthSelect zone selected SelectYearMonth
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


viewPeriodeLine : Permission -> Periode.Periode -> Html Msg
viewPeriodeLine permission periode =
    tr []
        [ td [] [ text <| posixToString periode.start ]
        , td [] [ text <| durationToTimeString periode.duration ]
        , td [] [ text <| durationToMonyString periode.duration ]
        , td [] [ text periode.comment ]
        , td [ class "buttons" ]
            [ button [ type_ "button", class "btn btn-danger", onClick (ClickContinue periode.id) ] [ text "→" ]
            , button [ type_ "button", class "btn btn-danger", onClick (ClickDelete periode.id) ] [ text "✖" ]
            ]
            |> canWrite permission
        ]


viewFooter : Html Msg
viewFooter =
    footer [ class "fixed-bottom container" ]
        [ a [ href "https://github.com/ostcar/timer" ] [ text "github" ]
        , text " · "
        , a [ href "#", class "link-primary", onClick ClickLogout ] [ text "logout" ]
        ]


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ SingleDatePicker.subscriptions
            (SingleDatePicker.defaultSettings timeZone UpdateDatePicker)
            UpdateDatePicker
            (insertForm model).picker
        , Time.every 1000 BrowserTick
        ]
