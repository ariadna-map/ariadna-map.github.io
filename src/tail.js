/* ---------- стан ---------- */
var Q=new URLSearchParams(location.search);
var st={dept:null,b:-1,start:"e1",noSteps:false,car:false,carIn:null},prevStart="e1",lastCar=null,lastCarK=null;
try{var sv=JSON.parse(localStorage.getItem("ariadna")||"{}");if(STARTS[sv.start]&&!STARTS[sv.start].here)st.start=sv.start;st.noSteps=!!sv.noSteps;st.car=!!sv.car}catch(_){}
if(STARTS[Q.get("from")])st.start=Q.get("from");
prevStart=st.start;
STARTS.geo={geo:1,name:"Моя геопозиція",cap:"Звідки",short:"Від мене",street:"",tr:"",at:null,stop:null,hint:"Синя точка — це ви. Лінія оновлюється, коли ви рухаєтеся."};
function startKeys(){var k=Object.keys(STARTS).filter(function(k){return !STARTS[k].geo});if(navigator.geolocation)k.unshift("geo");return k}
function bIndex(k){for(var i=0;i<B.length;i++)if(B[i].k===k)return i;return -1}
function dById(id){for(var i=0;i<D.length;i++)if(D[i].id===id)return D[i];return null}
function dTitle(d){return d.q||d.x?(d.full||d.t):"Відділення № "+d.id}
function dShort(d){return d.q||d.x?(d.short||d.t):"Відділення "+d.id}
function inK(k){return D.filter(function(x){return k&&x.k===k&&!x.x})}
function dName(x){return x.q?x.t.toLowerCase():"№ "+x.id}
function save(){try{var s=STARTS[st.start];localStorage.setItem("ariadna",JSON.stringify({start:(!s||s.here||s.geo)?prevStart:st.start,noSteps:st.noSteps,car:st.car}))}catch(_){}}
function syncUrl(){try{var p=new URLSearchParams(location.search);if(st.dept)p.set("to",st.dept);else if(st.b>=0&&B[st.b].k)p.set("to","k"+B[st.b].k);else p.delete("to");var s=p.toString();history.replaceState(history.state,"",location.pathname+(s?"?"+s:""))}catch(_){}}

/* ---------- геопозиція: синя точка, маршрут від вас, оновлення в русі ---------- */
var GEO={pos:null,acc:0,err:"",watch:null,first:true,last:null,auto:false};
/* «Вести»: маршрут від того місця, де ви зараз; карта йде за вами, екран не гасне. Далеко від лікарні — Google Карти */
var FOLLOW=false,WL=null,lastDoor=null;
function awake(on){try{if(on&&!WL&&navigator.wakeLock)navigator.wakeLock.request("screen").then(function(l){WL=l;l.addEventListener("release",function(){WL=null})},function(){});else if(!on&&WL){WL.release();WL=null}}catch(_){}}
document.addEventListener("visibilitychange",function(){
  if(document.visibilityState==="hidden"){if(GEO.watch!==null){try{navigator.geolocation.clearWatch(GEO.watch)}catch(_){}GEO.watch=null;GEO.paused=true}return}
  if(GEO.paused){GEO.paused=false;var f=GEO.first;geoStart();GEO.first=f}
  if(FOLLOW)awake(true)});
function gmaps(){var p=lastDoor||[40,40];return "https://www.google.com/maps/dir/?api=1&destination="+(LAT0-p[1]/KY).toFixed(6)+","+(LON0+p[0]/KX).toFixed(6)}
function farCard(m){say("Ви за ≈ "+fmtKm(m||geoFar())+" від лікарні","До лікарні доведуть Google Карти, а територією — Ariadna",[{t:"Відкрити Google Карти",href:gmaps()}])}
function followCam(first){if(!FOLLOW||!GEO.pos)return;var p=GEO.pos;
  if(!first){var cx=(p[0]-vb.x)/vb.w,cy=(p[1]-vb.y)/vb.h;if(cx>.25&&cx<.75&&cy>.25&&cy<.7)return}   /* ви ще в середині екрана — карту не рухаємо */
  var R=first?60:Math.max(45,Math.min(160,vb.w*.32));fitBox(p[0]-R,p[1]-R,p[0]+R,p[1]+R,0,first?700:450)}
