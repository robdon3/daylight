'use strict';
/* DAYLIGHT, phone edition: an open-world game where the world is real.
   One page, no account, no server of its own. Everything you log stays in this browser. */

// ------------------------------------------------------------------ rules data
const STATS = ['body', 'bonds', 'money', 'work', 'social'];
const LABEL = { body: 'BODY', bonds: 'BONDS', money: 'MONEY', work: 'WORK', social: 'SOCIAL' };
const MEANS = { body: 'fitness', bonds: 'relationships', money: 'making and keeping it', work: 'doing the job', social: 'being among people' };
const TIER_XP = { 1: 20, 2: 35, 3: 55 };
const WIN = 3;
const QUEST_STEP_XP = 25, QUEST_DONE_XP = 100;
const STREAK_REWARDS = { 3: 10, 7: 25, 14: 40, 30: 75, 60: 100, 100: 150 };   // xp to every lamp
const SECOND_SWAP_AT = 7;                                                    // streak that earns a second daily swap

// [id, tier, text, kind]   kind: "" anywhere, "out" = outdoors (has a rain/night plan)
// Slots: {park} {track} {gym} {library} {cafe} {hub} {sight}
const M = {
  body: [
    ['b1', 1, 'Walk to {park} and do one full lap of it.', 'out'],
    ['b2', 1, 'Take a 20-minute walk with no headphones.', 'out'],
    ['b3', 1, 'Do 10 squats and 10 push-ups (knees are fine). Twice today.', ''],
    ['b4', 1, 'Drink water with every meal today and be in bed 30 minutes earlier.', ''],
    ['b11', 1, 'Walk to {park}, find a bench, and sit five minutes with your phone away.', 'out'],
    ['b12', 1, 'Take the stairs every time today.', ''],
    ['b13', 1, 'Walk to {cafe} instead of making coffee at home.', 'out'],
    ['b20', 1, 'Be outside for the last 30 minutes of daylight today.', 'out'],
    ['b5', 2, 'Run or jog for 15 minutes at {track}.', 'out'],
    ['b6', 2, 'Walk into {gym} and ask what a first visit costs.', ''],
    ['b7', 2, 'Walk somewhere you would normally drive to.', 'out'],
    ['b14', 2, 'Walk a loop that touches {park} and one other park. No headphones.', 'out'],
    ['b15', 2, 'Do three sets of pull-ups, dips or step-ups on whatever {park} has.', 'out'],
    ['b16', 2, 'Go to {gym} and do 20 minutes of anything.', ''],
    ['b19', 2, 'Eat three real meals today, each with a vegetable.', ''],
    ['b8', 3, 'Cover 5 km on foot today, in one go or in pieces.', 'out'],
    ['b9', 3, 'Do a full workout at {gym}, or 40 minutes of hard effort anywhere.', ''],
    ['b10', 3, 'Cook a real dinner from raw ingredients. No delivery today.', ''],
    ['b17', 3, 'Run to {sight} and back, or walk it fast.', 'out'],
    ['b18', 3, 'Swim, lift or take a class at {gym}. A full session.', ''],
  ],
  bonds: [
    ['r1', 1, "Call someone you haven't spoken to in a month. Voice, not text.", ''],
    ['r2', 1, 'Tell one person exactly what you appreciate about them.', ''],
    ['r3', 1, 'Eat one meal with someone today, phones out of sight.', ''],
    ['r4', 1, 'Send a photo from your day to a family member, with one sentence about it.', ''],
    ['r11', 1, 'Text someone a specific memory you share with them.', ''],
    ['r12', 1, 'Ask someone how their week really was, and ask one follow-up question.', ''],
    ['r18', 1, 'Put your phone in another room for one full conversation today.', ''],
    ['r5', 2, 'Invite someone for a walk at {park}.', 'out'],
    ['r6', 2, 'Write a short note by hand and give it or mail it.', ''],
    ['r7', 2, 'Ask someone older than you about a year of their life you know nothing about.', ''],
    ['r13', 2, 'Take someone to {cafe}. Your treat.', ''],
    ['r14', 2, 'Walk with someone to {sight} and learn one thing about it together.', 'out'],
    ['r15', 2, 'Put the birthdays of five people you love in your calendar.', ''],
    ['r19', 2, 'Introduce two people you know who should know each other.', ''],
    ['r8', 3, "Have the conversation you've been putting off. Start it today.", ''],
    ['r9', 3, 'Plan something for someone else: a dinner, a trip, a surprise. Put a date on it.', ''],
    ['r10', 3, 'Apologize for the thing you never apologized for.', ''],
    ['r16', 3, 'Cook for someone, or bring food to their door.', ''],
    ['r17', 3, 'Write a real letter to someone who shaped you. Mail it.', ''],
    ['r20', 3, 'Visit someone in person who you usually only text.', ''],
  ],
  money: [
    ['m1', 1, 'Write down every dollar you spend today.', ''],
    ['m2', 1, 'Look at your bank balance and your last 10 transactions. Just look.', ''],
    ['m3', 1, "Cancel one subscription you haven't used this month.", ''],
    ['m4', 1, 'Spend nothing today except on food and getting around.', ''],
    ['m12', 1, 'Check the price of one thing you buy every week at a second store.', ''],
    ['m13', 1, 'Make coffee or lunch at home today and note what you saved.', ''],
    ['m14', 1, 'Delete one shopping app or unsubscribe from five marketing emails.', ''],
    ['m5', 2, 'Move any amount, even $5, into savings today.', ''],
    ['m6', 2, 'Write your net worth on paper: what you own minus what you owe.', ''],
    ['m7', 2, 'Find one bill you could lower, and make the call or send the message.', ''],
    ['m8', 2, "List for sale one thing you own and don't use.", ''],
    ['m15', 2, "Read your last pay stub line by line. Look up one thing you don't understand.", ''],
    ['m16', 2, 'Go to {library} and borrow something instead of buying it.', ''],
    ['m17', 2, 'Check your credit report or score. Fix or note one thing.', ''],
    ['m20', 2, 'Name the three biggest things you spent on last month, and what each got you.', ''],
    ['m9', 3, 'Earn money outside your main job today: a gig, a sale, a favor with a price.', ''],
    ['m10', 3, 'Set up one automatic transfer to savings or to a debt.', ''],
    ['m11', 3, 'Ask for something worth money: a raise, a discount, a better rate.', ''],
    ['m18', 3, 'Write a one-page plan for your next $1,000 of savings.', ''],
    ['m19', 3, 'Raise your retirement or savings contribution by 1%.', ''],
  ],
  work: [
    ['w1', 1, "Do the task you've been avoiding for 25 minutes, phone in another room.", ''],
    ['w2', 1, 'Clear and clean the place where you work.', ''],
    ['w3', 1, "Write tomorrow's three most important tasks on paper before tonight.", ''],
    ['w4', 1, 'Finish one small thing completely today. Not 90%.', ''],
    ['w12', 1, 'Work one 45-minute block at {cafe}, one task only.', ''],
    ['w13', 1, 'Write down what you finished today, before you stop working.', ''],
    ['w14', 1, 'Close every tab and window you are not using. Then start.', ''],
    ['w5', 2, 'Do a 60-minute work block at {library}.', ''],
    ['w6', 2, 'Teach someone one thing you know how to do.', ''],
    ['w7', 2, 'Update one line of your resume with something you did this year.', ''],
    ['w8', 2, 'Spend 30 minutes learning a skill your work will need next year.', ''],
    ['w15', 2, 'Read for 30 minutes at {library}: something for your work, on paper.', ''],
    ['w16', 2, 'Ask one person for honest feedback on one specific thing.', ''],
    ['w17', 2, 'Write a how-to for something only you know how to do.', ''],
    ['w20', 2, 'Plan next week on one page at {library}.', ''],
    ['w9', 3, "Show someone work you haven't shown anyone, and ask what's weak about it.", ''],
    ['w10', 3, "Ask someone whose job you'd want how they got it.", ''],
    ['w11', 3, 'Make something and put it where other people can see it.', ''],
    ['w18', 3, 'Spend two hours on the project that matters most. Phone off.', ''],
    ['w19', 3, 'Apply, pitch or volunteer for one thing a little out of your reach.', ''],
  ],
  social: [
    ['s1', 1, 'Say hello to a neighbor and learn their name.', ''],
    ['s2', 1, 'Go to {cafe} and stay 20 minutes without looking at a screen.', ''],
    ['s3', 1, 'Give a stranger a real compliment.', ''],
    ['s4', 1, 'Learn the name of someone you see every week: a cashier, a barista, a guard.', ''],
    ['s12', 1, 'Walk through {hub} and read every notice on the board.', ''],
    ['s13', 1, 'Hold a door, carry a bag, or offer your seat. On purpose.', ''],
    ['s14', 1, 'Buy something small at {cafe} and learn the name of the person who served you.', ''],
    ['s5', 2, 'Go to {hub} and find out what happens there this week.', ''],
    ['s6', 2, "Start a conversation with someone you don't know. Two minutes is enough.", ''],
    ['s7', 2, "Say yes to an invitation you'd normally decline, or make one.", ''],
    ['s15', 2, 'Spend an hour reading at {library} instead of at home.', ''],
    ['s16', 2, 'Visit {sight} and ask someone there what they think of it.', 'out'],
    ['s17', 2, 'Go to {park} and stay 30 minutes with no screen. Watch who uses it.', 'out'],
    ['s20', 2, 'Thank someone who works in your neighborhood, by name if you can.', ''],
    ['s9', 3, 'Go to something where you know no one: a class, a club, a pickup game.', ''],
    ['s10', 3, 'Volunteer one hour this week. Sign up today.', ''],
    ['s11', 3, 'Get three or more people together in one place. You host.', ''],
    ['s18', 3, 'Find a group that meets at {hub} and go to its next meeting.', ''],
    ['s19', 3, 'Invite a neighbor or coworker to {cafe}.', ''],
  ],
};
// what an outdoor mission becomes when it's dark or the weather is rough
const RAIN_PLAN = {
  b1: 'Walk for 20 minutes under cover: stairs, hallways, a mall.',
  b2: 'Do 10 minutes of stretching on the floor, no screen.',
  b5: 'Climb stairs for 10 minutes without stopping.',
  b7: 'Do a 20-minute bodyweight workout at home.',
  b8: 'Do 40 minutes of movement indoors, in one go or in pieces.',
  b11: 'Sit by a window for five minutes with your phone away.',
  b13: 'Do 15 minutes of stretching at home.',
  b14: 'Walk for 25 minutes under cover: stairs, hallways, a mall.',
  b15: 'Do three sets of push-ups, squats and planks at home.',
  b17: 'Do 30 minutes of hard effort indoors.',
  b20: 'Step outside for five minutes of night air before bed.',
  r5: 'Invite someone for coffee or a call this week, and set the time.',
  r14: 'Call someone and learn one thing about their week.',
  s16: "Start a conversation with someone you don't know. Two minutes is enough.",
  s17: 'Go to a public indoor place and stay 30 minutes with no screen.',
};

