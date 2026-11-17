/* ---------- стан ---------- */
var Q=new URLSearchParams(location.search);
var st={dept:null,b:-1,start:"e1",noSteps:false},prevStart="e1";
try{var sv=JSON.parse(localStorage.getItem("ariadna")||"{}");if(STARTS[sv.start]&&!STARTS[sv.start].here)st.start=sv.start;st.noSteps=!!sv.noSteps}catch(_){}
var HERE=Q.get("from")==="st";
if(STARTS[Q.get("from")])st.start=Q.get("from");
prevStart=st.start;
STARTS.geo={geo:1,name:"Моя геопозиція",cap:"Звідки",short:"Від мене",street:"",tr:"",at:null,stop:null,hint:"Синя точка — це ви. Лінія оновлюється, коли ви рухаєтеся."};
function startKeys(){var k=Object.keys(STARTS).filter(function(k){return !STARTS[k].geo&&(!STARTS[k].here||HERE)});if(navigator.geolocation)k.unshift("geo");return k}
if(!HERE){svg.querySelectorAll(".stop.here").forEach(function(n){n.remove()})}
function bIndex(k){for(var i=0;i<B.length;i++)if(B[i].k===k)return i;return -1}
function dById(id){for(var i=0;i<D.length;i++)if(D[i].id===id)return D[i];return null}
function dTitle(d){return d.q||d.x?(d.full||d.t):"Відділення № "+d.id}
function dShort(d){return d.q||d.x?(d.short||d.t):"Відділення "+d.id}
function inK(k){return D.filter(function(x){return k&&x.k===k&&!x.x})}
function dName(x){return x.q?x.t.toLowerCase():"№ "+x.id}
function save(){try{var s=STARTS[st.start];localStorage.setItem("ariadna",JSON.stringify({start:(!s||s.here||s.geo)?prevStart:st.start,noSteps:st.noSteps}))}catch(_){}}
function syncUrl(){try{var p=new URLSearchParams(location.search);if(st.dept)p.set("to",st.dept);else if(st.b>=0&&B[st.b].k)p.set("to","k"+B[st.b].k);else p.delete("to");var s=p.toString();history.replaceState(history.state,"",location.pathname+(s?"?"+s:""))}catch(_){}}

/* ---------- геопозиція: синя точка, маршрут від вас, оновлення в русі ---------- */
var GEO={pos:null,acc:0,err:"",watch:null,first:true,last:null};
function fmtKm(m){return m<1000?Math.round(m/50)*50+" м":(m/1000).toFixed(m<10000?1:0).replace(".",",")+" км"}
function geoFar(){if(!GEO.pos)return 0;var d=Math.hypot(GEO.pos[0]-20,GEO.pos[1]+20);return d>650?d:0}
function geoText(){return GEO.err||(GEO.pos?(geoFar()?"ви за ≈ "+fmtKm(geoFar())+" від лікарні":"точність ±"+GEO.acc+" м"):(GEO.watch!==null?"визначаю…":"торкніться, щоб визначити"))}
function drawMe(){var g=document.getElementById("me");if(!GEO.pos){g.innerHTML="";return}
  g.innerHTML='<circle class="acc" cx="'+GEO.pos[0].toFixed(1)+'" cy="'+GEO.pos[1].toFixed(1)+'" r="'+Math.min(GEO.acc,200)+'"/>'+lbl("me",GEO.pos[0].toFixed(1),GEO.pos[1].toFixed(1),0,'<circle class="wave" r="7"/><circle class="dot" r="7"/><circle class="hit" r="16" data-me="1"/>');apply()}
function geoStart(){
  if(!navigator.geolocation){GEO.err="цей браузер не підтримує геопозицію";return false}
  if(GEO.watch!==null)return true;GEO.err="";GEO.first=true;
  GEO.watch=navigator.geolocation.watchPosition(geoOk,geoFail,{enableHighAccuracy:true,maximumAge:4000,timeout:20000});return true}
