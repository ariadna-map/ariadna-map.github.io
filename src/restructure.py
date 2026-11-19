import re
s=open('src_v31.html',encoding='utf8').read()
AFTER=[]   # заміни, що застосовуються до вже зібраної сторінки (разом із tail.js)
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:90],s.count(a)); s=s.replace(a,b)
def cut(a,b,new,keep_b=True):
    """replace text from marker a up to marker b"""
    global s
    i=s.index(a); j=s.index(b,i)
    s=s[:i]+new+(s[j:] if keep_b else s[j+len(b):])

# ---------- CSS ----------
cut("/* ---------- top: question pill ---------- */","/* ---------- map controls ---------- */",
r'''/* ---------- нижні кнопки «Куди» і «Звідки» та смужка з відповіддю ---------- */
.dock{position:absolute;z-index:32;left:max(12px,env(safe-area-inset-left));right:max(12px,env(safe-area-inset-right));bottom:max(12px,env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:8px;pointer-events:none}
.dock>*{pointer-events:auto}
.res{display:flex;align-items:center;gap:10px;border-radius:22px;padding:8px 8px 8px 16px;min-height:60px;cursor:pointer;animation:rise .45s cubic-bezier(.32,.72,0,1) both}
@keyframes rise{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}
.res .tx{flex:1;min-width:0}
.res b{display:block;font-size:18px;font-weight:700;letter-spacing:-.01em;font-variant-numeric:tabular-nums;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.res .s{display:flex;align-items:center;gap:3px;font-size:12.5px;color:var(--muted);white-space:nowrap;overflow:hidden}
.res .s span{min-width:0;overflow:hidden;text-overflow:ellipsis}
.res .s svg{width:13px;height:13px;flex:none;transition:transform .3s}
.res[aria-expanded=true] .s svg{transform:rotate(180deg)}
.res[aria-expanded=true],.dk[aria-expanded=true]{box-shadow:var(--shadow),inset 0 0 0 1.6px var(--thread)}
.dk-row{display:flex;gap:8px}
.dk{flex:1;min-width:0;display:flex;align-items:center;gap:8px;text-align:left;border-radius:22px;padding:9px 12px 9px 9px;min-height:58px;transition:transform .12s,box-shadow .2s}
.dk.to{flex:1.3}
.dk.frm{padding-right:10px}
@media (max-width:379px){.dk.to{flex:1.45;padding-right:10px}.dk .v{font-size:14px}.dk.empty .v{font-size:15px}.dk.to .ic{width:32px;height:32px;border-radius:11px}.dk.to .ic svg{width:18px;height:18px}.dk.frm .ic{display:none}.dk.frm{padding-left:14px}}
.dk.frm .v{font-size:14px}
.note a,.pk-note a{color:var(--accent);text-underline-offset:2px}
.dk .ic{width:36px;height:36px;flex:none;border-radius:13px;display:grid;place-items:center;background:var(--btn-sheen),var(--btn-glass);box-shadow:0 0 0 .5px var(--line);color:var(--thread)}
.dk .ic svg{width:20px;height:20px}
.dk .ic.sm{width:30px;height:30px;border-radius:10px;color:var(--muted)}
.dk .ic.sm svg{width:17px;height:17px}
.dk .ic.bus{background:#2f6db5;color:#fff;box-shadow:none}
.dk .ic.me{background:#2f7cf6;color:#fff;box-shadow:none}
.dk .tx{flex:1;min-width:0;display:flex;flex-direction:column}
.dk .c{font-size:11.5px;color:var(--muted);line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dk .v{font-size:15px;font-weight:600;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dk.empty .c{display:none}
.dk.empty .v{font-size:16px}
.dk.ask{box-shadow:var(--shadow),inset 0 0 0 1.6px var(--thread);animation:nudge 1.6s ease-in-out 2}
@keyframes nudge{0%,100%{transform:none}50%{transform:translateY(-3px)}}
.logo{width:42px;height:42px;flex:none;border-radius:14px;display:grid;place-items:center;background:var(--btn-sheen),var(--btn-glass);box-shadow:0 0 0 .5px var(--line)}
.logo svg{width:28px;height:28px}

''')
cut("/* ---------- picker ---------- */",".pk-body{",
r'''/* ---------- віконця ---------- */
.scrim{position:absolute;inset:0;z-index:25;background:rgba(10,14,16,.14);opacity:0;pointer-events:none;transition:opacity .3s}
body.popping .scrim{opacity:1;pointer-events:auto}
.pop{outline:none;position:absolute;z-index:30;left:max(12px,env(safe-area-inset-left));right:max(12px,env(safe-area-inset-right));
  bottom:calc(var(--dockh,70px) + max(12px,env(safe-area-inset-bottom)) + 10px);
  max-height:calc(100dvh - var(--dockh,70px) - max(12px,env(safe-area-inset-bottom)) - max(12px,env(safe-area-inset-top)) - 22px);
  border-radius:26px;display:flex;flex-direction:column;transform-origin:50% 100%;opacity:0;transform:translateY(14px) scale(.96);pointer-events:none;visibility:hidden;
  transition:opacity .22s ease-out,transform .42s cubic-bezier(.32,.72,0,1),visibility 0s .42s}
.pop.on{opacity:1;transform:none;pointer-events:auto;visibility:visible;transition:opacity .22s ease-out,transform .46s cubic-bezier(.32,.72,0,1),visibility 0s}
.pop.top{bottom:auto;top:calc(var(--vvt,0px) + max(12px,env(safe-area-inset-top)));max-height:calc(var(--vvh,100dvh) - max(12px,env(safe-area-inset-top)) - 12px);transform-origin:50% 0}
.brand{display:flex;align-items:center;gap:12px;margin:0 2px 14px}
.brand b{display:block;font-size:17px;font-weight:700;letter-spacing:.01em;line-height:1.2}
.brand small{display:block;font-size:12.5px;color:var(--muted)}
.srch{display:flex;align-items:center;gap:8px;margin:0 0 16px;padding:0 6px 0 14px;height:50px;border-radius:17px;background:var(--btn-in);box-shadow:inset 0 0 0 1px var(--line);cursor:text;transition:box-shadow .2s}
.srch>svg{width:19px;height:19px;flex:none;color:var(--muted)}
.srch input{flex:1;min-width:0;height:100%;border:0;background:none;outline:none;font:inherit;font-size:16px;color:var(--ink);-webkit-appearance:none;appearance:none}
.srch input::placeholder{color:var(--faint)}
.srch:focus-within{box-shadow:inset 0 0 0 1.6px var(--thread)}
.srch .x{width:38px;height:38px;border-radius:12px;display:none;place-items:center;color:var(--muted)}
.srch .x svg{width:18px;height:18px}
.srch.has .x{display:grid}
.found{display:flex;flex-direction:column;gap:6px}
.found button{display:flex;align-items:center;gap:12px;text-align:left;padding:9px 12px;border-radius:16px;background:var(--btn-in);min-height:54px;transition:transform .12s}
.found .n{width:36px;height:36px;flex:none;border-radius:12px;display:grid;place-items:center;background:var(--key-b);color:var(--key-t);font-weight:700;font-size:14.5px;font-variant-numeric:tabular-nums}
.found .n.g{background:var(--accent-soft);color:var(--accent)}
.found .n svg{width:19px;height:19px}
.found b{display:block;font-size:14.5px;font-weight:600;line-height:1.25}
.found small{display:block;font-size:12.5px;color:var(--muted);line-height:1.3}
.found .pk-note{margin:2px 4px 10px}
''')
cut("/* ---------- route sheet ---------- */",".head{display:flex;","/* ---------- вміст віконець ---------- */\n")
for ln in [".go-row{display:flex;gap:8px;align-items:center;margin-top:12px}\n",".dist{flex:1;min-width:0}\n",
           ".dist b{display:block;font-size:20px;font-weight:700;letter-spacing:-.01em;font-variant-numeric:tabular-nums;line-height:1.15}\n",
           ".dist span{font-size:12.5px;color:var(--muted)}\n"]:
    rep(ln,"")
rep(".gbtn:active,.tile:active,.num:active,.from button:active,.pill:active{transform:scale(.97)}",".gbtn:active,.tile:active,.num:active,.from button:active,.dk:active,.found button:active{transform:scale(.97)}")
rep(".toast{position:absolute;z-index:40;left:50%;top:calc(max(12px,env(safe-area-inset-top)) + 80px);",".toast{position:absolute;z-index:40;left:50%;top:max(12px,env(safe-area-inset-top));width:max-content;")
rep(".poi .hit{fill:transparent;pointer-events:all;cursor:pointer}",".hit{fill:transparent;stroke:none;pointer-events:all;cursor:pointer}")
rep(".legend{position:absolute;z-index:35;right:max(12px,env(safe-area-inset-right));width:min(300px,calc(100vw - 24px));border-radius:22px;padding:14px 16px;font-size:13.5px;",
    ".legend{position:absolute;z-index:35;right:max(12px,env(safe-area-inset-right));width:min(310px,calc(100vw - 24px));max-height:calc(100dvh - 24px);overflow:auto;border-radius:22px;padding:14px 16px;font-size:13.5px;")
cut("@media (min-width:900px){","@media (prefers-reduced-motion:reduce){",
'''@media (min-width:900px){
  .dock{left:16px;right:auto;width:400px;bottom:16px}
  .pop,.pop.top{left:16px;right:auto;width:400px;top:auto;bottom:calc(var(--dockh,70px) + 26px);max-height:calc(100dvh - var(--dockh,70px) - 42px);transform-origin:50% 100%}
  .ctl{right:16px}
}
''')

# ---------- HTML ----------
cut('<div class="top">','<div class="ctl" id="ctl">','')
rep('''  <p class="note" style="margin-top:10px">Колір будівель — колір дахів із супутникового знімка: так їх видно згори.</p>
</div>''','''  <p class="note" style="margin-top:10px">Колір будівель — колір дахів із супутникового знімка: так їх видно згори. Торкніться будівлі чи зупинки, щоб обрати; повторний дотик знімає вибір.</p>
  <p class="foot" style="margin-top:10px">Перелік корпусів і відділень — сайт лікарні (psychiatry-kyiv.itmed.org, 14.11.2026). Контури, доріжки, зупинки, маршрути транспорту — © учасники <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>, звірено із супутниковим знімком 15.11.2026. Час у дорозі приблизний. У невідкладному стані — 103.</p>
</div>''')
LOGO='<svg viewBox="0 0 32 32"><circle cx="15" cy="15" r="11" fill="var(--thread)"/><path d="M7 11c5 1 11 6 13 13M6 17c5 0 10 3 12 8M11 5c4 3 8 9 9 16M18 4c2 4 3 8 2 13" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".85"/><path d="M25 22c3 2 4 5 2 7" fill="none" stroke="var(--thread)" stroke-width="1.6" stroke-linecap="round"/></svg>'
SEARCH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>'
cut('<div class="scrim" id="scrim"></div>','<div class="toast glass"',
'''<div class="scrim" id="scrim"></div>

<section class="pop glass" id="pTo" tabindex="-1" role="dialog" aria-label="Куди вам потрібно?">
  <div class="pk-body">
    <div class="brand"><span class="logo" aria-hidden="true">'''+LOGO+'''</span><span><b>Ariadna</b><small>КНП «ПСИХІАТРІЯ» · Кирилівська, 103</small></span></div>
    <label class="srch" id="srch">'''+SEARCH+'''<input id="q" type="text" inputmode="search" enterkeyhint="search" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Номер, назва або корпус" aria-label="Пошук: номер відділення, назва або корпус"><button type="button" class="x" id="qx" aria-label="Очистити пошук"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></label>
    <div class="found" id="found" hidden></div>
    <div id="pkMain">
      <div class="pk-h">Найчастіше шукають</div>
      <div class="tiles" id="tiles"></div>
      <div class="pk-h">Відділення №</div>
      <div class="nums" id="nums"></div>
      <p class="pk-note">Не знаєте номера відділення? Оберіть «Приймальне відділення» — воно працює цілодобово, там підкажуть.<br>Можна також торкнутися будівлі на карті. Повторний дотик до обраної знімає вибір.</p>
    </div>
  </div>
</section>
<section class="pop glass" id="pFrom" tabindex="-1" role="dialog" aria-label="Звідки ви йдете?"><div class="pk-body" id="fromBody"></div></section>
<section class="pop glass" id="pDet" tabindex="-1" role="dialog" aria-label="Докладніше про маршрут"><div class="pk-body" id="detBody"></div></section>

<div class="dock" id="dock">
  <div class="res glass" id="res" role="button" tabindex="0" aria-haspopup="dialog" aria-expanded="false" aria-live="polite" hidden><div class="tx"><b id="resB"></b><span class="s" id="resS"></span></div><span id="resGo"></span></div>
  <div class="dk-row">
    <button type="button" class="dk to glass empty" id="bTo" aria-haspopup="dialog" aria-expanded="false"><span class="ic" aria-hidden="true">'''+SEARCH+'''</span><span class="tx"><span class="c" id="toC"></span><span class="v" id="toV">Куди вам?</span></span></button>
    <button type="button" class="dk frm glass" id="bFrom" aria-haspopup="dialog" aria-expanded="false"><span class="ic sm" id="fromI" aria-hidden="true"></span><span class="tx"><span class="c" id="fromC">Звідки</span><span class="v" id="fromV">Звідки?</span></span></button>
  </div>
</div>

''')

# ---------- data ----------
rep('name:"Лікарня ім. Павлова",','name:"Лікарня ім. Павлова",cap:"Від зупинки",short:"Павлова",')
rep('name:"Музей «Кирилівська церква»",','name:"Музей «Кирилівська церква»",cap:"Від зупинки",short:"Музей",')
rep('name:"вул. Кирилівська",','name:"вул. Кирилівська",cap:"Від зупинки",short:"Кирилівська",')
rep('name:"Ви біля стенда зі схемою",','name:"Ви біля стенда зі схемою",cap:"Звідки",short:"Від стенда",')
rep('{id:"pr",q:1,t:"Приймальне відділення",','{id:"pr",q:1,short:"Приймальне",kw:"приймальня приймальний покій госпіталізація",t:"Приймальне відділення",')
rep('{id:"pol",q:1,t:"Поліклініка",','{id:"pol",q:1,short:"Поліклініка",kw:"реєстратура консультація",t:"Поліклініка",')
rep('{id:"amb",q:1,t:"Амбулаторія № 1",','{id:"amb",q:1,short:"Амбулаторія № 1",t:"Амбулаторія № 1",')
rep('{id:"kab",q:1,t:"Кабінет амбулаторного прийому",','{id:"kab",q:1,short:"Кабінет прийому",t:"Кабінет амбулаторного прийому",')
rep('{id:"adm",q:1,t:"Адміністрація",','{id:"adm",q:1,short:"Адміністрація",kw:"директор дирекція головний лікар канцелярія",t:"Адміністрація",')
rep('n:"Патологічна анатомія",','n:"Патологічна анатомія",kw:"морг патанатомія",')
rep('n:"Харчоблок",','n:"Харчоблок",kw:"їдальня кухня",')

# ---------- JS: карта ----------
rep('''+'<text x="13" y="4">'+esc(s.name)+'</text>','data-e="'+e+'"'+(s.here?' data-here="1"':''))});''',
    '''+'<text x="13" y="4">'+esc(s.name)+'</text><circle class="hit" r="17" data-stop="'+e+'"/>','data-e="'+e+'"'+(s.here?' data-here="1"':''))});''')
cut("function insets(){","function clamp(v){",
'''function insets(){
  var s=size(),dr=document.getElementById("dock").getBoundingClientRect();
  return {t:14,b:Math.max(14,s.h-(dr.top-s.t)+10),l:14,r:70};
}
''')
cut('document.getElementById("loc").onclick=','document.getElementById("zfit").onclick=',
'''document.getElementById("loc").onclick=function(){
  if(GEO.pos&&!geoFar()){fitBox(GEO.pos[0]-90,GEO.pos[1]-90,GEO.pos[0]+90,GEO.pos[1]+90,0,600);if(st.start!=="geo"){st.start="geo";render(false)}return}
  if(GEO.pos&&geoFar()){say("Ви за ≈ "+fmtKm(geoFar())+" від лікарні",st.b>=0?"шлях від вас прокладе Google Карти — кнопка «Вести»":"оберіть, куди вам потрібно");return}
  geoStart();st.start="geo";render(false);if(!GEO.err)say("Визначаю, де ви…","дозвольте доступ до геопозиції")};
''')
rep('addEventListener("resize",function(){placeSheet();apply()});','addEventListener("resize",function(){dockH();apply()});')
rep('if(window.ResizeObserver)new ResizeObserver(function(){placeSheet();apply()}).observe(svg);','if(window.ResizeObserver)new ResizeObserver(function(){dockH();apply()}).observe(svg);')
rep('.stop.on rect{fill:var(--thread)}','.stop.on rect{fill:var(--thread);stroke-width:2.4}')

