# -*- coding: utf-8 -*-
"""
Seed the SQLite database with ~3000 English technical terms for first-year engineering
students in China (five undergraduate majors). Difficulty maps to teaching use:
  diff 1 = Simple   (大一基础、通用入门)
  diff 2 = Medium   (专业主干课常见)
  diff 3 = Complex  (较深概念、课程提高/拓展)

Categories (category field in DB):
  computer_science           -> 计算机科学与技术
  mechanical_engineering      -> 机械设计制造及其自动化
  civil_engineering           -> 土木工程
  transportation_engineering -> 交通相关专业（含交通工程/交通设备与控制等自动控制方向词汇）
  mathematics                 -> 数学与应用数学

Re-seed: delete backend/english_learning.db then run: python seed.py
"""

from __future__ import annotations

import itertools
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from app.database import engine, SessionLocal, Base
from app.models.word import Word

# ---------------------------------------------------------------------------
# Major metadata (English UI / documentation only in code comments)
# ---------------------------------------------------------------------------
MAJOR_ZH = {
    "computer_science": "计算机科学与技术",
    "mechanical_engineering": "机械设计制造及其自动化",
    "civil_engineering": "土木工程",
    "transportation_engineering": "交通工程/交通设备与控制工程",
    "mathematics": "数学与应用数学",
}

TARGET_WORD_COUNT = 3000


def _ex(english: str, cat: str) -> str:
    """Short example sentence, ASCII-friendly."""
    m = MAJOR_ZH.get(cat, "工程专业")
    return f"In first-year {cat.replace('_', ' ')} courses, students meet '{english}' ({m})."


def _row(english: str, chinese: str, cat: str, diff: int, pos: str = "noun") -> dict:
    return {
        "english": english.strip(),
        "chinese": chinese.strip(),
        "pos": pos,
        "ex": _ex(english.strip(), cat),
        "diff": diff,
        "cat": cat,
    }


def _parse_pipe_block(block: str, cat: str, default_diff: int = 2) -> list[dict]:
    """Lines: english|chinese|diff(optional)."""
    out: list[dict] = []
    for raw in block.strip().splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        parts = [p.strip() for p in line.split("|")]
        en, zh = parts[0], parts[1]
        d = int(parts[2]) if len(parts) > 2 else default_diff
        out.append(_row(en, zh, cat, d))
    return out


# ---------------------------------------------------------------------------
# Curated cores (quality) + programmatic fillers to reach ~3000 unique lemmas
# ---------------------------------------------------------------------------

