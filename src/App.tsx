import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FirebaseProvider } from './contexts/FirebaseContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import TeamView from './pages/TeamView';
import SectionView from './pages/SectionView';
import DepartmentView from './pages/DepartmentView';
import AllDepartments from './pages/AllDepartments';
import { Toaster } from './components/ui/Toaster';

function App() {
  return (
    <FirebaseProvider>
      <Router>
        <div className="min-h-screen bg-gradient-main">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/team/:deptId/:sectionId/:teamId" element={<TeamView />} />
              <Route path="/section/:deptId/:sectionId" element={<SectionView />} />
              <Route path="/department/:deptId" element={<DepartmentView />} />
              <Route path="/all-departments" element={<AllDepartments />} />
            </Routes>
          </Layout>
          <Toaster />
        </div>
      </Router>
    </FirebaseProvider>
  );
}

export default App;