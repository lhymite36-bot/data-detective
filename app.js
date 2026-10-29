const $ = s => document.querySelector(s);
const CHIEF = "Listen, rookie. For THREE WEEKS someone has been stealing biryani from the office fridge. Three. Weeks. I've lost 4 kilos and all hope. The canteen swears every sale is logged. The fridge-room door logs every swipe. You've got SQL and zero excuses. Find the Bandit before I start eating salad. 🥗😤";
const SUS = {
 1:{face:'😇',alibi:'"Me? I\'m HR! I literally run the Wellness Week."',a:['"Biryani? I\'m on a keto journey, babe. Rice is violence."','"Okay, I go to the fridge room at 4… for my green juice. Juice is in a biryani-shaped box. Coincidence."']},
 2:{face:'🤤',alibi:'"Yes I love biryani. I also PAY for biryani. Check the receipts, coward."',a:['"I order two a day. I\'m not a thief, I\'m a loyal customer."','"Every box I eat has a receipt. Ask the canteen. Ask my cardiologist."']},
 3:{face:'🧹',alibi:'"I clean that fridge room twice a day. Nobody thanks me. NOBODY."',a:['"I\'m in there at lunch, every day, mopping YOUR raita spills."','"Most swipes? Yeah. Because it\'s my JOB. Check the times, detective."']},
 4:{face:'🧮',alibi:'"I counted the boxes myself. The numbers don\'t lie. People do."',a:['"I only go in at lunch with my tiffin. I don\'t eat stolen carbs."','"I noticed the drops happen AFTER lunch. Did you notice? No? Cute."']},
 5:{face:'🤖',alibi:'"I only eat code and cold coffee."',a:['"I was debugging all afternoon. My commit history is my alibi."','"Pro tip: JOIN the swipes to employees. Then GROUP BY. You\'re welcome."']},
 6:{face:'📸',alibi:'"If I ate it, it\'d be on my Instagram. Check my grid."',a:['"I swiped in at lunch for a photo of the fridge. Aesthetic."','"I did see a pink cardigan near the fridge room at 4ish. Very on-trend."']},
 7:{face:'🥺',alibi:'"I\'m an intern. I can\'t afford biryani. I can barely afford hope."',a:['"I go to the fridge in the evening… for my OWN tiffin. Mom packs it."','"Check the days! I\'m there on days when nothing goes missing!"']},
 8:{face:'👀',alibi:'"I\'ve seen things in this office. Terrible things."',a:['"Someone always hums Kal Ho Na Ho on the way to the fridge. Always 4 PM."','"Someone put a sticky note on camera 3. A \'smile\' note. Very… HR."']}};
