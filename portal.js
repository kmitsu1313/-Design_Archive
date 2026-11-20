(()=>{'use strict';
const sphere=document.querySelector('#sphere'),library=document.querySelector('#library'),introduction=document.querySelector('#introduction');
const frames=[sphere,library,introduction],waiting=new Map();let busy=false,queuedReturn=null,request=0;
function slot(frame,url){let loaded=false,resolve;const ready=new Promise(r=>resolve=r);return{frame,ready,resolve,warm(){if(!loaded){loaded=true;frame.src=url;}}};}
const archive=slot(library,'library/index.html#home'),about=slot(introduction,'library/index.html?introduction=1#home');
function sendViewport(frame){frame.contentWindow.postMessage({type:'drc:viewport',width:window.innerWidth},'*');}
frames.forEach(frame=>frame.addEventListener('load',()=>sendViewport(frame)));
window.addEventListener('resize',()=>frames.forEach(sendViewport));
const delay=ms=>new Promise(r=>setTimeout(r,ms));
function activate(target){frames.forEach(frame=>{const active=frame===target;frame.classList.toggle('active',active);frame.inert=!active;if(active)frame.removeAttribute('aria-hidden');else frame.setAttribute('aria-hidden','true');});}
async function openAbout(){busy=true;about.warm();await about.ready;const requestId=++request;const prepared=new Promise(resolve=>waiting.set(requestId,resolve));introduction.contentWindow.postMessage({type:'drc:route',about:true,fromSphere:true,requestId},'*');await prepared;activate(introduction);await delay(1050);introduction.contentWindow.focus();busy=false;if(queuedReturn){const pending=queuedReturn;queuedReturn=null;await returnSphere(pending);}}
async function returnSphere(event){busy=true;const fromAbout=event.source===introduction.contentWindow;if(!fromAbout){sphere.contentWindow.postMessage({type:'drc:reset-sphere',category:event.data.category},'*');await delay(50);}activate(sphere);await delay(1050);if(fromAbout)introduction.contentWindow.postMessage({type:'drc:introduction-hidden'},'*');sphere.contentWindow.focus();busy=false;}
window.addEventListener('message',async event=>{
 if(!frames.some(frame=>event.source===frame.contentWindow))return;const kind=event.data?.type;if(kind==='drc:viewport-request'){sendViewport(frames.find(frame=>event.source===frame.contentWindow));return;}
 if(kind==='drc:library-ready'){if(event.source===library.contentWindow)archive.resolve();if(event.source===introduction.contentWindow)about.resolve();return;}
 if(kind==='drc:introduction-ready'&&event.source===introduction.contentWindow){waiting.get(event.data.requestId)?.();waiting.delete(event.data.requestId);return;}
 if(kind==='drc:warm-library'&&event.source===sphere.contentWindow){archive.warm();return;}
 if(kind==='drc:open-library'&&event.source===sphere.contentWindow&&!busy){if(event.data.about&&!matchMedia("(max-width:760px)").matches){await openAbout();return;}busy=true;archive.warm();await archive.ready;library.contentWindow.postMessage({type:'drc:route',about:!!event.data.about,query:event.data.query},'*');activate(library);await delay(1050);library.contentWindow.focus();busy=false;return;}
 if(kind==='drc:open-sphere'&&(event.source===library.contentWindow||event.source===introduction.contentWindow)){if(busy){if(event.source===introduction.contentWindow)queuedReturn=event;return;}await returnSphere(event);}
});
if(new URLSearchParams(location.search).get('view')==='library'){archive.warm();archive.ready.then(()=>activate(library));}
})();