"""Seed the database with 200+ English words across categories and difficulty levels."""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from app.database import engine, SessionLocal, Base
from app.models.word import Word

SEED_WORDS = [
    # === Greetings & Daily Life (category: daily_life, easy) ===
    {"english": "hello", "chinese": "你好", "pos": "interjection", "ex": "Hello, how are you?", "diff": 1, "cat": "daily_life"},
    {"english": "goodbye", "chinese": "再见", "pos": "interjection", "ex": "Goodbye, see you tomorrow!", "diff": 1, "cat": "daily_life"},
    {"english": "thank you", "chinese": "谢谢", "pos": "phrase", "ex": "Thank you for your help.", "diff": 1, "cat": "daily_life"},
    {"english": "please", "chinese": "请", "pos": "adverb", "ex": "Please sit down.", "diff": 1, "cat": "daily_life"},
    {"english": "sorry", "chinese": "对不起", "pos": "adjective", "ex": "I'm sorry for being late.", "diff": 1, "cat": "daily_life"},
    {"english": "yes", "chinese": "是", "pos": "adverb", "ex": "Yes, I agree.", "diff": 1, "cat": "daily_life"},
    {"english": "no", "chinese": "不", "pos": "adverb", "ex": "No, thank you.", "diff": 1, "cat": "daily_life"},
    {"english": "morning", "chinese": "早上", "pos": "noun", "ex": "Good morning!", "diff": 1, "cat": "daily_life"},
    {"english": "night", "chinese": "晚上", "pos": "noun", "ex": "Good night, sleep well.", "diff": 1, "cat": "daily_life"},
    {"english": "today", "chinese": "今天", "pos": "adverb", "ex": "What are you doing today?", "diff": 1, "cat": "daily_life"},
    {"english": "tomorrow", "chinese": "明天", "pos": "adverb", "ex": "I will go tomorrow.", "diff": 1, "cat": "daily_life"},
    {"english": "yesterday", "chinese": "昨天", "pos": "adverb", "ex": "I saw her yesterday.", "diff": 1, "cat": "daily_life"},
    {"english": "friend", "chinese": "朋友", "pos": "noun", "ex": "She is my best friend.", "diff": 1, "cat": "daily_life"},
    {"english": "family", "chinese": "家庭", "pos": "noun", "ex": "My family is very kind.", "diff": 1, "cat": "daily_life"},
    {"english": "home", "chinese": "家", "pos": "noun", "ex": "I want to go home.", "diff": 1, "cat": "daily_life"},
    {"english": "name", "chinese": "名字", "pos": "noun", "ex": "What is your name?", "diff": 1, "cat": "daily_life"},
    {"english": "time", "chinese": "时间", "pos": "noun", "ex": "What time is it?", "diff": 1, "cat": "daily_life"},
    {"english": "day", "chinese": "天", "pos": "noun", "ex": "Have a nice day!", "diff": 1, "cat": "daily_life"},
    {"english": "week", "chinese": "星期", "pos": "noun", "ex": "See you next week.", "diff": 1, "cat": "daily_life"},
    {"english": "year", "chinese": "年", "pos": "noun", "ex": "Happy New Year!", "diff": 1, "cat": "daily_life"},

    # === Food & Drink (category: food, easy) ===
    {"english": "water", "chinese": "水", "pos": "noun", "ex": "Can I have some water?", "diff": 1, "cat": "food"},
    {"english": "food", "chinese": "食物", "pos": "noun", "ex": "The food is delicious.", "diff": 1, "cat": "food"},
    {"english": "rice", "chinese": "米饭", "pos": "noun", "ex": "I eat rice every day.", "diff": 1, "cat": "food"},
    {"english": "bread", "chinese": "面包", "pos": "noun", "ex": "I had bread for breakfast.", "diff": 1, "cat": "food"},
    {"english": "milk", "chinese": "牛奶", "pos": "noun", "ex": "She drinks milk every morning.", "diff": 1, "cat": "food"},
    {"english": "coffee", "chinese": "咖啡", "pos": "noun", "ex": "Would you like some coffee?", "diff": 1, "cat": "food"},
    {"english": "tea", "chinese": "茶", "pos": "noun", "ex": "Chinese tea is very popular.", "diff": 1, "cat": "food"},
    {"english": "egg", "chinese": "鸡蛋", "pos": "noun", "ex": "I had an egg for breakfast.", "diff": 1, "cat": "food"},
    {"english": "chicken", "chinese": "鸡肉", "pos": "noun", "ex": "Chicken is my favorite meat.", "diff": 1, "cat": "food"},
    {"english": "fruit", "chinese": "水果", "pos": "noun", "ex": "Fruit is good for health.", "diff": 1, "cat": "food"},
    {"english": "apple", "chinese": "苹果", "pos": "noun", "ex": "I eat an apple every day.", "diff": 1, "cat": "food"},
    {"english": "banana", "chinese": "香蕉", "pos": "noun", "ex": "Bananas are yellow.", "diff": 1, "cat": "food"},
    {"english": "vegetable", "chinese": "蔬菜", "pos": "noun", "ex": "Eat more vegetables.", "diff": 1, "cat": "food"},
    {"english": "breakfast", "chinese": "早餐", "pos": "noun", "ex": "Breakfast is the most important meal.", "diff": 1, "cat": "food"},
    {"english": "lunch", "chinese": "午餐", "pos": "noun", "ex": "Let's have lunch together.", "diff": 1, "cat": "food"},
    {"english": "dinner", "chinese": "晚餐", "pos": "noun", "ex": "What's for dinner tonight?", "diff": 1, "cat": "food"},
    {"english": "sugar", "chinese": "糖", "pos": "noun", "ex": "Too much sugar is bad for you.", "diff": 1, "cat": "food"},
    {"english": "salt", "chinese": "盐", "pos": "noun", "ex": "Please pass the salt.", "diff": 1, "cat": "food"},
    {"english": "meat", "chinese": "肉", "pos": "noun", "ex": "Do you eat meat?", "diff": 1, "cat": "food"},
    {"english": "fish", "chinese": "鱼", "pos": "noun", "ex": "Fish is healthy food.", "diff": 1, "cat": "food"},

    # === School & Education (category: school, easy-medium) ===
    {"english": "school", "chinese": "学校", "pos": "noun", "ex": "I go to school by bus.", "diff": 1, "cat": "school"},
    {"english": "teacher", "chinese": "老师", "pos": "noun", "ex": "My teacher is very kind.", "diff": 1, "cat": "school"},
    {"english": "student", "chinese": "学生", "pos": "noun", "ex": "She is a good student.", "diff": 1, "cat": "school"},
    {"english": "book", "chinese": "书", "pos": "noun", "ex": "I read a book every week.", "diff": 1, "cat": "school"},
    {"english": "class", "chinese": "课", "pos": "noun", "ex": "English class is at 9 AM.", "diff": 1, "cat": "school"},
    {"english": "homework", "chinese": "作业", "pos": "noun", "ex": "Have you finished your homework?", "diff": 1, "cat": "school"},
    {"english": "exam", "chinese": "考试", "pos": "noun", "ex": "The exam is next Monday.", "diff": 2, "cat": "school"},
    {"english": "library", "chinese": "图书馆", "pos": "noun", "ex": "I study in the library.", "diff": 2, "cat": "school"},
    {"english": "dictionary", "chinese": "字典", "pos": "noun", "ex": "Use a dictionary to look up new words.", "diff": 2, "cat": "school"},
    {"english": "notebook", "chinese": "笔记本", "pos": "noun", "ex": "I write notes in my notebook.", "diff": 1, "cat": "school"},
    {"english": "pen", "chinese": "钢笔", "pos": "noun", "ex": "Can I borrow your pen?", "diff": 1, "cat": "school"},
    {"english": "pencil", "chinese": "铅笔", "pos": "noun", "ex": "Write with a pencil first.", "diff": 1, "cat": "school"},
    {"english": "question", "chinese": "问题", "pos": "noun", "ex": "Do you have any questions?", "diff": 1, "cat": "school"},
    {"english": "answer", "chinese": "答案", "pos": "noun", "ex": "The answer is correct.", "diff": 1, "cat": "school"},
    {"english": "learn", "chinese": "学习", "pos": "verb", "ex": "I want to learn English.", "diff": 1, "cat": "school"},
    {"english": "study", "chinese": "学习", "pos": "verb", "ex": "I study every evening.", "diff": 1, "cat": "school"},
    {"english": "read", "chinese": "阅读", "pos": "verb", "ex": "Read this passage carefully.", "diff": 1, "cat": "school"},
    {"english": "write", "chinese": "写", "pos": "verb", "ex": "Please write your name.", "diff": 1, "cat": "school"},
    {"english": "understand", "chinese": "理解", "pos": "verb", "ex": "I don't understand this sentence.", "diff": 2, "cat": "school"},
    {"english": "practice", "chinese": "练习", "pos": "verb", "ex": "Practice makes perfect.", "diff": 2, "cat": "school"},

    # === Common Verbs (category: verbs, easy-medium) ===
    {"english": "go", "chinese": "去", "pos": "verb", "ex": "Let's go to the park.", "diff": 1, "cat": "verbs"},
    {"english": "come", "chinese": "来", "pos": "verb", "ex": "Come here, please.", "diff": 1, "cat": "verbs"},
    {"english": "eat", "chinese": "吃", "pos": "verb", "ex": "I eat breakfast at 7 AM.", "diff": 1, "cat": "verbs"},
    {"english": "drink", "chinese": "喝", "pos": "verb", "ex": "I drink water every day.", "diff": 1, "cat": "verbs"},
    {"english": "sleep", "chinese": "睡觉", "pos": "verb", "ex": "I sleep at 10 PM.", "diff": 1, "cat": "verbs"},
    {"english": "walk", "chinese": "走路", "pos": "verb", "ex": "I walk to school.", "diff": 1, "cat": "verbs"},
    {"english": "run", "chinese": "跑", "pos": "verb", "ex": "He can run very fast.", "diff": 1, "cat": "verbs"},
    {"english": "speak", "chinese": "说", "pos": "verb", "ex": "Can you speak English?", "diff": 1, "cat": "verbs"},
    {"english": "listen", "chinese": "听", "pos": "verb", "ex": "Listen to the teacher.", "diff": 1, "cat": "verbs"},
    {"english": "see", "chinese": "看见", "pos": "verb", "ex": "I can see the mountain.", "diff": 1, "cat": "verbs"},
    {"english": "like", "chinese": "喜欢", "pos": "verb", "ex": "I like reading books.", "diff": 1, "cat": "verbs"},
    {"english": "want", "chinese": "想要", "pos": "verb", "ex": "I want to travel.", "diff": 1, "cat": "verbs"},
    {"english": "need", "chinese": "需要", "pos": "verb", "ex": "I need your help.", "diff": 1, "cat": "verbs"},
    {"english": "know", "chinese": "知道", "pos": "verb", "ex": "I know the answer.", "diff": 1, "cat": "verbs"},
    {"english": "think", "chinese": "认为", "pos": "verb", "ex": "I think it's a good idea.", "diff": 2, "cat": "verbs"},
    {"english": "make", "chinese": "做", "pos": "verb", "ex": "Let me make you a cup of tea.", "diff": 1, "cat": "verbs"},
    {"english": "give", "chinese": "给", "pos": "verb", "ex": "Give me the book, please.", "diff": 1, "cat": "verbs"},
    {"english": "take", "chinese": "拿", "pos": "verb", "ex": "Take your umbrella.", "diff": 1, "cat": "verbs"},
    {"english": "help", "chinese": "帮助", "pos": "verb", "ex": "Can you help me?", "diff": 1, "cat": "verbs"},
    {"english": "work", "chinese": "工作", "pos": "verb", "ex": "I work from 9 to 5.", "diff": 1, "cat": "verbs"},

    # === Common Adjectives (category: adjectives, easy-medium) ===
    {"english": "good", "chinese": "好的", "pos": "adjective", "ex": "This is a good book.", "diff": 1, "cat": "adjectives"},
    {"english": "bad", "chinese": "坏的", "pos": "adjective", "ex": "That was a bad idea.", "diff": 1, "cat": "adjectives"},
    {"english": "big", "chinese": "大的", "pos": "adjective", "ex": "This is a big city.", "diff": 1, "cat": "adjectives"},
    {"english": "small", "chinese": "小的", "pos": "adjective", "ex": "I live in a small town.", "diff": 1, "cat": "adjectives"},
    {"english": "new", "chinese": "新的", "pos": "adjective", "ex": "I bought a new phone.", "diff": 1, "cat": "adjectives"},
    {"english": "old", "chinese": "旧的", "pos": "adjective", "ex": "This is an old building.", "diff": 1, "cat": "adjectives"},
    {"english": "hot", "chinese": "热的", "pos": "adjective", "ex": "The weather is very hot.", "diff": 1, "cat": "adjectives"},
    {"english": "cold", "chinese": "冷的", "pos": "adjective", "ex": "It's cold outside.", "diff": 1, "cat": "adjectives"},
    {"english": "happy", "chinese": "快乐的", "pos": "adjective", "ex": "She looks very happy.", "diff": 1, "cat": "adjectives"},
    {"english": "sad", "chinese": "伤心的", "pos": "adjective", "ex": "Don't be sad.", "diff": 1, "cat": "adjectives"},
    {"english": "beautiful", "chinese": "美丽的", "pos": "adjective", "ex": "What a beautiful view!", "diff": 2, "cat": "adjectives"},
    {"english": "easy", "chinese": "容易的", "pos": "adjective", "ex": "This question is easy.", "diff": 1, "cat": "adjectives"},
    {"english": "difficult", "chinese": "困难的", "pos": "adjective", "ex": "Math is difficult for me.", "diff": 2, "cat": "adjectives"},
    {"english": "fast", "chinese": "快的", "pos": "adjective", "ex": "The car is very fast.", "diff": 1, "cat": "adjectives"},
    {"english": "slow", "chinese": "慢的", "pos": "adjective", "ex": "Speak slowly, please.", "diff": 1, "cat": "adjectives"},
    {"english": "important", "chinese": "重要的", "pos": "adjective", "ex": "Health is very important.", "diff": 2, "cat": "adjectives"},
    {"english": "different", "chinese": "不同的", "pos": "adjective", "ex": "They are very different.", "diff": 2, "cat": "adjectives"},
    {"english": "same", "chinese": "相同的", "pos": "adjective", "ex": "We are in the same class.", "diff": 2, "cat": "adjectives"},
    {"english": "cheap", "chinese": "便宜的", "pos": "adjective", "ex": "This bag is very cheap.", "diff": 1, "cat": "adjectives"},
    {"english": "expensive", "chinese": "昂贵的", "pos": "adjective", "ex": "That watch is too expensive.", "diff": 2, "cat": "adjectives"},

    # === Numbers & Quantities (category: numbers, easy) ===
    {"english": "one", "chinese": "一", "pos": "number", "ex": "I have one brother.", "diff": 1, "cat": "numbers"},
    {"english": "two", "chinese": "二", "pos": "number", "ex": "I have two eyes.", "diff": 1, "cat": "numbers"},
    {"english": "three", "chinese": "三", "pos": "number", "ex": "There are three apples.", "diff": 1, "cat": "numbers"},
    {"english": "ten", "chinese": "十", "pos": "number", "ex": "I have ten fingers.", "diff": 1, "cat": "numbers"},
    {"english": "hundred", "chinese": "百", "pos": "number", "ex": "One hundred students passed.", "diff": 1, "cat": "numbers"},
    {"english": "thousand", "chinese": "千", "pos": "number", "ex": "It costs a thousand dollars.", "diff": 2, "cat": "numbers"},
    {"english": "many", "chinese": "许多", "pos": "adjective", "ex": "There are many people here.", "diff": 1, "cat": "numbers"},
    {"english": "few", "chinese": "少数", "pos": "adjective", "ex": "Only a few students came.", "diff": 2, "cat": "numbers"},
    {"english": "some", "chinese": "一些", "pos": "adjective", "ex": "I need some water.", "diff": 1, "cat": "numbers"},
    {"english": "all", "chinese": "所有", "pos": "adjective", "ex": "All students must attend.", "diff": 1, "cat": "numbers"},

    # === Travel & Places (category: travel, medium) ===
    {"english": "airport", "chinese": "机场", "pos": "noun", "ex": "We arrived at the airport early.", "diff": 2, "cat": "travel"},
    {"english": "hotel", "chinese": "酒店", "pos": "noun", "ex": "The hotel has a nice view.", "diff": 2, "cat": "travel"},
    {"english": "restaurant", "chinese": "餐厅", "pos": "noun", "ex": "Let's eat at a restaurant.", "diff": 2, "cat": "travel"},
    {"english": "hospital", "chinese": "医院", "pos": "noun", "ex": "He went to the hospital.", "diff": 2, "cat": "travel"},
    {"english": "station", "chinese": "车站", "pos": "noun", "ex": "The train station is nearby.", "diff": 2, "cat": "travel"},
    {"english": "map", "chinese": "地图", "pos": "noun", "ex": "Do you have a map?", "diff": 1, "cat": "travel"},
    {"english": "ticket", "chinese": "票", "pos": "noun", "ex": "I bought a train ticket.", "diff": 2, "cat": "travel"},
    {"english": "passport", "chinese": "护照", "pos": "noun", "ex": "Don't forget your passport.", "diff": 2, "cat": "travel"},
    {"english": "bus", "chinese": "公共汽车", "pos": "noun", "ex": "I take the bus to work.", "diff": 1, "cat": "travel"},
    {"english": "taxi", "chinese": "出租车", "pos": "noun", "ex": "Let's take a taxi.", "diff": 1, "cat": "travel"},
    {"english": "train", "chinese": "火车", "pos": "noun", "ex": "The train arrives at 3 PM.", "diff": 1, "cat": "travel"},
    {"english": "airplane", "chinese": "飞机", "pos": "noun", "ex": "We traveled by airplane.", "diff": 2, "cat": "travel"},
    {"english": "street", "chinese": "街道", "pos": "noun", "ex": "Walk down the street.", "diff": 1, "cat": "travel"},
    {"english": "city", "chinese": "城市", "pos": "noun", "ex": "Beijing is a big city.", "diff": 1, "cat": "travel"},
    {"english": "country", "chinese": "国家", "pos": "noun", "ex": "China is a large country.", "diff": 2, "cat": "travel"},
    {"english": "bridge", "chinese": "桥", "pos": "noun", "ex": "We crossed the bridge.", "diff": 2, "cat": "travel"},
    {"english": "mountain", "chinese": "山", "pos": "noun", "ex": "The mountain is very high.", "diff": 2, "cat": "travel"},
    {"english": "river", "chinese": "河", "pos": "noun", "ex": "The river is very long.", "diff": 2, "cat": "travel"},
    {"english": "beach", "chinese": "海滩", "pos": "noun", "ex": "Let's go to the beach.", "diff": 2, "cat": "travel"},
    {"english": "park", "chinese": "公园", "pos": "noun", "ex": "We play in the park.", "diff": 1, "cat": "travel"},

    # === Body & Health (category: health, medium) ===
    {"english": "head", "chinese": "头", "pos": "noun", "ex": "My head hurts.", "diff": 1, "cat": "health"},
    {"english": "eye", "chinese": "眼睛", "pos": "noun", "ex": "She has blue eyes.", "diff": 1, "cat": "health"},
    {"english": "hand", "chinese": "手", "pos": "noun", "ex": "Wash your hands.", "diff": 1, "cat": "health"},
    {"english": "heart", "chinese": "心脏", "pos": "noun", "ex": "Exercise is good for your heart.", "diff": 2, "cat": "health"},
    {"english": "doctor", "chinese": "医生", "pos": "noun", "ex": "I need to see a doctor.", "diff": 2, "cat": "health"},
    {"english": "medicine", "chinese": "药", "pos": "noun", "ex": "Take your medicine.", "diff": 2, "cat": "health"},
    {"english": "healthy", "chinese": "健康的", "pos": "adjective", "ex": "Eating fruit is healthy.", "diff": 2, "cat": "health"},
    {"english": "sick", "chinese": "生病的", "pos": "adjective", "ex": "I feel sick today.", "diff": 1, "cat": "health"},
    {"english": "tired", "chinese": "累的", "pos": "adjective", "ex": "I'm very tired.", "diff": 1, "cat": "health"},
    {"english": "strong", "chinese": "强壮的", "pos": "adjective", "ex": "He is very strong.", "diff": 2, "cat": "health"},

    # === Weather & Nature (category: nature, medium) ===
    {"english": "weather", "chinese": "天气", "pos": "noun", "ex": "The weather is nice today.", "diff": 2, "cat": "nature"},
    {"english": "rain", "chinese": "雨", "pos": "noun", "ex": "It will rain tomorrow.", "diff": 1, "cat": "nature"},
    {"english": "snow", "chinese": "雪", "pos": "noun", "ex": "Children love snow.", "diff": 1, "cat": "nature"},
    {"english": "sun", "chinese": "太阳", "pos": "noun", "ex": "The sun is shining.", "diff": 1, "cat": "nature"},
    {"english": "wind", "chinese": "风", "pos": "noun", "ex": "The wind is strong today.", "diff": 2, "cat": "nature"},
    {"english": "cloud", "chinese": "云", "pos": "noun", "ex": "There are many clouds.", "diff": 2, "cat": "nature"},
    {"english": "flower", "chinese": "花", "pos": "noun", "ex": "The flowers are beautiful.", "diff": 1, "cat": "nature"},
    {"english": "tree", "chinese": "树", "pos": "noun", "ex": "There is a big tree here.", "diff": 1, "cat": "nature"},
    {"english": "animal", "chinese": "动物", "pos": "noun", "ex": "I love animals.", "diff": 1, "cat": "nature"},
    {"english": "bird", "chinese": "鸟", "pos": "noun", "ex": "The bird is singing.", "diff": 1, "cat": "nature"},

    # === Technology (category: technology, medium-hard) ===
    {"english": "computer", "chinese": "电脑", "pos": "noun", "ex": "I use a computer every day.", "diff": 2, "cat": "technology"},
    {"english": "phone", "chinese": "手机", "pos": "noun", "ex": "My phone is new.", "diff": 1, "cat": "technology"},
    {"english": "internet", "chinese": "互联网", "pos": "noun", "ex": "The internet is very useful.", "diff": 2, "cat": "technology"},
    {"english": "email", "chinese": "电子邮件", "pos": "noun", "ex": "I sent you an email.", "diff": 2, "cat": "technology"},
    {"english": "website", "chinese": "网站", "pos": "noun", "ex": "Visit our website for more.", "diff": 2, "cat": "technology"},
    {"english": "password", "chinese": "密码", "pos": "noun", "ex": "Don't share your password.", "diff": 2, "cat": "technology"},
    {"english": "download", "chinese": "下载", "pos": "verb", "ex": "Download the app to start.", "diff": 2, "cat": "technology"},
    {"english": "search", "chinese": "搜索", "pos": "verb", "ex": "Search for it online.", "diff": 2, "cat": "technology"},
    {"english": "software", "chinese": "软件", "pos": "noun", "ex": "This software is easy to use.", "diff": 3, "cat": "technology"},
    {"english": "database", "chinese": "数据库", "pos": "noun", "ex": "The data is stored in a database.", "diff": 3, "cat": "technology"},

    # === Shopping & Money (category: shopping, medium) ===
    {"english": "money", "chinese": "钱", "pos": "noun", "ex": "I don't have enough money.", "diff": 1, "cat": "shopping"},
    {"english": "shop", "chinese": "商店", "pos": "noun", "ex": "Let's go to the shop.", "diff": 1, "cat": "shopping"},
    {"english": "buy", "chinese": "买", "pos": "verb", "ex": "I want to buy a gift.", "diff": 1, "cat": "shopping"},
    {"english": "sell", "chinese": "卖", "pos": "verb", "ex": "They sell fresh vegetables.", "diff": 2, "cat": "shopping"},
    {"english": "price", "chinese": "价格", "pos": "noun", "ex": "What is the price?", "diff": 2, "cat": "shopping"},
    {"english": "pay", "chinese": "支付", "pos": "verb", "ex": "How would you like to pay?", "diff": 2, "cat": "shopping"},
    {"english": "market", "chinese": "市场", "pos": "noun", "ex": "The market is open on weekends.", "diff": 2, "cat": "shopping"},
    {"english": "clothes", "chinese": "衣服", "pos": "noun", "ex": "I need new clothes.", "diff": 2, "cat": "shopping"},
    {"english": "bag", "chinese": "包", "pos": "noun", "ex": "She carries a red bag.", "diff": 1, "cat": "shopping"},
    {"english": "gift", "chinese": "礼物", "pos": "noun", "ex": "This gift is for you.", "diff": 2, "cat": "shopping"},

    # === Emotions & Feelings (category: emotions, medium-hard) ===
    {"english": "love", "chinese": "爱", "pos": "verb", "ex": "I love my family.", "diff": 1, "cat": "emotions"},
    {"english": "angry", "chinese": "生气的", "pos": "adjective", "ex": "Don't be angry.", "diff": 2, "cat": "emotions"},
    {"english": "afraid", "chinese": "害怕的", "pos": "adjective", "ex": "I'm afraid of the dark.", "diff": 2, "cat": "emotions"},
    {"english": "excited", "chinese": "兴奋的", "pos": "adjective", "ex": "I'm excited about the trip.", "diff": 2, "cat": "emotions"},
    {"english": "surprised", "chinese": "惊讶的", "pos": "adjective", "ex": "I was very surprised.", "diff": 2, "cat": "emotions"},
    {"english": "worried", "chinese": "担心的", "pos": "adjective", "ex": "Don't be worried.", "diff": 2, "cat": "emotions"},
    {"english": "proud", "chinese": "骄傲的", "pos": "adjective", "ex": "I'm proud of you.", "diff": 2, "cat": "emotions"},
    {"english": "lonely", "chinese": "孤独的", "pos": "adjective", "ex": "She feels lonely.", "diff": 2, "cat": "emotions"},
    {"english": "nervous", "chinese": "紧张的", "pos": "adjective", "ex": "I feel nervous before exams.", "diff": 3, "cat": "emotions"},
    {"english": "confident", "chinese": "自信的", "pos": "adjective", "ex": "Be confident in yourself.", "diff": 3, "cat": "emotions"},

    # === Advanced / Academic (category: academic, hard) ===
    {"english": "environment", "chinese": "环境", "pos": "noun", "ex": "We should protect the environment.", "diff": 3, "cat": "academic"},
    {"english": "experience", "chinese": "经验", "pos": "noun", "ex": "She has a lot of experience.", "diff": 3, "cat": "academic"},
    {"english": "opportunity", "chinese": "机会", "pos": "noun", "ex": "This is a great opportunity.", "diff": 3, "cat": "academic"},
    {"english": "communication", "chinese": "沟通", "pos": "noun", "ex": "Communication is key.", "diff": 3, "cat": "academic"},
    {"english": "education", "chinese": "教育", "pos": "noun", "ex": "Education changes lives.", "diff": 3, "cat": "academic"},
    {"english": "responsibility", "chinese": "责任", "pos": "noun", "ex": "It's our responsibility.", "diff": 3, "cat": "academic"},
    {"english": "knowledge", "chinese": "知识", "pos": "noun", "ex": "Knowledge is power.", "diff": 3, "cat": "academic"},
    {"english": "improve", "chinese": "提高", "pos": "verb", "ex": "I want to improve my English.", "diff": 3, "cat": "academic"},
    {"english": "develop", "chinese": "发展", "pos": "verb", "ex": "We must develop new skills.", "diff": 3, "cat": "academic"},
    {"english": "achieve", "chinese": "实现", "pos": "verb", "ex": "You can achieve your goals.", "diff": 3, "cat": "academic"},
    {"english": "compare", "chinese": "比较", "pos": "verb", "ex": "Let's compare the two options.", "diff": 3, "cat": "academic"},
    {"english": "analyze", "chinese": "分析", "pos": "verb", "ex": "We need to analyze the data.", "diff": 3, "cat": "academic"},
    {"english": "independent", "chinese": "独立的", "pos": "adjective", "ex": "She is very independent.", "diff": 3, "cat": "academic"},
    {"english": "necessary", "chinese": "必要的", "pos": "adjective", "ex": "Sleep is necessary for health.", "diff": 3, "cat": "academic"},
    {"english": "available", "chinese": "可用的", "pos": "adjective", "ex": "Is this seat available?", "diff": 3, "cat": "academic"},
    {"english": "significant", "chinese": "重要的", "pos": "adjective", "ex": "This is a significant discovery.", "diff": 3, "cat": "academic"},
    {"english": "appropriate", "chinese": "适当的", "pos": "adjective", "ex": "Wear appropriate clothing.", "diff": 3, "cat": "academic"},
    {"english": "efficient", "chinese": "高效的", "pos": "adjective", "ex": "This method is more efficient.", "diff": 3, "cat": "academic"},
    {"english": "participate", "chinese": "参与", "pos": "verb", "ex": "Everyone should participate.", "diff": 3, "cat": "academic"},
    {"english": "recommend", "chinese": "推荐", "pos": "verb", "ex": "I recommend this book.", "diff": 3, "cat": "academic"},
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(Word).count() > 0:
        print(f"Database already has {db.query(Word).count()} words. Skipping seed.")
        db.close()
        return

    for w in SEED_WORDS:
        word = Word(
            english=w["english"],
            chinese=w["chinese"],
            part_of_speech=w["pos"],
            example_sentence=w["ex"],
            difficulty_level=w["diff"],
            category=w["cat"],
        )
        db.add(word)

    db.commit()
    print(f"Seeded {len(SEED_WORDS)} words into the database.")
    db.close()


if __name__ == "__main__":
    seed()
