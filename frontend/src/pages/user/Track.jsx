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
    <div className="flex flex-col gap-5 animate-fadeIn">

      {/* ── Header row ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-[26px] font-bold text-lb-800 dark:text-white leading-tight">
            Live Tracking
          </h2>
          <p className="text-[13px] text-lb-500 mt-0.5">
            <i className="fa-solid fa-satellite-dish mr-1.5 text-lb-400" />
            Fleet command center · {liveTime}
          </p>
        </div>

        {/* status pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {['All', 'Moving', 'Idle', 'Stopped'].map(f => {
            const cfg = f === 'All' ? null : STATUS[f.toLowerCase()];
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-200 border ${
                  active
                    ? f === 'All'
                      ? 'bg-[rgba(61,122,138,0.18)] border-[rgba(61,122,138,0.4)] text-[#0f2d3d] dark:text-white'
                      : `border-[${cfg.color}55] text-[${cfg.text}]`
                    : 'bg-[rgba(255,255,255,0.6)] dark:bg-[rgba(20,42,54,0.55)] border-[rgba(61,122,138,0.18)] dark:border-[rgba(61,122,138,0.2)] text-[#3d7a8a] dark:text-[rgba(226,241,247,0.75)] hover:bg-[rgba(255,255,255,0.9)] dark:hover:bg-[rgba(20,42,54,0.8)]'
                }`}
                style={active && cfg ? { background: cfg.bg, color: cfg.text, borderColor: `${cfg.color}55` } : {}}
              >
                {cfg && <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: cfg.color, boxShadow: `0 0 5px ${cfg.color}` }} />}
                {f}
                <span className="ml-0.5 opacity-70">({statusCounts[f]})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main 2-column grid: sidebar + map ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-5">

        {/* ── LEFT: Vehicle List Panel ── */}
        <div className="glass-card flex flex-col overflow-hidden h-[640px] p-0">
          {/* Panel header */}
          <div className="px-4 pt-5 pb-4 border-b border-[rgba(61,122,138,0.12)]">
            <div className="text-[14px] font-bold text-lb-800 dark:text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-truck-fast text-lb-400" />
              Select Vehicle
              <span className="ml-auto text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[rgba(61,122,138,0.12)] text-[#3d7a8a] dark:text-white">
                {filtered.length} / {vehicles.length}
              </span>
            </div>

            {/* search */}
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-lb-400 z-10" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search vehicles…"
                className="input-field !pl-9 !py-2.5 text-[12px] w-full"
              />
            </div>
          </div>

          {/* Vehicle list */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {filtered.length === 0 && (
              <div className="py-16 text-center text-lb-400 text-sm opacity-60">
                <i className="fa-solid fa-satellite-dish text-4xl mb-4 block opacity-50" />
                No vehicles found for this filter.
              </div>
            )}
            {filtered.map(v => {
              const st   = getStatus(v);
              const isOn = selected === v.id;
              const tl   = telemetry[v.id] || {};
              return (
                <button
                  key={v.id}
                  onClick={() => setSelected(v.id)}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all duration-200 relative group overflow-hidden border ${
                    isOn 
                      ? 'bg-[rgba(52,216,181,0.06)] dark:bg-[rgba(52,216,181,0.08)] border-[#34d8b5] shadow-[0_4px_16px_rgba(52,216,181,0.15)]' 
                      : 'bg-[rgba(218,241,255,0.3)] dark:bg-[rgba(13,30,38,0.4)] border-[rgba(61,122,138,0.15)] hover:border-[#3d7a8a]'
                  }`}
                >
                  {/* active left bar */}
                  {isOn && (
                    <div className="absolute left-0 top-3 bottom-3 w-[4px] rounded-r-full"
                      style={{ background: `linear-gradient(180deg, ${st.color}, ${st.color}88)` }} />
                  )}

                  <div className="flex items-start gap-3">
                    {/* icon */}
                    <div className="w-10 h-10 rounded-[14px] flex-shrink-0 flex items-center justify-center text-[15px] mt-0.5 shadow-sm"
                      style={{ background: st.bg, color: st.text }}>
                      <i className={`fa-solid ${st.icon}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-[14px] font-bold truncate ${isOn ? 'text-lb-800 dark:text-white' : 'text-lb-700 dark:text-[rgba(226,241,247,0.85)]'}`}>{v.vehicleNumber}</span>
                        {/* status badge */}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 uppercase tracking-wide"
                          style={{ background: st.bg, color: st.text }}>
                          {st.label}
                        </span>
                      </div>
                      <div className="text-[12px] text-lb-500 truncate mb-2 font-medium">{v.make} {v.model}</div>

                      {/* mini telemetry row */}
                      <div className="flex items-center gap-3.5 text-[11px] font-semibold text-lb-600 dark:text-lb-400">
                        <span className="flex items-center gap-1.5">
                          <i className="fa-solid fa-gauge-high" style={{ color: st.color }} />
                          {tl.speed ?? 0} km/h
                        </span>
                        <span className="flex items-center gap-1.5">
                          <i className="fa-solid fa-gas-pump" style={{
                            color: (tl.fuel ?? 50) < 25 ? '#f87171' : (tl.fuel ?? 50) < 50 ? '#fbbf24' : '#34d8b5'
                          }} />
                          {tl.fuel ?? '--'}%
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Map + Details ── */}
        <div className="flex flex-col gap-5">

          {/* Map container */}
          <div className="glass-card flex-1 p-0 overflow-hidden relative h-[460px]">
            {/* Map header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-3.5 bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(13,30,38,0.85)] backdrop-blur-md border-b border-[rgba(61,122,138,0.15)] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[13px] bg-gradient-to-br from-[#3d7a8a] to-[#1b4a5e] text-white shadow-md">
                  <i className="fa-solid fa-satellite-dish" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-lb-800 dark:text-white leading-tight">
                    {activeVehicle
                      ? `${activeVehicle.vehicleNumber} — ${activeVehicle.make} ${activeVehicle.model}`
                      : 'Live Command Center'}
                  </div>
                  {activeVehicle && (
                    <div className="text-[11px] font-medium text-lb-500 mt-0.5">
                      <i className="fa-solid fa-location-dot mr-1"></i>
                      {activeVehicle.last_location?.address || 'Telangana, India'}
                    </div>
                  )}
                </div>
              </div>

              {activeVehicle && (
                <div className="flex items-center gap-2">
                  {/* ignition indicator */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider"
                    style={{
                      background: tel.ignition ? 'rgba(52,216,181,0.14)' : 'rgba(248,113,113,0.12)',
                      border: `1px solid ${tel.ignition ? 'rgba(52,216,181,0.4)' : 'rgba(248,113,113,0.3)'}`,
                      color: tel.ignition ? '#0a8f78' : '#b91c1c',
                    }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: tel.ignition ? '#34d8b5' : '#f87171' }} />
                    {tel.ignition ? 'Ignition ON' : 'Ignition OFF'}
                  </div>

                  {/* status badge */}
                  {(() => { const st = getStatus(activeVehicle); return (
                    <div className="px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-sm"
                      style={{ background: st.bg, color: st.text, border: `1px solid ${st.color}55` }}>
                      {st.label}
                    </div>
                  ); })()}
                </div>
              )}
            </div>

            {/* Leaflet map */}
            <div style={{ paddingTop: '60px', height: '100%' }}>
              <LiveMap
                vehicles={activeVehicle ? [activeVehicle] : vehicles}
                selectedVehicle={selected}
                onVehicleClick={v => setSelected(v?.id || v)}
                height="100%"
              />
            </div>
          </div>

          {/* ── Telemetry strip ── */}
          {activeVehicle && (
            <div className="glass-card px-6 py-5 animate-fadeIn">
              <div className="text-[14px] font-bold text-lb-800 dark:text-white mb-4 flex items-center gap-2">
                <i className="fa-solid fa-microchip text-lb-400" />
                Live Telemetry
                <span className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-[#0a8f78] bg-[rgba(52,216,181,0.15)] px-2.5 py-1 rounded-full border border-[rgba(52,216,181,0.3)] shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#34d8b5]" />
                  LIVE
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {[
                  { label: 'Speed',     value: `${tel.speed ?? 0}`,   unit: 'km/h',  icon: 'fa-gauge-high',       color: '#3d7a8a', spark: [40,45,38,52,tel.speed??0,48,tel.speed??0] },
                  { label: 'Fuel',      value: `${tel.fuel ?? '--'}`, unit: '%',     icon: 'fa-gas-pump',
                    color: (tel.fuel??50) < 25 ? '#f87171' : (tel.fuel??50) < 50 ? '#fbbf24' : '#34d8b5',
                    spark: [80,75,70,65,tel.fuel??50,tel.fuel??50,tel.fuel??50] },
                  { label: 'Engine',    value: `${tel.engine_temp ?? '--'}`, unit: '°C', icon: 'fa-temperature-high', color: '#fbbf24', spark: [85,88,90,92,tel.engine_temp??90,88,tel.engine_temp??90] },
                  { label: 'Battery',   value: `${tel.battery ?? '--'}`, unit: 'V',  icon: 'fa-battery-three-quarters', color: '#34d8b5', spark: [12.5,12.6,12.4,12.7,tel.battery??12.5,12.6,tel.battery??12.5] },
                  { label: 'Satellites',value: `${tel.satellites ?? '--'}`, unit: '',icon: 'fa-satellite',          color: '#5a9baa', spark: [9,10,9,11,tel.satellites??10,10,tel.satellites??10] },
                  { label: 'Signal',    value: `${tel.signal ?? '--'}`, unit: '%',   icon: 'fa-signal',             color: '#3d7a8a', spark: [70,75,72,80,tel.signal??75,78,tel.signal??75] },
                ].map(item => (
                  <div key={item.label}
                    className="rounded-2xl p-4 flex flex-col transition-all duration-300 hover:-translate-y-1 bg-[rgba(218,241,255,0.3)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px]" style={{ background: `${item.color}15`, color: item.color }}>
                        <i className={`fa-solid ${item.icon}`} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-lb-500">{item.label}</span>
                    </div>
                    <div className="font-display text-[22px] font-bold leading-none text-lb-800 dark:text-white mb-2">
                      {item.value}
                      <span className="text-[11px] font-medium text-lb-500 ml-1">{item.unit}</span>
                    </div>
                    <div className="h-6 w-full opacity-80">
                      <Spark data={item.spark} color={item.color} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom detail cards row ── */}
      {activeVehicle && (
        <div className="glass-card p-6 animate-fadeIn mb-10">
          <div className="text-[14px] font-bold text-lb-800 dark:text-white mb-5 flex items-center gap-2">
            <i className="fa-solid fa-circle-info text-lb-400" />
            Vehicle Properties & Status
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: 'Make / Model',  value: `${activeVehicle.make || '--'} ${activeVehicle.model || ''}`, icon: 'fa-truck'           },
              { label: 'Type',          value: activeVehicle.type || '--',                                   icon: 'fa-tag'             },
              { label: 'Fuel Type',     value: (activeVehicle.fuel_type || 'diesel').toUpperCase(),          icon: 'fa-gas-pump'        },
              { label: 'Capacity',      value: activeVehicle.capacity ? `${activeVehicle.capacity.toLocaleString()} kg` : '--', icon: 'fa-weight-hanging' },
              { label: 'Odometer',      value: `${(tel.odometer || 0).toLocaleString('en-IN')} km`,          icon: 'fa-road'            },
              { label: 'Heading',       value: `${tel.heading ?? '--'}°`,                                    icon: 'fa-compass'         },
              { label: 'Org',           value: activeVehicle.org_id || '--',                                 icon: 'fa-building'        },
              { label: 'Status',        value: getStatus(activeVehicle).label,
                color: getStatus(activeVehicle).color,                                                       icon: 'fa-circle-dot'      },
            ].map(item => (
              <div
                key={item.label}
                className="detail-row rounded-[14px] p-4 flex flex-col gap-1.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.3)] border border-[rgba(61,122,138,0.1)]"
              >
                <div className="flex items-center gap-1.5 text-lb-500 text-[10px] font-bold uppercase tracking-widest">
                  <i className={`fa-solid ${item.icon} text-lb-400 text-[10px]`} />
                  {item.label}
                </div>
                <div
                  className="text-[14px] font-bold text-lb-800 dark:text-white truncate"
                  style={item.color ? { color: item.color } : {}}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

