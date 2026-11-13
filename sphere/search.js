/* Search results pair the selected cover with the spines of the books behind it. */
(function(root){
  'use strict';
  const themes={automotive:{name:'汽车设计',short:'汽车'},livelihood:{name:'民生设计',short:'民生'},product:{name:'产品设计',short:'产品'},visual:{name:'视觉与出版',short:'视觉'},history:{name:'设计史料',short:'史料'}};
  const formats={deep:'深入专题',intro:'图书简介',cover:'书影'};
  const themeByCover=['history','history','visual','visual','automotive','history','product','product','history','history','livelihood','product','history','history','product','visual','visual','history'];
  const shades=['#cecece','#d9d9d9','#c7c7c7','#e5e5e5','#d4d4d4','#dedede'];
  const spineColors=[
    ['#315966'],['#e3dfd7','#302c27'],['#a65870'],['#a9552b'],['#8c302e'],['#a6362a'],
    ['#386952'],['#825b41'],['#715436'],['#62636c'],['#783c42'],['#deba64','#392b20'],
    ['#625a45'],['#d4c6a9','#302b24'],['#e2d8c5','#302b24'],['#566d76'],['#76583e'],['#394d76']
  ];
  // Keep the original IDs of the two专题 so their detail links still work.
  const coverOrder=[4,10,...BookCoverData.map((_,index)=>index).filter(index=>index!==4&&index!==10)];
  const books=coverOrder.map((coverIndex,index)=>{
    const cover=BookCoverData[coverIndex];
    const theme=themeByCover[coverIndex];
    const hasCase=index<2;
    const aliases=['红旗 汽车 轿车 年代 车型 时间线 CA770','共和国 民生 收音机 玻璃杯 按钮 产品 生活'];
    const {authors,publisher,paragraphs=[]}=cover.overview||{};
    const [spineColor,spineInk='#fff']=spineColors[coverIndex];
    return {
      ...cover,
      id:String(index+1).padStart(2,'0'),
      collectionId:'books',
      theme,
      format:hasCase?'deep':cover.overview?'intro':'cover',
      keywords:[aliases[index],authors,publisher,...paragraphs].filter(Boolean).join(' '),
      category:themes[theme].name,
      shade:shades[index%shades.length],
      spineColor,
      spineInk,
      hasCase
    };
  });
  const byId=id=>books.find(book=>book.id===id);
  function create(page,{onChange,onOpen}){
    const $=s=>page.querySelector(s),query=$('#bookQuery'),theme=$('#searchTheme'),format=$('#searchFormat');
    const results=$('#searchResults'),front=$('#searchFront'),layers=$('#stackLayers'),stack=$('.cover-stack');
    const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
    let hoverTimer,layerMotion;
    let state={q:'',theme:'',format:''},key=null,matches=[],selected=null;
    function readState(value){
      const params=new URLSearchParams(value);
      return {q:params.get('q')||'',theme:themes[params.get('theme')]?params.get('theme'):'',format:formats[params.get('format')]?params.get('format'):''};
    }
    function serialize(value){
      const params=new URLSearchParams();
      if(value.q)params.set('q',value.q);if(value.theme)params.set('theme',value.theme);if(value.format)params.set('format',value.format);
      return params.toString();
    }
    function emit(replace){onChange(serialize({q:query.value,theme:theme.value,format:format.value}),replace);}
    function showCover(button,book){
      button.querySelector('.search-cover-art')?.remove();
      button.classList.toggle('has-image',!!book);
      stack.style.removeProperty('--visible-cover-ratio');
      if(!book)return;
      const image=document.createElement('img');
      image.className='search-cover-art';
      image.src=book.image;
      image.alt='';
      image.draggable=false;
      image.style.clipPath=book.imageClip||'';
      const clipRatio=fitBookCover(image,book.imageClip);
      const alignSpines=()=>{
        if(image.parentElement!==button||!image.naturalHeight)return;
        const coverRatio=image.naturalWidth/image.naturalHeight*clipRatio;
        stack.style.setProperty('--visible-cover-ratio',String(coverRatio));
      };
      button.prepend(image);
      if(image.complete)alignSpines();
      else image.addEventListener('load',alignSpines,{once:true});
      return image;
    }
    function select(id,refresh=false){
      clearTimeout(hoverTimer);
      const next=matches.find(book=>book.id===id)||null;
      if(!refresh&&selected===next)return;
      const animate=!!selected&&!!next&&selected!==next&&!reducedMotion.matches;
      selected=next;
      results.querySelectorAll('.search-row').forEach(row=>{
        const active=!!selected&&row.dataset.book===selected.id;row.classList.toggle('is-selected',active);
        if(active)row.setAttribute('aria-current','true');else row.removeAttribute('aria-current');
      });
      layerMotion?.cancel();
      layers.replaceChildren();
      $('.search-preview').classList.toggle('is-empty',!selected);
      const index=selected?matches.indexOf(selected):-1;
      front.disabled=!selected;$('#searchDetails').disabled=!selected;
      $('#searchPrevious').disabled=index<=0;$('#searchNext').disabled=index<0||index===matches.length-1;
      $('#searchPosition').textContent=index<0?'00 / 00':String(index+1).padStart(2,'0')+' / '+String(matches.length).padStart(2,'0');
      const cover=showCover(front,selected);
      front.querySelector('span').hidden=!!selected;
      if(!selected){
        delete front.dataset.book;front.style.setProperty('--shade','#e5e5e5');front.querySelector('span').textContent='暂无封面';
        $('#searchPreviewTitle').textContent='暂无匹配图书';$('#searchPreviewTags').textContent='清除或调整右侧检索条件';return;
      }
      front.dataset.book=selected.id;front.style.setProperty('--shade',selected.shade);
      front.setAttribute('aria-label','查看《'+selected.title+'》详情');
      $('#searchPreviewTitle').textContent=selected.title;
      $('#searchPreviewTags').textContent=[selected.category,formats[selected.format],selected.overview?.authors].filter(Boolean).join(' / ');
      matches.slice(index+1,index+6).forEach((book,i)=>{
        const button=document.createElement('button');button.type='button';button.className='stack-layer';button.tabIndex=-1;
        button.style.setProperty('--layer',i);
        button.style.setProperty('--spine-color',book.spineColor);
        button.style.setProperty('--spine-ink',book.spineInk);
        button.setAttribute('aria-label','预览《'+book.title+'》');button.title=book.title;
        const title=document.createElement('span');title.className='spine-title';
        title.textContent=book.title.split(/[:：]/,1)[0];
        button.appendChild(title);
        button.addEventListener('click',()=>{select(book.id);front.focus({preventScroll:true});});layers.appendChild(button);
      });
      if(animate){
        const timing={duration:240,easing:'cubic-bezier(.22,.61,.36,1)'};
        cover.animate([{opacity:.5,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],timing);
        layerMotion=layers.animate([{opacity:.55,transform:'translateX(6px)'},{opacity:1,transform:'translateX(0)'}],timing);
      }
    }
    function open(button){if(selected)onOpen(selected,button);}
    function renderList(){
      const tokens=state.q.normalize('NFKC').trim().toLowerCase().split(/\s+/).filter(Boolean);
      const filtered=books.filter(book=>(!state.theme||book.theme===state.theme)&&(!state.format||book.format===state.format)&&tokens.every(token=>(book.title+' '+book.keywords+' '+book.category).normalize('NFKC').toLowerCase().includes(token)));
      matches=Object.keys(themes).flatMap(t=>filtered.filter(book=>book.theme===t));
      results.replaceChildren();
      Object.keys(themes).forEach(t=>{
        const group=matches.filter(book=>book.theme===t);if(!group.length)return;
        const section=document.createElement('section');section.className='search-group';section.setAttribute('aria-label',themes[t].name);
        const heading=document.createElement('h3');heading.className='sr-only';heading.textContent=themes[t].name;section.appendChild(heading);
        group.forEach((book,i)=>{
          const row=document.createElement('button');row.type='button';row.className='search-row';row.dataset.book=book.id;
          row.setAttribute('aria-label',book.title+'，'+book.category+'，'+formats[book.format]+'，查看详情');
          const topic=document.createElement('span');topic.className='row-topic';topic.textContent=i===0?themes[t].short:'';topic.setAttribute('aria-hidden','true');
          const title=document.createElement('span');title.className='row-title';title.textContent=book.title+(book.hasCase?' *':'');
          const kind=document.createElement('span');kind.className='row-kind';kind.textContent=book.hasCase?'专题':book.overview?'简介':'书影';
          row.append(topic,title,kind);
          row.addEventListener('pointerenter',event=>{
            if(event.pointerType==='touch')return;
            clearTimeout(hoverTimer);
            hoverTimer=setTimeout(()=>select(book.id),85);
          });
          row.addEventListener('pointerleave',()=>clearTimeout(hoverTimer));
          row.addEventListener('focus',()=>select(book.id));
          row.addEventListener('click',()=>{select(book.id);open(row);});section.appendChild(row);
        });results.appendChild(section);
      });
      $('#searchCount').textContent='图书 ('+matches.length+') / 深入专题 ('+matches.filter(book=>book.hasCase).length+')';
      $('#searchEmpty').hidden=matches.length>0;
      select(selected&&matches.some(book=>book.id===selected.id)?selected.id:matches[0]?.id,true);
    }
    function restore(value){
      const next=readState(value),nextKey=serialize(next);if(nextKey===key)return false;
      state=next;key=nextKey;query.value=state.q;theme.value=state.theme;format.value=state.format;renderList();return true;
    }
    query.addEventListener('input',()=>emit(true));
    $('#searchForm').addEventListener('submit',event=>{event.preventDefault();query.value=query.value.trim();emit(false);});
    theme.addEventListener('change',()=>emit(false));format.addEventListener('change',()=>emit(false));
    page.querySelectorAll('[data-reset-search]').forEach(button=>button.addEventListener('click',()=>{query.value='';theme.value='';format.value='';emit(false);query.focus({preventScroll:true});}));
    front.addEventListener('click',()=>open(front));$('#searchDetails').addEventListener('click',event=>open(event.currentTarget));
    $('#searchPrevious').addEventListener('click',()=>{const i=matches.indexOf(selected);if(i>0)select(matches[i-1].id);});
    $('#searchNext').addEventListener('click',()=>{const i=matches.indexOf(selected);if(i>=0&&i<matches.length-1)select(matches[i+1].id);});
    results.addEventListener('keydown',event=>{
      const row=event.target.closest('.search-row');if(!row)return;
      const rows=[...results.querySelectorAll('.search-row')],i=rows.indexOf(row);let next;
      if(event.key==='ArrowDown')next=Math.min(rows.length-1,i+1);if(event.key==='ArrowUp')next=Math.max(0,i-1);
      if(event.key==='Home')next=0;if(event.key==='End')next=rows.length-1;
      if(next!==undefined){event.preventDefault();rows[next].focus();}
    });
    return {restore,suffix(){const value=serialize(state);return value?'?'+value:'';}};
  }
  root.DocSearch={create,byId};
})(globalThis);
