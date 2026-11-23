# Daylight

An open-world game where the world is real. Your town is the map, the sun is the clock,
and the missions are your actual life: BODY, BONDS, MONEY, WORK, SOCIAL.

This is the phone edition: a web app you add to your iPhone Home Screen.

## Play
1. Open the site in Safari on your iPhone.
2. Tap Share, then **Add to Home Screen**.
3. Open Daylight from the Home Screen and choose **Use my location** or type your town.

## How it works
- **The map is the game.** It opens on a map of your town. Today's missions are numbered pins, with the same missions as cards along the bottom.
- Five missions a day, one per lamp. Any three wins the day. Then the game is over until tomorrow.
- **Check-ins.** A mission that names a place pays +50% when you check in there (within about a block). You can still log it without checking in for the normal amount.
- **Discoveries.** Every dot is a real place. Walk up to one with the app open and it lights up and stays lit, so your town fills in as you play.
- **Quests.** Five steps, one a day, on top of the board. One quest at a time.
- **Streaks.** Bonus xp to every lamp at 3, 7, 14, 30, 60 and 100 days, and a second daily swap from a 7-day streak.
- A lamp you ignore dims after 2 days and goes dark after 4. The most neglected lamp pays +50%.
- Missions get harder as each lamp levels up. Outdoor missions switch to an indoor plan in rough weather or after dark.

## What is real, and what leaves your phone
| Thing | Source | Sent out |
|---|---|---|
| Sunrise, sunset | computed on the phone | nothing |
| Weather | open-meteo.com | coordinates rounded to about half a mile |
| Places | OpenStreetMap (Overpass) | coordinates rounded to about half a mile |
| Town lookup | Open-Meteo geocoding | the town name you type |
| Name of where you are | OpenStreetMap Nominatim, only with "Use my location" | coordinates rounded to about half a mile |
| Map pictures | OpenStreetMap tiles | the map area you look at |
| Check-ins and discoveries | your phone's location, compared on the phone | nothing; your exact location is never stored or sent |

Your missions, notes, journal and discoveries never leave the phone. They live in the browser's storage for this
site; use Settings, "Save a backup file" to keep a copy.

No account, no server of its own, no AI at runtime. Plain HTML, CSS and JavaScript with no build step.
`seed/arlington-va.json` is a bundled copy of Arlington, VA places used when the public map servers are down.

## Run it locally
    python3 -m http.server 8765
Then open http://localhost:8765. Add `?now=2026-06-01T15:30` to the address to test another time of day.

Place data © OpenStreetMap contributors. Map by Leaflet.
