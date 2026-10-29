(() => {
"use strict";
const IMG_W = 1680, IMG_H = 944;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (id) => document.getElementById(id);
const esc = (t) => String(t).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const narrow = () => innerWidth <= 760;
const store = { get(k){ try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v){ try { localStorage.setItem(k, v); } catch (e) {} } };

/* ================= contenido: se carga desde contenido.json ================= */
const STATUS = { idea:["Idea","var(--idea)"], desarrollo:["En desarrollo","var(--dev)"], validacion:["En validación","var(--val)"], activo:["Activo","var(--live)"] };
const LOOKS = { papel:"paper", cuaderno:"notebook", mapa:"route", vidrio:"glass", tarjeta:"card", pantalla:"screen" };
let UPDATED = "", NOW = "", PROJECTS = [], SECTIONS = {}, OBJECTS = [], SECTION_KEYS = [], REDES = {};
function useContent(c){
  UPDATED = c.actualizado || "";
  PROJECTS = (c.proyectos || []).map(p => ({ id:p.id, mono:p.iniciales, color:p.color, name:p.nombre, tag:p.area, st:STATUS[p.estado] ? p.estado : "idea", d:p.descripcion, last:p.ultimaVersion || "" }));
  SECTIONS = {};
  for (const [k, sec] of Object.entries(c.secciones || {})) SECTIONS[k] = {
    look:LOOKS[sec.estilo] || "paper", rot:sec.inclinacion, kicker:sec.etiqueta, title:sec.titulo, lead:sec.bajada,
    items:(sec.entradas || []).map(e => ({ feature:!!e.destacado, meta:e.dato, t:e.titulo, d:e.texto, href:e.enlace, link:e.textoEnlace, copy:e.copiar })) };
  OBJECTS = (c.objetos || []).map(o => ({ key:o.clave, name:o.nombre, what:o.abre, lamp:o.clave === "lampara" })).filter(o => WIDE[o.key] && (o.lamp || SECTIONS[o.key]));
  SECTION_KEYS = Object.keys(SECTIONS).filter(k => WIDE[k]);
  NOW = c.ahora || (SECTIONS["en-que-ando"] && SECTIONS["en-que-ando"].items[0] ? SECTIONS["en-que-ando"].items[0].t : "");
  REDES = c.redes || {};
}
/* zonas de cada objeto, en % de cada foto */
const WIDE = {
  proyectos:{ x:35.1, y:47.7, w:17, h:23 },
  columnas:{ x:39.5, y:71.5, w:25.4, h:13.5 },
  "en-que-ando":{ x:62.2, y:74.2, w:17, h:9.6 },
  recorrido:{ x:43, y:0.5, w:20.8, h:41.5, below:true },
  observatorio:{ x:4.8, y:4, w:19.8, h:38, below:true },
  conversemos:{ x:21.5, y:68.5, w:8.5, h:10.5 },
  recomendaciones:{ x:27, y:76.3, w:12.3, h:6.8 },
  "sobre-mi":{ x:56.5, y:60.6, w:14.9, h:10.2 },
  herramientas:{ x:76.2, y:59.9, w:4.5, h:13.2 },
  escuchando:{ x:69, y:35.5, w:7.4, h:15.5 },
  lampara:{ x:61.9, y:19, w:9.2, h:18 }
};
const SEATED = {
  proyectos:{ x:33.3, y:67.3, w:29.2, h:9.2, zs:1.6 },
  columnas:{ x:34, y:75.5, w:29, h:21, zs:1.8 },
  "en-que-ando":{ x:64.5, y:77, w:23, h:17, zs:1.9 },
  recorrido:{ x:36.5, y:0.5, w:23, h:31, zs:1.7, below:true },
  observatorio:{ x:0.5, y:1, w:17, h:49, zs:1.6, below:true },
  conversemos:{ x:13, y:66, w:12, h:17, zs:2.0 },
  recomendaciones:{ x:16.5, y:83, w:17, h:12.5, zs:2.0 },
  "sobre-mi":{ x:62, y:54, w:15, h:14, zs:2.0 },
  herramientas:{ x:81.5, y:59, w:6.5, h:14, zs:2.2 },
  escuchando:{ x:72.5, y:25, w:8.8, h:20, zs:1.9 },
  lampara:{ x:62, y:7, w:11, h:18 }
};
const SCREEN_QUAD = [[36.13,40.68],[59.17,40.36],[59.64,65.47],[35.95,65.78]];
const CHAIR = { x:1.2, y:55, w:22.6, h:44.5 };
/* el laptop en cada foto: ancla del movimiento entre estar de pie y sentado */
const LW = { x:43.6, y:60.3 }, LP = { x:47.9, y:57.5 }, LRATIO = 17 / 29.2;

/* ================= texturas generadas ================= */
function noiseURL(size, alpha){
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d"), img = g.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i+1] = img.data[i+2] = v; img.data[i+3] = alpha; }
  g.putImageData(img, 0, 0); return c.toDataURL("image/png");
}
function contourURL(w, h, { bg, line, levels = 16, step = 6, seed = 1.3, width = 1 }){
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d");
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
  const cols = Math.ceil(w / step) + 1, rows = Math.ceil(h / step) + 1, F = new Float32Array(cols * rows);
  const f = (x, y) => Math.sin(x * .0062 + seed) * Math.cos(y * .0081 - seed * .7) + .55 * Math.sin((x * .6 + y) * .0105 + seed * 2.1) + .35 * Math.cos(Math.hypot(x - w * .62, y - h * .4) * .017) + .22 * Math.sin(x * .021 - y * .014 + seed);
  let mn = Infinity, mx = -Infinity;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const v = f(i * step, j * step); F[j * cols + i] = v; mn = Math.min(mn, v); mx = Math.max(mx, v); }
  g.strokeStyle = line; g.lineWidth = width; g.lineJoin = "round";
  for (let L = 1; L < levels; L++) {
    const iso = mn + (mx - mn) * L / levels; g.beginPath();
    for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
      const a = F[j*cols+i], b = F[j*cols+i+1], cc = F[(j+1)*cols+i+1], d = F[(j+1)*cols+i];
      const k = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (cc > iso ? 2 : 0) | (d > iso ? 1 : 0);
      if (k === 0 || k === 15) continue;
      const x = i * step, y = j * step, t = (p, q) => (iso - p) / (q - p);
      const T = [x + step * t(a, b), y], R = [x + step, y + step * t(b, cc)], B = [x + step * t(d, cc), y + step], Lf = [x, y + step * t(a, d)];
      const seg = (p, q) => { g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); };
      switch (k) {
        case 1: case 14: seg(Lf, B); break;
        case 2: case 13: seg(B, R); break;
        case 3: case 12: seg(Lf, R); break;
        case 4: case 11: seg(T, R); break;
        case 6: case 9: seg(T, B); break;
        case 7: case 8: seg(Lf, T); break;
        case 5: seg(T, R); seg(Lf, B); break;
        case 10: seg(Lf, T); seg(B, R); break;
      }
    }
    g.stroke();
  }
  return c.toDataURL("image/png");
}
function makeTextures(){
  const root = document.documentElement.style;
  root.setProperty("--grain-film", `url(${noiseURL(140, 255)})`);
  root.setProperty("--grain-paper", `url(${noiseURL(160, 16)})`);
  root.setProperty("--contour-dark", `linear-gradient(160deg,rgba(10,13,20,.35),rgba(10,13,20,.85)), url(${contourURL(880, 560, { bg:"#0B0F18", line:"rgba(227,178,98,.16)", levels:18 })})`);
  root.setProperty("--contour-paper", `url(${contourURL(600, 900, { line:"rgba(120,90,50,.13)", levels:14, seed:2.4, step:7 })})`);
}

