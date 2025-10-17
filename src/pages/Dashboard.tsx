import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { FirebaseService } from '../services/firebaseService';
import { DailyTotal } from '../types';
import { processDataFrame } from '../utils/dataProcessing';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MemberGrid from '../components/MemberGrid';
import { ChevronRight } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { db, isInitialized } = useFirebase();
  const [data, setData] = useState<DailyTotal[]>([]);
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
      const service = new FirebaseService(db);
      const all = await service.loadAllDepartmentsData();
      setData(processDataFrame(all));
    } catch (e) {
      console.error('Error loading dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <span className="font-medium text-gray-900">Dashboard</span>
        <ChevronRight className="h-4 w-4" />
        <Link to="/leaderboard" className="hover:text-gray-900">Leaderboard</Link>
      </nav>

      <Card className="p-6">
        <h1 className="text-2xl font-bold">Welcome</h1>
        <p className="text-gray-600">Here is the latest snapshot across all teams.</p>
      </Card>

      <MemberGrid data={data} title="Top Members" />
    </div>
  );
};

export default Dashboard;
