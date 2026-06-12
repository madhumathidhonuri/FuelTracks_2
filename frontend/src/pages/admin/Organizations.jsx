import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';

const Organizations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const data = [{ id: 1, name: 'Metro Logistics Pvt Ltd', plan: 'Enterprise', vehicles: 45, users: 12, status: 'active' }, { id: 2, name: 'Swift Transport Co', plan: 'Professional', vehicles: 28, users: 8, status: 'active' }, { id: 3, name: 'Express Cargo Services', plan: 'Enterprise', vehicles: 62, users: 18, status: 'active' }];
  const filtered = data.filter((o) => o.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const columns = [{ key: 'name', label: 'Organization' }, { key: 'plan', label: 'Plan' }, { key: 'vehicles', label: 'Vehicles' }, { key: 'users', label: 'Users' }, { key: 'status', label: 'Status', render: (v) => <Badge variant={v}>{v}</Badge> }, { key: 'actions', label: 'Actions', render: () => <Link to="#" className="px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors">View</Link> }];
  return (<div className="space-y-6 animate-fadeIn"><Card><div className="flex items-center justify-between flex-wrap gap-4"><h3 className="font-semibold text-sm text-text-primary font-display">Organizations</h3><div className="flex items-center gap-4"><SearchBar placeholder="Search..." onSearch={setSearchQuery} className="w-64" /><Link to="/admin/organizations/add" className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Add Organization</Link></div></div></Card><Card><Table columns={columns} data={filtered} emptyMessage="No organizations found" /></Card></div>);
};
export default Organizations;
