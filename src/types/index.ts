export interface TeamMember {
  id: string;
  name: string;
  email: string;
  teamId: string;
  sectionId: string;
  deptId: string;
}

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
}

export interface Team {
  id: string;
  name: string;
  description: string;
  sectionId: string;
  deptId: string;
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
}

export type ViewLevel = 'Team View' | 'Section View' | 'Department View' | 'All Departments';

export interface LeaderboardEntry {
  rank: number;
  memberName: string;
  teamId: string;
  sectionId: string;
  deptId: string;
  leetcodeTotal: number;
  skillrackTotal: number;
  codechefTotal: number;
  hackerrankTotal: number;
  totalSolved: number;
}

export interface TeamComparison {
  teamId: string;
  teamName: string;
  members: number;
  totalSolved: number;
  leetcode: number;
  skillrack: number;
  codechef: number;
  hackerrank: number;
  avgPerMember: number;
}