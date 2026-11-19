// Аркуші для друку (A4 альбомна): огляд, 4 частини території, корпуси з відділеннями.
// usage: node print.mjs ../../index.html /tmp/print   → /tmp/print/ariadna-druk.pdf (+ PNG-прев'ю кожного аркуша)
import {spawn,execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const [,,page,outDir]=process.argv;
fs.mkdirSync(outDir,{recursive:true});
const W=1123,H=794; // A4 альбомна при 96 точках на дюйм
const DATE='17.11.2026';

const Q=[ // частини території (метри на схід і на південь від 50.4820 N, 30.4695 E), з перекриттям 20 м
  ['північ',[-110,-340,355,-40]],['центр і південь',[-180,-60,355,215]],['південний захід, гай',[-350,70,-80,305]]];
const S=[{kind:'all',title:'Уся територія',box:[-350,-340,355,305]}];
Q.forEach(([t,b])=>S.push({kind:'part',title:'Територія: '+t,box:b}));
[1,2,3].forEach(f=>S.push({kind:'bld',title:'Корпус 1',box:[-155,24,45,160],ks:['1'],floor:f}));
S.push({kind:'bld',title:'Корпуси 2 і 12',box:[-8,-58,142,6],ks:['2','12']});
S.push({kind:'bld',title:'Корпус 11',box:[30,15,129,126],ks:['11']});
S.push({kind:'bld',title:'Корпуси 3, 4 і 5',box:[-93,-147,108,-48],ks:['3','4','5']});
S.push({kind:'bld',title:'Корпус 8',box:[164,-260,249,-191],ks:['8']});
S.forEach((s,i)=>{s.n=i+1;s.N=S.length});
const RECTS=S.slice(1).filter((s,i,a)=>a.findIndex(z=>z.title===s.title)===i).map(s=>({n:s.n,box:s.box,part:s.kind==='part',label:s.kind==='bld'&&s.ks[0]==='1'?'аркуші '+s.n+'–'+(s.n+2):'аркуш '+s.n}));
const PARTS=S.filter(s=>s.kind==='part').map(s=>s.n),BLDS=S.filter(s=>s.kind==='bld').map(s=>s.n);
S[0].span=['аркуші '+PARTS[0]+'–'+PARTS.at(-1),'аркуші '+BLDS[0]+'–'+BLDS.at(-1)];

const CSS=`
body>*:not(#map):not(#prh):not(#prf){display:none!important}
:root{--bg:#fff;--land:#fff;--lawn:#e4efd9;--lawn-edge:#c3d8b0;--park:#e4efd9;--park-edge:#c3d8b0;--terr-edge:#444;
 --road:#fff;--road-edge:#8c8c8c;--path:#8c8c8c;--steps:#444;--ctx:#f3f3f1;--ctx-edge:#cfcfca;
 --r-grey:#efefeb;--r-graph:#efefeb;--r-blue:#efefeb;--r-terra:#efefeb;--r-green:#efefeb;--r-dgreen:#efefeb;--r-white:#efefeb;--r-sage:#efefeb;
 --b-edge:#111;--label:#000;--label-halo:rgba(255,255,255,.95);--major:#fbf1c9;--major-edge:#b39d55;
 --contour:#c9b894;--hach:#9c8662;--wall:#5e4f3c;--gate:#2b231c;--relief:0;color-scheme:light}
#map{background:#fff}
#map .shg,#map .fac,#map .hib,#map .hi,#map .relief,#map .glow,#map .pulse,#me,#pin,#route{display:none!important}
#map .b{stroke:#111;stroke-width:1.1px;vector-effect:non-scaling-stroke}
#map .ctx{stroke-width:.6px;vector-effect:non-scaling-stroke}
#map .prg{fill:none;vector-effect:non-scaling-stroke}
#prh{position:fixed;z-index:99;left:0;right:0;top:0;height:100px;background:#fff;border-bottom:1px solid #777;padding:18px 30px 0;
 display:flex;justify-content:space-between;gap:24px;color:#111;font:12px/1.4 "Onest","DejaVu Sans",sans-serif}
#prh .t{font-size:17px;font-weight:700;letter-spacing:-.01em;margin-bottom:4px}
#prh .i{font-size:11.5px;color:#222;max-width:860px}
#prh .r{text-align:right;white-space:nowrap;font-size:11px;color:#333}
#prh .fl{display:inline-block;font-size:17px;font-weight:700;color:#000;border:1.6px solid #000;border-radius:6px;padding:1px 9px;margin-bottom:5px}
#prf{position:fixed;z-index:99;left:0;right:0;bottom:0;height:38px;background:#fff;border-top:1px solid #777;padding:0 30px;
 display:flex;align-items:center;gap:26px;color:#222;font:10.5px/1.3 "Onest","DejaVu Sans",sans-serif}
#prf svg{flex:none}
#prf .sp{flex:1}
`;

const PAGEJS=`window.PR={
setup:function(css){var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  try{pop(null)}catch(e){}
  ['prh','prf'].forEach(function(id){var d=document.createElement('div');d.id=id;document.body.appendChild(d)});},
lbl:function(d){return d.q||d.x?(d.short||d.t):'№'+d.id},
sheet:function(o,rects,date){
  var W=innerWidth,H=innerHeight,L=30,R=W-30,T=112,Bt=H-50,NS='http://www.w3.org/2000/svg',svg=document.getElementById('map');
  var ppm=Math.min((R-L)/(o.box[2]-o.box[0]),(Bt-T)/(o.box[3]-o.box[1]));
  var cx=(o.box[0]+o.box[2])/2,cy=(o.box[1]+o.box[3])/2;
  vb.w=W/ppm;vb.h=H/ppm;vb.x=cx-(L+R)/2/ppm;vb.y=cy-(T+Bt)/2/ppm;apply();
  var old=document.getElementById('prgrid');if(old)old.remove();
  var g=document.createElementNS(NS,'g');g.id='prgrid';var h='';
  var st=[5,10,25,50].find(function(s){return s*ppm>=16})||100,maj={5:25,10:50,25:100,50:250,100:500}[st];
  for(var x=Math.ceil(vb.x/st)*st;x<=vb.x+vb.w;x+=st){var M=Math.abs(x%maj)<.01;h+='<line class="prg" x1="'+x+'" y1="'+vb.y+'" x2="'+x+'" y2="'+(vb.y+vb.h)+'" stroke="rgba(0,0,0,'+(M?.24:.09)+')" stroke-width="'+(M?.7:.5)+'"/>'}
  for(var y=Math.ceil(vb.y/st)*st;y<=vb.y+vb.h;y+=st){var M=Math.abs(y%maj)<.01;h+='<line class="prg" x1="'+vb.x+'" y1="'+y+'" x2="'+(vb.x+vb.w)+'" y2="'+y+'" stroke="rgba(0,0,0,'+(M?.24:.09)+')" stroke-width="'+(M?.7:.5)+'"/>'}
  if(o.kind==='all')rects.forEach(function(r){var b=r.box,c=r.part?'#1d6b66':'#b0412e';
    h+='<rect class="prg" x="'+b[0]+'" y="'+b[1]+'" width="'+(b[2]-b[0])+'" height="'+(b[3]-b[1])+'" stroke="'+c+'" stroke-width="'+(r.part?1.6:1.3)+'" stroke-dasharray="'+(r.part?'7 4':'3 2.5')+'"/>';
    var lx=r.part?(b[0]+b[2])/2:b[0],ly=r.part?(b[1]+b[3])/2:b[1];
    h+='<g transform="translate('+lx+' '+ly+') scale('+(1/ppm)+')"><text x="'+(r.part?0:3)+'" y="'+(r.part?5:-5)+'" text-anchor="'+(r.part?'middle':'start')+'" style="font-size:'+(r.part?15:12)+'px;font-weight:700;fill:'+c+';stroke-width:4px">'+r.label+'</text></g>'});
  g.innerHTML=h;svg.appendChild(g);
  // заголовок
  var ins='',list='';
  if(o.kind==='all')ins='Рамки показують, які частини території є на наступних аркушах у більшому масштабі: бірюзові — '+o.span[0]+' (асфальт і доріжки), червоні — корпуси з відділеннями ('+o.span[1]+').';
  else if(o.kind==='part')ins='<b>Заштрихуйте все, що насправді заасфальтоване</b>: двори, майданчики, стоянки. Зелене на карті — газон. Неправильну доріжку закресліть, відсутню домалюйте. Сітка: тонкі лінії через '+st+' м.';
  else{ins='<b>Обведіть частину корпусу, яку займає кожне відділення, і впишіть у контур його номер.</b> ';
    var Dk=D.filter(function(d){return o.ks.indexOf(d.k)>=0&&d.id!=='lift'&&d.id!=='pr'});
    if(o.floor){var on=Dk.filter(function(d){return d.fl===o.floor}),un=Dk.filter(function(d){return !d.fl});
      list=(on.length?'На '+o.floor+' поверсі за картою: '+on.map(PR.lbl).join(', ')+'. ':'')+'Поверх поки невідомий: '+un.map(PR.lbl).join(', ')+' — якщо вони на цьому поверсі, теж обведіть.';}
    else{list=o.ks.map(function(k){var a=Dk.filter(function(d){return d.k===k});return 'корпус '+k+': '+(a.length?a.map(PR.lbl).join(', '):'відділень за картою немає')}).join(' · ')+'. Біля кожного контуру підпишіть поверх.';
      list=list.charAt(0).toUpperCase()+list.slice(1)}
    ins+=list}
  var right=(o.floor?'<div class="fl">'+o.floor+' поверх</div><br>':'')+'аркуш '+o.n+' з '+o.N+'<br>'+date;
  document.getElementById('prh').innerHTML='<div><div class="t">Аріадна · карта-план психіатричної лікарні — '+o.title+'</div><div class="i">'+ins+'</div></div><div class="r">'+right+'</div>';
  // масштабна лінійка
  var len=[5,10,20,25,50,100,200,250].find(function(l){return l*ppm>=60})||500,px=len*ppm;
  var sb='<svg width="'+(px+44)+'" height="26" viewBox="0 0 '+(px+44)+' 26"><rect x="1" y="9" width="'+px/2+'" height="5" fill="#111"/><rect x="'+(1+px/2)+'" y="9" width="'+px/2+'" height="5" fill="#fff" stroke="#111" stroke-width=".8"/><rect x="1" y="9" width="'+px+'" height="5" fill="none" stroke="#111" stroke-width=".8"/>'
   +'<text x="1" y="24" font-size="9.5" fill="#111">0</text><text x="'+(px+4)+'" y="15" font-size="10.5" font-weight="700" fill="#111">'+len+' м</text></svg>';
  var na='<svg width="30" height="30" viewBox="-15 -15 30 30"><path d="M0-13 6 6 0 2-6 6Z" fill="#111"/><text y="14" text-anchor="middle" font-size="8" font-weight="700" fill="#111">Пн</text></svg>';
  document.getElementById('prf').innerHTML=sb+na+'<span>Сітка: '+(o.kind==='all'?'лінії через '+st+' м':'тонкі лінії через '+st+' м, товсті через '+maj+' м')+'</span><span class="sp"></span><span>Друкуйте A4 альбомно, масштаб 100%. Карта: ariadna-map.github.io</span>';
  return JSON.stringify({ppm:+ppm.toFixed(3),scale:Math.round(1000/(ppm*0.26458)),vb:[vb.x,vb.y,vb.w].map(function(v){return +v.toFixed(1)}),st:st,len:len});
}};1`;

const port=9300+Math.floor(Math.random()*500);
const ch=spawn('google-chrome',['--headless=new','--no-sandbox','--disable-gpu','--hide-scrollbars',`--remote-debugging-port=${port}`,'--user-data-dir=/tmp/cdp'+port,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let list;for(let i=0;i<50;i++){try{list=await (await fetch(`http://127.0.0.1:${port}/json`)).json();if(list.length)break}catch{}await sleep(200)}
const t=list.find(x=>x.type==='page');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend={};ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.method==='Runtime.exceptionThrown')console.log('JS-ERROR',JSON.stringify(d.params.exceptionDetails).slice(0,400));if(d.id&&pend[d.id]){pend[d.id](d);delete pend[d.id]}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method,params}))});
const ev=async e=>{const r=await send('Runtime.evaluate',{expression:e,returnByValue:true});if(r.result.exceptionDetails)throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0,500));return r.result.result.value};
await send('Page.enable');await send('Runtime.enable');
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]});
await send('Emulation.setDeviceMetricsOverride',{width:W,height:H,deviceScaleFactor:2,mobile:false});
await send('Page.navigate',{url:'file://'+path.resolve(page)});await sleep(2500);
await ev(PAGEJS);await ev('PR.setup('+JSON.stringify(CSS)+');1');await sleep(400);
const files=[];
for(const s of S){
  console.log(s.n,s.title,s.floor||'',await ev('PR.sheet('+JSON.stringify(s)+','+JSON.stringify(RECTS)+','+JSON.stringify(DATE)+')'));
  await sleep(500);
  const png=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`${outDir}/p${String(s.n).padStart(2,'0')}.png`,Buffer.from(png.result.data,'base64'));
  const pdf=await send('Page.printToPDF',{paperWidth:11.69,paperHeight:8.27,marginTop:0,marginBottom:0,marginLeft:0,marginRight:0,printBackground:true,pageRanges:'1',preferCSSPageSize:false});
  if(!pdf.result)throw new Error(JSON.stringify(pdf.error));
  const f=`${outDir}/p${String(s.n).padStart(2,'0')}.pdf`;fs.writeFileSync(f,Buffer.from(pdf.result.data,'base64'));files.push(f);
}
ws.close();ch.kill();
execFileSync('qpdf',['--empty','--compression-level=9','--recompress-flate','--object-streams=generate','--pages',...files,'--',`${outDir}/ariadna-druk.pdf`]);
console.log('ok',`${outDir}/ariadna-druk.pdf`);process.exit(0);
