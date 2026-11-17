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
