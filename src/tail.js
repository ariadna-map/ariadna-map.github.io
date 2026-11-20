/* ---------- стан ---------- */
var Q=new URLSearchParams(location.search);
/* ---------- правки з редактора (/redaktor, 21.11.2026) ----------
   data/edits.js: window.ARIADNA_EDITS={d:{"16":{fl:3,vis:{…},note:"…",hide:true}},add:[…],ann:{text,until}}.
   Лише змінені поля; null — прибрати поле. ?preview=1 — чернетка з редактора (localStorage) замість опублікованого */
var EDITS=(function(){var e=window.ARIADNA_EDITS||null,pv=Q.get("preview"),k=pv==="1"?"ariadna-draft":pv==="pending"?"ariadna-preview-pending":null;
  if(k){try{var dr=localStorage.getItem(k);if(dr)e=JSON.parse(dr)}catch(_){}}return e})();   /* ?preview=pending — те, що чекає схвалення */
(function(E){if(!E)return;var F=["t","full","short","sub","k","fl","ent","d","tel","vis","note","hide","kw"];
  function put(d,o){F.forEach(function(f){if(!Object.prototype.hasOwnProperty.call(o,f))return;if(o[f]===null||o[f]==="")delete d[f];else d[f]=o[f]});
    if(d.ent&&!ENT[d.ent])delete d.ent}
  if(E.d)D.forEach(function(d){var o=E.d[d.id];if(o)put(d,o)});
  (E.add||[]).forEach(function(a){if(!a||!a.id||D.some(function(d){return d.id===a.id}))return;var d={id:String(a.id)};if(!/^\d+$/.test(d.id))d.q=1;put(d,a);if(d.ent||d.door)D.push(d)});
  for(var i=D.length-1;i>=0;i--)if(D[i].hide)D.splice(i,1)})(EDITS);
/* «Звідки» не запам’ятовується (19.11.2026): щоразу — від того місця, де ви є. Поки місце невідоме, ви далеко чи точність погана,
   нитку не малюємо: ні зупинку, ні в’їзд для авто сторінка сама не обирає — без винятків (20.11.2026, Андрій). «Вести» відкриває «Звідки».
   Далеко від лікарні (> 650 м) теж: спершу «Звідки», а вже від обраної зупинки чи в’їзду — «Як дістатися» (Google Карти).
   Пам’ятаємо лише «Маршрут без сходів»: це потреба людини, а не місце. */
var st={dept:null,b:-1,start:navigator.geolocation?"geo":null,auto:!navigator.geolocation,noSteps:false,car:false,carIn:null},lastCar=null,lastCarK=null;
try{var sv=JSON.parse(localStorage.getItem("ariadna")||"{}");st.noSteps=!!sv.noSteps}catch(_){}
if(STARTS[Q.get("from")]){st.start=Q.get("from");st.auto=false}
STARTS.geo={geo:1,name:"Моє місцезнаходження",cap:"Звідки",short:"Моє місцезнаходження",street:"",tr:"",at:null,stop:null,hint:"Синя точка — це ви. Лінія оновлюється, коли ви рухаєтеся."};
function startKeys(){var k=Object.keys(STARTS).filter(function(k){return !STARTS[k].geo});if(navigator.geolocation)k.unshift("geo");return k}
function bIndex(k){for(var i=0;i<B.length;i++)if(B[i].k===k)return i;return -1}
function dById(id){for(var i=0;i<D.length;i++)if(D[i].id===id)return D[i];return null}
function dTitle(d){return d.q||d.x?(d.full||d.t):"Відділення № "+d.id}
function dShort(d){return d.q||d.x?(d.short||d.t):"Відділення "+d.id}
function inK(k){return D.filter(function(x){return k&&x.k===k&&!x.x})}
function dName(x){return x.q?x.t.toLowerCase():"№ "+x.id}
function save(){try{localStorage.setItem("ariadna",JSON.stringify({noSteps:st.noSteps}))}catch(_){}}
/* зрозумілі адреси: ariadna-map.github.io/viddilennia-16 — їх і сторінки з карткою-прев’ю робить src/links.py (20.11.2026).
   В адресному рядку теж зрозуміла адреса: її скопіюють чи перешлють — у месенджері буде картка саме цього відділення */
var SLUGS={/*SLUGS*/};
function syncUrl(){try{var p=new URLSearchParams(location.search),to=st.dept||(st.b>=0&&B[st.b].k?"k"+B[st.b].k:""),path="/";p.delete("to");
  if(to&&SLUGS[to])path="/"+SLUGS[to];else if(to)p.set("to",to);var s=p.toString();history.replaceState(history.state,"",path+(s?"?"+s:"")+location.hash)}catch(_){}}

/* ---------- геопозиція: синя точка, маршрут від вас, оновлення в русі ---------- */
var GEO={pos:null,acc:0,err:"",watch:null,first:true,last:null,t:0,boost:false,bt:0,good:false};
/* «Вести»: маршрут від того місця, де ви зараз; карта йде за вами, екран не гасне. Далеко від лікарні — Google Карти */
/* Миколайчик (6 грудня): з вечора 5-го (18:00) до 04:00 9 грудня — логотип зі стрічкою й бантиком, сніжинки, синя точка — «подарунок» (20.11.2026).
   Перевірка заздалегідь: ?holiday=1; вимкнути: ?holiday=0 */
var HOLI=(function(){var q=new URLSearchParams(location.search).get("holiday");if(q==="1")return true;if(q==="0")return false;
  var d=new Date(),D=d.getDate(),h=d.getHours();return d.getMonth()===11&&((D===5&&h>=18)||(D>=6&&D<=8)||(D===9&&h<4))})();
if(HOLI){document.body.classList.add("mykolai");var mi=document.querySelector("#mastA img");if(mi)mi.src="brand/ariadna-favicon-mykolai.svg";
  var ma=document.getElementById("mastA");if(ma){var sn=document.createElement("span");sn.className="snow";sn.setAttribute("aria-hidden","true");sn.innerHTML="<i></i><i></i><i></i><i></i>";ma.appendChild(sn)}}
var FOLLOW=false,CAM=true,camT=0,camN=0,WL=null,lastDoor=null,HERE=false;
function awake(on){try{if(on&&!WL&&navigator.wakeLock)navigator.wakeLock.request("screen").then(function(l){WL=l;l.addEventListener("release",function(){WL=null})},function(){});else if(!on&&WL){WL.release();WL=null}}catch(_){}}
/* сторінку сховали — стеження вимикаємо; повернулися — дивимося ще раз, де ви (рідні повертаються сюди з Google Карт уже біля лікарні) */
document.addEventListener("visibilitychange",function(){
  if(document.visibilityState==="hidden"){if(GEO.watch!==null){geoStop();GEO.paused=true}return}
  if(GEO.paused||(st.start==="geo"&&GEO.watch===null&&GEO.pos&&geoFar())){GEO.paused=false;geoStart()}
  if(FOLLOW)awake(true)});
function ll(p){return (LAT0-p[1]/KY).toFixed(6)+","+(LON0+p[0]/KX).toFixed(6)}
function gmapsTo(p,mode){return "https://www.google.com/maps/dir/?api=1&destination="+ll(p)+(mode?"&travelmode="+mode:"")}
function stopNm(S){return S.ln||S.short.split(" · ")[0]}
function myStop(){var S=st.start&&STARTS[st.start];return S&&!S.geo&&!S.here?S:null}
function myGate(){return st.carIn&&CAR_IN[st.carIn]?st.carIn:null}
/* Google Карти, коли людина далеко: до обраної нею зупинки чи в’їзду, а як нічого не обрано — до самого місця призначення.
   Вид транспорту не нав’язуємо (Google візьме звичний для людини), лише на авто — «машиною», а до зупинки — «транспортом» */
function gmFar(){var S=myStop(),g=myGate();return st.car?gmapsTo(g?CAR_IN[g]:(lastDoor||[20,-20]),"driving"):gmapsTo(S?S.stop:(lastDoor||[20,-20]),S?"transit":"")}
function gmaps(){return gmFar()}
function gmWhere(){var S=myStop(),g=myGate();return st.car&&g?"до в’їзду "+CARN[g].sh:!st.car&&S?"до зупинки «"+stopNm(S)+"»":"сюди"}
/* Далеко від лікарні (20.11.2026, Андрій): дуже прозоре віконце «Ви за N км від лікарні» з кнопкою Google Карт.
   Дотик будь-де поза ним — віконце повільно й плавно стискається в кнопку «Google Карти» на банері внизу; там вона й лишається.
   Показуємо раз для кожного місця призначення (farKey). */
var farBox=document.createElement("div"),farScr=document.createElement("div"),farKey=null,farOpen=false,farT=0,
    FRM=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)");
farBox.className="farbox glass";farBox.setAttribute("role","dialog");farBox.setAttribute("aria-label","Ви далеко від лікарні");farBox.hidden=true;
farScr.className="farscr";farScr.hidden=true;document.body.appendChild(farScr);document.body.appendChild(farBox);
/* усі анімації віконця (й того, що всередині) — геть: завершене згортання з fill:forwards інакше тримає віконце біля кнопки (баг 20.11.2026) */
function farReset(){if(farBox.getAnimations)farBox.getAnimations({subtree:true}).forEach(function(x){try{x.cancel()}catch(_){}})}
function showFar(){clearTimeout(farT);var m=geoFar();if(!m||resRow.hidden){document.body.classList.remove("far-on");return}farReset();
  farBox.innerHTML='<div class="fb-in"><b class="fb-t">Ви за '+fmtKm(m)+' від лікарні</b><p>Дорогу '+esc(gmWhere())+' прокладуть Google&nbsp;Карти.<br>А&nbsp;на&nbsp;місці повертайтеся — далі поведе&nbsp;нитка.</p>'
    +'<a class="gbtn thread fb-go" href="'+esc(gmFar())+'" target="_blank" rel="noopener">'+GMAP+'Відкрити Google Карти</a>'
    +'<button type="button" class="gbtn fb-here">Я вже в лікарні — покажу на карті</button></div><i class="fb-tint" aria-hidden="true"></i>';
  farBox.style.cssText="";farBox.hidden=false;farBox.style.visibility="hidden";
  var W=Math.min(360,innerWidth-40),H;farBox.style.width=W+"px";H=farBox.offsetHeight;
  var top=Math.max(80,Math.min(innerHeight-H-170,(innerHeight-H)/2-30));
  farBox.style.left=Math.round((innerWidth-W)/2)+"px";farBox.style.top=Math.round(top)+"px";farBox.style.visibility="";
  farOpen=true;farScr.hidden=false;document.body.classList.add("far-on");
  if(farBox.animate&&!(FRM&&FRM.matches))farBox.animate([{opacity:0,transform:"translateY(16px) scale(.96)"},{opacity:1,transform:"none"}],{duration:560,easing:"cubic-bezier(.32,.72,0,1)"});
  farBox.querySelector(".fb-go").onclick=function(){cnt("google-daleko");setTimeout(foldFar,250)};
  /* телефон каже «далеко», а людина вже тут (стара чи приблизна геопозиція) — віконце геть, показує на карті */
  farBox.querySelector(".fb-here").onclick=function(){cnt("ya-vzhe-v-likarni");farOpen=false;farScr.hidden=true;farReset();farBox.hidden=true;farBox.innerHTML="";document.body.classList.remove("far-on");pickStart()}}
/* віконце → кнопка на банері: рамка віконця пливе й стискається до розмірів кнопки, текст тане, скло набуває кольору кнопки */
function foldFar(){if(!farOpen)return;farOpen=false;farScr.hidden=true;
  var go=document.getElementById("go"),r0=farBox.getBoundingClientRect();
  function done(){farReset();farBox.hidden=true;farBox.style.cssText="";farBox.innerHTML="";document.body.classList.remove("far-on");
    var g=document.getElementById("go");if(g&&g.animate&&!(FRM&&FRM.matches))g.animate([{transform:"scale(1.07)",boxShadow:"0 0 0 0 rgba(205,170,98,.55)"},{transform:"scale(1)",boxShadow:"0 0 0 16px rgba(205,170,98,0)"}],{duration:800,easing:"cubic-bezier(.32,.72,0,1)"})}
  if(!go||resRow.hidden||!farBox.animate||(FRM&&FRM.matches)){if(farBox.animate)farBox.animate([{opacity:1},{opacity:0}],{duration:260,fill:"forwards"}).onfinish=done;else done();return}
  /* панель ще може доїжджати на місце — ціль беремо там, де кнопка опиниться */
  var g1=go.getBoundingClientRect(),sh=dockTop()-res.getBoundingClientRect().top,r1={left:g1.left,top:g1.top+sh,width:g1.width,height:g1.height},cs=getComputedStyle(go),rad=Math.min(parseFloat(cs.borderTopLeftRadius)||14,r1.height/2),Dm=1250,E="cubic-bezier(.6,0,.3,1)";
  var tint=farBox.querySelector(".fb-tint");tint.style.background=cs.backgroundColor;
  farBox.style.left=r0.left+"px";farBox.style.top=r0.top+"px";farBox.style.width=r0.width+"px";farBox.style.height=r0.height+"px";
  var a=farBox.animate([{left:r0.left+"px",top:r0.top+"px",width:r0.width+"px",height:r0.height+"px",borderRadius:"30px",padding:"22px"},
                        {left:r1.left+"px",top:r1.top+"px",width:r1.width+"px",height:r1.height+"px",borderRadius:rad+"px",padding:"0px"}],{duration:Dm,easing:E,fill:"forwards"});
  farBox.querySelector(".fb-in").animate([{opacity:1,filter:"blur(0px)"},{opacity:0,filter:"blur(8px)"}],{duration:480,easing:"ease-out",fill:"forwards"});
  tint.animate([{opacity:0},{opacity:0,offset:.4},{opacity:1}],{duration:Dm,easing:"ease-in",fill:"forwards"});
  a.onfinish=done}
farScr.addEventListener("pointerdown",function(e){e.preventDefault();foldFar()});
addEventListener("keydown",function(e){if(e.key==="Escape"&&farOpen)foldFar()});
/* ведення (FOLLOW) і «камера йде за вами» (CAM) — окремо (20.11.2026): людина відсунула карту — ведення триває (нитка, точний GPS, «Стоп»),
   лише камера стоїть. Назад — кнопка ⌖ або сама за 10 с без дотиків */
function followCam(first,force){if(!FOLLOW||!CAM||!GEO.pos)return;var p=meAt();
  if(!first&&!force){var cx=(p[0]-vb.x)/vb.w,cy=(p[1]-vb.y)/vb.h;if(cx>.25&&cx<.75&&cy>.25&&cy<.7)return}   /* ви ще в середині екрана — карту не рухаємо */
  var R=first&&!force?60:Math.max(45,Math.min(160,vb.w*.32));fitBox(p[0]-R,p[1]-R,p[0]+R,p[1]+R,0,first?700:450)}
function lead(){
  if(FOLLOW){stopLead();return}
  if(!navigator.geolocation){if(st.start&&STARTS[st.start])say("Браузер не визначає, де ви","йдіть за ниткою від зупинки «"+stopNm(STARTS[st.start])+"»");else askFrom("Браузер не визначає, де ви");return}
  if(GEO.pos&&geoFar()&&Date.now()-GEO.t<120000){showFar();return}
  st.prevStart=st.start&&st.start!=="geo"?st.start:null;
  FOLLOW=true;CAM=true;camN=0;cnt("vesty");awake(true);st.start="geo";st.auto=false;st.carIn=null;GEO.err="";
  var had=geoNear();if(GEO.pos&&geoFar())GEO.pos=null;geoStart();geoMode();render(false);
  if(had){followCam(true);say("Ведемо від вас","карта рухатиметься разом з вами")}
  else say("Визначаю, де ви…","дозвольте доступ до геопозиції")}
