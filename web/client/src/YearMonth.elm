module YearMonth exposing (YearMonthSelect(..), fromAttr, fromPosix, toString, viewYearMonthSelect, yearMonthList)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Time


type YearMonthSelect
    = All
    | YearMonth Int Time.Month


yearMonthList : Time.Zone -> List Time.Posix -> List YearMonthSelect
yearMonthList zone =
    List.map (fromPosix zone)


fromPosix : Time.Zone -> Time.Posix -> YearMonthSelect
fromPosix zone time =
    YearMonth
        (Time.toYear zone time)
        (Time.toMonth zone time)


toString : YearMonthSelect -> String
toString yearMonth =
    case yearMonth of
        All ->
            "Alle"

        YearMonth year month ->
            String.fromInt year ++ " " ++ monthToString month


toAttr : YearMonthSelect -> String
toAttr yearMonth =
    case yearMonth of
        All ->
            "alle"

        YearMonth year month ->
            String.fromInt year
                ++ "_"
                ++ monthToString month
                |> String.toLower


fromAttr : String -> YearMonthSelect
fromAttr value =
    case String.split "_" value of
        [ strYear, strMonth ] ->
            let
                year =
                    String.toInt strYear

                month =
                    stringToMonth strMonth
            in
            Maybe.map2 YearMonth year month
                |> Maybe.withDefault All

        _ ->
            All


monthToString : Time.Month -> String
monthToString month =
    case month of
        Time.Jan ->
            "Januar"

        Time.Feb ->
            "Februar"

        Time.Mar ->
            "März"

        Time.Apr ->
            "April"

        Time.May ->
            "Mai"

        Time.Jun ->
            "Juni"

        Time.Jul ->
            "Juli"

        Time.Aug ->
            "August"

        Time.Sep ->
            "September"

        Time.Oct ->
            "Oktober"

        Time.Nov ->
            "November"

        Time.Dec ->
            "Dezember"


stringToMonth : String -> Maybe Time.Month
stringToMonth month =
    case month of
        "januar" ->
            Just Time.Jan

        "februar" ->
            Just Time.Feb

        "märz" ->
            Just Time.Mar

        "april" ->
            Just Time.Apr

        "mai" ->
            Just Time.May

        "juni" ->
            Just Time.Jun

        "juli" ->
            Just Time.Jul

        "august" ->
            Just Time.Aug

        "september" ->
            Just Time.Sep

        "oktober" ->
            Just Time.Oct

        "november" ->
            Just Time.Nov

        "dezember" ->
            Just Time.Dec

        _ ->
            Nothing


viewYearMonthSelect : Time.Zone -> YearMonthSelect -> (String -> msg) -> List Time.Posix -> Html msg
viewYearMonthSelect zone selected event times =
    select [ onInput event ]
        (List.map (viewYearMonthOption selected) (All :: unique (yearMonthList zone times)))


viewYearMonthOption : YearMonthSelect -> YearMonthSelect -> Html msg
viewYearMonthOption selectedYM ym =
    option [ value (toAttr ym), selected (selectedYM == ym) ] [ text (toString ym) ]


unique : List a -> List a
unique list =
    case list of
        first :: second :: tail ->
            if first == second then
                unique (first :: tail)

            else
                first :: unique (second :: tail)

        first :: [] ->
            [ first ]

        [] ->
            []
