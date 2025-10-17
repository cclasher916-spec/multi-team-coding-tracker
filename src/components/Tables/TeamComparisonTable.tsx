import React, { useState } from 'react';

interface TeamComparison {
  teamId?: string;
  teamName: string;
  deptName: string;
  sectionName: string;
  members: number;
  totalSolved: number;
  avgPerMember: number;
  topPerformer: string;
  topPerformerScore: number;
  teamLeadName?: string;
  teamLeadScore?: number;
}

import { TrendingUp, Users, Trophy, Crown } from 'lucide-react';

interface TeamComparisonTableProps {
  data: TeamComparison[];
}

const TeamComparisonTable: React.FC<TeamComparisonTableProps> = ({ data }) => {
  const [sortField, setSortField] = useState<keyof TeamComparison>('totalSolved');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof TeamComparison) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'totalSolved' || field === 'avgPerMember' ? 'desc' : 'asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField] as any;
    const bValue = b[sortField] as any;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const getPerformanceColor = (value: number, max: number) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-blue-600 bg-blue-50';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  if (!data.length) {
    return <div className="text-center py-8 text-gray-500">No team comparison data available</div>;
  }

  const maxTotal = Math.max(...data.map(d => d.totalSolved));
  const maxAvg = Math.max(...data.map(d => d.avgPerMember));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Teams</p>
              <p className="text-2xl font-bold text-blue-900">{data.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <Trophy className="h-6 w-6 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-green-600 font-medium">Best Team</p>
              <p className="text-lg font-bold text-green-900">{sortedData[0]?.teamName || 'N/A'}</p>
              <p className="text-xs text-green-700">{sortedData[0]?.totalSolved.toLocaleString()} problems</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-purple-600 mr-2" />
            <div>
              <p className="text-sm text-purple-600 font-medium">Avg Performance</p>
              <p className="text-2xl font-bold text-purple-900">{Math.round(data.reduce((s, t) => s + t.avgPerMember, 0) / data.length)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('teamName')}>Team</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('members')}>👥 Members</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('totalSolved')}>✅ Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('avgPerMember')}>📊 Average</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">👑 Team Lead</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((team) => (
              <tr key={team.teamName} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{team.teamName}</div>
                  <div className="text-xs text-gray-500">{team.sectionName} • {team.deptName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.members}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(team.totalSolved, maxTotal)}`}>{team.totalSolved.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(team.avgPerMember, maxAvg)}`}>{team.avgPerMember}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center gap-1">
                  {team.teamLeadName ? (<><Crown className="h-4 w-4 text-yellow-600" />{team.teamLeadName}</>) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamComparisonTable;
