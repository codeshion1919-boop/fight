'use strict';
(() => {
const N = 10, MAXT = 30;
const $ = s => document.querySelector(s);
const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const dist = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

// ---- 兵種・英雄(数値はすべて仮設定) ----
const T = {
  inf: { n: '歩兵', s: '歩', hp: 10, atk: 4, def: 3, mov: 2, rng: 1 },
  cav: { n: '騎兵', s: '騎', hp: 8, atk: 5, def: 2, mov: 3, rng: 1 },
  arc: { n: '弓兵', s: '弓', hp: 6, atk: 4, def: 1, mov: 2, rng: 2 },
  hvy: { n: '重装兵', s: '重', hp: 14, atk: 3, def: 5, mov: 1, rng: 1 },
  can: { n: '砲兵', s: '砲', hp: 5, atk: 6, def: 1, mov: 1, rng: 3 },
  ele: { n: '戦象', s: '象', hp: 16, atk: 6, def: 3, mov: 1, rng: 1 }
};
const H = {
  lone: { n: '孤高の英雄', s: '孤', hp: 12, atk: 7, def: 3, mov: 2, rng: 1, d: '優勢時に出現。2体撃破で「武勇の英雄」に進化' },
  nat:  { n: '国民に愛される英雄', s: '愛', hp: 10, atk: 4, def: 3, mov: 2, rng: 1, d: '生存中、味方全員の攻撃+1(士気)' },
  wise: { n: '智将', s: '智', hp: 8, atk: 3, def: 2, mov: 2, rng: 2, d: '劣勢時に出現。周囲2マスの味方の攻撃+1、毎ターン回復+2' },
  valor:{ n: '武勇の英雄', s: '武', hp: 14, atk: 8, def: 3, mov: 2, rng: 1, d: '攻撃が対象の隣接部隊にも及ぶ(味方も巻き込む)' }
};
const A = ['inf', 'inf', 'cav', 'arc', 'arc', 'hvy'];
// m:全兵種への補正 tm:兵種別補正 fl:特殊フラグ
const F = [
 { id: 'sparta', n: 'スパルタ軍', kw: '防御特化', ab: '不滅のファランクス', d: '各部隊は最初の致命傷をHP1で一度だけ耐える。', p: '防御+2、重装兵が多い', c: '攻撃-1、騎兵なし', m: { def: 2, atk: -1 }, army: ['hvy', 'hvy', 'hvy', 'inf', 'inf', 'arc'], fl: { imm: 1 } },
 { id: 'qin', n: '秦軍', kw: '物量・補充', ab: '万民進軍', d: '自軍3ターンごとに後列へ歩兵が1体補充される。', p: '部隊数が多く、補充あり', c: '全部隊のHP-2', m: { hp: -2 }, army: ['inf', 'inf', 'inf', 'inf', 'inf', 'arc', 'arc'], fl: { reinf: 3 } },
 { id: 'rome', n: 'ローマ軍', kw: '万能', ab: '帝国の軍律', d: '隣接する味方1体につき防御+1(最大+2)。', p: 'HP+1、隊列で堅い', c: '突出した強みなし', m: { hp: 1 }, army: A, fl: { adjDef: 1 } },
 { id: 'mongol', n: 'モンゴル軍', kw: '機動力', ab: '天駆ける蒼狼', d: '全部隊の移動+1。', p: '騎兵が多く機動力が高い', c: '防御-1', m: { mov: 1, def: -1 }, army: ['cav', 'cav', 'cav', 'arc', 'arc', 'inf'] },
 { id: 'macedon', n: 'マケドニア軍', kw: '槍兵・陣形', ab: '王の槍陣', d: '歩兵・重装兵の射程+1(長槍)。', p: '前衛が2マス先を攻撃できる', c: '騎兵なし、弓兵が少ない', m: {}, tm: { inf: { rng: 1 }, hvy: { rng: 1 } }, army: ['inf', 'inf', 'inf', 'hvy', 'hvy', 'arc'] },
 { id: 'carthage', n: 'カルタゴ軍', kw: '特殊兵種', ab: '異邦の軍勢', d: '戦象2体を保有。', p: '高HP・高火力の戦象', c: '全部隊のHP-1、歩兵少なめ', m: { hp: -1 }, army: ['inf', 'ele', 'ele', 'arc', 'cav', 'inf'] },
 { id: 'takeda', n: '武田軍', kw: '騎兵', ab: '風林火山', d: '騎兵の攻撃+1・移動+1。騎兵3体。', p: '強力な騎兵', c: '歩兵のHP-3', m: {}, tm: { cav: { atk: 1, mov: 1 }, inf: { hp: -3 } }, army: ['cav', 'cav', 'cav', 'inf', 'inf', 'arc'] },
 { id: 'ottoman', n: 'オスマン帝国軍', kw: '多兵種', ab: '三日月の覇権', d: '砲兵を含む7部隊で開始。', p: '歩・騎・弓・重・砲が揃う', c: '全部隊のHP-1', m: { hp: -1 }, army: ['inf', 'cav', 'arc', 'hvy', 'can', 'inf', 'cav'] },
 { id: 'napoleon', n: 'ナポレオン軍', kw: '指揮・砲兵', ab: '皇帝の大陸軍', d: '全部隊の攻撃+1。砲兵2体、砲兵の射程+1。', p: '高い攻撃力と砲兵', c: '防御-1', m: { atk: 1, def: -1 }, tm: { can: { rng: 1 } }, army: ['inf', 'inf', 'arc', 'can', 'can', 'cav'] },
 { id: 'persia', n: 'ペルシア軍', kw: '多様性', ab: '千軍万馬', d: '開始時にランダムな兵種の7部隊で編成される。', p: '部隊数が多い、編成が毎回変わる', c: 'HP-1、編成は運次第', m: { hp: -1 }, army: [], fl: { rnd: 1 } },
 { id: 'egypt', n: 'エジプト軍', kw: '機動力', ab: '砂塵の王権', d: '全部隊の移動+1、弓兵の攻撃+1。', p: '機動力と弓兵の火力', c: '防御-1、HP-1', m: { mov: 1, def: -1, hp: -1 }, tm: { arc: { atk: 1 } }, army: ['cav', 'cav', 'arc', 'arc', 'arc', 'inf'] },
 { id: 'japan', n: '日本軍', kw: '連携・弓兵', ab: '大和魂', d: '弓兵の射程+1。標的の隣にいる味方1体につき与ダメージ+1(最大+2)。', p: '連携攻撃と長射程の弓', c: '重装兵・砲兵なし', m: {}, tm: { arc: { rng: 1 } }, army: ['inf', 'inf', 'arc', 'arc', 'arc', 'cav'], fl: { coop: 1 } },
 { id: 'rev', n: '革命軍', kw: '逆転・成長', ab: '下克上', d: '敵を倒すと攻撃+1・HP+2成長。自軍の部隊数が敵より少ないと全員攻撃+2。', p: '劣勢からの逆転・成長', c: '攻撃-1、HP-2で序盤は脆い', m: { atk: -1, hp: -2 }, army: ['inf', 'inf', 'inf', 'inf', 'arc', 'arc', 'hvy'], fl: { grow: 1, comeback: 1 } }
];

let G = null, pick = null, cand = [];
let uid = 1;

// ---- 能力計算 ----
const fac = u => G.fac[u.side];
const base = u => u.hero ? H[u.hero] : T[u.type];
const mates = u => G.units.filter(o => o.side === u.side);
function stat(u, k) {
  let v = base(u)[k];
  if (!u.hero) { const f = fac(u); v += (f.m[k] || 0) + (((f.tm || {})[u.type] || {})[k] || 0); }
  return v + (u.b[k] || 0);
}
function atk(u) {
  let v = stat(u, 'atk'); const al = mates(u);
  if (al.some(o => o.hero === 'nat')) v++;
  if (al.some(o => o.hero === 'wise' && o !== u && dist(o, u) <= 2)) v++;
  if ((fac(u).fl || {}).comeback && al.length < G.units.length - al.length) v += 2;
  return v;
}
function def(u) {
  let v = stat(u, 'def');
  if ((fac(u).fl || {}).adjDef) v += Math.min(2, mates(u).filter(o => o !== u && dist(o, u) === 1).length);
  return v;
}
const mov = u => Math.max(1, stat(u, 'mov'));
const rng = u => Math.max(1, stat(u, 'rng'));
function dmg(a, d) {
  let x = Math.round(atk(a) - def(d) * 0.5);
  if ((fac(a).fl || {}).coop) x += Math.min(2, mates(a).filter(o => o !== a && dist(o, d) === 1).length);
  return Math.max(1, x);
}
const at = (x, y) => G.units.find(u => u.x === x && u.y === y);
const uname = u => (u.hero ? H[u.hero].n : T[u.type].n);
const hpSum = s => G.units.filter(u => u.side === s).reduce((a, u) => a + u.hp, 0);

function mk(side, type, hero, x, y) {
  const u = { id: uid++, side, type, hero, x, y, hp: 1, mhp: 1, moved: false, acted: false, kills: 0, b: {}, imm: true };
  u.mhp = u.hp = Math.max(3, stat(u, 'hp'));
  return u;
}
function log(t) { G.log.push(t); if (G.log.length > 40) G.log.shift(); }
function freeBack(s) {
  for (const y of s ? [0, 1] : [9, 8]) for (const x of shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])) if (!at(x, y)) return { x, y };
  return null;
}

