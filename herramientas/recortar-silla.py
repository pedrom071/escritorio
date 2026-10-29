import cv2, numpy as np
from PIL import Image
crop=[(22,120),(30,95),(60,72),(150,55),(250,60),(262,80),(272,140),(292,200),(310,236),(450,236),(462,250),(455,268),(330,276),(335,320),(355,332),(368,350),(355,372),(345,380),(380,400),(392,430),(392,494),(80,494),(70,380),(62,360),(65,335),(48,330),(30,300),(20,250)]
poly=np.array([(x,y+450) for x,y in crop],np.int32)
W,H=1680,944
mask=np.zeros((H,W),np.uint8); cv2.fillPoly(mask,[poly],255)
for name in ['noche','dia']:
    img=cv2.imread(name+'.png')
    # chair cutout with feathered alpha
    a=cv2.GaussianBlur(cv2.erode(mask,np.ones((3,3),np.uint8)),(7,7),0)
    rgba=np.dstack([img,a])
    x0,y0,x1,y1=0,500,480,944
    cv2.imwrite(f'build/silla-{name}.png',rgba[y0:y1,x0:x1])
    # background with chair inpainted
    m=cv2.dilate(mask,np.ones((15,15),np.uint8))
    small=cv2.resize(img,(W//2,H//2)); ms=cv2.resize(m,(W//2,H//2))
    bg=cv2.inpaint(small,ms,9,cv2.INPAINT_TELEA)
    bg=cv2.resize(bg,(W,H),interpolation=cv2.INTER_CUBIC)
    bg=cv2.GaussianBlur(bg,(0,0),3)
    out=img.copy(); mm=cv2.GaussianBlur(m,(21,21),0)[...,None]/255.0
    out=(img*(1-mm)+bg*mm).astype(np.uint8)
    cv2.imwrite(f'build/fondo-{name}.jpg',out,[cv2.IMWRITE_JPEG_QUALITY,86,cv2.IMWRITE_JPEG_PROGRESSIVE,1])
    prev=out.copy(); cv2.polylines(prev,[poly],True,(0,255,255),2)
    cv2.imwrite(f'build/check-{name}.jpg',cv2.resize(prev[400:944,0:700],(700,544)))
print('ok')
