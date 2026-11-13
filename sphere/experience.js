(()=>{'use strict';
const $=s=>document.querySelector(s),space=$('#space'),field=$('#field'),back=$('#back'),hint=$('#hint'),dialog=$('#detail');
const labels={documents:'文献',images:'图片与物品',books:'图书'},data={documents:ResourceImageData.documents,images:[...new Map(ResourceImageData.images.map(x=>[x.image,x])).values()],books:BookCoverData};
// Decode and prepare each source once, before starting the intro timeline.
// Shared, bounded display textures avoid repeatedly rasterizing full-resolution covers.
const textures=new Map(),textureTasks=[];
function displayTexture(src){if(textures.has(src))return textures.get(src);const task=(async()=>{const source=new Image();source.src=src;await source.decode();if(!source.naturalWidth||typeof URL.createObjectURL!=='function')return src;const ratio=Math.min(1,960/Math.max(source.naturalWidth,source.naturalHeight));if(ratio===1)return src;const canvas=document.createElement('canvas');canvas.width=Math.round(source.naturalWidth*ratio);canvas.height=Math.round(source.naturalHeight*ratio);const context=canvas.getContext('2d');context.drawImage(source,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));return blob?URL.createObjectURL(blob):src;})().catch(()=>src);textures.set(src,task);return task;}
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let mode='intro',selected=null,yaw=-.8,pitch=-.1,last=0,start=0,transition=0,from=0,to=0,mix=0,drag=null,moved=false,ready=false,entryFocus={x:0,y:0},portalLeaving=false;
const items=[];for(let i=0;i<18;i++)for(const type of ['documents','books','images']){if(type==='documents'&&i>=6)continue;const asset=data[type][i%data[type].length];items.push({...asset,type,ordinal:i,duplicate:i>=data[type].length});}const sphereCount=items.length;for(const type of ['documents','books','images'])for(let i=0;i<(type==='documents'?18:36);i++)items.push({...data[type][i%data[type].length],type,ordinal:i,categoryExtra:true,title:data[type][i%data[type].length].title});let introIndex=0;items.forEach(x=>{x.introRank=!x.categoryExtra&&x.type!=='documents'&&introIndex<12?introIndex++:-1;});
for(const type of Object.keys(data)){const group=items.filter(x=>x.type===type&&!x.placeholder);const originals=group.filter(x=>!x.categoryExtra),used=new Set();originals.forEach((item,j)=>{item.layoutIndex=Math.floor((j+.5)*group.length/originals.length);used.add(item.layoutIndex);});const remaining=Array.from({length:group.length},(_,j)=>j).filter(j=>!used.has(j));group.filter(x=>x.categoryExtra).forEach((item,j)=>item.layoutIndex=remaining[j]);group.forEach(item=>item.layoutCount=group.length);}
const n=sphereCount;let pointerX=0,pointerY=0,parallaxX=0,parallaxY=0,scroll=0,scrollTarget=0,clock=0;
items.forEach((item,i)=>{const k=item.categoryExtra?item.layoutIndex:(i*17)%n,total=item.categoryExtra?item.layoutCount:n;const jitter=Math.sin(i*73.13+4.7);const y=Math.max(-.98,Math.min(.98,1-2*(k+.5)/total+jitter*.023)),r=Math.sqrt(1-y*y),a=k*Math.PI*(3-Math.sqrt(5))+Math.sin(i*17.7)*.14;const radius=1+Math.sin(i*31.1)*.035;item.point=[Math.cos(a)*r*radius,y*radius,Math.sin(a)*r*radius];const b=document.createElement('button');b.style.visibility='hidden';b.style.width='200px';b.style.height=(200*(item.type==='images'?.9:1.3))+'px';b.style.transformOrigin='0 0';b.style.transform='translate3d(-9999px,-9999px,0) scale(.001)';item.sized=true;b.style.willChange=item.categoryExtra?'auto':'transform, opacity';b.className='tile '+(item.type==='books'?'book':item.type==='documents'?'paper':'');if(item.type==='documents'){if(i%3!==0)b.classList.add('paper-stack');if(i%4===0){const clip=document.createElement('span');clip.className='paperclip';clip.setAttribute('aria-hidden','true');b.append(clip);}}b.setAttribute('aria-label',labels[item.type]+'：'+item.title);if(item.placeholder){b.className+=' placeholder';b.disabled=true;b.setAttribute('aria-hidden','true');}const img=new Image();if(item.image)textureTasks.push(displayTexture(item.image).then(src=>{img.src=src;return img.decode().catch(()=>{});}));img.alt=item.title;img.draggable=false;img.decoding='async';b.append(img);if(item.type==='books'){const pts=[...(item.imageClip||'').matchAll(/([\d.]+)%\s+([\d.]+)%/g)].map(p=>[+p[1],+p[2]]);const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);const lo=pts.length?Math.min(...ys):0,hi=pts.length?Math.max(...ys):100,cx=pts.length?(Math.min(...xs)+Math.max(...xs))/2:50;img.style.height=10000/(hi-lo)+'%';img.style.transform=`translate(-${cx}%,-${(lo+hi)/2}%)`;img.style.clipPath=item.imageClip||'none';}b.addEventListener('click',()=>{if(moved||mode==='intro'||item.placeholder)return;if(mode==='sphere')openCategory(item.type,item);else if(mode==='category'&&mix>.98)showDetail(item,b);});item.hovered=false;item.hoverScale=1;b.addEventListener('pointerenter',()=>{item.hovered=true;});b.addEventListener('pointerleave',()=>{item.hovered=false;$('#hoverLabel').textContent='';});b.addEventListener('focus',()=>{item.focused=true;});b.addEventListener('blur',()=>{item.focused=false;});field.append(b);item.el=b;});
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}function clamp(t){return Math.max(0,Math.min(1,t));}function lerp(a,b,t){return a+(b-a)*t;}
function openCategory(type,clicked){if(clicked){const group=items.filter(x=>x.type===type),cols=space.clientWidth<650?3:5;const middle=Math.floor(Math.ceil(group.length/cols)/2)*cols+Math.floor(cols/2);const occupant=group.find(x=>x.layoutIndex===Math.min(group.length-1,middle));if(occupant){const slot=clicked.layoutIndex;clicked.layoutIndex=occupant.layoutIndex;occupant.layoutIndex=slot;}}entryFocus=clicked?.render?{x:clicked.render.x,y:clicked.render.y}:{x:space.clientWidth/2,y:space.clientHeight/2};items.forEach(item=>{item.flightOrigin=item.render?{...item.render}:null;});selected=type;mode='category';from=mix;to=1;transition=performance.now();scroll=scrollTarget=0;space.scrollTop=0;back.hidden=false;$('#category').hidden=false;$('#categoryName').textContent=labels[type];$('#count').textContent=String(data[type].length).padStart(2,'0')+' 件资料';hint.textContent='点击资料查看详情';$('#hoverLabel').textContent='';}
function returnSphere(){if(mode==='intro')return;if(dialog.open)dialog.close();mode='sphere';from=mix;to=0;transition=performance.now();space.classList.remove('browsing');space.scrollTop=0;back.hidden=true;$('#category').hidden=true;hint.textContent='拖动旋转 · 点击资料进入分类';$('#hoverLabel').textContent='';}
back.addEventListener('click',returnSphere);
window.addEventListener('drc:select-category',e=>{if(!ready)return;if(mode==='intro')mode='sphere';if(e.detail==='video'){showDetail({type:'images',title:'影像资料',category:'暂无影像资料',image:'',overview:{paragraphs:['影像资料尚未收录。']}},document.querySelector('#space'));return;}openCategory(e.detail);});
window.addEventListener('drc:portal-leave',()=>{portalLeaving=true;});
window.addEventListener('drc:portal-reset',()=>{portalLeaving=false;returnSphere();transition=0;mix=0;});

