import { 
  collection, getDocs, query, orderBy, Firestore, DocumentData
} from 'firebase/firestore';
import { DailyTotal, Hierarchy } from '../types';

export class FirebaseService {
  private db: Firestore;
  constructor(db: Firestore) { this.db = db; }

  async loadHierarchy(): Promise<Hierarchy> {
    const hierarchy: Hierarchy = {};
    const departmentsSnapshot = await getDocs(collection(this.db, 'departments'));
    for (const deptDoc of departmentsSnapshot.docs) {
      const deptId = deptDoc.id;
      const deptData = deptDoc.data();
      hierarchy[deptId] = { id: deptId, name: deptData.name || deptId, sections: {} };
      const sectionsSnapshot = await getDocs(collection(this.db, 'departments', deptId, 'sections'));
      for (const sectionDoc of sectionsSnapshot.docs) {
        const sectionId = sectionDoc.id;
        const sectionData = sectionDoc.data();
        hierarchy[deptId].sections[sectionId] = { id: sectionId, name: sectionData.name || sectionId, deptId, teams: {} };
        const teamsSnapshot = await getDocs(collection(this.db, 'departments', deptId, 'sections', sectionId, 'teams'));
        for (const teamDoc of teamsSnapshot.docs) {
          const teamId = teamDoc.id;
          const teamData = teamDoc.data();
          hierarchy[deptId].sections[sectionId].teams[teamId] = {
            id: teamId,
            name: teamData.name || teamId,
            description: teamData.description || '',
            baseTeamName: teamData.base_team_name || teamData.name || teamId,
            teamLeadName: teamData.team_lead_name || '',
            teamLeadEmail: teamData.team_lead_email || '',
            sectionId,
            deptId
          };
        }
      }
    }
    return hierarchy;
  }

  async loadTeamData(deptId: string, sectionId: string, teamId: string): Promise<DailyTotal[]> {
    const rows: DailyTotal[] = [];
    const membersSnapshot = await getDocs(collection(this.db, 'departments', deptId, 'sections', sectionId, 'teams', teamId, 'members'));
    for (const memberDoc of membersSnapshot.docs) {
      const memberId = memberDoc.id;
      const memberData = memberDoc.data();
      const dailyTotalsSnapshot = await getDocs(
        query(collection(this.db, 'departments', deptId, 'sections', sectionId, 'teams', teamId, 'members', memberId, 'daily_totals'), orderBy('date', 'desc'))
      );
      dailyTotalsSnapshot.docs.forEach(dailyDoc => {
        const dailyData = dailyDoc.data();
        rows.push(this.transformDailyData(dailyData, memberData, memberId, teamId, sectionId, deptId));
      });
    }
    return rows;
  }

  async loadSectionData(deptId: string, sectionId: string): Promise<DailyTotal[]> {
    const all: DailyTotal[] = [];
    const teamsSnapshot = await getDocs(collection(this.db, 'departments', deptId, 'sections', sectionId, 'teams'));
    for (const teamDoc of teamsSnapshot.docs) {
      const teamId = teamDoc.id;
      const teamData = await this.loadTeamData(deptId, sectionId, teamId);
      all.push(...teamData);
    }
    return all;
  }

  async loadDepartmentData(deptId: string): Promise<DailyTotal[]> {
    const all: DailyTotal[] = [];
    const sectionsSnapshot = await getDocs(collection(this.db, 'departments', deptId, 'sections'));
    for (const sectionDoc of sectionsSnapshot.docs) {
      const sectionId = sectionDoc.id;
      const sectionData = await this.loadSectionData(deptId, sectionId);
      all.push(...sectionData);
    }
    return all;
  }

  async loadAllDepartmentsData(): Promise<DailyTotal[]> {
    const all: DailyTotal[] = [];
    const departmentsSnapshot = await getDocs(collection(this.db, 'departments'));
    for (const deptDoc of departmentsSnapshot.docs) {
      const deptId = deptDoc.id;
      const deptData = await this.loadDepartmentData(deptId);
      all.push(...deptData);
    }
    return all;
  }

  private transformDailyData(dailyData: DocumentData, memberData: DocumentData, memberId: string, teamId: string, sectionId: string, deptId: string): DailyTotal {
    const leetcodeTotal = dailyData.leetcode_total || 0;
    const skillrackTotal = dailyData.skillrack_total || 0;
    const codechefTotal = dailyData.codechef_total || 0;
    const hackerrankTotal = dailyData.hackerrank_total || 0;
    return {
      id: dailyData.id || `${memberId}-${dailyData.date}`,
      date: dailyData.date,
      memberId,
      memberName: memberData.name || memberId,
      email: memberData.email || '',
      teamId,
      sectionId,
      deptId,
      leetcodeTotal,
      leetcodeDailyIncrease: dailyData.leetcode_daily_increase || 0,
      skillrackTotal,
      skillrackDailyIncrease: dailyData.skillrack_daily_increase || 0,
      codechefTotal,
      codechefDailyIncrease: dailyData.codechef_daily_increase || 0,
      hackerrankTotal,
      hackerrankDailyIncrease: dailyData.hackerrank_daily_increase || 0,
      githubRepos: dailyData.github_repos || 0,
      githubDailyIncrease: dailyData.github_daily_increase || 0,
      totalSolved: leetcodeTotal + skillrackTotal + codechefTotal + hackerrankTotal,
      totalDailyIncrease: (dailyData.leetcode_daily_increase || 0) + (dailyData.skillrack_daily_increase || 0) + (dailyData.codechef_daily_increase || 0) + (dailyData.hackerrank_daily_increase || 0),
      assignedTeamLead: memberData.assigned_team_lead || '',
      isTeamLead: memberData.is_team_lead || false,
      assignedBatch: memberData.assigned_batch || ''
    };
  }
}
