// Book detail enrichment only; collection routes and cover rendering stay with the existing edition.
const detailsBeforeContent = details7;
details7 = function(book) {
  let html = detailsBeforeContent(book);
  const record = bookDetailsContent[book.id];
  const section = (title, body) => '<section class="reveal7 book-section"><span>'+title+'</span><div class="book-fold"><div class="book-fold-inner">'+body+'</div></div></section>';
  const paragraphs = lines => lines.map(line => '<p>'+esc(line)+'</p>').join('');
  const avatar = () => faceAvatarBook();
  const entries = (lines, quotes) => lines.map(line => '<div class="reader-entry">'+avatar()+(quotes?'<blockquote>':'<div>')+paragraphs([line])+(quotes?'</blockquote>':'</div>')+'</div>').join('');
  if(record) {
    let body='';
    body+=section('内容简介',paragraphs(record.intro.length?record.intro:[book.description]));
    if(record.bio.length) body+=section('作者介绍',paragraphs(record.bio));
    const contents=record.contents.length?record.contents:(book.id==='hongqi'?supplied22.hongqi.contents:[]);
    if(contents.length) body+=section('目录','<div class="book-contents">'+contents.map((line,i)=>'<p class="'+(/^(第.{1,3}[章节篇]|前言|结语|后记)/.test(line)?'chapter-heading':'')+'">'+esc(line)+'</p>').join('')+'</div>');
    if(record.reviews.length) body+=section('书本简评与书评',entries(record.reviews,false));
    if(record.excerpts.length) body+=section('原文摘录',entries(record.excerpts,true));
    html=html.replace(/<article class="detail-text7">[\s\S]*?<\/article>/,'<article class="detail-text7 book-detail-content">'+body+'</article>');
    // The bibliographic corrections apply only to this book's detail markup.
    html=html.replace(/<aside class="detail-meta7">[\s\S]*?<\/aside>/, original=>{
      let aside=original;
      const meta=record.meta;
      if(meta['作者']) aside=aside.replace(/(<h1>[\s\S]*?<\/h1>)<p>[\s\S]*?<\/p>/,'$1<p>'+esc(meta['作者'])+'</p>');
      const fields={'出版年份':meta['出版年'],'出版机构':meta['出版社'],'ISBN':meta.ISBN,'定价':meta['定价'],'页数':meta['页数'],'装帧':meta['装帧']};
      for(const [label,value] of Object.entries(fields)) {
        if(!value)continue;
        const field='<dt>'+label+'</dt><dd>'+esc(value)+'</dd>';
        const pattern=new RegExp('<dt>'+label+'</dt><dd>[\\s\\S]*?</dd>');
        aside=pattern.test(aside)?aside.replace(pattern,field):aside.replace('</dl>',field+'</dl>');
      }
      return aside;
    });
  } else {
    html=html.replace(/<section class="reveal7"><span>(?:02 \/ 书目来源|资料说明)<\/span>[\s\S]*?<\/section>/g,'');
    if(book.id==='wendao')html=html.replace(/截图中的读者评论将本书视作/g,'本书可视作').replace(/此处为读者观点摘要，不作为作者自述。/g,'').replace('读者观点 · 摘要','书本简评');
  }
  if(!record) html=html.replace(/(<span>书本简评<\/span><div class="copy22">)([\s\S]*?)(<\/div>)/,(_,start,copy,end)=>start+'<div class="reader-entry">'+avatar()+'<div>'+copy+'</div></div>'+end);
  return html;
};


// Measure the real text height so short sections keep their natural layout.
let bookFoldObserver;
const bindBeforeBookFold = bind7;
bind7 = function() {
  bookFoldObserver?.disconnect();
  bindBeforeBookFold();
  const folds = document.querySelectorAll('.book-detail-content .book-fold');
  if (!folds.length) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  bookFoldObserver = new ResizeObserver(entries => {
    for (const entry of entries) entry.target.parentElement.refreshBookFold?.();
  });
  folds.forEach((fold, index) => {
    const inner = fold.firstElementChild;
    const previewHeight = 240;
    let expanded = false, animation = null, button = null;
    fold.id = 'book-fold-' + index;
    const refresh = () => {
      if (!fold.isConnected) return;
      const long = inner.getBoundingClientRect().height > 340;
      if (!long) {
        animation?.cancel(); animation = null;
        fold.style.height = '';
        fold.classList.remove('is-folded');
        button?.remove(); button = null; expanded = false;
        return;
      }
      if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'book-fold-toggle';
        button.setAttribute('aria-controls', fold.id);
        fold.after(button);
        button.onclick = () => {
          const start = fold.getBoundingClientRect().height;
          animation?.cancel();
          expanded = !expanded;
          const end = expanded ? inner.getBoundingClientRect().height : previewHeight;
          update();
          fold.style.height = end + 'px';
          if (!reducedMotion.matches) {
            animation = fold.animate([{height:start+'px'}, {height:end+'px'}], {
              duration: Math.min(850, 420 + Math.abs(end-start)*.12),
              easing:'cubic-bezier(.22,1,.36,1)'
            });
            const active = animation;
            active.onfinish = () => {
              if (animation !== active) return;
              animation = null;
              if (expanded) fold.style.height = 'auto';
            };
          } else if (expanded) fold.style.height = 'auto';
        };
      }
      update();
      if (!animation) fold.style.height = expanded ? 'auto' : previewHeight+'px';
    };
    const update = () => {
      fold.classList.toggle('is-folded', !expanded);
      button.setAttribute('aria-expanded', String(expanded));
      button.innerHTML = (expanded ? '收起全文' : '展开全文') + '<span aria-hidden="true">'+(expanded?'−':'＋')+'</span>';
    };
    fold.refreshBookFold = refresh;
    refresh();
    bookFoldObserver.observe(inner);
  });
};
render7();
