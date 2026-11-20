(()=>{'use strict';
if(new URLSearchParams(location.search).get('entry')!=='book')return;
const cover=document.querySelector('#chapter-cover');
cover.hidden=true;
(async()=>{await window.wendaoReady;window.wendaoEnter();
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,animations=[];
const play=(selector,frames,options)=>{const element=document.querySelector(selector);if(element?.animate&&!reduced)animations.push(element.animate(frames,{fill:'both',...options}));};
// Animate the containing groups so the existing scene engine keeps control of each item.
play('#pictures',[{opacity:0,transform:'translateY(110px)'},{opacity:1,transform:'translateY(0)'}],{duration:1000,easing:'cubic-bezier(.22,.65,.25,1)'});
for(const selector of ['#date','#copy','#ghosts','#bottom','#nodes','#start-hint','.archive-return10'])play(selector,[{opacity:0},{opacity:1}],{duration:760,delay:100,easing:'ease-in-out'});
const block=event=>{if(event.type==='keydown'&&!['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))return;event.preventDefault();event.stopImmediatePropagation();};
for(const type of ['wheel','touchmove','keydown'])window.addEventListener(type,block,{capture:true,passive:false});
document.body.classList.remove('in-directory');document.documentElement.classList.remove('story-boot');
try{await Promise.all(animations.map(animation=>animation.finished.catch(()=>{})));}finally{animations.forEach(animation=>animation.cancel());for(const type of ['wheel','touchmove','keydown'])window.removeEventListener(type,block,{capture:true});}
})();})();
