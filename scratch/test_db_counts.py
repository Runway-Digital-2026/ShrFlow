import os
import psycopg2
from dotenv import load_dotenv
from pathlib import Path

ROOT_ENV = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=ROOT_ENV)

db_url = os.getenv("DATABASE_URL")
print("Connecting to DB...")
conn = psycopg2.connect(db_url)
cur = conn.cursor()

tables = ["tenants", "campaigns", "contacts", "campaign_dispatch", "email_events"]
for table in tables:
    cur.execute(f"SELECT COUNT(*) FROM {table};")
    count = cur.fetchone()[0]
    print(f"Table {table}: {count} rows")

cur.close()
conn.close()
