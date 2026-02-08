import React, { useState, useEffect } from 'react';
import { Activity, Server, Cpu, HardDrive, Wifi, Clock, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const SystemHealthView = () => {
  const [cameras, setCameras] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCameras = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/cameras/');
      setCameras(res.data);
    } catch (error) {
      console.error("Error fetching cameras:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
    const interval = setInterval(fetchCameras, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // Simulated system metrics (in a real app, these would come from a backend endpoint)
  const systemMetrics = {
    cpu: Math.floor(Math.random() * 30) + 20, // 20-50%
    memory: Math.floor(Math.random() * 20) + 60, // 60-80%
    disk: 45,
    uptime: '3d 14h 22m',
    apiLatency: Math.floor(Math.random() * 50) + 30, // 30-80ms
  };

  const getStatusColor = (value, thresholds = { warning: 70, critical: 90 }) => {
    if (value >= thresholds.critical) return 'text-red-500';
    if (value >= thresholds.warning) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = (isActive) => {
    if (isActive) return <CheckCircle className="text-green-500" size={20} />;
    return <XCircle className="text-red-500" size={20} />;
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">System Health</h1>
          <p className="text-gray-500 text-sm">Monitor system performance and camera status</p>
        </div>
        <button
          onClick={fetchCameras}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* System Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <Cpu className="text-blue-500" size={24} />
            <span className="text-gray-500 text-sm font-medium">CPU Usage</span>
          </div>
          <div className={`text-3xl font-bold ${getStatusColor(systemMetrics.cpu)}`}>
            {systemMetrics.cpu}%
          </div>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${systemMetrics.cpu > 70 ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${systemMetrics.cpu}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <Server className="text-purple-500" size={24} />
            <span className="text-gray-500 text-sm font-medium">Memory</span>
          </div>
          <div className={`text-3xl font-bold ${getStatusColor(systemMetrics.memory)}`}>
            {systemMetrics.memory}%
          </div>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${systemMetrics.memory > 80 ? 'bg-red-500' : 'bg-purple-500'}`}
              style={{ width: `${systemMetrics.memory}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <HardDrive className="text-green-500" size={24} />
            <span className="text-gray-500 text-sm font-medium">Disk Usage</span>
          </div>
          <div className={`text-3xl font-bold ${getStatusColor(systemMetrics.disk)}`}>
            {systemMetrics.disk}%
          </div>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${systemMetrics.disk}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <Wifi className="text-cyan-500" size={24} />
            <span className="text-gray-500 text-sm font-medium">API Latency</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {systemMetrics.apiLatency}ms
          </div>
          <p className="text-xs text-gray-400 mt-2">Average response time</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="text-orange-500" size={24} />
            <span className="text-gray-500 text-sm font-medium">Uptime</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {systemMetrics.uptime}
          </div>
          <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
            <CheckCircle size={12} /> System Stable
          </p>
        </div>
      </div>

      {/* Camera Status Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Activity size={20} className="text-blue-500" />
            Camera Status
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cameras.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    No cameras configured. Add cameras from the Dashboard.
                  </td>
                </tr>
              ) : (
                cameras.map(camera => (
                  <tr key={camera.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">#{camera.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{camera.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{camera.location || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${camera.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {getStatusIcon(camera.is_active)}
                        {camera.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={camera.source_url}>
                      {camera.source_url.substring(0, 40)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(camera.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Server className="text-green-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-800">Backend API</p>
                <p className="text-xs text-gray-400">FastAPI Server</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Running</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Cpu className="text-green-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-800">AI Engine</p>
                <p className="text-xs text-gray-400">YOLOv8 Detection</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Active</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <HardDrive className="text-green-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-800">Database</p>
                <p className="text-xs text-gray-400">SQLite</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthView;
