import os
import sqlite3

db_path = 'english_learning.db'

if os.path.exists(db_path):
    print(f"Database exists: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM words')
    count = cursor.fetchone()[0]
    print(f"Current word count: {count}")
    conn.close()
    
    if count < 100:
        print("\nWARNING: Database has very few words!")
        print("You need to regenerate the database with: python seed.py")
else:
    print("Database does NOT exist!")
    print("You need to generate it with: python seed.py")
