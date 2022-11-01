module Mony exposing (durationInHourMinutes, durationToCent)

import Duration


centPerHour : Int
centPerHour =
    8000


centPerMinute : Int
centPerMinute =
    134


durationInHourMinutes : Duration.Duration -> ( Int, Int )
durationInHourMinutes duration =
    ( Duration.inHours duration |> floor
    , Duration.inMinutes duration |> ceiling |> modBy 60
    )


durationToCent : Duration.Duration -> Int
durationToCent duration =
    let
        ( hours, minutes ) =
            durationInHourMinutes duration
    in
    hours * centPerHour + minutes * centPerMinute
