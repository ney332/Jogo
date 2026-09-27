// Conteúdo do jogo: trocar/adicionar dados aqui não exige alterar o motor.
export const CHARACTERS = {
  oxygen:        { id: 'oxygen',        name: 'Oxigênio',    symbol: 'O₂',  color: '#1aa9f4', shade: '#0875cf', description: 'Sou o oxigênio e minha missão é chegar até o pulmão e entrar no sangue!', physics: { speed: 850, acceleration: 5000, jumpForce: 800, gravity: 1850 }, abilities: { doubleJump: false } },
  carbonDioxide: { id: 'carbonDioxide', name: 'Gás carbônico', symbol: 'CO₂', color: '#8194ad', shade: '#4c617d', description: 'Vou voltar aos pulmões para sair na expiração!',                         physics: { speed: 800, acceleration: 5000, jumpForce: 810, gravity: 1850 }, abilities: { doubleJump: false } }
};

export const THEMES = {
  outdoor:    { sky: '#7ecef4', sky2: '#b8e4f9', organ: '#5a8f2a', organDark: '#3d6e14', platform: '#6b3a1f', grass: '#5dbe2a', particle: '#fffbe0' },
  nasal:      { sky: '#e8846a', sky2: '#c45a3f', organ: '#d4634f', organDark: '#8b3028', platform: '#7a2e26', grass: '#e89c78', particle: '#ffe4d6' },
  throat:     { sky: '#c45a3a', sky2: '#8b2e20', organ: '#bf4a38', organDark: '#7a2620', platform: '#6e2318', grass: '#d4806a', particle: '#ffd6c8' },
  respiratory:{ sky: '#3ac7f5', sky2: '#1876c6', organ: '#d65068', organDark: '#852741', platform: '#874226', grass: '#78d43a', particle: '#a8efff' },
  bronchi:    { sky: '#4a151b', sky2: '#2a0a0f', organ: '#801828', organDark: '#4a1018', platform: '#802232', grass: '#bd4b5f', particle: '#ffd4dc' },
  alveolus:   { sky: '#722851', sky2: '#e16a83', organ: '#ef8792', organDark: '#9d3858', platform: '#9a3b4c', grass: '#ffb3a2', particle: '#bfeeff' },
  capilarS:   { sky: '#c83042', sky2: '#801224', organ: '#d83a4c', organDark: '#701020', platform: '#942232', grass: '#f590a0', particle: '#ffffff' },
  bloodstream:{ sky: '#b5304a', sky2: '#5c1338', organ: '#e44a55', organDark: '#801d3a', platform: '#8f2840', grass: '#ffabb0', particle: '#d8f9ff' },
  cellular:   { sky: '#e67a8b', sky2: '#692852', organ: '#f6ae92', organDark: '#a54167', platform: '#a34262', grass: '#ffc29d', particle: '#b4edff' }
};

const level = (id, title, description, environment, labels, goalLabel, platforms, collectibles, hazards = [], opts = {}) =>
  ({ id, title, description, environment, labels, goalLabel, platforms, collectibles, hazards, width: 4000, checkpoint: 2200, ...opts });
const ground = (width = 4000) => ({ x: -100, y: 615, w: width + 200, h: 130, ground: true });

