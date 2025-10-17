import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { FirebaseService } from '../services/firebaseService';
import { DailyTotal, Hierarchy } from '../types';
import { processDataFrame, getTeamStats, getLatestByMember } from '../utils/dataProcessing';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MemberGrid from '../components/MemberGrid';
import { Users, ChevronRight, GraduationCap } from 'lucide-react';

const TeamView: React.FC = () => {
  const { db, isInitialized } = useFirebase();
  const [data, setData] = useState<DailyTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<string>('');

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

  const parts = window.location.pathname.split('/');
  const teamId = parts[4] || '';

  // Batch filter
  const filtered = selectedBatch ? data.filter(d => (d as any).batch === selectedBatch || (d as any).assignedBatch === selectedBatch) : data;

  const stats = getTeamStats(filtered);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-900">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/teams" className="hover:text-gray-900">Teams</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">{teamId}</span>
      </nav>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <GraduationCap className="h-4 w-4 mr-2" />Batch
              </label>
              <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">All</option>
                <option value="2023-2027">2023-2027</option>
                <option value="2024-2028">2024-2028</option>
                <option value="2025-2029">2025-2029</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

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

      <MemberGrid data={filtered} showTeamInfo={false} title={`${teamId} Members ${selectedBatch ? '• ' + selectedBatch : ''}`} />
    </div>
  );
};

export default TeamView;
