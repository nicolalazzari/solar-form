import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Test reading them
print("Testing environment variables...")
print(f"Google Maps API Key: {os.getenv('GOOGLE_MAPS_API_KEY')[:10] if os.getenv('GOOGLE_MAPS_API_KEY') else 'NOT FOUND'}...")
print(f"GetAddress API Key: {os.getenv('GETADDRESS_API_KEY')[:10] if os.getenv('GETADDRESS_API_KEY') else 'NOT FOUND'}...")
print(f"Google Sheet ID: {os.getenv('GOOGLE_SHEET_ID')}")
print(f"Credentials file path: {os.getenv('GOOGLE_SHEETS_CREDENTIALS_FILE')}")

# Check if credentials file exists
creds_path = os.getenv('GOOGLE_SHEETS_CREDENTIALS_FILE')
if creds_path and os.path.exists(creds_path):
    print("✓ Credentials file found!")
else:
    print("✗ Credentials file NOT found - check your path")