const SPECIES_DATA = [
  {
    "id": "emperor",
    "name": "コウテイペンギン",
    "nameEn": "Emperor Penguin",
    "attrBonus": { "str": 2 },
    "limits": { "str": [3, 7] },
    "trait": "【筋力】+2 (最低3/最大7)。作成時、特権的地位の象徴として追加の武器またはアイテムを1つ獲得。",
    "desc": "もっとも高貴で威厳ある種族。ペンギン社会の頂点に君臨するが、憂鬱や運命論に囚われやすく、アンチペンギンになる者も多い。"
  },
  {
    "id": "king",
    "name": "オウサマペンギン",
    "nameEn": "King Penguin",
    "attrBonus": { "phi": 2 },
    "limits": { "phi": [3, 7] },
    "specialPointBonus": 1,
    "trait": "【哲学/氷河の魂】+2 (最低3/最大7)。作成時、特殊能力ポイントを追加で+1（計6pt）獲得。",
    "desc": "思想家、策士、弁論家。知的で競争心が強く実利を重んじる。哲学的力や氷河の力に最も秀でている。"
  },
  {
    "id": "headless",
    "name": "ヘッドレスバロン",
    "nameEn": "Headless Baron",
    "attrBonus": { "str": 1, "phi": 1 },
    "limits": { "str": [2, 6], "phi": [2, 6] },
    "trait": "【筋力】+1,【哲学/氷河の魂】+1 (最低2/最大6)。1戦闘に1回、命中した攻撃を回避可能。",
    "desc": "コウテイとオウサマの混血貴族。巨大で堂々たる胸板を持ち、亀のように頭部を引っ込めて攻撃を回避する。",
    "specialTrait": {
      "nameJa": "首すくめ回避",
      "nameEn": "Headless Evasion",
      "tag": "1戦闘に1回",
      "desc": "1戦闘ごとに1回だけ、自身に命中する攻撃を首をすくめて完全回避したことにできる。"
    }
  },
  {
    "id": "royal",
    "name": "ロイヤルペンギン",
    "nameEn": "Royal Penguin",
    "attrBonus": { "agi": 2 },
    "limits": { "agi": [3, 7] },
    "trait": "【敏捷】+2 (最低3/最大7)。どこにいても海の方角が常にわかる。",
    "desc": "沿岸部に暮らす社交的で図太い中産階級。過酷な環境を避け、海に生きる。海の方角を本能的に感知できる。",
    "specialTrait": {
      "nameJa": "海の方位感知",
      "nameEn": "Sense of Sea",
      "tag": "常時発動",
      "desc": "どこにいても、海の方角が常に本能的にわかる。吹雪や迷宮でも海への帰路を見失わない。"
    }
  },
  {
    "id": "adelie",
    "name": "アデリーペンギン",
    "nameEn": "Adelie Penguin",
    "attrBonus": { "agi": 2 },
    "limits": { "agi": [3, 7] },
    "trait": "【敏捷】+2 (最低3/最大7)。体温値が-5になるまで意識を失わず行動可能。",
    "desc": "小型で攻撃的、強い警戒心を持つ下層カースト。抑圧や寒気に耐え、体温値が-5に達するまで倒れず行動できる不屈の闘志を持つ。",
    "specialTrait": {
      "nameJa": "不屈の意識",
      "nameEn": "Indomitable Consciousness",
      "tag": "常時発動",
      "desc": "体温値が0になっても気絶・行動不能にならず、死亡ラインである-5になるまで意識を保ち行動できる。"
    }
  },
  {
    "id": "rockhopper",
    "name": "イワトビペンギン",
    "nameEn": "Rockhopper Penguin",
    "attrBonus": { "sur": 2 },
    "limits": { "sur": [3, 7] },
    "trait": "【生存】+2 (最低3/最大7)。険しく困難な地形でも平原と同じ速度で進める。",
    "desc": "鮮やかな冠羽を持つ辺境の生存者。過酷な環境と崖を受け入れ、どんなに険しい悪路でも平地同様の速度で走破する。",
    "specialTrait": {
      "nameJa": "険路踏破",
      "nameEn": "Rough Terrain Traverse",
      "tag": "常時発動",
      "desc": "どんなに険しい崖やクレバス帯、困難な地形であっても、平原とまったく同じ速度で進むことができる。"
    }
  }
];

