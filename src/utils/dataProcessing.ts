import { DailyTotal, TeamStats, LeaderboardEntry, TeamComparison } from '../types';
import { format, parseISO } from 'date-fns';

/**
 * Process dataframe with calculated columns
 */
export function processDataFrame(data: DailyTotal[]): DailyTotal[] {
  if (!data.length) return data;
  
  // Sort by member and date
  return data.sort((a, b) => {
    const memberCompare = a.memberName.localeCompare(b.memberName);
    if (memberCompare !== 0) return memberCompare;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Calculate statistics for a dataset
 */
export function getTeamStats(data: DailyTotal[]): TeamStats {
  if (!data.length) {
    return {
      totalMembers: 0,
      totalProblems: 0,
      avgPerMember: 0,
      topPerformer: 'N/A',
      topPerformerScore: 0
    };
  }
  
  // Get latest data for each member
  const latestByMember = getLatestByMember(data);
  const totalProblems = latestByMember.reduce((sum, member) => sum + member.totalSolved, 0);
  const avgPerMember = Math.floor(totalProblems / latestByMember.length);
  
  // Find top performer
  const topPerformer = latestByMember.reduce((prev, current) => 
    current.totalSolved > prev.totalSolved ? current : prev
  );
  
  return {
    totalMembers: latestByMember.length,
    totalProblems,
    avgPerMember,
    topPerformer: topPerformer.memberName,
    topPerformerScore: topPerformer.totalSolved
  };
}

/**
 * Get latest data for each member
 */
export function getLatestByMember(data: DailyTotal[]): DailyTotal[] {
  const memberMap = new Map<string, DailyTotal>();
  
  data.forEach(record => {
    const existing = memberMap.get(record.memberName);
    if (!existing || new Date(record.date) > new Date(existing.date)) {
      memberMap.set(record.memberName, record);
    }
  });
  
  return Array.from(memberMap.values());
}

/**
 * Create leaderboard entries
 */
export function createLeaderboard(data: DailyTotal[]): LeaderboardEntry[] {
  const latest = getLatestByMember(data);
  
  return latest
    .sort((a, b) => b.totalSolved - a.totalSolved)
    .map((member, index) => ({
      rank: index + 1,
      memberName: member.memberName,
      teamId: member.teamId,
      sectionId: member.sectionId,
      deptId: member.deptId,
      leetcodeTotal: member.leetcodeTotal,
      skillrackTotal: member.skillrackTotal,
      codechefTotal: member.codechefTotal,
      hackerrankTotal: member.hackerrankTotal,
      totalSolved: member.totalSolved
    }));
}

/**
 * Create team comparison data
 */
export function createTeamComparison(data: DailyTotal[]): TeamComparison[] {
  const teamMap = new Map<string, DailyTotal[]>();
  
  // Group by team
  data.forEach(record => {
    const teamKey = record.teamId;
    if (!teamMap.has(teamKey)) {
      teamMap.set(teamKey, []);
    }
    teamMap.get(teamKey)!.push(record);
  });
  
  // Calculate stats for each team
  return Array.from(teamMap.entries())
    .map(([teamId, teamData]) => {
      const latest = getLatestByMember(teamData);
      const totalSolved = latest.reduce((sum, member) => sum + member.totalSolved, 0);
      const leetcode = latest.reduce((sum, member) => sum + member.leetcodeTotal, 0);
      const skillrack = latest.reduce((sum, member) => sum + member.skillrackTotal, 0);
      const codechef = latest.reduce((sum, member) => sum + member.codechefTotal, 0);
      const hackerrank = latest.reduce((sum, member) => sum + member.hackerrankTotal, 0);
      
      return {
        teamId,
        teamName: teamData[0]?.teamId || teamId,
        members: latest.length,
        totalSolved,
        leetcode,
        skillrack,
        codechef,
        hackerrank,
        avgPerMember: latest.length > 0 ? Math.floor(totalSolved / latest.length) : 0
      };
    })
    .sort((a, b) => b.totalSolved - a.totalSolved);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
}

/**
 * Filter data by date range
 */
export function filterByDateRange(
  data: DailyTotal[], 
  startDate?: string, 
  endDate?: string
): DailyTotal[] {
  if (!startDate && !endDate) return data;
  
  return data.filter(record => {
    const recordDate = new Date(record.date);
    const start = startDate ? new Date(startDate) : new Date('1900-01-01');
    const end = endDate ? new Date(endDate) : new Date('2100-12-31');
    
    return recordDate >= start && recordDate <= end;
  });
}

/**
 * Get unique members from data
 */
export function getUniqueMembers(data: DailyTotal[]): string[] {
  return [...new Set(data.map(d => d.memberName))].sort();
}

/**
 * Get unique teams from data
 */
export function getUniqueTeams(data: DailyTotal[]): string[] {
  return [...new Set(data.map(d => d.teamId))].sort();
}