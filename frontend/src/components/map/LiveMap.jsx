import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from '../../context/ThemeContext';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const getShortLabel = (num) => {
  if (!num) return 'VEH';
  const parts = num.split('-');
  if (parts.length >= 2) return parts.slice(-2).join('-');
  return num.slice(-7);
};

const createVehicleIcon = (status, label) => {
  const statusColors = {
    moving: { color: '#34d8b5', ring: 'rgba(52,216,181,0.35)' },
    idle: { color: '#fbbf24', ring: 'rgba(251,191,36,0.35)' },
    stopped: { color: '#f87171', ring: 'rgba(248,113,113,0.35)' },
    offline: { color: '#64748b', ring: 'rgba(100,116,139,0.35)' },
  };
  const cfg = statusColors[status] || statusColors.offline;

  const html = `
    <div style="position:relative;width:36px;height:36px">
      <div style="position:absolute;inset:0;border-radius:50%;background:${cfg.ring};animation:veh-pulse-anim 2s ease-out infinite"></div>
      <div style="position:absolute;inset:4px;border-radius:50%;background:${cfg.color};box-shadow:0 0 8px ${cfg.color}88;display:flex;align-items:center;justify-content:center">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-8 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
      </div>
      <div style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);white-space:nowrap;background:rgba(26,58,74,0.88);color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:5px;font-family:Inter,sans-serif">${label}</div>
    </div>`;

  return L.divIcon({ html, className: '', iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -18] });
};

const LiveMap = ({ vehicles = [], selectedVehicle, onVehicleClick, className = '', height = '460px' }) => {
  const { isDark, mapTileUrl, mapAttribution } = useTheme();
  const [mapReady, setMapReady] = useState(false);
  
  // Centered around South India where standard mockup coordinates are located
  const defaultCenter = [11.5, 78.5];

  const routes = [
    { coords: [[10.7905, 79.1378], [11.0168, 76.9558]], color: '#34d8b5' },
    { coords: [[13.0827, 80.2707], [11.0168, 76.9558]], color: '#3d7a8a' },
  ];

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height, minHeight: 0 }}>
      {!mapReady && (
        <div className="absolute inset-0 bg-lb-50 dark:bg-[#09131a] z-10 flex items-center justify-center">
          <div className="text-center">
            <i className="fa-solid fa-circle-notch animate-spin text-[#3d7a8a] text-3xl mb-2"></i>
            <p className="text-sm text-lb-600 dark:text-lb-400">Loading Fleet Map...</p>
          </div>
        </div>
      )}
      
      <MapContainer
        center={defaultCenter}
        zoom={7}
        className="w-full h-full"
        style={{ background: isDark ? '#0d1e26' : '#e8f4f7', zIndex: 0 }}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer key={mapTileUrl} url={mapTileUrl} attribution={mapAttribution} />
        
        {/* Mockup Routes */}
        {routes.map((route, idx) => (
          <Polyline
            key={idx}
            positions={route.coords}
            pathOptions={{ color: route.color, weight: 3, opacity: 0.85, dashArray: '8 5' }}
          />
        ))}

        {/* Geofence Circle */}
        <Circle
          center={[13.0827, 80.2707]}
          radius={25000}
          pathOptions={{ color: '#5a9baa', weight: 1.5, dashArray: '6 4', fillColor: '#5a9baa', fillOpacity: 0.06 }}
        >
          <Tooltip permanent direction="top" className="zone-label">
            ZONE A
          </Tooltip>
        </Circle>

        {/* Vehicle Markers */}
        {vehicles.map((vehicle) => {
          if (!vehicle.lastLocation) return null;
          const lat = parseFloat(vehicle.lastLocation.lat);
          const lng = parseFloat(vehicle.lastLocation.lng);
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker
              key={vehicle.id}
              position={[lat, lng]}
              icon={createVehicleIcon(vehicle.status, getShortLabel(vehicle.vehicleNumber))}
              eventHandlers={{ click: () => onVehicleClick?.(vehicle) }}
            >
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '160px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: isDark ? '#fff' : '#0f2d3d', marginBottom: '6px' }}>
                    {vehicle.vehicleNumber}
                  </div>
                  <div style={{ fontSize: '12px', color: isDark ? '#e2f1f7' : '#1b4a5e', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Status</span>
                    <span style={{ fontWeight: 600, color: vehicle.status === 'moving' ? '#34d8b5' : vehicle.status === 'idle' ? '#fbbf24' : '#f87171' }}>
                      {vehicle.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: isDark ? '#e2f1f7' : '#1b4a5e', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span>Speed</span>
                    <span style={{ fontWeight: 600 }}>{vehicle.lastLocation.speed || 0} km/h</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