function lead(){
  if(FOLLOW){stopLead();return}
  if(!navigator.geolocation){say("Браузер не визначає, де ви","йдіть за ниткою від обраної зупинки");return}
  if(GEO.pos&&geoFar()){farCard();return}
  FOLLOW=true;awake(true);st.start="geo";geoMode();
  var had=!!GEO.pos;geoStart();render(false);
  if(had){followCam(true);say("Ведемо від вас","карта рухатиметься разом з вами")}
  else if(!GEO.err)say("Визначаю, де ви…","дозвольте доступ до геопозиції")}
function stopLead(quiet){if(!FOLLOW)return;FOLLOW=false;awake(false);geoMode();render(false);if(!quiet)say("Ведення зупинено","нитка лишається на карті")}
function arrived(){if(!lastDoor||!GEO.pos)return;if(Math.hypot(GEO.pos[0]-lastDoor[0],GEO.pos[1]-lastDoor[1])<Math.max(12,Math.min(GEO.acc,25))){stopLead(true);say("Ви на місці",curTitle)}}
function fmtKm(m){return m<1000?Math.round(m/50)*50+" м":(m/1000).toFixed(m<10000?1:0).replace(".",",")+" км"}
function geoFar(){if(!GEO.pos)return 0;var d=Math.hypot(GEO.pos[0]-20,GEO.pos[1]+20);return d>650?d:0}
function geoText(){return GEO.err||(GEO.pos?(geoFar()?"ви за ≈ "+fmtKm(geoFar())+" від лікарні":"точність ±"+GEO.acc+" м"):(GEO.watch!==null?"визначаю…":"торкніться, щоб визначити"))}
function drawMe(){var g=document.getElementById("me");if(!GEO.pos){g.innerHTML="";return}
  g.innerHTML='<circle class="acc" cx="'+GEO.pos[0].toFixed(1)+'" cy="'+GEO.pos[1].toFixed(1)+'" r="'+Math.min(GEO.acc,200)+'"/>'+lbl("me",GEO.pos[0].toFixed(1),GEO.pos[1].toFixed(1),0,'<circle class="wave" r="7"/><circle class="dot" r="7"/><circle class="hit" r="16" data-me="1"/>');apply()}
function geoStart(){
  if(!navigator.geolocation){GEO.err="цей браузер не підтримує геопозицію";return false}
  if(GEO.watch!==null)return true;GEO.err="";GEO.first=true;
  GEO.hi=FOLLOW;GEO.watch=navigator.geolocation.watchPosition(geoOk,geoFail,FOLLOW?{enableHighAccuracy:true,maximumAge:3000,timeout:20000}:{enableHighAccuracy:false,maximumAge:15000,timeout:20000});return true}
