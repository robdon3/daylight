'use strict';
/* DAYLIGHT, phone edition: an open-world game where the world is real.
   One page, no account, no server of its own. Everything you log stays in this browser. */

// ------------------------------------------------------------------ rules data
const STATS = ['body', 'bonds', 'money', 'work', 'social'];
const LABEL = { body: 'BODY', bonds: 'BONDS', money: 'MONEY', work: 'WORK', social: 'SOCIAL' };
const MEANS = { body: 'fitness', bonds: 'relationships', money: 'making and keeping it', work: 'doing the job', social: 'being among people' };
const TIER_XP = { 1: 20, 2: 35, 3: 55 };
const WIN = 3;

// [id, tier, text, kind]   kind: "" anywhere, "out" = outdoors (has a rain/night plan)
// Slots: {park} {track} {gym} {library} {cafe} {hub}
const M = {
  body: [
    ['b1', 1, 'Walk to {park} and do one full lap of it.', 'out'],
    ['b2', 1, 'Take a 20-minute walk with no headphones.', 'out'],
    ['b3', 1, 'Do 10 squats and 10 push-ups (knees are fine). Twice today.', ''],
    ['b4', 1, 'Drink water with every meal today and be in bed 30 minutes earlier.', ''],
    ['b5', 2, 'Run or jog for 15 minutes at {track}.', 'out'],
    ['b6', 2, 'Walk into {gym} and ask what a first visit costs.', ''],
    ['b7', 2, 'Walk somewhere you would normally drive to.', 'out'],
    ['b8', 3, 'Cover 5 km on foot today, in one go or in pieces.', 'out'],
    ['b9', 3, 'Do a full workout at {gym}, or 40 minutes of hard effort anywhere.', ''],
    ['b10', 3, 'Cook a real dinner from raw ingredients. No delivery today.', ''],
  ],
  bonds: [
    ['r1', 1, "Call someone you haven't spoken to in a month. Voice, not text.", ''],
    ['r2', 1, 'Tell one person exactly what you appreciate about them.', ''],
    ['r3', 1, 'Eat one meal with someone today, phones out of sight.', ''],
    ['r4', 1, 'Send a photo from your day to a family member, with one sentence about it.', ''],
    ['r5', 2, 'Invite someone for a walk at {park}.', 'out'],
    ['r6', 2, 'Write a short note by hand and give it or mail it.', ''],
    ['r7', 2, 'Ask someone older than you about a year of their life you know nothing about.', ''],
    ['r8', 3, "Have the conversation you've been putting off. Start it today.", ''],
    ['r9', 3, 'Plan something for someone else: a dinner, a trip, a surprise. Put a date on it.', ''],
    ['r10', 3, 'Apologize for the thing you never apologized for.', ''],
  ],
  money: [
    ['m1', 1, 'Write down every dollar you spend today.', ''],
    ['m2', 1, 'Look at your bank balance and your last 10 transactions. Just look.', ''],
    ['m3', 1, "Cancel one subscription you haven't used this month.", ''],
    ['m4', 1, 'Spend nothing today except on food and getting around.', ''],
    ['m5', 2, 'Move any amount, even $5, into savings today.', ''],
    ['m6', 2, 'Write your net worth on paper: what you own minus what you owe.', ''],
    ['m7', 2, 'Find one bill you could lower, and make the call or send the message.', ''],
    ['m8', 2, "List for sale one thing you own and don't use.", ''],
    ['m9', 3, 'Earn money outside your main job today: a gig, a sale, a favor with a price.', ''],
    ['m10', 3, 'Set up one automatic transfer to savings or to a debt.', ''],
    ['m11', 3, 'Ask for something worth money: a raise, a discount, a better rate.', ''],
  ],
  work: [
    ['w1', 1, "Do the task you've been avoiding for 25 minutes, phone in another room.", ''],
    ['w2', 1, 'Clear and clean the place where you work.', ''],
    ['w3', 1, "Write tomorrow's three most important tasks on paper before tonight.", ''],
    ['w4', 1, 'Finish one small thing completely today. Not 90%.', ''],
    ['w5', 2, 'Do a 60-minute work block at {library}.', ''],
    ['w6', 2, 'Teach someone one thing you know how to do.', ''],
    ['w7', 2, 'Update one line of your resume with something you did this year.', ''],
    ['w8', 2, 'Spend 30 minutes learning a skill your work will need next year.', ''],
    ['w9', 3, "Show someone work you haven't shown anyone, and ask what's weak about it.", ''],
    ['w10', 3, "Ask someone whose job you'd want how they got it.", ''],
    ['w11', 3, 'Make something and put it where other people can see it.', ''],
  ],
  social: [
    ['s1', 1, 'Say hello to a neighbor and learn their name.', ''],
    ['s2', 1, 'Go to {cafe} and stay 20 minutes without looking at a screen.', ''],
    ['s3', 1, 'Give a stranger a real compliment.', ''],
    ['s4', 1, 'Learn the name of someone you see every week: a cashier, a barista, a guard.', ''],
    ['s5', 2, 'Go to {hub} and find out what happens there this week.', ''],
    ['s6', 2, "Start a conversation with someone you don't know. Two minutes is enough.", ''],
    ['s7', 2, "Say yes to an invitation you'd normally decline, or make one.", ''],
    ['s9', 3, 'Go to something where you know no one: a class, a club, a pickup game.', ''],
    ['s10', 3, 'Volunteer one hour this week. Sign up today.', ''],
    ['s11', 3, 'Get three or more people together in one place. You host.', ''],
  ],
};
// what an outdoor mission becomes when it's dark or the weather is rough
const RAIN_PLAN = {
  b1: 'Walk for 20 minutes under cover: stairs, hallways, a mall.',
  b2: 'Do 10 minutes of stretching on the floor, no screen.',
  b5: 'Climb stairs for 10 minutes without stopping.',
  b7: 'Do a 20-minute bodyweight workout at home.',
  b8: 'Do 40 minutes of movement indoors, in one go or in pieces.',
  r5: 'Invite someone for coffee or a call this week, and set the time.',
};
const SLOT_FALLBACK = {
  park: 'a park near you', track: 'a track or park near you', gym: 'a gym or rec center near you',
  library: 'a library or quiet public place', cafe: 'a cafe near you', hub: 'a community center or market near you',
};
const KINDS = ['park', 'track', 'gym', 'library', 'cafe', 'hub'];
const KIND_TITLE = { park: 'Parks', track: 'Tracks', gym: 'Gyms & pools', library: 'Libraries', cafe: 'Cafes', hub: 'Community' };
const KIND_ONE = { park: 'Park', track: 'Track', gym: 'Gym, pool or rec center', library: 'Library', cafe: 'Cafe', hub: 'Community center or market' };
const KIND_COLOR = { park: '#2f9e5b', track: '#e4572e', gym: '#e4572e', library: '#3b7dd8', cafe: '#b9770e', hub: '#8a52d9' };
const US = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut',
  DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
  IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts',
  MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota',
  TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia',
  WI: 'Wisconsin', WY: 'Wyoming' };