/* ================= cámara ================= */
const POSES = {
  stand: { yaw:8,  pitch:-1.5, s:1.22, tx:2,  ty:2.6 },
  seat:  { yaw:0,  pitch:0,    s:1.025,tx:0,  ty:0 }
};
let pose = { ...POSES.seat }, bob = 0;
const chair = { cx:0, cy:0, cs:1, cb:0 };
const fx = { blur:10, bright:.25 };
const look = { tx:0, ty:0, x:0, y:0 };
const OVERSCAN = { desk:1.16, phone:1.05 };   /* cuánto más grande que la pantalla: más = se puede mirar más a los lados */
const LOOK_YAW = 4.2;                           /* grados que gira la cabeza al llevar el cursor al borde */
let pan = 0, panDefault = true, geom = { vw:0, vh:0, sw:0, sh:0, left:0, top:0 };
const state = { phase:"seat", sel:null, lamp:null, manualHour:null, showAll:false, anim:true, seatS:1, mouse:false, idle:false, visited:new Set() };
let sitPromise = null, drag = null;

const viewport = $("viewport"), cam = $("cam"), stage = $("stage"), travel = $("travel"), far = $("far"), near = $("near");
const pov = $("pov"), arrive = $("arrive"), zoomPov = $("zoomPov"), lscreen = $("lscreen");

function layout(){
  const r = viewport.getBoundingClientRect();
  const vw = r.width, vh = r.height, ratio = IMG_W / IMG_H;
  let sw, sh;
  if (vw / vh > ratio) { sw = vw; sh = vw / ratio; } else { sh = vh; sw = vh * ratio; }
  /* la foto es un poco más grande que la pantalla: los bordes se asoman al mirar a los lados */
  const os = narrow() ? OVERSCAN.phone : OVERSCAN.desk;
  sw *= os; sh *= os;
  const maxPan = Math.max(0, (sw - vw) / 2);
  if (panDefault) pan = (0.5 - 0.47) * sw;
  pan = clamp(pan, -maxPan, maxPan);
  geom = { vw, vh, sw, sh, left:(vw - sw) / 2 + pan, top:(vh - sh) / 2 };
  for (const el of [stage, pov]) {
    el.style.width = sw + "px"; el.style.height = sh + "px";
    el.style.transform = `translate(${geom.left}px, ${geom.top}px)`;
  }
  const q = SCREEN_QUAD.map(([x, y]) => [x / 100 * sw, y / 100 * sh]);
  lscreen.style.transform = homography(880, 560, q);
  motes.forEach(m => m.resize(sw, sh));
  renderSit(state.seatS, false);
  applyZoom();
  requestAnimationFrame(fitTags);
}

function apply(now){
  const lx = look.x, ly = look.y, t = now / 1000;
  const calm = state.sel ? 0 : 1;
  const br = reduce ? 0 : calm;
  const yaw = pose.yaw + lx * LOOK_YAW * calm + Math.sin(t * .37) * .14 * br;
  /* mirar alrededor: el cursor en el borde muestra lo que había fuera de la pantalla */
  const roomX = Math.max(0, (geom.sw - geom.vw) / 2 - Math.abs(pan)), roomY = Math.max(0, (geom.sh - geom.vh) / 2);
  const px = -lx * 2 * roomX * .9 * calm, py = -ly * 2 * roomY * .75 * calm;
  const pitch = pose.pitch - ly * 1.3 * calm + Math.sin(t * .29 + 1) * .1 * br;
  const im = reduce ? 0 : idleMix;                                   /* reposo: la cámara deriva lenta, como respirando */
  const ty = pose.ty + Math.sin(t * .23 + 2) * .09 * br + Math.sin(t * Math.PI * 2 * 1.6) * bob + Math.sin(t * .07) * .7 * im;
  const tx = pose.tx + Math.sin(t * .05 + 1) * 1.1 * im;
  const sc = pose.s * (1 + (.025 + .02 * Math.sin(t * .045)) * im);
  cam.style.transform = `translate(calc(${tx}% + ${px.toFixed(1)}px), calc(${ty}% + ${py.toFixed(1)}px)) rotateY(${yaw + Math.sin(t * .06) * .6 * im}deg) rotateX(${pitch}deg) scale(${sc})`;
  cam.style.filter = (fx.blur > .05 || Math.abs(fx.bright - 1) > .01) ? `blur(${fx.blur.toFixed(2)}px) brightness(${fx.bright.toFixed(3)})` : "none";
  far.style.transform = `translate(${-lx * 9 * calm}px, ${-ly * 5 * calm}px)`;
  near.style.transformOrigin = "0% 100%";
  near.style.transform = `translate(calc(${chair.cx}% + ${-lx * 34 * calm}px), calc(${chair.cy}% + ${-ly * 12 * calm}px)) scale(${chair.cs})`;
  near.style.filter = chair.cb > .05 ? `blur(${chair.cb.toFixed(2)}px)` : "none";
}
let idleMix = 0;
function loop(now){
  idleMix += ((state.idle ? 1 : 0) - idleMix) * (state.idle ? .004 : .05);
  look.x += (look.tx - look.x) * .06;
  look.y += (look.ty - look.y) * .06;
  apply(now);
  const glow = lampLevel();
  motes[0].draw(state.seatS < .999 ? glow : 0);
  motes[1].draw(state.seatS > .5 ? glow : 0);
  drawEq();
  requestAnimationFrame(loop);
}
const wait = (ms) => new Promise(r => setTimeout(r, reduce ? 0 : ms));
function timeline(ms, fn){
  return new Promise(res => {
    if (reduce || ms <= 0) { fn(1); return res(); }
    const t0 = performance.now();
    const step = (now) => { const t = clamp((now - t0) / ms); fn(t); if (t < 1) requestAnimationFrame(step); else res(); };
    requestAnimationFrame(step);
  });
}
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
/* curva del movimiento entre de pie y sentado: arranca suave, acelera y aterriza lento */
const E = (s) => s < .4 ? .4 * Math.pow(s / .4, 3) : .4 + .6 * (1 - Math.pow(1 - (s - .4) / .6, 3));
const dE = (s) => s < .4 ? 3 * Math.pow(s / .4, 2) : 3 * Math.pow(1 - (s - .4) / .6, 2);
const bump = (h, c, w) => Math.exp(-Math.pow((h - c) / w, 2));

