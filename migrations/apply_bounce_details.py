"""
Apply 056_bounce_details.sql migration using Supabase RPC.
"""
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'platform', 'api'))

from dotenv import load_dotenv
load_dotenv()

from supabase import create_client

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    exit(1)

client = create_client(url, key)

sql_file_path = os.path.join(os.path.dirname(__file__), '056_bounce_details.sql')
with open(sql_file_path, 'r') as f:
    sql = f.read()

print("Applying 056_bounce_details migration...")
try:
    result = client.rpc("exec_sql", {"query": sql}).execute()
    print("Migration applied successfully via RPC!")
except Exception as e:
    print(f"Failed to apply via RPC: {e}")
    # Fallback to direct DB query using asyncpg if possible
    print("Trying fallback via asyncpg...")
    import asyncio
    import asyncpg
    
    async def run_direct():
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            print("Missing DATABASE_URL")
            return
        conn = await asyncpg.connect(db_url)
        try:
            await conn.execute(sql)
            print("Migration applied successfully via asyncpg direct connection!")
        finally:
            await conn.close()
            
    asyncio.run(run_direct())
