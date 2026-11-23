'use strict';
(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const CFG = window.SITE_CONFIG || {};
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = (n, d = 0) => n.toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });

/* ---------- Contacto desde config ---------- */
const WA = /^\d{8,15}$/.test(CFG.whatsapp || '') ? CFG.whatsapp : '573142789625';
const MAIL = CFG.email || 'disenomecatronico10@gmail.com';
const GH = CFG.github || 'https://github.com/AcePipe13/22Angeles/tree/main';
$$('a[href^="https://wa.me/"]').forEach(a => a.href = 'https://wa.me/' + WA);
$$('a[href^="mailto:"]').forEach(a => a.href = 'mailto:' + MAIL);
$$('a[href^="https://github.com/AcePipe13"]').forEach(a => { if (!a.id || a.id === 'ch-gh') a.href = GH; });

/* ---------- Carga inicial ---------- */
requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('loaded')));

/* ---------- Encabezado, menú, progreso, sección activa ---------- */
const header = $('.site-header'), bar = $('#progress');
const onScroll = () => {
  const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
  header.classList.toggle('scrolled', y > 12);
  bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
};
addEventListener('scroll', onScroll, { passive: true }); onScroll();

const menuBtn = $('.menu-btn'), nav = $('#nav');
const setMenu = open => { nav.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú'); document.body.classList.toggle('menu-open', open); };
menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
$$('#nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });

const navLinks = $$('#nav a[href^="#"]');
const secObs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach(s => secObs.observe(s));


/* ---------- Navegación precisa a cada sección ---------- */
function targetY(el) {
  if (el.id === 'inicio') return 0;
  const pad = el.matches('section') ? parseFloat(getComputedStyle(el).paddingTop) : 0;
  return Math.max(0, el.getBoundingClientRect().top + scrollY + Math.max(0, pad - 28) - header.offsetHeight);
}
function goTo(hash, smooth = true) {
  const el = document.getElementById(hash.slice(1)); if (!el) return false;
  scrollTo({ top: targetY(el), behavior: smooth && !reduce ? 'smooth' : 'auto' });
  // al terminar el desplazamiento, corrige si algo cambió de tamaño por el camino
  let last = -1, still = 0;
  const settle = () => {
    if (Math.abs(scrollY - last) < 1) still++; else { still = 0; last = scrollY; }
    if (still < 4) return requestAnimationFrame(settle);
    const y = targetY(el); if (Math.abs(scrollY - y) > 3) scrollTo({ top: y, behavior: 'auto' });
  };
  setTimeout(settle, 150);
  history.replaceState(null, '', hash);
  return true;
}
$$('a[href^="#"]:not(.skip)').forEach(a => a.addEventListener('click', e => {
  const h = a.getAttribute('href'); if (h.length > 1 && goTo(h)) e.preventDefault();
}));
if (location.hash) addEventListener('load', () => setTimeout(() => goTo(location.hash, false), 50));

/* ---------- Animaciones al entrar en pantalla ---------- */
$$('[data-stagger]').forEach(p => [...p.children].forEach((c, i) => c.style.setProperty('--i', i)));
const counted = new WeakSet();
function countUp(el) {
  if (counted.has(el)) return; counted.add(el);
  const end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
  if (reduce) { el.textContent = fmt(end, dec); return; }
  const t0 = performance.now(), dur = 1300;
  const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(end * e, dec); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
const revObs = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  $$('[data-count]', e.target).forEach(countUp);
  e.target.dispatchEvent(new CustomEvent('reveal'));
  revObs.unobserve(e.target);
}), { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
$$('[data-reveal],[data-stagger]').forEach(el => revObs.observe(el));
setTimeout(() => $$('.hero [data-count]').forEach(countUp), reduce ? 0 : 700);

/* ---------- Héroe: leve paralaje del modelo ---------- */
const stage = $('.hero-stage'), cad = $('.hero-cad');
if (stage && !reduce && matchMedia('(pointer:fine)').matches) {
  stage.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    cad.style.setProperty('--px', (x * 18).toFixed(1) + 'px'); cad.style.setProperty('--py', (y * 12).toFixed(1) + 'px');
  });
  stage.addEventListener('pointerleave', () => { cad.style.setProperty('--px', '0px'); cad.style.setProperty('--py', '0px'); });
}

