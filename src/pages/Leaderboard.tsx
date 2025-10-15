import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { FirebaseService } from '../services/firebaseService';
import { DailyTotal, Hierarchy } from '../types';
import { processDataFrame, createLeaderboard } from '../utils/dataProcessing';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import LeaderboardTable from '../components/Tables/LeaderboardTable';
import HierarchySelector from '../components/Navigation/HierarchySelector';
import { Trophy, Medal, Award, Crown, ChevronRight, Users, Target } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const { db, isInitialized } = useFirebase();
  const [hierarchy, setHierarchy] = useState<Hierarchy>({});
  const [data, setData] = useState<DailyTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [viewLevel, setViewLevel] = useState<'global' | 'department' | 'section' | 'team'>('global');

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
      console.error('Error loading leaderboard data:', error);
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
        <span className="ml-3 text-gray-600">Loading leaderboard...</span>
      </div>
    );
  }

  const leaderboard = createLeaderboard(data);
  const topPerformers = leaderboard.slice(0, 3);

  const getLevelTitle = () => {
    switch (viewLevel) {
      case 'team':
        return selectedTeam ? `Team: ${selectedTeam}` : 'Select Team';
      case 'section':
        return selectedSection ? `Section: ${selectedSection}` : 'Select Section';
      case 'department':
        return selectedDept ? `Department: ${selectedDept}` : 'Select Department';
      default:
        return 'Global Leaderboard';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-900">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">Leaderboard</span>
      </nav>

      {/* Hero Section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
          🏆 Leaderboard
        </h1>
        <p className="text-gray-600">
          Celebrating excellence in coding across all levels
        </p>
      </div>

      {/* View Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard Scope</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View Level</label>
              <div className="grid grid-cols-2 gap-2">
                {(['global', 'department', 'section', 'team'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setViewLevel(level)}
                    className={`p-3 text-sm rounded-lg border transition-all capitalize ${
                      viewLevel === level
                        ? 'bg-gradient-hero text-white border-transparent'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {level === 'global' ? 'All Organization' : level}
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

      {/* Current Scope Display */}
      <div className="text-center p-4 bg-white/50 rounded-xl">
        <h2 className="text-xl font-semibold text-gray-900">
          {getLevelTitle()}
        </h2>
        <p className="text-gray-600 mt-1">
          {leaderboard.length} participants competing
        </p>
      </div>

      {/* Top 3 Podium */}
      {topPerformers.length >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🥇 Hall of Fame</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-end space-x-8">
              {/* Second Place */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <Medal className="h-12 w-12 text-gray-400" />
                </div>
                <div className="bg-gray-50 rounded-lg p-4 min-h-[120px] w-48">
                  <div className="text-2xl font-bold text-gray-600 mb-1">#2</div>
                  <div className="font-semibold text-gray-900">{topPerformers[1].memberName}</div>
                  {viewLevel !== 'team' && (
                    <div className="text-xs text-gray-500">{topPerformers[1].teamId}</div>
                  )}
                  <div className="text-lg font-bold text-gray-700 mt-2">
                    {topPerformers[1].totalSolved.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* First Place */}
              <div className="text-center">
                <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mb-3 mx-auto relative">
                  <Crown className="h-16 w-16 text-yellow-500" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">👑</span>
                  </div>
                </div>
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 min-h-[140px] w-56">
                  <div className="text-3xl font-bold text-yellow-600 mb-1">#1</div>
                  <div className="font-bold text-gray-900 text-lg">{topPerformers[0].memberName}</div>
                  {viewLevel !== 'team' && (
                    <div className="text-sm text-gray-600">{topPerformers[0].teamId}</div>
                  )}
                  <div className="text-2xl font-bold text-yellow-600 mt-3">
                    {topPerformers[0].totalSolved.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">problems solved</div>
                </div>
              </div>

              {/* Third Place */}
              <div className="text-center">
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <Award className="h-12 w-12 text-amber-600" />
                </div>
                <div className="bg-amber-50 rounded-lg p-4 min-h-[120px] w-48">
                  <div className="text-2xl font-bold text-amber-600 mb-1">#3</div>
                  <div className="font-semibold text-gray-900">{topPerformers[2].memberName}</div>
                  {viewLevel !== 'team' && (
                    <div className="text-xs text-gray-500">{topPerformers[2].teamId}</div>
                  )}
                  <div className="text-lg font-bold text-amber-700 mt-2">
                    {topPerformers[2].totalSolved.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover className="bg-blue-50">
          <div className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-blue-100 mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900">{leaderboard.length}</p>
            </div>
          </div>
        </Card>

        <Card hover className="bg-green-50">
          <div className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-green-100 mr-4">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Problems</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaderboard.reduce((sum, entry) => sum + entry.totalSolved, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card hover className="bg-purple-50">
          <div className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-purple-100 mr-4">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaderboard.length > 0 
                  ? Math.round(leaderboard.reduce((sum, entry) => sum + entry.totalSolved, 0) / leaderboard.length)
                  : 0
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5" />
            Complete Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardTable 
            data={leaderboard} 
            showTeamColumn={viewLevel !== 'team'}
          />
        </CardContent>
      </Card>

      {leaderboard.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
            <p className="text-gray-600">No performance data found for the selected scope.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Leaderboard;