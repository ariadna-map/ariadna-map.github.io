import {spawn} from 'node:child_process';import fs from 'node:fs';
const port=9600+Math.floor(Math.random()*300);
const ch=spawn('google-chrome',['--headless=new','--no-sandbox','--disable-gpu','--allow-file-access-from-files',`--remote-debugging-port=${port}`,'--user-data-dir=/tmp/cdq'+port,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let list;for(let i=0;i<50;i++){try{list=await (await fetch(`http://127.0.0.1:${port}/json`)).json();if(list.length)break}catch{}await sleep(200)}
const t=list.find(x=>x.type==='page');const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend={};ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id]){pend[d.id](d);delete pend[d.id]}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method,params}))});
await send('Page.enable');await send('Page.navigate',{url:'file://'+process.argv[2]});
let v;for(let i=0;i<60;i++){await sleep(500);v=(await send('Runtime.evaluate',{expression:'JSON.stringify({d:window.DONE,e:window.ERR,l:window.LOG,k:Object.keys(window).filter(k=>/skel/i.test(k))})',returnByValue:true})).result.result.value;if(JSON.parse(v).d)break}
console.log(v);const o=(await send('Runtime.evaluate',{expression:'window.OUT||""',returnByValue:true})).result.result.value;if(o)fs.writeFileSync(process.argv[3],o);
ws.close();ch.kill();process.exit(0);