/* ================= pantalla del laptop en perspectiva ================= */
function homography(w, h, q){
  const src = [[0,0],[w,0],[w,h],[0,h]], A = [], b = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i], [u, v] = q[i];
    A.push([x, y, 1, 0, 0, 0, -u*x, -u*y]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -v*x, -v*y]); b.push(v);
  }
  for (let c = 0; c < 8; c++) {
    let p = c; for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]];
    for (let r = 0; r < 8; r++) { if (r === c) continue; const f = A[r][c] / A[c][c]; for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k]; b[r] -= f * b[c]; }
  }
  const m = b.map((v, i) => v / A[i][i]);
  return `matrix3d(${m[0]},${m[3]},0,${m[6]},${m[1]},${m[4]},0,${m[7]},0,0,1,0,${m[2]},${m[5]},0,1)`;
}

/* ================= de pie ↔ sentado: una sola toma continua ================= */
/* El laptop queda anclado en pantalla mientras la habitación gira y se acerca;
   el cambio de vista ocurre a máxima velocidad, como un corte en cámara. */
function renderSit(s, moveCam = true){
  state.seatS = s;
  const e = E(s), v = dE(s) / 3;
  if (moveCam) {
    for (const k in POSES.seat) pose[k] = lerp(POSES.stand[k], POSES.seat[k], e);
    pose.ty += -1.1 * Math.sin(Math.PI * clamp((s - .62) / .38));          /* el cuerpo baja al sentarse */
    fx.blur = 6 * Math.pow(v, 2.2); fx.bright = 1 - .14 * bump(s, .42, .09);
  }
  const kc = clamp(e * 1.4);
  chair.cx = -34 * kc; chair.cy = 42 * kc; chair.cs = 1 + .42 * kc; chair.cb = 11 * kc;
  const { sw, sh } = geom;
  const lwx = LW.x / 100 * sw, lwy = LW.y / 100 * sh, lpx = LP.x / 100 * sw, lpy = LP.y / 100 * sh;
  const px = lerp(lwx, lpx, e), py = lerp(lwy, lpy, e);
  const sW = lerp(1, 1 / LRATIO, e), sP = sW * LRATIO;
  travel.style.transform = s > 0 ? `translate(${px}px,${py}px) scale(${sW}) translate(${-lwx}px,${-lwy}px)` : "none";
  arrive.style.transform = s < 1 ? `translate(${px}px,${py}px) rotate(${(-2.4 * (1 - e)).toFixed(3)}deg) scale(${sP}) translate(${-lpx}px,${-lpy}px)` : "none";
  pov.style.opacity = smooth(.31, .5, s);
  pov.style.visibility = s > .001 ? "visible" : "hidden";
  const m = smooth(.26, .82, s);
  const mask = s >= .94 ? "none" : `radial-gradient(ellipse ${(22 + 175 * m).toFixed(1)}% ${(20 + 160 * m).toFixed(1)}% at ${LP.x}% ${LP.y}%, #000 48%, transparent 100%)`;
  arrive.style.webkitMaskImage = mask; arrive.style.maskImage = mask;
  stage.style.visibility = s >= .999 ? "hidden" : "visible";
  lscreen.style.opacity = smooth(.8, 1, s);
  viewport.classList.toggle("standing", s < .5);
}
async function sit(){
  if (state.phase === "seat") return;
  if (sitPromise) return sitPromise;
  state.anim = true; updateChrome();
  sitPromise = (async () => {
    lscreen.classList.remove("wake");
    Sound.play("sit");
    await timeline(2900, (t) => renderSit(t));
    fx.blur = 0; fx.bright = 1;
    state.phase = "seat"; state.anim = false;
    if (!reduce) lscreen.classList.add("wake");
    Sound.play("wake");
    updateChrome();
  })();
  await sitPromise; sitPromise = null;
}
async function stand(){
  if (state.anim || state.phase !== "seat") return;
  if (state.sel) { closeSection(true); await wait(650); }
  state.anim = true; updateChrome();
  Sound.play("stand");
  await timeline(2300, (t) => renderSit(1 - t));
  fx.blur = 0; fx.bright = 1;
  state.phase = "stand"; state.anim = false; updateChrome();
}
function ensureSeated(){ return state.phase === "seat" ? (sitPromise || Promise.resolve()) : sit(); }

/* ================= llegada: abrir los ojos frente al escritorio ================= */
let arrived = false, arrivalPromise = null;
function arrival(){
  if (arrivalPromise) return arrivalPromise;
  arrivalPromise = (async () => {
    renderSit(1, false);
    $("curtain").classList.add("gone");
    await timeline(1900, (t) => {
      const e = easeOut(t);
      fx.blur = 10 * Math.pow(1 - e, 1.6);
      fx.bright = lerp(.25, 1, e);
      pose.s = lerp(1.1, POSES.seat.s, e);
      pose.ty = lerp(-1.4, 0, e);
    });
    fx.blur = 0; fx.bright = 1; pose = { ...POSES.seat };
    state.anim = false; arrived = true;
    if (!reduce) lscreen.classList.add("wake");
    $("hud").classList.add("ready");
    updateChrome();
  })();
  return arrivalPromise;
}

/* ================= interfaz del computador ================= */
function mountScreen(root){
  const apps = PROJECTS.map(p => {
    const [label, col] = STATUS[p.st];
    return `<button class="app" type="button" data-app="${p.id}"><span class="ic" style="background:${p.color}">${esc(p.mono)}</span><span>${esc(p.name)}</span><span class="st"><i style="background:${col}"></i>${label}</span></button>`;
  }).join("");
  root.innerHTML = `<div class="sui-bar"><span><b>Pedro Maiz</b> · proyectos</span><span class="sui-clock">--:--</span></div>
    <div class="sui-main">
      <div class="sui-home">
        <div class="sui-k">Hechos con Claude</div>
        <div class="sui-h">Hola, soy <i>Pedro.</i></div>
        <p class="sui-p">Estas son las cosas que he construido conversando con Claude. Abre cualquiera.</p>
        <div class="sui-apps">${apps}</div>
      </div>
      <div class="sui-view" hidden></div>
    </div>`;
  const home = root.querySelector(".sui-home"), view = root.querySelector(".sui-view");
  root.querySelectorAll(".app").forEach(btn => btn.addEventListener("click", (e) => {
    e.stopPropagation(); Sound.play("key");
    const p = PROJECTS.find(x => x.id === btn.dataset.app); if (!p) return;
    const [label, col] = STATUS[p.st];
    view.innerHTML = `<button class="sui-back" type="button">← Todos los proyectos</button>
      <h3>${esc(p.name)}</h3><p>${esc(p.d)}</p>
      <span class="chip" style="color:${col}">${label}</span>
      <dl><dt>Área</dt><dd>${esc(p.tag)}</dd><dt>Última versión</dt><dd>${esc(p.last || "—")}</dd></dl>`;
    home.hidden = true; view.hidden = false;
    const back = view.querySelector(".sui-back");
    back.addEventListener("click", (ev) => { ev.stopPropagation(); Sound.play("key"); view.hidden = true; home.hidden = false; btn.focus({ preventScroll:true }); });
    back.focus({ preventScroll:true });
  }));
  updateClock();
}
function resetLaptop(){ const ui = $("laptopUI"); ui.querySelector(".sui-view").hidden = true; ui.querySelector(".sui-home").hidden = false; }