/* звідки йти — питаємо людину, а не обираємо зупинку самі */
function askFrom(){pop("from")}
/* «Покажіть на карті, де ви» (20.11.2026): геопозиція не працює чи бреше (стара, приблизна) — людина торкається карти там, де стоїть,
   і нитка йде звідти. Не потребує ні GPS, ні дозволів, ні налаштувань */
var PICK=false,PICKCB=null;
function pickStart(cb,t1,t2){PICK=true;PICKCB=typeof cb==="function"?cb:null;pop(null);if(hOpen)hClose();document.body.classList.add("picking");
  say(PICKCB?t1:"Торкніться карти там, де ви стоїте",PICKCB?t2:"поруч із яким корпусом чи брамою ви зараз — нитка поведе звідти",[{t:"Скасувати",go:function(){var c=PICKCB;pickEnd();if(c)c(null)}}],"",60000)}
function pickEnd(){PICK=false;PICKCB=null;document.body.classList.remove("picking")}
function pickAt(x,y){var s=size(),wx=vb.x+(x-s.l)/s.w*vb.w,wy=vb.y+(y-s.t)/s.h*vb.h,cb=PICKCB;pickEnd();hideToast();
  if(cb){cb([wx,wy]);return}cnt("pokazaty-na-karti");
  STARTS.pin={here:1,pin:1,name:"Місце, яке ви показали",cap:"Звідки",short:"Обране місце",street:"ви показали його на карті",tr:"",at:[wx,wy],stop:[wx,wy],
    hint:"Нитка йде від місця, яке ви показали на карті."};
  setStart("pin");if(st.b<0&&!st.dept)setTimeout(function(){pop("to")},350)}
/* ---------- де відкрито сторінку (20.11.2026): у вбудованому браузері месенджера геопозиція часто не працює ----------
   Telegram, Viber, Facebook, Messenger, Instagram тощо часто підписуються в userAgent; Telegram ще й додає TelegramWebviewProxy.
   Загальні ознаки: Android WebView — «; wv)», iOS WKWebView — без «Safari/». Розпізнається не завжди — тому ще й порада, коли геопозиція відмовила. */
