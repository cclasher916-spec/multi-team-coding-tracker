import React from 'react';
import { Link } from 'react-router-dom';
import { DailyTotal } from '../types';
import Card from './ui/Card';
import { User, Trophy, Eye, TrendingUp, Crown } from 'lucide-react';
import Button from './ui/Button';

interface MemberCardProps {
  member: DailyTotal;
  rank?: number;
  showTeamInfo?: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, rank, showTeamInfo = true }) => {
  const performanceLevel = 
    member.totalSolved >= 500 ? 'high' :
    member.totalSolved >= 200 ? 'medium' :
    member.totalSolved >= 50 ? 'low' : 'minimal';
  
  const performanceColors = {
    high: 'bg-green-50 border-green-200',
    medium: 'bg-blue-50 border-blue-200',
    low: 'bg-yellow-50 border-yellow-200',
    minimal: 'bg-gray-50 border-gray-200'
  } as const;

  const dailyTrend = member.totalDailyIncrease >= 0 ? 'positive' : 'negative';

  return (
    <Card hover className={`${performanceColors[performanceLevel]} ${member.isTeamLead ? 'ring-2 ring-yellow-300' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 ${
            member.isTeamLead ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gradient-hero'
          }`}>
            {member.isTeamLead ? (
              <Crown className="h-6 w-6 text-white" />
            ) : (
              <User className="h-6 w-6 text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{member.memberName}</h3>
              {member.isTeamLead && (
                <span className="inline-flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  👑 Team Lead
                </span>
              )}
            </div>
            {rank && (
              <p className="text-sm text-gray-500">Rank #{rank}</p>
            )}
            {!member.isTeamLead && member.assignedTeamLead && (
              <p className="text-xs text-blue-600 mt-1">Under: {member.assignedTeamLead}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {rank && rank <= 3 && (
            <div className="flex items-center">
              {rank === 1 && <Trophy className="h-6 w-6 text-yellow-500" />}
              {rank === 2 && <Trophy className="h-6 w-6 text-gray-400" />}
              {rank === 3 && <Trophy className="h-6 w-6 text-amber-600" />}
            </div>
          )}
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${dailyTrend === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${dailyTrend === 'positive' ? 'text-green-600' : 'rotate-180 text-red-600'}`} />
            {dailyTrend === 'positive' ? '+' : ''}{member.totalDailyIncrease} today
          </div>
        </div>
      </div>

      {showTeamInfo && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {member.teamId}
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              {member.sectionId}
            </span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
              {member.deptId}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{member.totalSolved}</div>
          <div className="text-xs text-gray-500">Total Solved</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">+{member.totalDailyIncrease}</div>
          <div className="text-xs text-gray-500">Daily Increase</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4 text-center text-xs">
        <div>
          <div className="font-bold text-orange-600">{member.leetcodeTotal}</div>
          <div className="text-gray-500">LC</div>
        </div>
        <div>
          <div className="font-bold text-teal-600">{member.skillrackTotal}</div>
          <div className="text-gray-500">SR</div>
        </div>
        <div>
          <div className="font-bold text-amber-700">{member.codechefTotal}</div>
          <div className="text-gray-500">CC</div>
        </div>
        <div>
          <div className="font-bold text-emerald-600">{member.hackerrankTotal}</div>
          <div className="text-gray-500">HR</div>
        </div>
      </div>

      <Button as={Link} to={`/individual/${member.memberId}`} className="w-full" size="sm" variant="secondary">
        <Eye className="mr-2 h-4 w-4" />
        View Dashboard
      </Button>
    </Card>
  );
};

export default MemberCard;