/* ================= luz: la hora del día, continua ================= */
function liveHour(){
  const parts = new Intl.DateTimeFormat("es-CL",{ timeZone:"America/Santiago", hour:"2-digit", minute:"2-digit", hour12:false }).formatToParts(new Date());
  return (parseInt(parts.find(p => p.type === "hour").value, 10) % 24) + parseInt(parts.find(p => p.type === "minute").value, 10) / 60;
}
const hourNow = () => state.manualHour ?? liveHour();
const fmt = (h) => { let H = Math.floor(h), M = Math.round((h - H) * 60); if (M === 60) { H += 1; M = 0; } return `${String(H % 24).padStart(2,"0")}:${String(M).padStart(2,"0")}`; };
function lightAt(h){
  const day = smooth(6.4, 8.4, h) * (1 - smooth(17.7, 19.7, h));
  const dusk = Math.max(bump(h, 18.8, 1.05), .55 * bump(h, 7.2, .75));
  return { day, dusk };
}
const lampOn = () => state.lamp === null ? lightAt(hourNow()).day < .5 : state.lamp;
function lampLevel(){ const { day } = lightAt(hourNow()); return lampOn() ? clamp(1 - day * 1.2) : 0; }
function updateClock(){ const t = fmt(liveHour()); document.querySelectorAll(".sui-clock").forEach(c => c.textContent = t); }
function applyLight(){
  const h = hourNow(), { day, dusk } = lightAt(h), on = lampOn();
  const set = (id, v) => { $(id).style.opacity = v.toFixed(3); };
  set("dayImg", day); set("dayChair", day); set("povDay", day);
  set("duskWash", dusk); set("povDusk", dusk);
  set("duskSky", dusk * .6); set("povDuskSky", dusk * .55);
  const glow = on ? 1 - .55 * day : 0, dk = on ? 0 : (1 - day) * .95;
  set("lampGlow", glow); set("povLamp", glow);
  set("dark", dk); set("darkChair", dk); set("povDark", dk);
  set("screenGlow", 1 - .65 * day);
  Sound.setDay(day);
  $("torch").dataset.level = String((1 - day) * .9);
  updateTorch();
  /* indicadores */
  $("ltime").textContent = fmt(h);
  const bar = $("daybar");
  if (document.activeElement !== bar) bar.value = h.toFixed(2);
  bar.style.setProperty("--thumb", day > .5 ? "#FFD98A" : (dusk > .4 ? "#F4A274" : "#DCE6FF"));
  bar.style.setProperty("--thumb-glow", day > .5 ? "rgba(255,214,120,.8)" : (dusk > .4 ? "rgba(244,162,116,.7)" : "rgba(200,215,255,.6)"));
  bar.setAttribute("aria-valuetext", fmt(h));
  const lux = clamp(day * .85 + (on ? .45 : 0) * (1 - day * .5) + .05), segs = Math.round(lux * 10);
  [...$("lux").children].forEach((el, i) => { el.classList.toggle("on", i < segs); el.classList.toggle("warm", on && i < segs && i >= Math.round(day * 8.5)); });
  const live = state.manualHour === null;
  $("liveBtn").setAttribute("aria-pressed", String(live));
  $("liveBtn").querySelector("span").textContent = live ? "En vivo" : "Hora real";
  updateClock();
}
let toastT;
function toast(msg){
  const el = $("toast"); el.textContent = msg; el.classList.add("on");
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("on"), 2000);
}
function toggleLamp(){ state.lamp = !lampOn(); Sound.play("lamp"); applyLight(); toast(state.lamp ? "Lámpara encendida" : "Lámpara apagada"); }

/* ================= polvo flotando en la luz de la lámpara ================= */
class Motes {
  constructor(canvas, beam){
    this.c = canvas; this.g = canvas.getContext("2d"); this.beam = beam; this.p = []; this.dirty = false;
    for (let i = 0; i < 46; i++) this.p.push(this.spawn(true));
  }
  spawn(any){
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
    return { x:this.beam.x + Math.cos(a) * r * this.beam.rx, y:this.beam.y + Math.sin(a) * r * this.beam.ry,
      vx:(Math.random() - .5) * .006, vy:(Math.random() - .3) * .006, s:.5 + Math.random() * 1.2, ph:Math.random() * 6.28, life:any ? Math.random() : 0 };
  }
  resize(sw, sh){ this.c.width = Math.max(1, Math.round(sw * .5)); this.c.height = Math.max(1, Math.round(sh * .5)); }
  draw(level){
    const { c, g } = this;
    if (level <= .02 || reduce) { if (this.dirty) { g.clearRect(0, 0, c.width, c.height); this.dirty = false; } return; }
    this.dirty = true;
    g.clearRect(0, 0, c.width, c.height);
    const W = c.width / 100, H = c.height / 100, t = performance.now() / 1000;
    for (let i = 0; i < this.p.length; i++) {
      const p = this.p[i];
      p.x += p.vx + Math.sin(t * .4 + p.ph) * .004; p.y += p.vy + Math.cos(t * .33 + p.ph) * .003; p.life += .0025;
      const dx = (p.x - this.beam.x) / this.beam.rx, dy = (p.y - this.beam.y) / this.beam.ry;
      if (dx * dx + dy * dy > 1.1 || p.life > 1) { this.p[i] = this.spawn(false); continue; }
      const fade = Math.sin(Math.PI * p.life) * (1 - Math.min(1, dx * dx + dy * dy));
      const a = level * fade * (.35 + .35 * Math.sin(t * 1.3 + p.ph));
      if (a <= .01) continue;
      g.fillStyle = `rgba(255,226,180,${a.toFixed(3)})`;
      g.beginPath(); g.arc(p.x * W, p.y * H, p.s, 0, 6.283); g.fill();
    }
  }
}
const motes = [ new Motes($("motesWide"), { x:65, y:54, rx:9, ry:19 }), new Motes($("motesPov"), { x:70, y:45, rx:10, ry:21 }) ];

