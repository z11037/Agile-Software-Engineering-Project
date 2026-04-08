import { describe, expect, it } from 'vitest';

// ─── helpers extracted inline for unit testing ───────────────────────────────
// These mirror the pure functions used inside QuizPage.tsx

const QUIZ_CATEGORY_ORDER = [
  'csu_changsha',
  'computer_science',
  'mechanical_engineering',
  'civil_engineering',
  'transportation_engineering',
  'mathematics',
] as const;

const QUIZ_CATEGORY_LABELS: Record<string, string> = {
  csu_changsha: 'CSU & Changsha',
  computer_science: 'CS',
  mechanical_engineering: 'Mechanical',
  civil_engineering: 'Civil',
  transportation_engineering: 'Transportation',
  mathematics: 'Math',
};

function formatQuizCategory(apiKey: string): string {
  return QUIZ_CATEGORY_LABELS[apiKey] ?? apiKey.replace(/_/g, ' ');
}

function sortQuizCategories(keys: string[]): string[] {
  const orderSet = new Set<string>(QUIZ_CATEGORY_ORDER);
  const primary = QUIZ_CATEGORY_ORDER.filter((k) => keys.includes(k));
  const rest = keys.filter((k) => !orderSet.has(k));
  rest.sort();
  return [...primary, ...rest];
}

type TargetLanguage = 'chinese' | 'french' | 'spanish' | 'arabic' | 'persian';

interface QuizQuestion {
  id: number;
  english: string;
  chinese: string;
  french: string;
  spanish: string;
  arabic: string;
  persian: string;
  options: string[];
  correct_answer: string | null;
}

function getTranslation(q: QuizQuestion, lang: TargetLanguage): string {
  return q[lang] || q.chinese;
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe('formatQuizCategory', () => {
  it('maps known category keys to display labels', () => {
    expect(formatQuizCategory('computer_science')).toBe('CS');
    expect(formatQuizCategory('csu_changsha')).toBe('CSU & Changsha');
    expect(formatQuizCategory('mathematics')).toBe('Math');
  });

  it('falls back to replacing underscores for unknown keys', () => {
    expect(formatQuizCategory('some_new_category')).toBe('some new category');
  });
});

describe('sortQuizCategories', () => {
  it('places known categories in canonical order before unknown ones', () => {
    const input = ['mathematics', 'unknown_cat', 'computer_science', 'csu_changsha'];
    const sorted = sortQuizCategories(input);
    expect(sorted[0]).toBe('csu_changsha');
    expect(sorted[1]).toBe('computer_science');
    expect(sorted[2]).toBe('mathematics');
    expect(sorted[3]).toBe('unknown_cat');
  });

  it('sorts unknown categories alphabetically after canonical ones', () => {
    const input = ['zebra_cat', 'apple_cat', 'computer_science'];
    const sorted = sortQuizCategories(input);
    expect(sorted[0]).toBe('computer_science');
    expect(sorted[1]).toBe('apple_cat');
    expect(sorted[2]).toBe('zebra_cat');
  });

  it('returns empty array for empty input', () => {
    expect(sortQuizCategories([])).toEqual([]);
  });
});

describe('getTranslation', () => {
  const mockQuestion: QuizQuestion = {
    id: 1,
    english: 'algorithm',
    chinese: '算法',
    french: 'algorithme',
    spanish: 'algoritmo',
    arabic: 'خوارزمية',
    persian: 'الگوریتم',
    options: [],
    correct_answer: null,
  };

  it('returns the translation for the given language', () => {
    expect(getTranslation(mockQuestion, 'chinese')).toBe('算法');
    expect(getTranslation(mockQuestion, 'french')).toBe('algorithme');
    expect(getTranslation(mockQuestion, 'arabic')).toBe('خوارزمية');
  });

  it('falls back to chinese when the requested language field is empty', () => {
    const sparse: QuizQuestion = { ...mockQuestion, french: '' };
    expect(getTranslation(sparse, 'french')).toBe('算法');
  });
});

describe('quiz result card — English word visibility logic', () => {
  const q: QuizQuestion = {
    id: 42,
    english: 'compiler',
    chinese: '编译器',
    french: 'compilateur',
    spanish: 'compilador',
    arabic: 'مترجم',
    persian: 'کامپایلر',
    options: ['compiler', 'interpreter', 'linker', 'debugger'],
    correct_answer: 'compiler',
  };

  it('always has english populated on a question', () => {
    expect(q.english.length).toBeGreaterThan(0);
  });

  it('getTranslation returns non-empty string for all supported languages', () => {
    const langs: TargetLanguage[] = ['chinese', 'french', 'spanish', 'arabic', 'persian'];
    for (const lang of langs) {
      expect(getTranslation(q, lang).length).toBeGreaterThan(0);
    }
  });
});
