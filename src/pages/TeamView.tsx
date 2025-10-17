import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { FirebaseService } from '../services/firebaseService';
import { DailyTotal } from '../types';
import { processDataFrame, getTeamStats } from '../utils/dataProcessing';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MemberGrid from '../components/MemberGrid';
import MetricCards from '../components/Metrics/MetricCards';
import { ChevronRight, GraduationCap } from 'lucide-react';

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

  const filtered = selectedBatch ? data.filter(d => d.assignedBatch === selectedBatch) : data;
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

      <Card className="p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><GraduationCap className="h-4 w-4 mr-2" />Batch</label>
        <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent max-w-xs">
          <option value="">All</option>
          <option value="2023-2027">2023-2027</option>
          <option value="2024-2028">2024-2028</option>
          <option value="2025-2029">2025-2029</option>
        </select>
      </Card>

      <MetricCards stats={stats} />

      <MemberGrid data={filtered} showTeamInfo={false} title={`${teamId} Members ${selectedBatch ? '• ' + selectedBatch : ''}`} />
    </div>
  );
};

export default TeamView;
