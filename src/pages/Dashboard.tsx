import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { FirebaseService } from '../services/firebaseService';
import { DailyTotal, Hierarchy } from '../types';
import { processDataFrame } from '../utils/dataProcessing';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MemberGrid from '../components/MemberGrid';
import { ChevronRight, GraduationCap, Building2 } from 'lucide-react';

const BATCH_OPTIONS = ['2023-2027', '2024-2028', '2025-2029'];

const Dashboard: React.FC = () => {
  const { db, isInitialized } = useFirebase();
  const [data, setData] = useState<DailyTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string>('AIML');
  const [selectedBatch, setSelectedBatch] = useState<string>('2023-2027');
  const [hierarchy, setHierarchy] = useState<Hierarchy>({});

  useEffect(() => {
    if (isInitialized && db) {
      loadData();
    }
  }, [isInitialized, db]);

  const loadData = async () => {
    if (!db) return;
    try {
      setLoading(true);
      const service = new FirebaseService(db);
      const [all, tree] = await Promise.all([
        service.loadAllDepartmentsData(),
        service.loadHierarchy(),
      ]);
      setHierarchy(tree);
      setData(processDataFrame(all));
    } catch (e) {
      console.error('Error loading dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  // Filter by department and batch if present on member data
  const filtered = data.filter((d) => {
    const deptOk = !selectedDept || d.deptId === selectedDept;
    const batchOk = !selectedBatch || (d as any).batch === selectedBatch || (d as any).assignedBatch === selectedBatch;
    return deptOk && batchOk;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  const departments = Object.keys(hierarchy);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <span className="font-medium text-gray-900">Dashboard</span>
        <ChevronRight className="h-4 w-4" />
        <Link to="/leaderboard" className="hover:text-gray-900">Leaderboard</Link>
      </nav>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Building2 className="h-4 w-4 mr-2" />Department
              </label>
              <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">All</option>
                {departments.map((id) => (
                  <option key={id} value={id}>{hierarchy[id].name || id}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <GraduationCap className="h-4 w-4 mr-2" />Batch
              </label>
              <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">All</option>
                {BATCH_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <MemberGrid data={filtered} title={`Top Members ${selectedDept ? '• ' + selectedDept : ''} ${selectedBatch ? '• ' + selectedBatch : ''}`} />
    </div>
  );
};

export default Dashboard;
