module Periode exposing (ID(..), Periode, fetch, idDecoder, periodeDecoder, periodeListDecoder)

import Http
import Json.Decode as Decode exposing (Decoder, int, string, map)
import Json.Decode.Pipeline exposing (optional, required)


type alias Periode =
    { id : ID
    , start : Int --time.Posix
    , stop : Int --time.Posix
    , comment : Maybe String
    }


periodeDecoder : Decoder Periode
periodeDecoder =
    Decode.succeed Periode
        |> required "id" idDecoder
        |> required "start" Decode.int
        |> required "stop" Decode.int
        |> optional "comment" (map Just string) Nothing


periodeListDecoder : Decoder (List Periode)
periodeListDecoder =
    Decode.list periodeDecoder


type ID
    = ID Int


idDecoder : Decoder ID
idDecoder =
    Decode.map ID int


fetch : (Result Http.Error (List Periode) -> msg) -> Cmd msg
fetch result =
    Http.get
        { url = "/api/periode"
        , expect =
            periodeListDecoder
                |> Http.expectJson result
        }
