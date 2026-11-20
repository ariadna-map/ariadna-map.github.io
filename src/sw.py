# Офлайн-кеш (20.11.2026): генерує ../sw.js. Список файлів — усе локальне, що вантажить index.html (шрифти, значки),
# версія — відбиток цих файлів: змінився сайт — змінилася версія — телефон оновить кеш.
import hashlib, os, re
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(D, '..')
s = open(os.path.join(ROOT, 'index.html'), encoding='utf8').read()
refs = set(re.findall(r'''(?:src|href|srcset)=["']([^"'#?]+)["']''', s)) | set(re.findall(r'''url\(["']?([^"')]+)["']?\)''', s))
assets = sorted(r for r in refs if not r.startswith(('http', 'data:', 'mailto', 'tel', '//', '#', 'javascript')) and os.path.exists(os.path.join(ROOT, r)))
h = hashlib.sha1(s.encode('utf8'))
for a in assets: h.update(open(os.path.join(ROOT, a), 'rb').read())
V = 'ariadna-' + h.hexdigest()[:10]
pre = ['/'] + ['/' + a for a in assets]
SW = '''/* Ariadna — офлайн-кеш. Згенеровано src/sw.py; руками не правити. */
const V=%(v)s,PRE=%(pre)s;
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(PRE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("ariadna-")&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
/* сторінка: спершу мережа (щоб бачити свіжі зміни), але якщо мережі немає чи вона думає довше 4 с — з кешу.
   Будь-яка адреса сайту (/viddilennia-16, /?to=16…) без мережі відкриває карту з кешу — карта сама прочитає адресу. */
function page(req){const net=fetch(req).then(r=>{if(r.ok&&new URL(req.url).pathname==="/"){const c=r.clone();caches.open(V).then(x=>x.put("/",c))}return r});
  const slow=new Promise(ok=>setTimeout(ok,4000)).then(()=>caches.match("/"));
  return Promise.race([net.catch(()=>caches.match("/")),slow.then(r=>r||net)]).then(r=>r||net)}
self.addEventListener("fetch",e=>{const r=e.request,u=new URL(r.url);if(r.method!=="GET"||u.origin!==location.origin)return;
  if(r.mode==="navigate"){e.respondWith(page(r));return}
  /* правки з редактора: спершу мережа (щоб зміни було видно одразу), без мережі чи за 3 с — з кешу */
  if(u.pathname.startsWith("/data/")){e.respondWith(new Promise(ok=>{let done=false;const c=()=>caches.match(r,{ignoreSearch:true});
    const t=setTimeout(()=>c().then(x=>{if(x&&!done){done=true;ok(x)}}),3000);
    fetch(r,{cache:"no-store"}).then(n=>{if(n.ok){const k=n.clone();caches.open(V).then(z=>z.put(r,k))}if(!done){done=true;clearTimeout(t);ok(n)}},
      ()=>c().then(x=>{if(!done){done=true;clearTimeout(t);ok(x||Response.error())}}))}));return}
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(c=>c||fetch(r).then(n=>{if(n.ok){const k=n.clone();caches.open(V).then(x=>x.put(r,k))}return n})))});
''' % {'v': repr(V).replace("'", '"'), 'pre': repr(pre).replace("'", '"')}
open(os.path.join(ROOT, 'sw.js'), 'w', encoding='utf8').write(SW)
print('sw.js', V, len(pre), 'файлів')
