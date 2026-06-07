// ==========================================
// 三校战时销售知识库 — 纯内部团队效率工具
// ==========================================

export interface GridItem {
  title: string
  content: string
  tag: string
  type: 'danger' | 'warning' | 'info' | 'success' | 'primary'
}

export interface CampusHub {
  key: string
  name: string
  short: string
  targetAudience: string
  gridData: GridItem[]
  killerPitch: string
  clothing?: { militaryPrice: number; tips: string }
  checklistHighlights: string[]  // 勾选清单时弹出的扫楼话术
}

export const salesHubDatabase: Record<string, CampusHub> = {
  swpu: {
    key: 'swpu',
    name: '西南石油大学（南充校区）',
    short: '西油',
    targetAudience: '理工科、网速刚需型、作息规律型新生',
    gridData: [
      { title: '🛀 宿舍断电（绝杀点）', content: '周日-周四23:00断插座与照明电，周五六23:30断。断电=Wi-Fi路由器直接瘫痪！', tag: '断电断网', type: 'danger' },
      { title: '🔌 功率限制', content: '上限800W。严禁电煮锅、电热毯、≥800W吹风机，一插即跳闸并通报批评。', tag: '严查违禁', type: 'warning' },
      { title: '🍱 食堂与外卖', content: '一食堂在四教旁共1层（快餐冒菜）；二食堂靠宿舍共2层（一楼套饭，二楼深夜宵夜大本营）。外卖统一在西大门扫码柜或栅栏（占90%）。', tag: '西大门取餐', type: 'info' },
      { title: '🔤 英语课四级', content: '开学统一分级考。分入A班大一上（12月）直接考四级！B班只能等大一下。内卷严重。', tag: '分班特权', type: 'success' },
      { title: '📊 绩点与综测', content: '4.0满分制：绩点=(分数-60)/10+1。综测=德育15%+智育65%+发展20%。挂科=0绩点+无奖学金。', tag: '智育65%', type: 'primary' },
    ],
    killerPitch: '【西油绝杀话术】：学弟，西油周内晚上11点准时拉闸，寝室宽带和网线直接断电变板砖！用老家卡在水泥墙宿舍里深夜信号直接掉到3G转圈圈。办我们本地电信校园卡，宿舍区独家配置夜间基站增压，断电熄灯后空调房里5G依然满格，深夜开黑、刷网课秒级响应，谁用谁爽！',
    clothing: { militaryPrice: 135, tips: '9月秋老虎闷热（体感超35°C），建议多带纯棉速干内衣垫在迷彩服里防磨。' },
    checklistHighlights: [
      '看到新生桌上摆电脑→立刻切入"23:00断电断Wi-Fi"痛点',
      '提到充电问题→提醒"断电后路由器全灭，手机4G变3G"',
      '展示测速对比图→"电信夜间基站专线，断电后5G满格"',
    ],
  },
  cwnu: {
    key: 'cwnu',
    name: '西华师范大学（华凤/行署双子星）',
    short: '西华师大',
    targetAudience: '文理/师范生、通勤重度依赖、期末内卷型新生',
    gridData: [
      { title: '🛀 宿舍断电（绝杀点）', content: '周日-周四23:30断照明与插座电（空调不断），周五六通宵不断。断电后室内路由器全灭！', tag: '23:30断网', type: 'danger' },
      { title: '🚌 校内通勤', content: '华凤校区极大且坡度巨陡，无摆渡车，日常纯靠共享电驴（2元/20分钟），盲区没网扫不开车会累瘫。行署老区极小靠步行。', tag: '共享电驴刚需', type: 'warning' },
      { title: '🍱 食堂与外卖', content: '华凤一期挤华凤园，二期挤桃园；外卖送一期智达门或二期栋梁门。行署老区紧邻三公街/医学街小吃天堂，外卖送西门/北门。', tag: '高峰期人流量大', type: 'info' },
      { title: '🔤 英语四级', content: '无门槛！大一上学期（12月）直接对全校所有新生开放报考，修完大英（一）即可报名，必须抓紧。', tag: '大一上必报', type: 'success' },
      { title: '📊 绩点与综测', content: '5.0满分制。期末智育成绩在综测奖学金评定中占比高达 80%–90%！成绩一票否决，卷绩点是唯一出路。', tag: '智育最高90%', type: 'primary' },
    ],
    killerPitch: '【师大绝杀话术】：学妹，华凤一期二期中间隔着大坡，下课抢车、拿外卖像翻山。中午智达门和栋梁门几千人同时取外卖，移动联通的信号经常瘫痪连取件码都打不开！咱们电信卡在校区外卖区和宿舍区做过独家基站优化，断电后5G依然满格，扫车、抢课、干饭永远比别人快一步！',
    clothing: { militaryPrice: 0, tips: '军训约2周，服装免费无军训费。9月中下旬南充暴晒，操场军训极热，防晒霜必带高倍。' },
    checklistHighlights: [
      '新生提到骑车上下课→"共享电驴扫不开码？电信信号满格秒扫"',
      '抱怨取外卖排队→"高峰期几万人同时取件，移动联通转圈"',
      '师大学生期末焦虑→"80%-90%成绩占比，网课不卡是刚需"',
    ],
  },
  nsmc: {
    key: 'nsmc',
    name: '川北医学院（临江新校区）',
    short: '川北医',
    targetAudience: '医学生、重度背诵/PPT下载型、高压学业型新生',
    gridData: [
      { title: '🏢 临江概况', content: '2025正式启用，全新现代化校区。大一新生全员直接入驻临江新校区，不用去高坪老区。', tag: '全新临江新区', type: 'info' },
      { title: '🏠 豪华4人间', content: '临江全员全新豪华4人间，上床下桌、独卫空调阳台。但限电极严，阻性发热违禁电器跳闸直接通报书院。', tag: '全员4人间', type: 'success' },
      { title: '🛀 热水与断电', content: '热水早中晚定时供应。深夜同样有断电门禁，医学生深夜背解剖、生理学等魔鬼PPT时需要备用电源。', tag: '江边防风驱蚊', type: 'warning' },
      { title: '📊 绩点与退学预警', content: '官方公式：课程绩点=成绩÷10-5。核心课GPA<1.8不发学位证！一学年补考后未获学分≥10分直接触发退学预警！', tag: '1.8学业硬线', type: 'danger' },
      { title: '🚌 交通孤岛', content: '江边新开发区位置偏，离老城区和北站打车30-40元。周末进城极度依赖专属公交线，路上人挤人。', tag: '出行成本高', type: 'primary' },
    ],
    killerPitch: '【川北医绝杀话术】：学弟学妹，临江新校区硬件确实好，但作为医学生，大一就要面对解剖、组胚等挂科率极高的魔鬼课，期末平时分30%+卷面70%，考前要下载几个G的3D人体软件和PPT！新校区刚建好，宿舍墙厚校园网卡，开一张我们电信5G校园卡，江边专属基站增压，抢第二课堂名额一击必中，下资料秒完成！',
    clothing: { militaryPrice: 140, tips: '军训服到校买约140元，白大褂实验课统一订约159元。江边早晚风大、蚊子多，多带外套和驱蚊水。' },
    checklistHighlights: [
      '新生搬行李进宿舍→"4人间再好，深夜断电照样得备充电宝"',
      '提到下载资料→"解剖组胚PPT几个G，校园网卡到崩溃"',
      '期末考试焦虑→"GPA低于1.8没学位证！网课下载刚需"',
    ],
  },
}

