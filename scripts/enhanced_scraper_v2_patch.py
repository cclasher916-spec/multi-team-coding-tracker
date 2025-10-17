def sync_members_from_sheet():
    """Sync members from Google Sheet to Firebase hierarchical structure with Team Lead grouping ONLY and Batch tagging"""
    print("🔄 Syncing members from Google Sheet...")
    
    try:
        df = read_google_sheet("team_registration_responses")
        df.columns = df.columns.str.strip()
        
        synced_count = 0
        
        for idx, row in df.iterrows():
            try:
                full_name = row.get('Full Name', row.get('Name', '')).strip()
                email = row.get('Email Address', row.get('Email ID', '')).strip()
                dept = row.get('Department', 'AIML').strip()
                section = row.get('Section', 'A').strip()
                team_name = row.get('Team Name', 'ByteBreakers').strip()
                team_lead = row.get('Team Lead', '').strip()  # Which leader this student belongs under
                batch = str(row.get('Batch', '') or '').strip()  # New: Batch like 2023-2027
                
                if not full_name:
                    continue
                
                # ONLY create Team Lead-based teams
                if not team_lead:
                    print(f"⚠️  Skipping {full_name} - no team lead assigned")
                    continue
                
                base_team_name = team_name
                team_display_name = f"{team_name} - {team_lead}"
                team_id = f"{team_name}_{team_lead}".replace(' ', '_')
                
                # Normalize IDs
                dept_id = dept.upper()
                section_id = f"Section_{section.upper()}"
                member_id = full_name.replace(' ', '_')
                
                # Create hierarchy
                dept_ref = db.collection('departments').document(dept_id)
                dept_ref.set({'name': f'{dept} Department', 'updated_at': datetime.now()}, merge=True)
                
                section_ref = dept_ref.collection('sections').document(section_id)
                section_ref.set({'name': f'Section {section}', 'updated_at': datetime.now()}, merge=True)
                
                # Create team with leader info
                team_ref = section_ref.collection('teams').document(team_id)
                team_data = {
                    'name': team_display_name,
                    'base_team_name': base_team_name,
                    'team_lead_name': team_lead,
                    'updated_at': datetime.now()
                }
                team_ref.set(team_data, merge=True)
                
                # Is this member the leader?
                is_actual_lead = (full_name.lower() == team_lead.lower())
                
                # Create/merge member with batch
                member_ref = team_ref.collection('members').document(member_id)
                member_data = {
                    'name': full_name,
                    'email': email,
                    'assigned_team_lead': team_lead,
                    'is_team_lead': is_actual_lead,
                    'assigned_batch': batch if batch else None,
                    'profiles': {
                        'leetcode_url': row.get('LeetCode Profile URL', row.get('LeetCode ID (eg: Gfz6n0WdOg or https://leetcode.com/u/Gfz6n0WdOg/)', '')).strip(),
                        'skillrack_url': row.get('SkillRack Profile URL', row.get('Skillrack Profile URL', '')).strip(),
                        'codechef_url': row.get('CodeChef Profile URL', '').strip(),
                        'hackerrank_url': row.get('HackerRank Profile URL', row.get('Hackerrank Profile URL', '')).strip(),
                        'github_url': row.get('GitHub Profile URL', '').strip()
                    },
                    'last_synced': datetime.now()
                }
                member_ref.set(member_data, merge=True)
                
                # Log
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
