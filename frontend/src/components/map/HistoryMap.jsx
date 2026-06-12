import { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from '../../context/ThemeContext';
import 'leaflet/dist/leaflet.css';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png', iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png' });

const startIcon = L.divIcon({ className: 'custom-marker', html: `<div style="width:16px;height:16px;background:#34d8b5;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(52,216,181,0.5);"></div>`, iconSize: [16, 16], iconAnchor: [8, 8] });
const endIcon = L.divIcon({ className: 'custom-marker', html: `<div style="width:16px;height:16px;background:#f87171;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(248,113,113,0.5);"></div>`, iconSize: [16, 16], iconAnchor: [8, 8] });
const stopIcon = L.divIcon({ className: 'custom-marker', html: `<div style="width:12px;height:12px;background:#fbbf24;border-radius:50%;border:2px solid white;"></div>`, iconSize: [12, 12], iconAnchor: [6, 6] });

const HistoryMap = ({ route = [], stops = [], className = '', height = '460px' }) => {
  const { isDark, mapTileUrl } = useTheme();
  const [mapReady, setMapReady] = useState(false);
  if (!route || route.length === 0) return (
    <div className={`relative overflow-hidden rounded-2xl border border-[rgba(56,175,249,0.25)] flex items-center justify-center ${className}`} style={{ height }}>
      <div className="text-center"><svg className="w-12 h-12 mx-auto text-[rgba(56,175,249,0.3)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg><p className="text-sm text-muted">No route data available</p></div>
    </div>
  );
  const positions = route.map((p) => [p.lat, p.lng]);
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[rgba(56,175,249,0.25)] ${className}`} style={{ height }}>
      <MapContainer center={positions[0] || [20.5937, 78.9629]} zoom={13} className="w-full h-full" style={{ background: isDark ? '#0a0d12' : '#e8f5fe' }} whenReady={() => setMapReady(true)}>
        <TileLayer url={mapTileUrl} attribution='&copy; OpenStreetMap' />
        <Polyline positions={positions} color={isDark ? '#38aff9' : '#0e96eb'} weight={4} opacity={0.8} />
        {route.length > 0 && <Marker position={[route[0].lat, route[0].lng]} icon={startIcon}><Popup><div className="p-2"><p className="font-semibold text-sm">Start Point</p><p className="text-xs text-muted">{new Date(route[0].timestamp).toLocaleString()}</p></div></Popup></Marker>}
        {route.length > 1 && <Marker position={[route[route.length - 1].lat, route[route.length - 1].lng]} icon={endIcon}><Popup><div className="p-2"><p className="font-semibold text-sm">End Point</p><p className="text-xs text-muted">{new Date(route[route.length - 1].timestamp).toLocaleString()}</p></div></Popup></Marker>}
        {stops?.map((stop, idx) => <Marker key={idx} position={[stop.lat, stop.lng]} icon={stopIcon}><Popup><div className="p-2"><p className="font-semibold text-sm">Stop #{idx + 1}</p><p className="text-xs text-muted">Duration: {stop.duration || 'N/A'}</p></div></Popup></Marker>)}
      </MapContainer>
      <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow p-3 z-[1000]">
        <div className="flex flex-col gap-2">{[{ c: '#34d8b5', l: 'Start' }, { c: '#f87171', l: 'End' }, { c: '#fbbf24', l: 'Stop' }].map(({ c, l }) => (<div key={l} className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: c }} /><span className="text-[10px] text-text-primary">{l}</span></div>))}</div>
      </div>
    </div>
  );
};
export default HistoryMap;
