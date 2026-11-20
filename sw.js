/* Ariadna — офлайн-кеш. Згенеровано src/sw.py; руками не правити. */
const V="ariadna-612317bd70",PRE=["/", "/brand/apple-touch-icon.png", "/brand/ariadna-favicon-mykolai.svg", "/brand/ariadna-favicon.svg", "/brand/ariadna-wordmark-small-reverse.svg", "/brand/ariadna-wordmark-small.svg", "/fonts/FixelText-Bold.woff2", "/fonts/FixelText-Medium.woff2", "/fonts/FixelText-Regular.woff2", "/fonts/FixelText-SemiBold.woff2"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(PRE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("ariadna-")&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
/* сторінка: спершу мережа (щоб бачити свіжі зміни), але якщо мережі немає чи вона думає довше 4 с — з кешу.
   Будь-яка адреса сайту (/viddilennia-16, /?to=16…) без мережі відкриває карту з кешу — карта сама прочитає адресу. */
function page(req){const net=fetch(req).then(r=>{if(r.ok&&new URL(req.url).pathname==="/"){const c=r.clone();caches.open(V).then(x=>x.put("/",c))}return r});
  const slow=new Promise(ok=>setTimeout(ok,4000)).then(()=>caches.match("/"));
  return Promise.race([net.catch(()=>caches.match("/")),slow.then(r=>r||net)]).then(r=>r||net)}
self.addEventListener("fetch",e=>{const r=e.request,u=new URL(r.url);if(r.method!=="GET"||u.origin!==location.origin)return;
  if(r.mode==="navigate"){e.respondWith(page(r));return}
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(c=>c||fetch(r).then(n=>{if(n.ok){const k=n.clone();caches.open(V).then(x=>x.put(r,k))}return n})))});
