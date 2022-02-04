module Periode exposing (Current(..), ID, Periode, State, fetch, filterYearMonth, idToString, sort)

import Http
import Json.Decode as Decode exposing (Decoder, bool, int, map, string)
import Json.Decode.Pipeline exposing (optional, required)
import Time
import YearMonth exposing (YearMonthSelect(..))


type Current
    = Stopped
    | Started Time.Posix (Maybe String)


type alias Periode =
    { id : ID
    , start : Time.Posix
    , stop : Time.Posix
    , comment : Maybe String
    }


periodeDecoder : Decoder Periode
periodeDecoder =
    Decode.succeed Periode
        |> required "id" idDecoder
        |> required "start" timeDecoder
        |> required "stop" timeDecoder
        |> optional "comment" (map Just string) Nothing


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
        |> optional "comment" (map Just string) Nothing
        |> required "periodes" periodeListDecoder
    )
        |> map serverStateToState


type alias ServerState =
    { running : Bool
    , start : Time.Posix
    , comment : Maybe String
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


timeDecoder : Decoder Time.Posix
timeDecoder =
    Decode.map (\n -> Time.millisToPosix (n * 1000)) int


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
    List.sortBy (\p -> Time.posixToMillis p.start) periodes


filterYearMonth : Time.Zone -> YearMonth.YearMonthSelect -> List Periode -> List Periode
filterYearMonth zone ym periodes =
    case ym of
        YearMonth.All ->
            periodes

        _ ->
            periodes |> List.filter (\p -> YearMonth.fromPosix zone p.start == ym)
