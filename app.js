'use strict';

// Three independent binary details make eight unique scenes. The fourth is
// parity: any one perspective alone leaves four possible answers.
const variants = Array.from({ length: 8 }, (_, id) => ({
  id, largeSun: Boolean(id & 1), pinkUmbrella: Boolean(id & 2),
  yellowBall: Boolean(id & 4), extraFlower: Boolean(((id & 1) ^ ((id >> 1) & 1) ^ ((id >> 2) & 1)))
}));
const quarters = ['Oben links', 'Oben rechts', 'Unten links', 'Unten rechts'];
const playerColors = ['#f7e5d5', '#e7eddb', '#e4ebf0', '#f1e0e6'];
const $ = selector => document.querySelector(selector);
let target, player = 0, selected = null, round = 0, startTime, finished = false, concealed = false;
let attempts = 0;
let rejected = new Set();
let order = [];

function tree(x, y, scale = 1, color = '#6f8c67') {
  return `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-4 0h8v90h-8z" fill="#9a805d"/><path d="M0-95L-40-27h17l-30 45h106L23-27h17z" fill="${color}"/><path d="M0-80v90" stroke="#ffffff20" stroke-width="2"/></g>`;
}
function flower(x, y, color) {
  return `<g transform="translate(${x} ${y})"><path d="M0 0v23m0-5l-8-5m8 0l7-5" stroke="#698457" stroke-width="3" fill="none"/><g fill="${color}"><circle cx="0" cy="-5" r="5"/><circle cx="-5" cy="0" r="5"/><circle cx="5" cy="0" r="5"/><circle cx="0" cy="5" r="5"/></g><circle r="3" fill="#f3c96b"/></g>`;
}
function scene(v, quarter = null) {
  const view = quarter === null ? '0 0 600 600' : `${quarter % 2 * 300} ${Math.floor(quarter / 2) * 300} 300 300`;
  const umbrella = v.pinkUmbrella ? '#dc8d91' : '#e7b754';
  const ball = v.yellowBall ? '#ebbe5a' : '#cf785b';
return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration eines Parks${quarter === null ? '' : ', Ausschnitt ' + quarters[quarter]}">
  <rect width="600" height="600" fill="#e4ebde"/>
  <circle cx="114" cy="90" r="${v.largeSun ? 36 : 24}" fill="#edc671"/>
  <g fill="#f6f5e9"><path d="M204 82c-2-15 23-23 30-8 16-10 32 1 30 12h-60z"/><path d="M388 53c0-13 20-20 28-8 16-6 27 4 26 13h-54z"/></g>
  <path d="M0 239Q90 190 180 223T340 216T600 212V600H0Z" fill="#b9cba4"/>
  <path d="M0 313Q150 225 314 295T600 263V600H0Z" fill="#a7bd91"/>
  <path d="M340 234Q302 289 355 329T426 414T372 600H470Q542 486 479 407T410 300T425 234Z" fill="#e8d8b8"/>
  ${tree(39, 197, .77, '#829d72')}${tree(75, 240, .9, '#66865e')}${tree(239, 218, .62, '#87a078')}${tree(552, 205, .95, '#76916b')}${tree(590, 248, .85, '#5d7d58')}
  <g fill="#8da779"><ellipse cx="168" cy="289" rx="53" ry="13"/><ellipse cx="492" cy="281" rx="59" ry="13"/></g>
  <g><path d="M424 190v107" stroke="#8d795e" stroke-width="5"/><path d="M358 194Q423 103 491 194Z" fill="${umbrella}"/><path d="M391 194Q423 103 457 194" fill="#fff9e7" opacity=".37"/><path d="M358 194h133" stroke="#8b795b" stroke-width="2"/><ellipse cx="425" cy="299" rx="53" ry="8" fill="#879a70"/><path d="M385 268h79v9h-79z" fill="#ad8a61"/><path d="M398 277l-5 25m57-25l5 25" stroke="#8c7458" stroke-width="5"/></g>
  <g transform="translate(122 236)"><path d="M-42 11h88v12h-88zm0 17h88v12h-88zm-7 22h100v12H-49z" fill="#bc8d63"/><path d="M-31 40v42m62-42v42" stroke="#776f55" stroke-width="6"/><path d="M-35 21v29m72-29v29" stroke="#8e795c" stroke-width="5"/></g>
  <path d="M0 376Q112 332 224 380T343 466Q315 519 220 538T0 521Z" fill="#8fbab1"/>
  <path d="M0 384Q110 342 222 389T333 463" fill="none" stroke="#c9d7be" stroke-width="9"/>
  <g stroke="#bed6c7" stroke-width="3" stroke-linecap="round"><path d="M29 425h29m45-24h23m-19 71h41m78-37h32m-66 72h25m-175-9h27"/></g>
  <g transform="translate(136 432)"><ellipse rx="15" ry="8" fill="#f5edcf"/><circle cx="10" cy="-9" r="7" fill="#f5edcf"/><path d="M16-9h9l-9 5" fill="#c98e4f"/><circle cx="12" cy="-11" r="1.5" fill="#495d4a"/><path d="M-7 0q6 5 12-1" fill="none" stroke="#d8c7a4" stroke-width="2"/></g>
  <g transform="translate(214 462) scale(.7)"><ellipse rx="15" ry="8" fill="#f5edcf"/><circle cx="10" cy="-9" r="7" fill="#f5edcf"/><path d="M16-9h9l-9 5" fill="#c98e4f"/><circle cx="12" cy="-11" r="1.5" fill="#495d4a"/></g>
  <g transform="translate(103 557)"><ellipse cy="18" rx="28" ry="8" fill="#8ca576"/><circle r="25" fill="${ball}"/><path d="M-22-11Q0 0 22-11M-21 13Q0 2 21 13M0-25Q-13 0 0 25" fill="none" stroke="#fff5d1" stroke-width="5"/></g>
  ${tree(555, 423, .77, '#688760')}${tree(577, 494, .72, '#789568')}
  <g fill="#92aa7e"><ellipse cx="465" cy="532" rx="56" ry="12"/><ellipse cx="34" cy="577" rx="25" ry="7"/></g>
  ${flower(433, 501, '#e4a28c')}${flower(463, 489, '#f4e9c4')}${v.extraFlower ? flower(487, 505, '#e4a28c') : ''}
  <g stroke="#789361" stroke-width="3" fill="none" stroke-linecap="round"><path d="M280 549v-13m0 8l-7-5m7-1l6-6M29 335v-12m0 7l-6-5m6 1l6-5M514 354v-12m0 7l6-5M350 563v-12m0 7l6-5"/></g>
  <g fill="#e8dfbc"><ellipse cx="313" cy="350" rx="7" ry="4"/><ellipse cx="289" cy="337" rx="4" ry="3"/><ellipse cx="519" cy="566" rx="7" ry="4"/></g>
  </svg>`;
}

function shuffle(values) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function renderPlayer() {
  $('#crop').innerHTML = scene(variants[target], player);
  $('#player-name').textContent = `Spieler:in ${player + 1}`;
  $('#quarter-name').textContent = quarters[player];
  $('#avatar').textContent = player + 1;
  $('#avatar').style.background = playerColors[player];
  $('#player-position').textContent = `Perspektive ${player + 1} / 4`;
  $('.perspective .small-label').textContent = `${player + 1} VON 4`;
  document.querySelectorAll('.quadrant-map i').forEach((el, i) => el.classList.toggle('active', i === player));
  $('#hidden-crop').hidden = !concealed;
  $('#visibility').hidden = concealed;
}
function choose(id) {
  if (finished || rejected.has(id)) return;
  selected = id;
  document.querySelectorAll('.candidate').forEach(el => {
    const active = Number(el.dataset.id) === selected;
    el.classList.toggle('selected', active);
    el.setAttribute('aria-pressed', String(active));
  });
  $('#selection-status').textContent = `Bild ${String(order.indexOf(id) + 1).padStart(2, '0')} ausgewählt.`;
  $('#submit').disabled = false;
}
function newRound() {
  const previous = target;
  do { target = Math.floor(Math.random() * variants.length); } while (target === previous);
  round++; player = 0; selected = null; finished = false; concealed = false; attempts = 0; rejected = new Set();
  order = shuffle(variants.map(v => v.id));
  startTime = Date.now();
  $('#round-label').textContent = `Runde ${String(round).padStart(2, '0')}`;
  $('#timer').textContent = '00:00';
  $('#selection-status').textContent = 'Einigt euch auf ein Bild.';
  $('#submit').disabled = true;
  $('#candidates').innerHTML = order.map((id, index) => `<button class="candidate" data-id="${id}" aria-label="Bild ${index + 1} auswählen" aria-pressed="false">${scene(variants[id])}<span class="candidate-caption">Bild ${String(index + 1).padStart(2, '0')}<span class="radio" aria-hidden="true"></span></span></button>`).join('');
  renderPlayer();
}
function changePlayer(delta) { player = (player + delta + 4) % 4; renderPlayer(); }
$('#previous-player').onclick = () => changePlayer(-1);
$('#next-player').onclick = () => changePlayer(1);
$('#visibility').onclick = () => { concealed = true; renderPlayer(); };
$('#show-crop').onclick = () => { concealed = false; renderPlayer(); };
$('#new-round').onclick = newRound;
$('#candidates').onclick = event => {
  const button = event.target.closest('.candidate');
  if (button) choose(Number(button.dataset.id));
};
$('#submit').onclick = () => {
  if (selected === null || finished) return;
  attempts++;
  const correct = selected === target;
  if (correct) finished = true;
  else {
    rejected.add(selected);
    const button = document.querySelector(`[data-id="${selected}"]`);
    button.classList.add('wrong'); button.classList.remove('selected'); button.disabled = true;
    button.setAttribute('aria-pressed', 'false'); selected = null;
  }
  $('#submit').disabled = true;
  $('#selection-status').textContent = correct ? 'Gemeinsam gelöst. Gut kombiniert!' : 'Noch nicht ganz. Vergleicht die Details noch einmal.';
  $('#result-content').innerHTML = correct
    ? `<div class="result-body"><span class="result-icon">✳</span><h2>Vier Blicke. Volltreffer!</h2><p>Ihr habt Bild ${String(order.indexOf(target) + 1).padStart(2, '0')} gemeinsam gefunden.<br>${attempts} ${attempts === 1 ? 'Versuch' : 'Versuche'} · ${$('#timer').textContent} Minuten</p><div class="result-image">${scene(variants[target])}</div><button class="primary" id="play-again">Nächste Runde ↗</button></div>`
    : '<div class="result-body"><span class="result-icon">✧</span><h2>Ein Detail passt noch nicht.</h2><p>Euer Bild stimmt nicht mit allen vier Ausschnitten überein. Sprecht noch einmal über die Sonne, den Schirm, den Ball und die Blumen.</p><button class="primary" id="keep-playing">Weiter rätseln →</button></div>';
  $('#result-dialog').showModal();
  if (correct) $('#play-again').onclick = () => { $('#result-dialog').close(); newRound(); };
  else $('#keep-playing').onclick = () => $('#result-dialog').close();
};
$('#rules').onclick = () => $('#rules-dialog').showModal();
$('.close-rules').onclick = () => $('#rules-dialog').close();
document.querySelectorAll('dialog .close').forEach(button => { button.onclick = () => button.closest('dialog').close(); });
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } }));
document.addEventListener('keydown', event => {
  if (document.querySelector('dialog[open]') || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  if (event.key === 'ArrowLeft') { event.preventDefault(); changePlayer(-1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); changePlayer(1); }
  if (event.code === 'Space' && event.target === document.body) { event.preventDefault(); concealed = !concealed; renderPlayer(); }
});
setInterval(() => {
  if (finished) return;
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  $('#timer').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}, 1000);
newRound();