function geoOk(p){
  var x=(p.coords.longitude-LON0)*KX,y=(LAT0-p.coords.latitude)*KY,moved=!GEO.last||Math.hypot(x-GEO.last[0],y-GEO.last[1])>12,first=GEO.first;
  GEO.pos=[x,y];GEO.acc=Math.round(p.coords.accuracy);GEO.first=false;drawMe();
  if(st.start==="geo"&&(first||moved)){GEO.last=[x,y];render(first&&st.b>=0)}
  if(!first)return;GEO.last=[x,y];
  if(geoFar())say("Ви за ≈ "+fmtKm(geoFar())+" від лікарні",st.b>=0?"шлях від вас прокладе Google Карти — кнопка «Вести»":"оберіть, куди вам потрібно, — шлях прокладе Google Карти");
  else{say(st.start==="geo"&&st.b>=0?"Маршрут від вас":"Ви тут","точність ±"+GEO.acc+" м");if(st.b<0)fitBox(x-90,y-90,x+90,y+90,0)}
}
function geoFail(e){GEO.err=e&&e.code===1?"доступ заборонено — дозвольте його в налаштуваннях браузера":"не вдалося визначити";
  try{navigator.geolocation.clearWatch(GEO.watch)}catch(_){}GEO.watch=null;say("Геопозиція недоступна",GEO.err);
  if(st.start==="geo")st.start=STARTS[prevStart]&&!STARTS[prevStart].geo?prevStart:"e1";render(false)}

/* ---------- значки ---------- */
function ico(p,w){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(w||2)+'" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'}
var BUS=ico('<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M8 21v-4M16 21v-4M8.5 14h.01M15.5 14h.01"/>');
var DOT=ico('<circle cx="12" cy="12" r="4" fill="currentColor"/><circle cx="12" cy="12" r="8.5"/>',2.2);
var NAV=ico('<path d="m3 11 18-8-8 18-2-8z"/>',2.2);
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
var toastT=0,toast=document.getElementById("toast");
function say(t,s){toast.innerHTML='<b>'+esc(t)+'</b>'+(s?'<span>'+esc(s)+'</span>':'');toast.classList.add("on");clearTimeout(toastT);toastT=setTimeout(function(){toast.classList.remove("on")},2800)}

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
  if(!name)return;
  legend(false);if(name==="from")drawFrom();
  POP[name].classList.add("on");POP[name].querySelector(".pk-body").scrollTop=0;
  if(!quiet)try{if(!(history.state&&history.state.ar))history.pushState({ar:1},"")}catch(_){}
  setTimeout(function(){if(cur!==name)return;POP[name].focus({preventScroll:true});var c=POP[name].querySelector('[aria-pressed="true"]');if(c&&c.scrollIntoView)c.scrollIntoView({block:"nearest"})},60);
}
bTo.onclick=function(){pop(cur==="to"?null:"to")};
bFrom.onclick=function(){pop(cur==="from"?null:"from")};
res.onclick=function(e){if(e.target.closest("a"))return;pop(cur==="det"?null:"det")};
res.onkeydown=function(e){if((e.key==="Enter"||e.key===" ")&&!e.target.closest("a")){e.preventDefault();pop(cur==="det"?null:"det")}};
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
function choose(id){var d=dById(id);st.dept=id;st.b=d.k===null?-1:bIndex(d.k);pop(null);render(true);syncUrl()}

