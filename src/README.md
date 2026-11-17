# Ariadna — вихідні файли

Готова сторінка — `../index.html` (її показує GitHub Pages). Її не правлять руками: її збирають звідси.

Збирання (з цієї папки):

    python3 restructure.py && python3 build.py && node /tmp/t.js

- `src_v31.html` — основа сторінки (розмітка, стилі, дані карти, малювання).
- `restructure.py` — правки поверх основи: нижня панель, віконця, двері, поверхи, сходи, обрив (дані — у блоці v5). Пише `src.html`.
- `tail.js` — логіка інтерфейсу (вибір, пошук, маршрут, геопозиція).
- `build.py` — підставляє `context.txt` (сусідні будівлі), `roofs.json` (дахи), `terrain.json` (рельєф) і пише `../index.html`; `node /tmp/t.js` — перевірка маршрутів.
- `terrain.py` + `dem.b64` — рельєф (висоти AWS Terrain Tiles, z15). `bld.json` — контури будівель з OpenStreetMap.
- `tools/sk` — розрахунок скатів дахів (npm `straight-skeleton`); `tools/shot.mjs` — знімки сторінки в headless Chrome.
- `tools/print.mjs` — аркуші для друку A4 (огляд, частини території, корпуси з відділеннями) в один PDF: `node tools/print.mjs ../index.html /tmp/print`.

Координати: метри на схід (x) і на південь (y) від 50.4820 N, 30.4695 E.

## Айдентика (18.11.2026)
- `brand/` — логотип Ariadna у кривих (вордмарк, знак, іконки, фавікон), брендборд `ariadna-brandboard.html`, `apple-touch-icon.png` (180×180, з `ariadna-app-icon.svg`). `ariadna-wordmark-small-reverse.svg` — малий вордмарк для темного фону, перефарбований з `ariadna-wordmark-small.svg`.
- `fonts/` — Fixel Text 400/500/600/700 (MacPaw × AlfaBravo, SIL OFL 1.1, ліцензія в `fonts/OFL.txt`), урізаний до латиниці й української: `pyftsubset … --unicodes=U+0020-007E,U+00A0-00FF,U+02BC,U+0400-045F,U+0490-0491,U+2010-2027,U+2030-203A,U+2116,U+20B4,U+2190-2193,U+2212,U+2248,U+2264-2265,U+00D7`.
- Кольори: золото (`--thread`: #94702F світла, #CDAA62 темна) — лише нитка маршруту й усе, що до неї належить; акценти інтерфейсу (`--accent`) — графіт #222B31 на світлій темі, золото на темній.
