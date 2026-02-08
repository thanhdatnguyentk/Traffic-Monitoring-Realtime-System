import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Activity, Car, Users, Zap, Plus, Trash2, X } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx'; 

const DashboardView = () => {
  const [cameras, setCameras] = useState([]);
  const [activeCameraId, setActiveCameraId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Real-time Stats
  const [stats, setStats] = useState({ car: 0, motorcycle: 0, bus: 0, truck: 0 });

  // Form State
  const [newCamera, setNewCamera] = useState({
      name: '',
      source_url: '',
      location: ''
  });

  // Dummy data for Weekly Trends (keep for now as backend doesn't store historical data yet)
  const weeklyData = [
    { name: 'Mon', vehicles: 4000 },
    { name: 'Tue', vehicles: 3000 },
    { name: 'Wed', vehicles: 2000 },
    { name: 'Thu', vehicles: 2780 },
    { name: 'Fri', vehicles: 1890 },
    { name: 'Sat', vehicles: 2390 },
    { name: 'Sun', vehicles: 3490 },
  ];
  
  const pieData = [
    { name: 'Automobiles', value: stats.car + stats.truck + stats.bus },
    { name: 'Motorcycles', value: stats.motorcycle },
  ];
  
  const COLORS = ['#3b82f6', '#10b981', '#fbbf24', '#f87171'];

  const fetchCameras = () => {
    axios.get('http://localhost:8000/cameras/')
      .then(res => {
        setCameras(res.data);
        if (res.data.length > 0 && !activeCameraId) {
          setActiveCameraId(res.data[0].id);
        }
      })
      .catch(err => {
          console.error("Error connecting to backend:", err);
      });
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  // Poll for stats
  useEffect(() => {
      if (!activeCameraId) return;

      const interval = setInterval(() => {
          axios.get(`http://localhost:8000/stats/${activeCameraId}`)
              .then(res => setStats(res.data))
              .catch(err => console.error("Error fetching stats:", err));
      }, 1000); // Update every 1 second

      return () => clearInterval(interval);
  }, [activeCameraId]);

  const handleAddCamera = async (e) => {
      e.preventDefault();
      try {
          const res = await axios.post('http://localhost:8000/cameras/', newCamera);
          setCameras([...cameras, res.data]);
          setActiveCameraId(res.data.id);
          setIsModalOpen(false);
          setNewCamera({ name: '', source_url: '', location: '' });
      } catch (error) {
          console.error("Error adding camera:", error);
          alert("Failed to add camera. Check if the URL is unique.");
      }
  };
  
  const handleDeleteCamera = async (e, id) => {
      e.stopPropagation(); // Prevent selecting the camera
      if (!window.confirm("Are you sure you want to delete this camera?")) return;
      
      try {
          await axios.delete(`http://localhost:8000/cameras/${id}`);
          const updatedCameras = cameras.filter(cam => cam.id !== id);
          setCameras(updatedCameras);
          if (activeCameraId === id) {
              setActiveCameraId(updatedCameras.length > 0 ? updatedCameras[0].id : null);
          }
      } catch (error) {
          console.error("Error deleting camera:", error);
      }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Top Controls */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-xs border border-gray-100">
         <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
             {cameras.map(cam => (
                 <button
                    key={cam.id}
                    onClick={() => setActiveCameraId(cam.id)}
                    className={clsx(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap",
                        activeCameraId === cam.id 
                            ? "bg-blue-600 text-white shadow-md" 
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                 >
                    {cam.name}
                    <span 
                        onClick={(e) => handleDeleteCamera(e, cam.id)}
                        className="p-1 rounded-full hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                    >
                        <Trash2 size={12} />
                    </span>
                 </button>
             ))}
         </div>
         <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap"
         >
             <Plus size={16} />
             Add Camera
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative h-[500px]">
          <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 backdrop-blur-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            LIVE {activeCameraId && cameras.find(c => c.id === activeCameraId)?.name}
          </div>
          {activeCameraId ? (
            <img 
              src={`http://localhost:8000/video_feed/${activeCameraId}`} 
              alt="Live Feed" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-500 p-8 text-center">
              <Car className="mb-4 text-gray-300" size={48} />
              <p>No active camera selected.</p>
              <p className="text-sm mt-2">Add a camera to start monitoring.</p>
            </div>
          )}
        </div>

        {/* Right Stats */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium mb-4 uppercase tracking-wider">Traffic Flow Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase">Current Count</p>
                  <span className="text-3xl font-bold text-gray-800">
                      {stats.car + stats.motorcycle + stats.bus + stats.truck}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase">Flow Rate</p>
                  <span className="text-2xl font-bold text-blue-600 flex items-center justify-end gap-1">
                    <Zap size={18} /> {stats.flow_rate || 0} <span className="text-xs font-normal text-gray-400">v/m</span>
                  </span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                 <div>
                    <p className="text-xs text-gray-400 uppercase">Total Unique</p>
                    <span className="text-xl font-semibold text-gray-700">{stats.total_vehicles || 0}</span>
                 </div>
                 <span className="text-green-500 text-sm font-medium flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md">
                    <Activity size={16} /> Live
                 </span>
              </div>
            </div>
          </div>

           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 flex flex-col">
            <h3 className="text-gray-500 text-sm font-medium mb-4 uppercase tracking-wider">Vehicle Breakdown</h3>
             <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    >
                    {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                </PieChart>
                </ResponsiveContainer>
             </div>
              <div className="flex justify-center gap-4 text-xs text-gray-400 mt-2">
                 <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Auto ({stats.car + stats.truck + stats.bus})</span>
                 <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Moto ({stats.motorcycle})</span>
              </div>
          </div>
        </div>
      </div>

       {/* Bottom Charts */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
         <h3 className="text-gray-500 text-sm font-medium mb-4 uppercase tracking-wider">Weekly Traffic Trends</h3>
         <ResponsiveContainer width="100%" height="100%">
           <BarChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
             <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
             <Tooltip 
                cursor={{fill: '#f9fafb'}} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
             />
             <Bar dataKey="vehicles" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
           </BarChart>
         </ResponsiveContainer>
      </div>

      {/* Add Camera Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-gray-800">Add New Camera</h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={20} />
                      </button>
                  </div>
                  <form onSubmit={handleAddCamera} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Camera Name</label>
                          <input 
                              type="text" 
                              required
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g. Main Gate Camera"
                              value={newCamera.name}
                              onChange={e => setNewCamera({...newCamera, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Source URL (YouTube / link stream)</label>
                          <input 
                              type="text" 
                              required
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="https://youtube.com/..."
                              value={newCamera.source_url}
                              onChange={e => setNewCamera({...newCamera, source_url: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
                          <input 
                              type="text" 
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g. Sector A"
                              value={newCamera.location}
                              onChange={e => setNewCamera({...newCamera, location: e.target.value})}
                          />
                      </div>
                      <div className="pt-4 flex justify-end gap-3">
                          <button 
                              type="button"
                              onClick={() => setIsModalOpen(false)}
                              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                          >
                              Cancel
                          </button>
                          <button 
                              type="submit"
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm"
                          >
                              Add Camera
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default DashboardView;