// ---- ゲーム開始 ----
const SL = [[4, 8], [5, 8], [3, 8], [6, 8], [2, 9], [4, 9], [5, 9], [7, 9], [1, 9], [8, 9]];
function newGame(f0, f1) {
  G = { fac: [f0, f1], units: [], turn: 1, cur: 0, tc: [0, 0], hu: [{}, {}], sel: null, over: false, log: [] };
  [f0, f1].forEach((f, s) => {
    const list = (f.fl || {}).rnd ? Array.from({ length: 7 }, () => Object.keys(T)[rnd(6)]) : f.army;
    list.forEach((t, i) => { const p = SL[i % SL.length]; G.units.push(mk(s, t, null, p[0], s ? 9 - p[1] : p[1])); });
  });
  log('開戦!あなた:' + f0.n + ' / 敵:' + f1.n);
  show('sc-game'); startTurn(0); render();
}

function startTurn(s) {
  G.tc[s]++;
  const f = G.fac[s];
  if ((f.fl || {}).reinf && G.tc[s] % f.fl.reinf === 0) {
    const c = freeBack(s); if (c) { G.units.push(mk(s, 'inf', null, c.x, c.y)); log(f.n + ':万民進軍で歩兵が補充された'); }
  }
  G.units.filter(u => u.side === s && u.hero === 'wise').forEach(w => G.units.forEach(u => { if (u.side === s && dist(u, w) <= 2 && u.hp < u.mhp) u.hp = Math.min(u.mhp, u.hp + 2); }));
  heroCheck(s);
  G.units.forEach(u => { if (u.side === s) u.moved = u.acted = false; });
}
function heroCheck(s) {
  if (G.tc[s] < 3 || G.units.some(u => u.side === s && u.hero)) return;
  const mine = hpSum(s), opp = hpSum(1 - s), hu = G.hu[s]; let k = null;
  if (mine > opp * 1.2 && !hu.lone) k = 'lone';
  else if (mine < opp * 0.8 && !hu.wise) k = 'wise';
  else if (!hu.nat && G.tc[s] >= 4) k = 'nat';
  const c = k && freeBack(s); if (!c) return;
  hu[k] = true; G.units.push(mk(s, null, k, c.x, c.y));
  log(G.fac[s].n + ':' + H[k].n + 'が出現!');
}