// Quests: five steps, one step a day, on top of the daily board.
const QUESTS = [
  { id: 'q_b1', stat: 'body', name: 'First mile', steps: ['Walk 10 minutes without stopping.', 'Walk 20 minutes. Note how you feel after.',
    'Walk 10, jog 2, walk 10.', 'Jog 5 minutes without stopping, any pace.', 'Cover one mile without stopping, running as much as you can.'] },
  { id: 'q_b2', stat: 'body', name: 'Sleep reset', steps: ['Set a bedtime and an alarm for it. Be in bed by then tonight.',
    'No screens for the last 30 minutes before bed.', 'No caffeine after noon today.', 'Get outside within an hour of waking.',
    'Hit your bedtime again. Write down how your mornings changed.'] },
  { id: 'q_r1', stat: 'bonds', name: 'The reunion', steps: ['Pick one person you have drifted from. Write down why they matter.',
    'Send them a message that names a specific memory.', 'Suggest a real plan: a call or a meeting, with a date.',
    'Have the call or the meeting. Ask more than you tell.', 'Put the next time in both your calendars.'] },
  { id: 'q_r2', stat: 'bonds', name: 'Family record', steps: ['Ask an older relative where they lived at your age.', 'Ask them about their first job.',
    'Ask for the story behind one old photo.', 'Write down the three best things you heard this week.', 'Send what you wrote to someone else in the family.'] },
  { id: 'q_m1', stat: 'money', name: 'Know your number', steps: ['List every account you have, with balances.', 'List every debt, with its rate.',
    'List every subscription and recurring charge.', 'Add up one month of spending by category.', 'Write your net worth and one number you want to change.'] },
  { id: 'q_m2', stat: 'money', name: 'The cushion', steps: ['Open or pick a separate savings account for emergencies.', 'Move the first amount in, however small.',
    'Set an automatic weekly transfer.', 'Find one expense to cut and redirect it to the cushion.', 'Write the target, one month of expenses, and how far along you are.'] },
  { id: 'q_w1', stat: 'work', name: 'Ship one thing', steps: ['Pick one small thing you can finish in a week. Write what "done" means.',
    'Do the hardest part first, for 45 minutes.', 'Get it to rough but complete.', 'Show it to one person and fix what they find.',
    'Ship it: send it, publish it, hand it over.'] },
  { id: 'q_w2', stat: 'work', name: 'The next job', steps: ['Write down the job you want in three years.', 'Find three people who have it. Read how they got there.',
    'List the two skills you are missing.', 'Spend an hour on the first one.', 'Ask one of those three people a single specific question.'] },
  { id: 'q_s1', stat: 'social', name: 'Regular', steps: ['Pick one local place to become a regular at.', 'Go there. Stay 20 minutes.', 'Go again. Learn one name.',
    'Go again. Have one real exchange.', 'Go once more. Notice who nods at you now.'] },
  { id: 'q_s2', stat: 'social', name: 'Host', steps: ['Pick a date and a simple reason to get people together.', 'Invite three people today, out loud or by message.',
    'Plan the one thing you need: food, a place, a game.', 'Confirm with everyone the day before.', 'Hold it. Phones away for the first half hour.'] },
];
const questById = (id) => QUESTS.find((q) => q.id === id);

