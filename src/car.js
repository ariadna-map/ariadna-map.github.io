/* ---------- «На авто» (18.11.2026): машиною — лише дорогами («v»), не під будівлями; шлагбаум біля адміністрації вважаємо закритим.
   Заїзд — дорогою від зупинки «Лікарня ім. Павлова» (e1) і Врубелівським узвозом від вул. Кирилівської (e3).
   Машину лишаємо там, звідки найшвидше дійти до дверей; далі — пішки. Місць для паркування поки немає. ---------- */
var CAR_IN={e1:[-322,-99],e3:[444,9]},CAR_BLOCK=[[91.4,17.6]],CAR_V=250,WALK_V=70,CARG=null;
function inRings(p,rings){var c=false;rings.forEach(function(r){for(var i=0,j=r.length-1;i<r.length;j=i++){var a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c}});return c}
function carGraph(){
  if(CARG)return CARG;
  var idx={},nodes=[],adj=[],BR=B.map(function(b){return b.p.map(pts)});
  function node(p){var k=p[0].toFixed(1)+","+p[1].toFixed(1);if(idx[k]===undefined){idx[k]=nodes.length;nodes.push(p);adj.push([])}return idx[k]}
  function blocked(a,b){var m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
    if(CAR_BLOCK.some(function(q){return Math.hypot(q[0]-m[0],q[1]-m[1])<6}))return true;
    return BR.some(function(r){return inRings(m,r)})}
  WAYS.split("\n").forEach(function(line){
    var sp=line.indexOf(" "),code=line.slice(0,sp);if(code!=="v")return;var p=pts(line.slice(sp+1));
    for(var i=1;i<p.length;i++){
      var a=p[i-1],b=p[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/10)),pa=a,prev=node(a);
      for(var j=1;j<=n;j++){var q=j===n?b:[a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n],cur=node(q);if(!blocked(pa,q)){adj[prev].push([cur,L/n]);adj[cur].push([prev,L/n])}prev=cur;pa=q}
    }
  });
  return CARG={idx:idx,nodes:nodes,adj:adj};
}
function nearestNode(g,p,max){var s=-1,bd=max;for(var q=0;q<g.nodes.length;q++){var d=Math.hypot(g.nodes[q][0]-p[0],g.nodes[q][1]-p[1]);if(d<bd&&g.adj[q].length){bd=d;s=q}}return s}
/* маршрут машиною від точки from до місця, звідки найшвидше дійти до дверей; повертає дві частини: drive і walk */
function carRoute(from,door,noSteps){
  var cg=carGraph(),s=nearestNode(cg,from,40);if(s<0)return null;
  var g=graph(noSteps),dn=nearestNode(g,door,40);if(dn<0)return null;
  var tail=Math.hypot(g.nodes[dn][0]-door[0],g.nodes[dn][1]-door[1]);
  var dr=dijkstra(cg,s),wr=dijkstra(g,dn),best=-1,bc=Infinity;
  for(var c=0;c<cg.nodes.length;c++){if(dr.dist[c]===Infinity)continue;var gi=g.idx[cg.nodes[c][0].toFixed(1)+","+cg.nodes[c][1].toFixed(1)];if(gi===undefined||wr.dist[gi]===Infinity)continue;
    var cost=dr.dist[c]/CAR_V+(wr.dist[gi]+tail)/WALK_V;if(cost<bc){bc=cost;best=c}}
  if(best<0)return null;
  var drive=[];for(var x=best;x>=0;x=dr.prev[x])drive.push(cg.nodes[x]);drive.reverse();
  var walk=[],gb=g.idx[cg.nodes[best][0].toFixed(1)+","+cg.nodes[best][1].toFixed(1)];for(var y=gb;y>=0;y=wr.prev[y])walk.push(g.nodes[y]);
  var dl=dr.dist[best],wl=wr.dist[gb]+tail;
  return {drive:drive,walk:walk,park:cg.nodes[best],dlen:dl,wlen:wl,len:dl+wl,min:Math.max(1,Math.ceil(dl/CAR_V+wl/WALK_V))};
}
/* найкращий в'їзд для цієї точки призначення */
function carBest(door,noSteps){var o=null;Object.keys(CAR_IN).forEach(function(k){var r=carRoute(CAR_IN[k],door,noSteps);if(r&&(!o||r.min<o.r.min||(r.min===o.r.min&&r.len<o.r.len)))o={k:k,r:r}});return o}
