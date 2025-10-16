import { DailyTotal, TeamStats, LeaderboardEntry } from '../types';

/**
 * Process raw data frame by sorting and computing totals
 */
export function processDataFrame(data: DailyTotal[]): DailyTotal[] {
  if (!data || data.length === 0) return [];
  
  return data
    .map(record => ({
      ...record,
      totalSolved: (record.leetcodeTotal || 0) + (record.skillrackTotal || 0) + 
                   (record.codechefTotal || 0) + (record.hackerrankTotal || 0),
      totalDailyIncrease: (record.leetcodeDailyIncrease || 0) + (record.skillrackDailyIncrease || 0) + 
                          (record.codechefDailyIncrease || 0) + (record.hackerrankDailyIncrease || 0)
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get latest record for each member
 */
export function getLatestByMember(data: DailyTotal[]): DailyTotal[] {
  if (!data || data.length === 0) return [];
  
  const latestByMember = new Map<string, DailyTotal>();
  
  data.forEach(record => {
    const existing = latestByMember.get(record.memberId);
    if (!existing || new Date(record.date) > new Date(existing.date)) {
      latestByMember.set(record.memberId, record);
    }
  });
  
  return Array.from(latestByMember.values())
    .sort((a, b) => {
      // Sort team leads first, then by total solved
      if (a.isTeamLead && !b.isTeamLead) return -1;
      if (!a.isTeamLead && b.isTeamLead) return 1;
      return b.totalSolved - a.totalSolved;
    });
}

/**
 * Calculate team statistics
 */
export function getTeamStats(data: DailyTotal[]): TeamStats {
  if (!data || data.length === 0) {
    return {
      totalMembers: 0,
      totalProblems: 0,
      avgPerMember: 0,
      topPerformer: 'N/A',
      topPerformerScore: 0,
      teamLeadName: '',
      teamLeadScore: 0
    };
  }
  
  const latest = getLatestByMember(data);
  const teamLead = latest.find(member => member.isTeamLead);
  
  const totalProblems = latest.reduce((sum, member) => sum + member.totalSolved, 0);
  const avgPerMember = Math.round(totalProblems / latest.length);
  const topPerformer = latest[0]; // Already sorted by total solved
  
  return {
    totalMembers: latest.length,
    totalProblems,
    avgPerMember,
    topPerformer: topPerformer?.memberName || 'N/A',
    topPerformerScore: topPerformer?.totalSolved || 0,
    teamLeadName: teamLead?.memberName || '',
    teamLeadScore: teamLead?.totalSolved || 0
  };
}

/**
 * Create leaderboard with ranks
 */
export function createLeaderboard(data: DailyTotal[]): LeaderboardEntry[] {
  const latest = getLatestByMember(data);
  
  return latest.map((member, index) => ({
    rank: index + 1,
    memberId: member.memberId,
    memberName: member.memberName,
    teamId: member.teamId,
    sectionId: member.sectionId,
    deptId: member.deptId,
    totalSolved: member.totalSolved,
    leetcodeTotal: member.leetcodeTotal,
    skillrackTotal: member.skillrackTotal,
    codechefTotal: member.codechefTotal,
    hackerrankTotal: member.hackerrankTotal,
    isTeamLead: member.isTeamLead,
    assignedTeamLead: member.assignedTeamLead
  }));
}

/**
 * Create team comparison data
 */
export function createTeamComparison(data: DailyTotal[]) {
  if (!data || data.length === 0) return [];
  
  const teamGroups = new Map<string, DailyTotal[]>();
  
  // Group by team
  data.forEach(record => {
    const teamKey = `${record.deptId}-${record.sectionId}-${record.teamId}`;
    if (!teamGroups.has(teamKey)) {
      teamGroups.set(teamKey, []);
    }
    teamGroups.get(teamKey)!.push(record);
  });
  
  // Calculate stats for each team
  const teamComparisons = [];
  for (const [teamKey, teamData] of teamGroups) {
    const stats = getTeamStats(teamData);
    const sampleMember = teamData[0];
    
    teamComparisons.push({
      teamName: sampleMember.teamId,
      deptName: sampleMember.deptId,
      sectionName: sampleMember.sectionId,
      members: stats.totalMembers,
      totalSolved: stats.totalProblems,
      avgPerMember: stats.avgPerMember,
      topPerformer: stats.topPerformer,
      topPerformerScore: stats.topPerformerScore,
      teamLeadName: stats.teamLeadName,
      teamLeadScore: stats.teamLeadScore
    });
  }
  
  return teamComparisons.sort((a, b) => b.totalSolved - a.totalSolved);
}