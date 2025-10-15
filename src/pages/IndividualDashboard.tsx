import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { FirebaseService } from '../services/firebaseService';
import { DailyTotal } from '../types';
import { processDataFrame } from '../utils/dataProcessing';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { User, Calendar, Target, ChevronRight, Award, TrendingUp } from 'lucide-react';

const IndividualDashboard: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const { db, isInitialized } = useFirebase();
  const [memberData, setMemberData] = useState<DailyTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberInfo, setMemberInfo] = useState<DailyTotal | null>(null);

  useEffect(() => {
    if (isInitialized && db && memberId) {
      loadMemberData();
    }
  }, [isInitialized, db, memberId]);

  const loadMemberData = async () => {
    if (!db || !memberId) return;
    try {
      setLoading(true);
      const firebaseService = new FirebaseService(db);
      const allData = await firebaseService.loadAllDepartmentsData();
      const processedData = processDataFrame(allData);
      const memberRecords = processedData.filter(record => record.memberId === memberId || record.memberName === memberId);
      if (memberRecords.length > 0) {
        setMemberData(memberRecords);
        setMemberInfo(memberRecords[0]);
      }
    } catch (error) {
      console.error('Error loading member data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (<div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /><span className="ml-3 text-gray-600">Loading individual dashboard...</span></div>);
  }

  if (!memberInfo || memberData.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card><CardContent className="text-center py-12"><User className="mx-auto h-12 w-12 text-gray-400 mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">Member not found</h3><p className="text-gray-600">No data available for member ID: {memberId}</p><Link to="/" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">Return to Dashboard</Link></CardContent></Card>
      </div>
    );
  }

  const sortedData = memberData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const chartData = sortedData.map(record => ({ date: record.date, total: record.totalSolved, leetcode: record.leetcodeTotal, skillrack: record.skillrackTotal, codechef: record.codechefTotal, hackerrank: record.hackerrankTotal, daily: record.totalDailyIncrease }));

  const latest = memberData[0];
  const oldest = memberData[memberData.length - 1];
  const totalGrowth = latest.totalSolved - (oldest?.totalSolved || 0);
  const avgDaily = memberData.length > 0 ? memberData.reduce((sum, record) => sum + record.totalDailyIncrease, 0) / memberData.length : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-900">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">{memberInfo.memberName}</span>
      </nav>

      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">👤 {memberInfo.memberName}</h1>
            <p className="text-gray-600 mb-4">Individual Performance Dashboard</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{memberInfo.teamId}</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">{memberInfo.sectionId}</span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">{memberInfo.deptId}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{latest.totalSolved}</div>
            <div className="text-sm text-gray-600">Total Problems Solved</div>
            {totalGrowth > 0 && (<div className="text-green-600 text-sm mt-1">+{totalGrowth} since start</div>)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card hover className="bg-blue-50"><div className="flex items-center p-6"><div className="p-3 rounded-lg bg-blue-100 mr-4"><Target className="h-6 w-6 text-blue-600" /></div><div><p className="text-sm font-medium text-gray-600">Current Total</p><p className="text-2xl font-bold text-gray-900">{latest.totalSolved}</p></div></div></Card>
        <Card hover className="bg-green-50"><div className="flex items-center p-6"><div className="p-3 rounded-lg bg-green-100 mr-4"><TrendingUp className="h-6 w-6 text-green-600" /></div><div><p className="text-sm font-medium text-gray-600">Total Growth</p><p className="text-2xl font-bold text-gray-900">+{totalGrowth}</p></div></div></Card>
        <Card hover className="bg-purple-50"><div className="flex items-center p-6"><div className="p-3 rounded-lg bg-purple-100 mr-4"><Calendar className="h-6 w-6 text-purple-600" /></div><div><p className="text-sm font-medium text-gray-600">Avg Daily</p><p className="text-2xl font-bold text-gray-900">{avgDaily.toFixed(1)}</p></div></div></Card>
        <Card hover className="bg-yellow-50"><div className="flex items-center p-6"><div className="p-3 rounded-lg bg-yellow-100 mr-4"><Award className="h-6 w-6 text-yellow-600" /></div><div><p className="text-sm font-medium text-gray-600">Active Days</p><p className="text-2xl font-bold text-gray-900">{memberData.length}</p></div></div></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Progress Timeline</CardTitle></CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                <YAxis />
                <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                <Line type="monotone" dataKey="total" stroke="#667eea" strokeWidth={3} name="Total Problems" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Platform Performance</CardTitle></CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ leetcode: latest.leetcodeTotal, skillrack: latest.skillrackTotal, codechef: latest.codechefTotal, hackerrank: latest.hackerrankTotal }]}> 
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="leetcode" fill="#FFA500" name="LeetCode" />
                <Bar dataKey="skillrack" fill="#00D4AA" name="SkillRack" />
                <Bar dataKey="codechef" fill="#5B4037" name="CodeChef" />
                <Bar dataKey="hackerrank" fill="#00EA64" name="HackerRank" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {memberData.slice(0, 10).map((record, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center"><Calendar className="h-5 w-5 text-gray-400 mr-3" /><div><div className="font-medium text-gray-900">{record.date}</div><div className="text-sm text-gray-600">Total: {record.totalSolved} (+{record.totalDailyIncrease})</div></div></div>
                <div className="text-right"><div className="text-sm text-gray-600">LC: {record.leetcodeTotal} | SR: {record.skillrackTotal} | CC: {record.codechefTotal} | HR: {record.hackerrankTotal}</div></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndividualDashboard;