def _computer_science_lexicon() -> list[dict]:
    block = r"""
algorithm|算法|1
variable|变量|1
function|函数|1
loop|循环|1
array|数组|1
string|字符串|1
integer|整数|1
boolean|布尔值|1
syntax|语法|1
compile|编译|1
execute|执行|1
debug|调试|1
recursion|递归|2
pointer|指针|2
memory|内存|1
processor|处理器|1
cache|高速缓存|2
stack|栈|2
queue|队列|2
linked list|链表|2
binary tree|二叉树|2
hash table|哈希表|2
graph|图（数据结构）|2
complexity|复杂度|2
sorting|排序|2
search|查找|2
database|数据库|1
SQL|SQL语言|2
index|索引|2
transaction|事务|3
concurrency|并发|3
mutex|互斥锁|3
deadlock|死锁|3
thread|线程|2
process|进程|2
operating system|操作系统|2
protocol|协议|2
IP|网际协议|2
TCP|传输控制协议|2
HTTP|超文本传输协议|2
HTTPS|安全HTTP|2
DNS|域名系统|2
router|路由器|2
firewall|防火墙|2
encryption|加密|2
authentication|身份认证|2
object-oriented|面向对象|2
inheritance|继承|2
polymorphism|多态|2
encapsulation|封装|2
abstraction|抽象|2
API|应用程序接口|2
REST|REST接口|2
JSON|JSON数据格式|2
Git|Git版本控制|2
compiler|编译器|2
interpreter|解释器|2
virtual machine|虚拟机|2
container|容器|2
microservice|微服务|3
neural network|神经网络|3
machine learning|机器学习|3
training set|训练集|3
loss function|损失函数|3
gradient descent|梯度下降|3
regularization|正则化|3
backpropagation|反向传播|3
overfitting|过拟合|3
virtual memory|虚拟内存|3
page fault|缺页错误|3
scheduler|调度器|3
syscall|系统调用|3
bytecode|字节码|2
garbage collection|垃圾回收|3
Big O notation|渐进复杂度记号|3
dynamic programming|动态规划|3
greedy algorithm|贪心算法|3
shortest path|最短路径|3
DFS|深度优先搜索|2
BFS|广度优先搜索|2
heap|堆|2
deque|双端队列|2
trie|字典树|3
Bloom filter|布隆过滤器|3
sharding|分片|3
replication|复制|3
CAP theorem|CAP定理|3
race condition|竞态条件|3
semaphore|信号量|3
load balancer|负载均衡|3
CDN|内容分发网络|3
OAuth|OAuth授权|3
JWT|JSON Web令牌|3
SQL injection|SQL注入|3
XSS|跨站脚本|3
sandbox|沙箱|3
kernel mode|内核态|3
user mode|用户态|2
endianness|字节序|3
floating point|浮点数|2
Unicode|Unicode字符集|2
regex|正则表达式|2
serialization|序列化|2
deserialization|反序列化|2
event loop|事件循环|3
promise|Promise异步对象|3
callback|回调|2
middleware|中间件|2
ORM|对象关系映射|3
NoSQL|非关系型数据库|2
blockchain|区块链|3
consensus|共识机制|3
hash function|散列函数|2
digital signature|数字签名|3
TLS|传输层安全|3
zero trust|零信任|3
side-channel attack|侧信道攻击|3
buffer overflow|缓冲区溢出|3
ASLR|地址空间布局随机化|3
two-factor authentication|双因素认证|3
compiler optimization|编译优化|3
inline caching|内联缓存|3
branch prediction|分支预测|3
SIMD|单指令多数据|3
GPU|图形处理器|2
CUDA|CUDA并行平台|3
quantum bit|量子比特|3
entropy|熵（信息论）|3
Shannon entropy|香农熵|3
"""
    rows = _parse_pipe_block(block, "computer_science")
    # Combos (controlled)
    L1 = ["software", "hardware", "network", "integer", "floating", "dynamic", "static", "distributed"]
    L1_zh = {
        "software": "软件",
        "hardware": "硬件",
        "network": "网络",
        "integer": "整数",
        "floating": "浮点",
        "dynamic": "动态",
        "static": "静态",
        "distributed": "分布式",
    }
    R1 = ["engineering", "architecture", "security", "performance", "reliability", "testing", "interface", "library"]
    R1_zh = {
        "engineering": "工程",
        "architecture": "体系结构",
        "security": "安全",
        "performance": "性能",
        "reliability": "可靠性",
        "testing": "测试",
        "interface": "接口",
        "library": "库",
    }
    for a, b in itertools.product(L1, R1):
        en = f"{a} {b}"
        zh = L1_zh.get(a, a) + R1_zh.get(b, b)
        rows.append(_row(en, zh, "computer_science", 2))
    # Curated adjective + noun compounds (25 x 25) — core CS reading vocabulary
    adj = [
        ("distributed", "分布式"),
        ("parallel", "并行"),
        ("embedded", "嵌入式"),
        ("mobile", "移动"),
        ("relational", "关系型"),
        ("logical", "逻辑"),
        ("physical", "物理"),
        ("virtual", "虚拟"),
        ("incremental", "增量"),
        ("deterministic", "确定性"),
        ("probabilistic", "概率"),
        ("statistical", "统计"),
        ("Bayesian", "贝叶斯"),
        ("multithreaded", "多线程"),
        ("event-driven", "事件驱动"),
        ("policy-based", "基于策略"),
        ("rule-based", "基于规则"),
        ("ontology-driven", "本体驱动"),
        ("adversarial", "对抗"),
        ("convolutional", "卷积"),
        ("recurrent", "循环"),
        ("generative", "生成式"),
        ("differentiable", "可微"),
        ("heterogeneous", "异构"),
    ]
    adj_u = adj
    noun = [
        ("database", "数据库"),
        ("ledger", "账本"),
        ("cache", "缓存"),
        ("queue", "队列"),
        ("graph", "图结构"),
        ("pipeline", "流水线"),
        ("workflow", "工作流"),
        ("scheduler", "调度器"),
        ("allocator", "分配器"),
        ("profiler", "性能分析器"),
        ("sandbox", "沙箱"),
        ("namespace", "命名空间"),
        ("filesystem", "文件系统"),
        ("middleware", "中间件"),
        ("benchmark", "基准测试"),
        ("dataset", "数据集"),
        ("tensor", "张量"),
        ("encoder", "编码器"),
        ("decoder", "解码器"),
        ("tokenizer", "分词器"),
        ("hypervisor", "虚拟机监控器"),
        ("containerization", "容器化"),
        ("orchestration", "编排"),
        ("observability", "可观测性"),
    ]
    for (ae, az), (be, bz) in itertools.product(adj_u, noun):
        rows.append(_row(f"{ae} {be}", az + bz, "computer_science", 2))
    return rows


