import { CHARACTERS, THEMES } from './data.js';

const W = 1280, H = 720, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export class GameEngine {
  constructor(canvas, onState) {
    this.c = canvas; this.x = canvas.getContext('2d'); this.onState = onState; this.keys = {}; this.state = 'menu'; this.score = 0; this.lives = 3; this.cameraX = 0; this.last = 0;
    const _speeds = [0, 0.15, 0.05, 0.4, 0.6, 0.75, 1.0];
    const _files  = ['01_BG_SKY','02_BG_HILL','03_CLOUD','04_BUSH','05_TREE','06_GRASS','07_GROUND'];
    this.bgLayers = _files.map((f, i) => { const img = new Image(); img.src = `./assets/background/${f}.png`; return { img, speed: _speeds[i] }; });
    this.headImg  = new Image(); this.headImg.src  = './assets/head_anatomy.png';
    this.fase2Img = new Image(); this.fase2Img.src = './assets/PHOTO-2026-09-27-12-15-26.jpg';
    this.traqueiaImg = new Image(); this.traqueiaImg.src = './assets/traqueia.jpg';
    this.bronquiImg  = new Image(); this.bronquiImg.src  = './assets/bronqui.jpg';
    this.alveImg     = new Image(); this.alveImg.src     = './assets/alve.jpg';
    this.capilarImg  = new Image(); this.capilarImg.src  = './assets/capilar.jpg';
    this.coracaoImg  = new Image(); this.coracaoImg.src  = './assets/coracao.jpg';
    this.tecidoImg   = new Image(); this.tecidoImg.src   = './assets/tecido.jpg';
    this.chegadaImg  = new Image(); this.chegadaImg.src  = './assets/chegadaCelula.jpg';
    addEventListener('keydown', e => { const k = this.map(e.key); if (k) { this.keys[k] = true; e.preventDefault(); } if (e.key === 'Escape' && this.state === 'playing') this.pause(); if (e.key.toLowerCase() === 'r') this.restart(); });
    addEventListener('keyup', e => { const k = this.map(e.key); if (k) this.keys[k] = false; });
    requestAnimationFrame(t => this.loop(t));
  }
  map(k) { return ({ ArrowLeft:'left', a:'left', A:'left', ArrowRight:'right', d:'right', D:'right', ArrowUp:'jump', w:'jump', W:'jump', ' ':'jump' })[k]; }
  setKey(k, v) { this.keys[k] = v; }
  start(mission, levelIndex = 0) { this.mission = mission; this.levelIndex = levelIndex; this.level = mission.levels[levelIndex]; this.theme = THEMES[this.level.environment] || THEMES[mission.theme]; this.character = CHARACTERS[mission.character]; this.score = 0; this.lives = 3; this.spawn(); this.state = 'playing'; this.onState('playing'); }
  hasCompanion() {
    if (this.level?.id === 'tissues' || this.level?.id === 'chegadaCelula' || this.level?.id === 'chegada-celula') return false;
    return this.mission?.id === 'oxygen-to-cells' || this.level?.id === 'capilarS';
  }
  spawn(checkpoint = false) {
    this.player = { x: checkpoint ? this.level.checkpoint : 120, y: 350, w: 49, h: 59, vx: 0, vy: 0, grounded: false, coyote: 0, jumpBuffer: 0, checkpoint };
    this.companion = this.hasCompanion() ? { x: this.player.x - 45, y: 350, w: 49, h: 59, vx: 0, vy: 0, grounded: false, coyote: 0, jumpBuffer: 0 } : null;
    this.jumpHeld = this.keys.jump; this.cameraX = Math.max(0, this.player.x - 250); this.used = new Set(); this.nearLabel = null;
  }
  restart() { if (this.mission && this.state !== 'menu') { this.lives = 3; this.score = 0; this.spawn(); this.state = 'playing'; this.onState('playing'); } }
  pause() { this.state = this.state === 'paused' ? 'playing' : 'paused'; this.onState(this.state); }
  next() { if (this.levelIndex + 1 < this.mission.levels.length) this.start(this.mission, this.levelIndex + 1); else { this.state = 'missionComplete'; this.onState('missionComplete'); } }

  update(dt) {
    if (this.state !== 'playing') return;
    const p = this.player, cfg = this.character.physics, dir = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
    p.vx += dir * cfg.acceleration * dt; p.vx *= p.grounded ? .91 : .97; p.vx = clamp(p.vx, -cfg.speed, cfg.speed);
    p.coyote = p.grounded ? .11 : Math.max(0, p.coyote - dt);
    if (this.keys.jump && !this.jumpHeld) p.jumpBuffer = .12;
    else p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);
    this.jumpHeld = this.keys.jump;
    if (p.jumpBuffer && p.coyote) { p.vy = -cfg.jumpForce; p.grounded = false; p.coyote = 0; p.jumpBuffer = 0; }
    p.vy += cfg.gravity * dt; p.vy = Math.min(p.vy, 1100); p.x += p.vx * dt; this.collideX(p); p.prevY = p.y; p.y += p.vy * dt; p.grounded = false; this.collideY(p);
    p.x = Math.max(0, p.x);

    // Companion Hemácia — responde aos mesmos comandos e acompanha o jogador
    if (this.companion) {
      const cmp = this.companion;
      const dist = p.x - cmp.x;
      let cAcc = dir * cfg.acceleration;
      if (dist > 75) cAcc += 500;
      else if (dist < -50) cAcc -= 500;

      cmp.vx += cAcc * dt;
      cmp.vx *= cmp.grounded ? .91 : .97;
      cmp.vx = clamp(cmp.vx, -cfg.speed * 1.05, cfg.speed * 1.05);

      cmp.coyote = cmp.grounded ? .11 : Math.max(0, cmp.coyote - dt);
      if (this.keys.jump && !this.jumpHeld) cmp.jumpBuffer = .13;
      else cmp.jumpBuffer = Math.max(0, cmp.jumpBuffer - dt);

      if (cmp.jumpBuffer && cmp.coyote) {
        cmp.vy = -cfg.jumpForce;
        cmp.grounded = false;
        cmp.coyote = 0;
        cmp.jumpBuffer = 0;
      }

      cmp.vy += cfg.gravity * dt;
      cmp.vy = Math.min(cmp.vy, 1100);
      cmp.x += cmp.vx * dt;
      this.collideX(cmp);
      cmp.prevY = cmp.y;
      cmp.y += cmp.vy * dt;
      cmp.grounded = false;
      this.collideY(cmp);
      cmp.x = Math.max(0, cmp.x);

      // Reaparece perto do jogador caso se afaste demais ou caia
      if (Math.abs(p.x - cmp.x) > 300 || cmp.y > H + 50) {
        cmp.x = p.x - 45;
        cmp.y = p.y;
        cmp.vx = p.vx;
        cmp.vy = p.vy;
        cmp.grounded = p.grounded;
      }

      // Hemácia também coleta itens para o time
      for (let i = 0; i < this.level.collectibles.length; i++) {
        const q = { x: this.level.collectibles[i], y: 550 - (i % 3) * 65, w: 26, h: 30 };
        if (!this.used.has(i) && overlap(cmp, q)) {
          this.used.add(i);
          this.score++;
        }
      }
    }
    // Saída por queda (exitZone) ou dano normal
    if (p.y > H + 100) {
      const ez = this.level.exitZone;
      if (ez && p.x + p.w * .5 >= ez.x && p.x + p.w * .5 <= ez.x + ez.w) { this.state = 'levelComplete'; this.onState('levelComplete'); }
      else { this.damage(); }
    }
    for (let i = 0; i < this.level.collectibles.length; i++) { const q = { x: this.level.collectibles[i], y: 550 - (i % 3) * 65, w: 26, h: 30 }; if (!this.used.has(i) && overlap(p, q)) { this.used.add(i); this.score++; } }
    if (this.level.hazards.some(h => overlap(p, h))) this.damage();
    this.nearLabel = this.level.labels.find(l => Math.abs(l.x - p.x) < 130) || null;
    if (!p.checkpoint && p.x >= this.level.checkpoint) p.checkpoint = true;
    // Saída pela borda direita apenas para fases sem exitZone
    if (!this.level.exitZone && p.x >= this.level.width - 175) { this.state = 'levelComplete'; this.onState('levelComplete'); }
    const target = clamp(p.x - W * .33, 0, this.level.width - W); this.cameraX += (target - this.cameraX) * Math.min(1, dt * 4);
  }

  collideX(p) { for (const b of this.level.platforms) if (overlap(p, b)) { if (p.vx > 0) p.x = b.x - p.w; else if (p.vx < 0) p.x = b.x + b.w; p.vx = 0; } }
  collideY(p) { for (const b of this.level.platforms) if (overlap(p, b)) { if (p.vy >= 0 && p.prevY + p.h <= b.y + 8) { p.y = b.y - p.h; p.vy = 0; p.grounded = true; } else if (p.vy < 0) { p.y = b.y + b.h; p.vy = 0; } } }
  damage() { if (this.state !== 'playing') return; this.lives--; if (this.lives <= 0) { this.state = 'gameOver'; this.onState('gameOver'); } else this.spawn(this.player.checkpoint); }
  loop(t) { const dt = Math.min(.033, (t - this.last) / 1000 || 0); this.last = t; this.update(dt); this.render(t / 1000); requestAnimationFrame(n => this.loop(n)); }
  render(time) { const x = this.x, t = this.theme || THEMES.respiratory; x.clearRect(0, 0, W, H); this.background(x, t, time); if (!this.level) return; this.drawWorld(x, t, time); this.hud(x); }

  background(x, t, time) {
    // Gradiente de céu
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, t.sky); g.addColorStop(1, t.sky2); x.fillStyle = g; x.fillRect(0, 0, W, H);
    const env = this.level?.environment;
    if (env === 'outdoor') {
      // 7 camadas em parallax — cada uma move na sua velocidade
      for (const layer of this.bgLayers) {
        const img = layer.img;
        if (!img.complete || !img.naturalWidth) continue;
        const scale = H / img.naturalHeight;
        const sw    = img.naturalWidth * scale;
        const offset = -(this.cameraX * layer.speed) % sw;
        const copies = Math.ceil(W / sw) + 2;
        for (let i = -1; i < copies; i++) {
          x.drawImage(img, offset + i * sw, 0, sw, H);
        }
      }
    } else if (this.level?.id === 'nasal-cavity' || env === 'nasal-cavity') {
      // Fase 2: Imagem única cobrindo a fase inteira (sem repetição ao lado)
      const img = this.fase2Img;
      if (img.complete && img.naturalWidth) {
        const w = Math.max(W, this.level.width);
        x.drawImage(img, -this.cameraX, 0, w, H);
      } else {
        x.fillStyle = '#850702'; x.fillRect(0, 0, W, H);
      }
    } else if (this.level?.id === 'trachea') {
      // Fase 4: Imagem única cobrindo a fase inteira (sem repetição ao lado)
      const img = this.traqueiaImg;
      if (img.complete && img.naturalWidth) {
        const w = Math.max(W, this.level.width);
        x.drawImage(img, -this.cameraX, 0, w, H);
      } else {
        x.fillStyle = '#4a5568'; x.fillRect(0, 0, W, H);
      }
    } else if (this.level?.id === 'bronchi') {
      // Fase 5: Imagem única cobrindo a fase inteira (sem repetição ao lado)
      const img = this.bronquiImg;
      if (img.complete && img.naturalWidth) {
        const w = Math.max(W, this.level.width);
        x.drawImage(img, -this.cameraX, 0, w, H);
      } else {
        x.fillStyle = '#4a151b'; x.fillRect(0, 0, W, H);
      }
    } else if (this.level?.id === 'alveolus') {
      // Fase 6: Alvéolos — imagem única dos sacos alveolares
      const img = this.alveImg;
      if (img.complete && img.naturalWidth) {
        const w = Math.max(W, this.level.width);
        x.drawImage(img, -this.cameraX, 0, w, H);
      } else {
        x.fillStyle = '#5c1322'; x.fillRect(0, 0, W, H);
      }
    } else if (this.level?.id === 'capilarS' || env === 'capilarS') {
      // Fase 7: Capilar Sanguíneo — imagem de fundo com hemácias
      const img = this.capilarImg;
      if (img.complete && img.naturalWidth) {
        const w = Math.max(W, this.level.width);
        x.drawImage(img, -this.cameraX, 0, w, H);
      } else {
        x.fillStyle = '#b5304a'; x.fillRect(0, 0, W, H);
      }
    } else if (this.level?.id === 'heart') {
      // Fase 3 (Missão 2): Coração anatômico
      const img = this.coracaoImg;
      if (img.complete && img.naturalWidth) {
        const w = Math.max(W, this.level.width);
        x.drawImage(img, -this.cameraX, 0, w, H);
      } else {
        x.fillStyle = '#c53d4f'; x.fillRect(0, 0, W, H);
      }
    } else if (this.level?.id === 'tissues') {
      // Fase 5 (Missão 2): Tecidos — padrão contínuo de fibras celulares/teciduais
      const img = this.tecidoImg;
      if (img.complete && img.naturalWidth) {
        x.save();
        const offset = -(this.cameraX * 0.3) % 600;
        x.translate(offset, 0);
        const pat = x.createPattern(img, 'repeat');
        x.fillStyle = pat;
        x.fillRect(-offset, 0, W, H);
        x.restore();
      } else {
        x.fillStyle = '#c53a55'; x.fillRect(0, 0, W, H);
      }
    } else if (this.level?.id === 'chegadaCelula' || this.level?.id === 'chegada-celula') {
      // Fase 4 (Missão 2): Chegada na Célula / Mitocôndria — imagem única sem repetição
      const img = this.chegadaImg;
      if (img.complete && img.naturalWidth) {
        const w = Math.max(W, this.level.width);
        x.drawImage(img, -this.cameraX, 0, w, H);
      } else {
        x.fillStyle = '#f58a42'; x.fillRect(0, 0, W, H);
      }
    } else if (this.mission?.id === 'oxygen-to-cells') {
      // Missão 2 (Do Pulmão até as Células): todas as fases com tom vermelho forte sem círculos
      const g = x.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#9e0e22');
      g.addColorStop(1, '#5c0512');
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);
    } else {
      // Interior genérico: partículas orgânicas difusas
      x.globalAlpha = .18; x.fillStyle = '#fff';
      for (let i = 0; i < 20; i++) { let px = (i * 211 - this.cameraX * .15) % 1500; if (px < -100) px += 1500; x.beginPath(); x.arc(px, 130 + (i % 5) * 86, 60 + (i % 4) * 20, 0, 7); x.fill(); }
      x.globalAlpha = 1;
    }
  }

  drawWorld(x, t, time) {
    const c = this.cameraX;
    const env = this.level?.environment;
    const isCustomBg = env === 'outdoor' || this.level?.id === 'nasal-cavity' || env === 'nasal-cavity' || this.level?.id === 'trachea' || this.level?.id === 'bronchi' || this.level?.id === 'alveolus' || this.level?.id === 'capilarS' || env === 'capilarS' || this.mission?.id === 'oxygen-to-cells';

    if (!isCustomBg) {
      // Interior: silhuetas orgânicas
      x.fillStyle = t.organDark; x.globalAlpha = .35;
      for (let i = -1; i < 9; i++) { x.beginPath(); x.ellipse(i * 520 - c * .45 + 140, 365, 180, 330, 0, 0, 7); x.fill(); }
      x.globalAlpha = 1;
    }

    // Plataformas
    for (const b of this.level.platforms) {
      // No outdoor e na traqueia, o chão visual vem da imagem de fundo — não redesenhar
      if (env === 'outdoor' && b.ground) continue;
      if (this.level?.id === 'trachea') continue;
      const q = { ...b, x: b.x - c }; if (q.x + q.w < 0 || q.x > W) continue;
      x.fillStyle = t.platform; x.fillRect(q.x, q.y, q.w, q.h);
      x.fillStyle = t.grass; x.fillRect(q.x, q.y, q.w, 8);
      x.fillStyle = '#ffffff22'; for (let k = 8; k < q.w; k += 24) x.fillRect(q.x + k, q.y + 12, 3, 3);
    }

    // Coletáveis animados
    for (let i = 0; i < this.level.collectibles.length; i++) if (!this.used.has(i)) {
      const px = this.level.collectibles[i] - c, py = 550 - (i % 3) * 65 + Math.sin(time * 3 + i) * 5;
      this.coin(x, px, py, t.particle);
    }

    // Obstáculos/perigos (cílios/espinhos)
    for (const h of this.level.hazards) {
      x.fillStyle = '#6a1838'; x.fillRect(h.x - c, h.y, h.w, h.h);
      x.fillStyle = '#ff8093'; for (let k = 0; k < h.w; k += 18) { x.beginPath(); x.moveTo(h.x - c + k, h.y); x.lineTo(h.x - c + k + 9, h.y - 18); x.lineTo(h.x - c + k + 18, h.y); x.fill(); }
    }

    // Placas educativas
    for (const l of this.level.labels) this.sign(x, l.x - c, l.y, l.title);

    // Cabeça anatômica (Fase 1) — guia visual para pular no nariz
    if (this.level.exitZone) {
      const ez = this.level.exitZone;
      // Ponto do nariz na tela (onde o buraco está)
      const noseScreenX = ez.x + 80 - c;
      const noseScreenY = 488; // altura alinhada com a última plataforma
      // Desenha a imagem da cabeça anatômica
      const img = this.headImg;
      if (img && img.complete && img.naturalWidth > 0) {
        const imgH = 680;
        const imgW = (img.naturalWidth / img.naturalHeight) * imgH;
        // noseXRatio: onde o nariz está horizontalmente na imagem (~20% da esquerda)
        // noseYRatio: onde o nariz está verticalmente na imagem (~47% do topo)
        const drawX = noseScreenX - imgW * 0.20;
        const drawY = noseScreenY - imgH * 0.47;
        x.drawImage(img, drawX, drawY, imgW, imgH);
      }
      // Buraco escuro abaixo do nariz — canal de entrada
      x.fillStyle = '#0a0204';
      x.beginPath(); x.ellipse(noseScreenX, 620, 68, 28, 0, 0, 7); x.fill();
      // Seta pulsante indicando a entrada
      const bounce = Math.sin(time * 4) * 7;
      x.fillStyle = '#ffd748'; x.strokeStyle = '#8b5a00'; x.lineWidth = 2;
      x.font = '900 15px Nunito'; x.textAlign = 'center';
      x.strokeText('▼ PULE NO NARIZ!', noseScreenX, 440 + bounce);
      x.fillText('▼ PULE NO NARIZ!', noseScreenX, 440 + bounce);
    }

    // Bandeira de chegada — apenas fases sem exitZone
    if (!this.level.exitZone) {
      const goalX = this.level.width - 130 - c;
      x.fillStyle = '#ffd748'; x.fillRect(goalX, 250, 12, 365);
      x.fillStyle = '#ee5d54'; x.beginPath(); x.moveTo(goalX + 12, 260); x.lineTo(goalX + 110, 290); x.lineTo(goalX + 12, 320); x.fill();
    }

    // Personagens (Hemácia e Jogador)
    if (this.companion) {
      this.hemaciaDraw(x, this.companion.x - c, this.companion.y, time);
    }
    this.characterDraw(x, this.player.x - c, this.player.y, time);

    // Balão de texto educativo (placa próxima)
    if (this.nearLabel) { x.fillStyle = '#071b41df'; x.strokeStyle = '#62d8ff'; x.lineWidth = 3; this.round(x, 300, 535, 680, 80, 12); x.fill(); x.stroke(); x.fillStyle = 'white'; x.font = '900 18px Nunito'; x.textAlign = 'center'; x.fillText(this.nearLabel.text, 640, 570); }
  }

  sign(x, px, py, title) { if (px < -200 || px > W + 200) return; x.font = '900 16px Nunito'; const w = x.measureText(title).width + 34; x.fillStyle = '#40243b'; x.strokeStyle = '#f3b46d'; x.lineWidth = 3; this.round(x, px - w / 2, py, w, 38, 7); x.fill(); x.stroke(); x.fillStyle = 'white'; x.textAlign = 'center'; x.fillText(title, px, py + 25); }
  coin(x, px, py, color) { x.fillStyle = '#ffd53e'; x.strokeStyle = '#a86a11'; x.lineWidth = 4; x.beginPath(); x.arc(px, py, 15, 0, 7); x.fill(); x.stroke(); x.fillStyle = '#fff18a'; x.fillRect(px - 4, py - 8, 8, 16); }
  characterDraw(x, px, py, time) { if (!this.player) return; const ch = this.character, bob = Math.sin(time * 8) * 1.5; x.save(); x.translate(px + 24, py + 27 + bob); x.fillStyle = ch.shade; x.beginPath(); x.ellipse(0, 2, 25, 28, 0, 0, 7); x.fill(); x.fillStyle = ch.color; x.beginPath(); x.ellipse(0, -2, 22, 25, 0, 0, 7); x.fill(); x.strokeStyle = '#063a70'; x.lineWidth = 3; x.beginPath(); x.arc(0, -2, 22, 0, 7); x.stroke(); x.fillStyle = 'white'; x.beginPath(); x.ellipse(-8, -7, 5, 7, 0, 0, 7); x.ellipse(8, -7, 5, 7, 0, 0, 7); x.fill(); x.fillStyle = '#07345f'; x.beginPath(); x.arc(-7, -6, 2, 0, 7); x.arc(9, -6, 2, 0, 7); x.fill(); x.strokeStyle = '#07345f'; x.lineWidth = 2; x.beginPath(); x.arc(0, 4, 6, 0, Math.PI); x.stroke(); x.fillStyle = 'white'; x.font = '900 14px Nunito'; x.textAlign = 'center'; x.fillText(ch.symbol, 0, 21); x.restore(); }
  hemaciaDraw(x, px, py, time) {
    if (!this.companion) return;
    const bob = Math.sin(time * 7 + 1.2) * 1.8;
    x.save();
    x.translate(px + 24, py + 27 + bob);
    // Base e sombra externa
    x.fillStyle = '#7a0e1c'; x.beginPath(); x.ellipse(0, 3, 26, 28, 0, 0, 7); x.fill();
    // Disco bicôncavo vermelho principal
    x.fillStyle = '#e6243b'; x.beginPath(); x.ellipse(0, -1, 24, 26, 0, 0, 7); x.fill();
    // Depressão central bicôncava (mais escura)
    x.fillStyle = '#b5192c'; x.beginPath(); x.ellipse(0, 1, 14, 13, 0, 0, 7); x.fill();
    // Contorno do disco
    x.strokeStyle = '#4a050f'; x.lineWidth = 3; x.beginPath(); x.arc(0, -1, 24, 0, 7); x.stroke();
    // Bochechas rosadas
    x.fillStyle = '#ff859588'; x.beginPath(); x.ellipse(-12, 3, 4, 3, 0, 0, 7); x.ellipse(12, 3, 4, 3, 0, 0, 7); x.fill();
    // Olhos
    x.fillStyle = 'white'; x.beginPath(); x.ellipse(-8, -6, 5, 7, 0, 0, 7); x.ellipse(8, -6, 5, 7, 0, 0, 7); x.fill();
    // Pupilas
    x.fillStyle = '#2b040a'; x.beginPath(); x.arc(-7, -5, 2.5, 0, 7); x.arc(9, -5, 2.5, 0, 7); x.fill();
    // Brilho dos olhos
    x.fillStyle = 'white'; x.beginPath(); x.arc(-8, -7, 1, 0, 7); x.arc(8, -7, 1, 0, 7); x.fill();
    // Boca sorrindo
    x.strokeStyle = '#2b040a'; x.lineWidth = 2; x.beginPath(); x.arc(0, 4, 5, 0, Math.PI); x.stroke();
    // Símbolo Hb (Hemoglobina)
    x.fillStyle = '#ffe8ec'; x.font = '900 13px Nunito'; x.textAlign = 'center'; x.fillText('Hb', 0, 21);
    x.restore();
  }
  hud(x) { if (!this.level) return; x.fillStyle = '#071b40e8'; x.strokeStyle = '#70dfff'; x.lineWidth = 3; this.round(x, 18, 16, 555, 62, 11); x.fill(); x.stroke(); x.fillStyle = 'white'; x.textAlign = 'left'; x.font = '900 20px Nunito'; x.fillText(this.level.title, 37, 43); x.font = '800 13px Nunito'; x.fillStyle = '#a9eaff'; x.fillText(this.level.description, 37, 64); x.textAlign = 'right'; x.font = '900 25px Nunito'; x.fillStyle = '#ffdb4d'; x.fillText('♥'.repeat(this.lives), 1170, 48); x.fillStyle = 'white'; x.fillText('◉ × ' + String(this.score).padStart(2, '0'), 1255, 48); }
  round(x, a, b, w, h, r) { x.beginPath(); x.roundRect(a, b, w, h, r); }
}
