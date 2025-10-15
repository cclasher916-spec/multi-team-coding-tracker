import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { FirebaseService } from '../services/firebaseService';
import { Hierarchy, DailyTotal } from '../types';
import { processDataFrame, getTeamStats } from '../utils/dataProcessing';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { Users, ChevronRight, Building2, Search, Eye, Filter } from 'lucide-react';

const Teams: React.FC = () => {
  const { db, isInitialized } = useFirebase();
  const navigate = useNavigate();
  const [hierarchy, setHierarchy] = useState<Hierarchy>({});
  const [allData, setAllData] = useState<DailyTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');

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
      const hierarchyData = await firebaseService.loadHierarchy();
      const data = await firebaseService.loadAllDepartmentsData();
      setHierarchy(hierarchyData);
      setAllData(processDataFrame(data));
    } catch (error) {
      console.error('Error loading teams data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading teams data...</span>
      </div>
    );
  }

  const allTeams: Array<{
    id: string; name: string; deptId: string; deptName: string; sectionId: string; sectionName: string; description: string; stats: ReturnType<typeof getTeamStats>;
  }> = [];

  Object.entries(hierarchy).forEach(([deptId, dept]) => {
    Object.entries(dept.sections).forEach(([sectionId, section]) => {
      Object.entries(section.teams).forEach(([teamId, team]) => {
        const teamData = allData.filter(d => d.deptId === deptId && d.sectionId === sectionId && d.teamId === teamId);
        const stats = getTeamStats(teamData);
        allTeams.push({ id: teamId, name: team.name, deptId, deptName: dept.name, sectionId, sectionName: section.name, description: team.description, stats });
      });
    });
  });

  const filteredTeams = allTeams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.deptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.sectionName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !selectedDept || team.deptId === selectedDept;
    const matchesSection = !selectedSection || team.sectionId === selectedSection;
    return matchesSearch && matchesDept && matchesSection;
  });

  const sortedTeams = filteredTeams.sort((a, b) => b.stats.totalProblems - a.stats.totalProblems);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-900">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">Teams</span>
      </nav>

      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">👥 Team Directory</h1>
        <p className="text-gray-600">Browse and manage all teams across your organization</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Search className="mr-2 h-5 w-5" />Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Teams</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search by team, department, or description..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><Filter className="h-4 w-4 mr-2" />Department</label>
              <select value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setSelectedSection(''); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">All Departments</option>
                {Object.entries(hierarchy).map(([deptId, dept]) => (<option key={deptId} value={deptId}>{dept.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><Filter className="h-4 w-4 mr-2" />Section</label>
              <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled={!selectedDept}>
                <option value="">All Sections</option>
                {selectedDept && Object.entries(hierarchy[selectedDept]?.sections || {}).map(([sectionId, section]) => (<option key={sectionId} value={sectionId}>{section.name}</option>))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTeams.map((team, index) => {
          const performanceLevel = team.stats.totalProblems >= 1000 ? 'high' : team.stats.totalProblems >= 500 ? 'medium' : team.stats.totalProblems >= 100 ? 'low' : 'minimal';
          const performanceColors = { high: 'bg-green-50 border-green-200', medium: 'bg-blue-50 border-blue-200', low: 'bg-yellow-50 border-yellow-200', minimal: 'bg-gray-50 border-gray-200' } as const;
          return (
            <Card key={`${team.deptId}-${team.sectionId}-${team.id}`} hover className={performanceColors[performanceLevel]}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center mr-3"><Users className="h-6 w-6 text-white" /></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-500">#{index + 1} by performance</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${performanceLevel === 'high' ? 'bg-green-200 text-green-800' : performanceLevel === 'medium' ? 'bg-blue-200 text-blue-800' : performanceLevel === 'low' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'}`}>{performanceLevel.toUpperCase()}</span>
              </div>
              <div className="mb-4">
                <div className="flex items-center text-sm text-gray-600 mb-1"><Building2 className="h-4 w-4 mr-1" />{team.deptName} → {team.sectionName}</div>
                {team.description && (<p className="text-sm text-gray-600 line-clamp-2">{team.description}</p>)}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center"><div className="text-xl font-bold text-gray-900">{team.stats.totalMembers}</div><div className="text-xs text-gray-500">Members</div></div>
                <div className="text-center"><div className="text-xl font-bold text-gray-900">{team.stats.totalProblems.toLocaleString()}</div><div className="text-xs text-gray-500">Problems</div></div>
                <div className="text-center"><div className="text-xl font-bold text-gray-900">{team.stats.avgPerMember}</div><div className="text-xs text-gray-500">Avg/Member</div></div>
                <div className="text-center"><div className="text-xl font-bold text-gray-900">{team.stats.topPerformerScore}</div><div className="text-xs text-gray-500">Top Score</div></div>
              </div>
              <div className="mb-4"><div className="text-xs text-gray-500 mb-1">Top Performer</div><div className="text-sm font-medium text-gray-900">{team.stats.topPerformer}</div></div>
              <Button onClick={() => navigate(`/team/${team.deptId}/${team.sectionId}/${team.id}`)} className="w-full" size="sm"><Eye className="mr-2 h-4 w-4" />View Details</Button>
            </Card>
          );
        })}
      </div>

      {filteredTeams.length === 0 && (
        <Card><CardContent className="text-center py-12"><Users className="mx-auto h-12 w-12 text-gray-400 mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3><p className="text-gray-600">Try adjusting your search criteria or filters.</p></CardContent></Card>
      )}
    </div>
  );
};

export default Teams;
