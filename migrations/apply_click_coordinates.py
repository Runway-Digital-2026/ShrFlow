"""
Apply 057_click_coordinates.sql migration using asyncpg direct connection.
"""
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'platform', 'api'))

from dotenv import load_dotenv
load_dotenv()

import asyncio
import asyncpg

async def run():
    sql_file_path = os.path.join(os.path.dirname(__file__), '057_click_coordinates.sql')
    with open(sql_file_path, 'r') as f:
        sql = f.read()

    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Missing DATABASE_URL")
        exit(1)
        
    print("Applying 057_click_coordinates migration...")
    conn = await asyncpg.connect(db_url)
    try:
        await conn.execute(sql)
        print("Migration applied successfully via asyncpg direct connection!")
    except Exception as e:
        print(f"Failed to apply: {e}")
    finally:
        await conn.close()

asyncio.run(run())
