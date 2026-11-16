# Газони й зелень на території лікарні: маска з супутникового знімка Esri World Imagery (z18, 16.11.2026),
# клітинка 1 м; чорне — рослинність. Пише lawns.txt — SVG-контур у координатах карти (м на схід/південь від 50.4820 N, 30.4695 E).
import cv2,numpy as np,os
D=os.path.dirname(os.path.abspath(__file__))
X0,Y0,W,H=-360,-345,740,655
g=cv2.imread(os.path.join(D,'mask1m.jpg'),cv2.IMREAD_GRAYSCALE)[:H,:W]
m=(g<128).astype(np.uint8)
m[375:405,612:636]=0   # курсор миші на знімку
k3=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(3,3));k5=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5))
m=cv2.morphologyEx(m,cv2.MORPH_OPEN,k3)
m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,k5)
def drop_small(a,minA):
    n,lab,st,_=cv2.connectedComponentsWithStats(a,connectivity=4)
    keep=np.zeros(n,np.uint8);keep[1:]=(st[1:,cv2.CC_STAT_AREA]>=minA)
    return keep[lab]
m=drop_small(m,40)                 # дрібні плями зелені
m=1-drop_small(1-m,25)             # дрібні дірки в газоні
m=cv2.GaussianBlur(m.astype(np.float32),(5,5),1.2)>.5
m=m.astype(np.uint8)
cs,hier=cv2.findContours(m,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_NONE)
out=[];npt=0
for c in cs:
    if abs(cv2.contourArea(c))<20:continue
    a=cv2.approxPolyDP(c,0.9,True)
    if len(a)<3:continue
    npt+=len(a)
    out.append('M'+'L'.join('%d,%d'%(p[0][0]+X0,p[0][1]+Y0) for p in a)+'Z')
open(os.path.join(D,'lawns.txt'),'w').write(''.join(out))
print(len(out),'контурів',npt,'точок',sum(map(len,out)),'символів; частка зелені',round(m.mean(),3))
