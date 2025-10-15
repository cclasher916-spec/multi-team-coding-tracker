import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { FirebaseService } from '../services/firebaseService';
import { DailyTotal, TeamStats } from '../types';
import { processDataFrame, getTeamStats, createLeaderboard } from '../utils/dataProcessing';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import LeaderboardTable from '../components/Tables/LeaderboardTable';
import MetricCards from '../components/Metrics/MetricCards';
import { ChevronRight } from 'lucide-react';

const TeamView: React.FC = () => {
  const { deptId, sectionId, teamId } = useParams<{
    deptId: string;
    sectionId: string;
    teamId: string;
  }>();
  
  const { db, isInitialized } = useFirebase();
  const [data, setData] = useState<DailyTotal[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
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
      const rawData = await firebaseService.loadTeamData(deptId, sectionId, teamId);
      const processedData = processDataFrame(rawData);
      const teamStats = getTeamStats(processedData);
      
      setData(processedData);
      setStats(teamStats);
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

  const leaderboard = createLeaderboard(data);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-900">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to={`/department/${deptId}`} className="hover:text-gray-900">{deptId}</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to={`/section/${deptId}/${sectionId}`} className="hover:text-gray-900">{sectionId}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">{teamId}</span>
      </nav>

      {/* Hero Section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
          👥 Team: {teamId}
        </h1>
        <p className="text-gray-600">
          Performance tracking for team members in {sectionId}, {deptId}
        </p>
      </div>

      {/* Metrics */}
      {stats && <MetricCards stats={stats} />}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>🏆 Team Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardTable 
            data={leaderboard} 
            showTeamColumn={false}
          />
        </CardContent>
      </Card>

      {/* Raw Data */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LeetCode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SkillRack</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CodeChef</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HackerRank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.slice(0, 20).map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.memberName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.leetcodeTotal}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.skillrackTotal}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.codechefTotal}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.hackerrankTotal}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.totalSolved}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No data available for this team
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamView;