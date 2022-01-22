module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Http
import Periode
import Time exposing (utc)
import Time.Format
import Time.Format.Config.Config_de_de


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = \_ -> Sub.none
        }


type alias Model =
    { periodes : List Periode.Periode
    , current : Periode.Current
    , fetchErrMsg : Maybe String
    }


type Msg
    = ReceiveState (Result Http.Error Periode.State)


init : flags -> ( Model, Cmd Msg )
init _ =
    ( { periodes = []
      , current = Periode.Stopped
      , fetchErrMsg = Nothing
      }
    , Periode.fetch ReceiveState
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ReceiveState response ->
            case response of
                Ok a ->
                    ( { model | periodes = a.periodes, current = a.current, fetchErrMsg = Nothing }
                    , Cmd.none
                    )

                Err e ->
                    ( { model | periodes = [], current = Periode.Stopped, fetchErrMsg = Just (buildErrorMessage e) }
                    , Cmd.none
                    )


view : Model -> Html Msg
view model =
    div []
        [ viewCurrent model.current
        , viewPeriodes model.periodes model.fetchErrMsg
        ]


viewCurrent : Periode.Current -> Html Msg
viewCurrent current =
    case current of
        Periode.Stopped ->
            div [ class "btn btn-primary" ] [ text "Start" ]

        Periode.Started ( start, maybeComment ) ->
            let
                comment =
                    Maybe.withDefault "" maybeComment
            in
            div []
                [ div [ class "btn btn-primary" ] [ text "Stop" ]
                , div [] [ text ("running since " ++ posixToString start ++ ": " ++ comment) ]
                ]


viewPeriodes : List Periode.Periode -> Maybe String -> Html Msg
viewPeriodes periodes error =
    case error of
        Just err ->
            div [] [ text err ]

        Nothing ->
            table [ Html.Attributes.class "table" ]
                [ viewPeriodeHeader
                , tbody [] (List.map viewPeriodeLine periodes)
                ]


viewPeriodeHeader : Html Msg
viewPeriodeHeader =
    thead []
        [ tr []
            [ th [ scope "col", class "time" ] [ text "Start" ]
            , th [ scope "col", class "time" ] [ text "Stop" ]
            , th [ scope "col" ] [ text "Comment" ]
            ]
        ]


viewPeriodeLine : Periode.Periode -> Html Msg
viewPeriodeLine periode =
    tr []
        [ td [] [ text (posixToString periode.start) ]
        , td [] [ text (posixToString periode.stop) ]
        , td [] [ text (Maybe.withDefault "" periode.comment) ]
        ]


posixToString : Time.Posix -> String
posixToString time =
    Time.Format.format Time.Format.Config.Config_de_de.config "%Y-%m-%d %H:%M" utc time


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
