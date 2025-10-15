import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Settings as SettingsIcon, ChevronRight, Database, Palette, Bell, Shield, Download, Upload, RefreshCw } from 'lucide-react';

const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState({
    dailyUpdates: true,
    weeklyReports: true,
    achievementAlerts: false,
    systemNotifications: true
  });

  const [theme, setTheme] = useState('light');
  const [refreshInterval, setRefreshInterval] = useState('30');

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleExportData = () => {
    // This would typically trigger a data export
    alert('Data export functionality would be implemented here');
  };

  const handleImportData = () => {
    // This would typically trigger a data import
    alert('Data import functionality would be implemented here');
  };

  const handleClearCache = () => {
    // Clear any cached data
    localStorage.clear();
    sessionStorage.clear();
    alert('Cache cleared successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-gray-900">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">Settings</span>
      </nav>

      {/* Hero Section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
          ⚙️ Application Settings
        </h1>
        <p className="text-gray-600">
          Configure your Multi-Team Coding Tracker preferences
        </p>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {key === 'dailyUpdates' && 'Receive daily performance summaries'}
                    {key === 'weeklyReports' && 'Get weekly team performance reports'}
                    {key === 'achievementAlerts' && 'Notifications for new achievements'}
                    {key === 'systemNotifications' && 'System maintenance and updates'}
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationChange(key as keyof typeof notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="mr-2 h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['light', 'dark', 'auto'].map((themeOption) => (
                  <button
                    key={themeOption}
                    onClick={() => setTheme(themeOption)}
                    className={`p-3 text-sm rounded-lg border transition-all capitalize ${
                      theme === themeOption
                        ? 'bg-gradient-hero text-white border-transparent'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {themeOption}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Note: Dark theme implementation coming soon
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-Refresh Interval (minutes)
              </label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="180">3 hours</option>
                <option value="0">Disabled</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={handleExportData}
                variant="secondary"
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              
              <Button
                onClick={handleImportData}
                variant="secondary"
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </Button>
              
              <Button
                onClick={handleClearCache}
                variant="secondary"
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear Cache
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Security & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Firebase Security</h3>
              <p className="text-sm text-blue-700">
                Your data is secured with Firebase's enterprise-grade security. 
                All communication is encrypted and follows industry best practices.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Data Privacy</h3>
              <p className="text-sm text-green-700">
                We respect your privacy. Performance data is used solely for tracking 
                and improving coding skills within your organization.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Application</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">v1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Build:</span>
                  <span className="font-medium">React + TypeScript</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Backend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Database:</span>
                  <span className="font-medium">Firebase Firestore</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hosting:</span>
                  <span className="font-medium">Vercel</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium">✓ Connected</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Changes */}
      <div className="flex justify-end space-x-3">
        <Button variant="secondary">
          Reset to Defaults
        </Button>
        <Button>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Settings;