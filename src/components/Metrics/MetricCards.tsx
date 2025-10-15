import React from 'react';
import { TeamStats } from '../../types';
import Card from '../ui/Card';
import { Users, Trophy, BarChart3, Target } from 'lucide-react';

interface MetricCardsProps {
  stats: TeamStats;
}

const MetricCards: React.FC<MetricCardsProps> = ({ stats }) => {
  const metrics = [
    {
      title: 'Total Members',
      value: stats.totalMembers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Problems',
      value: stats.totalProblems.toLocaleString(),
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Avg per Member',
      value: stats.avgPerMember.toLocaleString(),
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Top Performer',
      value: stats.topPerformer,
      subtitle: `${stats.topPerformerScore} problems`,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} hover className={`${metric.bgColor} border-0`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <Icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                {metric.subtitle && (
                  <p className="text-xs text-gray-500">{metric.subtitle}</p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default MetricCards;