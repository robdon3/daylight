'use strict';
/* DAYLIGHT: a companion for where you live. The places, the people and what's happening, on one map.
   One page, no account, no server of its own. Everything you save stays in this browser. */

// ------------------------------------------------------------------ what's on the map
// [id, title, color, kinds]
const GROUPS = [
  ['outdoors', 'Outdoors', '#2f9e5b', ['park', 'nature', 'garden', 'cgarden', 'playground', 'dogpark', 'viewpoint']],
  ['active', 'Sport & fitness', '#e4572e', ['sportscentre', 'fitness', 'pool', 'pitch', 'track', 'icerink', 'golf', 'bowling', 'outgym']],
  ['community', 'Community & clubs', '#8a52d9', ['community', 'club', 'nonprofit', 'support', 'worship', 'cowork']],
  ['culture', 'Arts & history', '#12909c', ['library', 'museum', 'gallery', 'theatre', 'cinema', 'arts', 'artwork', 'memorial', 'historic', 'sight', 'books']],
  ['food', 'Food & drink', '#b9770e', ['cafe', 'restaurant', 'bar', 'bakery', 'icecream', 'market']],
  ['civic', 'Government & civic', '#3b7dd8', ['townhall', 'govoffice', 'court', 'police', 'fire', 'post', 'school', 'college', 'recycling']],
  ['daily', 'Everyday needs', '#6b7280', ['grocery', 'pharmacy', 'hospital', 'clinic', 'bank', 'laundry', 'hardware', 'bikeshop', 'vet', 'childcare', 'toilets', 'water']],
  ['transit', 'Getting around', '#d6457a', ['metro', 'rail', 'bus', 'bikeshare', 'carshare', 'charging', 'bikefix']],
];
const KIND = { park: 'Park', nature: 'Nature area', garden: 'Garden', cgarden: 'Community garden', playground: 'Playground', dogpark: 'Dog park',
  viewpoint: 'Viewpoint', sportscentre: 'Sports center', fitness: 'Gym', pool: 'Pool', pitch: 'Field or court', track: 'Track', icerink: 'Ice rink',
  golf: 'Golf', bowling: 'Bowling', outgym: 'Outdoor gym', community: 'Community center', club: 'Club', nonprofit: 'Association or nonprofit',
  support: 'Social services', worship: 'Place of worship', cowork: 'Coworking', library: 'Library', museum: 'Museum', gallery: 'Gallery',
  theatre: 'Theater', cinema: 'Cinema', arts: 'Arts or music venue', artwork: 'Public art', memorial: 'Memorial', historic: 'Historic place',
  sight: 'Sight', books: 'Bookshop', cafe: 'Cafe', restaurant: 'Restaurant', bar: 'Bar or pub', bakery: 'Bakery', icecream: 'Ice cream',
  market: 'Market', townhall: 'Government center', govoffice: 'Government office', court: 'Courthouse', police: 'Police', fire: 'Fire station',
  post: 'Post office', school: 'School', college: 'College', recycling: 'Recycling center', grocery: 'Grocery', pharmacy: 'Pharmacy',
  hospital: 'Hospital', clinic: 'Clinic', bank: 'Bank', laundry: 'Laundry', hardware: 'Hardware', bikeshop: 'Bike shop', vet: 'Vet',
  childcare: 'Childcare', toilets: 'Public toilets', water: 'Drinking water', metro: 'Metro station', rail: 'Rail station', bus: 'Bus station',
  bikeshare: 'Bikeshare dock', carshare: 'Car share', charging: 'EV charging', bikefix: 'Bike repair stand' };
const GROUP_OF = {};
GROUPS.forEach(([id, title, color, kinds]) => kinds.forEach((k) => { GROUP_OF[k] = { id, title, color }; }));
const NEAR_GROUPS = ['outdoors', 'active', 'community', 'culture', 'civic'];          // what "Near me" shows
const WIDE = ['park', 'nature', 'garden', 'cgarden', 'golf', 'pitch', 'track'];       // big places: you're "there" from farther off
const QUICK = [['library', 'Library'], ['park', 'Park'], ['metro', 'Metro'], ['grocery', 'Grocery'], ['pharmacy', 'Pharmacy'],
  ['toilets', 'Toilets'], ['post', 'Post office'], ['bikeshare', 'Bikeshare']];
const ECAT = { library: ['Library', '#12909c'], schools: ['Schools', '#3b7dd8'], community: ['Community', '#8a52d9'], mine: ['My plan', '#e09600'] };
// counties with a prepared data pack (places, events, guide). Anywhere else, places are read live around you.
const PACKS = [{ id: 'arlington-va', name: 'Arlington County', admin: 'Virginia', bbox: [38.827, -77.173, 38.935, -77.031], center: [38.8816, -77.0910] }];
const US = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut',
  DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana',
  IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan',
  MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas',
  UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming' };
const WMO = { 0: 'clear', 1: 'mostly clear', 2: 'partly cloudy', 3: 'overcast', 45: 'fog', 48: 'fog', 51: 'light drizzle',
  53: 'drizzle', 55: 'heavy drizzle', 56: 'freezing drizzle', 57: 'freezing drizzle', 61: 'light rain', 63: 'rain',
  65: 'heavy rain', 66: 'freezing rain', 67: 'freezing rain', 71: 'light snow', 73: 'snow', 75: 'heavy snow',
  77: 'snow grains', 80: 'showers', 81: 'showers', 82: 'heavy showers', 85: 'snow showers', 86: 'snow showers',
  95: 'thunderstorm', 96: 'thunderstorm with hail', 99: 'thunderstorm with hail' };
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
// live lookups outside a pack: [tag, values, kind, needs a name]
const LIVE_RULES = [
  ['amenity', 'library', 'library'], ['amenity', 'community_centre|social_centre', 'community'], ['club', '.+', 'club'],
  ['amenity', 'place_of_worship', 'worship'], ['amenity', 'social_facility', 'support'], ['office', 'association|ngo|charity|foundation', 'nonprofit'],
  ['tourism', 'museum', 'museum'], ['tourism', 'gallery', 'gallery'], ['amenity', 'theatre', 'theatre'], ['amenity', 'cinema', 'cinema'],
  ['amenity', 'arts_centre|music_venue|events_venue', 'arts'], ['tourism', 'artwork', 'artwork', 1], ['tourism', 'viewpoint', 'viewpoint'],
  ['tourism', 'attraction', 'sight', 1], ['historic', 'memorial|monument', 'memorial', 1], ['amenity', 'cafe', 'cafe'],
  ['amenity', 'restaurant', 'restaurant'], ['amenity', 'bar|pub|biergarten', 'bar'], ['shop', 'bakery', 'bakery'], ['amenity', 'marketplace', 'market'],
  ['amenity', 'townhall', 'townhall'], ['amenity', 'courthouse', 'court'], ['office', 'government', 'govoffice', 1], ['amenity', 'police', 'police'],
  ['amenity', 'fire_station', 'fire'], ['amenity', 'post_office', 'post'], ['amenity', 'school', 'school', 1], ['amenity', 'college|university', 'college', 1],
  ['shop', 'supermarket|greengrocer', 'grocery'], ['amenity', 'pharmacy', 'pharmacy'], ['amenity', 'hospital', 'hospital'], ['amenity', 'clinic', 'clinic'],
  ['amenity', 'bank', 'bank'], ['shop', 'laundry|dry_cleaning', 'laundry'], ['shop', 'hardware|doityourself', 'hardware'], ['shop', 'bicycle', 'bikeshop'],
  ['shop', 'books', 'books'], ['amenity', 'toilets', 'toilets'], ['amenity', 'drinking_water', 'water'], ['railway', 'station', 'rail', 1],
  ['amenity', 'bicycle_rental', 'bikeshare'], ['amenity', 'bus_station', 'bus'], ['leisure', 'park', 'park', 1], ['leisure', 'nature_reserve', 'nature', 1],
  ['leisure', 'garden', 'garden', 1], ['leisure', 'playground', 'playground'], ['leisure', 'dog_park', 'dogpark'],
  ['leisure', 'sports_centre|stadium', 'sportscentre', 1], ['leisure', 'fitness_centre', 'fitness', 1], ['leisure', 'swimming_pool', 'pool', 1],
  ['leisure', 'pitch', 'pitch', 1], ['leisure', 'track', 'track', 1], ['leisure', 'ice_rink', 'icerink'], ['leisure', 'golf_course', 'golf'],
].map(([k, v, kind, named]) => [k, new RegExp(`^(${v})$`), kind, !!named]);
const NAMELESS = { playground: 'Playground', dogpark: 'Dog park', toilets: 'Public toilets', water: 'Drinking fountain' };

