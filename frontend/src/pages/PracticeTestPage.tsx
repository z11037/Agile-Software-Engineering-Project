import { useState } from 'react';

type Phase = 'task1_list' | 'task1_playing' | 'task1_finished' | 'task2_list' | 'task2_writing' | 'task2_finished';

type TaskTab = 'task1' | 'task2';

type ChartType = 'line' | 'bar' | 'process' | 'pie' | 'table' | 'map' | 'mixed';

interface PracticeItem {
  id: string;
  name: string;
  attempts: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

const chartLabels: Record<ChartType, string> = {
  line: 'Line chart',
  bar: 'Bar chart',
  process: 'Process diagram',
  pie: 'Pie chart',
  table: 'Table',
  map: 'Map',
  mixed: 'Mixed graph',
};

function createItemsForChart(type: ChartType): PracticeItem[] {
  return Array.from({ length: 5 }).map((_, index) => {
    const num = index + 1;
    return {
      id: `${type}-${num}`,
      name: `${chartLabels[type]} Test ${num}`,
      attempts: 5000 + num * 123,
      status: 'not_started' as const,
    };
  });
}

function getPromptForItem(item: PracticeItem): {
  title: string;
  description: string;
  requirements: string[];
} {
  const [rawType, rawIndex] = item.id.split('-');
  const index = Number(rawIndex ?? 1);
  const year = 2015 + index;
  const type = (rawType as ChartType) || 'line';

  switch (type) {
    case 'line':
      return {
        title: `Changes in Internet usage between ${year} and ${year + 5}`,
        description:
          'The line chart compares the percentage of people using the Internet in three different countries over a five‑year period.',
        requirements: [
          'Summarise the main trends and make comparisons where relevant.',
          'Select and report the key features of the data.',
          'Write at least 150 words.',
        ],
      };
    case 'bar':
      return {
        title: `Weekly hours spent on study, work and leisure in ${year}`,
        description:
          'The bar chart shows the average number of hours per week that adults allocate to study, work and leisure activities.',
        requirements: [
          'Compare how time is distributed across the three activities.',
          'Highlight any notable similarities or differences.',
          'Write at least 150 words.',
        ],
      };
    case 'process':
      return {
        title: 'How bottled water is produced',
        description:
          'The diagram illustrates the stages involved in producing bottled drinking water, from the initial collection of raw water to distribution in supermarkets.',
        requirements: [
          'Describe each main stage of the process in order.',
          'Group stages logically rather than describing every minor detail.',
          'Write at least 150 words.',
        ],
      };
    case 'pie':
      return {
        title: `Household spending patterns in ${year}`,
        description:
          'The pie charts compare how households in one country spent their money on five categories: housing, food, transport, entertainment and other items.',
        requirements: [
          'Compare the relative importance of the different categories.',
          'Focus on the most significant similarities and differences.',
          'Write at least 150 words.',
        ],
      };
    case 'table':
      return {
        title: 'University enrolment by faculty',
        description:
          'The table shows the number of students enrolled in four university faculties (Science, Engineering, Business and Arts) in three different years.',
        requirements: [
          'Report the main changes over time in each faculty.',
          'Make comparisons between faculties where relevant.',
          'Write at least 150 words.',
        ],
      };
    case 'map':
      return {
        title: `Development of a city park between ${year} and ${year + 10}`,
        description:
          'The maps show how a city park has changed over a ten‑year period, including new facilities and redesigned areas.',
        requirements: [
          'Describe the main changes that have taken place.',
          'Highlight how the overall layout of the park has evolved.',
          'Write at least 150 words.',
        ],
      };
    case 'mixed':
    default:
      return {
        title: 'Student satisfaction with online learning',
        description:
          'The mixed graph presents survey data on student satisfaction with online learning, including a bar chart of satisfaction levels and a line chart of enrolment numbers over time.',
        requirements: [
          'Summarise the key patterns shown in both the bar and line charts.',
          'Explain how satisfaction levels relate to enrolment trends.',
          'Write at least 150 words.',
        ],
      };
  }
}

const task2Tests = [
  {
    id: 't2-1',
    title: 'Exams and coursework',
    topic:
      "Some people believe that students’ exam results should be based only on formal written tests. Others think that coursework and class participation should also be taken into account.",
    task: 'Write an essay discussing both views and give your own opinion.',
  },
  {
    id: 't2-2',
    title: 'Technology and privacy',
    topic:
      'Today, many companies collect and store large amounts of personal data about their customers. Some people say this brings benefits, while others are worried about the risks.',
    task: 'Discuss the advantages and disadvantages of companies collecting personal data and give your own opinion.',
  },
  {
    id: 't2-3',
    title: 'Environment and responsibility',
    topic:
      'Some people think that protecting the environment is the responsibility of governments and large companies. Others believe that individuals should also play an important part.',
    task: 'Discuss both views and give your own opinion.',
  },
  {
    id: 't2-4',
    title: 'Long working hours',
    topic:
      'In many countries, people are working longer hours and have less free time than in the past. This situation can cause both personal and social problems.',
    task: 'Discuss the problems that long working hours can cause and suggest some possible solutions.',
  },
  {
    id: 't2-5',
    title: 'Globalisation and culture',
    topic:
      'Some people argue that globalisation is making the world more similar and is harming local cultures. Others believe that globalisation has a positive effect on societies.',
    task: 'Discuss both views and give your own opinion.',
  },
] as const;

export default function PracticeTestPage() {
  const [phase, setPhase] = useState<Phase>('task1_list');
  const [activeTask, setActiveTask] = useState<TaskTab>('task1');
  const [activeChart, setActiveChart] = useState<ChartType>('line');
  const [itemsByChart, setItemsByChart] = useState<Record<ChartType, PracticeItem[]>>({
    line: createItemsForChart('line'),
    bar: createItemsForChart('bar'),
    process: createItemsForChart('process'),
    pie: createItemsForChart('pie'),
    table: createItemsForChart('table'),
    map: createItemsForChart('map'),
    mixed: createItemsForChart('mixed'),
  });
  const [currentItem, setCurrentItem] = useState<PracticeItem | null>(null);
  const [loading] = useState(false);
  const [currentTask2Id, setCurrentTask2Id] = useState<string | null>(null);
  const [task2Text, setTask2Text] = useState('');

  const startPractice = (item: PracticeItem) => {
    setCurrentItem(item);
    setPhase('task1_playing');
    setItemsByChart((prev) => ({
      ...prev,
      [activeChart]: prev[activeChart].map((it) =>
        it.id === item.id ? { ...it, status: it.status === 'not_started' ? 'in_progress' : it.status } : it,
      ),
    }));
  };

  const handleFinish = () => {
    if (!currentItem) {
      setPhase('task1_list');
      return;
    }
    setItemsByChart((prev) => ({
      ...prev,
      [activeChart]: prev[activeChart].map((it) =>
        it.id === currentItem.id ? { ...it, status: 'completed', attempts: it.attempts + 1 } : it,
      ),
    }));
    setPhase('task1_finished');
  };

  const visibleItems = itemsByChart[activeChart];

  if (phase === 'task1_list' && activeTask === 'task1') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Writing Practice Tests</h1>
          <p className="text-gray-500 mt-1">
            Choose a practice test to start, continue or redo your writing practice.
          </p>
        </div>
        <div className="flex gap-3 text-sm border-b border-gray-200 pb-2">
          <button
            className={`px-3 py-1.5 rounded-full font-medium ${
              activeTask === 'task1' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTask('task1')}
          >
            Task 1
          </button>
          <button
            className="px-3 py-1.5 rounded-full font-medium text-gray-600 hover:bg-gray-100"
            onClick={() => {
              setActiveTask('task2');
              setPhase('task2_list');
            }}
          >
            Task 2
          </button>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-b border-gray-200 pb-2">
          {(Object.keys(chartLabels) as ChartType[]).map((type) => (
            <button
              key={type}
              className={`px-3 py-1.5 rounded-full font-medium ${
                activeChart === type ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100 text-gray-600'
              }`}
              onClick={() => setActiveChart(type)}
            >
              {chartLabels[type]}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-indigo-600 text-sm font-medium">{item.name}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {item.attempts.toLocaleString()} learners have practiced this test.
                </p>
              </div>

              <div className="flex items-center gap-3 text-sm">
                {item.status === 'completed' && (
                  <button
                    className="text-indigo-600 hover:text-indigo-800"
                    onClick={() => startPractice(item)}
                    disabled={loading}
                  >
                    Redo
                  </button>
                )}
                {item.status === 'in_progress' && (
                  <button
                    className="text-indigo-600 hover:text-indigo-800"
                    onClick={() => startPractice(item)}
                    disabled={loading}
                  >
                    Continue
                  </button>
                )}
                {item.status === 'not_started' && (
                  <button
                    className="text-indigo-600 hover:text-indigo-800"
                    onClick={() => startPractice(item)}
                    disabled={loading}
                  >
                    Start
                  </button>
                )}
                {item.status === 'completed' && (
                  <button className="text-indigo-600 hover:text-indigo-800" type="button">
                    View result
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'task1_playing' && currentItem && activeTask === 'task1') {
    const prompt = getPromptForItem(currentItem);

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{prompt.title}</h1>
            <p className="text-gray-500 text-sm mt-1">{currentItem.name}</p>
          </div>
          <span className="text-sm text-gray-400">Practice view</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <p className="text-sm text-gray-500">{prompt.description}</p>

          <ul className="list-disc list-inside text-sm text-gray-500 space-y-1">
            {prompt.requirements.map((req) => (
              <li key={req}>{req}</li>
            ))}
          </ul>

          <div className="mt-4 h-40 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-sm text-gray-400">
            Content placeholder – you can design your own practice interaction here.
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setPhase('task1_list')}
            className="px-5 py-2 text-gray-600 hover:text-gray-900 transition cursor-pointer"
          >
            Back
          </button>

          <button
            onClick={handleFinish}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition cursor-pointer"
          >
            Mark as completed
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'task1_finished' && currentItem && activeTask === 'task1') {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900">Completed {currentItem.name}</h2>
          <p className="text-gray-500 mt-2">
            This page is a UI example. Score analytics can be connected later.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setPhase('task1_list')}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition cursor-pointer"
          >
            Back to list
          </button>
          <button
            onClick={() => startPractice(currentItem)}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition cursor-pointer"
          >
            Redo
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'task2_list' && activeTask === 'task2') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Writing Practice Tests – Task 2</h1>
          <p className="text-gray-500 mt-1">Choose an essay question and start writing your answer.</p>
        </div>

        <div className="flex gap-3 text-sm border-b border-gray-200 pb-2">
          <button
            className="px-3 py-1.5 rounded-full font-medium text-gray-600 hover:bg-gray-100"
            onClick={() => {
              setActiveTask('task1');
              setPhase('task1_list');
            }}
          >
            Task 1
          </button>
          <button
            className="px-3 py-1.5 rounded-full font-medium bg-indigo-600 text-white"
            disabled
          >
            Task 2
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y">
          {task2Tests.map((t) => (
            <div
              key={t.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 gap-3"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.topic}</p>
              </div>
              <button
                className="text-indigo-600 hover:text-indigo-800 text-sm"
                onClick={() => {
                  setCurrentTask2Id(t.id);
                  setTask2Text('');
                  setPhase('task2_writing');
                }}
              >
                Start writing
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'task2_writing' && currentTask2Id && activeTask === 'task2') {
    const test = task2Tests.find((t) => t.id === currentTask2Id)!;
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task 2 Writing</h1>
            <p className="text-gray-500 text-sm mt-1">{test.title}</p>
          </div>
          <button
            className="text-sm text-gray-500 hover:text-gray-800"
            onClick={() => setPhase('task2_list')}
          >
            Back to list
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Question</h2>
            <p className="text-sm text-gray-700">{test.topic}</p>
            <p className="text-sm font-medium text-gray-800 mt-2">{test.task}</p>
            <p className="text-xs text-gray-500 mt-4">
              Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write
              at least 250 words.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Your essay</h2>
              <span className="text-xs text-gray-400">
                Approx. {task2Text.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              value={task2Text}
              onChange={(e) => setTask2Text(e.target.value)}
              className="flex-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[260px]"
              placeholder="Write your essay here..."
            />
            <div className="mt-3 flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                onClick={() => setTask2Text('')}
              >
                Clear
              </button>
              <button
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                onClick={() => setPhase('task2_finished')}
              >
                Finish
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'task2_finished' && currentTask2Id && activeTask === 'task2') {
    const test = task2Tests.find((t) => t.id === currentTask2Id)!;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900">Task 2 essay saved locally</h2>
          <p className="text-gray-500 mt-2">
            This is a practice view only. In a real app, your essay could be sent to the server for feedback.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">{test.title}</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{task2Text || '(No content written)'}</p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
            onClick={() => setPhase('task2_list')}
          >
            Back to list
          </button>
          <button
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            onClick={() => setPhase('task2_writing')}
          >
            Edit essay
          </button>
        </div>
      </div>
    );
  }

  return null;
}

