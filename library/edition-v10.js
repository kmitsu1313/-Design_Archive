const minsheng10={id:'minsheng',title:'共和国100个经典民生设计',en:'DESIGN FOR EVERYDAY LIFE',cover:11,code:'12',type:'图书',topic:'工业设计',author:'徐劭峰',year:'2024',publisher:'浙江人民美术出版社',subtitle:'从日常器物观看共和国的生活变迁',description:'本书以日常生活中的设计物件为线索，汇集具有代表性的民生产品。通过产品图像、形态细节与历史语境之间的对照，讨论设计如何参与社会生活的变化，呈现工业生产、技术应用与生活经验之间的联系。',bio:'作者关注中国工业设计与日常器物的历史，通过文献整理与实物观察，研究民生设计的形态、功能及其社会意义。',accent:'#906e46',bg:'#e4d5ba',ink:'#5a4b37'};
referenceBooks.push(minsheng10);collection.push(minsheng10);shelfBooks.push(minsheng10);
// The generated front/spine atlas dimensions are set by the packaging step.
dimensions7.push([280,420]);
const detailBefore10=details7;
details7=function(d){let html=detailBefore10(d);if(d.id==='hongqi')html=html.replace('hongqi.html?chapter=ca71','hongqi-revised/index.html');return html;};
// A departing DOM layer retains every shelf part, including its pseudo-element back rail.
pickBook7=async function(id){
 if(entering9)return;const d=doc(id),item=$$('#app .shelf-item7').find(el=>referenceBooks[+el.dataset.index9]?.id===id);
 if(!item||reduced()){location.hash='detail/'+id;return;}
 entering9=true;const source=item.querySelector('.model8'),from=source.getBoundingClientRect(),shelf=$('#app .shelf9'),shelfRect=shelf.getBoundingClientRect();
 const ghost=document.createElement('div');ghost.className='entering-book9';Object.assign(ghost.style,{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'});ghost.innerHTML=volume7(d);document.body.append(ghost);
 const canvas=ghost.querySelector('canvas');canvas.dataset.angle='.12';mesh8(canvas,d);source.style.visibility='hidden';
 shelf.classList.add('departing10');Object.assign(shelf.style,{top:shelfRect.top+'px',height:shelfRect.height+'px'});document.body.append(shelf);
 history.pushState(null,'','#detail/'+id);current='detail/'+id;selected7=referenceBooks.indexOf(d);render7();scrollTo({top:0,behavior:'instant'});
 const target=$('#app .detail-object7 .model8'),to=target.getBoundingClientRect();target.style.visibility='hidden';
 const options={duration:1100,easing:ease9,fill:'forwards'};
 const bookAnimation=ghost.animate([{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'},{left:to.left+'px',top:to.top+'px',width:to.width+'px',height:to.height+'px'}],options);
 const stage=shelf.querySelector('.shelf-space7');stage.animate([{transform:'translateY(0)',opacity:1},{transform:'translateY(60svh)',opacity:0}],{...options,duration:850});
 shelf.querySelector('.shelf-caption7').animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(26px)'}],{...options,duration:550});
 shelf.querySelector('.room9')?.animate([{opacity:1},{opacity:0}],{...options,duration:550});
 shelf.querySelectorAll('.shelf-item7').forEach(el=>el.animate([{opacity:getComputedStyle(el).opacity},{opacity:0}],{...options,duration:520}));
 let start=performance.now(),last=0;
 function rotate(now){if(!ghost.isConnected)return;const t=Math.min(1,(now-start)/1100),e=1-Math.pow(1-t,3);if(now-last>35){canvas.dataset.angle=String(.12+(-.43-.12)*e);canvas.dataset.tilt=String(.025+.035*e);mesh8(canvas,d);last=now;}if(t<1)requestAnimationFrame(rotate);}
 requestAnimationFrame(rotate);
 try{await bookAnimation.finished;}finally{target.style.visibility='';ghost.remove();shelf.remove();entering9=false;}
};
render7();
