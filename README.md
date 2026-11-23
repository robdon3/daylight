# Daylight

An open-world game where the world is real. Your town is the map, the sun is the clock,
and the missions are your actual life: BODY, BONDS, MONEY, WORK, SOCIAL.

This is the phone edition: a web app you add to your iPhone Home Screen.

## Play
1. Open the site in Safari on your iPhone.
2. Tap Share, then **Add to Home Screen**.
3. Open Daylight from the Home Screen and choose **Use my location** or type your town.

## How it works
- Five missions a day, one per lamp. Any three wins the day. Then the game is over until tomorrow.
- A lamp you ignore dims after 2 days and goes dark after 4. The most neglected lamp pays +50%.
- Missions get harder as each lamp levels up.
- Outdoor missions switch to an indoor plan in rough weather or after dark.
- The Map tab shows the real places around you, with today's mission places numbered. Tap one for directions.

## What is real, and what leaves your phone
| Thing | Source | Sent out |
|---|---|---|
| Sunrise, sunset | computed on the phone | nothing |
| Weather | open-meteo.com | coordinates rounded to about half a mile |
| Places | OpenStreetMap (Overpass) | coordinates rounded to about half a mile |
| Town lookup | Open-Meteo geocoding | the town name you type |
| Name of where you are | OpenStreetMap Nominatim, only with "Use my location" | coordinates rounded to about half a mile |
| Map pictures | OpenStreetMap tiles | the map area you look at |

Your missions, notes and journal never leave the phone. They live in the browser's storage for this
site; use Settings, "Save a backup file" to keep a copy.

No account, no server of its own, no AI at runtime. Plain HTML, CSS and JavaScript with no build step.
`seed/arlington-va.json` is a bundled copy of Arlington, VA places used when the public map servers are down.

## Run it locally
    python3 -m http.server 8765
Then open http://localhost:8765. Add `?now=2026-06-01T15:30` to the address to test another time of day.

Place data © OpenStreetMap contributors. Map by Leaflet.