// ------------------------------------------------------------------ small helpers
const K_ME = 'daylight.me', K_OLD = 'daylight.state', K_WEATHER = 'daylight.weather', K_LIVE = 'daylight.live', K_PAPER = 'daylight.paper';
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const FAKE_NOW = new URLSearchParams(location.search).get('now');   // ?now=2026-06-01T15:30 for testing
const now = () => (FAKE_NOW ? new Date(FAKE_NOW) : new Date());
const dayKey = (d = now()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const clock = (d) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const parseLocal = (s) => { const [d, t = '00:00'] = s.split('T'); const [y, m, da] = d.split('-').map(Number); const [h, mi] = t.split(':').map(Number); return new Date(y, m - 1, da, h || 0, mi || 0); };
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

function readJSON(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }
function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ } }
async function fetchJSON(url, opts = {}, timeout = 12000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(url, { ...opts, signal: ctl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(timer); }
}
function km(a, b, c, d) {
  const p = Math.PI / 180;
  const h = 0.5 - Math.cos((c - a) * p) / 2 + Math.cos(a * p) * Math.cos(c * p) * (1 - Math.cos((d - b) * p)) / 2;
  return 12742 * Math.asin(Math.sqrt(h));
}
const metersBetween = (a, b) => km(a.lat, a.lon, b.lat, b.lon) * 1000;
const farText = (m) => (m < 300 ? `${Math.max(10, Math.round(m * 3.281 / 10) * 10)} ft` : m < 16000 ? `${(m / 1609).toFixed(1)} mi` : `${Math.round(m / 1609)} mi`);
const distLabel = (p) => (pos && p && p.lat != null ? (metersBetween(pos, p) < 60 ? 'right here' : farText(metersBetween(pos, p))) : '');

// ------------------------------------------------------------------ what you keep (this browser only)
function freshMe() { return { v: 1, town: null, useLocation: false, saved: {}, been: {}, notes: {}, circles: [], plans: [] }; }
let me = (() => {
  const m = readJSON(K_ME);
  if (m && m.v === 1) return { ...freshMe(), ...m };
  const n = freshMe(), old = readJSON(K_OLD);          // first run after the game: carry over your town and the places you found
  if (old && old.town) { n.town = old.town; n.useLocation = !!old.useLocation; n.carry = Object.keys(old.discovered || {}).map((k) => k.split('|')[1]); }
  return n;
})();
const save = () => writeJSON(K_ME, me);
let pos = null;                         // where you are right now {lat, lon, acc}; kept in memory only
let wx = readJSON(K_WEATHER);
let tab = 'map';
let pack = null, guide = null, eventsMeta = null, paperCfg = null, loadState = 'idle', loadedFor = '';
let places = [], byId = new Map(), placeByName = new Map(), events = [];
const origin = () => pos || me.town || { lat: PACKS[0].center[0], lon: PACKS[0].center[1] };
const packFor = (o) => PACKS.find((p) => o.lat > p.bbox[0] - 0.02 && o.lat < p.bbox[2] + 0.02 && o.lon > p.bbox[1] - 0.02 && o.lon < p.bbox[3] + 0.02) || null;

// ------------------------------------------------------------------ the real world
function sunTimes(lat, lon, d) {   // NOAA equations. {rise:null,set:null} in polar day or night
  const doy = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(d.getFullYear(), 0, 0)) / 864e5);
  const g = 2 * Math.PI / 365 * (doy - 1);
  const eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g)
    + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const la = lat * Math.PI / 180;
  const x = Math.cos(90.833 * Math.PI / 180) / (Math.cos(la) * Math.cos(decl)) - Math.tan(la) * Math.tan(decl);
  if (x < -1 || x > 1) return { rise: null, set: null };
  const ha = Math.acos(x) * 180 / Math.PI;
  const base = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return { rise: new Date(base + (720 - 4 * (lon + ha) - eq) * 60000), set: new Date(base + (720 - 4 * (lon - ha) - eq) * 60000) };
}
async function getWeather() {
  const o = origin(), t = Date.now();
  const key = `${o.lat.toFixed(1)},${o.lon.toFixed(1)}`;
  const w = readJSON(K_WEATHER);
  if (w && w.key === key && t - w.at < 2700e3) return w;
  try {
    const q = new URLSearchParams({ latitude: o.lat.toFixed(2), longitude: o.lon.toFixed(2),
      current: 'temperature_2m,weather_code,wind_speed_10m', temperature_unit: 'fahrenheit', wind_speed_unit: 'mph' });
    const cur = (await fetchJSON('https://api.open-meteo.com/v1/forecast?' + q, {}, 8000)).current;
    const n = { key, at: t, temp: Math.round(cur.temperature_2m), code: cur.weather_code, wind: Math.round(cur.wind_speed_10m) };
    n.text = WMO[n.code] || 'weather';
    n.rough = n.code >= 51 || n.temp < 25 || n.temp > 97 || n.wind > 30;
    writeJSON(K_WEATHER, n);
    return n;
  } catch { return w && w.key === key && t - w.at < 6 * 3600e3 ? w : null; }
}
async function geocode(text) {
  let [name, qual = ''] = text.split(',').map((s) => s.trim());
  qual = US[qual.toUpperCase()] || qual;
  const res = (await fetchJSON('https://geocoding-api.open-meteo.com/v1/search?' +
    new URLSearchParams({ name, count: 20, language: 'en' }))).results || [];
  let r = res;
  if (qual) {
    const q = qual.toLowerCase();
    r = res.filter((x) => [x.admin1, x.country, x.country_code].some((v) => String(v || '').toLowerCase() === q));
  }
  if (!r.length) return null;
  const best = r.reduce((a, b) => ((b.population || 0) > (a.population || 0) ? b : a));
  return { name: best.name, admin: best.admin1 || best.country || '', lat: best.latitude, lon: best.longitude };
}
async function reverseName(p) {    // a name for "where I am"; coordinates rounded to about half a mile
  try {
    const j = await fetchJSON('https://nominatim.openstreetmap.org/reverse?' +
      new URLSearchParams({ format: 'jsonv2', zoom: 10, lat: p.lat.toFixed(2), lon: p.lon.toFixed(2) }), {}, 8000);
    const a = j.address || {};
    return { name: a.city || a.town || a.village || a.county || 'Your area', admin: a.state || a.country || '' };
  } catch { return { name: 'Your area', admin: '' }; }
}
function setPos(p) { pos = { lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy || 0 }; return pos; }
function locate(timeout = 8000, precise = false) {
  return new Promise((res) => {
    if (!navigator.geolocation) return res(null);
    navigator.geolocation.getCurrentPosition((p) => res(setPos(p)), () => res(null),
      { enableHighAccuracy: precise, timeout, maximumAge: precise ? 10000 : 300000 });
  });
}
let watchId = null;
function startWatch() {            // follow you while the app is open, so the map keeps up and places you reach get stamped
  if (watchId !== null || !me.useLocation || !navigator.geolocation || document.hidden) return;
  watchId = navigator.geolocation.watchPosition((p) => { setPos(p); onMove(); }, () => {},
    { enableHighAccuracy: true, maximumAge: 15000, timeout: 30000 });
}
function stopWatch() { if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; } }
function onMove() {
  const got = stampNear();
  if (got.length) toast(`Been there: ${got[0].name}${got.length > 1 ? ` and ${got.length - 1} more` : ''}`);
  if (tab === 'map' && map) { moveMe(); if (got.length) drawMarkers(); }
}
function stampNear() {             // standing at a place marks it "been there"
  if (!pos || pos.acc > 100) return [];
  const got = [];
  for (const p of places) {
    if (me.been[p.id] || Math.abs(p.lat - pos.lat) > 0.002 || Math.abs(p.lon - pos.lon) > 0.003) continue;
    if (metersBetween(pos, p) <= (WIDE.includes(p.kind) ? 120 : 45) + Math.min(pos.acc, 30)) { me.been[p.id] = dayKey(); got.push(p); }
  }
  if (got.length) save();
  return got;
}

// ------------------------------------------------------------------ data: a county pack, or a live lookup around you
function setPlaces(rows) {
  places = rows.map(([kind, name, lat, lon, x = {}]) => ({ id: `${kind}:${name}@${lat.toFixed(4)},${lon.toFixed(4)}`, kind, name, lat, lon,
    addr: x.a || '', web: x.w || '', phone: x.p || '', hours: x.h || '', extra: x.x || '', g: GROUP_OF[kind] })).filter((p) => p.g);
  byId = new Map(places.map((p) => [p.id, p]));
  placeByName = new Map();
  places.forEach((p) => { const k = p.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); if (!placeByName.has(k)) placeByName.set(k, p); });
  if (me.carry) {                                         // places found in the game count as "been there"
    const names = new Set(me.carry);
    places.forEach((p) => { if (names.has(p.name) && !me.been[p.id]) me.been[p.id] = dayKey(); });
    delete me.carry; save();
  }
}
const withTimes = (e) => {
  const S = parseLocal(e.s);
  const E = e.e ? parseLocal(e.e) : e.ad ? addDays(S, 1) : new Date(S.getTime() + (e.mine ? 5400e3 : 3600e3));
  return { ...e, S, E: E > S ? E : new Date(S.getTime() + 3600e3) };
};
function setEvents(rows) { events = (rows || []).map(withTimes); }
function overpass(q, timeout) {   // ask one map server; if it is slow or down, ask the next too. First good answer wins
  return new Promise((resolve, reject) => {
    let i = 0, pending = 0, won = false, timer;
    const next = () => {
      clearTimeout(timer);
      if (won || i >= OVERPASS.length) return;
      const url = OVERPASS[i++];
      pending++;
      fetchJSON(url, { method: 'POST', body: 'data=' + encodeURIComponent(q),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }, timeout)
        .then((j) => { if (!Array.isArray(j.elements)) throw new Error('bad answer'); pending--; if (!won) { won = true; clearTimeout(timer); resolve(j.elements); } })
        .catch(() => { pending--; if (won) return; if (i < OVERPASS.length) next(); else if (!pending) reject(new Error("the map servers didn't answer")); });
      timer = setTimeout(next, 5000);
    };
    next();
  });
}
async function liveRows(o) {       // no pack here: read what's within about two miles from OpenStreetMap
  const c = readJSON(K_LIVE);
  if (c && km(c.lat, c.lon, o.lat, o.lon) < 1.5 && Date.now() - c.at < 14 * 864e5) return c.rows;
  const a = `(around:3500,${o.lat.toFixed(3)},${o.lon.toFixed(3)})`;
  const sel = ['["leisure"~"^(park|nature_reserve|garden|playground|dog_park|sports_centre|stadium|fitness_centre|swimming_pool|pitch|track|ice_rink|golf_course)$"]',
    '["amenity"~"^(library|community_centre|social_centre|place_of_worship|social_facility|theatre|cinema|arts_centre|music_venue|events_venue|cafe|restaurant|bar|pub|biergarten|marketplace|townhall|courthouse|police|fire_station|post_office|school|college|university|pharmacy|hospital|clinic|bank|toilets|drinking_water|bicycle_rental|bus_station)$"]',
    '["club"]', '["office"~"^(association|ngo|government|charity|foundation)$"]', '["tourism"~"^(museum|gallery|artwork|attraction|viewpoint)$"]',
    '["historic"~"^(memorial|monument)$"]["name"]', '["shop"~"^(bakery|supermarket|greengrocer|laundry|dry_cleaning|hardware|doityourself|bicycle|books)$"]',
    '["railway"="station"]'];
  const els = await overpass(`[out:json][timeout:40];(${sel.map((s) => `nwr${s}${a};`).join('')});out center tags 4000;`, 45000);
  const seen = new Set(), rows = [];
  for (const e of els) {
    const t = e.tags || {};
    const rule = LIVE_RULES.find(([k, re]) => t[k] && re.test(t[k]));
    const lat = e.lat || (e.center && e.center.lat), lon = e.lon || (e.center && e.center.lon);
    if (!rule || !lat || t.access === 'private') continue;
    const kind = rule[2] === 'rail' && (t.station === 'subway' || t.subway === 'yes') ? 'metro' : rule[2];
    const name = t.name || (rule[3] ? '' : NAMELESS[kind] || '');
    const key = `${kind}|${name}|${lat.toFixed(3)},${lon.toFixed(3)}`;
    if (!name || seen.has(key)) continue;
    seen.add(key);
    const x = {};
    if (t['addr:street']) x.a = [t['addr:housenumber'], t['addr:street']].filter(Boolean).join(' ');
    if (/^https?:/.test(t.website || '')) x.w = t.website;
    if (t.phone) x.p = t.phone;
    if (t.opening_hours) x.h = t.opening_hours;
    rows.push([kind, name, +lat.toFixed(5), +lon.toFixed(5), x]);
  }
  writeJSON(K_LIVE, { lat: o.lat, lon: o.lon, at: Date.now(), rows });
  return rows;
}
const liveKey = (o) => `live:${o.lat.toFixed(2)},${o.lon.toFixed(2)}`;
let loadJob = null;
function loadData(force) {         // one load at a time; picks the pack for where you are
  const o = origin(), p = packFor(o);
  const key = p ? p.id : liveKey(o);
  if (loadJob) return loadJob;
  if (!force && key === loadedFor && places.length) return Promise.resolve();
  loadState = 'loading';
  loadJob = (async () => {
    try {
      if (p) {
        const base = `data/${p.id}/`;
        const [pl, ev, gd, pp] = await Promise.all([fetchJSON(base + 'places.json', {}, 30000),
          fetchJSON(base + 'events.json', {}, 30000).catch(() => null), fetchJSON(base + 'guide.json', {}, 30000).catch(() => null),
          fetchJSON(base + 'paper.json', {}, 30000).catch(() => null)]);
        pack = p; guide = gd; paperCfg = pp; eventsMeta = ev ? { at: ev.at, sources: ev.sources } : null;
        setPlaces(pl.places); setEvents(ev && ev.events);
      } else {
        pack = null; guide = null; paperCfg = null; eventsMeta = null;
        setPlaces(await liveRows(o)); setEvents([]);
      }
      loadedFor = key; loadState = 'ready'; liveAt = 0;
    } catch (e) { loadState = places.length ? 'ready' : 'failed'; }
    loadJob = null; mapFresh = true; render(); refreshLive();
  })();
  return loadJob;
}

