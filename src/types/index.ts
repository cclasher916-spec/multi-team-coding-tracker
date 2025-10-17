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
  assignedBatch?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  sectionId: string;
  deptId: string;
  baseTeamName?: string;
  teamLeadName?: string;
  teamLeadEmail?: string;
}

export interface Section {
  id: string;
  name: string;
  deptId: string;
  teams: Record<string, Team>;
}

export interface Department {
  id: string;
  name: string;
  sections: Record<string, Section>;
}

export interface Hierarchy {
  [deptId: string]: Department;
}

export interface TeamStats {
  totalMembers: number;
  totalProblems: number;
  avgPerMember: number;
  topPerformer: string;
  topPerformerScore: number;
  teamLeadName?: string;
  teamLeadScore?: number;
}

export interface LeaderboardEntry {
  rank: number;
  memberId: string;
  memberName: string;
  teamId: string;
  sectionId: string;
  deptId: string;
  totalSolved: number;
  leetcodeTotal: number;
  skillrackTotal: number;
  codechefTotal: number;
  hackerrankTotal: number;
  isTeamLead?: boolean;
  assignedTeamLead?: string;
}
