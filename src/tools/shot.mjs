// usage: node shot.mjs url out.png w h mobile(0/1) [steps-json]
import {spawn} from 'node:child_process';
const [,,url,out,W,H,mob,stepsJson]=process.argv;
const port=9300+Math.floor(Math.random()*500);
const ch=spawn('google-chrome',['--headless=new','--no-sandbox','--disable-gpu','--hide-scrollbars',`--remote-debugging-port=${port}`,'--user-data-dir=/tmp/cdp'+port,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let list;for(let i=0;i<50;i++){try{list=await (await fetch(`http://127.0.0.1:${port}/json`)).json();if(list.length)break}catch{}await sleep(200)}
const t=list.find(x=>x.type==='page');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend={};ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.method==='Runtime.exceptionThrown')console.log('JS-ERROR',JSON.stringify(d.params.exceptionDetails.exception&&d.params.exceptionDetails.exception.description||d.params.exceptionDetails.text).slice(0,400));if(d.id&&pend[d.id]){pend[d.id](d);delete pend[d.id]}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method,params}))});
await send('Page.enable');if(process.env.DARK)await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'}]});await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',{width:+W,height:+H,deviceScaleFactor:+mob?2:1,mobile:!!+mob});
if(+mob)await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
if(process.env.GEO){const [la,lo,ac]=process.env.GEO.split(',').map(Number);await send('Browser.grantPermissions',{permissions:['geolocation']});await send('Emulation.setGeolocationOverride',{latitude:la,longitude:lo,accuracy:ac||10})}
if(process.env.GEODENY)await send('Browser.setPermission',{permission:{name:'geolocation'},setting:'denied'});
await send('Page.navigate',{url});await sleep(2500);
const steps=stepsJson?JSON.parse(stepsJson):[];
for(const s of steps){
  if(s.eval){const r=await send('Runtime.evaluate',{expression:s.eval,returnByValue:true});if(s.log)console.log(JSON.stringify(r.result.result&&r.result.result.value))}
  if(s.tap){const [x,y]=s.tap;for(const type of ['touchStart','touchEnd'])await send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});}
  if(s.click){const [x,y]=s.click;for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,x,y,button:'left',clickCount:1});}
  if(s.drag){const [x0,y0,x1,y1]=s.drag;await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x0,y:y0}]});for(let i=1;i<=10;i++){await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x0+(x1-x0)*i/10,y:y0+(y1-y0)*i/10}]});await sleep(16)}await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  if(s.cdp){const r=await send(s.cdp[0],s.cdp[1]||{});if(s.log)console.log(JSON.stringify(r.result||r.error))}
  if(s.wait)await sleep(s.wait);
  if(s.shot){const r=await send('Page.captureScreenshot',{format:'png'});(await import('node:fs')).writeFileSync(s.shot,Buffer.from(r.result.data,'base64'))}
}
const r=await send('Page.captureScreenshot',{format:'png'});(await import('node:fs')).writeFileSync(out,Buffer.from(r.result.data,'base64'));
ws.close();ch.kill();process.exit(0);
