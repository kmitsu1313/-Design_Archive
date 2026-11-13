(()=>{'use strict';
const $=s=>document.querySelector(s), NS='http://www.w3.org/2000/svg', A=window.STORY_DATA.assets;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),mix=(a,b,t)=>a+(b-a)*t, smooth=t=>{t=clamp(t);return t*t*(3-2*t)}, reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const el=(tag,attrs={},parent)=>{const n=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));parent?.append(n);return n};
const captions={fleet:'出厂前的检查与护理 / p.134',security:'CA772型高级轿车 / p.133',ambulance:'CA770W型救护车 / 1980年车型 / p.137',design:'贾延良绘制的检阅车设计图 / p.139',real:'CA770TJ型检阅车 / p.138',full:'红旗检阅车完整跨页绘图 / p.140–141',head:'圆筒大灯与竖条格栅 / p.143',tail:'宫灯式尾灯 / p.142',wheel:'侧面线脚 / p.142',interior:'内饰 / p.142',east:'东风CA71 / 第二章第一节，p.048–049',dragon:'东风轿车龙标 / 第二章第一节，p.050'};
A.east={src:'assets/c2-car.png',w:567,h:373};A.dragon={src:'assets/c2-dragon.jpg',w:376,h:269};
const STORY_LEFT=35;
const sequence=['01','02','03','04','05A','05B','08','06','07','09A','09B','10A','10B','11','12'];
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
function parse(raw){
 if(raw.id==='11'){raw={...raw,body: '<text x="470" y="400" font-size="100" fill="#ef2924">“</text>'+[
 '在计划经济时代这个大前提下，',
 '红旗是一个百分之百的政治产物。',
 '因此，随着市场经济逐步出现、延伸和发展，',
 '它必须退出历史舞台。'
 ].map((t,i)=>'<text x="570" y="'+(400+i*49)+'" font-size="29" fill="#ef2924">'+t+'</text>').join('')+
 '<text x="720" y="765" font-size="21" fill="#818181">然而，红旗CA770型及其衍生系列车型却有着独特的价值。</text>'+ 
 '<text x="720" y="800" font-size="21" fill="#818181">它们回应了国家在不同时期多元化的用车需求。</text>'+ 
 '<text x="720" y="835" font-size="21" fill="#818181">大红旗所形成的设计思维、工程经验和组织模式并未消失。</text>'};}

 const root=new DOMParser().parseFromString('<svg xmlns="'+NS+'">'+raw.body+'</svg>','image/svg+xml').documentElement, ims={};
 root.querySelectorAll('use').forEach(n=>{let key=n.getAttribute('href').slice(1);if(!ims[key])ims[key]={x:+n.getAttribute('x'),y:+n.getAttribute('y'),w:+n.getAttribute('width'),h:+n.getAttribute('height')};n.remove()});
 // Align the left-hand image column; captions follow the animated image x.
 if(['01','06','07','10A','10B'].includes(raw.id)) {
  const leftImage=Object.values(ims).sort((a,b)=>a.x-b.x)[0];
  if(leftImage)leftImage.x=STORY_LEFT;
 }
 // Local editorial corrections for the five marked reading views.
 root.querySelectorAll('text').forEach(n=>{
  const text=n.textContent;
  if ((raw.id==='03' && text.includes('原文摘录 /')) ||
      (raw.id==='08' && text.startsWith('先看完整构图')) ||
      (raw.id==='10A' && text.startsWith('图像细节 /')) ||
      (raw.id==='12' && +n.getAttribute('font-size')<=14)) { n.remove(); return; }
  if(raw.id==='06' && +n.getAttribute('x')===1450){
   n.setAttribute('y',290+(+n.getAttribute('y')-355));
   n.setAttribute('dominant-baseline','text-before-edge');
   n.setAttribute('fill','#818181');
  }
 });
 const texts=[...root.querySelectorAll('text')].filter(n=>!n.getAttribute('style')?.includes('Impact'));
 const g=el('g',{opacity:0,'data-scene':raw.id},$('#copy')),groups=[];
 for(const n of texts){const x=+n.getAttribute('x'),y=+n.getAttribute('y'),z=+n.getAttribute('font-size');
  if(n.textContent.includes('本节未提供该车型照片'))continue;if(z<=14&&Object.keys(ims).length&&y>220)continue;
  if(raw.id==='01'&&y<210)continue;
  if(raw.id==='02'&&x===300)continue;
  if((raw.id==='10B'||raw.id==='12')&&x===100&&y<220)n.setAttribute('x',720);
  let block=groups.find(b=>Math.abs(b.x-(+n.getAttribute('x')))<5&&y-b.last<100&&y>=b.last);
  if(!block){const group=el('g',{},g);block={x:+n.getAttribute('x'),last:y,node:group};groups.push(block)}
  block.last=y;block.node.append(n);
 }
 if(raw.id==='02'){
  const group=el('g',{},g);groups.push({x:300,last:600,node:group});
  [['CA772 · 防护系统',410,25,'#ef2924'],['整车重4930公斤。车身采用',465,20,'#818181'],['4—6毫米钢板，配合65毫米',498,20,'#818181'],['防弹玻璃，将安全需求落实',531,20,'#818181'],['到材料、结构与整车集成。',564,20,'#818181']].forEach(([str,y,size,fill])=>{el('text',{x:300,y,'font-size':size,fill},group).textContent=str});
 }
 for(const block of groups){const r=el('rect',{class:'copy-glow',fill:raw.id==='08'?'#e8dbb2':'white',opacity:.72,filter:'url(#block-glow)',rx:30});block.node.prepend(r);block.glow=r;}
 const heading=[...g.querySelectorAll('text')].find(n=>+n.getAttribute('font-size')>=25&&n.textContent.trim()!=='“');if(heading&&raw.id!=='11'){heading.setAttribute('x',720);heading.setAttribute('y',170);heading.setAttribute('font-size',30);heading.setAttribute('font-weight',700);heading.setAttribute('fill',raw.id.startsWith('09')?'#e1e1de':'#ef2924');heading.classList.add('section-heading');g.append(heading);}
 if(raw.id==='08'){const b=el('g',{},g);[['完整跨页绘图保留了检阅车的总体比例与车身细节。',225],['开放式车顶、可升降隔断与侧壁结构，',255],['共同回应了检阅仪式中的站立、视野与安全需求。',285]].forEach(([str,y])=>el('text',{x:1280,y,'font-size':18,fill:'#818181'},b).textContent=str);balanceStoryLines([...b.querySelectorAll('text')]);}
 const paragraphs=[];for(const block of groups){const ns=[...block.node.querySelectorAll('text')].filter(n=>!n.classList.contains('section-heading'));if(ns.length<3)continue;const chunks=raw.id==='04'||raw.id==='10B'?3:raw.id==='02'?2:1;if(chunks>1){const first=+ns[0].getAttribute('y'),last=+ns[ns.length-1].getAttribute('y'),step=(last-first-14*(chunks-1))/(ns.length-1);ns.forEach((n,k)=>n.setAttribute('y',first+k*step+14*Math.min(chunks-1,Math.floor(k*chunks/ns.length))));}for(let k=0;k<chunks;k++){const part=el('g',{'data-paragraph':paragraphs.length},block.node);ns.slice(Math.floor(k*ns.length/chunks),Math.floor((k+1)*ns.length/chunks)).forEach(n=>part.append(n));paragraphs.push(part);}}
 for (const block of groups) balanceStoryLines([...block.node.querySelectorAll("text")]);
 if(raw.id==='02'){Object.values(ims).forEach(im=>im.y+=55);groups.forEach(b=>b.node.setAttribute('transform','translate(0 55)'));}
 const year=raw.id==='01'?'1966':raw.id==='02'?'1969':raw.id==='03'?'1972':raw.id==='04'?'1977':raw.id.startsWith('05')?'1980':'1984';
 return {id:raw.id,label:raw.label,ims,g,groups,paragraphs,year,dark:raw.id.startsWith('09'),focus:raw.id==='09A'?[.31,.24,.38,.27]:raw.id==='09B'?[.08,.44,.8,.34]:null};
}
const states=sequence.map(id=>parse(window.STORY_DATA.scenes.find(s=>s.id===id)));
const ih=1000*A.fleet.h/A.fleet.w;states.unshift({id:'00',label:'图像进入',ims:{fleet:{x:460,y:340,w:1000,h:ih}},g:el('g',{},$('#copy')),groups:[],year:'1966',dark:false});
states.push({id:'end',label:'阅读下一节',ims:{},g:el('g',{},$('#copy')),groups:[],year:'',dark:false});
// Text halos belong to whole paragraphs; source captions are separate image children.
function measureText(){states.forEach(s=>s.groups.forEach(b=>{b.glow.setAttribute('width',0);b.glow.setAttribute('height',0);const nodes=[...b.node.querySelectorAll('text')];if(!nodes.length)return;const boxes=nodes.map(n=>n.getBBox()),x=Math.min(...boxes.map(b=>b.x)),y=Math.min(...boxes.map(b=>b.y)),r=Math.max(...boxes.map(b=>b.x+b.width)),bottom=Math.max(...boxes.map(b=>b.y+b.height));Object.entries({x:x-22,y:y-20,width:r-x+44,height:bottom-y+40}).forEach(([k,v])=>b.glow.setAttribute(k,v));b.glow.style.display=(s.dark||s.id==='12')?'none':'';if(s.id==='12'&&nodes.every(n=>!n.classList.contains('section-heading'))){b.node.setAttribute('transform','translate('+(960-(x+r)/2)+' '+(540-(y+bottom)/2)+')')}}));}
document.fonts.ready.then(measureText);
let progress=0,current=0,unit=1400,last=0,mx=0,my=0,px=0,py=0,selected='fleet',activeGhost=null,chapterRows=[];
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
const ghostKeys=['east','security','ambulance','head','dragon','tail','design','full'];
const positions=[-50,230,1380,1640,400,1480,100,1280];
const ghosts=ghostKeys.map((key,j)=>{
 const a=A[key],w=[260,300,260,280,260,280][j%6],h=w*a.h/a.w,g=el('g',{'data-ghost':key,role:'button',tabindex:0,'aria-label':'查看档案：'+captions[key]},$('#ghosts'));
 const tile=el('rect',{width:w,height:h,fill:'#bcbcbc'},g);const im=el('image',{href:a.src,width:w,height:h},g);if(j%2){im.style.opacity=0;im.style.transition='opacity .35s';g.addEventListener('mouseenter',()=>im.style.opacity=1);g.addEventListener('mouseleave',()=>im.style.opacity=0);g.addEventListener('focus',()=>im.style.opacity=1);g.addEventListener('blur',()=>im.style.opacity=0)}else tile.style.display='none';g.style.cursor='pointer';
 const obj={key,g,im,w,h,hover:0,wantHover:0,chapter:key==='east'||key==='dragon'?2:3};
 g.onmouseenter=()=>obj.wantHover=1;g.onmouseleave=()=>obj.wantHover=0;g.onclick=()=>showInfo(obj);g.onkeydown=e=>{if(e.key==='Enter')showInfo(obj)};return obj;
});$('#ghosts').removeAttribute('aria-hidden');
window.addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-.5)*-32;my=(e.clientY/innerHeight-.5)*-24});
const years=[['1966',0],['1969',2],['1972',3],['1977',4],['1980',5],['1984',7]];
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
  if(key==='full'&&(s.id==='08'||prev.id==='08')){const box=$('#stage').getBoundingClientRect(),scale=Math.min(box.width/1920,box.height/1080),vw=innerWidth/scale,vh=innerHeight/scale,ww=Math.max(vw,vh*A.full.w/A.full.h),hh=ww*A.full.h/A.full.w;const big={x:(1920-ww)/2-box.left/(2*scale),y:(1080-hh)/2,w:ww,h:hh};if(s.id==='08'){const q=smooth((f-.2)/.32);g={...big,y:mix(1160,big.y,q),alpha:q,arrived:q}}else{const q=smooth(f/.38),shrink=1-.25*smooth(f/.15);g={x:big.x+big.w*(1-shrink)/2,y:mix(big.y,-big.h-100,q),w:big.w*shrink,h:big.h*shrink,alpha:1-smooth((f-.25)/.13),arrived:0}}}
 o.group.setAttribute('opacity',g.alpha*(1-end));o.image.setAttribute('opacity',1-focusStrength*.72);
  for(const [attr,val]of Object.entries({x:g.x,y:g.y,width:g.w,height:g.h})){o.image.setAttribute(attr,val);o.bright.setAttribute(attr,val)}
  o.image.style.pointerEvents=g.alpha>.65?'auto':'none';o.image.setAttribute('tabindex',g.alpha>.65?0:-1);
  o.cap.setAttribute('x',g.x);o.cap.setAttribute('y',Math.min(1055,g.y+g.h+25));o.cap.setAttribute('opacity',w?smooth((g.arrived-.88)/.12)*(1-end):0);o.cap.setAttribute('fill',s.dark?'#aaa':'#92928d');
  const eligible=(prev.focus&&v)||(s.focus&&w);if(focus&&eligible){const [x,y,ww,hh]=focus;Object.entries({x:g.x+x*g.w,y:g.y+y*g.h,width:ww*g.w,height:hh*g.h}).forEach(([k,val])=>o.rect.setAttribute(k,val));o.bright.setAttribute('opacity',focusStrength*g.alpha*(1-end))}else o.bright.setAttribute('opacity',0);
 }
 states.forEach((state,j)=>{let a=0;if(j===i)a=smooth((f-.44)/.13);else if(j===i-1)a=1-smooth(f/.13);if(i===0)a=0;state.g.setAttribute('opacity',a*(1-end));(state.paragraphs||[]).forEach((node,k)=>{const q=j===i?smooth((f-.45-k*.035)/.12):1;node.setAttribute('opacity',q)});state.g.setAttribute('transform',`translate(0 ${j===i?12*(1-a):-12*(1-a)})`)});
 const year=f<.22?prev.year:s.year;if(yearText.textContent!==year){yearText.textContent=year;yearText.animate([{opacity:0},{opacity:1}],{duration:420});yearLine.animate([{opacity:0},{opacity:1}],{duration:420});const yy=document.querySelector('#current-year');if(yy){yy.textContent=year;yy.animate([{transform:'translate(-100%,14px)',opacity:0},{transform:'translate(-100%,0)',opacity:1}],{duration:420})}};yearLine.setAttribute('x',STORY_LEFT+yearText.getComputedTextLength()+24);$('#date').setAttribute('fill',s.dark?'#e1e1de':'#ef2924');$('#date').style.opacity=1-end;
 ghosts.forEach((o,j)=>{o.hover=mix(o.hover,o.wantHover,.12);const speed=j%2?650:780;const y=((j*247-p*speed)%1975+1975)%1975-280;const x=positions[j]+px*(j%2?1:1.2);const scale=1+o.hover*.055;o.g.setAttribute('transform',`translate(${x} ${y+py*(j%2?1:1.2)})`);o.im.setAttribute('transform',`translate(${o.w*(1-scale)/2} ${o.h*(1-scale)/2}) scale(${scale})`);const dark=mix(prev.dark?1:0,s.dark?1:0,t);o.g.setAttribute('opacity',(j%2?.1:.3)*(1-dark)*smooth(p/.5)*(s.id==='08'?0:1));});
 $('#position').textContent=String(i+1).padStart(2,'0')+' / '+states.length;$('#start-hint').style.opacity=1-clamp(p/.7);const fraction=clamp(p/(states.length-1));$('#travel').style.width=fraction*100+'%';$('#car').style.left=fraction*100+'%';const cy=$('#current-year');if(cy)cy.style.left=fraction*100+'%';
 ['#bottom','#nodes','#chapters'].forEach(sel=>{$(sel).style.opacity=1-end;$(sel).style.pointerEvents=end>.9?'none':''});$('#next-section').style.opacity=end;$('#next-section').style.pointerEvents=end>.9?'auto':'none';
 document.querySelectorAll('#nodes button').forEach(b=>b.classList.toggle('active',+b.dataset.index===i));document.querySelectorAll('#years button').forEach(b=>b.classList.toggle('passed',p>=+b.dataset.index));
 if(activeGhost){const a=$('#chapters button[data-chapter="'+activeGhost.chapter+'"]').getBoundingClientRect(),b=activeGhost.g.getBoundingClientRect();$('#chapter-link path').setAttribute('d',`M${a.right+6} ${a.y+a.height/2} H${a.right+32} L${b.x-12} ${b.y+b.height/2} H${b.x}`);$('#chapter-link').style.opacity=end>.9?0:1;}
}
function resize(){unit=Math.max(1300,innerHeight*1.75);$('#track').style.height=(unit*(states.length-.01)+innerHeight)+'px';measureText()}
function go(i){window.scrollTo({top:(i+.66)*unit,behavior:reduced?'instant':'smooth'})}
function tick(now){const dt=Math.min(50,now-(last||now));last=now;const target=clamp(scrollY/unit,0,states.length-.01);progress=reduced?target:mix(progress,target,1-Math.exp(-dt/115));px=mix(px,mx,.07);py=mix(py,my,.07);render(progress);requestAnimationFrame(tick)}
// Reading zones slow input continuously; no rounded landing point can trap later wheel events.
let wheelTarget=null;
window.addEventListener('scroll',()=>{if(wheelTarget!==null&&Math.abs(scrollY-wheelTarget)>2)wheelTarget=null},{passive:true});
window.addEventListener('wheel',e=>{
 if(document.body.classList.contains('in-directory')){e.preventDefault();return}if($('#gallery').open||$('#chapter-dialog').open||e.ctrlKey)return;
 const d=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);if(!d)return;
 e.preventDefault();
 const origin=wheelTarget!==null&&Math.abs(scrollY-wheelTarget)<=2?wheelTarget:scrollY;
 const f=(origin/unit)%1,reading=smooth((f-.42)/.14)*(1-smooth((f-.84)/.14));
 const gain=mix(2.6,.58,reading);
 wheelTarget=clamp(origin+d*gain,0,(states.length-.01)*unit);
 window.scrollTo({top:wheelTarget,behavior:'instant'});
},{passive:false});
window.addEventListener('keydown',e=>{if($('#gallery').open||$('#chapter-dialog').open)return;if(['ArrowDown','PageDown','ArrowUp','PageUp'].includes(e.key)){e.preventDefault();go(clamp(current+(e.key.endsWith('Down')?1:-1),0,states.length-1))}});
function showInfo(o){activeGhost=o;selected=o.key;const box=$('#info-card');box.querySelector('img').src=A[o.key].src;box.querySelector('p').textContent=captions[o.key];box.querySelector('small').textContent=`《红旗：一部轿车的设计使命》 · 第${o.chapter===2?'二':'三'}章第一节`;box.classList.add('visible');document.querySelectorAll('#chapters button').forEach(b=>b.classList.toggle('selected',+b.dataset.chapter===o.chapter));}
$('#info-close').onclick=()=>{$('#info-card').classList.remove('visible');activeGhost=null;$('#chapter-link').style.opacity=0;document.querySelectorAll('#chapters button').forEach(b=>b.classList.remove('selected'))};
for(const[key,a]of Object.entries(A)){const b=document.createElement('button');const im=new Image();im.src=a.src;im.alt=captions[key];b.append(im);b.dataset.key=key;b.onclick=()=>select(key);$('#thumbnails').append(b)}
function select(key){selected=key;$('#large').src=A[key].src;$('#large').alt=captions[key];$('#caption').textContent=captions[key]+' · 《红旗：一部轿车的设计使命》';document.querySelectorAll('#thumbnails button').forEach(b=>b.classList.toggle('active',b.dataset.key===key))}
function openGallery(key){select(key);$('#gallery').showModal()}$('#gallery-open').onclick=()=>openGallery(selected);$('#close').onclick=()=>$('#gallery').close();$('#locate').onclick=()=>{$('#gallery').close();const i=states.findIndex(s=>s.ims[selected]);if(i>=0)go(i);else openChapter(2)};
const chapterNames=['序曲 · 共和国长子','发轫 · 设计与研发','演进 · 红旗的谱系化','转型 · 量产国民车','未来 · 风卷红旗如画'];
chapterNames.forEach((name,i)=>{let b=document.createElement('button');b.dataset.chapter=i+1;b.innerHTML=`<span>0${i+1}</span> ${name}<i></i>`;b.onclick=()=>openChapter(i+1);$('#chapters').append(b)});
chapterRows=window.CHAPTER_ROWS||[];
function openChapter(chapter,section){const target=$('#chapter-content');target.replaceChildren();let title=document.createElement('h2');title.textContent=chapterNames[chapter-1];target.append(title);chapterRows.filter(r=>section?r.id===section:r.id.startsWith(chapter+'.')).forEach(r=>{const article=document.createElement('article'),h=document.createElement('h3'),p=document.createElement('p'),ref=document.createElement('small');h.textContent=r.id+' '+r.title;p.textContent=keepPunctuationTogether(r.summary+' '+r.relation);ref.textContent='原书 p.'+r.pages;article.append(h,p,ref);if(r.id==='3.1'){let b=document.createElement('button');b.textContent='进入图像叙事 ↗';b.onclick=()=>{$('#chapter-dialog').close();go(0)};article.append(b)}target.append(article)});$('#chapter-dialog').showModal()}
$('#chapter-close').onclick=()=>$('#chapter-dialog').close();$('#next-section').onclick=()=>openChapter(3,'3.2');
window.hongqiReady=Promise.all([document.fonts.ready,...['fleet'].map(key=>new Promise(resolve=>{const image=new Image();image.onload=()=>{if(image.decode)image.decode().catch(()=>{}).then(resolve);else resolve()};image.onerror=resolve;image.src=A[key].src;}))]);
window.hongqiEnter=()=>{window.scrollTo({top:0,behavior:'instant'});progress=0;wheelTarget=null;render(0);};window.hongqiChapter=openChapter;
window.addEventListener('resize',resize);resize();render(0);requestAnimationFrame(tick);
})();



