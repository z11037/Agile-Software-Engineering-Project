import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type Difficulty = 'easy' | 'medium' | 'hard';
type Category = 'cs' | 'mechanical' | 'civil' | 'transportation' | 'math';

type Question = {
  id: number;
  text: string;
  hint?: string;
  difficulty: Difficulty;
  category: Category;
};

const questionAnswers: Record<number, string> = {
  1: 'In Java, an interface is a contract that defines method signatures. Classes implement the interface and provide the actual method bodies.',
  2: 'A stack is a linear data structure that follows LIFO, which means Last In, First Out.',
  3: 'A class is a blueprint, while an object is an instance created from that blueprint with real data.',
  4: 'An array stores elements in contiguous memory with fixed size, while a linked list stores nodes connected by pointers and can grow dynamically.',
  5: 'A hash table stores key-value pairs and uses a hash function to map keys to indexes for fast lookup.',
  6: 'Recursion is when a function calls itself to solve smaller subproblems, and it must include a base case to stop.',
  7: 'BFS explores level by level and is good for shortest paths in unweighted graphs, while DFS explores deeply and is useful for traversal and backtracking.',
  8: 'Race conditions can cause inconsistent data when multiple threads access shared resources without synchronization.',
  9: 'A scalable system uses load balancers, horizontal scaling, caching, and database optimization to handle large traffic.',
  10: 'Torque is the turning effect of a force around an axis.',
  11: 'A bearing supports rotating parts and reduces friction between moving surfaces.',
  12: 'Steel is widely used because it has high strength and good durability at a reasonable cost.',
  13: 'Stress is force per unit area, while strain is the amount of deformation relative to original length.',
  14: 'A heat exchanger transfers heat from one fluid to another without direct mixing.',
  15: 'Fatigue matters because repeated cyclic loads can cause cracks and eventual failure over time.',
  16: 'Engine efficiency can be improved by reducing friction, optimizing combustion, and recovering waste heat.',
  17: 'Vibration analysis detects abnormal patterns early, helping engineers predict failures before breakdown happens.',
  18: 'Additive manufacturing is flexible for complex shapes, while machining offers high precision and surface quality for many parts.',
  19: 'A foundation transfers building loads safely to the ground and keeps the structure stable.',
  20: 'Reinforced concrete combines concrete and steel bars to resist both compression and tension.',
  21: 'Drainage prevents water buildup, which reduces flooding, erosion, and structural damage.',
  22: 'Dead load is permanent weight such as walls and slabs, while live load is variable weight such as people and furniture.',
  23: 'Concrete strength depends on water-cement ratio, aggregate quality, curing conditions, and mix design.',
  24: 'Soil tests help determine bearing capacity and settlement risk so foundations can be designed safely.',
  25: 'Earthquake-resistant design uses ductile structures, proper detailing, and energy dissipation to reduce collapse risk.',
  26: 'Bridge design balances budget, safety standards, and sustainability by choosing materials and methods with long-term value.',
  27: 'Smart city tools like sensors and digital twins improve monitoring, maintenance, and planning decisions.',
  28: 'Main city transport systems include private cars, buses, metro or rail, cycling, and walking networks.',
  29: 'Good signal timing improves traffic flow, reduces delays, and lowers fuel consumption.',
  30: 'Public transport reduces congestion, lowers emissions, and provides affordable mobility.',
  31: 'Congestion is caused by high demand, bottlenecks, and poor management; solutions include transit improvement, traffic control, and demand management.',
  32: 'Multimodal transport means combining multiple transport modes in one trip, such as bus plus metro.',
  33: 'Road design affects safety through lane width, visibility, speed control, intersections, and pedestrian facilities.',
  34: 'A transport plan for a growing city should include demand forecasting, integrated networks, and phased investment.',
  35: 'Data analytics improves public transport by optimizing routes, schedules, and fleet allocation based on demand patterns.',
  36: 'EV integration challenges include charging coverage, grid capacity, costs, and coordination with urban planning.',
  37: 'A function maps each input to one output, while an equation states that two expressions are equal.',
  38: 'Slope represents the rate of change of y with respect to x on a graph.',
  39: 'A common percentage example is a 20% discount in shopping or a test score percentage.',
  40: 'Calculus is used in engineering to model change, optimize designs, and compute areas and volumes.',
  41: 'Standard deviation measures how spread out data points are around the mean.',
  42: 'Permutation counts arrangements where order matters; combination counts selections where order does not matter.',
  43: 'Linear algebra is used in graphics and AI through vectors and matrices for transformations and model computation.',
  44: 'Optimization methods find the best solution under constraints, such as minimizing cost or maximizing efficiency.',
  45: 'Deterministic models give fixed outputs for fixed inputs, while probabilistic models include uncertainty and output distributions.',
  46: 'Version control helps teams collaborate safely by tracking code changes, supporting rollback, and managing parallel work.',
  47: 'A compiler translates the full source code before execution, while an interpreter executes code line by line.',
  48: 'Big-O notation describes how an algorithm grows with input size, helping compare time and space efficiency.',
  49: 'REST uses fixed endpoints and resources, while GraphQL lets clients request only needed fields through a query schema.',
  50: 'Microservices split an application into small services for scalability and independent deployment, but increase operational complexity.',
  51: 'Lubrication reduces friction and wear, removes heat, and improves machine lifespan and efficiency.',
  52: 'Ductile materials deform significantly before breaking, while brittle materials fracture with little deformation.',
  53: 'Tolerance ensures parts fit and function correctly despite manufacturing variation.',
  54: 'Gears change speed and torque through gear ratios: larger driven gears increase torque and reduce speed, and vice versa.',
  55: 'Failure mode evaluation checks likely causes like fatigue, overload, corrosion, and manufacturing defects to prevent breakdown.',
  56: 'Expansion joints allow bridge movement due to temperature changes and loading, preventing cracks and structural stress.',
  57: 'Building codes provide minimum safety and quality standards and ensure legal compliance.',
  58: 'A project lifecycle usually includes planning, design, procurement, construction, and operation or maintenance.',
  59: 'Groundwater can reduce soil strength, create uplift pressure, and require drainage or waterproofing in foundation design.',
  60: 'Carbon footprint can be reduced by low-carbon materials, optimized designs, and efficient construction processes.',
  61: 'Pedestrian crossings improve safety by organizing crossing points and increasing driver awareness.',
  62: 'Last-mile connectivity bridges the gap between transit hubs and final destinations, improving public transport usage.',
  63: 'Intelligent transport systems use data and automation to improve traffic flow, reduce delays, and enhance safety.',
  64: 'Bus route planning should consider demand density, travel patterns, stop spacing, frequency, and transfer convenience.',
  65: 'Autonomous vehicles may improve safety and efficiency, but require regulation, infrastructure updates, and ethical policy decisions.',
  66: 'Mean is average, median is middle value, and mode is most frequent value in a dataset.',
  67: 'Probability represents the chance of an event, such as the likelihood of rain tomorrow.',
  68: 'Derivatives measure rates of change, such as velocity changing over time.',
  69: 'Matrices are useful for data representation, solving linear systems, and geometric transformations.',
  70: 'Choosing a model requires balancing assumptions, data quality, complexity, interpretability, and validation results.',
  71: 'A variable stores a value that your program can use and update.',
  72: 'A loop repeats a block of code multiple times to achieve a task that needs repetition.',
  73: 'An HTTP status code tells the result of a request, such as 200 for success or 404 for not found.',
  74: 'A function groups reusable instructions so you can break a problem into smaller steps.',
  75: 'Compilation converts source code into an executable form ahead of time, while interpretation runs code during execution.',
  76: 'Time complexity describes how runtime grows as input size increases, helping compare algorithms.',
  77: 'A database index is a data structure that speeds up lookups by reducing the amount of scanning required.',
  78: 'TCP is reliable and connection-based, while UDP is faster and connectionless; TCP fits web traffic and UDP fits real-time audio or video.',
  79: 'Thread safety means code works correctly with multiple threads; preventing race conditions often uses locks or atomic operations.',
  80: 'A deadlock happens when threads wait for each other to release resources; mitigation includes consistent lock ordering and avoiding circular waits.',
  81: 'A lever is a rigid bar that pivots on a fulcrum to trade force and distance, multiplying force in tools like seesaws.',
  82: 'Friction is the resisting force between contacting surfaces; it affects motion and wear, so engineers may reduce it with lubrication or materials.',
  83: 'Gear ratio is the relationship between input and output speeds, which determines how torque and speed change.',
  84: 'Lubrication reduces friction and wear, helps remove heat, and improves efficiency and component lifespan.',
  85: 'Stress is internal force per unit area, while strain is the deformation caused by that stress; they are linked by material behavior.',
  86: 'Thermal expansion causes materials to grow or shrink with temperature changes, so designs account for it with tolerances or expansion joints.',
  87: 'Bearings support rotating shafts and reduce friction, enabling smoother motion and protecting other parts.',
  88: 'Fatigue prediction uses loading cycles, stress levels, material fatigue curves, and safety factors to estimate crack initiation risk.',
  89: 'A gearbox selects gear ratios so the motor runs efficiently while delivering the required torque and speed at the output.',
  90: 'Tension pulls materials apart and is common in cables, while compression pushes materials together and is common in columns.',
  91: 'Reinforcement provides tensile strength in reinforced concrete, helping resist bending and cracking.',
  92: 'Drainage removes excess water using pipes, channels, or swales, reducing erosion, waterlogging, and damage.',
  93: 'Building codes set minimum requirements for safety and quality so structures are designed to accepted standards.',
  94: 'A retaining wall holds back soil or other material so it does not collapse or slide due to gravity.',
  95: 'A load path is how forces travel through a structure to the foundation; good design ensures forces are carried safely.',
  96: 'Compression resists squeezing forces, while tension resists pulling forces, and structural members are designed for the expected load type.',
  97: 'Soil properties such as bearing capacity and compressibility affect foundation choice and settlement risk.',
  98: 'To resist lateral forces like wind, you use stiffness systems such as bracing or shear walls and ensure proper connections down to the foundation.',
  99: 'Seismic design reduces collapse risk by using ductile detailing, redundancy, and energy dissipation strategies.',
  100: 'Sustainability can be added by choosing low-carbon materials, using efficient construction processes, and designing for long-term resource savings.',
  101: 'Traffic signals coordinate right of way at intersections by assigning phases for vehicles and pedestrians.',
  102: 'BRT is a bus-based rapid transit system that uses dedicated lanes, fast boarding, and often signal priority.',
  103: 'Congestion occurs when demand exceeds capacity, causing slower speeds and longer travel times.',
  104: 'Walkability improves safety and access through sidewalks, crossings, lighting, and nearby destinations.',
  105: 'Demand forecasting estimates passenger volumes over time, which helps schedule service, size fleets, and plan routes.',
  106: 'Multimodal integration makes trips seamless by coordinating bus, metro, bike, and walking through timing and ticketing.',
  107: 'Road geometry such as curvature and grade affects safe speed, visibility, and driver comfort.',
  108: 'Intelligent routing can use real-time and predicted traffic data to choose faster routes dynamically.',
  109: 'Autonomous vehicles involve trade-offs such as safety readiness, regulatory approval, infrastructure updates, and handling edge cases.',
  110: 'Pricing strategies like congestion or parking pricing can reduce peak demand by shifting time, mode, or route.',
  111: 'A function maps inputs to outputs so each input corresponds to a well-defined result.',
  112: 'Slope is the rate of change of y with respect to x and describes how steep a line or curve is.',
  113: 'Mean is the average, and median is the middle value; both summarize central tendency differently for skewed data.',
  114: 'Probability measures how likely an event is to happen, typically between 0 and 1.',
  115: 'Permutation counts ordered arrangements, while combination counts selections where order does not matter.',
  116: 'Variance and standard deviation measure how spread out data values are around the mean.',
  117: 'Linear algebra uses vectors and matrices for transformations, solving systems, and representing data in many applications.',
  118: 'Optimization searches for the best solution under constraints, such as minimizing cost or maximizing benefit.',
  119: 'You model data by choosing a suitable function form, fitting parameters to observations, and validating with error metrics.',
  120: 'Deterministic models produce one output for each input, while probabilistic models represent uncertainty with distributions.',
};