/* ================= sonido: ambiente y efectos, sintetizados en el navegador ================= */
const Sound = (() => {
  let ctx = null, master, amb, sfx, an, freq, white, brown, on = store.get("escritorio-sonido") !== "0", started = false, ambNodes = null, lastDay = .5, birdT = null, carT = null;
  const now = () => ctx.currentTime;
  function init(){
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try { ctx = new AC(); } catch (e) { return false; }
    master = ctx.createGain(); master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    an = ctx.createAnalyser(); an.fftSize = 256; an.smoothingTimeConstant = .75; freq = new Uint8Array(an.frequencyBinCount);
    master.connect(comp); comp.connect(an); an.connect(ctx.destination);
    amb = ctx.createGain(); amb.gain.value = 0; amb.connect(master);
    sfx = ctx.createGain(); sfx.gain.value = .85; sfx.connect(master);
    const len = ctx.sampleRate * 3;
    white = ctx.createBuffer(1, len, ctx.sampleRate); brown = ctx.createBuffer(1, len, ctx.sampleRate);
    const w = white.getChannelData(0), b = brown.getChannelData(0); let last = 0;
    for (let i = 0; i < len; i++) { const r = Math.random() * 2 - 1; w[i] = r; last = (last + .02 * r) / 1.02; b[i] = last * 3.5; }
    return true;
  }
  function src(buf, loop){ const s = ctx.createBufferSource(); s.buffer = buf; s.loop = !!loop; if (!loop) s.playbackRate.value = .9 + Math.random() * .2; return s; }
  function filt(type, f, q){ const n = ctx.createBiquadFilter(); n.type = type; n.frequency.value = f; if (q) n.Q.value = q; return n; }
  function env(g, t, peak, a, d){ g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); }
  function burst({ at = 0, f = 1000, type = "bandpass", q = 1, peak = .1, a = .005, d = .1, buf, to }){
    if (!ctx || !on) return;
    const t = now() + at, s = src(buf || white), fl = filt(type, f, q), g = ctx.createGain();
    if (to) fl.frequency.exponentialRampToValueAtTime(to, t + a + d);
    env(g, t, peak, a, d); s.connect(fl); fl.connect(g); g.connect(sfx);
    s.start(t, Math.random() * 2); s.stop(t + a + d + .05);
  }
  function tone({ at = 0, f = 440, type = "sine", peak = .05, a = .005, d = .2, to }){
    if (!ctx || !on) return;
    const t = now() + at, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + a + d);
    env(g, t, peak, a, d); o.connect(g); g.connect(sfx); o.start(t); o.stop(t + a + d + .05);
  }
  const fx = {
    step(at = 0, soft = 1){ burst({ at, f:260, type:"lowpass", peak:.36 * soft, a:.004, d:.13, buf:brown }); tone({ at, f:72, peak:.2 * soft, d:.12 }); burst({ at:at + .01, f:2200, q:2, peak:.02 * soft, d:.05 }); },
    sit(){ burst({ f:500, q:.7, peak:.06, a:.25, d:.6, buf:brown, to:1400 });
      burst({ at:1.75, f:1900, q:2.5, peak:.07, a:.04, d:.35 });
      fx.step(1.95, .8); tone({ at:1.96, f:150, type:"triangle", peak:.04, d:.25, to:120 }); },
    stand(){ burst({ at:.05, f:1700, q:2.5, peak:.06, a:.04, d:.3 }); fx.step(.35, .7); burst({ at:.3, f:500, q:.7, peak:.05, a:.3, d:.6, buf:brown, to:250 }); },
    paper(soft = 1){ for (let i = 0; i < 9; i++) burst({ at:Math.random() * .32, f:2600 + Math.random() * 2400, type:"highpass", q:.7, peak:(.045 + Math.random() * .05) * soft, d:.02 + Math.random() * .05 }); },
    page(){ fx.paper(.8); burst({ at:.05, f:900, q:.6, peak:.04, a:.08, d:.25 }); },
    glass(){ tone({ f:2637, peak:.012, a:.01, d:1.2 }); tone({ at:.04, f:3951, peak:.008, a:.01, d:1 }); burst({ f:5200, type:"highpass", peak:.02, a:.2, d:.5 }); },
    whoosh(){ burst({ f:300, q:.9, peak:.05, a:.35, d:.55, buf:brown, to:1100 }); },
    lamp(){ burst({ f:4200, type:"highpass", peak:.38, d:.012 }); tone({ f:1900, type:"square", peak:.02, d:.02 }); burst({ at:.035, f:2500, q:3, peak:.12, d:.02 }); },
    key(){ burst({ f:2400, q:1.5, peak:.12, d:.025 }); tone({ f:1150, type:"triangle", peak:.025, d:.02 }); },
    tick(){ burst({ f:3000, q:2, peak:.05, d:.015 }); },
    wake(){ tone({ f:261.6, peak:.02, a:.25, d:1.4 }); tone({ at:.08, f:392, peak:.016, a:.25, d:1.3 }); tone({ at:.16, f:523.3, peak:.012, a:.3, d:1.4 }); }
  };
  function startAmbient(){
    if (!ctx || ambNodes) return;
    const mk = (buf, nodes, gainV) => { const s = src(buf, true), g = ctx.createGain(); g.gain.value = gainV; let n = s; nodes.forEach(x => { n.connect(x); n = x; }); n.connect(g); g.connect(amb); s.start(0, Math.random() * 2); return g; };
    const sea = mk(brown, [filt("lowpass", 420, .5)], .09);                       /* el mar a lo lejos, olas que van y vienen */
    const lfo = ctx.createOscillator(), lfoG = ctx.createGain(); lfo.frequency.value = .085; lfoG.gain.value = .045; lfo.connect(lfoG); lfoG.connect(sea.gain); lfo.start();
    const lfo2 = ctx.createOscillator(), lfo2G = ctx.createGain(); lfo2.frequency.value = .031; lfo2G.gain.value = .02; lfo2.connect(lfo2G); lfo2G.connect(sea.gain); lfo2.start();
    const city = mk(brown, [filt("bandpass", 140, .6)], .06);                     /* la ciudad, un murmullo grave */
    mk(white, [filt("highpass", 2600), filt("lowpass", 7000)], .004);             /* el aire de la pieza */
    ambNodes = { sea, city };
    scheduleBirds(); scheduleCars();
  }
  function scheduleBirds(){
    clearTimeout(birdT);
    birdT = setTimeout(() => {
      if (on && ctx && lastDay > .35) {
        const n = 2 + Math.floor(Math.random() * 4), base = 2800 + Math.random() * 1600, t0 = Math.random() * .2;
        for (let i = 0; i < n; i++) tone({ at:t0 + i * (.09 + Math.random() * .05), f:base, to:base * (1.2 + Math.random() * .4), peak:.013 * lastDay, a:.01, d:.07 });
      }
      scheduleBirds();
    }, 2500 + Math.random() * 6500);
  }
  function scheduleCars(){
    clearTimeout(carT);
    carT = setTimeout(() => {
      if (on && ctx && lastDay < .7) burst({ f:380, q:.8, peak:.04 * (1 - lastDay), a:1.6, d:1.8, buf:brown, to:240 });
      scheduleCars();
    }, 9000 + Math.random() * 14000);
  }
  function setDay(day){
    lastDay = day;
    if (!ctx || !ambNodes) return;
    const t = now();
    ambNodes.sea.gain.setTargetAtTime(.09 + .02 * (1 - day), t, 1.2);
    ambNodes.city.gain.setTargetAtTime(.06 + .03 * day, t, 1.2);
  }
  function unlock(){
    if (!on || !init()) return;
    if (ctx.state === "suspended") ctx.resume();
    if (!started) {
      started = true; startAmbient(); setDay(lastDay);
      master.gain.setTargetAtTime(1, now(), .05);
      amb.gain.setValueAtTime(0, now()); amb.gain.linearRampToValueAtTime(1.15, now() + 3.5);
    }
  }
  function setOn(v){
    on = v; store.set("escritorio-sonido", v ? "1" : "0");
    if (!v && ctx) { master.gain.setTargetAtTime(0, now(), .12); setTimeout(() => { if (!on && ctx.state === "running") ctx.suspend(); }, 600); }
    if (v) { if (!started) unlock(); else { ctx.resume(); master.gain.setTargetAtTime(1, now(), .2); } }
  }
  function bands(n){
    if (!ctx || !started || !on) return null;
    an.getByteFrequencyData(freq);
    const out = [], usable = Math.floor(freq.length * .45);
    for (let i = 0; i < n; i++) {
      const a = Math.floor(Math.pow(i / n, 1.6) * usable), b = Math.max(a + 1, Math.floor(Math.pow((i + 1) / n, 1.6) * usable));
      let s = 0; for (let k = a; k < b; k++) s += freq[k]; out.push(s / (b - a) / 255);
    }
    return out;
  }
  document.addEventListener("visibilitychange", () => {
    if (!ctx || !on) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();
  });
  const play = (name, ...args) => { if (on && ctx && started && fx[name]) { try { fx[name](...args); } catch (e) {} } };
  return { unlock, setOn, setDay, play, bands, isOn:() => on, status:() => !on ? "off" : (started ? "on" : "idle") };
})();
const eqBars = [...document.querySelectorAll("#eq i")];
function drawEq(){
  const b = Sound.bands(eqBars.length), t = performance.now() / 1000;
  eqBars.forEach((el, i) => {
    let h;
    if (b) h = 2 + Math.min(1, b[i] * 2.4) * 12;
    else if (Sound.status() === "idle") h = 2 + 3 * (.5 + .5 * Math.sin(t * 2 + i * .9));
    else h = 2;
    el.style.height = h.toFixed(1) + "px";
  });
}
function syncSoundUI(){
  const st = Sound.status(), btn = $("soundBtn");
  btn.dataset.state = st;
  btn.setAttribute("aria-pressed", String(st !== "off"));
  $("soundV").textContent = st === "off" ? "No" : (st === "idle" ? "Toca" : "Sí");
  btn.title = st === "off" ? "Activar el sonido" : "Silenciar";
}
function toggleSound(){ Sound.setOn(!Sound.isOn()); syncSoundUI(); toast(Sound.isOn() ? "Sonido activado" : "Sonido apagado"); }

