import re,os
D=os.path.dirname(os.path.abspath(__file__));P=lambda f:os.path.join(D,f)
s=open(P('src.html'),encoding='utf8').read()
s=s.replace('/*CTX*/',open(P('context.txt'),encoding='utf8').read().strip())
s=s.replace('/*ROOFS*/',open(P('roofs.json')).read())
s=s.replace('/*TERRAIN*/',open(P('terrain.json')).read())
open(os.path.join(D,'..','index.html'),'w',encoding='utf8').write(s)
js=re.search(r'<script>(.*)</script>',s,re.S).group(1);open('/tmp/t.js','w').write(js)