export const MISSIONS = [
  {
    id: 'oxygen-to-lungs', title: 'MISSÃO O₂', subtitle: 'DO AR ATÉ O PULMÃO',
    character: 'oxygen', theme: 'outdoor',
    introduction: 'Olá! Eu sou o oxigênio e minha missão é chegar até o pulmão e entrar no sangue! Chegue até o nariz e pule dentro dele!',
    finalMessage: 'O O₂ chegou aos pulmões!',
    finalFact: 'Nos alvéolos, o oxigênio passa do ar para o sangue — é a hematose!',
    nextMissionLabel: 'PRÓXIMA MISSÃO',
    levels: [

      // ── FASE 1 — AO AR LIVRE ────────────────────────────────────────────────
      level(
        'outdoor', 'FASE 1 — AO AR LIVRE',
        'O O₂ flutua no ar livre. Corra até o nariz e pule dentro para começar a jornada!',
        'outdoor',
        [
          { x: 900,  y: 340, title: 'ATMOSFERA', text: 'O ar que respiramos tem cerca de 21% de oxigênio (O₂).' },
          { x: 2100, y: 325, title: 'NARIZ',     text: 'O nariz é a porta de entrada! Pule dentro dele para continuar.' }
        ],
        'DENTRO DO NARIZ',
        [
          { x: -100, y: 615, w: 2550, h: 130, ground: true }, // chão — termina antes do buraco
          { x: 360,  y: 490, w: 240, h: 28 },
          { x: 820,  y: 430, w: 210, h: 28 },
          { x: 1260, y: 490, w: 240, h: 28 },
          { x: 1720, y: 430, w: 220, h: 28 },
          { x: 2140, y: 490, w: 185, h: 28 }, // última pedra — beira do buraco
        ],
        [430, 890, 1330, 1790, 2195],
        [],
        { width: 2800, checkpoint: 1500, exitZone: { x: 2380, w: 450 } }
      ),

      // ── FASE 2 — CAVIDADE NASAL ─────────────────────────────────────────────
      level(
        'nasal-cavity', 'FASE 2 — CAVIDADE NASAL',
        'O O₂ entra pelo nariz! Cílios e muco filtram o ar antes de prosseguir.',
        'nasal',
        [
          { x: 400,  y: 340, title: 'CÍLIOS',     text: 'Cílios vibratórios movem o muco e retêm partículas do ar.' },
          { x: 1050, y: 340, title: 'MUCO NASAL', text: 'O muco captura bactérias e impurezas antes dos pulmões.' }
        ],
        'NASOFARINGE',
        [
          ground(1600),
          { x: 280,  y: 480, w: 200, h: 25 },
          { x: 620,  y: 400, w: 190, h: 25 },
          { x: 960,  y: 480, w: 200, h: 25 },
          { x: 1280, y: 410, w: 190, h: 25 },
        ],
        [340, 680, 1020, 1340],
        [],
        { width: 1600, checkpoint: 800 }
      ),

      // ── FASE 3 — FARINGE E LARINGE ──────────────────────────────────────────
      level(
        'nasopharynx', 'FASE 3 — FARINGE E LARINGE',
        'O O₂ passa pela faringe e laringe em direção à traqueia.',
        'throat',
        [
          { x: 520, y: 340, title: 'FARINGE', text: 'A faringe conduz o ar até a laringe' },
          { x: 920, y: 270, title: 'LARINGE', text: 'A laringe direciona o ar até a traqueia.' }
        ],
        'TRAQUEIA',
        [
          ground(1450),
          { x: 400, y: 470, w: 240, h: 28 },
          { x: 800, y: 400, w: 240, h: 28 },
        ],
        [460, 580, 860, 980],
        [],
        { width: 1450, checkpoint: 700 }
      ),

      // ── FASE 4 — TRAQUEIA ───────────────────────────────────────────────────
      level(
        'trachea', 'FASE 4 — TRAQUEIA',
        'A traqueia é reforçada por anéis de cartilagem. Ela leva o ar até os brônquios.',
        'respiratory',
        [
          { x: 450,  y: 310, title: 'ANÉIS DE CARTILAGEM', text: 'O ar passa pela traqueia em direção aos brônquios.' },
          { x: 1150, y: 310, title: 'CARINA',              text: 'A carina é a bifurcação da traqueia em dois brônquios principais.' }
        ],
        'BRÔNQUIOS',
        [
          ground(1600)
        ],
        [350, 650, 950, 1250],
        [],
        { width: 1600, checkpoint: 800 }
      ),

      // ── FASE 5 — BRÔNQUIOS E BRONQUÍOLOS ────────────────────────────────────
      level(
        'bronchi', 'FASE 5 — BRÔNQUIOS E BRONQUÍOLOS',
        'O O₂ percorre os brônquios e bronquíolos, que se ramificam cada vez mais.',
        'bronchi',
        [
          { x: 200,  y: 300, title: 'BRÔNQUIOS',            text: 'Os brônquios principais ramificam-se em bronquíolos.' },
          { x: 650,  y: 300, title: 'BRONQUÍOLOS',          text: 'Os bronquíolos conduzem o ar até os alvéolos pulmonares.' },

        ],
        'ALVÉOLOS',
        [
          ground(1600),
          { x: 300,  y: 490, w: 200, h: 28 },
          { x: 650,  y: 410, w: 200, h: 28 },
          { x: 1000, y: 340, w: 210, h: 28 },
          { x: 1300, y: 430, w: 180, h: 28 },
        ],
        [360, 710, 1060, 1360],
        [],
        { width: 1600, checkpoint: 800 }
      ),

      // ── FASE 6 — ALVÉOLOS ───────────────────────────────────────────────────
      level(
        'alveolus', 'FASE 6 — ALVÉOLOS',
        'O O₂ chega ao alvéolo e realiza a troca gasosa! A missão está quase concluída.',
        'alveolus',
        [
          { x: 750,  y: 230, title: 'PO2 = 104 mmHg',           text: 'O O₂ atravessa a membrana alveolo-capilar por difusão.' },
          { x: 1400, y: 200, title: 'MEMBRANA ALVÉOLO-CAPILAR', text: 'Hematose: O O₂ entra no sangue e o CO₂ sai pelos pulmões.' }
        ],
        'TROCA GASOSA',
        [
          ground(1600),
          { x: 300,  y: 480, w: 240, h: 28 },
          { x: 680,  y: 390, w: 240, h: 28 },
          { x: 1060, y: 440, w: 250, h: 28 },
        ],
        [360, 480, 740, 860, 1120, 1360],
        [],
        { width: 1600, checkpoint: 800 }
      ),
      //dddddddd
      level(
        'capilarS', 'FASE 7 — CAPILAR SANGUÍNEO',
        'O O₂ passa para a corrente sanguínea por difusão.',
        'capilarS',
        [
          { x: 750,  y: 230, title: 'PO2 = 40 mmHg',           text: 'O O₂ liga-se à hemoglobina presente nas hemácias.' },
        ],
        'TROCA GASOSA',
        [
          ground(1600),
          { x: 300,  y: 480, w: 240, h: 28 },
          { x: 680,  y: 390, w: 240, h: 28 },
          { x: 1060, y: 440, w: 250, h: 28 },
        ],
        [360, 480, 740, 860, 1120, 1360],
        [],
        { width: 1600, checkpoint: 800 }
      ),

    ] // fim levels missão 1
  },

  // ── MISSÃO 2 — DO PULMÃO ATÉ AS CÉLULAS (inalterada) ───────────────────────
  {
    id: 'oxygen-to-cells', title: 'MISSÃO O₂', subtitle: 'DO PULMÃO ATÉ AS CÉLULAS',
    character: 'oxygen', theme: 'bloodstream',
    introduction: 'Agora que entrei no sangue, vou viajar até as células do corpo!',
    finalMessage: 'O oxigênio chegou às células e agora é energia!',
    finalFact: 'By: Ariane Rodrigues, Barbara Nunes e Victória Santos.',
    nextMissionLabel: 'JOGAR NOVAMENTE',
    levels: [
      level(
        'oxygenated-blood', 'FASE 1 — SANGUE OXIGENADO',
        'O sangue, agora rico em oxigênio, entra nas veias pulmonares rumo ao coração.',
        'bloodstream',
        [{ x: 700, y: 320, title: 'VEIA PULMONAR', text: 'As veias pulmonares levam sangue oxigenado ao coração.' }],
        'CORAÇÃO',
        [
          ground(1600),
          { x: 320,  y: 480, w: 220, h: 28 },
          { x: 680,  y: 390, w: 240, h: 28 },
          { x: 1080, y: 460, w: 220, h: 28 },
        ],
        [380, 500, 740, 860, 1140, 1360],
        [],
        { width: 1600, checkpoint: 800 }
      ),
      level(
        'heart', 'FASE 2 — CORAÇÃO',
        'O sangue chega ao lado esquerdo do coração, que o bombeia para os tecidos do corpo.',
        'bloodstream',
        [
          { x: 450,  y: 280, title: 'ÁTRIO ESQUERDO',     text: 'O átrio recebe o sangue vindo dos pulmões.' },
        ],
        'TECIDOS',
        [
          ground(1600),
          { x: 320,  y: 470, w: 230, h: 28 },
          { x: 680,  y: 390, w: 240, h: 28 },
          { x: 1060, y: 450, w: 230, h: 28 },
        ],
        [380, 500, 740, 860, 1120, 1360],
        [],
        { width: 1600, checkpoint: 800 }
      ),
      level(
        'tissues', 'FASE 3 — TECIDOS',
        'O oxigênio é liberado da hemácia e passa para as células.',
        'cellular',
        [
          { x: 450,  y: 300, title: 'PRODUÇÃO DE CO2', text: 'O aumento do CO2 diminui a afinidade da hemoglobina pelo O2.' },
          { x: 1400, y: 200, title: 'CÉLULA', text:'🫀'}
        ],
        'CÉLULAS',
        [
          ground(1600),
          { x: 320,  y: 470, w: 220, h: 28 },
          { x: 680,  y: 380, w: 240, h: 28 },
          { x: 1050, y: 450, w: 230, h: 28 },
        ],
        [380, 500, 740, 860, 1120, 1360],
        [],
        { width: 1600, checkpoint: 800 }
      ),

      // 

      level(
        'chegadaCelula', 'FASE 4 — CHEGADA ATÉ AS CÉLULAS',
        'Depois de ser liberado pela hemoglobina, o O2 chega até a célula.',
        'cellular',
        [
          { x: 450,  y: 300, title: 'O O2 passa para o liquido intersticial e entra na célula.', text:'Dentro da célula, o O2 será utilizado principalmente pelas mitocôndrias.'},
        ],
        'CÉLULAS',
        [
          ground(1600),
          { x: 320,  y: 470, w: 220, h: 28 },
          { x: 680,  y: 380, w: 240, h: 28 },
          { x: 1050, y: 450, w: 230, h: 28 },
        ],
        [380, 500, 740, 860, 1120, 1360],
        [],
        { width: 1600, checkpoint: 800 }
      )
    ]
  }
];