/* ================= objetos ================= */
function makeSpot(o, r, onClick){
  const b = document.createElement("button");
  b.type = "button"; b.className = "hs" + (r.below ? " below" : ""); b.dataset.key = o.key || "chair";
  b.style.left = r.x + "%"; b.style.top = r.y + "%"; b.style.width = r.w + "%"; b.style.height = r.h + "%";
  b.setAttribute("aria-label", `${o.name}: ${o.what}`);
  b.innerHTML = `<span class="shine" aria-hidden="true"></span><span class="tag" aria-hidden="true"><b>${esc(o.name)}</b><small>${esc(o.what)}</small></span>`;
  b.addEventListener("click", (e) => { e.stopPropagation(); onClick(); });
  b.addEventListener("pointerenter", fitTags); b.addEventListener("focus", fitTags);
  return b;
}
/* que ninguna etiqueta quede cortada por el borde de la pantalla */
function fitTags(){
  const v = viewport.getBoundingClientRect(), m = 12;
  document.querySelectorAll(".hs .tag").forEach(t => {
    const nx = parseFloat(t.style.getPropertyValue("--nx")) || 0, ny = parseFloat(t.style.getPropertyValue("--ny")) || 0;
    const r = t.getBoundingClientRect();
    if (!r.width) return;
    const L = r.left - nx, R = r.right - nx, T = r.top - ny;
    const dx = L < v.left + m ? v.left + m - L : (R > v.right - m ? v.right - m - R : 0);
    const dy = T < v.top + m ? v.top + m - T : 0;
    t.style.setProperty("--nx", dx.toFixed(1) + "px"); t.style.setProperty("--ny", dy.toFixed(1) + "px");
  });
}
function buildSpots(){
  const act = (o) => () => o.lamp ? toggleLamp() : openSection(o.key);
  OBJECTS.forEach(o => {
    $("spotsFar").appendChild(makeSpot(o, WIDE[o.key], act(o)));
    $("spotsPov").appendChild(makeSpot(o, SEATED[o.key], act(o)));
  });
  $("spotsNear").appendChild(makeSpot({ name:"La silla", what:"Sentarse al escritorio" }, CHAIR, () => sit()));
  OBJECTS.forEach(o => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "obj";
    b.innerHTML = `<span class="on">${esc(o.name)}</span><span class="what">${esc(o.what)}<svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5"/></svg></span>`;
    b.addEventListener("click", () => {
      $("room").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      if (o.lamp) ensureSeated().then(toggleLamp); else openSection(o.key);
    });
    $("objs").appendChild(b);
  });
}
function markVisited(key){
  if (!SECTIONS[key] || state.visited.has(key)) return;
  state.visited.add(key);
  store.set("escritorio-visto", JSON.stringify([...state.visited]));
  updateExplore();
  if (state.visited.size === SECTION_KEYS.length) setTimeout(() => toast("Exploraste todo el escritorio"), 1200);
}
function updateExplore(){
  $("expN").textContent = state.visited.size;
  [...$("expTicks").children].forEach((el, i) => el.classList.toggle("on", i < state.visited.size));
  document.querySelectorAll(".hs[data-key]").forEach(b => b.classList.toggle("seen", state.visited.has(b.dataset.key)));
}
function updateTorch(){
  const t = $("torch"), lvl = parseFloat(t.dataset.level || "0");
  t.style.opacity = state.mouse && !state.sel && !state.anim ? lvl.toFixed(2) : "0";
}
function updateChrome(){
  const seated = state.phase === "seat", standing = state.phase === "stand";
  const idle = !state.anim && !state.sel;
  $("spotsFar").classList.toggle("off", !(standing && idle));
  $("spotsNear").classList.toggle("off", !(standing && idle));
  $("spotsPov").classList.toggle("off", !(seated && idle));
  const hint = $("hint");
  hint.textContent = standing ? "Toca la silla para sentarte." : "Toca lo que te llame la atención.";
  hint.classList.toggle("hide", !idle || (seated && state.visited.size >= 2));
  const onScreen = state.sel === "proyectos" && !narrow();
  $("backbar").classList.toggle("hide", !onScreen);
  lscreen.classList.toggle("active", onScreen);
  $("screenCover").disabled = !(seated && idle);
  viewport.classList.toggle("show-all", state.showAll);
  requestAnimationFrame(fitTags);
  $("exploreBtn").setAttribute("aria-pressed", String(state.showAll));
  $("postureV").textContent = state.anim && arrived ? "…" : (standing ? "De pie" : "Sentado");
  $("posSeat").classList.toggle("on", seated); $("posStand").classList.toggle("on", standing);
  $("postureBtn").setAttribute("aria-label", standing ? "Postura: de pie. Sentarse" : "Postura: sentado. Levantarse");
  updateTorch();
}