/* перезапустити стеження з іншою точністю (GPS гріє телефон, тому точне — лише під час «Вести») */
function geoMode(){if(GEO.watch===null||GEO.hi===FOLLOW)return;try{navigator.geolocation.clearWatch(GEO.watch)}catch(_){}GEO.watch=null;var f=GEO.first;geoStart();GEO.first=f}
function geoOk(p){
  var x=(p.coords.longitude-LON0)*KX,y=(LAT0-p.coords.latitude)*KY,moved=!GEO.last||Math.hypot(x-GEO.last[0],y-GEO.last[1])>12,first=GEO.first;
  GEO.pos=[x,y];GEO.acc=Math.round(p.coords.accuracy);GEO.first=false;drawMe();
  /* дозвіл на геопозицію вже був: маршрут від вас — лише коли ви на території чи поруч; удома лишається від зупинки */
  if(GEO.auto&&first){GEO.auto=false;
    if(geoFar()&&st.start!=="geo"){try{navigator.geolocation.clearWatch(GEO.watch)}catch(_){}GEO.watch=null;GEO.pos=null;GEO.first=true;drawMe();return}
    if(st.start!=="geo"){st.start="geo";GEO.last=[x,y];render(st.b>=0);return}}
  if(st.start==="geo"&&(first||moved)){GEO.last=[x,y];render(first&&st.b>=0&&!FOLLOW)}
  if(FOLLOW){if(geoFar()){var far=geoFar();FOLLOW=false;awake(false);try{navigator.geolocation.clearWatch(GEO.watch)}catch(_){}GEO.watch=null;GEO.pos=null;GEO.first=true;drawMe();st.start=STARTS[prevStart]?prevStart:"e1";render(false);farCard(far);return}followCam(first);arrived();if(first){GEO.last=[x,y];say("Ведемо від вас","карта рухатиметься разом з вами")}return}
  if(!first)return;GEO.last=[x,y];
  if(geoFar())say("Ви за ≈ "+fmtKm(geoFar())+" від лікарні",st.b>=0?"шлях від вас прокладе Google Карти — кнопка «Вести»":"оберіть, куди вам потрібно, — шлях прокладе Google Карти");
  else{say(st.start==="geo"&&st.b>=0?"Маршрут від вас":"Ви тут","точність ±"+GEO.acc+" м");if(st.b<0)fitBox(x-90,y-90,x+90,y+90,0)}
}
function geoFail(e){GEO.auto=false;if(FOLLOW){FOLLOW=false;awake(false)}GEO.err=e&&e.code===1?"доступ заборонено — дозвольте його в налаштуваннях браузера":"не вдалося визначити";
  try{navigator.geolocation.clearWatch(GEO.watch)}catch(_){}GEO.watch=null;say("Геопозиція недоступна",GEO.err);
  if(st.start==="geo")st.start=STARTS[prevStart]&&!STARTS[prevStart].geo?prevStart:"e1";render(false)}

/* ---------- значки ---------- */
function ico(p,w){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(w||2)+'" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'}
var BUS=ico('<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M8 21v-4M16 21v-4M8.5 14h.01M15.5 14h.01"/>');
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
 build:'<path d="M4 21V8l8-5 8 5v13M9 21v-6h6v6M3 21h18"/>'
};
function tels(list){return '<div class="tels">'+list.map(function(t){return '<a class="gbtn" href="tel:+38'+t.replace(/\D/g,"")+'">'+ico('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>')+t+'</a>'}).join("")+'</div>'}
function mins(m){return Math.max(1,Math.ceil(m/70))}

/* ---------- підказка ---------- */
/* віконце вгорі. Дотик до нього не проходить на карту під ним: закриває віконце або виконує кнопку в ньому */
var toastT=0,toast=document.getElementById("toast"),TA=null;
function hideToast(){toast.classList.remove("on");document.body.classList.remove("toasting");TA=null}
function say(t,s,acts,cap){TA=acts&&acts.length?acts:null;
  toast.innerHTML='<b>'+esc(t)+'</b>'+(s?'<span>'+esc(s)+'</span>':'')+(TA?'<div class="ta">'+(cap?'<small>'+esc(cap)+'</small>':'')+TA.map(function(a,i){return a.href?'<a class="gbtn" data-a="'+i+'" href="'+a.href.replace(/&/g,"&amp;")+'" target="_blank" rel="noopener">'+esc(a.t)+'</a>':'<button type="button" class="gbtn" data-a="'+i+'">'+esc(a.t)+'</button>'}).join("")+'</div>':'');
  toast.classList.add("on");document.body.classList.add("toasting");clearTimeout(toastT);toastT=setTimeout(hideToast,TA?8000:2800)}
document.addEventListener("pointerdown",function(e){if(toast.classList.contains("on")&&!toast.contains(e.target))hideToast()},true);
toast.addEventListener("click",function(e){var b=e.target.closest("[data-a]"),a=b&&TA?TA[+b.dataset.a]:null;clearTimeout(toastT);if(a&&a.href){setTimeout(hideToast,300);return}hideToast();if(a&&a.go)a.go()});

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

