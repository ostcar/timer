module Periode exposing (Current(..), ID, Periode, State, byYearMonth, fetch, filterYearMonth, idToString, sort, stateComment)

import Duration
import Http
import Json.Decode as Decode exposing (Decoder, bool, int, string)
import Json.Decode.Pipeline exposing (optional, required)
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
    }


periodeDecoder : Decoder Periode
periodeDecoder =
    Decode.succeed Periode
        |> required "id" idDecoder
        |> required "start" timeDecoder
        |> required "duration" durationDecoder
        |> optional "comment" string ""


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


timeDecoder : Decoder Time.Posix
timeDecoder =
    Decode.map (\n -> Time.millisToPosix (n * 1000)) int


durationDecoder : Decoder Duration.Duration
durationDecoder =
    Decode.map (\n -> Duration.seconds (toFloat n)) int


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
        (\p list ->
            let
                index =
                    YearMonth.fromPosix zone p.start |> YearMonth.toString

                foundIndex =
                    anyIndex (\e -> Tuple.first e == index) list
            in
            if foundIndex == -1 then
                ( index, [ p ] ) :: list

            else
                List.indexedMap
                    (\idx ( ym, l ) ->
                        if idx == foundIndex then
                            ( ym, p :: l )

                        else
                            ( ym, l )
                    )
                    list
        )
        []
        periodes


{-| Like List.any but returns the index of the first found element. Returns -1
if the list does not contain the required element

    anyIndex isEven [ 2, 3 ] == 0

    anyIndex isEven [ 1, 3 ] == -1

-}
anyIndex : (a -> Bool) -> List a -> Int
anyIndex comparer list =
    List.indexedMap
        (\index element ->
            if comparer element then
                index

            else
                -1
        )
        list
        |> List.foldl
            (\element found ->
                if element >= 0 then
                    element

                else
                    found
            )
            -1
