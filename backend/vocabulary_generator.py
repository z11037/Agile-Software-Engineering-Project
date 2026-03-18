"""
Additional vocabulary generator to reach 10,000+ words
This file contains programmatic word generation to supplement the main seed data
"""

def generate_additional_vocabulary():
    """
    Generate additional vocabulary words using common English word patterns,
    prefixes, suffixes, and word families to reach 10,000+ total words.
    """
    additional_words = []
    
    # Common verb forms (past, present, continuous, etc.)
    base_verbs = [
        ("walk", "走路", 1, "verbs"), ("talk", "说话", 1, "verbs"), ("jump", "跳", 1, "verbs"),
        ("climb", "爬", 1, "verbs"), ("swim", "游泳", 1, "verbs"), ("fly", "飞", 1, "verbs"),
        ("dance", "跳舞", 1, "verbs"), ("sing", "唱歌", 1, "verbs"), ("paint", "绘画", 1, "verbs"),
        ("draw", "画画", 1, "verbs"), ("cook", "烹饪", 1, "verbs"), ("bake", "烘焙", 1, "verbs"),
        ("clean", "清洁", 1, "verbs"), ("wash", "洗", 1, "verbs"), ("dry", "干燥", 1, "verbs"),
        ("iron", "熨烫", 1, "verbs"), ("fold", "折叠", 1, "verbs"), ("hang", "挂", 1, "verbs"),
        ("sweep", "扫", 1, "verbs"), ("mop", "拖地", 1, "verbs"), ("dust", "除尘", 1, "verbs"),
        ("vacuum", "用吸尘器清扫", 2, "verbs"), ("polish", "擦亮", 2, "verbs"),
        ("organize", "组织", 2, "verbs"), ("arrange", "安排", 2, "verbs"),
        ("decorate", "装饰", 2, "verbs"), ("renovate", "翻新", 2, "verbs"),
        ("construct", "建造", 2, "verbs"), ("demolish", "拆除", 2, "verbs"),
        ("assemble", "组装", 2, "verbs"), ("disassemble", "拆卸", 2, "verbs"),
    ]
    
    for base, chinese, diff, cat in base_verbs:
        # Add base form
        additional_words.append((base, chinese, "verb", diff, cat, f"I {base} every day."))
        # Add -ing form
        ing_form = base + "ing" if base.endswith("e") and len(base) > 2 else base + "ing"
        if base.endswith("e"):
            ing_form = base[:-1] + "ing"
        additional_words.append((ing_form, chinese + "中", "verb", diff, cat, f"I am {ing_form} now."))
        # Add -ed form for past
        ed_form = base + "d" if base.endswith("e") else base + "ed"
        additional_words.append((ed_form, chinese + "了", "verb", diff, cat, f"I {ed_form} yesterday."))
    
    # Common adjective pairs (opposites)
    adjective_pairs = [
        ("tall", "高的", "short", "矮的", 1, "adjectives"),
        ("wide", "宽的", "narrow", "窄的", 1, "adjectives"),
        ("deep", "深的", "shallow", "浅的", 2, "adjectives"),
        ("thick", "厚的", "thin", "薄的", 1, "adjectives"),
        ("rich", "富有的", "poor", "贫穷的", 1, "adjectives"),
        ("young", "年轻的", "old", "年老的", 1, "adjectives"),
        ("modern", "现代的", "ancient", "古代的", 2, "adjectives"),
        ("simple", "简单的", "complex", "复杂的", 2, "adjectives"),
        ("rough", "粗糙的", "smooth", "光滑的", 2, "adjectives"),
        ("bitter", "苦的", "sweet", "甜的", 1, "food"),
        ("sour", "酸的", "sweet", "甜的", 1, "food"),
        ("spicy", "辣的", "mild", "温和的", 2, "food"),
        ("fresh", "新鲜的", "stale", "不新鲜的", 2, "food"),
        ("raw", "生的", "cooked", "熟的", 1, "food"),
        ("ripe", "成熟的", "unripe", "未成熟的", 2, "food"),
        ("solid", "固体的", "liquid", "液体的", 2, "science"),
        ("visible", "可见的", "invisible", "看不见的", 2, "science"),
        ("transparent", "透明的", "opaque", "不透明的", 3, "science"),
        ("flexible", "灵活的", "rigid", "僵硬的", 3, "science"),
        ("elastic", "有弹性的", "inelastic", "无弹性的", 3, "science"),
    ]
    
    for adj1, cn1, adj2, cn2, diff, cat in adjective_pairs:
        additional_words.append((adj1, cn1, "adjective", diff, cat, f"It is very {adj1}."))
        additional_words.append((adj2, cn2, "adjective", diff, cat, f"It is very {adj2}."))
    
    # Common nouns - body parts
    body_parts = [
        ("forehead", "前额", 2), ("eyebrow", "眉毛", 2), ("eyelash", "睫毛", 2),
        ("eyelid", "眼睑", 2), ("cheek", "脸颊", 1), ("chin", "下巴", 1),
        ("jaw", "下颌", 2), ("lip", "嘴唇", 1), ("gum", "牙龈", 2),
        ("throat", "喉咙", 2), ("spine", "脊柱", 2), ("rib", "肋骨", 2),
        ("hip", "臀部", 2), ("thigh", "大腿", 2), ("calf", "小腿", 2),
        ("ankle", "脚踝", 1), ("heel", "脚跟", 2), ("sole", "脚底", 2),
        ("palm", "手掌", 2), ("knuckle", "指关节", 2), ("nail", "指甲", 1),
        ("waist", "腰", 1), ("belly", "腹部", 1), ("navel", "肚脐", 2),
    ]
    
    for word, chinese, diff in body_parts:
        additional_words.append((word, chinese, "noun", diff, "health", f"My {word} hurts."))
    
    # Common nouns - animals
    animals = [
        ("zebra", "斑马", 2), ("giraffe", "长颈鹿", 2), ("hippopotamus", "河马", 2),
        ("rhinoceros", "犀牛", 2), ("leopard", "豹", 2), ("cheetah", "猎豹", 2),
        ("panther", "黑豹", 2), ("jaguar", "美洲豹", 2), ("puma", "美洲狮", 2),
        ("cougar", "美洲狮", 2), ("lynx", "猞猁", 3), ("bobcat", "山猫", 3),
        ("hyena", "鬣狗", 3), ("jackal", "豺", 3), ("coyote", "郊狼", 3),
        ("badger", "獾", 3), ("otter", "水獭", 2), ("beaver", "海狸", 2),
        ("squirrel", "松鼠", 2), ("chipmunk", "花栗鼠", 3), ("hamster", "仓鼠", 2),
        ("guinea pig", "豚鼠", 2), ("hedgehog", "刺猬", 2), ("porcupine", "豪猪", 3),
        ("raccoon", "浣熊", 2), ("skunk", "臭鼬", 3), ("opossum", "负鼠", 3),
        ("kangaroo", "袋鼠", 2), ("koala", "考拉", 2), ("platypus", "鸭嘴兽", 3),
        ("penguin", "企鹅", 2), ("ostrich", "鸵鸟", 2), ("emu", "鸸鹋", 3),
        ("flamingo", "火烈鸟", 2), ("pelican", "鹈鹕", 3), ("stork", "鹳", 3),
        ("crane", "鹤", 2), ("heron", "苍鹭", 3), ("egret", "白鹭", 3),
        ("swan", "天鹅", 2), ("peacock", "孔雀", 2), ("parrot", "鹦鹉", 2),
        ("eagle", "鹰", 2), ("hawk", "鹰", 2), ("falcon", "猎鹰", 2),
        ("owl", "猫头鹰", 2), ("vulture", "秃鹫", 3), ("crow", "乌鸦", 2),
        ("raven", "渡鸦", 3), ("magpie", "喜鹊", 2), ("sparrow", "麻雀", 2),
        ("swallow", "燕子", 2), ("robin", "知更鸟", 2), ("pigeon", "鸽子", 2),
        ("dove", "鸽子", 2), ("seagull", "海鸥", 2), ("albatross", "信天翁", 3),
        ("crocodile", "鳄鱼", 2), ("alligator", "短吻鳄", 2), ("lizard", "蜥蜴", 2),
        ("iguana", "鬣蜥", 3), ("chameleon", "变色龙", 2), ("gecko", "壁虎", 2),
        ("salamander", "蝾螈", 3), ("toad", "蟾蜍", 2), ("tadpole", "蝌蚪", 2),
        ("whale", "鲸鱼", 2), ("dolphin", "海豚", 2), ("shark", "鲨鱼", 2),
        ("octopus", "章鱼", 2), ("squid", "鱿鱼", 2), ("jellyfish", "水母", 2),
        ("starfish", "海星", 2), ("seahorse", "海马", 2), ("crab", "螃蟹", 1),
        ("lobster", "龙虾", 2), ("shrimp", "虾", 1), ("oyster", "牡蛎", 2),
        ("clam", "蛤蜊", 2), ("mussel", "贻贝", 3), ("snail", "蜗牛", 2),
        ("slug", "鼻涕虫", 3), ("worm", "蠕虫", 2), ("caterpillar", "毛毛虫", 2),
        ("cocoon", "茧", 2), ("moth", "飞蛾", 2), ("beetle", "甲虫", 2),
        ("ladybug", "瓢虫", 2), ("dragonfly", "蜻蜓", 2), ("grasshopper", "蚱蜢", 2),
        ("cricket", "蟋蟀", 2), ("mosquito", "蚊子", 1), ("wasp", "黄蜂", 2),
        ("hornet", "大黄蜂", 3), ("termite", "白蚁", 3), ("cockroach", "蟑螂", 2),
    ]
    
    for word, chinese, diff in animals:
        additional_words.append((word, chinese, "noun", diff, "animals", f"I saw a {word}."))
    
    # Common nouns - plants and nature
    plants = [
        ("oak", "橡树", 2), ("pine", "松树", 2), ("maple", "枫树", 2),
        ("willow", "柳树", 2), ("birch", "桦树", 2), ("elm", "榆树", 3),
        ("cedar", "雪松", 3), ("cypress", "柏树", 3), ("redwood", "红杉", 3),
        ("bamboo", "竹子", 2), ("palm", "棕榈", 2), ("cactus", "仙人掌", 2),
        ("fern", "蕨类", 2), ("moss", "苔藓", 2), ("algae", "藻类", 3),
        ("fungus", "真菌", 3), ("mushroom", "蘑菇", 2), ("toadstool", "毒蘑菇", 3),
        ("rose", "玫瑰", 1), ("tulip", "郁金香", 2), ("daisy", "雏菊", 2),
        ("sunflower", "向日葵", 2), ("lily", "百合", 2), ("orchid", "兰花", 2),
        ("violet", "紫罗兰", 2), ("carnation", "康乃馨", 2), ("chrysanthemum", "菊花", 2),
        ("peony", "牡丹", 2), ("lotus", "莲花", 2), ("jasmine", "茉莉", 2),
        ("lavender", "薰衣草", 2), ("dandelion", "蒲公英", 2), ("clover", "三叶草", 2),
        ("ivy", "常春藤", 2), ("vine", "藤蔓", 2), ("shrub", "灌木", 2),
        ("bush", "灌木丛", 2), ("hedge", "树篱", 2), ("lawn", "草坪", 2),
        ("meadow", "草地", 2), ("prairie", "大草原", 3), ("savanna", "热带草原", 3),
        ("tundra", "苔原", 3), ("taiga", "针叶林", 3), ("rainforest", "雨林", 2),
    ]
    
    for word, chinese, diff in plants:
        additional_words.append((word, chinese, "noun", diff, "nature", f"The {word} is beautiful."))
    
    # Common nouns - food items
    foods = [
        ("lettuce", "生菜", 2), ("cabbage", "卷心菜", 2), ("spinach", "菠菜", 2),
        ("broccoli", "西兰花", 2), ("cauliflower", "花椰菜", 2), ("celery", "芹菜", 2),
        ("cucumber", "黄瓜", 1), ("zucchini", "西葫芦", 2), ("eggplant", "茄子", 2),
        ("pepper", "辣椒", 1), ("pumpkin", "南瓜", 2), ("squash", "南瓜", 2),
        ("radish", "萝卜", 2), ("turnip", "芜菁", 3), ("beet", "甜菜", 2),
        ("corn", "玉米", 1), ("pea", "豌豆", 1), ("bean", "豆", 1),
        ("lentil", "扁豆", 2), ("chickpea", "鹰嘴豆", 2), ("soybean", "大豆", 2),
        ("tofu", "豆腐", 1), ("tempeh", "豆豉", 3), ("miso", "味噌", 3),
        ("soy sauce", "酱油", 1), ("vinegar", "醋", 2), ("mustard", "芥末", 2),
        ("ketchup", "番茄酱", 1), ("mayonnaise", "蛋黄酱", 2), ("relish", "调味品", 3),
        ("pickle", "泡菜", 2), ("jam", "果酱", 1), ("jelly", "果冻", 1),
        ("marmalade", "橘子酱", 3), ("honey", "蜂蜜", 1), ("syrup", "糖浆", 2),
        ("molasses", "糖蜜", 3), ("maple syrup", "枫糖浆", 2),
        ("pork", "猪肉", 1), ("beef", "牛肉", 1), ("lamb", "羊肉", 2),
        ("mutton", "羊肉", 2), ("veal", "小牛肉", 3), ("venison", "鹿肉", 3),
        ("bacon", "培根", 2), ("ham", "火腿", 1), ("sausage", "香肠", 2),
        ("steak", "牛排", 2), ("chop", "排骨", 2), ("roast", "烤肉", 2),
        ("salmon", "三文鱼", 2), ("tuna", "金枪鱼", 2), ("trout", "鳟鱼", 2),
        ("cod", "鳕鱼", 2), ("halibut", "比目鱼", 3), ("sardine", "沙丁鱼", 2),
        ("anchovy", "凤尾鱼", 3), ("herring", "鲱鱼", 3), ("mackerel", "鲭鱼", 3),
        ("strawberry", "草莓", 1), ("blueberry", "蓝莓", 2), ("raspberry", "覆盆子", 2),
        ("blackberry", "黑莓", 2), ("cranberry", "蔓越莓", 2), ("gooseberry", "醋栗", 3),
        ("grape", "葡萄", 1), ("cherry", "樱桃", 1), ("peach", "桃子", 1),
        ("plum", "李子", 2), ("pear", "梨", 1), ("orange", "橙子", 1),
        ("lemon", "柠檬", 1), ("lime", "酸橙", 2), ("grapefruit", "柚子", 2),
        ("tangerine", "橘子", 2), ("mandarin", "柑橘", 2), ("kiwi", "猕猴桃", 2),
        ("mango", "芒果", 2), ("papaya", "木瓜", 2), ("pineapple", "菠萝", 1),
        ("watermelon", "西瓜", 1), ("melon", "甜瓜", 1), ("cantaloupe", "哈密瓜", 2),
        ("coconut", "椰子", 2), ("avocado", "鳄梨", 2), ("fig", "无花果", 2),
        ("date", "枣", 2), ("raisin", "葡萄干", 2), ("prune", "李子干", 3),
        ("almond", "杏仁", 2), ("walnut", "核桃", 2), ("peanut", "花生", 1),
        ("cashew", "腰果", 2), ("pistachio", "开心果", 2), ("hazelnut", "榛子", 2),
        ("pecan", "山核桃", 3), ("chestnut", "栗子", 2), ("macadamia", "夏威夷果", 3),
    ]
    
    for word, chinese, diff in foods:
        additional_words.append((word, chinese, "noun", diff, "food", f"I like {word}."))
    
    # Technology and computing terms
    tech_terms = [
        ("algorithm", "算法", 3), ("binary", "二进制", 3), ("byte", "字节", 2),
        ("cache", "缓存", 3), ("compiler", "编译器", 3), ("cursor", "光标", 2),
        ("debug", "调试", 3), ("encrypt", "加密", 3), ("firewall", "防火墙", 3),
        ("gigabyte", "千兆字节", 2), ("hardware", "硬件", 2), ("interface", "界面", 2),
        ("kernel", "内核", 3), ("malware", "恶意软件", 3), ("pixel", "像素", 2),
        ("protocol", "协议", 3), ("router", "路由器", 2), ("server", "服务器", 2),
        ("syntax", "语法", 3), ("terminal", "终端", 3), ("upload", "上传", 2),
        ("virus", "病毒", 2), ("widget", "小部件", 3), ("bandwidth", "带宽", 3),
        ("bluetooth", "蓝牙", 2), ("broadband", "宽带", 2), ("browser", "浏览器", 2),
        ("cookie", "Cookie", 2), ("domain", "域名", 2), ("ethernet", "以太网", 3),
        ("firmware", "固件", 3), ("gateway", "网关", 3), ("hashtag", "话题标签", 2),
        ("hyperlink", "超链接", 2), ("inbox", "收件箱", 2), ("jpeg", "JPEG格式", 2),
        ("keyword", "关键词", 2), ("login", "登录", 2), ("megabyte", "兆字节", 2),
        ("modem", "调制解调器", 2), ("podcast", "播客", 2), ("spam", "垃圾邮件", 2),
        ("streaming", "流媒体", 2), ("toolbar", "工具栏", 2), ("username", "用户名", 2),
        ("webcam", "网络摄像头", 2), ("wifi", "无线网络", 1), ("zip", "压缩", 2),
    ]
    
    for word, chinese, diff in tech_terms:
        additional_words.append((word, chinese, "noun", diff, "technology", f"The {word} is important."))
    
    # Business and finance terms
    business_terms = [
        ("account", "账户", 2), ("audit", "审计", 3), ("balance", "余额", 2),
        ("bankruptcy", "破产", 3), ("bond", "债券", 3), ("capital", "资本", 3),
        ("cash", "现金", 1), ("credit", "信用", 2), ("debt", "债务", 2),
        ("dividend", "股息", 3), ("equity", "股权", 3), ("finance", "金融", 2),
        ("forecast", "预测", 3), ("inflation", "通货膨胀", 3), ("interest", "利息", 2),
        ("invoice", "发票", 2), ("lease", "租赁", 2), ("liability", "负债", 3),
        ("loan", "贷款", 2), ("margin", "利润", 3), ("mortgage", "抵押贷款", 3),
        ("portfolio", "投资组合", 3), ("premium", "保费", 3), ("quota", "配额", 3),
        ("receipt", "收据", 2), ("refund", "退款", 2), ("revenue", "收入", 3),
        ("stock", "股票", 2), ("subsidy", "补贴", 3), ("tax", "税", 2),
        ("transaction", "交易", 2), ("voucher", "凭证", 2), ("warranty", "保修", 2),
    ]
    
    for word, chinese, diff in business_terms:
        additional_words.append((word, chinese, "noun", diff, "business", f"The {word} is calculated."))
    
    # Academic and scientific terms
    academic_terms = [
        ("abstract", "摘要", 3), ("bibliography", "参考书目", 3), ("citation", "引用", 3),
        ("correlation", "相关性", 3), ("criteria", "标准", 3), ("data", "数据", 2),
        ("definition", "定义", 2), ("empirical", "经验的", 3), ("framework", "框架", 3),
        ("hypothesis", "假设", 3), ("inference", "推理", 3), ("methodology", "方法论", 3),
        ("objective", "客观的", 2), ("paradigm", "范式", 3), ("qualitative", "定性的", 3),
        ("quantitative", "定量的", 3), ("rationale", "理由", 3), ("statistics", "统计", 3),
        ("synthesis", "综合", 3), ("theorem", "定理", 3), ("variable", "变量", 3),
    ]
    
    for word, chinese, diff in academic_terms:
        additional_words.append((word, chinese, "noun", diff, "academic", f"The {word} is important."))
    
    # Convert to proper format
    result = []
    for item in additional_words:
        if len(item) == 6:
            english, chinese, pos, diff, cat, example = item
        else:
            english, chinese, pos, diff, cat = item
            example = f"Example with {english}."
        
        result.append({
            "english": english,
            "chinese": chinese,
            "pos": pos,
            "ex": example,
            "diff": diff,
            "cat": cat
        })
    
    return result