// ------------------------------------------------------------------ events and plans
const planFor = (id) => me.plans.find((p) => p.id === id);
function allEvents() {             // the public calendars plus your own plans, soonest first
  const mine = me.plans.map(withTimes);
  const ids = new Set(mine.map((e) => e.id));
  return [...mine, ...events.filter((e) => !ids.has(e.id))].sort((a, b) => a.S - b.S);
}
const findEvent = (id) => allEvents().find((e) => e.id === id);
function rangeOf(r) {
  const t = now(), d0 = startOfDay(t);
  if (r === 'today') return [t, addDays(d0, 1)];
  if (r === 'tomorrow') return [addDays(d0, 1), addDays(d0, 2)];
  if (r === 'weekend') { const wd = t.getDay(), sat = wd === 0 ? addDays(d0, -1) : addDays(d0, 6 - wd); return [wd === 0 || wd === 6 ? t : sat, addDays(sat, 2)]; }
  if (r === 'week') return [t, addDays(d0, 8)];
  return [t, addDays(d0, 400)];
}
const inRange = (e, [a, b]) => e.E > a && e.S < b;
function whenText(e, long) {
  const day = e.S.toLocaleDateString([], long ? { weekday: 'long', month: 'long', day: 'numeric' } : { weekday: 'short', month: 'short', day: 'numeric' });
  if (e.ad) { const last = new Date(e.E.getTime() - 60000); return dayKey(last) !== dayKey(e.S) ? `${day} to ${last.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}` : `${day} · all day`; }
  return `${day} · ${clock(e.S)}${e.e ? ' – ' + clock(e.E) : ''}`;
}
const eventsAt = (p) => allEvents().filter((e) => e.E > now() && e.lat != null && Math.abs(e.lat - p.lat) < 0.0008 && Math.abs(e.lon - p.lon) < 0.001);
const catOf = (e) => (e.mine ? 'mine' : e.c);
function icsFor(e) {
  const f = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const clean = (s) => String(s || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Daylight//EN', 'BEGIN:VEVENT', `UID:${e.id}@daylight`, `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(e.S)}`, `DTEND:${f(e.E)}`, `SUMMARY:${clean(e.t)}`, `LOCATION:${clean([e.v, e.a].filter(Boolean).join(', '))}`,
    `DESCRIPTION:${clean([e.d || e.n, e.u].filter(Boolean).join(' '))}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}
const b64 = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
const inviteLink = (e) => `${location.origin}${location.pathname}#m=${b64(JSON.stringify({ t: e.t, s: e.s, v: e.v || '', lat: e.lat, lon: e.lon, n: e.n || '', u: e.u || '' }))}`;

// ------------------------------------------------------------------ sky
const STARS = [[22, 18], [58, 44], [96, 12], [131, 58], [170, 26], [205, 8], [238, 49], [272, 20], [301, 62], [333, 30], [362, 12], [78, 78], [318, 88], [190, 70]];
const ARC = { x0: 34, x1: 356, base: 112, h: 84 };
const arcXY = (f) => [ARC.x0 + (ARC.x1 - ARC.x0) * f, ARC.base - Math.sin(Math.PI * f) * ARC.h];
function arcPath(a, b) {
  const pts = [];
  for (let i = 0; i <= 24; i++) { const [x, y] = arcXY(a + (b - a) * i / 24); pts.push(`${x.toFixed(1)},${y.toFixed(1)}`); }
  return 'M' + pts.join('L');
}
let lightMsg = '';
function renderSky() {
  const el = $('#sky');
  if (!me.town) { el.innerHTML = ''; return; }
  const t = now(), o = origin(), { rise, set } = sunTimes(o.lat, o.lon, t);
  let f = null, phase = 'day', msg = 'No sunrise or sunset here today.', short = '';
  if (rise) {
    f = (t - rise) / (set - rise);
    const near = (d) => Math.abs(t - d) < 40 * 60000;
    phase = near(rise) ? 'dawn' : near(set) ? 'dusk' : f > 0 && f < 1 ? 'day' : 'night';
    const hm = (ms) => `${Math.floor(ms / 3600e3)}h ${pad(Math.floor(ms % 3600e3 / 60000))}m`;
    if (f < 0) { msg = `First light in ${hm(rise - t)}`; short = msg; }
    else if (f > 1) {
      const r2 = sunTimes(o.lat, o.lon, addDays(t, 1)).rise;
      msg = `The sun is down. First light ${r2 ? clock(r2) : 'tomorrow'}.`; short = `sun up ${r2 ? clock(r2) : 'tomorrow'}`;
    } else { msg = `${hm(set - t)} of light left`; short = `${hm(set - t)} of light`; }
  }
  lightMsg = msg;
  const up = f === null || (f >= 0 && f <= 1);
  const root = document.documentElement;
  root.dataset.theme = up ? 'light' : 'dark';
  root.dataset.phase = phase;
  root.dataset.wx = wx && (wx.code >= 3 || wx.rough) ? 'grey' : 'clear';
  const top = { night: '#0b1026', dawn: '#27356b', dusk: '#25275c', day: root.dataset.wx === 'grey' ? '#5d7186' : '#2f8fdf' }[phase];
  $('meta[name="theme-color"]').setAttribute('content', top);
  let art = '';
  if (rise) {
    const fc = Math.min(1, Math.max(0, f)), [sx, sy] = arcXY(fc);
    if (!up) {
      art += STARS.map(([x, y]) => `<circle class="star" cx="${x}" cy="${y}" r="1.2" fill="#fff"/>`).join('');
      art += `<path d="${arcPath(0, 1)}" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1.5" stroke-dasharray="2 6"/>`;
      art += `<g transform="translate(316 30)"><circle r="13" fill="#f3ecd2"/><circle cx="6" cy="-4" r="11.5" fill="#141a3c"/></g>`;
    } else {
      art += `<path d="${arcPath(fc, 1)}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.5" stroke-dasharray="2 6"/>`;
      art += `<path d="${arcPath(0, fc)}" fill="none" stroke="#ffd766" stroke-width="3" stroke-linecap="round"/>`;
      art += `<circle class="sun-glow" cx="${sx}" cy="${sy}" r="22" fill="#ffe08a" opacity=".38"/>`;
      art += `<circle cx="${sx}" cy="${sy}" r="11" fill="#fff3c4" stroke="#ffc94a" stroke-width="3"/>`;
    }
    art += `<line x1="14" x2="376" y1="${ARC.base}" y2="${ARC.base}" stroke="rgba(255,255,255,.5)" stroke-width="1"/>`;
    art += `<text x="${ARC.x0}" y="${ARC.base + 17}" text-anchor="middle" font-size="12" fill="#fff">${clock(rise)}</text>`;
    art += `<text x="${ARC.x1}" y="${ARC.base + 17}" text-anchor="middle" font-size="12" fill="#fff">${clock(set)}</text>`;
  }
  const where = pack ? `${pack.name}, ${pack.admin}` : `${me.town.name}${me.town.admin ? ', ' + me.town.admin : ''}`;
  const full = tab === 'guide';
  const alert = paper && paper.key === paperKey() && paper.nws && paper.nws.alerts[0];
  const line = alert ? `⚠ ${alert.event}` : full ? t.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
    : [t.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }), short, wx ? `${wx.temp}°` : ''].filter(Boolean).join('  ·  ');
  el.innerHTML = `
    <div class="sky-top"><span class="wordmark">DAYLIGHT</span>
      <span class="sky-date${alert ? ' alert' : ''}"${alert ? ' data-act="tab" data-tab="paper"' : ''}>${esc(line)}</span>
      <button class="gear" data-act="settings" aria-label="Settings">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>
      </button></div>
    <svg class="arc" viewBox="0 0 390 134" aria-hidden="true">${art}</svg>
    <div class="sky-msg">${esc(msg)}</div>
    <div class="sky-sub">${esc(wx ? `${wx.temp}°F, ${wx.text}` : 'weather unavailable')}  ·  ${esc(where)}</div>`;
  el.classList.toggle('compact', !full);
}

