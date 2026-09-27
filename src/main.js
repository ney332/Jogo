import { MISSIONS } from './data.js';
import { GameEngine } from './engine.js';

const canvas = document.querySelector('#game'), overlay = document.querySelector('#overlay');
const btnFullscreen = document.querySelector('#btn-fullscreen');
const btnPause = document.querySelector('#btn-pause');

let engine, activeMission = 0;

function button(label, fn) {
  const b = document.createElement('button');
  b.textContent = label;
  b.onclick = fn;
  return b;
}

function card({eyebrow='', title, body='', fact='', actions=[]}) {
  overlay.innerHTML = '';
  const d = document.createElement('div');
  d.className = 'card';
  d.innerHTML = `
    ${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ''}
    <h1>${title}</h1>
    ${body ? `<p>${body}</p>` : ''}
    ${fact ? `<div class="fact">${fact}</div>` : ''}
  `;
  const a = document.createElement('div');
  a.className = 'choices';
  actions.forEach(([l, f]) => a.append(button(l, f)));
  d.append(a);
  overlay.append(d);
}

function menu() {
  card({
    eyebrow: '',
    title: 'Missão<br>O2',
    body: 'Uma jornada jogável pelo corpo humano. Corra, pule, aprenda e leve o oxigênio até as células.',
    actions: MISSIONS.map((m, i) => [`${m.title} — ${m.subtitle}`, () => intro(i)])
  });
}

function intro(i) {
  activeMission = i;
  const m = MISSIONS[i];
  card({
    eyebrow: m.subtitle,
    title: m.title,
    body: m.introduction,
    fact: 'Controles: use os botões na tela no celular ou A/D e Espaço no teclado. ⏸ no topo ou ESC pausa.',
    actions: [['VAMOS LÁ!', () => engine.start(m)]]
  });
}

function state(s) {
  const m = engine.mission;

  // Atualiza visibilidade do botão de pausa mobile
  if (btnPause) {
    btnPause.style.display = (s === 'playing' || s === 'paused') ? 'grid' : 'none';
  }

  if (s === 'playing') {
    overlay.innerHTML = '';
    return;
  }

  if (s === 'paused') {
    card({
      eyebrow: 'JOGO PAUSADO',
      title: 'PAUSA',
      body: 'Respire fundo. A aventura continua quando você quiser.',
      actions: [
        ['CONTINUAR', () => engine.pause()],
        ['REINICIAR', () => engine.restart()]
      ]
    });
  }

  if (s === 'levelComplete') {
    card({
      eyebrow: 'VOCÊ CHEGOU A',
      title: 'FASE CONCLUÍDA!',
      body: engine.level.description,
      fact: `Aprendizado: ${engine.level.labels.map(l => l.title).join(' · ')}.`,
      actions: [['PRÓXIMA FASE →', () => engine.next()]]
    });
  }

  if (s === 'missionComplete') {
    card({
      eyebrow: 'ETAPA CONCLUÍDA!',
      title: m.title,
      body: m.finalMessage,
      fact: m.finalFact,
      actions: [[m.nextMissionLabel, () => activeMission + 1 < MISSIONS.length ? intro(activeMission + 1) : menu()]]
    });
  }

  if (s === 'gameOver') {
    card({
      eyebrow: 'AS BOLHAS ESCAPARAM',
      title: 'TENTE DE NOVO',
      body: 'Você pode reiniciar a fase e continuar aprendendo.',
      actions: [['RECOMEÇAR', () => engine.restart()]]
    });
  }
}

engine = new GameEngine(canvas, state);
menu();

// ── BOTÕES DA BARRA SUPERIOR (TELA CHEIA E PAUSA) ──────────────────────────
if (btnFullscreen) {
  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  });

  const updateFsIcon = () => {
    btnFullscreen.textContent = document.fullscreenElement ? '✕' : '⛶';
  };
  document.addEventListener('fullscreenchange', updateFsIcon);
  document.addEventListener('webkitfullscreenchange', updateFsIcon);
}

if (btnPause) {
  btnPause.addEventListener('click', () => {
    if (engine && (engine.state === 'playing' || engine.state === 'paused')) {
      engine.pause();
    }
  });
}

// ── CONTROLES VIRTUAIS TOUCH COM MULTI-TOUCH FLUIDO ───────────────────────
document.querySelectorAll('[data-key]').forEach(b => {
  const k = b.dataset.key;

  // Evita abrir menu contextual no celular ao segurar o botão
  b.addEventListener('contextmenu', e => e.preventDefault());

  b.addEventListener('pointerdown', e => {
    engine.setKey(k, true);
    b.classList.add('active');
    try { b.setPointerCapture(e.pointerId); } catch (_) {}
    e.preventDefault();
  });

  const release = e => {
    engine.setKey(k, false);
    b.classList.remove('active');
    try { b.releasePointerCapture(e.pointerId); } catch (_) {}
    e.preventDefault();
  };

  b.addEventListener('pointerup', release);
  b.addEventListener('pointercancel', release);
});
