(function(){
      const root=document.getElementById('aboutResearch');
      function drawRelation(){
        const svg=root.querySelector('.rp-axes'),bounds=svg.getBoundingClientRect();
        if(!bounds.width||!bounds.height)return;
        const points=Array.from(root.querySelectorAll('.rp-node'),node=>{
          const rect=node.getBoundingClientRect();
          return [(rect.left-13-bounds.left)*600/bounds.width,(rect.top+12-bounds.top)*200/bounds.height];
        });
        root.querySelector('#rp-research-trace').setAttribute('d',points.map((point,i)=>(i?'L':'M')+point.join(' ')).join(' '));
      }
      new ResizeObserver(drawRelation).observe(root.querySelector('.rp-plot'));drawRelation();
    })();