function showDetail(item,button){const media=$('#detailMedia');media.replaceChildren();const img=new Image();img.src=item.originalImage||item.image;img.alt=item.title;if(item.type==='books'&&item.imageClip)img.style.clipPath=item.imageClip;media.append(img);$('#detailTitle').textContent=item.title;$('#detailType').textContent=labels[item.type]+' / '+item.category;const copy=$('#detailCopy');copy.replaceChildren();if(item.overview){if(item.overview.authors){const p=document.createElement('p');p.textContent=item.overview.authors+(item.overview.publisher?' · '+item.overview.publisher:'');copy.append(p);}for(const text of item.overview.paragraphs||[]){const p=document.createElement('p');p.textContent=text;copy.append(p);}}else{const p=document.createElement('p');p.textContent=item.category;copy.append(p);}$('#original').href=item.originalImage||item.image;if(!dialog.open)dialog.show();dialog._origin=button;}
$('#close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>dialog._origin?.focus({preventScroll:true}));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dialog.open){dialog.close();return;}if(e.key==='Escape'&&!dialog.open&&mode==='category')returnSphere();if(mode!=='intro'&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();yaw+=(e.key==='ArrowLeft'?-.12:e.key==='ArrowRight'?.12:0);pitch+=(e.key==='ArrowUp'?-.1:e.key==='ArrowDown'?.1:0);}});
window.addEventListener('pointermove',e=>{pointerX=(e.clientX/space.clientWidth-.5)*2;pointerY=(e.clientY/space.clientHeight-.5)*2;});document.documentElement.addEventListener('pointerleave',()=>{pointerX=pointerY=0;});space.addEventListener('wheel',e=>{if(mode==='category'){e.preventDefault();scrollTarget+=e.deltaY*.00075;}},{passive:false});let touchY=0;space.addEventListener('touchstart',e=>{touchY=e.touches[0].clientY;},{passive:true});space.addEventListener('touchmove',e=>{if(mode==='category'){const y=e.touches[0].clientY;scrollTarget+=(touchY-y)*.002;touchY=y;}},{passive:true});space.addEventListener('pointerdown',e=>{moved=false;if(mode==='intro'||dialog.open)return;drag={x:e.clientX,y:e.clientY,id:e.pointerId};space.classList.add('dragging');});window.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>3)moved=true;if(mode==='category')scrollTarget-=dy*.003;yaw+=dx*.005;pitch=Math.max(-1,Math.min(1,pitch+dy*.004));drag.x=e.clientX;drag.y=e.clientY;});function end(){drag=null;space.classList.remove('dragging');}window.addEventListener('pointerup',end);window.addEventListener('pointercancel',end);window.addEventListener('blur',end);
function frame(now){requestAnimationFrame(frame);if(!ready||document.hidden||portalLeaving)return;if(!start)start=now;const dt=Math.min(40,now-(last||now));last=now;if(!reduced&&!dialog.open&&!drag)clock+=dt;const w=space.clientWidth,h=space.clientHeight,M=Math.min(w,h),R=M*.72,f=M*1.065,seconds=(now-start)/1000;
const smooth=1-Math.exp(-dt/180);parallaxX+=(pointerX-parallaxX)*smooth;parallaxY+=(pointerY-parallaxY)*smooth;scroll+=(scrollTarget-scroll)*smooth;
if(mode==='intro'&&(seconds>=6.05||reduced))mode='sphere';if(!drag&&!reduced&&!dialog.open&&!transition&&mode==='sphere')yaw+=dt*.000025;
if(transition){const t=clamp((now-transition)/(reduced?1:2900));mix=lerp(from,to,ease(t));if(t===1)transition=0;}
const portal=document.querySelector('#archiveNext');if(portal)portal.hidden=mode!=='category'||selected!=='books'||mix<.995;
const intro=mode==='intro',burst=intro?ease(clamp((seconds-1.5)/.95)):1;
// Camera retreat and centre-axis rotation happen together during sphere formation.
const travel=intro?ease(clamp((seconds-2.75)/3.3)):1;
const cameraZ=intro?R*lerp(1.85,3.15,travel):3.15*R*(1-mix);
// 240 degrees around an axis tilted 40 degrees through the sphere centre.
const turn=(reduced?1:ease(clamp((seconds-2.35)/3.7)))*Math.PI*4/3;
const ax=Math.sin(40*Math.PI/180),ay=Math.cos(40*Math.PI/180),ct=Math.cos(turn),st=Math.sin(turn);
const viewPitch=pitch+scroll*(intro?0:mix);const cy=Math.cos(yaw),sn=Math.sin(yaw),cp=Math.cos(viewPitch),sp=Math.sin(viewPitch);
items.forEach((item,i)=>{if(item.categoryExtra&&(intro||mix===0||item.type!==selected)){if(!item.culled){item.el.style.visibility='hidden';item.el.style.pointerEvents='none';item.el.tabIndex=-1;item.culled=true;}return;}item.culled=false;const q=item.point,dot=ax*q[0]+ay*q[1];const p=[q[0]*ct+ay*q[2]*st+ax*dot*(1-ct),q[1]*ct-ax*q[2]*st+ay*dot*(1-ct),q[2]*ct+(ax*q[1]-ay*q[0])*st];let x=(p[0]*cy+p[2]*sn)*R,z=(-p[0]*sn+p[2]*cy)*R,y=p[1]*R;const yy=y*cp-z*sp;z=y*sp+z*cp;y=yy;
// V2 camera approach to stable, staggered positions on a broad curved surface.
const slot=item.layoutIndex||0,columns=w<650?3:5,rows=Math.ceil((item.layoutCount||1)/columns);
const spanX=w*2.12,spanY=Math.max(h*1.24,rows*h*.39),phase=clock/1000*.009+scroll*.28;
const column=slot%columns,row=Math.floor(slot/columns),offset=(row%2)*.46+.14*Math.sin(row*2.1);
const u=((column+offset)/columns+phase%1+1)%1-.5;
const gx=u*spanX,gy=((((row+.5)/rows+scroll*.22+clock/1000*.0025)%1+1)%1-.5)*spanY+Math.sin(column*2.4)*h*.16;
const depth=R*(1.6+.20*Math.pow(u*2,2)+.06*Math.sin(slot*2.3));
if(!intro&&mix>0){x=lerp(x,gx*depth/f,mix);y=lerp(y,gy*depth/f,mix);z=lerp(z,-depth,mix);}
const distance=cameraZ-z,near=R*.055,projection=f/Math.max(near,distance);
let sx=w/2+x*projection,sy=h/2+y*projection;
// Constant world sizes after the opening burst; perspective alone changes their apparent size.
const worldSize=M*.23*.7*(.91+.16*(.5+.5*Math.sin(i*19.1)));let size=lerp(worldSize,Math.min(w*(w<650?.31:.19),h*(item.type==='images'?.37:item.type==='documents'?.25:.29))*(.88+.20*(.5+.5*Math.sin(slot*8.3)))*depth/f,intro?0:mix)*projection,opacity=clamp((distance-near)/(R*.12));
const active=item.type===selected;
if(intro){const rank=item.introRank,reveal=rank<0?ease(clamp((seconds-1.6)/.6)):ease(clamp((seconds-rank*.125)/.15));const stackSize=M*.19,stackX=w/2+Math.sin(Math.max(0,rank)*2.3)*7,stackY=h/2+Math.cos(Math.max(0,rank)*2.3)*5;
// The burst establishes the shell once; it never becomes a flat gallery.
sx=lerp(stackX,sx,burst);sy=lerp(stackY,sy,burst);size=lerp(stackSize*(.7+.3*reveal),size,burst);opacity=reveal*lerp(rank>=0?1:0,opacity,burst);if(item.placeholder||item.categoryExtra)opacity=0;
}else{if(item.categoryExtra&&mix===0)opacity=0;if(item.placeholder)opacity=0;}
const strength=.65+Math.min(2,projection)*.35;sx-=parallaxX*12*strength;sy-=parallaxY*9*strength;
// A single rotating zoom carries the sphere into the collection.
// Existing selected items remain in the flow; only other types move out of view.
if(!intro&&mix>0){
 const origin=item.flightOrigin||{x:w/2,y:h/2,size:M*.1,opacity:1};
 const targetX=w/2+gx-parallaxX*12,targetY=h/2+gy-parallaxY*9;
 const targetSize=Math.min(w*(w<650?.31:.19),h*(item.type==='images'?.37:item.type==='documents'?.25:.29))*(.88+.20*(.5+.5*Math.sin(slot*8.3)));
 const angle=mix*.72,c=Math.cos(angle),s=Math.sin(angle);
 const dx=origin.x-entryFocus.x,dy=origin.y-entryFocus.y;
 const pivotX=lerp(entryFocus.x,w/2,mix),pivotY=lerp(entryFocus.y,h/2,mix);
 if(!active){
  const zoom=Math.exp(mix*Math.log(Math.max(7,Math.max(w,h)*1.5/Math.max(1,Math.hypot(dx,dy)))));
  sx=pivotX+(dx*c-dy*s)*zoom;sy=pivotY+(dx*s+dy*c)*zoom;
  size=origin.size*zoom;opacity=item.categoryExtra?0:origin.opacity;
 }else if(!item.categoryExtra){
  const zoom=1+mix*1.7,settle=ease(mix);
  const orbitX=pivotX+(dx*c-dy*s)*zoom,orbitY=pivotY+(dx*s+dy*c)*zoom;
  sx=lerp(orbitX,targetX,settle);sy=lerp(orbitY,targetY,settle);
  size=origin.size*Math.pow(targetSize/Math.max(1,origin.size),mix);opacity=1;
 }else{
  // Additional collection items already occupy the surrounding space.
  // They rotate into the viewport from outside, without an opacity reveal.
  const tx=targetX-w/2,ty=targetY-h/2,radius=Math.hypot(tx,ty);
  const heading=Math.atan2(ty,tx)-(1-mix)*.92;
  const orbitRadius=lerp(Math.max(radius,Math.hypot(w,h)*.85+targetSize*2),radius,mix);
  sx=w/2+Math.cos(heading)*orbitRadius;sy=h/2+Math.sin(heading)*orbitRadius;
  size=targetSize*lerp(.72,1,mix);opacity=1;
 }
}
item.render={x:sx,y:sy,size,opacity};
// Spatial edge attenuation also softens resources as they fly beyond the screen.
if(!intro){const edge=clamp(Math.min(sx/(w*.14),(w-sx)/(w*.14),sy/(h*.16),(h-sy)/(h*.16)));opacity*=.90+.10*ease(edge);}
const hoverTarget=mode==='category'&&mix>.995&&!drag&&(item.hovered||item.focused)?1.10:1;item.hoverScale+=(hoverTarget-item.hoverScale)*(reduced?1:1-Math.exp(-dt/90));size*=item.hoverScale;
const b=item.el,bh=size*(item.type==='images'?.9:1.3);if(!item.sized){b.style.width='200px';b.style.height=(200*(item.type==='images'?.9:1.3))+'px';b.style.transformOrigin='0 0';item.sized=true;}b.style.transform='translate3d('+(sx-size/2)+'px,'+(sy-bh/2)+'px,0) scale('+(size/200)+')';b.style.opacity=opacity;const order=intro?100+i:Math.round((10000-distance)/24);if(item.order!==order){b.style.zIndex=String(order);item.order=order;}const visible=opacity>.01&&sx+size/2>0&&sx-size/2<w&&sy+bh/2>0&&sy-bh/2<h;b.style.visibility=visible?'visible':'hidden';b.style.filter='none';b.tabIndex=intro||item.placeholder||!visible||(mix>.3&&!active)?-1:0;b.style.pointerEvents=intro||item.placeholder||!visible||(mix>.3&&!active)?'none':'';
});}
Promise.all(textureTasks).then(()=>{ready=true;});requestAnimationFrame(frame);
})();




