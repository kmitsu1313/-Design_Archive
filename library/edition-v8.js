// Closed cuboid meshes: all six faces share the same vertices and physical depth.
const contexts8=new Set(),textures8=new Map();
libraryMode7='timeline';
libraryIndex7=2;
function flat8(d){const [w,h]=dimensions7[d.cover];return `<svg class="flat8" viewBox="0 0 ${w*.9} ${h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(d.title)}"><svg width="${w*.9}" height="${h}" viewBox="${w*.1} 0 ${w*.9} ${h}" preserveAspectRatio="none" overflow="hidden"><image href="${asset7(d)}" width="${w}" height="${h}"/></svg></svg>`;}
volume7=function(d,shared=false){const [w,h]=dimensions7[d.cover];return `<span class="model8" style="--ratio8:${w*.9/h+.12};${shared?'view-transition-name:active-volume;':''}" role="img" aria-label="${esc(d.title)}，立体精装书"><canvas data-model8="${d.id}" aria-hidden="true"></canvas></span>`;};
function texture8(url){if(!textures8.has(url))textures8.set(url,new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.src=url}));return textures8.get(url);}
function mesh8(canvas,d){const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});if(!gl)return;contexts8.add(gl);const r=canvas.getBoundingClientRect(),scale=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*scale);canvas.height=Math.round(r.height*scale);gl.viewport(0,0,canvas.width,canvas.height);
 const vs=gl.createShader(gl.VERTEX_SHADER);gl.shaderSource(vs,'attribute vec4 p;attribute vec2 uv;attribute float light;varying vec2 t;varying float l;void main(){gl_Position=p;t=uv;l=light;}');gl.compileShader(vs);
 const fs=gl.createShader(gl.FRAGMENT_SHADER);gl.shaderSource(fs,'precision mediump float;uniform sampler2D tex;varying vec2 t;varying float l;void main(){vec4 c=texture2D(tex,t);gl_FragColor=vec4(c.rgb*l,c.a);}');gl.compileShader(fs);const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.useProgram(program);
 gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 const ratio=dimensions7[d.cover][0]*.9/dimensions7[d.cover][1],W=ratio,H=1,D=.11,angle=.30,tilt=.025,asp=r.width/r.height;
 function point(x,y,z){const a=x*Math.cos(angle)+z*Math.sin(angle),b=-x*Math.sin(angle)+z*Math.cos(angle),yy=y*Math.cos(tilt)-b*Math.sin(tilt),zz=y*Math.sin(tilt)+b*Math.cos(tilt),distance=3-zz;return [a*5.65/asp,yy*5.65,((distance-1)/4)*distance,distance];}
 const gpuTextures=new Map();const data=[];function face(points,uv,light){for(const i of [0,1,2,0,2,3])data.push(...point(...points[i]),...uv[i],light);}
 const x=W/2,y=H/2,z=D/2;
 // Atlas occupies u=0..1; front starts at 0.1. Page textures use a separate generated strip.
 const front=[[-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z]],back=[[x,-y,-z],[-x,-y,-z],[-x,y,-z],[x,y,-z]],spine=[[-x,-y,-z],[-x,-y,z],[-x,y,z],[-x,y,-z]],edge=[[x,-y,z],[x,-y,-z],[x,y,-z],[x,y,z]],top=[[-x,y,z],[x,y,z],[x,y,-z],[-x,y,-z]],bottom=[[-x,-y,-z],[x,-y,-z],[x,-y,z],[-x,-y,z]];
 const frontuv=[[.1,0],[1,0],[1,1],[.1,1]],spineuv=[[0,0],[.1,0],[.1,1],[0,1]],alluv=[[0,0],[1,0],[1,1],[0,1]];
 function draw(points,uv,light,source){data.length=0;face(points,uv,light);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);for(const [name,size,offset] of [['p',4,0],['uv',2,16],['light',1,24]]){const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,28,offset)}let tex=gpuTextures.get(source);if(!tex){tex=gl.createTexture();gpuTextures.set(source,tex);gl.bindTexture(gl.TEXTURE_2D,tex);const normalized=document.createElement('canvas');normalized.width=1024;normalized.height=1024;const nc=normalized.getContext('2d');nc.imageSmoothingQuality='high';nc.drawImage(source,0,0,1024,1024);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,normalized);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);}else gl.bindTexture(gl.TEXTURE_2D,tex);gl.drawArrays(gl.TRIANGLES,0,6);}
 texture8(asset7(d)).then(im=>{if(!canvas.isConnected||gl.isContextLost())return;const page=document.createElement('canvas');page.width=96;page.height=512;const c=page.getContext('2d');c.fillStyle='#eee9dc';c.fillRect(0,0,96,512);for(let a=0;a<96;a+=3){c.fillStyle=a%2?'#ded8ca':'#f8f5ec';c.fillRect(a,0,1,512)}draw(front,frontuv,1,im);draw(back,frontuv,.69,im);draw(spine,spineuv,.78,im);draw(edge,alluv,.92,page);draw(top,alluv,1,page);draw(bottom,alluv,.7,page);});
}
let listPreview8=null,orbitList8=[],wheelStamp8=0;
function preview8(d){return `<div class="list-picture8">${flat8(d)}</div><div class="preview-copy8"><h3>${d.title}</h3><p>${d.subtitle} / ${d.year}</p><a href="#detail/${d.id}">查看文献 ↗</a></div>`;}
function showPreview8(id){if(listPreview8===id)return;listPreview8=id;const d=doc(id),host=$('#list-preview8');if(!host)return;host.innerHTML=preview8(d);if(!reduced())host.animate([{opacity:.2,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:480,easing:'cubic-bezier(.22,1,.36,1)'});$$('.list-row8').forEach(a=>a.classList.toggle('active',a.dataset.id===id));}
function setOrbit8(index){libraryIndex7=clamp(index,0,orbitList8.length-1);const current=orbitList8[libraryIndex7];$$('.orbit-card8').forEach((el,i)=>{const offset=i-libraryIndex7;el.style.setProperty('--offset8',offset);el.style.setProperty('--fade12',Math.max(.18,1-Math.max(0,offset)*.145));el.classList.toggle('outside12',Math.abs(offset)>5);el.classList.toggle('active',offset===0);el.style.pointerEvents=Math.abs(offset)>5?'none':'';});const years=[...new Set(orbitList8.map(d=>d.year))],yi=years.indexOf(current.year);$$('.wheel-year8').forEach((el,i)=>{const angle=(i-yi)*.40;el.style.setProperty('--angle8',angle+'rad');el.classList.toggle('active',i===yi);});$('#orbit-status8').textContent=current.year+' / '+String(libraryIndex7+1).padStart(2,'0')+' — '+orbitList8.length;$('#orbit-info8').innerHTML=`<small>${current.year} / ${current.author}</small><h3>${current.title}</h3><p>${current.subtitle}</p>`;}
// Millimetres. A missing dimension is a model estimate, never a measured value.
const bookSizes12 = {
 concept: {w:168,h:235,pages:403}, shanghai:{w:190,h:250,depth:23.9}, museum:{h:210,pages:246},
 wendao:{pages:272}, industry:{pages:227}, science:{pages:273}, flowers:{pages:271}, nation:{pages:247},
 minsheng:{pages:500}
};
function bookModelSize12(book) {
 const [atlasWidth,atlasHeight]=dimensions7[book.cover];
 const size=bookSizes12[book.id]||{};
 const height=size.h||250;
 return {width:size.w||Math.round(height*.9*atlasWidth/atlasHeight),height,depth:size.depth||Math.round(4+(size.pages||290)*.055),estimated:!size.w||!size.h||!size.depth};
}
function orbitCuboid8(book) {
 const {height,depth,estimated}=bookModelSize12(book);
 const split=[109/1140,100/1125,123/1184,86/1122,80/1110,92/1062,106/989,108/1163,106/1213,107/1215,115/1086,96/1024][book.cover], dims=dimensions7[book.cover], width=height*dims[0]*(1-split)/dims[1];
 const faces=["front","back","spine","pages","top","bottom"];
 return '<span class="orbit-cube12" role="img" aria-label="'+esc(book.title)+'" title="'+(estimated?'模型尺寸含估算':'书目尺寸')+' · '+width+' × '+height+' × '+depth+' mm" style="--front-size:'+(100/(1-split))+'%;--spine-size:'+(100/split)+'%;--width-mm12:'+width+';--height-mm12:'+height+';--depth-mm12:'+depth+';--cover12:url('+asset7(book)+')">'+
  faces.map(face=>'<span class="orbit-face12 face12-'+face+'"></span>').join("")+'</span>';
}
function stepOrbit8(n){setOrbit8(libraryIndex7+n);}
library7=function(){const q=query.trim().toLowerCase(),list=referenceBooks.filter(d=>`${d.title} ${d.author} ${d.en} ${d.year}`.toLowerCase().includes(q));const toolbar=`<header class="library-toolbar7">${[['timeline','╱','时间序列'],['grid','⊞','图像书库'],['list','☰','书目列表']].map(([m,s,a])=>`<button aria-label="${a}" class="${libraryMode7===m?'active':''}" onclick="libraryMode7='${m}';render7()">${s}</button>`).join('')}</header>`;if(!list.length)return `<section class="library7">${toolbar}<p class="library-empty7">没有找到相关图书。</p></section>`;
 if(libraryMode7==='grid')return `<section class="library7 grid-flat8">${toolbar}<div class="flat-grid8">${list.map(d=>`<a href="#detail/${d.id}"><div>${flat8(d)}</div><h2>${d.title}</h2><p>${d.year} / ${d.author}</p></a>`).join('')}</div></section>`;
 if(libraryMode7==='list'){listPreview8=list.some(d=>d.id===listPreview8)?listPreview8:list[0].id;return `<section class="library7">${toolbar}<div class="list-layout8"><div class="list-table8">${list.map(d=>`<a class="list-row8 ${d.id===listPreview8?'active':''}" data-id="${d.id}" href="#detail/${d.id}" onmouseenter="showPreview8('${d.id}')" onfocus="showPreview8('${d.id}')"><small>${d.year}</small><h2>${d.title}</h2><span>图书</span><span>↗</span></a>`).join('')}</div><aside id="list-preview8">${preview8(doc(listPreview8))}</aside></div></section>`;}
 orbitList8=[...list].sort((a,b)=>(Number(a.year)||Infinity)-(Number(b.year)||Infinity));libraryIndex7=clamp(libraryIndex7,0,orbitList8.length-1);const years=[...new Set(orbitList8.map(d=>d.year))];return `<section class="library7">${toolbar}<div class="orbit8" tabindex="0" aria-label="年代书流：滚轮或左右方向键切换"><div class="year-wheel8"><div class="wheel-circle8"></div>${years.map(year=>`<button class="wheel-year8" onclick="setOrbit8(orbitList8.findIndex(d=>d.year==='${year}'))"><i></i>${year}</button>`).join('')}</div><div class="orbit-flow8"><div class="orbit-world12">${orbitList8.map(d=>`<a class="orbit-card8" href="#detail/${d.id}">${orbitCuboid8(d)}</a>`).join('')}</div></div><aside id="orbit-info8"></aside><div class="orbit-controls8"><button onclick="stepOrbit8(-1)" aria-label="上一本">←</button><span id="orbit-status8"></span><button onclick="stepOrbit8(1)" aria-label="下一本">→</button></div></div></section>`;};
const bindBefore8=bind7;
bind7=function(){bindBefore8();$$('#app canvas[data-model8]').forEach(c=>mesh8(c,doc(c.dataset.model8)));const orbit=$('.orbit8');if(orbit){setOrbit8(libraryIndex7);orbit.onwheel=e=>{e.preventDefault();if(Date.now()-wheelStamp8>280){wheelStamp8=Date.now();stepOrbit8(Math.sign(e.deltaY||e.deltaX))}};orbit.onkeydown=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();stepOrbit8(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)}};}};
const renderBefore8=render7;
render7=function(){for(const gl of contexts8)gl.getExtension('WEBGL_lose_context')?.loseContext();contexts8.clear();renderBefore8();};render=render7;
// Book-spine sculpture: preserve the printed glyph proportions instead of stretching atlas slices.
face7=function(d,spine=false){if(!spine)return flat8(d);const [w,h]=dimensions7[d.cover];return `<svg viewBox="0 0 ${w*.1} ${h}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><image href="${asset7(d)}" width="${w}" height="${h}"/></svg>`;};
const centerBefore8=center7;
center7=function(){let i=0;return centerBefore8().replace(/class="sculpture-book7 reveal7" style="/g,()=>{const [w,h]=dimensions7[i++];return `class="sculpture-book7 reveal7" style="--spine-ratio8:${w*.1/h};`;});};
let resizeTimer8;window.addEventListener('resize',()=>{clearTimeout(resizeTimer8);resizeTimer8=setTimeout(()=>{if(document.body.classList.contains('custom7'))render7()},200)});




