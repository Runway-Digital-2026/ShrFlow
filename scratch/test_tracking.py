import os
import sys
import hmac
import hashlib
import base64
import requests
import psycopg2
from dotenv import load_dotenv

# Load env
load_dotenv()

db_url = os.getenv("DATABASE_URL")
tracking_secret = os.getenv("TRACKING_SECRET", "dev-tracking-secret")
api_base = "http://localhost:8000"

print(f"DATABASE_URL: {db_url}")
print(f"TRACKING_SECRET: {tracking_secret}")

# Connect to database
try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    print("Database connection successful!")
except Exception as e:
    print(f"Database connection failed: {e}")
    sys.exit(1)

# Find a valid dispatch
cur.execute("SELECT id, campaign_id, subscriber_id FROM campaign_dispatch LIMIT 1")
row = cur.fetchone()
if not row:
    print("No campaign dispatches found. Creating a test campaign/dispatch first...")
    # We should create a dummy campaign and dispatch if none exists
    # But let's check first.
    sys.exit(1)

dispatch_id, campaign_id, subscriber_id = row
print(f"Using dispatch_id: {dispatch_id}, campaign_id: {campaign_id}, subscriber_id: {subscriber_id}")

# Let's generate a signature for click
dest_url = "https://example.com/dest"
u_param = base64.urlsafe_b64encode(dest_url.encode()).decode().rstrip("=")

# HMAC signature base: {dispatch_id}:{u_param}
base = f"{dispatch_id}:{u_param}"
sig = hmac.new(tracking_secret.encode(), base.encode(), hashlib.sha256).hexdigest()

# Call /track/click with ismap style coordinates: ?150,230
click_url = f"{api_base}/track/click?d={dispatch_id}&u={u_param}&s={sig}&150,230"
print(f"Calling click URL: {click_url}")
response = requests.get(click_url, allow_redirects=False)
print(f"Status Code: {response.status_code}")
print(f"Location: {response.headers.get('Location')}")

# Verify that the event was recorded in the database
cur.execute(
    "SELECT id, event_type, click_x, click_y FROM email_events WHERE dispatch_id = %s AND event_type = 'click' ORDER BY created_at DESC LIMIT 1",
    (dispatch_id,)
)
event = cur.fetchone()
if event:
    print(f"Found recorded click event: ID={event[0]}, Type={event[1]}, Click X={event[2]}, Click Y={event[3]}")
    if event[2] == 150 and event[3] == 230:
        print("SUCCESS: Click coordinates recorded correctly!")
    else:
        print("FAILURE: Click coordinates mismatch.")
else:
    print("FAILURE: Click event not recorded in database.")

# Now test standard x,y parameters: ?x=45&y=89
click_url_std = f"{api_base}/track/click?d={dispatch_id}&u={u_param}&s={sig}&x=45&y=89"
print(f"\nCalling click URL with std parameters: {click_url_std}")
response = requests.get(click_url_std, allow_redirects=False)
print(f"Status Code: {response.status_code}")

cur.execute(
    "SELECT id, event_type, click_x, click_y FROM email_events WHERE dispatch_id = %s AND event_type = 'click' ORDER BY created_at DESC LIMIT 1",
    (dispatch_id,)
)
event = cur.fetchone()
if event:
    print(f"Found recorded click event: ID={event[0]}, Type={event[1]}, Click X={event[2]}, Click Y={event[3]}")
    if event[2] == 45 and event[3] == 89:
        print("SUCCESS: Standard click coordinates recorded correctly!")
    else:
        print("FAILURE: Standard click coordinates mismatch.")
else:
    print("FAILURE: Standard click event not recorded in database.")

cur.close()
conn.close()
