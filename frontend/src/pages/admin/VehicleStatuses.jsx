import { useState, useEffect } from 'react';
import api from '../../api/axios';

const VehicleStatuses = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [entriesLimit, setEntriesLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vehicles', {
        params: {
          search: searchVal,
          page: currentPage,
          limit: entriesLimit,
        },
      });
      if (res.data.success) {
        setVehicles(res.data.data);
        setTotalRecords(res.data.total || res.data.data.length);
      }
    } catch (err) {
      console.error('Fetch vehicle statuses error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [currentPage, entriesLimit, searchVal]);

  const handleExportCSV = () => {
    const headers = 'VehicleID,VehicleName,DeviceID,OrgName,RegNo,Groups,Position,IgnitionStatus,LastComm,LastLoc,Speed\n';
    const rows = vehicles
      .map((v) => {
        const position = v.status === 'moving' ? 'Running' : v.status === 'idle' ? 'Idle' : 'No Data';
        const ignition = v.ignition ? 'ON' : 'OFF';
        const lastLoc = v.latitude && v.longitude ? `${v.latitude},${v.longitude}` : '';
        return `"${v.vehicle_identifier || v.id || ''}","${v.vehicle_name || ''}","${v.imei || ''}","${v.organization_name || ''}","${v.registration_number || ''}","","${position}","${ignition}","${v.last_comm || v.last_location_update || ''}","${lastLoc}","${v.status === 'moving' ? v.speed || 30 : 0}"`;
      })
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'vehicle_statuses.csv');
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold font-display text-lb-800 dark:text-white">Vehicles Status</h2>
          <div className="h-6 w-[1px] bg-[rgba(61,122,138,0.25)]"></div>
          <div className="flex items-center gap-2 text-xs font-semibold text-lb-500 uppercase tracking-wider">
            <span className="text-lb-400">Vehicles</span>
            <span>&gt;</span>
            <span className="text-lb-400">Vehicles Status</span>
          </div>
        </div>

        <div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[rgba(52,216,181,0.15)] to-[rgba(52,216,181,0.08)] border border-[rgba(52,216,181,0.35)] text-[#0a8f78] dark:text-[#34d8b5] hover:bg-[rgba(52,216,181,0.2)] rounded-xl text-xs font-bold shadow-md transition-all duration-200"
          >
            <i className="fa-solid fa-file-excel text-[13px]"></i>
            Export Logs
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="glass-card rounded-[24px] p-6 space-y-6">
        {/* Filters */}
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
              placeholder="Search..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="px-3.5 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] dark:text-white w-48 font-medium text-xs"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse rounded-2xl overflow-hidden shadow-sm border border-[rgba(61,122,138,0.15)]">
            <thead>
              <tr className="bg-[rgba(61,122,138,0.08)] dark:bg-[rgba(13,30,38,0.6)] text-lb-800 dark:text-white text-[11px] font-bold uppercase tracking-wider border-b border-[rgba(61,122,138,0.22)]">
                <th className="py-4 px-3 text-center">Vehicle ID</th>
                <th className="py-4 px-3 text-center">Vehicle Name</th>
                <th className="py-4 px-3 text-center">Device ID</th>
                <th className="py-4 px-3 text-center">Org Name</th>
                <th className="py-4 px-3 text-center">Reg No</th>
                <th className="py-4 px-3 text-center">Groups</th>
                <th className="py-4 px-3 text-center">Position</th>
                <th className="py-4 px-3 text-center">Ignition Status</th>
                <th className="py-4 px-3 text-center">Last Comm</th>
                <th className="py-4 px-3 text-center">Last Loc</th>
                <th className="py-4 px-3 text-center">G-Map</th>
                <th className="py-4 px-3 text-center">Speed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(61,122,138,0.12)]">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-xs text-lb-500 font-semibold">
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading vehicle statuses...
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-xs text-lb-500 font-semibold">
                    No records found
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => {
                  const position = v.status === 'moving' ? 'Running' : v.status === 'idle' ? 'Idle' : 'No Data';
                  const ignition = v.ignition ? 'ON' : 'OFF';
                  const lastLoc = v.latitude && v.longitude ? `${parseFloat(v.latitude).toFixed(4)}, ${parseFloat(v.longitude).toFixed(4)}` : 'No Data';

                  const speed = v.status === 'moving' ? v.speed || 30 : 0;
                  return (
                    <tr key={v.id} className="hover:bg-[rgba(61,122,138,0.03)] dark:hover:bg-[rgba(255,255,255,0.01)] transition-colors text-xs font-semibold text-lb-800 dark:text-lb-200 border-b border-[rgba(61,122,138,0.1)]">
                      <td className="py-4 px-3 text-center font-display font-medium text-lb-800 dark:text-white break-all max-w-[120px]">{v.vehicle_identifier || v.id}</td>
                      <td className="py-4 px-3 text-center font-bold">{v.vehicle_name}</td>
                      <td className="py-4 px-3 text-center font-mono text-[10px] select-all">{v.imei || '-'}</td>
                      <td className="py-4 px-3 text-center text-lb-600 dark:text-lb-300 font-medium">{v.organization_name || '-'}</td>
                      <td className="py-4 px-3 text-center">{v.registration_number || '-'}</td>
                      <td className="py-4 px-3 text-center font-medium">CENTRALZONEVAM</td>
                      <td className="py-4 px-3 text-center font-bold">
                        <span className={position === 'Running' ? 'text-green-500' : position === 'Idle' ? 'text-amber-500' : 'text-rose-500'}>
                          {position}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-center font-bold">
                        <span className={v.ignition ? 'text-[#0a8f78] dark:text-[#34d8b5]' : 'text-lb-400'}>
                          {ignition}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-center text-lb-500 whitespace-nowrap">
                        {v.last_comm ? new Date(v.last_comm).toISOString().replace('T', ' ').substring(0, 19) : '-'}
                      </td>
                      <td className="py-4 px-3 text-center text-[10px] text-lb-500 font-mono">{lastLoc}</td>
                      <td className="py-4 px-3 text-center">
                        {v.latitude && v.longitude ? (
                          <a
                            href={`https://www.google.com/maps?q=${v.latitude},${v.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 dark:text-[#8ec4cc] hover:underline font-bold"
                          >
                            G-Link
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-4 px-3 text-center font-bold">{speed}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-4 text-xs font-semibold text-lb-500">
          <div>
            Showing {vehicles.length > 0 ? (currentPage - 1) * entriesLimit + 1 : 0} to{' '}
            {Math.min(currentPage * entriesLimit, totalRecords)} of {totalRecords} entries
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
              onClick={() => setCurrentPage((p) => Math.min(Math.ceil(totalRecords / entriesLimit), p + 1))}
              disabled={currentPage >= Math.ceil(totalRecords / entriesLimit)}
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

export default VehicleStatuses;
