/* ---------- стан ---------- */
var Q=new URLSearchParams(location.search);
/* «Звідки» не запам’ятовується (19.11.2026): щоразу — від того місця, де ви є. Поки місце невідоме, ви далеко чи точність погана,
   нитка йде від найзручнішої зупинки. Немає геопозиції — зупинка обирається сама (st.auto), доки ви не оберете іншу.
   Пам’ятаємо лише «Маршрут без сходів»: це потреба людини, а не місце. */
var st={dept:null,b:-1,start:navigator.geolocation?"geo":null,auto:!navigator.geolocation,noSteps:false,car:false,carIn:null},lastCar=null,lastCarK=null;
try{var sv=JSON.parse(localStorage.getItem("ariadna")||"{}");st.noSteps=!!sv.noSteps}catch(_){}
if(STARTS[Q.get("from")]){st.start=Q.get("from");st.auto=false}
STARTS.geo={geo:1,name:"Моя геопозиція",cap:"Звідки",short:"Від мене",street:"",tr:"",at:null,stop:null,hint:"Синя точка — це ви. Лінія оновлюється, коли ви рухаєтеся."};
function startKeys(){var k=Object.keys(STARTS).filter(function(k){return !STARTS[k].geo});if(navigator.geolocation)k.unshift("geo");return k}
function bIndex(k){for(var i=0;i<B.length;i++)if(B[i].k===k)return i;return -1}
function dById(id){for(var i=0;i<D.length;i++)if(D[i].id===id)return D[i];return null}
function dTitle(d){return d.q||d.x?(d.full||d.t):"Відділення № "+d.id}
function dShort(d){return d.q||d.x?(d.short||d.t):"Відділення "+d.id}
function inK(k){return D.filter(function(x){return k&&x.k===k&&!x.x})}
function dName(x){return x.q?x.t.toLowerCase():"№ "+x.id}
function save(){try{localStorage.setItem("ariadna",JSON.stringify({noSteps:st.noSteps}))}catch(_){}}
function syncUrl(){try{var p=new URLSearchParams(location.search);if(st.dept)p.set("to",st.dept);else if(st.b>=0&&B[st.b].k)p.set("to","k"+B[st.b].k);else p.delete("to");var s=p.toString();history.replaceState(history.state,"",location.pathname+(s?"?"+s:""))}catch(_){}}

/* ---------- геопозиція: синя точка, маршрут від вас, оновлення в русі ---------- */
var GEO={pos:null,acc:0,err:"",watch:null,first:true,last:null,t:0,boost:false,bt:0,good:false};
/* «Вести»: маршрут від того місця, де ви зараз; карта йде за вами, екран не гасне. Далеко від лікарні — Google Карти */
var FOLLOW=false,WL=null,lastDoor=null,HERE=false;
function awake(on){try{if(on&&!WL&&navigator.wakeLock)navigator.wakeLock.request("screen").then(function(l){WL=l;l.addEventListener("release",function(){WL=null})},function(){});else if(!on&&WL){WL.release();WL=null}}catch(_){}}
/* сторінку сховали — стеження вимикаємо; повернулися — дивимося ще раз, де ви (рідні повертаються сюди з Google Карт уже біля лікарні) */
document.addEventListener("visibilitychange",function(){
  if(document.visibilityState==="hidden"){if(GEO.watch!==null){geoStop();GEO.paused=true}return}
  if(GEO.paused||(st.start==="geo"&&GEO.watch===null&&GEO.pos&&geoFar())){GEO.paused=false;geoStart()}
  if(FOLLOW)awake(true)});
function ll(p){return (LAT0-p[1]/KY).toFixed(6)+","+(LON0+p[0]/KX).toFixed(6)}
function gmapsTo(p,mode){return "https://www.google.com/maps/dir/?api=1&destination="+ll(p)+(mode?"&travelmode="+mode:"")}
function stopNm(S){return S.ln||S.short.split(" · ")[0]}
/* найзручніша зупинка: найкоротший шлях територією до дверей; якщо ви далеко — ще й з того боку, звідки ви їдете */
function pickStop(routes){var from=GEO.pos&&geoFar()?GEO.pos:null,best=null,bs=1e9;
  Object.keys(routes||{}).forEach(function(k){var S=STARTS[k],r=routes[k];if(!S||S.geo||!r)return;var sc=r.len+(from?Math.hypot(from[0]-S.stop[0],from[1]-S.stop[1]):0);if(sc<bs){bs=sc;best=k}});return best}
