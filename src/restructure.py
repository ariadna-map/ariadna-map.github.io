import re
s=open('src_v31.html',encoding='utf8').read()
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
rep("h+='<polygon class=\"terr\" points=\"'+TERR+'\"/>';","h+='<polygon class=\"terr\" points=\"'+TERR+'\"/><path class=\"lawn\" fill-rule=\"evenodd\" d=\"'+LAWNS+'\"/>';")
rep('var GATES=','var LAWNS="/*LAWNS*/";\nvar GATES=')
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
rep('OpenStreetMap</a>, звірено із супутниковим знімком 15.11.2026.','OpenStreetMap</a>, звірено із супутниковим знімком 15.11.2026. Газони й зелень — за супутниковим знімком (© Esri, Maxar, Earthstar Geographics), оброблено 16.11.2026.',2)
# ---------- JS: хвіст ----------
i=s.index("/* ---------- стан ---------- */")
s=s[:i]+open('tail.js',encoding='utf8').read()
open('src.html','w',encoding='utf8').write(s)
print('ok',len(s))