# ================= v5 (16.11.2026): позначки Андрія з роздруківок =================
# --- дані: двері, поверхи, сходи, обрив, ворота, статуя ---
rep('lab:[-4,119],door:[33.1,78.1],','lab:[-4,119],door:[27.5,73.2],')
rep('\nf 25,28 60,7\n','\nf 25,28 30,25\ns 30,25 52,12\nf 52,12 60,7\n')
rep('\nv -44,-1 -38,-1 26,4 60,7 72,8 93,10 101,11 136,16\n',
    '\nv -44,-1 -38,-1 26,4 60,7 67,7.6 72,8 93,10 101,11 136,16\nf 67,7.6 67.5,2.6\ns 67.5,2.6 73,-14\nf 73,-14 73,-32 71.5,-38\nf -68,91 -47,85 -44.4,82.1\nf -47,85 -41.5,91.9\n')
rep('var WALLS=["15.8,33.5 ','var WALLS=["44,119 4,131","15.8,33.5 ')
rep('var GATES=[[141.3,-192.4],','var GATES=[[-13,-167],[141.3,-192.4],')
rep(' {n:"Лаокоон і його сини",',' {n:"Статуя",d:"у внутрішньому дворі корпусу 1",x:-76.2,y:65.8,ic:"st"},\n {n:"Лаокоон і його сини",')
rep('var PRIV=','''/* галерея вздовж фасаду: відкрита під навісом верхнього поверху; a-b — фасад, w — глибина, двері — на внутрішній лінії */
var GALF=[{a:[21.2,38.2],b:[41.6,106.6],w:4}];
/* входи: p — двері, k — корпус, t — підпис на карті, a — бік підпису (r, l, t, b), n і d — назва й пояснення, w — як знайти */
var ENT={
 n:{k:"1",p:[-81.4,43.4],t:"7 · 15",a:"r",n:"Вхід до відділень 7 і 15",d:"двері в проході крізь корпус · 15 — 3 поверх, 7 — 2 поверх, ЕКОПФО — 1 поверх",w:"Двері — у наскрізному проході крізь північне крило корпусу; на карті це пунктирний канал."},
 v4:{k:"1",p:[-42.8,81.6],t:"4",a:"l",n:"Вхід до відділення 4",d:"двері з двору корпусу 1",w:"Двері — у дворі між крилами корпусу, у куті біля галереї."},
 lift:{k:"1",p:[-39.9,91.4],t:"Ліфт",a:"l",n:"Ліфт",d:"до відділень 7, 15 і 16 · двері з двору корпусу 1",w:"Двері ліфта — у дворі між крилами корпусу."},
 s:{k:"1",p:[4.3,109.6],t:"3 · 16 · 23 · 24",a:"l",n:"Вхід до відділень 3, 16, 23 і 24",d:"двері в проході крізь корпус · 16 і 24 — 3 поверх, 3 і 23 — 2 поверх",w:"Двері — у наскрізному проході крізь південне крило корпусу; на карті це пунктирний канал."},
 pnd:{k:"1",p:[-22.5,125.7],t:"ПНД",a:"b",n:"ПНД",d:"двері з південного боку корпусу 1",w:"Двері — з південного боку корпусу, з дороги."},
 w19:{k:"1",p:[-145.1,99.3],t:"19",a:"t",n:"Вхід до відділення 19",d:"двері із західного краю корпусу 1",w:"Двері — із західного краю корпусу."},
 arh:{k:"1",p:[21.7,53.8],t:"Архів",a:"r",n:"Архів",d:"двері в галереї під навісом",w:"Двері — у галереї під навісом уздовж корпусу."},
 prm:{k:"1",p:[25.3,65.7],t:"Приймальне · чол.",a:"r",n:"Приймальне — чоловічий блок",d:"двері в галереї під навісом",w:"Двері — у галереї під навісом уздовж корпусу."},
 prw:{k:"1",p:[29.7,80.6],t:"Приймальне · жін.",a:"r",n:"Приймальне — жіночий блок",d:"двері в галереї під навісом",w:"Двері — у галереї під навісом уздовж корпусу."},
 g4:{k:"1",p:[34.4,96.5],t:"",n:"Двері в галереї",d:"корпус 1"},
 k2:{k:"2",p:[69.3,-38],t:"6 · 9",a:"r",n:"Вхід до відділень 6 і 9",d:"двері зі східного торця корпусу 2",w:"Двері — зі східного торця корпусу; від дороги до них ведуть сходинки."},
 mkz:{k:"12",p:[127,-12],t:"Мала конференц-зала",a:"r",n:"Мала конференц-зала",d:"вхід зі східного боку корпусу 12",w:"Вхід — зі східного боку корпусу."}
};
var PRIV=''')
rep('k:"1",door:[33.1,78.1],note:"Працює цілодобово",tel:[EM]}','k:"1",door:[27.5,73.2],ents:["prm","prw"],way:"Вхід — із галереї під навісом уздовж корпусу. Двері чоловічого й жіночого блоків підписані на карті.",note:"Працює цілодобово",tel:[EM]}')
rep('{id:"3",k:"1",','{id:"3",k:"1",fl:2,ent:"s",')
rep('{id:"4",k:"1",','{id:"4",k:"1",ent:"v4",')
rep('{id:"6",k:"7",','{id:"6",k:"2",ent:"k2",')
rep('{id:"7",k:"1"}','{id:"7",k:"1",fl:2,ent:"n",lift:1}')
rep('{id:"9",k:null}','{id:"9",k:"2",ent:"k2"}')
rep('{id:"15",k:"1",d:"Психіатричної та паліативної допомоги",tel:["(044) 503-87-29","(044) 293-64-61"],door:[-42.8,81.6]}',
    '{id:"15",k:"1",fl:3,ent:"n",lift:1,d:"Психіатричної та паліативної допомоги",tel:["(044) 503-87-29","(044) 293-64-61"]}')
rep('{id:"16",k:"1",','{id:"16",k:"1",fl:3,ent:"s",lift:1,')
rep('tel:["(044) 293-85-36","(044) 293-64-63"],door:[-94.2,145]}','tel:["(044) 293-85-36","(044) 293-64-63"],ent:"w19"}')
rep('{id:"23",k:"1"},{id:"24",k:"1"}\n];','''{id:"23",k:"1",fl:2,ent:"s"},{id:"24",k:"1",fl:3,ent:"s"},
 /* x — не відділення з номером: шукаються текстом, у плитках і номерах їх немає */
 {id:"prm",x:1,t:"Приймальне — чоловічий блок",short:"Приймальне (чол.)",k:"1",ent:"prm",kw:"чоловіки",note:"працює цілодобово",tel:[EM]},
 {id:"prw",x:1,t:"Приймальне — жіночий блок",short:"Приймальне (жін.)",k:"1",ent:"prw",kw:"жінки",note:"працює цілодобово",tel:[EM]},
 {id:"arh",x:1,t:"Архів",k:"1",ent:"arh",note:"двері в галереї під навісом"},
 {id:"pnd",x:1,t:"ПНД",k:"1",ent:"pnd",kw:"диспансер",note:"двері з південного боку корпусу"},
 {id:"lift",x:1,t:"Ліфт корпусу 1",short:"Ліфт",k:"1",ent:"lift",note:"до відділень 7, 15 і 16"},
 {id:"mkz",x:1,t:"Мала конференц-зала",short:"Мала конф.-зала",k:"12",ent:"mkz",kw:"конференція зал",note:"вхід зі східного боку корпусу"}
];''')
rep('''  D.filter(function(d){return d.door}).forEach(function(d){var r=findRoute(STARTS.e1.at,d.door,false);console.log("dept "+d.id+" e1:"+(r?Math.round(r.len):"—"))});''',
    '''  D.forEach(function(d){var p=d.ent?ENT[d.ent].p:d.door;if(!p)return;var o=["dept "+d.id];["e1","e2","e3"].forEach(function(e){[false,true].forEach(function(ns){var q=ns&&d.lift?ENT.lift.p:p,r=findRoute(STARTS[e].at,q,ns);o.push(e+(ns?"-ns":"")+":"+(r?Math.round(r.len)+"/"+Math.round(Math.hypot(r.path[r.path.length-1][0]-q[0],r.path[r.path.length-1][1]-q[1])):"—"))})});console.log(o.join("  "))});''')
# --- малювання: фасадна галерея, двері ---
rep("""h+='<g id="route"></g>';""",
'''GALF.forEach(function(g){var dx=g.b[0]-g.a[0],dy=g.b[1]-g.a[1],L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,ix=-uy,iy=ux,w=g.w,A=[g.a[0]+ux*1.2,g.a[1]+uy*1.2],Z=[g.b[0]-ux*1.2,g.b[1]-uy*1.2];
  function off(p,o){return (p[0]+ix*o).toFixed(1)+","+(p[1]+iy*o).toFixed(1)}
  h+='<polyline class="gal-b" style="stroke-width:'+(w+.6)+'" points="'+off(A,w/2-.3)+" "+off(Z,w/2-.3)+'"/>';
  h+='<polyline class="gal-d" points="'+off(A,0)+" "+off(Z,0)+'"/><polyline class="gal-d" points="'+off(A,w)+" "+off(Z,w)+'"/>'});
h+='<g id="route"></g>';''')
rep('''B.forEach(function(b,i){if(!b.k||!b.lab)return;h+=lbl("badge"''',
'''Object.keys(ENT).forEach(function(id){var e=ENT[id],a=e.a||"r",tx=a==="l"?-8:a==="r"?8:0,ty=a==="t"?-8:a==="b"?15:3.7,an=a==="l"?"end":a==="r"?"start":"middle";
  h+=lbl("door sec",e.p[0],e.p[1],0,'<circle class="dr" r="3.6"/>'+(e.t?'<text x="'+tx+'" y="'+ty+'" text-anchor="'+an+'">'+esc(e.t)+'</text>':'')+'<circle class="hit" r="11" data-ent="'+id+'"/>','data-en="'+id+'"')});
B.forEach(function(b,i){if(!b.k||!b.lab)return;h+=lbl("badge"''')
# --- CSS ---
rep('#map.mid .poi text{display:none}\n','''#map.mid .poi text{display:none}
.door .dr{fill:var(--key-b);stroke:var(--key-t);stroke-width:1.5}
.door text{font-size:10.5px;font-weight:600}
.door.on .dr{fill:var(--thread);stroke:#fff}
#map.mid .door:not(.on) text{display:none}
#map.far .door.on{display:inline}
''')
rep('.brand{display:flex;align-items:center;gap:12px;margin:0 2px 14px}','''.brand{display:flex;align-items:center;gap:12px;margin:0 2px 14px;padding-right:46px}
.pclose{position:absolute;z-index:4;top:12px;right:12px;width:42px;height:42px;border-radius:14px;display:grid;place-items:center;color:var(--muted);background:var(--btn-sheen),var(--btn-glass);box-shadow:0 0 0 .5px var(--line);transition:transform .12s}
.pclose:active{transform:scale(.94)}
.pclose svg{width:19px;height:19px}
.way b{color:var(--ink);font-weight:700}''')
# --- HTML: хрестик у віконці «Куди», легенда ---
rep('''<section class="pop glass" id="pTo" tabindex="-1" role="dialog" aria-label="Куди вам потрібно?">
  <div class="pk-body">''','''<section class="pop glass" id="pTo" tabindex="-1" role="dialog" aria-label="Куди вам потрібно?">
  <button type="button" class="pclose" id="pToX" aria-label="Закрити"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
  <div class="pk-body">''')
rep('''stroke-width="1.2"/></svg>брама</li>''','''stroke-width="1.2"/></svg>брама</li>
    <li><svg viewBox="0 0 30 16"><circle cx="15" cy="8" r="3.8" fill="var(--key-b)" stroke="var(--key-t)" stroke-width="1.5"/></svg>двері, вхід до відділення</li>
    <li><svg viewBox="0 0 30 16"><path d="M2 6h26" stroke="var(--wall)" stroke-width="1.4"/><path d="M4 6v4.5M8 6v4.5M12 6v4.5M16 6v4.5M20 6v4.5M24 6v4.5" stroke="var(--wall)" stroke-width="1"/></svg>обрив, підпірна стіна</li>''')
rep('<p class="foot" style="margin-top:10px">Перелік корпусів і відділень — сайт лікарні (psychiatry-kyiv.itmed.org, 14.11.2026).','<p class="foot" style="margin-top:10px">Перелік корпусів і відділень — сайт лікарні (psychiatry-kyiv.itmed.org, 14.11.2026). Двері відділень, поверхи, сходи й галерею уточнено на місці 16.11.2026.')

# ================= v6 (16.11.2026): переїзд 6 і 9, ЕКОПФО, темна тема «Сланець», ворота, входи, доріжки =================
rep('{id:"6",k:"2",ent:"k2",d:"Лікувально-діагностичне",','{id:"6",k:"2",ent:"k2",note:"переїхало з корпусу 7: старі корпуси закривають на капітальний ремонт",d:"Лікувально-діагностичне",')
rep('{id:"9",k:"2",ent:"k2"}','{id:"9",k:"2",ent:"k2",note:"переїхало в корпус 2: старі корпуси закривають на капітальний ремонт"}')
rep('{k:"7",lv:2,key:1,r:"r-terra",','{k:"7",lv:2,key:1,r:"r-terra",nt:"Відділення 6 переїхало в корпус 2",')
rep(' {id:"lift",x:1,',' {id:"ekopfo",x:1,t:"ЕКОПФО",short:"ЕКОПФО",full:"ЕКОПФО — експертна команда з оцінювання повсякденного функціонування особи",k:"1",fl:1,ent:"n",kw:"експертна команда оцінювання повсякденного функціонування особи мсек інвалідність",note:"вхід той самий, що до відділень 7 і 15"},\n {id:"lift",x:1,')
rep('n:{k:"1",p:[-81.4,43.4],t:"7 · 15",a:"r",n:"Вхід до відділень 7 і 15",','n:{k:"1",p:[-81.4,43.4],t:"7 · 15 · ЕКОПФО",a:"r",n:"Вхід до відділень 7, 15 і ЕКОПФО",')
rep('<meta name="theme-color" content="#0e1316" media="(prefers-color-scheme: dark)">','<meta name="theme-color" content="#323c44" media="(prefers-color-scheme: dark)">')
SLATE='--bg:#323c44;--land:#343e46;--terr:#3e4951;--terr-edge:#56636c;--park:#33493c;--park-edge:#3e5848;--road:#58656f;--road-edge:#343e46;--path:#88959d;--steps:#a8b3b9;--ctx:#404a52;--ctx-edge:#4b565e;--r-grey:#7a858d;--r-graph:#606a72;--r-blue:#7a8b98;--r-terra:#9e6f5f;--r-green:#5a8a6e;--r-dgreen:#477059;--r-sage:#738679;--r-white:#8c897e;--glass-tint:rgba(56,65,73,.6);--glass-glow:rgba(255,255,255,.11);--contour:#6c6652;--hach:#887b64;--label-halo:rgba(52,62,70,.9);--b-edge:rgba(0,0,0,.38);--relief:.45'
i=s.index('@media (prefers-color-scheme:dark){:root{');j=s.index('}}',i)
s=s[:j]+';\n  /* «Сланець» (обрано 16.11.2026) */\n  '+SLATE+'\n'+s[j:]
s=s[:j]+';--lawn:#31473a;--lawn-edge:#3a5244;--gate:#d8cab2'+s[j:]
# --- газони (з супутникового знімка), суцільні доріжки ---
rep('--path:#b5bcb6; --steps:#8d958f;','--path:#b5bcb6; --steps:#8d958f; --lawn:#d4e5c6; --lawn-edge:#c4dab4; --gate:#5d4c3c;')
rep('.fw{fill:none;stroke:var(--path);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:3 2.4}',
    '.lawn{fill:var(--lawn);stroke:var(--lawn-edge);stroke-width:.5;stroke-linejoin:round}\n.fw-e{fill:none;stroke:var(--road-edge);stroke-width:3.9;stroke-linecap:round;stroke-linejoin:round}\n.fw{fill:none;stroke:var(--road);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}\n.stp-b{fill:none;stroke:var(--road);stroke-width:3.6}')