const WMO = { 0: 'clear', 1: 'mostly clear', 2: 'partly cloudy', 3: 'overcast', 45: 'fog', 48: 'fog', 51: 'light drizzle',
  53: 'drizzle', 55: 'heavy drizzle', 56: 'freezing drizzle', 57: 'freezing drizzle', 61: 'light rain', 63: 'rain',
  65: 'heavy rain', 66: 'freezing rain', 67: 'freezing rain', 71: 'light snow', 73: 'snow', 75: 'heavy snow',
  77: 'snow grains', 80: 'showers', 81: 'showers', 82: 'heavy showers', 85: 'snow showers', 86: 'snow showers',
  95: 'thunderstorm', 96: 'thunderstorm with hail', 99: 'thunderstorm with hail' };
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.openstreetmap.fr/api/interpreter', 'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter'];

// ------------------------------------------------------------------ small helpers
const K_STATE = 'daylight.state', K_PLACES = 'daylight.places', K_WEATHER = 'daylight.weather', K_TIP = 'daylight.tip';
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FAKE_NOW = new URLSearchParams(location.search).get('now');   // ?now=2026-06-01T15:30 for testing
const now = () => (FAKE_NOW ? new Date(FAKE_NOW) : new Date());
const dayKey = (d = now()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const keyDate = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const dayGap = (a, b) => Math.round((keyDate(b) - keyDate(a)) / 864e5);
const clock = (d) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

function readJSON(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }
function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ } }

