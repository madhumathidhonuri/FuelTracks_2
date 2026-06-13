import { useState, useEffect, useRef } from 'react';
import LiveMap from '../../components/map/LiveMap';
import { vehiclesApi } from '../../api/vehicles.api';

/* ─── tiny SVG sparkline ──────────────────────────────────────────────────── */
const Spark = ({ data = [], color = '#34d8b5' }) => {
  if (!data.length) return null;
  const W = 80, H = 28;
  const min = Math.min(...data), max = Math.max(...data), r = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / r) * (H - 4) - 2}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" points={pts} />
      <polygon fill={`${color}18`} points={`0,${H} ${pts} ${W},${H}`} />
    </svg>
  );
};

/* ─── status config ──────────────────────────────────────────────────────── */
const STATUS = {
  moving:  { color: '#34d8b5', bg: 'rgba(52,216,181,0.14)', text: '#0a8f78', icon: 'fa-truck',       label: 'Moving'  },
  idle:    { color: '#fbbf24', bg: 'rgba(251,191,36,0.14)',  text: '#92650a', icon: 'fa-van-shuttle', label: 'Idle'    },
  stopped: { color: '#f87171', bg: 'rgba(248,113,113,0.14)', text: '#b91c1c', icon: 'fa-car',         label: 'Stopped' },
};

const getStatus = (v) => {
  const s = v.current_status || v.status || 'stopped';
  return STATUS[s] || STATUS.stopped;
};

/* ─── mock live telemetry per vehicle ────────────────────────────────────── */
function mockTelemetry(v) {
  const seed = (v.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    speed:      v.last_location?.speed ?? (v.current_status === 'moving' ? 40 + (seed % 50) : 0),
    fuel:       v.fuel_level ?? (20 + (seed % 75)),
    engine_temp:80 + (seed % 30),
    battery:    +(12.2 + ((seed % 8) / 10)).toFixed(1),
    satellites: 8 + (seed % 6),
    signal:     65 + (seed % 35),
    odometer:   v.odometer ?? (50000 + seed * 17 % 90000),
    heading:    v.last_location?.heading ?? (seed % 360),
    ignition:   v.current_status !== 'stopped',
  };
}

