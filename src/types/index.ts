export interface DailyTotal {
  id: string;
  date: string;
  memberId: string;
  memberName: string;
  email: string;
  teamId: string;
  sectionId: string;
  deptId: string;
  leetcodeTotal: number;
  leetcodeDailyIncrease: number;
  skillrackTotal: number;
  skillrackDailyIncrease: number;
  codechefTotal: number;
  codechefDailyIncrease: number;
  hackerrankTotal: number;
  hackerrankDailyIncrease: number;
  githubRepos: number;
  githubDailyIncrease: number;
  totalSolved: number;
  totalDailyIncrease: number;
  assignedTeamLead?: string;
  isTeamLead?: boolean;
  assignedBatch?: string; // New: '2023-2027' | '2024-2028' | '2025-2029'
}
