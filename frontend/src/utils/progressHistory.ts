import type { DailyProgress } from '../types';

function utcTodayStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function addUtcDays(d: Date, delta: number): Date {
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + delta);
  return next;
}

function toISODateUTC(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Ensures every calendar day in the last `days` window (UTC, inclusive of today)
 * appears once, with 0-filled metrics when the API omits inactive days.
 */
export function normalizeProgressHistory(
  raw: DailyProgress[],
  days: number,
): DailyProgress[] {
  const byDate = new Map(raw.map((row) => [row.date, row]));
  const today = utcTodayStart();
  const out: DailyProgress[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = addUtcDays(today, -i);
    const iso = toISODateUTC(d);
    out.push(
      byDate.get(iso) ?? {
        date: iso,
        reviews: 0,
        quizzes: 0,
        accuracy: 0,
      },
    );
  }

  return out;
}
