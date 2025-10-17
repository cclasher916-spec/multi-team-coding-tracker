import React from 'react';
import { TeamStats } from '../types';
import Card from '../components/ui/Card';

interface MetricCardsProps {
  stats: TeamStats;
}

const MetricCards: React.FC<MetricCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card hover className="bg-blue-50"><div className="p-6"><p className="text-sm text-gray-600">Team Members</p><p className="text-2xl font-bold">{stats.totalMembers}</p></div></Card>
      <Card hover className="bg-green-50"><div className="p-6"><p className="text-sm text-gray-600">Total Solved</p><p className="text-2xl font-bold">{stats.totalProblems.toLocaleString()}</p></div></Card>
      <Card hover className="bg-purple-50"><div className="p-6"><p className="text-sm text-gray-600">Average</p><p className="text-2xl font-bold">{stats.avgPerMember}</p></div></Card>
      <Card hover className="bg-yellow-50"><div className="p-6"><p className="text-sm text-gray-600">Top Score</p><p className="text-2xl font-bold">{stats.topPerformerScore}</p><p className="text-xs text-gray-500">{stats.topPerformer}</p></div></Card>
    </div>
  );
};

export default MetricCards;