// ---- 移動・攻撃 ----
function reach(u) {
  const m = new Map(), q = [[u.x, u.y, 0]]; m.set(u.x + ',' + u.y, 0);
  while (q.length) {
    const [x, y, d] = q.shift(); if (d >= mov(u)) continue;
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
      if (nx < 0 || ny < 0 || nx >= N || ny >= N || m.has(k) || at(nx, ny)) return;
      m.set(k, d + 1); q.push([nx, ny, d + 1]);
    });
  }
  m.delete(u.x + ',' + u.y); return m;
}
const canHit = (a, d) => !a.acted && d.side !== a.side && dist(a, d) <= rng(a);

function hit(a, t) {
  const x = dmg(a, t); t.hp -= x; log(uname(a) + '→' + uname(t) + ' ' + x + 'ダメージ');
  if (t.hp <= 0 && (fac(t).fl || {}).imm && t.imm) { t.hp = 1; t.imm = false; log('不滅のファランクス!' + uname(t) + 'は耐えた'); }
  if (t.hp <= 0 && t.side !== a.side) {
    a.kills++; log(uname(t) + 'を撃破!');
    if ((fac(a).fl || {}).grow && !a.hero) { a.b.atk = (a.b.atk || 0) + 1; a.mhp += 2; a.hp = Math.min(a.mhp, a.hp + 2); log('下克上:' + uname(a) + 'が成長'); }
  } else if (t.hp <= 0) log('味方の' + uname(t) + 'が巻き込まれ倒れた…');
}
function attack(a, d) {
  const tg = [d];
  if (a.hero === 'valor') G.units.forEach(o => { if (o !== a && o !== d && dist(o, d) <= 1) tg.push(o); });
  tg.forEach(t => hit(a, t));
  a.acted = a.moved = true;
  if (a.hero === 'lone' && a.kills >= 2 && a.hp > 0) { a.hero = 'valor'; a.mhp = H.valor.hp; a.hp = Math.min(a.mhp, a.hp + 4); log('孤高の英雄が「武勇の英雄」に進化!'); }
  G.units = G.units.filter(u => u.hp > 0);
  if (G.sel && G.sel.hp <= 0) G.sel = null;
  check();
}
function check() {
  const a = G.units.some(u => u.side === 0), b = G.units.some(u => u.side === 1);
  if (!a || !b) finish(a ? '勝利!敵軍を殲滅した' : '敗北…全部隊を失った', a);
}
function finish(msg, win) {
  G.over = true; render();
  box('<h3>' + msg + '</h3><p>第' + G.turn + 'ターンで決着</p><div class="row"><button class="btn" id="bAgain">もう一度</button></div>');
  $('#bAgain').onclick = () => { closeBox(); toSelect(); };
}
function endTurn() {
  if (G.over) return;
  G.sel = null;
  if (G.cur === 1) {
    if (G.turn >= MAXT) { const a = hpSum(0), b = hpSum(1); return finish(a === b ? '引き分け(ターン上限・残HP同数)' : (a > b ? '勝利!ターン上限・残HPで上回った' : '敗北…ターン上限・残HPで下回った'), a > b); }
    G.turn++;
  }
  G.cur ^= 1; startTurn(G.cur); render();
  if (G.cur === 1) cpu();
}

