import { 
  collection, getDocs, query, orderBy, Firestore, DocumentData
} from 'firebase/firestore';
import { DailyTotal, Hierarchy } from '../types';

export class FirebaseService {
  private db: Firestore;
  constructor(db: Firestore) { this.db = db; }

  // ... other methods remain unchanged

  private transformDailyData(
    dailyData: DocumentData,
    memberData: DocumentData,
    memberId: string,
    teamId: string,
    sectionId: string,
    deptId: string
  ): DailyTotal {
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
      assignedBatch: memberData.assigned_batch || '' // New mapping
    };
  }
}