// ------------------------------------------------------------------ views
function viewWelcome() {
  return `<div class="welcome">
    <h1>DAYLIGHT</h1>
    <p class="tag">A companion for where you live.</p>
    <ul class="steps">
      <li>Every park, club, library and office near you, on one map.</li>
      <li>What's happening this week, from the calendars that publish it.</li>
      <li>A plain guide to getting things done in your county.</li>
      <li>Your circles, your plans, the places you've been.</li>
    </ul>
    <button class="primary" data-act="ob-locate">Use my location</button>
    <div class="or">or type your town</div>
    <form data-form="town"><input name="town" placeholder="Arlington, VA" autocomplete="off" enterkeyhint="go"><button>Go</button></form>
    <div class="err" id="ob-err"></div>
    <p class="fine">No account. What you save stays in this browser. Your location is used on this device to sort what's near you.</p>
  </div>`;
}
function eventRow(e) {
  const [label, color] = ECAT[catOf(e)] || ['Event', '#6b7280'];
  const sub = [e.v, e.r, distLabel(e)].filter(Boolean).join(' · ');
  return `<li><button class="row" style="--c:${color}" data-act="event" data-id="${esc(e.id)}">
    <span class="when"><b>${e.ad ? 'All day' : esc(clock(e.S))}</b>${esc(e.S.toLocaleDateString([], { weekday: 'short' }))}</span>
    <span class="main"><b>${esc(e.t)}</b><small>${esc(sub || e.who || e.g || '')}</small></span>
    <span class="tag">${esc(label)}${planFor(e.id) && !e.mine ? ' ★' : ''}</span></button></li>`;
}
function placeRow(p) {
  const sub = [KIND[p.kind], p.extra || p.addr, distLabel(p)].filter(Boolean).join(' · ');
  return `<li><button class="row" style="--c:${p.g.color}" data-act="place" data-id="${esc(p.id)}">
    <span class="main"><b>${esc(p.name)}</b><small>${esc(sub)}</small></span><span class="go">›</span></button></li>`;
}
let range = 'today', ecat = 'all', eq = '', eshow = 80;
function viewEvents() {
  const q = eq.trim().toLowerCase(), t = now();
  const list = allEvents().filter((e) => inRange(e, rangeOf(range)) && (ecat === 'all' || catOf(e) === ecat || (ecat === 'mine' && planFor(e.id)))
    && (!q || `${e.t} ${e.v || ''} ${e.g || ''} ${e.who || ''}`.toLowerCase().includes(q)));
  const pills = [['today', 'Today'], ['tomorrow', 'Tomorrow'], ['weekend', 'Weekend'], ['week', '7 days'], ['all', 'All']]
    .map(([k, l]) => `<button class="pill${range === k ? ' on' : ''}" data-act="range" data-k="${k}">${l}</button>`).join('');
  const cats = [['all', 'Everything'], ['library', 'Library'], ['schools', 'Schools'], ['community', 'Community'], ['mine', 'My plans']]
    .map(([k, l]) => `<button class="pill soft${ecat === k ? ' on' : ''}" data-act="ecat" data-k="${k}">${l}</button>`).join('');
  let body = '', day = '';
  for (const e of list.slice(0, eshow)) {
    const d = e.S < t ? t : e.S, k = dayKey(d);
    if (k !== day) { if (day) body += '</ul>'; day = k; body += `<div class="dayhead">${esc(d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }))}</div><ul class="rows">`; }
    body += eventRow(e);
  }
  if (day) body += '</ul>';
  if (list.length > eshow) body += `<button class="ghost" data-act="more-events">Show more (${list.length - eshow} left)</button>`;
  if (!list.length) body = `<p class="empty">${loadState === 'loading' ? 'Loading the calendars…' : !pack ? 'There are no public calendars for this area yet. Your own plans still show here.' : 'Nothing listed for this window. Try a wider one.'}</p>`;
  const src = eventsMeta ? `<h2 class="sec">Where this comes from</h2>
    <p class="fine">${eventsMeta.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a> (${s.ok ? s.n : 'not reachable'}${s.liveAt ? ', live at ' + esc(clock(new Date(s.liveAt))) : ''})`).join(', ')}.
    Calendars marked live were read by your phone just now; the others were last read ${esc(new Date(eventsMeta.at).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }))}.
    Always check the organizer's page before you go. <span class="ev" data-act="refresh" style="text-decoration:underline;cursor:pointer">Refresh now</span></p>` : '';
  const more = guide && guide.calendars ? `<h2 class="sec">More calendars <span>open on their own sites</span></h2><ul class="rows">${guide.calendars.map(linkRow).join('')}</ul>` : '';
  return `<button class="primary slim" data-act="meetup">Post a meetup</button>
    <input class="field" style="margin-top:10px" type="search" id="eq" placeholder="Search what's happening" value="${esc(eq)}" autocomplete="off">
    <div class="pills">${pills}</div><div class="pills">${cats}</div>
    <h2 class="sec">${esc(plural(list.length, 'thing'))} <span>${esc({ today: 'rest of today', tomorrow: 'tomorrow', weekend: 'this weekend', week: 'next 7 days', all: 'next two months' }[range])}</span></h2>
    ${body}${src}${more}`;
}
function linkRow(i) {
  const tel = i.u.startsWith('tel:');
  return `<li><div class="row" style="--c:${tel ? 'var(--warn)' : 'var(--line)'}">
    <a class="main" href="${esc(i.u)}"${tel ? '' : ' target="_blank" rel="noopener"'} style="text-decoration:none"><b>${esc(i.t)}</b>${i.d ? `<small style="white-space:normal">${esc(i.d)}</small>` : ''}</a>
    ${i.near && places.some((p) => p.kind === i.near) ? `<button class="near" data-act="nearest" data-kind="${esc(i.near)}">Nearest</button>` : '<span class="go">›</span>'}</div></li>`;
}
function viewGuide() {
  const today = allEvents().filter((e) => inRange(e, rangeOf('today'))).slice(0, 3);
  const quick = QUICK.filter(([k]) => places.some((p) => p.kind === k)).map(([k, label]) =>
    `<button data-act="nearest" data-kind="${k}" style="--k:${GROUP_OF[k].color}"><i></i>${esc(label)}</button>`).join('');
  const nowCard = `<div class="now"><b class="big">${esc(lightMsg)}</b>
    <p>${esc(wx ? `${wx.temp}°F and ${wx.text}${wx.rough ? '. Rough out; plan for indoors.' : '.'}` : 'Weather unavailable right now.')}</p>
    ${quick ? `<p style="margin-top:12px">Nearest to you:</p><div class="quick" style="margin-top:6px">${quick}</div>` : ''}</div>`;
  const next = today.length ? `<h2 class="sec">Next up today <span data-act="tab" data-tab="events" style="cursor:pointer">all ›</span></h2><ul class="rows">${today.map(eventRow).join('')}</ul>` : '';
  const secs = guide ? guide.sections.map((s) => `<h2 class="sec">${esc(s.t)}</h2><ul class="rows">${s.items.map(linkRow).join('')}</ul>`).join('')
    : `<p class="empty">${loadState === 'loading' ? 'Loading…' : 'There is no county guide for this area yet. The map and the nearest-place buttons work everywhere.'}</p>`;
  const foot = guide ? `<p class="fine" style="margin-top:18px">Links go to the official pages of ${esc(guide.name)} and the organizations named. Daylight is not affiliated with them.</p>` : '';
  return `<h2 class="sec">Right now</h2>${nowCard}${next}${secs}${foot}`;
}
function viewMine() {
  const upcoming = allEvents().filter((e) => planFor(e.id) && e.E > now());
  const plans = upcoming.length ? `<ul class="rows">${upcoming.map(eventRow).join('')}</ul>` : '<p class="empty">Nothing planned. Save something from Happening, or post a meetup.</p>';
  const count = (c) => c.people.split(',').filter((x) => x.trim()).length;
  const circles = me.circles.length ? `<ul class="rows">${me.circles.map((c) => `<li><button class="row" style="--c:#8a52d9" data-act="circle" data-id="${esc(c.id)}">
      <span class="main"><b>${esc(c.name)}</b><small>${esc([c.people ? (count(c) === 1 ? '1 person' : `${count(c)} people`) : '', c.spot, c.when].filter(Boolean).join(' · ') || 'Add people, a usual spot and a usual time')}</small></span>
      <span class="go">›</span></button></li>`).join('')}</ul>` : '<p class="empty">A circle is a group you want to keep seeing: the running friends, the book club, the neighbors.</p>';
  const saved = places.filter((p) => me.saved[p.id]);
  if (pos) saved.sort((a, b) => metersBetween(pos, a) - metersBetween(pos, b));
  const been = GROUPS.map(([id, title, color]) => {
    const all = places.filter((p) => p.g.id === id), n = all.filter((p) => me.been[p.id]).length;
    return all.length ? `<div class="stat" style="--k:${color}"><b>${esc(title)}</b><span>${n} of ${all.length}</span><div class="bar"><i style="width:${Math.max(n ? 2 : 0, n / all.length * 100).toFixed(1)}%"></i></div></div>` : '';
  }).join('');
  return `<h2 class="sec">My plans <span>${upcoming.length || ''}</span></h2>${plans}
    <button class="ghost" data-act="meetup">Post a meetup</button>
    <h2 class="sec">My circles</h2>${circles}
    <button class="ghost" data-act="circle" data-id="">New circle</button>
    <h2 class="sec">Saved places <span>${saved.length || ''}</span></h2>
    ${saved.length ? `<ul class="rows">${saved.map(placeRow).join('')}</ul>` : '<p class="empty">Tap any place on the map and save it.</p>'}
    <h2 class="sec">Where I've been <span>${plural(places.filter((p) => me.been[p.id]).length, 'place')}</span></h2>
    ${been || '<p class="empty">Places you stand at while Daylight is open get stamped here.</p>'}
    <h2 class="sec">More</h2>
    <ul class="rows"><li><a class="row" style="--c:var(--sun)" href="game/"><span class="main"><b>The daily five</b><small style="white-space:normal">The original Daylight game: five small missions a day.</small></span><span class="go">›</span></a></li></ul>
    <button class="ghost" data-act="settings">Settings and privacy</button>`;
}
function render() {
  const ob = !me.town;
  $('#app').classList.toggle('onboarding', ob);
  renderSky();
  markTabs();
  const onMap = !ob && tab === 'map';
  $('#mapwrap').hidden = !onMap;
  $('#view').hidden = onMap;
  if (ob) { $('#view').innerHTML = viewWelcome(); return; }
  if (onMap) return showMap();
  const keep = $('#view').dataset.tab === tab ? $('#view').scrollTop : 0;
  $('#view').innerHTML = tab === 'paper' ? viewPaper() : tab === 'events' ? viewEvents() : tab === 'guide' ? viewGuide() : viewMine();
  $('#view').dataset.tab = tab;
  $('#view').scrollTop = keep;
}

// ------------------------------------------------------------------ staying current
// Nothing is pushed to the phone. Daylight asks again each time it is opened, and every five minutes while it stays open.
const APP_V = 7;
const K_BIKES = 'daylight.bikes';
let liveAt = 0, liveJob = null, vCheckAt = 0, vToasted = false, bikeStatus = null, newSince = 0;
const normName = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const typingNow = () => ['INPUT', 'TEXTAREA', 'SELECT'].includes((document.activeElement || {}).tagName);