function rng(seedStr) {            // small seeded generator, so a day's deal is stable
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) { h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
  let a = (h ^ (h >>> 16)) >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

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

// ------------------------------------------------------------------ state
function freshState() {
  const z = (v) => Object.fromEntries(STATS.map((s) => [s, v()]));
  return { version: 1, seed: Math.floor(Math.random() * 1e9), town: null, useLocation: false, xp: z(() => 0),
    last: z(() => null), streak: 0, best: 0, lastWon: null, days: {}, recent: z(() => []), log: [] };
}
function validState(s) { return s && s.version === 1 && s.xp && s.last && s.days && Array.isArray(s.log); }
let st = (() => { const s = readJSON(K_STATE); return validState(s) ? s : freshState(); })();
let placesCache = readJSON(K_PLACES);   // {center:{lat,lon}, at, places:{kind:[{name,lat,lon}]}}
let pos = null;                         // where you are right now; kept in memory only
let wx = readJSON(K_WEATHER);
let tab = 'today';
let busyMsg = '';

function save() {
  const keep = Object.keys(st.days).sort().slice(-60);
  st.days = Object.fromEntries(keep.map((k) => [k, st.days[k]]));
  writeJSON(K_STATE, st);
}
const origin = () => pos || st.town;

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
const sunToday = () => sunTimes(origin().lat, origin().lon, now());

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

function locate(timeout = 8000) {
  return new Promise((res) => {
    if (!navigator.geolocation) return res(null);
    navigator.geolocation.getCurrentPosition(
      (p) => { pos = { lat: p.coords.latitude, lon: p.coords.longitude }; res(pos); },
      () => res(null), { enableHighAccuracy: false, timeout, maximumAge: 300000 });
  });
}

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

async function downloadPlaces(c, timeout = 25000) {
  const la = c.lat.toFixed(2), lo = c.lon.toFixed(2), R = 3500;
  const q = `[out:json][timeout:25];(nwr(around:${R},${la},${lo})[leisure~"^(park|nature_reserve|garden|fitness_centre|sports_centre|swimming_pool|track)$"][name];` +
    `nwr(around:${R},${la},${lo})[amenity~"^(library|cafe|community_centre|marketplace)$"][name];);out center tags 800;`;
  const els = await overpass(q, timeout);
  const kinds = { park: 'park', nature_reserve: 'park', garden: 'park', fitness_centre: 'gym', sports_centre: 'gym',
    swimming_pool: 'gym', track: 'track', library: 'library', cafe: 'cafe', community_centre: 'hub', marketplace: 'hub' };
  const out = Object.fromEntries(KINDS.map((k) => [k, []])), seen = new Set();
  for (const e of els) {
    const t = e.tags || {};
    const kind = kinds[t.leisure] || kinds[t.amenity];
    const name = (t.name || '').trim();
    const p = e.center || e;
    if (!kind || !name || p.lat == null || name.length > 48 || seen.has(kind + '|' + name.toLowerCase())) continue;
    if (t.access === 'private' || t.access === 'no') continue;
    seen.add(kind + '|' + name.toLowerCase());
    out[kind].push({ name, lat: +p.lat.toFixed(5), lon: +p.lon.toFixed(5), d: km(+la, +lo, p.lat, p.lon) });
  }
  for (const k of KINDS) out[k] = out[k].sort((a, b) => a.d - b.d).slice(0, 40).map(({ d, ...rest }) => rest);
  placesCache = { center: { lat: +la, lon: +lo }, at: Date.now(), places: out };
  writeJSON(K_PLACES, placesCache);
  return placesCache;
}

// Places that ship with the app, used when the public map servers are down. Refreshed from the live map when possible.
const SEEDS = [{ file: 'seed/arlington-va.json', lat: 38.88, lon: -77.10 }];
async function loadSeed(c) {
  const seed = SEEDS.find((x) => km(c.lat, c.lon, x.lat, x.lon) < 3);
  if (!seed || (placesCache && km(c.lat, c.lon, placesCache.center.lat, placesCache.center.lon) <= 2.5)) return false;
  try { placesCache = await fetchJSON(seed.file, {}, 6000); writeJSON(K_PLACES, placesCache); return true; } catch { return false; }
}

let placesJob = null;
function refreshPlaces(center) {   // one download at a time; refills today's board when it lands
  if (!placesJob) {
    placesJob = downloadPlaces(center || origin()).then(() => { refill(); save(); render(); }).finally(() => { placesJob = null; });
  }
  return placesJob;
}
function placeCount() { return placesCache ? KINDS.reduce((n, k) => n + placesCache.places[k].length, 0) : 0; }

function nearby(kind) {        // real places of one kind, nearest first
  const P = placesCache && placesCache.places;
  if (!P) return [];
  const o = origin();
  return (P[kind] || []).map((p) => ({ ...p, kind, d: km(o.lat, o.lon, p.lat, p.lon) })).sort((a, b) => a.d - b.d);
}
function choosePlace(slot, r) {
  let pool = nearby(slot);
  if (!pool.length && slot === 'track') pool = nearby('park');
  pool = pool.filter((p) => p.d < 8).slice(0, 6);     // close enough to walk or bike to
  if (!pool.length) return null;
  const p = pool[Math.floor(r() * pool.length)];
  return { name: p.name, lat: p.lat, lon: p.lon, kind: p.kind };
}

// ------------------------------------------------------------------ game rules
const level = (xp) => 1 + Math.floor(Math.sqrt(xp / 60));
const levelFloor = (lv) => 60 * (lv - 1) ** 2;

function lamp(stat) {          // bright (touched today or yesterday), dim (2-3 days), dark (4+ days or never)
  const last = st.last[stat];
  if (!last) return 'dark';
  const d = dayGap(last, dayKey());
  return d <= 1 ? 'bright' : d <= 3 ? 'dim' : 'dark';
}
function neglected() {         // the one lamp that most needs light; it pays +50%. None on a brand-new game
  if (!STATS.some((s) => st.last[s])) return null;
  let worst = STATS[0];
  for (const s of STATS) if ((st.last[s] || '0000') < (st.last[worst] || '0000')) worst = s;
  return lamp(worst) !== 'bright' ? worst : null;
}
const slotOf = (tpl) => (tpl.match(/\{(\w+)\}/) || [])[1] || null;
const fillText = (tpl, slot, place) => (slot ? tpl.replace(`{${slot}}`, place ? place.name : SLOT_FALLBACK[slot]) : tpl);

function pick(stat, day, indoors, avoid = [], salt = 0) {
  const r = rng(`${st.seed}:${day}:${stat}:${salt}`);
  const lv = Math.min(3, level(st.xp[stat]));
  const pool = M[stat].filter((m) => m[1] <= lv);
  const recent = new Set([...(st.recent[stat] || []).slice(-6), ...avoid]);
  let fresh = pool.filter((m) => !recent.has(m[0]));
  if (!fresh.length) fresh = pool.filter((m) => !avoid.includes(m[0]));
  if (!fresh.length) fresh = pool;
  const top = fresh.filter((m) => m[1] === lv);
  const src = top.length && r() < 0.6 ? top : fresh;
  let [id, tier, tpl, kind] = src[Math.floor(r() * src.length)];
  const plan = kind === 'out' && indoors;
  if (plan) tpl = RAIN_PLAN[id] || tpl;
  const slot = slotOf(tpl);
  const place = slot ? choosePlace(slot, r) : null;
  return { stat, id, tier, tpl, slot, place, text: fillText(tpl, slot, place), out: kind === 'out' && !plan, plan,
    done: false, xp: 0, note: '' };
}

function refill() {            // new map data arrived: give today's unfinished missions real places
  const key = dayKey(), day = st.days[key];
  if (!day) return;
  const o = origin();
  for (const m of day.board) {
    if (m.done || !m.slot) continue;
    if (m.place && km(o.lat, o.lon, m.place.lat, m.place.lon) < 8) continue;
    const p = choosePlace(m.slot, rng(`${st.seed}:${key}:${m.stat}:place:${placesCache ? placesCache.at : 0}`));
    if (p) { m.place = p; m.text = fillText(m.tpl, m.slot, p); }
  }
}

let dealing = null;
function ensureDay() {
  if (st.days[dayKey()]) return Promise.resolve();
  if (!dealing) dealing = deal().finally(() => { dealing = null; busyMsg = ''; });
  return dealing;
}
function busy(msg) { busyMsg = msg; if (!st.days[dayKey()]) render(); }

async function deal() {
  const key = dayKey();
  if (st.useLocation && !pos) { busy('Finding where you are…'); await locate(7000); }
  const o = origin();
  const far = !placesCache || km(o.lat, o.lon, placesCache.center.lat, placesCache.center.lon) > 2.5;
  if (far && navigator.onLine !== false) {
    busy('Reading the map around you…');
    await Promise.race([refreshPlaces().catch(() => {}), sleep(placesCache ? 6000 : 9000)]);
  }
  busy('Checking the sky…');
  wx = await getWeather();
  const { set } = sunToday();
  const dark = !!set && now() > new Date(set.getTime() - 30 * 60000);
  const indoors = dark || !!(wx && wx.rough);
  const day = { board: STATS.map((s) => pick(s, key, indoors)), swapped: false,
    whyIndoors: indoors ? (dark ? 'dark' : 'weather') : '' };
  for (const m of day.board) st.recent[m.stat] = [...(st.recent[m.stat] || []), m.id].slice(-12);
  st.days[key] = day;
  save();
}

const liveStreak = () => (st.lastWon && dayGap(st.lastWon, dayKey()) <= 1 ? st.streak : 0);
const doneCount = (day) => day.board.filter((m) => m.done).length;

function doDone(i, note) {
  const key = dayKey(), day = st.days[key], m = day.board[i];
  if (!m || m.done) return;
  const stat = m.stat, before = level(st.xp[stat]);
  const xp = Math.round(TIER_XP[m.tier] * (stat === neglected() ? 1.5 : 1));
  const wasWon = doneCount(day) >= WIN;
  Object.assign(m, { done: true, xp, note: note.trim().slice(0, 200) });
  st.xp[stat] += xp;
  (day.prevLast = day.prevLast || {})[stat] = st.last[stat];
  st.last[stat] = key;
  st.log.push({ date: key, stat, text: m.text, note: m.note, xp });
  const after = level(st.xp[stat]), count = doneCount(day);
  const glories = [];
  if (after > before) {
    glories.push({ kind: 'level', stat, mark: String(after), title: `${LABEL[stat]} is level ${after}`,
      sub: after <= 3 ? 'Harder missions unlocked.' : 'The lamp burns brighter.', btn: 'Keep going' });
  }
  if (count >= WIN && !wasWon) {
    day.prevStreak = [st.streak, st.lastWon, st.best];
    const gap = st.lastWon ? dayGap(st.lastWon, key) : null;
    st.streak = gap === 1 ? st.streak + 1 : 1;
    st.lastWon = key;
    st.best = Math.max(st.best, st.streak);
    glories.push({ kind: 'won', mark: '', title: 'Day won.', sub: `Streak: ${plural(st.streak, 'day')}. The rest is optional.`, btn: 'Go live' });
  } else if (count >= day.board.length) {
    glories.push({ kind: 'won', mark: '', title: 'Full light.', sub: 'All five lamps touched today. Nothing left here.', btn: 'Go live' });
  }
  save();
  closeSheet();
  render();
  pulseLamp(stat);
  toast(`+${xp} ${LABEL[stat]}` + (count < WIN ? `  ·  ${WIN - count} more to win the day` : ''));
  glories.forEach(glory);
}

function doUndo(i) {
  const key = dayKey(), day = st.days[key], m = day.board[i];
  if (!m || !m.done) return;
  st.xp[m.stat] = Math.max(0, st.xp[m.stat] - m.xp);
  st.last[m.stat] = (day.prevLast || {})[m.stat] || null;
  for (let j = st.log.length - 1; j >= 0; j--) {
    if (st.log[j].date === key && st.log[j].text === m.text) { st.log.splice(j, 1); break; }
  }
  Object.assign(m, { done: false, xp: 0, note: '' });
  if (doneCount(day) < WIN && day.prevStreak) { [st.streak, st.lastWon, st.best] = day.prevStreak; delete day.prevStreak; }
  save(); closeSheet(); render(); toast('Taken back.');
}

function doSwap(i) {
  const key = dayKey(), day = st.days[key], old = day.board[i];
  if (day.swapped || !old || old.done) return;
  const neu = pick(old.stat, key, !!day.whyIndoors, [old.id], 1);
  day.board[i] = neu; day.swapped = true;
  st.recent[neu.stat].push(neu.id);
  save(); closeSheet(); render(); toast('Swapped. That was today’s one swap.');
}

// ------------------------------------------------------------------ sky
const STARS = [[22, 18], [58, 44], [96, 12], [131, 58], [170, 26], [205, 8], [238, 49], [272, 20], [301, 62], [333, 30], [362, 12], [78, 78], [318, 88], [190, 70]];
const ARC = { x0: 34, x1: 356, base: 112, h: 84 };
const arcXY = (f) => [ARC.x0 + (ARC.x1 - ARC.x0) * f, ARC.base - Math.sin(Math.PI * f) * ARC.h];
function arcPath(a, b) {
  const pts = [];
  for (let i = 0; i <= 24; i++) { const [x, y] = arcXY(a + (b - a) * i / 24); pts.push(`${x.toFixed(1)},${y.toFixed(1)}`); }
  return 'M' + pts.join('L');
}

function renderSky() {
  const el = $('#sky');
  if (!st.town) { el.innerHTML = ''; return; }
  const t = now(), { rise, set } = sunToday();
  let f = null, phase = 'day', msg = 'No sunrise or sunset here today.';
  if (rise) {
    f = (t - rise) / (set - rise);
    const near = (d) => Math.abs(t - d) < 40 * 60000;
    phase = near(rise) ? 'dawn' : near(set) ? 'dusk' : f > 0 && f < 1 ? 'day' : 'night';
    const hm = (ms) => `${Math.floor(ms / 3600e3)}h ${pad(Math.floor(ms % 3600e3 / 60000))}m`;
    if (f < 0) msg = `First light in ${hm(rise - t)}`;
    else if (f > 1) {
      const r2 = sunTimes(origin().lat, origin().lon, new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1)).rise;
      msg = `The sun is down. First light ${r2 ? clock(r2) : 'tomorrow'}.`;
    } else msg = `${hm(set - t)} of light left`;
  }
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
  const where = `${st.town.name}${st.town.admin ? ', ' + st.town.admin : ''}`;
  const w = wx ? `${wx.temp}°F, ${wx.text}` : 'weather unavailable';
  el.innerHTML = `
    <div class="sky-top"><span class="wordmark">DAYLIGHT</span>
      <span class="sky-date">${t.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</span>
      <button class="gear" data-act="settings" aria-label="Settings">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>
      </button></div>
    <svg class="arc" viewBox="0 0 390 134" aria-hidden="true">${art}</svg>
    <div class="sky-msg">${esc(msg)}</div>
    <div class="sky-sub">${esc(w)}  ·  ${esc(where)}</div>`;
  el.classList.toggle('compact', tab !== 'today');
}

