# This patch ensures sync_members_from_sheet is defined before use.
# It wraps the existing implementation to avoid NameError during CI runs.

from datetime import datetime
from scripts.read_google_sheet import read_google_sheet
from firebase_admin import firestore

try:
    db
except NameError:
    from firebase_admin import credentials, initialize_app
    import os
    cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'coding-team-profiles-2b0b4df65b4a.json')
    try:
        cred = credentials.Certificate(cred_path)
        initialize_app(cred)
    except Exception:
        pass
    db = firestore.client()

def sync_members_from_sheet():
    print("🔄 Syncing members from Google Sheet...")
    try:
        df = read_google_sheet("team_registration_responses")
        if df is None:
            print("⚠ No data returned from sheet; skipping sync")
            return 0
        df.columns = df.columns.str.strip()
        synced_count = 0
        for idx, row in df.iterrows():
            try:
                full_name = (row.get('Full Name', row.get('Name', '')) or '').strip()
                email     = (row.get('Email Address', row.get('Email ID', '')) or '').strip()
                dept      = (row.get('Department', 'AIML') or 'AIML').strip()
                section   = (row.get('Section', 'A') or 'A').strip()
                team_name = (row.get('Team Name', 'ByteBreakers') or 'ByteBreakers').strip()
                team_lead = (row.get('Team Lead', '') or '').strip()
                batch     = (row.get('Batch', '') or '').strip()
                if not full_name:
                    continue
                if not team_lead:
                    print(f"⚠ Skipping {full_name} - no team lead assigned")
                    continue
                base_team_name    = team_name
                team_display_name = f"{team_name} - {team_lead}"
                team_id           = f"{team_name}_{team_lead}".replace(' ', '_')
                dept_id    = dept.upper()
                section_id = f"Section_{section.upper()}"
                member_id  = full_name.replace(' ', '_')
                dept_ref = db.collection('departments').document(dept_id)
                dept_ref.set({'name': f'{dept} Department', 'updated_at': datetime.now()}, merge=True)
                section_ref = dept_ref.collection('sections').document(section_id)
                section_ref.set({'name': f'Section {section}', 'updated_at': datetime.now()}, merge=True)
                team_ref = section_ref.collection('teams').document(team_id)
                team_ref.set({'name': team_display_name, 'base_team_name': base_team_name, 'team_lead_name': team_lead, 'updated_at': datetime.now()}, merge=True)
                is_actual_lead = (full_name.lower() == team_lead.lower())
                member_ref = team_ref.collection('members').document(member_id)
                member_ref.set({
                    'name': full_name,
                    'email': email,
                    'assigned_team_lead': team_lead,
                    'is_team_lead': is_actual_lead,
                    'assigned_batch': batch or None,
                    'profiles': {
                        'leetcode_url': (row.get('LeetCode Profile URL', row.get('LeetCode ID (eg: Gfz6n0WdOg or https://leetcode.com/u/Gfz6n0WdOg/)', '')) or '').strip(),
                        'skillrack_url': (row.get('SkillRack Profile URL', row.get('Skillrack Profile URL', '')) or '').strip(),
                        'codechef_url': (row.get('CodeChef Profile URL', '') or '').strip(),
                        'hackerrank_url': (row.get('HackerRank Profile URL', row.get('Hackerrank Profile URL', '')) or '').strip(),
                        'github_url': (row.get('GitHub Profile URL', '') or '').strip()
                    },
                    'last_synced': datetime.now()
                }, merge=True)
                role_display = "LEADER" if is_actual_lead else f"under {team_lead}"
                batch_display = f" • Batch {batch}" if batch else ""
                print(f"✅ Synced: {full_name} → {dept}/{section}/{team_display_name} ({role_display}){batch_display}")
                synced_count += 1
            except Exception as e:
                print(f"❌ Error syncing row {idx+1}: {e}")
        print(f"\n📊 Synced {synced_count} members")
        return synced_count
    except Exception as e:
        print(f"❌ Error reading Google Sheet: {e}")
        return 0
