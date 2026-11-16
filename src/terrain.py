import base64, io, json, numpy as np, cv2
from scipy import ndimage
from skimage import measure
from PIL import Image
b=base64.b64decode(open('dem.b64').read().strip())
Z=np.frombuffer(b,dtype=np.uint8).reshape(93,113).astype(float)/2+100
S=10;X0=-560;Y0=-520
Z=ndimage.gaussian_filter(Z,1.3)
F=4;Zu=ndimage.zoom(Z,F,order=3);s=S/F   # 2.5 m grid
ny,nx=Zu.shape
def W(ix,iy): return X0+ix*s, Y0+iy*s
# hillshade (sun NW, alt 40), z-exaggeration 1.6
gy,gx=np.gradient(Zu*1.6,s)
slope=np.arctan(np.hypot(gx,gy)); aspect=np.arctan2(-gx,gy)
az=np.radians(315-90); alt=np.radians(40)
# light vector in x(east), y(south): from NW => pointing to (-1,-1)
lx,ly=-np.sqrt(.5),-np.sqrt(.5)
nxv=-gx; nyv=-gy; nz=np.ones_like(gx); n=np.sqrt(nxv**2+nyv**2+nz**2)
Lz=np.sin(alt); Lh=np.cos(alt)
sh=(nxv*lx*Lh+nyv*ly*Lh+nz*Lz)/n
flat=Lz
shadow=np.clip((flat-sh)*2.2,0,1)      # darker on slopes facing away from sun
light=np.clip((sh-flat)*1.6,0,1)
img=np.zeros((ny,nx,4),np.uint8)
# encode: shadow as dark alpha; light as white alpha (two layers) -> use single RGBA: grey value 0 for shadow, 255 for light
val=np.where(shadow>light,0,255).astype(np.uint8)
a=np.clip(np.maximum(shadow*120,light*60),0,255).astype(np.uint8)
# edge falloff: the shading fades out towards the edges of the data, no hard seam on the map
yy,xx=np.mgrid[0:ny,0:nx]
dist=np.minimum.reduce([xx,nx-1-xx,yy,ny-1-yy])*s
fall=np.clip(dist/70.0,0,1);fall=fall*fall*(3-2*fall)
a=(a*fall).astype(np.uint8)
img[...,0]=val;img[...,1]=val;img[...,2]=val;img[...,3]=a
im=Image.fromarray(img,'RGBA').resize((nx//2,ny//2),Image.LANCZOS)
buf=io.BytesIO();im.save(buf,'PNG',optimize=True);png=base64.b64encode(buf.getvalue()).decode()
# contours every 5 m
lev=np.arange(105,180,5)
cpaths=[];ipaths=[]
for L in lev:
    for c in measure.find_contours(Zu,L):
        if len(c)<8: continue
        pts=np.array([[W(p[1],p[0])] for p in c],np.float32)
        ap=cv2.approxPolyDP(pts,1.6,False).reshape(-1,2)
        if len(ap)<3: continue
        d='M'+' '.join(f'{x:.0f},{y:.0f}' for x,y in ap)
        (ipaths if L%25==0 else cpaths).append(d)
# hachures on steep ground
gy2,gx2=np.gradient(Zu,s);sl=np.hypot(gx2,gy2)
rng=np.random.default_rng(7);hach=[]
step=9.0
for yy in np.arange(Y0+5,Y0+(ny-2)*s,step):
    for xx in np.arange(X0+5,X0+(nx-2)*s,step):
        jx=xx+rng.uniform(-2,2); jy=yy+rng.uniform(-2,2)
        ix=int((jx-X0)/s); iy=int((jy-Y0)/s)
        g=sl[iy,ix]
        if g<0.19: continue
        dx,dy=-gx2[iy,ix]/g,-gy2[iy,ix]/g   # downhill
        Ln=2.5+7*min(1,(g-0.19)/0.18)
        hach.append(f'M{jx:.0f} {jy:.0f}l{dx*Ln:.1f} {dy*Ln:.1f}')
print('png',len(png),'contours',len(cpaths),len(ipaths),sum(map(len,cpaths+ipaths)),'hach',len(hach),sum(map(len,hach)))
json.dump({'png':png,'c':' '.join(cpaths),'ci':' '.join(ipaths),'h':''.join(hach),'box':[X0,Y0,(nx-1)*s,(ny-1)*s]},open('terrain.json','w'))
