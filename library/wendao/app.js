(()=>{'use strict';
const $=s=>document.querySelector(s), NS='http://www.w3.org/2000/svg', A=window.STORY_DATA.assets;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),mix=(a,b,t)=>a+(b-a)*t, smooth=t=>{t=clamp(t);return t*t*(3-2*t)}, reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const el=(tag,attrs={},parent)=>{const n=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));parent?.append(n);return n};
const captions=Object.fromEntries(Object.entries(A).map(([key,asset])=>[key,asset.caption]));
const STORY_LEFT=35;
const sequence=window.STORY_DATA.scenes.map(scene=>scene.id);
const defs=$('#stage defs');const blur=el('filter',{id:'block-glow',x:'-30%',y:'-40%',width:'160%',height:'180%'},defs);el('feGaussianBlur',{stdDeviation:20},blur);
const boundaryPunctuation = /[，。！？；：、,.!?;:（）()《》〈〉「」『』“”‘’…—]/u;

function balanceStoryLines(nodes) {
 // Each SVG text element is a fixed line. Move the break while keeping the wording and line count.
 for (let i=0;i<nodes.length-1;i++) {
  const left=nodes[i], right=nodes[i+1];
  if (left.getAttribute("font-size")!==right.getAttribute("font-size")) continue;
  const before=Array.from(left.textContent), after=Array.from(right.textContent);
  if (!before.length||!after.length||(!boundaryPunctuation.test(before.at(-1))&&!boundaryPunctuation.test(after[0]))) continue;
  const combined=[...before,...after];
  for (let distance=1;distance<combined.length;distance++) {
   const cut=[before.length-distance,before.length+distance].find(index=>index>0&&index<combined.length&&!boundaryPunctuation.test(combined[index-1])&&!boundaryPunctuation.test(combined[index]));
   if (cut===undefined) continue;
   left.textContent=combined.slice(0,cut).join("");
   right.textContent=combined.slice(cut).join("");
   break;
  }
 }
}
function keepPunctuationTogether(text) {
 return text.replace(/[，。！？；：、（）《》〈〉「」『』“”‘’…—]/gu,(mark,index)=>
  (index ? "\u2060" : "")+mark+(index+1<text.length ? "\u2060" : ""));
}
function parse(raw) {
 const root=new DOMParser().parseFromString('<svg xmlns="'+NS+'">'+raw.body+'</svg>','image/svg+xml').documentElement;
 const ims={};
 root.querySelectorAll('use').forEach(n=>{ims[n.getAttribute('href').slice(1)]={x:+n.getAttribute('x'),y:+n.getAttribute('y'),w:+n.getAttribute('width'),h:+n.getAttribute('height')};n.remove()});
 const g=el('g',{opacity:0,'data-scene':raw.id},$('#copy')),groups=[];
 for(const n of root.querySelectorAll('text')) {
  if(raw.dark)n.setAttribute('fill','#e1e1de');
  const size=+n.getAttribute('font-size');
  n.classList.add(size===32?'section-heading':size<=13?'source-note':'body-copy');
  const x=+n.getAttribute('x'),y=+n.getAttribute('y');
  let block=groups.find(b=>b.x===x&&y>=b.last&&y-b.last<70);
  if(!block){block={x,last:y,node:el('g',{},g)};groups.push(block)}
  block.last=y;block.node.append(n);
 }
 for(const block of groups){const r=el('rect',{class:'copy-glow',fill:'white',opacity:.72,filter:'url(#block-glow)',rx:30});block.node.prepend(r);block.glow=r;}
 return {...raw,ims,g,groups,paragraphs:groups.map(b=>b.node)};
}
const states=sequence.map(id=>parse(window.STORY_DATA.scenes.find(s=>s.id===id)));
const ih=540*A.workshop.h/A.workshop.w;states.unshift({id:'00',label:'图像进入',ims:{workshop:{x:690,y:130,w:540,h:ih}},g:el('g',{},$('#copy')),groups:[],year:'手艺',dark:false});
states.push({id:'end',label:'阅读下一节',ims:{},g:el('g',{},$('#copy')),groups:[],year:'',dark:false});
// Text halos belong to whole paragraphs; source captions are separate image children.
function measureText(){states.forEach(s=>s.groups.forEach(b=>{b.glow.setAttribute('width',0);b.glow.setAttribute('height',0);const nodes=[...b.node.querySelectorAll('text')];if(!nodes.length)return;const boxes=nodes.map(n=>n.getBBox()),x=Math.min(...boxes.map(b=>b.x)),y=Math.min(...boxes.map(b=>b.y)),r=Math.max(...boxes.map(b=>b.x+b.width)),bottom=Math.max(...boxes.map(b=>b.y+b.height));Object.entries({x:x-22,y:y-20,width:r-x+44,height:bottom-y+40}).forEach(([k,v])=>b.glow.setAttribute(k,v));b.glow.style.display=(s.dark||s.id==='12')?'none':'';if(s.id==='12'&&nodes.every(n=>!n.classList.contains('section-heading'))){b.node.setAttribute('transform','translate('+(960-(x+r)/2)+' '+(540-(y+bottom)/2)+')')}}));}
document.fonts.ready.then(measureText);
let progress=0,current=0,unit=1400,last=0,mx=0,my=0,px=0,py=0,selected='workshop',activeGhost=null,chapterRows=[];
const images={};
Object.entries(A).forEach(([key,a])=>{
 const group=el('g',{'data-image':key,opacity:0},$('#pictures')),image=el('image',{href:a.src,preserveAspectRatio:'none',role:'button',tabindex:-1,'aria-label':captions[key]},group);
 const cap=el('text',{'font-size':13,fill:'#93938e',class:'image-caption'},group);cap.textContent=captions[key];
 image.onclick=()=>openGallery(key);image.onkeydown=e=>{if(e.key==='Enter')openGallery(key)};
 const clip=el('clipPath',{id:'clip-'+key,clipPathUnits:'userSpaceOnUse'},defs),rect=el('rect',{},clip);
 const bright=el('image',{href:a.src,preserveAspectRatio:'none','clip-path':'url(#clip-'+key+')',opacity:0,'pointer-events':'none'},$('#focus-bright'));
 images[key]={group,image,cap,bright,rect};
});
$('#shade').remove();
const ghostKeys=['turtle','workshop','commune','friendship','camel','teacher','harvest','classroom'];
const positions=[-50,230,1380,1640,400,1480,100,1280];
const ghosts=ghostKeys.map((key,j)=>{
 const a=A[key],w=[260,300,260,280,260,280][j%6],h=w*a.h/a.w,g=el('g',{'data-ghost':key,role:'button',tabindex:0,'aria-label':'查看档案：'+captions[key]},$('#ghosts'));
 const tile=el('rect',{width:w,height:h,fill:'#bcbcbc'},g);const im=el('image',{href:a.src,width:w,height:h},g);if(j%2){im.style.opacity=0;im.style.transition='opacity .35s';g.addEventListener('mouseenter',()=>im.style.opacity=1);g.addEventListener('mouseleave',()=>im.style.opacity=0);g.addEventListener('focus',()=>im.style.opacity=1);g.addEventListener('blur',()=>im.style.opacity=0)}else tile.style.display='none';g.style.cursor='pointer';
 const obj={key,g,im,w,h,hover:0,wantHover:0,chapter:3};
 g.onmouseenter=()=>obj.wantHover=1;g.onmouseleave=()=>obj.wantHover=0;g.onclick=()=>showInfo(obj);g.onkeydown=e=>{if(e.key==='Enter')showInfo(obj)};return obj;
});$('#ghosts').removeAttribute('aria-hidden');
window.addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-.5)*-32;my=(e.clientY/innerHeight-.5)*-24});
const years=[];
$('#nodes').replaceChildren();states.forEach((s,i)=>{if(i===0||s.id==='end')return;const b=document.createElement('button');b.title=s.label;b.ariaLabel=s.label;b.dataset.index=i;b.onclick=()=>go(i);$('#nodes').append(b)});
$('#years').replaceChildren();years.forEach(([y,i])=>{const b=document.createElement('button');b.textContent=y;b.style.left=i/(states.length-2)*100+'%';b.dataset.index=i;b.onclick=()=>go(i);$('#years').append(b)});
$('#date').replaceChildren();const yearText=el('text',{x:STORY_LEFT,y:210,class:'year'},$('#date'));const yearLine=el('rect',{y:151,width:68,height:15},$('#date'));
$('#carbody').setAttribute('d','M8 34V23Q8 18 16 18L31 5Q34 2 40 2H72Q81 2 87 12L94 20H108Q114 20 114 27V34H101M87 34H34M20 34H8');$('#carwindow').setAttribute('d','M36 11H80L87 20H36ZM59 11V20');$('#car g').setAttribute('stroke-width','3.6');
const color=(a,b,t)=>a.map((v,i)=>Math.round(mix(v,b[i],t)));
function base(s){return s.dark?[36,38,38]:s.id==='08'?[232,219,178]:[255,255,255]}
function geometry(v,w,f,focusSwap){
 if(v&&w)return {x:mix(v.x,w.x,smooth(f/.45)),y:mix(v.y,w.y,smooth(f/.45)),w:mix(v.w,w.w,smooth(f/.45)),h:mix(v.h,w.h,smooth(f/.45)),alpha:1,arrived:1};
 if(focusSwap){const g=w||v;return {...g,alpha:w?smooth(f/.48):1-smooth(f/.48),arrived:1}}
 if(w){const t=smooth((f-.2)/.32);return {...w,y:mix(1160,w.y,t),alpha:1,arrived:t}}
 const t=smooth(f/.32),y=mix(v.y,-v.h-80,t);return {...v,y,alpha:1-smooth((-y/v.h-2/3)*3),arrived:0};
}
function render(p){
 const i=Math.min(Math.floor(p),states.length-1),f=p-i,s=states[i],prev=states[Math.max(0,i-1)],focusSwap=!!(prev.focus&&s.focus),t=i?smooth(f/.48):1;current=i;
 const end=s.id==='end'?smooth(f/.45):0;
 let bgT=t;if(s.id==='08')bgT=smooth((f-.5)/.16);if(prev.id==='08'&&s.id!=='08')bgT=smooth(f/.22);
 const bg=color(base(prev),base(s),bgT),bgString=`rgb(${bg.join(',')})`;document.documentElement.style.background=bgString;document.body.style.background=bgString;$('#viewport').style.background=bgString;$('#bottom').style.background=bgString;
 document.body.classList.toggle('dark',s.dark||(prev.dark&&t<.5));document.body.classList.toggle('ending',end>.98);
 const focusStrength=mix(prev.focus?1:0,s.focus?1:0,t);
 let focus=s.focus||prev.focus;if(focusSwap)focus=s.focus.map((v,j)=>mix(prev.focus[j],v,t));
 for(const [key,o]of Object.entries(images)){
  const v=prev.ims[key],w=s.ims[key];if(!v&&!w){o.group.setAttribute('opacity',0);o.bright.setAttribute('opacity',0);o.image.style.pointerEvents='none';o.image.setAttribute('tabindex',-1);continue}
  let g=i===0&&w?{...w,alpha:1,arrived:1}:geometry(v,w,f,focusSwap);
 o.group.setAttribute('opacity',g.alpha*(1-end));o.image.setAttribute('opacity',1-focusStrength*.72);
  for(const [attr,val]of Object.entries({x:g.x,y:g.y,width:g.w,height:g.h})){o.image.setAttribute(attr,val);o.bright.setAttribute(attr,val)}
  o.image.style.pointerEvents=g.alpha>.65?'auto':'none';o.image.setAttribute('tabindex',g.alpha>.65?0:-1);
  o.cap.setAttribute('x',g.x);o.cap.setAttribute('y',Math.min(1055,g.y+g.h+25));o.cap.setAttribute('opacity',w?smooth((g.arrived-.88)/.12)*(1-end):0);o.cap.setAttribute('fill',s.dark?'#aaa':'#92928d');
  const eligible=(prev.focus&&v)||(s.focus&&w);if(focus&&eligible){const [x,y,ww,hh]=focus;Object.entries({x:g.x+x*g.w,y:g.y+y*g.h,width:ww*g.w,height:hh*g.h}).forEach(([k,val])=>o.rect.setAttribute(k,val));o.bright.setAttribute('opacity',focusStrength*g.alpha*(1-end))}else o.bright.setAttribute('opacity',0);
 }
 states.forEach((state,j)=>{let a=0;if(j===i)a=smooth((f-.44)/.13);else if(j===i-1)a=1-smooth(f/.13);if(i===0)a=0;state.g.setAttribute('opacity',a*(1-end));(state.paragraphs||[]).forEach((node,k)=>{const q=j===i?smooth((f-.45-k*.035)/.12):1;node.setAttribute('opacity',q)});state.g.setAttribute('transform',`translate(0 ${j===i?12*(1-a):-12*(1-a)})`)});
 const year=f<.22?prev.year:s.year;if(yearText.textContent!==year){yearText.textContent=year;yearText.animate([{opacity:0},{opacity:1}],{duration:420});yearLine.animate([{opacity:0},{opacity:1}],{duration:420});const yy=document.querySelector('#current-year');if(yy){yy.textContent=year;yy.animate([{transform:'translate(-100%,14px)',opacity:0},{transform:'translate(-100%,0)',opacity:1}],{duration:420})}};yearLine.setAttribute('x',STORY_LEFT+yearText.getComputedTextLength()+24);$('#date').setAttribute('fill',s.dark?'#e1e1de':'#944b35');$('#date').style.opacity=1-end;
 ghosts.forEach((o,j)=>{o.hover=mix(o.hover,o.wantHover,.12);const speed=j%2?650:780;const y=((j*247-p*speed)%1975+1975)%1975-280;const x=positions[j]+px*(j%2?1:1.2);const scale=1+o.hover*.055;o.g.setAttribute('transform',`translate(${x} ${y+py*(j%2?1:1.2)})`);o.im.setAttribute('transform',`translate(${o.w*(1-scale)/2} ${o.h*(1-scale)/2}) scale(${scale})`);const dark=mix(prev.dark?1:0,s.dark?1:0,t);o.g.setAttribute('opacity',(j%2?.1:.3)*(1-dark)*smooth(p/.5)*(s.id==='08'?0:1));});
 $('#position').textContent=String(i+1).padStart(2,'0')+' / '+states.length;$('#start-hint').style.opacity=1-clamp(p/.7);const fraction=clamp(p/(states.length-1));$('#travel').style.width=fraction*100+'%';$('#car').style.left=fraction*100+'%';const cy=$('#current-year');if(cy)cy.style.left=fraction*100+'%';
 ['#bottom','#nodes','#chapters'].forEach(sel=>{$(sel).style.opacity=1-end;$(sel).style.pointerEvents=end>.9?'none':''});$('#next-section').style.opacity=end;$('#next-section').style.pointerEvents=end>.9?'auto':'none';
 document.querySelectorAll('#nodes button').forEach(b=>b.classList.toggle('active',+b.dataset.index===i));document.querySelectorAll('#years button').forEach(b=>b.classList.toggle('passed',p>=+b.dataset.index));
 if(activeGhost){const a=$('#chapters button[data-chapter="'+activeGhost.chapter+'"]').getBoundingClientRect(),b=activeGhost.g.getBoundingClientRect();$('#chapter-link path').setAttribute('d',`M${a.right+6} ${a.y+a.height/2} H${a.right+32} L${b.x-12} ${b.y+b.height/2} H${b.x}`);$('#chapter-link').style.opacity=end>.9?0:1;}
}
function resize(){unit=Math.max(1300,innerHeight*1.75);$('#track').style.height=(unit*(states.length-.01)+innerHeight)+'px';measureText()}
function go(i){window.scrollTo({top:(i+.66)*unit,behavior:reduced?'instant':'smooth'})}
const mobileLayout = matchMedia("(max-width:760px)");
function tick(now){if(mobileLayout.matches){requestAnimationFrame(tick);return}const dt=Math.min(50,now-(last||now));last=now;const target=clamp(scrollY/unit,0,states.length-.01);progress=reduced?target:mix(progress,target,1-Math.exp(-dt/115));px=mix(px,mx,.07);py=mix(py,my,.07);render(progress);requestAnimationFrame(tick)}
// Reading zones slow input continuously; no rounded landing point can trap later wheel events.
let wheelTarget=null;
window.addEventListener('scroll',()=>{if(wheelTarget!==null&&Math.abs(scrollY-wheelTarget)>2)wheelTarget=null},{passive:true});
window.addEventListener('wheel',e=>{
 if(mobileLayout.matches)return;
 if(document.body.classList.contains('in-directory')){e.preventDefault();return}if($('#gallery').open||$('#chapter-dialog').open||e.ctrlKey)return;
 const d=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);if(!d)return;
 e.preventDefault();
 const origin=wheelTarget!==null&&Math.abs(scrollY-wheelTarget)<=2?wheelTarget:scrollY;
 const f=(origin/unit)%1,reading=smooth((f-.42)/.14)*(1-smooth((f-.84)/.14));
 const gain=mix(2.6,.58,reading);
 wheelTarget=clamp(origin+d*gain,0,(states.length-.01)*unit);
 window.scrollTo({top:wheelTarget,behavior:'instant'});
},{passive:false});
window.addEventListener('keydown',e=>{if(mobileLayout.matches)return;if(document.body.classList.contains('in-directory')||$('#gallery').open||$('#chapter-dialog').open)return;if(['ArrowDown','PageDown','ArrowUp','PageUp'].includes(e.key)){e.preventDefault();go(clamp(current+(e.key.endsWith('Down')?1:-1),0,states.length-1))}});
function showInfo(o){activeGhost=o;selected=o.key;const box=$('#info-card');box.querySelector('img').src=A[o.key].src;box.querySelector('p').textContent=captions[o.key];box.querySelector('small').textContent='《问道中国自主设计》 · 手艺与协作';box.classList.add('visible');document.querySelectorAll('#chapters button').forEach(b=>b.classList.toggle('selected',+b.dataset.chapter===o.chapter));}
$('#info-close').onclick=()=>{$('#info-card').classList.remove('visible');activeGhost=null;$('#chapter-link').style.opacity=0;document.querySelectorAll('#chapters button').forEach(b=>b.classList.remove('selected'))};
for(const[key,a]of Object.entries(A)){const b=document.createElement('button');const im=new Image();im.src=a.src;im.alt=captions[key];b.append(im);b.dataset.key=key;b.onclick=()=>select(key);$('#thumbnails').append(b)}
function select(key){selected=key;$('#large').src=A[key].src;$('#large').alt=captions[key];$('#caption').textContent=captions[key]+' · 《问道中国自主设计》';document.querySelectorAll('#thumbnails button').forEach(b=>b.classList.toggle('active',b.dataset.key===key))}
window.wendaoOpenGallery=(key=selected)=>openGallery(key);
function openGallery(key){select(key);$('#gallery').showModal()}$('#gallery-open').onclick=()=>openGallery(selected);$('#close').onclick=()=>$('#gallery').close();$('#locate').onclick=()=>{$('#gallery').close();
 if (mobileLayout.matches) {
   const target = document.querySelector('#mobile-story [data-gallery-key="'+selected+'"]');
   target?.scrollIntoView({block:'center'});
   target?.focus({preventScroll:true});
   return;
 }
 const i=states.findIndex(s=>s.id!=='00'&&s.ims[selected]);if(i>=0)go(i)};
