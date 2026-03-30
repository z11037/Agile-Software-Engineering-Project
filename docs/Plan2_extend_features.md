# English Learning App -- Plan 2: Extend Features

## What this document is
This document summarizes the **extra features** that are planned in addition to `docs/Plan1_basic_feature.md`.

It focuses on features that are **not covered** in Plan 1, based on the project plan notes (e.g., `docs/Plan.md`).

## Baseline from Plan 1 (for comparison)
`docs/Plan1_basic_feature.md` already covers the core learning loop, including:
- User auth (register/login with JWT)
- Vocabulary review with spaced repetition-style scheduling (review due words + update familiarity)
- Quiz system (generate quiz, submit answers, and view quiz history)
- Progress tracking and a statistics dashboard (charts + summary)
- Word browsing and filtering by category/difficulty

## Extra features in Plan 2

### 1. Daily Learning Reminder
**Goal:** Help users build a consistent study habit by reminding them to review vocabulary and/or take a quiz.

**User story (from planning):**
- As a student, I want **reminders to study**.

**Functional requirements**
- Reminder can be enabled/disabled per user.
- Reminder timing is based on a user-configured preference (e.g., time of day + timezone).
- Reminder content should be actionable, pointing the user to the next recommended activity (e.g., “You have `N` words due”).
- Reminders must only be sent when the user is authenticated (or after a user signs in again).

**Data needed**
- `reminder_enabled` (boolean)
- `preferred_reminder_time` (time-of-day)
- `timezone` (IANA timezone string recommended)
- Optional: last reminder sent timestamp to avoid duplicates.

**Backend/API planning (high level)**
- Endpoints for:
  - Getting/updating reminder settings
  - Triggering/sending reminders at the scheduled time (implementation can be cron/worker-based later)
- Reminder logic should query:
  - Words due for review (existing “review due” concept)
  - Optionally quiz availability (if quizzes are also part of the reminder message)

**Frontend/UX planning**
- Add a reminder setting entry to a user area (e.g., dashboard settings):
  - Toggle on/off
  - Choose reminder time
  - Optionally show the next scheduled reminder
- In dashboard:
  - Show a short “Next study” card using existing progress data

**Acceptance criteria**
- A user can enable reminders and see confirmation of their configured schedule.
- The system sends reminders at the configured time (for the chosen implementation approach).
- The reminder message accurately reflects the user’s current learning state (e.g., due review count).
- No duplicate reminders occur within the same scheduled window.

**Non-goals (for the first iteration)**
- Push notifications to mobile devices (unless the team chooses to extend scope later).
- Complex calendar integrations.

---

### 2. Personalized Learning Recommendations
**Goal:** Recommend what a user should do next based on their progress, so studying becomes more targeted and motivating.

**User story (from planning):**
- As a student, I want **personalized recommendations**.

**What “personalized” means**
Recommendations should be derived from learning data, such as:
- Words that are due (using the same scheduling/familiarity concept as vocabulary review)
- Weak areas (e.g., low familiarity or lower accuracy for certain categories)
- Recent performance trends (optional, can start simple)

**Functional requirements**
- Provide a “Next step” recommendation list for the user.
- Recommendations should adapt over time as the user reviews words and submits quizzes.
- The recommendation output should be explainable at a basic level (e.g., “Because these are due” / “Because category accuracy is low”).

**Recommendation categories (planned output)**
At minimum, provide:
- “Review now” items: top due words to review
Optional additional suggestions (if implemented in the iteration):
- “Focus on category X” when a category’s accuracy is below a threshold
- “Practice quiz next” if quiz performance suggests it would help

**Backend/API planning (high level)**
- Endpoint to fetch recommendations for the current user:
  - Input: none (derive from user progress)
  - Output: a structured list (e.g., recommended words + rationale + counts)
- Recommendation scoring can start simple:
  - Priority = due-ness (next review date)
  - Tie-breakers = lower familiarity / lower quiz accuracy by category (if available)

**Frontend/UX planning**
- On the dashboard:
  - Replace or complement “quick-start buttons” with personalized cards:
    - “You have `N` words due today”
    - “Focus: Category `<X>` (accuracy `<Y>%`)” (if implemented)
    - Button to jump directly to the relevant page (review/quiz)
- In the vocabulary review page:
  - Optionally highlight why a word is in the current set (e.g., due soon)

**Acceptance criteria**
- Recommendations match the user’s current progress state (due words and/or weak categories).
- After the user completes a review and/or quiz, recommendations change accordingly.
- The feature works for authenticated users and returns sensible defaults for newly created users.

---

## Definition of Done for Plan 2
Plan 2 is considered complete when:
- Daily learning reminder settings exist in the UI and are persisted for authenticated users.
- The system can generate reminder content based on due learning items.
- Personalized recommendation data is available via backend logic and is shown in the dashboard/user flow.
- Basic testing confirms reminders/recommendations do not crash and reflect user-specific state.

