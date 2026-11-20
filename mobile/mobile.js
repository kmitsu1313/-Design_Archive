/* Mobile adaptation of the supplied Design Archive. Original files remain in /original. */
(() => {
  'use strict';
  const books = window.ARCHIVE_BOOKS;
  const main = document.querySelector('#main');
  const nav = document.querySelector('.bottom-nav');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const storageKey = 'drc-mobile-reading-desk-v1';
  const icons = {
    home:'<path d="M3 10 12 3l9 7v11h-6v-7H9v7H3z"/>',
    library:'<path d="M4 4h4v16H4zM10 4h4v16h-4zM16 5l4-1 3 15-4 1z"/>',
    desk:'<path d="M3 5h7l2 2 2-2h7v15h-7l-2 2-2-2H3zM12 7v15"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
    chevron:'<path d="m9 5 7 7-7 7"/>',
    back:'<path d="m15 5-7 7 7 7"/>',
    plus:'<path d="M12 4v16M4 12h16"/>',
    check:'<path d="m5 12 5 5L20 7"/>'
  };
  const svg = (name, cls='') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const number = i => String(i).padStart(2,'0');
  let saved = [];
  try { const data = JSON.parse(localStorage.getItem(storageKey) || '[]'); if(Array.isArray(data)) saved = [...new Set(data.filter(id => books.some(b => b.id === id)))]; } catch {}
  let selected = 0, query = '', category = '全部', sort = 'collection';
  let route = '', returnRoute = 'home', scrollPositions = new Map(), shelfListener, shelfResize, introObserver;
  let toastTimer, shelfEvents;
  let spineEntry='';
  window.addEventListener('archive:spine-open',event=>{spineEntry=event.detail?.id||'';});
  const categories = ['全部','工业设计','视觉文化','设计研究'];
  const theme = b => ['informing','flowers','nation'].includes(b.id) ? '视觉文化' : ['science','research','museum','wendao','concept'].includes(b.id) ? '设计研究' : '工业设计';
  const footer = () => '<footer class="archive-footer">ECNU & CDDC<br>DESIGN DOCUMENTATION RESEARCH CENTER / 2026</footer>';

  function bookTheme(b) {
    document.body.classList.toggle('book-color-mode',!!b);
    document.documentElement.classList.toggle('book-color-root',!!b);
    if(!b){document.body.removeAttribute('data-dark-book');document.documentElement.style.removeProperty('--book-paper');return;}
    const rgb=hex=>{const s=hex.replace('#','');const h=s.length===3?s.split('').map(c=>c+c).join(''):s;return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));};
    const ink=rgb(b.ink),paper=rgb(b.bg),dark=paper[0]*.299+paper[1]*.587+paper[2]*.114<140;
    document.documentElement.style.setProperty('--book-paper',b.bg);
    document.body.style.setProperty('--book-ink',b.ink);
    document.body.style.setProperty('--book-muted',`rgba(${ink.join(',')},.68)`);
    document.body.style.setProperty('--book-rule',`rgba(${ink.join(',')},.18)`);
    document.body.style.setProperty('--book-soft',dark?'rgba(255,255,255,.06)':'rgba(0,0,0,.035)');
    document.body.dataset.darkBook=String(dark);
  }

  function volume(b) {
    return `<span class="volume rendered-volume" style="--ratio:${b.width*(1-b.split)/b.height+.12}"><canvas data-book-id="${b.id}" data-angle=".12" data-tilt=".025" role="img" aria-label="${esc(b.title)}，立体精装书"></canvas></span>`;
  }
  function card(b) {
    return `<a class="book-card" href="#detail/${b.id}"><div class="card-art">${volume(b)}</div><h3>${esc(b.title)}</h3><p>${esc(b.year)} · ${esc(b.author)}</p></a>`;
  }
  function navigation() {
    const active = route.startsWith('detail/') ? returnRoute : route;
    nav.innerHTML = [['home','home','首页'],['library','library','书库'],['desk','desk','阅览台']].map(([id,icon,label]) => `<a href="#${id}" class="${active===id?'active':''}" ${active===id?'aria-current="page"':''}>${svg(icon)}<span>${label}</span>${id==='desk'&&saved.length?`<span class="desk-count">${saved.length}</span>`:''}</a>`).join('');
  }
  function home() {
    return `<div class="home-heading"><h1>文献资料库 <span>DESIGN ARCHIVE</span></h1><span class="tiny">${number(books.length)} 本馆藏</span></div>
      <section class="home-shelf" aria-label="馆藏书架"><div class="shelf-scene"><div class="shelf-rail" aria-hidden="true"></div><div class="shelf-window" aria-label="左右滑动选书" tabindex="0">${Array.from({length:3},(_,cycle)=>books.map((b,i) => `<div class="shelf-slide" data-slide="${cycle*books.length+i}" data-index="${i}" ${cycle!==1?'aria-hidden="true"':''} style="--book-scale:${b.id==='concept'?.94:b.id==='museum'?.84:1}"><a href="#detail/${b.id}" tabindex="${cycle===1?'0':'-1'}" aria-label="查看 ${esc(b.title)}">${volume(b)}</a></div>`).join('')).join('')}</div></div>
      <div id="shelf-caption" class="shelf-caption" aria-live="polite"></div>
      <div class="shelf-pagination"><button data-action="previous" aria-label="上一本">${svg('back','chev')}</button><div class="shelf-dots" aria-hidden="true"></div><button data-action="next" aria-label="下一本">${svg('chevron','chev')}</button></div></section>
      ${introduction()}${footer()}`;
  }
  function introduction() {
    const ids=['hongqi','wendao','concept','industry','shanghai','museum','informing','science','research','nation'];
    const heights=[77,86,64,78,96,72,88,100,80,84];
    const tilts=[2,2,0,0,0,0,0,0,-6,-5];
    const rows=[['机构','华东师范大学设计学院<br>中国近现代设计文献研究中心'],['研究视野','以设计文献为线索，连接器物、图像与社会生活，理解中国近现代设计的历史经验。'],['文献与实践','从工业产品、广告与宣传画到造型手稿，让出版、研究与展示形成持续的对话。'],['数字阅览','以数字化整理和多模态交互，为文献建立新的阅读入口，在材料之间发现关联。']];
    return `<section class="research-center" aria-labelledby="center-title"><div class="center-introduction"><header class="center-heading"><h2 id="center-title">关于研究中心</h2><span>INTRODUCTION</span></header><dl class="center-rows">${rows.map(([label,copy])=>`<div class="intro-row" data-intro-reveal><dt>${label}</dt><dd>${copy}</dd></div>`).join('')}</dl></div><div class="spine-scene"><div class="spine-group" aria-label="轻触书脊，打开图书">${ids.map((id,i)=>{
      const b=books.find(b=>b.id===id),w=b.width*b.split;
      return `<a href="#detail/${id}" class="spine-book" data-book-id="${id}" style="--spine-height:${heights[i]}%;--spine-ratio:${w/b.height};--lean:${tilts[i]}deg" aria-label="翻开 ${esc(b.title)}"><span class="spine-texture"><svg viewBox="0 0 ${w} ${b.height}" preserveAspectRatio="none" aria-hidden="true"><image href="../library/assets/books/book-${b.cover}.png" width="${b.width}" height="${b.height}"/></svg></span></a>`;
    }).join('')}</div><p class="spine-hint"><span aria-hidden="true">＋</span>轻触书脊，翻开一本书</p></div></section>`;
  }
  function bindIntroduction() {
    const center=main.querySelector('.research-center');if(!center)return;
    const rows=[...center.querySelectorAll('[data-intro-reveal]')];
    if(!reduced&&'IntersectionObserver' in window){
      rows.forEach(row=>row.classList.add('will-reveal'));
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        entry.target.classList.add('is-revealed');observer.unobserve(entry.target);
      }),{threshold:.12,rootMargin:'0px 0px -96px 0px'});
      introObserver=observer;rows.forEach(row=>observer.observe(row));
    }
    window.ArchiveSpines?.bind(center);
  }
  function updateShelf() {
    const b = books[selected];
    document.querySelector('#shelf-caption').innerHTML = `<div><span class="eyebrow">${number(selected+1)} / ${number(books.length)} · ${esc(b.year)}</span><h2>${esc(b.title)}</h2><p>${esc(b.subtitle)}</p></div><a class="open-book" href="#detail/${b.id}" aria-label="打开 ${esc(b.title)}">OPEN</a>`;
    document.querySelector('.shelf-dots').innerHTML = books.map((_,i)=>`<i class="${i===selected?'active':''}"></i>`).join('');
    document.querySelectorAll('.shelf-slide').forEach(slide=>slide.classList.toggle('chosen',Number(slide.dataset.index)===selected));
  }
  function bindShelf() {
    const shelf = document.querySelector('.shelf-window');
    const slides=[...shelf.querySelectorAll('.shelf-slide')];
    const center = i => {
      const slide=slides[i];
      return slide.offsetLeft + slide.offsetWidth/2 - shelf.clientWidth/2;
    };
    const nearest = () => {
      const middle=shelf.scrollLeft+shelf.clientWidth/2;
      let closest=0,distance=Infinity;
      slides.forEach((slide,i)=>{const d=Math.abs(slide.offsetLeft+slide.offsetWidth/2-middle);if(d<distance){closest=i;distance=d;}});
      return closest;
    };
    const jump = index => {
      shelf.style.scrollSnapType='none';shelf.scrollLeft=center(index);
      shelf.style.scrollSnapType='';
    };
    jump(books.length+selected);updateShelf();
    let pending,settleTimer,mouseDown=false;
    shelfListener = n => {
      let physical=nearest()+n;
      if(physical<0||physical>=slides.length){jump(books.length+selected);physical=books.length+selected+n;}
      selected=(physical+books.length)%books.length;
      shelf.scrollTo({left:center(physical),behavior:reduced?'instant':'smooth'});updateShelf();
    };
    const settle = () => {
      if(!shelf.isConnected||mouseDown)return;
      const physical=nearest();selected=physical%books.length;
      if(physical<books.length||physical>=2*books.length)jump(books.length+selected);
      updateShelf();
    };
    shelf.addEventListener('scroll',()=>{
      cancelAnimationFrame(pending);
      pending=requestAnimationFrame(()=>{
        const logical=nearest()%books.length;
        if(selected!==logical){selected=logical;updateShelf();}
      });
      clearTimeout(settleTimer);settleTimer=setTimeout(settle,160);
    },{passive:true});
    shelf.addEventListener('scrollend',settle);
    shelf.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();shelfListener(event.key==='ArrowRight'?1:-1);}if(event.key==='Enter'&&event.target===shelf){location.hash='detail/'+books[selected].id;}});
    // Touch uses native momentum scrolling; mouse dragging also works in the desktop preview.
    shelfEvents = new AbortController();
    const pointerOptions = {signal:shelfEvents.signal};
    let mouseStart=0,mouseScroll=0,dragged=false;
    shelf.addEventListener('dragstart',event=>event.preventDefault());
    shelf.addEventListener('pointerdown',event=>{
      if(event.pointerType!=='mouse'||event.button!==0)return;
      mouseStart=event.clientX;mouseScroll=shelf.scrollLeft;mouseDown=true;dragged=false;

    });
    window.addEventListener('pointermove',event=>{
      if(!mouseDown||event.pointerType!=='mouse')return;
      const dx=event.clientX-mouseStart;
      if(Math.abs(dx)>5&&!dragged){dragged=true;shelf.style.scrollSnapType='none';}
      if(dragged){event.preventDefault();shelf.scrollLeft=mouseScroll-dx;}
    },pointerOptions);
    const stopDrag=event=>{
      if(!mouseDown)return;mouseDown=false;
      if(!dragged)return;

      const closest=nearest();selected=closest%books.length;
      shelf.style.scrollSnapType='';shelf.scrollTo({left:center(closest),behavior:reduced?'instant':'smooth'});updateShelf();
    };
    window.addEventListener('pointerup',stopDrag,pointerOptions);
    window.addEventListener('pointercancel',stopDrag,pointerOptions);
    window.addEventListener('blur',stopDrag,pointerOptions);
    shelf.addEventListener('click',event=>{if(dragged){event.preventDefault();event.stopPropagation();dragged=false;}},true);
    shelfResize?.disconnect();
    shelfResize=new ResizeObserver(()=>{if(shelf.isConnected)jump(books.length+selected);});
    shelfResize.observe(shelf);
  }
  function filteredBooks() {
    const q=query.trim().toLocaleLowerCase();
    let list=books.filter(b => (category==='全部'||theme(b)===category) && `${b.title} ${b.en} ${b.author} ${b.year} ${b.topic} ${b.subtitle}`.toLocaleLowerCase().includes(q));
    if(sort==='newest') list.sort((a,b)=>(parseInt(b.year)||0)-(parseInt(a.year)||0));
    if(sort==='oldest') list.sort((a,b)=>(parseInt(a.year)||0)-(parseInt(b.year)||0));
    return list;
  }
  function library() {
    return `<div class="page-heading"><p class="eyebrow">THE COLLECTION</p><div class="heading-line"><h1>书库</h1><span class="tiny">${number(books.length)} VOLUMES</span></div></div>
      <form class="search-form" role="search">${svg('search')}<input type="search" name="q" value="${esc(query)}" placeholder="书名、作者、年份" aria-label="检索书名、作者、年份" autocomplete="off"><button type="button" data-action="clear" aria-label="清除搜索" ${!query?'hidden':''}>清除</button></form>
      <div class="filter-scroll" role="group" aria-label="文献主题">${categories.map(c=>`<button class="chip" data-category="${c}" aria-pressed="${category===c}">${c}</button>`).join('')}</div>
      <div class="catalog-toolbar"><p id="result-count" role="status"></p><label class="sort"><select aria-label="图书排序"><option value="collection" ${sort==='collection'?'selected':''}>馆藏顺序</option><option value="newest" ${sort==='newest'?'selected':''}>出版时间 · 近到远</option><option value="oldest" ${sort==='oldest'?'selected':''}>出版时间 · 远到近</option></select></label></div>
      <div id="catalog-results"></div>${footer()}`;
  }
  function updateResults() {
    const list=filteredBooks();
    document.querySelector('#result-count').textContent=`${list.length} 本${query?' · 检索结果':''}`;
    document.querySelector('#catalog-results').innerHTML=list.length?`<div class="book-grid catalog-grid">${list.map(card).join('')}</div>`:`<div class="empty">${svg('search')}<h2>没有找到相关图书。</h2><p>试试其他书名、作者或年份，<br>也可以浏览全部馆藏。</p><button class="button outline" data-action="reset-filters">重置检索</button></div>`;
    document.querySelector('[data-action="clear"]').hidden=!query;
    window.ArchiveBookRenderer.observe(main);
  }
  function detail(b,fromSpine=false) {
    const d=b.details, meta=d.meta||{};
    const intro=d.intro?.length?d.intro:[b.description];
    const paragraphs=lines=>lines.map(p=>`<p>${esc(p)}</p>`).join('');
    const metaRows=[['作者',meta['作者']||b.author],['出版年份',meta['出版年']||b.year],['出版机构',meta['出版社']||b.publisher],['ISBN',meta.ISBN],['装帧',meta['装帧']],['页数',meta['页数']],['定价',meta['定价']]].filter(([,v])=>v);
    const isSaved=saved.includes(b.id);
    return `<div style="--book-paper:${b.bg};--book-ink:${b.ink}"><div class="detail-top" style="color:var(--book-ink)"><a class="back-link" href="#${returnRoute}">${svg('back')}返回${returnRoute==='desk'?'阅览台':returnRoute==='library'?'书库':'书架'}</a><span class="eyebrow" style="color:inherit;opacity:.8">${number(books.indexOf(b)+1)} / DESIGN LITERATURE</span></div>${fromSpine?'':`<div class="detail-stage">${volume(b)}</div>`}</div>
      <div class="detail-title ${fromSpine?'spine-intro':''}">${fromSpine?`<div class="detail-entry-cover" style="--entry-ratio:${b.width*(1-b.split)/b.height+.12}">${volume(b)}</div>`:''}<div class="detail-entry-copy"><p class="eyebrow">${esc(theme(b))} / DESIGN ARCHIVE</p><h1>${esc(b.title)}</h1><p class="author">${esc(meta['作者']||b.author)}</p><p class="subtitle">${esc(b.subtitle)}</p></div><div class="detail-actions"><button class="button ${isSaved?'outline':''}" data-action="save" data-id="${b.id}" aria-pressed="${isSaved}">${svg(isSaved?'check':'plus')}<span>${isSaved?'已加入阅览台':'加入阅览台'}</span></button><a class="button outline" href="#desk">查看阅览台</a></div></div>
      <dl class="meta">${metaRows.map(([label,value])=>`<dt>${esc(label)}</dt><dd>${esc(value)}</dd>`).join('')}</dl>
      <section class="detail-section"><h2><span class="eyebrow">INTRODUCTION</span>内容简介</h2><div class="prose prose-preview" id="book-intro">${paragraphs(intro)}</div><button class="expand" data-action="expand-intro" aria-expanded="false" aria-controls="book-intro"><span>展开全文</span><span aria-hidden="true">＋</span></button></section>
      <section class="detail-section">${d.bio?.length?`<details><summary>作者介绍</summary><div class="prose">${paragraphs(d.bio)}</div></details>`:''}${d.contents?.length?`<details><summary>目录 <span class="tiny">${d.contents.length} 项</span></summary><div class="prose contents">${paragraphs(d.contents)}</div></details>`:''}${d.excerpts?.length?`<details><summary>原文摘录</summary><div class="prose">${d.excerpts.map(p=>`<blockquote class="quote">${esc(p)}</blockquote>`).join('')}</div></details>`:''}${d.reviews?.length?`<details><summary>书本简评与书评</summary><div class="prose">${d.reviews.map(p=>`<blockquote class="quote">${esc(p)}</blockquote>`).join('')}</div></details>`:''}</section>
      <section class="section"><div class="section-head"><h2>关联阅读</h2><a href="#library" class="text-link">全部图书 ${svg('chevron')}</a></div><div class="book-grid">${books.filter(x=>x.id!==b.id).sort((x,y)=>(theme(y)===theme(b))-(theme(x)===theme(b))).slice(0,2).map(card).join('')}</div></section>${footer()}`;
  }
  function desk() {
    const list=saved.map(id=>books.find(b=>b.id===id)).filter(Boolean);
    return `<div class="page-heading"><p class="eyebrow">YOUR READING DESK</p><div class="heading-line"><h1>阅览台</h1><span class="tiny">${number(list.length)} 本已保存</span></div><p class="desk-intro">把感兴趣的图书留在这里，<br>继续你的阅读。</p></div>${list.length?`<div class="desk-list">${list.map(b=>`<article class="desk-item"><a href="#detail/${b.id}" class="card-art" aria-label="打开 ${esc(b.title)}">${volume(b)}</a><div class="desk-info"><a href="#detail/${b.id}"><h2>${esc(b.title)}</h2></a><p>${esc(b.year)} · ${esc(b.author)}</p><a class="text-link" href="#detail/${b.id}">继续阅读 ${svg('chevron')}</a><button class="remove" data-action="remove" data-id="${b.id}" aria-label="移除 ${esc(b.title)}">移除</button></div></article>`).join('')}</div><p class="section-note">保存记录保留在当前浏览器。</p>`:`<div class="empty">${svg('desk')}<h2>留一本，下次读。</h2><p>在图书详情页点击「加入阅览台」，<br>就能在这里找到它。</p><a class="button" href="#library">浏览书库</a></div>`}${footer()}`;
  }
  function render(restore=false) {
    const requested=location.hash.slice(1)||'home';
    const showAbout=requested==='about';
    const previous=route;
    if(['home','library','desk'].includes(previous)&&requested.startsWith('detail/')) returnRoute=previous;
    route=showAbout?'home':requested;
    if(!['home','library','desk'].includes(route)&&!books.some(b=>route===`detail/${b.id}`)) route='home';
    const b=books.find(b=>route===`detail/${b.id}`);
    const enterIntroduction=!!b&&spineEntry===b.id;
    spineEntry='';
    shelfEvents?.abort();
    introObserver?.disconnect();
    window.ArchiveSpines?.cleanup();
    bookTheme(b);
    main.innerHTML=route==='home'?home():route==='library'?library():route==='desk'?desk():detail(b,enterIntroduction);
    navigation();
    document.title=b?`${b.title} / DRC`:`${({home:'首页',library:'书库',desk:'阅览台'})[route]} / 设计文献研究中心`;
    if(route==='home'){bindShelf();bindIntroduction();}
    window.ArchiveBookRenderer.observe(main);
    if(b&&!enterIntroduction) {
      const stage=main.querySelector('.detail-stage'), canvas=stage.querySelector('canvas');
      canvas.dataset.angle='-.43';canvas.dataset.tilt='.06';
      window.ArchiveBookRenderer.draw(canvas,b);
      let startX=0,startY=0,angle=-.43,dragging=false;
      stage.addEventListener('pointerdown',event=>{startX=event.clientX;startY=event.clientY;dragging=true;});
      stage.addEventListener('pointermove',event=>{
        if(!dragging||Math.abs(event.clientY-startY)>Math.abs(event.clientX-startX))return;
        const next=Math.max(-1,Math.min(.8,angle+(event.clientX-startX)*.006));
        canvas.dataset.angle=String(next);window.ArchiveBookRenderer.draw(canvas,b);
      });
      const end=event=>{if(dragging){angle=Math.max(-1,Math.min(.8,angle+(event.clientX-startX)*.006));dragging=false;}};
      stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',()=>{dragging=false;});stage.addEventListener('pointerleave',()=>{dragging=false;});
      stage.setAttribute('aria-label','立体图书，可左右拖动查看');
    }
    if(route==='library') {
      updateResults();
      const input=main.querySelector('input');
      input.addEventListener('input',()=>{query=input.value;updateResults();});
      main.querySelector('form').addEventListener('submit',e=>{e.preventDefault();input.blur();});
      main.querySelector('select').addEventListener('change',e=>{sort=e.target.value;updateResults();});
    }
    if(!restore) window.scrollTo(0,route.startsWith('detail/')&&previous!=='desk'?0:(scrollPositions.get(route)||0));
    if(enterIntroduction) window.scrollTo(0,0);
    if(showAbout&&!restore) main.querySelector('.research-center')?.scrollIntoView({block:'start'});
    if(previous&&previous!==route) main.focus({preventScroll:true});
    if(enterIntroduction) window.dispatchEvent(new CustomEvent('archive:detail-ready',{detail:{id:b.id}}));
  }
  function toast(message) {
    const el=document.querySelector('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2400);
  }
  function persist(message) {
    try { localStorage.setItem(storageKey,JSON.stringify(saved)); }
    catch { toast('当前浏览器无法保存，修改仅在本次浏览生效。'); return; }
    toast(message);
  }
  document.addEventListener('click',event=>{
    if(event.target.closest('.skip')){event.preventDefault();main.focus();main.scrollIntoView({block:'start'});return;}
    const anchor=event.target.closest('a[href^="#"]');
    if(anchor) scrollPositions.set(route,scrollY);
    const filter=event.target.closest('[data-category]');
    if(filter){category=filter.dataset.category;document.querySelectorAll('[data-category]').forEach(c=>c.setAttribute('aria-pressed',String(c===filter)));updateResults();return;}
    const button=event.target.closest('[data-action]');if(!button)return;
    const action=button.dataset.action;
    if(action==='previous'||action==='next') shelfListener?.(action==='next'?1:-1);
    if(action==='search') {
      scrollPositions.set(route,scrollY);
      if(route!=='library') location.hash='library';
      requestAnimationFrame(()=>{const input=document.querySelector('input[type="search"]');input?.focus();input?.scrollIntoView({block:'nearest'});});
    }
    if(action==='clear'||action==='reset-filters') {
      query='';if(action==='reset-filters')category='全部';
      document.querySelector('input').value='';
      document.querySelectorAll('[data-category]').forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.category===category)));
      updateResults();document.querySelector('input').focus();
    }
    if(action==='expand-intro') {
      const expanded=button.getAttribute('aria-expanded')!=='true';
      button.setAttribute('aria-expanded',String(expanded));document.querySelector('#book-intro').classList.toggle('prose-preview',!expanded);
      button.innerHTML=`<span>${expanded?'收起全文':'展开全文'}</span><span aria-hidden="true">${expanded?'−':'＋'}</span>`;
    }
    if(action==='save') {
      const id=button.dataset.id;
      if(!saved.includes(id)){saved.push(id);navigation();button.setAttribute('aria-pressed','true');button.classList.add('outline');button.innerHTML=`${svg('check')}<span>已加入阅览台</span>`;persist('已加入阅览台');}else{toast('这本书已在阅览台');}
    }
    if(action==='remove') {
      saved=saved.filter(id=>id!==button.dataset.id);const y=scrollY;render(true);window.scrollTo(0,y);persist('已从阅览台移除');
    }
  });
  window.addEventListener('hashchange',()=>render());
  window.addEventListener('scroll',()=>scrollPositions.set(route,scrollY),{passive:true});
  history.scrollRestoration='manual';
  render();
})();
