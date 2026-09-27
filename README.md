# BioAventura

Jogo educativo 2D de navegador, feito em Canvas sem dependências de runtime.

## Executar

Abra `index.html` em um navegador moderno ou sirva a pasta com qualquer servidor estático.

## Onde personalizar

- `src/data.js`: personagens, missões, temas, fases, placas, coletáveis e dificuldade.
- `src/engine.js`: motor genérico (física, colisões, câmera, renderização e estados).
- `src/main.js`: ligação do motor com a página.

Uma nova jornada é uma nova entrada em `MISSIONS`; o motor não contém condicionais para O₂, pulmão ou uma fase específica.
