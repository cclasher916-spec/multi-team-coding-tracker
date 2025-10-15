import React, { useState } from 'react';
import { LeaderboardEntry } from '../../types';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  showTeamColumn?: boolean;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ data, showTeamColumn = false }) => {
  const [sortField, setSortField] = useState<keyof LeaderboardEntry>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof LeaderboardEntry) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-gray-500 font-medium">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      const colors = {
        1: 'bg-yellow-100 text-yellow-800',
        2: 'bg-gray-100 text-gray-800',
        3: 'bg-amber-100 text-amber-800'
      };
      return colors[rank as keyof typeof colors] || '';
    }
    return '';
  };

  if (!data.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No leaderboard data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('rank')}
            >
              🏅 Rank
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('memberName')}
            >
              Member
            </th>
            {showTeamColumn && (
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('teamId')}
              >
                Team
              </th>
            )}
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('leetcodeTotal')}
            >
              💻 LC
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('skillrackTotal')}
            >
              📊 SR
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('codechefTotal')}
            >
              🍛 CC
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('hackerrankTotal')}
            >
              ⭐ HR
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('totalSolved')}
            >
              📈 Total
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((entry, index) => (
            <tr 
              key={index} 
              className={cn(
                'hover:bg-gray-50 transition-colors',
                entry.rank <= 3 && getRankBadge(entry.rank)
              )}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {getRankIcon(entry.rank)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{entry.memberName}</div>
              </td>
              {showTeamColumn && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {entry.teamId}
                  </span>
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {entry.leetcodeTotal.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {entry.skillrackTotal.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {entry.codechefTotal.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {entry.hackerrankTotal.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className={cn(
                    'text-sm font-bold',
                    entry.rank === 1 ? 'text-yellow-600' :
                    entry.rank === 2 ? 'text-gray-600' :
                    entry.rank === 3 ? 'text-amber-600' :
                    'text-gray-900'
                  )}>
                    {entry.totalSolved.toLocaleString()}
                  </div>
                  <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((entry.totalSolved / Math.max(...sortedData.map(d => d.totalSolved))) * 100, 100)}%`
                      }}
                    />
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