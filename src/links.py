# Зрозумілі посилання (20.11.2026): ariadna-map.github.io/viddilennia-16, /korpus-5, /pryimalne-viddilennia …
# Для кожного відділення й корпусу — маленька сторінка в корені сайту: месенджери (Telegram, Viber, WhatsApp, Facebook)
# беруть з неї назву, опис і картинку для картки-прев’ю, а людину вона одразу переводить на карту (/?to=…).
# Запускається з build.py після складання index.html; дані бере з /tmp/t.js (головний скрипт сторінки).
import json, os, re, subprocess, html
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(D, '..')
SITE = 'https://ariadna-map.github.io'
PLACE = 'Психіатрична лікарня · Київ, вул. Кирилівська, 103'
OGIMG = SITE + '/brand/og.jpg'
CTA = 'Карта прокладе шлях від того місця, де ви будете.'

# --- дані з головного скрипту сторінки ---
t = open('/tmp/t.js', encoding='utf8').read()
dump = r'''
console.log(JSON.stringify({D:D.map(function(d){return {id:d.id,t:d.t||null,full:d.full||null,short:d.short||null,q:!!d.q,x:!!d.x,k:d.k,fl:d.fl==null?null:d.fl,vis:d.vis||null}}),
  B:B.filter(function(b){return b.k}).map(function(b){return {k:b.k,n:b.n||"",priv:!!b.priv}})}));process.exit(0);
'''
t = t.replace('if(typeof document==="undefined"){', 'if(typeof document==="undefined"){' + dump, 1)
open('/tmp/links_dump.js', 'w', encoding='utf8').write(t)
data = json.loads(subprocess.run(['node', '/tmp/links_dump.js'], capture_output=True, text=True, check=True).stdout)

# --- транслітерація за постановою КМУ № 55 (2010) ---
TR = {'а':'a','б':'b','в':'v','г':'h','ґ':'g','д':'d','е':'e','є':'ie','ж':'zh','з':'z','и':'y','і':'i','ї':'i','й':'i','к':'k','л':'l','м':'m',
      'н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ь':'','ю':'iu','я':'ia'}
FIRST = {'є':'ye','ї':'yi','й':'y','ю':'yu','я':'ya'}
def slug(s):
    s = s.lower().replace('’', '').replace("'", '').replace('ʼ', '').replace('зг', 'zgh')
    out = []; prev = ' '
    for ch in s:
        out.append(FIRST[ch] if ch in FIRST and not prev.isalpha() else TR.get(ch, ch)); prev = ch
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', ''.join(out))).strip('-')

