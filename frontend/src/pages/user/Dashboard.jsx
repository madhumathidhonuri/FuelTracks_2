import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { vehiclesApi } from '../../api/vehicles.api';
import { trackingApi } from '../../api/tracking.api';
import LiveMap from '../../components/map/LiveMap';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// SVG Sparkline Component (resolves canvas sizing/flickering issues)
const Sparkline = ({ data = [], color = '#34d8b5' }) => {
  if (data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 120;
  const height = 36;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const fillPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" points={points} />
      <polygon fill={`${color}15`} points={fillPoints} />
    </svg>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [liveTime, setLiveTime] = useState('');
  const [mapFilter, setMapFilter] = useState('All');

  useEffect(() => {
    const updateTime = () => {
      const formatted = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) + ' · ' + new Date().toLocaleTimeString('en-IN');
      setLiveTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Promise.all([vehiclesApi.getAll({ limit: 1000 }), trackingApi.getFleetStatus()])
      .then(([vRes]) => {
        const rawList = vRes.data.data || [];
        const list = rawList.map(v => {
          const lat = v.latitude ? parseFloat(v.latitude) : null;
          const lng = v.longitude ? parseFloat(v.longitude) : null;
          return {
            ...v,
            vehicleNumber: v.registration_number || v.vehicleNumber,
            name: v.vehicle_name || v.name || v.registration_number,
            lastLocation: lat !== null && lng !== null ? {
              lat,
              lng,
              speed: v.speed || v.current_speed || 0,
              ignition: v.ignition || false,
              timestamp: v.last_comm
            } : null
          };
        });
        setVehicles(list);
        if (list.length > 0) {
          setSelectedVehicle(list[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-2 animate-fadeIn">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
          <div>
            <div className="h-8 w-64 bg-lb-200 dark:bg-lb-800 rounded animate-pulse"></div>
            <div className="h-4 w-96 bg-lb-100 dark:bg-lb-900 rounded animate-pulse mt-2"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-lb-100 dark:bg-[#0d1e26] rounded-[20px] animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          <div className="h-[460px] bg-lb-100 dark:bg-[#0d1e26] rounded-3xl animate-pulse"></div>
          <div className="h-[460px] bg-lb-100 dark:bg-[#0d1e26] rounded-3xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Stable pseudorandom generators to supplement basic DB records with premium details
  const getVehicleDetail = (veh, key, fallback) => {
    if (!veh) return fallback;
    if (veh[key] !== undefined && veh[key] !== null) return veh[key];
    const seed = (veh.id || veh.vehicleNumber || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    switch (key) {
      case 'driverName':
        const drivers = ['Rajesh Kumar', 'Suresh Nair', 'Priya Mehta', 'Amit Singh', 'Vipin Sharma'];
        return drivers[seed % drivers.length];
      case 'fuelLevel':
        return 20 + (seed % 75);
      case 'engineStatus':
        const statuses = ['Good', 'Excellent', 'Check Engine', 'Good', 'Service Due'];
        return statuses[seed % statuses.length];
      case 'odometer':
        return (50000 + (seed * 17) % 90000).toLocaleString('en-IN');
      case 'route':
        const routesList = ['Chennai → Madurai', 'Depot', 'Coimbatore → Salem', 'Garage', 'Madurai → Trichy'];
        return routesList[seed % routesList.length];
      case 'eta':
        return (seed % 4) + 'h ' + (seed % 60) + 'm';
      case 'maintenanceStatus':
        const maint = ['On Time', 'Idle', 'On Time', 'Stopped', 'Scheduled'];
        return maint[seed % maint.length];
      default:
        return fallback;
    }
  };

  const statusCounts = {
    moving: vehicles.filter((v) => v.status === 'moving').length,
    idle: vehicles.filter((v) => v.status === 'idle').length,
    stopped: vehicles.filter((v) => v.status === 'stopped').length,
  };

  const filteredVehicles = vehicles.filter(v => {
    if (mapFilter === 'All') return true;
    if (mapFilter === 'Stopped') return v.status === 'stopped';
    return v.status === mapFilter.toLowerCase();
  });

  const activeVehicle = selectedVehicle || vehicles[0];

  // Recharts parameters
  const chartTextColor = isDark ? 'rgba(226,241,247,0.6)' : 'rgba(26,58,74,0.5)';
  const chartGridColor = isDark ? 'rgba(61,122,138,0.18)' : 'rgba(61,122,138,0.08)';
  const chartRadarColor = isDark ? 'rgba(61,122,138,0.22)' : 'rgba(61,122,138,0.12)';

  // Chart datasets
  const fuelTrendData = [
    { name: 'Jun 1', fuel: 4200 },
    { name: 'Jun 5', fuel: 4050 },
    { name: 'Jun 10', fuel: 4400 },
    { name: 'Jun 15', fuel: 4180 },
    { name: 'Jun 20', fuel: 4350 },
    { name: 'Jun 25', fuel: 4100 },
    { name: 'Jun 30', fuel: 4280 }
  ];

  const utilizationData = [
    { name: 'Mon', active: 210 },
    { name: 'Tue', active: 225 },
    { name: 'Wed', active: 218 },
    { name: 'Thu', active: 230 },
    { name: 'Fri', active: 222 },
    { name: 'Sat', active: 180 },
    { name: 'Sun', active: 140 }
  ];

  const driverPerfData = [
    { subject: 'Safety', 'Top Driver': 92, 'Fleet Avg': 78 },
    { subject: 'Fuel Eff.', 'Top Driver': 88, 'Fleet Avg': 74 },
    { subject: 'Speed', 'Top Driver': 85, 'Fleet Avg': 80 },
    { subject: 'Timing', 'Top Driver': 94, 'Fleet Avg': 82 },
    { subject: 'Distance', 'Top Driver': 90, 'Fleet Avg': 76 }
  ];

  const distanceData = [
    { name: 'Jan', distance: 128 },
    { name: 'Feb', distance: 122 },
    { name: 'Mar', distance: 135 },
    { name: 'Apr', distance: 138 },
    { name: 'May', distance: 140 },
    { name: 'Jun', distance: 142 }
  ];

  const renderDetailRow = (icon, label, val) => (
    <div
      className="detail-row flex items-center justify-between px-3 py-2.5 rounded-[10px] text-[13px]"
      style={{
        marginBottom: '4px'
      }}
    >
      <span className="flex items-center gap-2 text-lb-500">
        <i className={`fa-solid ${icon} w-3.5 text-center text-lb-400`}></i>
        {label}
      </span>
      <span className="font-semibold text-lb-800 dark:text-white">{val}</span>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="mb-7">
        <h2 className="font-display text-[28px] font-bold mb-1 text-lb-800 dark:text-white">
          Welcome back, {user?.name || 'Admin'} 👋
        </h2>
        <p className="text-[13px] text-lb-500">{liveTime || 'Loading local time…'}</p>
      </div>

      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-7">
        {/* Card 1 */}
        <div className="kpi-card rounded-[20px] p-5 transition-all duration-300 hover:-translate-y-1 cursor-default">
          <div className="flex items-start justify-between mb-3.5">
            <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-[17px] text-lb-600"
                 style={{ background: 'rgba(61,122,138,0.14)', border: '1px solid rgba(61,122,138,0.25)' }}>
              <i className="fa-solid fa-heart-pulse"></i>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg"
                 style={{ background: 'rgba(52,216,181,0.14)', color: '#0a8f78' }}>
              <i className="fa-solid fa-arrow-up"></i> 2.1%
            </div>
          </div>
          <div className="font-display text-[28px] font-bold leading-none mb-1 text-lb-700 dark:text-white">96.4</div>
          <div className="text-[12px] uppercase tracking-[0.06em] text-lb-500">Fleet Health</div>
          <div className="mt-3 h-9">
            <Sparkline data={[88, 90, 92, 91, 93, 95, 96]} color="#34d8b5" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="kpi-card rounded-[20px] p-5 transition-all duration-300 hover:-translate-y-1 cursor-default">
          <div className="flex items-start justify-between mb-3.5">
            <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-[17px] text-lb-600"
                 style={{ background: 'rgba(61,122,138,0.14)', border: '1px solid rgba(61,122,138,0.25)' }}>
              <i className="fa-solid fa-route"></i>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg"
                 style={{ background: 'rgba(52,216,181,0.14)', color: '#0a8f78' }}>
              <i className="fa-solid fa-arrow-up"></i> 8
            </div>
          </div>
          <div className="font-display text-[28px] font-bold leading-none mb-1 text-lb-700 dark:text-white">34</div>
          <div className="text-[12px] uppercase tracking-[0.06em] text-lb-500">Active Trips</div>
          <div className="mt-3 h-9">
            <Sparkline data={[20, 25, 30, 28, 32, 30, 34]} color="#3d7a8a" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="kpi-card rounded-[20px] p-5 transition-all duration-300 hover:-translate-y-1 cursor-default">
          <div className="flex items-start justify-between mb-3.5">
            <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-[17px] text-lb-600"
                 style={{ background: 'rgba(61,122,138,0.14)', border: '1px solid rgba(61,122,138,0.25)' }}>
              <i className="fa-solid fa-truck"></i>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg"
                 style={{ background: 'rgba(52,216,181,0.14)', color: '#0a8f78' }}>
              <i className="fa-solid fa-arrow-up"></i> 3
            </div>
          </div>
          <div className="font-display text-[28px] font-bold leading-none mb-1 text-lb-700 dark:text-white">{vehicles.length || 247}</div>
          <div className="text-[12px] uppercase tracking-[0.06em] text-lb-500">Total Vehicles</div>
          <div className="mt-3 h-9">
            <Sparkline data={[240, 242, 244, 243, 245, 246, 247]} color="#3d7a8a" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="kpi-card rounded-[20px] p-5 transition-all duration-300 hover:-translate-y-1 cursor-default">
          <div className="flex items-start justify-between mb-3.5">
            <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-[17px] text-lb-600"
                 style={{ background: 'rgba(61,122,138,0.14)', border: '1px solid rgba(61,122,138,0.25)' }}>
              <i className="fa-solid fa-road"></i>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg"
                 style={{ background: 'rgba(52,216,181,0.14)', color: '#0a8f78' }}>
              <i class="fa-solid fa-arrow-up"></i> 5.3%
            </div>
          </div>
          <div className="font-display text-[28px] font-bold leading-none mb-1 text-lb-700 dark:text-white">142K</div>
          <div className="text-[12px] uppercase tracking-[0.06em] text-lb-500">Monthly km</div>
          <div className="mt-3 h-9">
            <Sparkline data={[120, 128, 134, 130, 138, 140, 142]} color="#3d7a8a" />
          </div>
        </div>

        {/* Card 5 */}
        <div className="kpi-card rounded-[20px] p-5 transition-all duration-300 hover:-translate-y-1 cursor-default">
          <div className="flex items-start justify-between mb-3.5">
            <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-[17px] text-lb-600"
                 style={{ background: 'rgba(61,122,138,0.14)', border: '1px solid rgba(61,122,138,0.25)' }}>
              <i className="fa-solid fa-gas-pump"></i>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg"
                 style={{ background: 'rgba(248,113,113,0.14)', color: '#b91c1c' }}>
              <i className="fa-solid fa-arrow-down"></i> 1.2%
            </div>
          </div>
          <div className="font-display text-[28px] font-bold leading-none mb-1 text-lb-700 dark:text-white">96.4</div>
          <div className="text-[12px] uppercase tracking-[0.06em] text-lb-500">Fleet Score</div>
          <div className="mt-3 h-9">
            <Sparkline data={[19, 18.5, 18.8, 18.6, 18.3, 18.5, 18.4]} color="#f87171" />
          </div>
        </div>

        {/* Card 6 */}
        <div className="kpi-card rounded-[20px] p-5 transition-all duration-300 hover:-translate-y-1 cursor-default">
          <div className="flex items-start justify-between mb-3.5">
            <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-[17px] text-lb-600"
                 style={{ background: 'rgba(61,122,138,0.14)', border: '1px solid rgba(61,122,138,0.25)' }}>
              <i className="fa-solid fa-gas-pump"></i>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg"
                 style={{ background: 'rgba(248,113,113,0.14)', color: '#b91c1c' }}>
              <i className="fa-solid fa-arrow-down"></i> 1.2%
            </div>
          </div>
          <div className="font-display text-[28px] font-bold leading-none mb-1 text-lb-700 dark:text-white">18.4</div>
          <div className="text-[12px] uppercase tracking-[0.06em] text-lb-500">Fuel km/L</div>
          <div className="mt-3 h-9">
            <Sparkline data={[180, 182, 184, 186, 185, 188, 189]} color="#3d7a8a" />
          </div>
        </div>
      </div>

      {/* Map & Selection Panel Row */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 mb-6">
        {/* Map Container */}
        <div
          className="map-container rounded-3xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(145deg, rgba(218,241,255,0.9) 0%, rgba(186,226,253,0.85) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(61,122,138,0.28)',
            boxShadow: '0 12px 40px rgba(15,60,80,0.1)'
          }}
        >
          {/* Map Controls Header */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(61,122,138,0.15)' }}>
            <h3
              className="text-[15px] font-semibold px-3 py-1.5 rounded-xl text-white"
              style={{
                background: 'rgba(26,58,74,0.82)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(61,122,138,0.25)'
              }}
            >
              <i className="fa-solid fa-satellite-dish mr-2 opacity-70"></i>Live Command Center
            </h3>
            <div className="flex gap-2">
              {['All', 'Moving', 'Idle', 'Stopped'].map((f) => {
                const isActive = mapFilter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setMapFilter(f)}
                    className="map-ctrl-btn px-3 py-1.5 rounded-[10px] text-[12px] font-medium transition-all duration-200"
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.45)',
                      border: isActive ? '1px solid rgba(61,122,138,0.35)' : '1px solid rgba(61,122,138,0.2)',
                      color: isActive ? '#0f2d3d' : '#2a6070'
                    }}
                  >
                    {f === 'Stopped' ? 'Alert' : f}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Leaflet map component */}
          <LiveMap
            vehicles={filteredVehicles}
            selectedVehicle={activeVehicle?.id}
            onVehicleClick={(v) => setSelectedVehicle(v)}
            height="400px"
          />
        </div>

        {/* Vehicle Selection Detail List */}
        <div
          className="glass-card rounded-3xl p-5 overflow-y-auto"
          style={{ height: '460px' }}
        >
          <div className="flex items-center gap-2 text-[14px] font-semibold mb-4 text-lb-700">
            <i className="fa-solid fa-truck-fast text-lb-500"></i> Vehicle Details
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {vehicles.map((v) => {
              const isSelected = activeVehicle?.id === v.id;
              const statusBadgeClass =
                v.status === 'moving' ? 'badge-moving' :
                v.status === 'idle' ? 'badge-idle' : 'badge-stopped';
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className={`veh-opt flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 text-[13px] ${
                    isSelected ? 'selected text-lb-700 font-semibold' : 'text-lb-600'
                  }`}
                >
                  <i className={`fa-solid ${v.status === 'moving' ? 'fa-truck' : v.status === 'idle' ? 'fa-van-shuttle' : 'fa-car'} text-[14px] text-lb-500`}></i>
                  <span className="font-semibold text-[13px]">{v.vehicleNumber}</span>
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md ${statusBadgeClass}`}>
                    {v.status}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Render Detail Rows for the Selected Vehicle */}
          {activeVehicle && (
            <div id="vehDetailInfo" className="flex flex-col gap-2 animate-fadeIn">
              {renderDetailRow('fa-hashtag', 'Vehicle No.', activeVehicle.vehicleNumber)}
              {renderDetailRow('fa-user', 'Driver', getVehicleDetail(activeVehicle, 'driverName', 'Rajesh Kumar'))}
              {renderDetailRow('fa-gauge-high', 'Speed', (activeVehicle.lastLocation?.speed || 0) + ' km/h')}
              {renderDetailRow('fa-heart', 'Engine', getVehicleDetail(activeVehicle, 'engineStatus', 'Good'))}
              {renderDetailRow('fa-road', 'Odometer', getVehicleDetail(activeVehicle, 'odometer', '98,420') + ' km')}
              {renderDetailRow('fa-map-signs', 'Route', getVehicleDetail(activeVehicle, 'route', 'Chennai → Madurai'))}
              {renderDetailRow('fa-clock', 'Est. Arrival', getVehicleDetail(activeVehicle, 'eta', '2h 14m'))}
              {renderDetailRow('fa-wrench', 'Maintenance', getVehicleDetail(activeVehicle, 'maintenanceStatus', 'On Time'))}
              
              <div className="mt-3">
                <div className="flex justify-between text-[12px] mb-1.5 text-lb-600">
                  <span><i className="fa-solid fa-gas-pump mr-1"></i>Fuel Level</span>
                  <span
                    style={{
                      color: getVehicleDetail(activeVehicle, 'fuelLevel', 72) < 25 ? '#f87171' : getVehicleDetail(activeVehicle, 'fuelLevel', 72) < 50 ? '#fbbf24' : '#34d8b5',
                      fontWeight: 600
                    }}
                  >
                    {getVehicleDetail(activeVehicle, 'fuelLevel', 72)}%
                  </span>
                </div>
                <div className="fuel-bar-bg">
                  <div
                    className="fuel-bar-fill"
                    style={{
                      width: `${getVehicleDetail(activeVehicle, 'fuelLevel', 72)}%`,
                      background: getVehicleDetail(activeVehicle, 'fuelLevel', 72) < 25
                        ? 'linear-gradient(90deg, #f87171, rgba(248,113,113,0.5))'
                        : getVehicleDetail(activeVehicle, 'fuelLevel', 72) < 50
                        ? 'linear-gradient(90deg, #fbbf24, rgba(251,191,36,0.5))'
                        : 'linear-gradient(90deg, #34d8b5, rgba(52,216,181,0.5))'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4 Analytics Graphs Grid (Recharts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* Graph 1: Fuel Consumption Area Chart */}
        <div
          className="glass-card rounded-[22px] p-5 transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(61,122,138,0.2)',
            boxShadow: '0 8px 28px rgba(15,60,80,0.07)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-lb-700 dark:text-white">
              <i className="fa-solid fa-chart-area text-lb-400"></i> Fuel Consumption Trend
            </div>
            <div className="text-[11px] cursor-pointer hover:underline text-lb-500">This Month ▾</div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fuelTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFuelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3d7a8a" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3d7a8a" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: chartTextColor }} stroke="transparent" />
                <YAxis tick={{ fontSize: 10, fill: chartTextColor }} stroke="transparent" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0d1e26' : 'rgba(26,58,74,0.88)',
                    border: '1px solid rgba(61,122,138,0.25)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="fuel" stroke="#3d7a8a" strokeWidth={2.5} fill="url(#colorFuelGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Utilization Bar Chart */}
        <div
          className="glass-card rounded-[22px] p-5 transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(61,122,138,0.2)',
            boxShadow: '0 8px 28px rgba(15,60,80,0.07)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-lb-700 dark:text-white">
              <i className="fa-solid fa-chart-bar text-lb-400"></i> Fleet Utilization
            </div>
            <div className="text-[11px] cursor-pointer hover:underline text-lb-500">Weekly ▾</div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: chartTextColor }} stroke="transparent" />
                <YAxis tick={{ fontSize: 10, fill: chartTextColor }} stroke="transparent" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0d1e26' : 'rgba(26,58,74,0.88)',
                    border: '1px solid rgba(61,122,138,0.25)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="active" fill="#3d7a8a" radius={[6, 6, 0, 0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 3: Driver Performance Radar Chart */}
        <div
          className="glass-card rounded-[22px] p-5 transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(61,122,138,0.2)',
            boxShadow: '0 8px 28px rgba(15,60,80,0.07)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-lb-700 dark:text-white">
              <i className="fa-solid fa-user-check text-lb-400"></i> Driver Performance
            </div>
            <div className="text-[11px] cursor-pointer hover:underline text-lb-500">View All ▾</div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={driverPerfData}>
                <PolarGrid stroke={chartRadarColor} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: chartTextColor, fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: chartTextColor, fontSize: 9 }} />
                <Radar name="Top Driver" dataKey="Top Driver" stroke="#34d8b5" fill="#34d8b5" fillOpacity={0.15} />
                <Radar name="Fleet Avg" dataKey="Fleet Avg" stroke="#3d7a8a" fill="#3d7a8a" fillOpacity={0.08} />
                <Legend tick={{ fill: chartTextColor, fontSize: 9 }} wrapperStyle={{ fontSize: '10px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0d1e26' : 'rgba(26,58,74,0.88)',
                    border: '1px solid rgba(61,122,138,0.25)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 4: Monthly Distance Line Chart */}
        <div
          className="glass-card rounded-[22px] p-5 transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(61,122,138,0.2)',
            boxShadow: '0 8px 28px rgba(15,60,80,0.07)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-lb-700 dark:text-white">
              <i className="fa-solid fa-chart-line text-lb-400"></i> Monthly Distance
            </div>
            <div className="text-[11px] cursor-pointer hover:underline text-lb-500">6 Months ▾</div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={distanceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDistGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3d7a8a" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3d7a8a" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: chartTextColor }} stroke="transparent" />
                <YAxis tick={{ fontSize: 10, fill: chartTextColor }} stroke="transparent" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0d1e26' : 'rgba(26,58,74,0.88)',
                    border: '1px solid rgba(61,122,138,0.25)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="distance" stroke="#3d7a8a" strokeWidth={2.5} fill="url(#colorDistGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Logs, Alerts, and overall gauge bottom grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Activity Timeline */}
        <div
          className="glass-card rounded-[22px] p-5 transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(61,122,138,0.2)',
            boxShadow: '0 8px 28px rgba(15,60,80,0.07)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-lb-700 dark:text-white">
              <i className="fa-solid fa-clock-rotate-left text-lb-400"></i> Activity Timeline
            </div>
            <div className="text-[11px] cursor-pointer hover:underline text-lb-500">View All</div>
          </div>
          <div className="flex flex-col">
            <div className="tl-item flex items-start gap-3 py-3 relative">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[12px]"
                   style={{ background: 'rgba(52,216,181,0.15)', color: '#0a8f78', border: '1.5px solid rgba(52,216,181,0.3)' }}>
                <i className="fa-solid fa-play"></i>
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold mb-0.5 text-lb-800 dark:text-white">Trip Started</div>
                <div className="text-[11px] text-lb-500">TN-01-AB-1234 · Chennai → Madurai</div>
              </div>
              <div className="text-[11px] whitespace-nowrap text-lb-400">9:42 AM</div>
            </div>
            <div className="tl-item flex items-start gap-3 py-3 relative">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[12px]"
                   style={{ background: 'rgba(251,191,36,0.15)', color: '#92650a', border: '1.5px solid rgba(251,191,36,0.3)' }}>
                <i className="fa-solid fa-gas-pump"></i>
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold mb-0.5 text-lb-800 dark:text-white">Fuel Refill</div>
                <div className="text-[11px] text-lb-500">TN-03-EF-9012 · 58L at ₹6,032</div>
              </div>
              <div className="text-[11px] whitespace-nowrap text-lb-400">9:20 AM</div>
            </div>
            <div className="tl-item flex items-start gap-3 py-3 relative">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[12px]"
                   style={{ background: 'rgba(61,122,138,0.15)', color: '#2a6070', border: '1.5px solid rgba(61,122,138,0.3)' }}>
                <i className="fa-solid fa-flag-checkered"></i>
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold mb-0.5 text-lb-800 dark:text-white">Trip Completed</div>
                <div className="text-[11px] text-lb-500">TN-07-XY-7890 · 312 km in 4h 18m</div>
              </div>
              <div className="text-[11px] whitespace-nowrap text-lb-400">8:55 AM</div>
            </div>
            <div className="tl-item flex items-start gap-3 py-3 relative">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[12px]"
                   style={{ background: 'rgba(125,203,252,0.2)', color: '#1b4a5e', border: '1.5px solid rgba(61,122,138,0.2)' }}>
                <i className="fa-solid fa-wrench"></i>
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold mb-0.5 text-lb-800 dark:text-white">Maintenance Done</div>
                <div className="text-[11px] text-lb-500">TN-05-KL-2345 · Oil change & filter</div>
              </div>
              <div className="text-[11px] whitespace-nowrap text-lb-400">7:30 AM</div>
            </div>
            <div className="tl-item flex items-start gap-3 py-3 relative">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[12px]"
                   style={{ background: 'rgba(248,113,113,0.15)', color: '#b91c1c', border: '1.5px solid rgba(248,113,113,0.25)' }}>
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold mb-0.5 text-lb-800 dark:text-white">Alert Triggered</div>
                <div className="text-[11px] text-lb-500">TN-04-GH-3456 · Geofence breach</div>
              </div>
              <div className="text-[11px] whitespace-nowrap text-lb-400">6:58 AM</div>
            </div>
          </div>
        </div>

        {/* Alert Center */}
        <div
          className="glass-card rounded-[22px] p-5 transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(61,122,138,0.2)',
            boxShadow: '0 8px 28px rgba(15,60,80,0.07)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-lb-700 dark:text-white">
              <i className="fa-solid fa-triangle-exclamation text-lb-400"></i> Alert Center
            </div>
            <div className="text-[11px] cursor-pointer hover:underline text-lb-500">Mark All Read</div>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="alert-item flex items-center gap-3 p-3 rounded-[14px] cursor-pointer transition-all duration-200"
                 style={{ background: 'rgba(240,248,255,0.7)', border: '1px solid rgba(61,122,138,0.15)' }}>
              <div className="w-9 h-9 rounded-[10px] flex-shrink-0 flex items-center justify-center text-[14px]"
                   style={{ background: 'rgba(248,113,113,0.12)', color: '#b91c1c' }}><i className="fa-solid fa-gas-pump"></i></div>
              <div className="flex-1">
                <div className="text-[12px] font-semibold mb-0.5 text-lb-800 dark:text-white">Low Fuel Alert</div>
                <div className="text-[11px] text-lb-500">TN-04-GH-3456 · 18% remaining</div>
              </div>
              <div className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse" style={{ background: '#f87171', boxShadow: '0 0 6px rgba(248,113,113,0.6)' }}></div>
              <div className="text-[10px] text-lb-400">5m ago</div>
            </div>
            <div className="alert-item flex items-center gap-3 p-3 rounded-[14px] cursor-pointer transition-all duration-200"
                 style={{ background: 'rgba(240,248,255,0.7)', border: '1px solid rgba(61,122,138,0.15)' }}>
              <div className="w-9 h-9 rounded-[10px] flex-shrink-0 flex items-center justify-center text-[14px]"
                   style={{ background: 'rgba(251,191,36,0.12)', color: '#92650a' }}><i className="fa-solid fa-gauge-high"></i></div>
              <div className="flex-1">
                <div className="text-[12px] font-semibold mb-0.5 text-lb-800 dark:text-white">Overspeed Alert</div>
                <div className="text-[11px] text-lb-500">TN-02-CD-5678 · 94 km/h in 60 zone</div>
              </div>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#fbbf24', boxShadow: '0 0 6px rgba(251,191,36,0.6)' }}></div>
              <div className="text-[10px] text-lb-400">12m ago</div>
            </div>
            <div className="alert-item flex items-center gap-3 p-3 rounded-[14px] cursor-pointer transition-all duration-200"
                 style={{ background: 'rgba(240,248,255,0.7)', border: '1px solid rgba(61,122,138,0.15)' }}>
              <div className="w-9 h-9 rounded-[10px] flex-shrink-0 flex items-center justify-center text-[14px]"
                   style={{ background: 'rgba(251,191,36,0.12)', color: '#92650a' }}><i className="fa-solid fa-wrench"></i></div>
              <div className="flex-1">
                <div className="text-[12px] font-semibold mb-0.5 text-lb-800 dark:text-white">Maintenance Due</div>
                <div className="text-[11px] text-lb-500">TN-06-MN-4567 · Service in 200 km</div>
              </div>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#fbbf24', boxShadow: '0 0 6px rgba(251,191,36,0.5)' }}></div>
              <div className="text-[10px] text-lb-400">1h ago</div>
            </div>
            <div className="alert-item flex items-center gap-3 p-3 rounded-[14px] cursor-pointer transition-all duration-200"
                 style={{ background: 'rgba(240,248,255,0.7)', border: '1px solid rgba(61,122,138,0.15)' }}>
              <div className="w-9 h-9 rounded-[10px] flex-shrink-0 flex items-center justify-center text-[14px]"
                   style={{ background: 'rgba(248,113,113,0.12)', color: '#b91c1c' }}><i className="fa-solid fa-map-location-dot"></i></div>
              <div className="flex-1">
                <div className="text-[12px] font-semibold mb-0.5 text-lb-800 dark:text-white">Geofence Breach</div>
                <div className="text-[11px] text-lb-500">TN-04-GH-3456 · Left Zone A</div>
              </div>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#f87171', boxShadow: '0 0 6px rgba(248,113,113,0.6)' }}></div>
              <div className="text-[10px] text-lb-400">2h ago</div>
            </div>
            <div className="alert-item flex items-center gap-3 p-3 rounded-[14px] cursor-pointer transition-all duration-200"
                 style={{ background: 'rgba(240,248,255,0.7)', border: '1px solid rgba(61,122,138,0.15)' }}>
              <div className="w-9 h-9 rounded-[10px] flex-shrink-0 flex items-center justify-center text-[14px]"
                   style={{ background: 'rgba(61,122,138,0.12)', color: '#2a6070' }}><i className="fa-solid fa-battery-quarter"></i></div>
              <div className="flex-1">
                <div className="text-[12px] font-semibold mb-0.5 text-lb-800 dark:text-white">Battery Low</div>
                <div className="text-[11px] text-lb-500">TN-09-ST-0011 · GPS battery 12%</div>
              </div>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#5a9baa', boxShadow: '0 0 6px rgba(61,122,138,0.6)' }}></div>
              <div className="text-[10px] text-lb-400">3h ago</div>
            </div>
          </div>
        </div>

        {/* Fleet Health Breakdown Gauge */}
        <div
          className="glass-card rounded-[22px] p-5 flex flex-col items-center justify-center gap-5 transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(61,122,138,0.2)',
            boxShadow: '0 8px 28px rgba(15,60,80,0.07)'
          }}
        >
          <div className="flex items-center gap-2 text-[14px] font-semibold self-start text-lb-700 dark:text-white">
            <i className="fa-solid fa-heart-pulse text-lb-400"></i> Fleet Health
          </div>
          <div className="text-center">
            <div className="health-ring">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(186,226,253,0.5)" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#3d7a8a"
                  strokeWidth="10"
                  strokeDasharray="327"
                  strokeDashoffset="24"
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(61,122,138,0.4))' }}
                />
              </svg>
              <div className="ring-val dark:text-white">96%</div>
            </div>
            <span className="block text-[10px] uppercase tracking-widest mt-1.5 text-lb-400">Overall Score</span>
          </div>
          <div className="w-full flex flex-col gap-2.5">
            <div>
              <div className="flex justify-between text-[11px] mb-1.5 text-lb-600 dark:text-lb-400">
                <span>Engine Health</span>
                <span className="font-semibold">98%</span>
              </div>
              <div className="fuel-bar-bg">
                <div className="fuel-bar-fill" style={{ width: '98%', background: 'linear-gradient(90deg,#34d8b5,#7ae8d4)' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] mb-1.5 text-lb-600 dark:text-lb-400">
                <span>Tyre Condition</span>
                <span className="font-semibold">91%</span>
              </div>
              <div className="fuel-bar-bg">
                <div className="fuel-bar-fill" style={{ width: '91%', background: 'linear-gradient(90deg,#5a9baa,#8ec4cc)' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] mb-1.5 text-lb-600 dark:text-lb-400">
                <span>Brake System</span>
                <span className="font-semibold">95%</span>
              </div>
              <div className="fuel-bar-bg">
                <div className="fuel-bar-fill" style={{ width: '95%', background: 'linear-gradient(90deg,#3d7a8a,#5a9baa)' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] mb-1.5 text-lb-600 dark:text-lb-400">
                <span>Fuel System</span>
                <span className="font-semibold">87%</span>
              </div>
              <div className="fuel-bar-bg">
                <div className="fuel-bar-fill" style={{ width: '87%', background: 'linear-gradient(90deg,#fbbf24,#fde68a)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
