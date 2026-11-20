# Дані для редактора (/redaktor, 21.11.2026): ../data/base.json — відділення, корпуси й входи такими, як вони є в коді карти
# (без правок з редактора). Редактор показує їх і зберігає лише відмінності в data/edits.js.
# Запускається з build.py; бере дані з /tmp/t.js (головний скрипт сторінки).
import json, os, subprocess
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(D, '..')
t = open('/tmp/t.js', encoding='utf8').read()
dump = r'''
function pick(o,ks){var r={};ks.forEach(function(k){if(o[k]!==undefined)r[k]=o[k]});return r}
console.log(JSON.stringify({
  D:D.map(function(d){return pick(d,["id","q","x","t","full","short","sub","k","fl","ent","ents","door","d","tel","vis","note","lift"])}),
  B:B.filter(function(b){return b.k}).map(function(b){return {k:b.k,n:b.n||"",priv:!!b.priv}}),
  ENT:Object.keys(ENT).map(function(k){var e=ENT[k];return {id:k,k:e.k||null,t:e.t||"",n:e.n||""}})}));process.exit(0);
'''
t = t.replace('if(typeof document==="undefined"){', 'if(typeof document==="undefined"){' + dump, 1)
open('/tmp/editor_dump.js', 'w', encoding='utf8').write(t)
data = json.loads(subprocess.run(['node', '/tmp/editor_dump.js'], capture_output=True, text=True, check=True).stdout)
data['B'].sort(key=lambda b: (len(b['k']), b['k']))
os.makedirs(os.path.join(ROOT, 'data'), exist_ok=True)
open(os.path.join(ROOT, 'data', 'base.json'), 'w', encoding='utf8').write(json.dumps(data, ensure_ascii=False, separators=(',', ':')))
print('base.json:', len(data['D']), 'місць,', len(data['B']), 'корпусів,', len(data['ENT']), 'входів')
