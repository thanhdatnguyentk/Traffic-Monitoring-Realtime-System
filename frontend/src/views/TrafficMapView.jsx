import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, AlertTriangle, CheckCircle, Clock, Navigation, Wind, Video } from 'lucide-react';
import axios from 'axios';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom camera icon
const cameraIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2956/2956043.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

// Traffic Layer Control Component
const TrafficLayerControl = () => {
    const map = useMap();
    
    useEffect(() => {
        // Add traffic layer using TomTom Traffic Flow (free tier available)
        const trafficLayer = L.tileLayer(
            'https://{s}.api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=YOUR_TOMTOM_API_KEY&tileSize=256',
            {
                maxZoom: 22,
                subdomains: ['a', 'b', 'c', 'd'],
                attribution: '© TomTom Traffic'
            }
        );
        
        // Alternative: Use OpenStreetMap with no traffic but nice styling
        // Comment out the trafficLayer.addTo(map) and the map will show clean OSM tiles
        
        // trafficLayer.addTo(map);
        
        return () => {
            map.removeLayer(trafficLayer);
        };
    }, [map]);
    
    return null;
};

const TrafficMapView = () => {
    const [cameras, setCameras] = useState([]);
    const [events, setEvents] = useState([
        { id: 1, type: 'entry', carId: 'Vehicle_ID_8829', location: 'Sector B', time: '14:42:09', status: 'success' },
        { id: 2, type: 'entry', carId: 'Vehicle_ID_3321', location: 'Sector A', time: '14:41:55', status: 'success' },
        { id: 3, type: 'alert', carId: 'Unknown', location: 'Gate 2', time: '14:40:12', status: 'warning' },
        { id: 4, type: 'exit', carId: 'Vehicle_ID_9921', location: 'Sector B', time: '14:38:44', status: 'success' },
    ]);

    // Default location (Da Nang, Vietnam)
    const [location] = useState({ lat: 16.0544, lng: 108.2022, name: 'Da Nang, Vietnam' });

    // Sample camera locations (you can update these based on actual camera data)
    const cameraLocations = [
        { id: 1, name: 'Main Gate', lat: 16.0544, lng: 108.2022, status: 'active' },
        { id: 2, name: 'Highway Junction', lat: 16.0600, lng: 108.2100, status: 'active' },
        { id: 3, name: 'City Center', lat: 16.0480, lng: 108.2150, status: 'active' },
    ];

    useEffect(() => {
        axios.get('http://localhost:8000/cameras/')
            .then(res => setCameras(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="p-6 h-screen flex flex-col space-y-6 bg-gray-50">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Map Area - Leaflet Map */}
                <div className="lg:col-span-2 bg-gray-200 rounded-xl overflow-hidden relative border border-gray-300 shadow-inner">
                    <MapContainer
                        center={[location.lat, location.lng]}
                        zoom={14}
                        className="w-full h-full z-0"
                        zoomControl={true}
                        scrollWheelZoom={true}
                    >
                        {/* Base Map Layer - OpenStreetMap */}
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        
                        {/* Alternative: CartoDB Dark Theme */}
                        {/* <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                        /> */}
                        
                        {/* Traffic Layer Control */}
                        <TrafficLayerControl />
                        
                        {/* Camera Markers */}
                        {cameraLocations.map(cam => (
                            <Marker 
                                key={cam.id} 
                                position={[cam.lat, cam.lng]}
                                icon={cameraIcon}
                            >
                                <Popup>
                                    <div className="text-center">
                                        <p className="font-bold text-gray-800">{cam.name}</p>
                                        <p className="text-xs text-green-500 flex items-center justify-center gap-1">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                            {cam.status}
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                        
                        {/* Center Marker */}
                        <Marker position={[location.lat, location.lng]}>
                            <Popup>
                                <div className="text-center">
                                    <p className="font-bold">{location.name}</p>
                                    <p className="text-xs text-gray-500">Monitoring Center</p>
                                </div>
                            </Popup>
                        </Marker>
                    </MapContainer>
                    
                    {/* Overlay: Camera List */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md w-64 max-h-64 overflow-auto z-[1000]">
                        <h4 className="font-semibold text-gray-700 mb-2 border-b pb-2 flex items-center gap-2">
                            <Video size={16} className="text-blue-500" />
                            Active Cameras ({cameras.length})
                        </h4>
                        {cameras.length === 0 ? (
                            <p className="text-xs text-gray-400">No cameras configured</p>
                        ) : (
                            cameras.map(cam => (
                                <div key={cam.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        {cam.name}
                                    </span>
                                    <span className="text-xs text-gray-400">{cam.location || 'N/A'}</span>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Map Info */}
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md z-[1000]">
                        <h4 className="font-semibold text-gray-700 text-xs mb-2 flex items-center gap-1">
                            <MapPin size={12} className="text-red-500" />
                            Map Info
                        </h4>
                        <div className="space-y-1 text-xs text-gray-600">
                            <p>Lat: {location.lat.toFixed(4)}°N</p>
                            <p>Lng: {location.lng.toFixed(4)}°E</p>
                        </div>
                    </div>

                    {/* Windy Weather Widget */}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md w-72 z-[1000]">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 border-b pb-2">
                            <Wind size={16} className="text-cyan-500" />
                            Weather Radar
                        </h4>
                        <iframe
                            title="Windy Weather"
                            src={`https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h&zoom=10&overlay=rain&product=ecmwf&level=surface&lat=${location.lat}&lon=${location.lng}&detailLat=${location.lat}&detailLon=${location.lng}&detail=true&message=true`}
                            className="w-full h-40 rounded-lg border border-gray-200"
                            frameBorder="0"
                        ></iframe>
                        <p className="text-xs text-gray-400 mt-2 text-center">Powered by Windy.com</p>
                    </div>
                </div>

                {/* Event Log */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                           <Clock size={18} /> Live Event Log
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 event-log">
                        {events.map((event) => (
                            <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-blue-50 transition-colors">
                                <div className={`mt-1 p-1 rounded-full ${
                                    event.type === 'alert' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'
                                }`}>
                                    {event.type === 'alert' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-medium text-gray-700">{event.carId}</p>
                                        <span className="text-xs text-gray-400">{event.time}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {event.type === 'entry' ? 'Entered' : event.type === 'exit' ? 'Exited' : 'Alert at'} {event.location}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrafficMapView;
