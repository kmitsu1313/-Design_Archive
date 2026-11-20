/* One continuous spine -> cover -> themed introduction transition. */
(() => {
  'use strict';
  let binding=null,opening=null;
  const ease=t=>1-Math.pow(1-t,3);
  const mix=(a,b,t)=>a+(b-a)*t;
  function unbind() {
    if(!binding)return;
    binding.center.removeEventListener('click',binding.click);
    window.removeEventListener('hashchange',binding.navigate);
    window.removeEventListener('pagehide',binding.leave);
    binding=null;
  }
  function finish() {
    if(!opening)return;
    const state=opening;opening=null;
    cancelAnimationFrame(state.frame);
    state.observer?.disconnect();
    window.removeEventListener('resize',state.cancel);
    window.removeEventListener('keydown',state.keys,true);
    window.removeEventListener('archive:detail-ready',state.ready);
    state.layer.remove();
    state.center.classList.remove('is-opening');
    state.anchor.classList.remove('is-selected');
    state.center.removeAttribute('aria-busy');
    delete state.center.dataset.spineState;
    document.body.classList.remove('spine-arriving','spine-transitioning');
    document.body.style.removeProperty('--intro-opacity');
  }
  function cleanup(options={}) {
    unbind();
    const handoff=opening&&['navigating','landing','crossfade'].includes(opening.phase)&&location.hash==='#'+opening.hash;
    if(options.force||!handoff)finish();
  }
  function reveal(center,anchor,book,hash) {
    const artwork=anchor.querySelector('.spine-texture')||anchor;
    const source=artwork.getBoundingClientRect();
    if(!source.height||!window.ArchiveBookRenderer?.draw){location.hash=hash;return;}
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ratio=book.width*(1-book.split)/book.height+.12;
    const height=Math.min(360,innerHeight*.48,(innerWidth-54)*.82/ratio);
    const hero={x:(innerWidth-height*ratio)/2,y:(innerHeight-height)/2-12,h:height};
    const origin={x:source.left+source.width/2-source.height*ratio/2,y:source.top,h:source.height};
    const layer=document.createElement('div');
    layer.className='spine-transition';layer.dataset.phase='reveal';
    layer.setAttribute('aria-hidden','true');
    layer.style.setProperty('--transition-paper',book.bg);
    const backdrop=document.createElement('div');backdrop.className='spine-transition-backdrop';
    const flight=document.createElement('span');flight.className='spine-flight volume rendered-volume';
    flight.style.setProperty('--ratio',ratio);
    const canvas=document.createElement('canvas');
    canvas.dataset.bookId=book.id;canvas.dataset.angle=reduced?'.12':'1.48';canvas.dataset.tilt='.025';
    flight.append(canvas);layer.append(backdrop,flight);document.body.append(layer);
    const state={center,anchor,book,hash,layer,flight,canvas,backdrop,origin,hero,ratio,reduced,phase:'reveal',frame:0,start:performance.now(),lastDraw:-Infinity,observer:null,readyAt:null,target:null,painted:false};
    opening=state;
    center.classList.add('is-opening');anchor.classList.add('is-selected');
    center.setAttribute('aria-busy','true');center.dataset.spineState='opening';
    document.body.classList.add('spine-transitioning');
    state.cancel=()=>finish();
    state.keys=event=>{
      if(event.key==='Escape'){event.preventDefault();finish();return;}
      if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))event.preventDefault();
    };
    state.ready=event=>{
      if(opening!==state||event.detail?.id!==book.id||state.phase!=='navigating')return;
      state.target=document.querySelector('.detail-entry-cover canvas');
      if(!state.target){finish();return;}
      state.target.dataset.angle='.12';state.target.dataset.tilt='.025';
      window.ArchiveBookRenderer.draw(state.target,book);
      state.readyAt=performance.now();state.phase='landing';layer.dataset.phase='landing';
    };
    layer.addEventListener('wheel',event=>event.preventDefault(),{passive:false});
    layer.addEventListener('touchmove',event=>event.preventDefault(),{passive:false});
    window.addEventListener('keydown',state.keys,true);
    window.addEventListener('resize',state.cancel,{once:true});
    window.addEventListener('archive:detail-ready',state.ready);
    state.observer=new MutationObserver(()=>{if(state.phase==='reveal'&&!center.isConnected)finish();});
    state.observer.observe(document.body,{childList:true,subtree:true});
    function pose(rect,angle,now) {
      flight.style.width=rect.h*ratio+'px';flight.style.height=rect.h+'px';
      flight.style.transform=`translate3d(${rect.x}px,${rect.y}px,0)`;
      canvas.dataset.angle=String(angle);
      if(now-state.lastDraw>32||!state.painted){window.ArchiveBookRenderer.draw(canvas,book);state.lastDraw=now;state.painted=true;}
    }
    function interpolate(a,b,p){return {x:mix(a.x,b.x,p),y:mix(a.y,b.y,p),h:mix(a.h,b.h,p)};}
    function commit(now) {
      state.phase='navigating';state.navigatedAt=now;layer.dataset.phase='handoff';
      state.observer.disconnect();
      document.body.classList.add('spine-arriving');document.body.style.setProperty('--intro-opacity','0');
      window.dispatchEvent(new CustomEvent('archive:spine-open',{detail:{id:book.id}}));
      location.hash=hash;
    }
    function frame(now) {
      if(opening!==state)return;
      if(state.phase==='reveal') {
        if(!center.isConnected){finish();return;}
        const duration=reduced?130:740;
        const progress=Math.min(1,(now-state.start)/duration),p=ease(progress);
        pose(reduced?hero:interpolate(origin,hero,p),reduced?.12:mix(1.48,.12,p),now);
        backdrop.style.opacity=String(Math.min(1,p*1.12));
        if(progress===1){
          layer.dataset.phase='revealed';center.dataset.spineState='revealed';
          const drawn=canvas.dataset.rendered==='true'||flight.dataset.renderFallback==='true';
          if(drawn&&!state.revealedAt)state.revealedAt=now;
          if(!drawn&&now-state.start>duration+650)state.revealedAt=now-150;
          if(state.revealedAt&&now-state.revealedAt>=(reduced?40:140))commit(now);
        }
      } else if(state.phase==='navigating') {
        pose(hero,.12,now);
        if(now-state.navigatedAt>1400){finish();return;}
      } else if(state.phase==='landing') {
        if(!state.target?.isConnected){finish();return;}
        const rect=state.target.getBoundingClientRect();
        const target={x:rect.left,y:rect.top,h:rect.height};
        const progress=Math.min(1,(now-state.readyAt)/(reduced?160:590)),p=ease(progress);
        pose(reduced?target:interpolate(hero,target,p),.12,now);
        backdrop.style.opacity=String(1-p);
        document.body.style.setProperty('--intro-opacity',String(p));
        if(progress===1){
          state.phase='crossfade';state.crossfadeAt=now;layer.dataset.phase='settled';
          document.body.classList.remove('spine-arriving');
        }
      } else {
        const progress=Math.min(1,(now-state.crossfadeAt)/110);
        flight.style.opacity=String(1-progress);
        if(progress===1){finish();return;}
      }
      state.frame=requestAnimationFrame(frame);
    }
    state.frame=requestAnimationFrame(frame);
  }
  function bind(root) {
    cleanup();
    const center=root?.matches?.('.research-center')?root:root?.querySelector?.('.research-center');
    if(!center)return;
    const click=event=>{
      const anchor=event.target.closest?.('a.spine-book');
      if(!anchor||!center.contains(anchor)||event.defaultPrevented)return;
      if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      if(anchor.target&&anchor.target!=='_self')return;
      const href=anchor.getAttribute('href')||'';
      if(!href.startsWith('#detail/'))return;
      const book=(window.ARCHIVE_BOOKS||[]).find(b=>b.id===(anchor.dataset.bookId||href.slice(8)));
      if(!book)return;
      event.preventDefault();if(opening)return;
      reveal(center,anchor,book,href.slice(1));
    };
    binding={center,click,navigate:()=>cleanup(),leave:()=>cleanup({force:true})};
    center.addEventListener('click',click);
    window.addEventListener('hashchange',binding.navigate);
    window.addEventListener('pagehide',binding.leave);
  }
  window.ArchiveSpines={bind,cleanup};
})();