const SLOT_FALLBACK = {
  park: 'a park near you', track: 'a track or park near you', gym: 'a gym or rec center near you',
  library: 'a library or quiet public place', cafe: 'a cafe near you', hub: 'a community center or market near you',
  sight: 'a landmark or memorial near you',
};
const KINDS = ['park', 'track', 'gym', 'library', 'cafe', 'hub', 'sight'];
const KIND_TITLE = { park: 'Parks', track: 'Tracks', gym: 'Gyms & pools', library: 'Libraries', cafe: 'Cafes', hub: 'Community', sight: 'Sights' };
const KIND_ONE = { park: 'Park', track: 'Track', gym: 'Gym, pool or rec center', library: 'Library', cafe: 'Cafe',
  hub: 'Community center or market', sight: 'Landmark, memorial or artwork' };
const KIND_COLOR = { park: '#2f9e5b', track: '#e4572e', gym: '#e4572e', library: '#3b7dd8', cafe: '#b9770e', hub: '#8a52d9', sight: '#12909c' };
const FIND_REACH = { park: 120, track: 120, gym: 60, library: 60, cafe: 60, hub: 60, sight: 60 };      // meters: walking past discovers it
const CHECK_REACH = { park: 200, track: 200, gym: 120, library: 120, cafe: 120, hub: 120, sight: 120 }; // meters: close enough to check in
const RANKS = [[0, 'Newcomer'], [3, 'Wanderer'], [10, 'Local'], [25, 'Regular'], [50, 'Pathfinder'], [100, 'Cartographer']];
const PLACES_V = 2;
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
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];

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
const metersTo = (p) => km(pos.lat, pos.lon, p.lat, p.lon) * 1000;
const farText = (m) => (m < 300 ? `${Math.max(10, Math.round(m * 3.281 / 10) * 10)} ft` : `${(m / 1609).toFixed(1)} mi`);

// ------------------------------------------------------------------ state
function freshState() {
  const z = (v) => Object.fromEntries(STATS.map((s) => [s, v()]));
  return { version: 1, seed: Math.floor(Math.random() * 1e9), town: null, useLocation: false, xp: z(() => 0),
    last: z(() => null), streak: 0, best: 0, lastWon: null, days: {}, recent: z(() => []), log: [],
    discovered: {}, quest: null, questsDone: [], milestones: [] };
}
function validState(s) { return s && s.version === 1 && s.xp && s.last && s.days && Array.isArray(s.log); }
function upgrade(s) {              // fields added after the first release
  s.discovered = s.discovered || {}; s.questsDone = s.questsDone || []; s.milestones = s.milestones || [];
  if (s.quest === undefined) s.quest = null;
  return s;
}
let st = (() => { const s = readJSON(K_STATE); return validState(s) ? upgrade(s) : freshState(); })();
let placesCache = readJSON(K_PLACES);   // {v, center:{lat,lon}, at, places:{kind:[{name,lat,lon}]}}
let pos = null;                         // where you are right now {lat, lon, acc}; kept in memory only
let wx = readJSON(K_WEATHER);
let tab = 'map';
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

function setPos(p) { pos = { lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy || 0 }; return pos; }
function locate(timeout = 8000, precise = false) {
  return new Promise((res) => {
    if (!navigator.geolocation) return res(null);
    navigator.geolocation.getCurrentPosition((p) => res(setPos(p)), () => res(null),
      { enableHighAccuracy: precise, timeout, maximumAge: precise ? 10000 : 300000 });
  });
}

let watchId = null, lastDeck = 0;
function startWatch() {            // follow you while the app is open, so walking past a place discovers it
  if (watchId !== null || !st.useLocation || !navigator.geolocation || document.hidden) return;
  watchId = navigator.geolocation.watchPosition((p) => { setPos(p); onMove(); }, () => {},
    { enableHighAccuracy: true, maximumAge: 15000, timeout: 30000 });
}
function stopWatch() { if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; } }
function onMove() {
  const found = discoverNear();
  if (tab === 'map' && map) {
    if (found.length && !document.querySelector('.leaflet-popup')) drawMarkers(false); else moveMe();
    if (Date.now() - lastDeck > 15000) renderDeck();
  }
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
  const la = c.lat.toFixed(2), lo = c.lon.toFixed(2), R = 3500, at = `(around:${R},${la},${lo})`;
  const q = `[out:json][timeout:25];(nwr${at}[leisure~"^(park|nature_reserve|garden|fitness_centre|sports_centre|swimming_pool|track)$"][name];` +
    `nwr${at}[amenity~"^(library|cafe|community_centre|marketplace)$"][name];` +
    `nwr${at}[tourism~"^(museum|gallery|viewpoint|artwork)$"][name];nwr${at}[historic~"^(memorial|monument)$"][name];);out center tags 1200;`;
  const els = await overpass(q, timeout);
  const kinds = { park: 'park', nature_reserve: 'park', garden: 'park', fitness_centre: 'gym', sports_centre: 'gym',
    swimming_pool: 'gym', track: 'track', library: 'library', cafe: 'cafe', community_centre: 'hub', marketplace: 'hub',
    museum: 'sight', gallery: 'sight', viewpoint: 'sight', artwork: 'sight', memorial: 'sight', monument: 'sight' };
  const out = Object.fromEntries(KINDS.map((k) => [k, []])), seen = new Set();
  for (const e of els) {
    const t = e.tags || {};
    const kind = kinds[t.leisure] || kinds[t.amenity] || kinds[t.tourism] || kinds[t.historic];
    const name = (t.name || '').trim();
    const p = e.center || e;
    if (!kind || !name || p.lat == null || name.length > 48 || seen.has(kind + '|' + name.toLowerCase())) continue;
    if (t.access === 'private' || t.access === 'no') continue;
    seen.add(kind + '|' + name.toLowerCase());
    out[kind].push({ name, lat: +p.lat.toFixed(5), lon: +p.lon.toFixed(5), d: km(+la, +lo, p.lat, p.lon) });
  }
  for (const k of KINDS) out[k] = out[k].sort((a, b) => a.d - b.d).slice(0, 40).map(({ d, ...rest }) => rest);
  placesCache = { v: PLACES_V, center: { lat: +la, lon: +lo }, at: Date.now(), places: out };
  writeJSON(K_PLACES, placesCache);
  return placesCache;
}

// Places that ship with the app, used when the public map servers are down. Refreshed from the live map when possible.
const SEEDS = [{ file: 'seed/arlington-va.json', lat: 38.88, lon: -77.10 }];
const placesFit = (c) => !!placesCache && placesCache.v === PLACES_V && km(c.lat, c.lon, placesCache.center.lat, placesCache.center.lon) <= 2.5;
async function loadSeed(c) {
  const seed = SEEDS.find((x) => km(c.lat, c.lon, x.lat, x.lon) < 3);
  if (!seed || placesFit(c)) return false;
  try { placesCache = await fetchJSON(seed.file, {}, 6000); writeJSON(K_PLACES, placesCache); return true; } catch { return false; }
}

let placesJob = null;
function refreshPlaces(center) {   // one download at a time; refills today's board when it lands
  if (!placesJob) {
    placesJob = downloadPlaces(center || origin()).then(() => { refill(); save(); mapFresh = true; render(); }).finally(() => { placesJob = null; });
  }
  return placesJob;
}
const allPlaces = () => (placesCache ? KINDS.flatMap((k) => (placesCache.places[k] || []).map((p) => ({ ...p, kind: k }))) : []);
const placeCount = () => allPlaces().length;
const foundKey = (p) => p.kind + '|' + p.name;
const isFound = (p) => !!st.discovered[foundKey(p)];
const foundHere = () => allPlaces().filter(isFound).length;
const rankOf = (n) => RANKS.filter(([min]) => n >= min).pop()[1];

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

