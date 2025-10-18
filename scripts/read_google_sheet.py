import gspread
import pandas as pd
from oauth2client.service_account import ServiceAccountCredentials

def read_google_sheet(sheet_name, worksheet_index=0):
    """Reads data from a Google Sheet and returns a pandas DataFrame."""
    try:
        scope = [
            "https://spreadsheets.google.com/feeds",
            "https://www.googleapis.com/auth/drive"
        ]
        creds = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)
        client = gspread.authorize(creds)
        print("✅ Successfully connected to Google Sheets API.")
        sheet = client.open(sheet_name)
        worksheet = sheet.get_worksheet(worksheet_index)
        records = worksheet.get_all_records()
        df = pd.DataFrame(records)
        print(f"✅ Successfully read {len(df)} rows from '{sheet_name}'.")
        return df
    except Exception as e:
        print("❌ Failed to read Google Sheet.")
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    SHEET_NAME = "coding_team_profiles"
    df = read_google_sheet(SHEET_NAME)
    if df is not None:
        print("\n📊 Data from sheet:")
        print(df)