rep('.terr{fill:var(--terr);stroke:var(--terr-edge);','.terr{fill:var(--lawn);stroke:var(--terr-edge);')
rep('''var rd="",rde="",fw="",stp="";''','''var rd="",rde="",fw="",fwe="",stp="",stb="";''')
rep('''  else if(c==="s")stp+='<polyline class="stp" points="'+p+'"/>'; else fw+='<polyline class="fw" points="'+p+'"/>'});
h+=rde+rd+fw+stp;''','''  else if(c==="s"){stb+='<polyline class="stp-b" points="'+p+'"/>';stp+='<polyline class="stp" points="'+p+'"/>'}
  else{fwe+='<polyline class="fw-e" points="'+p+'"/>';fw+='<polyline class="fw" points="'+p+'"/>'}});
h+=rde+fwe+rd+fw+stb+stp;''')
# --- брами: брус поперек дороги зі стовпчиками, у метрах карти ---
rep('''GATES.forEach(function(g){h+=lbl("gate",g[0],g[1],0,'<rect x="-3.5" y="-3.5" width="7" height="7" rx="1.8"/>')});''',
'''GATES.forEach(function(g){var best=null;WAYS.split("\\n").forEach(function(line){var sp=line.indexOf(" "),c=line.charAt(0),p=pts(line.slice(sp+1));
    for(var i=1;i<p.length;i++){var a=p[i-1],b=p[i],dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((g[0]-a[0])*dx+(g[1]-a[1])*dy)/L2)),d=Math.hypot(a[0]+dx*t-g[0],a[1]+dy*t-g[1]);
      if(!best||d<best.d)best={d:d,u:[dx/Math.sqrt(L2),dy/Math.sqrt(L2)],road:c==="v"}}});
  var u=best&&best.d<12?best.u:[1,0],n=[-u[1],u[0]],L=best&&best.road?5.4:2.9,A=[g[0]-n[0]*L,g[1]-n[1]*L],Z=[g[0]+n[0]*L,g[1]+n[1]*L];
  h+='<g class="gate"><line class="gate-b" x1="'+A[0].toFixed(1)+'" y1="'+A[1].toFixed(1)+'" x2="'+Z[0].toFixed(1)+'" y2="'+Z[1].toFixed(1)+'"/><circle class="gate-p" cx="'+A[0].toFixed(1)+'" cy="'+A[1].toFixed(1)+'" r="1.15"/><circle class="gate-p" cx="'+Z[0].toFixed(1)+'" cy="'+Z[1].toFixed(1)+'" r="1.15"/></g>'});''')
rep('.gate rect{fill:var(--terr);stroke:var(--steps);stroke-width:1.2}','.gate-b{stroke:var(--gate);stroke-width:1.3}\n.gate-p{fill:var(--gate)}')
rep('#map.far .lb.sec,#map.far .poi text,#map.far .stop text,#map.far .gate{display:none}','#map.far .lb.sec,#map.far .poi text,#map.far .stop text{display:none}')
# --- входи: значок «вхід» (стрілка заходить у двері) замість крапки; головні входи інших корпусів з OpenStreetMap ---
rep('var PRIV=','''B.forEach(function(b){if(!b.k||b.k==="1"||!b.door)return;
  if(Object.keys(ENT).some(function(id){var p=ENT[id].p;return Math.hypot(p[0]-b.door[0],p[1]-b.door[1])<4}))return;
  ENT["b"+b.k]={k:b.k,p:b.door,t:"",n:"Вхід до корпусу "+b.k,d:b.n||"головний вхід"}});
var PRIV=''')
ENTG='<circle class="dr" r="6.4"/><path class="dg" d="M.6-3.7h2.9v7.4H.6M-3.9 0h4.6M-.9-2.3 1.4 0l-2.3 2.3"/>'
rep('''h+=lbl("door sec",e.p[0],e.p[1],0,'<circle class="dr" r="3.6"/>'+(e.t?'<text x="'+tx+'" y="'+ty+'" text-anchor="'+an+'">\'''',
    '''h+=lbl("door sec",e.p[0],e.p[1],0,\''''+ENTG+''''+(e.t?'<text x="'+tx+'" y="'+ty+'" text-anchor="'+an+'">\'''')
rep('var e=ENT[id],a=e.a||"r",tx=a==="l"?-8:a==="r"?8:0,ty=a==="t"?-8:a==="b"?15:3.7,','var e=ENT[id],a=e.a||"r",tx=a==="l"?-10:a==="r"?10:0,ty=a==="t"?-10:a==="b"?17:3.7,')
rep('.door .dr{fill:var(--key-b);stroke:var(--key-t);stroke-width:1.5}','.door .dr{fill:var(--key-b);stroke:var(--key-t);stroke-width:1.4}\n.door .dg{fill:none;stroke:var(--key-t);stroke-width:1.35;stroke-linecap:round;stroke-linejoin:round}')
rep('.door.on .dr{fill:var(--thread);stroke:#fff}','.door.on .dr{fill:var(--thread);stroke:#fff}\n.door.on .dg{stroke:#fff}')
# --- легенда ---
rep('''<li><svg viewBox="0 0 30 16"><path d="M2 8h26" stroke="var(--path)" stroke-width="1.6" stroke-dasharray="3 2.4"/></svg>пішохідна доріжка</li>''',
    '''<li><svg viewBox="0 0 30 16"><rect x="1" y="2" width="28" height="12" rx="3" fill="var(--lawn)"/><path d="M2 8h26" stroke="var(--road-edge)" stroke-width="4.4"/><path d="M2 8h26" stroke="var(--road)" stroke-width="2.8"/></svg>пішохідна доріжка, тротуар</li>
    <li><svg viewBox="0 0 30 16"><rect x="2" y="2" width="26" height="12" rx="5" fill="var(--lawn)" stroke="var(--lawn-edge)"/></svg>газон, дерева, кущі</li>''')
rep('''<li><svg viewBox="0 0 30 16"><path d="M2 8h26" stroke="var(--steps)" stroke-width="3.4" stroke-dasharray="1 1.3"/></svg>сходи</li>''',
    '''<li><svg viewBox="0 0 30 16"><path d="M2 8h26" stroke="var(--road)" stroke-width="3.6"/><path d="M2 8h26" stroke="var(--steps)" stroke-width="3.4" stroke-dasharray="1 1.3"/></svg>сходи</li>''')
rep('''<li><svg viewBox="0 0 30 16"><rect x="11" y="4" width="8" height="8" rx="2" fill="var(--terr)" stroke="var(--steps)" stroke-width="1.2"/></svg>брама</li>''',
    '''<li><svg viewBox="0 0 30 16"><path d="M2 8h26" stroke="var(--road-edge)" stroke-width="8"/><path d="M2 8h26" stroke="var(--road)" stroke-width="6"/><path d="M15 2v12" stroke="var(--gate)" stroke-width="1.8"/><circle cx="15" cy="2" r="1.7" fill="var(--gate)"/><circle cx="15" cy="14" r="1.7" fill="var(--gate)"/></svg>брама, ворота</li>''')
rep('''<li><svg viewBox="0 0 30 16"><circle cx="15" cy="8" r="3.8" fill="var(--key-b)" stroke="var(--key-t)" stroke-width="1.5"/></svg>двері, вхід до відділення</li>''',
    '''<li><svg viewBox="-15 -8 30 16"><circle r="6.6" fill="var(--key-b)" stroke="var(--key-t)" stroke-width="1.3"/><path d="M.6-3.7h2.9v7.4H.6M-3.9 0h4.6M-.9-2.3 1.4 0l-2.3 2.3" fill="none" stroke="var(--key-t)" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>вхід (двері) до корпусу чи відділення</li>''')
# ================= v7 (16.11.2026): значок входу «шпилька»; газон на всій території, крім доріг =================
cut('Object.keys(ENT).forEach(function(id){var e=ENT[id],a=e.a||"r"','B.forEach(function(b,i){if(!b.k||!b.lab)return;h+=lbl("badge"',open('v7_doors.js',encoding='utf8').read())
rep('<li><svg viewBox="-15 -8 30 16"><circle r="6.6" fill="var(--key-b)" stroke="var(--key-t)" stroke-width="1.3"/><path d="M.6-3.7h2.9v7.4H.6M-3.9 0h4.6M-.9-2.3 1.4 0l-2.3 2.3"',
    '<li><svg viewBox="-15 -8 30 16"><path d="M0 0-6.2-3.6A7.2 7.2 0 1 0-6.2 3.6Z" transform="translate(9 0)" fill="var(--key-b)" stroke="var(--key-t)" stroke-width="1.3"/><path transform="translate(-3.4 0)" d="M.6-3.7h2.9v7.4H.6M-3.9 0h4.6M-.9-2.3 1.4 0l-2.3 2.3"')
# двері в наскрізних проходах: шпилька заходить у прохід з дороги
rep('n:{k:"1",p:[-81.4,43.4],','n:{k:"1",dir:55,ta:"t",p:[-81.4,43.4],')
rep('s:{k:"1",p:[4.3,109.6],','s:{k:"1",dir:-121,p:[4.3,109.6],')
# вхід корпусу 11 стоїть на одній лінії з підписом «Приймальне · жін.»: кружечок — вище, підпис лягає поверх хвостика
rep('  ENT["b"+b.k]={k:b.k,p:b.door,t:"",n:"Вхід до корпусу "+b.k,d:b.n||"головний вхід"}});','  ENT["b"+b.k]={k:b.k,p:b.door,t:"",n:"Вхід до корпусу "+b.k,d:b.n||"головний вхід"}});\nif(ENT.b11)ENT.b11.dir=60;')
# ================= v8 (16.11.2026): світла палітра «Чіткий» =================
CHITKYI='--bg:#e8eae4;--land:#e8eae4;--lawn:#b9d7a0;--lawn-edge:#9fc685;--park:#c4dcae;--park-edge:#a9cb8f;--road:#ffffff;--road-edge:#99a39b;--terr-edge:#76847a;--ctx:#d7dad3;--ctx-edge:#b9bdb5;--r-grey:#a8afb3;--r-graph:#7c848a;--r-blue:#a2b4c2;--r-terra:#c8876f;--r-green:#8cb999;--r-dgreen:#5c8d6f;--r-sage:#9fb19f;--b-edge:rgba(16,20,24,.6);--label:#0d1012;--major:#f3d97c;--major-edge:#cdb056;--steps:#5f6862;--wall:#6f5e48;--gate:#3d3026'
rep('  color-scheme:light;','  /* «Чіткий» (обрано 16.11.2026): контрастніші газон, доріжки й корпуси — карту читають надворі, на сонці */\n  '+CHITKYI+';\n  color-scheme:light;')
rep('<meta name="theme-color" content="#eef0ea" media="(prefers-color-scheme: light)">','<meta name="theme-color" content="#e8eae4" media="(prefers-color-scheme: light)">')
# ================= v9 (17.11.2026): темна тема «Графіт»; карту можна наблизити ще в 1,5 раза =================
GRAPHITE='--bg:#222b31;--land:#232c32;--terr:#2c363d;--terr-edge:#46535b;--park:#26392e;--park-edge:#30473a;--road:#46535c;--road-edge:#232c32;--path:#74828a;--steps:#95a2a9;--ctx:#2f3940;--ctx-edge:#3a454d;--r-grey:#65717a;--r-graph:#4f5961;--r-blue:#677887;--r-terra:#8a5d4f;--r-green:#4a765d;--r-dgreen:#3a5d4b;--r-sage:#617366;--r-white:#7a776c;--glass-tint:rgba(44,52,59,.62);--contour:#5c5745;--hach:#776a56;--label-halo:rgba(35,44,50,.9);--relief:.6'
rep('/* «Сланець» (обрано 16.11.2026) */\n  '+SLATE,'/* «Графіт» (обрано 17.11.2026; до того був «Сланець») */\n  '+GRAPHITE)
rep(';--lawn:#31473a;--lawn-edge:#3a5244;--gate:#d8cab2',';--lawn:#24372c;--lawn-edge:#2d4235;--gate:#d8cab2')
rep('<meta name="theme-color" content="#323c44" media="(prefers-color-scheme: dark)">','<meta name="theme-color" content="#222b31" media="(prefers-color-scheme: dark)">')
# зум: пальцями чи коліщатком тепер можна наблизити до 73 м по ширині екрана (було 110 м, тобто в 1,5 раза ближче);
# автоматичне наближення до маршруту чи відділення лишається як було (WFIT=110), щоб картинка після вибору не змінилась
rep('WMIN=110, WMAX=1250;','WMIN=73, WFIT=110, WMAX=1250;')
rep('(y1-y0+2*pad)/ah,WMIN/s.w);','(y1-y0+2*pad)/ah,WFIT/s.w);')
# ================= v10 (17.11.2026): позначки Андрія на роздруківці корпусу 1 + єдиний вхід корпусу 8 =================
# --- відділення: поверхи й двері ---
rep('{id:"4",k:"1",ent:"v4",','{id:"4",k:"1",fl:1,ent:"v4",')
rep('{id:"7",k:"1",fl:2,ent:"n",lift:1},{id:"8",k:"8"},','{id:"7",k:"1",fl:2,ent:"n",lift:1},{id:"8",k:"8",ent:"k8"},')
rep('{id:"10",k:"8"},','{id:"10",k:"8",ent:"k8"},')
rep('{id:"18",k:"1",d:"Геронтологічне",','{id:"18",k:"1",fl:3,ent:"w19",d:"Геронтологічне",')
rep('{id:"19",k:"1",d:"Для хворих на епілепсію",','{id:"19",k:"1",fl:"1–2",d:"Для хворих на епілепсію",')
rep('{id:"20",k:"1"}','{id:"20",k:"1",fl:3,ent:"w19"}')
rep('{id:"pnd",x:1,t:"ПНД",k:"1",ent:"pnd",','{id:"pnd",x:1,t:"ПНД",k:"1",fl:1,ent:"pnd",')
rep(' w19:{k:"1",p:[-145.1,99.3],t:"19",a:"t",n:"Вхід до відділення 19",d:"двері із західного краю корпусу 1",w:"Двері — із західного краю корпусу."},',
    ' w19:{k:"1",p:[-145.1,99.3],t:"19 · 18 · 20",a:"t",n:"Вхід до відділень 19, 18 і 20",d:"двері із західного краю корпусу 1 · 19 — 1–2 поверхи, 18 і 20 — 3 поверх",w:"Двері — із західного краю корпусу."},')