/* ---------- віконця: «Куди», «Звідки», «Докладніше». Зникають після вибору або дотику будь-де поза ними ---------- */
var bTo=document.getElementById("bTo"),bFrom=document.getElementById("bFrom"),res=document.getElementById("res");
var POP={to:document.getElementById("pTo"),from:document.getElementById("pFrom"),det:document.getElementById("pDet")},cur=null;
var sIn=document.getElementById("q"),sBox=document.getElementById("srch"),found=document.getElementById("found"),pkMain=document.getElementById("pkMain");
function pop(name,quiet){
  if(cur===name)return;
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
res.onclick=function(e){if(e.target.closest("#go")){lead();return}if(e.target.closest("a"))return;pop(cur==="det"?null:"det")};
res.onkeydown=function(e){if((e.key==="Enter"||e.key===" ")&&!e.target.closest("a,#go")){e.preventDefault();pop(cur==="det"?null:"det")}};
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
function flT(f){return f+(typeof f==="string"?" поверхи":" поверх")}
function choose(id){var d=dById(id);st.dept=id;dockOpen=false;st.carIn=null;st.b=d.k===null?-1:bIndex(d.k);pop(null);render(true);syncUrl()}

/* пошук: номер, назва, корпус, скульптура */
function norm(s){return String(s).toLowerCase().replace(/[’'`ʼ"«»№#.,()—–-]/g," ").replace(/\s+/g," ").trim()}
var IDX=[];
D.forEach(function(d){
  IDX.push({t:dTitle(d),s:[(d.k?"корпус "+d.k:"корпус не вказано"),d.fl?flT(d.fl):"",d.q||d.x?(d.note||""):(d.d||"")].filter(Boolean).join(" · "),num:d.q||d.x?null:d.id,q:d.q,x:d.x,ck:d.k||null,
    h:norm([d.t||"",d.full||"",d.d||"",d.kw||"",d.q||d.x?"":"відділення відділ "+d.id,d.k?"корпус "+d.k:""].join(" ")),go:function(){choose(d.id)}})});
B.forEach(function(b,i){if(!b.k&&!b.n)return;var inside=inK(b.k).map(dName);
  IDX.push({t:b.k?"Корпус "+b.k:b.n,s:b.k?(b.n||(inside.length?"тут: "+inside.join(", "):"")):"",bk:b.k||null,
    h:norm([b.k?"корпус "+b.k+" будівля":"",b.n||"",b.kw||""].join(" ")),go:function(){pop(null);pickBuilding(i)}})});
POIS.forEach(function(p,i){D.push({id:"poi"+i,x:1,poi:1,t:p.n,short:p.sh||p.n,k:null,door:p.door||[p.x,p.y],note:p.d});
  IDX.push({t:p.n,s:p.d,poi:1,h:norm(p.n+" "+p.d+" "+(p.kw||"")),go:function(){choose("poi"+i)}})});
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
svg.addEventListener("pointermove",function(){if(FOLLOW&&moved>14&&Object.keys(ptrs).length){FOLLOW=false;awake(false);geoMode();render(false);say("Карта більше не йде за вами","щоб продовжити, натисніть «Вести»")}});
/* вхід на карті: що за ним і кнопки, щоб прокласти маршрут */
function entCard(id){var e=ENT[id],own=D.filter(function(d){return d.ent===id}),list=own.length?own:D.filter(function(d){return (d.ents||[]).indexOf(id)>=0});
  var acts=list.map(function(d){return {t:d.q||d.x?(d.short||d.t):"№ "+d.id,go:function(){choose(d.id)}}});
  if(!acts.length&&e.k&&bIndex(e.k)>=0)acts=[{t:"Корпус "+e.k,go:function(){pickBuilding(bIndex(e.k))}}];
  say(e.n,e.d,acts,"Прокласти маршрут:")}
function tapAt(x,y){
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
  st.b=i;st.dept=null;dockOpen=false;st.carIn=null;render(true);syncUrl();
}
function setStart(k){st.start=k;dockOpen=false;if(k==="geo")geoStart();else if(!STARTS[k].here)prevStart=k;save();render(st.b>=0);if(st.b<0&&k!=="geo")say(STARTS[k].here?STARTS[k].name:"Зупинка «"+STARTS[k].name+"»","початок маршруту обрано")}
function clearDest(){if(st.b<0&&!st.dept)return;if(FOLLOW){FOLLOW=false;awake(false);geoMode()}st.dept=null;st.b=-1;if(cur==="det")pop(null);render(false);syncUrl();say("Пункт призначення знято","оберіть «Куди» або торкніться будівлі")}
function clearStart(){st.start=null;render(false);say("Початок маршруту знято","оберіть «Звідки» або торкніться зупинки")}

/* ---------- нижні кнопки, смужка з відповіддю, маршрут ---------- */
var dock=document.getElementById("dock"),resRow=document.getElementById("resRow"),bMini=document.getElementById("bMini"),lastBox=null,lastRoutes=null,curTitle="",dockOpen=false,animT=0;
/* на телефоні, коли маршрут прокладено, «Куди» і «Звідки» згортаються в одну кнопку ліворуч, а банер маршруту стає з нею в один рядок */
function wantMin(){return innerWidth<900&&!resRow.hidden&&(!!st.start||st.car)&&(!!st.dept||st.b>=0)&&!dockOpen}
function syncDock(){var m=wantMin();if(m===dock.classList.contains("min"))return;
  dock.classList.add("anim");dock.classList.toggle("min",m);clearTimeout(animT);animT=setTimeout(function(){dock.classList.remove("anim")},1700)}
/* де буде верх панелі, коли вона закінчить згортатися чи розгортатися */
function dockTop(){var r=dock.getBoundingClientRect(),rh=resRow.hidden?0:res.offsetHeight,h=dock.classList.contains("min")?rh:(rh?rh+8:0)+(bTo.offsetHeight||58);return r.bottom-h}
function dockH(){var t=dockTop();document.documentElement.style.setProperty("--dockh",(dock.getBoundingClientRect().bottom-t)+"px");var c=document.getElementById("ctl");
  c.style.bottom=innerWidth>=900?"16px":(innerHeight-t+10)+"px"}
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
  var keys=startKeys(),h='<div class="pk-h">Звідки ви йдете?</div><div class="from">';STARTS.geo.street=geoText();
  keys.forEach(function(k){var S=STARTS[k],R=lastRoutes?lastRoutes[k]:null;
    h+='<button type="button" data-e="'+k+'" class="'+(S.here?"here":S.geo?"geo":"")+'" aria-pressed="'+(k===st.start)+'"><span class="bus">'+(S.here||S.geo?DOT:BUS)+'</span><span class="ft"><b>'+esc(S.here||S.geo?S.name:"Зупинка «"+S.name+"»")+'</b><small>'+esc(S.street+(S.tr?" · "+S.tr:""))+'</small></span>'+(st.b>=0?'<span class="m">'+(R?mins(R.len)+" хв":"—")+'</span>':'')+'</button>'});
  h+='</div>'+switches();
  var bd=document.getElementById("fromBody");bd.innerHTML=h;
  bd.querySelectorAll(".from button").forEach(function(x){x.onclick=function(){pop(null);if(x.dataset.e!==st.start)setStart(x.dataset.e);else if(lastBox)fitBox.apply(null,lastBox)}});
  bindSwitches();
}
function switches(px){px=px||"";return '<label class="sw"><input type="checkbox" id="'+px+'car"'+(st.car?" checked":"")+'><span class="k"></span><span>На авто</span></label><label class="sw"><input type="checkbox" id="'+px+'ns"'+(st.noSteps?" checked":"")+'><span class="k"></span><span>Маршрут без сходів</span></label>'}
function bindSwitches(px){px=px||"";
  document.getElementById(px+"ns").onchange=function(e){st.noSteps=e.target.checked;save();render(true)};
  document.getElementById(px+"car").onchange=function(e){st.car=e.target.checked;st.carIn=null;if(st.car&&st.start==="geo"&&!(GEO.pos&&!geoFar()))st.start=STARTS[prevStart]?prevStart:"e1";save();render(true)}}
/* «Звідки» на авто: два в’їзди на територію і «Від мене» */
function drawFromCar(){
  var h='<div class="pk-h">Звідки заїжджаєте?</div><div class="from">',ks=Object.keys(CAR_IN);if(navigator.geolocation)ks.unshift("geo");
  ks.forEach(function(k){var geo=k==="geo",R=geo?null:(lastCar?lastCar[k]:null),on=k===lastCarK;
    h+='<button type="button" data-c="'+k+'" class="'+(geo?"geo":"")+'" aria-pressed="'+on+'"><span class="bus">'+(geo?DOT:CARI)+'</span><span class="ft"><b>'+esc(geo?"Від мене":CARN[k].t)+'</b><small>'+esc(geo?"якщо ви вже на території":CARN[k].s)+'</small></span>'+(st.b>=0&&!geo?'<span class="m">'+(R?R.min+" хв":"—")+'</span>':'')+'</button>'});
  h+='</div>'+switches()+'<p class="pk-note">Найшвидший в’їзд обирається сам; натисніть інший, якщо їдете з того боку.</p>';
  var bd=document.getElementById("fromBody");bd.innerHTML=h;
  bd.querySelectorAll(".from button").forEach(function(x){x.onclick=function(){pop(null);var k=x.dataset.c;dockOpen=false;if(k==="geo"){setStart("geo");return}st.carIn=k;if(st.start==="geo")st.start=STARTS[prevStart]?prevStart:"e1";save();render(true)}});
  bindSwitches();
}
function setFrom(){
  if(st.car){bFrom.classList.remove("empty");document.getElementById("fromC").textContent="На авто";document.getElementById("fromV").textContent=lastCarK==="geo"?"Від мене":lastCarK?CARN[lastCarK].sh:"В’їзд";
    var ci=document.getElementById("fromI");ci.className="ic sm "+(lastCarK==="geo"?"me":"bus");ci.innerHTML=lastCarK==="geo"?DOT:CARI;return}
  var S=st.start?STARTS[st.start]:null;bFrom.classList.toggle("empty",!S);
  document.getElementById("fromC").textContent=S?S.cap:"";document.getElementById("fromV").textContent=S?S.short:"Звідки?";
  var i=document.getElementById("fromI");i.className="ic sm "+(S?(S.geo||S.here?"me":"bus"):"");i.innerHTML=S?(S.geo||S.here?DOT:BUS):PIN;
}
function setRes(main,sub,go,more){resRow.hidden=false;document.getElementById("resB").textContent=main;document.getElementById("resS").innerHTML='<span>'+esc(sub)+(more===false?"":" · докладніше")+'</span>'+UP;document.getElementById("resGo").innerHTML=go||""}

function render(zoom){
  document.querySelectorAll("#pTo [data-d]").forEach(function(c){c.setAttribute("aria-pressed",c.dataset.d===st.dept?"true":"false")});
  var ARo=st.dept?areaOf(st.dept):null;svg.querySelectorAll(".b").forEach(function(p){p.classList.toggle("on",!ARo&&+p.dataset.b===st.b)});
  svg.querySelectorAll(".badge").forEach(function(p){p.classList.toggle("on",+p.dataset.bb===st.b);p.classList.toggle("pl",!st.dept)});
  var d0=dById(st.dept),onE=d0?(d0.ents||(d0.ent?[d0.ent]:[])).concat(d0.lift?["lift"]:[]):(st.b>=0&&B[st.b].k?Object.keys(ENT).filter(function(k){return ENT[k].k===B[st.b].k}):[]);
  svg.querySelectorAll(".door").forEach(function(p){p.classList.toggle("on",onE.indexOf(p.dataset.en)>=0)});
  var rg=document.getElementById("route"),pin=document.getElementById("pin"),glow=document.getElementById("glow"),darea=document.getElementById("darea");darea.innerHTML="";rg.innerHTML="";pin.innerHTML="";glow.innerHTML="";
  var d=dById(st.dept),det=document.getElementById("detBody"),toC=document.getElementById("toC"),toV=document.getElementById("toV");
  STARTS.geo.at=GEO.pos;STARTS.geo.stop=GEO.pos;STARTS.geo.street=geoText();
  function done(){svg.querySelectorAll(".stop").forEach(function(p){p.classList.toggle("on",p.dataset.e===st.start)});setFrom();bFrom.classList.toggle("ask",!st.start&&(st.b>=0||!!d));syncDock();dockH();if(cur==="from")drawFrom()}
  if(!d&&st.b<0){bTo.classList.add("empty");toC.textContent="";toV.textContent="Куди вам?";resRow.hidden=true;lastDoor=null;if(FOLLOW){FOLLOW=false;awake(false);geoMode()}det.innerHTML="";lastBox=null;lastRoutes=null;curTitle="";done();apply();return}
  bTo.classList.remove("empty");
  var html="";
  if(st.b<0&&!(d&&d.door)){ /* відділення № 9 */
    curTitle="Відділення № 9";toC.textContent="Куди · без корпусу";toV.textContent="Відділення 9";lastRoutes=null;
    setRes("Корпус не вказано","уточніть телефоном");
    html='<div class="head"><div class="kb none">?</div><div class="tx"><div class="t">Відділення № 9</div><div class="d">Корпус на сайті лікарні не вказаний — лише «Врубелівський узвіз».</div></div></div>';
    html+='<p class="note">Перед візитом уточніть місце телефоном — приймальне працює цілодобово.</p>'+tels([EM]);
    html+='<p class="note">Врубелівський узвіз проходить уздовж південно-східного краю території — на карті він підписаний.</p>';
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
  var S0=st.start?STARTS[st.start]:null;document.getElementById("resF").innerHTML=S0?esc(S0.short)+'<i>→</i>'+esc(toV.textContent):"";
  html+='<div class="head"><div class="kb">'+(b.k?'<span><small>корп.</small>'+b.k+'</span>':'•')+'</div><div class="tx"><div class="t">'+esc(title)+'</div><div class="d">'+esc(sub)+'</div></div></div>';
  var keys=startKeys(),routes={};
  keys.forEach(function(k){routes[k]=STARTS[k].at?findRoute(STARTS[k].at,door,st.noSteps):null});lastRoutes=routes;
  if(st.start&&st.start!=="geo"&&!routes[st.start]&&st.noSteps){var best=null;keys.forEach(function(k){if(routes[k]&&(!best||routes[k].len<routes[best].len))best=k});if(best)st.start=best}
  var s=st.start?STARTS[st.start]:null,r=s?routes[st.start]:null,cr=null;
  lastCar=null;lastCarK=null;
  if(st.car&&!b.priv){
    lastCar={};Object.keys(CAR_IN).forEach(function(k){lastCar[k]=carRoute(CAR_IN[k],door,st.noSteps)});
    if(st.start==="geo"&&GEO.pos&&!geoFar()){cr=carRoute(GEO.pos,door,st.noSteps);if(cr)lastCarK="geo"}
    if(!cr){var bk=null;Object.keys(lastCar).forEach(function(k){var q=lastCar[k];if(q&&(!bk||q.min<lastCar[bk].min||(q.min===lastCar[bk].min&&q.len<lastCar[bk].len)))bk=k});
      lastCarK=st.carIn&&lastCar[st.carIn]?st.carIn:bk;cr=lastCarK?lastCar[lastCarK]:null}
    r=null}
  if(st.car){var tv=d?dShort(d):(b.k?"Корпус "+b.k:b.n);document.getElementById("resF").innerHTML='Авто '+esc(lastCarK==="geo"?"від вас":lastCarK?CARN[lastCarK].sh:"")+'<i>→</i>'+esc(tv)}
  lastDoor=door;
  var GL=FOLLOW?'<button type="button" class="gbtn thread on" id="go">'+STOPI+'Стоп</button>':'<button type="button" class="gbtn thread" id="go">'+NAV+'Вести</button>';
  var FL=d&&d.fl?flT(d.fl)+(viaLift?", ліфтом":"")+" · ":"";
  if(b.priv)setRes("Закрита територія","вхід лише за дозволом");
  else if(cr)setRes("≈ "+cr.min+" хв · "+Math.round(cr.len/10)*10+" м",FL+"авто "+Math.round(cr.dlen/10)*10+" м, пішки "+Math.max(5,Math.round(cr.wlen/5)*5)+" м",GL);
  else if(st.car)setRes("Машиною не під’їхати","вимкніть «На авто» у «Звідки»",GL);
  else if(r)setRes("≈ "+mins(r.len)+" хв · "+Math.round(r.len/10)*10+" м",FL+(s.geo?"від вас":"від зупинки"),GL);
  else if(!s)setRes(b.k?"Корпус "+b.k:title,FL+"оберіть, звідки йдете",GL,false);
  else if(s.geo)setRes(GEO.pos&&geoFar()?"Ви за ≈ "+fmtKm(geoFar()):GEO.err?"Геопозиція недоступна":"Визначаю, де ви…",GEO.pos&&geoFar()?"шлях прокладе Google Карти":GEO.err?"оберіть інше «Звідки»":"дозвольте доступ до геопозиції",GL);
  else if(st.noSteps)setRes("Без сходів не пройти","оберіть інше «Звідки»",GL);
  else setRes("Доріжки на карті немає","орієнтуйтеся за номером корпусу",GL);
  if(d&&(d.fl||d.way||en)){var wy=[];if(d.fl)wy.push("<b>"+flT(d.fl)+".</b>");if(d&&areaOf(d.id))wy.push("Частину корпусу, яку займає відділення, обведено на карті.");if(d.way)wy.push(esc(d.way));else if(en&&en.w)wy.push(esc(en.w));
    if(d.lift)wy.push(viaLift?"Маршрут веде до дверей ліфта — вони в дворі між крилами корпусу.":"Є ліфт: окремі двері з двору, на карті підписані «Ліфт». Щоб маршрут вів до них, увімкніть «Маршрут без сходів» у віконці «Звідки».");
    if(wy.length)html+='<p class="note way">'+wy.join(" ")+'</p>'}
  if(d&&d.tel)html+=tels(d.tel);
  if(cr)html+='<p class="hint">'+esc(carHint(lastCarK))+'</p>';
  else if(r)html+='<p class="hint">'+esc(s.hint)+'</p>';
  var others=same.filter(function(x){return !d||x.id!==d.id});
  if(d&&others.length)html+='<p class="note">У цьому ж корпусі: '+others.map(dName).join(", ")+'.</p>';
  if(b.priv)html+='<p class="note">Закрита територія: вхід лише за дозволом, маршрут не прокладається.</p>';
  html+='<p class="note">Заблукали? Приймальне відділення цілодобово: <a href="tel:+380442938539">'+EM+'</a></p>';
  html+='<div class="acts"><a class="gbtn" href="'+gmaps().replace(/&/g,"&amp;")+'" target="_blank" rel="noopener">'+GMAP+'Як доїхати — Google Карти</a><button type="button" class="gbtn" id="shr">'+SHARE+'Поділитися маршрутом</button></div>';
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
    rg.innerHTML='<polyline class="route halo" points="'+line+'"/><polyline class="route case" points="'+line+'"/><polyline class="route main draw" points="'+line+'"/><polyline class="route flow" points="'+line+'"/><polyline class="route last" points="'+end[0]+","+end[1]+" "+door[0]+","+door[1]+'"/>';
    var m=rg.querySelector(".main"),L=r.len+20;m.style.strokeDasharray=L;m.style.setProperty("--len",L);
    pin.innerHTML=PINH;
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
function share(){
  var url=location.href,title="Ariadna — "+curTitle;
  if(navigator.share){navigator.share({title:title,text:"Як дійти: "+curTitle+" (КНП «ПСИХІАТРІЯ»)",url:url}).catch(function(){})}
  else if(navigator.clipboard){navigator.clipboard.writeText(url).then(function(){say("Посилання скопійовано","надішліть його будь-кому")},function(){say("Скопіюйте адресу сторінки")})}
}

/* ---------- старт ---------- */
dockH();apply();fitAll(0);
var to=Q.get("to");
if(to&&dById(to)){var dd=dById(to);st.dept=to;st.b=dd.k===null?-1:bIndex(dd.k);render(true)}
else if(to&&/^k\d+$/.test(to)&&bIndex(to.slice(1))>=0){st.b=bIndex(to.slice(1));render(true)}
else{render(false);setTimeout(function(){if(!cur&&st.b<0&&!st.dept)pop("to",true)},450)}
try{navigator.permissions&&navigator.permissions.query({name:"geolocation"}).then(function(p){if(p.state==="granted"&&st.start!=="geo"){GEO.auto=true;geoStart()}})}catch(_){}
setTimeout(mastArm,900);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){dockH();apply()});
}
</script>
</body>
</html>
