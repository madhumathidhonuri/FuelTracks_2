import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const ViewVehicles = () => {
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
      console.error('Fetch vehicles view error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [currentPage, entriesLimit, searchVal]);

  const handleExportCSV = () => {
    const headers = 'LicenceID,VehicleID,VehicleName,OrgName,DeviceID,ServerName,LastCommTime,GPSSimNo,Status,DeviceModel,Version,TimeZone,APN,LicenceIssuedDate,OnboardDate,LicenceExpireDate\n';
    const rows = vehicles
      .map((v) => {
        const licenceId = v.licence_key || `LIC-${(v.id || '').substring(0, 8).toUpperCase()}`;
        return `"${licenceId}","${v.vehicle_identifier || v.id || ''}","${v.vehicle_name || ''}","${v.organization_name || ''}","${v.imei || ''}","137.184.248.156","${v.last_comm || v.last_location_update || ''}","${v.gps_sim_no || ''}","${v.status || ''}","${v.model || ''}","","${v.timezone || ''}","${v.apn || ''}","${v.licence_issued_date || ''}","${v.onboard_date || ''}","${v.licence_expire_date || ''}"`;
      })
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'view_vehicles.csv');
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold font-display text-lb-800 dark:text-white">View Vehicles</h2>
          <div className="h-6 w-[1px] bg-[rgba(61,122,138,0.25)]"></div>
          <div className="flex items-center gap-2 text-xs font-semibold text-lb-500 uppercase tracking-wider">
            <Link to="/admin" className="hover:text-lb-700 transition-colors">
              <i className="fa-solid fa-house"></i>
            </Link>
            <span>&gt;</span>
            <span className="text-lb-400">Vehicles</span>
            <span>&gt;</span>
            <span className="text-lb-400">View Vehicles</span>
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

      {/* View Panel */}
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
                <th className="py-4 px-3 text-center">Licence ID</th>
                <th className="py-4 px-3 text-center">Vehicle ID</th>
                <th className="py-4 px-3 text-center">Vehicle Name</th>
                <th className="py-4 px-3 text-center">Org Name</th>
                <th className="py-4 px-3 text-center">Device ID</th>
                <th className="py-4 px-3 text-center">Server Name</th>
                <th className="py-4 px-3 text-center">Last Comm Time</th>
                <th className="py-4 px-3 text-center">GPS Sim No</th>
                <th className="py-4 px-3 text-center">Status</th>
                <th className="py-4 px-3 text-center">Device Model</th>
                <th className="py-4 px-3 text-center">Version</th>
                <th className="py-4 px-3 text-center">TimeZone</th>
                <th className="py-4 px-3 text-center">APN</th>
                <th className="py-4 px-3 text-center">Licence Issued Date</th>
                <th className="py-4 px-3 text-center">Onboard Date</th>
                <th className="py-4 px-3 text-center">Licence Expire Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(61,122,138,0.12)]">
              {loading ? (
                <tr>
                  <td colSpan={16} className="py-10 text-center text-xs text-lb-500 font-semibold">
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading vehicles...
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-10 text-center text-xs text-lb-500 font-semibold">
                    No vehicles found
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => {
                  const licenceId = v.licence_key || `LIC-${(v.id || '').substring(0, 8).toUpperCase()}`;
                  return (
                    <tr key={v.id} className="hover:bg-[rgba(61,122,138,0.03)] dark:hover:bg-[rgba(255,255,255,0.01)] transition-colors text-xs font-semibold text-lb-800 dark:text-lb-200 border-b border-[rgba(61,122,138,0.1)]">
                      <td className="py-4 px-3 text-center text-lb-500 font-bold">{licenceId}</td>
                      <td className="py-4 px-3 text-center font-display font-medium text-lb-800 dark:text-white break-all max-w-[120px]">{v.vehicle_identifier || v.id}</td>
                      <td className="py-4 px-3 text-center font-bold">{v.vehicle_name}</td>
                      <td className="py-4 px-3 text-center text-lb-600 dark:text-lb-300 font-medium">{v.organization_name || '-'}</td>
                      <td className="py-4 px-3 text-center font-mono text-[10px] select-all">{v.imei || '-'}</td>
                      <td className="py-4 px-3 text-center text-lb-500 font-mono">137.184.248.156</td>
                      <td className="py-4 px-3 text-center text-lb-500 whitespace-nowrap">
                        {v.last_comm ? new Date(v.last_comm).toISOString().replace('T', ' ').substring(0, 19) : '-'}
                      </td>
                      <td className="py-4 px-3 text-center font-mono">{v.gps_sim_no || '-'}</td>
                      <td className="py-4 px-3 text-center">
                        <span className="text-blue-500 font-semibold cursor-pointer">New Device</span>
                      </td>
                      <td className="py-4 px-3 text-center">{v.model || '-'}</td>
                      <td className="py-4 px-3 text-center">-</td>
                      <td className="py-4 px-3 text-center">{v.timezone || '-'}</td>
                      <td className="py-4 px-3 text-center">{v.apn || '-'}</td>
                      <td className="py-4 px-3 text-center whitespace-nowrap">
                        {v.licence_issued_date ? new Date(v.licence_issued_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 px-3 text-center whitespace-nowrap">
                        {v.onboard_date ? new Date(v.onboard_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 px-3 text-center whitespace-nowrap">
                        {v.licence_expire_date ? new Date(v.licence_expire_date).toLocaleDateString() : '-'}
                      </td>
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

export default ViewVehicles;
