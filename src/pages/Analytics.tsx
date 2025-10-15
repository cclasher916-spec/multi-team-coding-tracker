import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { FirebaseService } from '../services/firebaseService';
import { DailyTotal, Hierarchy } from '../types';
import { processDataFrame, getTeamStats, createTeamComparison } from '../utils/dataProcessing';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import HierarchySelector from '../components/Navigation/HierarchySelector';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Trophy, Target, ChevronRight } from 'lucide-react';
import { getLatestByMember } from '../utils/dataProcessing';

const Analytics: React.FC = () => {
  const { db, isInitialized } = useFirebase();
  const [hierarchy, setHierarchy] = useState<Hierarchy>({});
  const [data, setData] = useState<DailyTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [viewLevel, setViewLevel] = useState<'organization' | 'department' | 'section' | 'team'>('organization');

  useEffect(() => {
    if (isInitialized && db) {
      loadInitialData();
    }
  }, [isInitialized, db]);

  const loadInitialData = async () => {
    if (!db) return;
    
    try {
      setLoading(true);
      const firebaseService = new FirebaseService(db);
      const hierarchyData = await firebaseService.loadHierarchy();
      const allData = await firebaseService.loadAllDepartmentsData();
      
      setHierarchy(hierarchyData);
      setData(processDataFrame(allData));
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLevelData = async () => {
    if (!db) return;
    
    try {
      setLoading(true);
      const firebaseService = new FirebaseService(db);
      let levelData: DailyTotal[] = [];
      
      switch (viewLevel) {
        case 'team':
          if (selectedDept && selectedSection && selectedTeam) {
            levelData = await firebaseService.loadTeamData(selectedDept, selectedSection, selectedTeam);
          }
          break;
        case 'section':
          if (selectedDept && selectedSection) {
            levelData = await firebaseService.loadSectionData(selectedDept, selectedSection);
          }
          break;
        case 'department':
          if (selectedDept) {
            levelData = await firebaseService.loadDepartmentData(selectedDept);
          }
          break;
        default:
          levelData = await firebaseService.loadAllDepartmentsData();
      }
      
      setData(processDataFrame(levelData));
    } catch (error) {
      console.error('Error loading level data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized && db && (selectedDept || selectedSection || selectedTeam)) {
      loadLevelData();
    }
  }, [viewLevel, selectedDept, selectedSection, selectedTeam]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading analytics data...</span>
      </div>
    );
  }

  // Prepare chart data
  const latest = getLatestByMember(data);
  const teamComparison = createTeamComparison(data);
  const stats = getTeamStats(data);
  
  // Platform distribution data
  const platformData = [
    { name: 'LeetCode', value: latest.reduce((sum, m) => sum + m.leetcodeTotal, 0), color: '#FFA500' },
    { name: 'SkillRack', value: latest.reduce((sum, m) => sum + m.skillrackTotal, 0), color: '#00D4AA' },
    { name: 'CodeChef', value: latest.reduce((sum, m) => sum + m.codechefTotal, 0), color: '#5B4037' },
    { name: 'HackerRank', value: latest.reduce((sum, m) => sum + m.hackerrankTotal, 0), color: '#00EA64' },
  ];

  // Performance trends (mock data - you can implement actual trend calculation)
  const trendData = teamComparison.slice(0, 10).map(team => ({
    name: team.teamName,
    total: team.totalSolved,
    average: team.avgPerMember,
    members: team.members
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-900">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">Analytics</span>
      </nav>

      {/* Hero Section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
          📊 Performance Analytics
        </h1>
        <p className="text-gray-600">
          Deep insights and trends across your coding performance ecosystem
        </p>
      </div>

      {/* View Level Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Scope</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View Level</label>
              <div className="grid grid-cols-2 gap-2">
                {(['organization', 'department', 'section', 'team'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setViewLevel(level)}
                    className={`p-3 text-sm rounded-lg border transition-all capitalize ${
                      viewLevel === level
                        ? 'bg-gradient-hero text-white border-transparent'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <HierarchySelector
                hierarchy={hierarchy}
                selectedDept={selectedDept}
                selectedSection={selectedSection}
                selectedTeam={selectedTeam}
                onDepartmentChange={(deptId) => {
                  setSelectedDept(deptId);
                  setSelectedSection('');
                  setSelectedTeam('');
                  setViewLevel('department');
                }}
                onSectionChange={(sectionId) => {
                  setSelectedSection(sectionId);
                  setSelectedTeam('');
                  setViewLevel('section');
                }}
                onTeamChange={(teamId) => {
                  setSelectedTeam(teamId);
                  setViewLevel('team');
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card hover className="bg-blue-50">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
            </div>
          </div>
        </Card>

        <Card hover className="bg-green-50">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Problems</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProblems.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card hover className="bg-purple-50">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgPerMember}</p>
            </div>
          </div>
        </Card>

        <Card hover className="bg-yellow-50">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Top Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.topPerformerScore}</p>
              <p className="text-xs text-gray-500">{stats.topPerformer}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Team Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#667eea" />
                  <Bar dataKey="average" fill="#764ba2" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#667eea" strokeWidth={2} />
                <Line type="monotone" dataKey="average" stroke="#764ba2" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(stats.totalProblems / Math.max(stats.totalMembers, 1))}
              </div>
              <div className="text-sm text-gray-600">Problems per Member</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {platformData.reduce((max, p) => p.value > max.value ? p : max).name}
              </div>
              <div className="text-sm text-gray-600">Most Popular Platform</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {teamComparison.length}
              </div>
              <div className="text-sm text-gray-600">Active Teams</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {latest.filter(m => m.totalSolved > 0).length}
              </div>
              <div className="text-sm text-gray-600">Contributing Members</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;