rep('pnd:{k:"1",p:[-22.5,125.7],t:"ПНД",a:"b",n:"ПНД",d:"двері з південного боку корпусу 1",','pnd:{k:"1",p:[-22.5,125.7],t:"ПНД",a:"b",n:"ПНД",d:"двері з південного боку корпусу 1 · 1 поверх",')
rep(' mkz:{k:"12",',' k8:{k:"8",p:[220.5,-225.3],t:"8 · 10",a:"l",n:"Вхід до відділень 8 і 10",d:"єдиний вхід у корпус 8",w:"Це єдині двері корпусу 8: через них і до 8-го, і до 10-го відділення."},\n mkz:{k:"12",')
# --- Лаокоон стоїть південніше, у центрі підковоподібної доріжки ---
rep('{n:"Лаокоон і його сини",d:"копія античної скульптури, встановлена 2025 року",x:-136,y:71,ic:"st"}','{n:"Лаокоон і його сини",d:"копія античної скульптури, встановлена 2025 року",x:-130.8,y:82,ic:"st"}')
# --- доріжки й сходинки ---
rep('f -101,81 -88,77\n','''s -101,81 -97,79.8
f -97,79.8 -88,77
f -138.8,91.8 -139,84 -137.2,77.8 -133.6,74.5 -128,74.5 -124.4,77.8 -122.8,83 -123,87.3
f -56.3,66.6 -55,78.4
f -46.5,97.9 -45.2,108.1
f -34,27.6 -29.5,42 -22.5,78 -18.5,103
''')
# --- частини корпусу 1, які займають відділення; асфальт, схили, лавки, бесідки ---
rep('var SCULPT=[','''/* частини корпусу, які займають відділення (обведено на роздруківці 17.11.2026): ids — відділення, поверхи — у D */
var AREAS={
 n:{ids:["4","7","15"],p:"-79.5,37.2 -45.3,26.9 -31.5,72.8 -44.6,75.5 -54.4,42.6 -79.5,50.2"},
 s:{ids:["16","3","amb"],p:"-43.4,79.7 -30.2,77.2 -27.1,87.6 -20,111.5 -4.5,106.9 -2,119.6 -18.6,124.5 -29,127.7 -39.9,91.4 -42.8,81.6"},
 e:{ids:["23","24","pr","prm","prw","arh"],p:"1.6,44.1 21.2,38.2 33.1,78.1 41.6,106.6 34.7,108.6 8.5,116.5 5,104.1 18.3,100.1 8.1,65.8 6.8,61.4 5.2,56.1"},
 w:{ids:["19","18","20"],p:"-151.6,101.2 -145.1,99.3 -138.6,97.3 -137.1,102.5 -136,106.2 -125.6,140.9 -86.3,129.2 -73.9,125.5 -70.2,137.8 -94.2,145 -134.9,157.1"}
};
function areaOf(id){for(var k in AREAS)if(AREAS[k].ids.indexOf(id)>=0)return AREAS[k];return null}
/* заасфальтовані майданчики (решта території — газон) */
var PAVE=["-83.9,91.8 -69.2,87.4 -68,91 -72,95 -59,139 -70.2,144.3 -70.2,137.8",
 "-69.2,87.4 -43.4,79.7 -42.8,81.6 -39.9,91.4 -38.1,97.4 -45.6,97.6 -65.2,103.5 -69.6,104 -72,95 -68,91",
 "-38.1,97.4 -29,127.7 -32,128.6 -41,98.3",
 "-22.7,31 -18,32 -7,43 -6,60.5 -15.7,60.4",
 "-7,43 -2,42 1.6,44.1 5.2,56.1 6.8,61.4 8.1,65.8 18.3,100.1 5,104.1 -5,70 -6,65"];
/* схили: a — напрямок горизонталі, штрихи йдуть униз по схилу */
var SLOPES=[{a:-15.4,p:"-151.2,41.6 -32.2,8.8 -30.7,12.5 -47,24 -86,35 -151,53.7"},
 {a:18.7,p:"-30.7,12.5 13.8,27.6 15.8,33.5 19,37 -2,42 -7,43 -18,32 -47,24"},
 {a:73.3,p:"-44.5,29.5 -31.5,72.8 -27.1,87.6 -24.9,95 -21.1,93.9 -23.3,86.5 -27.7,71.7 -40.7,28.4"}];
/* сходинки всередині наскрізного проходу (малюються поверх корпусу) */
var STEPS_IN=["-101,81 -97,79.8"];
var BENCH=[[-140.6,83.5],[-121.3,79.5]];
var GAZEBO=[[-56.2,64.2],[-44.4,110.4]];
var SCULPT=[''')
rep('var rd="",rde="",fw="",fwe="",stp="",stb="";','''PAVE.forEach(function(p){h+='<polygon class="pave" points="'+p+'"/>'});
SLOPES.forEach(function(sl,i){h+='<pattern id="slp'+i+'" width="2.6" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate('+sl.a+')"><path class="slp-t" d="M1.3 .5v1.3"/></pattern><polygon class="slope" fill="url(#slp'+i+')" points="'+sl.p+'"/>'});
var rd="",rde="",fw="",fwe="",stp="",stb="";''')
rep('h+=rde+fwe+rd+fw+stb+stp;','''h+=rde+fwe+rd+fw+stb+stp;
BENCH.forEach(function(b){h+='<rect class="bench" x="'+(b[0]-.4)+'" y="'+(b[1]-1.2)+'" width=".8" height="2.4" rx=".2"><title>Лавка</title></rect>'});
GAZEBO.forEach(function(g){h+='<g class="gz"><circle cx="'+g[0]+'" cy="'+g[1]+'" r="2.3"/><circle class="gz-c" cx="'+g[0]+'" cy="'+g[1]+'" r=".55"/><title>Бесідка</title></g>'});''')
rep("h+=bb;\n","h+=bb;\nh+='<g id=\"darea\"></g>';\n")
rep("h+='<g id=\"route\"></g>';","STEPS_IN.forEach(function(p){h+='<polyline class=\"stp-b\" points=\"'+p+'\"/><polyline class=\"stp\" points=\"'+p+'\"/>'});\nh+='<g id=\"route\"></g>';")
rep('.b.on{stroke:var(--thread);stroke-width:2.2}','''.b.on{stroke:var(--thread);stroke-width:2.2}
.pave{fill:var(--road);stroke:var(--road-edge);stroke-width:.3;pointer-events:none}
.slope{pointer-events:none}.slp-t{fill:none;stroke:var(--hach);stroke-width:.3;stroke-linecap:round;opacity:.8}
.bench{fill:var(--wall);pointer-events:none}
.gz circle{fill:var(--r-white);stroke:var(--b-edge);stroke-width:.35}.gz .gz-c{fill:var(--b-edge);stroke:none}
.dar{fill:var(--thread);fill-opacity:.3;stroke:var(--thread);stroke-width:2.2;stroke-linejoin:round;pointer-events:none}.dar-g{fill:none;stroke:var(--thread);stroke-width:7;opacity:.22;stroke-linejoin:round;pointer-events:none}''')
# ================= v12 (17.11.2026): корпус 5 — один вхід «1 · 2»; ПНД = Правобережна амбулаторія № 1; без відділення 11;
#                   тонша нитка; впізнавані значки лавок, бесідок, скульптур і пам'ятників; сходинки на північ від галереї
rep('{id:"10",k:"8",ent:"k8"},{id:"11",k:"2"},','{id:"10",k:"8",ent:"k8"},')   # відділення 11 у лікарні більше немає
rep('{id:"1",k:"5",d:','{id:"1",k:"5",ent:"k5",d:')
rep('{id:"2",k:"5",d:','{id:"2",k:"5",ent:"k5",d:')
rep(' mkz:{k:"12",',' k5:{k:"5",p:[73.8,-114.1],t:"1 · 2",a:"l",n:"Вхід до відділень 1 і 2",d:"один вхід для обох відділень",w:"Через ці двері — і до 1-го, і до 2-го відділення."},\n mkz:{k:"12",')
rep('{id:"pnd",x:1,t:"ПНД",k:"1",fl:1,ent:"pnd",kw:"диспансер",note:"двері з південного боку корпусу"},','')
rep('{id:"amb",q:1,short:"Амбулаторія № 1",t:"Амбулаторія № 1",sub:"Правобережна",ic:"door",full:"Правобережна психіатрична амбулаторія № 1",k:"11",note:"Пн–Пт 09:00–16:12",tel:["(044) 503-87-80","(095) 687-25-90"]},',
    '{id:"amb",q:1,short:"Амбулаторія № 1",t:"Амбулаторія № 1",sub:"Правобережна",ic:"door",full:"Правобережна психіатрична амбулаторія № 1",k:"1",fl:1,ent:"pnd",kw:"ПНД диспансер реєстратура амбулаторія",note:"реєстратура: Пн–Пт 09:00–16:12, Сб і Нд — вихідні",tel:["(044) 503-87-80","(095) 687-25-90"]},')
rep(' pnd:{k:"1",p:[-22.5,125.7],t:"ПНД",a:"b",n:"ПНД",d:"двері з південного боку корпусу 1 · 1 поверх",',
    ' pnd:{k:"1",p:[-22.5,125.7],t:"Амбулаторія № 1",a:"b",n:"Правобережна психіатрична амбулаторія № 1",d:"двері з південного боку корпусу 1 · 1 поверх · реєстратура Пн–Пт 09:00–16:12",')
# сходинки: зі старих сходів спускаєшся на галерею, ліворуч — сходи на північ до дороги
rep('f 19,37 26,34\n','f 19,37 26,34\ns 19,36.5 19.4,28.4\nf 19.4,28.4 25,28\n')
# нитка маршруту: тонка й напівпрозора, однакової товщини на екрані за будь-якого наближення (щоб під нею було видно сходи й дорогу)
rep('.route.case{stroke:var(--case);stroke-width:8.2;opacity:.95}','.route.case{stroke:var(--case);stroke-width:var(--rw-case,5);opacity:.5}')
rep('.route.halo{stroke:var(--thread-soft);stroke-width:15}','.route.halo{stroke:var(--thread-soft);stroke-width:var(--rw-halo,11)}')
rep('.route.main{stroke:var(--thread);stroke-width:4.6}','.route.main{stroke:var(--thread);stroke-width:var(--rw-main,2.8);opacity:.82}')
rep('.route.flow{stroke:rgba(255,255,255,.85);stroke-width:1.6;','.route.flow{stroke:rgba(255,255,255,.9);stroke-width:var(--rw-flow,1);')
rep('.route.last{stroke:var(--thread);stroke-width:2.6;stroke-dasharray:2 5}','.route.last{stroke:var(--thread);stroke-width:var(--rw-last,1.8);stroke-dasharray:2 5;opacity:.85}')
rep('var s=size(),k=vb.w/s.w;svg.classList.toggle("far",k>1.5);','var s=size(),k=vb.w/s.w;[["halo",11],["case",5],["main",2.8],["flow",1],["last",1.8]].forEach(function(r){svg.style.setProperty("--rw-"+r[0],(r[1]*k).toFixed(3))});svg.classList.toggle("far",k>1.5);')
# значки заливкою, щоб читалися з першого погляду: скульптура — фігура на постаменті, погруддя, стела, хрест; лавка; бесідка
rep("""st:'<path d="M0-4.6v.1M-1.8-2.2h3.6M0-2.2v4.8M-1.6 2.8h3.2"/>',""","""st:'<circle class="f" cy="-3.9" r="1.15"/><path class="f" d="M-1.7-2.5h3.4l-.45 3H.55V1.7h-1.1V.5h-.7z"/><path class="f" d="M-3 1.9h6v.9h-.6v1.3h.6v.9h-6v-.9h.6V2.8h-.6z"/>',""")
rep("""bu:'<path d="M0-4.2a1.6 1.6 0 1 1 0 .1M-2.6 1.8c0-2.2 5.2-2.2 5.2 0M-2 3.2h4"/>',""","""bu:'<circle class="f" cy="-3" r="1.5"/><path class="f" d="M-2.7.9c0-1.9 1.1-2.5 2.7-2.5s2.7.6 2.7 2.5zM-1.5.9h3v2.6h-3zM-2.6 3.5h5.2v1h-5.2z"/>',""")
rep("""sl:'<path d="M-1.4 3.4v-6.2l1.4-1.4 1.4 1.4v6.2zM-2.6 3.4h5.2"/>',""","""sl:'<path class="f" d="M-1.25 3V-2.7L0-4.7l1.25 2V3zM-2.8 3h5.6v1.5h-5.6z"/>',""")
rep("""cr:'<path d="M0-4.4v8.6M-2.4-1.8h4.8"/>',""","""cr:'<path class="f" d="M-.65-4.8h1.3v2.3h2.3v1.3H.65v4.5H-.65v-4.5h-2.3v-1.3h2.3zM-2.2 3.3h4.4v1.2h-4.4z"/>',
 bn:'<path class="f" d="M-4-3.1h8v1.2h-8zM-3.3-1.9h1v1.4h-1zM2.3-1.9h1v1.4h-1zM-4.2-.5h8.4v1.3h-8.4zM-3.4.8h1.1v2.8h-1.1zM2.3.8h1.1v2.8H2.3z"/>',
 gz:'<path class="f" d="M0-5.1l.5.8 4 3.1h-9l4-3.1zM-3.7-1h1v3.9h-1zM-.5-1h1v3.9h-1zM2.7-1h1v3.9h-1zM-4.4 2.9h8.8v1.2h-8.8z"/>',""")
rep('.poi.lm path{stroke:var(--accent)}','.poi.lm path{stroke:var(--accent)}\n.poi .f{fill:#5b4c3f;stroke:none}.poi.lm .f{fill:var(--accent)}\n#map.mid .amen{display:none}')
# лавки — значком замість ледь помітного прямокутника; бесідка — слід на землі + значок
rep("""BENCH.forEach(function(b){h+='<rect class="bench" x="'+(b[0]-.4)+'" y="'+(b[1]-1.2)+'" width=".8" height="2.4" rx=".2"><title>Лавка</title></rect>'});""",'')
rep('/* входи: «шпилька»',"""BENCH.forEach(function(b){h+=lbl("poi amen",b[0],b[1],0,'<circle class="dot" r="7"/><g>'+IC.bn+'</g><title>Лавка</title>')});
GAZEBO.forEach(function(g){h+=lbl("poi amen",g[0],g[1],0,'<circle class="dot" r="7.5"/><g>'+IC.gz+'</g><title>Бесідка</title>')});
/* входи: «шпилька»""")
# ================= v13 (18.11.2026): айдентика Ariadna — знак у шапці, фавікон, золота нитка, шрифт Fixel =================
# фавікон і іконка для екрана «Додому»; шрифт — свій (Fixel, OFL), без запитів до Google
rep(s[s.index('<link rel="icon" href="data:image/svg+xml'):s.index('<style>')],
    '<link rel="icon" type="image/svg+xml" href="brand/ariadna-favicon.svg">\n'
    '<link rel="apple-touch-icon" href="brand/apple-touch-icon.png">\n'
    '<link rel="preload" href="fonts/FixelText-Regular.woff2" as="font" type="font/woff2" crossorigin>\n'
    '<link rel="preload" href="fonts/FixelText-Medium.woff2" as="font" type="font/woff2" crossorigin>\n')
