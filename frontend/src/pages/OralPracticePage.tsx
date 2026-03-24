import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type Difficulty = 'easy' | 'medium' | 'hard';
type Category = 'travel' | 'campus' | 'work' | 'daily';

type Question = {
  id: number;
  text: string;
  hint?: string;
  difficulty: Difficulty;
  category: Category;
};

export default function OralPracticePage() {
  const questions: Question[] = useMemo(
    () => [
      {
        id: 1,
        text: 'What did you do yesterday?',
        hint: 'Use past tense verbs.',
        difficulty: 'easy',
        category: 'daily',
      },
      {
        id: 2,
        text: 'Describe your ideal weekend.',
        hint: 'Talk about activities and feelings.',
        difficulty: 'easy',
        category: 'daily',
      },
      {
        id: 3,
        text: 'What is your favorite book and why?',
        hint: 'Explain the reasons in detail.',
        difficulty: 'medium',
        category: 'campus',
      },
      {
        id: 4,
        text: 'Talk about a person you admire.',
        hint: 'Describe their personality and actions.',
        difficulty: 'medium',
        category: 'daily',
      },
      {
        id: 5,
        text: 'What are your goals for learning English?',
        hint: 'Mention short-term and long-term goals.',
        difficulty: 'medium',
        category: 'campus',
      },
      // Travel – easy
      {
        id: 6,
        text: 'What is your favourite city to visit?',
        hint: 'Say the name of the city and why you like it.',
        difficulty: 'easy',
        category: 'travel',
      },
      {
        id: 7,
        text: 'How do you usually travel to your favourite city?',
        hint: 'Talk about transport, for example by train, by plane, or by car.',
        difficulty: 'easy',
        category: 'travel',
      },
      {
        id: 8,
        text: 'What food do you like to eat in your favourite city?',
        hint: 'Name some dishes or snacks you enjoy there.',
        difficulty: 'easy',
        category: 'travel',
      },
      // Travel – medium
      {
        id: 9,
        text: 'Which tourist attractions in your favourite city do you like most, and why?',
        hint: 'Describe 1–2 places and what you can do there.',
        difficulty: 'medium',
        category: 'travel',
      },
      {
        id: 10,
        text: 'Briefly describe some local food you have eaten in your favourite city.',
        hint: 'Talk about the taste, ingredients, or where you ate it.',
        difficulty: 'medium',
        category: 'travel',
      },
      {
        id: 11,
        text: 'Describe how you feel when you arrive in your favourite city.',
        hint: 'Use feeling words such as excited, relaxed, nervous, etc.',
        difficulty: 'medium',
        category: 'travel',
      },
      // Travel – hard
      {
        id: 12,
        text: 'What overall impression does this city give you?',
        hint: 'Talk about the atmosphere, lifestyle, and environment.',
        difficulty: 'hard',
        category: 'travel',
      },
      {
        id: 13,
        text: 'If a stranger asks you for directions in this city, how would you explain the way?',
        hint: 'Use clear step-by-step instructions, like “go straight”, “turn left”, “across from…”.',
        difficulty: 'hard',
        category: 'travel',
      },
      {
        id: 14,
        text: 'What are the people in this city like?',
        hint: 'Describe their personality, habits, and how they treat visitors.',
        difficulty: 'hard',
        category: 'travel',
      },
      {
        id: 15,
        text: 'Describe your whole travel experience in this city from beginning to end.',
        hint: 'Talk about when you left, what you did, and what you learned.',
        difficulty: 'hard',
        category: 'travel',
      },
      {
        id: 8,
        text: 'Describe your daily morning routine.',
        hint: 'Use time expressions and sequence words like “first, then, after that”.',
        difficulty: 'easy',
        category: 'daily',
      },
      {
        id: 9,
        text: 'What is your favorite hobby and how did you start it?',
        hint: 'Explain when you started and why you enjoy it.',
        difficulty: 'easy',
        category: 'daily',
      },
      {
        id: 10,
        text: 'Talk about a movie that you like.',
        hint: 'Mention the main story, characters, and why you recommend it.',
        difficulty: 'easy',
        category: 'daily',
      },
      {
        id: 11,
        text: 'Describe a challenge you faced and how you solved it.',
        hint: 'Use past tense and talk about your feelings.',
        difficulty: 'medium',
        category: 'daily',
      },
      {
        id: 12,
        text: 'If you could change one thing about your school or workplace, what would it be?',
        hint: 'Explain the problem and your solution.',
        difficulty: 'hard',
        category: 'work',
      },
      {
        id: 13,
        text: 'What kind of music do you like?',
        hint: 'Talk about your favorite singer, band, or song.',
        difficulty: 'easy',
        category: 'daily',
      },
      {
        id: 14,
        text: 'Describe a typical family gathering in your culture.',
        hint: 'Mention food, activities, and atmosphere.',
        difficulty: 'medium',
        category: 'daily',
      },
      {
        id: 15,
        text: 'What do you usually do to relax after a busy day?',
        hint: 'Use phrases about free time and relaxation.',
        difficulty: 'easy',
        category: 'daily',
      },
      {
        id: 16,
        text: 'Talk about an important decision you have made.',
        hint: 'Explain the options and why you chose one.',
        difficulty: 'hard',
        category: 'daily',
      },
      {
        id: 17,
        text: 'If you could learn any new skill, what would it be and why?',
        hint: 'Use conditional sentences like “I would… because…”.',
        difficulty: 'medium',
        category: 'campus',
      },
      {
        id: 18,
        text: 'Describe your favorite food or dish.',
        hint: 'Talk about ingredients, taste, and when you usually eat it.',
        difficulty: 'easy',
        category: 'daily',
      },
      {
        id: 19,
        text: 'What kind of job would you like to have in the future?',
        hint: 'Mention job duties and reasons for your choice.',
        difficulty: 'medium',
        category: 'work',
      },
      {
        id: 20,
        text: 'Talk about a habit you want to build or change.',
        hint: 'Explain your current situation and your plan.',
        difficulty: 'hard',
        category: 'daily',
      },
    ],
    []
  );

  const [step, setStep] = useState<1 | 2>(1);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [category, setCategory] = useState<Category>('daily');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
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
    setError(null);
  }, [difficulty, category, filteredQuestions, step]);

  const handleNextQuestion = () => {
    if (filteredQuestions.length === 0) return;
    const remaining = filteredQuestions.filter((q) => q.id !== currentQuestion?.id);
    const pool = remaining.length > 0 ? remaining : filteredQuestions;
    const next = pool[Math.floor(Math.random() * pool.length)];
    setCurrentQuestion(next);
    setAudioUrl(null);
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
              Next: Choose topic
            </button>
          </>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Step 2: Choose topic & answer</h2>
                <p className="text-sm text-gray-500">
                  Select a topic category, then answer the question by speaking.
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
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="border rounded-md px-2 py-1 text-sm text-gray-700"
                  >
                    <option value="travel">Travel</option>
                    <option value="campus">Campus Life</option>
                    <option value="work">Work</option>
                    <option value="daily">Daily Sharing</option>
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
                  ? 'No questions available for this difficulty and category.'
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