/* пошук: номер, назва, корпус, скульптура */
function norm(s){return String(s).toLowerCase().replace(/[’'`ʼ"«»№#.,()—–-]/g," ").replace(/\s+/g," ").trim()}
var IDX=[];
D.forEach(function(d){
  IDX.push({t:dTitle(d),s:[(d.k?"корпус "+d.k:"корпус не вказано"),d.fl?flT(d.fl):"",d.q||d.x?(d.note||""):(d.d||"")].filter(Boolean).join(" · "),num:d.q||d.x?null:d.id,q:d.q,x:d.x,ck:d.k||null,
    h:norm([d.t||"",d.full||"",d.d||"",d.kw||"",d.q||d.x?"":"відділення відділ "+d.id,d.k?"корпус "+d.k:""].join(" ")),go:function(){choose(d.id)}})});
B.forEach(function(b,i){if(!b.k&&!b.n)return;var inside=inK(b.k).map(dName);
  IDX.push({t:b.k?"Корпус "+b.k:b.n,s:b.k?(b.n||(inside.length?"тут: "+inside.join(", "):"")):"",bk:b.k||null,
    h:norm([b.k?"корпус "+b.k+" будівля":"",b.n||"",b.kw||""].join(" ")),go:function(){pop(null);pickBuilding(i)}})});
POIS.forEach(function(p){IDX.push({t:p.n,s:p.d,poi:1,h:norm(p.n+" "+p.d),go:function(){pop(null);fitBox(p.x-70,p.y-70,p.x+70,p.y+70,0);say(p.n,p.d)}})});
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
function tapAt(x,y){
  legend(false);
  var el=document.elementFromPoint(x,y);if(!el||!el.dataset)return;var ds=el.dataset;
  if(ds.pin!==undefined){clearDest();return}
  if(ds.me!==undefined){if(st.start==="geo")clearStart();else setStart("geo");return}
  if(ds.stop!==undefined&&STARTS[ds.stop]){if(st.start===ds.stop)clearStart();else setStart(ds.stop);return}
  if(ds.poi!==undefined){var p=POIS[+ds.poi];say(p.n,p.d);return}
  if(ds.ent!==undefined&&ENT[ds.ent]){say(ENT[ds.ent].n,ENT[ds.ent].d);return}
  if(ds.b!==undefined){if(+ds.b===st.b)clearDest();else pickBuilding(+ds.b);return}
}
function pickBuilding(i){
  var b=B[i];
  if(!b.k&&!b.n){say("Допоміжна будівля","відділень тут немає");return}
  st.b=i;st.dept=null;render(true);syncUrl();
}
function setStart(k){st.start=k;if(k==="geo")geoStart();else if(!STARTS[k].here)prevStart=k;save();render(st.b>=0);if(st.b<0&&k!=="geo")say(STARTS[k].here?STARTS[k].name:"Зупинка «"+STARTS[k].name+"»","початок маршруту обрано")}
function clearDest(){if(st.b<0&&!st.dept)return;st.dept=null;st.b=-1;if(cur==="det")pop(null);render(false);syncUrl();say("Пункт призначення знято","оберіть «Куди» або торкніться будівлі")}
function clearStart(){st.start=null;render(false);say("Початок маршруту знято","оберіть «Звідки» або торкніться зупинки")}

/* ---------- нижні кнопки, смужка з відповіддю, маршрут ---------- */
var dock=document.getElementById("dock"),lastBox=null,lastRoutes=null,curTitle="";
function dockH(){document.documentElement.style.setProperty("--dockh",dock.offsetHeight+"px");var c=document.getElementById("ctl");
  c.style.bottom=innerWidth>=900?"16px":(innerHeight-dock.getBoundingClientRect().top+10)+"px"}
function drawFrom(){
  var keys=startKeys(),h='<div class="pk-h">Звідки ви йдете?</div><div class="from">';STARTS.geo.street=geoText();
  keys.forEach(function(k){var S=STARTS[k],R=lastRoutes?lastRoutes[k]:null;
    h+='<button type="button" data-e="'+k+'" class="'+(S.here?"here":S.geo?"geo":"")+'" aria-pressed="'+(k===st.start)+'"><span class="bus">'+(S.here||S.geo?DOT:BUS)+'</span><span class="ft"><b>'+esc(S.here||S.geo?S.name:"Зупинка «"+S.name+"»")+'</b><small>'+esc(S.street+(S.tr?" · "+S.tr:""))+'</small></span>'+(st.b>=0?'<span class="m">'+(R?mins(R.len)+" хв":"—")+'</span>':'')+'</button>'});
  h+='</div><label class="sw"><input type="checkbox" id="ns"'+(st.noSteps?" checked":"")+'><span class="k"></span><span>Маршрут без сходів</span></label>';
  h+='<p class="pk-note">Можна також торкнутися зупинки на карті. Повторний дотик до обраної знімає вибір.</p>';
  var bd=document.getElementById("fromBody");bd.innerHTML=h;
  bd.querySelectorAll(".from button").forEach(function(x){x.onclick=function(){pop(null);if(x.dataset.e!==st.start)setStart(x.dataset.e);else if(lastBox)fitBox.apply(null,lastBox)}});
  document.getElementById("ns").onchange=function(e){st.noSteps=e.target.checked;save();render(true)};
}
function setFrom(){
  var S=st.start?STARTS[st.start]:null;bFrom.classList.toggle("empty",!S);
  document.getElementById("fromC").textContent=S?S.cap:"";document.getElementById("fromV").textContent=S?S.short:"Звідки?";
  var i=document.getElementById("fromI");i.className="ic sm "+(S?(S.geo||S.here?"me":"bus"):"");i.innerHTML=S?(S.geo||S.here?DOT:BUS):PIN;
}
function setRes(main,sub,go,more){res.hidden=false;document.getElementById("resB").textContent=main;document.getElementById("resS").innerHTML='<span>'+esc(sub)+(more===false?"":" · докладніше")+'</span>'+UP;document.getElementById("resGo").innerHTML=go||""}

function render(zoom){
  document.querySelectorAll("#pTo [data-d]").forEach(function(c){c.setAttribute("aria-pressed",c.dataset.d===st.dept?"true":"false")});
  svg.querySelectorAll(".b").forEach(function(p){p.classList.toggle("on",+p.dataset.b===st.b)});
  svg.querySelectorAll(".badge").forEach(function(p){p.classList.toggle("on",+p.dataset.bb===st.b)});
  var d0=dById(st.dept),onE=d0?(d0.ents||(d0.ent?[d0.ent]:[])).concat(d0.lift?["lift"]:[]):(st.b>=0&&B[st.b].k?Object.keys(ENT).filter(function(k){return ENT[k].k===B[st.b].k}):[]);
  svg.querySelectorAll(".door").forEach(function(p){p.classList.toggle("on",onE.indexOf(p.dataset.en)>=0)});
  var rg=document.getElementById("route"),pin=document.getElementById("pin"),glow=document.getElementById("glow"),darea=document.getElementById("darea");darea.innerHTML="";rg.innerHTML="";pin.innerHTML="";glow.innerHTML="";
  var d=dById(st.dept),det=document.getElementById("detBody"),toC=document.getElementById("toC"),toV=document.getElementById("toV");
  STARTS.geo.at=GEO.pos;STARTS.geo.stop=GEO.pos;STARTS.geo.street=geoText();
  function done(){svg.querySelectorAll(".stop").forEach(function(p){p.classList.toggle("on",p.dataset.e===st.start)});setFrom();bFrom.classList.toggle("ask",!st.start&&(st.b>=0||!!d));dockH();if(cur==="from")drawFrom()}
  if(!d&&st.b<0){bTo.classList.add("empty");toC.textContent="";toV.textContent="Куди вам?";res.hidden=true;det.innerHTML="";lastBox=null;lastRoutes=null;curTitle="";done();apply();return}
  bTo.classList.remove("empty");
  var html="";
  if(st.b<0){ /* відділення № 9 */
    curTitle="Відділення № 9";toC.textContent="Куди · без корпусу";toV.textContent="Відділення 9";lastRoutes=null;
    setRes("Корпус не вказано","уточніть телефоном");
    html='<div class="head"><div class="kb none">?</div><div class="tx"><div class="t">Відділення № 9</div><div class="d">Корпус на сайті лікарні не вказаний — лише «Врубелівський узвіз».</div></div></div>';
    html+='<p class="note">Перед візитом уточніть місце телефоном — приймальне працює цілодобово.</p>'+tels([EM]);
    html+='<p class="note">Врубелівський узвіз проходить уздовж південно-східного краю території — на карті він підписаний.</p>';
    det.innerHTML=html;lastBox=[150,-20,470,230,10];done();if(zoom)requestAnimationFrame(function(){fitBox.apply(null,lastBox)});else apply();return;
  }
  var en=d&&d.ent?ENT[d.ent]:null,viaLift=!!(d&&d.lift&&st.noSteps);
  var b=B[st.b],door=viaLift?ENT.lift.p:en?en.p:(d&&d.door)||b.door||b.lab,same=inK(b.k);
  var title=d?dTitle(d):(b.k?"Корпус "+b.k:(b.n||"Будівля")),sub="";
  if(d){sub=(d.d||d.note||"");if(d.d&&d.note)sub=d.d+" · "+d.note}
  else if(b.n)sub=b.n;
  else if(b.nt)sub=b.nt;
  else if(same.length)sub="Тут: "+same.map(dName).join(", ");
  else sub="На сайті лікарні для цієї будівлі нічого не вказано";
  curTitle=d?(d.q||d.x?d.t:"Відділення № "+d.id):title;
  toC.textContent="Куди"+(b.k?" · корпус "+b.k:"");toV.textContent=d?dShort(d):(b.k?"Корпус "+b.k:b.n);
  html+='<div class="head"><div class="kb">'+(b.k?'<span><small>корп.</small>'+b.k+'</span>':'•')+'</div><div class="tx"><div class="t">'+esc(title)+'</div><div class="d">'+esc(sub)+'</div></div></div>';
  var keys=startKeys(),routes={};
  keys.forEach(function(k){routes[k]=STARTS[k].at?findRoute(STARTS[k].at,door,st.noSteps):null});lastRoutes=routes;
  if(st.start&&st.start!=="geo"&&!routes[st.start]&&st.noSteps){var best=null;keys.forEach(function(k){if(routes[k]&&(!best||routes[k].len<routes[best].len))best=k});if(best)st.start=best}
  var s=st.start?STARTS[st.start]:null,r=s?routes[st.start]:null;
  var lat=(LAT0-door[1]/KY).toFixed(6),lon=(LON0+door[0]/KX).toFixed(6);
  var GL='<a class="gbtn thread" href="https://www.google.com/maps/dir/?api=1&amp;destination='+lat+','+lon+'&amp;travelmode=walking" target="_blank" rel="noopener">'+NAV+'Вести</a>';
  var FL=d&&d.fl?flT(d.fl)+(viaLift?", ліфтом":"")+" · ":"";
  if(b.priv)setRes("Закрита територія","вхід лише за дозволом");
  else if(r)setRes("≈ "+mins(r.len)+" хв · "+Math.round(r.len/10)*10+" м",FL+(s.geo?"від вас":s.here?"від стенда":"від зупинки"),GL);
  else if(!s)setRes(b.k?"Корпус "+b.k:title,FL+"оберіть, звідки йдете",GL,false);
  else if(s.geo)setRes(GEO.pos&&geoFar()?"Ви за ≈ "+fmtKm(geoFar()):GEO.err?"Геопозиція недоступна":"Визначаю, де ви…",GEO.pos&&geoFar()?"шлях прокладе Google Карти":GEO.err?"оберіть інше «Звідки»":"дозвольте доступ до геопозиції",GL);
  else if(st.noSteps)setRes("Без сходів не пройти","оберіть інше «Звідки»",GL);
  else setRes("Доріжки на карті немає","орієнтуйтеся за номером корпусу",GL);
  if(d&&(d.fl||d.way||en)){var wy=[];if(d.fl)wy.push("<b>"+flT(d.fl)+".</b>");if(d&&areaOf(d.id))wy.push("Частину корпусу, яку займає відділення, виділено на карті пунктиром.");if(d.way)wy.push(esc(d.way));else if(en&&en.w)wy.push(esc(en.w));
    if(d.lift)wy.push(viaLift?"Маршрут веде до дверей ліфта — вони в дворі між крилами корпусу.":"Є ліфт: окремі двері з двору, на карті підписані «Ліфт». Щоб маршрут вів до них, увімкніть «Маршрут без сходів» у віконці «Звідки».");
    if(wy.length)html+='<p class="note way">'+wy.join(" ")+'</p>'}
  if(d&&d.tel)html+=tels(d.tel);
  if(r)html+='<p class="hint">'+esc(s.hint)+'</p>';
  var others=same.filter(function(x){return !d||x.id!==d.id});
  if(d&&others.length)html+='<p class="note">У цьому ж корпусі: '+others.map(dName).join(", ")+'.</p>';
  if(b.priv)html+='<p class="note">Закрита територія: вхід лише за дозволом, маршрут не прокладається.</p>';
  html+='<p class="note">Заблукали? Приймальне відділення цілодобово: <a href="tel:+380442938539">'+EM+'</a></p>';
  html+='<div class="acts"><button type="button" class="gbtn" id="shr">'+SHARE+'Поділитися маршрутом</button></div>';
  det.innerHTML=html;document.getElementById("shr").onclick=share;
  glow.innerHTML='<path class="glow" d="'+ringsPath([b.p[0]])+'"/>';
  var AR=d?areaOf(d.id):null;if(AR)darea.innerHTML='<polygon class="dar" points="'+AR.p+'"/>';
  var PINH=lbl("pin",door[0],door[1],0,'<circle class="wave" r="7"/><circle class="core" r="7"/><circle class="hit" r="16" data-pin="1"/>');
  if(r){
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
try{navigator.permissions&&navigator.permissions.query({name:"geolocation"}).then(function(p){if(p.state==="granted"&&!HERE){st.start="geo";geoStart();render(false)}})}catch(_){}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){dockH();apply()});
if(HERE)say("Ви тут — біля стенда зі схемою","оберіть, куди вам потрібно");
}
</script>
</body>
</html>
