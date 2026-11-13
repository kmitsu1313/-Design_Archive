// Hardcover edition: inset paper block, separate boards, articulated hinges and curved spine. Unlike WebGL texture uploads,
// drawing a local image is supported on ordinary file:// pages without extra flags.
mesh8=function(canvas,d){
 const ctx=canvas.getContext('2d');
 if(!ctx){canvas.replaceWith(Object.assign(document.createElement('img'),{src:asset7(d),alt:d.title}));return;}
 const rect=canvas.getBoundingClientRect(),pixelRatio=Math.min((devicePixelRatio||1)*2,4);
 if(!rect.width||!rect.height)return;
 const renderWidth=Math.round(rect.width*pixelRatio),renderHeight=Math.round(rect.height*pixelRatio);
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 const split=[109/1140,100/1125,123/1184,86/1122,80/1110,92/1062,106/989,108/1163,106/1213,107/1215,115/1086,96/1024][d.cover];
 const size=bookModelSize12(d), thickness=Math.max(.075,Math.min(.17,size.depth/size.height*1.8));
 const ratio=dimensions7[d.cover][0]*(1-split)/dimensions7[d.cover][1],x=ratio/2,y=.5,z=thickness/2,angle=Number(canvas.dataset.angle||.30),tilt=Number(canvas.dataset.tilt||.025)+.12,aspect=rect.width/rect.height;
 const faces=[];
 function box(a,b,lo,hi,board,side){
  const p=[
   [[-a,-b,hi],[a,-b,hi],[a,b,hi],[-a,b,hi]],
   [[a,-b,lo],[-a,-b,lo],[-a,b,lo],[a,b,lo]],
   [[-a,-b,lo],[-a,-b,hi],[-a,b,hi],[-a,b,lo]],
   [[a,-b,hi],[a,-b,lo],[a,b,lo],[a,b,hi]],
   [[-a,b,hi],[a,b,hi],[a,b,lo],[-a,b,lo]],
   [[-a,-b,lo],[a,-b,lo],[a,-b,hi],[-a,-b,hi]]
  ];
  p.forEach((points,i)=>{faces.push({p:points,u:.1,width:.9,page:!board,solid:board&&(i>1||i!==side),light:[1,.7,.76,.88,1,.7][i]});});
 }
 // Paper is recessed behind the two real cover boards.
 box(x-.014,y-.014,-z+.009,z-.009,false);
 faces.forEach(f=>{f.page=true;f.u=0;f.width=1;});
 // Hidden paper faces sit under opaque boards and binding; omit them to prevent painter-order bleed.
 faces.splice(0,3);
 faces.forEach(f=>f.layer=1);
 const paperFaceCount=faces.length;
 box(x,y,z-.006,z+.003,true,0);
 faces.slice(paperFaceCount).forEach(f=>f.layer=2);
 const backStart=faces.length;
 box(x,y,-z-.003,-z+.006,true,1);
 faces.slice(backStart).forEach(f=>f.layer=0);
 // Back artwork is not supplied: use a restrained cover-color material.
 faces.slice(paperFaceCount).forEach(f=>{if(f.u===.1){f.u=split;f.width=1-split;}if(f.p.every(p=>p[2]<0))f.solid=true;});
 // Twelve panels follow the rounded binding. The spine atlas never reaches the front.
 for(let i=0;i<12;i++){
  const a=i*Math.PI/12,b=(i+1)*Math.PI/12;
  const ax=-x-.013*Math.sin(a),az=-z*Math.cos(a),bx=-x-.013*Math.sin(b),bz=-z*Math.cos(b);
  faces.push({p:[[ax,-y,az],[bx,-y,bz],[bx,y,bz],[ax,y,az]],layer:3,u:split*i/12,width:split/12,light:.72+.16*Math.sin((a+b)/2)});
  // Opaque endcaps close the curved binding at the head and tail.
  for(const top of [true,false]){
   const yy=top?y:-y;
   let p=[[ax,yy,az],[-x+.014,yy,az],[-x+.014,yy,bz],[bx,yy,bz]];
   if(top)p=p.reverse();
   faces.push({p,layer:3,solid:true,u:0,width:1,light:top?.94:.7});
  }
 }
 // Narrow bevel bands highlight the board overhang without changing the artwork.
 for(const front of [true,false]){
  const outer=front?z+.003:-z-.003,edge=front?z-.001:-z+.001,bevel=.003;
  const q=[[-x,-y],[x,-y],[x,y],[-x,y]];
  for(let i=0;i<4;i++){
   const a=q[i],b=q[(i+1)%4],inner=p=>[p[0]-Math.sign(p[0])*bevel,p[1]-Math.sign(p[1])*bevel,outer];
   let p=[[...a,edge],[...b,edge],inner(b),inner(a)];
   if(!front)p=p.reverse();
   faces.push({p,layer:front?2:0,solid:true,u:0,width:1,light:i===2?1:.9});
  }
 }
 function project(p){const [a,b,c]=p,rx=a*Math.cos(angle)+c*Math.sin(angle),rz=-a*Math.sin(angle)+c*Math.cos(angle),ry=b*Math.cos(tilt)-rz*Math.sin(tilt),depth=3-(b*Math.sin(tilt)+rz*Math.cos(tilt));return [(rx*5.65/aspect/3+1)*canvas.width/2,(1-ry*5.65/3)*canvas.height/2,depth];}
 function at(points,u,v){return project(points[0].map((_,i)=>(1-u)*(1-v)*points[0][i]+u*(1-v)*points[1][i]+u*v*points[2][i]+(1-u)*v*points[3][i]));}
 function path(points){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();}
 function triangle(source,s,t){
  const [a,b,c]=s,[A,B,C]=t,den=a[0]*(b[1]-c[1])+b[0]*(c[1]-a[1])+c[0]*(a[1]-b[1]);
  if(Math.abs(den)<1e-9)return;
  const coefficient=k=>[(A[k]*(b[1]-c[1])+B[k]*(c[1]-a[1])+C[k]*(a[1]-b[1]))/den,(A[k]*(c[0]-b[0])+B[k]*(a[0]-c[0])+C[k]*(b[0]-a[0]))/den,(A[k]*(b[0]*c[1]-c[0]*b[1])+B[k]*(c[0]*a[1]-a[0]*c[1])+C[k]*(a[0]*b[1]-b[0]*a[1]))/den];
  const m=coefficient(0),n=coefficient(1),mid=[(A[0]+B[0]+C[0])/3,(A[1]+B[1]+C[1])/3];
  // Subpixel overlap prevents antialiasing cracks inside a face; outer face stays clipped.
  const orientation=((B[0]-A[0])*(C[1]-A[1])-(B[1]-A[1])*(C[0]-A[0]))>0?1:-1;
  const expanded=t.map((p,i)=>{
   const previous=t[(i+2)%3],next=t[(i+1)%3],u=[p[0]-previous[0],p[1]-previous[1]],v=[next[0]-p[0],next[1]-p[1]],ul=Math.hypot(...u),vl=Math.hypot(...v);
   const n1=[orientation*u[1]/ul,-orientation*u[0]/ul],n2=[orientation*v[1]/vl,-orientation*v[0]/vl],a=[p[0]+n1[0],p[1]+n1[1]],b=[p[0]+n2[0],p[1]+n2[1]],cross=u[0]*v[1]-u[1]*v[0];
   if(Math.abs(cross)<1e-9)return p;
   const k=((b[0]-a[0])*v[1]-(b[1]-a[1])*v[0])/cross;
   return [a[0]+u[0]*k,a[1]+u[1]*k];
  });
  ctx.save();path(expanded);ctx.clip();ctx.setTransform(m[0],n[0],m[1],n[1],m[2],n[2]);ctx.drawImage(source,0,0);ctx.restore();
 }
 texture8(asset7(d)).then(im=>{
  if(!canvas.isConnected)return;
  canvas.width=renderWidth;canvas.height=renderHeight;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  const paper=document.createElement('canvas');paper.width=256;paper.height=512;const pc=paper.getContext('2d');pc.fillStyle='#f1eddf';pc.fillRect(0,0,256,512);for(let i=0;i<256;i+=2){pc.fillStyle=i%6?'#e7e2d6':'#d9d2c3';pc.fillRect(i,0,.5,512);}const pg=pc.createLinearGradient(0,0,256,0);pg.addColorStop(0,'#00000018');pg.addColorStop(.2,'#ffffff10');pg.addColorStop(1,'#00000010');pc.fillStyle=pg;pc.fillRect(0,0,256,512);
  const binding=document.createElement('canvas');binding.width=64;binding.height=512;const bc=binding.getContext('2d');bc.fillStyle=d.accent||d.bg||'#66574d';bc.fillRect(0,0,64,512);
  faces.sort((a,b)=>(a.layer??1)-(b.layer??1)||b.p.reduce((sum,p)=>sum+project(p)[2],0)-a.p.reduce((sum,p)=>sum+project(p)[2],0));
  function facing(f){
   const rotate=p=>{const rx=p[0]*Math.cos(angle)+p[2]*Math.sin(angle),rz=-p[0]*Math.sin(angle)+p[2]*Math.cos(angle);return [rx,p[1]*Math.cos(tilt)-rz*Math.sin(tilt),p[1]*Math.sin(tilt)+rz*Math.cos(tilt)];};
   const p=f.p.map(rotate),u=p[1].map((v,i)=>v-p[0][i]),v=p[2].map((v,i)=>v-p[0][i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],center=p[0].map((_,i)=>p.reduce((s,a)=>s+a[i],0)/4);
   return n[2]>1e-8; // Orthographic projection: visibility uses a parallel viewing direction.
  }
  for(const f of faces){
   if(!facing(f))continue;
   const source=f.solid?binding:f.page?paper:im,sw=source.width,sh=source.height,start=(f.u||0)*sw,width=(f.width||1)*sw,segments=1;
   ctx.save();path(f.p.map(project));ctx.clip();
   for(let i=0;i<segments;i++){
    const u=i/segments,v=(i+1)/segments,p0=at(f.p,u,0),p1=at(f.p,v,0),p2=at(f.p,v,1),p3=at(f.p,u,1),s0=[start+width*u,sh],s1=[start+width*v,sh],s2=[start+width*v,0],s3=[start+width*u,0];
    triangle(source,[s0,s1,s2],[p0,p1,p2]);triangle(source,[s0,s2,s3],[p0,p2,p3]);
   }
   if(f.light<1){ctx.fillStyle=`rgba(0,0,0,${1-f.light})`;path(f.p.map(project));ctx.fill();}
   ctx.restore();
  }
  canvas.dataset.rendered='true';canvas.dataset.modelEdition='hardcover';canvas.dataset.faceCount=String(faces.length);
 }).catch(()=>{canvas.parentElement.innerHTML=flat8(d);});
};

render7();


