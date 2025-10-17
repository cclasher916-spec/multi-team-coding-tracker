import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { FirebaseService } from '../services/firebaseService';
import { DailyTotal } from '../types';
import { processDataFrame, createTeamComparison } from '../utils/dataProcessing';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import TeamComparisonTable from '../components/Tables/TeamComparisonTable';
import { Building2, ChevronRight } from 'lucide-react';

const AllDepartments: React.FC = () => {
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
      console.error('Error loading departments', e);
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

  const teamComparison = createTeamComparison(data);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-900">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">All Departments</span>
      </nav>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Building2 className="mr-2 h-5 w-5" />Organization Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamComparisonTable data={teamComparison} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AllDepartments;
