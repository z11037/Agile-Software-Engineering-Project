import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type Difficulty = 'easy' | 'medium' | 'hard';
type Category = 'cs' | 'mechanical' | 'civel' | 'transportation' | 'math';

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

      // Civel - Easy
      {
        id: 19,
        text: 'What is the purpose of a foundation in a building?',
        hint: 'Talk about load transfer and stability.',
        difficulty: 'easy',
        category: 'civel',
      },
      {
        id: 20,
        text: 'What is reinforced concrete?',
        hint: 'Mention concrete with steel bars and why this combination is useful.',
        difficulty: 'easy',
        category: 'civel',
      },
      {
        id: 21,
        text: 'Why is drainage important in civil projects?',
        hint: 'Explain flood prevention and structure protection.',
        difficulty: 'easy',
        category: 'civel',
      },
      // Civel - Medium
      {
        id: 22,
        text: 'Explain the difference between dead load and live load.',
        hint: 'Give examples of each load type.',
        difficulty: 'medium',
        category: 'civel',
      },
      {
        id: 23,
        text: 'What factors affect the strength of concrete?',
        hint: 'Mention water-cement ratio, curing, and material quality.',
        difficulty: 'medium',
        category: 'civel',
      },
      {
        id: 24,
        text: 'Why do civil engineers perform soil tests before construction?',
        hint: 'Talk about bearing capacity and settlement risk.',
        difficulty: 'medium',
        category: 'civel',
      },
      // Civel - Hard
      {
        id: 25,
        text: 'How would you design infrastructure to resist earthquakes?',
        hint: 'Discuss flexibility, damping, and code requirements.',
        difficulty: 'hard',
        category: 'civel',
      },
      {
        id: 26,
        text: 'Explain the trade-offs between cost, safety, and sustainability in bridge design.',
        hint: 'Balance budget constraints with long-term performance.',
        difficulty: 'hard',
        category: 'civel',
      },
      {
        id: 27,
        text: 'How can smart city technologies improve urban civil engineering projects?',
        hint: 'Mention sensors, real-time monitoring, and data-driven decisions.',
        difficulty: 'hard',
        category: 'civel',
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

      // Civel - Extra
      {
        id: 56,
        text: 'What is the purpose of expansion joints in bridges?',
        hint: 'Talk about temperature change and movement allowance.',
        difficulty: 'easy',
        category: 'civel',
      },
      {
        id: 57,
        text: 'Why are building codes important in civil engineering?',
        hint: 'Mention safety, consistency, and legal compliance.',
        difficulty: 'easy',
        category: 'civel',
      },
      {
        id: 58,
        text: 'What are the key stages in a civil construction project lifecycle?',
        hint: 'Include planning, design, construction, and maintenance.',
        difficulty: 'medium',
        category: 'civel',
      },
      {
        id: 59,
        text: 'How does groundwater affect foundation design?',
        hint: 'Discuss buoyancy, seepage, and soil stability.',
        difficulty: 'medium',
        category: 'civel',
      },
      {
        id: 60,
        text: 'How can civil engineers reduce the carbon footprint of infrastructure projects?',
        hint: 'Mention materials, lifecycle design, and construction methods.',
        difficulty: 'hard',
        category: 'civel',
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
                    <option value="civel">Civel</option>
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
