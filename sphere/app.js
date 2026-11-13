(function(){
  'use strict';
  const $=selector=>document.querySelector(selector);
  const pages={space:$('#spacePage'),search:$('#searchPage'),case:$('#casePage'),about:$('#aboutPage'),contact:$('#contactPage')};
  const stage=$('#resourceGallery'),viewer=$('#viewer'),viewerImage=$('#viewerImage'),viewerCover=$('#viewerCover');
  const caption=$('.bottom-caption'),cursor=$('#contextCursor');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let route=null,currentItem=null,origin=null,openedWithPush=false,closing=false;
  let pointer={x:-100,y:-100},pointerSeen=false,cursorFrame=0;
  let soundOn=false,audio=null,activeAnimation=null;
  function announce(text){$('#announcement').textContent=text;}
  function setCaption(item){
    if(!item){caption.hidden=true;return;}
    caption.querySelector('strong').textContent=item.title;
    caption.querySelector('span').textContent=item.category;caption.hidden=false;
  }
  function renderOverview(item){
    const info=item.overview,content=$('#bookOverviewContent');
    content.hidden=!info;$('#overviewPlaceholder').hidden=!!info;
    viewer.classList.toggle('has-overview-content',!!route.overview&&(item.collectionId==='books'||!!info));
    viewer.classList.toggle('has-photo-overview',!!route.overview&&item.collectionId==='images'&&!!info);
    content.replaceChildren();
    if(!info)return;
    const heading=document.createElement('h2');heading.textContent=item.title;
    content.append(heading);
    if(info.authors){
      const meta=document.createElement('p');meta.className='book-overview-meta';
      meta.textContent='作者：'+info.authors+(info.publisher?'　·　出版社：'+info.publisher:'');
      content.append(meta);
    }
    const copy=document.createElement('div');copy.className='book-overview-copy';
    info.paragraphs.forEach(text=>{const paragraph=document.createElement('p');paragraph.textContent=text;copy.appendChild(paragraph);});
    content.append(copy);
    if(info.source){
      const source=document.createElement('p');source.className='overview-source';
      source.append('资料来源：');
      if(info.source.url){
        const link=document.createElement('a');link.textContent=info.source.label;
        link.href=info.source.url;link.target='_blank';link.rel='noopener noreferrer';
        source.append(link);
      }else source.append(info.source.label);
      content.append(source);
    }
  }
  const scene=ResourceGallery.create(stage,{
    onSelect(item,button){openItem(item,button,'space');},
    onHover(item){if(route&&route.page==='space'&&!route.preview)setCaption(item);}
  });
  const search=DocSearch.create(pages.search,{
    onChange(query,replace){go('#/search'+(query?'?'+query:''),replace);},
    onOpen(item,button){openItem(item,button,'search');}
  });
  function resolveItem(id,base){return base==='space'?scene.findItem(id):base==='search'?DocSearch.byId(id):undefined;}
  function searchSuffix(base){return base==='search'?search.suffix():'';}
  function tone(frequency=400){
    if(!soundOn||!audio)return;
    try{
      const oscillator=audio.createOscillator(),gain=audio.createGain(),now=audio.currentTime;
      oscillator.type='sine';oscillator.frequency.value=frequency;
      gain.gain.setValueAtTime(.025,now);gain.gain.exponentialRampToValueAtTime(.001,now+.075);
      oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(now);oscillator.stop(now+.08);
    }catch(_){/* A silent wireframe remains fully operable. */}
  }
  $('.sound-toggle').addEventListener('click',async()=>{
    soundOn=!soundOn;
    if(soundOn){
      try{const Context=window.AudioContext||window.webkitAudioContext;if(Context){audio=audio||new Context();await audio.resume();}}
      catch(_){audio=null;}
    }
    $('.sound-toggle').setAttribute('aria-pressed',String(soundOn));
    $('.sound-toggle').setAttribute('aria-label',soundOn?'关闭声音示意':'开启声音示意');
    $('.sound-toggle').title='声音示意：'+(soundOn?'开启':'关闭');tone(520);
    announce(soundOn?'已开启合成提示音示意':'声音示意已关闭');
  });
  function parseRoute(){
    const raw=location.hash.replace(/^#\/?/,''),separator=raw.indexOf('?');
    const query=separator<0?'':raw.slice(separator+1),path=separator<0?raw:raw.slice(0,separator);
    const parts=path.split('/').filter(Boolean);
    if(parts[0]==='projects'||(parts[0]==='case'&&parts[3]==='projects')){
      history.replaceState(null,'','#/search');
      return {page:'search',query:''};
    }
    const page=['space','search','case','about','contact'].includes(parts[0])?parts[0]:'space';
    if(page==='space'&&parts[1]==='collection'){
      history.replaceState(null,'','#/space');
      return {page:'space',preview:false,query:''};
    }
    if(page==='case')return {page,id:parts[1]||'01',base:['space','search'].includes(parts[3])?parts[3]:'search',query};
    const preview=['space','search'].includes(page)&&parts[1]==='item'&&!!resolveItem(parts[2],page);
    const item=preview?resolveItem(parts[2],page):null;
    return {page,preview,id:item?item.id:null,overview:preview&&parts[3]==='overview',query};
  }
  function go(hash,replace=false){
    if(replace){history.replaceState(null,'',hash);render();}
    else if(location.hash===hash)render();
    else location.hash=hash;
  }
  function openItem(item,button,base){
    origin={id:item.id,base,button,rect:button.getBoundingClientRect()};
    openedWithPush=true;closing=false;tone(420);
    go('#/'+base+'/item/'+item.id+searchSuffix(base));
  }
  function closeViewer(){
    if(!route||!route.preview||closing)return;
    tone(280);const base=route.page;
    if(openedWithPush){closing=true;history.back();}
    else go('#/'+base+searchSuffix(base),true);
  }
  function toggleOverview(){
    if(!currentItem)return;
    const target=!route.overview;tone(target?460:360);
    go('#/'+route.page+'/item/'+currentItem.id+(target?'/overview':'')+searchSuffix(route.page),true);
  }
  function animateOpen(rect){
    if(motion.matches||!rect||rect.width<1)return;
    const target=viewerImage.getBoundingClientRect();
    const dx=(rect.x+rect.width/2)-(target.x+target.width/2),dy=(rect.y+rect.height/2)-(target.y+target.height/2);
    activeAnimation=viewerImage.animate([
      {transform:'translate('+dx+'px,'+dy+'px) scale('+rect.width/target.width+','+rect.height/target.height+')',opacity:.7},
      {transform:'translate(0,0) scale(1)',opacity:1}
    ],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'});
  }
  function render(){
    const previous=route,wasPreview=!!(previous&&previous.preview);route=parseRoute();
    document.body.classList.toggle('is-home',route.page==='space'&&!route.preview);
    if(route.page==='search'||(route.page==='case'&&route.base==='search'))search.restore(route.query);
    if(activeAnimation){activeAnimation.cancel();activeAnimation=null;}
    const active=['about','contact'].includes(route.page)?route.page:'space';
    document.querySelectorAll('[data-route]').forEach(link=>{
      const selected=link.dataset.route===active;link.classList.toggle('is-active',selected);
      if(selected)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
    });
    scene.pause();
    Object.entries(pages).forEach(([key,page])=>{page.hidden=route.page!==key||!!route.preview;});
    viewer.hidden=!route.preview;
    if(route.preview){
      currentItem=resolveItem(route.id,route.page);
      viewer.classList.toggle('is-overview',!!route.overview);
      viewer.setAttribute('aria-label',currentItem.title+' 图片预览');
      $('#viewerHeading').textContent=currentItem.title;
      viewerImage.style.setProperty('--shade',currentItem.shade);
      viewerImage.classList.toggle('has-image',!!currentItem.image);
      const isBookCover=currentItem.collectionId==='books';
      viewerImage.classList.toggle('book-cover-frame',isBookCover);
      viewerCover.style.clipPath=currentItem.imageClip||'';
      viewerCover.style.setProperty('--book-scale',currentItem.imageScale||.86);
      if(isBookCover)fitBookCover(viewerCover,currentItem.imageClip);
      viewerCover.hidden=!currentItem.image;
      viewerImage.querySelector('.media-label').hidden=!!currentItem.image;
      if(currentItem.image){
        if(viewerCover.getAttribute('src')!==currentItem.image)viewerCover.src=currentItem.image;
        viewerCover.alt=currentItem.title;
        viewerImage.style.setProperty('--image-position',currentItem.imagePosition||'50% 50%');
        viewerImage.style.setProperty('--image-fit',currentItem.imageFit||'cover');
      }else{
        viewerCover.removeAttribute('src');viewerCover.alt='';viewerImage.style.removeProperty('--image-position');viewerImage.style.removeProperty('--image-fit');
      }
      viewerImage.setAttribute('aria-label',route.overview?'收起简介':'显示简介');
      viewerImage.setAttribute('aria-expanded',String(!!route.overview));
      $('.viewer-actions').hidden=route.page==='space';
      $('#overviewToggle').textContent=route.overview?'Close Overview':'Overview';
      $('#overviewToggle').setAttribute('aria-expanded',String(!!route.overview));
      const canViewCase=currentItem.hasCase&&route.page!=='space';
      $('#viewerCaseLink').hidden=!canViewCase;
      $('#viewerCaseLink').href='#/case/'+currentItem.id+'/from/'+route.page+searchSuffix(route.page);
      viewerImage.querySelector('.media-label').textContent=currentItem.collectionLabel?currentItem.collectionLabel+' '+currentItem.number+' 占位':'图片 '+currentItem.id+' 占位';
      renderOverview(currentItem);
      if(!wasPreview||previous.id!==route.id||previous.overview!==route.overview)viewer.scrollTop=0;
      $('.viewer-description').hidden=!route.overview;setCaption(currentItem);
      if(!wasPreview||previous.id!==route.id){
        viewerImage.focus({preventScroll:true});
        if(origin&&origin.id===route.id&&origin.base===route.page)animateOpen(origin.rect);
        announce('已展开'+currentItem.title+'。'+(route.page==='space'?'再次点击图片显示简介；':'再次点击图片或 Overview 显示简介；')+(canViewCase?'View Case 查看详情；':'')+'点击空白或按 Esc 返回。');
      }else announce(route.overview?'已显示项目简介':'已收起项目简介');
    }else{
      viewer.classList.remove('has-overview-content','has-photo-overview');viewer.scrollTop=0;
      currentItem=null;openedWithPush=false;closing=false;setCaption(null);
      if(route.page==='space')scene.resume();
      if(route.page==='case'){
        const item=resolveItem(route.id,route.base)||DocSearch.byId('01');
        $('#caseTitle').textContent=item.title;$('#caseCategory').textContent=item.category;
        $('.case-hero').style.setProperty('--shade',item.shade);
        $('.case-return').href='#/'+route.base+searchSuffix(route.base);
        $('.case-return').textContent=route.base==='search'?'返回检索结果':'返回首页';
        pages.case.scrollTop=0;
      }
      const returning=wasPreview||!!(previous&&previous.page==='case');
      if(returning&&origin&&origin.base===route.page&&origin.button.isConnected){origin.button.focus({preventScroll:true});}
      else if(previous&&(wasPreview||previous.page!==route.page)){
        if(route.page==='space')scene.focusTarget();else pages[route.page].focus({preventScroll:true});
      }
    }
    document.title=(route.preview?currentItem.title:({space:'首页',search:'图书检索',case:'详情',about:'关于',contact:'联系'}[route.page]))+' — 文献研究中心';
    requestAnimationFrame(updateCursor);
  }
  function updateCursor(){
    cursorFrame=0;
    if(!pointerSeen){cursor.classList.remove('is-visible');return;}
    const hit=document.elementFromPoint(pointer.x,pointer.y);let text='';
    if(hit&&!hit.closest('.site-header,.sound-toggle')&&!stage.querySelector('.is-dragging')){
      if(route&&route.preview){
        if(hit.closest('#viewerImage'))text=route.overview?'Close Overview':'Overview';
        else if(hit.closest('.viewer-backdrop'))text='Close';
      }
    }
    cursor.textContent=text;cursor.classList.toggle('is-visible',!!text);
    cursor.style.transform='translate('+Math.min(innerWidth-120,pointer.x+24)+'px,'+Math.min(innerHeight-35,pointer.y+22)+'px)';
  }
  document.addEventListener('pointermove',event=>{
    pointer={x:event.clientX,y:event.clientY};pointerSeen=event.pointerType!=='touch';
    if(!cursorFrame)cursorFrame=requestAnimationFrame(updateCursor);
  });
  document.documentElement.addEventListener('pointerleave',()=>{pointerSeen=false;cursor.classList.remove('is-visible');});
  document.addEventListener('keydown',event=>{
    cursor.classList.remove('is-visible');
    if(event.key==='Escape'&&route&&route.preview){event.preventDefault();if(route.overview)toggleOverview();else closeViewer();}
  });
  $('.viewer-backdrop').addEventListener('click',closeViewer);
  viewerImage.addEventListener('click',toggleOverview);
  $('#overviewToggle').addEventListener('click',toggleOverview);
  $('#viewerCaseLink').addEventListener('click',()=>tone(420));
  $('.skip-link').addEventListener('click',event=>{event.preventDefault();$('#main').focus();});
  document.querySelectorAll('.site-header a').forEach(link=>link.addEventListener('click',()=>{tone(380);origin=null;}));
  window.addEventListener('hashchange',render);
  window.addEventListener('pagehide',()=>{scene.pause();if(audio)audio.suspend().catch(()=>{});});
  window.addEventListener('pageshow',()=>{
    if(route&&route.page==='space'&&!route.preview)scene.resume();
    if(soundOn&&audio&&audio.state==='suspended')audio.resume().catch(()=>{});
  });
  if(!location.hash||location.hash==='#main')history.replaceState(null,'','#/space');
  render();
})();