def _mechanical_lexicon() -> list[dict]:
    block = r"""
force|力|1
torque|扭矩|1
stress|应力|2
strain|应变|2
moment|弯矩|2
shear|剪力|2
tension|拉力|2
compression|压力|2
deflection|挠度|2
elasticity|弹性|2
kinematics|运动学|2
dynamics|动力学|2
vibration|振动|2
frequency|频率|2
damping|阻尼|3
resonance|共振|3
gear|齿轮|1
bearing|轴承|1
shaft|轴|1
spring|弹簧|1
cam|凸轮|2
linkage|连杆机构|2
mechanism|机构|2
tolerance|公差|2
datum|基准|2
roughness|表面粗糙度|2
machining|机械加工|2
turning|车削|2
milling|铣削|2
drilling|钻孔|2
grinding|磨削|2
welding|焊接|2
casting|铸造|2
forging|锻造|2
heat treatment|热处理|3
hardness|硬度|2
fatigue|疲劳|3
CNC|数控机床|2
CAD|计算机辅助设计|2
CAM|计算机辅助制造|2
hydraulics|液压传动|2
pneumatics|气压传动|2
compressor|压缩机|2
turbine|涡轮机|2
pump|泵|1
valve|阀门|1
nozzle|喷嘴|2
combustion|燃烧|3
thermal expansion|热膨胀|3
conduction|导热|3
convection|对流|3
radiation|热辐射|3
thermodynamics|热力学|3
entropy|熵（热力学）|3
enthalpy|焓|3
efficiency|效率|2
fluid|流体|2
viscosity|粘度|3
Reynolds number|雷诺数|3
boundary layer|边界层|3
datum plane|基准面|3
finite element|有限元|3
strain gauge|应变片|3
accelerometer|加速度计|3
gyroscope|陀螺仪|3
robotics|机器人学|3
servo motor|伺服电机|3
inverter|逆变器|3
PID control|PID控制|3
transfer function|传递函数|3
Bode plot|伯德图|3
Nyquist|奈奎斯特图|3
supply chain|供应链|2
lean manufacturing|精益制造|3
"""
    rows = _parse_pipe_block(block, "mechanical_engineering")
    mate = ["steel", "aluminum", "alloy", "plastic", "ceramic", "composite", "rubber", "copper", "titanium", "brass"]
    mate_zh = {
        "steel": "钢", "aluminum": "铝", "alloy": "合金", "plastic": "塑料", "ceramic": "陶瓷",
        "composite": "复合材料", "rubber": "橡胶", "copper": "铜", "titanium": "钛", "brass": "黄铜",
    }
    prop = ["strength", "stiffness", "ductility", "toughness", "density", "conductivity", "hardness", "viscosity"]
    prop_zh = {
        "strength": "强度", "stiffness": "刚度", "ductility": "延展性", "toughness": "韧性",
        "density": "密度", "conductivity": "导热性", "hardness": "硬度", "viscosity": "粘度",
    }
    for m, p in itertools.product(mate, prop):
        rows.append(_row(f"{m} {p}", mate_zh[m] + prop_zh[p], "mechanical_engineering", 3))
    adj_m = [
        ("precision", "精密"),
        ("automated", "自动化"),
        ("robotic", "机器人"),
        ("thermodynamic", "热力学"),
        ("aerodynamic", "空气动力"),
        ("hydrodynamic", "流体动力"),
        ("electromechanical", "机电"),
        ("kinematic", "运动学"),
        ("dynamic", "动力学"),
        ("static", "静力学"),
        ("elastic", "弹性"),
        ("plastic", "塑性"),
        ("adiabatic", "绝热"),
        ("isothermal", "等温"),
        ("orthogonal", "正交"),
        ("torsional", "扭转"),
        ("multiaxial", "多轴"),
        ("axisymmetric", "轴对称"),
        ("isotropic", "各向同性"),
        ("anisotropic", "各向异性"),
        ("laminated", "层合"),
        ("compliant", "柔顺"),
        ("redundant", "冗余"),
        ("sequential", "顺序"),
        ("modular", "模块化"),
    ]
    noun_m = [
        ("assembly", "装配"),
        ("fixture", "夹具"),
        ("gauging", "测量"),
        ("balancing", "平衡"),
        ("calibration", "标定"),
        ("prototyping", "原型"),
        ("machining", "加工"),
        ("forming", "成形"),
        ("joining", "连接"),
        ("welding", "焊接"),
        ("lubrication", "润滑"),
        ("wear", "磨损"),
        ("fatigue", "疲劳"),
        ("creep", "蠕变"),
        ("buckling", "屈曲"),
        ("stiffness", "刚度"),
        ("damping", "阻尼"),
        ("mode shape", "振型"),
        ("load case", "载荷工况"),
        ("constraint", "约束"),
        ("boundary", "边界"),
        ("mesh", "网格"),
        ("convergence", "收敛"),
        ("stack-up", "堆叠"),
        ("tolerance", "公差"),
    ]
    for (ae, az), (be, bz) in itertools.product(adj_m, noun_m):
        rows.append(_row(f"{ae} {be}", az + bz, "mechanical_engineering", 3))
    return rows


