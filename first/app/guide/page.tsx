const GUIDES = [
  {
    icon: '📋', title: '入学必备清单',
    items: [
      '身份证原件 + 复印件×3',
      '录取通知书（报到用）',
      '一寸/二寸证件照各8张',
      '银行卡（学校发的缴费卡）',
      '团员证/党组织关系介绍信',
      '常用药品（感冒药、创可贴、防蚊液）',
    ],
  },
  {
    icon: '🚫', title: '新生避坑指南',
    items: [
      '别信"学长代理办卡"——来营业厅直接享受校园套餐',
      '教材不用全买新的——二手群或学长传承更省钱',
      '军训防晒一定要做好——成都会突然变热',
      '宿舍推销的要警惕——先问辅导员确认',
      '校园贷千万别碰——缺钱可以走学校助学贷款',
    ],
  },
  {
    icon: '🏫', title: '西油新生须知',
    items: [
      '报到地点：新都校区正门体育馆',
      '宿舍网络：电信校园宽带覆盖全部宿舍楼',
      '食堂推荐：一食堂二楼小炒、三食堂牛肉面',
      '快递地址：成都市新都区新都大道8号',
      '校园卡服务中心：行政楼一楼',
    ],
  },
  {
    icon: '🏫', title: '西华新生须知',
    items: [
      '报到地点：郫都校区综合楼前广场',
      '宿舍网络：电信千兆光纤到户',
      '食堂推荐：学生一食堂麻辣烫、教工食堂自助',
      '快递地址：成都市郫都区红光大道9999号',
      '校园卡服务中心：学生活动中心一楼',
    ],
  },
  {
    icon: '🏫', title: '川医新生须知',
    items: [
      '报到地点：城北校区正门接待处',
      '宿舍网络：电信5G全覆盖，宿舍宽带独享',
      '食堂推荐：一食堂川菜窗口、清真食堂',
      '快递地址：泸州市龙马潭区香林路1段1号',
      '校园卡服务中心：教学楼A区一楼',
    ],
  },
]

export default function GuidePage() {
  return (
    <div className="p-6 space-y-5 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-white">📚 新生入学完全指南</h1>
        <p className="text-sm text-zinc-500 mt-0.5">三校专属攻略 · 扫楼时转发给新生</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GUIDES.map((g, i) => (
          <div key={i} className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 ${i >= 3 ? 'md:col-span-1' : ''}`}>
            <h3 className="text-base font-bold text-zinc-200 flex items-center gap-2 mb-3">
              <span className="text-xl">{g.icon}</span>{g.title}
            </h3>
            <ul className="space-y-2">
              {g.items.map((item, j) => (
                <li key={j} className="text-sm text-zinc-400 flex items-start gap-2">
                  <span className="text-indigo-500 flex-shrink-0 mt-0.5">{i < 2 ? '•' : `${j + 1}.`}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-5">
        <p className="text-sm text-zinc-300 text-center">
          💡 把这个页面转发到新生群，新生自己查阅攻略，你坐等咨询转化
        </p>
      </div>
    </div>
  )
}