var ENV=(function(){var u=navigator.userAgent||"",ios=/iPhone|iPad|iPod/.test(u)||(/Macintosh/.test(u)&&navigator.maxTouchPoints>1),and=/Android/i.test(u),app=null;
  if(window.TelegramWebviewProxy||window.TelegramWebview||/Telegram/i.test(u))app="Telegram";else if(/Viber/i.test(u))app="Viber";
  else if(/FB_IAB\/MESSENGER|Messenger/i.test(u))app="Messenger";else if(/FBAN|FBAV|FB_IAB|FBIOS/i.test(u))app="Facebook";else if(/Instagram/i.test(u))app="Instagram";
  else if(/\bLine\//.test(u))app="LINE";else if(/MicroMessenger/i.test(u))app="WeChat";else if(/musical_ly|BytedanceWebview|TikTok/i.test(u))app="TikTok";else if(/Snapchat/i.test(u))app="Snapchat";
  var wv=!!app||(and&&/; wv\)/.test(u))||(ios&&/AppleWebKit/.test(u)&&!/Safari\//.test(u));
  return {ios:ios,and:and,app:app,wv:wv,br:/CriOS/.test(u)?"Chrome":/FxiOS/.test(u)?"Firefox":/EdgiOS|EdgA/.test(u)?"Edge":/SamsungBrowser/.test(u)?"Samsung Internet":ios?"Safari":/Chrome\//.test(u)?"Chrome":""}})();
/* віконце-підказка «чому не видно, де ви, і що зробити» — того ж скла, що й «Ви за N км»; дотик поза ним закриває */
var hBox=document.createElement("div"),hScr=document.createElement("div"),hOpen=false,hShown={};
hBox.className="farbox glass hbox";hBox.setAttribute("role","dialog");hBox.setAttribute("aria-label","Геопозиція");hBox.hidden=true;hScr.className="farscr";hScr.hidden=true;
document.body.appendChild(hScr);document.body.appendChild(hBox);
function geoKind(){return ENV.wv?"app":GEO.code===1?"denied":"none"}
function safUrl(){return "x-safari-https://"+location.host+location.pathname+location.search+location.hash}
var IC_SAF='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.2"/><path d="m15.6 8.4-2.2 5-5 2.2 2.2-5z"/></svg>',
    IC_EXT='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    IC_DOTS='<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>';
/* натиснули «Відкрити в Safari/браузері»: якщо сторінка за 2 с не сховалася (застосунок не пустив) — розкриваємо підказку, куди натиснути самому */
var hFail={};
function chrUrl(){return "googlechromes://"+location.host+location.pathname+location.search+location.hash}
function openWatch(b){var gone=false,on=function(){gone=true};document.addEventListener("visibilitychange",on,{once:true});addEventListener("pagehide",on,{once:true});addEventListener("blur",on,{once:true});
  setTimeout(function(){var f=hBox.querySelector(".hb-f");if(gone||!hOpen||!f||document.visibilityState!=="visible")return;
    var t=f.querySelector(".hb-s"),was=!f.hidden;t.innerHTML=hFail[b]||hFail.saf||"";f.hidden=false;
    /* Chrome не відкрився — копіювати посилання сенсу мало, головне — Safari */
    f.querySelector("[data-h=copy]").hidden=b==="chr";
    var H=hBox.offsetHeight;hBox.style.top=Math.round(Math.max(70,(innerHeight-H)/2-20))+"px";
    if(f.animate&&!(FRM&&FRM.matches))f.animate(was?[{opacity:.3},{opacity:1}]:[{opacity:0,transform:"translateY(-6px)"},{opacity:1,transform:"none"}],{duration:420,easing:"cubic-bezier(.32,.72,0,1)"})},2000)}
function intentUrl(){return "intent://"+location.host+location.pathname+location.search+location.hash+"#Intent;scheme=https;end"}
function copyLink(){var u=location.href,ok=function(){say("Посилання скопійовано","вставте його в адресний рядок "+(ENV.ios?"Safari":"браузера"))};
  function fb(){var t=document.createElement("textarea");t.value=u;t.setAttribute("readonly","");t.style.cssText="position:fixed;top:0;left:0;opacity:0";document.body.appendChild(t);t.select();try{t.setSelectionRange(0,u.length)}catch(_){}
    var r=false;try{r=document.execCommand("copy")}catch(_){}document.body.removeChild(t);if(r)ok();else say("Скопіюйте посилання вручну",u,null,"",15000)}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).then(ok,fb);else fb()}
function geoHelp(kind){kind=kind||geoKind();cnt("geo-pidkazka-"+kind);hShown[kind]=true;hBox.dataset.k=kind;hAway=false;var T,P,S,B="",B2="",F="";
  if(kind==="app"){T="Відкрийте карту в браузері";
    P="Усередині "+(ENV.app||"застосунку")+" карта, найімовірніше, не побачить, де ви. У браузері — побачить і поведе від вас.";S="";
    /* iPhone: дві кнопки в ряд — Safari (x-safari-https://, iOS 15, 17 і новіші) і Chrome (googlechromes://). Браузера «за замовчуванням» сторінка
       відкрити не може (такої адреси на iPhone немає), і чи встановлено Chrome — не знає. Android: intent:// — відкриває браузер за замовчуванням */
    if(ENV.ios)B+='<div class="hb-row"><a class="gbtn thread hb-open" data-h="open" data-b="saf" href="'+esc(safUrl())+'">'+IC_SAF+'Safari</a>'
      +'<a class="gbtn hb-open" data-h="open" data-b="chr" href="'+esc(chrUrl())+'">'+IC_EXT+'Chrome</a></div>';
    else B+='<a class="gbtn thread hb-open" data-h="open" data-b="and" href="'+esc(intentUrl())+'">'+IC_EXT+'Відкрити в браузері</a>';
    /* якщо за 2 с ми все ще тут — кнопка не спрацювала: підказка залежить від того, яку натиснули */
    F=1;hFail={saf:ENV.app==="Telegram"?"Не відкрилося? Унизу праворуч є значок компаса <span class=\"hb-ic\">"+IC_SAF+"</span> — натисніть його, і Telegram відкриє карту в браузері."
        :"Не відкрилося? Скопіюйте посилання й вставте його в адресний рядок Safari.",
      chr:"Схоже, Chrome на цьому телефоні немає — натисніть «Safari».",
      and:"Не відкрилося? Угорі праворуч натисніть <span class=\"hb-ic\">"+IC_DOTS+"</span> і оберіть «Відкрити в браузері» (чи «у Chrome»)."}}
  /* 20.11.2026, після випадку з QR-кодом: спершу те, що працює завжди, — показати на карті; налаштування — другим кроком */
  else if(kind==="denied"){T="Не бачу, де ви";P="Покажіть на карті, де ви стоїте, — і нитка поведе звідти.";
    B+='<button type="button" class="gbtn thread" data-h="pick">'+PIN+'Показати на карті</button>';
    S="<b>Або увімкніть геопозицію.</b> "+(ENV.ios?(ENV.br==="Chrome"?"Параметри iPhone → Chrome → Місцезнаходження → «Коли використовується».":"Параметри iPhone → Конфіденційність та безпека → Служби визначення місцеперебування: увімкніть їх, а для «Сайти Safari» оберіть «Коли використовується».")
      :ENV.and?"Потягніть шторку згори й увімкніть «Місцезнаходження» (чи «Геодані»)."+(ENV.br==="Chrome"?" Якщо не допомогло — у Chrome торкніться значка ліворуч від адреси сайту → «Дозволи» → «Геодані».":" Якщо не допомогло — дозвольте геодані цьому сайту в налаштуваннях браузера.")
      :"Дозвольте геопозицію для цієї сторінки в налаштуваннях браузера.")+" Потім оновіть сторінку.";
    B2='<button type="button" class="gbtn" data-h="reload">Оновити сторінку</button>'}
  else{T="Не вдається визначити, де ви";P="Покажіть на карті, де ви стоїте, — і нитка поведе звідти.";
    B+='<button type="button" class="gbtn thread" data-h="pick">'+PIN+'Показати на карті</button>';
    S="<b>Або спробуйте ще раз:</b> перевірте, що місцезнаходження в телефоні ввімкнено, і вийдіть на відкрите місце.";
    B2='<button type="button" class="gbtn" data-h="retry">Спробувати ще раз</button>'}
  var BF='<button type="button" class="gbtn" data-h="from">Я біля зупинки — обрати її</button>';
  hBox.innerHTML='<div class="fb-in"><b class="fb-t">'+T+'</b><p>'+esc(P)+'</p>'+'<div class="hb-b">'+B+'</div>'+(S?'<p class="hb-s hb-or">'+S+'</p>':'')+(B2?'<div class="hb-b">'+B2+'</div>':'')
    +(F?'<div class="hb-f" hidden><p class="hb-s"></p><button type="button" class="gbtn" data-h="copy">Скопіювати посилання</button></div>':'')+'<div class="hb-b hb-last">'+BF+'</div></div>';
  if(hBox.getAnimations)hBox.getAnimations().forEach(function(x){x.cancel()});
  hBox.style.cssText="";hBox.hidden=false;hBox.style.visibility="hidden";var W=Math.min(370,innerWidth-32);hBox.style.width=W+"px";var H=hBox.offsetHeight;
  hBox.style.left=Math.round((innerWidth-W)/2)+"px";hBox.style.top=Math.round(Math.max(70,(innerHeight-H)/2-20))+"px";hBox.style.visibility="";
  hOpen=true;hScr.hidden=false;pop(null);
  if(hBox.animate&&!(FRM&&FRM.matches))hBox.animate([{opacity:0,transform:"translateY(16px) scale(.96)"},{opacity:1,transform:"none"}],{duration:520,easing:"cubic-bezier(.32,.72,0,1)"});
  hBind()}
function hBind(){hBox.querySelectorAll("[data-h]").forEach(function(b){b.onclick=function(){var k=b.dataset.h;
    if(k==="copy"){copyLink();return}if(k==="open"){openWatch(b.dataset.b);return}hClose();
    if(k==="reload")location.reload();else if(k==="pick")pickStart();else if(k==="retry")setStart("geo");else if(k==="from")setTimeout(function(){pop("from")},200)}})}
/* людина пішла в Параметри дозволяти геопозицію й повернулася (20.11.2026): одразу пробуємо ще раз — вдалося, віконце зникне само;
   ні — віконце стає коротким: «Повернулися? Оновіть сторінку» */
var hAway=false;
document.addEventListener("visibilitychange",function(){var k=hBox.dataset.k;if(!hOpen||(k!=="denied"&&k!=="none"))return;
  if(document.visibilityState==="hidden"){hAway=true;return}if(!hAway)return;hAway=false;hBack()});
function hBack(){hBox.dataset.k="back";
  hBox.innerHTML='<div class="fb-in"><b class="fb-t">Повернулися?</b><p>Якщо дозволили геопозицію — оновіть сторінку, і нитка поведе від вас.</p>'
    +'<div class="hb-b"><button type="button" class="gbtn thread" data-h="reload">Оновити сторінку</button><button type="button" class="gbtn" data-h="pick">'+PIN+'Показати на карті</button></div></div>';
  var H=hBox.offsetHeight;hBox.style.top=Math.round(Math.max(70,(innerHeight-H)/2-20))+"px";hBind();
  if(hBox.animate&&!(FRM&&FRM.matches))hBox.querySelector(".fb-in").animate([{opacity:0},{opacity:1}],{duration:360,easing:"ease-out"});
  setStart("geo")}
function hClose(){if(!hOpen)return;hOpen=false;hScr.hidden=true;
  var fin=function(){hBox.hidden=true;hBox.innerHTML="";hBox.style.cssText=""};
  if(hBox.animate&&!(FRM&&FRM.matches))hBox.animate([{opacity:1,transform:"none"},{opacity:0,transform:"translateY(10px) scale(.97)"}],{duration:320,easing:"ease-in",fill:"forwards"}).onfinish=fin;else fin()}
hScr.addEventListener("pointerdown",function(e){e.preventDefault();hClose()});
addEventListener("keydown",function(e){if(e.key==="Escape"&&hOpen)hClose()});   /* чому немає «Від мене» — видно в самому списку, у рядку «Моя геопозиція» */
function stopLead(quiet){if(!FOLLOW)return;FOLLOW=false;camBack();awake(false);geoMode();render(false);if(!quiet)say("Ведення зупинено","нитка лишається на карті")}
function arrived(){if(!lastDoor||!GEO.pos)return;var m=meAt(),rem=LOCK&&st.start==="geo"?LOCK.L-LOCK.s+LOCK.tail:Math.hypot(m[0]-lastDoor[0],m[1]-lastDoor[1]);if(rem<(LOCK?12:Math.max(12,Math.min(GEO.acc,25)))){stopLead(true);var dv=st.dept&&dById(st.dept);say("Ви на місці",curTitle+(dv&&dv.vis?" · "+visNow(dv.vis).t:""))}}
/* довжина в банері: до кілометра — метри (з точністю до 10), далі — «1,2 км», щоб рядок влазив поруч із «×» і «Вести» */
function fmtLen(m){return m<1000?Math.round(m/10)*10+" м":(m/1000).toFixed(1).replace(".",",")+" км"}
function fmtKm(m){return m<1000?Math.round(m/50)*50+" м":(m/1000).toFixed(m<10000?1:0).replace(".",",")+" км"}
function geoFar(){if(!GEO.pos)return 0;var d=Math.hypot(GEO.pos[0]-20,GEO.pos[1]+20);return d-Math.min(GEO.acc||0,d)>650?d:0}   /* приблизна точка (±2 км) не каже «далеко» */
/* точці можна вірити: ви на території чи поруч і точність не гірша за 100 м (якщо вже було точно — терпимо до 300 м, щоб нитка не стрибала) */
function geoNear(){return !!GEO.pos&&!geoFar()&&GEO.acc<=(GEO.good?300:100)}
/* ---------- точка на нитці (19.11.2026) ----------
   GPS у дворах між корпусами помиляється на 20–60 м і «стрибає». Тому:
   1) згладжуємо точки (простий фільтр Калмана): різкий стрибок, швидший за біг, майже не зсуває точку;
   2) коли маршрут від вас прокладено, він «замикається» (LOCK): синя точка рухається лише по нитці, нитка не перебудовується з кожною точкою;
   3) з маршруту сходимо, лише якщо GPS довго (≥ 3 точки і ≥ 12 с) показує місце далі ніж 20–35 м від нитки — тоді нитка будується заново від вас. */
var LOCK=null,REROUTES=0;
function geoFilter(x,y,a,t){var v=Math.max(st.car?12:3,(GEO.sp||0)*1.4);   /* очікувана швидкість: пішки 3 м/с, авто 12; якщо GPS каже, що швидше, — беремо його */
  var j=GEO.f?Math.hypot(x-GEO.f[0],y-GEO.f[1]):0;
  if(!GEO.f||t-GEO.ft>30000||j>300+2*a){GEO.f=[x,y];GEO.P=a*a;GEO.ft=t;return}   /* давно не було точок або ви «переїхали» (з дому до лікарні) — починаємо наново */
  var dt=Math.max(.3,(t-GEO.ft)/1000),P=GEO.P+(v*dt)*(v*dt),R=a*a;
  if(j>3*v*dt+2*a)R=Math.max(R,j*j);
  var K=P/(P+R);GEO.f=[GEO.f[0]+K*(x-GEO.f[0]),GEO.f[1]+K*(y-GEO.f[1])];GEO.P=(1-K)*P;GEO.ft=t}
/* старт — не просто найближча точка доріжки, а та, що в межах похибки дає найкоротший шлях до дверей (без петель з паралельної доріжки) */
function geoRoute(from,door,noSteps,acc){
  var base=findRoute(from,door,noSteps);if(!base)return null;
  var g=graph(noSteps),e=base.path[base.path.length-1],t=g.idx[e[0].toFixed(1)+","+e[1].toFixed(1)],tail=Math.hypot(e[0]-door[0],e[1]-door[1]);
  if(t===undefined)return {path:base.path,tail:tail};
  var R=Math.max(15,Math.min(acc||20,35)),r=dijkstra(g,t),best=-1,bs=Infinity;
  for(var q=0;q<g.nodes.length;q++){if(r.dist[q]===Infinity)continue;var d=Math.hypot(g.nodes[q][0]-from[0],g.nodes[q][1]-from[1]);if(d>R)continue;var sc=d*1.5+r.dist[q];if(sc<bs){bs=sc;best=q}}
  if(best<0)return {path:base.lead&&base.path.length>2?base.path.slice(1):base.path,tail:tail,snap:base.lead||0};
  var path=[];for(var c=best;c>=0;c=r.prev[c])path.push(g.nodes[c]);
  if(path.length<2)path.unshift(path[0]);
  return {path:path,tail:tail,snap:Math.hypot(path[0][0]-from[0],path[0][1]-from[1])}}
function lockMake(path,key,tail){var c=[0];for(var i=1;i<path.length;i++)c.push(c[i-1]+Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]));
  return {p:path,c:c,L:c[c.length-1],s:0,key:key,tail:tail,off:0,offT:0,back:0,tOn:Date.now(),drawn:false}}
function lockAt(L,s){for(var i=1;i<L.p.length;i++)if(L.c[i]>=s){var t=(s-L.c[i-1])/((L.c[i]-L.c[i-1])||1);return [L.p[i-1][0]+t*(L.p[i][0]-L.p[i-1][0]),L.p[i-1][1]+t*(L.p[i][1]-L.p[i-1][1])]}return L.p[L.p.length-1].slice()}
/* найближча точка нитки до q, але лише на відрізку нитки [s0, s1] — щоб точка не перескакувала вперед через двір */
function lockProj(L,q,s0,s1){var best=null;
  for(var i=1;i<L.p.length;i++){var c0=L.c[i-1],c1=L.c[i];if(c1<s0||c0>s1)continue;var a=L.p[i-1],b=L.p[i],dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy,
    t=l2?((q[0]-a[0])*dx+(q[1]-a[1])*dy)/l2:0,lo=c1>c0?(s0-c0)/(c1-c0):0,hi=c1>c0?(s1-c0)/(c1-c0):1;t=Math.max(Math.max(0,lo),Math.min(Math.min(1,hi),t));
    var x=a[0]+t*dx,y=a[1]+t*dy,d=Math.hypot(q[0]-x,q[1]-y);if(!best||d<best.d)best={d:d,s:c0+t*(c1-c0)}}
  return best}
function lockStep(){
  if(!LOCK||!GEO.pos)return "none";
  if(GEO.acc>60)return "hold";   /* точка надто груба — синя точка лишається, де була */
  var now=Date.now(),dt=Math.max(1,(now-LOCK.tOn)/1000),vmax=Math.max(st.car?15:3,(GEO.sp||0)*1.4),T=Math.max(15,Math.min(GEO.acc,30))+5,
      pr=lockProj(LOCK,GEO.pos,Math.max(0,LOCK.s-25),LOCK.s+20+vmax*dt);
  if(pr&&pr.d<=T){LOCK.off=0;LOCK.tOn=now;
    if(pr.s>LOCK.s){LOCK.s+=Math.min(pr.s-LOCK.s,vmax*dt+3)*.6;LOCK.back=0}   /* уперед — плавно і не швидше, ніж можна йти */
    else if(LOCK.s-pr.s>15){if(++LOCK.back>=3){LOCK.s=pr.s;LOCK.back=0}}   /* назад — лише коли повторюється: людина розвернулася */
    else LOCK.back=0;
    return "on"}
  if(!LOCK.off)LOCK.offT=now;LOCK.off++;
  /* нитку будували з грубої точки, а тепер GPS набагато точніший і показує інше місце — перебудовуємо швидше */
  if(LOCK.off>=2&&GEO.acc*2<=LOCK.acc)return "reroute";
  return LOCK.off>=3&&now-LOCK.offT>=12000?"reroute":"hold"}
/* маршрут від вас для малювання: решта замкненої нитки від синьої точки до дверей */
function lockRoute(door,key){
  if(!GEO.f)return null;
  if(!LOCK||LOCK.key!==key){var gr=geoRoute(GEO.f,door,st.noSteps,GEO.acc);if(!gr){LOCK=null;return null}LOCK=lockMake(gr.path,key,gr.tail);LOCK.acc=GEO.acc;LOCK.snap=gr.snap||0;var pr=lockProj(LOCK,GEO.f,0,40);if(pr)LOCK.s=pr.s}
  GEO.show=lockAt(LOCK,LOCK.s);
  var out=[GEO.show];for(var i=1;i<LOCK.p.length;i++)if(LOCK.c[i]>LOCK.s)out.push(LOCK.p[i]);
  return {path:out,len:LOCK.L-LOCK.s+LOCK.tail,locked:1}}
function meAt(){return GEO.show||GEO.f||GEO.pos}

function geoText(){return GEO.err||(GEO.pos?(geoFar()?"ви за ≈ "+fmtKm(geoFar())+" від лікарні":"точність ±"+GEO.acc+" м"):(GEO.watch!==null?"визначаю…":"торкніться, щоб визначити"))}
var meD=null,meRAF=0;
function drawMe(){var g=document.getElementById("me");if(!GEO.pos||geoFar()){g.innerHTML="";meD=null;return}var m=meAt(),from=meD;meD=m.slice();cancelAnimationFrame(meRAF);
  g.innerHTML='<circle class="acc" cx="'+m[0].toFixed(1)+'" cy="'+m[1].toFixed(1)+'" r="'+Math.min(GEO.acc,200)+'"/>'+lbl("me",m[0].toFixed(1),m[1].toFixed(1),0,'<circle class="wave" r="7"/><circle class="dot" r="7"/>'+(HOLI?'<path class="rb" d="M-5.4 0H5.4M0-5.4V5.4"/><path class="bow" d="M0-8.4c-2.4-3.8-6.6-2.8-4.8.3 1.1 1.2 3.2.9 4.8-.3zM0-8.4c2.4-3.8 6.6-2.8 4.8.3-1.1 1.2-3.2.9-4.8-.3z"/>':'')+'<circle class="hit" r="16" data-me="1"/>');apply();
  if(!from||(FRM&&FRM.matches))return;var dd=Math.hypot(m[0]-from[0],m[1]-from[1]);if(dd<.8||dd>150)return;
  var L=g.querySelector(".lb.me"),A=g.querySelector(".acc"),t0=performance.now(),DUR=Math.min(900,280+dd*25);
  function fr(now){var u=Math.min(1,(now-t0)/DUR),e=1-Math.pow(1-u,3),px=from[0]+(m[0]-from[0])*e,py=from[1]+(m[1]-from[1])*e,k=vb.w/size().w;
    if(L)L.setAttribute("transform","translate("+px.toFixed(2)+" "+py.toFixed(2)+") rotate(0) scale("+k.toFixed(4)+")");if(A){A.setAttribute("cx",px.toFixed(1));A.setAttribute("cy",py.toFixed(1))}
    if(u<1)meRAF=requestAnimationFrame(fr)}
  meRAF=requestAnimationFrame(fr)}
/* перші 30 с — точно (GPS), щоб перша точка була правильною; далі — економно, щоб телефон не грівся. Під час «Вести» — точно весь час */
function geoStart(){
  if(!navigator.geolocation){GEO.err="цей браузер не підтримує геопозицію";return false}
  if(GEO.watch!==null)return true;GEO.err="";GEO.first=true;
  GEO.boost=true;clearTimeout(GEO.bt);GEO.bt=setTimeout(function(){GEO.boost=false;geoMode()},30000);
  var hi=wantHi();GEO.hi=hi;GEO.watch=navigator.geolocation.watchPosition(geoOk,geoFail,hi?{enableHighAccuracy:true,maximumAge:3000,timeout:20000}:{enableHighAccuracy:false,maximumAge:15000,timeout:20000});
  /* деякі вбудовані браузери не відповідають узагалі — за 15 с без жодної точки вважаємо, що геопозиції немає */
  clearTimeout(GEO.wd);GEO.wd=setTimeout(function(){if(GEO.watch!==null&&!GEO.pos)geoFail({code:2,stall:1})},15000);
  if(ENV.wv&&!hShown.app&&!GEO.pos)geoHelp("app");
  return true}
function geoStop(){clearTimeout(GEO.bt);clearTimeout(GEO.wd);GEO.boost=false;if(GEO.watch!==null){try{navigator.geolocation.clearWatch(GEO.watch)}catch(_){}}GEO.watch=null}
/* перезапустити стеження з іншою точністю */
/* точний GPS: під час «Вести», перші 30 с, у режимі «На авто» і коли телефон рухається швидше за ~15 км/год (людина в машині) */
function wantHi(){return !!(FOLLOW||GEO.boost||st.car||GEO.fast)}
function geoMode(){var hi=wantHi();if(GEO.watch===null||GEO.hi===hi)return;try{navigator.geolocation.clearWatch(GEO.watch)}catch(_){}GEO.watch=null;GEO.hi=hi;var f=GEO.first;
  GEO.watch=navigator.geolocation.watchPosition(geoOk,geoFail,hi?{enableHighAccuracy:true,maximumAge:3000,timeout:20000}:{enableHighAccuracy:false,maximumAge:15000,timeout:20000});GEO.first=f}
/* питаємо геопозицію, коли людина обрала, куди їй, — тоді зрозуміло, навіщо */
function geoAsk(){if(st.start==="geo"&&GEO.watch===null&&!GEO.err&&!(GEO.pos&&geoFar()&&Date.now()-GEO.t<120000))geoStart()}
function geoOk(p){
  if(p.timestamp&&Date.now()-p.timestamp>120000)return;   /* точці понад 2 хв — це «останнє відоме місце», а не де людина зараз (20.11.2026) */
  var x=(p.coords.longitude-LON0)*KX,y=(LAT0-p.coords.latitude)*KY,first=GEO.first,was=geoNear(),gap=Date.now()-GEO.t;
  /* швидкість: з GPS, а якщо телефон її не дає — з двох послідовних точних точок */
  var sp=p.coords.speed,tn=Date.now();
  if(sp==null||isNaN(sp)){sp=null;if(GEO.raw&&p.coords.accuracy<=30&&GEO.raw.a<=30){var dts=(tn-GEO.raw.t)/1000;if(dts>=.8&&dts<=10)sp=Math.hypot(x-GEO.raw.x,y-GEO.raw.y)/dts}}
  GEO.raw={x:x,y:y,t:tn,a:p.coords.accuracy};
  if(sp!=null){GEO.sp=GEO.sp==null?sp:GEO.sp*.4+sp*.6;var wasF=GEO.fast;
    if(GEO.sp>4)GEO.fastN=Math.max(GEO.fastN||0,0)+1;else if(GEO.sp<2)GEO.fastN=Math.min(GEO.fastN||0,0)-1;
    GEO.fast=GEO.fastN>=2?true:GEO.fastN<=-3?false:!!GEO.fast;if(GEO.fast!==wasF)setTimeout(geoMode,0)}
  GEO.pos=[x,y];GEO.acc=Math.round(p.coords.accuracy);GEO.t=Date.now();GEO.first=false;clearTimeout(GEO.wd);GEO.code=0;
  if(hOpen)hClose();   /* геопозиція таки працює — підказка більше не потрібна */
  cnt(p.coords.accuracy>500?"geo-pryblyzno":"geo-ok");
  if(first&&gap>60000)LOCK=null;   /* довго не було точок (сторінка була схована) — нитку будуємо заново */
  geoFilter(x,y,GEO.acc,GEO.t);
  if(GEO.boost&&GEO.acc<=20){GEO.boost=false;clearTimeout(GEO.bt);geoMode()}   /* точка вже точна — GPS більше не тримаємо */
  /* далеко від лікарні: стеження вимикаємо (не гріємо телефон), нитку лишаємо від зупинки, Google Карти — на кнопці */
  if(geoFar()){var fl=FOLLOW;geoStop();GEO.last=null;if(fl){FOLLOW=false;awake(false)}drawMe();
    var dst=st.b>=0||!!st.dept;if(st.start==="geo"||dst)render(first&&dst);
    if((first||fl)&&!dst)say("Ви за ≈ "+fmtKm(geoFar())+" від лікарні","оберіть, куди вам потрібно, — підкажемо, як дістатися")
    return}
  var now=geoNear();if(now&&GEO.acc<=100)GEO.good=true;
  var ls=st.start==="geo"&&now?lockStep():"none";if(ls==="reroute"){LOCK=null;REROUTES++}
  GEO.show=LOCK&&st.start==="geo"&&now?lockAt(LOCK,LOCK.s):GEO.f.slice();drawMe();
  var m=meAt(),moved=!GEO.last||Math.hypot(m[0]-GEO.last[0],m[1]-GEO.last[1])>(LOCK?3:12);
  if(st.start==="geo"&&(first||moved||was!==now||ls==="reroute")){render(first&&st.b>=0&&!FOLLOW);drawMe();GEO.last=meAt().slice()}
  if(FOLLOW){followCam(first);arrived();if(first)say("Ведемо від вас","карта рухатиметься разом з вами");else if(ls==="reroute")say("Нитку перебудовано","ви пішли іншим шляхом — ведемо звідси");return}
  if(!first&&was===now)return;GEO.last=meAt().slice();
  var dest=st.b>=0||!!st.dept;
  if(st.start!=="geo"){if(first)say("Ви тут","точність ±"+GEO.acc+" м");return}
  if(!now){if(dest)say("Поки не бачу, де ви точно","±"+GEO.acc+" м — вийдіть з будівлі на відкрите місце або оберіть «Звідки»");return}
  if(dest)say(HERE?"Ви вже тут":"Маршрут від вас",HERE?"надішліть рідним, як сюди дійти, — кнопка «Надіслати»":"точність ±"+GEO.acc+" м");
  else{say("Ви тут","точність ±"+GEO.acc+" м");fitBox(m[0]-90,m[1]-90,m[0]+90,m[1]+90,0)}
}
function geoFail(e){
  if(e&&e.code!==1&&GEO.pos)return;   /* сигнал тимчасово зник (у будівлі, між корпусами) — лишаємо останню точку, стеження триває */
  var byLead=FOLLOW;if(FOLLOW){FOLLOW=false;awake(false)}geoStop();
  GEO.code=e?e.code:2;GEO.err=ENV.wv?"не працює у вбудованому браузері "+(ENV.app||"застосунку"):e&&e.code===1?"доступ заборонено — дозвольте його в налаштуваннях браузера":"не вдалося визначити";
  if(st.start==="geo"){st.start=st.prevStart||null;st.auto=!st.start}st.prevStart=null;render(false);
  var S=st.start?STARTS[st.start]:null,dest=st.b>=0||!!st.dept,T=e&&e.code===1?"Геопозиція вимкнена":"Не вдалося визначити, де ви";
  if(hOpen)return;var hk=geoKind();if(!hShown[hk]){geoHelp(hk);return}
  if(!S&&dest&&byLead){askFrom(T);return}
  say(T,S&&S.here?"нитка — від місця, яке ви показали на карті":S?"маршрут від зупинки «"+stopNm(S)+"» — іншу можна обрати у «Звідки»":dest?"оберіть, звідки йдете, — кнопка «Звідки»":GEO.err)}

/* ---------- значки ---------- */
function ico(p,w){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(w||2)+'" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'}
/* автобус спереду, як у Google: лобове вікно, фари, колеса (19.11.2026) */
var BUS=ico('<path d="M5 17V6.6C5 4.4 7.5 3 12 3s7 1.4 7 3.6V17z"/><rect x="7.4" y="6.2" width="9.2" height="5.6" rx="1"/><path d="M7.5 17v2.5M16.5 17v2.5M3.5 8v2.5M20.5 8v2.5"/><circle cx="8.6" cy="14.4" r=".9" fill="currentColor" stroke="none"/><circle cx="15.4" cy="14.4" r=".9" fill="currentColor" stroke="none"/>');
var TRAM=ico('<rect x="6" y="8" width="12" height="11" rx="2.5"/><rect x="8.2" y="10.2" width="7.6" height="4.2" rx=".8"/><path d="M12 8V5M8.5 4h7M8.5 19l-1.5 2M15.5 19l1.5 2"/><circle cx="9.2" cy="16.6" r=".8" fill="currentColor" stroke="none"/><circle cx="14.8" cy="16.6" r=".8" fill="currentColor" stroke="none"/>');
function VEH(S){return S&&S.vt==="tram"?TRAM:BUS}
var CARI=ico('<path d="M4 16.5v-3.2l1.7-4.3A2 2 0 0 1 7.6 7.6h8.8a2 2 0 0 1 1.9 1.4l1.7 4.3v3.2zM6.6 16.5v2.2M17.4 16.5v2.2M4.6 12.6h14.8"/><circle cx="8" cy="14.6" r=".6" fill="currentColor"/><circle cx="16" cy="14.6" r=".6" fill="currentColor"/>');
var DOT=ico('<circle cx="12" cy="12" r="4" fill="currentColor"/><circle cx="12" cy="12" r="8.5"/>',2.2);
var NAV=ico('<path d="m3 11 18-8-8 18-2-8z"/>',2.2);
var STOPI=ico('<rect x="6.5" y="6.5" width="11" height="11" rx="2.5" fill="currentColor"/>');
var GMAP=ico('<path d="M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5zM9 4v13.5M15 6.5V20"/>');
var SHARE=ico('<path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>');
var PIN=ico('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>');
var UP=ico('<path d="m6 15 6-6 6 6"/>',2.4);
var ICONS={
 cross:'<path d="M9 4h6v5h5v6h-5v5H9v-5H4V9h5z"/>',
 steth:'<path d="M6 3v6a5 5 0 0 0 10 0V3M11 14v2a4 4 0 0 0 8 0v-2"/><circle cx="19" cy="12" r="2"/>',
 door:'<path d="M5 21V4a1 1 0 0 1 1-1h9l4 2v16M3 21h18M12 12v.01"/>',
 chair:'<path d="M7 21v-6h10v6M6 15V9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6M9 7V4h6v3"/>',
 build:'<path d="M4 21V8l8-5 8 5v13M9 21v-6h6v6M3 21h18"/>',
 cart:'<path d="M3 4h2.4l2.2 10.3a1.6 1.6 0 0 0 1.6 1.2h7.6a1.6 1.6 0 0 0 1.6-1.2L20.5 8H6.3"/><circle cx="9.6" cy="19.6" r="1.3"/><circle cx="17" cy="19.6" r="1.3"/>',
 fuel:'<path d="M5 21V5.2A2.2 2.2 0 0 1 7.2 3h5.6A2.2 2.2 0 0 1 15 5.2V21M3.5 21h13M7.5 7.5h5M15 10h1.6a1.9 1.9 0 0 1 1.9 1.9v4.4a1.5 1.5 0 0 0 3 0V8.2l-2.6-2.7"/>',
 box:'<path d="M12 3 4 7.2v9.6L12 21l8-4.2V7.2z"/><path d="M4 7.2 12 11.4l8-4.2M12 11.4V21M8 5.1l8 4.2"/>'
};
/* ---------- відвідування (поки лише 16 відділення): розклад і що зараз, за київським часом ---------- */
function kyivMin(){var d=new Date();
  for(var z=["Europe/Kyiv","Europe/Kiev"],i=0;i<z.length;i++)try{var p=new Intl.DateTimeFormat("en-GB",{timeZone:z[i],hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(d),h=0,m=0;
    p.forEach(function(x){if(x.type==="hour")h=+x.value;if(x.type==="minute")m=+x.value});return h%24*60+m}catch(_){}
  return d.getHours()*60+d.getMinutes()}
function hm(m){return Math.floor(m/60)+":"+("0"+m%60).slice(-2)}
function visText(v){return "щоденно "+v.o.map(function(o){return hm(o[0])+"–"+hm(o[1])}).join(" і ")}
function visNow(v){var m=kyivMin(),i,o;
  for(i=0;i<v.o.length;i++){o=v.o[i];if(m>=o[0]&&m<o[1])return {ok:1,t:"Зараз можна — до "+hm(o[1])+(o[1]-m<=30?" (ще "+(o[1]-m)+" хв)":"")}}
  if(v.q&&m>=v.q[0]&&m<v.q[1])return {t:"Зараз тиха година — приходьте з "+hm(v.q[1])};
  for(i=0;i<v.o.length;i++)if(m<v.o[i][0])return {t:"Зараз зачинено — відкриється о "+hm(v.o[i][0])};
  return {t:"На сьогодні вже все — завтра з "+hm(v.o[0][0])}}
function visBlock(v){var n=visNow(v);
  return '<div class="vis"><b>Передачі й відвідування</b><span class="vs '+(n.ok?"ok":"no")+'">'+esc(n.t)+'</span><p>Прийом передач та відвідування пацієнтів '+esc(visText(v))+'.'+(v.q?'<br>Тиха година '+hm(v.q[0])+'–'+hm(v.q[1])+'.':'')+'</p></div>'}
function tels(list){return '<div class="tels">'+list.map(function(t){return '<a class="gbtn" href="tel:+38'+t.replace(/\D/g,"")+'">'+ico('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>')+t+'</a>'}).join("")+'</div>'}
function mins(m){return Math.max(1,Math.ceil(m/70))}

/* ---------- підказка ---------- */
/* віконце вгорі. Дотик до нього не проходить на карту під ним: закриває віконце або виконує кнопку в ньому */
var toastT=0,toast=document.getElementById("toast"),TA=null;
function hideToast(){toast.classList.remove("on");document.body.classList.remove("toasting");TA=null}
function say(t,s,acts,cap,ms){TA=acts&&acts.length?acts:null;
  toast.innerHTML='<b>'+esc(t)+'</b>'+(s?'<span>'+esc(s)+'</span>':'')+(TA?'<div class="ta">'+(cap?'<small>'+esc(cap)+'</small>':'')+TA.map(function(a,i){return a.href?'<a class="gbtn" data-a="'+i+'" href="'+a.href.replace(/&/g,"&amp;")+'" target="_blank" rel="noopener">'+esc(a.t)+'</a>':'<button type="button" class="gbtn" data-a="'+i+'">'+esc(a.t)+'</button>'}).join("")+'</div>':'');
  toast.classList.add("on");document.body.classList.add("toasting");clearTimeout(toastT);toastT=setTimeout(hideToast,ms||(TA?8000:2800))}
document.addEventListener("pointerdown",function(e){if(toast.classList.contains("on")&&!toast.contains(e.target))hideToast()},true);
toast.addEventListener("click",function(e){var b=e.target.closest("[data-a]"),a=b&&TA?TA[+b.dataset.a]:null;clearTimeout(toastT);if(a&&a.href){if(a.go)a.go();setTimeout(hideToast,300);return}hideToast();if(a&&a.go)a.go()});

["pTo","pFrom"].forEach(function(id){document.getElementById(id).addEventListener("click",function(e){
  if(e.target.closest("button,a,input,textarea,select,label,[role=button],[data-d]"))return;pop(null)})});
/* ---------- шапка: назву лікарні видно кілька секунд, потім вона згортається до знака «А»; дотик до «А» розгортає ---------- */
var mast=document.getElementById("mast"),osm=document.getElementById("osm"),mastA=document.getElementById("mastA"),mastT=0,mastArmed=false;
function mastFold(v){mast.classList.toggle("mini",v);osm.classList.toggle("on",!v);mastA.setAttribute("aria-expanded",!v)}
function mastOpen(ms){mastFold(false);clearTimeout(mastT);mastT=setTimeout(function(){mastFold(true)},ms)}
function mastArm(){if(mastArmed||cur)return;mastArmed=true;mastOpen(5000)}
mastA.onclick=function(){if(mast.classList.contains("mini"))mastOpen(6000);else{clearTimeout(mastT);mastFold(true)}};

/* ---------- легенда ---------- */
var lg=document.getElementById("legend"),ib=document.getElementById("info");
function legend(v){lg.classList.toggle("on",v);ib.setAttribute("aria-expanded",v);if(v){var r=ib.getBoundingClientRect();lg.style.bottom=Math.min(innerHeight-r.top+10,innerHeight-lg.offsetHeight-12)+"px"}}
ib.onclick=function(e){e.stopPropagation();pop(null);legend(!lg.classList.contains("on"))};
lg.onclick=function(e){if(!e.target.closest("a"))legend(false)};

/* ---------- тема: світла / темна (19.11.2026). Без вибору — як у телефоні; вибір пам’ятаємо.
   Якщо обрана тема збігається з телефоном — вибір скидаємо, і карта знову йде за налаштуваннями телефона ---------- */
var MQD=window.matchMedia?matchMedia("(prefers-color-scheme: dark)"):null,thB=document.getElementById("thm");
function isDark(){var c=document.documentElement.classList;return c.contains("dark")||(!c.contains("light")&&!!(MQD&&MQD.matches))}
function themeSync(){var d=isDark(),c=document.documentElement.classList,man=c.contains("dark")||c.contains("light");
  /* логотип-картинки й колір рядка браузера теж слухають вибір, а не лише телефон */
  document.querySelectorAll('source[media*="prefers-color-scheme"],source[data-m]').forEach(function(x){if(!x.dataset.m)x.dataset.m=x.media;x.media=man?(d?"all":"not all"):x.dataset.m});
  document.querySelectorAll('meta[name="theme-color"]').forEach(function(x){if(!x.dataset.m)x.dataset.m=x.getAttribute("media")||"";x.setAttribute("media",man?(/dark/.test(x.dataset.m)===d?"all":"not all"):x.dataset.m)});
  if(thB){thB.setAttribute("aria-label",d?"Світла тема":"Темна тема");thB.setAttribute("aria-pressed",d?"true":"false")}}
function themeFlip(){var c=document.documentElement.classList,want=isDark()?"light":"dark",sys=MQD&&MQD.matches?"dark":"light";
  var go=function(){c.remove("dark","light");if(want!==sys)c.add(want);try{if(want!==sys)localStorage.setItem("ariadna-theme",want);else localStorage.removeItem("ariadna-theme")}catch(_){}themeSync()};
  if(document.startViewTransition&&!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches))document.startViewTransition(go);else go()}
if(thB)thB.onclick=function(e){e.stopPropagation();themeFlip()};
if(MQD){if(MQD.addEventListener)MQD.addEventListener("change",themeSync);else if(MQD.addListener)MQD.addListener(themeSync)}
themeSync();

/* ---------- віконця: «Куди», «Звідки», «Докладніше». Зникають після вибору або дотику будь-де поза ними ---------- */
var bTo=document.getElementById("bTo"),bFrom=document.getElementById("bFrom"),res=document.getElementById("res");
var POP={to:document.getElementById("pTo"),from:document.getElementById("pFrom"),det:document.getElementById("pDet")},cur=null;
var sIn=document.getElementById("q"),sBox=document.getElementById("srch"),found=document.getElementById("found"),pkMain=document.getElementById("pkMain");
function pop(name,quiet){
  if(cur===name)return;lpHide();
  if(cur){POP[cur].classList.remove("on");if(cur==="to"){sIn.blur();setTimeout(function(){if(cur!=="to"){POP.to.classList.remove("top");sIn.value="";filter()}},260)}}
  cur=name;document.body.classList.toggle("popping",!!name);
  bTo.setAttribute("aria-expanded",name==="to");bFrom.setAttribute("aria-expanded",name==="from");res.setAttribute("aria-expanded",name==="det");
  if(!name){mastArm();if(dockOpen)foldSoon(1500);return}
  legend(false);if(name==="from")drawFrom();
  POP[name].classList.add("on");POP[name].querySelector(".pk-body").scrollTop=0;
  if(!quiet)try{if(!(history.state&&history.state.ar))history.pushState({ar:1},"")}catch(_){}
  setTimeout(function(){if(cur!==name)return;POP[name].focus({preventScroll:true});var c=POP[name].querySelector('[aria-pressed="true"]');if(c&&c.scrollIntoView)c.scrollIntoView({block:"nearest"})},60);
}
bTo.onclick=function(){pop(cur==="to"?null:"to")};
bFrom.onclick=function(){pop(cur==="from"?null:"from")};
res.onclick=function(e){if(e.target.closest("#rx")){cancelAll();return}var g=e.target.closest("#go");if(g){if(g.dataset.k==="share"){cnt("nadislaty");share()}else if(g.dataset.k==="pick")pickStart();else if(g.dataset.k!=="gm")lead();return}if(e.target.closest("a"))return;pop(cur==="det"?null:"det")};
res.onkeydown=function(e){if((e.key==="Enter"||e.key===" ")&&!e.target.closest("a,#go,#rx")){e.preventDefault();pop(cur==="det"?null:"det")}};
document.getElementById("scrim").onclick=function(){pop(null)};
document.getElementById("pToX").onclick=function(){pop(null)};
addEventListener("keydown",function(e){if(e.key==="Escape"){pop(null);legend(false)}});
addEventListener("popstate",function(){if(cur)pop(null)});
/* клавіатура телефона: віконце пошуку перестрибує вгору, щоб його не закрило */
if(window.visualViewport){var vvf=function(){var r=document.documentElement.style;r.setProperty("--vvh",visualViewport.height+"px");r.setProperty("--vvt",visualViewport.offsetTop+"px")};visualViewport.addEventListener("resize",vvf);visualViewport.addEventListener("scroll",vvf);vvf()}
sIn.addEventListener("focus",function(){if(innerWidth<900)POP.to.classList.add("top")});

/* плитки й номери */
var tiles=document.getElementById("tiles"),nums=document.getElementById("nums");
D.forEach(function(d){
  if(d.x)return;
  var b=document.createElement("button");b.type="button";b.dataset.d=d.id;
  if(d.q){b.className="tile"+(d.id==="kab"?" wide":"");b.innerHTML='<span class="ic">'+ico(ICONS[d.ic])+'</span><span><b>'+esc(d.t)+'</b><small>'+esc(d.sub)+'</small></span>';tiles.appendChild(b)}
  else{b.className="num";b.textContent=d.id;b.setAttribute("aria-label","Відділення номер "+d.id);nums.appendChild(b)}
  b.onclick=function(){choose(d.id)};
});
/* поруч з лікарнею (19.11.2026): магазини й пошта — пункти з LAND, у яких є near */
var nearT=document.getElementById("near");
SCULPT.concat(LAND).forEach(function(p,i){if(!p.near||!nearT)return;var b=document.createElement("button");b.type="button";b.className="tile";
  b.innerHTML='<span class="ic">'+ico(ICONS[p.near.ic])+'</span><span><b>'+esc(p.near.t)+'</b><small>'+esc(p.near.sub)+'</small></span>';
  b.onclick=function(){choose("poi"+i)};nearT.appendChild(b)});
function flT(f){return f+(typeof f==="string"&&/^\d/.test(f)?" поверхи":" поверх")}   /* 3 поверх · 1–2 поверхи · цокольний поверх */
function choose(id){var d=dById(id);cnt("kudy-"+(SLUGS[id]||"inshe"));LOCK=null;st.dept=id;dockOpen=false;st.carIn=null;st.b=d.k===null?-1:bIndex(d.k);pop(null);geoAsk();render(true);syncUrl()}

/* пошук: номер, назва, корпус, скульптура */
function norm(s){return String(s).toLowerCase().replace(/[’'`ʼ"«»№#.,()—–-]/g," ").replace(/\s+/g," ").trim()}
var IDX=[];
D.forEach(function(d){
  IDX.push({t:dTitle(d),s:[(d.k?"корпус "+d.k:"корпус не вказано"),d.fl?flT(d.fl):"",d.q||d.x?(d.note||""):(d.d||"")].filter(Boolean).join(" · "),num:d.q||d.x?null:d.id,q:d.q,x:d.x,ck:d.k||null,
    h:norm([d.t||"",d.full||"",d.d||"",d.kw||"",d.q||d.x?"":"відділення відділ "+d.id,d.k?"корпус "+d.k:""].join(" ")),to:d.id,go:function(){choose(d.id)}})});
B.forEach(function(b,i){if(!b.k&&!b.n)return;var inside=inK(b.k).map(dName);
  IDX.push({t:b.k?"Корпус "+b.k:b.n,s:b.k?(b.n||(inside.length?"тут: "+inside.join(", "):"")):"",bk:b.k||null,
    h:norm([b.k?"корпус "+b.k+" будівля":"",b.n||"",b.kw||""].join(" ")),to:b.k?"k"+b.k:null,go:function(){pop(null);pickBuilding(i)}})});
POIS.forEach(function(p,i){D.push({id:"poi"+i,x:1,poi:1,t:p.n,short:p.sh||p.n,k:null,door:p.door||[p.x,p.y],fl:p.fl,note:p.d});
  IDX.push({t:p.n,s:p.d,poi:1,h:norm(p.n+" "+p.d+" "+(p.kw||"")),to:"poi"+i,go:function(){choose("poi"+i)}})});
IDX.forEach(function(e){e.ht=e.h.split(" ")});
function tokOk(e,t){if(/^\d+$/.test(t))return e.ht.indexOf(t)>=0;if(e.h.indexOf(t)>=0)return true;var c=t.length>=8?3:t.length>=6?2:t.length>=5?1:0;return c>0&&e.h.indexOf(t.slice(0,t.length-c))>=0}
var hits=[];
function filter(){
  var q=norm(sIn.value).replace(/(^| )к(орп)? ?(\d+)/g,"$1корпус $3");sBox.classList.toggle("has",!!sIn.value);
  if(!q){found.hidden=true;pkMain.hidden=false;found.innerHTML="";hits=[];return}
  var tk=q.split(" "),nums=tk.filter(function(t){return /^\d+$/.test(t)}),byK=/(^| )корп/.test(q)&&nums.length>0;
  hits=IDX.filter(function(e){if(byK)return nums.indexOf(e.bk)>=0||nums.indexOf(e.ck)>=0;return tk.every(function(t){return tokOk(e,t)})}).map(function(e){
    var sc=e.poi?5:3;if(byK)sc=e.bk?0:e.q?1:e.x?4:2;else if(e.num&&nums.indexOf(e.num)>=0)sc=0;else if(e.bk&&nums.indexOf(e.bk)>=0)sc=1;else if(e.q&&norm(e.t).indexOf(tk[0])===0)sc=2;return {e:e,sc:sc}})
    .sort(function(a,b){return a.sc-b.sc}).slice(0,12).map(function(x){return x.e});
  pkMain.hidden=true;found.hidden=false;
  found.innerHTML=hits.length?hits.map(function(e,i){return '<button type="button" data-i="'+i+'"><span class="n'+(e.num||e.bk?"":" g")+'">'+(e.num?e.num:e.bk?"к"+e.bk:PIN)+'</span><span><b>'+esc(e.t)+'</b>'+(e.s?'<small>'+esc(e.s)+'</small>':'')+'</span></button>'}).join("")
    :'<p class="pk-note">Нічого не знайдено. Спробуйте номер відділення або номер корпусу. Якщо не знаєте, куди вам, — у приймальному відділенні підкажуть.</p><button type="button" data-pr="1"><span class="n g">'+ico(ICONS.cross)+'</span><span><b>Приймальне відділення</b><small>корпус 1 · працює цілодобово</small></span></button>';
}
sIn.addEventListener("input",filter);
sIn.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();if(hits[0])hits[0].go()}});
found.onclick=function(e){var b=e.target.closest("button");if(!b)return;if(b.dataset.pr)choose("pr");else if(hits[+b.dataset.i])hits[+b.dataset.i].go()};
/* ---------- утримання пункту в «Куди» (0,48 с) — над ним спливає «Поділитися»: посилання саме на цей пункт ---------- */
var lpB=document.createElement("div"),LP={t:0,el:null,x:0,y:0,fired:false,h:0};lpB.className="lp";lpB.setAttribute("role","dialog");document.body.appendChild(lpB);
function lpHide(){if(lpB){lpB.classList.remove("on");clearTimeout(LP.h)}}
function lpTarget(el){
  if(el.dataset.d){var d=dById(el.dataset.d);return d?{to:d.id,t:dTitle(d),sh:dShort(d)}:null}
  if(el.dataset.pr){var p=dById("pr");return {to:"pr",t:dTitle(p),sh:dShort(p)}}
  var e=hits[+el.dataset.i];return e&&e.to?{to:e.to,t:e.t,sh:e.num?"№ "+e.num:e.t}:null}
function lpShow(el,tg){var r=el.getBoundingClientRect(),below=r.top<96;
  lpB.innerHTML='<button type="button" class="lp-b">'+SHARE+'<span>Поділитися</span><small>'+esc(tg.sh)+'</small></button>';
  lpB.classList.remove("on");lpB.classList.toggle("below",below);
  var tx=r.left+r.width/2,hw=lpB.offsetWidth/2+8,cx=Math.max(hw,Math.min(innerWidth-hw,tx));
  lpB.style.left=cx+"px";lpB.style.top=(below?r.bottom:r.top)+"px";lpB.style.setProperty("--ax",Math.max(-hw+22,Math.min(hw-22,tx-cx))+"px");
  void lpB.offsetWidth;lpB.classList.add("on");
  lpB.firstChild.onclick=function(e){e.stopPropagation();lpHide();shareTo(tg.to,tg.t)};
  try{navigator.vibrate&&navigator.vibrate(12)}catch(_){}
  clearTimeout(LP.h);LP.h=setTimeout(lpHide,6000)}
function lpCancel(){clearTimeout(LP.t);if(LP.el)LP.el.classList.remove("lp-hold");LP.el=null}
POP.to.addEventListener("pointerdown",function(e){LP.fired=false;lpHide();var el=e.target.closest("[data-d],[data-i],[data-pr]");if(!el||e.button>0)return;
  lpCancel();LP.el=el;LP.x=e.clientX;LP.y=e.clientY;el.classList.add("lp-hold");
  LP.t=setTimeout(function(){var tg=lpTarget(el);lpCancel();if(!tg)return;LP.fired=true;lpShow(el,tg)},480)});
POP.to.addEventListener("pointermove",function(e){if(LP.el&&Math.hypot(e.clientX-LP.x,e.clientY-LP.y)>10)lpCancel()});
["pointerup","pointercancel"].forEach(function(n){POP.to.addEventListener(n,lpCancel)});
POP.to.addEventListener("scroll",lpCancel,true);
/* після утримання пункт не обирається */
POP.to.addEventListener("click",function(e){if(LP.fired&&!lpB.contains(e.target)){LP.fired=false;e.stopPropagation();e.preventDefault()}},true);
/* права кнопка миші чи системне утримання — те саме віконце, без меню браузера */
POP.to.addEventListener("contextmenu",function(e){var el=e.target.closest("[data-d],[data-i],[data-pr]");if(!el)return;e.preventDefault();if(LP.fired)return;var tg=lpTarget(el);lpCancel();if(tg){LP.fired=true;lpShow(el,tg)}});
document.addEventListener("pointerdown",function(e){if(lpB.classList.contains("on")&&!lpB.contains(e.target)&&!POP.to.contains(e.target))lpHide()},true);
document.getElementById("qx").onclick=function(e){e.preventDefault();sIn.value="";filter();sIn.focus()};

/* ---------- торкання карти: обрати; повторний дотик до обраного знімає вибір ---------- */
/* подвійний дотик — наблизити вдвічі в цьому місці; одиночний спрацьовує, якщо за 0,26 с не було другого */
var tapW=null;
function tapOrDouble(x,y){var now=performance.now();
  if(tapW&&now-tapW.t<300&&Math.hypot(x-tapW.x,y-tapW.y)<32){clearTimeout(tapW.id);tapW=null;zoomFly(.5,x,y);return}
  if(tapW){clearTimeout(tapW.id);var o=tapW;tapW=null;tapAt(o.x,o.y)}
  tapW={t:now,x:x,y:y,id:setTimeout(function(){tapW=null;tapAt(x,y)},260)}}
function zoomFly(f,cx,cy){var s=size(),px=(cx-s.l)/s.w,py=(cy-s.t)/s.h,wx=vb.x+px*vb.w,wy=vb.y+py*vb.h,nw=Math.min(WMAX,WMAX*s.w/s.h,Math.max(WMIN,vb.w*f));fly({x:wx-px*nw,y:wy-py*nw*s.h/s.w,w:nw},320)}
/* потягнули карту під час «Вести» — карта більше не йде за вами */
function camFree(){if(!FOLLOW)return;if(CAM){CAM=false;document.body.classList.add("cam-free");
    if(camN++<2)say("Ведення триває","карта повернеться до вас за 10 с — або натисніть ⌖")}
  clearTimeout(camT);camT=setTimeout(camBack,10000)}
function camBack(){clearTimeout(camT);document.body.classList.remove("cam-free");if(!FOLLOW){CAM=true;return}CAM=true;followCam(false,true)}
svg.addEventListener("pointermove",function(){if(FOLLOW&&moved>14&&Object.keys(ptrs).length)camFree()});
svg.addEventListener("wheel",function(){if(FOLLOW)camFree()},{passive:true});
/* ⌖ під час ведення, коли карту відсунули, — назад до вас */
(function(){var L=document.getElementById("loc"),old=L.onclick;L.onclick=function(e){if(FOLLOW&&!CAM){camBack();return}return old&&old.call(L,e)}})();
/* вхід на карті: що за ним і кнопки, щоб прокласти маршрут */
function entCard(id){var e=ENT[id],own=D.filter(function(d){return d.ent===id}),list=own.length?own:D.filter(function(d){return (d.ents||[]).indexOf(id)>=0});
  var acts=list.map(function(d){return {t:d.q||d.x?(d.short||d.t):"№ "+d.id,go:function(){choose(d.id)}}});
  if(!acts.length&&e.k&&bIndex(e.k)>=0)acts=[{t:"Корпус "+e.k,go:function(){pickBuilding(bIndex(e.k))}}];
  say(e.n,e.d,acts,"Прокласти маршрут:")}
function tapAt(x,y){
  if(PICK){pickAt(x,y);return}
  legend(false);
  var el=document.elementFromPoint(x,y);if(!el||!el.dataset)return;var ds=el.dataset,dg=el.closest&&el.closest(".door");
  if(ds.ent===undefined&&dg&&dg.dataset.en)ds={ent:dg.dataset.en};
  if(ds.pin!==undefined){clearDest();return}
  if(ds.me!==undefined){if(st.start==="geo")clearStart();else setStart("geo");return}
  if(ds.stop!==undefined&&STARTS[ds.stop]){if(st.start===ds.stop)clearStart();else setStart(ds.stop);return}
  if(ds.poi!==undefined){var pi=+ds.poi,p=POIS[pi];say(p.n,p.d,[{t:"Сюди",go:function(){choose("poi"+pi)}}],"Прокласти маршрут:");return}
  if(ds.ent!==undefined&&ENT[ds.ent]){entCard(ds.ent);return}
  if(ds.b!==undefined){bCard(+ds.b);return}
}
/* корпус на карті: віконце з кнопками — весь корпус або конкретне відділення в ньому */
function bCard(i){var b=B[i];
  if(!b.k&&!b.n){say("Допоміжна будівля","відділень тут немає");return}
  var list=b.k?D.filter(function(x){return x.k===b.k&&["lift","prm","prw"].indexOf(x.id)<0}):[],acts=[{t:b.k?"Корпус "+b.k:"Сюди",go:function(){pickBuilding(i)}}].concat(list.map(function(d){return {t:d.q||d.x?(d.short||d.t):"№ "+d.id,go:function(){choose(d.id)}}}));
  say(b.k?"Корпус "+b.k:b.n,b.k?(b.n||b.nt||(list.length?"":"відділень тут немає")):(b.nt||""),acts,"Прокласти маршрут:")}
function pickBuilding(i){
  var b=B[i];
  if(!b.k&&!b.n){say("Допоміжна будівля","відділень тут немає");return}
  LOCK=null;st.b=i;st.dept=null;dockOpen=false;st.carIn=null;geoAsk();render(true);syncUrl();
}
function setStart(k){st.start=k;st.auto=false;LOCK=null;dockOpen=false;if(k==="geo"){st.carIn=null;GEO.err="";if(!(GEO.pos&&geoFar()&&Date.now()-GEO.t<120000))geoStart()}render(st.b>=0);if(st.b<0&&k!=="geo")say(STARTS[k].here?STARTS[k].name:"Зупинка «"+STARTS[k].name+"»","початок маршруту обрано")}
function clearDest(){if(st.b<0&&!st.dept)return;if(FOLLOW){FOLLOW=false;awake(false);geoMode()}st.dept=null;st.b=-1;if(cur==="det")pop(null);render(false);syncUrl();say("Пункт призначення знято","оберіть «Куди» або торкніться будівлі")}
function clearStart(){st.start=null;st.auto=false;render(false);say("Початок маршруту знято","оберіть «Звідки» або торкніться зупинки")}

/* ---------- нижні кнопки, смужка з відповіддю, маршрут ---------- */
var dock=document.getElementById("dock"),resRow=document.getElementById("resRow"),bMini=document.getElementById("bMini"),lastBox=null,lastRoutes=null,curTitle="",dockOpen=false,animT=0;
/* на телефоні, коли маршрут прокладено, «Куди» і «Звідки» згортаються в одну кнопку ліворуч, а банер маршруту стає з нею в один рядок */
function wantMin(){return innerWidth<900&&!resRow.hidden&&(!!st.start||st.car)&&(!!st.dept||st.b>=0)&&!dockOpen}
function syncDock(){var m=wantMin();if(m===dock.classList.contains("min"))return;
  dock.classList.add("anim");dock.classList.toggle("min",m);clearTimeout(animT);animT=setTimeout(function(){dock.classList.remove("anim")},1700)}
/* де буде верх панелі, коли вона закінчить згортатися чи розгортатися */
function dockTop(){var r=dock.getBoundingClientRect(),rh=resRow.hidden?0:res.offsetHeight,h=dock.classList.contains("min")?rh:(rh?rh+8:0)+(bTo.offsetHeight||58);return r.bottom-h}
/* правий стовпчик кнопок має власну анімацію, синхронну з нижньою панеллю (20.11.2026, Андрій):
   стовпчик одразу ставимо на кінцеве місце (на 10 пкс над панеллю, якою вона стане), а зсув від старого місця «відпускаємо»
   анімаціями з тими самими тривалістю, затримкою й плавністю, що й у панелі:
   — банер з’являється чи зникає: 0,45 с, як його поява (rise);
   — ряд «Куди/Звідки» згортається чи розгортається: 0,95 с, при згортанні — ще 0,15 с затримки, як у .dk-row.
   Дві частини руху — на різних властивостях (margin-bottom і bottom), тому складаються. Так банер і кнопки не заходять на стовпчик, а він — на них. */
var ctlEl=document.getElementById("ctl"),ctlA=[],ctlS=null,ctlB=null;
var RISE="cubic-bezier(.32,.72,0,1)",ROWE="cubic-bezier(.45,0,.2,1)",RM=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)");
function dockH(){var t=dockTop();document.documentElement.style.setProperty("--dockh",(dock.getBoundingClientRect().bottom-t)+"px");
  var now={res:!resRow.hidden,min:dock.classList.contains("min"),bh:resRow.hidden?(ctlS?ctlS.bh:68):resRow.offsetHeight+8},prev=ctlS;ctlS=now;
  var B=innerWidth>=900?16:Math.round(innerHeight-t+10);
  if(prev&&prev.res===now.res&&prev.min===now.min&&ctlB!==null&&Math.abs(B-ctlB)<1)return;   /* нічого не змінилося — анімацію, що йде, не чіпаємо */
  var vis=innerHeight-ctlEl.getBoundingClientRect().bottom;ctlA.forEach(function(a){try{a.cancel()}catch(_){}});ctlA=[];
  ctlEl.style.bottom=B+"px";ctlB=B;var D=Math.round(B-vis),still=!prev||innerWidth>=900||!ctlEl.animate||(RM&&RM.matches);
  /* банер з’являється — він не спалахує над кнопками, а виростає з-над них (висота 0 → повна за 0,45 с), і стовпчик піднімається тим самим рухом */
  var grow=prev&&!prev.res&&now.res&&!still;
  if(grow){var H=resRow.offsetHeight;resRow.style.overflow="hidden";
    try{var ga=resRow.animate([{height:"0px",marginBottom:"-8px"},{height:H+"px",marginBottom:"0px"}],{duration:450,easing:RISE});ga.onfinish=ga.oncancel=function(){resRow.style.overflow=""}}catch(_){resRow.style.overflow=""}}
  if(still||Math.abs(D)<1)return;
  var an=dock.classList.contains("anim"),rowT={duration:an?950:250,delay:an&&now.min&&!prev.min?150:0,easing:an?ROWE:"ease-out"},
      riseT={duration:450,delay:0,easing:RISE},bp=0,jump=0;
  if(grow&&!prev.min)bp=now.bh;                               /* частина руху — разом із банером, що виростає */
  else if(prev.res&&!now.res&&!prev.min)bp=-prev.bh;          /* банер зник — стовпчик спускається так само плавно */
  else if(prev.res&&now.res)jump=now.bh-prev.bh;              /* банер миттєво став вищим чи нижчим (рядок «звідки → куди») — стрибає разом з ним */
  /* дві частини руху — на bottom і margin-bottom: обидві рахуються в тому ж кадрі, що й висота банера та відступ ряду кнопок,
     тож навіть коли телефон зайнятий (малює маршрут), стовпчик не забігає вперед панелі й не відстає від неї */
  var rest=D-bp-jump;
  function go(prop,d,T){var a=prop==="bottom"?[{bottom:(B-d)+"px"},{bottom:B+"px"}]:[{marginBottom:(-d)+"px"},{marginBottom:"0px"}];
    try{ctlA.push(ctlEl.animate(a,{duration:T.duration,delay:T.delay,easing:T.easing,fill:"backwards"}))}catch(_){}}
  if(bp)go("marginBottom",bp,riseT);
  if(Math.abs(rest)>=1)go("bottom",rest,rowT)}
var foldT=0;
function foldDock(){clearTimeout(foldT);if(!dockOpen)return;dockOpen=false;syncDock();dockH()}
function foldSoon(ms){clearTimeout(foldT);foldT=setTimeout(function(){if(!cur)foldDock()},ms)}
bMini.onclick=function(){dockOpen=true;syncDock();dockH();foldSoon(5000)};
document.addEventListener("pointerdown",function(e){if(!dockOpen||cur||(e.target.closest&&e.target.closest("#dock")))return;foldDock()},true);
addEventListener("resize",function(){syncDock();dockH()});
var CARN={e1:{t:"В’їзд з вул. Олени Теліги",s:"дорогою вглиб гаю, біля зупинки «Лікарня ім. Павлова»",sh:"з Теліги",h:"Заїжджайте з вул. Олени Теліги дорогою, що відходить від вулиці вглиб гаю, біля зупинки «Лікарня ім. Павлова»."},
  e3:{t:"В’їзд з вул. Кирилівської",s:"Врубелівським узвозом, біля зупинки «вул. Кирилівська»",sh:"з Кирилівської",h:"Заїжджайте з вул. Кирилівської Врубелівським узвозом до в’їзду на територію."}};
function carHint(k){return (k==="geo"?"Маршрут від вас дорогами лікарні.":CARN[k].h)+" Пунктир — машиною, суцільна нитка — пішки. Окремих місць для паркування поки немає: ставте машину так, щоб не перекрити проїзд швидкій. На шлагбаум біля адміністрації не розраховуйте — маршрут його оминає."}
function drawFrom(){
  if(st.car){drawFromCar();return}
  var keys=startKeys(),h='<div class="pk-h">Звідки ви йдете?</div><div class="from">';STARTS.geo.street=GEO.err&&!GEO.pos?"не працює — торкніться, щоб дізнатися, що зробити":geoText();
  keys.forEach(function(k){var S=STARTS[k],R=lastRoutes?lastRoutes[k]:null;
    h+='<button type="button" data-e="'+k+'" class="'+(S.here?"here":S.geo?"geo":"")+'" aria-pressed="'+(k===st.start)+'"><span class="bus">'+(S.here||S.geo?DOT:VEH(S))+'</span><span class="ft"><b>'+esc(S.here||S.geo?S.name:"Зупинка «"+S.name+"»")+'</b><small>'+esc(S.street+(S.tr?" · "+S.tr:""))+'</small></span>'+(st.b>=0?'<span class="m">'+(R?mins(R.len)+" хв":"—")+'</span>':'')+'</button>'});
  h+='<button type="button" data-e="__pick" class="here"><span class="bus">'+PIN+'</span><span class="ft"><b>Показати на карті</b><small>торкніться місця, де ви стоїте</small></span></button>';
  h+='</div>'+switches();
  var bd=document.getElementById("fromBody");bd.innerHTML=h;
  bd.querySelectorAll(".from button").forEach(function(x){x.onclick=function(){pop(null);if(x.dataset.e==="__pick"){pickStart();return}if(x.dataset.e==="geo"&&GEO.err&&!GEO.pos){geoHelp();return}if(x.dataset.e!==st.start)setStart(x.dataset.e);else if(lastBox)fitBox.apply(null,lastBox)}});
  bindSwitches();
}
function switches(px){px=px||"";return '<label class="sw"><input type="checkbox" id="'+px+'car"'+(st.car?" checked":"")+'><span class="k"></span><span>На авто</span></label><label class="sw"><input type="checkbox" id="'+px+'ns"'+(st.noSteps?" checked":"")+'><span class="k"></span><span>Маршрут без сходів</span></label>'}
function bindSwitches(px){px=px||"";
  document.getElementById(px+"ns").onchange=function(e){st.noSteps=e.target.checked;save();render(true)};
  document.getElementById(px+"car").onchange=function(e){st.car=e.target.checked;st.carIn=null;geoMode();render(true)}}
/* «Звідки» на авто: два в’їзди на територію і «Від мене» */
function drawFromCar(){
  var h='<div class="pk-h">Звідки заїжджаєте?</div><div class="from">',ks=Object.keys(CAR_IN);if(navigator.geolocation)ks.unshift("geo");
  ks.forEach(function(k){var geo=k==="geo",R=geo?null:(lastCar?lastCar[k]:null),on=k===lastCarK;
    h+='<button type="button" data-c="'+k+'" class="'+(geo?"geo":"")+'" aria-pressed="'+on+'"><span class="bus">'+(geo?DOT:CARI)+'</span><span class="ft"><b>'+esc(geo?"Моє місцезнаходження":CARN[k].t)+'</b><small>'+esc(geo?"якщо ви вже на території":CARN[k].s)+'</small></span>'+(st.b>=0&&!geo?'<span class="m">'+(R?R.min+" хв":"—")+'</span>':'')+'</button>'});
  h+='</div>'+switches()+'<p class="pk-note">Оберіть, з якого боку заїжджаєте, — біля кожного в’їзду видно, скільки хвилин до місця.</p>';
  var bd=document.getElementById("fromBody");bd.innerHTML=h;
  bd.querySelectorAll(".from button").forEach(function(x){x.onclick=function(){pop(null);var k=x.dataset.c;dockOpen=false;if(k==="geo"){if(GEO.err&&!GEO.pos){geoHelp();return}setStart("geo");return}st.carIn=k;render(true)}});
  bindSwitches();
}
function setFrom(){
  if(st.car){bFrom.classList.remove("empty");document.getElementById("fromC").textContent="На авто";document.getElementById("fromV").textContent=lastCarK==="geo"?"Моє місцезнаходження":lastCarK?CARN[lastCarK].sh:"В’їзд";fvLong();
    var ci=document.getElementById("fromI");ci.className="ic sm "+(lastCarK==="geo"?"me":"bus");ci.innerHTML=lastCarK==="geo"?DOT:CARI;return}
  var S=st.start?STARTS[st.start]:null;bFrom.classList.toggle("empty",!S);
  document.getElementById("fromC").textContent=S?S.cap:"";document.getElementById("fromV").textContent=S?S.short:"Звідки?";fvLong();
  var i=document.getElementById("fromI");i.className="ic sm "+(S?(S.geo||S.here?"me":"bus"):"");i.innerHTML=S?(S.geo||S.here?DOT:VEH(S)):PIN;
}
var PKB='<button type="button" class="gbtn thread" id="go" data-k="pick">'+PIN+'Показати</button>';
var XB='<button type="button" class="gbtn rx" id="rx" aria-label="Скасувати маршрут">'+ico('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',2.3)+'</button>';
function setRes(main,sub,go,more){resRow.hidden=false;document.getElementById("resB").textContent=main;document.getElementById("resS").innerHTML='<span>'+esc(sub)+(more===false?"":" · докладніше")+'</span>'+UP;document.getElementById("resGo").innerHTML=XB+(go||"")}
/* «×»: скасувати маршрут і всі виділення (20.11.2026). «Від мене» лишається — це не виділення, а звичайний початок */
function cancelAll(){if(st.b<0&&!st.dept)return;farKey=null;var was={dept:st.dept,b:st.b,start:st.start,auto:st.auto,carIn:st.carIn};
  if(FOLLOW){FOLLOW=false;awake(false);geoMode()}LOCK=null;st.dept=null;st.b=-1;st.carIn=null;
  if(st.start!=="geo"||GEO.err){st.start=navigator.geolocation&&!GEO.err?"geo":null;st.auto=false}
  pop(null);render(false);syncUrl();
  say("Маршрут скасовано","",[{t:"Повернути",go:function(){st.dept=was.dept;st.b=was.b;st.start=was.start;st.auto=was.auto;st.carIn=was.carIn;LOCK=null;render(true);syncUrl()}}],"",6000)}

function drawPick(){var g=document.getElementById("pickme");
  if(!g){g=document.createElementNS("http://www.w3.org/2000/svg","g");g.id="pickme";var me=document.getElementById("me");me.parentNode.insertBefore(g,me)}
  var P=st.start==="pin"&&STARTS.pin;g.innerHTML=P?lbl("pickme",P.at[0].toFixed(1),P.at[1].toFixed(1),0,'<circle class="ring" r="11"/><circle class="dot" r="6"/>'):""}
/* «Моє місцезнаходження» у вузькому полі: два рядки, перенос «місце-/знаходження» (м’який дефіс) */
function fvLong(){var v=document.getElementById("fromV");if(!v)return;var t=v.textContent;if(t.indexOf("місцезнаходження")>=0)v.textContent=t.replace("місцезнаходження","місце\u00ADзнаходження");
  v.classList.toggle("long",v.textContent.length>14)}
function render(zoom){drawPick();
  document.querySelectorAll("#pTo [data-d]").forEach(function(c){c.setAttribute("aria-pressed",c.dataset.d===st.dept?"true":"false")});
  var ARo=st.dept?areaOf(st.dept):null;svg.querySelectorAll(".b").forEach(function(p){p.classList.toggle("on",!ARo&&+p.dataset.b===st.b)});
  svg.querySelectorAll(".badge").forEach(function(p){p.classList.toggle("on",+p.dataset.bb===st.b);p.classList.toggle("pl",!st.dept)});
  var d0=dById(st.dept),onE=d0?(d0.ents||(d0.ent?[d0.ent]:[])).concat(d0.lift?["lift"]:[]):(st.b>=0&&B[st.b].k?Object.keys(ENT).filter(function(k){return ENT[k].k===B[st.b].k}):[]);
  svg.querySelectorAll(".door").forEach(function(p){p.classList.toggle("on",onE.indexOf(p.dataset.en)>=0)});
  var rg=document.getElementById("route"),pin=document.getElementById("pin"),glow=document.getElementById("glow"),darea=document.getElementById("darea");darea.innerHTML="";rg.innerHTML="";pin.innerHTML="";glow.innerHTML="";
  var d=dById(st.dept),det=document.getElementById("detBody"),toC=document.getElementById("toC"),toV=document.getElementById("toV");
  STARTS.geo.at=GEO.f||GEO.pos;STARTS.geo.stop=meAt();STARTS.geo.street=geoText();var SK=st.start;HERE=false;
  function done(){svg.querySelectorAll(".stop").forEach(function(p){p.classList.toggle("on",p.dataset.e===SK)});setFrom();bFrom.classList.toggle("ask",!st.start&&(st.b>=0||!!d));syncDock();dockH();if(cur==="from")drawFrom()}
  if(!d&&st.b<0){farKey=null;bTo.classList.add("empty");toC.textContent="";toV.textContent="Куди вам?";resRow.hidden=true;lastDoor=null;if(st.auto)SK=st.start=null;if(FOLLOW){FOLLOW=false;awake(false);geoMode()}det.innerHTML="";lastBox=null;lastRoutes=null;curTitle="";done();apply();return}
  bTo.classList.remove("empty");
  var html="";
  if(st.b<0&&!(d&&d.door)){ /* відділення № 9 */
    curTitle="Відділення № 9";toC.textContent="Куди · без корпусу";toV.textContent="Відділення 9";lastRoutes=null;
    setRes("Корпус не вказано","уточніть телефоном");
    html='<div class="head"><div class="kb none">?</div><div class="tx"><div class="t">Відділення № 9</div><div class="d">Корпус на сайті лікарні не вказаний — лише «Врубелівський узвіз».</div></div></div>';
    html+='<p class="note">Перед візитом уточніть місце телефоном — приймальне працює цілодобово.</p>'+tels([EM]);
    html+='<p class="note">Врубелівський узвіз іде від вул. Кирилівської вздовж краю території — на карті він підписаний.</p>';
    det.innerHTML=html;lastBox=[150,-20,470,230,10];done();if(zoom)requestAnimationFrame(function(){fitBox.apply(null,lastBox)});else apply();return;
  }
  var en=d&&d.ent?ENT[d.ent]:null,viaLift=!!(d&&d.lift&&st.noSteps);
  var b=st.b>=0?B[st.b]:{k:null,door:d.door,lab:d.door},door=viaLift?ENT.lift.p:en?en.p:(d&&d.door)||b.door||b.lab,same=inK(b.k);
  var title=d?dTitle(d):(b.k?"Корпус "+b.k:(b.n||"Будівля")),sub="";
  if(d){sub=(d.d||d.note||"");if(d.d&&d.note)sub=d.d+" · "+d.note}
  else if(b.n)sub=b.n;
  else if(b.nt)sub=b.nt;
  else if(same.length)sub="Тут: "+same.map(dName).join(", ");
  else sub="На сайті лікарні для цієї будівлі нічого не вказано";
  curTitle=d?(d.q||d.x?d.t:"Відділення № "+d.id):title;
  toC.textContent="Куди"+(b.k?" · корпус "+b.k:"");toV.textContent=d?dShort(d):(b.k?"Корпус "+b.k:b.n);
  html+='<div class="head"><div class="kb">'+(b.k?'<span><small>корп.</small>'+b.k+'</span>':'•')+'</div><div class="tx"><div class="t">'+esc(title)+'</div><div class="d">'+esc(sub)+'</div></div></div>';
  var keys=startKeys(),routes={},near=geoNear();lastDoor=door;
  var lkey=door[0].toFixed(1)+","+door[1].toFixed(1)+(st.noSteps?"n":"");
  keys.forEach(function(k){routes[k]=k==="geo"?(near?(st.start==="geo"&&!st.car?lockRoute(door,lkey):findRoute(STARTS.geo.at,door,st.noSteps)):null):STARTS[k].at?findRoute(STARTS[k].at,door,st.noSteps):null});lastRoutes=routes;STARTS.geo.stop=meAt();
  if(st.start&&st.start!=="geo"&&!routes[st.start]&&st.noSteps){var best=null;keys.forEach(function(k){if(routes[k]&&(!best||routes[k].len<routes[best].len))best=k});if(best)st.start=best}
  /* «від мене», але де ви — ще невідомо, ви далеко чи точка неточна: нитка від найзручнішої зупинки (fk) */
  var wantGeo=st.start==="geo",far=wantGeo&&!!GEO.pos&&!!geoFar(),fk=null,farMe=!!GEO.pos&&!!geoFar()&&Date.now()-GEO.t<120000;SK=st.start;
  var s=SK?STARTS[SK]:null,r=s?routes[SK]:null,cr=null;
  /* ви вже біля дверей або в цьому корпусі — маршрут не потрібен, потрібна кнопка «Надіслати» */
  var me0=GEO.f||GEO.pos;if(wantGeo&&near&&(Math.hypot(me0[0]-door[0],me0[1]-door[1])<25||(b.p&&inRings(me0,b.p.map(pts)))))HERE=true;
  /* у вузькому банері «Моє місцезнаходження» не влізе разом з метою — тут його позначає синя точка, як на карті */
  document.getElementById("resF").innerHTML=s?(s.geo?'<b class="medot" role="img" aria-label="Моє місцезнаходження"></b>':esc(stopNm(s)))+'<i>→</i>'+esc(toV.textContent):"";
  lastCar=null;lastCarK=null;
  if(st.car&&!b.priv){
    lastCar={};Object.keys(CAR_IN).forEach(function(k){lastCar[k]=carRoute(CAR_IN[k],door,st.noSteps)});
    if(wantGeo&&near&&!st.carIn){cr=carRoute(GEO.f||GEO.pos,door,st.noSteps);if(cr)lastCarK="geo"}
    if(!cr){lastCarK=st.carIn&&lastCar[st.carIn]?st.carIn:null;cr=lastCarK?lastCar[lastCarK]:null}
    r=null}
  if(st.car){var tv=d?dShort(d):(b.k?"Корпус "+b.k:b.n);document.getElementById("resF").innerHTML='Авто '+(lastCarK==="geo"?'<b class="medot" role="img" aria-label="Моє місцезнаходження"></b>':esc(lastCarK?CARN[lastCarK].sh:""))+'<i>→</i>'+esc(tv)}
  var GL=FOLLOW?'<button type="button" class="gbtn thread on" id="go">'+STOPI+'Стоп</button>':'<button type="button" class="gbtn thread" id="go">'+NAV+'Вести</button>';
  var FL=d&&d.fl?flT(d.fl)+(viaLift?", ліфтом":"")+" · ":"";
  var GM='<a class="gbtn thread" id="go" data-k="gm" href="'+esc(gmFar())+'" target="_blank" rel="noopener" aria-label="Відкрити Google Карти">'+GMAP+'Google Карти</a>',isFar=false;
      SB='<button type="button" class="gbtn thread" id="go" data-k="share">'+SHARE+'Надіслати</button>',wait=GEO.watch!==null&&!GEO.pos?"визначаю, де ви":GEO.pos&&!far?"±"+GEO.acc+" м":"";
  if(b.priv)setRes("Закрита територія","вхід лише за дозволом");
  else if(HERE&&!FOLLOW)setRes(b.p&&Math.hypot(me0[0]-door[0],me0[1]-door[1])>=25&&b.k?"Ви в корпусі "+b.k:"Ви вже тут","надішліть рідним, як сюди дійти",SB);
  else if(cr&&far){isFar=true;setRes("≈ "+fmtKm(geoFar()),"до в’їзду "+CARN[lastCarK].sh+" · далі ≈ "+cr.min+" хв",GM)}
  else if(cr)setRes("≈ "+cr.min+" хв · "+fmtLen(cr.len),FL+"авто "+Math.round(cr.dlen/10)*10+" м, пішки "+Math.max(5,Math.round(cr.wlen/5)*5)+" м",GL);
  else if(st.car&&far){isFar=true;setRes("≈ "+fmtKm(geoFar()),"до лікарні · дорогу прокладуть Google Карти",GM,false)}
  else if(st.car&&!myGate()&&!(wantGeo&&near))setRes(b.k?"Корпус "+b.k:title,"оберіть, звідки заїжджаєте",GL,false);
  else if(st.car)setRes("Машиною не під’їхати","вимкніть «На авто» у «Звідки»",GL);
  else if(far){isFar=true;setRes("≈ "+fmtKm(geoFar()),"до лікарні · дорогу прокладуть Google Карти",GM,false)}
  else if(r&&farMe&&!s.geo){isFar=true;setRes("≈ "+fmtKm(geoFar()),"до зупинки «"+stopNm(s)+"» · далі ≈ "+mins(r.len)+" хв пішки",GM)}
  else if(r)setRes("≈ "+mins(r.len)+" хв · "+fmtLen(r.len),FL+(s.geo?(LOCK&&LOCK.snap>20&&LOCK.s<5?"від найближчої доріжки":"від вас")+(GEO.acc>40?" · ±"+GEO.acc+" м":""):s.here?"від місця, яке ви показали":"від зупинки"),GL);
  else if(!s)setRes(b.k?"Корпус "+b.k:title,FL+"оберіть, звідки йдете",GL,false);
  else if(s.geo&&GEO.err&&!GEO.pos)setRes(b.k?"Корпус "+b.k:title,FL+"оберіть, звідки йдете",GL,false);
  else if(s.geo&&!near)setRes(GEO.pos?"Не знаю точно, де ви":"Визначаю, де ви…",(GEO.pos?"±"+(GEO.acc>=1000?fmtKm(GEO.acc):GEO.acc+" м")+" · ":"")+"або покажіть на карті",PKB,false);
  else if(s.geo)setRes("Доріжки від вас немає","оберіть «Звідки»",GL);
  else if(st.noSteps)setRes("Без сходів не пройти","оберіть інше «Звідки»",GL);
  else setRes("Доріжки на карті немає","орієнтуйтеся за номером корпусу",GL);
  var fkey=st.dept||("b"+st.b);
  if(isFar&&!farOpen&&farKey!==fkey){farKey=fkey;document.body.classList.add("far-on");clearTimeout(farT);farT=setTimeout(showFar,600)}
  else if(!isFar&&farOpen){farOpen=false;farScr.hidden=true;farReset();farBox.hidden=true;farBox.innerHTML="";document.body.classList.remove("far-on")}
  if(!isFar){clearTimeout(farT);if(!farOpen)document.body.classList.remove("far-on")}
  if(d&&(d.fl||d.way||en)){var wy=[];if(d.fl)wy.push("<b>"+flT(d.fl)+".</b>");if(d&&areaOf(d.id))wy.push("Частину корпусу, яку займає відділення, обведено на карті.");if(d.way)wy.push(esc(d.way));else if(en&&en.w)wy.push(esc(en.w));
    if(d.lift)wy.push(viaLift?"Маршрут веде до дверей ліфта — вони в дворі між крилами корпусу.":"Є ліфт: окремі двері з двору, на карті підписані «Ліфт». Щоб маршрут вів до них, увімкніть «Маршрут без сходів» у віконці «Звідки».");
    if(wy.length)html+='<p class="note way">'+wy.join(" ")+'</p>'}
  if(d&&d.vis)html+=visBlock(d.vis);
  if(d&&d.tel)html+=tels(d.tel);
  if(cr)html+='<p class="hint">'+esc(carHint(lastCarK))+'</p>';
  else if(r)html+='<p class="hint">'+esc((fk?(far?"Ви далеко від лікарні, тому нитка йде від зупинки «"+stopNm(s)+"». ":"Поки ми не знаємо точно, де ви, нитка йде від зупинки «"+stopNm(s)+"». "):"")+s.hint)+'</p>';
  var others=same.filter(function(x){return !d||x.id!==d.id});
  if(d&&others.length)html+='<p class="note">У цьому ж корпусі: '+others.map(dName).join(", ")+'.</p>';
  if(b.priv)html+='<p class="note">Закрита територія: вхід лише за дозволом, маршрут не прокладається.</p>';
  html+='<p class="note">Заблукали? Приймальне відділення цілодобово: <a href="tel:+380442938539">'+EM+'</a></p>';
  html+='<div class="acts"><a class="gbtn" href="'+gmaps().replace(/&/g,"&amp;")+'" target="_blank" rel="noopener">'+GMAP+(geoNear()?"Google Карти":"Ще їдете? Google Карти")+'</a><button type="button" class="gbtn" id="shr">'+SHARE+'Надіслати рідним, як дійти</button><button type="button" class="gbtn" data-err="1">Тут помилка</button></div>';
  det.innerHTML=html+switches("d");document.getElementById("shr").onclick=share;bindSwitches("d");
  /* якщо відомо, яку частину корпусу займає відділення, обводимо тільки її, а не весь корпус */
  var AR=d?areaOf(d.id):null;
  glow.innerHTML=AR||!b.p?"":'<path class="glow" d="'+ringsPath([b.p[0]])+'"/>';
  if(AR)darea.innerHTML='<polygon class="dar-g" points="'+AR.p+'"/><polygon class="dar" points="'+AR.p+'"/>';
  var nm=d&&!d.q&&!d.x?d.id:null,eid=viaLift?"lift":(d&&d.ent)||null,pill="";
  if(nm){var ea=eid&&ENT[eid]?entDir(ENT[eid]):90,ra=ea*Math.PI/180,qx=-Math.cos(ra)*PINC,qy=-Math.sin(ra)*PINC,qw=Math.max(20,8+7.3*nm.length);
    pill='<g transform="translate('+qx.toFixed(1)+' '+qy.toFixed(1)+')"><rect class="dn-w" x="'+(-qw/2)+'" y="-10" width="'+qw+'" height="20" rx="10"/><g class="dnum"><rect class="dn-b" x="'+(-qw/2)+'" y="-10" width="'+qw+'" height="20" rx="10" data-pin="1"/><text y=".6">'+esc(nm)+'</text></g></g>'}
  svg.querySelectorAll(".door").forEach(function(p){p.classList.toggle("np",!!pill&&p.dataset.en===eid)});
  var PINH=lbl("pin",door[0],door[1],0,(pill?'<circle class="core" r="3.4"/>':'<circle class="wave" r="7"/><circle class="core" r="7"/>')+'<circle class="hit" r="16" data-pin="1"/>'+pill);
  if(cr){
    var f1=function(p){return p[0].toFixed(1)+","+p[1].toFixed(1)},dl=cr.drive.map(f1).join(" "),wl2=cr.walk.map(f1).join(" "),we=cr.walk[cr.walk.length-1];
    rg.innerHTML='<polyline class="route drive-b" points="'+dl+'"/><polyline class="route drive" points="'+dl+'"/>'+
      '<polyline class="route halo" points="'+wl2+'"/><polyline class="route case" points="'+wl2+'"/><polyline class="route main draw" points="'+wl2+'"/><polyline class="route flow" points="'+wl2+'"/><polyline class="route last" points="'+f1(we)+" "+door[0]+","+door[1]+'"/>';
    var m2=rg.querySelector(".main"),L2=cr.wlen+20;m2.style.strokeDasharray=L2;m2.style.setProperty("--len",L2);
    var c0=cr.drive[0];
    pin.innerHTML=PINH+(cr.dlen>15?lbl("carin",c0[0],c0[1],0,'<circle class="ci" r="8.5"/><path class="cc" d="M-4.4 2.4V.6l1-2.6a1.2 1.2 0 0 1 1.1-.8h4.6a1.2 1.2 0 0 1 1.1.8l1 2.6v1.8zM-4.4.4h8.8M-3 2.4v1.2M3 2.4v1.2"/><title>Звідси машиною</title>'):"")+
      lbl("park",cr.park[0],cr.park[1],0,'<circle class="pk" r="8.5"/><text class="pk-t" y=".5">P</text><title>Тут лишіть авто — далі пішки</title>');
    var all=cr.drive.concat(cr.walk,[door]);
    lastBox=[Math.min.apply(null,all.map(function(p){return p[0]})),Math.min.apply(null,all.map(function(p){return p[1]})),Math.max.apply(null,all.map(function(p){return p[0]})),Math.max.apply(null,all.map(function(p){return p[1]})),28];
  } else if(r){
    var line=r.path.map(function(p){return p[0].toFixed(1)+","+p[1].toFixed(1)}).join(" "),end=r.path[r.path.length-1];
    rg.innerHTML='<polyline class="route halo" points="'+line+'"/><polyline class="route case" points="'+line+'"/><polyline class="route main'+(r.locked&&LOCK&&LOCK.drawn?"":" draw")+'" points="'+line+'"/><polyline class="route flow" points="'+line+'"/><polyline class="route last" points="'+end[0]+","+end[1]+" "+door[0]+","+door[1]+'"/>';
    var m=rg.querySelector(".main"),L=r.len+20;m.style.strokeDasharray=L;m.style.setProperty("--len",L);
    pin.innerHTML=PINH;if(r.locked&&LOCK)LOCK.drawn=true;
    var xs=r.path.map(function(p){return p[0]}).concat([door[0],s.stop[0]]),ys=r.path.map(function(p){return p[1]}).concat([door[1],s.stop[1]]);
    lastBox=[Math.min.apply(null,xs),Math.min.apply(null,ys),Math.max.apply(null,xs),Math.max.apply(null,ys),28];
  } else {
    pin.innerHTML=PINH;
    lastBox=[door[0]-110,door[1]-110,door[0]+110,door[1]+110,0];
  }
  if(AR)pts(AR.p).forEach(function(q){lastBox[0]=Math.min(lastBox[0],q[0]);lastBox[1]=Math.min(lastBox[1],q[1]);lastBox[2]=Math.max(lastBox[2],q[0]);lastBox[3]=Math.max(lastBox[3],q[1])});
  done();
  if(zoom)requestAnimationFrame(function(){fitBox.apply(null,lastBox)});else apply();
}
/* рідним іде лише «Куди». Звідки — визначить їхній телефон: на території — від них, далеко — Google Карти до потрібної зупинки */
function share(){shareTo(st.dept||(st.b>=0&&B[st.b].k?"k"+B[st.b].k:""),curTitle)}
function shareTo(to,name){var dv=to&&dById(to),vt=dv&&dv.vis?" Передачі й відвідування "+visText(dv.vis)+(dv.vis.q?", тиха година "+hm(dv.vis.q[0])+"–"+hm(dv.vis.q[1]):"")+".":"";
  var url=location.origin+"/"+(to&&SLUGS[to]?SLUGS[to]:to?"?to="+encodeURIComponent(to):""),title="Ariadna — "+name,text=name+" — Кирилівська, 103."+vt+" Відкрийте посилання: карта сама прокладе шлях від того місця, де ви будете.";
  if(navigator.share){navigator.share({title:title,text:text,url:url}).catch(function(){})}
  else if(navigator.clipboard){navigator.clipboard.writeText(text+" "+url).then(function(){say("Посилання скопійовано","вставте його в повідомлення рідним")},function(){say("Не вдалося скопіювати",url)})}
  else say("Надішліть рідним це посилання",url,null,"",15000)
}

/* ---------- старт ---------- */
dockH();apply();fitAll(0);
var to=Q.get("to");
if(!to){var slP=decodeURIComponent(location.pathname.replace(/^\/+|\.html$|\/+$/g,""));if(slP)for(var sk in SLUGS)if(SLUGS[sk]===slP){to=sk;break}}
/* посилання «Куди» (його надсилають рідним): одразу питаємо, де людина, і ведемо від неї. Без «Куди» — спитаємо, коли оберуть */
if(to&&dById(to)){var dd=dById(to);st.dept=to;st.b=dd.k===null?-1:bIndex(dd.k);geoAsk();render(true)}
else if(to&&/^k\d+$/.test(to)&&bIndex(to.slice(1))>=0){st.b=bIndex(to.slice(1));geoAsk();render(true)}
if(st.dept||st.b>=0)syncUrl();   /* /?to=16 → /viddilennia-16 в адресному рядку */
else{render(false);setTimeout(function(){if(!cur&&st.b<0&&!st.dept)pop("to",true)},450)}
try{navigator.permissions&&navigator.permissions.query({name:"geolocation"}).then(function(p){if(p.state==="granted")geoAsk()})}catch(_){}
setTimeout(mastArm,900);
/* ---------- повітряна тривога (20.11.2026): укриття пульсують червоним, угорі — смуга «Повітряна тривога в Києві · До укриття» ----------
   Джерело даних ще не підключено: надійні (alerts.in.ua, «Повітряна тривога») видають токен за заявкою, а токен не можна класти у відкриту сторінку —
   потрібен маленький посередник (напр., Cloudflare Worker), що віддає {"kyiv":true|false}. Його адресу — в ALERT_URL.
   Поки що для перевірки вигляду: ?alert=1. Карта НІКОЛИ не пише «тривоги немає» — вона лише показує тривогу, коли знає про неї */
var ALERT_URL="",ALERT=false,alertBar=null;
function shelters(){var r=[];SCULPT.concat(LAND).forEach(function(p,i){if(/^Укриття/.test(p.n))r.push({to:"poi"+i,n:p.n,at:[p.x,p.y]})});
  D.forEach(function(d){if(/^Укриття/.test(d.t||"")&&d.ent&&ENT[d.ent])r.push({to:d.id,n:d.t,at:ENT[d.ent].p})});return r}
function drawAlert(){var g=document.getElementById("alertL");
  if(!g){g=document.createElementNS("http://www.w3.org/2000/svg","g");g.id="alertL";var me=document.getElementById("me");me.parentNode.insertBefore(g,me)}
  g.innerHTML=ALERT?shelters().map(function(S){return lbl("shp",S.at[0].toFixed(1),S.at[1].toFixed(1),0,'<circle class="p1" r="13"/><circle class="p2" r="13"/><circle class="c" r="14"/>')}).join(""):"";
  apply();
  if(ALERT&&!alertBar){alertBar=document.createElement("div");alertBar.className="alertbar glass";alertBar.setAttribute("role","alert");
    alertBar.innerHTML='<div class="ab-t"><b>Повітряна тривога в Києві</b><small>укриття позначено червоним</small></div><button type="button" class="gbtn ab-go">До укриття</button>';
    document.body.appendChild(alertBar);alertBar.querySelector(".ab-go").onclick=toShelter}
  if(alertBar)alertBar.hidden=!ALERT;document.body.classList.toggle("alert-on",ALERT)}
/* найближче укриття: від вас (якщо карта знає, де ви), інакше — від того, що зараз на екрані */
function toShelter(){cnt("do-ukryttia");var L=shelters();if(!L.length)return;var s=size(),o=GEO.pos&&geoNear()?GEO.pos:st.start&&STARTS[st.start]&&!STARTS[st.start].geo?STARTS[st.start].at:[vb.x+vb.w/2,vb.y+vb.h/2];
  L.sort(function(a,b){return Math.hypot(a.at[0]-o[0],a.at[1]-o[1])-Math.hypot(b.at[0]-o[0],b.at[1]-o[1])});choose(L[0].to)}
function setAlert(on){on=!!on;if(on===ALERT)return;ALERT=on;drawAlert()}
function alertPoll(){if(!ALERT_URL||!window.fetch)return;fetch(ALERT_URL,{cache:"no-store"}).then(function(r){return r.json()}).then(function(j){setAlert(j&&j.kyiv===true)},function(){})
  .then(function(){setTimeout(alertPoll,document.hidden?120000:30000)})}
if(Q.get("alert")==="1")setAlert(true);else alertPoll();
(function(){var n=document.createElement("div");n.className="north";n.setAttribute("aria-label","Північ — угорі карти");n.title="Північ — угорі карти";
  n.innerHTML='<svg viewBox="0 0 24 44" width="24" height="44" aria-hidden="true"><text x="12" y="8.6" class="nl">Пн</text>'
    +'<path class="nn" d="M12 11.5 16.6 27H7.4z"/><path class="ns" d="M12 42.5 7.4 27h9.2z"/><circle cx="12" cy="27" r="1.6" class="hub"/></svg>';document.body.appendChild(n)})();
/* офлайн (20.11.2026): після першого відкриття з інтернетом карта відкривається й без нього — sw.js кешує сторінку, шрифти й значки */
if("serviceWorker" in navigator&&location.protocol==="https:")addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").catch(function(){})});
/* ---------- лічильники (21.11.2026): GoatCounter — без cookies, без персональних даних; лише «скільки разів сталося». Подія — раз за відвідування ---------- */
var GC_CODE="ariadna-map",gcQ=[],gcSeen={};
function cnt(name){if(gcSeen[name])return;gcSeen[name]=1;gcQ.push(name);gcFlush()}
function gcFlush(){if(!window.goatcounter||!goatcounter.count)return;while(gcQ.length){var n=gcQ.shift();try{goatcounter.count({path:n,title:n,event:true})}catch(_){}}}
if(location.protocol==="https:"&&!/^(localhost|127\.)/.test(location.hostname)&&!Q.get("preview")){var gs=document.createElement("script");gs.async=true;gs.src="https://gc.zgo.at/count.js";
  gs.setAttribute("data-goatcounter","https://"+GC_CODE+".goatcounter.com/count");gs.onload=function(){setTimeout(gcFlush,300)};document.head.appendChild(gs)}
addEventListener("error",function(){cnt("pomylka-js")});
document.addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest('a[href*="google.com/maps"]');if(a)cnt("google-karty")},true);
/* оголошення з редактора: раз за відвідування, 25 с */
(function(){var A=EDITS&&EDITS.ann;if(!A||!A.text)return;if(A.until&&new Date()>new Date(A.until+"T23:59:59"))return;
  setTimeout(function(){say("Оголошення",A.text,[{t:"Зрозуміло",go:hideToast}],"",25000)},1400)})();
