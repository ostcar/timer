module Mony exposing (..)

import Duration

myHours : Int
myHours =
    8000


durationToEuroCent : Int -> Duration.Duration -> Int
durationToEuroCent amount duration =
    let
        hours =
            Duration.inHours duration |> floor |> Basics.max 0

        minutes =
            Duration.inMinutes duration |> ceiling |> modBy 60

        minuteAmount =
            ceiling (toFloat amount / 60)
    in
    hours * amount + minutes * minuteAmount


mydurationToEuroCent : Duration.Duration -> Int
mydurationToEuroCent =
    durationToEuroCent myHours


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


euroCentToString : Int -> String
euroCentToString euroCent =
    let
        euro =
            euroCent // 100

        cent =
            remainderBy 100 euroCent
    in
    String.fromInt euro ++ "," ++ intToString2 cent ++ " €"


durationToString : Duration.Duration -> String
durationToString duration =
    mydurationToEuroCent duration
    |> euroCentToString