async function tribeLive(src) {    // a calendar that publishes The Events Calendar's JSON feed and lets a browser read it
  const out = [], until = dayKey(addDays(now(), 60));
  for (let page = 1; page <= 3; page++) {
    const q = new URLSearchParams({ per_page: 50, page, start_date: 'now', end_date: `${until} 23:59:59`, via: location.host });
    const j = await fetchJSON(`${src.live.base}/wp-json/tribe/events/v1/events?${q}`, {}, 10000);
    for (const r of j.events || []) {
      const v = r.venue && !Array.isArray(r.venue) ? r.venue : {};
      const e = { id: src.live.prefix + r.id, t: plain(r.title).slice(0, 120), s: String(r.start_date).replace(' ', 'T').slice(0, 16),
        e: String(r.end_date || '').replace(' ', 'T').slice(0, 16), u: r.url, c: src.live.cat, src: src.id, d: firstSentences(plain(r.description), 260) };
      if (r.all_day) e.ad = true;
      if (v.venue) e.v = plain(v.venue).slice(0, 80);
      if (v.address) e.a = plain(v.address).slice(0, 80);
      const g = (r.categories || [])[0];
      if (g && g.name) e.g = plain(g.name).slice(0, 40);
      const la = parseFloat(v.geo_lat), lo = parseFloat(v.geo_lng), hit = e.v ? placeByName.get(normName(e.v)) : null;
      if (isFinite(la) && isFinite(lo) && (la || lo)) { e.lat = +la.toFixed(5); e.lon = +lo.toFixed(5); }
      else if (hit) { e.lat = hit.lat; e.lon = hit.lon; }
      if (e.t && /^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(e.s) && /^https?:\/\//.test(e.u || '')) out.push(e);
    }
    if (page >= (j.total_pages || 1)) break;
  }
  return out;
}
function refreshLive(force) {      // re-read the calendars that answer a phone directly; the others keep their last snapshot
  if (liveJob) return liveJob;
  const srcs = ((eventsMeta && eventsMeta.sources) || []).filter((s) => s.live && s.live.type === 'tribe');
  if (!srcs.length || (!force && Date.now() - liveAt < 30 * 60000)) return Promise.resolve();
  liveJob = Promise.all(srcs.map((s) => tribeLive(s).then((list) => ({ s, list })).catch(() => null))).then((got) => {
    let changed = false;
    for (const g of got) {
      if (!g || (!g.list.length && g.s.n > 3)) continue;      // an empty answer from a busy calendar is more likely a hiccup than the truth
      events = events.filter((e) => e.src !== g.s.id).concat(g.list.map(withTimes));
      g.s.n = g.list.length; g.s.ok = true; g.s.liveAt = Date.now(); changed = true;
    }
    liveAt = Date.now();
    if (changed && $('#sheet').hidden && !typingNow()) { if (tab === 'map') { drawMarkers(); renderDeck(); } else render(); }
  }).finally(() => { liveJob = null; });
  return liveJob;
}
async function checkVersion() {    // a newer Daylight has shipped: load it, unless you are in the middle of something
  if (Date.now() - vCheckAt < 10 * 60000) return;
  vCheckAt = Date.now();
  try {
    const j = await fetchJSON('version.json?t=' + Date.now(), { cache: 'no-store' }, 6000);
    if (!(j.v > APP_V)) return;
    if (!$('#sheet').hidden || typingNow()) { vCheckAt = 0; return; }
    if (sessionStorage.getItem('daylight.tried') === String(j.v)) { if (!vToasted) { vToasted = true; toast('A new version is ready. Close and reopen Daylight.'); } return; }
    sessionStorage.setItem('daylight.tried', String(j.v));
    location.replace(`${location.pathname}?u=${j.v}${location.hash}`);
  } catch { /* offline, or no version file */ }
}
async function bikesAt(p) {        // live counts for one bikeshare dock, from the system's open feed
  const cfg = pack && paperCfg && paperCfg.bikeshare;
  if (!cfg) return null;
  let info = readJSON(K_BIKES);
  if (!info || info.id !== pack.id || Date.now() - info.at > 7 * 864e5) {
    const j = await fetchJSON(cfg.info, {}, 15000), b = pack.bbox;
    info = { id: pack.id, at: Date.now(), st: j.data.stations.filter((s) => s.lat > b[0] - 0.03 && s.lat < b[2] + 0.03 && s.lon > b[1] - 0.03 && s.lon < b[3] + 0.03)
      .map((s) => [s.station_id, +s.lat.toFixed(5), +s.lon.toFixed(5), s.name]) };
    writeJSON(K_BIKES, info);
  }
  let best = null, near = 90;
  for (const s of info.st) { const d = km(p.lat, p.lon, s[1], s[2]) * 1000; if (d < near) { near = d; best = s; } }
  if (!best) return null;
  if (!bikeStatus || Date.now() - bikeStatus.at > 90000) {
    const j = await fetchJSON(cfg.status, {}, 15000);
    bikeStatus = { at: Date.now(), map: new Map(j.data.stations.map((s) => [s.station_id, s])) };
  }
  const s = bikeStatus.map.get(best[0]);
  return s ? { name: best[3], bikes: s.num_bikes_available || 0, ebikes: s.num_ebikes_available || 0, docks: s.num_docks_available || 0,
    open: s.is_renting !== 0 && s.is_installed !== 0, at: (s.last_reported || 0) * 1000, by: cfg.name } : null;
}
function showBikes(p) {
  bikesAt(p).then((b) => {
    const el = $('#livebox');
    if (!el || el.dataset.id !== p.id) return;
    el.innerHTML = !b ? 'No live count for this dock.' : !b.open ? '<b>This dock is out of service right now.</b>'
      : `<b>${esc(plural(b.bikes, 'bike'))}</b>${b.ebikes ? ` (${b.ebikes} electric)` : ''} · <b>${esc(plural(b.docks, 'open dock'))}</b>
        <span class="fine">${esc(b.by)}${b.at ? ' · ' + esc(clock(new Date(b.at))) : ''}</span>`;
  }).catch(() => { const el = $('#livebox'); if (el && el.dataset.id === p.id) el.textContent = 'The live count could not be reached.'; });
}
const paperUnread = () => !!paper && paper.key === paperKey() && (paper.posts.some((x) => x.at > (me.paperRead || 0)) || !!(paper.nws && paper.nws.alerts.length));
function markTabs() {
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
  const pt = $('#tabs [data-tab="paper"]');
  if (pt) pt.classList.toggle('dot', tab !== 'paper' && paperUnread());
}
function openPaper() { newSince = me.paperRead || 0; me.paperRead = Date.now(); save(); }

// ------------------------------------------------------------------ the paper
// A daily front page with no writer: every line is taken from a named source and laid out by rule.
let paper = readJSON(K_PAPER), paperJob = null;
const PROVERBS = [33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29, 30, 31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31];   // verses per chapter
const plain = (h) => { const d = document.createElement('textarea'); d.innerHTML = String(h || '').replace(/<[^>]+>/g, ' '); return d.value.replace(/\s+/g, ' ').trim(); };
function firstSentences(text, max = 210) {       // the opening of an excerpt, ending on a whole sentence whenever there is one
  const cutOff = /(\[…\]|\[\.\.\.\]|…|\.\.\.|Read more.*|Continue reading.*)$/i.test(text.trim());
  const t = text.replace(/\s*(\[…\]|\[\.\.\.\]|…|\.\.\.|Read more.*|Continue reading.*)$/i, '').trim();
  if (t.length <= max && !cutOff) return t;
  let end = -1;                                   // a sentence end: two lowercase letters or digits, a stop, then a capital (so "U.S." and "St." don't count)
  for (const m of t.matchAll(/[a-z0-9)][a-z0-9)”"’']*[.!?]["”’']?(?=\s+[A-Z“"0-9])/g)) { const i = m.index + m[0].length; if (i <= max && (m[0].length > 2 || m[0][0] === ')')) end = i; }
  if (end > 50) return t.slice(0, end);
  const cut = t.slice(0, max);
  return (t.length > max ? cut.slice(0, cut.lastIndexOf(' ')) : t) + '…';
}
const paperSpot = () => (pack ? { lat: pack.center[0], lon: pack.center[1] } : { lat: +origin().lat.toFixed(2), lon: +origin().lon.toFixed(2) });
const paperKey = () => `${pack ? pack.id : liveKey(paperSpot())}|${dayKey()}|${me.verse === false ? 0 : 1}`;

async function wpPosts(src) {      // a WordPress site's own public post list
  const rows = await fetchJSON(`${src.rest}/wp-json/wp/v2/posts?per_page=${(src.n || 4) * 2}&_fields=title,link,date_gmt,excerpt${src.query ? '&' + src.query : ''}&via=${encodeURIComponent(location.host)}`, {}, 8000);   // "via" keeps a shared cache from handing us an answer addressed to another site
  const skip = src.skip ? new RegExp(src.skip, 'i') : null, oldest = Date.now() - (src.days || 7) * 864e5;
  return rows.map((p) => ({ t: plain(p.title && p.title.rendered), x: firstSentences(plain(p.excerpt && p.excerpt.rendered)), u: p.link,
    at: Date.parse(p.date_gmt + 'Z'), src: src.name, role: src.role }))
    .filter((p) => p.t && /^https:\/\//.test(p.u || '') && p.at > oldest && !(skip && skip.test(p.t))).slice(0, src.n || 4);
}
async function nwsReport(c) {      // the National Weather Service forecast and any active alerts (United States only)
  const pt = await fetchJSON(`https://api.weather.gov/points/${c.lat.toFixed(4)},${c.lon.toFixed(4)}`, {}, 9000);
  const [fc, al] = await Promise.all([fetchJSON(pt.properties.forecast, {}, 9000),
    fetchJSON(`https://api.weather.gov/alerts/active?point=${c.lat.toFixed(4)},${c.lon.toFixed(4)}`, {}, 9000).catch(() => null)]);
  return { at: Date.parse(fc.properties.updateTime || fc.properties.updated) || Date.now(),
    periods: fc.properties.periods.slice(0, 3).map((p) => ({ name: p.name, text: p.detailedForecast })),
    alerts: ((al && al.features) || []).slice(0, 3).map((f) => ({ event: f.properties.event, headline: f.properties.headline || f.properties.event })) };
}
async function dayNumbers(c) {
  const q = new URLSearchParams({ latitude: c.lat.toFixed(2), longitude: c.lon.toFixed(2), timezone: 'auto', forecast_days: 1,
    daily: 'temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max,wind_speed_10m_max', temperature_unit: 'fahrenheit', wind_speed_unit: 'mph' });
  const d = (await fetchJSON('https://api.open-meteo.com/v1/forecast?' + q, {}, 9000)).daily;
  return { hi: Math.round(d.temperature_2m_max[0]), lo: Math.round(d.temperature_2m_min[0]), uv: d.uv_index_max[0], rain: d.precipitation_probability_max[0], wind: Math.round(d.wind_speed_10m_max[0]) };
}
async function airNow(c) {
  const q = new URLSearchParams({ latitude: c.lat.toFixed(2), longitude: c.lon.toFixed(2), current: 'us_aqi', timezone: 'auto' });
  return Math.round((await fetchJSON('https://air-quality-api.open-meteo.com/v1/air-quality?' + q, {}, 9000)).current.us_aqi);
}
async function riverNow(r) {       // U.S. Geological Survey stream gauge: height and flow
  const j = await fetchJSON(`https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${encodeURIComponent(r.site)}&parameterCd=00065,00060`, {}, 9000);
  const out = { name: r.name };
  for (const ts of j.value.timeSeries) {
    const v = ts.values[0].value.slice(-1)[0], code = ts.variable.variableCode[0].value;
    if (!v) continue;
    if (code === '00065') out.ft = +v.value; else if (code === '00060') out.cfs = +v.value;
    out.at = Date.parse(v.dateTime);
  }
  return out.ft != null || out.cfs != null ? out : null;
}
async function tidesToday(t) {     // NOAA tide predictions for the day
  const q = new URLSearchParams({ product: 'predictions', application: 'daylight', date: 'today', station: t.station, interval: 'hilo',
    datum: 'MLLW', time_zone: 'lst_ldt', units: 'english', format: 'json' });
  const j = await fetchJSON('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?' + q, {}, 9000);
  return { name: t.name, list: (j.predictions || []).map((p) => ({ hi: p.type === 'H', at: p.t.replace(' ', 'T'), ft: +p.v })) };
}
async function verseOfDay() {      // Proverbs: the chapter is the day of the month, the passage changes each day of the year
  const d = now(), ch = d.getDate(), n = PROVERBS[ch - 1];
  const v = 1 + ((d.getFullYear() * 372 + d.getMonth() * 31 + ch) * 7) % (n - 1);
  const j = await fetchJSON(`https://bible-api.com/proverbs+${ch}:${v}-${v + 1}?translation=web`, {}, 9000);
  return j.text ? { ref: j.reference, text: j.text.replace(/\s+/g, ' ').trim() } : null;
}
function printPaper(force) {       // gather everything at once; a source that fails just leaves its space out
  if (paperJob) return paperJob;
  if (!force && paper && paper.key === paperKey() && Date.now() - paper.at < 30 * 60000) return Promise.resolve();
  const cfg = paperCfg || { news: [] }, c = paperSpot(), safe = (p) => p.catch(() => null);
  paperJob = Promise.all([Promise.all(cfg.news.map((s) => safe(wpPosts(s)))), safe(nwsReport(c)), safe(dayNumbers(c)), safe(airNow(c)),
    cfg.river ? safe(riverNow(cfg.river)) : null, cfg.tide ? safe(tidesToday(cfg.tide)) : null, me.verse === false ? null : safe(verseOfDay())])
    .then(([posts, nws, nums, aqi, river, tide, verse]) => {
      const got = posts.filter(Boolean).flat();
      if (!got.length && !nws && !nums && paper && paper.key === paperKey()) return;      // offline: keep the edition you have
      paper = { key: paperKey(), at: Date.now(), posts: got, missing: cfg.news.filter((s, i) => !posts[i]).map((s) => s.name), nws, nums, aqi, river, tide, verse };
      writeJSON(K_PAPER, paper);
    }).finally(() => { paperJob = null; if (tab === 'paper' && $('#sheet').hidden) render(); else { markTabs(); renderSky(); } });
  return paperJob;
}
function moonText(d) {
  const syn = 29.530588853, age = ((((d - Date.UTC(2000, 0, 6, 18, 14)) / 864e5) % syn) + syn) % syn, f = age / syn;
  const names = ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'];
  return `${names[Math.floor(f * 8 + 0.5) % 8]}, ${Math.round((1 - Math.cos(2 * Math.PI * f)) / 2 * 100)}%`;
}
const aqiWord = (a) => (a <= 50 ? 'good' : a <= 100 ? 'moderate' : a <= 150 ? 'unhealthy for some' : a <= 200 ? 'unhealthy' : 'very unhealthy');
function stamp(ms) {               // "3:30 PM", "3:30 PM Sat", or "Nov 19"
  const d = new Date(ms), t = now(), days = Math.round((startOfDay(t) - startOfDay(d)) / 864e5);
  if (days <= 0) return clock(d);
  return days < 6 ? `${clock(d)} ${d.toLocaleDateString([], { weekday: 'short' })}` : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
function viewPaper() {
  const t = now(), cfg = paperCfg || {};
  const fresh = paper && paper.key === paperKey();
  if (!fresh || Date.now() - paper.at > 30 * 60000) printPaper();
  const dayName = t.toLocaleDateString([], { weekday: 'long' }).toUpperCase();
  const mast = `<header class="mast"><h1>${esc(cfg.title || 'THE DAYLIGHT')}</h1>
    <div class="edition">${esc(cfg.edition || `${(me.town ? me.town.name : 'LOCAL').toUpperCase()} EDITION`)} · ${esc(dayName)} ${esc(t.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase())}${fresh ? ' · ' + esc(clock(new Date(paper.at))) : ''}</div></header>`;
  if (!fresh) return `<article class="paper">${mast}<div class="loading"><div class="spinner"></div><div>Setting today's edition…</div></div></article>`;
  const p = paper, o = paperSpot(), sec = (title, body) => (body ? `<section><h2>${esc(title)}</h2>${body}</section>` : '');
  let n = 0;
  const isNew = (x) => newSince > 0 && x.at > newSince;
  const item = (x, lead) => `<a class="item${lead ? ' lead' : ''}" href="${esc(x.u)}" target="_blank" rel="noopener">${isNew(x) ? '<span class="new">new</span> ' : ''}<b>${lead ? '' : `${++n}. `}${esc(/[.!?]$/.test(x.t) ? x.t : x.t + '.')}</b> ${esc(x.x)} <span class="src">${esc(x.src)} · ${esc(stamp(x.at))}</span></a>`;
  const newN = p.posts.filter(isNew).length;
  const status = `<p class="since">${newN ? `<b>${newN} new</b> since you last read, ${esc(stamp(newSince))} · ` : newSince ? 'Nothing new since you last read · ' : ''}<span class="ev" data-act="paper-refresh">fetch the latest</span></p>`;
  const by = (role) => p.posts.filter((x) => x.role === role).sort((a, b) => b.at - a.at);

  // weather: alerts first and in bold, then the forecast in the Weather Service's own words
  const { rise, set } = sunTimes(o.lat, o.lon, t);
  let weather = '';
  if (p.nws) {
    weather = `<p>${p.nws.alerts.map((a) => `<b>${esc(a.headline)}.</b> `).join('')}${p.nws.periods.map((x) => `<b>${esc(x.name)}:</b> ${esc(x.text)}`).join(' ')}
      <span class="src">National Weather Service · ${esc(stamp(p.nws.at))}</span></p>`;
  } else if (wx) weather = `<p>${esc(`${wx.temp}°F and ${wx.text} now.`)}${p.nums ? esc(` High ${p.nums.hi}°, low ${p.nums.lo}°.`) : ''} <span class="src">Open-Meteo</span></p>`;

  // news: the lead is the newest story an outlet has flagged as breaking, else simply the newest
  const news = by('news');
  const flagged = news.find((x) => /^(BREAKING|NEW|DEVELOPING|UPDATED?)\b/i.test(x.t) && Date.now() - x.at < 864e5);
  const lead = flagged || news[0];
  const rest = news.filter((x) => x !== lead);

  // the day's agenda, run together the way a paper lists scores
  const agenda = (label, win) => {
    const evs = allEvents().filter((e) => inRange(e, win));
    if (!evs.length) return '';
    const groups = [['mine', 'Your plans'], ['library', 'Library'], ['schools', 'Schools'], ['community', 'Community']].map(([k, name]) => {
      const list = evs.filter((e) => catOf(e) === k);
      if (!list.length) return '';
      const shown = list.slice(0, 8).map((e) => `<span class="ev" data-act="event" data-id="${esc(e.id)}">${e.ad ? '' : esc(clock(e.S)) + ' '}${esc(e.t)}${e.v ? ', ' + esc(e.v.replace(/ Library$/, '')) : ''}</span>`).join(' · ');
      return `<b>${esc(name)}:</b> ${shown}${list.length > 8 ? ` · <span class="ev" data-act="tab" data-tab="events">and ${list.length - 8} more</span>` : ''}. `;
    }).join('');
    return sec(label, `<p>${groups}</p>`);
  };
  const tomorrow = addDays(t, 1);

  // the numbers box
  const row = (k, v) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`;
  let nums = '';
  if (p.nums || p.aqi != null) nums += `<h3>WEATHER · ${esc(t.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase())}</h3>`
    + (p.nums ? row('High / low', `${p.nums.hi}° / ${p.nums.lo}°`) + row('Chance of rain', `${p.nums.rain == null ? '–' : p.nums.rain + '%'}`) + row('Wind, peak', `${p.nums.wind} mph`) + row('UV index', (p.nums.uv || 0).toFixed(1)) : '')
    + (p.aqi != null ? row('Air quality', `${p.aqi} ${aqiWord(p.aqi)}`) : '');
  if (rise) {
    const len = set - rise, y = sunTimes(o.lat, o.lon, addDays(t, -1)), diff = y.rise ? Math.round((len - (y.set - y.rise)) / 1000) : 0;
    nums += `<h3>SUN AND MOON</h3>` + row('Sunrise', clock(rise)) + row('Sunset', clock(set))
      + row('Daylight', `${Math.floor(len / 3600e3)}h ${pad(Math.floor(len % 3600e3 / 60000))}m`) + row('Change from yesterday', `${diff < 0 ? '−' : '+'}${Math.floor(Math.abs(diff) / 60)}m ${pad(Math.abs(diff) % 60)}s`)
      + row('Moon', moonText(t));
  }
  if (p.river) nums += `<h3>${esc(p.river.name.toUpperCase())} · ${esc(stamp(p.river.at))}</h3>` + (p.river.ft != null ? row('Gauge height', `${p.river.ft.toFixed(2)} ft`) : '') + (p.river.cfs != null ? row('Flow', `${Math.round(p.river.cfs).toLocaleString()} cfs`) : '');
  if (p.tide && p.tide.list.length) nums += `<h3>TIDES · ${esc(p.tide.name.toUpperCase())}</h3>` + p.tide.list.map((x) => row(`${x.hi ? 'High' : 'Low'} ${clock(parseLocal(x.at))}`, `${(Math.abs(x.ft) < 0.05 ? 0 : x.ft).toFixed(1)} ft`)).join('');
  const numsBox = nums ? `<div class="nums">${nums}</div><p class="src">${esc(['Open-Meteo', p.river ? 'U.S. Geological Survey' : '', p.tide ? 'NOAA' : ''].filter(Boolean).join(', '))}. Sun and moon are computed on your phone.</p>` : '';

  const list = (role) => by(role).map((x) => item(x)).join('');
  const none = !p.posts.length ? `<p>${cfg.news && cfg.news.length ? 'The newsrooms could not be reached just now. The rest of the page is current.' : 'No local newsroom is lined up for this area yet, so this edition carries the weather, the numbers and your own plans.'}</p>` : '';
  const verse = p.verse ? sec(`VERSE · ${p.verse.ref.toUpperCase()}`, `<p class="verse">“${esc(p.verse.text)}”</p><p class="src">World English Bible</p>`) : '';
  return `<article class="paper">${mast}${status}
    ${sec(`LOCAL WEATHER · ${dayName}`, weather)}
    ${lead ? sec('LEAD', item(lead, true)) : sec('LEAD', none)}
    ${sec(`NEWS · ${(pack ? pack.name.replace(/ County$/, '') : 'LOCAL').toUpperCase()}`, rest.map((x) => item(x)).join(''))}
    ${agenda(`TODAY · ${dayName}`, rangeOf('today'))}
    ${agenda(`TOMORROW · ${tomorrow.toLocaleDateString([], { weekday: 'long' }).toUpperCase()}`, rangeOf('tomorrow'))}
    ${sec('THE NUMBERS', numsBox)}
    ${sec('SCHOOLS', list('schools'))}
    ${sec('LIBRARY', list('library'))}
    ${sec('AROUND TOWN', list('features'))}
    ${verse}
    <footer class="colophon">${p.missing && p.missing.length ? `Not reached this time: ${esc(p.missing.join(', '))}. ` : ''}Nobody wrote this edition. It was assembled on your phone at ${esc(clock(new Date(p.at)))} from the sources named; headlines and opening lines belong to them, and every item opens the original.
      <button class="ghost" data-act="paper-refresh">Fetch the latest</button></footer>
  </article>`;
}

// ------------------------------------------------------------------ explore (the map)
let map = null, layer = null, meMarker = null, canvas = null, filter = 'near', query = '', mapFresh = true, focus = null;
function shownPlaces() {
  const q = query.trim().toLowerCase();
  if (q) { const words = q.split(/\s+/); return places.filter((p) => { const hay = `${p.name} ${KIND[p.kind]} ${p.g.title} ${p.extra}`.toLowerCase(); return words.every((w) => hay.includes(w)); }); }
  if (filter === 'near') return places.filter((p) => NEAR_GROUPS.includes(p.g.id));
  if (filter === 'saved') return places.filter((p) => me.saved[p.id]);
  if (filter === 'events') return [];
  return places.filter((p) => p.g.id === filter);
}
function shownEvents() {           // events with a spot on the map, for the current chip
  const mine = (e) => e.mine && e.E > now();
  if (query.trim() || !['near', 'events'].includes(filter)) return allEvents().filter((e) => e.lat != null && mine(e));
  const win = filter === 'events' ? rangeOf('week') : [now(), addDays(startOfDay(now()), 2)];
  return allEvents().filter((e) => e.lat != null && (inRange(e, win) || mine(e)));
}
function renderChips() {
  const chip = (k, label, color) => `<button class="chip${filter === k && !query ? ' on' : ''}" data-act="filter" data-k="${k}">${color ? `<i style="--k:${color}"></i>` : ''}${esc(label)}</button>`;
  $('#chips').innerHTML = chip('near', 'Near me') + chip('events', 'Happening', '#ffc94a') + (Object.keys(me.saved).length ? chip('saved', 'Saved') : '')
    + GROUPS.filter(([id]) => places.some((p) => p.g.id === id)).map(([id, title, color]) => chip(id, title, color)).join('');
}
function renderDeck() {
  const c = map ? map.getCenter() : null, ref = c ? { lat: c.lat, lon: c.lng } : origin();
  const d2 = (p) => (p.lat - ref.lat) ** 2 + ((p.lon - ref.lon) * 0.78) ** 2;
  const evCard = (e) => {
    const [label, color] = ECAT[catOf(e)] || ['Event', '#e09600'];
    const when = dayKey(e.S) === dayKey() ? (e.S < now() ? 'now' : clock(e.S)) : `${e.S.toLocaleDateString([], { weekday: 'short' })} ${e.ad ? '' : clock(e.S)}`;
    return `<li><button class="dcard" style="--c:${color}" data-act="event" data-id="${esc(e.id)}">
      <span class="top">${esc(label)}<span>${esc(when)}</span></span><b>${esc(e.t)}</b><small>${esc([e.v, distLabel(e)].filter(Boolean).join(' · '))}</small></button></li>`;
  };
  let cards = '';
  const evs = shownEvents();
  if (filter === 'events' && !query) cards = evs.slice(0, 14).map(evCard).join('');
  else {
    if (filter === 'near' && !query) cards += evs.slice(0, 3).map(evCard).join('');
    cards += shownPlaces().sort((a, b) => d2(a) - d2(b)).slice(0, 12).map((p) => `<li><button class="dcard" style="--c:${p.g.color}" data-act="place" data-id="${esc(p.id)}">
      <span class="top">${esc(KIND[p.kind])}<span>${esc(distLabel(p))}</span></span><b>${esc(p.name)}</b>
      <small>${esc(p.extra || p.addr || (me.been[p.id] ? 'Been there' : p.g.title))}</small></button></li>`).join('');
  }
  $('#deck').innerHTML = cards || `<li class="dcard" style="--c:var(--line)"><b>${loadState === 'loading' ? 'Loading the map…' : loadState === 'failed' ? 'The map data did not load.' : 'Nothing here.'}</b>
    <small>${loadState === 'failed' ? 'Check your connection, then refresh in Settings.' : loadState === 'loading' ? '' : 'Try another filter or move the map.'}</small></li>`;
  $('#deck').scrollLeft = 0;
}
function showMap() {
  renderChips();
  if (typeof L === 'undefined') { $('#deck').innerHTML = '<li class="dcard" style="--c:var(--line)"><b>The map could not load.</b><small>It needs a connection the first time.</small></li>'; return; }
  if (!map) {
    canvas = L.canvas({ padding: 0.3 });
    map = L.map('map', { zoomControl: false, attributionControl: true, preferCanvas: true, renderer: canvas });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    layer = L.layerGroup().addTo(map);
    let t;
    map.on('moveend', () => { clearTimeout(t); t = setTimeout(() => { drawMarkers(); renderDeck(); }, 120); });
    const o = origin();
    map.setView([o.lat, o.lon], pos ? 16 : 14);
    mapFresh = false;
  }
  map.invalidateSize();
  if (focus) { map.setView([focus.lat, focus.lon], Math.max(map.getZoom(), 17)); focus = null; mapFresh = false; }
  else if (mapFresh) { mapFresh = false; const o = origin(); map.setView([o.lat, o.lon], pos ? 16 : 14); }
  moveMe(); drawMarkers(); renderDeck();
}
function moveMe() {
  if (!map || !pos) return;
  if (!meMarker) meMarker = L.marker([pos.lat, pos.lon], { icon: L.divIcon({ className: 'pin-me', iconSize: [18, 18] }), interactive: false, zIndexOffset: 1000 }).addTo(map);
  else meMarker.setLatLng([pos.lat, pos.lon]);
}
function drawMarkers() {
  if (!map) return;
  layer.clearLayers();
  const b = map.getBounds().pad(0.25), c = map.getCenter();
  let list = shownPlaces().filter((p) => b.contains([p.lat, p.lon]));
  if (list.length > 450) list = list.sort((x, y) => ((x.lat - c.lat) ** 2 + (x.lon - c.lng) ** 2) - ((y.lat - c.lat) ** 2 + (y.lon - c.lng) ** 2)).slice(0, 450);
  for (const p of list) {
    const been = me.been[p.id], star = me.saved[p.id];
    L.circleMarker([p.lat, p.lon], { renderer: canvas, radius: star ? 9 : 7, color: been && !star ? '#ffc94a' : '#fff', weight: star ? 3.5 : been ? 2.5 : 1.5,
      fillColor: p.g.color, fillOpacity: 0.92 }).on('click', () => placeSheet(p.id)).addTo(layer);
  }
  const spots = new Map();
  for (const e of shownEvents()) { const k = `${e.lat.toFixed(4)},${e.lon.toFixed(4)}`; if (!spots.has(k)) spots.set(k, []); spots.get(k).push(e); }
  for (const evs of spots.values()) {
    const mine = evs.some((e) => e.mine);
    L.marker([evs[0].lat, evs[0].lon], { icon: L.divIcon({ className: '', html: `<div class="pin-ev${mine ? ' mine' : ''}"><span>${evs.length > 1 ? evs.length : mine ? '★' : '•'}</span></div>`, iconSize: [30, 30], iconAnchor: [4, 28] }), zIndexOffset: 500 })
      .on('click', () => (evs.length === 1 ? eventSheet(evs[0].id) : venueSheet(evs))).addTo(layer);
  }
}

// ------------------------------------------------------------------ sheets and toasts
function openSheet(html) { $('#sheet').innerHTML = html; $('#sheet').hidden = false; $('#backdrop').hidden = false; $('#sheet').scrollTop = 0; }
function closeSheet() { $('#sheet').hidden = true; $('#backdrop').hidden = true; }
function toast(msg) {
  const t = $('#toast');
  t.hidden = true; void t.offsetWidth;      // restart the animation
  t.textContent = msg; t.hidden = false;
  clearTimeout(toast.timer); toast.timer = setTimeout(() => { t.hidden = true; }, 2600);
}
function placeSheet(id) {
  const p = byId.get(id);
  if (!p) return;
  const here = eventsAt(p).slice(0, 5);
  const web = p.web ? `<a class="ghost" href="${esc(p.web)}" target="_blank" rel="noopener">Website</a>` : '';
  const call = p.phone ? `<a class="ghost" href="tel:${esc(p.phone.replace(/[^+\d]/g, ''))}">Call</a>` : '';
  openSheet(`<div class="sh-kind" style="--c:${p.g.color}">${esc(KIND[p.kind])} · ${esc(p.g.title)}</div>
    <div class="sh-text">${esc(p.name)}</div>
    <div class="sh-meta">${p.extra ? `<span>${esc(p.extra)}</span>` : ''}${p.addr ? `<span><b>${esc(p.addr)}</b></span>` : ''}
      ${p.hours ? `<span>Hours: ${esc(p.hours)}</span>` : ''}${distLabel(p) ? `<span>${esc(distLabel(p))} from you</span>` : ''}
      ${me.been[id] ? `<span>Been there ${esc(me.been[id])}</span>` : ''}</div>
    <div class="btns">
      <a class="primary slim" href="https://maps.apple.com/?daddr=${p.lat},${p.lon}&dirflg=w&q=${encodeURIComponent(p.name)}" target="_blank" rel="noopener">Directions</a>
      <button class="ghost" data-act="show-on-map" data-id="${esc(id)}">Show on map</button>
      <button class="ghost${me.saved[id] ? ' on' : ''}" data-act="save-place" data-id="${esc(id)}">${me.saved[id] ? '★ Saved' : '☆ Save'}</button>
      <button class="ghost${me.been[id] ? ' on' : ''}" data-act="been" data-id="${esc(id)}">${me.been[id] ? '✓ Been there' : 'I’ve been here'}</button>
      ${web}${call}
    </div>
    ${p.kind === 'bikeshare' && paperCfg && paperCfg.bikeshare ? `<div class="livebox" id="livebox" data-id="${esc(id)}">Checking the dock…</div>` : ''}
    ${here.length ? `<h4>Happening here</h4><ul class="rows">${here.map(eventRow).join('')}</ul>` : ''}
    <h4>My note</h4>
    <textarea class="field" id="pnote" data-id="${esc(id)}" placeholder="Who you met, what to remember, when to come back.">${esc(me.notes[id] || '')}</textarea>
    <button class="ghost" data-act="meetup" data-place="${esc(id)}">Plan a meetup here</button>
    <p class="fine" style="margin-top:12px">Place details come from OpenStreetMap and can be out of date.</p>`);
  if ($('#livebox')) showBikes(p);
}
function eventSheet(id) {
  const e = findEvent(id);
  if (!e) return;
  const [label, color] = ECAT[catOf(e)] || ['Event', '#6b7280'];
  const src = eventsMeta && eventsMeta.sources.find((s) => s.id === e.src);
  const circle = e.circle && me.circles.find((c) => c.id === e.circle);
  const kept = planFor(id);
  openSheet(`<div class="sh-kind" style="--c:${color}">${esc(label)}${e.g ? ' · ' + esc(e.g) : ''}</div>
    <div class="sh-text">${esc(e.t)}</div>
    <div class="sh-meta"><span><b>${esc(whenText(e, true))}</b></span>
      ${e.v ? `<span><b>${esc(e.v)}</b>${e.r ? ' · ' + esc(e.r) : ''}${e.a ? ' · ' + esc(e.a) : ''}${distLabel(e) ? ' · ' + esc(distLabel(e)) : ''}</span>` : ''}
      ${e.who ? `<span>For: ${esc(e.who)}</span>` : ''}${circle ? `<span>With: ${esc(circle.name)}${circle.people ? ' (' + esc(circle.people) + ')' : ''}</span>` : ''}</div>
    ${e.d || e.n ? `<p>${esc(e.d || e.n)}</p>` : ''}
    <div class="btns">
      ${e.u ? `<a class="primary slim" href="${esc(e.u)}" target="_blank" rel="noopener">Details and sign-up</a>` : ''}
      ${e.lat != null ? `<button class="ghost" data-act="show-event" data-id="${esc(id)}">Show on map</button>` : ''}
      ${e.mine ? `<button class="ghost" data-act="meetup" data-edit="${esc(id)}">Edit</button>` : `<button class="ghost${kept ? ' on' : ''}" data-act="keep" data-id="${esc(id)}">${kept ? '★ In my plans' : '☆ Add to my plans'}</button>`}
      <button class="ghost" data-act="ics" data-id="${esc(id)}">Add to calendar</button>
      <button class="ghost" data-act="share" data-id="${esc(id)}">${e.mine ? 'Send invite' : 'Share'}</button>
      ${e.mine ? `<button class="ghost danger" data-act="drop-plan" data-id="${esc(id)}">Delete</button>` : ''}
    </div>
    ${src ? `<p class="fine">From the ${esc(src.name)} calendar. Check their page before you go: times change.</p>` : ''}`);
}
function venueSheet(evs) {
  openSheet(`<h3>${esc(evs[0].v || 'Here')}</h3><ul class="rows">${evs.slice(0, 40).map(eventRow).join('')}</ul>`);
}
function suggest(text) {           // place names that match what you're typing
  const q = text.trim().toLowerCase();
  if (q.length < 2) return [];
  const o = pos || origin();
  return places.filter((p) => p.name.toLowerCase().includes(q)).sort((a, b) => metersBetween(o, a) - metersBetween(o, b)).slice(0, 5);
}
function meetupSheet(opt = {}) {
  const old = opt.edit ? planFor(opt.edit) : null;
  const p = opt.place ? byId.get(opt.place) : old && old.pid ? byId.get(old.pid) : null;
  const d = old ? old.s.slice(0, 10) : dayKey(addDays(now(), 1)), tm = old ? old.s.slice(11, 16) : '18:00';
  openSheet(`<h3>${old ? 'Edit meetup' : 'Post a meetup'}</h3>
    <form data-form="meetup" data-edit="${esc(old ? old.id : '')}">
      <label class="lab">What</label><input class="field" name="t" required maxlength="80" placeholder="Saturday run, book club, coffee" value="${esc(old ? old.t : '')}">
      <div class="two"><div><label class="lab">Day</label><input class="field" type="date" name="d" required value="${d}"></div>
        <div><label class="lab">Time</label><input class="field" type="time" name="tm" required value="${tm}"></div></div>
      <label class="lab">Where</label><input class="field" name="v" id="mwhere" autocomplete="off" placeholder="Start typing a place" value="${esc(p ? p.name : old ? old.v || '' : '')}">
      <input type="hidden" name="pid" id="mpid" value="${esc(p ? p.id : '')}"><div class="sugg" id="msugg"></div>
      ${me.circles.length ? `<label class="lab">Circle</label><select class="field" name="circle"><option value="">No circle</option>${me.circles.map((c) => `<option value="${esc(c.id)}"${(old && old.circle === c.id) || opt.circle === c.id ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</select>` : ''}
      <label class="lab">Note</label><textarea class="field" name="n" maxlength="240" placeholder="What to bring, where exactly to meet.">${esc(old ? old.n || '' : '')}</textarea>
      <button class="primary">${old ? 'Save' : 'Post it'}</button>
    </form>
    <p class="fine" style="margin-top:12px">It goes in your plans and on your map. To invite people, send them the link: it carries the meetup itself, and nothing is stored on a server.</p>`);
}
function circleSheet(id) {
  const c = me.circles.find((x) => x.id === id);
  openSheet(`<h3>${c ? 'Circle' : 'New circle'}</h3>
    <form data-form="circle" data-id="${esc(c ? c.id : '')}">
      <label class="lab">Name</label><input class="field" name="name" required maxlength="40" placeholder="Running friends" value="${esc(c ? c.name : '')}">
      <label class="lab">People</label><input class="field" name="people" maxlength="300" placeholder="Sam, Priya, Jo" value="${esc(c ? c.people || '' : '')}">
      <label class="lab">Usual spot</label><input class="field" name="spot" maxlength="80" placeholder="Bluemont Park" value="${esc(c ? c.spot || '' : '')}">
      <label class="lab">Usual time</label><input class="field" name="when" maxlength="60" placeholder="Saturdays at 8" value="${esc(c ? c.when || '' : '')}">
      <button class="primary">Save</button>
    </form>
    ${c ? `<button class="ghost" data-act="meetup" data-circle="${esc(c.id)}">Plan a meetup with this circle</button>
      <button class="ghost danger" data-act="drop-circle" data-id="${esc(c.id)}">Delete circle</button>` : ''}`);
}
let invite = null;
function inviteSheet(m) {
  invite = m;
  const e = withTimes({ ...m, mine: true });
  openSheet(`<div class="sh-kind" style="--c:#8a52d9">You're invited</div>
    <div class="sh-text">${esc(m.t)}</div>
    <div class="sh-meta"><span><b>${esc(whenText(e, true))}</b></span>${m.v ? `<span><b>${esc(m.v)}</b></span>` : ''}</div>
    ${m.n ? `<p>${esc(m.n)}</p>` : ''}
    <button class="primary" data-act="accept-invite">Add to my plans</button>
    <button class="ghost" data-act="close-sheet">Not now</button>`);
}
function settingsSheet() {
  openSheet(`<h3>Settings</h3>
    <p class="fine">${esc(pack ? `You're using the ${pack.name} pack: ${places.length.toLocaleString()} places${events.length ? ` and ${events.length} upcoming events` : ''}.` : `There is no county pack here, so ${places.length.toLocaleString()} places were read live from OpenStreetMap around ${me.town ? me.town.name : 'you'}.`)}</p>
    <label class="toggle"><span>Use my location<br><span class="fine">Sorts by what's near you and stamps places you reach.</span></span>
      <input type="checkbox" id="uselocation" ${me.useLocation ? 'checked' : ''}></label>
    <label class="toggle"><span>Verse of the day in the paper<br><span class="fine">A passage from Proverbs, World English Bible.</span></span>
      <input type="checkbox" id="useverse" ${me.verse === false ? '' : 'checked'}></label>
    <h4>Home town</h4>
    <form class="inline" data-form="town"><input name="town" placeholder="${esc(me.town ? `${me.town.name}${me.town.admin ? ', ' + me.town.admin : ''}` : 'Arlington, VA')}" autocomplete="off"><button>Change</button></form>
    <div class="fine" id="ob-err" style="min-height:1.4em;margin-top:6px"></div>
    <button class="ghost" data-act="refresh">Refresh places and events</button>
    <button class="ghost" data-act="export">Back up what I've saved</button>
    <button class="ghost danger" data-act="erase">Erase everything I've saved</button>
    <h4>Privacy</h4>
    <p class="fine">There is no account and no Daylight server. Your circles, plans, notes, saved places and stamps live only in this browser.
      Your position stays on this device. Three things go out: a weather request with your position rounded to about half a mile, map tiles from OpenStreetMap,
      and, outside a covered county, one request for nearby places with your position rounded to about a block.
      The paper asks its sources for the county as a whole, not for where you are standing.</p>
    <h4>Sources</h4>
    <p class="fine">Places: © OpenStreetMap contributors${pack ? ' and Arlington County open data' : ''}. Weather: Open-Meteo and the National Weather Service.
      Events: the calendars named on the Happening tab. The paper: the outlets named under each item.</p>`);
}

// ------------------------------------------------------------------ actions
async function setTown(text, errEl) {
  const say = (m) => { if (errEl) errEl.textContent = m; };
  if (!text.trim()) return say('Type a town, like "Arlington, VA".');
  say('Looking…');
  let t = null;
  try { t = await geocode(text); } catch { return say("Couldn't reach the lookup service. Check your connection."); }
  if (!t) return say('No town by that name. Try adding the state: "Arlington, VA".');
  me.town = t; save(); say('');
  closeSheet(); mapFresh = true; render();
  wx = await getWeather(); loadData(true);
}
async function obLocate() {
  const err = $('#ob-err');
  if (err) err.textContent = 'Finding you…';
  const p = await locate(12000, true);
  if (!p) { if (err) err.textContent = "Couldn't get your location. Type your town instead."; return; }
  me.useLocation = true;
  const pk = packFor(p);
  me.town = pk ? { name: pk.name, admin: pk.admin, lat: p.lat, lon: p.lon } : { ...(await reverseName(p)), lat: p.lat, lon: p.lon };
  save(); mapFresh = true; render(); startWatch();
  wx = await getWeather(); loadData(true);
}
function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
async function shareText(title, text, url) {
  if (navigator.share) { try { await navigator.share({ title, text, url }); } catch { /* cancelled */ } return; }
  try { await navigator.clipboard.writeText(`${text} ${url}`); toast('Copied. Paste it to your people.'); } catch { prompt('Copy this link', url); }
}
function resetSearch() { query = ''; $('#search').value = ''; }
const ACTIONS = {
  tab: (el) => { if (el.dataset.tab === 'paper' && tab !== 'paper') openPaper(); tab = el.dataset.tab; render(); },
  settings: () => settingsSheet(),
  'paper-refresh': () => { toast('Fetching the latest…'); printPaper(true); },
  'close-sheet': () => closeSheet(),
  'ob-locate': () => obLocate(),
  locate: async () => {
    toast('Finding you…');
    const p = await locate(10000, true);
    if (!p) return toast("Couldn't get your location.");
    if (!me.useLocation) { me.useLocation = true; save(); startWatch(); }
    stampNear(); moveMe(); map.setView([p.lat, p.lon], Math.max(map.getZoom(), 16));
    if (packFor(p) !== pack || (!pack && loadedFor !== liveKey(p))) loadData(true);
  },
  filter: (el) => { filter = el.dataset.k; resetSearch(); renderChips(); drawMarkers(); renderDeck(); },
  place: (el) => placeSheet(el.dataset.id),
  event: (el) => eventSheet(el.dataset.id),
  range: (el) => { range = el.dataset.k; eshow = 80; render(); },
  ecat: (el) => { ecat = el.dataset.k; eshow = 80; render(); },
  'more-events': () => { eshow += 120; render(); },
  nearest: (el) => {
    const k = el.dataset.kind, o = pos || origin();
    const best = places.filter((p) => p.kind === k).sort((a, b) => metersBetween(o, a) - metersBetween(o, b))[0];
    if (!best) return toast('None on the map here.');
    filter = best.g.id; resetSearch(); focus = best; tab = 'map'; render(); placeSheet(best.id);
  },
  'show-on-map': (el) => { const p = byId.get(el.dataset.id); if (!p) return; if (!shownPlaces().includes(p)) { filter = p.g.id; resetSearch(); } focus = p; tab = 'map'; closeSheet(); render(); },
  'show-event': (el) => { const e = findEvent(el.dataset.id); if (!e) return; filter = 'events'; resetSearch(); focus = e; tab = 'map'; closeSheet(); render(); },
  'save-place': (el) => { const id = el.dataset.id; if (me.saved[id]) delete me.saved[id]; else me.saved[id] = 1; save(); placeSheet(id); if (tab === 'map') { renderChips(); drawMarkers(); } else render(); },
  been: (el) => { const id = el.dataset.id; if (me.been[id]) delete me.been[id]; else me.been[id] = dayKey(); save(); placeSheet(id); if (tab === 'map') drawMarkers(); else render(); },
  keep: (el) => {
    const id = el.dataset.id, i = me.plans.findIndex((p) => p.id === id);
    if (i >= 0) me.plans.splice(i, 1);
    else { const e = events.find((x) => x.id === id); if (e) { const { S, E, ...rest } = e; me.plans.push(rest); } }
    save(); eventSheet(id); if (tab !== 'map') render();
  },
  'drop-plan': (el) => { if (!confirm('Delete this meetup?')) return; me.plans = me.plans.filter((p) => p.id !== el.dataset.id); save(); closeSheet(); render(); },
  ics: (el) => { const e = findEvent(el.dataset.id); if (e) download('daylight-event.ics', icsFor(e), 'text/calendar'); },
  share: (el) => {
    const e = findEvent(el.dataset.id);
    if (e) shareText(e.t, `${e.t}: ${whenText(e)}${e.v ? ' at ' + e.v : ''}`, e.mine || !e.u ? inviteLink(e) : e.u);
  },
  meetup: (el) => meetupSheet({ place: el.dataset.place, edit: el.dataset.edit, circle: el.dataset.circle }),
  'pick-place': (el) => { const p = byId.get(el.dataset.id); if (!p) return; $('#mwhere').value = p.name; $('#mpid').value = p.id; $('#msugg').innerHTML = ''; },
  circle: (el) => circleSheet(el.dataset.id),
  'drop-circle': (el) => { if (!confirm('Delete this circle?')) return; me.circles = me.circles.filter((c) => c.id !== el.dataset.id); save(); closeSheet(); render(); },
  'accept-invite': () => {
    if (!invite) return;
    me.plans.push({ id: 'm' + uid(), mine: true, ...invite });
    invite = null; save(); history.replaceState(null, '', location.pathname + location.search); closeSheet(); tab = 'mine'; render(); toast('Added to your plans');
  },
  refresh: async () => { closeSheet(); toast('Refreshing…'); localStorage.removeItem(K_LIVE); await loadData(true); await refreshLive(true); printPaper(true); toast(loadState === 'ready' ? 'Up to date' : "Couldn't refresh. Try again later."); },
  export: () => download(`daylight-backup-${dayKey()}.json`, JSON.stringify(me, null, 1), 'application/json'),
  erase: () => { if (!confirm('Erase your circles, plans, notes, saved places and stamps from this browser? This cannot be undone.')) return; const t = me.town; me = freshMe(); me.town = t; save(); closeSheet(); render(); toast('Erased'); },
};
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.act];
  if (fn) { ev.preventDefault(); fn(el, ev); }
});
document.addEventListener('submit', (ev) => {
  const f = ev.target.closest('form[data-form]');
  if (!f) return;
  ev.preventDefault();
  const v = Object.fromEntries(new FormData(f));
  if (f.dataset.form === 'town') return setTown(v.town || '', $('#ob-err'));
  if (f.dataset.form === 'meetup') {
    const where = (v.v || '').trim(), hit = v.pid ? byId.get(v.pid) : null, p = hit && hit.name === where ? hit : null;
    const plan = { id: f.dataset.edit || 'm' + uid(), mine: true, t: v.t.trim(), s: `${v.d}T${v.tm}`, v: where, n: (v.n || '').trim(), circle: v.circle || '' };
    if (p) { plan.pid = p.id; plan.lat = p.lat; plan.lon = p.lon; }
    me.plans = me.plans.filter((x) => x.id !== plan.id).concat(plan);
    save(); render(); eventSheet(plan.id); toast(f.dataset.edit ? 'Saved' : 'Posted to your plans');
  }
  if (f.dataset.form === 'circle') {
    const c = { id: f.dataset.id || 'c' + uid(), name: v.name.trim(), people: (v.people || '').trim(), spot: (v.spot || '').trim(), when: (v.when || '').trim() };
    const i = me.circles.findIndex((x) => x.id === c.id);
    if (i >= 0) me.circles[i] = c; else me.circles.push(c);
    save(); closeSheet(); render(); toast('Circle saved');
  }
});
let typing;
document.addEventListener('input', (ev) => {
  const t = ev.target;
  if (t.id === 'search') { clearTimeout(typing); typing = setTimeout(() => { query = t.value; renderChips(); drawMarkers(); renderDeck(); }, 180); }
  else if (t.id === 'eq') { clearTimeout(typing); typing = setTimeout(() => { eq = t.value; eshow = 80; render(); const n = $('#eq'); if (n) { n.focus(); try { n.setSelectionRange(eq.length, eq.length); } catch { /* some browsers refuse on search fields */ } } }, 250); }
  else if (t.id === 'pnote') { const id = t.dataset.id; if (t.value.trim()) me.notes[id] = t.value; else delete me.notes[id]; save(); }
  else if (t.id === 'mwhere') { $('#mpid').value = ''; $('#msugg').innerHTML = suggest(t.value).map((p) => `<button type="button" data-act="pick-place" data-id="${esc(p.id)}">${esc(p.name)} <small>${esc(KIND[p.kind])}${distLabel(p) ? ' · ' + esc(distLabel(p)) : ''}</small></button>`).join(''); }
});
document.addEventListener('change', (ev) => {
  if (ev.target.id === 'useverse') { me.verse = ev.target.checked; save(); paper = null; localStorage.removeItem(K_PAPER); return; }
  if (ev.target.id !== 'uselocation') return;
  me.useLocation = ev.target.checked; save();
  if (me.useLocation) { startWatch(); locate(10000, true).then((p) => { if (p) { stampNear(); mapFresh = true; } else toast("Couldn't get your location."); }); }
  else { stopWatch(); pos = null; if (meMarker) { meMarker.remove(); meMarker = null; } }
});

// ------------------------------------------------------------------ start
function readInvite() {
  const m = /^#m=(.+)$/.exec(location.hash);
  if (!m || !me.town) return;
  try {
    const d = JSON.parse(unb64(m[1]));
    if (!d || !d.t || !/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(d.s)) return;
    const inv = { t: String(d.t).slice(0, 80), s: d.s, v: String(d.v || '').slice(0, 80), n: String(d.n || '').slice(0, 240), u: /^https:\/\//.test(d.u || '') ? d.u : '' };
    if (typeof d.lat === 'number' && typeof d.lon === 'number') { inv.lat = d.lat; inv.lon = d.lon; }
    inviteSheet(inv);
  } catch { /* not an invite */ }
}
let centered = false;
async function wake() {        // on open and whenever the app comes back to the front
  render();
  if (!me.town) return;
  startWatch();
  if (me.useLocation) locate(8000).then((p) => {
    if (!p) return;
    stampNear();
    if (!centered) { centered = true; mapFresh = true; }
    if ($('#sheet').hidden) render();
    if (loadState === 'ready' && (packFor(p) !== pack || (!pack && loadedFor !== liveKey(p)))) loadData(true);
  });
  checkVersion();
  loadData().then(() => { refreshLive(); return printPaper(); }).then(() => { markTabs(); renderSky(); });
  wx = await getWeather();
  renderSky();
  if (tab === 'guide' && $('#sheet').hidden) render();
}
document.addEventListener('visibilitychange', () => { if (document.hidden) stopWatch(); else wake(); });
let ticks = 0;
setInterval(() => {
  if (!me.town || document.hidden) return;
  renderSky();
  if (++ticks % 5) return;                        // every five minutes while Daylight stays open
  checkVersion(); refreshLive();
  getWeather().then((w) => { wx = w; });
  printPaper().then(() => { markTabs(); });
  if ($('#sheet').hidden && !typingNow() && (tab === 'events' || tab === 'mine')) render();      // drop what has ended
}, 60000);
window.addEventListener('hashchange', readInvite);
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
if (tab === 'paper') openPaper();
wake().then(readInvite);
