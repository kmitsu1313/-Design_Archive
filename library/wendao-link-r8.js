(()=>{'use strict';let leaving=false,fade=null;
window.addEventListener('pageshow',()=>{leaving=false;fade?.cancel();fade=null;});
const before=bind7;bind7=function(){before();if(current.split('?')[0]!=='detail/wendao')return;const model=document.querySelector('#app .detail-object7 .model8');if(!model)return;model.setAttribute('role','link');model.setAttribute('tabindex','0');model.setAttribute('aria-label','进入问道中国自主设计交互阅读');model.style.cursor='pointer';
const enter=async()=>{if(leaving)return;leaving=true;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduced&&document.body.animate){fade=document.body.animate([{opacity:1},{opacity:0}],{duration:320,easing:'ease-in-out',fill:'forwards'});await fade.finished.catch(()=>{});}
location.href='wendao/index.html?entry=book';};model.addEventListener('click',enter);model.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();enter();}});};render7();})();