/* ================= foco en un objeto ================= */
function zoomRect(){
  const k = state.sel;
  if (!k) return null;
  if (k === "proyectos") {
    const xs = SCREEN_QUAD.map(p => p[0]), ys = SCREEN_QUAD.map(p => p[1]);
    const x = Math.min(...xs), y = Math.min(...ys), w = Math.max(...xs) - x, h = Math.max(...ys) - y;
    if (narrow()) return { x, y, w, h, k:Math.min(1.6, geom.vw * .94 / (w / 100 * geom.sw)), mode:"top" };
    return { x, y, w, h, k:Math.min(geom.vw * .72 / (w / 100 * geom.sw), (geom.vh - 190) / (h / 100 * geom.sh)), mode:"center" };
  }
  return { ...SEATED[k], k:SEATED[k].zs, mode: narrow() ? "top" : "side" };
}
function applyZoom(){
  const r = zoomRect(), dof = $("dof");
  if (!r) { zoomPov.style.transform = "translate(0px,0px) scale(1)"; dof.classList.remove("on"); return; }
  const { vw, vh, sw, sh, left, top } = geom;
  const cxp = (r.x + r.w / 2) / 100 * sw, cyp = (r.y + r.h / 2) / 100 * sh;
  const tx = r.mode === "side" ? vw * .31 : vw * .5;
  const ty = r.mode === "top" ? vh * .28 : (r.mode === "center" ? vh * .5 - 8 : vh * .52);
  let Tx = tx - left - r.k * cxp, Ty = ty - top - r.k * cyp;
  Tx = clamp(Tx, vw - left - r.k * sw, -left);
  Ty = clamp(Ty, vh - top - r.k * sh, -top);
  zoomPov.style.transform = `translate(${Tx}px, ${Ty}px) scale(${r.k})`;
  /* profundidad de campo: lo enfocado queda nítido, el resto se suaviza */
  const fcx = left + Tx + r.k * cxp, fcy = top + Ty + r.k * cyp;
  const rx = r.w / 100 * sw * r.k * (r.mode === "center" ? .8 : .78), ry = r.h / 100 * sh * r.k * (r.mode === "center" ? .84 : .95);
  const m = `radial-gradient(ellipse ${rx.toFixed(0)}px ${ry.toFixed(0)}px at ${fcx.toFixed(0)}px ${fcy.toFixed(0)}px, transparent 62%, #000 100%)`;
  dof.style.webkitMaskImage = m; dof.style.maskImage = m;
  dof.classList.add("on");
}

/* ================= panel con forma de objeto ================= */
function entryHTML(it){
  return `<div class="entry${it.feature ? " feature" : ""}">
    ${it.meta ? `<div class="meta">${esc(it.meta)}</div>` : ""}
    <div class="t">${esc(it.t)}</div>
    ${it.d ? `<div class="d">${esc(it.d)}</div>` : ""}
    ${it.href ? `<a href="${esc(it.href)}">${esc(it.link)}</a>` : ""}
    ${it.copy ? `<button class="copy" type="button" data-copy="${esc(it.copy)}">Copiar</button>` : ""}
  </div>`;
}
async function openSection(key){
  const sec = SECTIONS[key]; if (!sec) return;
  if (!arrived) await arrival();
  if (state.phase !== "seat") await ensureSeated();
  if (state.sel === key) return;
  if (state.sel) closeSection(true);
  state.sel = key;
  markVisited(key);
  Sound.play("whoosh");
  const panel = $("panel"), inScreen = key === "proyectos" && !narrow();
  if (inScreen) {
    panel.classList.remove("open"); panel.setAttribute("aria-hidden", "true");
    Sound.play("key");
  } else {
    panel.className = "panel " + sec.look;
    panel.style.setProperty("--rot", narrow() ? "0deg" : (sec.rot || "0deg"));
    $("panelKicker").textContent = sec.kicker;
    $("panelTitle").textContent = sec.title;
    $("panelLead").textContent = sec.lead;
    const body = $("panelBody");
    if (sec.look === "screen") { body.innerHTML = `<div class="sui" id="panelUI"></div>`; mountScreen($("panelUI")); }
    else body.innerHTML = `<div class="entries">${sec.items.map(entryHTML).join("")}</div>`;
    body.querySelectorAll(".copy").forEach(b => b.addEventListener("click", (e) => {
      e.stopPropagation();
      const done = () => toast("Copiado"), fail = () => toast("Selecciona el texto para copiarlo");
      try { navigator.clipboard.writeText(b.dataset.copy).then(done, fail); } catch (err) { fail(); }
    }));
    panel.scrollTop = 0;
    Sound.play(sec.look === "glass" ? "glass" : (sec.look === "screen" ? "key" : (sec.look === "notebook" ? "page" : "paper")));
    requestAnimationFrame(() => { panel.classList.add("open"); panel.setAttribute("aria-hidden", "false"); });
  }
  applyZoom(); updateChrome();
  if (location.hash.slice(1) !== key) { try { history.replaceState(null, "", "#" + key); } catch (e) {} }
  setTimeout(() => {
    if (state.sel !== key) return;
    if (inScreen) $("laptopUI").querySelector(".app")?.focus({ preventScroll:true });
    else $("closeBtn").focus({ preventScroll:true });
  }, inScreen ? 1100 : 400);
}
function closeSection(silent){
  if (!state.sel) return;
  const prev = state.sel, panel = $("panel");
  state.sel = null; panel.classList.remove("open"); panel.setAttribute("aria-hidden", "true");
  if (!silent) { if (/paper|notebook|route|card/.test(SECTIONS[prev].look)) Sound.play("paper", .6); else Sound.play("whoosh"); }
  applyZoom(); updateChrome();
  if (prev === "proyectos") setTimeout(resetLaptop, 600);
  try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  if (!silent) document.querySelector(`#spotsPov .hs[data-key="${prev}"]`)?.focus({ preventScroll:true });
}