def _civil_lexicon() -> list[dict]:
    block = r"""
concrete|混凝土|1
rebar|钢筋|1
aggregate|骨料|2
cement|水泥|1
mortar|砂浆|2
beam|梁|1
column|柱|1
slab|板|1
foundation|基础|1
footing|独立基础|2
pile|桩|2
retaining wall|挡土墙|3
settlement|沉降|2
load|荷载|1
dead load|恒荷载|2
live load|活荷载|2
snow load|雪荷载|3
wind load|风荷载|2
shear wall|剪力墙|3
bridge|桥梁|1
abutment|桥台|3
pier|桥墩|2
deck|桥面|2
tunnel|隧道|2
excavation|基坑开挖|2
soil mechanics|土力学|3
permeability|渗透系数|3
consolidation|固结|3
slope stability|边坡稳定|3
seismic design|抗震设计|3
hydrology|水文学|3
runoff|径流|3
culvert|涵洞|2
manhole|检查井|2
storm sewer|雨水管|2
water treatment|水处理|2
sludge|污泥|3
BOD|生化需氧量|3
CAD drawing|工程制图|2
surveying|测量学|2
total station|全站仪|3
GNSS|全球导航卫星系统|3
geotechnical investigation|岩土勘察|3
compaction|压实|2
proctor test|标准击实试验|3
"""
    rows = _parse_pipe_block(block, "civil_engineering")
    typ = ["structural", "geotechnical", "hydraulic", "environmental", "municipal", "transportation"]
    typ_zh = {
        "structural": "结构", "geotechnical": "岩土", "hydraulic": "水力",
        "environmental": "环境", "municipal": "市政", "transportation": "交通土建",
    }
    noun = ["design", "analysis", "modeling", "inspection", "maintenance", "rehabilitation", "monitoring", "standards"]
    noun_zh = {
        "design": "设计", "analysis": "分析", "modeling": "建模", "inspection": "检测",
        "maintenance": "养护", "rehabilitation": "修复", "monitoring": "监测", "standards": "规范",
    }
    for a, b in itertools.product(typ, noun):
        rows.append(_row(f"{a} {b}", typ_zh[a] + noun_zh[b], "civil_engineering", 2))
    adj_c = [
        ("prestressed", "预应力"),
        ("reinforced", "配筋"),
        ("structural", "结构"),
        ("geotechnical", "岩土"),
        ("hydraulic", "水力"),
        ("seismic", "抗震"),
        ("durability", "耐久"),
        ("sustainable", "可持续"),
        ("compacted", "压实"),
        ("saturated", "饱和"),
        ("unsaturated", "非饱和"),
        ("liquefiable", "可液化"),
        ("granular", "颗粒"),
        ("cohesive", "粘性"),
        ("frictional", "摩擦型"),
        ("drained", "排水"),
        ("undrained", "不排水"),
        ("elastic", "弹性"),
        ("plastic", "塑性"),
        ("brittle", "脆性"),
        ("ductile", "延性"),
        ("long-span", "大跨度"),
        ("deep", "深部"),
        ("shallow", "浅层"),
        ("subsurface", "地下"),
    ]
    noun_c = [
        ("foundation", "基础"),
        ("footing", "基脚"),
        ("bearing layer", "持力层"),
        ("settlement", "沉降"),
        ("subsidence", "沉陷"),
        ("excavation", "开挖"),
        ("shoring", "支护"),
        ("dewatering", "降水"),
        ("grouting", "灌浆"),
        ("tunneling", "隧道施工"),
        ("alignment", "线形"),
        ("cross-section", "横断面"),
        ("earthwork", "土工"),
        ("subgrade", "路基"),
        ("pavement", "路面"),
        ("drainage", "排水"),
        ("culvert", "涵洞"),
        ("retaining", "挡土"),
        ("anchorage", "锚固"),
        ("waterproofing", "防水"),
        ("inspection", "检测"),
        ("retrofit", "加固"),
        ("rehabilitation", "修复"),
        ("monitoring", "监测"),
        ("slope", "边坡"),
        ("abutment", "桥台"),
    ]
    for (ae, az), (be, bz) in itertools.product(adj_c, noun_c):
        rows.append(_row(f"{ae} {be}", az + bz, "civil_engineering", 2))
    return rows


