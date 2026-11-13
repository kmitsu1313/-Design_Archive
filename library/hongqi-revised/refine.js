(()=>{
const y=document.createElement('span');y.id='current-year';y.textContent='1966';document.querySelector('#timeline').append(y);
const names=['序曲 · 共和国长子','发轫 · 设计与研发','演进 · 红旗的谱系化','转型 · 量产国民车','未来 · 风卷红旗如画'];
const cover=document.querySelector('#chapter-cover')||document.createElement('nav');cover.replaceChildren();cover.id='chapter-cover';cover.setAttribute('aria-label','选择红旗章节');
const photo='assets/chapter-collage.png';
names.forEach((name,i)=>{const b=document.createElement('button');b.className='chapter-strip';b.style.setProperty('--i',i);b.setAttribute('aria-label',`第${i+1}章 ${name}`);const im=document.createElement('img');im.src=photo;im.alt='红旗轿车侧面';const label=document.createElement('span');label.textContent="";b.append(im,label);b.onclick=async()=>{if(i!==2){window.hongqiChapter(i+1);return}if(cover.dataset.entering)return;cover.dataset.entering='true';try{
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,reduced?0:ms));
cover.classList.add('text-leaving19');
await window.hongqiReady;
window.hongqiEnter();
await wait(120);
cover.classList.add('leaving');
await wait(680);
document.body.classList.add('image-enter19');
document.body.classList.remove('in-directory');
cover.hidden=true;
const pictures=document.querySelector('#pictures');
const imageAnimation=reduced?null:pictures.animate([{translate:'0 65vh',opacity:0},{translate:'0 0',opacity:1}],{duration:700,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
const ui=[...document.querySelectorAll('#copy,#date,#bottom,#nodes,#chapters,#start-hint')];
const fades=reduced?[]:ui.map(el=>el.animate([{opacity:0},{opacity:1}],{duration:520,delay:90,easing:'ease-out',fill:'both'}));
document.body.classList.remove('image-enter19');
await Promise.all([...fades,imageAnimation].filter(Boolean).map(a=>a.finished));
[...fades,imageAnimation].filter(Boolean).forEach(a=>a.cancel());
delete cover.dataset.entering;
}catch(error){delete cover.dataset.entering;console.error(error)}};cover.append(b)});
const heading=document.createElement('header');heading.className='directory-heading13';heading.innerHTML='<h1>红旗：一部轿车的设计使命</h1><p>林晶晶 · 江苏凤凰美术出版社 · 2026</p>';cover.append(heading);
const hint=document.createElement('aside');hint.className='directory-hint13';hint.setAttribute('aria-live','polite');cover.append(hint);
const summaries=['从共和国汽车工业的起步，理解红旗诞生的时代背景。','沿着早期研发和造型探索，观察传统文化如何转化为汽车设计。','以车型谱系为线索，走入设计手稿、口述与工程实践。点击进入第三章图像叙事。','关注从礼宾用车走向量产的转型，理解生产与使用需求的改变。','从品牌发展与未来探索，继续思考自主设计的方向。'];
cover.querySelectorAll('.chapter-strip').forEach((b,i)=>{b.onmouseenter=b.onfocus=()=>{hint.innerHTML='<h2>'+names[i]+'</h2><p>'+summaries[i]+'</p>';hint.classList.add('visible');};b.onmouseleave=b.onblur=()=>hint.classList.remove('visible');});document.body.append(cover);document.documentElement.classList.remove('story-boot');document.body.classList.add('in-directory');window.scrollTo({top:0,behavior:'instant'});
const back=document.createElement('button');back.id='directory-return';back.textContent='章节目录';back.onclick=()=>{cover.hidden=false;cover.classList.remove('leaving');document.body.classList.add('in-directory');};/* The compact left menu remains the chapter navigation. */
document.querySelectorAll('#chapters button').forEach((b,i)=>{b.innerHTML='<span>0'+(i+1)+'</span> '+names[i].slice(0,2)+'<i></i>';});
})();