if(Q.get("preview"))setTimeout(function(){say("Попередній перегляд",Q.get("preview")==="pending"?"зміни, що чекають схвалення, — люди їх ще не бачать":"це чернетка з редактора — люди ще бачать стару версію",null,"",8000)},400);
/* ---------- «Тут помилка» (21.11.2026): відвідувач повідомляє, що на карті не так ----------
   Що не так (4 варіанти) + місце (обране відділення чи точка, яку людина показала) + коментар → лист на ERR_MAIL (відкривається поштова програма
   з готовим текстом) і подія в лічильнику tut-pomylka-<що>-<де> (рахується, навіть якщо лист не надіслали). Персональних даних не збираємо */
var ERR_MAIL="andr.dorof@gmail.com",ERRC=[["vkhid","Вхід не там або зачинений"],["prokhid","Тут немає проходу"],["dani","Неправильні назва, поверх чи години"],["inshe","Інше"]];
var rBox=document.createElement("div"),rScr=document.createElement("div"),rOpen=false,rSt={c:null,pt:null,txt:""};
rBox.className="farbox glass hbox rbox";rBox.setAttribute("role","dialog");rBox.setAttribute("aria-label","Повідомити про помилку");rBox.hidden=true;rScr.className="farscr";rScr.hidden=true;
document.body.appendChild(rScr);document.body.appendChild(rBox);
function errPlace(){var d=st.dept&&dById(st.dept),b=st.b>=0?B[st.b]:null;if(d)return {t:d.q||d.x?d.t:"Відділення № "+d.id,to:d.id};if(b&&b.k)return {t:"Корпус "+b.k,to:"k"+b.k};return null}
function errOpen(){pop(null);legend(false);rRender(true)}
function rRender(anim){var P=errPlace(),h='<div class="fb-in"><b class="fb-t">Що тут не так?</b><p>'+(P?"Місце: "+esc(P.t)+(rSt.pt?" · і точка на карті":""):rSt.pt?"Місце: точка, яку ви показали на карті":"Оберіть, що не так, і за можливості покажіть місце на карті.")+'</p><div class="cats">';
  ERRC.forEach(function(c){h+='<button type="button" class="gbtn" data-c="'+c[0]+'" aria-pressed="'+(rSt.c===c[0])+'">'+c[1]+'</button>'});
  h+='</div><button type="button" class="gbtn" data-r="pick">'+PIN+(rSt.pt?"Місце позначено ✓ — змінити":"Показати місце на карті")+'</button>'
    +'<textarea class="rt" rows="3" placeholder="Що саме не так (необов’язково)">'+esc(rSt.txt)+'</textarea>'
    +'<div class="hb-b"><button type="button" class="gbtn thread" data-r="send"'+(rSt.c?"":" disabled")+'>Надіслати</button><button type="button" class="gbtn" data-r="no">Скасувати</button></div>'
    +'<p class="hb-s rs">Відкриється пошта з готовим листом на '+ERR_MAIL+'. Ваших даних карта не збирає.</p></div>';
  rBox.innerHTML=h;rBox.style.cssText="";rBox.hidden=false;rBox.style.visibility="hidden";var W=Math.min(380,innerWidth-28);rBox.style.width=W+"px";var H=rBox.offsetHeight;
  rBox.style.left=Math.round((innerWidth-W)/2)+"px";rBox.style.top=Math.round(Math.max(56,(innerHeight-H)/2-10))+"px";rBox.style.visibility="";rOpen=true;rScr.hidden=false;
  if(anim&&rBox.animate&&!(FRM&&FRM.matches))rBox.animate([{opacity:0,transform:"translateY(14px) scale(.97)"},{opacity:1,transform:"none"}],{duration:420,easing:"cubic-bezier(.32,.72,0,1)"});
  var ta=rBox.querySelector(".rt");ta.oninput=function(){rSt.txt=ta.value};
  rBox.querySelectorAll("[data-c]").forEach(function(b){b.onclick=function(){rSt.c=b.dataset.c;rRender(false)}});
  rBox.querySelector('[data-r="pick"]').onclick=function(){rClose(true);pickStart(function(pt){if(pt)rSt.pt=pt;rRender(true)},"Торкніться місця, де помилка","двері, прохід чи будівля — і повернемося до повідомлення")};
  rBox.querySelector('[data-r="no"]').onclick=function(){rClose(false)};
  rBox.querySelector('[data-r="send"]').onclick=errSend}
