/* Photograph slots preserve old preview links. The gallery displays each photograph once. */
(function(root){
  'use strict';
  function photoOverview(description,label,url){
    return {paragraphs:[description],source:{label,url}};
  }
  const originalImages=[
    {title:'石库门生活场景陈列',category:'生活场景',image:'assets/image-resources/image-01.jpg',imageFit:'contain',
      overview:photoOverview('石库门里弄民居是近代上海常见的住宅形式。这个陈列将缝纫机、木柜与儿童三轮车布置在同一室内，呈现家务、起居和儿童玩耍交织的生活空间。','中国非物质文化遗产数字博物馆《石库门里弄建筑营造技艺》','https://www.ihchina.cn/project_details/14731')},
    {title:'铁皮旋转火车',category:'玩具设计',image:'assets/image-resources/image-02-cutout.png',imageFit:'contain',
      overview:photoOverview('彩印底座上绘有环形轨道，车厢位于带拱门的站房前，屋顶可见上弦钥匙。站房、桥架与底座上的街景共同组成一处微缩铁路场景。','原始照片中的玩具结构与彩印图案')},
    {title:'敲琴玩具',category:'玩具设计',image:'assets/image-resources/image-03-cutout.png',imageFit:'contain',
      overview:photoOverview('娃娃双手各持一支琴槌，面前排着七片不同颜色的琴片。上海虹口区的玩具展陈资料也记录了发条式敲琴娃娃，可作为了解这一类玩具的参照。','上海市虹口区人民政府《在家门口找回“儿时记忆”》','https://www.shhk.gov.cn/xwzx/002003/20201117/ad6065c1-4127-40a5-83a0-b4a88e5d71b2.html')},
    {title:'铁皮火车及包装',category:'玩具与包装',image:'assets/image-resources/image-04-cutout.png',imageFit:'contain',
      overview:photoOverview('车身标有 ME 660，包装以 Puff-Puff Loco 为名，并注明使用电池驱动。车身的轮组与连杆图案、盒面的蒸汽机车插画，共同呈现了玩具模仿的机车形象。','原始照片中的车身标识与包装文字')}
  ];
  // Replace only duplicate positions. Existing image links keep their slot numbers.
  const replacementImages={
    5:{title:'百雀羚广告',category:'历史广告',image:'assets/image-resources/image-05.jpg',imageFit:'contain',
      overview:photoOverview('广告将竖排的「百雀羚」、人物插画与圆盒并置，以「保護皮膚」等字样突出润肤用途。百雀羚品牌史记载，其前身富贝康于 1931 年在上海创办，后来推出百雀羚冷霜。','百雀羚官网《品牌历史》','https://www.pechoin.com/history/')},
    8:{title:'保温瓶产品',category:'生活用品',image:'assets/image-resources/image-06.jpg',imageFit:'contain',
      overview:photoOverview('两只保温瓶采用相近的圆筒造型，瓶盖与底座呈金属光泽，外壳分别饰以不同的花卉图案。常见的真空保温瓶通过双层瓶胆之间的真空夹层减缓传热。','昆士兰大学物理博物馆《Vacuum Flask》','https://physicsmuseum.uq.edu.au/vacuum-flask')},
    11:{title:'双镜头相机',category:'摄影器材',image:'assets/image-resources/image-07.jpg',imageFit:'contain',
      overview:photoOverview('这台相机的机身可见「海鸥」标识，正面上下排列两枚镜头，顶部为翻开的取景罩。双镜头反光相机用上方镜头取景和对焦，用下方镜头在胶片上成像。','意大利国家文化遗产目录·双镜头反光相机藏品记录','https://catalogo.beniculturali.it/detail/Lombardia/ScientificOrTechnologicalHeritage/0301970047')},
    14:{title:'回力鞋广告',category:'历史广告',image:'assets/image-resources/image-08.jpg',imageFit:'contain',
      overview:photoOverview('广告用圆形武士商标、手持球拍的人物和鞋样突出球鞋的运动用途。商务部老字号数字博物馆记载，上海正泰信记橡胶厂于 1930 年代开始生产回力牌球鞋。','商务部老字号数字博物馆《回力》','https://lzhbwg.mofcom.gov.cn/edi_ecms_web_front/thb/detail/3f579a7d54a34677b1a1033cc068c5a3')},
    17:{title:'金龙牌热水瓶广告',category:'历史广告',image:'assets/image-resources/image-09.jpg',imageFit:'contain',
      overview:photoOverview('广告右侧以粗体竖排「金龍牌熱水瓶」突出商品名，左侧将倾斜的瓶身插图与龙纹组合。画面标注「上海永生廠出品」，并用「合理化」一词宣传产品设计。','原始广告上的图案、标语与厂名')}
  };
  root.ResourceImageData=Object.freeze({
    images:Array.from({length:18},(_,index)=>
      replacementImages[index+1]??originalImages[index%originalImages.length]
    ),
    documents:[
      {title:'基于VR技术的虚拟博物馆交互设计',category:'交互设计',image:'assets/document-pages/document-01.jpg',imageFit:'contain',
        overview:{
          authors:'吕屏、杨鹏飞、李旭',
          paragraphs:['文章归纳国内外虚拟博物馆的交互设计，讨论如何借助 VR 让观众进入模拟展览空间，通过多角度观察和操作参与参观。作者认为，这类交互能突破实体参观的时空限制，丰富展品的呈现方式。'],
          source:{label:'《包装工程》2017 年第 38 卷第 24 期，文献首页摘要'}
        }},
      {title:'老字号包装的叙事性设计研究',category:'包装设计',image:'assets/document-pages/document-02.jpg',imageFit:'contain',
        overview:{
          authors:'薛艳敏、武优',
          paragraphs:['研究以陕西食品老字号德懋恭为例，从叙事主题、易读性、文化内涵和表达方式四方面分析包装。作者据此提出包装改良思路，帮助消费者理解产品信息和品牌背后的文化。'],
          source:{label:'《包装工程》2020 年第 41 卷第 10 期，文献首页摘要'}
        }},
      {title:'包装设计价值的历史演化逻辑与当代建构',category:'包装设计',image:'assets/document-pages/document-03.jpg',imageFit:'contain',
        overview:{
          authors:'朱和平',
          paragraphs:['文章梳理包装如何从不追求附加值，逐步转向为商品增值，并讨论过度追求附加值带来的资源消耗与环境污染。作者提出，数字智能时代的包装设计应兼顾人的需求与自然环境。'],
          source:{label:'《湖南工业大学学报（社会科学版）》2020 年第 25 卷第 2 期，文献首页摘要'}
        }},
      {title:'知识图谱视角下的设计元研究管窥',category:'设计研究',image:'assets/document-pages/document-04.jpg',imageFit:'contain',
        overview:{
          authors:'徐江',
          paragraphs:['文章以全球学术文献为基础，用科学计量方法绘制设计研究知识图谱，识别分布在不同设计领域的知识单元。作者结合理性逻辑、实践情境与学科知识，提出一条反思和梳理设计学研究的路径。'],
          source:{label:'《装饰》2019 年第 10 期（总第 318 期），文献首页摘要'}
        }}
    ]
  });
})(globalThis);
