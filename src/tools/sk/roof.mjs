import pkg from 'straight-skeleton';const {SkeletonBuilder}=pkg;
import fs from 'node:fs';
await SkeletonBuilder.init();
const {B,LMB}=JSON.parse(fs.readFileSync('/home/claude/karta/bld.json','utf8'));
const pts=s=>s.trim().split(/\s+/).map(a=>a.split(',').map(Number));
const area=r=>{let a=0;for(let i=0;i<r.length;i++){const p=r[i],q=r[(i+1)%r.length];a+=p[0]*q[1]-q[0]*p[1]}return a/2};
// our y axis points south; flip to y-up for CGAL orientation, then flip back
function skel(rings){
  const R=rings.map((r,i)=>{let q=pts(r).map(([x,y])=>[x,-y]);const a=area(q);if((i===0&&a<0)||(i>0&&a>0))q.reverse();q.push(q[0]);return q});
  const s=SkeletonBuilder.buildFromPolygon(R);if(!s)return null;
  return s.polygons.map(poly=>poly.map(i=>{const v=s.vertices[i];return [v[0],-v[1],v[2]]}));
}
const PITCH=Math.tan(32*Math.PI/180), L=(()=>{const v=[-0.55,-0.65,0.75];const n=Math.hypot(...v);return v.map(c=>c/n)})();
const flat=L[2];
function shade(face){
  // Newell normal in 3D (x east, y south, z up)
  let nx=0,ny=0,nz=0;const P=face.map(([x,y,t])=>[x,y,t*PITCH]);
  for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];nx+=(a[1]-b[1])*(a[2]+b[2]);ny+=(a[2]-b[2])*(a[0]+b[0]);nz+=(a[0]-b[0])*(a[1]+b[1])}
  const n=Math.hypot(nx,ny,nz)||1;nx/=n;ny/=n;nz/=n;if(nz<0){nx=-nx;ny=-ny;nz=-nz}
  return +(nx*L[0]+ny*L[1]+nz*L[2]-flat).toFixed(3);
}
const pitched={2:1,3:1,4:1,6:1,7:1,9:1,22:1};
const out={b:{},l:{}};
function doit(rings){const f=skel(rings);if(!f)return null;return f.map(face=>({p:face.map(v=>v[0].toFixed(1)+','+v[1].toFixed(1)).join(' '),s:shade(face),h:+Math.max(...face.map(v=>v[2])).toFixed(2)}))}
for(const i in pitched){const r=doit(B[i].p);if(r)out.b[i]=r;else console.error('fail',i)}
LMB.forEach((l,i)=>{if(i===1){const r=doit([l.p]);if(r)out.l[i]=r}});
fs.writeFileSync('/home/claude/karta/roofs.json',JSON.stringify(out));
console.log(Object.keys(out.b).map(k=>k+':'+out.b[k].length).join(' '),'lmb',Object.keys(out.l).length, JSON.stringify(out).length);
