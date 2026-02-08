import React, { useState, useEffect } from 'react';
import { Bell, Search, MapPin, Cloud, Wind, Droplet, Thermometer, Sun, CloudRain, CloudSnow } from 'lucide-react';

const TopBar = () => {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState({ lat: 16.0544, lon: 108.2022, name: 'Da Nang' });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch weather from Open-Meteo API (free, no API key required)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
        );
        const data = await res.json();
        setWeather(data.current);
      } catch (error) {
        console.error('Weather fetch error:', error);
      }
    };
    
    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [location]);

  const getWeatherIcon = (code) => {
    if (!code) return <Sun size={18} className="text-yellow-500" />;
    if (code >= 61 && code <= 67) return <CloudRain size={18} className="text-blue-500" />;
    if (code >= 71 && code <= 77) return <CloudSnow size={18} className="text-blue-300" />;
    if (code >= 1 && code <= 3) return <Cloud size={18} className="text-gray-400" />;
    return <Sun size={18} className="text-yellow-500" />;
  };

  const getWeatherDescription = (code) => {
    if (!code) return 'Clear';
    if (code === 0) return 'Clear Sky';
    if (code >= 1 && code <= 3) return 'Partly Cloudy';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 55) return 'Drizzle';
    if (code >= 61 && code <= 65) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Rain Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Clear';
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-10">
      <div className="flex items-center gap-4 text-gray-500 text-sm">
        {/* Location */}
        <span className="flex items-center gap-1.5 font-medium text-gray-700">
          <MapPin size={14} className="text-blue-500" />
          {location.name}
        </span>
        <span className="text-gray-300">|</span>
        
        {/* Coordinates */}
        <span className="text-xs">
          {location.lat.toFixed(4)}°N, {location.lon.toFixed(4)}°E
        </span>
        <span className="text-gray-300">|</span>
        
        {/* Live Weather from API */}
        {weather ? (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              {getWeatherIcon(weather.weather_code)}
              <span className="font-medium">{Math.round(weather.temperature_2m)}°C</span>
              <span className="text-xs text-gray-400">{getWeatherDescription(weather.weather_code)}</span>
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Wind size={12} /> {weather.wind_speed_10m} km/h
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Droplet size={12} /> {weather.relative_humidity_2m}%
            </span>
          </div>
        ) : (
          <span className="text-gray-400 text-xs">Loading weather...</span>
        )}
        
        <span className="text-gray-300">|</span>
        
        {/* Live Clock */}
        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
          {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search camera, zone..."
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