/* в’їзд для авто — так само: коротше територією і ближче до вас */
function pickGate(){var from=GEO.pos&&geoFar()?GEO.pos:null,best=null,bs=1e9;
  Object.keys(CAR_IN).forEach(function(k){var q=lastDoor?carRoute(CAR_IN[k],lastDoor,st.noSteps):null;if(lastDoor&&!q)return;var sc=(q?q.dlen+q.wlen*3.5:0)+(from?Math.hypot(from[0]-CAR_IN[k][0],from[1]-CAR_IN[k][1]):0);if(sc<bs){bs=sc;best=k}});return best||"e1"}
function gmaps(){return st.car?gmapsTo(CAR_IN[pickGate()],"driving"):gmapsTo(STARTS[pickStop(lastRoutes)||"e1"].stop,"transit")}
function farCard(){var m=geoFar(),S=STARTS[pickStop(lastRoutes)||"e1"],g=pickGate();
  say((m?"Ви за ≈ "+fmtKm(m)+" від лікарні":"Як дістатися до лікарні"),"Google Карти доведуть до зупинки «"+stopNm(S)+"» (машиною — до в’їзду "+CARN[g].sh+"). Там поверніться на цю сторінку — далі поведе нитка.",
    [{t:"Транспортом",href:gmapsTo(S.stop,"transit"),go:function(){if(st.car){st.car=false;render(true)}}},{t:"Автомобілем",href:gmapsTo(CAR_IN[g],"driving"),go:function(){st.car=true;st.carIn=g;render(true)}}],"",15000)}
function followCam(first){if(!FOLLOW||!GEO.pos)return;var p=meAt();
  if(!first){var cx=(p[0]-vb.x)/vb.w,cy=(p[1]-vb.y)/vb.h;if(cx>.25&&cx<.75&&cy>.25&&cy<.7)return}   /* ви ще в середині екрана — карту не рухаємо */
  var R=first?60:Math.max(45,Math.min(160,vb.w*.32));fitBox(p[0]-R,p[1]-R,p[0]+R,p[1]+R,0,first?700:450)}
function lead(){
  if(FOLLOW){stopLead();return}
  if(!navigator.geolocation){say("Браузер не визначає, де ви","йдіть за ниткою від обраної зупинки");return}
  if(GEO.pos&&geoFar()&&Date.now()-GEO.t<120000){farCard();return}
  FOLLOW=true;awake(true);st.start="geo";st.auto=false;st.carIn=null;GEO.err="";
  var had=geoNear();if(GEO.pos&&geoFar())GEO.pos=null;geoStart();geoMode();render(false);
  if(had){followCam(true);say("Ведемо від вас","карта рухатиметься разом з вами")}
  else say("Визначаю, де ви…","дозвольте доступ до геопозиції")}
function stopLead(quiet){if(!FOLLOW)return;FOLLOW=false;awake(false);geoMode();render(false);if(!quiet)say("Ведення зупинено","нитка лишається на карті")}
function arrived(){if(!lastDoor||!GEO.pos)return;var m=meAt(),rem=LOCK&&st.start==="geo"?LOCK.L-LOCK.s+LOCK.tail:Math.hypot(m[0]-lastDoor[0],m[1]-lastDoor[1]);if(rem<(LOCK?12:Math.max(12,Math.min(GEO.acc,25)))){stopLead(true);say("Ви на місці",curTitle)}}
function fmtKm(m){return m<1000?Math.round(m/50)*50+" м":(m/1000).toFixed(m<10000?1:0).replace(".",",")+" км"}
function geoFar(){if(!GEO.pos)return 0;var d=Math.hypot(GEO.pos[0]-20,GEO.pos[1]+20);return d>650?d:0}
/* точці можна вірити: ви на території чи поруч і точність не гірша за 100 м (якщо вже було точно — терпимо до 300 м, щоб нитка не стрибала) */
function geoNear(){return !!GEO.pos&&!geoFar()&&GEO.acc<=(GEO.good?300:100)}
/* ---------- точка на нитці (19.11.2026) ----------
   GPS у дворах між корпусами помиляється на 20–60 м і «стрибає». Тому:
   1) згладжуємо точки (простий фільтр Калмана): різкий стрибок, швидший за біг, майже не зсуває точку;
   2) коли маршрут від вас прокладено, він «замикається» (LOCK): синя точка рухається лише по нитці, нитка не перебудовується з кожною точкою;
   3) з маршруту сходимо, лише якщо GPS довго (≥ 3 точки і ≥ 12 с) показує місце далі ніж 20–35 м від нитки — тоді нитка будується заново від вас. */