/* ---------- Explora tu silla ---------- */
const TECH = {
  movement: { k: 'Dos motores, una respuesta', t: 'Movimiento que responde', c: 'Cada rueda trasera tiene su propio motor. Así la silla avanza, retrocede y gira con precisión.', f: ['2 motores DC de 24 V', 'Transmisión por cadena 1:1', 'Un encoder en cada rueda'], chip: 'Motores · cadena · ruedas motrices' },
  control: { k: 'Con la mano o con la voz', t: 'Joystick o voz', c: 'Elige cómo dar la orden. El joystick marca dirección e intensidad; la voz, órdenes simples.', f: ['Joystick analógico', '5 comandos de voz', '3 niveles de velocidad'], chip: 'Joystick y micrófono' },
  safety: { k: 'Ojos alrededor de la silla', t: 'Sensores que miran por ti', c: 'Miden qué tan cerca están los objetos. La cámara trasera muestra lo que hay detrás al maniobrar.', f: ['4 sensores de distancia', 'Alcance de hasta ~4 m', 'Cámara trasera'], chip: 'Sensores de distancia · cámara' },
  screen: { k: 'Tu silla de un vistazo', t: 'Todo en una pantalla', c: 'Velocidad, batería, cámara, ubicación y pulso, reunidos en una pantalla táctil.', f: ['Pantalla táctil de 7"', 'Cámara y GPS integrados', 'Pulso orientativo'], chip: 'Pantalla táctil de 7"' },
  energy: { k: 'Energía para tu día', t: 'Batería bajo control', c: 'Dos baterías alimentan motores y electrónica. La silla mide su voltaje y su consumo.', f: ['24 V · 65 Ah', 'Medición de voltaje y corriente', 'Autonomía: en pruebas'], chip: 'Baterías · monitoreo eléctrico' },
  intelligence: { k: 'Un solo sistema', t: 'Todo conectado', c: 'Tu orden viaja a los motores mientras sensores y pantalla trabajan juntos, en tiempo real.', f: ['ESP32 regula los motores', 'Raspberry Pi 5 coordina todo', 'Velocidad en lazo cerrado'], chip: 'Sistemas conectados' }
};
const ORDER = Object.keys(TECH);
const techBtns = $$('[data-tech]'), parts = $$('#chair-model [data-part]');
let techIdx = 0, autoplay = !reduce, autoT = 0, exploreVisible = false;
function selectTech(key, user) {
  const d = TECH[key]; techIdx = ORDER.indexOf(key);
  techBtns.forEach(b => { const on = b.dataset.tech === key; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
  parts.forEach(p => p.classList.toggle('active', key === 'intelligence' || p.dataset.part === key));
  $('#model-stage').dataset.mode = key;
  const panel = $('#tech-panel'); panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
  $('#tech-kicker').textContent = d.k; $('#tech-title').textContent = d.t; $('#tech-copy').textContent = d.c;
  $('#tech-facts').replaceChildren(...d.f.map(x => Object.assign(document.createElement('li'), { textContent: x })));
  $('#part-chip').textContent = d.chip;
  if (user) stopAuto();
}
function stopAuto() { autoplay = false; $('#model-stage').classList.add('manual'); }
techBtns.forEach(b => {
  b.addEventListener('click', () => selectTech(b.dataset.tech, true));
  b.addEventListener('keydown', e => {
    const i = techBtns.indexOf(b), n = techBtns.length;
    let j = null;
    if (['ArrowDown', 'ArrowRight'].includes(e.key)) j = (i + 1) % n;
    if (['ArrowUp', 'ArrowLeft'].includes(e.key)) j = (i - 1 + n) % n;
    if (j !== null) { e.preventDefault(); techBtns[j].focus(); selectTech(techBtns[j].dataset.tech, true); }
  });
});
parts.forEach(p => {
  const k = p.dataset.part; if (!TECH[k]) return;
  p.addEventListener('click', () => selectTech(k, true));
  p.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { p.classList.add('hover'); selectTech(k, true); } });
  p.addEventListener('pointerleave', () => p.classList.remove('hover'));
});
selectTech('movement');
new IntersectionObserver(es => { exploreVisible = es[0].isIntersecting; }, { threshold: .35 }).observe($('#explora'));
const AUTO_MS = 4800; let lastT = performance.now();
(function tick(t) {
  const dt = t - lastT; lastT = t;
  if (autoplay && exploreVisible && !document.hidden) {
    autoT += dt; $('#autoplay-bar').style.transform = `scaleX(${Math.min(1, autoT / AUTO_MS)})`;
    if (autoT >= AUTO_MS) { autoT = 0; selectTech(ORDER[(techIdx + 1) % ORDER.length]); }
  }
  if (autoplay) requestAnimationFrame(tick);
})(lastT);

