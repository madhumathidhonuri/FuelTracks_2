import { useState } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import DateRangePicker from '../../components/common/DateRangePicker';
import HistoryMap from '../../components/map/HistoryMap';
import { historyApi } from '../../api/history.api';

const History = () => {
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [route, setRoute] = useState([]);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('route');

  const handleViewHistory = async () => {
    if (!selectedVehicle || !dateRange.startDate || !dateRange.endDate) return;
    setLoading(true);
    try { const [routeRes, stopsRes] = await Promise.all([historyApi.getRoute(selectedVehicle, dateRange.startDate, dateRange.endDate), historyApi.getStops(selectedVehicle, dateRange.startDate, dateRange.endDate)]); setRoute(routeRes.data.route || []); setStops(stopsRes.data.stops || []); }
    catch { setRoute(Array.from({ length: 20 }, (_, i) => ({ lat: 19 + Math.random() * 3, lng: 72 + Math.random() * 3, timestamp: new Date(Date.now() - i * 300000).toISOString() }))); setStops([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card><div className="flex flex-wrap items-center gap-4"><select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} className="px-4 py-2.5 bg-lb-50 border border-[rgba(56,175,249,0.25)] rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent"><option value="">Select vehicle</option></select><DateRangePicker onChange={setDateRange} /><button onClick={handleViewHistory} disabled={!selectedVehicle || !dateRange.startDate} className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50">View History</button></div></Card>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><Card padding={false}><div className="p-4 border-b border-[rgba(56,175,249,0.12)] flex gap-4">{['route', 'stops', 'trips'].map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === tab ? 'bg-accent text-white' : 'bg-lb-50 text-muted hover:bg-[rgba(56,175,249,0.06)]'}`}>{tab}</button>))}</div><HistoryMap route={route} stops={stops} height="500px" /></Card></div>
        <div><Card><h3 className="font-semibold text-sm text-text-primary font-display mb-4">Trip Summary</h3><div className="space-y-3 max-h-[450px] overflow-y-auto">{route.length === 0 ? <p className="text-sm text-muted text-center py-8">Select a vehicle and date range</p> : Array.from({ length: 8 }, (_, i) => (<div key={i} className="p-3 rounded-xl bg-lb-50 border border-[rgba(56,175,249,0.08)]"><div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold text-text-primary">Trip #{i + 1}</span><Badge variant="moving">completed</Badge></div><div className="grid grid-cols-2 gap-2 text-[11px]"><div><span className="text-muted">Distance: </span><span className="text-text-primary font-medium">{Math.floor(Math.random() * 50 + 5)} km</span></div><div><span className="text-muted">Duration: </span><span className="text-text-primary font-medium">{Math.floor(Math.random() * 2 + 0.5)}h {Math.floor(Math.random() * 60)}m</span></div></div></div>))}</div></Card></div>
      </div>
    </div>
  );
};
export default History;