// ------------------------------------------------------------------ views
const PIN = '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 22s-7-6.4-7-12a7 7 0 0 1 14 0c0 5.6-7 12-7 12zm0-9.5a2.5 2.5 0 1 0 0-5 2.500 2.500 0 0 0 0 5z"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

function distLabel(p) {        // only when we know where you actually are
  if (!pos || !p) return '';
  const mi = km(pos.lat, pos.lon, p.lat, p.lon) * 0.6214;
  return mi < 0.1 ? 'right here' : mi < 10 ? `${mi.toFixed(1)} mi away` : `${Math.round(mi)} mi away`;
}
const offerXp = (m, bonus) => (m.done ? m.xp : Math.round(TIER_XP[m.tier] * (m.stat === bonus ? 1.5 : 1)));

function viewWelcome() {
  return `<div class="welcome">
    <h1>DAYLIGHT</h1>
    <p class="tag">An open-world game where the world is real.</p>
    <ul class="steps"><li>Your town is the map.</li><li>The sun is the clock.</li><li>The missions are your actual life.</li></ul>
    <button class="primary" data-act="ob-locate">Use my location</button>
    <div class="or">or type your town</div>
    <form data-form="ob-town"><input name="town" placeholder="Arlington, VA" autocomplete="off" autocapitalize="words" enterkeyhint="go"><button>Set map</button></form>
    <p class="err" id="ob-err">${esc(busyMsg)}</p>
    <p class="fine">No account. Your missions, notes and journal stay on this phone. Weather and place names come from
      Open-Meteo and OpenStreetMap, which only receive rounded coordinates.</p></div>`;
}

