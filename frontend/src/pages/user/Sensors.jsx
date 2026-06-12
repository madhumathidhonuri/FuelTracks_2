import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import DateRangePicker from '../../components/common/DateRangePicker';
import ExportButtons from '../../components/common/ExportButtons';

const Sensors = () => {
  const sensorData = Array.from({ length: 15 }, (_, i) => ({ id: i + 1, timestamp: new Date(Date.now() - i * 3600000).toLocaleString(), vehicle: ['VH-001', 'VH-002', 'VH-003'][i % 3], engineTemp: Math.floor(Math.random() * 40 + 70), battery: (Math.random() * 2 + 11.5).toFixed(1), fuel: Math.floor(Math.random() * 60 + 20), rpm: Math.floor(Math.random() * 3000 + 800), odometer: Math.floor(Math.random() * 50000 + 10000) }));
  const columns = [{ key: 'timestamp', label: 'Timestamp' }, { key: 'vehicle', label: 'Vehicle' }, { key: 'engineTemp', label: 'Engine Temp (°C)' }, { key: 'battery', label: 'Battery (V)' }, { key: 'fuel', label: 'Fuel (%)' }, { key: 'rpm', label: 'RPM' }, { key: 'odometer', label: 'Odometer (km)' }];
  return (
    <div className="space-y-6 animate-fadeIn">
      <Card><div className="flex items-center justify-between flex-wrap gap-4"><h3 className="font-semibold text-sm text-text-primary font-display">Sensor Data</h3><div className="flex items-center gap-4"><DateRangePicker onChange={() => {}} /><ExportButtons onExport={(format) => console.log('Export sensors', format)} /></div></div></Card>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'Avg Engine Temp', value: '85°C', status: 'normal' }, { label: 'Battery Health', value: '97%', status: 'good' }, { label: 'Avg Fuel Level', value: '42%', status: 'warning' }, { label: 'Active Sensors', value: '24', status: 'normal' }].map((stat) => (<Card key={stat.label}><p className="text-[10px] uppercase tracking-widest text-muted mb-1">{stat.label}</p><p className="text-xl font-bold text-text-primary font-display">{stat.value}</p><div className="flex items-center gap-1.5 mt-2"><span className={`w-1.5 h-1.5 rounded-full ${stat.status === 'good' ? 'bg-[#34d8b5]' : stat.status === 'warning' ? 'bg-[#fbbf24]' : 'bg-accent'}`} /><span className="text-[10px] capitalize text-muted">{stat.status}</span></div></Card>))}
      </div>
      <Card><Table columns={columns} data={sensorData} emptyMessage="No sensor data available" /></Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><h3 className="font-semibold text-sm text-text-primary font-display mb-4">Engine Temperature</h3><div className="space-y-3">{['VH-001', 'VH-002', 'VH-003', 'VH-004'].map((v) => { const temp = Math.floor(Math.random() * 30 + 70); return (<div key={v} className="flex items-center gap-4"><span className="text-xs font-medium text-text-primary w-14">{v}</span><div className="flex-1 h-2 bg-lb-50 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${temp > 95 ? 'bg-coral' : temp > 90 ? 'bg-[#fbbf24]' : 'bg-[#34d8b5]'}`} style={{ width: `${(temp / 120) * 100}%` }} /></div><span className="text-xs font-semibold text-text-primary w-10">{temp}°C</span></div>); })}</div></Card>
        <Card><h3 className="font-semibold text-sm text-text-primary font-display mb-4">Fuel Level</h3><div className="space-y-3">{['VH-001', 'VH-002', 'VH-003', 'VH-004'].map((v) => { const fuel = Math.floor(Math.random() * 60 + 20); return (<div key={v} className="flex items-center gap-4"><span className="text-xs font-medium text-text-primary w-14">{v}</span><div className="flex-1 h-2 bg-lb-50 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all fuel-bar ${fuel < 25 ? 'bg-coral' : fuel < 40 ? 'bg-[#fbbf24]' : 'bg-[#34d8b5]'}`} style={{ width: `${fuel}%` }} /></div><span className="text-xs font-semibold text-text-primary w-10">{fuel}%</span></div>); })}</div></Card>
      </div>
    </div>
  );
};
export default Sensors;
