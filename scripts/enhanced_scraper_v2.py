import os
import re
import time
import smtplib
import requests
from random import uniform
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import firebase_admin
from firebase_admin import credentials, firestore

import google.generativeai as genai
from scripts.read_google_sheet import read_google_sheet

# ===================== ENV & SECRETS =====================
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
GMAIL_FROM_EMAIL = os.getenv("GMAIL_FROM_EMAIL")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")
FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "coding-team-profiles-2b0b4df65b4a.json")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# ===================== FIREBASE =====================
try:
    firebase_admin.get_app()
except ValueError:
    cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred)

db = firestore.client()
HEADERS = {"User-Agent": "Mozilla/5.0"}

# ===================== EMAIL (unchanged parts omitted for brevity in this patch) =====================
# ... existing send_email_summary and helpers remain ...

# ===================== SKILLRACK VIA MIRROR API =====================

def _sanitize_url(url: str) -> str:
    if not url:
        return ""
    s = url.strip()
    if s.find('http', 10) > 0:
        first = s.find('http', 0)
        second = s.find('http', first + 1)
        if second > 0:
            s = s[:second]
    if '%20' in s:
        s = s.split('%20')[0]
    return s

def get_skillrack_mirror_api(profile_url: str) -> int:
    """Fetch solved count using the public mirror API which performs the heavy lifting."""
    try:
        cleaned = _sanitize_url(profile_url)
        if not cleaned:
            return 0
        api = "https://skillrack.gururaja.in/api/points"
        payload = {"url": cleaned.split("%")[0]}
        r = requests.post(api, json=payload, timeout=20)
        if r.status_code != 200:
            return 0
        data = r.json() if r.content else {}
        # Try common shapes seen in similar apps
        if isinstance(data, dict):
            if 'solved' in data and isinstance(data['solved'], (int, str)):
                try:
                    return int(data['solved'])
                except Exception:
                    pass
            result = data.get('result')
            if isinstance(result, dict) and 'solved' in result:
                try:
                    return int(result['solved'])
                except Exception:
                    pass
        return 0
    except Exception as e:
        print(f"⚠ SkillRack mirror API error: {e}")
        return 0

# ===================== OTHER SCRAPERS (LeetCode/CodeChef/HR/GitHub) =====================
# ... existing functions remain ...

# ===================== SYNC FROM GOOGLE SHEET =====================
# ... unchanged ...

# ===================== MAIN SCRAPING =====================

def scrape_all_teams():
    print("\n" + "="*60)
    print("🚀 STARTING AUTOMATED SCRAPING")
    print("="*60 + "\n")
    sync_members_from_sheet()
    from_email = GMAIL_FROM_EMAIL
    app_password = GMAIL_APP_PASSWORD
    departments = db.collection('departments').stream()
    total_members_scraped = 0
    for dept_doc in departments:
        dept_id = dept_doc.id
        print(f"\n📚 Department: {dept_id}")
        sections = dept_doc.reference.collection('sections').stream()
        for section_doc in sections:
            section_id = section_doc.id
            print(f"  📂 Section: {section_id}")
            teams = section_doc.reference.collection('teams').stream()
            for team_doc in teams:
                team_id = team_doc.id
                print(f"    👥 Team: {team_id}")
                members = team_doc.reference.collection('members').stream()
                for member_doc in members:
                    member_data = member_doc.to_dict()
                    member_id   = member_doc.id
                    name        = member_data.get('name', member_id)
                    email       = member_data.get('email', '')
                    profiles    = member_data.get('profiles', {})
                    print(f"      👤 Scraping {name}...")

                    today = datetime.now().strftime("%Y-%m-%d")
                    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

                    lc_total = get_leetcode_total(profiles.get('leetcode_url', ''));    time.sleep(uniform(1.0, 2.0))

                    # SkillRack: use mirror API (fresh), fallback to yesterday if API fails
                    sr_api = get_skillrack_mirror_api(profiles.get('skillrack_url', ''))
                    if sr_api <= 0:
                        try:
                            y_doc_tmp = member_doc.reference.collection('daily_totals').document(yesterday).get()
                            if y_doc_tmp.exists:
                                sr_api = int(y_doc_tmp.to_dict().get('skillrack_total', 0))
                        except Exception:
                            pass
                    sr_total = max(0, sr_api)
                    time.sleep(uniform(1.0, 2.0))

                    cc_total = get_codechef_solved(profiles.get('codechef_url', ''));  time.sleep(uniform(1.0, 2.0))
                    hr_total = get_hackerrank_solved(profiles.get('hackerrank_url', '')); time.sleep(uniform(1.0, 2.0))
                    gh_repos = get_github_repo_count(profiles.get('github_url', ''))

                    print(f"         LC: {lc_total} | SR: {sr_total} | CC: {cc_total} | HR: {hr_total} | GH: {gh_repos}")

                    lc_diff = sr_diff = cc_diff = hr_diff = gh_diff = 0
                    try:
                        y_doc = member_doc.reference.collection('daily_totals').document(yesterday).get()
                        if y_doc.exists:
                            y_data = y_doc.to_dict()
                            lc_diff = max(0, lc_total - y_data.get('leetcode_total', 0))
                            sr_diff = max(0, sr_total - y_data.get('skillrack_total', 0))
                            cc_diff = max(0, cc_total - y_data.get('codechef_total', 0))
                            hr_diff = max(0, hr_total - y_data.get('hackerrank_total', 0))
                            gh_diff = max(0, gh_repos - y_data.get('github_repos', 0))
                    except Exception:
                        pass

                    daily_data = {
                        'date': today,
                        'leetcode_total': lc_total,
                        'skillrack_total': sr_total,
                        'codechef_total': cc_total,
                        'hackerrank_total': hr_total,
                        'github_repos': gh_repos,
                        'leetcode_daily_increase': lc_diff,
                        'skillrack_daily_increase': sr_diff,
                        'codechef_daily_increase': cc_diff,
                        'hackerrank_daily_increase': hr_diff,
                        'github_daily_increase': gh_diff,
                        'scraped_at': datetime.now()
                    }

                    member_doc.reference.collection('daily_totals').document(today).set(daily_data)

                    if email and from_email and app_password:
                        subject = f"🚀 Your Daily Coding Report - {datetime.now().strftime('%b %d')}"
                        send_email_summary(email, subject, "", from_email, app_password, name, daily_data)

                    total_members_scraped += 1
                    print(f"         ✅ Saved to Firebase")

    print("\n" + "="*60)
    print(f"🎉 SCRAPING COMPLETE! Processed {total_members_scraped} members")
    print("="*60 + "\n")

if __name__ == "__main__":
    scrape_all_teams()
