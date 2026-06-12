import { useState } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';

const AuditOrganizations = () => {
  const data = Array.from({ length: 15 }, (_, i) => ({ id: i + 1, timestamp: new Date(Date.now() - i * 3600000 * 3).toLocaleString(), user: ['Super Admin', 'System', 'Owner User'][i % 3], action: ['Created', 'Updated', 'Deleted', 'Plan Changed'][i % 4], organization: ['Metro Logistics', 'Swift Transport', 'Express Cargo'][i % 3], details: 'Organization settings updated' }));
  const columns = [{ key: 'timestamp', label: 'Timestamp' }, { key: 'user', label: 'User' }, { key: 'action', label: 'Action' }, { key: 'organization', label: 'Organization' }, { key: 'details', label: 'Details' }];
  return (<div className="space-y-6 animate-fadeIn"><Card><div className="flex items-center justify-between flex-wrap gap-4"><h3 className="font-semibold text-sm text-text-primary font-display">Organization Audit Logs</h3><div className="flex items-center gap-4"><SearchBar placeholder="Search..." onSearch={() => {}} className="w-64" /><button className="px-4 py-2 bg-lb-50 border border-[rgba(56,175,249,0.18)] rounded-xl text-xs font-medium text-muted hover:bg-[rgba(56,175,249,0.06)]">Export Logs</button></div></div></Card><Card><Table columns={columns} data={data} emptyMessage="No audit logs found" /></Card></div>);
};
export default AuditOrganizations;
