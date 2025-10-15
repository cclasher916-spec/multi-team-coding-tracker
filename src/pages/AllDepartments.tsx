import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { FirebaseService } from '../services/firebaseService';
import { DailyTotal, TeamStats } from '../types';
import { processDataFrame, getTeamStats, createLeaderboard, createTeamComparison } from '../utils/dataProcessing';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import LeaderboardTable from '../components/Tables/LeaderboardTable';
import TeamComparisonTable from '../components/Tables/TeamComparisonTable';
import MetricCards from '../components/Metrics/MetricCards';
import { ChevronRight } from 'lucide-react';

const AllDepartments: React.FC = () => {
  const { db, isInitialized } = useFirebase();
  const [data, setData] = useState<DailyTotal[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isInitialized && db) {
      loadData();
    }
  }, [isInitialized, db]);

  const loadData = async () => {
    if (!db) return;
    
    try {
      setLoading(true);
      const firebaseService = new FirebaseService(db);
      const rawData = await firebaseService.loadAllDepartmentsData();
      const processedData = processDataFrame(rawData);
      const orgStats = getTeamStats(processedData);
      
      setData(processedData);
      setStats(orgStats);
    } catch (error) {
      console.error('Error loading organization data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading organization data...</span>
      </div>
    );
  }

  const leaderboard = createLeaderboard(data);
  const teamComparison = createTeamComparison(data);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-900">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">All Departments</span>
      </nav>

      {/* Hero Section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
          🏢 Organization Overview
        </h1>
        <p className="text-gray-600">
          Complete performance metrics across all departments, sections, and teams
        </p>
      </div>

      {/* Metrics */}
      {stats && <MetricCards stats={stats} />}

      {/* Cross-Team Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Cross-Team Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamComparisonTable data={teamComparison} />
        </CardContent>
      </Card>

      {/* Global Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>🏆 Global Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardTable 
            data={leaderboard.slice(0, 50)} 
            showTeamColumn={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AllDepartments;