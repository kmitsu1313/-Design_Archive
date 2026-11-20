(() => {
 const {scenes, assets} = window.STORY_DATA;
 const article = document.querySelector('#mobile-story');
 const progress = article.querySelector('output');
 const sections = [];
 function element(tag, text) {
   const node = document.createElement(tag);
   node.textContent = text;
   return node;
 }
 for (const scene of scenes) {
   const section = document.createElement('section');
   section.dataset.year = scene.year;
   section.append(element('h2', scene.label));
   const svg = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + scene.body + '</svg>', 'image/svg+xml');
   for (const use of svg.querySelectorAll('use')) {
     const key = use.getAttribute('href').slice(1);
     const asset = assets[key];
     const figure = document.createElement('figure');
     const button = document.createElement('button');
     button.dataset.galleryKey = key;
     button.setAttribute('aria-label', '查看大图：' + asset.caption);
     const image = new Image(asset.w, asset.h);
     image.alt = asset.caption;
     image.loading = 'lazy';
     image.src = asset.src;
     button.append(image);
     button.onclick = () => window.wendaoOpenGallery(key);
     figure.append(button, element('figcaption', asset.caption));
     section.append(figure);
   }
   const groups = document.querySelectorAll('#copy [data-scene="' + scene.id + '"] > g');
   for (const group of groups) {
     for (const [selector, tag] of [['.body-copy','p'], ['.source-note','small']]) {
       const copy = [...group.querySelectorAll(selector)].map(node => node.textContent).join('');
       if (copy) section.append(element(tag, copy));
     }
   }
   sections.push(section);
   article.querySelector('.scenes').append(section);
 }
 article.querySelector('.gallery').onclick = () => window.wendaoOpenGallery();
 article.querySelector('.directory').onclick = () => {
   document.querySelector('#directory-return').click();
   document.querySelectorAll('.chapter-strip')[2].focus({preventScroll:true});
 };
 article.querySelector('.next').onclick = () => window.wendaoChapter(4);
 function updateProgress() {
   if (!article.offsetWidth) return;
   const current = sections.findIndex(section => section.getBoundingClientRect().bottom > innerHeight / 2);
   const index = current < 0 ? sections.length - 1 : current;
   progress.textContent = sections[index].dataset.year + ' · ' + (index + 1) + ' / ' + sections.length;
 }
 window.addEventListener('scroll', updateProgress, {passive:true});
 new ResizeObserver(updateProgress).observe(article);
})();