const ROASTS = ["WRONG. I've seen better deductions from a microwave. 🔥","Incredible. You accused an innocent person AND I'm still hungry.","That's not detective work, that's vibes. Go run a query.","My grandmother could GROUP BY better than this. She's 90. And offline."];
const HINTS = ["Hint 1: When do the boxes vanish? Try: SELECT * FROM fridge_inventory WHERE event='evening count'; and check the Chart tab.","Hint 2: Who's in the fridge room at that hour? Filter door_swipes: WHERE door='FRIDGE_ROOM' AND time >= '16:00'","Hint 3: JOIN door_swipes to employees and GROUP BY name to COUNT 4 PM visits. One name is an outlier. Compare their days to the theft days."];
let db, clues = new Set(), hintN = 0, emps = [];
const CLUE_TXT = {time:'⏰ Boxes vanish around 4 PM, after lunch sales are logged (outlier in inventory).',swipe:'🚪 Someone swipes into the fridge room at 4 PM on theft days (filter).',join:'📊 JOIN + GROUP BY: one person has an outlier number of 4 PM visits — every single theft day.'};
$('#chiefLine').textContent = CHIEF;
$('#startBtn').onclick = () => { $('#intro').classList.add('hidden'); $('#game').classList.remove('hidden'); };
document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => {
  document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b));
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('hidden', t.id !== b.dataset.t));
  if (b.dataset.t === 'chart') drawChart();
});
function modal(html){ $('#mbody').innerHTML = html; $('#modal').classList.remove('hidden'); }
$('#mclose').onclick = () => $('#modal').classList.add('hidden');
function addClue(k){ if (clues.has(k)) return; clues.add(k); const li = document.createElement('li'); li.textContent = CLUE_TXT[k]; $('#clues').appendChild(li); $('#clueCount').textContent = clues.size + '/3'; $('#sqlMsg').textContent = '🔎 NEW CLUE! Check the Evidence Board.'; renderSus(); }
function run(sql){
  try {
    const res = db.exec(sql); const out = $('#results'); out.innerHTML = '';
    if (!res.length) { $('#sqlMsg').textContent = 'Query ran. Nothing came back. Like my biryani.'; return res; }
    const r = res[res.length-1];
    out.innerHTML = '<table><tr>' + r.columns.map(c => `<th>${c}</th>`).join('') + '</tr>' + r.values.map(v => '<tr>' + v.map(x => `<td>${x}</td>`).join('') + '</tr>').join('') + '</table>';
    $('#sqlMsg').textContent = r.values.length + ' rows.';
    detect(sql.toLowerCase(), r); return res;
  } catch (e) { $('#sqlMsg').textContent = '💥 ' + e.message + ' (Chief is laughing.)'; return null; }
}
function detect(s, r){
  const flat = r.values.flat().map(String);
  if (s.includes('fridge_inventory') && flat.some(x => /^16:/.test(x)) && flat.includes('evening count')) addClue('time');
  if (s.includes('door_swipes') && /16/.test(s) && r.values.length && r.values.length < 40 && (flat.includes('1') || flat.includes('Neha Kapoor'))) addClue('swipe');
  if (s.includes('join') && s.includes('group by') && flat.includes('Neha Kapoor') && /16/.test(s)) addClue('join');
}
$('#runBtn').onclick = () => run($('#q').value);
$('#q').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) run($('#q').value); });
$('#hintBtn').onclick = () => { $('#hint').textContent = HINTS[Math.min(hintN++, 2)]; };
function renderSus(){
  $('#sus').innerHTML = emps.map(([id,name,dept]) => `<div class="s"><div class="face">${SUS[id].face}</div><b>${name}</b> · <small>${dept}</small><p class="alibi">${SUS[id].alibi}</p><button data-i="${id}">🗣 Interrogate</button><button class="pink" data-a="${id}">☝ Accuse</button><div class="say" id="say${id}"></div></div>`).join('');
  document.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { const id = +b.dataset.i; $('#say'+id).textContent = SUS[id].a[clues.size >= 2 ? 1 : 0]; });
  document.querySelectorAll('[data-a]').forEach(b => b.onclick = () => accuse(+b.dataset.a));
}
function accuse(id){
  const name = emps.find(e => e[0] === id)[1];
  if (id !== window.CULPRIT_ID) { modal(`<h2 class="lose">❌ ${name}? Really?</h2><p>${ROASTS[Math.floor(Math.random()*ROASTS.length)]}</p><p class="hint">${HINTS[Math.min(hintN++,2)]}</p>`); return; }
  modal(`<h2 class="win">🏆 CASE CLOSED: THE BIRYANI BANDIT</h2><p>It was <b>Neha Kapoor from HR</b>. Every theft day, 4 PM swipe, "keto journey", pink cardigan, sticky note on camera 3. Wellness Week is cancelled.</p>
  <p>Chief: "${clues.size >= 3 ? 'Okay. Fine. That was actually good. Don\'t let it go to your head.' : 'Correct… but your evidence is thinner than canteen raita. Lucky guess?'}"</p>
  <h3>Skills used</h3><ul><li>${clues.has('swipe')?'✅':'⬜'} Filtering (WHERE time &gt;= '16:00')</li><li>${clues.has('join')?'✅':'⬜'} JOINs (door_swipes ⨝ employees)</li><li>${clues.has('join')?'✅':'⬜'} Aggregation (GROUP BY + COUNT)</li><li>${clues.has('time')?'✅':'⬜'} Outlier spotting (inventory drops)</li></ul><p>Case #002 coming soon… 👀</p>`);
}
let chart;
function drawChart(){
  if (chart || !db) return;
  const r = db.exec(`SELECT a.day, a.biryani_boxes - e.biryani_boxes FROM
   (SELECT day, MIN(biryani_boxes) biryani_boxes FROM fridge_inventory WHERE event IN ('restock','canteen sale') GROUP BY day) a
   JOIN fridge_inventory e ON e.day=a.day AND e.event='evening count' ORDER BY a.day`)[0];
  chart = new Chart($('#chartC'), {type:'bar', data:{labels:r.values.map(v => v[0].slice(5)), datasets:[{label:'Missing boxes', data:r.values.map(v => v[1]), backgroundColor:'#ff3e8a'}]},
    options:{plugins:{legend:{labels:{color:'#eef2ff'}}}, scales:{x:{ticks:{color:'#eef2ff'}}, y:{ticks:{color:'#eef2ff', stepSize:1}}}}});
}
initSqlJs({locateFile: f => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/' + f}).then(SQL => {
  db = new SQL.Database(); db.run(window.buildCaseSQL());
  emps = db.exec('SELECT id,name,dept FROM employees')[0].values; renderSus(); window.__ready = true;
});
