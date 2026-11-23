#!/usr/bin/env python3
"""Builds Daylight's county data pack: the places on the map and what's happening.

    python3 tools/build_pack.py            # both
    python3 tools/build_pack.py --events   # events only (run every few hours)
    python3 tools/build_pack.py --places   # places only (run weekly)

Standard library only. Every source is a public feed read the way the publisher offers it.
A source that fails is skipped and reported; the previous file is kept if nothing could be built.
"""
import datetime as dt
import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACK = os.path.join(ROOT, 'data', 'arlington-va')
UA = 'DaylightCountyCompanion/1.0 (+https://github.com/robdon3/daylight)'
COUNTY = {'id': 'arlington-va', 'name': 'Arlington County', 'admin': 'Virginia', 'tz': 'America/New_York',
          'center': [38.8816, -77.0910], 'bbox': [38.827, -77.173, 38.935, -77.031]}
AREA = 'area["name"="Arlington County"]["admin_level"="6"]["boundary"="administrative"]->.a;'
OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter',
            'https://overpass.kumi.systems/api/interpreter', 'https://overpass.openstreetmap.fr/api/interpreter']
HORIZON_DAYS = 60


def get(url, data=None, headers=None, timeout=60):
    req = urllib.request.Request(url, data=data, headers={'User-Agent': UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def get_json(url, **kw):
    return json.loads(get(url, **kw).decode('utf-8', 'replace'))


def text(s, limit=320):
    """HTML to one plain line."""
    s = re.sub(r'<(br|/p|/li|/h\d)[^>]*>', ' ', s or '', flags=re.I)
    s = html.unescape(re.sub(r'<[^>]+>', '', s))
    s = re.sub(r'\s+', ' ', s).strip()
    return s if len(s) <= limit else s[:limit].rsplit(' ', 1)[0] + '…'


def norm(s):
    return re.sub(r'[^a-z0-9]+', ' ', (s or '').lower()).strip()


# ---------------------------------------------------------------- places (OpenStreetMap)
QUERY = '[out:json][timeout:180];' + AREA + '''(
 nwr["leisure"~"^(park|nature_reserve|garden|playground|dog_park|sports_centre|fitness_centre|swimming_pool|pitch|track|ice_rink|golf_course|miniature_golf|bowling_alley|stadium|dance|fitness_station)$"](area.a);
 nwr["landuse"="allotments"](area.a);
 nwr["amenity"~"^(community_centre|social_centre|place_of_worship|social_facility|coworking_space|library|theatre|cinema|arts_centre|music_venue|events_venue|cafe|restaurant|bar|pub|biergarten|ice_cream|marketplace|townhall|courthouse|police|fire_station|post_office|school|college|university|recycling|pharmacy|hospital|clinic|bank|veterinary|childcare|kindergarten|toilets|drinking_water|bicycle_rental|bus_station|car_sharing|charging_station|bicycle_repair_station)$"](area.a);
 nwr["club"](area.a);
 nwr["office"~"^(association|ngo|government|charity|foundation)$"](area.a);
 nwr["tourism"~"^(museum|gallery|artwork|attraction|viewpoint)$"](area.a);
 nwr["historic"]["name"](area.a);
 nwr["shop"~"^(bakery|supermarket|greengrocer|laundry|dry_cleaning|hardware|doityourself|bicycle|books)$"](area.a);
 nwr["railway"="station"](area.a);
 nwr["craft"="brewery"](area.a);
);out center tags;'''

NAMELESS = {'playground': 'Playground', 'dogpark': 'Dog park', 'toilets': 'Public toilets', 'water': 'Drinking fountain',
            'charging': 'EV charging', 'bikefix': 'Bike repair stand', 'outgym': 'Outdoor gym', 'cgarden': 'Community garden'}


def classify(t):
    """OpenStreetMap tags -> one of Daylight's kinds, or None."""
    le, am, sh, to, of = t.get('leisure'), t.get('amenity'), t.get('shop'), t.get('tourism'), t.get('office')
    if t.get('access') in ('private', 'no') and am != 'school':
        return None
    if am == 'library': return 'library'
    if am in ('community_centre', 'social_centre'): return 'community'
    if t.get('club'): return 'club'
    if am == 'place_of_worship': return 'worship'
    if am == 'social_facility': return 'support'
    if of in ('association', 'ngo', 'charity', 'foundation'): return 'nonprofit'
    if am == 'coworking_space': return 'cowork'
    if to == 'museum': return 'museum'
    if to == 'gallery': return 'gallery'
    if am == 'theatre': return 'theatre'
    if am == 'cinema': return 'cinema'
    if am in ('arts_centre', 'music_venue', 'events_venue'): return 'arts'
    if to == 'artwork': return 'artwork'
    if to == 'viewpoint': return 'viewpoint'
    if to == 'attraction': return 'sight'
    if t.get('historic'): return 'memorial' if t['historic'] in ('memorial', 'monument') else 'historic'
    if am == 'cafe': return 'cafe'
    if am == 'restaurant': return 'restaurant'
    if am in ('bar', 'pub', 'biergarten') or t.get('craft') == 'brewery': return 'bar'
    if sh == 'bakery': return 'bakery'
    if am == 'ice_cream': return 'icecream'
    if am == 'marketplace': return 'market'
    if am == 'townhall': return 'townhall'
    if am == 'courthouse': return 'court'
    if of == 'government': return 'govoffice'
    if am == 'police': return 'police'
    if am == 'fire_station': return 'fire'
    if am == 'post_office': return 'post'
    if am == 'school': return 'school'
    if am in ('college', 'university'): return 'college'
    if am == 'recycling': return 'recycling' if t.get('recycling_type') == 'centre' else None
    if sh in ('supermarket', 'greengrocer'): return 'grocery'
    if am == 'pharmacy': return 'pharmacy'
    if am == 'hospital': return 'hospital'
    if am == 'clinic': return 'clinic'
    if am == 'bank': return 'bank'
    if sh in ('laundry', 'dry_cleaning'): return 'laundry'
    if sh in ('hardware', 'doityourself'): return 'hardware'
    if sh == 'bicycle': return 'bikeshop'
    if sh == 'books': return 'books'
    if am == 'veterinary': return 'vet'
    if am in ('childcare', 'kindergarten'): return 'childcare'
    if am == 'toilets': return 'toilets'
    if am == 'drinking_water': return 'water'
    if t.get('railway') == 'station': return 'metro' if t.get('station') == 'subway' or t.get('subway') == 'yes' else 'rail'
    if am == 'bicycle_rental': return 'bikeshare'
    if am == 'bus_station': return 'bus'
    if am == 'car_sharing': return 'carshare'
    if am == 'charging_station': return 'charging'
    if am == 'bicycle_repair_station': return 'bikefix'
    if le == 'park': return 'park'
    if le == 'nature_reserve': return 'nature'
    if le == 'garden': return 'garden' if t.get('name') else None
    if t.get('landuse') == 'allotments': return 'cgarden'
    if le == 'playground': return 'playground'
    if le == 'dog_park': return 'dogpark'
    if le in ('sports_centre', 'stadium', 'dance'): return 'sportscentre'
    if le == 'fitness_centre': return 'fitness'
    if le == 'fitness_station': return 'outgym'
    if le == 'swimming_pool': return 'pool' if t.get('name') else None
    if le == 'pitch': return 'pitch' if t.get('name') else None
    if le == 'track': return 'track' if t.get('name') or t.get('sport') in ('running', 'athletics') else None
    if le == 'ice_rink': return 'icerink'
    if le in ('golf_course', 'miniature_golf'): return 'golf'
    if le == 'bowling_alley': return 'bowling'
    return None


def detail(kind, t):
    bits = []
    for k in ('sport', 'cuisine', 'religion', 'denomination', 'club', 'social_facility', 'operator'):
        v = t.get(k)
        if v and (k != 'operator' or kind in ('bikeshare', 'charging', 'school', 'govoffice', 'park', 'community')):
            bits.append(v.replace(';', ', ').replace('_', ' '))
    return ', '.join(dict.fromkeys(bits))[:70]


def overpass(query):
    last = None
    for attempt in range(2):
        for url in OVERPASS:
            try:
                j = get_json(url, data=urllib.parse.urlencode({'data': query}).encode(), timeout=240)
                if isinstance(j.get('elements'), list) and j['elements']:
                    return j['elements']
                last = 'empty answer'
            except Exception as e:  # noqa: BLE001  (try the next mirror)
                last = f'{url}: {e}'
            time.sleep(3)
    raise RuntimeError(f'no map server answered ({last})')


def farmers_markets():
    """Arlington County open data: one record per market, with the day it runs."""
    out = []
    rows = get_json('https://download.data.arlingtonva.us/Uploads/AutomatedJobs/Farmers+market.json', timeout=40)
    for r in rows:
        if not (r.get('Latitude') and r.get('Longitude') and r.get('Name')):
            continue
        x = {'a': str(r.get('Address') or '').strip(), 'x': f"{r.get('Day of Week', '').strip()}s".strip()}
        if str(r.get('URL') or '').startswith('http'):
            x['w'] = r['URL']
        out.append(['market', r['Name'].strip(), round(float(r['Latitude']), 5), round(float(r['Longitude']), 5),
                    {k: v for k, v in x.items() if v and v != 's'}])
    return out


def build_places():
    els = overpass(QUERY)
    seen, places = set(), []
    for e in els:
        t = e.get('tags') or {}
        kind = classify(t)
        if not kind:
            continue
        lat = e.get('lat') or (e.get('center') or {}).get('lat')
        lon = e.get('lon') or (e.get('center') or {}).get('lon')
        name = (t.get('name:en') or t.get('name') or NAMELESS.get(kind) or '').strip()
        if not (lat and lon and name):
            continue
        key = (kind, norm(name), round(lat, 3), round(lon, 3))
        if key in seen:
            continue
        seen.add(key)
        x = {}
        addr = ' '.join(v for v in (t.get('addr:housenumber'), t.get('addr:street')) if v)
        web = t.get('website') or t.get('contact:website') or t.get('url')
        if addr: x['a'] = addr
        if web and web.startswith('http'): x['w'] = web[:160]
        if t.get('phone') or t.get('contact:phone'): x['p'] = (t.get('phone') or t.get('contact:phone'))[:24]
        if t.get('opening_hours'): x['h'] = t['opening_hours'][:120]
        d = detail(kind, t)
        if d: x['x'] = d
        places.append([kind, name[:80], round(lat, 5), round(lon, 5), x])
    try:
        fm = farmers_markets()
        have = {norm(p[1]) for p in places if p[0] == 'market'}
        places += [m for m in fm if norm(m[1]) not in have]
        print(f'  farmers markets: {len(fm)}')
    except Exception as e:  # noqa: BLE001
        print(f'  farmers markets skipped: {e}')
    places.sort(key=lambda p: (p[0], p[1].lower()))
    return places


# ---------------------------------------------------------------- events
def library_events(until):
    """Arlington Public Library's public calendar (LibCal)."""
    out, page = [], 1
    while page <= 12:
        j = get_json('https://arlingtonva.libcal.com/ajax/calendar/list?c=-1&date=0000-00-00&perpage=48&page=%d' % page,
                     headers={'X-Requested-With': 'XMLHttpRequest'}, timeout=40)
        rows = j.get('results') or []
        for r in rows:
            s = (r.get('startdt') or '').replace(' ', 'T')[:16]
            if not s or s[:10] > until:
                continue
            aud = r.get('audiences') or []
            aud = [a.get('name', '') for a in aud] if isinstance(aud, list) else re.findall(r"'name': ['\"](.+?)['\"],", str(aud))
            cats = r.get('categories_arr') or []
            cat = cats[0].get('name', '') if isinstance(cats, list) and cats else str(r.get('categories') or '').split(',')[0]
            out.append({'id': 'lib' + str(r['id']), 't': text(r.get('title'), 120), 's': s,
                        'e': (r.get('enddt') or '').replace(' ', 'T')[:16], 'ad': str(r.get('all_day')) in ('True', 'true', '1'),
                        'v': (r.get('campus') or '').strip() or ('Online' if str(r.get('online_event')) in ('True', 'true', '1') else ''),
                        'r': (r.get('location') or '').strip(), 'u': r.get('url'), 'c': 'library',
                        'g': cat.strip(),
                        'who': ', '.join(a.replace('Events for ', '').replace('Good for ', '') for a in aud)[:60],
                        'd': text(r.get('shortdesc'), 260)})
        if not rows or page * 48 >= int(j.get('total_results') or 0) or (rows and rows[-1].get('startdt', '')[:10] > until):
            break
        page += 1
        time.sleep(1)
    return out


def tribe_events(base, prefix, cat, until):
    """Sites running The Events Calendar publish a public JSON feed."""
    out, page = [], 1
    while page <= 6:
        q = urllib.parse.urlencode({'per_page': 50, 'page': page, 'start_date': 'now', 'end_date': until + ' 23:59:59'})
        try:
            j = get_json(f'{base}/wp-json/tribe/events/v1/events?{q}', timeout=40)
        except urllib.error.HTTPError as e:
            if page > 1 and e.code in (400, 404):
                break
            raise
        for r in j.get('events') or []:
            v = r.get('venue') if isinstance(r.get('venue'), dict) else {}
            ev = {'id': prefix + str(r['id']), 't': text(r.get('title'), 120), 's': r['start_date'].replace(' ', 'T')[:16],
                  'e': (r.get('end_date') or '').replace(' ', 'T')[:16], 'ad': bool(r.get('all_day')),
                  'v': text(v.get('venue'), 80), 'a': text(v.get('address'), 80), 'u': r.get('url'), 'c': cat,
                  'g': text(((r.get('categories') or [{}])[0] or {}).get('name'), 40), 'd': text(r.get('description'), 260)}
            try:
                if v.get('geo_lat') and v.get('geo_lng'):
                    ev['lat'], ev['lon'] = round(float(v['geo_lat']), 5), round(float(v['geo_lng']), 5)
            except (TypeError, ValueError):
                pass
            out.append(ev)
        if page >= int(j.get('total_pages') or 1):
            break
        page += 1
        time.sleep(1)
    return out


SOURCES = [
    {'id': 'library', 'name': 'Arlington Public Library', 'url': 'https://arlingtonva.libcal.com/',
     'fetch': lambda until: library_events(until)},
    # "live" marks a calendar whose server lets a browser read it, so the phone re-reads it on its own between builds
    {'id': 'schools', 'name': 'Arlington Public Schools', 'url': 'https://www.apsva.us/events/',
     'live': {'type': 'tribe', 'base': 'https://www.apsva.us', 'prefix': 'aps', 'cat': 'schools'},
     'fetch': lambda until: tribe_events('https://www.apsva.us', 'aps', 'schools', until)},
    {'id': 'ecoaction', 'name': 'EcoAction Arlington', 'url': 'https://www.ecoactionarlington.org/events/',
     'live': {'type': 'tribe', 'base': 'https://www.ecoactionarlington.org', 'prefix': 'eco', 'cat': 'community'},
     'fetch': lambda until: tribe_events('https://www.ecoactionarlington.org', 'eco', 'community', until)},
]


def locate_events(events, places):
    """Give an event the coordinates of the place it names, when the map knows that place."""
    by_name = {}
    for kind, name, lat, lon, _x in places:
        by_name.setdefault(norm(name), (lat, lon))
    libs = [(norm(p[1]), p[2], p[3]) for p in places if p[0] == 'library']
    for ev in events:
        if 'lat' in ev or not ev.get('v'):
            continue
        n = norm(ev['v'])
        hit = by_name.get(n)
        if not hit and ev['c'] == 'library':
            first = n.replace(' library', '').replace('arlington ', '')
            hit = next(((la, lo) for ln, la, lo in libs if first and first in ln), None)
        if not hit:
            hit = next((ll for pn, ll in by_name.items() if len(n) > 8 and (n in pn or pn in n) and len(pn) > 8), None)
        if hit:
            ev['lat'], ev['lon'] = hit


def build_events(places):
    today = dt.date.today()
    until = (today + dt.timedelta(days=HORIZON_DAYS)).isoformat()
    events, report = [], []
    for src in SOURCES:
        try:
            got = [e for e in src['fetch'](until) if e.get('t') and e.get('s') and e['s'][:10] >= today.isoformat()]
            for e in got:
                e['src'] = src['id']
            events += got
            report.append({'id': src['id'], 'name': src['name'], 'url': src['url'], 'n': len(got), 'ok': True, **({'live': src['live']} if src.get('live') else {})})
            print(f"  {src['name']}: {len(got)}")
        except Exception as e:  # noqa: BLE001
            report.append({'id': src['id'], 'name': src['name'], 'url': src['url'], 'n': 0, 'ok': False, **({'live': src['live']} if src.get('live') else {})})
            print(f"  {src['name']}: FAILED ({e})")
    locate_events(events, places)
    seen, out = set(), []
    for e in sorted(events, key=lambda e: (e['s'], e['t'])):
        k = (e['s'], norm(e['t']), norm(e.get('v')))
        if k in seen:
            continue
        seen.add(k)
        out.append({k2: v for k2, v in e.items() if v not in ('', None, False)})
    return out, report


def write(name, obj):
    os.makedirs(PACK, exist_ok=True)
    path = os.path.join(PACK, name)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))
    print(f'  wrote {os.path.relpath(path, ROOT)} ({os.path.getsize(path) // 1024} KB)')


def read(name):
    try:
        with open(os.path.join(PACK, name), encoding='utf-8') as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


def main():
    want = set(a.lstrip('-') for a in sys.argv[1:]) or {'places', 'events'}
    stamp = dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%MZ')
    ok = True
    if 'places' in want:
        print('places…')
        try:
            places = build_places()
            if len(places) < 500:
                raise RuntimeError(f'only {len(places)} places; keeping the old file')
            write('places.json', {'v': 3, **COUNTY, 'at': stamp, 'places': places})
        except Exception as e:  # noqa: BLE001
            ok = False
            print(f'  places FAILED: {e}')
    if 'events' in want:
        print('events…')
        events, report = build_events((read('places.json') or {}).get('places') or [])
        if events:
            write('events.json', {'v': 1, 'id': COUNTY['id'], 'tz': COUNTY['tz'], 'at': stamp, 'sources': report, 'events': events})
        else:
            ok = False
            print('  no events from any source; keeping the old file')
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