/* ---------- Simulador de manejo ---------- */
const cv = $('#sim'), ctx = cv.getContext('2d');
const ROOM = { w: 8, h: 5 };
const OBST = [
  { x: 5.1, y: 1.1, w: 1.3, h: .9, label: 'Mesa' },
  { x: 1.3, y: 3.75, w: 1.8, h: .75, label: 'Sofá' },
  { x: 6.6, y: 3.5, w: .85, h: .85, label: 'Planta' }
];
const R = .42, TRACK = .56, VMAX = 1.1;
const S = { x: 2.1, y: 1.6, a: 0, L: 0, Rw: 0, tL: 0, tR: 0, trail: [], blocked: false };
const mode = 'joy', voice = { cmd: null, turnLeft: 0 };
function resetSim() { Object.assign(S, { x: 2.1, y: 1.6, a: 0, L: 0, Rw: 0, tL: 0, tR: 0, trail: [], blocked: false }); voice.cmd = null; setState('En reposo'); }
$('#sim-reset').addEventListener('click', () => { resetSim(); centerJoy(); });

function size() {
  const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth, h = w * ROOM.h / ROOM.w;
  cv.style.height = h + 'px'; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  ctx.setTransform(dpr * w / ROOM.w, 0, 0, dpr * w / ROOM.w, 0, 0);
}
new ResizeObserver(size).observe(cv); size();

function hits(x, y) {
  if (x < R || y < R || x > ROOM.w - R || y > ROOM.h - R) return true;
  return OBST.some(o => { const cx = Math.max(o.x, Math.min(x, o.x + o.w)), cy = Math.max(o.y, Math.min(y, o.y + o.h)); return (x - cx) ** 2 + (y - cy) ** 2 < R * R; });
}
function ray(x, y, dx, dy) {
  let t = 0; const st = .02;
  while (t < 4.2) { t += st; const px = x + dx * t, py = y + dy * t;
    if (px < 0 || py < 0 || px > ROOM.w || py > ROOM.h || OBST.some(o => px > o.x && px < o.x + o.w && py > o.y && py < o.y + o.h)) return t; }
  return Infinity;
}
let stateTxt = '';
function setState(t, warn) { if (t !== stateTxt) { stateTxt = t; const el = $('#sim-state'); el.textContent = t; el.classList.toggle('warn', !!warn); } }

