// Reference-cover edition. Artwork is an orthographic front/spine atlas.
const referenceBooks=[
['wendao','问道：中国自主设计','中国设计的自主之路','#a64030','#f3ded5','从封面中的历史物件与视觉材料，进入中国自主设计的知识与观念讨论。'],
['concept','中国现代设计观念史','设计观念与历史','#416cda','#e2e8fb','以设计观念为线索，观察中国现代设计的发展与思想变迁。'],
['industry','中国民族工业设计100年','工业设计与社会','#aa3844','#f5e9c8','从民族工业的视角，关注中国工业设计的百年历程。'],
['shanghai','Made in Shanghai','上海制造','#397d71','#dcece3','从日常器物与城市制造文化，认识上海的设计与工业记忆。'],
['museum','Corporate Museum','企业博物馆','#bd3d2f','#f5dfcf','从产业身份到展览传播，探索企业博物馆的表达方式。'],
['informing','从“告知”到“说服”','中国广告设计百年档案','#687b87','#e0e7eb','以历史广告为入口，观察广告如何从信息告知走向说服与传播。'],
['science','设计科学知识图谱','设计科学与知识组织','#234b60','#dbe7ec','以知识图谱的视角，认识设计科学的知识组织与关联。'],
['research','设计研究学术图谱','设计研究与学术关联','#706184','#e9e3ef','关注设计研究的学术脉络，以及研究主题之间的联系。'],
['flowers','大地芳菲','宣传画里的新中国女性形象','#ab5775','#f3dfe7','从宣传画中的女性形象出发，观察视觉表达与社会生活。'],
['nation','强国图志','从宣传画里看新中国发展之路','#ba722d','#f5e7c9','通过宣传画中的人物、生产与建设图景，观看新中国发展的视觉叙事。']
].map(([id,title,en,accent,tint,about],i)=>({id,title,en,accent,tint,about,cover:i,year:'待核',type:'图书',topic:['版式','结构','材料','空间'][i%4],code:String(i+1).padStart(2,'0')}));
// Keep the existing case-study routes available independently of the new shelf.
const legacyDocs=collection.slice();
collection.splice(0,collection.length,...referenceBooks);
shelfBooks.splice(0,shelfBooks.length,...referenceBooks);
doc=function(id){return collection.find(d=>d.id===id)||legacyDocs.find(d=>d.id===id)||collection[0]};
selectedVolume=0; mode='grid';
cover=function(n=0){const d=referenceBooks[n%referenceBooks.length];return `<span class="cover-texture" role="img" aria-label="${esc(d.title)}封面" style="--atlas:url('assets/books/book-${d.cover}.png')"></span>`};
book=function(d){if(!referenceBooks.includes(d))return `<div class="volume-object"><div class="volume-front">${cover(d.cover)}</div></div>`;return `<div class="volume-object reference-volume" style="--book-color:${d.accent};--atlas:url('assets/books/book-${d.cover}.png')"><div class="volume-inner"></div><div class="reference-spine" aria-hidden="true"></div><div class="volume-front">${cover(d.cover)}</div></div>`};
startIntro=function(){};
shelfMarkup=function(){const track=$('.continuous-books');if(!track)return;track.innerHTML=Array.from({length:11},(_,i)=>{const slot=i-5,d=shelfBooks[(selectedVolume+slot+shelfBooks.length)%shelfBooks.length];return `<button class="loop-book" data-slot="${slot}" style="--slot:${slot}" onclick="openVolume('${d.id}')" aria-label="查看 ${esc(d.title)}">${book(d)}</button>`}).join('')};
selectVolume=function(i){if(shelfBusy)return;const delta=Math.sign(i-selectedVolume);if(!delta)return;shelfBusy=true;const track=$('.continuous-books');if(!track){shelfBusy=false;return}track.style.transition=reduced()?'none':'transform 450ms ease';track.style.transform=`translateX(calc(var(--book-step) * ${-delta}))`;setTimeout(()=>{selectedVolume=(selectedVolume+delta+shelfBooks.length)%shelfBooks.length;track.style.transition='none';track.style.transform='';shelfMarkup();const d=shelfBooks[selectedVolume];$('#volume-number').textContent=`${selectedVolume+1} / ${shelfBooks.length}`;$('#volume-name').textContent=d.title;$('#volume-zh').textContent=d.en;$('#open-volume').href='#detail/'+d.id;shelfBusy=false},reduced()?0:460)};
const previousHome6=home;
home=function(){return previousHome6().replace(/\/ 06/g,'/ 10').replace(/ · 待核/g,'')};
const previousDetail6=detail;
detail=function(id){const d=doc(id);if(!referenceBooks.includes(d))return previousDetail6(id);return `<section class="publication reference-publication" style="--book-theme:${d.tint};--book-accent:${d.accent}"><div class="publication-hero">${backLink()}<div class="publication-book">${book(d)}</div><span class="publication-number">馆藏 ${d.code} / 10</span><a href="#book-about" class="reading-arrow" onclick="event.preventDefault();document.getElementById('book-about').scrollIntoView({behavior:motion()})" aria-label="查看书本介绍">↓</a></div><div class="publication-body" id="book-about"><aside><p class="eyebrow">设计文献 / ${d.en}</p><h1>${d.title}</h1><p>图书 · 封面馆藏</p><a class="line-action" href="#search">浏览全部书目 ↗</a><a class="line-action" href="#home">返回书架 ↗</a></aside><article><section><h2>书本介绍</h2><p>${d.about}</p><p class="reference-note">本页依据提供的封面整理；出版信息与正文内容尚待补充。</p></section><section><h2>封面细读</h2><div class="flat-cover">${cover(d.cover)}</div></section></article></div></section>`};
// Readable labels also apply to the original case-study views.
const renderBefore6=render;
render=function(){renderBefore6();if(current==='home'){$('#volume-number').textContent=`${selectedVolume+1} / 10`;$('#volume-zh').textContent=shelfBooks[selectedVolume].en;}$$('.site-header nav a').forEach(a=>{a.textContent=({'#home':'选书','#search':'书目','#cases':'专题','#shelf':'阅览台'}[a.getAttribute('href')]||a.textContent)});};


const atlasDimensions6=[[1140,1380],[1125,1398],[1184,1328],[1122,1402],[1110,1417],[1062,1482],[1247,1261],[1163,1353],[1213,1296],[1215,1295]];
cover=function(n=0){const d=referenceBooks[n%10],[w,h]=atlasDimensions6[d.cover];return `<svg class="reference-cover-svg" viewBox="${w*.1} 0 ${w*.9} ${h}" role="img" aria-label="${esc(d.title)}封面"><image href="assets/books/book-${d.cover}.png" width="${w}" height="${h}"/></svg>`};


const bookBeforeRatio6=book;book=function(d){let html=bookBeforeRatio6(d);if(referenceBooks.includes(d)){const [w,h]=atlasDimensions6[d.cover];html=html.replace("--book-color:", "--cover-ratio:"+((w*.9)/h)+";--book-color:");}return html};
