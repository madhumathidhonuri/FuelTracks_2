import Card from '../../components/common/Card';
import Table from '../../components/common/Table';

const AuditGroups = () => {
  const data = Array.from({ length: 15 }, (_, i) => ({ id: i + 1, timestamp: new Date(Date.now() - i * 3600000 * 2).toLocaleString(), user: ['Admin User', 'System', 'Owner User'][i % 3], action: ['Created', 'Updated', 'Deleted', 'Added Vehicles'][i % 4], group: ['North Fleet', 'South Fleet', 'Express Route'][i % 3], details: 'Group configuration modified' }));
  const columns = [{ key: 'timestamp', label: 'Timestamp' }, { key: 'user', label: 'User' }, { key: 'action', label: 'Action' }, { key: 'group', label: 'Group' }, { key: 'details', label: 'Details' }];
  return (<div className="space-y-6 animate-fadeIn"><Card><div className="flex items-center justify-between"><h3 className="font-semibold text-sm text-text-primary font-display">Group Audit Logs</h3><button className="px-4 py-2 bg-lb-50 border border-[rgba(56,175,249,0.18)] rounded-xl text-xs font-medium text-muted hover:bg-[rgba(56,175,249,0.06)]">Export Logs</button></div></Card><Card><Table columns={columns} data={data} emptyMessage="No audit logs found" /></Card></div>);
};
export default AuditGroups;