rep('<style>\n','''<style>
/* Fixel (MacPaw × AlfaBravo, SIL OFL 1.1) — лише українська й латиниця, файли в папці fonts */
@font-face{font-family:"Fixel Text";font-weight:400;font-style:normal;font-display:swap;src:url(fonts/FixelText-Regular.woff2) format("woff2")}
@font-face{font-family:"Fixel Text";font-weight:500;font-style:normal;font-display:swap;src:url(fonts/FixelText-Medium.woff2) format("woff2")}
@font-face{font-family:"Fixel Text";font-weight:600;font-style:normal;font-display:swap;src:url(fonts/FixelText-SemiBold.woff2) format("woff2")}
@font-face{font-family:"Fixel Text";font-weight:700;font-style:normal;font-display:swap;src:url(fonts/FixelText-Bold.woff2) format("woff2")}
''',)
rep('font:15px/1.45 "Onest",system-ui,','font:15px/1.45 "Fixel Text",system-ui,')
rep('#map text{font-family:"Onest",system-ui,sans-serif;','#map text{font-family:"Fixel Text",system-ui,sans-serif;')
# кольори: золото — лише нитка (маршрут і все, що до нього належить); акценти інтерфейсу — графіт (на темному — золото)
rep('--accent:#1d6b66; --accent-ink:#fff; --accent-soft:rgba(29,107,102,.1);','--accent:#222b31; --accent-ink:#f3efe6; --accent-soft:rgba(34,43,49,.08);')
rep('--thread:#1d6b66; --thread-soft:rgba(29,107,102,.18);','--thread:#94702f; --thread-soft:rgba(148,112,47,.2);')
rep('--accent:#3ea39b; --accent-ink:#04110f; --accent-soft:rgba(62,163,155,.16);','--accent:#cdaa62; --accent-ink:#222b31; --accent-soft:rgba(205,170,98,.16);')
rep('--thread:#45b3a9; --thread-soft:rgba(69,179,169,.22);','--thread:#cdaa62; --thread-soft:rgba(205,170,98,.22);')
rep('.gbtn.prime{background:var(--accent);color:var(--accent-ink);box-shadow:0 10px 24px -12px rgba(18,67,63,.65)}','.gbtn.prime{background:var(--accent);color:var(--accent-ink);box-shadow:0 10px 24px -12px rgba(20,26,30,.5)}')
rep('.gbtn.thread{background:var(--thread);color:#fff;box-shadow:0 10px 24px -12px rgba(18,67,63,.6)}','.gbtn.thread{background:var(--accent);color:var(--accent-ink);box-shadow:0 10px 24px -12px rgba(20,26,30,.5)}')
rep('place-items:center;background:var(--thread);color:#fff;font-weight:700;font-size:20px;box-shadow:0 10px 22px -12px rgba(18,67,63,.7)','place-items:center;background:var(--accent);color:var(--accent-ink);font-weight:700;font-size:20px;box-shadow:0 10px 22px -12px rgba(20,26,30,.55)')
rep('.res[aria-expanded=true],.dk[aria-expanded=true]{box-shadow:var(--shadow),inset 0 0 0 1.6px var(--thread)}','.res[aria-expanded=true],.dk[aria-expanded=true]{box-shadow:var(--shadow),inset 0 0 0 1.6px var(--accent)}')
rep('box-shadow:0 0 0 .5px var(--line);color:var(--thread)}','box-shadow:0 0 0 .5px var(--line);color:var(--accent)}')
rep('.dk.ask{box-shadow:var(--shadow),inset 0 0 0 1.6px var(--thread);','.dk.ask{box-shadow:var(--shadow),inset 0 0 0 1.6px var(--accent);')
rep('.srch:focus-within{box-shadow:inset 0 0 0 1.6px var(--thread)}','.srch:focus-within{box-shadow:inset 0 0 0 1.6px var(--accent)}')
rep('.tile[aria-pressed=true]{box-shadow:inset 0 0 0 1.6px var(--thread);background:var(--btn-sheen),var(--thread-soft)}','.tile[aria-pressed=true]{box-shadow:inset 0 0 0 1.6px var(--accent);background:var(--btn-sheen),var(--accent-soft)}')
rep('.num[aria-pressed=true]{background:var(--thread);color:#fff;box-shadow:none}','.num[aria-pressed=true]{background:var(--accent);color:var(--accent-ink);box-shadow:none}')
rep('.num[aria-pressed=true]:hover{background:var(--thread)}','.num[aria-pressed=true]:hover{background:var(--accent)}')
rep('.from button[aria-pressed=true]{background:var(--thread-soft);box-shadow:inset 0 0 0 1.5px var(--thread)}','.from button[aria-pressed=true]{background:var(--accent-soft);box-shadow:inset 0 0 0 1.5px var(--accent)}')
rep('.from button[aria-pressed=true] .m{color:var(--thread)}','.from button[aria-pressed=true] .m{color:var(--accent)}')
rep('.from .here .bus{background:var(--accent)}','.from .here .bus{background:var(--accent);color:var(--accent-ink)}')
rep('.stop.here rect{fill:var(--accent)}','.stop.here rect{fill:var(--accent)}.stop.here path,.stop.on path{fill:var(--accent-ink)}')
rep('.badge.on circle{fill:var(--thread);stroke:#fff;stroke-width:2}','.badge.on circle{fill:var(--accent);stroke:var(--thread);stroke-width:2.6}')
rep('.badge.on text{fill:#fff}','.badge.on text{fill:var(--accent-ink)}')
rep('.door.on .dg{stroke:#fff}','.door.on .dg{stroke:var(--accent-ink)}')
rep('.poi.lm path{stroke:var(--accent)}','.poi.lm path{stroke:#222b31}')
rep('.poi.lm .f{fill:var(--accent)}','.poi.lm .f{fill:#222b31}')
rep('.dar{fill:var(--thread);fill-opacity:.3;','.dar{fill:var(--accent);fill-opacity:.1;')
# знак у шапці: іконка + вордмарк ARIADNA + підпис (у темній темі — світлий вордмарк)
rep('<svg id="map" role="img" aria-label="Карта території лікарні: корпуси, доріжки, проходи, зупинки"></svg>\n',
    '<svg id="map" role="img" aria-label="Карта території лікарні: корпуси, доріжки, проходи, зупинки"></svg>\n'
    '<div class="mast glass" id="mast"><img class="bi" src="brand/ariadna-favicon.svg" alt="" width="34" height="34">'
    '<span class="bt"><picture><source srcset="brand/ariadna-wordmark-small-reverse.svg" media="(prefers-color-scheme: dark)">'
    '<img class="bw" src="brand/ariadna-wordmark-small.svg" alt="Ariadna" width="92" height="15"></picture>'
    '<span class="bs">КНП «ПСИХІАТРІЯ» · Кирилівська, 103</span></span></div>\n')
rep('.dock{position:absolute;z-index:32;','''.mast{position:absolute;z-index:14;transition:opacity .2s,transform .2s;top:max(12px,env(safe-area-inset-top));left:max(12px,env(safe-area-inset-left));display:flex;align-items:center;gap:10px;padding:6px 14px 6px 6px;border-radius:15px;pointer-events:none;max-width:calc(100vw - 92px)}
body.popping .mast{opacity:0;transform:translateY(-6px)}
.mast .bi{width:34px;height:34px;flex:none;border-radius:9px}
.mast .bt{display:flex;flex-direction:column;gap:4px;min-width:0}
.mast .bw{display:block;width:auto;height:13px}
.mast .bs{font-size:11px;line-height:1.15;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dock{position:absolute;z-index:32;''')
# карта при наближенні до маршруту не ховає його під шапкою
rep('return {t:14,b:Math.max(14,s.h-(dr.top-s.t)+10),l:14,r:70};','var hb=document.getElementById("mast").getBoundingClientRect();\n  return {t:Math.max(14,hb.bottom-s.t+10),b:Math.max(14,s.h-(dr.top-s.t)+10),l:14,r:70};')
rep('<span class="logo" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="15" cy="15" r="11" fill="var(--thread)"/><path d="M7 11c5 1 11 6 13 13M6 17c5 0 10 3 12 8M11 5c4 3 8 9 9 16M18 4c2 4 3 8 2 13" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".85"/><path d="M25 22c3 2 4 5 2 7" fill="none" stroke="var(--thread)" stroke-width="1.6" stroke-linecap="round"/></svg></span><span><b>Ariadna</b><small>','<span class="logo" aria-hidden="true"><img src="brand/ariadna-favicon.svg" alt="" width="42" height="42"></span><span><b><picture><source srcset="brand/ariadna-wordmark-small-reverse.svg" media="(prefers-color-scheme: dark)"><img class="wm" src="brand/ariadna-wordmark-small.svg" alt="Ariadna" width="104" height="17"></picture></b><small>')
rep('.logo{width:42px;height:42px;flex:none;border-radius:14px;display:grid;place-items:center;background:var(--btn-sheen),var(--btn-glass);box-shadow:0 0 0 .5px var(--line)}','.logo{width:42px;height:42px;flex:none;border-radius:11px;display:grid;place-items:center;overflow:hidden}.logo img{width:42px;height:42px;display:block}.brand .wm{display:block;width:auto;height:15px;margin:2px 0 5px}')
# ================= v14 (18.11.2026): список Андрія від 18.11 =================
# --- дані: відділення 12 і корпусу 21 більше немає; стенда зі схемою немає — на тому місці шлагбаум ---
rep('{id:"10",k:"8",ent:"k8"},{id:"12",k:"2"},','{id:"10",k:"8",ent:"k8"},')
# корпус 21: без номера й назви — лишається звичайною будівлею без відділень (якщо її знесли — прибрати й контур)
rep('{k:"21",lv:1,r:"r-graph",lab:[225,-314],n:"Аварійна станція (не працює)",','{lv:1,r:"r-graph",')
rep('{n:"Стенд зі схемою лікарні",d:"тут можна звіритися з картою",x:86.7,y:16.9,ic:"in"}','{n:"Шлагбаум",d:"на дорозі біля адміністрації",x:86.7,y:16.9,ic:"br"}')
BARRIER=('<path class="f" d="M-4.9-3.4h1.7v6.7h-1.7zM-5.7 3.2h3.3v1.4h-3.3z"/>'
         '<path d="M-3.2-2.95h8.5v1.95h-8.5z" style="fill:#fff;stroke:#c63a2f;stroke-width:.55;stroke-linejoin:miter"/>'
         '<path d="M-1.2-2.95h1.75v1.95h-1.75zM2.3-2.95h1.75v1.95H2.3z" style="fill:#c63a2f;stroke:none"/>')
rep(""" in:'<path d="M-3 -3h6v4.4h-6zM0 1.4v2.4"/>',""",""" br:'"""+BARRIER+"""',""")
rep('''<li><svg viewBox="0 0 30 16"><rect x="8" y="1" width="14" height="14" rx="4" fill="#2f6db5" stroke="#fff"/></svg>зупинка транспорту</li>''',
    '''<li><svg viewBox="0 0 30 16"><rect x="8" y="1" width="14" height="14" rx="4" fill="#2f6db5" stroke="#fff"/></svg>зупинка транспорту</li>
    <li><svg viewBox="-15 -8 30 16"><circle r="7" fill="#fff" stroke="var(--b-edge)" stroke-width=".8"/><path d="M-4.9-3.4h1.7v6.7h-1.7zM-5.7 3.2h3.3v1.4h-3.3z" fill="#222b31"/><path d="M-3.2-2.95h8.5v1.95h-8.5z" fill="#fff" stroke="#c63a2f" stroke-width=".55"/><path d="M-1.2-2.95h1.75v1.95h-1.75zM2.3-2.95h1.75v1.95H2.3z" fill="#c63a2f"/></svg>шлагбаум</li>''')
# старт «біля стенда» (адреса ?from=st) більше не потрібен
cut('},\n st:{at:[93,10]','\n};','}')
# --- тексти: без «повторного дотику» і без довгої довідки про джерела; © OpenStreetMap лишається (цього вимагає ліцензія даних) ---
rep(' Торкніться будівлі чи зупинки, щоб обрати; повторний дотик знімає вибір.</p>',' Торкніться будівлі, входу чи зупинки, щоб обрати.</p>')
rep('<br>Можна також торкнутися будівлі на карті. Повторний дотик до обраної знімає вибір.</p>','<br>Можна також торкнутися будівлі чи входу на карті.</p>')
rep(' Двері відділень, поверхи, сходи й галерею уточнено на місці 16.11.2026. Контури, доріжки, зупинки, маршрути транспорту — © учасники <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>, звірено із супутниковим знімком 15.11.2026. Час у дорозі приблизний.',
    ' Дані карти — © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>.')
# --- шапка: назва лікарні крупно, ARIADNA дрібно; за кілька секунд згортається до знака «А» ---
rep('<div class="mast glass" id="mast"><img class="bi" src="brand/ariadna-favicon.svg" alt="" width="34" height="34"><span class="bt"><picture><source srcset="brand/ariadna-wordmark-small-reverse.svg" media="(prefers-color-scheme: dark)"><img class="bw" src="brand/ariadna-wordmark-small.svg" alt="Ariadna" width="92" height="15"></picture><span class="bs">КНП «ПСИХІАТРІЯ» · Кирилівська, 103</span></span></div>',
    '<div class="mast glass" id="mast"><button type="button" class="bi" id="mastA" aria-label="Показати назву лікарні" aria-expanded="true"><img src="brand/ariadna-favicon.svg" alt="" width="34" height="34"></button>'
    '<span class="bt"><span class="bh">КНП «ПСИХІАТРІЯ»</span><span class="bs">Кирилівська, 103 · <picture><source srcset="brand/ariadna-wordmark-small-reverse.svg" media="(prefers-color-scheme: dark)"><img class="bw" src="brand/ariadna-wordmark-small.svg" alt="Ariadna" width="49" height="8"></picture></span></span></div>\n'
    '<a class="osm on" id="osm" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a>')
# --- нижня панель: банер маршруту з рядком «звідки → куди»; на телефоні «Куди» і «Звідки» згортаються в одну кнопку ліворуч ---
ROUTE_IC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5.5" cy="18.5" r="2.3"/><path d="M8 18.5h7a3.2 3.2 0 0 0 0-6.4H9a3.2 3.2 0 0 1 0-6.4h4.5"/><path d="M18.5 10.4s-2.7-2.3-2.7-4.6a2.7 2.7 0 0 1 5.4 0c0 2.3-2.7 4.6-2.7 4.6z" fill="currentColor" stroke-width="1.4"/></svg>'
rep('''<div class="dock" id="dock">
  <div class="res glass" id="res" role="button" tabindex="0" aria-haspopup="dialog" aria-expanded="false" aria-live="polite" hidden><div class="tx"><b id="resB"></b><span class="s" id="resS"></span></div><span id="resGo"></span></div>
  <div class="dk-row">''','''<div class="dock" id="dock">
  <div class="res-row" id="resRow" hidden><button type="button" class="dk mini glass" id="bMini" aria-label="Змінити, куди і звідки">'''+ROUTE_IC+'''</button><div class="res glass" id="res" role="button" tabindex="0" aria-haspopup="dialog" aria-expanded="false" aria-live="polite"><div class="tx"><span class="ft" id="resF"></span><b id="resB"></b><span class="s" id="resS"></span></div><span id="resGo"></span></div></div>
  <div class="dk-row" id="dkRow">''')
# камера рахує відступ знизу за тим, якою панель стане після згортання, а не якою вона є посеред анімації
rep('var s=size(),dr=document.getElementById("dock").getBoundingClientRect();','var s=size(),dr={top:dockTop()};')
# --- жести: подвійний дотик збільшує карту; одиночний дотик чекає 0,26 с, чи не буде другого ---
rep('if(moved<8&&e.type==="pointerup"&&!many){tapAt(e.clientX,e.clientY);return}','if(moved<8&&e.type==="pointerup"&&!many){tapOrDouble(e.clientX,e.clientY);return}')
rep('/* жести: тягнути, щипок, інерція. Подвійне торкання нічого не збільшує. */','/* жести: тягнути, щипок, інерція, подвійне торкання — наблизити */')
# --- CSS ---
rep('.badge.on .pulse{animation:pulse','.badge.on.pl .pulse{animation:pulse')
rep('</style>','''/* ---------- v14 ---------- */
:root{--on-thread:#fff}
@media (prefers-color-scheme:dark){:root{--on-thread:#222b31}}
/* віконця прозоріші (кнопки всередині — як були) */
.pop.glass,.legend.glass,.toast.glass{--glass-tint:rgba(255,255,255,.4);--glass-glow:rgba(255,255,255,.42)}
@media (prefers-color-scheme:dark){.pop.glass,.legend.glass,.toast.glass{--glass-tint:rgba(44,52,59,.42);--glass-glow:rgba(255,255,255,.05)}}
/* шапка */
.mast{pointer-events:auto;gap:0;transition:opacity .2s,transform .2s,padding .6s cubic-bezier(.32,.72,0,1)}
.mast .bi{display:block;padding:0;border:0;background:none;border-radius:9px;cursor:pointer;flex:none}
.mast .bi img{display:block;width:34px;height:34px;border-radius:9px}
.mast .bt{gap:3px;max-width:260px;margin-left:10px;overflow:hidden;transition:max-width .6s cubic-bezier(.32,.72,0,1),margin .6s cubic-bezier(.32,.72,0,1),opacity .35s}
.mast .bh{font-size:15.5px;font-weight:700;letter-spacing:.005em;line-height:1.15;white-space:nowrap}
.mast .bs{display:flex;align-items:center;gap:4px}
.mast .bw{height:8px;width:auto;display:block}
.mast.mini{padding-right:6px}
.mast.mini .bt{max-width:0;margin-left:0;opacity:0}
.osm{position:absolute;z-index:14;top:max(12px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));font-size:10.5px;line-height:1;padding:5px 8px;border-radius:9px;color:var(--muted);background:var(--glass-tint);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);text-decoration:none;opacity:0;pointer-events:none;transition:opacity .5s}
.osm.on{opacity:1;pointer-events:auto}
body.popping .osm{opacity:0;pointer-events:none}
/* віконце про вхід: на нього можна натискати, карта під ним не реагує */
.toast.on{pointer-events:auto;cursor:pointer}
.toast .ta{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:9px}
.toast .ta small{font-size:12.5px;color:var(--muted);margin-right:2px}
.toast .ta .gbtn{min-height:38px;padding:0 13px;font-size:14px;border-radius:12px;background:var(--accent);color:var(--accent-ink);box-shadow:none;-webkit-backdrop-filter:none;backdrop-filter:none}
#map .door text{pointer-events:auto}
/* номер обраного відділення пульсує біля дверей */
.dnum{transform-box:fill-box;transform-origin:center;animation:dnum 1.7s ease-in-out infinite}
.dnum .dn-b{fill:var(--thread);stroke:#fff;stroke-width:1.6}
#map .dnum text{font-size:12.5px;font-weight:700;text-anchor:middle;dominant-baseline:central;fill:var(--on-thread);stroke:none}
.dn-w{fill:none;stroke:var(--thread);stroke-width:2;transform-box:fill-box;transform-origin:center;animation:dnw 1.7s ease-out infinite}
@keyframes dnum{0%,100%{transform:scale(1)}50%{transform:scale(1.17)}}
@keyframes dnw{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.9);opacity:0}}
#map .door.np text{display:none}
/* нижня панель */
.res-row{display:flex;align-items:stretch;position:relative;z-index:1}
.res-row[hidden]{display:none}
.res-row .res{flex:1;min-width:0}
.dk.mini{flex:none;width:0;min-height:0;padding:0;margin-right:0;justify-content:center;overflow:hidden;opacity:0;transform:scale(.5);pointer-events:none;color:var(--accent)}
.dk.mini svg{width:25px;height:25px;flex:none}
.res .ft{display:none;font-size:12px;color:var(--muted);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.res .ft i{font-style:normal;font-weight:700;color:var(--thread);margin:0 3px}
/* довгі переходи — лише поки панель згортається чи розгортається (клас anim), щоб натискання кнопок лишалось швидким */
.dk-row{position:relative;z-index:0}
.dk-row .dk{transform-origin:0 100%}
.dock.anim .dk-row{transition:margin .95s cubic-bezier(.45,0,.2,1),visibility 0s}
.dock.anim .dk-row .dk{transition:transform .95s cubic-bezier(.45,0,.2,1),opacity .55s .4s}
.dock.anim .dk.mini{transition:width .95s cubic-bezier(.45,0,.2,1),margin .95s cubic-bezier(.45,0,.2,1),opacity .45s,transform .95s cubic-bezier(.45,0,.2,1)}
#go.on{background:var(--btn-sheen),var(--btn-glass);color:var(--ink);box-shadow:0 0 0 .5px var(--line)}
@media (max-width:899px){
  .dock.min .dk.mini{width:60px;margin-right:8px;opacity:1;transform:none;pointer-events:auto}
  .dock.anim.min .dk.mini{transition-delay:.35s,.35s,.5s,.35s}
  .dock.min .res .ft{display:block}
  /* ряд кнопок лишається внизу, а банер з’їжджає на його місце; кнопки стискаються в лівий нижній кут, звідки виростає одна кнопка */
  .dock.min .dk-row{margin-top:-66px;pointer-events:none;visibility:hidden}
  .dock.anim.min .dk-row{transition:margin .95s cubic-bezier(.45,0,.2,1) .15s,visibility 0s 1.2s}
  .dock.min #bTo{transform:scale(.3);opacity:0}
  .dock.min #bFrom{transform:translateX(-135%) scale(.3);opacity:0}
}
@media (prefers-reduced-motion:reduce){.dnum,.dn-w{animation:none}.dn-w{display:none}}
</style>''')
# --- скрини Андрія 18.11.2026 ---
# прохід західніше від Кирилівської церкви не існує: від брами під сходами — дорогою на північний схід повз корпус 10,
# далі на південний схід до дороги зі східного боку церкви (стрілки на скрині)
rep('\nf 141,-192 154,-168 157,-164\n','\n')
rep('\nf 139,-156 141,-192\n','\n')
rep('\nf 192,-235 184,-242 172,-232\n','\nf 198.8,-232 192,-235 184,-242 172,-232\n')
rep(' 197,-215 202,-262\n',' 197,-215 198.8,-232 202,-262\n')
rep('hint:"Від зупинки підніміться сходами до Кирилівської церкви, обійдіть її й пройдіть через браму на територію лікарні. На цьому шляху є сходи."',
    'hint:"Від зупинки пройдіть сходами до дороги, обійдіть нею корпус 10 з північного боку й вийдіть на дорогу зі східного боку Кирилівської церкви; нею — на південь до лікарні. Повз церкву із західного боку проходу немає. На цьому шляху є сходи."')
