import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, Bell, Moon, Sun, Camera, Brain, Database, Shield, CheckCircle } from 'lucide-react';
import axios from 'axios';

const SettingsView = () => {
  const [settings, setSettings] = useState({
    // Detection Settings
    confidenceThreshold: 0.3,
    modelType: 'yolov8n',
    enableGPU: true,
    
    // Display Settings
    darkMode: false,
    showFPS: true,
    showBoundingBoxes: true,
    
    // Notification Settings
    enableNotifications: true,
    notifyOnHighTraffic: true,
    notifyOnCameraOffline: true,
    
    // API Settings
    apiUrl: 'http://localhost:8000',
    pollingInterval: 1000,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // In a real app, this would save to backend or localStorage
    localStorage.setItem('smartcity_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setSettings({
      confidenceThreshold: 0.3,
      modelType: 'yolov8n',
      enableGPU: true,
      darkMode: false,
      showFPS: true,
      showBoundingBoxes: true,
      enableNotifications: true,
      notifyOnHighTraffic: true,
      notifyOnCameraOffline: true,
      apiUrl: 'http://localhost:8000',
      pollingInterval: 1000,
    });
    setSaved(false);
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('smartcity_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="text-blue-500" />
            Settings
          </h1>
          <p className="text-gray-500 text-sm">Configure system preferences</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RotateCcw size={16} />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {saved ? <CheckCircle size={16} /> : <Save size={16} />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Detection Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Brain className="text-purple-500" size={20} />
              AI Detection
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confidence Threshold: {settings.confidenceThreshold}
              </label>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.1"
                value={settings.confidenceThreshold}
                onChange={(e) => handleChange('confidenceThreshold', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-400 mt-1">Lower values detect more objects but may have false positives</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model Type</label>
              <select
                value={settings.modelType}
                onChange={(e) => handleChange('modelType', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <optgroup label="YOLOv11 (Latest)">
                  <option value="yolov11n">YOLOv11n (Nano)</option>
                  <option value="yolov11s">YOLOv11s (Small)</option>
                  <option value="yolov11m">YOLOv11m (Medium)</option>
                  <option value="yolov11l">YOLOv11l (Large)</option>
                  <option value="yolov11x">YOLOv11x (Extra Large)</option>
                </optgroup>
                <optgroup label="YOLOv10">
                  <option value="yolov10n">YOLOv10n (Nano)</option>
                  <option value="yolov10s">YOLOv10s (Small)</option>
                  <option value="yolov10m">YOLOv10m (Medium)</option>
                  <option value="yolov10l">YOLOv10l (Large)</option>
                  <option value="yolov10x">YOLOv10x (Extra Large)</option>
                </optgroup>
                <optgroup label="YOLOv8 (Default)">
                  <option value="yolov8n">YOLOv8n (Nano)</option>
                  <option value="yolov8s">YOLOv8s (Small)</option>
                  <option value="yolov8m">YOLOv8m (Medium)</option>
                  <option value="yolov8l">YOLOv8l (Large)</option>
                  <option value="yolov8x">YOLOv8x (Extra Large)</option>
                </optgroup>
                <optgroup label="Custom / Legacy">
                  <option value="yolo26x">YOLO v26x (Custom Local)</option>
                  <option value="yolov5s">YOLOv5s</option>
                </optgroup>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">GPU Acceleration</p>
                <p className="text-xs text-gray-400">Use CUDA for faster inference</p>
              </div>
              <button
                onClick={() => handleChange('enableGPU', !settings.enableGPU)}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.enableGPU ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.enableGPU ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Camera className="text-green-500" size={20} />
              Display
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Show FPS</p>
                <p className="text-xs text-gray-400">Display frames per second on video</p>
              </div>
              <button
                onClick={() => handleChange('showFPS', !settings.showFPS)}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.showFPS ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.showFPS ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Show Bounding Boxes</p>
                <p className="text-xs text-gray-400">Draw detection boxes on video</p>
              </div>
              <button
                onClick={() => handleChange('showBoundingBoxes', !settings.showBoundingBoxes)}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.showBoundingBoxes ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.showBoundingBoxes ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Dark Mode</p>
                <p className="text-xs text-gray-400">Switch to dark theme</p>
              </div>
              <button
                onClick={() => handleChange('darkMode', !settings.darkMode)}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform flex items-center justify-center ${settings.darkMode ? 'translate-x-6' : ''}`}>
                  {settings.darkMode ? <Moon size={10} /> : <Sun size={10} />}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Bell className="text-yellow-500" size={20} />
              Notifications
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Enable Notifications</p>
                <p className="text-xs text-gray-400">Show system alerts</p>
              </div>
              <button
                onClick={() => handleChange('enableNotifications', !settings.enableNotifications)}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.enableNotifications ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.enableNotifications ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">High Traffic Alert</p>
                <p className="text-xs text-gray-400">Notify when traffic exceeds threshold</p>
              </div>
              <button
                onClick={() => handleChange('notifyOnHighTraffic', !settings.notifyOnHighTraffic)}
                disabled={!settings.enableNotifications}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.notifyOnHighTraffic && settings.enableNotifications ? 'bg-blue-600' : 'bg-gray-300'} ${!settings.enableNotifications ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.notifyOnHighTraffic && settings.enableNotifications ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Camera Offline Alert</p>
                <p className="text-xs text-gray-400">Notify when a camera goes offline</p>
              </div>
              <button
                onClick={() => handleChange('notifyOnCameraOffline', !settings.notifyOnCameraOffline)}
                disabled={!settings.enableNotifications}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.notifyOnCameraOffline && settings.enableNotifications ? 'bg-blue-600' : 'bg-gray-300'} ${!settings.enableNotifications ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.notifyOnCameraOffline && settings.enableNotifications ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* API Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Database className="text-cyan-500" size={20} />
              API Configuration
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Backend API URL</label>
              <input
                type="text"
                value={settings.apiUrl}
                onChange={(e) => handleChange('apiUrl', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Polling Interval: {settings.pollingInterval}ms
              </label>
              <input
                type="range"
                min="500"
                max="5000"
                step="500"
                value={settings.pollingInterval}
                onChange={(e) => handleChange('pollingInterval', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-400 mt-1">How often to fetch stats (lower = more real-time)</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-100 rounded-xl">
            <Shield className="text-blue-600" size={32} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Smart City Traffic & Parking AI Monitor</h3>
            <p className="text-sm text-gray-500">Version 1.0.0 | Built with FastAPI + React + YOLOv8</p>
            <p className="text-xs text-gray-400 mt-1">© 2026 AI Traffic Monitoring System</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
