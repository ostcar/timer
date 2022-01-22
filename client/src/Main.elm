module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Http
import Periode


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
    , fetchErrMsg : Maybe String
    }


type Msg
    = ReceivePeriodes (Result Http.Error (List Periode.Periode))


init : flags -> ( Model, Cmd Msg )
init _ =
    ( { periodes = []
        , fetchErrMsg = Nothing
      }
      , Periode.fetch ReceivePeriodes)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of 
        ReceivePeriodes response ->
            case response of 
                Ok a ->
                    ( { model | periodes = a, fetchErrMsg = Nothing}
                    , Cmd.none
                    )
                Err e ->
                    ( {model | periodes = [], fetchErrMsg = Just (buildErrorMessage e)}
                    , Cmd.none)



view : Model -> Html Msg
view model =
    viewPeriodes model.periodes model.fetchErrMsg

viewPeriodes : List Periode.Periode -> Maybe String -> Html Msg
viewPeriodes periodes error =
    case error of
        Just err ->
            div [] [text err]
        Nothing ->
            ul []
                (List.map viewPeriodeLine  periodes)

viewPeriodeLine : Periode.Periode -> Html Msg
viewPeriodeLine periode =
    li []
        [ span [] [text (String.fromInt periode.start)]
        , span [] [text (String.fromInt periode.stop)]
        , span [] [text (Maybe.withDefault "" periode.comment)]
        ]

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