# східний двір корпусу 1: асфальт — смуга вздовж північного краю й уся східна частина двору (червоне на скрині); решта — газон
PAVE_E='-54.7,24 -54.7,27.7 -52.7,28.8 -43,27 -34.4,29.6 -32.7,32.6 -28.7,31 -22.7,32.8 -19,36.3 -6.2,69.1 0.2,92.1 -0.8,95.3 1.3,97.7 1,101.2 1.8,103.7 3.2,104.5 6.8,102.9 10.3,102.8 16.6,100.8 17.7,99.5 17.6,97.9 15.9,94.9 15,89.4 1.9,45.7 0.6,44 0.2,41.9 -13.5,30.2 -36.1,21.3 -43.9,20.1 -48.6,21 -50.2,22.6'
rep(',\n "-22.7,31 -18,32 -7,43 -6,60.5 -15.7,60.4",\n "-7,43 -2,42 1.6,44.1 5.2,56.1 6.8,61.4 8.1,65.8 18.3,100.1 5,104.1 -5,70 -6,65"];',
    '];\n/* асфальт східного двору корпусу 1 (скрин 18.11.2026); малюється поверх схилу */\nvar PAVE_E=["'+PAVE_E+'"];')
rep('var rd="",rde="",fw="",fwe="",stp="",stb="";\nWAYS','PAVE_E.forEach(function(p){h+=\'<polygon class="pave" points="\'+p+\'"/>\'});\nvar rd="",rde="",fw="",fwe="",stp="",stb="";\nWAYS')
# сховище — знак цивільного захисту: синій трикутник на помаранчевому
SHELTER='<rect x="-4.7" y="-4.7" width="9.4" height="9.4" rx="1.7" style="fill:#f28c00;stroke:none"/><path d="M0-3.4 3.4 2.6H-3.4z" style="fill:#1d4fc4;stroke:none"/>'
rep('{n:"Шлагбаум",d:"на дорозі біля адміністрації",x:86.7,y:16.9,ic:"br"}',
    '{n:"Шлагбаум",d:"на дорозі біля адміністрації",x:86.7,y:16.9,ic:"br"},\n {n:"Сховище",d:"укриття у східному дворі корпусу 1",x:-8.6,y:89.8,ic:"sh",show:1}')
rep(" br:'"," sh:'"+SHELTER+"',\n br:'")
rep('шлагбаум</li>','шлагбаум</li>\n    <li><svg viewBox="-15 -8 30 16"><circle r="7" fill="#fff" stroke="var(--b-edge)" stroke-width=".8"/><rect x="-4.7" y="-4.7" width="9.4" height="9.4" rx="1.7" fill="#f28c00"/><path d="M0-3.4 3.4 2.6H-3.4z" fill="#1d4fc4"/></svg>сховище, укриття</li>')
# ================= v15 (18.11.2026): фото аркуша «Територія: північ» з правками, банкомат, «На авто» =================
# корпусу 21 немає зовсім — прибираємо й контур
rep(',\n {lv:1,r:"r-graph",p:["220.9,-327.4 231.3,-324.5 230,-319.6 233.8,-318.5 231.6,-310.6 226,-312.1 222.6,-299.8 218.8,-300.9 215.3,-301.8 217.7,-310.4 216.3,-310.9"]},\n',',\n')
# двох воріт на дорозі зі сходу від Кирилівської церкви немає
rep('var GATES=[[-13,-167],[141.3,-192.4],[176.9,-120.4],[202.2,-133.5],[213.4,-183.7],[253.6,101]];','var GATES=[[-13,-167],[141.3,-192.4],[176.9,-120.4],[253.6,101]];')
# біля Кирилівської церкви: статуя Ісуса, дзвіниця, статуя (позначки з фото, точність ≈ 1–2 м)
rep(' {n:"Хрест пам’яті жертв Куренівської катастрофи",d:"біля Кирилівської церкви",x:145.5,y:-178.5,ic:"cr"}',
    ' {n:"Хрест пам’яті жертв Куренівської катастрофи",d:"біля Кирилівської церкви",x:145.5,y:-178.5,ic:"cr"},\n'
    ' {n:"Статуя Ісуса Христа",d:"біля Кирилівської церкви",x:197.3,y:-90.3,ic:"st"},\n'
    ' {n:"Статуя",d:"біля Кирилівської церкви",x:157.9,y:-85.9,ic:"st"}')
BELL='<path class="f" d="M0-4.8c-.5 0-.8.3-.8.7v.3C-2.5-3.3-3.1-1.7-3.1.4v1.7l-1.1 1.1v.7h8.4v-.7L3.1 2.1V.4c0-2.1-.6-3.7-2.3-4.2v-.3c0-.4-.3-.7-.8-.7zM-1.2 4.1a1.2 1.2 0 0 0 2.4 0z"/>'
ATM='<rect x="-4" y="-5" width="8" height="10" rx="1.3" style="fill:#2e7d4f;stroke:none"/><rect x="-2.7" y="-3.7" width="5.4" height="3.3" rx=".5" style="fill:#fff;stroke:none"/><path d="M-2.4 1.5h4.8M-1.2 3.2h2.4" style="fill:none;stroke:#fff;stroke-width:.9;stroke-linecap:round"/>'
rep(" sh:'"," bl:'"+BELL+"',\n atm:'"+ATM+"',\n sh:'")
# банкомат — ліворуч від входу до малої конференц-зали, якщо стояти обличчям до дверей (двері на східному боці корпусу 12, отже — південніше від них)
rep(' {n:"Сховище",d:"укриття у східному дворі корпусу 1",x:-8.6,y:89.8,ic:"sh",show:1}',
    ' {n:"Сховище",d:"укриття у східному дворі корпусу 1",x:-8.6,y:89.8,ic:"sh",show:1},\n'
    ' {n:"Дзвіниця",d:"біля Кирилівської церкви",x:177.7,y:-93.4,ic:"bl"},\n'
    ' {n:"Банкомат Укргазбанку",d:"ліворуч від входу до малої конференц-зали, корпус 12",x:129.5,y:-7.5,ic:"atm",show:1}')
rep('сховище, укриття</li>','''сховище, укриття</li>
    <li><svg viewBox="-15 -8 30 16"><circle r="7" fill="#fff" stroke="var(--b-edge)" stroke-width=".8"/><rect x="-4" y="-5" width="8" height="10" rx="1.3" fill="#2e7d4f"/><rect x="-2.7" y="-3.7" width="5.4" height="3.3" rx=".5" fill="#fff"/><path d="M-2.4 1.5h4.8M-1.2 3.2h2.4" stroke="#fff" stroke-width=".9" stroke-linecap="round"/></svg>банкомат</li>
    <li><svg viewBox="0 0 30 16"><path d="M3 8h24" stroke="var(--road-edge)" stroke-width="5" stroke-dasharray="2.5 2"/><path d="M3 8h24" stroke="var(--road)" stroke-width="3"/></svg>підземний перехід</li>''')
# зупинка «Музей «Кирилівська церква»» — на північному боці вул. Олени Теліги; через вулицю — підземним переходом, на тому боці двоє сходів
rep('var WAYS=`f 118,-282 94,-299\n','var WAYS=`u 118,-282 94,-299\ns 94,-299 99.9,-306.8\ns 94,-299 85.6,-292.9\nf 99.9,-306.8 100.5,-321\n')
rep('e2:{at:[110,-270],stop:[101,-260],','e2:{at:[100.5,-321],stop:[100.5,-324.3],')
rep('hint:"Від зупинки пройдіть сходами до дороги, обійдіть нею корпус 10 з північного боку й вийдіть на дорогу зі східного боку Кирилівської церкви; нею — на південь до лікарні. Повз церкву із західного боку проходу немає. На цьому шляху є сходи."',
    'hint:"Зупинка — на північному боці вул. Олени Теліги. Перейдіть вулицю підземним переходом, далі сходами до дороги, обійдіть нею корпус 10 з північного боку й вийдіть на дорогу зі східного боку Кирилівської церкви; нею — на південь до лікарні. Повз церкву із західного боку проходу немає. На цьому шляху є сходи."')
rep('''  else if(c==="s"){stb+='<polyline class="stp-b" points="'+p+'"/>';stp+='<polyline class="stp" points="'+p+'"/>'}''',
    '''  else if(c==="s"){stb+='<polyline class="stp-b" points="'+p+'"/>';stp+='<polyline class="stp" points="'+p+'"/>'}
  else if(c==="u"){fwe+='<polyline class="tun-e" points="'+p+'"/>';fw+='<polyline class="tun" points="'+p+'"/>'}''')
# «На авто»: логіка маршруту машиною (у src/car.js)
rep('if(typeof document==="undefined"){',open('car.js',encoding='utf8').read()+'if(typeof document==="undefined"){')
rep('</style>','''/* ---------- v15 ---------- */
.tun-e{fill:none;stroke:var(--road-edge);stroke-width:3.9;stroke-dasharray:1.6 1.2}
.tun{fill:none;stroke:var(--road);stroke-width:2.5;opacity:.8}
.route.drive{stroke:var(--thread);stroke-width:var(--rw-main,2.8);stroke-dasharray:6 4;opacity:.9}
.lb.park .pk{fill:#fff;stroke:var(--thread);stroke-width:1.8}
.lb.park .pk-c{fill:none;stroke:#222b31;stroke-width:1.25;stroke-linejoin:round;stroke-linecap:round}
.from .car-h{font-size:12.5px;color:var(--muted);margin:2px 4px 8px}
</style>''')
# ================= v16 (18.11.2026): дві зупинки «Музей», корпус 11 зі схеми, маршрути до значків =================
# зупинка «Музей» є з обох боків вул. Олени Теліги: стара (бік церкви) повертається як e4
rep('     hint:"Зупинка — на північному боці вул. Олени Теліги. Перейдіть',
    '     hint:"Ця зупинка — на протилежному від церкви боці вул. Олени Теліги. Перейдіть')
rep('e2:{at:[100.5,-321],stop:[100.5,-324.3],name:"Музей «Кирилівська церква»",cap:"Від зупинки",short:"Музей",street:"вул. Олени Теліги",',
    'e2:{at:[100.5,-321],stop:[100.5,-324.3],name:"Музей «Кирилівська церква»",cap:"Від зупинки",short:"Музей · через дорогу",street:"вул. Олени Теліги, протилежний від церкви бік",')
rep(' e3:{',''' e4:{at:[110,-270],stop:[101,-260],name:"Музей «Кирилівська церква»",ln:"Музей",cap:"Від зупинки",short:"Музей · бік церкви",street:"вул. Олени Теліги, бік церкви",tr:"тролейбуси 27, 30, 31 · автобус 50",
     hint:"Ця зупинка — на боці церкви. Від неї пройдіть сходами до дороги, обійдіть нею корпус 10 з північного боку й вийдіть на дорогу зі східного боку Кирилівської церкви; нею — на південь до лікарні. Повз церкву із західного боку проходу немає. На цьому шляху є сходи."},
 e3:{''')
rep("""'<text x="13" y="4">'+esc(s.name)+'</text>""","""'<text x="13" y="4">'+esc(s.ln||s.name)+'</text>""")
# корпус 11 (схема 18.11.2026): входи з внутрішнього двору — поліклініка, 5 і 22; велика конференц-зала й музей; кафе зі сходу; вхід зі сходинками з пішохідної дороги
rep(' mkz:{k:"12",',''' pl:{k:"11",p:[80,71.3],t:"Поліклініка · 5 · 22",a:"l",n:"Вхід до поліклініки й відділень 5 і 22",d:"з внутрішнього двору корпусу 11",w:"Двері — у внутрішньому дворі корпусу 11, з його східного боку."},
 vkz:{k:"11",p:[58.5,76.5],t:"Конференц-зала · Музей",a:"r",n:"Вхід до великої конференц-зали й музею",d:"з внутрішнього двору корпусу 11",w:"Двері — у внутрішньому дворі корпусу 11, з його західного боку."},
 st11:{k:"11",p:[86.3,57],t:"",a:"l",n:"Вхід до корпусу 11",d:"зі сходинками, з боку пішохідної доріжки"},
 cafe:{k:"11",p:[112.4,70.7],t:"Кафе",a:"r",n:"Кафе",d:"вхід зі східного боку корпусу 11",w:"Вхід — зі східного боку корпусу 11."},
 mkz:{k:"12",''')
rep('{k:"11",lv:1,key:1,r:"r-grey",lab:[80,92],door:[65.4,80.8],','{k:"11",lv:1,key:1,r:"r-grey",lab:[80,92],door:[80,71.3],')
rep('{id:"pol",q:1,','{id:"pol",q:1,ent:"pl",')
rep('{id:"5",k:"11",','{id:"5",k:"11",ent:"pl",')
rep('{id:"22",k:"11"},','{id:"22",k:"11",ent:"pl"},')
rep('{id:"mkz",x:1,','''{id:"vkz",x:1,t:"Велика конференц-зала",short:"Велика конф.-зала",k:"11",ent:"vkz",kw:"конференція зал актова",note:"вхід з внутрішнього двору корпусу 11"},
 {id:"muz",x:1,t:"Музей",short:"Музей",k:"11",ent:"vkz",kw:"музей історії лікарні",note:"вхід з внутрішнього двору корпусу 11"},
 {id:"cafe",x:1,t:"Кафе",k:"11",ent:"cafe",kw:"їжа кава буфет",note:"вхід зі східного боку корпусу 11"},
 {id:"mkz",x:1,''')