function rClose(keep){rOpen=false;rScr.hidden=true;rBox.hidden=true;rBox.innerHTML="";if(!keep)rSt={c:null,pt:null,txt:""}}
rScr.addEventListener("pointerdown",function(e){e.preventDefault();rClose(true)});
function errSend(){var P=errPlace(),C=ERRC.filter(function(c){return c[0]===rSt.c})[0],sl=P&&SLUGS[P.to],pt=rSt.pt||(P?(function(){var d=dById(P.to);return d&&(d.ent&&ENT[d.ent]?ENT[d.ent].p:d.door)})():null);
  var L=[];L.push("Що не так: "+C[1]);if(P)L.push("Місце: "+P.t+(sl?" — https://ariadna-map.github.io/"+sl:""));
  if(pt){var la=(LAT0-pt[1]/KY).toFixed(6),lo=(LON0+pt[0]/KX).toFixed(6);L.push((rSt.pt?"Точка, яку показали":"Двері")+": https://maps.google.com/?q="+la+","+lo+" (x="+pt[0].toFixed(1)+", y="+pt[1].toFixed(1)+")")}
  if(rSt.txt.trim())L.push("Коментар: "+rSt.txt.trim());
  L.push("","—","Ariadna, "+new Date().toLocaleString("uk-UA")+", "+(ENV.ios?"iPhone":ENV.and?"Android":"комп’ютер")+(ENV.app?" / "+ENV.app:ENV.br?" / "+ENV.br:""));
  cnt("tut-pomylka-"+C[0]+"-"+(sl||(rSt.pt?"tochka":"bez-mistsia")));
  var u="mailto:"+ERR_MAIL+"?subject="+encodeURIComponent("Ariadna: "+C[1]+(P?" — "+P.t:""))+"&body="+encodeURIComponent(L.join("\n"));
  rClose(false);location.href=u;
  setTimeout(function(){say("Дякуємо!","якщо пошта не відкрилася — напишіть на "+ERR_MAIL,null,"",12000)},700)}
document.addEventListener("click",function(e){var b=e.target&&e.target.closest&&e.target.closest("[data-err]");if(b){e.preventDefault();errOpen()}});
/* кнопка в легенді */
(function(){var lgb=document.getElementById("legend");if(!lgb)return;var x=document.createElement("button");x.type="button";x.className="gbtn lg-err";x.setAttribute("data-err","1");x.textContent="Помітили помилку на карті?";lgb.appendChild(x)})();
addEventListener("keydown",function(e){if(e.key==="Escape"&&rOpen)rClose(true)});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){dockH();apply()});
}
</script>
</body>
</html>
