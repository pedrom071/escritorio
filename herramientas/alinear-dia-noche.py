# Alinea la foto de día con la de noche (misma vista), para que el cambio de luz no "salte".
import cv2, numpy as np, sys
night=cv2.imread(sys.argv[1]); day=cv2.imread(sys.argv[2]); out=sys.argv[3]
g1=cv2.cvtColor(night,cv2.COLOR_BGR2GRAY); g2=cv2.cvtColor(day,cv2.COLOR_BGR2GRAY)
c1=cv2.createCLAHE(3.0,(8,8)); g1=c1.apply(g1); g2=c1.apply(g2)
sift=cv2.SIFT_create(6000)
k1,d1=sift.detectAndCompute(g1,None); k2,d2=sift.detectAndCompute(g2,None)
m=cv2.BFMatcher().knnMatch(d2,d1,k=2)
good=[a for a,b in m if a.distance<0.72*b.distance]
src=np.float32([k2[a.queryIdx].pt for a in good]); dst=np.float32([k1[a.trainIdx].pt for a in good])
H,inl=cv2.findHomography(src,dst,cv2.RANSAC,4.0)
print('matches',len(good),'inliers',int(inl.sum()) if inl is not None else 0)
print(np.round(H,4))
warped=cv2.warpPerspective(day,H,(night.shape[1],night.shape[0]),flags=cv2.INTER_CUBIC,borderMode=cv2.BORDER_REPLICATE)
cv2.imwrite(out,warped)
blend=cv2.addWeighted(night,.5,warped,.5,0); cv2.imwrite(out.replace('.','-blend.',1) if False else out+'-blend.jpg',blend)