const chapterNames=window.STORY_DATA.chapters.map(chapter=>chapter.name);
chapterNames.forEach((name,i)=>{const b=document.createElement('button');b.dataset.chapter=i+1;b.textContent=name;b.onclick=()=>openChapter(i+1);$('#chapters').append(b)});
function openChapter(number) {
 const chapter=window.STORY_DATA.chapters[number-1],target=$('#chapter-content');target.replaceChildren();
 const title=document.createElement('h2');title.textContent=chapter.name;target.append(title);
 for(const [heading,copy] of chapter.points){const article=document.createElement('article'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=heading;p.textContent=copy;article.append(h,p);target.append(article)}
 const ref=document.createElement('small');ref.textContent=chapter.source;target.append(ref);
 if(number===3){const button=document.createElement('button');button.textContent='进入图像叙事 ↗';button.onclick=()=>{$('#chapter-dialog').close();window.wendaoStart()};target.append(button)}
 $('#chapter-dialog').showModal();
}
$('#chapter-close').onclick=()=>$('#chapter-dialog').close();$('#next-section').onclick=()=>openChapter(4);
window.wendaoReady=Promise.all([document.fonts.ready,...['workshop'].map(key=>new Promise(resolve=>{const image=new Image();image.onload=()=>{if(image.decode)image.decode().catch(()=>{}).then(resolve);else resolve()};image.onerror=resolve;image.src=A[key].src;}))]);
window.wendaoEnter=()=>{window.scrollTo({top:0,behavior:'instant'});progress=0;wheelTarget=null;render(0);};window.wendaoChapter=openChapter;
window.addEventListener('resize',resize);resize();render(0);requestAnimationFrame(tick);
})();



