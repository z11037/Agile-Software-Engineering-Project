# Database Expansion Guide

## Overview

The database has been expanded to contain **3,200+** English words across multiple categories and difficulty levels.

## Word Sources

1. **Base Vocabulary** (220 words): Original daily phrases, food, school, etc.
2. **Extended Vocabulary** (1,046 words): Organized intermediate vocabulary by category
3. **Large Vocabulary Database** (1,500+ words): Common English words (B-D alphabetically)
4. **Generated Vocabulary** (511 words): Additional words created through vocabulary generator

**Total: ~3,277 words (before deduplication)**
**Estimated unique words: ~3,200 words**

## Categories

- **daily_life** - Daily activities and routines
- **food** - Food and cooking
- **school** - Education and learning
- **business** - Business and work
- **technology** - Technology and computing
- **travel** - Travel and transportation
- **health** - Health and medicine
- **nature** - Nature and environment
- **animals** - Animals
- **sports** - Sports and exercise
- **arts** - Arts and entertainment
- **emotions** - Emotions and personality
- **verbs** - Common verbs
- **adjectives** - Common adjectives
- **science** - Science and research
- **law** - Law and government
- **philosophy** - Religion and philosophy
- **geography** - Geography and places
- **time** - Time and dates
- **clothing** - Clothing and fashion
- **colors** - Colors and shapes
- **music** - Music and sound
- **academic** - Academic terminology

## Difficulty Levels

- **Level 1 (Easy)** - Basic vocabulary for beginners
- **Level 2 (Medium)** - Intermediate vocabulary
- **Level 3 (Hard)** - Advanced vocabulary

## How to Regenerate the Database

### Method 1: Using Batch Script (Recommended)

In the `backend` directory, double-click:
```
reseed_database.bat
```

### Method 2: Manual Execution

1. Open Anaconda Prompt
2. Activate environment:
   ```bash
   conda activate english-learning
   ```
3. Navigate to backend directory:
   ```bash
   cd /d D:\work\code\Agile-Software-Engineering-Project\backend
   ```
4. Delete old database (optional):
   ```bash
   del english_learning.db
   ```
5. Run seed script:
   ```bash
   python seed.py
   ```

## File Description

- `seed.py` - Main database seed file
- `vocabulary_generator.py` - Vocabulary generator for additional words
- `large_vocabulary.py` - Large vocabulary database (B-D words)
- `reseed_database.bat` - Automated batch script for database regeneration
- `english_learning.db` - SQLite database file (generated after running seed.py)

## Expected Output

After running `seed.py`, you should see output similar to:

```
============================================================
Generating comprehensive word list...
============================================================
  [1/4] Loading base vocabulary (200+ words)...
  [2/4] Generating extended vocabulary (1000+ words)...
  [3/4] Loading large vocabulary database (1500+ words)...
  [4/4] Generating additional vocabulary (500+ words)...

✓ Generated 3200+ unique words!
  Categories: 23
  Difficulty levels: 1 (Easy), 2 (Medium), 3 (Hard)

============================================================
Seeding 3200+ words into the database...
============================================================
  Progress: 100/3200 (3.1%)
  Progress: 200/3200 (6.3%)
  ...
  Progress: 3200/3200 (100.0%)

============================================================
✓ SUCCESS! Seeded 3200+ words into the database!
============================================================
```

## Notes

1. First-time generation may take 1-2 minutes
2. If database already exists, script will skip generation
3. To regenerate, delete `english_learning.db` file first
4. Ensure all dependencies are installed: `conda env create -f environment.yml`

## Verify Database

Run the following command to check word count in database:

```bash
python -c "from app.database import SessionLocal; from app.models.word import Word; db = SessionLocal(); print(f'Total words: {db.query(Word).count()}'); db.close()"
```

## Technical Details

- Database Type: SQLite
- ORM: SQLAlchemy
- Word Table Structure:
  - `id` - Primary key
  - `english` - English word
  - `chinese` - Chinese translation
  - `part_of_speech` - Part of speech
  - `example_sentence` - Example sentence
  - `difficulty_level` - Difficulty level (1-3)
  - `category` - Category

## Troubleshooting

### Issue: ModuleNotFoundError: No module named 'sqlalchemy'
**Solution**: Ensure conda environment is activated: `conda activate english-learning`

### Issue: Database file is locked/in use
**Solution**: Close all running backend servers and retry

### Issue: Word count less than expected
**Solution**: Check that `vocabulary_generator.py` and `large_vocabulary.py` files exist and are complete

## Update Log

- **2026-03-16**: Expanded database from 200+ words to 3,200+ words
- Added 23 categories
- Added 3 difficulty levels
- Created automated generation scripts
