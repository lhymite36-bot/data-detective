// Deterministic case data for "The Biryani Bandit"
window.buildCaseSQL = function () {
  const emps = [
    [1,'Neha Kapoor','HR','Cheerful. Suspiciously cheerful.'],
    [2,'Vikram Singh','Sales','Openly obsessed with biryani.'],
    [3,'Dev Malhotra','Facilities','Owns the fridge keycard. Owns the vibe.'],
    [4,'Anjali Rao','Finance','Counts everything. Including you.'],
    [5,'Rohit Sharma','IT','Claims he only eats code.'],
    [6,'Priya Nair','Marketing','Posts her lunch on Instagram.'],
    [7,'Karan Mehta','Interns','New. Hungry. Broke.'],
    [8,'Sunita Das','Admin','Has seen things.']];
  // 15 workdays: Oct 5-23, 2026 (Mon-Fri)
  const days = [];
  for (const d of [5,6,7,8,9,12,13,14,15,16,19,20,21,22,23]) days.push('2026-10-' + String(d).padStart(2,'0'));
  const theft = new Set(['2026-10-05','2026-10-07','2026-10-09','2026-10-13','2026-10-15','2026-10-19','2026-10-21','2026-10-22','2026-10-23']);
  let seed = 42; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pad = n => String(n).padStart(2,'0');
  const t = (h,m) => pad(h)+':'+pad(m)+':00';
  const swipes = [], orders = [], inv = [], cctv = [];
  days.forEach((day, di) => {
    // lunch orders
    let boxes = 20; inv.push([day, t(12,0), boxes, 'restock']);
    const orderers = [2,2,4,5,6,7,8,1,3];
    let m = 30;
    orderers.forEach(e => { if (rnd() < 0.7 || e === 2) {
      const item = rnd() < 0.75 ? 'Chicken Biryani' : 'Paneer Biryani';
      const tm = t(12 + Math.floor(m/60), m%60); m += 4 + Math.floor(rnd()*6);
      orders.push([e, day, tm, item, item.startsWith('Chicken') ? 180 : 160]);
      boxes--; inv.push([day, tm, boxes, 'canteen sale']);
    }});
    if (rnd() < 0.5) orders.push([2, day, t(17,10), 'Chicken Biryani (extra)', 180]);
    // Dev cleans fridge room at lunch every day
    swipes.push([3, day, t(13, 10 + Math.floor(rnd()*20)), 'FRIDGE_ROOM']);
    swipes.push([3, day, t(14, 30 + Math.floor(rnd()*20)), 'FRIDGE_ROOM']);
    // random legit swipes around lunch
    [4,5,6,7,8].forEach(e => { if (rnd() < 0.35) swipes.push([e, day, t(12, 15 + Math.floor(rnd()*40)), 'FRIDGE_ROOM']); });
    // other doors
    [1,2,3,4,5,6,7,8].forEach(e => swipes.push([e, day, t(9, Math.floor(rnd()*50)), 'MAIN_DOOR']));
    // Karan the intern red herring: sometimes evening swipes but on non-theft days or at 18:xx (after count)
    if (!theft.has(day) && rnd() < 0.6) swipes.push([7, day, t(16, 5 + Math.floor(rnd()*20)), 'FRIDGE_ROOM']);
    if (theft.has(day)) {
      const mm = 2 + Math.floor(rnd()*15);
      swipes.push([1, day, t(16, mm), 'FRIDGE_ROOM']);       // the bandit
      const stolen = 1 + Math.floor(rnd()*2);
      boxes -= stolen; inv.push([day, t(16, mm + 3), boxes, 'evening count']);
    } else {
      if (rnd() < 0.3) swipes.push([1, day, t(12, 40), 'FRIDGE_ROOM']);
      inv.push([day, t(16, 30), boxes, 'evening count']);
    }
    inv.push([day, t(18, 0), boxes, 'close']);
  });
  cctv.push(['2026-10-07','16:10','Camera 3 blurry. Figure in a bright pink cardigan near fridge room.']);
  cctv.push(['2026-10-13','16:05','Someone humming "Kal Ho Na Ho" walking toward fridge room.']);
  cctv.push(['2026-10-15','17:12','Vikram seen carrying a biryani box. Receipt visible in hand.']);
  cctv.push(['2026-10-20','16:15','Karan (intern) opens fridge, takes only his own tiffin. Cries a little.']);
  cctv.push(['2026-10-21','13:20','Dev mopping fridge room floor. Very dramatic about it.']);
  cctv.push(['2026-10-22','16:09','Camera 3 lens covered by a sticky note: "HR says smile :)"']);
  const q = s => "'" + String(s).replace(/'/g,"''") + "'";
  const ins = (tb, rows) => rows.map(r => `INSERT INTO ${tb} VALUES (${r.map(v => typeof v === 'number' ? v : q(v)).join(',')});`).join('\n');
  return `
CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, note TEXT);
CREATE TABLE door_swipes (emp_id INTEGER, day TEXT, time TEXT, door TEXT);
CREATE TABLE canteen_orders (emp_id INTEGER, day TEXT, time TEXT, item TEXT, price INTEGER);
CREATE TABLE fridge_inventory (day TEXT, time TEXT, biryani_boxes INTEGER, event TEXT);
CREATE TABLE cctv_notes (day TEXT, time TEXT, note TEXT);
${ins('employees', emps)}
${ins('door_swipes', swipes)}
${ins('canteen_orders', orders)}
${ins('fridge_inventory', inv)}
${ins('cctv_notes', cctv)}`;
};
window.CULPRIT_ID = 1;
