import { useState } from 'react';
import Card from '../../components/common/Card';
import DateRangePicker from '../../components/common/DateRangePicker';
import ExportButtons from '../../components/common/ExportButtons';
import Table from '../../components/common/Table';
import { reportsApi } from '../../api/reports.api';

const Reports = () => {
  const [reportType, setReportType] = useState('consolidated');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const reportTypes = [{ value: 'consolidated', label: 'Consolidated Report' }, { value: 'overspeed', label: 'Overspeed Report' }, { value: 'stoppage', label: 'Stoppage Report' }, { value: 'trip-history', label: 'Trip History' }];
  const columns = { consolidated: [{ key: 'date', label: 'Date' }, { key: 'vehicle', label: 'Vehicle' }, { key: 'distance', label: 'Distance (km)' }, { key: 'avgSpeed', label: 'Avg Speed' }, { key: 'idleTime', label: 'Idle Time' }, { key: 'fuelUsed', label: 'Fuel (L)' }], overspeed: [{ key: 'timestamp', label: 'Time' }, { key: 'vehicle', label: 'Vehicle' }, { key: 'speed', label: 'Speed (km/h)' }, { key: 'limit', label: 'Limit' }] };
  const mockData = () => Array.from({ length: 10 }, (_, i) => ({ id: i + 1, date: new Date(Date.now() - i * 86400000).toLocaleDateString(), vehicle: ['MH12AB1234', 'DL01CD5678', 'KA05EF9012'][i % 3], distance: Math.floor(Math.random() * 200 + 50), avgSpeed: Math.floor(Math.random() * 60 + 30), idleTime: `${Math.floor(Math.random() * 60)} min`, fuelUsed: (Math.random() * 30 + 10).toFixed(1) }));
  const handleGenerateReport = async () => { setLoading(true); try { const res = await reportsApi.getConsolidated(dateRange); setData(res.data.data || mockData()); } catch { setData(mockData()); } finally { setLoading(false); } };

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card><div className="flex flex-wrap items-end gap-4"><div className="flex-1 min-w-[200px]"><label className="text-[11px] font-medium uppercase tracking-widest text-muted block mb-2">Report Type</label><select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full px-4 py-2.5 bg-lb-50 border border-[rgba(56,175,249,0.25)] rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent">{reportTypes.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div><DateRangePicker onChange={setDateRange} /><button onClick={handleGenerateReport} className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors">Generate Report</button></div></Card>
      <Card><div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-sm text-text-primary font-display capitalize">{reportType.replace('-', ' ')} Report</h3><ExportButtons onExport={(format) => console.log('Export', format)} /></div>{loading ? <div className="h-64 flex items-center justify-center"><svg className="w-8 h-8 animate-spin text-accent" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div> : <Table columns={columns[reportType] || columns.consolidated} data={data} emptyMessage="Generate a report to see data" />}</Card>
    </div>
  );
};
export default Reports;
