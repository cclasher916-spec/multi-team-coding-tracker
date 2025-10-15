import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { FirebaseService } from '../services/firebaseService';
import { Hierarchy, ViewLevel } from '../types';
import HierarchySelector from '../components/Navigation/HierarchySelector';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Building2, Users, BarChart3, Trophy } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { db, isInitialized } = useFirebase();
  const navigate = useNavigate();
  const [hierarchy, setHierarchy] = useState<Hierarchy>({});
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [viewLevel, setViewLevel] = useState<ViewLevel>('All Departments');

  useEffect(() => {
    if (isInitialized && db) {
      loadHierarchy();
    }
  }, [isInitialized, db]);

  const loadHierarchy = async () => {
    if (!db) return;
    
    try {
      setLoading(true);
      const firebaseService = new FirebaseService(db);
      const data = await firebaseService.loadHierarchy();
      setHierarchy(data);
    } catch (error) {
      console.error('Error loading hierarchy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    switch (viewLevel) {
      case 'Team View':
        if (selectedDept && selectedSection && selectedTeam) {
          navigate(`/team/${selectedDept}/${selectedSection}/${selectedTeam}`);
        }
        break;
      case 'Section View':
        if (selectedDept && selectedSection) {
          navigate(`/section/${selectedDept}/${selectedSection}`);
        }
        break;
      case 'Department View':
        if (selectedDept) {
          navigate(`/department/${selectedDept}`);
        }
        break;
      case 'All Departments':
        navigate('/all-departments');
        break;
    }
  };

  const canNavigate = () => {
    switch (viewLevel) {
      case 'Team View':
        return selectedDept && selectedSection && selectedTeam;
      case 'Section View':
        return selectedDept && selectedSection;
      case 'Department View':
        return selectedDept;
      case 'All Departments':
        return true;
      default:
        return false;
    }
  };

  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading organization data...</span>
      </div>
    );
  }

  const deptCount = Object.keys(hierarchy).length;
  const sectionCount = Object.values(hierarchy).reduce(
    (sum, dept) => sum + Object.keys(dept.sections).length, 0
  );
  const teamCount = Object.values(hierarchy).reduce(
    (sum, dept) => sum + Object.values(dept.sections).reduce(
      (sectionSum, section) => sectionSum + Object.keys(section.teams).length, 0
    ), 0
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-4">
          🏢 Multi-Team Coding Tracker
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Monitor and analyze coding performance across your entire organization
        </p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/80 rounded-xl p-4 text-center">
            <Building2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-gray-900">{deptCount}</div>
            <div className="text-sm text-gray-600">Departments</div>
          </div>
          <div className="bg-white/80 rounded-xl p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-gray-900">{sectionCount}</div>
            <div className="text-sm text-gray-600">Sections</div>
          </div>
          <div className="bg-white/80 rounded-xl p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-gray-900">{teamCount}</div>
            <div className="text-sm text-gray-600">Teams</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Navigation Panel */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Organization Navigator
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* View Level Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📊 View Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Team View', 'Section View', 'Department View', 'All Departments'] as ViewLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setViewLevel(level)}
                    className={`p-2 text-sm rounded-lg border transition-all ${
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

            {/* Hierarchy Selectors */}
            <HierarchySelector
              hierarchy={hierarchy}
              selectedDept={selectedDept}
              selectedSection={selectedSection}
              selectedTeam={selectedTeam}
              onDepartmentChange={(deptId) => {
                setSelectedDept(deptId);
                setSelectedSection('');
                setSelectedTeam('');
              }}
              onSectionChange={(sectionId) => {
                setSelectedSection(sectionId);
                setSelectedTeam('');
              }}
              onTeamChange={setSelectedTeam}
            />

            {/* Navigation Button */}
            <div className="mt-6">
              <Button
                onClick={handleNavigate}
                disabled={!canNavigate()}
                className="w-full"
                size="lg"
              >
                View {viewLevel}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/all-departments')}
                variant="secondary"
                className="w-full justify-start"
              >
                <Building2 className="mr-2 h-4 w-4" />
                All Departments Overview
              </Button>
              
              <Button
                onClick={() => navigate('/leaderboard')}
                variant="secondary"
                className="w-full justify-start"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Global Leaderboard
              </Button>
              
              <Button
                onClick={() => navigate('/analytics')}
                variant="secondary"
                className="w-full justify-start"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Performance Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-600">
            <p>📅 System last updated: {new Date().toLocaleDateString()}</p>
            <p className="mt-2">🔄 Data refreshes automatically every 30 minutes</p>
            <p className="mt-2">📊 View detailed analytics by selecting your organization level above</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;