# доріжки: сходинки дугою на північ від ротонди, від них пішохідна дорога до входу зі сходинками; коротка дорога від сходів до дуги; підходи до дверей у дворі
rep('s 30,25 52,12\n','s 30,25 41.2,18.4 52,12\n')
rep(' 44,108 26,34 25,28 26,4\n',' 44,108 27,37.9 26,34 25,28 26,4\n')
rep('v 93,10 84,54 65,72\n','v 93,10 84,54 73.3,64.2 65,72\nf 27,37.9 31.6,37.9\ns 31.6,37.9 35.6,36.3 40,35 45,34.2 50.4,34.6 55.7,36.3 60.4,38.6\nf 41.2,18.4 40.6,29.5 40,35\nf 60.4,38.6 81.9,54 85.3,56.4\nf 73.3,64.2 79.4,70.6\nf 65,72 59.2,75.9\n')
rep('var BENCH=[[-140.6,83.5],[-121.3,79.5]];','var BENCH=[[-140.6,83.5],[-121.3,79.5],[38,28.8]];')
rep('</style>','''/* ---------- v16 ---------- */
/* на авто: відрізок машиною — як дорога (смуга з розміткою), пішки — золота нитка */
.route.drive-b{stroke:#222b31;stroke-width:calc(var(--rw-main,2.8) * 2.6);opacity:.78}
.route.drive{stroke:#fff;stroke-width:calc(var(--rw-main,2.8) * .55);stroke-dasharray:4 3.2;opacity:.95}
@media (prefers-color-scheme:dark){.route.drive-b{stroke:#f3efe6;opacity:.85}.route.drive{stroke:#222b31}}
.lb.carin .ci{fill:#222b31;stroke:#fff;stroke-width:1.6}
.lb.carin .cc{fill:none;stroke:#fff;stroke-width:1.25;stroke-linejoin:round;stroke-linecap:round}
@media (prefers-color-scheme:dark){.lb.carin .ci{fill:#f3efe6;stroke:#222b31}.lb.carin .cc{stroke:#222b31}}
#detBody .sw{padding-top:10px}
/* шапка з логотипом не налазить на віконце-підказку: поки воно відкрите, шапка й © OpenStreetMap ховаються */
body.toasting .mast,body.toasting .osm{opacity:0;transform:translateY(-6px);pointer-events:none}
#map .lb.park .pk-t{font-size:11.5px;font-weight:800;text-anchor:middle;dominant-baseline:central;fill:#222b31;stroke:none}
</style>''')
rep('x:129.5,y:-7.5,ic:"atm",show:1}','x:129.5,y:-7.5,ic:"atm",show:1,sh:"Банкомат",kw:"гроші готівка картка укргазбанк"}')
rep('x:-8.6,y:89.8,ic:"sh",show:1}','x:-8.6,y:89.8,ic:"sh",show:1,kw:"укриття бомбосховище тривога"}')
# ================= v17 (19.11.2026) =================
# меню «Куди»: без «Кабінету амбулаторного прийому» (лишається в пошуку), з «Архівом»
rep('{id:"kab",q:1,short:"Кабінет прийому",','{id:"kab",x:1,short:"Кабінет прийому",')
rep('{id:"arh",x:1,t:"Архів",k:"1",ent:"arh",note:"двері в галереї під навісом"},','{id:"arh",q:1,short:"Архів",t:"Архів",sub:"корпус 1",ic:"door",k:"1",ent:"arh",note:"двері в галереї під навісом"},')
# вхід до корпусу 12 — це вхід до адміністрації
rep(' mkz:{k:"12",',' adm:{k:"12",p:[100.6,-34.1],t:"Адміністрація",a:"l",n:"Вхід до адміністрації",d:"корпус 12"},\n mkz:{k:"12",')
rep('{id:"adm",q:1,','{id:"adm",q:1,ent:"adm",')
# назву трансформаторної підстанції прибрано з міркувань безпеки (будівля лишається без підпису)
rep('{k:"",r:"r-graph",n:"Трансформаторна підстанція",p:','{k:"",r:"r-graph",p:')
# «Сховище» → «Укриття»; вхід зі сходинками в корпусі 11 — теж вхід до укриття
rep('{n:"Сховище",d:"укриття у східному дворі корпусу 1",','{n:"Укриття",d:"у східному дворі корпусу 1",')
rep('kw:"укриття бомбосховище тривога"}','kw:"сховище бомбосховище тривога"}')
rep('сховище, укриття</li>','укриття</li>')
rep(' st11:{k:"11",p:[86.3,57],t:"",a:"l",n:"Вхід до корпусу 11",d:"зі сходинками, з боку пішохідної доріжки"},',
    ' st11:{k:"11",p:[86.3,57],t:"Укриття",a:"l",n:"Вхід до укриття",d:"корпус 11, зі сходинками, з боку пішохідної доріжки",w:"Вхід до укриття — зі сходинками, з боку пішохідної доріжки."},')
rep('{id:"cafe",x:1,','{id:"ukr11",x:1,t:"Укриття в корпусі 11",short:"Укриття",k:"11",ent:"st11",kw:"сховище бомбосховище тривога",note:"вхід зі сходинками"},\n {id:"cafe",x:1,')
# легенда: без речення про колір дахів; © OpenStreetMap лишається дрібним рядком (ліцензія даних вимагає, щоб його можна було знайти за кнопкою «i»)
rep('<p class="note" style="margin-top:10px">Колір будівель — колір дахів із супутникового знімка: так їх видно згори. Торкніться будівлі, входу чи зупинки, щоб обрати.</p>',
    '<p class="note" style="margin-top:10px">Торкніться будівлі, входу чи зупинки, щоб обрати.</p>')
rep('Перелік корпусів і відділень — сайт лікарні (psychiatry-kyiv.itmed.org, 14.11.2026). Дані карти — © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>. У невідкладному стані — 103.</p>',
    'Перелік корпусів і відділень — сайт лікарні (psychiatry-kyiv.itmed.org, 14.11.2026). У невідкладному стані — 103.</p>\n  <p class="osm-l"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a></p>')
rep('</style>','''/* ---------- v17 ---------- */
.osm-l{margin:8px 0 0;font-size:10.5px;text-align:right}.osm-l a{color:var(--muted);text-decoration:none}
/* шапка: «Карта-план психіатричної лікарні» довша за стару назву */
.mast .bh{font-size:14px;line-height:1.18}
.mast .bt{max-width:220px}
/* віконця з'являються й ховаються плавніше */
.scrim{transition:opacity .45s ease}
.pop{transition:opacity .32s cubic-bezier(.4,0,1,1),transform .42s cubic-bezier(.4,0,.9,.6),visibility 0s .42s}
.pop.on{transition:opacity .42s cubic-bezier(.2,.8,.2,1),transform .6s cubic-bezier(.16,1,.3,1),visibility 0s}
.legend{transition:opacity .3s cubic-bezier(.4,0,1,1),transform .4s cubic-bezier(.4,0,.9,.6),visibility 0s .4s}
.legend.on{transition:opacity .4s cubic-bezier(.2,.8,.2,1),transform .58s cubic-bezier(.16,1,.3,1),visibility 0s}
/* щоб телефон не грівся: «вічні» анімації зупиняються за кілька секунд */
.route.flow{animation-iteration-count:8}
.badge.on.pl .pulse,.pin .wave,.dnum,.dn-w{animation-iteration-count:6}
</style>''')
# офіційну назву лікарні прибрано скрізь — замість неї «карта-план психіатричної лікарні»
AFTER.append(('Ariadna — Карта КНП «ПСИХІАТРІЯ»','Ariadna — карта-план психіатричної лікарні'))
AFTER.append(('Ariadna — карта КНП «ПСИХІАТРІЯ» (Київ','Ariadna — карта-план психіатричної лікарні (Київ'))
AFTER.append(('<span class="bh">КНП «ПСИХІАТРІЯ»</span>','<span class="bh">Карта-план<br>психіатричної лікарні</span>'))
AFTER.append(('КНП «ПСИХІАТРІЯ» · Кирилівська, 103','Карта-план психіатричної лікарні · Кирилівська, 103'))
# ---------- v18 (19.11.2026): утримання пункту в «Куди» — спливає «Поділитися» ----------
rep('</style>','''/* ---------- v18 ---------- */
/* утримання пункту в «Куди»: пункт повільно втискається, потім над ним спливає «Поділитися» */
#pTo .pk-body button{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
#pTo .lp-hold{transform:scale(.94)!important;transition:transform .48s cubic-bezier(.3,.6,.2,1)!important}
.lp{position:fixed;left:0;top:0;z-index:80;opacity:0;pointer-events:none;transform-origin:50% 100%;
  transform:translate(-50%,calc(-100% - 12px)) scale(.55);transition:opacity .16s ease,transform .2s ease}
.lp.on{opacity:1;pointer-events:auto;transform:translate(-50%,calc(-100% - 12px)) scale(1);transition:opacity .2s ease,transform .42s cubic-bezier(.2,1.5,.35,1)}
.lp.below{transform-origin:50% 0;transform:translate(-50%,12px) scale(.55)}
.lp.below.on{transform:translate(-50%,12px) scale(1)}
.lp-b{display:flex;align-items:center;gap:8px;padding:11px 18px 11px 14px;border-radius:999px;font:inherit;font-weight:600;font-size:15px;white-space:nowrap;
  background:var(--accent);color:var(--accent-ink);box-shadow:0 14px 34px -10px rgba(20,26,30,.55),0 0 0 .5px rgba(0,0,0,.08)}
.lp-b small{font-weight:500;opacity:.72;font-size:13px}
.lp::after{content:"";position:absolute;left:calc(50% + var(--ax,0px));bottom:-5px;width:12px;height:12px;margin-left:-6px;background:var(--accent);transform:rotate(45deg);border-radius:2px}
.lp.below::after{bottom:auto;top:-5px}
.lp-b svg{width:18px;height:18px;flex:none}
@media (prefers-reduced-motion:reduce){.lp,.lp.on{transition:opacity .15s}}
</style>''')
rep('<br>Можна також торкнутися будівлі чи входу на карті.</p>','<br>Можна також торкнутися будівлі чи входу на карті.<br>Щоб надіслати рідним, як дійти, — утримайте номер чи пункт.</p>')
# ---------- v18.3 (19.11.2026): відвідування 16 відділення (табличка біля відділення, надіслав Андрій) ----------
# vis.o — коли можна прийти (хвилини від півночі, київський час), vis.q — тиха година
rep('tel:["(044) 503-87-16"]}','tel:["(044) 503-87-16"],vis:{o:[[570,900],[1020,1080]],q:[900,1020]}}')
rep('</style>','''/* відвідування: розклад і що зараз */
.vis{margin:12px 0 0;padding:11px 13px;border-radius:16px;background:var(--btn-in);box-shadow:0 0 0 .5px var(--line)}
.vis b{display:block;font-size:14px}
.vis .vs{display:inline-flex;align-items:center;gap:6px;margin:6px 0 2px;font-size:13px;font-weight:600}
.vis .vs::before{content:"";width:8px;height:8px;border-radius:50%;background:currentColor}
.vis .vs.ok{color:#2f8f4e}.vis .vs.no{color:#b5462f}
.vis p{margin:4px 0 0;font-size:13px;line-height:1.45;color:var(--muted)}
@media (prefers-color-scheme:dark){.vis .vs.ok{color:#5fc77f}.vis .vs.no{color:#f08a6c}}
</style>''')
# ---------- v18.4 (19.11.2026): перемикач теми — у стовпчику кнопок над «i» ----------
# Без вибору — як у телефоні; вибір пам’ятаємо. Темні правила (@media prefers-color-scheme:dark) наприкінці
# дублюються функцією theme_css: html:not(.light) … у @media і html.dark … без нього.
rep('<div class="ctl" id="ctl">\n','<div class="ctl" id="ctl">\n  <button type="button" class="gbtn" id="thm" aria-label="Темна тема" aria-pressed="false"><svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.6A8.2 8.2 0 1 1 9.4 4a6.6 6.6 0 0 0 10.6 10.6z"/></svg><svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/></svg></button>\n')
rep('<meta name="theme-color" content="#e8eae4"','<script>try{var t=localStorage.getItem("ariadna-theme");if(t==="dark"||t==="light")document.documentElement.classList.add(t)}catch(e){}</script>\n<meta name="theme-color" content="#e8eae4"')
rep('</style>','''/* перемикач теми: місяць — увімкнути темну, сонце — світлу */
#thm .sun{display:none}
@media (prefers-color-scheme:dark){#thm .moon{display:none}#thm .sun{display:block}}
::view-transition-old(root),::view-transition-new(root){animation-duration:.35s}
</style>''')
def theme_css(css):
    def prefix(rules,P):
        res=[];i=0
        while i<len(rules):
            b=rules.find('{',i)
            if b<0:res.append(rules[i:]);break
            sel=rules[i:b];d=1;q=b+1
            while d:
                c=rules[q];d+=(c=='{')-(c=='}');q+=1
            lead=sel[:len(sel)-len(sel.lstrip())]
            ns=[(P+x[5:]) if x.startswith(':root') else P+' '+x for x in (y.strip() for y in sel.split(','))]
            res.append(lead+','.join(ns)+rules[b:q]);i=q
        return ''.join(res)
    key='@media (prefers-color-scheme:dark){';out=[];i=0;n=0
    while True:
        j=css.find(key,i)
        if j<0:out.append(css[i:]);break
        out.append(css[i:j]);k=j+len(key);d=1;q=k
        while d:
            c=css[q];d+=(c=='{')-(c=='}');q+=1
        inner=css[k:q-1];out.append(key+prefix(inner,'html:not(.light)')+'}'+prefix(inner,'html.dark'));i=q;n+=1
    return ''.join(out),n