const WEAPONS_DATA = [
  {
    "id": "knife",
    "name": "ナイフ",
    "nameEn": "Knife",
    "damage": 0,
    "hitBonus": 1,
    "effect": "不意打ち時ダメージ+3。隠し持てる小型刃。"
  },
  {
    "id": "sealskinner",
    "name": "アザラシの皮剥ぎナイフ",
    "nameEn": "Sealskinner",
    "damage": 1,
    "hitDiceBonus": 1,
    "effect": "雪を切断可能。重厚な刃。"
  },
  {
    "id": "harpoon",
    "name": "銛",
    "nameEn": "Harpoon",
    "damage": 3,
    "effect": "恐るべき引き裂き棘。不意打ち使用不可。"
  },
  {
    "id": "spear",
    "name": "槍",
    "nameEn": "Spear",
    "damage": 2,
    "hitBonus": 1,
    "effect": "鋭い先端を持つ長い木製の柄。若き英雄の定番。"
  },
  {
    "id": "sling",
    "name": "スリング",
    "nameEn": "Sling",
    "damage": 0,
    "effect": "遠距離から接近する敵へ戦闘開始前に先制攻撃可能。"
  },
  {
    "id": "skua_trap",
    "name": "トウゾクカモメ罠",
    "nameEn": "Skua Trap",
    "damage": -1,
    "effect": "命中時拘束（次ターン行動不能）。飛行中の敵は2ターン拘束＆1d落下ダメージ。"
  },
  {
    "id": "club",
    "name": "棍棒",
    "nameEn": "Club",
    "damage": 2,
    "effect": "流木を用いた打撃武器。"
  },
  {
    "id": "stone_club",
    "name": "石棍棒",
    "nameEn": "Stone Club",
    "damage": 2,
    "effect": "先端に石刃を付けた棍棒。敵の装甲を2減少。"
  },
  {
    "id": "ice_club",
    "name": "氷棍棒",
    "nameEn": "Ice Club",
    "damage": 3,
    "effect": "氷河の鋭利な氷を取り付けた冷気宿る棍棒。"
  }
];

const ARMOR_DATA = [
  {
    "id": "none",
    "name": "なし",
    "nameEn": "None",
    "armor": 0,
    "effect": "標準的なペンギンの状態。"
  },
  {
    "id": "seaweed",
    "name": "海藻の防具",
    "nameEn": "Seaweed Armor",
    "armor": 1,
    "effect": "乾燥した海藻の網。軽量で動きやすい。"
  },
  {
    "id": "sealskin",
    "name": "アザラシ革の防具",
    "nameEn": "Sealskin Armor",
    "armor": 3,
    "effect": "分厚いアザラシの毛皮ポンチョ。"
  },
  {
    "id": "iron",
    "name": "鉄の防具",
    "nameEn": "Iron Armor",
    "armor": 5,
    "effect": "廃材の鉄板。極めて堅固だが着用中毎日Fat+1消費。"
  }
];

const SPECIAL_ITEMS_DATA = [
  {
    "id": "white_cape",
    "name": "白い外套",
    "nameEn": "White Cape",
    "effect": "雪中で身を隠す・奇襲時にダイス+1。"
  },
  {
    "id": "skates",
    "name": "スケート",
    "nameEn": "Skates",
    "effect": "適した氷上での移動速度1.5倍。武器として使用時ダメージ+1。"
  }
];