/* ================= entrada del usuario ================= */
function bindInput(){
  $("postureBtn").addEventListener("click", () => { Sound.play("tick"); if (state.phase === "seat") stand(); else sit(); });
  $("closeBtn").addEventListener("click", () => closeSection(false));
  $("backBtn").addEventListener("click", () => closeSection(false));
  $("screenCover").addEventListener("click", (e) => { e.stopPropagation(); openSection("proyectos"); });
  $("nowBtn").addEventListener("click", () => openSection("en-que-ando"));
  $("exploreBtn").addEventListener("click", () => { Sound.play("tick"); state.showAll = !state.showAll; updateChrome(); });
  $("soundBtn").addEventListener("click", (e) => { e.stopPropagation(); toggleSound(); });
  $("home").addEventListener("click", (e) => { e.preventDefault(); closeSection(false); });
  $("daybar").addEventListener("input", (e) => { state.manualHour = parseFloat(e.target.value); state.lamp = null; applyLight(); });
  $("liveBtn").addEventListener("click", () => { Sound.play("tick"); state.manualHour = null; state.lamp = null; applyLight(); toast(`Hora real de Valparaíso · ${fmt(liveHour())}`); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && state.sel) closeSection(false); });
  /* reposo: sin actividad un rato, queda solo la habitación */
  const IDLE_MS = 25000; let idleT = null;
  const goIdle = () => {
    if (state.sel || state.anim || !arrived) { idleT = setTimeout(goIdle, 5000); return; }
    state.idle = true; $("room").classList.add("idle"); look.tx = 0; look.ty = 0;
  };
  const wake = () => {
    clearTimeout(idleT); idleT = setTimeout(goIdle, IDLE_MS);
    if (!state.idle) return;
    state.idle = false; $("room").classList.remove("idle");
    if (state.phase === "seat" && !reduce) { lscreen.classList.remove("wake"); void lscreen.offsetWidth; lscreen.classList.add("wake"); Sound.play("wake"); }
  };
  ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "scroll"].forEach(ev => addEventListener(ev, wake, { passive:true, capture:true }));
  idleT = setTimeout(goIdle, IDLE_MS);
  /* pantalla completa: botón bajo el nombre o tecla F */
  const room = $("room"), fsBtn = $("fsBtn");
  const fsOn = () => document.fullscreenElement || document.webkitFullscreenElement;
  const toggleFull = () => {
    if (fsOn()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else { const req = room.requestFullscreen || room.webkitRequestFullscreen; if (req) { const r = req.call(room); if (r && r.catch) r.catch(() => toast("Tu navegador no permite pantalla completa aquí")); } }
  };
  if (document.fullscreenEnabled || document.webkitFullscreenEnabled) {
    fsBtn.hidden = false;
    fsBtn.addEventListener("click", () => { Sound.play("tick"); toggleFull(); });
    const sync = () => { const on = !!fsOn(); room.classList.toggle("is-full", on); $("fsLbl").textContent = on ? "Salir de pantalla completa" : "Pantalla completa"; setTimeout(layout, 60); };
    document.addEventListener("fullscreenchange", sync); document.addEventListener("webkitfullscreenchange", sync);
    document.addEventListener("keydown", (e) => {
      if ((e.key === "f" || e.key === "F") && !e.metaKey && !e.ctrlKey && !e.altKey && !/input|textarea/i.test(document.activeElement?.tagName || "")) toggleFull();
    });
  }
  /* el sonido parte con el primer toque, donde sea */
  const firstTouch = (e) => {
    if (e.target && e.target.closest && e.target.closest("#soundBtn")) return;
    Sound.unlock(); syncSoundUI();
    document.removeEventListener("pointerdown", firstTouch, true); document.removeEventListener("keydown", firstTouch, true);
  };
  document.addEventListener("pointerdown", firstTouch, true); document.addEventListener("keydown", firstTouch, true);
  /* tocar fuera de lo enfocado vuelve al escritorio */
  viewport.addEventListener("click", (e) => {
    if (!state.sel || (drag && drag.moved)) return;
    if (e.target.closest(".lscreen")) return;
    closeSection(false);
  });
  viewport.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    if (!state.mouse) { state.mouse = true; updateTorch(); }
    const r = viewport.getBoundingClientRect();
    const torch = $("torch");
    torch.style.setProperty("--mx", (e.clientX - r.left) + "px"); torch.style.setProperty("--my", (e.clientY - r.top) + "px");
    if (state.sel) { look.tx = 0; look.ty = 0; return; }
    look.tx = (e.clientX - r.left) / r.width - .5;
    look.ty = (e.clientY - r.top) / r.height - .5;
  });
  viewport.addEventListener("pointerleave", () => { look.tx = 0; look.ty = 0; state.mouse = false; updateTorch(); });
  /* táctil: arrastrar para mirar a los lados */
  viewport.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" || state.sel) return;
    drag = { x:e.clientX, y:e.clientY, pan, moved:false };
  });
  viewport.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) < 8) return;
    if (!drag.moved && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
    drag.moved = true; panDefault = false;
    pan = drag.pan + dx; layout();
  });
  const end = () => { setTimeout(() => { drag = null; }, 0); };
  viewport.addEventListener("pointerup", end);
  viewport.addEventListener("pointercancel", end);
  addEventListener("resize", layout);
  addEventListener("hashchange", () => {
    const k = location.hash.slice(1);
    if (SECTIONS[k] && k !== state.sel) openSection(k);
  });
}

/* ================= inicio ================= */
async function main(){
  let content;
  try {
    const r = await fetch("contenido.json", { cache:"no-cache" });
    content = await r.json();
  } catch (e) {
    $("curtain").querySelector("span").textContent = "No se pudo cargar el contenido. Abre el sitio desde un servidor (ver README).";
    return;
  }
  useContent(content);
  try { JSON.parse(store.get("escritorio-visto") || "[]").forEach(k => { if (SECTIONS[k]) state.visited.add(k); }); } catch (e) {}
  makeTextures();
  $("lux").innerHTML = "<i></i>".repeat(10);
  $("expTicks").innerHTML = "<i></i>".repeat(SECTION_KEYS.length);
  $("expTotal").textContent = SECTION_KEYS.length;
  $("updated").textContent = UPDATED ? "Actualizado " + UPDATED : "";
  $("nowText").textContent = NOW;
  document.querySelectorAll("[data-red]").forEach(a => { const u = REDES[a.dataset.red]; if (u && u !== "#") a.href = u; else a.hidden = true; });
  buildSpots(); bindInput(); mountScreen($("laptopUI")); layout(); applyLight(); updateExplore(); syncSoundUI(); updateChrome();
  setInterval(applyLight, 30000);
  requestAnimationFrame(loop);
  /* llega cuando las fotos del escritorio están cargadas */
  let begun = false;
  const go = () => {
    if (begun) return; begun = true;
    arrival().then(() => { const k = location.hash.slice(1); if (SECTIONS[k]) openSection(k); });
  };
  Promise.all([...document.querySelectorAll("#pov img")].map(img => img.decode ? img.decode().catch(() => {}) : Promise.resolve())).then(go);
  setTimeout(go, 6000);
}
main();
})();
