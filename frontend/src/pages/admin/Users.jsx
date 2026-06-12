import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const data = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@metro.com', role: 'admin', phone: '+91 98765 43210', status: 'active', lastLogin: '10 min ago' },
    { id: 2, name: 'Priya Sharma', email: 'priya@swift.com', role: 'user', phone: '+91 87654 32109', status: 'active', lastLogin: '2 hours ago' },
    { id: 3, name: 'Amit Patel', email: 'amit@express.com', role: 'admin', phone: '+91 76543 21098', status: 'active', lastLogin: '1 day ago' },
  ];
  const filtered = data.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));
  const columns = [{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role', render: (v) => <Badge variant={v === 'admin' ? 'info' : 'default'}>{v}</Badge> }, { key: 'phone', label: 'Phone' }, { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'active' ? 'active' : 'inactive'}>{v}</Badge> }, { key: 'lastLogin', label: 'Last Login' }, { key: 'actions', label: 'Actions', render: () => <button className="text-accent hover:underline text-xs font-medium">Edit</button> }];
  return (<div className="space-y-6 animate-fadeIn"><Card><div className="flex items-center justify-between flex-wrap gap-4"><h3 className="font-semibold text-sm text-text-primary font-display">Users</h3><div className="flex items-center gap-4"><SearchBar placeholder="Search users..." onSearch={setSearchQuery} className="w-64" /><Link to="/admin/users/add" className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Add User</Link></div></div></Card><Card><Table columns={columns} data={filtered} emptyMessage="No users found" /></Card></div>);
};
export default Users;
