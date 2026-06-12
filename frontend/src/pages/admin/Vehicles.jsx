import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';

const Vehicles = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const data = [{ id: 1, name: 'Truck Alpha-1', vehicleNumber: 'MH12AB1234', type: 'Truck', status: 'moving', group: 'North Fleet', speed: '52 km/h' }, { id: 2, name: 'Truck Beta-2', vehicleNumber: 'DL01CD5678', type: 'Truck', status: 'idle', group: 'South Fleet', speed: '0 km/h' }, { id: 3, name: 'Van Gamma-3', vehicleNumber: 'KA05EF9012', type: 'Van', status: 'stopped', group: 'Express Route', speed: '0 km/h' }];
  const filtered = data.filter((v) => { const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()); const matchesStatus = statusFilter === 'all' || v.status === statusFilter; return matchesSearch && matchesStatus; });
  const statusCounts = { all: data.length, moving: data.filter((v) => v.status === 'moving').length, idle: data.filter((v) => v.status === 'idle').length, stopped: data.filter((v) => v.status === 'stopped').length };
  const columns = [{ key: 'name', label: 'Vehicle Name' }, { key: 'vehicleNumber', label: 'Number' }, { key: 'type', label: 'Type' }, { key: 'status', label: 'Status', render: (v) => <Badge variant={v}>{v}</Badge> }, { key: 'group', label: 'Group' }, { key: 'speed', label: 'Speed' }, { key: 'actions', label: 'Actions', render: () => <Link to="#" className="text-accent hover:underline text-xs font-medium">View</Link> }];

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card><div className="flex items-center justify-between flex-wrap gap-4"><h3 className="font-semibold text-sm text-text-primary font-display">Vehicles</h3><div className="flex items-center gap-4"><SearchBar placeholder="Search vehicles..." onSearch={setSearchQuery} className="w-64" /><div className="flex gap-2">{['all', 'moving', 'idle', 'stopped'].map((s) => (<button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${statusFilter === s ? 'bg-accent text-white' : 'bg-lb-50 text-muted hover:bg-[rgba(56,175,249,0.06)]'}`}>{s} {statusCounts[s]}</button>))}</div><Link to="/admin/vehicles/add" className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Add Vehicle</Link></div></div></Card>
      <Card><Table columns={columns} data={filtered} emptyMessage="No vehicles found" /></Card>
    </div>
  );
};
export default Vehicles;
