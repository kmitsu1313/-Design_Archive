(()=>{'use strict';const data=window.STORY_DATA;data.assets.turtle.originalSrc=data.assets.turtle.src;data.assets.turtle.src='assets/turtle-transparent.png';
for(const scene of data.scenes){if(scene.year==='1950s')scene.year='工厂';if(scene.year==='1976')scene.year='师生';}
function imageGeometry(id,key,rect){const scene=data.scenes.find(s=>s.id===id);scene.body=scene.body.replace(new RegExp('<use href="\\#'+key+'"[^>]*\\/>'),'<use href="#'+key+'" x="'+rect.x+'" y="'+rect.y+'" width="'+rect.w+'" height="'+rect.h+'"/>');}
// Lower the complete piece; enlarge/lower its detail view with the original aspect ratio.
imageGeometry('s03','commune',{x:90,y:290,w:1200,h:1200*257/575});
imageGeometry('s04','commune',{x:40,y:335,w:1060,h:1060*257/575});
})();