var LOCK=null,REROUTES=0;
function geoFilter(x,y,a,t){var v=st.car?12:3;
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
  if(best<0)return {path:base.path,tail:tail};
  var path=[];for(var c=best;c>=0;c=r.prev[c])path.push(g.nodes[c]);
  if(path.length<2)path.unshift(path[0]);
  return {path:path,tail:tail}}
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
  var now=Date.now(),dt=Math.max(1,(now-LOCK.tOn)/1000),vmax=st.car?15:3,T=Math.max(15,Math.min(GEO.acc,30))+5,
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
  if(!LOCK||LOCK.key!==key){var gr=geoRoute(GEO.f,door,st.noSteps,GEO.acc);if(!gr){LOCK=null;return null}LOCK=lockMake(gr.path,key,gr.tail);LOCK.acc=GEO.acc;var pr=lockProj(LOCK,GEO.f,0,40);if(pr)LOCK.s=pr.s}
  GEO.show=lockAt(LOCK,LOCK.s);
  var out=[GEO.show];for(var i=1;i<LOCK.p.length;i++)if(LOCK.c[i]>LOCK.s)out.push(LOCK.p[i]);
  return {path:out,len:LOCK.L-LOCK.s+LOCK.tail,locked:1}}
function meAt(){return GEO.show||GEO.f||GEO.pos}

function geoText(){return GEO.err||(GEO.pos?(geoFar()?"ви за ≈ "+fmtKm(geoFar())+" від лікарні":"точність ±"+GEO.acc+" м"):(GEO.watch!==null?"визначаю…":"торкніться, щоб визначити"))}
function drawMe(){var g=document.getElementById("me");if(!GEO.pos||geoFar()){g.innerHTML="";return}var m=meAt();
  g.innerHTML='<circle class="acc" cx="'+m[0].toFixed(1)+'" cy="'+m[1].toFixed(1)+'" r="'+Math.min(GEO.acc,200)+'"/>'+lbl("me",m[0].toFixed(1),m[1].toFixed(1),0,'<circle class="wave" r="7"/><circle class="dot" r="7"/><circle class="hit" r="16" data-me="1"/>');apply()}
/* перші 30 с — точно (GPS), щоб перша точка була правильною; далі — економно, щоб телефон не грівся. Під час «Вести» — точно весь час */
function geoStart(){
  if(!navigator.geolocation){GEO.err="цей браузер не підтримує геопозицію";return false}
  if(GEO.watch!==null)return true;GEO.err="";GEO.first=true;
  GEO.boost=true;clearTimeout(GEO.bt);GEO.bt=setTimeout(function(){GEO.boost=false;geoMode()},30000);
  var hi=FOLLOW||GEO.boost;GEO.hi=hi;GEO.watch=navigator.geolocation.watchPosition(geoOk,geoFail,hi?{enableHighAccuracy:true,maximumAge:3000,timeout:20000}:{enableHighAccuracy:false,maximumAge:15000,timeout:20000});return true}
function geoStop(){clearTimeout(GEO.bt);GEO.boost=false;if(GEO.watch!==null){try{navigator.geolocation.clearWatch(GEO.watch)}catch(_){}}GEO.watch=null}
/* перезапустити стеження з іншою точністю */
function geoMode(){var hi=FOLLOW||GEO.boost;if(GEO.watch===null||GEO.hi===hi)return;try{navigator.geolocation.clearWatch(GEO.watch)}catch(_){}GEO.watch=null;GEO.hi=hi;var f=GEO.first;
  GEO.watch=navigator.geolocation.watchPosition(geoOk,geoFail,hi?{enableHighAccuracy:true,maximumAge:3000,timeout:20000}:{enableHighAccuracy:false,maximumAge:15000,timeout:20000});GEO.first=f}