/* ─── Track page ─────────────────────────────────────────────────────────── */
export default function Track() {
  const [vehicles,  setVehicles]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('All');
  const [telemetry, setTelemetry] = useState({});
  const [liveTime,  setLiveTime]  = useState('');
  const tickRef = useRef(null);

  /* live clock */
  useEffect(() => {
    const tick = () => setLiveTime(new Date().toLocaleTimeString('en-IN'));
    tick(); tickRef.current = setInterval(tick, 1000);
    return () => clearInterval(tickRef.current);
  }, []);

  /* load vehicles */
  useEffect(() => {
    vehiclesApi.list({ limit: 1000 })
      .then((res) => {
        const list = (Array.isArray(res) ? res : res?.data || []).map(v => ({
          ...v,
          vehicleNumber: v.registration_number || v.vehicleNumber,
          name: v.vehicle_name || v.name || v.registration_number,
          lastLocation: v.last_location ?? null,
        }));
        setVehicles(list);
        if (list.length) {
          setSelected(list[0].id);
          const tel = {};
          list.forEach(v => { tel[v.id] = mockTelemetry(v); });
          setTelemetry(tel);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* filter helpers */
  const filtered = vehicles.filter(v => {
    const matchSearch = (v.name || '').toLowerCase().includes(search.toLowerCase()) ||
                        (v.vehicleNumber || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || (v.current_status || v.status) === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  const activeVehicle = vehicles.find(v => v.id === selected);
  const tel = selected ? (telemetry[selected] || {}) : {};

  const statusCounts = {
    All:     vehicles.length,
    Moving:  vehicles.filter(v => (v.current_status || v.status) === 'moving').length,
    Idle:    vehicles.filter(v => (v.current_status || v.status) === 'idle').length,
    Stopped: vehicles.filter(v => (v.current_status || v.status) === 'stopped').length,
  };

  /* ── Loading skeleton ── */
  if (loading) return (
    <div className="space-y-5 animate-fadeIn">
      <div className="h-10 w-72 bg-lb-100 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-5">
        <div className="h-[640px] bg-lb-100 rounded-3xl animate-pulse" />
        <div className="h-[640px] bg-lb-100 rounded-3xl animate-pulse" />
      </div>
    </div>
  );

  /* ── Render ── */
  return (
    <div className="flex w-full animate-fadeIn" style={{ height: 'calc(100vh - 100px)' }}>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_120px] w-full h-full gap-4">

        {/* ── LEFT: Vehicle List Panel ── */}
        <div className="glass-card flex flex-col overflow-hidden h-full p-0 shadow-md">
          {/* Panel header & Search */}
          <div className="px-3 pt-4 pb-3 border-b border-[rgba(61,122,138,0.12)]">
            <div className="flex items-center gap-2 mb-3 relative">
              <div className="relative flex-1">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-lb-400 z-10" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="input-field !pl-8 !py-2 !h-9 text-[12px] w-full"
                />
              </div>
              <div className="relative">
                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="input-field !py-2 !h-9 text-[12px] pr-7 font-semibold cursor-pointer appearance-none bg-[rgba(255,255,255,0.6)] dark:bg-[rgba(20,42,54,0.55)] border-[rgba(61,122,138,0.2)]"
                >
                  <option value="All">All ({statusCounts.All})</option>
                  <option value="Moving">Moving</option>
                  <option value="Idle">Idle</option>
                  <option value="Stopped">Stopped</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-lb-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Vehicle list */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5 custom-scrollbar">
            {filtered.length === 0 && (
              <div className="py-10 text-center text-lb-400 text-xs opacity-70">
                No vehicles found.
              </div>
            )}
            {filtered.map(v => {
              const st   = getStatus(v);
              const isOn = selected === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelected(v.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 relative group border ${
                    isOn 
                      ? 'bg-[rgba(52,216,181,0.08)] dark:bg-[rgba(52,216,181,0.12)] border-[#34d8b5] shadow-sm' 
                      : 'bg-transparent border-transparent hover:bg-[rgba(61,122,138,0.05)] hover:border-[rgba(61,122,138,0.1)]'
                  }`}
                >
                  {isOn && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                      style={{ background: st.color }} />
                  )}

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[13px]"
                      style={{ color: st.color }}>
                      <i className={`fa-solid ${st.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-bold truncate mb-0.5" style={{ color: isOn ? '#0a8f78' : '' }}>
                        <span className="dark:text-white">{v.vehicleNumber}</span>
                      </div>
                      <div className="text-[10px] text-lb-500 truncate">{v.make || 'Vehicle'} {v.model}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── CENTER: Map Container ── */}
        <div className="glass-card flex-1 p-0 overflow-hidden relative shadow-md flex flex-col h-full rounded-[24px]">
          
          {/* Floating Header Overlay */}
          <div className="absolute top-4 left-4 right-4 z-[400] pointer-events-none">
            <div className="bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(13,30,38,0.85)] backdrop-blur-md border border-[rgba(61,122,138,0.2)] shadow-lg rounded-2xl p-3 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[14px] bg-gradient-to-br from-[#3d7a8a] to-[#1b4a5e] text-white shadow-md">
                  <i className="fa-solid fa-satellite-dish" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-lb-800 dark:text-white leading-tight">
                    {activeVehicle ? `${activeVehicle.vehicleNumber}` : 'Live Tracking Map'}
                  </div>
                  <div className="text-[11px] font-medium text-lb-500 mt-0.5">
                    {activeVehicle ? activeVehicle.last_location?.address || 'Location Unknown' : `Live time: ${liveTime}`}
                  </div>
                </div>
              </div>

              {activeVehicle && (
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: tel.ignition ? 'rgba(52,216,181,0.15)' : 'rgba(248,113,113,0.15)',
                      color: tel.ignition ? '#0a8f78' : '#b91c1c',
                    }}>
                    <i className={`fa-solid fa-power-off mr-1.5 ${tel.ignition ? 'animate-pulse' : ''}`} />
                    {tel.ignition ? 'IGN ON' : 'IGN OFF'}
                  </div>
                  {(() => { const st = getStatus(activeVehicle); return (
                    <div className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: st.color, color: '#fff' }}>
                      {st.label}
                    </div>
                  ); })()}
                </div>
              )}
            </div>
          </div>

          {/* Leaflet map */}
          <div className="flex-1 w-full h-full relative z-[100]">
            <LiveMap
              vehicles={activeVehicle ? [activeVehicle] : vehicles}
              selectedVehicle={selected}
              onVehicleClick={v => setSelected(v?.id || v)}
              height="100%"
            />
          </div>

          {/* Floating Telemetry Drawer */}
          {activeVehicle && (
            <div className="absolute bottom-4 left-4 right-4 z-[400] pointer-events-none">
              <div className="bg-[rgba(255,255,255,0.92)] dark:bg-[rgba(13,30,38,0.92)] backdrop-blur-xl border border-[rgba(61,122,138,0.25)] shadow-xl rounded-2xl p-3 pointer-events-auto">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { label: 'Speed',     value: `${tel.speed ?? 0}`,   unit: 'km/h',  icon: 'fa-gauge-high',       color: '#3d7a8a' },
                    { label: 'Fuel',      value: `${tel.fuel ?? '--'}`, unit: '%',     icon: 'fa-gas-pump',         color: (tel.fuel??50) < 25 ? '#f87171' : (tel.fuel??50) < 50 ? '#fbbf24' : '#34d8b5' },
                    { label: 'Engine',    value: `${tel.engine_temp ?? '--'}`, unit: '°C', icon: 'fa-temperature-high', color: '#fbbf24' },
                    { label: 'Battery',   value: `${tel.battery ?? '--'}`, unit: 'V',  icon: 'fa-battery-three-quarters', color: '#34d8b5' },
                    { label: 'Odometer',  value: `${tel.odometer ? (tel.odometer/1000).toFixed(1) : '--'}`, unit: 'K km', icon: 'fa-road', color: '#5a9baa' },
                    { label: 'Signal',    value: `${tel.signal ?? '--'}`, unit: '%',   icon: 'fa-signal',             color: '#3d7a8a' },
                  ].map(item => (
                    <div key={item.label} className="bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(20,42,54,0.6)] rounded-xl p-2.5 flex flex-col justify-center items-center text-center border border-[rgba(61,122,138,0.1)] transition-transform hover:-translate-y-1 cursor-default">
                      <div className="text-[14px] font-bold text-lb-800 dark:text-white mb-0.5">
                        {item.value}<span className="text-[9px] text-lb-500 ml-0.5 font-semibold">{item.unit}</span>
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-lb-500 flex items-center gap-1.5" style={{ color: item.color }}>
                        <i className={`fa-solid ${item.icon}`} /> {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Current Status Vertical Panel ── */}
        <div className="bg-[#1e2a31] dark:bg-[#0b1418] rounded-[24px] overflow-hidden flex flex-col h-full shadow-lg border border-[rgba(61,122,138,0.3)]">
          <div className="bg-[rgba(255,255,255,0.05)] py-3 px-2 text-center border-b border-[rgba(255,255,255,0.05)] text-[11px] font-bold text-white uppercase tracking-wider">
            Current Status
          </div>
          
          <div className="flex-1 flex flex-col">
            {[
              { id: 'Moving',  label: 'Running', count: statusCounts.Moving,  color: '#34d8b5' },
              { id: 'Idle',    label: 'Idle',    count: statusCounts.Idle,    color: '#fbbf24' },
              { id: 'Stopped', label: 'Parked',  count: statusCounts.Stopped, color: '#9ca3af' },
              { id: 'No Data', label: 'No Data', count: 0,                    color: '#f87171' },
            ].map(st => (
              <div key={st.id} className="flex-1 flex flex-col items-center justify-center border-b border-[rgba(255,255,255,0.04)] cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <div className="text-[10px] font-semibold text-gray-400 mb-1">{st.label}</div>
                <div className="text-[20px] font-display font-bold" style={{ color: st.color }}>
                  {st.count}
                </div>
              </div>
            ))}
            
            <div className="flex-1 bg-white dark:bg-[#1a2b33] flex flex-col items-center justify-center cursor-pointer">
              <div className="text-[11px] font-bold text-lb-800 dark:text-gray-300 mb-1 uppercase tracking-widest">Total</div>
              <div className="text-[24px] font-display font-bold text-[#3d7a8a] dark:text-[#5a9baa]">
                {statusCounts.All}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