export const CHECKLIST_ITEMS = [
  { id: 'id_card', label: '身份证原件 + 复印件×3' },
  { id: 'admission', label: '录取通知书（报到用）' },
  { id: 'photos', label: '一寸/二寸证件照各8张' },
  { id: 'bank_card', label: '银行卡（学校发的缴费卡）' },
  { id: 'league', label: '团员证/党组织关系介绍信' },
  { id: 'medicine', label: '常用药品（感冒药、创可贴、防蚊液）' },
  { id: 'sunblock', label: '高倍防晒霜（南充暴晒！军训必备）' },
  { id: 'slippers', label: '拖鞋 + 运动鞋（至少各一双）' },
  { id: 'power_bank', label: '大容量充电宝（断电后救命！）' },
  { id: 'laptop_router', label: '笔记本电脑 + 路由器（宽带刚需）', triggerPitch: true },
  { id: 'insect', label: '驱蚊水/花露水（江边校区必备）' },
  { id: 'clothes', label: '纯棉速干内衣（迷彩服防磨垫底）' },
]

export const SALES_GOLD_QUOTES = [
  {
    category: '群聊破冰',
    text: '各大一新生注意啦！学校宿舍周内晚上断电后Wi-Fi全断。我们整理了今年学长亲测网络最稳、打游戏看网课延迟最低的选号避坑攻略，需要的扣1，学长私发你，顺便带你了解食堂哪个档口不手抖！',
  },
  {
    category: '扫楼破门',
    text: '嗨学弟们好！我是大二的学长，别紧张不推销东西。今天代表迎新站来给大家送咱们校区【专属生存活地图和断电断网避坑指南】，扫这个码就能看，里面连洗澡水控怎么充值、哪个外卖柜最方便都写清楚了。',
  },
  {
    category: '解决抗拒',
    text: '学弟，老家电话卡留着挺好。但建议开张咱们学校的本地校园卡做副卡。第一，学校宿舍宽带必须绑定本地卡才送；第二，学校断电后老家卡在寝室死角基本没信号，本地卡有专属夜间基站优化，四年能省大笔宽带费和流量费，绝对不亏！',
  },
]