export default function OralPracticePage() {
  const questions: Question[] = useMemo(
    () => [
      // CS (Computing Science) - Easy
      {
        id: 1,
        text: 'Briefly describe what an interface is in Java.',
        hint: 'Use simple words and mention what it can do.',
        difficulty: 'easy',
        category: 'cs',
      },
      {
        id: 2,
        text: 'Briefly describe what a stack is.',
        hint: 'You can mention the idea of last in, first out.',
        difficulty: 'easy',
        category: 'cs',
      },
      {
        id: 3,
        text: 'What is the difference between a class and an object in Java?',
        hint: 'Define both terms and give a short example.',
        difficulty: 'easy',
        category: 'cs',
      },
      // CS (Computing Science) - Medium
      {
        id: 4,
        text: 'Explain the difference between an array and a linked list.',
        hint: 'Compare memory layout and insertion/deletion performance.',
        difficulty: 'medium',
        category: 'cs',
      },
      {
        id: 5,
        text: 'How does a hash table work in simple terms?',
        hint: 'Mention key-value pairs and collisions.',
        difficulty: 'medium',
        category: 'cs',
      },
      {
        id: 6,
        text: 'What is recursion, and when should we use it?',
        hint: 'Describe base case and recursive case clearly.',
        difficulty: 'medium',
        category: 'cs',
      },
      // CS (Computing Science) - Hard
      {
        id: 7,
        text: 'Compare BFS and DFS, and explain when each is better.',
        hint: 'Discuss search order and typical use cases.',
        difficulty: 'hard',
        category: 'cs',
      },
      {
        id: 8,
        text: 'What problems can race conditions cause in concurrent programs?',
        hint: 'Give one concrete scenario and a possible fix.',
        difficulty: 'hard',
        category: 'cs',
      },
      {
        id: 9,
        text: 'How would you design a simple system to handle millions of user requests?',
        hint: 'Talk about load balancing, scaling, and caching.',
        difficulty: 'hard',
        category: 'cs',
      },

      // Mechanical - Easy
      {
        id: 10,
        text: 'What is torque in simple words?',
        hint: 'Explain it as rotational force with one example.',
        difficulty: 'easy',
        category: 'mechanical',
      },
      {
        id: 11,
        text: 'What is the function of a bearing?',
        hint: 'Talk about reducing friction and supporting rotation.',
        difficulty: 'easy',
        category: 'mechanical',
      },
      {
        id: 12,
        text: 'Name one common material in mechanical engineering and explain why it is used.',
        hint: 'Focus on one property such as strength, weight, or cost.',
        difficulty: 'easy',
        category: 'mechanical',
      },
      // Mechanical - Medium
      {
        id: 13,
        text: 'Explain the difference between stress and strain.',
        hint: 'Define both and explain how they are related.',
        difficulty: 'medium',
        category: 'mechanical',
      },
      {
        id: 14,
        text: 'How does a heat exchanger work?',
        hint: 'Describe heat transfer between fluids without mixing.',
        difficulty: 'medium',
        category: 'mechanical',
      },
      {
        id: 15,
        text: 'Why is fatigue important in machine design?',
        hint: 'Mention repeated loading and long-term failure risk.',
        difficulty: 'medium',
        category: 'mechanical',
      },
      // Mechanical - Hard
      {
        id: 16,
        text: 'How would you improve the efficiency of an internal combustion engine?',
        hint: 'Discuss combustion, heat loss, and friction reduction.',
        difficulty: 'hard',
        category: 'mechanical',
      },
      {
        id: 17,
        text: 'Explain how vibration analysis helps prevent machine failure.',
        hint: 'Mention condition monitoring and early fault detection.',
        difficulty: 'hard',
        category: 'mechanical',
      },
      {
        id: 18,
        text: 'Compare additive manufacturing and traditional machining for industrial parts.',
        hint: 'Discuss cost, speed, precision, and material limits.',
        difficulty: 'hard',
        category: 'mechanical',
      },

      // Civil - Easy
      {
        id: 19,
        text: 'What is the purpose of a foundation in a building?',
        hint: 'Talk about load transfer and stability.',
        difficulty: 'easy',
        category: 'civil',
      },
      {
        id: 20,
        text: 'What is reinforced concrete?',
        hint: 'Mention concrete with steel bars and why this combination is useful.',
        difficulty: 'easy',
        category: 'civil',
      },
      {
        id: 21,
        text: 'Why is drainage important in civil projects?',
        hint: 'Explain flood prevention and structure protection.',
        difficulty: 'easy',
        category: 'civil',
      },
      // Civil - Medium
      {
        id: 22,
        text: 'Explain the difference between dead load and live load.',
        hint: 'Give examples of each load type.',
        difficulty: 'medium',
        category: 'civil',
      },
      {
        id: 23,
        text: 'What factors affect the strength of concrete?',
        hint: 'Mention water-cement ratio, curing, and material quality.',
        difficulty: 'medium',
        category: 'civil',
      },
      {
        id: 24,
        text: 'Why do civil engineers perform soil tests before construction?',
        hint: 'Talk about bearing capacity and settlement risk.',
        difficulty: 'medium',
        category: 'civil',
      },
      // Civil - Hard
      {
        id: 25,
        text: 'How would you design infrastructure to resist earthquakes?',
        hint: 'Discuss flexibility, damping, and code requirements.',
        difficulty: 'hard',
        category: 'civil',
      },
      {
        id: 26,
        text: 'Explain the trade-offs between cost, safety, and sustainability in bridge design.',
        hint: 'Balance budget constraints with long-term performance.',
        difficulty: 'hard',
        category: 'civil',
      },
      {
        id: 27,
        text: 'How can smart city technologies improve urban civil engineering projects?',
        hint: 'Mention sensors, real-time monitoring, and data-driven decisions.',
        difficulty: 'hard',
        category: 'civil',
      },

      // Transportation - Easy
      {
        id: 28,
        text: 'What are the main types of transportation systems in a city?',
        hint: 'Mention roads, rail, buses, and non-motorized transport.',
        difficulty: 'easy',
        category: 'transportation',
      },
      {
        id: 29,
        text: 'Why is traffic signal timing important?',
        hint: 'Talk about traffic flow and reducing delays.',
        difficulty: 'easy',
        category: 'transportation',
      },
      {
        id: 30,
        text: 'What are the benefits of public transportation?',
        hint: 'Discuss cost, congestion, and environmental impact.',
        difficulty: 'easy',
        category: 'transportation',
      },
      // Transportation - Medium
      {
        id: 31,
        text: 'What causes traffic congestion, and how can cities reduce it?',
        hint: 'Provide at least two causes and two solutions.',
        difficulty: 'medium',
        category: 'transportation',
      },
      {
        id: 32,
        text: 'Explain the idea of multimodal transportation.',
        hint: 'Describe combining different transport modes in one journey.',
        difficulty: 'medium',
        category: 'transportation',
      },
      {
        id: 33,
        text: 'How does road design affect traffic safety?',
        hint: 'Mention lane width, intersections, visibility, and speed control.',
        difficulty: 'medium',
        category: 'transportation',
      },
      // Transportation - Hard
      {
        id: 34,
        text: 'How would you design a transport plan for a rapidly growing city?',
        hint: 'Consider demand forecasting, land use, and policy constraints.',
        difficulty: 'hard',
        category: 'transportation',
      },
      {
        id: 35,
        text: 'Explain how data analytics can optimize public transport operations.',
        hint: 'Discuss scheduling, ridership prediction, and route optimization.',
        difficulty: 'hard',
        category: 'transportation',
      },
      {
        id: 36,
        text: 'What are the challenges of integrating EV infrastructure into transport systems?',
        hint: 'Mention charging networks, grid load, and planning standards.',
        difficulty: 'hard',
        category: 'transportation',
      },

      // Math - Easy
      {
        id: 37,
        text: 'What is the difference between a function and an equation?',
        hint: 'Define both and give a small example.',
        difficulty: 'easy',
        category: 'math',
      },
      {
        id: 38,
        text: 'What does slope mean in a graph?',
        hint: 'Explain rate of change in simple words.',
        difficulty: 'easy',
        category: 'math',
      },
      {
        id: 39,
        text: 'Give a real-life example of percentages.',
        hint: 'Use examples like discounts, grades, or statistics.',
        difficulty: 'easy',
        category: 'math',
      },
      // Math - Medium
      {
        id: 40,
        text: 'How is calculus used in engineering problems?',
        hint: 'Talk about rates of change, optimization, or area calculations.',
        difficulty: 'medium',
        category: 'math',
      },
      {
        id: 41,
        text: 'Explain the meaning of standard deviation in data analysis.',
        hint: 'Describe how spread-out data points are from the mean.',
        difficulty: 'medium',
        category: 'math',
      },
      {
        id: 42,
        text: 'What is the difference between permutation and combination?',
        hint: 'Explain why order matters in one but not the other.',
        difficulty: 'medium',
        category: 'math',
      },
      // Math - Hard
      {
        id: 43,
        text: 'How can linear algebra be applied in computer graphics or AI?',
        hint: 'Mention vectors, matrices, and transformations.',
        difficulty: 'hard',
        category: 'math',
      },
      {
        id: 44,
        text: 'Explain how optimization methods solve real-world engineering problems.',
        hint: 'Use one example with constraints and objectives.',
        difficulty: 'hard',
        category: 'math',
      },
      {
        id: 45,
        text: 'Compare deterministic models and probabilistic models in math modeling.',
        hint: 'Highlight assumptions, uncertainty, and use cases.',
        difficulty: 'hard',
        category: 'math',
      },

      // CS (Computing Science) - Extra
      {
        id: 46,
        text: 'What is the purpose of version control in software development?',
        hint: 'Mention collaboration and tracking changes.',
        difficulty: 'easy',
        category: 'cs',
      },
      {
        id: 47,
        text: 'What is the difference between a compiler and an interpreter?',
        hint: 'Explain how each executes code.',
        difficulty: 'easy',
        category: 'cs',
      },
      {
        id: 48,
        text: 'What is Big-O notation and why is it useful?',
        hint: 'Describe algorithm efficiency and scalability.',
        difficulty: 'medium',
        category: 'cs',
      },
      {
        id: 49,
        text: 'How does a REST API differ from a GraphQL API?',
        hint: 'Compare endpoint style and data fetching flexibility.',
        difficulty: 'medium',
        category: 'cs',
      },
      {
        id: 50,
        text: 'How would you explain microservices architecture and its trade-offs?',
        hint: 'Discuss modularity, deployment, and operational complexity.',
        difficulty: 'hard',
        category: 'cs',
      },

      // Mechanical - Extra
      {
        id: 51,
        text: 'What is the role of lubrication in machines?',
        hint: 'Talk about friction, wear, and heat.',
        difficulty: 'easy',
        category: 'mechanical',
      },
      {
        id: 52,
        text: 'What is the difference between ductile and brittle materials?',
        hint: 'Describe deformation behavior before failure.',
        difficulty: 'easy',
        category: 'mechanical',
      },
      {
        id: 53,
        text: 'Why is tolerance important in mechanical manufacturing?',
        hint: 'Mention fit, function, and interchangeability.',
        difficulty: 'medium',
        category: 'mechanical',
      },
      {
        id: 54,
        text: 'How do gears change speed and torque in a transmission system?',
        hint: 'Use gear ratio concepts in your explanation.',
        difficulty: 'medium',
        category: 'mechanical',
      },
      {
        id: 55,
        text: 'How would you evaluate failure modes in a mechanical component?',
        hint: 'Mention fatigue, overload, corrosion, and analysis methods.',
        difficulty: 'hard',
        category: 'mechanical',
      },

      // Civil - Extra
      {
        id: 56,
        text: 'What is the purpose of expansion joints in bridges?',
        hint: 'Talk about temperature change and movement allowance.',
        difficulty: 'easy',
        category: 'civil',
      },
      {
        id: 57,
        text: 'Why are building codes important in civil engineering?',
        hint: 'Mention safety, consistency, and legal compliance.',
        difficulty: 'easy',
        category: 'civil',
      },
      {
        id: 58,
        text: 'What are the key stages in a civil construction project lifecycle?',
        hint: 'Include planning, design, construction, and maintenance.',
        difficulty: 'medium',
        category: 'civil',
      },
      {
        id: 59,
        text: 'How does groundwater affect foundation design?',
        hint: 'Discuss buoyancy, seepage, and soil stability.',
        difficulty: 'medium',
        category: 'civil',
      },
      {
        id: 60,
        text: 'How can civil engineers reduce the carbon footprint of infrastructure projects?',
        hint: 'Mention materials, lifecycle design, and construction methods.',
        difficulty: 'hard',
        category: 'civil',
      },

      // Transportation - Extra
      {
        id: 61,
        text: 'What is the role of pedestrian crossings in road safety?',
        hint: 'Discuss visibility and reducing accident risk.',
        difficulty: 'easy',
        category: 'transportation',
      },
      {
        id: 62,
        text: 'Why is last-mile connectivity important in public transport?',
        hint: 'Explain access from station to final destination.',
        difficulty: 'easy',
        category: 'transportation',
      },
      {
        id: 63,
        text: 'How can intelligent transportation systems improve urban mobility?',
        hint: 'Mention sensors, adaptive signals, and real-time information.',
        difficulty: 'medium',
        category: 'transportation',
      },
      {
        id: 64,
        text: 'What factors should be considered when planning a bus route network?',
        hint: 'Talk about demand, coverage, frequency, and transfer points.',
        difficulty: 'medium',
        category: 'transportation',
      },
      {
        id: 65,
        text: 'How would autonomous vehicles impact future transportation systems?',
        hint: 'Discuss safety, regulation, infrastructure, and social effects.',
        difficulty: 'hard',
        category: 'transportation',
      },

      // Math - Extra
      {
        id: 66,
        text: 'What is the difference between mean, median, and mode?',
        hint: 'Define each and explain when each is useful.',
        difficulty: 'easy',
        category: 'math',
      },
      {
        id: 67,
        text: 'What does probability represent in real life?',
        hint: 'Give one simple practical example.',
        difficulty: 'easy',
        category: 'math',
      },
      {
        id: 68,
        text: 'How do derivatives help us understand changing systems?',
        hint: 'Explain rates of change with a real-world scenario.',
        difficulty: 'medium',
        category: 'math',
      },
      {
        id: 69,
        text: 'Why are matrices useful in engineering and computer science?',
        hint: 'Mention organizing data and performing transformations.',
        difficulty: 'medium',
        category: 'math',
      },
      {
        id: 70,
        text: 'How would you choose an appropriate mathematical model for a complex real-world problem?',
        hint: 'Discuss assumptions, data availability, and validation.',
        difficulty: 'hard',
        category: 'math',
      },
      // CS - Added
      {
        id: 71,
        text: 'What is the purpose of a variable in programming?',
        hint: 'Say that it stores values which your code can use and update.',
        difficulty: 'easy',
        category: 'cs',
      },
      {
        id: 72,
        text: 'Why do we use loops in programs?',
        hint: 'Describe repeating code to handle repeated work.',
        difficulty: 'easy',
        category: 'cs',
      },
      {
        id: 73,
        text: 'What is an HTTP status code?',
        hint: 'Mention what it communicates about the result of a request.',
        difficulty: 'easy',
        category: 'cs',
      },
      {
        id: 74,
        text: 'How do functions help you structure a program?',
        hint: 'Explain reusability and breaking problems into steps.',
        difficulty: 'easy',
        category: 'cs',
      },
      {
        id: 75,
        text: 'Explain the difference between compilation and interpretation.',
        hint: 'Compare when and how code is executed.',
        difficulty: 'medium',
        category: 'cs',
      },
      {
        id: 76,
        text: 'What is time complexity and why is it useful?',
        hint: 'Talk about how runtime grows with input size.',
        difficulty: 'medium',
        category: 'cs',
      },
      {
        id: 77,
        text: 'What is a database index and what problem does it solve?',
        hint: 'Mention faster lookups and less scanning.',
        difficulty: 'medium',
        category: 'cs',
      },
      {
        id: 78,
        text: 'Compare TCP and UDP in a simple way.',
        hint: 'Discuss reliability vs speed and one use case for each.',
        difficulty: 'hard',
        category: 'cs',
      },
      {
        id: 79,
        text: 'What does thread safety mean, and how do you reduce race conditions?',
        hint: 'Mention synchronization such as locks or atomic operations.',
        difficulty: 'hard',
        category: 'cs',
      },
      {
        id: 80,
        text: 'Explain what a deadlock is and how to avoid it.',
        hint: 'Describe circular waiting and mitigation like consistent lock ordering.',
        difficulty: 'hard',
        category: 'cs',
      },

      // Mechanical - Added
      {
        id: 81,
        text: 'What is a lever, and how does it help in engineering?',
        hint: 'Explain the fulcrum and trading force for distance.',
        difficulty: 'easy',
        category: 'mechanical',
      },
      {
        id: 82,
        text: 'What is friction, and why is it important for machine design?',
        hint: 'Mention resistance to motion and wear or energy loss.',
        difficulty: 'easy',
        category: 'mechanical',
      },
      {
        id: 83,
        text: 'What is a gear ratio?',
        hint: 'Describe how it changes speed and torque.',
        difficulty: 'easy',
        category: 'mechanical',
      },
      {
        id: 84,
        text: 'What does lubrication do for mechanical parts?',
        hint: 'Mention reducing friction, wear, and heat.',
        difficulty: 'easy',
        category: 'mechanical',
      },
      {
        id: 85,
        text: 'Explain the difference between stress and strain.',
        hint: 'Stress is force per area, strain is deformation.',
        difficulty: 'medium',
        category: 'mechanical',
      },
      {
        id: 86,
        text: 'How does thermal expansion affect mechanical components?',
        hint: 'Talk about size changes with temperature.',
        difficulty: 'medium',
        category: 'mechanical',
      },
      {
        id: 87,
        text: 'What is the role of bearings in rotating systems?',
        hint: 'Mention supporting shafts and reducing friction.',
        difficulty: 'medium',
        category: 'mechanical',
      },
      {
        id: 88,
        text: 'How do engineers predict fatigue failure risk?',
        hint: 'Mention loading cycles and material fatigue behavior.',
        difficulty: 'hard',
        category: 'mechanical',
      },
      {
        id: 89,
        text: 'How does a gearbox choose appropriate gear ratios for output torque?',
        hint: 'Explain balancing motor efficiency with required output.',
        difficulty: 'hard',
        category: 'mechanical',
      },
      {
        id: 90,
        text: 'Compare tensile loading and compressive loading with an example.',
        hint: 'Give one case for each load type.',
        difficulty: 'hard',
        category: 'mechanical',
      },

      // Civil - Added
      {
        id: 91,
        text: 'Why do we add reinforcement to concrete structures?',
        hint: 'Mention tensile strength and reducing cracking.',
        difficulty: 'easy',
        category: 'civil',
      },
      {
        id: 92,
        text: 'How does a drainage system protect civil infrastructure?',
        hint: 'Talk about removing excess water to prevent erosion and damage.',
        difficulty: 'easy',
        category: 'civil',
      },
      {
        id: 93,
        text: 'What do building codes ensure for construction projects?',
        hint: 'Mention minimum safety and quality standards.',
        difficulty: 'easy',
        category: 'civil',
      },
      {
        id: 94,
        text: 'What is the purpose of a retaining wall?',
        hint: 'Explain holding back soil and preventing sliding.',
        difficulty: 'easy',
        category: 'civil',
      },
      {
        id: 95,
        text: 'Explain the idea of a load path in structural design.',
        hint: 'Describe how forces travel to the foundation.',
        difficulty: 'medium',
        category: 'civil',
      },
      {
        id: 96,
        text: 'What is the difference between compression and tension in structures?',
        hint: 'Mention pushing vs pulling forces and how members are designed.',
        difficulty: 'medium',
        category: 'civil',
      },
      {
        id: 97,
        text: 'How do soil properties affect foundation design?',
        hint: 'Mention bearing capacity and settlement risk.',
        difficulty: 'medium',
        category: 'civil',
      },
      {
        id: 98,
        text: 'How would you design a structure to resist strong wind?',
        hint: 'Talk about stiffness, bracing, and connections to foundations.',
        difficulty: 'hard',
        category: 'civil',
      },
      {
        id: 99,
        text: 'Explain key principles of seismic design.',
        hint: 'Mention ductility, redundancy, and energy dissipation.',
        difficulty: 'hard',
        category: 'civil',
      },
      {
        id: 100,
        text: 'How can sustainability be incorporated into infrastructure planning?',
        hint: 'Mention low-carbon materials and long-term efficiency.',
        difficulty: 'hard',
        category: 'civil',
      },

      // Transportation - Added
      {
        id: 101,
        text: 'What is the purpose of a traffic signal at an intersection?',
        hint: 'Explain controlling right of way in phases.',
        difficulty: 'easy',
        category: 'transportation',
      },
      {
        id: 102,
        text: 'What does BRT mean, and why is it considered rapid transit?',
        hint: 'Mention dedicated lanes and fast boarding.',
        difficulty: 'easy',
        category: 'transportation',
      },
      {
        id: 103,
        text: 'Explain congestion in simple terms.',
        hint: 'Talk about demand exceeding capacity and causing slow speeds.',
        difficulty: 'easy',
        category: 'transportation',
      },
      {
        id: 104,
        text: 'Why is walkability important in transport planning?',
        hint: 'Mention safety, sidewalks, crossings, and access to destinations.',
        difficulty: 'easy',
        category: 'transportation',
      },
      {
        id: 105,
        text: 'How does demand forecasting improve transit planning?',
        hint: 'Mention scheduling, fleet sizing, and route decisions.',
        difficulty: 'medium',
        category: 'transportation',
      },
      {
        id: 106,
        text: 'What is multimodal integration?',
        hint: 'Explain seamless trips across bus, metro, bike, and walking.',
        difficulty: 'medium',
        category: 'transportation',
      },
      {
        id: 107,
        text: 'How does road geometry affect driving speed and safety?',
        hint: 'Mention curvature, grade, and visibility.',
        difficulty: 'medium',
        category: 'transportation',
      },
      {
        id: 108,
        text: 'How can intelligent routing help reduce travel time?',
        hint: 'Talk about real-time traffic and dynamic route choices.',
        difficulty: 'hard',
        category: 'transportation',
      },
      {
        id: 109,
        text: 'What are the trade-offs of deploying autonomous vehicles in cities?',
        hint: 'Mention regulation, infrastructure, and edge case risks.',
        difficulty: 'hard',
        category: 'transportation',
      },
      {
        id: 110,
        text: 'How can pricing strategies manage travel demand?',
        hint: 'Mention shifting peak demand by route, time, or mode.',
        difficulty: 'hard',
        category: 'transportation',
      },

      // Math - Added
      {
        id: 111,
        text: 'Define what a function means in mathematics.',
        hint: 'Explain mapping from inputs to outputs.',
        difficulty: 'easy',
        category: 'math',
      },
      {
        id: 112,
        text: 'What does slope represent on a graph?',
        hint: 'Mention rate of change and steepness.',
        difficulty: 'easy',
        category: 'math',
      },
      {
        id: 113,
        text: 'Explain the difference between mean and median.',
        hint: 'Mention average vs the middle value.',
        difficulty: 'easy',
        category: 'math',
      },
      {
        id: 114,
        text: 'What is probability in a basic real-life way?',
        hint: 'Give the idea of likelihood between 0 and 1.',
        difficulty: 'easy',
        category: 'math',
      },
      {
        id: 115,
        text: 'What is the difference between permutations and combinations?',
        hint: 'Order matters for permutations and not for combinations.',
        difficulty: 'medium',
        category: 'math',
      },
      {
        id: 116,
        text: 'How do variance and standard deviation describe a data set?',
        hint: 'Talk about spread around the mean.',
        difficulty: 'medium',
        category: 'math',
      },
      {
        id: 117,
        text: 'Why is linear algebra useful in practical tasks?',
        hint: 'Mention vectors, matrices, and transformations.',
        difficulty: 'medium',
        category: 'math',
      },
      {
        id: 118,
        text: 'Explain optimization with constraints in your own words.',
        hint: 'Mention finding the best solution under limitations.',
        difficulty: 'hard',
        category: 'math',
      },
      {
        id: 119,
        text: 'How would you model real-world data using a mathematical function?',
        hint: 'Explain choosing a form, fitting parameters, and validating.',
        difficulty: 'hard',
        category: 'math',
      },
      {
        id: 120,
        text: 'Compare deterministic models and probabilistic models.',
        hint: 'Deterministic gives one outcome, probabilistic models include uncertainty.',
        difficulty: 'hard',
        category: 'math',
      },
    ],
    []
  );

  const [step, setStep] = useState<1 | 2>(1);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [category, setCategory] = useState<Category>('cs');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const filteredQuestions = useMemo(
    () => questions.filter((q) => q.difficulty === difficulty && q.category === category),
    [questions, difficulty, category]
  );

  useEffect(() => {
    if (step === 1) {
      setCurrentQuestion(null);
      setAudioUrl(null);
      setError(null);
      return;
    }
    if (filteredQuestions.length === 0) {
      setCurrentQuestion(null);
      return;
    }
    setCurrentQuestion(filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)]);
    setAudioUrl(null);
    setShowAnswer(false);
    setError(null);
  }, [difficulty, category, filteredQuestions, step]);

  const handleNextQuestion = () => {
    if (filteredQuestions.length === 0) return;
    const remaining = filteredQuestions.filter((q) => q.id !== currentQuestion?.id);
    const pool = remaining.length > 0 ? remaining : filteredQuestions;
    const next = pool[Math.floor(Math.random() * pool.length)];
    setCurrentQuestion(next);
    setAudioUrl(null);
    setShowAnswer(false);
    setError(null);
  };

  const handleStartRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAudioUrl(null);
      setShowAnswer(false);
    } catch (e) {
      setError('Cannot access microphone. Please check your browser permissions.');
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      setIsRecording(false);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Oral Practice</h1>
        <p className="text-gray-500 mt-1">
          Practice your speaking skills by answering random English questions and listening to your own recording.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        {step === 1 ? (
          <>
            <h2 className="text-lg font-semibold text-gray-900">Step 1: Choose difficulty</h2>
            <p className="text-sm text-gray-500">
              First, select how difficult you want the questions to be. You will choose a topic in the next step.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setDifficulty('easy')}
                className={`px-4 py-2 rounded-md text-sm font-medium border ${
                  difficulty === 'easy'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                Easy
              </button>
              <button
                type="button"
                onClick={() => setDifficulty('medium')}
                className={`px-4 py-2 rounded-md text-sm font-medium border ${
                  difficulty === 'medium'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                Medium
              </button>
              <button
                type="button"
                onClick={() => setDifficulty('hard')}
                className={`px-4 py-2 rounded-md text-sm font-medium border ${
                  difficulty === 'hard'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                Hard
              </button>
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="mt-6 inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              Next: Choose subject
            </button>
          </>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Step 2: Choose subject & answer</h2>
                <p className="text-sm text-gray-500">
                  Select a subject, then answer the question by speaking.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Difficulty</label>
                  <div className="text-sm text-gray-800 px-3 py-1 rounded-md bg-gray-50 border border-gray-100 inline-block">
                    {difficulty === 'easy' ? 'Easy' : difficulty === 'medium' ? 'Medium' : 'Hard'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="border rounded-md px-2 py-1 text-sm text-gray-700"
                  >
                    <option value="cs">CS</option>
                    <option value="mechanical">Mechanical</option>
                    <option value="civil">Civil</option>
                    <option value="transportation">Transportation</option>
                    <option value="math">Math</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <h3 className="text-base font-semibold text-gray-900">Current Question</h3>
            <p className="text-base text-gray-900 font-medium">
              {currentQuestion
                ? currentQuestion.text
                : filteredQuestions.length === 0
                  ? 'No questions available for this difficulty and subject.'
                  : 'Loading question...'}
            </p>
            {currentQuestion?.hint && <p className="text-sm text-gray-500 mt-1">Hint: {currentQuestion.hint}</p>}
            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                onClick={handleToggleRecording}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white transition shadow-sm ${
                  isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
              >
                Next Question
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3 py-2 rounded-md text-xs font-medium text-gray-500 hover:text-gray-700"
              >
                Back to difficulty
              </button>
            </div>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            {audioUrl && (
              <div className="mt-4 space-y-1">
                <p className="text-sm text-gray-600">Your recording:</p>
                <audio controls src={audioUrl} className="w-full" />
                <button
                  type="button"
                  onClick={() => setShowAnswer((prev) => !prev)}
                  className="mt-3 px-4 py-2 rounded-md text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
                >
                  {showAnswer ? 'Hide Answer' : 'View Answer'}
                </button>
                {showAnswer && currentQuestion && (
                  <div className="mt-2 rounded-md border border-indigo-100 bg-indigo-50 p-3">
                    <p className="text-xs font-semibold text-indigo-700">Sample Answer</p>
                    <p className="mt-1 text-sm text-indigo-900">
                      {questionAnswers[currentQuestion.id] ?? 'No sample answer is available yet.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Tips for better speaking</h2>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>Speak slowly and clearly. Focus on pronunciation first, then speed.</li>
          <li>Try to answer for at least 30 seconds to 1 minute.</li>
          <li>Listen to your recording and notice where you hesitate or mispronounce words.</li>
          <li>Repeat the same question several times to build confidence.</li>
        </ul>
        <p className="text-xs text-gray-400 mt-1">
          You can later extend this page with automatic evaluation or teacher feedback.
        </p>
      </div>

      <div className="text-sm text-gray-500">
        Want to review vocabulary first?{' '}
        <Link to="/review" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Go to Review
        </Link>
        .
      </div>
    </div>
  );
}
