// Hardcover edition: inset paper block, separate boards, articulated hinges and curved spine. Unlike WebGL texture uploads,
// drawing a local image is supported on ordinary file:// pages without extra flags.
window.drawHongqiReader=function(canvas,d,state={}){
 const opening=state.open||0;
 if(opening===0){const prior=canvas.dataset.continuousFlight;canvas.dataset.continuousFlight='1';try{return mesh8(canvas,d);}finally{if(prior===undefined)delete canvas.dataset.continuousFlight;else canvas.dataset.continuousFlight=prior;}}
 const revision=(canvas._paintRevision||0)+1;canvas._paintRevision=revision;
 const ctx=canvas.getContext('2d');
 if(!ctx){canvas.replaceWith(Object.assign(document.createElement('img'),{src:asset7(d),alt:d.title}));return;}
 const rect=canvas.closest('.entering-book9')?{width:canvas.clientWidth,height:canvas.clientHeight}:canvas.getBoundingClientRect(),pixelRatio=Math.min(devicePixelRatio||1,1.5);
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

 // The closed model's front board is retained; its old spine and paper mesh are
 // replaced by one joined spread. All visible sheets meet at the same binding edge.
 const hinge=[-x,z+.003],py=y-.012,pageWidth=2*x-.012;
 const hingeRotate=(p,amount)=>{const theta=-Math.PI*amount,dx=p[0]-hinge[0],dz=p[2]-hinge[1];return[hinge[0]+dx*Math.cos(theta)+dz*Math.sin(theta),p[1],hinge[1]-dx*Math.sin(theta)+dz*Math.cos(theta)];};
 let position=state.spread||0;
 if(state.turn&&Number.isFinite(state.turn.target)){const p=state.turn.direction===-1?1-state.turn.progress:state.turn.progress;position+=(state.turn.target-position)*p;}
 const fraction=Math.max(0,Math.min(1,position/Math.max(1,(state.spreads||18)-1)));
 const leftDepth=(.004+thickness*.60*fraction)*opening,rightDepth=thickness*(.66-.60*fraction);
 const boards=faces.filter(f=>f.layer===2&&!f.p.every(p=>p[2]<z-.003));faces.length=0;
 for(const f of boards){f.p=f.p.map(p=>hingeRotate([p[0],p[1],p[2]+leftDepth],opening));faces.push(f);}
 const leftPlace=p=>hingeRotate(p,opening-1);
 const pagePoint=(side,u,v)=>[-x+side*pageWidth*u,(v-.5)*2*py,z+.003+(side<0?.009*u:0)];
 const pageQuad=side=>side<0?[pagePoint(-1,1,0),pagePoint(-1,0,0),pagePoint(-1,0,1),pagePoint(-1,1,1)]:[pagePoint(1,0,0),pagePoint(1,1,0),pagePoint(1,1,1),pagePoint(1,0,1)];
 for(const side of [-1,1]){
  const place=points=>side<0?points.map(leftPlace):points,top=pageQuad(side),depth=side<0?leftDepth:rightDepth;
  faces.push({p:place(top),image:side<0?state.left:state.right,light:1,readingPage:side});
  // Thickness extends outside and below the sheet, never across its printed area.
  const flare=.009+depth*.10,lower=top.map(p=>[p[0]+(Math.abs(p[0]+x)>.001?side*flare:0),p[1]+Math.sign(p[1])*flare,p[2]-depth]);
  for(const [i,j] of [[0,1],[1,2],[2,3],[3,0]]){if(top[i][0]===-x&&top[j][0]===-x)continue;faces.push({p:place([top[i],top[j],lower[j],lower[i]]),page:true,light:.94,twoSided:true,leafEdge:true});}
  if(side>0){const low=z+.003-depth-.008,outer=x+.008;faces.push({p:[[-x,-py-flare-.012,low],[outer,-py-flare-.012,low],[outer,py+flare+.012,low],[-x,py+flare+.012,low]],solid:true,light:.9,twoSided:true});}
 }
 // One shared hinge and identical endpoints for the standing and moving sheets.
 let turnRows=null;
 if(state.turn){const turn=state.turn,t=turn.progress,flex=Math.sin(Math.PI*t),segments=48,width=pageWidth/segments,rows=[];
  for(const v of [0,1]){let px=-x,pz=z+.003;const row=[];for(let i=0;i<=segments;i++){const u=i/segments,theta=-Math.PI*t+.35*flex*Math.sin(u*Math.PI);if(i){px+=Math.cos(theta)*width;pz-=Math.sin(theta)*width;}row.push([px,(v-.5)*2*py,pz+.009*t*u]);}rows.push(row);}
  turnRows=rows;const silhouette=[...rows[0],...rows[1].slice().reverse()];
  for(let i=0;i<segments;i++){const points=[rows[0][i],rows[0][i+1],rows[1][i+1],rows[1][i]];faces.push({p:points,image:turn.front,u:i/segments,width:1/segments,light:1,clip:silhouette,turnSide:'front'});faces.push({p:[points[1],points[0],points[3],points[2]],image:turn.back,u:1-(i+1)/segments,width:1/segments,light:1,clip:silhouette,turnSide:'back'});}
 }

 function project(p){const [a,b,c]=p,rx=a*Math.cos(angle)+c*Math.sin(angle)+opening*x,rz=-a*Math.sin(angle)+c*Math.cos(angle),ry=b*Math.cos(tilt)-rz*Math.sin(tilt),depth=3-(b*Math.sin(tilt)+rz*Math.cos(tilt));return [(rx*5.65/aspect/3+1)*canvas.width/2,(1-ry*5.65/3)*canvas.height/2,depth];}
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
 return texture8(asset7(d)).then(im=>{
  if(!canvas.isConnected||canvas._paintRevision!==revision)return;
  if(canvas.width!==renderWidth||canvas.height!==renderHeight){canvas.width=renderWidth;canvas.height=renderHeight;}else ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  const materials=canvas._hkMaterials||(canvas._hkMaterials={});
  let paper=materials.paper,binding=materials.binding;
  if(!paper){paper=document.createElement('canvas');paper.width=256;paper.height=512;const pc=paper.getContext('2d');pc.fillStyle='#f1eddf';pc.fillRect(0,0,256,512);for(let i=0;i<256;i+=2){pc.fillStyle=i%6?'#e7e2d6':'#d9d2c3';pc.fillRect(i,0,.5,512);}const pg=pc.createLinearGradient(0,0,256,0);pg.addColorStop(0,'#00000018');pg.addColorStop(.2,'#ffffff10');pg.addColorStop(1,'#00000010');pc.fillStyle=pg;pc.fillRect(0,0,256,512);
  binding=document.createElement('canvas');binding.width=64;binding.height=512;const bc=binding.getContext('2d');bc.fillStyle=d.accent||d.bg||'#66574d';bc.fillRect(0,0,64,512);materials.paper=paper;materials.binding=binding;}

  for(const side of [-1,1]){
   const key='gutter'+side;let shade=materials[key];if(!shade){shade=document.createElement('canvas');shade.width=128;shade.height=8;const sc=shade.getContext('2d'),gradient=sc.createLinearGradient(0,0,128,0);gradient.addColorStop(side<0?0:1,'rgba(35,20,12,0)');gradient.addColorStop(side<0?1:0,'rgba(35,20,12,.14)');sc.fillStyle=gradient;sc.fillRect(0,0,128,8);materials[key]=shade;}
   const width=.026,page=faces.find(f=>f.readingPage===side),q=side<0?[pagePoint(-1,width/pageWidth,0),pagePoint(-1,0,0),pagePoint(-1,0,1),pagePoint(-1,width/pageWidth,1)]:[pagePoint(1,0,0),pagePoint(1,width/pageWidth,0),pagePoint(1,width/pageWidth,1),pagePoint(1,0,1)];
   page.gutter={p:side<0?q.map(leftPlace):q,image:shade};
  }
  // Depth, rather than unrelated layer numbers, determines which surface is in front.
  faces.sort((a,b)=>Number(!!a.turnSide)-Number(!!b.turnSide)||b.p.reduce((sum,p)=>sum+project(p)[2],0)-a.p.reduce((sum,p)=>sum+project(p)[2],0)||(a.shadow?1:0)-(b.shadow?1:0));

  function facing(f){
   const rotate=p=>{const rx=p[0]*Math.cos(angle)+p[2]*Math.sin(angle),rz=-p[0]*Math.sin(angle)+p[2]*Math.cos(angle);return [rx,p[1]*Math.cos(tilt)-rz*Math.sin(tilt),p[1]*Math.sin(tilt)+rz*Math.cos(tilt)];};
   const p=f.p.map(rotate),u=p[1].map((v,i)=>v-p[0][i]),v=p[2].map((v,i)=>v-p[0][i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],center=p[0].map((_,i)=>p.reduce((s,a)=>s+a[i],0)/4);
   return n[2]>1e-8; // Orthographic projection: visibility uses a parallel viewing direction.
  }
  for(const f of faces){
   if(!f.twoSided&&!facing(f))continue;
   const source=f.image||(f.solid?binding:f.page?paper:im),sw=source.width,sh=source.height,start=(f.image&&f.layer===2?0:(f.u||0))*sw,width=(f.image&&f.layer===2?1:(f.width||1))*sw,segments=1;
   ctx.save();path((f.clip||f.p).map(project));ctx.clip();
   for(let i=0;i<segments;i++){
    const u=i/segments,v=(i+1)/segments,p0=at(f.p,u,0),p1=at(f.p,v,0),p2=at(f.p,v,1),p3=at(f.p,u,1),s0=[start+width*u,sh],s1=[start+width*v,sh],s2=[start+width*v,0],s3=[start+width*u,0];
    triangle(source,[s0,s1,s2],[p0,p1,p2]);triangle(source,[s0,s2,s3],[p0,p2,p3]);
   }
   if(f.light<1){ctx.fillStyle=`rgba(0,0,0,${1-f.light})`;path(f.p.map(project));ctx.fill();}
   if(f.gutter){const g=f.gutter,points=g.p.map(project),sw=g.image.width,sh=g.image.height;triangle(g.image,[[0,sh],[sw,sh],[sw,0]],[points[0],points[1],points[2]]);triangle(g.image,[[0,sh],[sw,0],[0,0]],[points[0],points[2],points[3]]);}
   if(f.leafEdge){for(let leaf=1;leaf<12;leaf++){const t=leaf/12,A=f.p[0].map((v,i)=>v+(f.p[3][i]-v)*t),B=f.p[1].map((v,i)=>v+(f.p[2][i]-v)*t);ctx.strokeStyle=leaf%3?'#9f856a55':'#fff6e599';ctx.lineWidth=.5;ctx.beginPath();const a=project(A),b=project(B);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}}
   ctx.restore();
  }
  // The gutter travels with the sheet near each endpoint, so its shade does not pop on landing.
  if(turnRows){const t=state.turn.progress,side=t<.25?1:t>.75?-1:0;if(side){const a=side>0?1-t/.25:(t-.75)/.25,opacity=a*a*(3-2*a),shade=materials['gutter'+side],u=.026/pageWidth,offset=u*(turnRows[0].length-1),i=Math.floor(offset),f=offset-i;
   const edge=row=>row[i].map((v,k)=>v+(row[i+1][k]-v)*f),a0=turnRows[0][0],a1=edge(turnRows[0]),b0=turnRows[1][0],b1=edge(turnRows[1]),q=(side>0?[a0,a1,b1,b0]:[a1,a0,b0,b1]).map(project);
   ctx.save();path([...turnRows[0],...turnRows[1].slice().reverse()].map(project));ctx.clip();ctx.globalAlpha=opacity;triangle(shade,[[0,8],[128,8],[128,0]],[q[0],q[1],q[2]]);triangle(shade,[[0,8],[128,0],[0,0]],[q[0],q[2],q[3]]);ctx.restore();}}
  canvas.dataset.rendered='true';canvas.dataset.modelEdition='hardcover';canvas.dataset.faceCount=String(faces.length);
 }).catch(()=>{canvas.parentElement.innerHTML=flat8(d);});
};
