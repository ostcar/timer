module Periode exposing (Current(..), ID, Periode, State, byYearMonth, fetch, filterYearMonth, idEncoder, idToString, sort, stateComment)

import Duration
import Http
import Json.Decode as Decode exposing (Decoder, bool, int, string)
import Json.Decode.Pipeline exposing (optional, required)
import Json.Encode as Encode
import Time
import YearMonth exposing (YearMonthSelect(..))


type Current
    = Stopped
    | Started Time.Posix String


type alias Periode =
    { id : ID
    , start : Time.Posix
    , duration : Duration.Duration
    , comment : String
    , billed : Bool
    }


periodeDecoder : Decoder Periode
periodeDecoder =
    Decode.succeed Periode
        |> required "id" idDecoder
        |> required "start" timeDecoder
        |> required "duration" durationDecoder
        |> optional "comment" string ""
        |> required "billed" bool


periodeListDecoder : Decoder (List Periode)
periodeListDecoder =
    Decode.list periodeDecoder


type alias State =
    { current : Current
    , periodes : List Periode
    }


stateDecoder : Decoder State
stateDecoder =
    (Decode.succeed ServerState
        |> required "running" bool
        |> required "start" timeDecoder
        |> optional "comment" string ""
        |> required "periodes" periodeListDecoder
    )
        |> Decode.map serverStateToState


stateComment : State -> String
stateComment state =
    case state.current of
        Stopped ->
            ""

        Started _ text ->
            text


type alias ServerState =
    { running : Bool
    , start : Time.Posix
    , comment : String
    , periodes : List Periode
    }


serverStateToState : ServerState -> State
serverStateToState data =
    let
        current =
            if data.running then
                Started data.start data.comment

            else
                Stopped
    in
    { current = current
    , periodes = data.periodes
    }


type ID
    = ID Int


idToString : ID -> String
idToString (ID id) =
    String.fromInt id


idDecoder : Decoder ID
idDecoder =
    Decode.map ID int


idEncoder : ID -> Encode.Value
idEncoder (ID id) =
    Encode.int id


timeDecoder : Decoder Time.Posix
timeDecoder =
    Decode.map (\n -> n * 1000 |> Time.millisToPosix) int


durationDecoder : Decoder Duration.Duration
durationDecoder =
    Decode.map (\n -> n |> toFloat |> Duration.seconds) int


fetch : (Result Http.Error State -> msg) -> Cmd msg
fetch result =
    Http.get
        { url = "/api/periode"
        , expect =
            stateDecoder
                |> Http.expectJson result
        }


sort : List Periode -> List Periode
sort periodes =
    periodes
        |> List.sortBy (\p -> Time.posixToMillis p.start)
        |> List.reverse


filterYearMonth : Time.Zone -> YearMonth.YearMonthSelect -> List Periode -> List Periode
filterYearMonth zone ym periodes =
    case ym of
        YearMonth.All ->
            periodes

        _ ->
            List.filter (\p -> YearMonth.fromPosix zone p.start == ym) periodes


byYearMonth : Time.Zone -> List Periode -> List ( String, List Periode )
byYearMonth zone periodes =
    List.foldl
        (\periode acc ->
            let
                myIdx =
                    YearMonth.fromPosix zone periode.start
                        |> YearMonth.toString
            in
            case acc of
                ( idx, elements ) :: rest ->
                    if idx == myIdx then
                        ( idx, periode :: elements ) :: rest

                    else
                        ( myIdx, [ periode ] ) :: acc

                [] ->
                    [ ( myIdx, [ periode ] ) ]
        )
        []
        periodes