const ABILITIES_DATA = [
  {
    "分類": "哲学能力",
    "名前(日本語)": "混乱",
    "名前(英語)": "Confusion",
    "取得時の消費pt": "1",
    "発動時の消費fat": "5",
    "内容(日本語)": "敵に哲学攻撃を行い、成功すると相手は混乱して次のターン行動不能になる。",
    "内容(英語)": "The user can make a philosophical attack against the enemy. If successful, the enemy is confused and cannot act at all during its next turn."
  },
  {
    "分類": "哲学能力",
    "名前(日本語)": "完璧な議論",
    "名前(英語)": "Flawless Argument",
    "取得時の消費pt": "3",
    "発動時の消費fat": "1",
    "内容(日本語)": "会話で相手を戸惑わせ、言い返せないようにする。哲学攻撃に成功する必要がある。",
    "内容(英語)": "The user is able to bewilder his opposition in a conversation so they cannot come up with a response. Requires a successful philosophical attack."
  },
  {
    "分類": "哲学能力",
    "名前(日本語)": "温もりのギフト",
    "名前(英語)": "The Gift of Warmth",
    "取得時の消費pt": "5",
    "発動時の消費fat": "1",
    "内容(日本語)": "自分以外の対象1名のWarmth（体温/体力）を最大5ポイント回復する。",
    "内容(英語)": "Heals a single target (other than oneself) up to five points of Warmth damage."
  },
  {
    "分類": "哲学能力",
    "名前(日本語)": "ガーディアン・シール",
    "名前(英語)": "Guardian Seal",
    "取得時の消費pt": "2",
    "発動時の消費fat": "5",
    "内容(日本語)": "カニクイアザラシを召喚して一緒に戦わせる。シーン終了時まで持続。",
    "内容(英語)": "Summons a crabeater seal to defend the user until the end of the scene."
  },
  {
    "分類": "哲学能力",
    "名前(日本語)": "幻影",
    "名前(英語)": "Illusion",
    "取得時の消費pt": "4",
    "発動時の消費fat": "3",
    "内容(日本語)": "氷河の上に音の出ないシンプルな幻影を作り出す。",
    "内容(英語)": "Creates a simple, silent illusion upon the glacier."
  },
  {
    "分類": "哲学能力",
    "名前(日本語)": "陸泳ぎ",
    "名前(英語)": "Landswimmer",
    "取得時の消費pt": "2-5",
    "発動時の消費fat": "1",
    "内容(日本語)": "陸上でも海中にいるかのように俊敏に移動できる。攻撃以外のAgility判定にボーナス（+2〜+5）を得る。シーン終了時まで持続。",
    "内容(英語)": "Allows agile movement on land like in the sea, granting a bonus (+2 to +5) to non-attack Agility rolls for the scene."
  },
  {
    "分類": "哲学能力",
    "名前(日本語)": "致命撃",
    "名前(英語)": "Lethal Strike",
    "取得時の消費pt": "2-5",
    "発動時の消費fat": "1-4",
    "内容(日本語)": "物理攻撃のダメージにボーナス（+1〜+4）を得る。シーン終了時まで持続。",
    "内容(英語)": "Grants a bonus (+1 to +4) to physical attacks until the end of the scene."
  },
  {
    "分類": "哲学能力",
    "名前(日本語)": "海に愛されし者",
    "名前(英語)": "Loved by the Sea",
    "取得時の消費pt": "5",
    "発動時の消費fat": "0",
    "内容(日本語)": "ヒョウアザラシやシャチなどの海の脅威から攻撃されなくなる（挑発した場合を除く）。常時発動。",
    "内容(英語)": "Sea predators will not attack the user without provocation. Always active."
  },
  {
    "分類": "哲学能力",
    "名前(日本語)": "精神による物体操作",
    "名前(英語)": "Mind over Matter",
    "取得時の消費pt": "2/ 3/ 5",
    "発動時の消費fat": "1/ 2/ 5",
    "内容(日本語)": "念力で物体や武器、またはペンギン全体を浮遊・移動・攻撃させる。",
    "内容(英語)": "Lifts and moves objects, weapons, or whole penguins using telekinesis/Philosophy."
  },
  {
    "分類": "哲学能力",
    "名前(日本語)": "大勢の中の一匹",
    "名前(英語)": "One of Many",
    "取得時の消費pt": "3",
    "発動時の消費fat": "1",
    "内容(日本語)": "Philosophy判定に成功すると、周囲からごく普通のペンギンに見えて怪しまれなくなる。シーン終了時まで持続。",
    "内容(英語)": "With a successful Philosophy roll, the user appears as an average, forgettable penguin for the scene."
  },
  {
    "分類": "哲学能力",
    "名前(日本語)": "雪の結晶",
    "名前(英語)": "Snowflake",
    "取得時の消費pt": "3",
    "発動時の消費fat": "1",
    "内容(日本語)": "空中浮遊を得て風に乗って移動できる。高所からの落下ダメージを無効化できる。シーン終了時まで持続。",
    "内容(英語)": "Grants levitation to ride the wind or avoid fall damage for the scene."
  },
  {
    "分類": "哲学能力",
    "名前(日本語)": "偽りの歌",
    "名前(英語)": "Song of Deceit",
    "取得時の消費pt": "4",
    "発動時の消費fat": "1",
    "内容(日本語)": "他のペンギンや生物の声・歌を模倣して誘き出したり欺いたりする。シーン終了時まで持続。",
    "内容(英語)": "Imitates the voice/song of any penguin or creature for the scene to deceive or attract them."
  },
  {
    "分類": "哲学能力",
    "名前(日本語)": "雪の温もり",
    "名前(英語)": "Warmth of Snow",
    "取得時の消費pt": "5",
    "発動時の消費fat": "1",
    "内容(日本語)": "雪の上に横たわることで自身のWarmth（体温/体力）を全回復する。戦闘中は使用不可。",
    "内容(英語)": "Fully replenishes the user's Warmth. Cannot be used in combat."
  },
  {
    "分類": "氷河のギフト",
    "名前(日本語)": "吹雪",
    "名前(英語)": "Blizzard",
    "取得時の消費pt": "4",
    "発動時の消費fat": "5",
    "内容(日本語)": "猛吹雪を発生させる（持続期間は1日〜2週間）。移動や滞在に必要なFat消費が増加する。",
    "内容(英語)": "Summons a snowstorm lasting days or weeks, increasing Fat costs for staying or traveling."
  },
  {
    "分類": "氷河のギフト",
    "名前(日本語)": "クレバスの凝視",
    "名前(英語)": "Chasm Gaze",
    "取得時の消費pt": "1",
    "発動時の消費fat": "0",
    "内容(日本語)": "雪の下に隠れたクレバス（裂け目）を察知できる。常時発動。",
    "内容(英語)": "Senses crevasses hidden under snow. Always active."
  },
  {
    "分類": "氷河のギフト",
    "名前(日本語)": "氷河の仔",
    "名前(英語)": "Child of the Glacier",
    "取得時の消費pt": "5",
    "発動時の消費fat": "0",
    "内容(日本語)": "生存のために食べ物を必要としなくなる（回復や能力発動時のみFatを消費）。常時発動。",
    "内容(英語)": "No longer needs food to stay alive; only burns Fat to heal or use abilities. Always active."
  },
  {
    "分類": "氷河のギフト",
    "名前(日本語)": "クレバス（大裂け目）",
    "名前(英語)": "Crevasse",
    "取得時の消費pt": "5",
    "発動時の消費fat": "1",
    "内容(日本語)": "足元に巨大で深いクレバスを開き、落ちた敵を即死させる（回避判定可）。",
    "内容(英語)": "Opens a deep crevasse beneath enemies, causing instant death if they fail to dodge."
  },
  {
    "分類": "氷河のギフト",
    "名前(日本語)": "フロストスパイク",
    "名前(英語)": "Frostspike",
    "取得時の消費pt": "3",
    "発動時の消費fat": "5",
    "内容(日本語)": "強力な氷の槍（ダメージ+5）を作成する。攻撃が命中すると砕ける（砕けた後はダメージ+1）。",
    "内容(英語)": "Creates a large ice spike used as a spear (+5 damage). Shatters upon first successful hit (+1 damage afterward)."
  },
  {
    "分類": "氷河のギフト",
    "名前(日本語)": "一陣の風",
    "名前(英語)": "Gust of Wind",
    "取得時の消費pt": "2-5",
    "発動時の消費fat": "1",
    "内容(日本語)": "冷たい風を吹き付け、相手のWarmth（体温/体力）に直接ダメージを与える。",
    "内容(英語)": "Blows a cold breeze that deals Warmth damage to the target."
  },
  {
    "分類": "氷河のギフト",
    "名前(日本語)": "熱奪い",
    "名前(英語)": "Heatstealer",
    "取得時の消費pt": "5",
    "発動時の消費fat": "1",
    "内容(日本語)": "攻撃で敵から奪ったWarmth（体温）の半分を自分の体温として吸収・回復する。シーン終了時まで持続。",
    "内容(英語)": "Gains half of the Warmth damage dealt to enemies as Warmth for oneself until the end of the scene."
  },
  {
    "分類": "氷河のギフト",
    "名前(日本語)": "ナビゲーション（方位術）",
    "名前(英語)": "Navigation",
    "取得時の消費pt": "3",
    "発動時の消費fat": "0",
    "内容(日本語)": "海や山の方角を常に把握する。Soul of the Glacier判定で特定の場所を探し当てられる。常時発動。",
    "内容(英語)": "Unerring sense of direction toward sea and mountains; can locate landmarks with a Soul of the Glacier roll. Always active."
  },
  {
    "分類": "哲学能力 / 氷河のギフト",
    "名前(日本語)": "鋭いクチバシ",
    "名前(英語)": "Sharpened Beak",
    "取得時の消費pt": "1",
    "発動時の消費fat": "0",
    "内容(日本語)": "クチバシによる攻撃のダメージが+1される。常時発動。",
    "内容(英語)": "Beak deals +1 extra damage on attacks. Always active."
  },
  {
    "分類": "氷河のギフト",
    "名前(日本語)": "静かな地平線",
    "名前(英語)": "Silent Horizon",
    "取得時の消費pt": "2-5",
    "発動時の消費fat": "1",
    "内容(日本語)": "雪や氷の上を音を立てずに移動できる。Survival判定にボーナス（+2〜+5）を得る。シーン終了時まで持続。",
    "内容(英語)": "Allows silent movement over ice and snow, granting a bonus (+2 to +5) to Survival rolls for the scene."
  },
  {
    "分類": "氷河のギフト",
    "名前(日本語)": "雪と氷",
    "名前(英語)": "Snow and Ice",
    "取得時の消費pt": "4",
    "発動時の消費fat": "1",
    "内容(日本語)": "雪を氷に変化させ、雪玉のダメージを増やしたり、雪層を加工して落とし穴や陣地を作る。",
    "内容(英語)": "Transforms snow into ice, enhancing snowball damage or shaping snow into pits and traps."
  },
  {
    "分類": "氷河のギフト",
    "名前(日本語)": "雪目",
    "名前(英語)": "Snow Blindness",
    "取得時の消費pt": "3",
    "発動時の消費fat": "1",
    "内容(日本語)": "対象を雪目で盲目状態にし、Agilityを2下げ、視界を奪う。シーン終了時まで持続。",
    "内容(英語)": "Curses a target with snow blindness, lowering Agility by 2 and blinding them until the end of the scene."
  },
  {
    "分類": "氷河のギフト",
    "名前(日本語)": "雪の視界",
    "名前(英語)": "Snow Vision",
    "取得時の消費pt": "2",
    "発動時の消費fat": "0",
    "内容(日本語)": "猛吹雪や暗闇、雪目の中でも昼間のように見通すことができる。常時発動。",
    "内容(英語)": "Allows clear vision in blizzards, darkness, or snow blindness. Always active."
  },
  {
    "分類": "哲学能力 / 氷河のギフト",
    "名前(日本語)": "精神の牢獄",
    "名前(英語)": "Prison of the Mind",
    "取得時の消費pt": "4",
    "発動時の消費fat": "1",
    "内容(日本語)": "哲学攻撃に成功すると、敵を金縛りにしてシーン終了時まで移動不能にする。",
    "内容(英語)": "Immobilizes an enemy until the end of the scene upon a successful philosophical attack."
  },
  {
    "分類": "哲学能力 / 氷河のギフト",
    "名前(日本語)": "海の影",
    "名前(英語)": "Shadow of the Sea",
    "取得時の消費pt": "2",
    "発動時の消費fat": "1",
    "内容(日本語)": "水中にいる間、非戦闘判定のAgility判定に+1、潜伏や奇襲などのSurvival判定に+2のボーナス。シーン終了時まで持続。",
    "内容(英語)": "Grants non-combat Agility (+1) and stealth-related Survival (+2) bonuses while immersed in water for the scene."
  },
  {
    "分類": "哲学能力 / 氷河のギフト",
    "名前(日本語)": "スノーケープ（雪の外套）",
    "名前(英語)": "Snow Cape",
    "取得時の消費pt": "4",
    "発動時の消費fat": "1",
    "内容(日本語)": "背中を一時的に白く変色させ、隠密・奇襲判定にダイス+3のボーナスを得る。シーン終了時まで持続。",
    "内容(英語)": "Turns the user's back white, granting +3 dice to sneaking, ambushes, and hiding for the scene."
  },
  {
    "分類": "哲学能力 / 氷河のギフト",
    "名前(日本語)": "雪玉 / 凍結玉",
    "名前(英語)": "Snowball / Frostball",
    "取得時の消費pt": "1-2",
    "発動時の消費fat": "1",
    "内容(日本語)": "超自然的に硬く冷たい雪玉（1pt: ダメージ+0）または氷の玉（2pt: ダメージ+1）を投擲する。",
    "内容(英語)": "Throws a supernatural snowball (+0 damage for 1pt) or frostball (+1 damage for 2pt)."
  },
  {
    "分類": "氷河のギフト",
    "名前(日本語)": "氷河の歌声",
    "名前(英語)": "Voice of the Glacier",
    "取得時の消費pt": "5",
    "発動時の消費fat": "0",
    "内容(日本語)": "睡眠や休息が不要になり、精神影響系の能力を無効化し、煽動判定に+2ボーナスを得る。常時発動。",
    "内容(英語)": "Eliminates need for sleep, grants immunity to mind-affecting powers, and adds +2 to demagoguery rolls. Always active."
  },
  {
    "分類": "氷河のギフト",
    "名前(日本語)": "氷の怒り",
    "名前(英語)": "Wrath of Ice",
    "取得時の消費pt": "1",
    "発動時の消費fat": "1",
    "内容(日本語)": "氷の表面から小さな棘を生やし、踏んだ者に1ダイスのダメージを与える罠を作る。",
    "内容(英語)": "Spawns small ice spikes on the surface, dealing 1 die of damage to anyone who steps on them."
  }
];
