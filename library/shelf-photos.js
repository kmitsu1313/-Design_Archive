// Sphere photos are not flat texture atlases. For each book, the three columns
// locate the outside of the spine, the hinge and the fore-edge in the photo.
// Each column is [x at top, y at top, x at bottom, y at bottom], in percent.
const shelfPhotos = [
  [13,[5.8,8,5.8,92.7],[9.8,5.7,9.8,93.4],[83.8,8,84,84.8]],
  [18,[4.8,5.2,3.8,94.3],[14.8,2.8,13.4,96.8],[95.3,5.1,96.7,91.5]],
  [12,[2.4,3.4,2.5,95.1],[11.6,1.9,11.2,98],[97.1,5.7,97.4,92.7]],
  [7,null,[0,0,0,100],[100,0,100,100]],
  [6,null,[0,0,0,100],[100,0,100,100]],
  [16,[5.2,8.9,5.2,93.6],[14,6.1,13.5,94.1],[90.2,11.6,90.2,86.2]],
  [1,[25.5,11,26,91],[30,10,31.1,94.4],[76,6.8,75.3,83.8]],
  [2,[26,10,26.4,91],[29,11,29.1,93.8],[77.1,8.2,76.6,88.9]],
  [3,[18.2,8,18.2,95.3],[26.6,5.2,26.5,97.6],[89.8,11,89.8,87.3]],
  [4,[25.9,14.8,25.9,82.1],[30.2,12.4,30.2,84.5],[80.2,17.7,80.2,79.1]],
  [5,[18.3,5.6,18.3,93.4],[27.9,3.5,27.9,97],[80.7,7.7,80.7,92.4]],
  [11,[13.6,10.9,13.6,88.8],[27.4,8.7,27.5,91],[88.1,12.2,88.1,86.5]]
];
const spineFractions = [109/1140,100/1125,123/1184,86/1122,80/1110,92/1062,106/989,108/1163,106/1213,107/1215,115/1086,96/1024];
const photoURLs = shelfPhotos.map(([number]) => '../sphere/assets/thumbnails/cover-' + String(number).padStart(2,'0') + '.webp');
const photoTextures = new Map();

function shelfTexture(cover) {
  if (photoTextures.has(cover)) return photoTextures.get(cover);
  const task = new Promise((resolve, reject) => {
    const image = new Image();
    image.onerror = () => reject(new Error('封面加载失败：' + photoURLs[cover]));
    image.onload = () => {
      const [,spine,hinge,edge] = shelfPhotos[cover];
      const canvas = document.createElement('canvas');
      const [w,h] = dimensions7[cover];
      canvas.height = Math.min(image.height,512);
      canvas.width = Math.round(canvas.height*w/h);
      const ctx = canvas.getContext('2d');
      const split = Math.round(canvas.width*spineFractions[cover]);
      // Map thin vertical strips so the sloping top and bottom edges become level.
      function paintFace(left,right,start,width) {
        for (let col=0; col<width; col++) {
          const t=(col+0.5)/width;
          const [xt,yt,xb,yb]=left.map((value,i)=>(value+(right[i]-value)*t)/100);
          const height=(yb-yt)*image.height;
          const lean=(xb-xt)*image.width/height;
          const sampleWidth=Math.max(1,(right[0]-left[0])*image.width/(100*width));
          ctx.save();
          ctx.beginPath();ctx.rect(start+col,0,1,canvas.height);ctx.clip();
          ctx.translate(start+col+.5,0);
          ctx.scale(1/sampleWidth,canvas.height/height);
          ctx.transform(1,0,-lean,1,0,0);
          ctx.translate(-xt*image.width,-yt*image.height);
          ctx.drawImage(image,0,0);
          ctx.restore();
        }
      }
      if (spine) paintFace(spine,hinge,0,split);
      else ctx.drawImage(image,0,0,1,image.height,0,0,split,canvas.height);
      paintFace(hinge,edge,split,canvas.width-split);
      resolve(canvas);
    };
    image.src = photoURLs[cover];
  });
  photoTextures.set(cover,task);
  task.catch(()=>photoTextures.delete(cover));
  return task;
}

function shelfFace(book,side='front') {
  return '<archive-cover class="flat8" data-cover="'+book.cover+'" data-side="'+side+'" role="img" aria-label="'+esc(book.title)+'"></archive-cover>';
}

customElements.define('archive-cover',class extends HTMLElement {
  connectedCallback() {
    if (this.firstChild) return;
    const cover=Number(this.dataset.cover);
    const face=document.createElement('canvas');
    this.append(face);
    shelfTexture(cover).then(atlas=>{
      const split=Math.round(atlas.width*spineFractions[cover]);
      const spine=this.dataset.side==='spine';
      face.width=spine?split:atlas.width-split;
      face.height=atlas.height;
      face.getContext('2d').drawImage(atlas,spine?0:split,0,face.width,face.height,0,0,face.width,face.height);
    }).catch(()=>{this.textContent=this.getAttribute('aria-label');});
  }
});