function viewToday() {
  const day = st.days[dayKey()];
  if (!day) return `<div class="loading"><div class="spinner"></div><p>${esc(busyMsg || 'Dealing today’s board…')}</p></div>`;
  const done = doneCount(day), bonus = neglected();
  const cards = day.board.map((m, i) => {
    const d = m.place ? distLabel(m.place) : '';
    return `<li class="card ${m.done ? 'done' : ''}" data-act="open" data-i="${i}" style="--c:var(--${m.stat})">
      <span class="check">${m.done ? CHECK : ''}</span>
      <div class="card-body">
        <div class="card-top"><span class="stat">${LABEL[m.stat]}</span>${m.out ? '<span class="out">☀ outdoors</span>' : ''}
          ${m.stat === bonus && !m.done ? '<span class="bonus">+50%</span>' : ''}<span class="xp">+${offerXp(m, bonus)}</span></div>
        <p>${esc(m.text)}</p>
        ${m.place && !m.done ? `<span class="where">${PIN} ${esc(m.place.name)}${d ? ' · ' + d : ''}</span>` : ''}
        ${m.done && m.note ? `<q>${esc(m.note)}</q>` : ''}
      </div></li>`;
  }).join('');
  const notes = [];
  if (day.board.some((m) => m.out && !m.done)) notes.push('<span>☀ Outdoor missions are best done before the sun goes down.</span>');
  if (day.board.some((m) => m.plan)) {
    notes.push(day.whyIndoors === 'weather' ? '<span>Rough weather today, so outdoor missions switched to their indoor plan.</span>'
      : '<span>The board opened after dark, so outdoor missions switched to their indoor plan.</span>');
  }
  if (bonus && day.board.some((m) => m.stat === bonus && !m.done)) {
    notes.push(`<span class="amber">Your ${LABEL[bonus]} lamp is going dark. Its mission pays +50% today.</span>`);
  }
  const streak = liveStreak();
  const status = done >= day.board.length ? '<b>Full light.</b><br>All five. There is nothing left here today.'
    : done >= WIN ? '<b>Day won.</b><br>The other missions are optional. Close this and go live.'
      : `${done} of ${WIN} done${streak ? `  ·  streak ${plural(streak, 'day')}` : ''}`;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !navigator.standalone && !localStorage.getItem(K_TIP);
  return `<h2 class="sec">Today's board <span>any ${WIN} wins the day</span></h2>
    <ol class="missions">${cards}</ol>
    ${notes.length ? `<div class="notes">${notes.join('')}</div>` : ''}
    <div class="lamprow" data-act="tab" data-tab="lamps">${STATS.map((s) =>
      `<div><span class="orb ${lamp(s)}" id="orb-${s}" style="--c:var(--${s})"></span>${LABEL[s]}</div>`).join('')}</div>
    <p class="status">${status}</p>
    ${ios ? '<div class="tip"><span>To keep Daylight as an app: tap Share, then <b>Add to Home Screen</b>.</span><button data-act="tip-ok">OK</button></div>' : ''}`;
}

function viewLamps() {
  const rows = STATS.map((s) => {
    const xp = st.xp[s], lv = level(xp), lo = levelFloor(lv), hi = levelFloor(lv + 1);
    const last = st.last[s], ago = !last ? 'never lit' : last === dayKey() ? 'lit today' : `lit ${plural(dayGap(last, dayKey()), 'day')} ago`;
    const state = lamp(s);
    return `<div class="lamp" style="--c:var(--${s})"><span class="orb ${state}"><b>${lv}</b></span>
      <div class="lamp-main"><div class="lamp-name">${LABEL[s]} <small>${MEANS[s]}</small></div>
        <div class="bar"><i style="width:${Math.round(100 * (xp - lo) / (hi - lo))}%"></i></div>
        <div class="lamp-meta"><span>${state === 'bright' ? 'bright' : state === 'dim' ? 'dimming' : 'dark'} · ${ago}</span><span>${xp} / ${hi} xp</span></div>
      </div></div>`;
  }).join('');
  const total = STATS.reduce((n, s) => n + st.xp[s], 0);
  const won = Object.values(st.days).filter((d) => doneCount(d) >= WIN).length;
  const today = keyDate(dayKey());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - today.getDay()));
  let cells = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => `<span class="dow">${d}</span>`).join('');
  for (let i = 34; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i), k = dayKey(d);
    const n = st.days[k] ? doneCount(st.days[k]) : 0;
    const cls = d > today ? 'future' : n >= WIN ? 'won' : n > 0 ? 'some' : '';
    cells += `<span class="cell ${cls} ${k === dayKey() ? 'today' : ''}">${d.getDate()}</span>`;
  }
  return `<h2 class="sec">Your five lamps <span>dim after 2 days, dark after 4</span></h2>${rows}
    <div class="totals"><div><b>${1 + Math.floor(Math.sqrt(total / 150))}</b>level</div><div><b>${liveStreak()}</b>streak</div>
      <div><b>${st.best}</b>best</div><div><b>${won}</b>days won</div></div>
    <h2 class="sec">Last five weeks</h2><div class="cal">${cells}</div>
    <p class="legend">Gold days are days you won. Outlined days you did one or two missions.</p>`;
}

