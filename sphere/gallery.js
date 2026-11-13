/* All three resource collections share one sphere and one rotation state. */
(function(root){
  'use strict';
  const definitions=[{id:'documents',label:'文献'},{id:'books',label:'书籍'},{id:'images',label:'图片'}];
  function create(container,{onSelect,onHover}){
    const data={books:BookCoverData,documents:ResourceImageData.documents,images:ResourceImageData.images};
    // Build the original slot IDs so older preview links still resolve.
    const items=Array.from({length:18},(_,i)=>definitions.map(def=>{
      const number=String(i+1).padStart(2,'0'),asset=data[def.id][i%data[def.id].length];
      return {...asset,id:def.id+'-'+number,number,collectionId:def.id,collectionLabel:def.label,
        category:def.label+' / '+asset.category,shade:'#dedede',hasCase:false};
    })).flat();
    const shownPhotos=new Set();
    const visibleItems=items.filter(item=>{
      if(item.collectionId!=='images')return true;
      if(shownPhotos.has(item.image))return false;
      shownPhotos.add(item.image);
      return true;
    });
    const node=document.createElement('section');node.className='collection-node';node.dataset.collection='all';
    node.setAttribute('aria-label','文献、书籍与图片资源球体');
    const visual=document.createElement('div');visual.className='collection-visual';
    const stage=document.createElement('div');stage.className='sphere gallery-sphere';stage.id='sphere-all';stage.tabIndex=0;
    stage.dataset.collection='all';stage.setAttribute('role','group');stage.setAttribute('aria-describedby','sphereInstructions');
    visual.appendChild(stage);node.appendChild(visual);container.appendChild(node);
    const scene=GNScene.create(stage,visibleItems,{
      cluster:true,continuous:true,initialYaw:-.82,initialPitch:-.08,spin:.032,tileRatio:.13,radiusRatio:.37,
      onSelect,onHover
    });
    node.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')node.classList.add('is-hovered');});
    node.addEventListener('pointerleave',()=>node.classList.remove('is-hovered'));
    stage.setAttribute('aria-label',`文献、书籍与图片，共 ${visibleItems.length} 项，拖动旋转，点击封面预览`);
    scene.setTabbable(true);
    return {
      findItem(id){return items.find(item=>item.id===id)||(/^\d{2}$/.test(id||'')?items.find(item=>item.id==='books-'+id):undefined);},
      pause(){scene.pause();node.classList.remove('is-hovered');},
      resume(){scene.resume();},focusTarget(){stage.focus({preventScroll:true});},
      destroy(){scene.destroy();container.replaceChildren();}
    };
  }
  root.ResourceGallery={create};
})(globalThis);
