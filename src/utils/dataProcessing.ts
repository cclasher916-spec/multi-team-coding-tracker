import { DailyTotal } from '../types';

export function processDataFrame(data: DailyTotal[]): DailyTotal[] {
  if (!data || data.length === 0) return [];
  return data
    .map(r => ({
      ...r,
      totalSolved: (r.leetcodeTotal || 0) + (r.skillrackTotal || 0) + (r.codechefTotal || 0) + (r.hackerrankTotal || 0),
      totalDailyIncrease: (r.leetcodeDailyIncrease || 0) + (r.skillrackDailyIncrease || 0) + (r.codechefDailyIncrease || 0) + (r.hackerrankDailyIncrease || 0)
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getLatestByMember(data: DailyTotal[]): DailyTotal[] {
  const map = new Map<string, DailyTotal>();
  data.forEach(rec => {
    const cur = map.get(rec.memberId);
    if (!cur || new Date(rec.date) > new Date(cur.date)) map.set(rec.memberId, rec);
  });
  return Array.from(map.values()).sort((a, b) => {
    if (a.isTeamLead && !b.isTeamLead) return -1;
    if (!a.isTeamLead && b.isTeamLead) return 1;
    return b.totalSolved - a.totalSolved;
  });
}

export function getTeamStats(data: DailyTotal[]) {
  const latest = getLatestByMember(data);
  if (latest.length === 0) return { totalMembers: 0, totalProblems: 0, avgPerMember: 0, topPerformer: 'N/A', topPerformerScore: 0, teamLeadName: '', teamLeadScore: 0 };
  const total = latest.reduce((s, m) => s + m.totalSolved, 0);
  const avg = Math.round(total / latest.length);
  const top = latest[0];
  const lead = latest.find(m => m.isTeamLead);
  return { totalMembers: latest.length, totalProblems: total, avgPerMember: avg, topPerformer: top.memberName, topPerformerScore: top.totalSolved, teamLeadName: lead?.memberName || '', teamLeadScore: lead?.totalSolved || 0 };
}

export function createLeaderboard(data: DailyTotal[]) {
  const latest = getLatestByMember(data);
  return latest.map((m, i) => ({
    rank: i + 1,
    memberId: m.memberId,
    memberName: m.memberName,
    teamId: m.teamId,
    sectionId: m.sectionId,
    deptId: m.deptId,
    totalSolved: m.totalSolved,
    leetcodeTotal: m.leetcodeTotal,
    skillrackTotal: m.skillrackTotal,
    codechefTotal: m.codechefTotal,
    hackerrankTotal: m.hackerrankTotal,
    isTeamLead: m.isTeamLead,
    assignedTeamLead: m.assignedTeamLead
  }));
}

export function createTeamComparison(data: DailyTotal[]) {
  if (!data || data.length === 0) return [] as any[];
  const groups = new Map<string, DailyTotal[]>();
  data.forEach(r => {
    const key = `${r.deptId}-${r.sectionId}-${r.teamId}`;
    const arr = groups.get(key) || [];
    arr.push(r);
    groups.set(key, arr);
  });
  const out: any[] = [];
  for (const [, arr] of groups) {
    const stats = getTeamStats(arr);
    const sample = arr[0];
    out.push({
      teamId: sample.teamId,
      teamName: sample.teamId,
      deptName: sample.deptId,
      sectionName: sample.sectionId,
      members: stats.totalMembers,
      totalSolved: stats.totalProblems,
      avgPerMember: stats.avgPerMember,
      topPerformer: stats.topPerformer,
      topPerformerScore: stats.topPerformerScore,
      teamLeadName: stats.teamLeadName,
      teamLeadScore: stats.teamLeadScore
    });
  }
  return out.sort((a, b) => b.totalSolved - a.totalSolved);
}
