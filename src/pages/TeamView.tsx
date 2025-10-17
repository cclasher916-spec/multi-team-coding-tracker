import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { FirebaseService } from '../services/firebaseService';
import { DailyTotal } from '../types';
import { processDataFrame, getTeamStats } from '../utils/dataProcessing';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MemberGrid from '../components/MemberGrid';
import { Users, ChevronRight } from 'lucide-react';

const TeamView: React.FC = () => {
  const { db, isInitialized } = useFirebase();
  const [data, setData] = useState<DailyTotal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const parts = window.location.pathname.split('/');
    const d = parts[2] || '';
    const s = parts[3] || '';
    const t = parts[4] || '';
    if (isInitialized && db && d && s && t) {
      loadData(d, s, t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, db]);

  const loadData = async (dept: string, section: string, team: string) => {
    if (!db) return;
    try {
      setLoading(true);
      const firebaseService = new FirebaseService(db);
      const teamData = await firebaseService.loadTeamData(dept, section, team);
      setData(processDataFrame(teamData));
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
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team data found</h3>
            <p className="text-gray-600">No data available for this team.</p>
            <Link to="/teams" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">Browse All Teams</Link>
          </div>
        </Card>
      </div>
    );
  }

  const parts = window.location.pathname.split('/');
  const teamId = parts[4] || '';

  const stats = getTeamStats(data);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-900">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/teams" className="hover:text-gray-900">Teams</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">{teamId}</span>
      </nav>

      <Card className="p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">👥 {teamId}</h1>
            <p className="text-gray-600 mb-4">Team Performance Dashboard</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{stats.totalProblems.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Problems Solved</div>
          </div>
        </div>
      </Card>

      <MemberGrid data={data} showTeamInfo={false} title={`${teamId} Members`} />
    </div>
  );
};

export default TeamView;
