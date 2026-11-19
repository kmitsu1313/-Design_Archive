// 手机端纵向滚动叙事：复用桌面端已解析好的场景文本与原书图片，
// 保留原版的「下滑视差 + 悬浮入场」体验——大红年份随场景漂移、
// 图片与文字以不同速度浮动、底部有与桌面版对应的年份进度条。
(()=>{
'use strict';
const seq=['01','02','03','04','05A','05B','08','06','07','09A','09B','10A','10B','11','12'];
const yearOf=id=>id==='01'?'1966':id==='02'?'1969':id==='03'?'1972':id==='04'?'1977':id.startsWith('05')?'1980':'1984';
const scenes=window.STORY_DATA.scenes;
const capOf=key=>{const n=document.querySelector('#pictures [data-image="'+key+'"] image');return n?n.getAttribute('aria-label'):''};
const srcOf=key=>window.STORY_DATA.assets[key].src;
const root=document.createElement('main');
root.id='hq-mobile';
const head=document.createElement('header');
head.className='hqm-head';
const headMeta=document.createElement('p');headMeta.textContent='《红旗：一部轿车的设计使命》';
const headTitle=document.createElement('h1');headTitle.textContent='演进 · 红旗的谱系化';
const headTip=document.createElement('p');headTip.className='hqm-tip';headTip.textContent='下滑阅读 · 图像与文字随滚动浮动';
head.append(headMeta,headTitle,headTip);
root.append(head);
seq.forEach((id,idx)=>{
 const raw=scenes.find(s=>s.id===id);if(!raw)return;
 const g=document.querySelector('#copy g[data-scene="'+id+'"]');
 const sec=document.createElement('section');sec.className='hqm-scene';
 sec.dataset.year=yearOf(id);sec.dataset.idx=idx;
 if(id==='08')sec.classList.add('hqm-spread');
 if(id==='09A'||id==='09B')sec.classList.add('hqm-dark');
 if(id==='11')sec.classList.add('hqm-quote');
 const year=document.createElement('div');year.className='hqm-year';year.setAttribute('aria-hidden','true');
 year.dataset.plx='0.10';year.textContent=yearOf(id);
 const kicker=document.createElement('p');kicker.className='hqm-kicker hqm-float';kicker.textContent=yearOf(id)+' · '+raw.label;
 const title=document.createElement('h2');title.className='hqm-float';title.textContent=g?.querySelector('.section-heading')?.textContent||raw.label;
 sec.append(year,kicker,title);
 const imgs=[...new Set([...raw.body.matchAll(/<use href="#([^"]+)"/g)].map(m=>m[1]))];
 // 方框聚焦细节（对应桌面端 focus 高亮区）：09A 聚焦设计图，09B 聚焦跨页图车身
 const focusMap={'09A':['design',[31,24,38,27]],'09B':['full',[8,44,80,34]]};
 imgs.forEach((k,i)=>{
  const fig=document.createElement('figure');fig.className='hqm-float';
  if(imgs.length>1)fig.classList.add(i%2?'hqm-fig--right':'hqm-fig--left');
  const im=document.createElement('img');im.src=srcOf(k);im.alt=capOf(k);im.loading='lazy';
  const cap=document.createElement('figcaption');cap.textContent=capOf(k);
  const foc=focusMap[id];
  if(foc&&foc[0]===k){
   const [fx,fy,fw,fh]=foc[1];
   fig.classList.add('hqm-focusfig');
   fig.style.setProperty('--fx',fx+'%');fig.style.setProperty('--fy',fy+'%');
   fig.style.setProperty('--fw',fw+'%');fig.style.setProperty('--fh',fh+'%');
   const wrap=document.createElement('div');wrap.className='hqm-focuswrap';
   const bright=document.createElement('img');bright.src=srcOf(k);bright.alt='';bright.setAttribute('aria-hidden','true');bright.className='hqm-bright';bright.loading='lazy';
   const box=document.createElement('i');box.className='hqm-box';
   wrap.append(im,bright,box);fig.append(wrap,cap);sec.append(fig);return;
  }
  im.dataset.plx=i%2?'-0.075':'-0.05';
  if(id==='08'){fig.classList.add('hqm-panfig');fig.dataset.pan='1';}
  fig.append(im,cap);sec.append(fig);
 });
 let paras=[];
 if(g){
  const ps=[...g.querySelectorAll('[data-paragraph]')];
  if(ps.length)paras=ps.map(p=>[...p.querySelectorAll('text')].map(t=>t.textContent).join(''));
  else paras=[...g.children].map(gr=>[...gr.querySelectorAll('text')].filter(t=>!t.classList.contains('section-heading')).map(t=>t.textContent).join(''));
 }
 paras.map(s=>s.trim()).filter(Boolean).forEach((s,pi)=>{const p=document.createElement('p');p.className='hqm-float'+(id==='11'&&pi>0?' hqm-note':'');p.textContent=s;sec.append(p)});
 root.append(sec);
});
// 底部进度条：对应桌面端的年份 + 小车时间轴（小车直接复用桌面端画好的 SVG）
const bar=document.createElement('div');bar.id='hqm-progress';bar.setAttribute('aria-hidden','true');
const carSvg=document.querySelector('#car');
const carHtml=carSvg?'<b>'+carSvg.outerHTML.replace(/id="[^"]*"/g,'')+'</b>':'<b class="hqm-dot"></b>';
bar.innerHTML='<span class="hqm-prog-year">1966</span><span class="hqm-prog-rail"><i></i>'+carHtml+'</span><span class="hqm-prog-idx">01 / '+seq.length+'</span>';
root.append(bar);
document.body.append(root);

// —— 滚动效果（仅窄屏生效，尊重减弱动画设置）——
if(matchMedia('(max-width:760px)').matches&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
 const floats=[...root.querySelectorAll('.hqm-float')];
 const io=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('on',e.isIntersecting)),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
 floats.forEach(el=>io.observe(el));
 const plx=[...root.querySelectorAll('[data-plx]')];
 const secs=[...root.querySelectorAll('.hqm-scene')];
 const yearEl=bar.querySelector('.hqm-prog-year'),idxEl=bar.querySelector('.hqm-prog-idx'),
       fill=bar.querySelector('.hqm-prog-rail i');
 let ticking=false;
 const update=()=>{
  ticking=false;
  const mid=innerHeight/2;
  plx.forEach(el=>{
   const r=el.getBoundingClientRect();if(r.bottom<-80||r.top>innerHeight+80)return;
   const c=r.top+r.height/2;
   el.style.transform='translate3d(0,'+((mid-c)*parseFloat(el.dataset.plx)).toFixed(1)+'px,0)';
  });
  // 方框聚焦：图越靠近视口中心，暗化越强、细节框越亮（对应桌面端的细节对比框）
  root.querySelectorAll('.hqm-focusfig').forEach(fig=>{
   const r=fig.getBoundingClientRect();if(r.bottom<-60||r.top>innerHeight+60)return;
   const c=r.top+r.height/2;
   const t=Math.max(0,Math.min(1,1-Math.abs(c-mid)/(innerHeight*.42)));
   fig.style.setProperty('--reveal',t.toFixed(3));
  });
  // 跨页绘图：随下滑横向平移，宽图在窄屏上也能逐段看清（对应桌面端跨页图的浏览方式）
  root.querySelectorAll('[data-pan]').forEach(fig=>{
   const r=fig.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
   const p=Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height)));
   const img=fig.querySelector('img');if(!img)return;
   const range=img.clientWidth-fig.clientWidth;
   if(range>0)img.style.transform='translate3d('+(-p*range).toFixed(1)+'px,0,0)';
  });
  let best=null,bd=1e9;
  secs.forEach(s=>{const r=s.getBoundingClientRect();const d=Math.abs(r.top+r.height/2-mid);if(d<bd){bd=d;best=s}});
  if(best){
   const i=+best.dataset.idx;
   yearEl.textContent=best.dataset.year;
   idxEl.textContent=String(i+1).padStart(2,'0')+' / '+seq.length;
   const p=(i+1)/seq.length;
   fill.style.width=(p*100)+'%';
   const c=bar.querySelector('.hqm-prog-rail b');if(c)c.style.left=(p*100)+'%';
  }
 };
 addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});
 addEventListener('resize',update);
 update();
}else{
 root.querySelectorAll('.hqm-float').forEach(el=>el.classList.add('on'));
 root.querySelectorAll('.hqm-focusfig').forEach(fig=>fig.style.setProperty('--reveal','1'));
}
})();