# ---------- v18.5 (19.11.2026): аптека — цокольний поверх корпусу 11, вхід той самий, що до 22 відділення (і поліклініки, і 5) ----------
PH='<rect x="-4.7" y="-4.7" width="9.4" height="9.4" rx="1.7" style="fill:#1f8a4c;stroke:none"/><path d="M-1-3.4h2v2.4h2.4v2H1v2.4h-2V1h-2.4v-2H-1z" style="fill:#fff;stroke:none"/>'
rep(" sh:'"," ph:'"+PH+"',\n sh:'")
rep('kw:"гроші готівка картка укргазбанк"}','kw:"гроші готівка картка укргазбанк"},\n {n:"Аптека",d:"корпус 11, цокольний поверх; вхід — як до поліклініки та відділень 5 і 22",x:88,y:66,door:[80,71.3],fl:"цокольний",ic:"ph",show:1,kw:"ліки медикаменти фармація препарати"}')
rep('n:"Вхід до поліклініки й відділень 5 і 22"','n:"Вхід до поліклініки, відділень 5 і 22 та аптеки"')
rep('stroke="#fff" stroke-width=".9" stroke-linecap="round"/></svg>банкомат</li>','stroke="#fff" stroke-width=".9" stroke-linecap="round"/></svg>банкомат</li>\n    <li><svg viewBox="-15 -8 30 16"><circle r="7" fill="#fff" stroke="var(--b-edge)" stroke-width=".8"/><rect x="-4.7" y="-4.7" width="9.4" height="9.4" rx="1.7" fill="#1f8a4c"/><path d="M-1-3.4h2v2.4h2.4v2H1v2.4h-2V1h-2.4v-2H-1z" fill="#fff"/></svg>аптека</li>')
# ================= v19 (19.11.2026): скрини Google від Андрія — стадіон «Спартак», магазини, пошта, АЗС, футбольне поле =================
# Скрини прив'язано до карти за будівлями й дорогами (точність ≈ 2–5 м). Значки — там, де шпилька Google.
# --- корпусу 6 немає: на його місці на супутнику футбольне поле (Андрій обвів його й закреслив «монастир»).
#     Старий контур: 208.9,-102.6 222.2,-82.4 235.2,-62.6 252.8,-74.1 226.5,-114.1 217.7,-108.4 (двері 217.7,-108.4).
#     Номери дахів у roofs.json — це номери будівель у B сторінки, тому після вилучення їх зсунуто (6→5, 7→6, 9→8, 22→20).
rep(' {k:"6",lv:2,r:"r-grey",lab:[231,-88],door:[217.7,-108.4],p:["208.9,-102.6 222.2,-82.4 235.2,-62.6 252.8,-74.1 226.5,-114.1 217.7,-108.4"]},\n','')
# --- шляхи: тротуар уздовж Кирилівської з боку стадіону отримує вузли «перехід» і «зупинка Спартак»;
#     перехід (зебра, код z) біля перехрестя з вул. Олени Теліги — єдиний, видний на супутнику між Олени Теліги й Подільським узвозом;
#     тротуар з боку будинків: від переходу повз трамвайну зупинку й Нову Пошту до «Фори».
#     Зебра намальована лише через проїжджу частину (жовта смуга); далі через трамвайні колії (їх на карті немає) — звичайна доріжка.
rep('f 328,-313 465,-116 477,-84 479,-53','f 328,-313 333.1,-305.7 410.8,-194 465,-116 477,-84 479,-53')
i_=s.index('f 328,-313 333.1,-305.7');j_=s.index('\n',i_)
s=s[:j_]+'\nz 333.1,-305.7 348.9,-316.7\nf 348.9,-316.7 370.1,-331.4 404,-280.6 408.5,-273.9 502.1,-133.5'+s[j_:]
rep('var rd="",rde="",fw="",fwe="",stp="",stb="";','var rd="",rde="",fw="",fwe="",stp="",stb="",zb="";')
rep('  else if(c==="u"){fwe+=','  else if(c==="z"){zb+=\'<polyline class="zeb-b" points="\'+p+\'"/><polyline class="zeb" points="\'+p+\'"/>\'}\n  else if(c==="u"){fwe+=')
rep('h+=rde+fwe+rd+fw+stb+stp;','h+=rde+fwe+rd+fw+zb+stb+stp;')
# --- зупинки «Стадіон «Спартак»»: маршрутки — бік стадіону; трамваї 11, 12, 16, 19 — через дорогу, бік Нової Пошти
rep('hint:"Від зупинки зверніть на Врубелівський узвіз. Пішки коротше стежкою зі сходами; без сходів — узвозом до в’їзду."}',
    'hint:"Від зупинки зверніть на Врубелівський узвіз. Пішки коротше стежкою зі сходами; без сходів — узвозом до в’їзду."},\n'
    ' e5:{at:[410.8,-194],stop:[416.5,-198],vt:"bus",name:"Стадіон «Спартак»",cap:"Від зупинки",short:"Спартак · маршрутки",street:"вул. Кирилівська, бік стадіону",tr:"маршрутки",\n'
    '     hint:"Зупинка — на боці стадіону. Йдіть тротуаром униз до Подільського узвозу; на розі зверніть на Врубелівський узвіз. Пішки коротше стежкою зі сходами; без сходів — узвозом до в’їзду."},\n'
    ' e6:{at:[404,-280.6],stop:[385.7,-280.6],vt:"tram",name:"Стадіон «Спартак»",ln:"Спартак",cap:"Від зупинки",short:"Спартак · трамвай",street:"вул. Кирилівська, через дорогу від стадіону",tr:"трамваї 11, 12, 16, 19",\n'
    '     hint:"Трамвайна зупинка — через дорогу від стадіону, на боці Нової Пошти. Перейдіть Кирилівську переходом біля перехрестя з вул. Олени Теліги, далі тротуаром повз стадіон униз до Подільського узвозу; на розі — Врубелівським узвозом до лікарні."}')
# --- значок зупинки — автобус спереду з вікном, фарами й дзеркалами (як у Google); трамвай — з пантографом
BUSG=('<path fill-rule="evenodd" d="M-4.9-3.5c0-1.4 1.1-2.2 2.6-2.2h4.6c1.5 0 2.6.8 2.6 2.2V3.3h-9.8zM-3.7-3.6h7.4v3.7h-7.4zM-3.4 1.7a.85.85 0 1 0 1.7 0a.85.85 0 1 0-1.7 0zM1.7 1.7a.85.85 0 1 0 1.7 0a.85.85 0 1 0-1.7 0z"/>'
      '<path d="M-4.3 3.3h1.9v1.5a.5.5 0 0 1-.5.5h-.9a.5.5 0 0 1-.5-.5zM2.4 3.3h1.9v1.5a.5.5 0 0 1-.5.5h-.9a.5.5 0 0 1-.5-.5zM-6.1-3.2h.8v2h-.8zM5.3-3.2h.8v2h-.8z"/>')
TRAMG=('<path fill-rule="evenodd" d="M-4.4-2.1c0-.9.6-1.5 1.5-1.5h5.8c.9 0 1.5.6 1.5 1.5V3.7h-8.8zM-3.2-2.4h6.4v3h-6.4zM-3 2.2a.75.75 0 1 0 1.5 0a.75.75 0 1 0-1.5 0zM1.5 2.2a.75.75 0 1 0 1.5 0a.75.75 0 1 0-1.5 0z"/>'
       '<path d="M-.4-5.3h.8v1.7h-.8zM-2.8-6.3h5.6v1h-5.6zM-3.7 3.7h1.7v1.3h-1.7zM2 3.7h1.7v1.3H2z"/>')
rep('Object.keys(STARTS).forEach(function(e){var s=STARTS[e];',"var STOP_BUS='"+BUSG+"',STOP_TRAM='"+TRAMG+"';\nObject.keys(STARTS).forEach(function(e){var s=STARTS[e];")
rep('\'<path d="M-4.5-5h9v7h-9zM-4.5 2h9v1.5h-9zM-3 4h1.6v1.5H-3zM1.4 4H3v1.5H1.4z" opacity=".95"/>\'','(s.vt==="tram"?STOP_TRAM:STOP_BUS)')
# --- стадіон «Спартак» (бігова доріжка й поле, 172,7 × 89,7 м) і футбольне поле на місці корпусу 6 (21 × 35 м)
STAD_JS='''var STAD={o:"442.2,-119.5 446.9,-108.8 448.6,-97.2 447.3,-85.6 443.0,-74.7 436.0,-65.3 426.9,-58.0 416.1,-53.3 404.6,-51.6 392.9,-52.9 382.0,-57.2 372.6,-64.2 365.3,-73.3 322.6,-144.5 317.9,-155.2 316.2,-166.8 317.5,-178.4 321.8,-189.3 328.8,-198.7 337.9,-206.0 348.7,-210.7 360.2,-212.4 371.9,-211.1 382.8,-206.8 392.2,-199.8 399.5,-190.7",
 i:"433.8,-114.5 437.5,-106.1 438.8,-97.0 437.8,-87.9 434.4,-79.4 429.0,-72.1 421.8,-66.4 413.4,-62.7 404.4,-61.4 395.3,-62.4 386.8,-65.8 379.4,-71.2 373.7,-78.4 331.0,-149.5 327.3,-157.9 326.0,-167.0 327.0,-176.1 330.4,-184.6 335.8,-191.9 343.0,-197.6 351.4,-201.3 360.4,-202.6 369.5,-201.6 378.0,-198.2 385.4,-192.8 391.1,-185.6",
 p:"384.1,-191.3 435.6,-105.6 380.7,-72.7 329.2,-158.4",l:"409.8,-148.5 355.0,-115.5",c:[382.4,-132.0]};
var PITCH={p:"208.9,-102.6 226.5,-114.1 246.0,-84.5 228.4,-73.0",l:"218.6,-87.8 236.2,-99.3",c:[227.4,-93.5]};'''
rep('h+=\'<polygon class="terr" points="\'+TERR+\'"/>\';',
    'h+=\'<polygon class="terr" points="\'+TERR+\'"/>\';\n/* стадіон «Спартак» і футбольне поле — зі скринів Google (19.11.2026) */\n'+STAD_JS+'\n'
    'h+=\'<polygon class="trk" points="\'+STAD.o+\'"/><polygon class="pitch" points="\'+STAD.i+\'"/><polygon class="pitch-l" points="\'+STAD.p+\'"/><polyline class="pitch-l" points="\'+STAD.l+\'"/><circle class="pitch-l" cx="\'+STAD.c[0]+\'" cy="\'+STAD.c[1]+\'" r="9.15"/>\';\n'
    'h+=\'<polygon class="pitch" points="\'+PITCH.p+\'"/><polyline class="pitch-l" points="\'+PITCH.l+\'"/><circle class="pitch-l" cx="\'+PITCH.c[0]+\'" cy="\'+PITCH.c[1]+\'" r="3"/>\';')
rep('var STREETS=[','var STREETS=[["Стадіон «Спартак»",382.4,-132,0],')
rep('["вул. Кирилівська",436,-190,56]','["вул. Кирилівська",455,-140,56]')
# --- нові значки: Нова Пошта, супермаркет, АЗС, футбольне поле (загальні знаки, без логотипів)
SQ='<rect x="-4.7" y="-4.7" width="9.4" height="9.4" rx="1.7" style="fill:%s;stroke:none"/>'
NP=(SQ%'#c8352c')+'<path d="M0-3.5 3.2-1.85v3.7L0 3.5-3.2 1.85v-3.7z" style="fill:#fff;stroke:none"/><path d="M-3.2-1.85 0-.2 3.2-1.85M0-.2v3.7" style="fill:none;stroke:#c8352c;stroke-width:.6;stroke-linejoin:round"/>'
SHOP=(SQ%'#6e4fc2')+'<path d="M-3.7-2.9h1.2l1 4h4.1l1-2.9H-2.2" style="fill:none;stroke:#fff;stroke-width:.85;stroke-linecap:round;stroke-linejoin:round"/><circle cx="-1.1" cy="2.7" r=".75" style="fill:#fff;stroke:none"/><circle cx="2.5" cy="2.7" r=".75" style="fill:#fff;stroke:none"/>'
FUEL=(SQ%'#4d5b66')+'<path d="M-3.1-3.6h4.2v7.4h-4.2z" style="fill:#fff;stroke:none"/><path d="M-2.3-2.8h2.6v2h-2.6z" style="fill:#4d5b66;stroke:none"/><path d="M1.1-1.4h.9a.6.6 0 0 1 .6.6v2.3a.55.55 0 0 0 1.1 0V-1.9L2.8-3.1" style="fill:none;stroke:#fff;stroke-width:.65;stroke-linecap:round;stroke-linejoin:round"/>'
BALL=(SQ%'#2f8a4a')+'<circle r="3.3" style="fill:#fff;stroke:none"/><path d="M0-1.35 1.28-.42.79 1.09H-.79L-1.28-.42z" style="fill:#2f8a4a;stroke:none"/><path d="M0-1.35V-3.2M1.28-.42 3.1-.98M.79 1.09l1.1 1.6M-.79 1.09l-1.1 1.6M-1.28-.42-3.1-.98" style="fill:none;stroke:#2f8a4a;stroke-width:.45"/>'
rep(" ph:'"," np:'"+NP+"',\n shop:'"+SHOP+"',\n fuel:'"+FUEL+"',\n ball:'"+BALL+"',\n ph:'")
# нові пункти — лише в кінець LAND: номери poi<N> у вже надісланих посиланнях не зсуваються
rep('kw:"ліки медикаменти фармація препарати"}\n];','kw:"ліки медикаменти фармація препарати"},\n'
    ' {n:"Нова Пошта № 146",d:"вул. Кирилівська, через дорогу від стадіону «Спартак»; перейти — переходом біля вул. Олени Теліги",x:420.2,y:-273.9,ic:"np",show:1,sh:"Нова Пошта",kw:"пошта посилка відправлення отримати нп",near:{t:"Нова Пошта № 146",sub:"вул. Кирилівська",ic:"box"}},\n'
    ' {n:"Супермаркет «Фора»",d:"вул. Кирилівська, через дорогу від стадіону «Спартак»; перейти — переходом біля вул. Олени Теліги",x:519.2,y:-132.8,ic:"shop",show:1,sh:"Фора",kw:"магазин супермаркет продукти їжа вода фора",near:{t:"Супермаркет «Фора»",sub:"через Кирилівську",ic:"cart"}},\n'
    ' {n:"АЗС «БРСМ-Нафта»",d:"заправка з невеликим магазином (не супермаркет); вул. Олени Теліги, біля Кирилівської церкви",x:156,y:-269,ic:"fuel",show:1,sh:"АЗС",kw:"магазин заправка азс бензин кава перекус брсм нафта",near:{t:"Магазин на АЗС",sub:"«БРСМ-Нафта» · не супермаркет",ic:"fuel"}},\n'
    ' {n:"Футбольне поле",d:"на північ від корпусу 7",x:233,y:-100,door:[218.6,-87.8],ic:"ball",kw:"футбол спорт стадіон майданчик м’яч"}\n];')
# --- карту можна відвести на схід, до «Фори», і трохи північніше — до переходу
rep('var BOUND={x0:-360,y0:-330,x1:380,y1:300}','var BOUND={x0:-360,y0:-345,x1:540,y1:300}')
# --- «Куди»: плитки «Поруч з лікарнею» (заповнює tail.js з LAND[].near)
rep('<p class="pk-note">Не знаєте номера відділення?','<div class="pk-h" style="margin-top:18px">Поруч з лікарнею</div>\n      <div class="tiles" id="near"></div>\n      <p class="pk-note">Не знаєте номера відділення?')
# --- легенда
DOTL='<circle r="7" fill="#fff" stroke="var(--b-edge)" stroke-width=".8"/>'
rep('<li><svg viewBox="0 0 30 16"><rect x="8" y="1" width="14" height="14" rx="4" fill="#2f6db5" stroke="#fff"/></svg>зупинка транспорту</li>',
    '<li><svg viewBox="-15 -8 30 16"><rect x="-7" y="-7" width="14" height="14" rx="4" fill="#2f6db5" stroke="#fff"/><g transform="scale(.72)" fill="#fff">'+BUSG+'</g></svg>зупинка автобуса, тролейбуса, маршрутки</li>\n'
    '    <li><svg viewBox="-15 -8 30 16"><rect x="-7" y="-7" width="14" height="14" rx="4" fill="#2f6db5" stroke="#fff"/><g transform="scale(.72)" fill="#fff">'+TRAMG+'</g></svg>зупинка трамвая</li>')
rep('</svg>аптека</li>','</svg>аптека</li>\n'
    '    <li><svg viewBox="-15 -8 30 16">'+DOTL+SHOP+'</svg>супермаркет</li>\n'
    '    <li><svg viewBox="-15 -8 30 16">'+DOTL+FUEL+'</svg>АЗС (з невеликим магазином)</li>\n'
    '    <li><svg viewBox="-15 -8 30 16">'+DOTL+NP+'</svg>пошта</li>\n'
    '    <li><svg viewBox="0 0 30 16"><rect class="pitch" x="3" y="2" width="24" height="12" rx="1" style="stroke-width:.8"/><path class="pitch-l" d="M15 2v12" style="stroke-width:.8"/><circle class="pitch-l" cx="15" cy="8" r="2.6" style="stroke-width:.8"/></svg>футбольне поле</li>')
rep('</svg>підземний перехід</li>','</svg>підземний перехід</li>\n'
    '    <li><svg viewBox="0 0 30 16"><path class="zeb-b" d="M3 8h24" style="stroke-width:7"/><path class="zeb" d="M3 8h24" style="stroke-width:5.6;stroke-dasharray:1.6 1.6"/></svg>пішохідний перехід (зебра)</li>')
rep('</style>','/* ---------- v19: стадіон, футбольне поле, зебра ---------- */\n'
    '.trk{fill:#d9a387;stroke:#c68a6c;stroke-width:.6;pointer-events:none}\n'
    '.pitch{fill:#9dcc84;stroke:#f4f7f0;stroke-width:.7;pointer-events:none}\n'
    '.pitch-l{fill:none;stroke:#f4f7f0;stroke-width:.6;pointer-events:none}\n'
    '.zeb-b{fill:none;stroke:#4a535a;stroke-width:5.2;pointer-events:none}\n'
    '.zeb{fill:none;stroke:#fff;stroke-width:4.2;stroke-dasharray:.9 .9;pointer-events:none}\n'
    '@media (prefers-color-scheme:dark){.trk{fill:#5b4036;stroke:#6e4c40}.pitch{fill:#2f4b36;stroke:#7f9887}.pitch-l{stroke:#7f9887}.zeb-b{stroke:#141a1e}.zeb{stroke:#cfd5d9}}\n'
    '</style>')
# ---------- JS: хвіст ----------
i=s.index("/* ---------- стан ---------- */")
s=s[:i]+open('tail.js',encoding='utf8').read()
for a_,b_ in AFTER:
    assert a_ in s,('AFTER',a_[:60]);s=s.replace(a_,b_)
assert 'ПСИХІАТРІЯ' not in s,'офіційна назва лікарні ще лишилась'
h0=s.index('<style>');h1=s.index('</style>',h0);css_,nth=theme_css(s[h0:h1]);assert nth==8,nth;s=s[:h0]+css_+s[h1:]
open('src.html','w',encoding='utf8').write(s)
print('ok',len(s))
