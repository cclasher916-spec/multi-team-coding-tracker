import React from 'react';
import { LeaderboardEntry } from '../../types';
import { Crown, Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  showTeamColumn?: boolean;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ data, showTeamColumn = true }) => {
  const getRankIcon = (rank: number, isTeamLead: boolean) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    if (isTeamLead) return <Crown className="h-4 w-4 text-yellow-600" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      const colors = {
        1: 'bg-yellow-100 text-yellow-800',
        2: 'bg-gray-100 text-gray-800', 
        3: 'bg-amber-100 text-amber-800'
      } as const;
      return colors[rank as 1 | 2 | 3];
    }
    return 'bg-gray-50 text-gray-700';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
            {showTeamColumn && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
            )}
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">LC</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">SR</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">CC</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">HR</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((entry) => (
            <tr key={`${entry.memberId}-${entry.rank}`} className={`hover:bg-gray-50 ${entry.rank <= 3 ? 'bg-gradient-to-r from-gray-50 to-white' : ''} ${entry.isTeamLead ? 'bg-yellow-50/30' : ''}`}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getRankBadge(entry.rank)}`}>
                    #{entry.rank}
                  </span>
                  {getRankIcon(entry.rank, Boolean(entry.isTeamLead))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium text-gray-900">{entry.memberName}</div>
                      {entry.isTeamLead && (
                        <span className="inline-flex items-center bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">
                          👑 Team Lead
                        </span>
                      )}
                    </div>
                    {!entry.isTeamLead && entry.assignedTeamLead && (
                      <div className="text-xs text-blue-600">Under: {entry.assignedTeamLead}</div>
                    )}
                  </div>
                </div>
              </td>
              {showTeamColumn && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{entry.teamId}</div>
                  <div className="text-xs text-gray-500">{entry.sectionId} • {entry.deptId}</div>
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className="text-sm font-medium text-orange-600">{entry.leetcodeTotal}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className="text-sm font-medium text-teal-600">{entry.skillrackTotal}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className="text-sm font-medium text-amber-700">{entry.codechefTotal}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className="text-sm font-medium text-emerald-600">{entry.hackerrankTotal}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center">
                  <div className={`text-lg font-bold ${entry.rank <= 3 ? 'text-yellow-600' : entry.isTeamLead ? 'text-yellow-700' : 'text-gray-900'}`}>
                    {entry.totalSolved.toLocaleString()}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;
