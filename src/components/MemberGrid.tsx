import React, { useState } from 'react';
import { DailyTotal } from '../types';
import { getLatestByMember } from '../utils/dataProcessing';
import MemberCard from './MemberCard';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';
import { Search, Users } from 'lucide-react';

interface MemberGridProps {
  data: DailyTotal[];
  showTeamInfo?: boolean;
  title?: string;
}

const MemberGrid: React.FC<MemberGridProps> = ({ data, showTeamInfo = true, title = 'Members' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'performance'>('performance');

  const latestData = getLatestByMember(data);

  const filteredMembers = latestData
    .filter(m => m.memberName.toLowerCase().includes(searchTerm.toLowerCase()) || m.teamId.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => sortBy === 'name' ? a.memberName.localeCompare(b.memberName) : b.totalSolved - a.totalSolved);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            {title} ({filteredMembers.length})
          </div>
          <div className="flex items-center space-x-2">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'name' | 'performance')} className="px-3 py-1 border border-gray-300 rounded text-sm">
              <option value="performance">Sort by Performance</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search members or teams..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>

        {filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map((member, index) => (
              <MemberCard key={`${member.memberId}-${member.date}`} member={member} rank={sortBy === 'performance' ? index + 1 : undefined} showTeamInfo={showTeamInfo} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
            <p className="text-gray-600">{searchTerm ? 'Try adjusting your search terms.' : 'No member data available.'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MemberGrid;
