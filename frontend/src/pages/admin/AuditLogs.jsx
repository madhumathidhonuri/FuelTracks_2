import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';

const categoryMap = {
  dealer: 'Dealer',
  users: 'User',
  vehicles: 'Vehicle',
  calibrate: 'Calibrate',
  renewals: 'Renewal',
  groups: 'Group',
  organizations: 'Organization',
};

const titleMap = {
  dealer: 'Dealer Audit',
  users: 'User Audit',
  vehicles: 'Vehicle Audit',
  calibrate: 'Calibrate Audit',
  renewals: 'Renewal Details Audit',
  groups: 'Group Audit',
  organizations: 'Organization Audit',
};

const AuditLogs = () => {
  const { category } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesLimit, setEntriesLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const isRenewal = category === 'renewals';
  const currentTitle = titleMap[category] || 'Dealer Audit';

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const entityType = categoryMap[category] || 'Dealer';
      const res = await api.get('/audit-logs', {
        params: {
          page: currentPage,
          limit: entriesLimit,
          search: searchQuery,
          entityType,
        },
      });
      if (res.data.success) {
        setLogs(res.data.data);
        setTotalLogs(res.data.total || res.data.data.length);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [category]);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, entriesLimit, searchQuery, category]);

  const handleExportCSV = () => {
    let headers, rows;
    if (isRenewal) {
      headers = 'User_Name,Licence_Id,Vehicle_Id,Device_Id,Type,Processed_Date,Status\n';
      rows = logs
        .map(
          (log) =>
            `"${log.user_name || ''}","${log.old_values || ''}","${log.entity_name || ''}","${log.new_values || ''}","${log.description || ''}","${log.created_at || ''}","${log.action || ''}"`
        )
        .join('\n');
    } else {
      headers = 'UserIpAddress,UserName,Type,Name,Status,OldData,NewData,Created_at\n';
      rows = logs
        .map(
          (log) =>
            `"${log.user_ip || ''}","${log.user_name || ''}","${log.entity_type || ''}","${log.entity_name || ''}","${log.action || ''}","${log.old_values || ''}","${log.new_values || ''}","${log.created_at || ''}"`
        )
        .join('\n');
    }
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${category}_audit_logs.csv`);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Breadcrumbs */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold font-display text-lb-800 dark:text-white">{currentTitle}</h2>
          <div className="h-6 w-[1px] bg-[rgba(61,122,138,0.25)]"></div>
          <div className="flex items-center gap-2 text-xs font-semibold text-lb-500 uppercase tracking-wider">
            <Link to="/admin" className="hover:text-lb-700 transition-colors">
              <i className="fa-solid fa-house"></i>
            </Link>
            <span>&gt;</span>
            <span className="text-lb-400">Audits</span>
            <span>&gt;</span>
            <span className="text-lb-400">{currentTitle}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[rgba(52,216,181,0.15)] to-[rgba(52,216,181,0.08)] border border-[rgba(52,216,181,0.35)] text-[#0a8f78] dark:text-[#34d8b5] hover:bg-[rgba(52,216,181,0.2)] rounded-xl text-xs font-bold shadow-md transition-all duration-200 hover:-translate-y-0.5"
            title="Export Excel"
          >
            <i className="fa-solid fa-file-excel text-[13px]"></i>
            Export Logs
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[24px] overflow-hidden p-6 space-y-6">
        {/* Table Filters */}
        <div className="flex items-center justify-between flex-wrap gap-4 text-xs font-semibold text-lb-600 dark:text-lb-400">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={entriesLimit}
              onChange={(e) => {
                setEntriesLimit(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] dark:text-white text-xs font-semibold"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Search:</span>
            <input
              type="text"
              placeholder="Search audit logs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] dark:text-white w-48 font-medium text-xs"
            />
          </div>
        </div>

        {/* Audit Logs Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse rounded-2xl overflow-hidden shadow-sm border border-[rgba(61,122,138,0.15)]">
            <thead>
              <tr className="bg-[rgba(61,122,138,0.08)] dark:bg-[rgba(13,30,38,0.6)] text-lb-800 dark:text-white text-xs font-bold uppercase tracking-wider border-b border-[rgba(61,122,138,0.22)]">
                {isRenewal ? (
                  <>
                    <th className="py-4 px-4 text-center">User_Name</th>
                    <th className="py-4 px-4 text-center">Licence_Id</th>
                    <th className="py-4 px-4 text-center">Vehicle_Id</th>
                    <th className="py-4 px-4 text-center">Device_Id</th>
                    <th className="py-4 px-4 text-center">Type</th>
                    <th className="py-4 px-4 text-center">Processed_Date</th>
                    <th className="py-4 px-4 text-center">Status</th>
                  </>
                ) : (
                  <>
                    <th className="py-4 px-4 text-center">UserIpAddress</th>
                    <th className="py-4 px-4 text-center">UserName</th>
                    <th className="py-4 px-4 text-center">Type</th>
                    <th className="py-4 px-4 text-center">Name</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-4 text-center">OldData</th>
                    <th className="py-4 px-4 text-center">NewData</th>
                    <th className="py-4 px-4 text-center">Created_at</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(61,122,138,0.12)]">
              {loading ? (
                <tr>
                  <td colSpan={isRenewal ? 7 : 8} className="py-10 text-center text-xs text-lb-500 font-semibold">
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={isRenewal ? 7 : 8} className="py-10 text-center text-xs text-lb-500 font-semibold">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[rgba(61,122,138,0.03)] dark:hover:bg-[rgba(255,255,255,0.01)] transition-colors text-xs font-semibold text-lb-800 dark:text-lb-200 border-b border-[rgba(61,122,138,0.1)]">
                    {isRenewal ? (
                      <>
                        <td className="py-4 px-4 text-center font-display font-medium text-lb-800 dark:text-white">{log.user_name}</td>
                        <td className="py-4 px-4 text-center text-lb-600 dark:text-lb-300 font-medium">{log.old_values}</td>
                        <td className="py-4 px-4 text-center text-lb-800 dark:text-white font-medium uppercase tracking-wide">{log.entity_name}</td>
                        <td className="py-4 px-4 text-center text-[10px] text-lb-600 dark:text-lb-400 font-mono select-all break-all whitespace-pre-line max-w-[200px]">{log.new_values}</td>
                        <td className="py-4 px-4 text-center text-lb-600 dark:text-lb-300 font-medium">{log.description}</td>
                        <td className="py-4 px-4 text-center text-lb-500 whitespace-nowrap">
                          {log.created_at ? new Date(log.created_at).toISOString().replace('T', ' ').substring(0, 19) : ''}
                        </td>
                        <td className="py-4 px-4 text-center font-semibold text-[#3d7a8a] dark:text-[#8ec4cc]">{log.action}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 px-4 text-center font-bold text-lb-500">{log.user_ip}</td>
                        <td className="py-4 px-4 text-center font-display font-medium text-lb-800 dark:text-white">{log.user_name}</td>
                        <td className="py-4 px-4 text-center text-lb-600 dark:text-lb-300 font-medium">{log.entity_type}</td>
                        <td className="py-4 px-4 text-center text-lb-800 dark:text-white font-medium uppercase tracking-wide">{log.entity_name}</td>
                        <td className="py-4 px-4 text-center font-semibold text-[#3d7a8a] dark:text-[#8ec4cc]">{log.action}</td>
                        <td className="py-4 px-4 text-center text-[10px] text-lb-600 dark:text-lb-400 font-mono select-all break-all whitespace-pre-line max-w-[200px]">{log.old_values}</td>
                        <td className="py-4 px-4 text-center text-[10px] text-lb-600 dark:text-lb-400 font-mono select-all break-all whitespace-pre-line max-w-[200px]">{log.new_values}</td>
                        <td className="py-4 px-4 text-center text-lb-500 whitespace-nowrap">
                          {log.created_at ? new Date(log.created_at).toISOString().replace('T', ' ').substring(0, 19) : ''}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Entries Counter and Pagination */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-4 text-xs font-semibold text-lb-500">
          <div>
            Showing {logs.length > 0 ? (currentPage - 1) * entriesLimit + 1 : 0} to{' '}
            {Math.min(currentPage * entriesLimit, totalLogs)} of {totalLogs} entries
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[rgba(61,122,138,0.06)] transition-all text-xs"
            >
              Previous
            </button>
            <span className="px-3.5 py-2 bg-gradient-to-r from-[rgba(29,100,120,0.18)] to-[rgba(15,60,80,0.14)] dark:from-[rgba(61,122,138,0.35)] border border-[rgba(61,122,138,0.4)] text-lb-800 dark:text-white font-bold rounded-xl font-display text-xs">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(Math.ceil(totalLogs / entriesLimit), p + 1))}
              disabled={currentPage >= Math.ceil(totalLogs / entriesLimit)}
              className="px-3.5 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[rgba(61,122,138,0.06)] transition-all text-xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;

