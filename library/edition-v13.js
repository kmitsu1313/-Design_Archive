const reading13={wendao:['知识与设计','沿着设计知识如何形成、传播与重构的线索阅读，关注中国自主设计与外部知识之间的关系。','将历史图像与论述并读，区分技术引进、知识转译和自主创造三个层次。'],concept:['观念的变迁','以现代设计观念的形成与传播为主线，对照不同时期对工艺、美术、工业和设计的理解。','阅读时记录核心概念在各时期的含义，观察国际现代主义与中国社会条件之间的关联。'],industry:['产品与工业的百年线索','围绕本土产品和品牌，把汽车、玩具与日用消费品放在同一条工业发展时间线上理解。','从材料、结构、生产方式和使用场景四个角度比较案例，理解民族工业设计如何回应生活需求。'],shanghai:['从上海制造看中国设计','以日常生活、国家形象、传播接收、出口贸易和交通运输为阅读线索，观察制造与城市生活的交织。','可把不同主题中的物件并置，比较面向本地生活和海外市场时，设计表达与使用需求的差异。'],museum:['从产业身份到展示传播','关注企业的产品、档案与生产历史如何进入博物馆，并被组织成公众可以理解的展示叙事。','比较藏品选择、空间路径和视觉传播，思考企业博物馆如何同时承担历史保存与身份表达。'],informing:['广告如何改变表达方式','从商品信息的传递走向受众说服，观察历史广告中的图像、文字与消费生活。','对照广告的标题、版面与人物形象，思考它如何塑造商品价值以及现代生活的想象。'],science:['理解知识图谱的方法','阅读关键词共现与共被引分析时，先理解节点、连线及聚类所代表的关系，再进入各设计研究领域。','对照概念设计、情感设计、智能设计、交互设计与人机工程，观察领域之间的知识联系。'],research:['研究理论与知识演化','可从理论、方法及研究演化图谱三个方向建立阅读框架；当前公开书目资料尚不完整。','阅读时区分研究主题与研究方法，记录证据来源。这里提供的是阅读建议，不作为原书章节目录。'],flowers:['图像中的女性与时代','围绕宣传画中的女性形象，观察不同年代的劳动、生活与公共角色如何被表现。','比较姿态、服饰、道具与画面背景，联系年代信息理解图像叙事与社会观念的变化。'],nation:['宣传画中的发展叙事','从工业、农业、文教与国防等主题切入，观察新中国发展如何被转译为视觉形象。','比较不同主题的构图、色彩和象征物，留意画面中的技术、人物与生活愿景。'],hongqi:['全书五章导读','序曲：共和国长子；发轫：设计与研发；演进：红旗的谱系化；转型：量产国民车；未来：风卷红旗如画。','全书结合设计手稿与三代设计师口述。可沿着车型谱系，比较传统文化元素如何进入造型、内饰与工程实践；第三章入口提供手稿图像叙事。'],minsheng:['日常器物中的设计','以100个民生设计案例为线索，将产品放回家庭与社会生活，观察需求、技术和生产条件的变化。','可从熟悉的日用品开始，比较形态、材料、操作方式与使用习惯，再把个体生活经验放入更长的设计史中。']};
const oldDetails13=details7;
details7=function(d){const r=reading13[d.id];return oldDetails13(d).replace('<section class="reveal7"><span>02 / 书目来源',`<section class="reveal7"><span>阅读导引</span><h2>${r[0]}</h2><p>${r[1]}</p><p>${r[2]}</p><small>本站编写的阅读建议，非原书目录或原文。</small></section><section class="reveal7"><span>02 / 书目来源`);};
const oldBind13=bind7;
bind7=function(){oldBind13();const c=document.querySelector('.detail-object7 canvas[data-model8]');if(!c)return;let p=null;c.style.touchAction='none';c.style.cursor='grab';c.onpointerdown=e=>{p=[e.clientX,e.clientY];c.setPointerCapture(e.pointerId);c.style.cursor='grabbing';};c.onpointermove=e=>{if(!p)return;c.dataset.angle=String(Number(c.dataset.angle||.3)+(e.clientX-p[0])*.012);c.dataset.tilt=String(Number(c.dataset.tilt||.025)+(e.clientY-p[1])*.008);p=[e.clientX,e.clientY];mesh8(c,doc(c.dataset.model8));};c.onpointerup=c.onpointercancel=()=>{p=null;c.style.cursor='grab';};};
render7();

// Preserve the cover aspect ratio and a deterministic front-to-back order.
const sizeBefore17=bookModelSize12;
bookModelSize12=function(book){const size=sizeBefore17(book),[w,h]=dimensions7[book.cover];return {...size,width:size.height*w*.9/h};};
const orbitBefore17=setOrbit8;
setOrbit8=function(index){orbitBefore17(index);document.querySelectorAll('.orbit-card8').forEach((card,i)=>{card.style.setProperty('--order17',100-i);});};
render7();

// Source PNG dimensions: never stretch an atlas using stale metadata.
[[1140,1380],[1125,1398],[1184,1328],[1122,1402],[1110,1417],[1062,1482],[1247,1261],[1163,1353],[1213,1296],[1215,1295],[1086,1448],[1024,1536]].forEach((size,i)=>{dimensions7[i]=size;});
render7();

const orbitBefore19=setOrbit8;
setOrbit8=function(index){orbitBefore19(index);document.querySelectorAll('.orbit-card8').forEach((card,i)=>{card.style.setProperty('--wash19',Math.min(.65,.04+Math.max(0,i-libraryIndex7)*.12));});};render7();

const orbitBefore20=setOrbit8;
setOrbit8=function(index){orbitBefore20(index);const cards=[...document.querySelectorAll('.orbit-card8')],visible=cards.filter(c=>!c.classList.contains('outside12'));cards.forEach(c=>c.style.setProperty('--wash19',0));visible.slice(-2).forEach((c,i)=>c.style.setProperty('--wash19',i===0?.24:.48));};
let librarySwitch20=false;
async function switchLibrary20(mode){if(librarySwitch20)return;librarySwitch20=true;const old=document.querySelector('.library7');try{if(old&&!reduced())await old.animate([{opacity:1},{opacity:0}],{duration:220,easing:'ease-in',fill:'forwards'}).finished;libraryMode7=mode;render7();}finally{librarySwitch20=false;}}
const bindBefore20=bind7;
bind7=function(){bindBefore20();const lib=document.querySelector('.library7');if(!lib)return;
lib.querySelectorAll('.library-toolbar7 button').forEach((b,i)=>b.onclick=()=>switchLibrary20(['timeline','grid','list'][i]));
if(reduced())return;
const cards=[...lib.querySelectorAll('.orbit-card8:not(.outside12)')];
if(cards.length){cards.forEach((c,i)=>{const cube=c.querySelector('.orbit-cube12');c.animate([{filter:'opacity(0)',translate:'0 28px'},{filter:'opacity(1)',translate:'0 0'}],{duration:650,delay:i*70,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});});}
else lib.animate([{opacity:0},{opacity:1}],{duration:500,easing:'ease-out'});
};render7();
