/* входи: «шпилька» — кружечок зі значком «вхід» стоїть зовні, гострий кінчик торкається дверей.
   Напрямок — усередину до найближчої стіни свого корпусу; dir — ручний напрямок у градусах (0 — на схід, 90 — на південь); ta — бік підпису (l, r, t, b) */
function inRings(rs,x,y){var c=false;rs.forEach(function(r){for(var i=0,j=r.length-1;i<r.length;j=i++){var a=r[i],b=r[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}});return c}
function entDir(e){if(e.dir!==undefined)return e.dir;var b=null;B.forEach(function(q){if(!b&&q.k===e.k)b=q});if(!b)return 0;
  var rs=b.p.map(pts),best=null,P=e.p;
  rs.forEach(function(r){for(var i=0;i<r.length;i++){var a=r[i],c=r[(i+1)%r.length],dx=c[0]-a[0],dy=c[1]-a[1],L2=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((P[0]-a[0])*dx+(P[1]-a[1])*dy)/L2)),d=Math.hypot(a[0]+dx*t-P[0],a[1]+dy*t-P[1]);
    if(!best||d<best.d){var L=Math.sqrt(L2);best={d:d,n:[-dy/L,dx/L]}}}});
  var n=best.n;if(!inRings(rs,P[0]+n[0]*1.5,P[1]+n[1]*1.5))n=[-n[0],-n[1]];return Math.round(Math.atan2(n[1],n[0])*180/Math.PI)}
var PINR=7.2,PINC=12.4;
/* значок усередині кружечка не крутиться (повернутий навскіс, він не читається), лише дзеркалиться, коли двері ліворуч;
   спершу входи інших корпусів, щоб підписи входів корпусу 1 лягали поверх них */
Object.keys(ENT).sort(function(p,q){return (/^b\d/.test(p)?0:1)-(/^b\d/.test(q)?0:1)}).forEach(function(id){var e=ENT[id],a=entDir(e),r=a*Math.PI/180,ux=Math.cos(r),uy=Math.sin(r),cx=-ux*PINC,cy=-uy*PINC,
    side=e.ta||(Math.abs(ux)>=.5?(ux<0?"r":"l"):(uy<0?"b":"t")),
    tx=side==="r"?cx+PINR+3:side==="l"?cx-PINR-3:cx,ty=side==="t"?cy-PINR-4:side==="b"?cy+PINR+11:cy+3.7,an=side==="r"?"start":side==="l"?"end":"middle";
  h+=lbl("door sec",e.p[0],e.p[1],0,'<path class="dr" transform="rotate('+a+')" d="M0 0-6.2-3.6A7.2 7.2 0 1 0-6.2 3.6Z"/><path class="dg" transform="translate('+cx.toFixed(2)+' '+cy.toFixed(2)+')'+(ux<-.3?' scale(-1 1)':'')+'" d="M.6-3.7h2.9v7.4H.6M-3.9 0h4.6M-.9-2.3 1.4 0l-2.3 2.3"/>'+
    (e.t?'<text x="'+tx.toFixed(1)+'" y="'+ty.toFixed(1)+'" text-anchor="'+an+'">'+esc(e.t)+'</text>':'')+'<circle class="hit" cx="'+(cx/2).toFixed(1)+'" cy="'+(cy/2).toFixed(1)+'" r="13" data-ent="'+id+'"/>','data-en="'+id+'"')});