/* питаємо геопозицію, коли людина обрала, куди їй, — тоді зрозуміло, навіщо */
function geoAsk(){if(st.start==="geo"&&GEO.watch===null&&!GEO.err&&!(GEO.pos&&geoFar()&&Date.now()-GEO.t<120000))geoStart()}
function geoOk(p){
  var x=(p.coords.longitude-LON0)*KX,y=(LAT0-p.coords.latitude)*KY,first=GEO.first,was=geoNear(),gap=Date.now()-GEO.t;
  GEO.pos=[x,y];GEO.acc=Math.round(p.coords.accuracy);GEO.t=Date.now();GEO.first=false;
  if(first&&gap>60000)LOCK=null;   /* довго не було точок (сторінка була схована) — нитку будуємо заново */
  geoFilter(x,y,GEO.acc,GEO.t);
  if(GEO.boost&&GEO.acc<=20){GEO.boost=false;clearTimeout(GEO.bt);geoMode()}   /* точка вже точна — GPS більше не тримаємо */
  /* далеко від лікарні: стеження вимикаємо (не гріємо телефон), нитку лишаємо від зупинки, Google Карти — на кнопці */
  if(geoFar()){var fl=FOLLOW;geoStop();GEO.last=null;if(fl){FOLLOW=false;awake(false)}drawMe();
    if(st.start==="geo")render(first&&(st.b>=0||!!st.dept));
    if(first||fl){if(st.b>=0||st.dept)farCard();else say("Ви за ≈ "+fmtKm(geoFar())+" від лікарні","оберіть, куди вам потрібно, — підкажемо, як дістатися")}
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
  if(!now){if(dest)say("Поки не бачу, де ви точно","±"+GEO.acc+" м — нитка від зупинки, вийдіть з будівлі на відкрите місце");return}
  if(dest)say(HERE?"Ви вже тут":"Маршрут від вас",HERE?"надішліть рідним, як сюди дійти, — кнопка «Надіслати»":"точність ±"+GEO.acc+" м");
  else{say("Ви тут","точність ±"+GEO.acc+" м");fitBox(m[0]-90,m[1]-90,m[0]+90,m[1]+90,0)}
}
function geoFail(e){
  if(e&&e.code!==1&&GEO.pos)return;   /* сигнал тимчасово зник (у будівлі, між корпусами) — лишаємо останню точку, стеження триває */
  if(FOLLOW){FOLLOW=false;awake(false)}geoStop();
  GEO.err=e&&e.code===1?"доступ заборонено — дозвольте його в налаштуваннях браузера":"не вдалося визначити";
  if(st.start==="geo"){st.start=null;st.auto=true}render(false);
  var S=st.start?STARTS[st.start]:null;
  say(e&&e.code===1?"Геопозиція вимкнена":"Не вдалося визначити, де ви",S?"маршрут від зупинки «"+stopNm(S)+"» — іншу можна обрати у «Звідки»":GEO.err)}

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
res.onclick=function(e){var g=e.target.closest("#go");if(g){if(g.dataset.k==="share")share();else if(g.dataset.k==="far")farCard();else lead();return}if(e.target.closest("a"))return;pop(cur==="det"?null:"det")};
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
function choose(id){var d=dById(id);LOCK=null;st.dept=id;dockOpen=false;st.carIn=null;st.b=d.k===null?-1:bIndex(d.k);pop(null);geoAsk();render(true);syncUrl()}

/* пошук: номер, назва, корпус, скульптура */
function norm(s){return String(s).toLowerCase().replace(/[’'`ʼ"«»№#.,()—–-]/g," ").replace(/\s+/g," ").trim()}
var IDX=[];
D.forEach(function(d){
  IDX.push({t:dTitle(d),s:[(d.k?"корпус "+d.k:"корпус не вказано"),d.fl?flT(d.fl):"",d.q||d.x?(d.note||""):(d.d||"")].filter(Boolean).join(" · "),num:d.q||d.x?null:d.id,q:d.q,x:d.x,ck:d.k||null,
    h:norm([d.t||"",d.full||"",d.d||"",d.kw||"",d.q||d.x?"":"відділення відділ "+d.id,d.k?"корпус "+d.k:""].join(" ")),to:d.id,go:function(){choose(d.id)}})});
B.forEach(function(b,i){if(!b.k&&!b.n)return;var inside=inK(b.k).map(dName);
  IDX.push({t:b.k?"Корпус "+b.k:b.n,s:b.k?(b.n||(inside.length?"тут: "+inside.join(", "):"")):"",bk:b.k||null,
    h:norm([b.k?"корпус "+b.k+" будівля":"",b.n||"",b.kw||""].join(" ")),to:b.k?"k"+b.k:null,go:function(){pop(null);pickBuilding(i)}})});
POIS.forEach(function(p,i){D.push({id:"poi"+i,x:1,poi:1,t:p.n,short:p.sh||p.n,k:null,door:p.door||[p.x,p.y],note:p.d});
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
  document.getElementById(px+"car").onchange=function(e){st.car=e.target.checked;st.carIn=null;render(true)}}
/* «Звідки» на авто: два в’їзди на територію і «Від мене» */
function drawFromCar(){
  var h='<div class="pk-h">Звідки заїжджаєте?</div><div class="from">',ks=Object.keys(CAR_IN);if(navigator.geolocation)ks.unshift("geo");
  ks.forEach(function(k){var geo=k==="geo",R=geo?null:(lastCar?lastCar[k]:null),on=k===lastCarK;
    h+='<button type="button" data-c="'+k+'" class="'+(geo?"geo":"")+'" aria-pressed="'+on+'"><span class="bus">'+(geo?DOT:CARI)+'</span><span class="ft"><b>'+esc(geo?"Від мене":CARN[k].t)+'</b><small>'+esc(geo?"якщо ви вже на території":CARN[k].s)+'</small></span>'+(st.b>=0&&!geo?'<span class="m">'+(R?R.min+" хв":"—")+'</span>':'')+'</button>'});
  h+='</div>'+switches()+'<p class="pk-note">Найшвидший в’їзд обирається сам; натисніть інший, якщо їдете з того боку.</p>';
  var bd=document.getElementById("fromBody");bd.innerHTML=h;
  bd.querySelectorAll(".from button").forEach(function(x){x.onclick=function(){pop(null);var k=x.dataset.c;dockOpen=false;if(k==="geo"){setStart("geo");return}st.carIn=k;render(true)}});
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
  STARTS.geo.at=GEO.f||GEO.pos;STARTS.geo.stop=meAt();STARTS.geo.street=geoText();var SK=st.start;HERE=false;
  function done(){svg.querySelectorAll(".stop").forEach(function(p){p.classList.toggle("on",p.dataset.e===SK)});setFrom();bFrom.classList.toggle("ask",!st.start&&(st.b>=0||!!d));syncDock();dockH();if(cur==="from")drawFrom()}
  if(!d&&st.b<0){bTo.classList.add("empty");toC.textContent="";toV.textContent="Куди вам?";resRow.hidden=true;lastDoor=null;if(st.auto)SK=st.start=null;if(FOLLOW){FOLLOW=false;awake(false);geoMode()}det.innerHTML="";lastBox=null;lastRoutes=null;curTitle="";done();apply();return}
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
  html+='<div class="head"><div class="kb">'+(b.k?'<span><small>корп.</small>'+b.k+'</span>':'•')+'</div><div class="tx"><div class="t">'+esc(title)+'</div><div class="d">'+esc(sub)+'</div></div></div>';
  var keys=startKeys(),routes={},near=geoNear();lastDoor=door;
  var lkey=door[0].toFixed(1)+","+door[1].toFixed(1)+(st.noSteps?"n":"");
  keys.forEach(function(k){routes[k]=k==="geo"?(near?(st.start==="geo"&&!st.car?lockRoute(door,lkey):findRoute(STARTS.geo.at,door,st.noSteps)):null):STARTS[k].at?findRoute(STARTS[k].at,door,st.noSteps):null});lastRoutes=routes;STARTS.geo.stop=meAt();
  if(st.auto){var ak=pickStop(routes);if(ak)st.start=ak}
  if(st.start&&st.start!=="geo"&&!routes[st.start]&&st.noSteps){var best=null;keys.forEach(function(k){if(routes[k]&&(!best||routes[k].len<routes[best].len))best=k});if(best)st.start=best}
  /* «від мене», але де ви — ще невідомо, ви далеко чи точка неточна: нитка від найзручнішої зупинки (fk) */
  var wantGeo=st.start==="geo",far=wantGeo&&!!GEO.pos&&!!geoFar(),fk=wantGeo&&!near?pickStop(routes):null;SK=fk||st.start;
  var s=SK?STARTS[SK]:null,r=s?routes[SK]:null,cr=null;
  /* ви вже біля дверей або в цьому корпусі — маршрут не потрібен, потрібна кнопка «Надіслати» */
  var me0=GEO.f||GEO.pos;if(wantGeo&&near&&(Math.hypot(me0[0]-door[0],me0[1]-door[1])<25||(b.p&&inRings(me0,b.p.map(pts)))))HERE=true;
  document.getElementById("resF").innerHTML=s?esc(s.geo?s.short:stopNm(s))+'<i>→</i>'+esc(toV.textContent):"";
  lastCar=null;lastCarK=null;
  if(st.car&&!b.priv){
    lastCar={};Object.keys(CAR_IN).forEach(function(k){lastCar[k]=carRoute(CAR_IN[k],door,st.noSteps)});
    if(wantGeo&&near&&!st.carIn){cr=carRoute(GEO.f||GEO.pos,door,st.noSteps);if(cr)lastCarK="geo"}
    if(!cr){var bk=null;Object.keys(lastCar).forEach(function(k){var q=lastCar[k];if(q&&(!bk||q.min<lastCar[bk].min||(q.min===lastCar[bk].min&&q.len<lastCar[bk].len)))bk=k});
      lastCarK=st.carIn&&lastCar[st.carIn]?st.carIn:(far?pickGate():bk);cr=lastCarK?lastCar[lastCarK]:null}
    r=null}
  if(st.car){var tv=d?dShort(d):(b.k?"Корпус "+b.k:b.n);document.getElementById("resF").innerHTML='Авто '+esc(lastCarK==="geo"?"від вас":lastCarK?CARN[lastCarK].sh:"")+'<i>→</i>'+esc(tv)}
  var GL=FOLLOW?'<button type="button" class="gbtn thread on" id="go">'+STOPI+'Стоп</button>':'<button type="button" class="gbtn thread" id="go">'+NAV+'Вести</button>';
  var FL=d&&d.fl?flT(d.fl)+(viaLift?", ліфтом":"")+" · ":"";
  var FB='<button type="button" class="gbtn thread" id="go" data-k="far">'+GMAP+'Як дістатися</button>',
      SB='<button type="button" class="gbtn thread" id="go" data-k="share">'+SHARE+'Надіслати</button>',wait=GEO.watch!==null&&!GEO.pos?"визначаю, де ви":GEO.pos&&!far?"±"+GEO.acc+" м":"";
  if(b.priv)setRes("Закрита територія","вхід лише за дозволом");
  else if(HERE&&!FOLLOW)setRes(b.p&&Math.hypot(me0[0]-door[0],me0[1]-door[1])>=25&&b.k?"Ви в корпусі "+b.k:"Ви вже тут","надішліть рідним, як сюди дійти",SB);
  else if(cr)setRes(far?"Ви за ≈ "+fmtKm(geoFar()):"≈ "+cr.min+" хв · "+Math.round(cr.len/10)*10+" м",far?"авто — від в’їзду "+CARN[lastCarK].sh:FL+"авто "+Math.round(cr.dlen/10)*10+" м, пішки "+Math.max(5,Math.round(cr.wlen/5)*5)+" м",far?FB:GL);
  else if(st.car)setRes("Машиною не під’їхати","вимкніть «На авто» у «Звідки»",GL);
  else if(r&&far)setRes("Ви за ≈ "+fmtKm(geoFar()),"нитка — від зупинки «"+stopNm(s)+"»",FB);
  else if(r&&fk)setRes("≈ "+mins(r.len)+" хв · "+Math.round(r.len/10)*10+" м",(wait?wait+" · ":"")+"поки від зупинки «"+stopNm(s)+"»",GL);
  else if(r)setRes("≈ "+mins(r.len)+" хв · "+Math.round(r.len/10)*10+" м",FL+(s.geo?"від вас"+(GEO.acc>40?" · ±"+GEO.acc+" м":""):"від зупинки"),GL);
  else if(!s)setRes(b.k?"Корпус "+b.k:title,FL+"оберіть, звідки йдете",GL,false);
  else if(s.geo)setRes("Доріжки від вас немає","оберіть «Звідки»",GL);
  else if(st.noSteps)setRes("Без сходів не пройти","оберіть інше «Звідки»",GL);
  else setRes("Доріжки на карті немає","орієнтуйтеся за номером корпусу",GL);
  if(d&&(d.fl||d.way||en)){var wy=[];if(d.fl)wy.push("<b>"+flT(d.fl)+".</b>");if(d&&areaOf(d.id))wy.push("Частину корпусу, яку займає відділення, обведено на карті.");if(d.way)wy.push(esc(d.way));else if(en&&en.w)wy.push(esc(en.w));
    if(d.lift)wy.push(viaLift?"Маршрут веде до дверей ліфта — вони в дворі між крилами корпусу.":"Є ліфт: окремі двері з двору, на карті підписані «Ліфт». Щоб маршрут вів до них, увімкніть «Маршрут без сходів» у віконці «Звідки».");
    if(wy.length)html+='<p class="note way">'+wy.join(" ")+'</p>'}
  if(d&&d.tel)html+=tels(d.tel);
  if(cr)html+='<p class="hint">'+esc(carHint(lastCarK))+'</p>';
  else if(r)html+='<p class="hint">'+esc((fk?(far?"Ви далеко від лікарні, тому нитка йде від зупинки «"+stopNm(s)+"». ":"Поки ми не знаємо точно, де ви, нитка йде від зупинки «"+stopNm(s)+"». "):"")+s.hint)+'</p>';
  var others=same.filter(function(x){return !d||x.id!==d.id});
  if(d&&others.length)html+='<p class="note">У цьому ж корпусі: '+others.map(dName).join(", ")+'.</p>';
  if(b.priv)html+='<p class="note">Закрита територія: вхід лише за дозволом, маршрут не прокладається.</p>';
  html+='<p class="note">Заблукали? Приймальне відділення цілодобово: <a href="tel:+380442938539">'+EM+'</a></p>';
  html+='<div class="acts"><a class="gbtn" href="'+gmaps().replace(/&/g,"&amp;")+'" target="_blank" rel="noopener">'+GMAP+'Як доїхати — Google Карти</a><button type="button" class="gbtn" id="shr">'+SHARE+'Надіслати рідним, як дійти</button></div>';
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
function shareTo(to,name){
  var url=location.origin+location.pathname+(to?"?to="+encodeURIComponent(to):""),title="Ariadna — "+name,text=name+" — Кирилівська, 103. Відкрийте посилання: карта сама прокладе шлях від того місця, де ви будете.";
  if(navigator.share){navigator.share({title:title,text:text,url:url}).catch(function(){})}
  else if(navigator.clipboard){navigator.clipboard.writeText(text+" "+url).then(function(){say("Посилання скопійовано","вставте його в повідомлення рідним")},function(){say("Не вдалося скопіювати",url)})}
  else say("Надішліть рідним це посилання",url,null,"",15000)
}

/* ---------- старт ---------- */
dockH();apply();fitAll(0);
var to=Q.get("to");
/* посилання «Куди» (його надсилають рідним): одразу питаємо, де людина, і ведемо від неї. Без «Куди» — спитаємо, коли оберуть */
if(to&&dById(to)){var dd=dById(to);st.dept=to;st.b=dd.k===null?-1:bIndex(dd.k);geoAsk();render(true)}
else if(to&&/^k\d+$/.test(to)&&bIndex(to.slice(1))>=0){st.b=bIndex(to.slice(1));geoAsk();render(true)}
else{render(false);setTimeout(function(){if(!cur&&st.b<0&&!st.dept)pop("to",true)},450)}
try{navigator.permissions&&navigator.permissions.query({name:"geolocation"}).then(function(p){if(p.state==="granted")geoAsk()})}catch(_){}
setTimeout(mastArm,900);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){dockH();apply()});
}
</script>
</body>
</html>
