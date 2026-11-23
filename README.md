# Daylight

A companion for where you live: the places, the people and what's happening, on one map.

**Open it:** https://robdon3.github.io/daylight/ (on an iPhone: Safari, Share, Add to Home Screen)

## What it does

- **Explore.** A map of what is around you, sorted into eight kinds: outdoors, sport and fitness, community and clubs,
  arts and history, food and drink, government and civic, everyday needs, getting around. Search it, save places, keep a
  note on any of them. Places you stand at while the app is open get stamped "been there".
- **Paper.** A daily front page for your county, laid out like a newspaper: the National Weather Service forecast and
  alerts, a lead story and numbered local news, today's and tomorrow's agenda, a numbers box (weather, air quality, sun
  and moon, river gauge, tides), schools, library, features and a verse. Nobody writes it: it is assembled on the phone
  from the sources named under each item, and every item opens the original.
- **Happening.** One list of what is on today, tomorrow, this weekend and beyond, read from the calendars that publish
  a public feed. Save an event to your plans, add it to your calendar, or see it on the map.
- **Guide.** How to get things done in your county: report a problem, pay a bill, find the meeting calendar, register
  to vote, plus one-tap "nearest library, Metro, pharmacy, toilets".
- **Mine.** Your circles (the groups you want to keep seeing), your plans, your saved places and where you've been.
  Post a meetup and send the link: the link carries the meetup itself.

The original Daylight game (five small missions a day) is still here, under Mine, The daily five.

## Where it works

Arlington County, Virginia has a full data pack: about 1,900 places, the Arlington Public Library, Arlington Public
Schools and EcoAction Arlington calendars, the County's farmers markets, and a guide to County services. Anywhere else,
the map reads places live from OpenStreetMap around you; there are no events or guide there yet.

## How it's built

Plain HTML, CSS and JavaScript. No build step, no account, no server. `data/arlington-va/` holds the county pack:

| File | From | Built by |
|---|---|---|
| `places.json` | OpenStreetMap, Arlington County open data | `python3 tools/build_pack.py --places` |
| `events.json` | Public calendar feeds (see `SOURCES` in the script) | `python3 tools/build_pack.py --events` |
| `guide.json` | Written by hand; links to official pages | |
| `paper.json` | Written by hand; the paper's sources (newsrooms, river gauge, tide station) | |

`tools/refresh-data.workflow.yml` is a scheduled job that rebuilds the pack on GitHub. It is inert until copied to
`.github/workflows/`.

Run it locally with `python3 -m http.server` in this folder. `?now=2026-11-23T10:30` fakes the clock for testing.

## Privacy

There is no Daylight server. Circles, plans, notes, saved places and stamps live only in the browser's storage.

| Goes out | To | What is sent |
|---|---|---|
| Weather | Open-Meteo | Your position rounded to about half a mile |
| Map tiles | OpenStreetMap | The map squares you look at |
| Nearby places, outside a covered county | Overpass (OpenStreetMap) | Your position rounded to about a block |
| Town lookup, if you type a town | Open-Meteo geocoding | The town name you typed |
| The paper | National Weather Service, Open-Meteo, USGS, NOAA, bible-api.com, and the newsrooms in `paper.json` | The county's center point, never your own position |

Daylight is not affiliated with Arlington County or any organization it links to. Check the organizer's page before
you go: times change.