// ---- CPU(簡易AI) ----
function cpu() {
  const ids = G.units.filter(u => u.side === 1).map(u => u.id); let i = 0;
  const step = () => {
    if (G.over) return;
    if (i >= ids.length) return endTurn();
    const u = G.units.find(o => o.id === ids[i++]);
    if (u) ai(u);
    render(); setTimeout(step, 420);
  };
  setTimeout(step, 500);
}
function ai(u) {
  const foes = G.units.filter(e => e.side === 0); if (!foes.length) return;
  const cells = [{ x: u.x, y: u.y }];
  reach(u).forEach((d, k) => { const [x, y] = k.split(',').map(Number); cells.push({ x, y }); });
  let best = null;
  for (const c of cells) for (const e of foes) {
    const d = dist(c, e); if (d > rng(u)) continue;
    const dm = dmg(u, e), s = dm + (dm >= e.hp ? 6 : 0) + (e.hero ? 2 : 0) + (rng(u) > 1 ? d * 0.3 : 0);
    if (!best || s > best.s) best = { s, c, e };
  }
  if (best) { u.x = best.c.x; u.y = best.c.y; u.moved = true; attack(u, best.e); return; }
  let bc = cells[0], bd = 1e9;
  for (const c of cells) { const d = Math.min(...foes.map(e => dist(c, e))) + Math.random() * 0.5; if (d < bd) { bd = d; bc = c; } }
  u.x = bc.x; u.y = bc.y; u.moved = true;
}

// ---- 入力 ----
function onCell(x, y) {
  if (!G || G.over || G.cur !== 0) return;
  const u = at(x, y), s = G.sel;
  if (s) {
    if (u && u.side === 0 && u !== s && !u.acted) G.sel = u;
    else if (u && u.side === 1 && canHit(s, u)) attack(s, u);
    else if (!u && !s.moved && reach(s).has(x + ',' + y)) { s.x = x; s.y = y; s.moved = true; }
    else if (u === s) G.sel = null;
    else if (!u) G.sel = null;
  } else if (u && u.side === 0 && !u.acted) G.sel = u;
  render();
}

