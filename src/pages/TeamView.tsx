import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { FirebaseService } from '../services/firebaseService';
import { DailyTotal, Hierarchy } from '../types';
import { processDataFrame, getTeamStats, getLatestByMember } from '../utils/dataProcessing';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MemberGrid from '../components/MemberGrid';
import { Users, ChevronRight, Trophy, TrendingUp, Target, Crown } from 'lucide-react';

const TeamView: React.FC = () => {
  const { deptId, sectionId, teamId } = useParams<{ deptId: string; sectionId: string; teamId: string }>();
  const { db, isInitialized } = useFirebase();
  const [data, setData] = useState<DailyTotal[]>([]);
  const [hierarchy, setHierarchy] = useState<Hierarchy>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isInitialized && db && deptId && sectionId && teamId) {
      loadData();
    }
  }, [isInitialized, db, deptId, sectionId, teamId]);

  const loadData = async () => {
    if (!db || !deptId || !sectionId || !teamId) return;
    
    try {
      setLoading(true);
      const firebaseService = new FirebaseService(db);
      const [teamData, hierarchyData] = await Promise.all([
        firebaseService.loadTeamData(deptId, sectionId, teamId),
        firebaseService.loadHierarchy()
      ]);
      
      setData(processDataFrame(teamData));
      setHierarchy(hierarchyData);
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading team data...</span>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team data found</h3>
            <p className="text-gray-600">No data available for this team.</p>
            <Link to="/teams" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
              Browse All Teams
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const team = hierarchy[deptId]?.sections[sectionId]?.teams[teamId];
  const stats = getTeamStats(data);
  const latest = getLatestByMember(data);
  const teamLead = latest.find(member => member.isTeamLead);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-900">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/teams" className="hover:text-gray-900">Teams</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">{team?.baseTeamName || teamId}</span>
      </nav>

      {/* Hero Section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
              👥 {team?.baseTeamName || team?.name || teamId}
            </h1>
            <p className="text-gray-600 mb-4">
              Team Performance Dashboard
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {hierarchy[deptId]?.name}
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {hierarchy[deptId]?.sections[sectionId]?.name}
              </span>
              {team?.teamLeadName && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <Crown className="h-4 w-4 mr-1" />
                  Team Lead: {team.teamLeadName}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{stats.totalProblems.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Problems Solved</div>
            {teamLead && (
              <div className="text-yellow-600 text-sm mt-1 flex items-center justify-end">
                <Crown className="h-4 w-4 mr-1" />
                Lead: {stats.teamLeadScore} problems
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card hover className="bg-blue-50">
          <div className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-blue-100 mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
            </div>
          </div>
        </Card>

        <Card hover className="bg-green-50">
          <div className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-green-100 mr-4">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Solved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProblems.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card hover className="bg-purple-50">
          <div className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-purple-100 mr-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgPerMember}</p>
            </div>
          </div>
        </Card>

        <Card hover className="bg-yellow-50">
          <div className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-yellow-100 mr-4">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Top Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.topPerformerScore}</p>
              <p className="text-xs text-gray-500">{stats.topPerformer}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Leadership Info */}
      {teamLead && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <Crown className="mr-2 h-5 w-5" />
              Team Leadership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-700">{teamLead.memberName}</div>
                <div className="text-sm text-yellow-600">Team Leader</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-700">{teamLead.totalSolved}</div>
                <div className="text-sm text-yellow-600">Problems Solved</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-700">#{latest.findIndex(m => m.memberId === teamLead.memberId) + 1}</div>
                <div className="text-sm text-yellow-600">Team Rank</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members */}
      <MemberGrid data={data} showTeamInfo={false} title={`${team?.baseTeamName || team?.name || teamId} Members`} />
    </div>
  );
};

export default TeamView;