function viewJournal() {
  if (!st.log.length) return '<div class="empty">Nothing logged yet.<br>The journal fills itself as you play.</div>';
  let html = `<h2 class="sec">What you actually did <span>${plural(st.log.length, 'mission')}</span></h2>`, last = null;
  for (const e of [...st.log].reverse().slice(0, 200)) {
    if (e.date !== last) {
      last = e.date;
      html += `<div class="jday">${keyDate(last).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</div>`;
    }
    html += `<div class="jrow" style="--c:var(--${e.stat})"><small>${LABEL[e.stat]} · +${e.xp}</small>${esc(e.text)}${e.note ? `<q>${esc(e.note)}</q>` : ''}</div>`;
  }
  return html;
}

function render() {
  const app = $('#app');
  app.classList.toggle('onboarding', !st.town);
  if (!st.town) { $('#mapwrap').hidden = true; $('#view').hidden = false; $('#view').innerHTML = viewWelcome(); return; }
  renderSky();
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
  const isMap = tab === 'map';
  $('#mapwrap').hidden = !isMap;
  $('#view').hidden = isMap;
  if (isMap) return showMap();
  $('#view').innerHTML = tab === 'lamps' ? viewLamps() : tab === 'journal' ? viewJournal() : viewToday();
}

// ------------------------------------------------------------------ map
let map = null, layer = null, meMarker = null, mapFilter = 'all', focusPlace = null, mapFresh = true;
const mapsLink = (p) => `https://maps.apple.com/?daddr=${p.lat},${p.lon}&dirflg=w`;

function popupHtml(p, mission) {
  const d = distLabel(p);
  return `<b>${esc(p.name)}</b><small>${KIND_ONE[p.kind] || ''}${d ? ' · ' + d : ''}</small>` +
    (mission ? `<em>${LABEL[mission.stat]}: ${esc(mission.text)}</em>` : '') +
    `<a class="go" href="${mapsLink(p)}" target="_blank" rel="noopener">Directions</a>`;
}

function renderChips() {
  const chips = [['all', 'All', ''], ['today', 'Today’s missions', '#ffc94a'], ...KINDS.filter((k) => nearby(k).length).map((k) => [k, KIND_TITLE[k], KIND_COLOR[k]])];
  $('#chips').innerHTML = chips.map(([k, t, c]) =>
    `<button class="chip ${mapFilter === k ? 'on' : ''}" data-act="chip" data-k="${k}">${c ? `<i style="--k:${c}"></i>` : ''}${t}</button>`).join('');
}

function showMap() {
  renderChips();
  const o = origin(), mapEl = $('#map');
  if (!window.L) {       // no map library (offline on first run): fall back to a plain list
    mapEl.innerHTML = `<div class="maplist">${KINDS.map((k) => nearby(k).length ? `<h2 class="sec">${KIND_TITLE[k]}</h2>` +
      nearby(k).slice(0, 12).map((p) => `<a class="ghost" href="${mapsLink(p)}" target="_blank" rel="noopener">${esc(p.name)}</a>`).join('') : '').join('') ||
      '<div class="empty">The map needs a connection the first time.</div>'}</div>`;
    return;
  }
  if (!map) {
    map = L.map(mapEl, { zoomControl: false }).setView([o.lat, o.lon], 14);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
    layer = L.layerGroup().addTo(map);
  }
  const fit = mapFresh || !!focusPlace;     // only move the map when you arrive on it, not on background refreshes
  mapFresh = false;
  setTimeout(() => {
    map.invalidateSize();
    if (fit || !document.querySelector('.leaflet-popup')) drawMarkers(fit);
  }, 60);
}

