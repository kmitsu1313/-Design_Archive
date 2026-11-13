(()=>{
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],data=window.HQ_DATA;
const key=new URLSearchParams(location.search).get('chapter')==='ca770'?'ca770':'ca71',chapter=data.chapters[key],scenes=chapter.scenes,assets=data.assets;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n)),mix=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t),escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={ 'c2-p15-0':'东风 CA71 型小轿车 / p.053','c2-car-complete':'东风 CA71 · 原书跨页照片 / p.048–049','c2-p8-0':'试制现场 / p.046','c2-p8-1':'试制现场 / p.046','c2-p12-0':'东风牌轿车龙标 / p.050','c2-history-complete':'历史场景 · 完整跨页 / p.048–049','c2-p11-2':'试乘照片 / p.049','c3-p3-0':'CA772 型高级轿车 / p.133','c3-p4-0':'出厂前的检查与护理 / p.134','c3-p7-0':'CA770W 型救护车 / p.137','c3-p8-0':'CA770TJ 型检阅车 / p.138','c3-p9-0':'贾延良绘制的检阅车设计图 / p.139','c3-drawing-complete':'贾延良绘制的红旗检阅车 · 完整跨页 / p.140–141','c3-p12-2':'宫灯式尾灯 / p.142','c3-p13-1':'前脸与灯组 / p.143','c3-p13-0':'车身装饰细节 / p.143','c3-p12-0':'内饰细节 / p.142','c3-p12-1':'装饰细节 / p.142'};
const ids=[...new Set(scenes.flatMap(s=>s.images))],figures=new Map(),imageNodes=new Map();
let sceneIndex=-1,activeGallery=0,scrollUnit=1,storyTop=0,target=0,rendered=0,frame=0,dialogSource=null,toastTimer;
document.title=chapter.title+' / 红旗 · 文献资料库';
$('#chapter-title').textContent=chapter.title;$('#chapter-subtitle').textContent=chapter.subtitle;$('#chapter-range').textContent=chapter.range;$('#chapter-intro').textContent=chapter.intro;$('#end-title').textContent=chapter.title+' · 阅读小结';
$$('[data-chapter]').forEach(a=>a.classList.toggle('active',a.dataset.chapter===key));
const heroId=scenes[0].images[0],hero=assets[heroId];$('#hero-visual').innerHTML=`<figure><img src="${hero.src}" width="${hero.w}" height="${hero.h}" alt="${names[heroId]}"><figcaption>${names[heroId]}</figcaption></figure>`;
$('#next-chapter').href='?chapter='+ (key==='ca71'?'ca770':'ca71');$('#next-chapter').innerHTML=(key==='ca71'?'阅读 CA770 家族':'回看东风 CA71')+' <span>↗</span>';
ids.forEach(id=>{const a=assets[id],f=document.createElement('figure');f.className='scene-image';f.tabIndex=-1;f.setAttribute('role','button');f.setAttribute('aria-label',names[id]+'，打开图像集合');f.innerHTML=`<img src="${a.src}" width="${a.w}" height="${a.h}" alt="${names[id]}" draggable="false"><figcaption>${names[id]}</figcaption>`;$('#visual-layer').append(f);figures.set(id,f);imageNodes.set(id,f.firstElementChild);f.addEventListener('click',()=>openGallery(id));f.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openGallery(id)}})});
$('#contents-list').innerHTML=scenes.map((s,i)=>`<button data-go="${i}"><small>${String(i+1).padStart(2,'0')}</small><span>${s.title}</span><span>↘</span></button>`).join('');
$('#road-nodes').innerHTML=scenes.map((s,i)=>`<button data-go="${i}" aria-label="定位：${s.title}"><span>${s.title}</span><small>${s.year||String(i+1).padStart(2,'0')}</small></button>`).join('');
function go(i){if(reduce){$('#accessible-'+i)?.scrollIntoView({behavior:'auto'});return}window.scrollTo({top:storyTop+i*scrollUnit+scrollUnit*.55,behavior:'smooth'})}
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>{go(+b.dataset.go);$('#contents').close()}));
$('#begin').onclick=()=>go(0);$('#menu-btn').onclick=()=>{dialogSource=document.activeElement;$('#contents').showModal()};
$$('dialog .close').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$$('dialog').forEach(d=>{d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}});d.addEventListener('close',()=>dialogSource?.focus())});
function positions(scene,W,H){
 const mobile=W<760,arr=scene.images,out={};if(!arr.length)return out;
 function put(id,x,y,w,maxH,alpha=1){const a=assets[id];let width=Math.min(W*w,H*maxH*a.w/a.h),height=width*a.h/a.w;out[id]={x:W*x-width/2,y:H*y-height/2,w:width,alpha}}
 if(mobile){if(arr.length===1){put(arr[0],.5,.245,.82,.32)}else{put(arr[0],.43,.23,.67,.30);put(arr[1],.83,.33,.25,.16,.62);if(arr[2])put(arr[2],.14,.35,.22,.13,.4)}return out}
 switch(scene.layout){
 case 'center':put(arr[0],.5,.30,.61,.46);break;
 case 'focus':put(arr[0],.67,.42,.48,.63);break;
 case 'return':put(arr[0],.68,.42,.45,.60);if(arr[1])put(arr[1],.9,.72,.12,.16,.3);break;
 case 'compare':put(arr[0],.36,.29,.46,.44);put(arr[1],.79,.32,.27,.34,.9);break;
 case 'constellation':put(arr[0],.51,.30,.48,.45);put(arr[1],.87,.40,.20,.31,.68);if(arr[2])put(arr[2],.12,.22,.16,.27,.45);break;
 }
 return out;
}
function render(p){
 const idx=Math.min(scenes.length-1,Math.max(0,Math.floor(p))),local=p-idx,from=idx?scenes[idx-1]:scenes[0],to=scenes[idx];
 const W=$('#stage').clientWidth,H=$('#stage').clientHeight,t=smooth(clamp(local/.48)),a=positions(from,W,H),b=positions(to,W,H);
 for(const id of ids){const old=a[id],next=b[id],f=figures.get(id);if(!old&&!next){f.style.opacity=0;f.style.pointerEvents='none';f.tabIndex=-1;continue}
  const start=old||{...next,y:next.y+H*.05,alpha:0},end=next||{...old,y:old.y-H*.04,alpha:0};
  const alpha=mix(start.alpha,end.alpha,t);f.style.width=mix(start.w,end.w,t)+'px';f.style.transform=`translate3d(${mix(start.x,end.x,t)}px,${mix(start.y,end.y,t)}px,0)`;f.style.opacity=alpha;f.style.pointerEvents=next&&alpha>.25?'auto':'none';f.tabIndex=next&&alpha>.25?0:-1;f.style.zIndex=next?(to.images[0]===id?3:2):1;
 }
 const copy=$('#scene-copy'),side=['focus','return'].includes(to.layout),isText=to.layout==='text';
 if(idx!==sceneIndex){sceneIndex=idx;copy.innerHTML=`<h2>${to.title}</h2>${to.text.map(v=>`<p>${escape(v)}</p>`).join('')}<p class="copy-ref">原书 ${to.ref}</p>`;$('#scene-kicker').textContent=to.kicker;$('#scene-pages').textContent='原书 '+to.ref;$$('#road-nodes button').forEach((n,i)=>{n.classList.toggle('active',i===idx);n.setAttribute('aria-current',i===idx?'step':'false')})}
 copy.style.left=isText?'29%':side?'6%':'24%';copy.style.width=isText?'43%':side?'30%':'53%';copy.style.maxWidth=side?'420px':'800px';copy.style.top=isText?'27%':side?'23%':'60%';
 const fade=idx===0?1:clamp(local/.19);copy.style.opacity=fade;copy.style.transform=`translateY(${(1-fade)*12}px)`;
 const bodyDark=to.dark&&scrollY>=storyTop-50&&scrollY<storyTop+scrollUnit*scenes.length;document.body.classList.toggle('dark',bodyDark);
 const roadProgress=clamp(p-.55,0,scenes.length-1),ri=Math.floor(roadProgress),nodes=$$('#road-nodes button'),left=nodes[ri].offsetLeft,right=nodes[Math.min(ri+1,nodes.length-1)].offsetLeft,carX=mix(left,right,roadProgress-ri);$('#road-car').style.left=carX+'px';$('#road-fill').style.width=carX+'px';$('.scene-hint').style.opacity=isText?'0':'1';
}
function loop(){const delta=target-rendered;rendered=reduce?target:Math.abs(delta)<.0003?target:rendered+delta*.16;render(rendered);if(Math.abs(target-rendered)>.0003)frame=requestAnimationFrame(loop);else frame=0}
function onScroll(){const y=window.scrollY,active=y>=storyTop-80&&y<storyTop+scrollUnit*scenes.length;target=clamp((y-storyTop)/scrollUnit,0,scenes.length-.001);if(!frame&&!reduce)frame=requestAnimationFrame(loop);if(!active)document.body.classList.remove('dark')}
function measure(){const stage=$('#stage');scrollUnit=Math.max(700,innerHeight*1.4);$('#scroll-track').style.height=(scrollUnit*scenes.length)+'px';storyTop=$('#story').getBoundingClientRect().top+scrollY-(innerWidth<=760?64:78);onScroll();if(!reduce)render(rendered)}
window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',measure);measure();
const imageLocations=ids.map(id=>scenes.findIndex(s=>s.images.includes(id)));
$('#gallery-thumbs').innerHTML=ids.map((id,i)=>`<button data-img="${i}" aria-label="选择：${names[id]}"><img src="${assets[id].src}" alt=""><small>${String(i+1).padStart(2,'0')}</small></button>`).join('');
function selectImage(i){activeGallery=i;const id=ids[i],img=$('#gallery-large');img.src=assets[id].src;img.alt=names[id];$('#gallery-caption').textContent=names[id];$$('[data-img]').forEach((b,n)=>{b.classList.toggle('active',n===i);b.setAttribute('aria-pressed',n===i?'true':'false')});if(!reduce)img.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'ease-out'});}
function openGallery(id){dialogSource=document.activeElement;selectImage(Math.max(0,ids.indexOf(id)));$('#gallery').showModal()}
$$('[data-img]').forEach(b=>b.onclick=()=>selectImage(+b.dataset.img));$('#rail-gallery').onclick=$('#all-images').onclick=()=>openGallery(scenes[Math.max(0,sceneIndex)].images[0]||ids[0]);
function locate(){const targetScene=imageLocations[activeGallery];$('#gallery').close();go(targetScene)}$('#locate').onclick=$('#gallery-image').onclick=locate;
$('#save-position').onclick=()=>{try{localStorage.setItem('hq-reading-'+key,JSON.stringify({progress:target,at:Date.now()}));toast('已保存本节阅读位置')}catch{toast('当前浏览器无法保存，请使用目录定位')}};
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2500)}
try{const saved=JSON.parse(localStorage.getItem('hq-reading-'+key)||'null');if(saved){const b=document.createElement('button');b.textContent='继续上次阅读 ↘';b.style.cssText='position:absolute;right:5vw;top:150px;font-size:11px;border-bottom:1px solid #aaa;padding:8px 0';b.onclick=()=>scrollTo({top:storyTop+saved.progress*scrollUnit,behavior:reduce?'auto':'smooth'});$('#hero').append(b)}}catch{}
if(reduce){$('#stage').innerHTML=scenes.map((s,i)=>`<section class="accessible-scene" id="accessible-${i}"><small>${s.kicker} · ${s.ref}</small><h2>${s.title}</h2>${s.images.map(id=>`<img src="${assets[id].src}" alt="${names[id]}" width="${assets[id].w}" height="${assets[id].h}">`).join('')}${s.text.map(t=>`<p>${escape(t)}</p>`).join('')}</section>`).join('');document.body.classList.remove('dark')}
document.addEventListener('keydown',e=>{if($('#gallery').open&&e.key==='ArrowRight')selectImage((activeGallery+1)%ids.length);if($('#gallery').open&&e.key==='ArrowLeft')selectImage((activeGallery-1+ids.length)%ids.length)});
})();
