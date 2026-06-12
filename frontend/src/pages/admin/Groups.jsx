import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';

const Groups = () => {
  const data = [{ id: 1, name: 'North Fleet', description: 'Vehicles operating in north region', vehicleCount: 12, userCount: 5, status: 'active' }, { id: 2, name: 'South Fleet', description: 'Vehicles operating in south region', vehicleCount: 8, userCount: 3, status: 'active' }];
  const columns = [{ key: 'name', label: 'Group Name' }, { key: 'description', label: 'Description' }, { key: 'vehicleCount', label: 'Vehicles' }, { key: 'userCount', label: 'Users' }, { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'active' ? 'active' : 'inactive'}>{v}</Badge> }, { key: 'actions', label: 'Actions', render: () => <button className="text-accent hover:underline text-xs font-medium">Edit</button> }];
  return (<div className="space-y-6 animate-fadeIn"><Card><div className="flex items-center justify-between"><h3 className="font-semibold text-sm text-text-primary font-display">Vehicle Groups</h3><Link to="/admin/groups/add" className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Add Group</Link></div></Card><Card><Table columns={columns} data={data} emptyMessage="No groups found" /></Card></div>);
};
export default Groups;
