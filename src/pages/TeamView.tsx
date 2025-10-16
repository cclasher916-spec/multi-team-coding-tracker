import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { FirebaseService } from '../services/firebaseService';
import { DailyTotal, Hierarchy } from '../types';
import { processDataFrame, getTeamStats, getLatestByMember } from '../utils/dataProcessing';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MemberGrid from '../components/MemberGrid';
import { Users, ChevronRight, Trophy, TrendingUp, Target, Crown } from 'lucide-react';

const TeamView: React.FC = () => {
  const { deptId = '', sectionId = '', teamId = '' } = ({} as any) && ({} as any);
  // Properly get params with default strings to satisfy TS index typing
  const params = new URLSearchParams(window.location.pathname.split('/').slice(1).join('&'));

  const { db, isInitialized } = useFirebase();
  const [data, setData] = useState<DailyTotal[]>([]);
  const [hierarchy, setHierarchy] = useState<Hierarchy>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fallback: attempt to parse from URL if react-router types cause TS index issues in build
    const parts = window.location.pathname.split('/');
    const d = parts[2] || '';
    const s = parts[3] || '';
    const t = parts[4] || '';
    loadData(d, s, t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, db]);

  const loadData = async (dept: string, section: string, team: string) => {
    if (!db || !dept || !section || !team) return;
    try {
      setLoading(true);
      const firebaseService = new FirebaseService(db);
      const [teamData, hierarchyData] = await Promise.all([
        firebaseService.loadTeamData(dept, section, team),
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

  // Derive ids again safely for rendering
  const parts = window.location.pathname.split('/');
  const dId = parts[2] || '';
  const sId = parts[3] || '';
  const tId = parts[4] || '';

  if (!data.length) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team data found</h3>
            <p className="text-gray-600">No data available for this team.</p>
            <Link to="/teams" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">Browse All Teams</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const team = hierarchy[dId]?.sections[sId]?.teams[tId];
  const stats = getTeamStats(data);
  const latest = getLatestByMember(data);
  const teamLead = latest.find(member => member.isTeamLead);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-900">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/teams" className="hover:text-gray-900">Teams</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">{team?.baseTeamName || tId}</span>
      </nav>

      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">👥 {team?.baseTeamName || team?.name || tId}</h1>
            <p className="text-gray-600 mb-4">Team Performance Dashboard</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{hierarchy[dId]?.name}</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">{hierarchy[dId]?.sections[sId]?.name}</span>
              {team?.teamLeadName && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">👑 Team Lead: {team.teamLeadName}</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{stats.totalProblems.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Problems Solved</div>
          </div>
        </div>
      </div>

      <MemberGrid data={data} showTeamInfo={false} title={`${team?.baseTeamName || team?.name || tId} Members`} />
    </div>
  );
};

export default TeamView;