def _transport_lexicon() -> list[dict]:
    block = r"""
traffic flow|交通流|2
capacity|通行能力|2
congestion|拥堵|2
LOS|服务水平|3
signal|信号|1
intersection|交叉口|2
roundabout|环形交叉口|3
headway|车头时距|3
spacing|车头间距|3
speed limit|限速|1
pavement|路面|2
lane|车道|1
median|中央分隔带|2
crosswalk|人行横道|2
parking|停车|1
parking guidance|停车诱导|3
transit|公共交通|2
bus rapid transit|快速公交|3
metro|地铁|2
station|车站|1
ridership|客流量|3
fare|票价|2
travel demand|出行需求|3
origin-destination|起讫点|3
modal split|出行方式划分|3
intelligent transportation|智能交通|3
V2X|车联网通信|3
connected vehicle|网联汽车|3
autonomous driving|自动驾驶|3
ADAS|高级驾驶辅助系统|3
GPS|全球定位|2
lane keeping|车道保持|3
collision avoidance|避撞|3
travel time|行程时间|2
delay|延误|2
queue|排队|2
bottleneck|瓶颈|3
incident management|事件管理|3
ramp metering|匝道控制|3
variable speed limit|可变限速|3
floating car data|浮动车数据|3
Kalman filter|卡尔曼滤波|3
control theory|控制理论|3
PID controller|PID控制器|3
state space|状态空间|3
observability|能观性|3
controllability|能控性|3
Lyapunov stability|李雅普诺夫稳定|3
model predictive control|模型预测控制|3
sensor fusion|传感器融合|3
Lidar|激光雷达|3
lane detection|车道线检测|3
"""
    rows = _parse_pipe_block(block, "transportation_engineering")
    mod = ["traffic", "vehicle", "road", "highway", "urban", "rail", "transit", "logistics"]
    mod_zh = {
        "traffic": "交通", "vehicle": "车辆", "road": "道路", "highway": "公路",
        "urban": "城市", "rail": "轨道", "transit": "公交", "logistics": "物流",
    }
    asp = ["planning", "operation", "management", "safety", "emission", "energy", "simulation", "optimization"]
    asp_zh = {
        "planning": "规划", "operation": "运营", "management": "管理", "safety": "安全",
        "emission": "排放", "energy": "能耗", "simulation": "仿真", "optimization": "优化",
    }
    for a, b in itertools.product(mod, asp):
        rows.append(_row(f"{a} {b}", mod_zh[a] + asp_zh[b], "transportation_engineering", 2))
    adj_t = [
        ("dynamic", "动态"),
        ("static", "静态"),
        ("adaptive", "自适应"),
        ("predictive", "预测"),
        ("probabilistic", "概率"),
        ("cooperative", "协同"),
        ("multimodal", "多模式"),
        ("intermodal", "联运"),
        ("arterial", "干道"),
        ("urban", "城市"),
        ("regional", "区域"),
        ("freeway", "快速路"),
        ("signalized", "信号控制"),
        ("unsignalized", "无信号"),
        ("congested", "拥堵"),
        ("heterogeneous", "异质"),
        ("connected", "网联"),
        ("automated", "自动化"),
        ("electric", "电动"),
        ("hybrid", "混合动力"),
        ("sensor-based", "基于传感器"),
        ("model-based", "基于模型"),
        ("data-driven", "数据驱动"),
        ("real-time", "实时"),
        ("offline", "离线"),
    ]
    noun_t = [
        ("routing", "路径"),
        ("assignment", "分配"),
        ("dispatching", "调度"),
        ("guidance", "诱导"),
        ("metering", "调节"),
        ("coordination", "协调"),
        ("platooning", "编队"),
        ("perception", "感知"),
        ("localization", "定位"),
        ("mapping", "建图"),
        ("control", "控制"),
        ("estimation", "估计"),
        ("identification", "辨识"),
        ("calibration", "标定"),
        ("diagnostics", "诊断"),
        ("prognostics", "预示"),
        ("safety case", "安全论证"),
        ("hazard", "危险源"),
        ("risk", "风险"),
        ("OD matrix", "OD矩阵"),
        ("mode choice", "方式选择"),
        ("trip chain", "出行链"),
        ("dwell time", "停站时间"),
        ("headway", "发车间隔"),
        ("timetable", "时刻表"),
    ]
    for (ae, az), (be, bz) in itertools.product(adj_t, noun_t):
        rows.append(_row(f"{ae} {be}", az + bz, "transportation_engineering", 3))
    return rows