function discoverNear() {      // light up any place you are standing at
  if (!pos || !placesCache || pos.acc > 100) return [];
  const before = Object.keys(st.discovered).length, found = [];
  for (const p of allPlaces()) {
    if (!isFound(p) && metersTo(p) <= FIND_REACH[p.kind]) { st.discovered[foundKey(p)] = dayKey(); found.push(p.name); }
  }
  if (found.length) {
    save();
    toast(found.length === 1 ? `Discovered ${found[0]}` : `Discovered ${found.length} places`);
    announceRank(before);
  }
  return found;
}
function announceRank(before) {
  const n = Object.keys(st.discovered).length;
  if (rankOf(n) !== rankOf(before)) {
    glory({ kind: 'level', color: '#12909c', mark: String(n), title: rankOf(n), sub: `${plural(n, 'place')} discovered. Your town is filling in.`, btn: 'Keep exploring' });
  }
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
const xpFor = (m, checked) => Math.round(TIER_XP[m.tier] * (m.stat === neglected() ? 1.5 : 1) * (checked ? 1.5 : 1));

function pick(stat, day, indoors, avoid = [], salt = 0) {
  const r = rng(`${st.seed}:${day}:${stat}:${salt}`);
  const lv = Math.min(3, level(st.xp[stat]));
  const pool = M[stat].filter((m) => m[1] <= lv);
  const recent = new Set([...(st.recent[stat] || []).slice(-8), ...avoid]);
  let fresh = pool.filter((m) => !recent.has(m[0]));
  if (!fresh.length) fresh = pool.filter((m) => !avoid.includes(m[0]));
  if (!fresh.length) fresh = pool;
  const top = fresh.filter((m) => m[1] === lv);
  const src = top.length && r() < 0.6 ? top : fresh;
  const weight = (m) => (placeCount() && slotOf(m[2]) ? 2 : 1);     // the map is the game: favor missions that send you somewhere
  let roll = r() * src.reduce((n, m) => n + weight(m), 0), chosen = src[src.length - 1];
  for (const m of src) { roll -= weight(m); if (roll < 0) { chosen = m; break; } }
  let [id, tier, tpl, kind] = chosen;
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
  if (!placesFit(origin()) && navigator.onLine !== false) {
    busy('Reading the map around you…');
    if (!(await loadSeed(origin()))) await Promise.race([refreshPlaces().catch(() => {}), sleep(placesCache ? 6000 : 9000)]);
  }
  busy('Checking the sky…');
  wx = await getWeather();
  const { set } = sunToday();
  const dark = !!set && now() > new Date(set.getTime() - 30 * 60000);
  const indoors = dark || !!(wx && wx.rough);
  const day = { board: STATS.map((s) => pick(s, key, indoors)), swaps: 0,
    whyIndoors: indoors ? (dark ? 'dark' : 'weather') : '' };
  for (const m of day.board) st.recent[m.stat] = [...(st.recent[m.stat] || []), m.id].slice(-12);
  st.days[key] = day;
  save();
}

const liveStreak = () => (st.lastWon && dayGap(st.lastWon, dayKey()) <= 1 ? st.streak : 0);
const doneCount = (day) => day.board.filter((m) => m.done).length;
const swapsUsed = (day) => (day.swaps != null ? day.swaps : day.swapped ? 1 : 0);
const maxSwaps = () => (liveStreak() >= SECOND_SWAP_AT ? 2 : 1);

function levelGlory(stat, before) {
  const after = level(st.xp[stat]);
  if (after > before) {
    glory({ kind: 'level', color: `var(--${stat})`, mark: String(after), title: `${LABEL[stat]} is level ${after}`,
      sub: after <= 3 ? 'Harder missions unlocked.' : 'The lamp burns brighter.', btn: 'Keep going' });
  }
}

function doDone(i, note, checked = false) {
  const key = dayKey(), day = st.days[key], m = day.board[i];
  if (!m || m.done) return;
  const stat = m.stat, before = level(st.xp[stat]), foundBefore = Object.keys(st.discovered).length;
  const xp = xpFor(m, checked);
  const wasWon = doneCount(day) >= WIN;
  Object.assign(m, { done: true, xp, note: note.trim().slice(0, 200), checked });
  st.xp[stat] += xp;
  (day.prevLast = day.prevLast || {})[stat] = st.last[stat];
  st.last[stat] = key;
  st.log.push({ date: key, stat, text: m.text, note: m.note, xp, ...(checked ? { at: m.place.name } : {}) });
  if (checked && !isFound(m.place)) st.discovered[foundKey(m.place)] = key;
  const count = doneCount(day);
  save(); closeSheet(); mapFresh = true; render(); pulseLamp(stat);
  toast(`+${xp} ${LABEL[stat]}` + (checked ? '  ·  checked in' : '') + (count < WIN ? `  ·  ${WIN - count} more to win` : ''));
  levelGlory(stat, before);
  if (checked) announceRank(foundBefore);
  if (count >= WIN && !wasWon) {
    day.prevStreak = [st.streak, st.lastWon, st.best];
    const gap = st.lastWon ? dayGap(st.lastWon, key) : null;
    st.streak = gap === 1 ? st.streak + 1 : 1;
    st.lastWon = key;
    st.best = Math.max(st.best, st.streak);
    glory({ kind: 'won', mark: '', title: 'Day won.', sub: `Streak: ${plural(st.streak, 'day')}. The rest is optional.`, btn: 'Go live' });
    const reward = STREAK_REWARDS[st.streak];
    if (reward && !st.milestones.includes(st.streak)) {
      st.milestones.push(st.streak); day.milestone = st.streak;
      for (const s of STATS) st.xp[s] += reward;
      glory({ kind: 'won', mark: String(st.streak), title: `${st.streak}-day streak`,
        sub: `+${reward} xp to every lamp.` + (st.streak === SECOND_SWAP_AT ? ' You now get two swaps a day.' : ''), btn: 'Keep it lit' });
    }
    save(); render();
  } else if (count >= day.board.length) {
    glory({ kind: 'won', mark: '', title: 'Full light.', sub: 'All five lamps touched today. Nothing left here.', btn: 'Go live' });
  }
}

function doUndo(i) {
  const key = dayKey(), day = st.days[key], m = day.board[i];
  if (!m || !m.done) return;
  st.xp[m.stat] = Math.max(0, st.xp[m.stat] - m.xp);
  st.last[m.stat] = (day.prevLast || {})[m.stat] || null;
  for (let j = st.log.length - 1; j >= 0; j--) {
    if (st.log[j].date === key && st.log[j].text === m.text) { st.log.splice(j, 1); break; }
  }
  Object.assign(m, { done: false, xp: 0, note: '', checked: false });
  if (doneCount(day) < WIN && day.prevStreak) {
    if (day.milestone) {
      for (const s of STATS) st.xp[s] = Math.max(0, st.xp[s] - STREAK_REWARDS[day.milestone]);
      st.milestones = st.milestones.filter((n) => n !== day.milestone); delete day.milestone;
    }
    [st.streak, st.lastWon, st.best] = day.prevStreak; delete day.prevStreak;
  }
  save(); closeSheet(); mapFresh = true; render(); toast('Taken back.');
}

function doSwap(i) {
  const key = dayKey(), day = st.days[key], old = day.board[i];
  if (swapsUsed(day) >= maxSwaps() || !old || old.done) return;
  const neu = pick(old.stat, key, !!day.whyIndoors, [old.id], 1 + swapsUsed(day));
  day.board[i] = neu; day.swaps = swapsUsed(day) + 1;
  st.recent[neu.stat].push(neu.id);
  save(); closeSheet(); mapFresh = true; render();
  toast(day.swaps >= maxSwaps() ? 'Swapped. No swaps left today.' : 'Swapped. One swap left today.');
}

// quests
const questToday = () => !!st.quest && st.quest.last === dayKey();
function startQuest(id) { st.quest = { id, step: 0, last: null, started: dayKey() }; save(); closeSheet(); render(); toast(`Quest started: ${questById(id).name}`); }
function doQuestStep(note) {
  const q = st.quest && questById(st.quest.id);
  if (!q || questToday()) return;
  const key = dayKey(), stat = q.stat, before = level(st.xp[stat]), n = st.quest.step;
  st.xp[stat] += QUEST_STEP_XP;
  st.last[stat] = key;
  st.log.push({ date: key, stat, text: q.steps[n], note: note.trim().slice(0, 200), xp: QUEST_STEP_XP, quest: `${q.name} ${n + 1}/${q.steps.length}` });
  st.quest.step = n + 1; st.quest.last = key;
  const finished = st.quest.step >= q.steps.length;
  if (finished) { st.xp[stat] += QUEST_DONE_XP; st.questsDone.push(q.id); st.quest = null; }
  save(); closeSheet(); render(); pulseLamp(stat);
  toast(`+${QUEST_STEP_XP} ${LABEL[stat]}  ·  quest step ${n + 1} of ${q.steps.length}`);
  if (finished) glory({ kind: 'level', color: `var(--${stat})`, mark: '★', title: `Quest complete: ${q.name}`, sub: `+${QUEST_DONE_XP} ${LABEL[stat]} xp. Pick another when you're ready.`, btn: 'Done' });
  levelGlory(stat, before);
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
  let f = null, phase = 'day', msg = 'No sunrise or sunset here today.', short = '';
  if (rise) {
    f = (t - rise) / (set - rise);
    const near = (d) => Math.abs(t - d) < 40 * 60000;
    phase = near(rise) ? 'dawn' : near(set) ? 'dusk' : f > 0 && f < 1 ? 'day' : 'night';
    const hm = (ms) => `${Math.floor(ms / 3600e3)}h ${pad(Math.floor(ms % 3600e3 / 60000))}m`;
    if (f < 0) { msg = `First light in ${hm(rise - t)}`; short = msg; }
    else if (f > 1) {
      const r2 = sunTimes(origin().lat, origin().lon, new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1)).rise;
      msg = `The sun is down. First light ${r2 ? clock(r2) : 'tomorrow'}.`; short = `sun up ${r2 ? clock(r2) : 'tomorrow'}`;
    } else { msg = `${hm(set - t)} of light left`; short = `${hm(set - t)} of light`; }
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
  const full = tab === 'today';
  const day = st.days[dayKey()];
  const tally = day ? (doneCount(day) >= WIN ? 'Day won' : `${doneCount(day)}/${WIN}`) : '';
  const line = full ? t.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
    : [tally, short, wx ? `${wx.temp}°` : ''].filter(Boolean).join('  ·  ');
  el.innerHTML = `
    <div class="sky-top"><a class="wordmark" href="../" aria-label="Back to Daylight">&lsaquo; DAYLIGHT</a>
      <span class="sky-date">${esc(line)}</span>
      <button class="gear" data-act="settings" aria-label="Settings">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>
      </button></div>
    <svg class="arc" viewBox="0 0 390 134" aria-hidden="true">${art}</svg>
    <div class="sky-msg">${esc(msg)}</div>
    <div class="sky-sub">${esc(w)}  ·  ${esc(where)}</div>`;
  el.classList.toggle('compact', !full);
}

// ------------------------------------------------------------------ views
const PIN = '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 22s-7-6.4-7-12a7 7 0 0 1 14 0c0 5.6-7 12-7 12zm0-9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

function distLabel(p) {        // only when we know where you actually are
  if (!pos || !p) return '';
  const m = metersTo(p);
  return m < 60 ? 'right here' : m < 16000 ? `${farText(m)} away` : `${Math.round(m / 1609)} mi away`;
}
const offerXp = (m) => (m.done ? m.xp : xpFor(m, false));

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

function questCard(cls) {      // the sixth card: your quest, or an invitation to start one
  const q = st.quest && questById(st.quest.id);
  if (!q) {
    if (st.questsDone.length >= QUESTS.length) return '';
    return `<li class="${cls} quest idle" data-act="quest" style="--c:var(--sun)"><span class="check">★</span><div class="card-body">
      <div class="card-top"><span class="stat">QUEST</span><span class="xp">5 days</span></div><p>Start a quest: five steps, one a day, on top of the board.</p></div></li>`;
  }
  const done = questToday();
  return `<li class="${cls} quest ${done ? 'done' : ''}" data-act="quest" style="--c:var(--${q.stat})"><span class="check">${done ? CHECK : '★'}</span><div class="card-body">
    <div class="card-top"><span class="stat">QUEST · ${esc(q.name.toUpperCase())}</span><span class="xp">${done ? 'tomorrow' : `+${QUEST_STEP_XP}`}</span></div>
    <p>${done ? `Step ${st.quest.step} of ${q.steps.length} done. The next one unlocks tomorrow.` : `Step ${st.quest.step + 1} of ${q.steps.length}: ${esc(q.steps[st.quest.step])}`}</p></div></li>`;
}

function missionCard(m, i, cls) {
  const bonus = neglected(), d = m.place ? distLabel(m.place) : '';
  return `<li class="${cls} ${m.done ? 'done' : ''}" data-act="open" data-i="${i}" style="--c:var(--${m.stat})">
    <span class="check">${m.done ? CHECK : i + 1}</span>
    <div class="card-body">
      <div class="card-top"><span class="stat">${LABEL[m.stat]}</span>${m.out ? '<span class="out">☀ outdoors</span>' : ''}
        ${m.stat === bonus && !m.done ? '<span class="bonus">+50%</span>' : ''}<span class="xp">+${offerXp(m)}</span></div>
      <p>${esc(m.text)}</p>
      ${m.place && !m.done ? `<span class="where">${PIN} ${esc(m.place.name)}${d ? ' · ' + d : ''}</span>` : ''}
      ${m.done && m.checked ? `<span class="where">${PIN} checked in at ${esc(m.place.name)}</span>` : ''}
      ${m.done && m.note ? `<q>${esc(m.note)}</q>` : ''}
    </div></li>`;
}

function viewToday() {
  const day = st.days[dayKey()];
  if (!day) return `<div class="loading"><div class="spinner"></div><p>${esc(busyMsg || 'Dealing today’s board…')}</p></div>`;
  const done = doneCount(day), bonus = neglected();
  const notes = [];
  if (day.board.some((m) => m.place && !m.done)) notes.push('<span>Missions with a place pay +50% when you check in there.</span>');
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
    <ol class="missions">${day.board.map((m, i) => missionCard(m, i, 'card')).join('')}${questCard('card')}</ol>
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
  const streak = liveStreak(), nextAt = Object.keys(STREAK_REWARDS).map(Number).find((n) => n > streak && !st.milestones.includes(n));
  const found = Object.keys(st.discovered).length, nextRank = RANKS.find(([min]) => min > found);
  const q = st.quest && questById(st.quest.id);
  const badges = st.questsDone.map((id) => questById(id)).filter(Boolean)
    .map((x) => `<span class="badge" style="--c:var(--${x.stat})">★ ${esc(x.name)}</span>`).join('');
  return `<h2 class="sec">Your five lamps <span>dim after 2 days, dark after 4</span></h2>${rows}
    <div class="totals"><div><b>${1 + Math.floor(Math.sqrt(total / 150))}</b>level</div><div><b>${streak}</b>streak</div>
      <div><b>${st.best}</b>best</div><div><b>${won}</b>days won</div></div>
    ${nextAt ? `<p class="legend">Next streak reward at ${plural(nextAt, 'day')}: +${STREAK_REWARDS[nextAt]} xp to every lamp${nextAt === SECOND_SWAP_AT ? ', and a second daily swap' : ''}.</p>` : ''}
    <h2 class="sec gap">Explorer <span>${esc(rankOf(found))}</span></h2>
    <div class="lamp" style="--c:#12909c" data-act="tab" data-tab="map"><span class="orb ${found ? 'bright' : 'dark'}"><b>${found}</b></span>
      <div class="lamp-main"><div class="lamp-name">PLACES DISCOVERED <small>${foundHere()} of ${placeCount()} here</small></div>
        <div class="bar"><i style="width:${placeCount() ? Math.round(100 * foundHere() / placeCount()) : 0}%"></i></div>
        <div class="lamp-meta"><span>Walk up to a place with the app open.</span><span>${nextRank ? `${nextRank[1]} at ${nextRank[0]}` : ''}</span></div></div></div>
    <h2 class="sec gap">Quests <span>${st.questsDone.length} of ${QUESTS.length} complete</span></h2>
    <button class="ghost" data-act="quest" style="margin:0 0 10px">${q ? `${esc(q.name)}: step ${Math.min(st.quest.step + 1, q.steps.length)} of ${q.steps.length}` : 'Start a quest'}</button>
    ${badges ? `<div class="badges">${badges}</div>` : ''}
    <h2 class="sec gap">Last five weeks</h2><div class="cal">${cells}</div>
    <p class="legend">Gold days are days you won. Outlined days you did one or two missions.</p>`;
}

function viewJournal() {
  if (!st.log.length) return '<div class="empty">Nothing logged yet.<br>The journal fills itself as you play.</div>';
  let html = `<h2 class="sec">What you actually did <span>${st.log.length === 1 ? '1 entry' : st.log.length + ' entries'}</span></h2>`, last = null;
  for (const e of [...st.log].reverse().slice(0, 200)) {
    if (e.date !== last) {
      last = e.date;
      html += `<div class="jday">${keyDate(last).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</div>`;
    }
    const tag = [LABEL[e.stat], `+${e.xp}`, e.quest ? `quest: ${e.quest}` : '', e.at ? `checked in at ${e.at}` : ''].filter(Boolean).join(' · ');
    html += `<div class="jrow" style="--c:var(--${e.stat})"><small>${esc(tag)}</small>${esc(e.text)}${e.note ? `<q>${esc(e.note)}</q>` : ''}</div>`;
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
  if (isMap) { renderDeck(); return showMap(); }
  $('#view').innerHTML = tab === 'lamps' ? viewLamps() : tab === 'journal' ? viewJournal() : viewToday();
}

// ------------------------------------------------------------------ map (the main screen)
let map = null, layer = null, meMarker = null, mapFilter = 'all', focusPlace = null, mapFresh = true, deckTouched = 0;
const mapsLink = (p) => `https://maps.apple.com/?daddr=${p.lat},${p.lon}&dirflg=w`;

function popupHtml(p) {
  const d = distLabel(p), when = st.discovered[foundKey(p)];
  return `<b>${esc(p.name)}</b><small>${KIND_ONE[p.kind] || ''}${d ? ' · ' + d : ''}</small>` +
    `<em>${when ? `Discovered ${keyDate(when).toLocaleDateString([], { month: 'short', day: 'numeric' })}` : 'Not discovered yet. Walk up to it.'}</em>` +
    `<a class="go" href="${mapsLink(p)}" target="_blank" rel="noopener">Directions</a>`;
}

function renderChips() {
  const chips = [['all', 'All', ''], ['today', 'Missions', '#ffc94a'], ['found', `Found ${foundHere()}/${placeCount()}`, '#12909c'],
    ...KINDS.filter((k) => nearby(k).length).map((k) => [k, KIND_TITLE[k], KIND_COLOR[k]])];
  $('#chips').innerHTML = chips.map(([k, t, c]) =>
    `<button class="chip ${mapFilter === k ? 'on' : ''}" data-act="chip" data-k="${k}">${c ? `<i style="--k:${c}"></i>` : ''}${t}</button>`).join('');
}

function renderDeck() {        // today's missions as cards along the bottom of the map
  const deck = $('#deck'), day = st.days[dayKey()], x = deck.scrollLeft;
  lastDeck = Date.now();
  deck.innerHTML = day ? day.board.map((m, i) => missionCard(m, i, 'dcard')).join('') + questCard('dcard')
    : `<li class="dcard"><div class="card-body"><p>${esc(busyMsg || 'Dealing today’s board…')}</p></div></li>`;
  deck.scrollLeft = x;
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

function moveMe() {
  if (!map || !pos) return;
  if (meMarker && layer.hasLayer(meMarker)) meMarker.setLatLng([pos.lat, pos.lon]);
  else {
    meMarker = L.marker([pos.lat, pos.lon], { zIndexOffset: 900, interactive: false,
      icon: L.divIcon({ className: '', html: '<div class="pin-me" style="width:18px;height:18px"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }) }).addTo(layer);
  }
}

function drawMarkers(fit) {
  if (!map) return;
  layer.clearLayers(); meMarker = null;
  const day = st.days[dayKey()];
  const missions = day ? day.board.map((m, i) => ({ m, i })).filter((x) => x.m.place) : [];
  const onBoard = new Set(missions.filter((x) => !x.m.done).map((x) => foundKey(x.m.place)));
  const bounds = [];
  let focus = null;
  if (mapFilter !== 'today') {
    for (const p of allPlaces()) {
      const found = isFound(p);
      if (onBoard.has(foundKey(p)) || (mapFilter === 'found' && !found) || (KINDS.includes(mapFilter) && mapFilter !== p.kind)) continue;
      const style = found      // discovered places stay lit; the rest are faint until you walk up to them
        ? { radius: 8, color: '#ffc94a', weight: 3, fillColor: KIND_COLOR[p.kind], fillOpacity: 1 }
        : { radius: 5, color: '#fff', weight: 1.5, fillColor: KIND_COLOR[p.kind], fillOpacity: 0.42, opacity: 0.8 };
      L.circleMarker([p.lat, p.lon], style).bindPopup(popupHtml(p), { maxWidth: 220, autoPanPadding: [16, 60] }).addTo(layer);
      if (mapFilter !== 'all') bounds.push([p.lat, p.lon]);
    }
  }
  for (const { m, i } of missions) {
    if (m.done && mapFilter !== 'today' && mapFilter !== 'all') continue;
    const mk = L.marker([m.place.lat, m.place.lon], { zIndexOffset: m.done ? 300 : 600,
      icon: L.divIcon({ className: '', html: `<div class="pin-m ${m.done ? 'done' : ''}" style="--c:var(--${m.stat})">${m.done ? CHECK : i + 1}</div>`,
        iconSize: [34, 34], iconAnchor: [17, 17] }) }).on('click', () => missionSheet(i)).addTo(layer);
    if (!m.done) bounds.push([m.place.lat, m.place.lon]);
    if (focusPlace && focusPlace === m.place.name) focus = mk;
  }
  moveMe();
  if (pos) bounds.push([pos.lat, pos.lon]);
  if (focus) { map.setView(focus.getLatLng(), 16); focusPlace = null; }
  else if (fit) {
    if (bounds.length > 1) map.fitBounds(bounds, { paddingTopLeft: [40, 70], paddingBottomRight: [40, 190], maxZoom: 16 });
    else if (bounds.length === 1) map.setView(bounds[0], 15);
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
  el.style.setProperty('--c', g.color || '#ffb23e');
  el.innerHTML = `<div class="rays"></div><div class="in"><div class="disc">${esc(g.mark)}</div><h2>${esc(g.title)}</h2><p>${esc(g.sub)}</p>
    <button data-act="glory-next">${esc(g.btn)}</button></div>`;
  el.hidden = false;
}

function missionSheet(i) {
  const day = st.days[dayKey()], m = day.board[i], left = maxSwaps() - swapsUsed(day);
  const d = m.place ? distLabel(m.place) : '';
  const place = m.place ? `<div class="place"><b>${esc(m.place.name)}</b><small>${KIND_ONE[m.place.kind] || ''}${d ? ' · ' + d : ''}${isFound(m.place) ? ' · discovered' : ''}</small>
    <div class="row"><button class="ghost" data-act="showmap" data-i="${i}">Show on map</button>
    <a class="ghost" href="${mapsLink(m.place)}" target="_blank" rel="noopener">Directions</a></div></div>` : '';
  let body;
  if (m.done) {
    body = `${m.checked ? `<p class="fine">Checked in at ${esc(m.place.name)}.</p>` : ''}${m.note ? `<p class="fine">“${esc(m.note)}”</p>` : ''}
      <button class="ghost" data-act="undo" data-i="${i}">Take it back</button>`;
  } else {
    const finish = m.place
      ? `<button class="primary" data-act="checkin" data-i="${i}">Check in here · +${xpFor(m, true)} xp</button>
         <p class="fine" id="ci-msg">Be within about a block of it. Showing up pays +50%.</p>
         <button class="ghost" data-act="done" data-i="${i}">Log without checking in · +${xpFor(m, false)} xp</button>`
      : `<button class="primary" data-act="done" data-i="${i}">Done · +${xpFor(m, false)} xp</button>`;
    body = `${place}<textarea id="note" maxlength="200" placeholder="One line on how it went (optional)"></textarea>${finish}
       <button class="ghost" data-act="swap" data-i="${i}" ${left > 0 ? '' : 'disabled'}>${left > 0 ? `Swap for another (${left} left today)` : 'No swaps left today'}</button>`;
  }
  openSheet(`<div style="--c:var(--${m.stat})"><div class="sh-head"><span>${LABEL[m.stat]}</span>${m.out ? '<span style="color:var(--sun)">☀ outdoors</span>' : ''}
    <span class="xp">${m.done ? `earned +${m.xp} xp` : ''}</span></div>
    <p class="sh-text">${esc(m.text)}</p>${body}</div>`);
}

async function checkIn(el) {
  const i = +el.dataset.i, m = st.days[dayKey()].board[i], label = el.textContent;
  const say = (t) => { const msg = $('#ci-msg'); if (msg) { msg.textContent = t; msg.classList.add('warn'); } };
  el.disabled = true; el.textContent = 'Finding you…';
  const p = await locate(15000, true);
  if (!$('#ci-msg')) return;                 // the sheet was closed while we waited
  el.disabled = false; el.textContent = label;
  if (!p) return say('Couldn’t get your location. Allow Location for this site, then try again, or log it without checking in.');
  if (!st.useLocation) { st.useLocation = true; save(); startWatch(); }
  const meters = metersTo(m.place);
  if (meters > CHECK_REACH[m.place.kind] + Math.min(p.acc, 80)) {
    return say(`You’re ${farText(meters)} from ${m.place.name}. Get within about a block, then check in.`);
  }
  doDone(i, ($('#note') || {}).value || '', true);
}

function questSheet() {
  const q = st.quest && questById(st.quest.id);
  if (!q) {
    const open = QUESTS.filter((x) => !st.questsDone.includes(x.id));
    return openSheet(`<h3>Start a quest</h3><p class="fine">Five steps, one a day, on top of the daily board. Each step pays +${QUEST_STEP_XP} xp and lights its lamp.
      Finishing pays +${QUEST_DONE_XP}. One quest at a time; miss a day and it simply waits for you.</p>
      ${open.map((x) => `<button class="qpick" data-act="quest-start" data-id="${x.id}" style="--c:var(--${x.stat})"><small>${LABEL[x.stat]}</small><b>${esc(x.name)}</b><span>${esc(x.steps[0])}</span></button>`).join('')}`);
  }
  const n = st.quest.step, done = questToday();
  const steps = q.steps.map((s, j) => `<li class="${j < n ? 'did' : j === n && !done ? 'now' : ''}">${esc(s)}</li>`).join('');
  openSheet(`<div style="--c:var(--${q.stat})"><div class="sh-head"><span>QUEST · ${LABEL[q.stat]}</span><span class="xp">${n} of ${q.steps.length} done</span></div>
    <h3 style="margin-top:8px">${esc(q.name)}</h3><ol class="qsteps">${steps}</ol>
    ${done ? '<p class="fine">Today’s step is done. The next one unlocks tomorrow.</p>'
      : `<textarea id="note" maxlength="200" placeholder="One line on how it went (optional)"></textarea>
         <button class="primary" data-act="quest-step">Step ${n + 1} done · +${QUEST_STEP_XP} xp</button>`}
    <button class="ghost danger" data-act="quest-drop">Drop this quest</button></div>`);
}

const RULES = `<b>The rules</b>
1. Every day the board deals five missions, one for each lamp: BODY, BONDS, MONEY, WORK, SOCIAL.
2. Do any three and you have won the day. Do all five for full light.
3. You do the mission in the real world, then come back and log it.
4. A lamp you ignore dims after two days and goes dark after four. The lamp that most needs light pays +50%.
5. Missions get harder as a lamp levels up: small acts first, then real ones.
6. One swap a day. Hold a 7-day streak and you get two.

<b>The map</b>
The map is your town, and the numbered pins are today's missions. A mission that names a place pays +50% when you check in there: the game reads your location once and counts it if you're within about a block. You can still log it without checking in, for the normal amount.

Every other dot is a real place. Walk up to one with the app open and it is discovered: it lights up and stays lit. Your town fills in as you live in it.

<b>Quests</b>
A quest is five steps, one a day, on top of the board. One at a time. Miss a day and it waits.

<b>Streaks</b>
Winning days in a row builds a streak. At 3, 7, 14, 30, 60 and 100 days every lamp gets bonus xp.

<b>Why it is built this way</b>
It ends. Three missions and the game tells you to leave. No feed, no notifications, nothing to check.

The world is real. Places come from OpenStreetMap, sunrise and sunset are computed for where you are, the weather is today's weather. On a rough day or after dark, outdoor missions switch to an indoor plan.

It is yours. No account, no AI, and your journal lives on this phone. Your exact location is used on the phone and never stored.

The journal is the prize. Levels are a toy. The journal after six months is a record of a life you actually went out and had.`;

function settingsSheet() {
  const t = st.town;
  openSheet(`<h3>Your map</h3>
    <p>${esc(t.name)}${t.admin ? ', ' + esc(t.admin) : ''} · ${plural(placeCount(), 'real place')}</p>
    <form class="inline" data-form="town"><input name="town" placeholder="Change town: City, ST" autocomplete="off" autocapitalize="words"><button>Set</button></form>
    <p class="fine" id="town-err"></p>
    <label class="toggle"><span><b>Use my location</b><br><span class="fine">Needed for check-ins and discovering places. Follows you only while the app is open.</span></span>
      <input type="checkbox" id="useloc" ${st.useLocation ? 'checked' : ''}></label>
    <button class="ghost" data-act="refresh-map">Download places again</button>
    <h4>The game</h4>
    <button class="ghost" data-act="rules">Rules and reasons</button>
    <h4>Your data</h4>
    <button class="ghost" data-act="export">Save a backup file</button>
    <label class="ghost">Restore from a backup<input type="file" id="import" accept="application/json,.json" hidden></label>
    <button class="ghost danger" data-act="restart">Restart the game</button>
    <p class="fine" style="margin-top:14px">Your missions, notes, journal and discoveries are stored only in this browser on this phone. Your exact
      location stays on the phone. Weather (Open-Meteo) and place names (OpenStreetMap) receive coordinates rounded to about half a mile.
      Map tiles come from OpenStreetMap.</p>`);
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
  if (pos && km(pos.lat, pos.lon, t.lat, t.lon) > 8) { pos = null; st.useLocation = false; stopWatch(); save(); }   // a town far from here wins
  if (await loadSeed(pos || t)) refreshPlaces(pos || t).catch(() => {});       // bundled places now, live ones when they arrive
  else if (!placesFit(pos || t)) await Promise.race([refreshPlaces(pos || t).catch(() => {}), sleep(12000)]);   // don't hold the game for a slow map server
  busyMsg = '';
  closeSheet();
  tab = 'map'; mapFresh = true;
  if (map) { map.remove(); map = null; }
  render();
  await ensureDay();
  refill(); save(); mapFresh = true; render();
  startWatch();
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
  tab(el) { tab = el.dataset.tab; mapFresh = true; if (tab !== 'map') mapFilter = 'all'; render(); if (tab !== 'map') $('#view').scrollTop = 0; },
  open(el) { missionSheet(+el.dataset.i); },
  done(el) { doDone(+el.dataset.i, ($('#note') || {}).value || ''); },
  checkin: checkIn,
  undo(el) { doUndo(+el.dataset.i); },
  swap(el) { doSwap(+el.dataset.i); },
  showmap(el) { const m = st.days[dayKey()].board[+el.dataset.i]; focusPlace = m.place.name; if (KINDS.includes(mapFilter) || mapFilter === 'found') mapFilter = 'all'; tab = 'map'; closeSheet(); render(); },
  chip(el) { mapFilter = el.dataset.k; renderChips(); drawMarkers(true); },
  async locate() {
    toast('Finding you…');
    const p = await locate(10000, true);
    if (!p) return toast('Location is off for this page.');
    if (!st.useLocation) { st.useLocation = true; save(); startWatch(); }
    discoverNear(); drawMarkers(false); renderDeck(); if (map) map.setView([p.lat, p.lon], 16);
  },
  quest: questSheet,
  'quest-start'(el) { startQuest(el.dataset.id); },
  'quest-step'() { doQuestStep(($('#note') || {}).value || ''); },
  'quest-drop'(el) {
    if (el.dataset.sure) { st.quest = null; save(); closeSheet(); render(); toast('Quest dropped.'); }
    else { el.dataset.sure = '1'; el.textContent = 'Tap again to drop it and lose its progress'; }
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
    try { await downloadPlaces(origin()); refill(); save(); closeSheet(); mapFresh = true; render(); toast(`${plural(placeCount(), 'real place')} on your map`); }
    catch { el.textContent = 'Map servers are busy. Try again'; el.disabled = false; }
  },
  restart(el) {
    if (el.dataset.sure) {
      const keep = { town: st.town, useLocation: st.useLocation };
      st = Object.assign(freshState(), keep); save(); closeSheet(); tab = 'map'; mapFresh = true; render(); ensureDay().then(render); toast('A fresh game.');
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
    else { pos = null; stopWatch(); }
    refill(); save(); mapFresh = true; render(); startWatch();
    if (st.useLocation && pos && !placesFit(pos)) refreshPlaces().catch(() => {});
  }
  if (e.target.id === 'import' && e.target.files[0]) {
    try {
      const j = JSON.parse(await e.target.files[0].text()), s = j.state || j;
      if (!validState(s)) throw new Error('not a backup');
      st = upgrade(s); save(); closeSheet(); tab = 'map'; mapFresh = true; render(); ensureDay().then(render); toast('Backup restored.');
    } catch { toast('That file isn’t a Daylight backup.'); }
  }
});

// swiping the mission cards moves the map to each mission's place
(() => {
  const deck = $('#deck');
  let timer;
  const touched = () => { deckTouched = Date.now(); };
  deck.addEventListener('touchstart', touched, { passive: true });
  deck.addEventListener('wheel', touched, { passive: true });
  deck.addEventListener('pointerdown', touched);
  deck.addEventListener('scroll', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!map || Date.now() - deckTouched > 2500) return;
      const mid = deck.scrollLeft + deck.clientWidth / 2;
      const card = [...deck.children].find((c) => c.offsetLeft <= mid && c.offsetLeft + c.offsetWidth >= mid);
      const day = st.days[dayKey()], m = card && card.dataset.i != null && day ? day.board[+card.dataset.i] : null;
      if (m && m.place) map.panTo([m.place.lat, m.place.lon]);
    }, 160);
  }, { passive: true });
})();

// ------------------------------------------------------------------ start
async function wake() {        // on open and whenever the app comes back to the front
  if (!st.town) return render();
  render();
  startWatch();
  if (st.useLocation) locate(8000).then((p) => { if (p) { discoverNear(); render(); } });
  await ensureDay();
  wx = await getWeather();
  render();
  const stale = !placeCount() || placesCache.v !== PLACES_V || Date.now() - placesCache.at > 30 * 864e5;   // nothing yet, bundled, or a month old
  if (stale && navigator.onLine !== false) {
    if (await loadSeed(origin())) { refill(); save(); mapFresh = true; render(); }
    refreshPlaces().catch(() => {});
  }
}
document.addEventListener('visibilitychange', () => { if (document.hidden) stopWatch(); else wake(); });
setInterval(() => { if (st.town && !document.hidden) { if (!st.days[dayKey()]) wake(); else renderSky(); } }, 60000);
wake();