// ---- 描画 ----
function render() {
  if (!G) return;
  const s = G.sel, rc = s && !s.moved && !s.acted ? reach(s) : new Map();
  const tg = s ? G.units.filter(e => canHit(s, e)) : [];
  let h = '';
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = at(x, y), cl = ['c'];
    if ((x + y) % 2) cl.push('d');
    if (rc.has(x + ',' + y)) cl.push('mv');
    if (s && s.x === x && s.y === y) cl.push('sel');
    if (u && tg.includes(u)) cl.push('atk');
    let ui = '';
    if (u) ui = '<div class="u s' + u.side + (u.hero ? ' hero' : '') + (u.acted && u.side === G.cur ? ' done' : '') + '"><b>' + base(u).s + '</b><i>' + u.hp + '</i></div>';
    h += '<div class="' + cl.join(' ') + '" data-x="' + x + '" data-y="' + y + '">' + ui + '</div>';
  }
  $('#board').innerHTML = h;
  $('#status').innerHTML = '第' + G.turn + '/' + MAXT + 'ターン ― ' + (G.cur ? '敵の番' : 'あなたの番') + '<br><span class="t0">自:' + G.fac[0].n + '(' + G.units.filter(u => u.side === 0).length + '部隊)</span><br><span class="t1">敵:' + G.fac[1].n + '(' + G.units.filter(u => u.side === 1).length + '部隊)</span>';
  $('#info').innerHTML = s ? '<b>' + uname(s) + '</b> HP ' + s.hp + '/' + s.mhp + '<br>攻' + atk(s) + ' 防' + def(s) + ' 移' + mov(s) + ' 射程' + rng(s) + '<br>' + (s.hero ? H[s.hero].d : (s.moved ? '移動済み' : '移動可能') + (s.acted ? '・行動済み' : '')) : '部隊をタップして選択';
  const lg = $('#log'); lg.innerHTML = G.log.slice(-14).join('<br>'); lg.scrollTop = lg.scrollHeight;
}

// ---- 画面 ----
function show(id) { document.querySelectorAll('.screen').forEach(e => e.classList.toggle('on', e.id === id)); }
function box(html) { $('#modalBox').innerHTML = html; $('#modal').classList.remove('hidden'); }
function closeBox() { $('#modal').classList.add('hidden'); }
function toSelect() {
  cand = shuffle(F).slice(0, 5); pick = null; show('sc-select');
  $('#cards').innerHTML = cand.map((f, i) => '<div class="card" data-i="' + i + '"><b>' + f.n + '</b><span>' + f.kw + '</span><span>' + f.ab + '</span></div>').join('');
  $('#detail').textContent = '勢力をタップすると詳細が表示されます'; $('#bGo').disabled = true;
}
function tally(f) {
  if ((f.fl || {}).rnd) return 'ランダム7部隊';
  const c = {}; f.army.forEach(t => c[t] = (c[t] || 0) + 1);
  return Object.keys(c).map(t => T[t].n + '×' + c[t]).join(' ');
}
function helpText() {
  box('<h3>遊び方</h3><ul><li>自軍(青)の部隊をタップ→水色のマスをタップで移動(1ターン1回)。</li><li>赤枠の敵が射程内なら、その敵をタップで攻撃(1ターン1回、移動後も可)。</li><li>「待機」でその部隊の行動を終了、「ターン終了」で敵の番へ。</li><li>敵を全滅で勝利。第' + MAXT + 'ターン終了時は残りHP合計で判定。</li><li>英雄:3ターン目以降に条件を満たすと自動出現(優勢→孤高、劣勢→智将、4ターン目以降→国民に愛される英雄)。孤高の英雄は2体撃破で武勇の英雄に進化。</li></ul><h3>実装状況</h3><ul><li>対戦はCPU(簡易AI)との1人用のみ。2人同時対戦(通信・交代プレイ)は未実装。</li><li>反撃・地形・勢力ごとの細かな固有演出は未実装。</li><li>数値と英雄の出現条件はすべて仮設定です。</li></ul><div class="row"><button class="btn" id="bClose">閉じる</button></div>');
  $('#bClose').onclick = closeBox;
}

// ---- 初期化 ----
function init() {
  $('#bStart').onclick = toSelect;
  $('#bReroll').onclick = toSelect;
  $('#cards').onclick = e => {
    const c = e.target.closest('.card'); if (!c) return;
    pick = cand[+c.dataset.i];
    document.querySelectorAll('.card').forEach(el => el.classList.toggle('on', el === c));
    $('#detail').innerHTML = '<em>' + pick.n + '</em>(' + pick.kw + ')<br><em>' + pick.ab + '</em>:' + pick.d + '<br>メリット:' + pick.p + '<br>デメリット:' + pick.c + '<br>編成:' + tally(pick);
    $('#bGo').disabled = false;
  };
  $('#bGo').onclick = () => { if (!pick) return; const rest = F.filter(f => f !== pick); uid = 1; newGame(pick, rest[rnd(rest.length)]); };
  $('#board').onclick = e => { const c = e.target.closest('.c'); if (c) onCell(+c.dataset.x, +c.dataset.y); };
  $('#bWait').onclick = () => { if (G && !G.over && G.cur === 0 && G.sel) { G.sel.moved = G.sel.acted = true; G.sel = null; render(); } };
  $('#bEnd').onclick = () => { if (G && !G.over && G.cur === 0) endTurn(); };
  document.querySelectorAll('.bHelp').forEach(b => b.onclick = helpText);
}
init();
})();