def _math_lexicon() -> list[dict]:
    block = r"""
set|集合|1
function|函数|1
limit|极限|2
continuity|连续|2
derivative|导数|2
integral|积分|2
partial derivative|偏导数|3
gradient|梯度|3
Jacobian|雅可比矩阵|3
series|级数|3
Taylor series|泰勒级数|3
matrix|矩阵|2
determinant|行列式|2
vector|向量|2
eigenvalue|特征值|3
eigenvector|特征向量|3
orthogonal|正交|3
inner product|内积|3
norm|范数|3
probability|概率|2
random variable|随机变量|2
expectation|数学期望|3
variance|方差|2
covariance|协方差|3
normal distribution|正态分布|3
hypothesis test|假设检验|3
confidence interval|置信区间|3
linear regression|线性回归|3
Bayes theorem|贝叶斯公式|3
Markov chain|马尔可夫链|3
graph|图论中的图|2
combinatorics|组合数学|3
pigeonhole principle|鸽巢原理|3
contradiction|反证法|3
induction|数学归纳法|3
complex number|复数|2
polynomial|多项式|2
rational function|有理函数|3
ODE|常微分方程|3
PDE|偏微分方程|3
Laplace equation|拉普拉斯方程|3
Fourier transform|傅里叶变换|3
convolution|卷积|3
manifold|流形|3
topology|拓扑|3
metric space|度量空间|3
Banach space|巴拿赫空间|3
convex set|凸集|3
optimization|最优化|2
Lagrange multiplier|拉格朗日乘子|3
KKT condition|KKT条件|3
numerical analysis|数值分析|3
Newton method|牛顿法|3
interpolation|插值|3
extrapolation|外推|3
FFT|快速傅里叶变换|3
Monte Carlo|蒙特卡罗方法|3
game theory|博弈论|3
fixed point|不动点|3
"""
    rows = _parse_pipe_block(block, "mathematics")
    low = ["equation", "inequality", "theorem", "lemma", "proof", "corollary", "axiom", "definition", "proposition"]
    low_zh = {
        "equation": "方程", "inequality": "不等式", "theorem": "定理", "lemma": "引理", "proof": "证明",
        "corollary": "推论", "axiom": "公理", "definition": "定义", "proposition": "命题",
    }
    hi = ["existence", "uniqueness", "convergence", "divergence", "boundedness", "compactness", "linearity", "symmetry"]
    hi_zh = {
        "existence": "存在性", "uniqueness": "唯一性", "convergence": "收敛性", "divergence": "发散性",
        "boundedness": "有界性", "compactness": "紧性", "linearity": "线性性", "symmetry": "对称性",
    }
    for a, b in itertools.product(low, hi):
        rows.append(_row(f"{a} {b}", low_zh[a] + hi_zh[b], "mathematics", 3))
    adj_x = [
        ("linear", "线性"),
        ("nonlinear", "非线性"),
        ("convex", "凸"),
        ("discrete", "离散"),
        ("continuous", "连续"),
        ("differentiable", "可微"),
        ("holomorphic", "全纯"),
        ("meromorphic", "亚纯"),
        ("positive-definite", "正定"),
        ("semidefinite", "半正定"),
        ("singular", "奇异"),
        ("invertible", "可逆"),
        ("orthogonal", "正交"),
        ("unitary", "酉"),
        ("idempotent", "幂等"),
        ("nilpotent", "幂零"),
        ("stochastic", "随机"),
        ("ergodic", "遍历"),
        ("stationary", "平稳"),
        ("asymptotic", "渐近"),
        ("uniform", "一致"),
        ("measurable", "可测"),
        ("integrable", "可积"),
        ("bounded", "有界"),
        ("unbounded", "无界"),
    ]
    noun_x = [
        ("system", "系统"),
        ("operator", "算子"),
        ("semigroup", "半群"),
        ("group", "群"),
        ("ring", "环"),
        ("field", "域"),
        ("module", "模"),
        ("lattice", "格"),
        ("ideal", "理想"),
        ("bundle", "丛"),
        ("sheaf", "层"),
        ("cohomology", "上同调"),
        ("homology", "同调"),
        ("fiber", "纤维"),
        ("section", "截面"),
        ("measure", "测度"),
        ("sigma-algebra", "sigma代数"),
        ("filtration", "滤子"),
        ("martingale", "鞅"),
        ("Brownian motion", "布朗运动"),
        ("Ito integral", "伊藤积分"),
        ("SDE", "随机微分方程"),
        ("variational", "变分"),
        ("weak solution", "弱解"),
        ("strong solution", "强解"),
    ]
    for (ae, az), (be, bz) in itertools.product(adj_x, noun_x):
        rows.append(_row(f"{ae} {be}", az + bz, "mathematics", 3))
    return rows