def hm(m): return '%d:%02d' % (m // 60, m % 60)
def fl_t(f): return str(f) + (' поверхи' if isinstance(f, str) and re.match(r'^\d', f) else ' поверх')

# «Маршрут до …»: родовий відмінок для названих місць (для нових — запасний варіант «Як дійти: …»)
TO = {'pr':'до приймального відділення','pol':'до поліклініки','amb':'до амбулаторії № 1','adm':'до адміністрації',
      'kab':'до кабінету амбулаторного прийому','prm':'до приймального відділення (чоловічий блок)','prw':'до приймального відділення (жіночий блок)',
      'arh':'до архіву','ekopfo':'до ЕКОПФО','lift':'до ліфта корпусу 1','vkz':'до великої конференц-зали','muz':'до музею',
      'ukr11':'до укриття в корпусі 11','cafe':'до кафе','mkz':'до малої конференц-зали'}
items = []   # (to, slug, title, description, card_title)
for d in data['D']:
    named = d['q'] or d['x']
    title = d['t'] if named else 'Відділення № ' + d['id']
    sl = slug(d['t'] if named else 'Відділення ' + d['id'])
    card = 'Маршрут ' + (TO[d['id']] if named and d['id'] in TO else 'до відділення № ' + d['id']) if (not named or d['id'] in TO) else 'Як дійти: ' + d['t']
    bits = []
    v = d['vis']
    if v: bits.append('Години відвідувань: щоденно ' + ' і '.join(hm(a) + '–' + hm(b) for a, b in v['o']) +
                      (', тиха година ' + hm(v['q'][0]) + '–' + hm(v['q'][1]) if v.get('q') else '') + '.')
    where = ('Корпус ' + d['k'] if d['k'] else '') + (', ' + fl_t(d['fl']) if d['fl'] is not None else '')
    if where and not re.search(r'корпус', title, re.I): bits.append(where + '.')
    if d['full'] and d['full'] != d['t']: bits.append(d['full'] + '.')
    bits.append(CTA)
    items.append((d['id'], sl, title, ' '.join(bits), card))
for b in data['B']:
    title = 'Корпус ' + b['k'] + (' — ' + b['n'] if b['n'] else '')
    items.append(('k' + b['k'], 'korpus-' + b['k'], title, (b['n'] + '. ' if b['n'] else '') + CTA, 'Маршрут до корпусу ' + b['k']))

seen = {}
for i, (to, sl, ti, de, ca) in enumerate(items):
    if sl in seen: sl = sl + '-' + slug(to); items[i] = (to, sl, ti, de, ca)
    assert sl not in seen, sl; seen[sl] = to

PAGE = '''<!DOCTYPE html>
<html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{card} · {place}</title>
<meta name="description" content="{desc}">
<meta property="og:type" content="website"><meta property="og:locale" content="uk_UA">
<meta property="og:site_name" content="Карта-план психіатричної лікарні · Кирилівська, 103">
<meta property="og:title" content="{card}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{img}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Карта-план психіатричної лікарні, вул. Кирилівська, 103">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="/brand/ariadna-favicon.svg">
<script>location.replace({go_js}+location.hash)</script>
</head><body style="font:17px/1.5 system-ui,sans-serif;margin:24px"><p><a href="{go}">{title} — відкрити карту</a></p></body></html>
'''
man = os.path.join(D, 'links-manifest.txt')
old = set(open(man).read().split()) if os.path.exists(man) else set()
new = set()
for to, sl, ti, de, ca in items:
    go = '/?to=' + to; fn = sl + '.html'; new.add(fn)
    open(os.path.join(ROOT, fn), 'w', encoding='utf8').write(PAGE.format(
        title=html.escape(ti), card=html.escape(ca), place=html.escape(PLACE), desc=html.escape(de), url=SITE + '/' + sl, img=OGIMG,
        go=html.escape(go), go_js=json.dumps(go)))
for fn in old - new:   # відділення перейменували чи прибрали — стара сторінка йде
    p = os.path.join(ROOT, fn)
    if os.path.exists(p): os.remove(p)
open(man, 'w').write('\n'.join(sorted(new)) + '\n')

# --- карта «куди → зрозуміла адреса» для кнопки «Надіслати» ---
ip = os.path.join(ROOT, 'index.html'); s = open(ip, encoding='utf8').read()
m = json.dumps({it[0]: it[1] for it in items}, ensure_ascii=False, separators=(',', ':'))[1:-1]
assert s.count('/*SLUGS*/') == 1
s = s.replace('/*SLUGS*/', m)
# картка-прев’ю для головної сторінки (QR, загальне посилання)
T0 = '<title>Ariadna — карта-план психіатричної лікарні</title>'
assert s.count(T0) == 1
OG = ('\n<meta property="og:type" content="website"><meta property="og:locale" content="uk_UA">'
      '\n<meta property="og:site_name" content="Ariadna">'
      '\n<meta property="og:title" content="Карта-план психіатричної лікарні · Кирилівська, 103">'
      '\n<meta property="og:description" content="Де корпус і відділення, як дійти від зупинки чи від того місця, де ви є. Години передач і відвідувань.">'
      '\n<meta property="og:url" content="' + SITE + '/">'
      '\n<meta property="og:image" content="' + OGIMG + '"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'
      '\n<meta property="og:image:alt" content="Карта-план психіатричної лікарні, вул. Кирилівська, 103">'
      '\n<meta name="twitter:card" content="summary_large_image">')
s = s.replace(T0, T0 + OG)
open(ip, 'w', encoding='utf8').write(s)
print(len(items), 'зрозумілих посилань')
