import React from 'react';
import { LayoutDashboard, Map, Activity, Settings } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'traffic', label: 'Traffic Flow', icon: Map },
    { id: 'health', label: 'System Health', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="text-blue-600" />
          SmartCity AI
        </h1>
        <p className="text-xs text-gray-400 mt-1">Traffic Monitoring System</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === item.id
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
            OP
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Operator #732</p>
            <p className="text-xs text-green-500">● Online</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