def _collect_all() -> list[dict]:
    buckets = [
        _computer_science_lexicon(),
        _mechanical_lexicon(),
        _civil_lexicon(),
        _transport_lexicon(),
        _math_lexicon(),
    ]
    flat: list[dict] = []
    for b in buckets:
        flat.extend(b)
    return flat


def _dedupe(words: list[dict]) -> list[dict]:
    """Same English may appear in different majors — keep (english, category) unique."""
    seen: set[tuple[str, str]] = set()
    out: list[dict] = []
    for w in words:
        key = (w["english"].lower().strip(), w["cat"])
        if key in seen:
            continue
        seen.add(key)
        out.append(w)
    return out


def _select_round_robin(words: list[dict], target: int) -> list[dict]:
    """Prefer ~equal counts per major, then fill up to target."""
    order = [
        "computer_science",
        "mechanical_engineering",
        "civil_engineering",
        "transportation_engineering",
        "mathematics",
    ]
    per_cap = max(target // len(order), 1)
    by_cat: dict[str, list[dict]] = {c: [] for c in order}
    for w in words:
        if w["cat"] in by_cat:
            by_cat[w["cat"]].append(w)
    for c in order:
        by_cat[c].sort(key=lambda x: (x["diff"], x["english"].lower()))
    chosen: list[dict] = []
    used: set[tuple[str, str]] = set()
    for c in order:
        for w in by_cat[c][:per_cap]:
            k = (w["english"].lower().strip(), w["cat"])
            if k in used:
                continue
            used.add(k)
            chosen.append(w)
    if len(chosen) < target:
        pool = sorted(
            words,
            key=lambda x: (x["cat"], x["diff"], x["english"].lower()),
        )
        for w in pool:
            if len(chosen) >= target:
                break
            k = (w["english"].lower().strip(), w["cat"])
            if k in used:
                continue
            used.add(k)
            chosen.append(w)
    return chosen[:target]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    existing_count = db.query(Word).count()
    if existing_count > 0:
        print(f"Database already has {existing_count} words. Skipping seed.")
        print("To re-seed, delete english_learning.db in the backend folder and run again.")
        db.close()
        return

    print("=" * 60)
    print("Building engineering-first lexicon (5 majors, ~3000 words)...")
    print("Difficulty: 1=simple, 2=medium, 3=complex")
    print("=" * 60)

    pool = _dedupe(_collect_all())
    all_w = _select_round_robin(pool, TARGET_WORD_COUNT)
    # `all_w` is the selected dataset we will insert; keep the existing
    # progress/stat code that refers to `unique_words` in sync.
    unique_words = all_w

    print(f"[OK] Unique (term, major) pairs in pool: {len(pool)}")
    print(f"[OK] Words selected for database: {len(all_w)}")

    batch_size = 100
    for i in range(0, len(all_w), batch_size):
        batch = all_w[i : i + batch_size]
        for w in batch:
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
        progress = min(i + batch_size, len(unique_words))
        percentage = (progress / len(unique_words)) * 100
        print(f"  Progress: {progress}/{len(unique_words)} ({percentage:.1f}%)")
    
    final_count = db.query(Word).count()
    print("\n" + "=" * 60)
    print(f"✓ SUCCESS! Seeded {final_count} words into the database!")
    print("=" * 60)
    
    # Print category breakdown
    category_counts = {}
    for w in unique_words:
        cat = w['cat']
        category_counts[cat] = category_counts.get(cat, 0) + 1
    
    print("\nCategory breakdown:")
    for cat, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {cat}: {count} words")
    
    print("\nDifficulty breakdown:")
    diff_counts = {1: 0, 2: 0, 3: 0}
    for w in unique_words:
        diff_counts[w['diff']] = diff_counts.get(w['diff'], 0) + 1
    print(f"  - Level 1 (Easy): {diff_counts[1]} words")
    print(f"  - Level 2 (Medium): {diff_counts[2]} words")
    print(f"  - Level 3 (Hard): {diff_counts[3]} words")
    
    db.close()


if __name__ == "__main__":
    seed()
