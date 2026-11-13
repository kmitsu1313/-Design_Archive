/* Native billboards: front-facing image planes projected from a rotating sphere. */
(function(root){
  'use strict';
  function points(count){
    const golden=Math.PI*(3-Math.sqrt(5));
    return Array.from({length:count},(_,i)=>{
      const y=1-2*(i+.5)/count,r=Math.sqrt(1-y*y),angle=golden*i;
      return {x:Math.cos(angle)*r,y,z:Math.sin(angle)*r};
    });
  }
  function project(v,{width,height,yaw,pitch,radius:sceneRadius}){
    const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
    const x=v.x*cy+v.z*sy,z0=-v.x*sy+v.z*cy;
    const y=v.y*cp-z0*sp,z=v.y*sp+z0*cp;
    const perspective=5/(5-z),radius=sceneRadius??Math.min(width*.16,height*.265);
    return {x:width/2+x*radius*perspective,y:height/2-y*radius*perspective,
      scale:(.88+.10*z)*perspective,depth:z};
  }
  function dragged(dx,dy){return Math.hypot(dx,dy)>5;}
  function create(stage,items,{onSelect,onHover,onBackground=()=>{},cluster=false,continuous=false,initialYaw=-.22,initialPitch=.10,spin=.035,tileRatio=.16,radiusRatio=.34}){
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const vertices=points(items.length),listeners=new AbortController();
    let yaw=initialYaw,pitch=initialPitch,active=true,hovered=false,drag=null,skipUntil=0;
    let vx=0,vy=0,frame=0,lastTime=0,width=0,height=0,disposed=false;
    const buttons=items.map((item,i)=>{
      const button=document.createElement('button');
      button.type='button';button.className='sphere-tile image-block';
      button.dataset.item=item.id;button.style.setProperty('--shade',item.shade);
      button.dataset.resourceType=item.collectionId;
      button.setAttribute('aria-label','打开图片 '+String(i+1).padStart(2,'0')+'：'+item.title);
      if(item.image){
        button.classList.add('has-image');button.style.setProperty('--image-position',item.imagePosition||'50% 50%');
        button.style.setProperty('--image-fit',item.imageFit||'cover');
        const cover=document.createElement('img');cover.className='sphere-cover';
        if(item.collectionId==='books'){
          button.classList.add('book-cover-frame');
          cover.style.clipPath=item.imageClip||'';
          cover.style.setProperty('--book-scale',item.imageScale||.86);
        }
        cover.src=item.image;cover.alt=item.title;cover.draggable=false;button.appendChild(cover);
      }
      const mark=document.createElement('span');mark.className='tile-mark';
      mark.textContent=String(i+1).padStart(2,'0');button.appendChild(mark);
      button.addEventListener('pointerenter',()=>{hovered=true;onHover(item);},{signal:listeners.signal});
      button.addEventListener('pointerleave',()=>{hovered=false;onHover(null);wake();},{signal:listeners.signal});
      button.addEventListener('focus',()=>{hovered=true;onHover(item);},{signal:listeners.signal});
      button.addEventListener('blur',()=>{hovered=false;onHover(null);wake();},{signal:listeners.signal});
      button.addEventListener('click',event=>{
        if(performance.now()<skipUntil){event.preventDefault();return;}
        onSelect(item,button);
      },{signal:listeners.signal});
      stage.appendChild(button);return button;
    });
    function draw(){
      vertices.forEach((point,i)=>{
        const p=project(point,{width,height,yaw,pitch,radius:cluster?Math.min(width*radiusRatio,height*radiusRatio):undefined}),el=buttons[i];
        el.style.transform='translate(-50%, -50%) translate('+p.x.toFixed(2)+'px,'+p.y.toFixed(2)+'px) scale('+p.scale.toFixed(4)+')';
        el.style.opacity=(.67+(p.depth+1)*.165).toFixed(3);
        el.style.zIndex=String(10+Math.round((p.depth+1)*100));
        el.dataset.depth=p.depth.toFixed(4);
      });
      stage.dataset.yaw=yaw.toFixed(5);stage.dataset.pitch=pitch.toFixed(5);
    }
    function resize(){
      width=stage.clientWidth;height=stage.clientHeight;
      stage.style.setProperty('--tile-height',(cluster?Math.min(height*tileRatio,width*tileRatio):Math.min(height*.105,width*.09))+'px');draw();
    }
    function tick(time){
      frame=0;if(disposed||!active||document.hidden)return;
      const dt=Math.min((time-(lastTime||time))/1000,.04);lastTime=time;
      if(!drag){
        if(!media.matches){
          const decay=Math.pow(.035,dt);vx*=decay;vy*=decay;
          yaw+=(vx+((continuous||!hovered)?spin:0))*dt;pitch+=vy*dt;draw();
        }
      }
      if(!media.matches)frame=requestAnimationFrame(tick);
    }
    function wake(){if(!frame&&active&&!disposed&&!document.hidden){lastTime=0;frame=requestAnimationFrame(tick);}}
    function clearDrag(cancelled){
      if(!drag)return;
      if(drag.moved)skipUntil=performance.now()+350;
      // A held, stationary pointer is a stop, not a late throw.
      if(!cancelled){const idle=performance.now()-drag.time;const decay=idle>160?0:Math.exp(-idle/100);vx*=decay;vy*=decay;}
      if(cancelled){vx=0;vy=0;}
      const id=drag.id;drag=null;stage.classList.remove('is-dragging');
      if(stage.hasPointerCapture(id))stage.releasePointerCapture(id);
      wake();
    }
    stage.addEventListener('pointerdown',e=>{
      if(!active||(e.pointerType==='mouse'&&e.button!==0))return;
      drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,time:performance.now(),moved:false};
      vx=vy=0;
    },{signal:listeners.signal});
    stage.addEventListener('click',event=>{
      if(event.target===stage&&performance.now()>=skipUntil)onBackground();
    },{signal:listeners.signal});
    window.addEventListener('pointermove',e=>{
      if(!drag||e.pointerId!==drag.id)return;
      if(!drag.moved&&!dragged(e.clientX-drag.x,e.clientY-drag.y))return;
      if(!drag.moved){drag.moved=true;stage.setPointerCapture(e.pointerId);stage.classList.add('is-dragging');onHover(null);}
      const now=performance.now(),dt=Math.max(now-drag.time,12)/1000;
      const dx=e.clientX-drag.lastX,dy=e.clientY-drag.lastY;
      yaw+=dx*.005;pitch+=dy*.0045;
      vx=Math.max(-3,Math.min(3,dx*.005/dt));vy=Math.max(-2,Math.min(2,dy*.0045/dt));
      drag.lastX=e.clientX;drag.lastY=e.clientY;drag.time=now;draw();
    },{signal:listeners.signal});
    window.addEventListener('pointerup',e=>{if(drag&&drag.id===e.pointerId)clearDrag(false);},{signal:listeners.signal});
    window.addEventListener('pointercancel',()=>clearDrag(true),{signal:listeners.signal});
    window.addEventListener('blur',()=>clearDrag(true),{signal:listeners.signal});
    stage.addEventListener('keydown',e=>{
      const steps={ArrowLeft:[-.24,0],ArrowRight:[.24,0],ArrowUp:[0,-.20],ArrowDown:[0,.20]};
      if(steps[e.key]){e.preventDefault();vx=vy=0;yaw+=steps[e.key][0];pitch+=steps[e.key][1];draw();}
      if((e.key==='Enter'||e.key===' ')&&e.target===stage){e.preventDefault();
        const front=buttons.reduce((a,b)=>Number(a.dataset.depth)>Number(b.dataset.depth)?a:b);front.click();}
    },{signal:listeners.signal});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;clearDrag(true);}else wake();},{signal:listeners.signal});
    media.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;vx=vy=0;wake();},{signal:listeners.signal});
    const observer=new ResizeObserver(resize);observer.observe(stage);resize();wake();
    return {
      pause(){active=false;cancelAnimationFrame(frame);frame=0;vx=vy=0;clearDrag(true);},
      resume(){active=true;hovered=false;resize();wake();},
      stop(){vx=vy=0;hovered=true;},
      setTabbable(value){buttons.forEach(button=>{button.tabIndex=value?0:-1;});},
      draw,
      destroy(){disposed=true;cancelAnimationFrame(frame);listeners.abort();observer.disconnect();buttons.forEach(b=>b.remove());},
      snapshot(){return {yaw,pitch};}
    };
  }
  root.GNScene={math:{points,project,dragged},create};
})(globalThis);
