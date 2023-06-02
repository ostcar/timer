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
    let 
        minutes = Duration.inMinutes duration |> ceiling 
    in
    ( minutes // 60
    , minutes |> modBy 60
    )


durationToCent : Duration.Duration -> Int
durationToCent duration =
    let
        ( hours, minutes ) =
            durationInHourMinutes duration
    in
    hours * centPerHour + minutes * centPerMinute