function physics(dt) {
  // rampa de aceleración: transición progresiva hacia la referencia
  const ramp = 1.6 * dt;
  S.L += Math.max(-ramp, Math.min(ramp, S.tL - S.L));
  S.Rw += Math.max(-ramp, Math.min(ramp, S.tR - S.Rw));
  const v = (S.L + S.Rw) / 2 * VMAX, w = (S.L - S.Rw) * VMAX / TRACK;
  const na = S.a + w * dt, nx = S.x + Math.cos(na) * v * dt, ny = S.y + Math.sin(na) * v * dt;
  if (Math.abs(v) > .001 || Math.abs(w) > .001) {
    if (hits(nx, ny)) {
      S.L = S.Rw = S.tL = S.tR = 0; voice.cmd = null; S.blocked = true; setState('Detenida: hay un objeto', true);
    } else {
      S.x = nx; S.y = ny; S.a = na; S.blocked = false;
      if (voice.turnLeft > 0) { voice.turnLeft -= Math.abs(w * dt); if (voice.turnLeft <= 0) { voice.cmd = null; S.tL = S.tR = 0; } }
      const last = S.trail[S.trail.length - 1];
      if (!last || Math.hypot(last[0] - S.x, last[1] - S.y) > .05) { S.trail.push([S.x, S.y]); if (S.trail.length > 160) S.trail.shift(); }
    }
  }
}
function sensors() {
  const c = Math.cos(S.a), s = Math.sin(S.a);
  const f = ray(S.x + c * R, S.y + s * R, c, s), b = ray(S.x - c * R, S.y - s * R, -c, -s);
  const show = (el, d) => { el.textContent = d > 4 ? '> 4 m' : fmt(d, 2) + ' m'; el.className = d < .5 ? 'near' : d < 1 ? 'mid' : ''; };
  show($('#tof-front'), f); show($('#tof-back'), b);
  return { f, b };
}
function hud() {
  const l = Math.round(S.L * 100), r = Math.round(S.Rw * 100);
  for (const [id, val] of [['w-left', l], ['w-right', r]]) {
    const el = $('#' + id); el.style.transform = `scaleX(${Math.abs(val) / 100})`; el.classList.toggle('neg', val < 0);
    $('#' + id + '-v').textContent = val + ' %';
  }
}
function draw(tof) {
  const W = ROOM.w, H = ROOM.h;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#F5F7FA'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(27,59,99,.08)'; ctx.lineWidth = .01;
  for (let i = .5; i < W; i += .5) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
  for (let j = .5; j < H; j += .5) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(W, j); ctx.stroke(); }
  ctx.strokeStyle = '#1B3B63'; ctx.lineWidth = .06; ctx.strokeRect(.03, .03, W - .06, H - .06);
  ctx.font = `600 ${Math.max(.17, 11 / (cv.clientWidth / ROOM.w)).toFixed(3)}px Inter, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  OBST.forEach(o => { ctx.fillStyle = '#D5DEE8'; rr(o.x, o.y, o.w, o.h, .08); ctx.fill(); ctx.fillStyle = '#475467'; ctx.fillText(o.label, o.x + o.w / 2, o.y + o.h / 2); });
  // rastro
  if (S.trail.length > 1) { ctx.strokeStyle = 'rgba(34,184,207,.45)'; ctx.lineWidth = .05; ctx.setLineDash([.08, .08]); ctx.beginPath(); S.trail.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.setLineDash([]); }
  ctx.save(); ctx.translate(S.x, S.y); ctx.rotate(S.a);
  // conos de los sensores
  const cone = (dir, d) => { const len = Math.min(d, 4) + R; const near = d < .5;
    const g = ctx.createRadialGradient(0, 0, R * .6, 0, 0, len); g.addColorStop(0, near ? 'rgba(240,68,56,.35)' : 'rgba(34,184,207,.28)'); g.addColorStop(1, 'rgba(34,184,207,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, len, dir - .22, dir + .22); ctx.closePath(); ctx.fill(); };
  cone(0, tof.f); cone(Math.PI, tof.b);
  // silla (vista superior): x hacia el frente
  ctx.fillStyle = '#1B3B63'; rr(-.36, -.3, .66, .6, .1); ctx.fill();
  ctx.fillStyle = '#101828'; rr(-.42, -.26, .14, .52, .05); ctx.fill(); // respaldo
  const wheel = (y, val) => { ctx.fillStyle = '#101828'; rr(-.32, y - .06, .34, .12, .05); ctx.fill(); ctx.fillStyle = val >= 0 ? '#22B8CF' : '#F79009'; ctx.globalAlpha = Math.min(1, Math.abs(val) * 1.4 + .1); rr(-.3, y - .035, .3, .07, .03); ctx.fill(); ctx.globalAlpha = 1; };
  wheel(-.36, S.L); wheel(.36, S.Rw); // izquierda arriba en el marco de la silla
  ctx.fillStyle = '#475467'; [[.3, -.27], [.3, .27]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, .05, 0, 7); ctx.fill(); });
  ctx.fillStyle = '#22B8CF'; ctx.beginPath(); ctx.arc(.12, .22, .045, 0, 7); ctx.fill(); // joystick
  ctx.strokeStyle = '#fff'; ctx.lineWidth = .04; ctx.beginPath(); ctx.moveTo(.0, 0); ctx.lineTo(.2, 0); ctx.moveTo(.13, -.07); ctx.lineTo(.2, 0); ctx.lineTo(.13, .07); ctx.stroke();
  ctx.restore();
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
}
let simOn = false, simT = performance.now();
new IntersectionObserver(es => { const v = es[0].isIntersecting; if (v && !simOn) { simOn = true; simT = performance.now(); requestAnimationFrame(loop); } else if (!v) simOn = false; }, { threshold: .02 }).observe($('#conduce'));
function loop(t) {
  if (!simOn) return;
  const dt = Math.min(.05, (t - simT) / 1000); simT = t;
  physics(dt); const tof = sensors(); hud(); draw(tof);
  if (!S.blocked) {
    const moving = Math.abs(S.L) + Math.abs(S.Rw) > .02;
    if (Math.min(tof.f, tof.b) < .5 && moving) setState('Objeto cerca', true);
    else if (!moving) setState('En reposo');
    else if (Math.abs(S.L - S.Rw) > .25 && Math.abs(S.L + S.Rw) < .2) setState('Girando sobre su eje');
    else if (S.L + S.Rw > 0) setState(S.L - S.Rw > .15 ? 'Avanzando · gira a la derecha' : S.Rw - S.L > .15 ? 'Avanzando · gira a la izquierda' : 'Avanzando');
    else setState('Retrocediendo');
  }
  requestAnimationFrame(loop);
}

/* Joystick */
const pad = $('#joy-pad'), knob = $('#joy-knob'); let jp = null;
function setJoy(x, y) {
  const m = Math.min(1, Math.hypot(x, y)); const r = pad.clientWidth * .34;
  knob.style.transform = `translate(calc(-50% + ${x * r}px), calc(-50% - ${y * r}px))`;
  pad.classList.toggle('active', m > .05);
  if (mode !== 'joy') return;
  if (m < .08) { S.tL = S.tR = 0; return; } // zona muerta central
  const k = .65; let L = y + x * k, Rr = y - x * k; const s = Math.max(1, Math.abs(L), Math.abs(Rr)); L /= s; Rr /= s;
  S.tL = L * m; S.tR = Rr * m; S.blocked = false;
}
function centerJoy() { jp = null; setJoy(0, 0); }
function fromEvent(e) { const b = pad.getBoundingClientRect(), r = b.width * .34; let x = (e.clientX - b.left - b.width / 2) / r, y = -(e.clientY - b.top - b.height / 2) / r; const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; } setJoy(x, y); }
pad.addEventListener('pointerdown', e => { if (jp !== null) return; e.preventDefault(); jp = e.pointerId; pad.setPointerCapture(jp); fromEvent(e); });
pad.addEventListener('pointermove', e => { if (e.pointerId === jp) fromEvent(e); });
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => pad.addEventListener(t, e => { if (e.pointerId === jp) centerJoy(); }));
const held = new Set();
const keyJoy = () => { let x = (held.has('ArrowRight') ? 1 : 0) - (held.has('ArrowLeft') ? 1 : 0), y = (held.has('ArrowUp') ? 1 : 0) - (held.has('ArrowDown') ? 1 : 0); const m = Math.hypot(x, y) || 1; setJoy(x / m * .8, y / m * .8); };
pad.addEventListener('keydown', e => { if (e.key.startsWith('Arrow')) { e.preventDefault(); held.add(e.key); keyJoy(); } else if (e.key === ' ' || e.key === 'Escape') { e.preventDefault(); held.clear(); centerJoy(); } });
pad.addEventListener('keyup', e => { if (e.key.startsWith('Arrow')) { held.delete(e.key); keyJoy(); } });
pad.addEventListener('blur', () => { held.clear(); centerJoy(); });

/* ---------- Áreas de ingeniería ---------- */
const REPO = 'https://github.com/AcePipe13/22Angeles/tree/main/';
const AREAS = {
  mecanica: { t: 'Mecánica', c: 'Adaptó la estructura, montó la tracción y diseñó en CAD el soporte de cada accesorio.', img: 'cad-transmision.jpg', cap: 'Conjunto motriz: motor, cadena y rueda', s: [['V8', 'iteración CAD actual'], ['1:1', 'cadena con piñones de 25 dientes'], ['2 × 350 W', 'motores DC de 24 V']], p: 'Andrés Serrano · Felipe Rodríguez', link: REPO + 'Mecanica' },
  electronica: { t: 'Electrónica', c: 'Diseñó las placas que unen procesadores, sensores y potencia, con protección y filtrado.', img: 'pcb-ia-datos.jpg', cap: 'Placa de IA y Datos para la Raspberry Pi 5', s: [['2', 'placas PCB: control e IA'], ['5 V · 3,3 V', 'alimentación regulada'], ['30 A', 'driver de motores por canal']], p: 'Andrés Valderrama · Samuel Ortiz', link: REPO + 'Electronica_PCB' },
  control: { t: 'Control', c: 'Mide cada rueda y corrige su motor 20 veces por segundo, para que ambas respondan igual.', img: 'control-caracterizacion.jpg', cap: 'Caracterización: el mismo mando no da la misma velocidad', s: [['20 Hz', 'ciclo de control'], ['1.440', 'cuentas por vuelta del encoder'], ['PI', 'control de velocidad por rueda']], p: 'Paula Torres · Sebastián Rincón', link: REPO + 'Control' },
  ia: { t: 'IA y Datos', c: 'Conecta sensores, cámara, GPS y pantalla, y entrena el asistente de voz.', img: 'hmi-camara.jpg', cap: 'Interfaz táctil: módulo de cámara trasera', s: [['7', 'sensores en dos buses I²C'], ['6', 'pantallas en la interfaz táctil'], ['App', 'móvil de ubicación GPS']], p: 'Dahivid Mateus · Juliana Buitrago', link: REPO + 'IaDatos' }
};
const hs = $$('.hotspot'), areaTabs = $$('.area-tabs [data-area]');
function selectArea(k) {
  const d = AREAS[k]; if (!d) return;
  hs.forEach(h => h.classList.toggle('on', h.dataset.area === k));
  areaTabs.forEach(b => { const on = b.dataset.area === k; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
  const card = $('#area-card'); card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap');
  const img = $('#area-img'); img.src = d.img; img.alt = d.cap;
  $('#area-cap').textContent = d.cap; $('#area-title').textContent = d.t; $('#area-copy').textContent = d.c;
  $('#area-stats').replaceChildren(...d.s.map(([a, b]) => { const w = document.createElement('div'); const dt = document.createElement('dt'); const dd = document.createElement('dd'); dt.textContent = a; dd.textContent = b; w.append(dt, dd); return w; }));
  $('#area-people').textContent = d.p; $('#area-link').href = d.link; $('#area-link').textContent = 'Ver ' + d.t + ' en GitHub';
}
hs.forEach(h => { h.addEventListener('click', () => selectArea(h.dataset.area)); h.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') selectArea(h.dataset.area); }); h.addEventListener('focus', () => selectArea(h.dataset.area)); });
areaTabs.forEach(b => {
  b.addEventListener('click', () => selectArea(b.dataset.area));
  b.addEventListener('keydown', e => { const i = areaTabs.indexOf(b), n = areaTabs.length; let j = null; if (e.key === 'ArrowRight') j = (i + 1) % n; if (e.key === 'ArrowLeft') j = (i - 1 + n) % n; if (j !== null) { e.preventDefault(); areaTabs[j].focus(); selectArea(areaTabs[j].dataset.area); } });
});
selectArea('mecanica');

/* ---------- Comparación ---------- */
const ROWS = [['joy', 'Joystick'], ['voice', 'Comandos de voz'], ['screen', 'Pantalla táctil integrada'], ['tof', 'Sensores de distancia'], ['cam', 'Cámara trasera'], ['gps', 'Ubicación GPS'], ['pulse', 'Lectura de pulso'], ['app', 'Monitoreo de la silla'], ['range', 'Autonomía publicada']];
const US = { joy: true, voice: true, screen: '7"', tof: '4 sensores', cam: true, gps: true, pulse: true, app: 'En pantalla', range: 'En pruebas' };
const RIVALS = [
  { id: 'basica', tab: 'Eléctrica básica', name: 'Silla eléctrica básica', meta: 'TME-111 · venta en Colombia', price: 3.5, f: { joy: true, range: 'No consultada' } },
  { id: 'litio', tab: 'Eléctrica plegable', name: 'Eléctrica plegable de litio', meta: 'Lenive RUED-3E · venta en Colombia', price: 5.41, f: { joy: true, range: '20 km' } },
  { id: 'whill', tab: 'WHILL C2', name: 'WHILL Model C2', meta: 'Japón · US$3.999', price: 13.2, f: { joy: true, app: 'App Bluetooth', range: '≈ 20 km' }, plus: 'Aprobada por la FDA como dispositivo médico.' },
  { id: 'permobil', tab: 'Permobil M3', name: 'Permobil M3 Corpus', meta: 'Suecia · desde £6.995', price: 29.5, f: { joy: true, app: 'App MyPermobil', range: '≈ 26 km' }, plus: 'Asiento motorizado con elevación e inclinación.' }
];
const tabs = $('#rival-tabs');
RIVALS.forEach((r, i) => { const b = document.createElement('button'); b.role = 'tab'; b.textContent = r.tab; b.dataset.rival = r.id; b.setAttribute('aria-selected', String(i === 2)); b.addEventListener('click', () => showRival(r.id)); tabs.append(b); });
const cell = v => { const s = document.createElement('span'); if (v === true) { s.className = 'yes'; s.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg><em class="sr">Sí</em>'; } else if (!v) { s.className = 'no'; s.textContent = 'No anunciado'; } else { s.className = 'txt'; s.textContent = v; } return s; };
function showRival(id) {
  const r = RIVALS.find(x => x.id === id);
  $$('[data-rival]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.rival === id)));
  $('#rival-name').textContent = r.name; $('#rival-meta').textContent = r.meta;
  const ul = $('#vs-rows'); ul.classList.remove('swap'); void ul.offsetWidth; ul.classList.add('swap');
  ul.replaceChildren(...ROWS.map(([k, label], i) => { const li = document.createElement('li'); li.style.setProperty('--i', i); const l = document.createElement('b'); l.textContent = label; li.append(cell(US[k]), l, cell(r.f[k])); return li; }));
  const extra = ROWS.filter(([k]) => k !== 'range' && US[k] && !r.f[k]).length;
  $('#vs-score').textContent = `22 Ángeles integra ${extra} funciones que ${r.name} no anuncia.` + (r.plus ? ` A su favor: ${r.plus}` : '');
}
showRival('whill');

const PRICES = [
  { n: 'Silla eléctrica básica', v: 3.5 },
  { n: '22 Ángeles · materiales del prototipo', v: 4.5, us: 1 },
  { n: 'Eléctrica plegable de litio', v: 5.41 },
  { n: '22 Ángeles · precio objetivo de planeación', v: 10, us: 2 },
  { n: 'WHILL Model C2 (importada)', v: 13.2 },
  { n: 'Permobil M3 Corpus (importada)', v: 29.5 }
];
const pc = $('#price-chart');
PRICES.forEach((p, i) => {
  const row = document.createElement('div'); row.className = 'p-row' + (p.us ? ' us' + p.us : ''); row.style.setProperty('--i', i); row.style.setProperty('--w', (p.v / 30 * 100).toFixed(1) + '%');
  row.innerHTML = `<span class="p-name"></span><span class="p-track"><i></i></span><b class="p-val">$${fmt(p.v, 1)} M</b>`;
  row.querySelector('.p-name').textContent = p.n; pc.append(row);
});
revObs.observe(pc);

/* ---------- Viabilidad: dona ---------- */
const CATS = [
  { n: 'Energía y protección', v: 1156000, c: '#1B3B63', items: 'Dos baterías de 12 V y 65 Ah, cargador de 24 V, fusibles, bornera, cableado de potencia, botón de parada y sensor de corriente.' },
  { n: 'Inteligencia y pantalla', v: 1147000, c: '#22B8CF', items: 'Raspberry Pi 5, pantalla táctil, joystick, sensores de distancia, pulso y orientación, micrófono, convertidor ADC y memoria.' },
  { n: 'Propulsión', v: 1042000, c: '#3E7CB1', items: 'Dos motores DC de 24 V, driver Cytron MDDS30 y dos encoders.' },
  { n: 'Estructura y movilidad', v: 702000, c: '#8FDCE8', items: 'Silla base, varillas de acero, llantas de 18", piñones, cadena, rodamientos y tapicería.' },
  { n: 'Placas y cableado', v: 453000, c: '#98A2B3', items: 'Dos placas PCB, componentes electrónicos, cable de señal y conectores.' }
];
const TOTAL = CATS.reduce((a, c) => a + c.v, 0);
const svgNS = 'http://www.w3.org/2000/svg', donut = $('#donut');
const RAD = 84, CIRC = 2 * Math.PI * RAD; let acc = 0;
const bg = document.createElementNS(svgNS, 'circle'); Object.entries({ cx: 110, cy: 110, r: RAD, class: 'd-bg' }).forEach(([k, v]) => bg.setAttribute(k, v)); donut.append(bg);
const segs = CATS.map((c, i) => {
  const len = c.v / TOTAL * CIRC, gap = 3;
  const s = document.createElementNS(svgNS, 'circle');
  Object.entries({ cx: 110, cy: 110, r: RAD, class: 'd-seg', stroke: c.c, 'stroke-dashoffset': String(-acc), transform: 'rotate(-90 110 110)', tabindex: '0', role: 'button', 'aria-label': `${c.n}: ${pct(c.v)}` }).forEach(([k, v]) => s.setAttribute(k, v));
  s.style.setProperty('--da', `${Math.max(0, len - gap)} ${CIRC}`); s.style.setProperty('--i', i);
  acc += len; donut.append(s); return s;
});
function pct(v) { return fmt(v / TOTAL * 100, 1) + ' %'; }
const legend = $('#legend');
const lis = CATS.map((c, i) => { const li = document.createElement('li'); const b = document.createElement('button'); b.style.setProperty('--c', c.c); b.innerHTML = '<i></i><span></span><b></b>'; b.querySelector('span').textContent = c.n; b.querySelector('b').textContent = pct(c.v); b.addEventListener('click', () => pick(i)); b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') pick(i); }); li.append(b); legend.append(li); return b; });
let picked = -1;
function pick(i) {
  picked = i; const c = CATS[i];
  segs.forEach((s, j) => s.classList.toggle('dim', j !== i)); lis.forEach((b, j) => b.classList.toggle('on', j === i));
  $('#donut-value').textContent = '$' + fmt(c.v / 1e6, 2) + ' M'; $('#donut-label').textContent = c.n;
  const li = $('#legend-items'); li.textContent = c.items; li.classList.remove('swap'); void li.offsetWidth; li.classList.add('swap');
}
function unpick() { picked = -1; segs.forEach(s => s.classList.remove('dim')); lis.forEach(b => b.classList.remove('on')); $('#donut-value').textContent = '$4,5 M'; $('#donut-label').textContent = 'inversión total del prototipo'; }
segs.forEach((s, i) => { s.addEventListener('click', () => pick(i)); s.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i); } }); s.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') pick(i); }); });
$('.donut-wrap').addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') unpick(); });
revObs.observe($('.donut-wrap'));

/* Botón flotante: se oculta donde estorba */
new IntersectionObserver(es => es.forEach(e => document.body.classList.toggle('hide-float-' + e.target.id, e.isIntersecting)), { threshold: .15 }).observe($('#conduce'));
new IntersectionObserver(es => es.forEach(e => document.body.classList.toggle('hide-float-' + e.target.id, e.isIntersecting)), { threshold: .15 }).observe($('#contacto'));

/* ---------- Galería ---------- */
const lb = $('#lightbox');
$$('.g-item[data-full]').forEach(b => b.addEventListener('click', () => { $('#lb-img').src = b.dataset.full; $('#lb-img').alt = b.dataset.cap; $('#lb-cap').textContent = b.dataset.cap; lb.showModal(); }));
$('#lb-close').addEventListener('click', () => lb.close());
lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });

/* ---------- FAQ: una abierta a la vez ---------- */
$$('.faq details').forEach(d => d.addEventListener('toggle', () => { if (d.open) $$('.faq details').forEach(o => { if (o !== d) o.open = false; }); }));

/* ---------- Formulario ---------- */
const form = $('#form'); let via = 'wa';
$$('[data-via]').forEach(b => b.addEventListener('click', () => via = b.dataset.via));
form.addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(form), name = (f.get('nombre') || '').trim(), st = $('#form-status');
  if (!name) { st.textContent = 'Escribe tu nombre para preparar el mensaje.'; st.className = 'form-status err'; form.nombre.focus(); return; }
  const msg = (f.get('mensaje') || '').trim();
  const text = `Hola, equipo de 22 Ángeles. Soy ${name} y me interesa ${f.get('interes')}.` + (msg ? `\n\n${msg}` : '');
  if (via === 'wa') { window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(text), '_blank', 'noopener'); st.textContent = 'Abrimos WhatsApp con tu mensaje listo para enviar.'; }
  else { location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Consulta sobre 22 Ángeles') + '&body=' + encodeURIComponent(text); st.textContent = 'Abrimos tu correo con el mensaje listo para enviar.'; }
  st.className = 'form-status ok';
});
})();