function drawMarkers(fit) {
  if (!map) return;
  layer.clearLayers();
  const day = st.days[dayKey()];
  const missions = day ? day.board.map((m, i) => ({ m, i })).filter((x) => x.m.place && !x.m.done) : [];
  const onBoard = new Set(missions.map((x) => x.m.place.name));
  const bounds = [];
  let opened = null;
  if (mapFilter !== 'today') {
    for (const k of KINDS) {
      if (mapFilter !== 'all' && mapFilter !== k) continue;
      for (const p of nearby(k)) {
        if (onBoard.has(p.name)) continue;
        L.circleMarker([p.lat, p.lon], { radius: 7, color: '#fff', weight: 2, fillColor: KIND_COLOR[k], fillOpacity: 0.95 })
          .bindPopup(popupHtml(p), { maxWidth: 220, autoPanPadding: [16, 60] }).addTo(layer);
        if (mapFilter !== 'all') bounds.push([p.lat, p.lon]);
      }
    }
  }
  for (const { m, i } of missions) {
    const mk = L.marker([m.place.lat, m.place.lon], { zIndexOffset: 500,
      icon: L.divIcon({ className: '', html: `<div class="pin-sun" style="width:30px;height:30px">${i + 1}</div>`, iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -14] }) })
      .bindPopup(popupHtml(m.place, m), { maxWidth: 220, autoPanPadding: [16, 60] }).addTo(layer);
    if (mapFilter === 'today' || mapFilter === 'all') bounds.push([m.place.lat, m.place.lon]);
    if (focusPlace && focusPlace === m.place.name) opened = mk;
  }
  if (pos) {
    meMarker = L.marker([pos.lat, pos.lon], { zIndexOffset: 900, interactive: false,
      icon: L.divIcon({ className: '', html: '<div class="pin-me" style="width:18px;height:18px"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }) }).addTo(layer);
    bounds.push([pos.lat, pos.lon]);
  }
  if (opened) { map.setView(opened.getLatLng(), 16); opened.openPopup(); focusPlace = null; }
  else if (fit) {
    if (bounds.length > 1) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    else { const o = origin(); map.setView([o.lat, o.lon], 14); }
  }
}

// ------------------------------------------------------------------ sheets, toasts, glory
function openSheet(html) { $('#sheet').innerHTML = html; $('#sheet').hidden = false; $('#backdrop').hidden = false; $('#sheet').scrollTop = 0; }
function closeSheet() { $('#sheet').hidden = true; $('#backdrop').hidden = true; }

function toast(msg) {
  const t = $('#toast');
  t.hidden = true; void t.offsetWidth;      // restart the animation
  t.textContent = msg; t.hidden = false;
  clearTimeout(toast.timer); toast.timer = setTimeout(() => { t.hidden = true; }, 2600);
}
function pulseLamp(stat) { const o = $('#orb-' + stat); if (o) o.classList.add('pulse'); }

const gloryQueue = [];
function glory(g) { gloryQueue.push(g); if ($('#glory').hidden) nextGlory(); }
function nextGlory() {
  const g = gloryQueue.shift(), el = $('#glory');
  if (!g) { el.hidden = true; return; }
  el.className = g.kind === 'level' ? 'level' : '';
  el.style.setProperty('--c', g.stat ? `var(--${g.stat})` : '#ffb23e');
  el.innerHTML = `<div class="rays"></div><div class="in"><div class="disc">${esc(g.mark)}</div><h2>${esc(g.title)}</h2><p>${esc(g.sub)}</p>
    <button data-act="glory-next">${esc(g.btn)}</button></div>`;
  el.hidden = false;
}

function missionSheet(i) {
  const day = st.days[dayKey()], m = day.board[i], bonus = neglected();
  const place = m.place ? `<div class="place"><b>${esc(m.place.name)}</b><small>${KIND_ONE[m.place.kind] || ''}${distLabel(m.place) ? ' · ' + distLabel(m.place) : ''}</small>
    <div class="row"><button class="ghost" data-act="showmap" data-i="${i}">Show on map</button>
    <a class="ghost" href="${mapsLink(m.place)}" target="_blank" rel="noopener">Directions</a></div></div>` : '';
  const body = m.done
    ? `${m.note ? `<p class="fine">“${esc(m.note)}”</p>` : ''}<button class="ghost" data-act="undo" data-i="${i}">Take it back</button>`
    : `${place}<textarea id="note" maxlength="200" placeholder="One line on how it went (optional)"></textarea>
       <button class="primary" data-act="done" data-i="${i}">Done</button>
       <button class="ghost" data-act="swap" data-i="${i}" ${day.swapped ? 'disabled' : ''}>${day.swapped ? 'Today’s swap is used' : 'Swap for another (once a day)'}</button>`;
  openSheet(`<div style="--c:var(--${m.stat})"><div class="sh-head"><span>${LABEL[m.stat]}</span>${m.out ? '<span style="color:var(--sun)">☀ outdoors</span>' : ''}
    <span class="xp">${m.done ? 'earned ' : ''}+${offerXp(m, bonus)} xp</span></div>
    <p class="sh-text">${esc(m.text)}</p>${body}</div>`);
}

const RULES = `<b>The rules</b>
1. Every day the board deals five missions, one for each lamp: BODY, BONDS, MONEY, WORK, SOCIAL.
2. Do any three and you have won the day. Do all five for full light.
3. You do the mission in the real world, then come back and log it. Nobody checks. Cheating only works on people who aren't you.
4. A lamp you ignore dims after two days and goes dark after four. The lamp that most needs light pays +50%, so the game pulls you toward the part of your life you've been avoiding.
5. Missions get harder as a lamp levels up: small acts first, then real ones.
6. One swap a day. One.

<b>Why it is built this way</b>
It ends. Three missions and the game tells you to leave. No feed, no notifications, nothing to check.

The world is real. Places come from OpenStreetMap, sunrise and sunset are computed for where you are, the weather is today's weather. On a rough day or after dark, outdoor missions switch to an indoor plan.

It is yours. No account, no AI, and your journal lives on this phone.

The journal is the prize. Levels are a toy. The journal after six months is a record of a life you actually went out and had.`;

function settingsSheet() {
  const t = st.town;
  openSheet(`<h3>Your map</h3>
    <p>${esc(t.name)}${t.admin ? ', ' + esc(t.admin) : ''} · ${plural(placeCount(), 'real place')}</p>
    <form class="inline" data-form="town"><input name="town" placeholder="Change town: City, ST" autocomplete="off" autocapitalize="words"><button>Set</button></form>
    <p class="fine" id="town-err"></p>
    <label class="toggle"><span><b>Use my location</b><br><span class="fine">Picks places near where you are and shows how far they are.</span></span>
      <input type="checkbox" id="useloc" ${st.useLocation ? 'checked' : ''}></label>
    <button class="ghost" data-act="refresh-map">Download places again</button>
    <h4>The game</h4>
    <button class="ghost" data-act="rules">Rules and reasons</button>
    <h4>Your data</h4>
    <button class="ghost" data-act="export">Save a backup file</button>
    <label class="ghost">Restore from a backup<input type="file" id="import" accept="application/json,.json" hidden></label>
    <button class="ghost danger" data-act="restart">Restart the game</button>
    <p class="fine" style="margin-top:14px">Your missions, notes and journal are stored only in this browser on this phone. Weather (Open-Meteo) and
      place names (OpenStreetMap) receive coordinates rounded to about half a mile. Map tiles come from OpenStreetMap.</p>`);
}

// ------------------------------------------------------------------ actions
async function setTown(text, errEl) {
  const say = (m) => { busyMsg = m; if (errEl()) errEl().textContent = m; };
  say('Looking that up…');
  let t;
  try { t = await geocode(text); } catch { return say("Couldn't look that up. Are you online?"); }
  if (!t) return say(`No town found for “${text}”. Try “City, ST”.`);
  await adoptTown(t, say);
}

async function adoptTown(t, say) {
  const key = dayKey(), today = st.days[key];
  st.town = t;
  if (today && !doneCount(today)) {       // nothing done yet: deal again for the new map
    for (const m of today.board) { const r = st.recent[m.stat]; if (r[r.length - 1] === m.id) r.pop(); }
    delete st.days[key];
  }
  save();
  say('Reading the map of real places…');
  if (pos && km(pos.lat, pos.lon, t.lat, t.lon) > 8) { pos = null; st.useLocation = false; save(); }   // a town far from here wins
  if (await loadSeed(pos || t)) refreshPlaces(pos || t).catch(() => {});       // bundled places now, live ones when they arrive
  else await Promise.race([refreshPlaces(pos || t).catch(() => {}), sleep(12000)]);   // don't hold the game for a slow map server
  busyMsg = '';
  closeSheet();
  tab = 'today';
  if (map) { map.remove(); map = null; }
  render();
  await ensureDay();
  refill(); save(); render();
  toast(placeCount() ? `${plural(placeCount(), 'real place')} on your map` : 'The map servers are slow. Place names will arrive shortly.');
}

async function obLocate() {
  const err = () => $('#ob-err');
  err().textContent = 'Finding where you are…';
  const p = await locate(12000);
  if (!p) { err().textContent = 'Couldn’t get your location. Allow Location for this page, or type your town.'; return; }
  st.useLocation = true;
  const n = await reverseName(p);
  await adoptTown({ ...n, lat: +p.lat.toFixed(3), lon: +p.lon.toFixed(3) }, (m) => { if (err()) err().textContent = m; });
}

async function exportBackup() {
  const blob = new Blob([JSON.stringify({ app: 'daylight', state: st }, null, 1)], { type: 'application/json' });
  const name = `daylight-backup-${dayKey()}.json`;
  const file = new File([blob], name, { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file] }); return; } catch { return; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

const ACTIONS = {
  tab(el) { tab = el.dataset.tab; mapFresh = true; mapFilter = tab === 'map' ? mapFilter : 'all'; render(); if (tab !== 'map') $('#view').scrollTop = 0; },
  open(el) { missionSheet(+el.dataset.i); },
  done(el) { doDone(+el.dataset.i, ($('#note') || {}).value || ''); },
  undo(el) { doUndo(+el.dataset.i); },
  swap(el) { doSwap(+el.dataset.i); },
  showmap(el) { const m = st.days[dayKey()].board[+el.dataset.i]; focusPlace = m.place.name; mapFilter = 'today'; tab = 'map'; closeSheet(); render(); },
  chip(el) { mapFilter = el.dataset.k; renderChips(); drawMarkers(true); },
  async locate() {
    toast('Finding you…');
    const p = await locate(10000);
    if (!p) return toast('Location is off for this page.');
    drawMarkers(false); map && map.setView([p.lat, p.lon], 15);
  },
  'close-sheet': closeSheet,
  'glory-next': nextGlory,
  'tip-ok'() { localStorage.setItem(K_TIP, '1'); render(); },
  settings: settingsSheet,
  rules() { openSheet(`<h3>Daylight</h3><div class="rules">${RULES}</div><button class="ghost" data-act="close-sheet">Close</button>`); },
  'ob-locate': obLocate,
  export: exportBackup,
  async 'refresh-map'(el) {
    el.textContent = 'Downloading…'; el.disabled = true;
    try { await downloadPlaces(origin()); refill(); save(); closeSheet(); render(); toast(`${plural(placeCount(), 'real place')} on your map`); }
    catch { el.textContent = 'Map servers are busy. Try again'; el.disabled = false; }
  },
  restart(el) {
    if (el.dataset.sure) {
      const keep = { town: st.town, useLocation: st.useLocation };
      st = Object.assign(freshState(), keep); save(); closeSheet(); tab = 'today'; render(); ensureDay().then(render); toast('A fresh game.');
    } else { el.dataset.sure = '1'; el.textContent = 'Tap again to erase all progress'; }
  },
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  if (el.tagName === 'A') return;
  const fn = ACTIONS[el.dataset.act];
  if (fn) fn(el);
});
document.addEventListener('submit', (e) => {
  const f = e.target.dataset.form;
  if (!f) return;
  e.preventDefault();
  const text = new FormData(e.target).get('town').trim();
  if (!text) return;
  if (f === 'ob-town') setTown(text, () => $('#ob-err'));
  if (f === 'town') setTown(text, () => $('#town-err'));
});
document.addEventListener('change', async (e) => {
  if (e.target.id === 'useloc') {
    st.useLocation = e.target.checked;
    if (st.useLocation) { const p = await locate(10000); if (!p) { st.useLocation = false; e.target.checked = false; toast('Location is off for this page.'); } }
    else pos = null;
    save(); refill(); save(); render();
    if (st.useLocation && pos && placesCache && km(pos.lat, pos.lon, placesCache.center.lat, placesCache.center.lon) > 2.5) refreshPlaces().catch(() => {});
  }
  if (e.target.id === 'import' && e.target.files[0]) {
    try {
      const j = JSON.parse(await e.target.files[0].text()), s = j.state || j;
      if (!validState(s)) throw new Error('not a backup');
      st = s; save(); closeSheet(); tab = 'today'; render(); ensureDay().then(render); toast('Backup restored.');
    } catch { toast('That file isn’t a Daylight backup.'); }
  }
});

// ------------------------------------------------------------------ start
async function wake() {        // on open and whenever the app comes back to the front
  if (!st.town) return render();
  render();
  if (st.useLocation) locate(8000).then((p) => { if (p) { render(); } });
  await ensureDay();
  wx = await getWeather();
  render();
  const stale = !placeCount() || Date.now() - placesCache.at > 30 * 864e5;      // nothing yet, bundled, or a month old
  if (stale && navigator.onLine !== false) {
    if (!placeCount() && await loadSeed(origin())) { refill(); save(); render(); }
    refreshPlaces().catch(() => {});
  }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });
setInterval(() => { if (st.town && !document.hidden) { if (!st.days[dayKey()]) wake(); else renderSky(); } }, 60000);
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
wake();
