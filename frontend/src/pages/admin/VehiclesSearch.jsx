import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const VehiclesSearch = () => {
  const [vehicles, setVehicles] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [entriesLimit, setEntriesLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchVehicles = async (query = '') => {
    try {
      setLoading(true);
      const res = await api.get('/vehicles', {
        params: {
          search: query,
          page: currentPage,
          limit: entriesLimit,
        },
      });
      if (res.data.success) {
        setVehicles(res.data.data);
        setTotalRecords(res.data.total || res.data.data.length);
      }
    } catch (err) {
      console.error('Search vehicles error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(searchVal);
  }, [currentPage, entriesLimit]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchVehicles(searchVal);
  };

  const handleExportCSV = () => {
    const headers = 'LicenceID,VehicleID,VehicleName,OrgName,DeviceID,GpsSimNo,TimeZone,APN,LastCommTime,Status,DeviceModel,LicenceIssuedDate,OnBoardDate,LicExpDate\n';
    const rows = vehicles
      .map((v) => {
        const licenceId = v.licence_key || `LIC-${(v.id || '').substring(0, 8).toUpperCase()}`;
        return `"${licenceId}","${v.vehicle_identifier || v.id || ''}","${v.vehicle_name || ''}","${v.organization_name || ''}","${v.imei || ''}","${v.gps_sim_no || ''}","${v.timezone || ''}","${v.apn || ''}","${v.last_comm || v.last_location_update || ''}","${v.status || ''}","${v.model || ''}","${v.licence_issued_date || ''}","${v.onboard_date || ''}","${v.licence_expire_date || ''}"`;
      })
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'vehicles_search.csv');
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold font-display text-lb-800 dark:text-white">Vehicles Search</h2>
          <div className="h-6 w-[1px] bg-[rgba(61,122,138,0.25)]"></div>
          <div className="flex items-center gap-2 text-xs font-semibold text-lb-500 uppercase tracking-wider">
            <Link to="/admin" className="hover:text-lb-700 transition-colors">
              <i className="fa-solid fa-house"></i>
            </Link>
            <span>&gt;</span>
            <span className="text-lb-400">Vehicles</span>
            <span>&gt;</span>
            <span className="text-lb-400">Vehicles Search</span>
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

      {/* Search Bar Panel */}
      <div className="glass-card rounded-[24px] p-6">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <label className="block text-xs font-bold text-lb-700 dark:text-lb-300 uppercase tracking-wider">
            Vehicles Search <i className="fa-solid fa-circle-info text-lb-400 ml-1"></i>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search Vehicle"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="flex-1 px-4 py-3 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] dark:text-white text-sm font-semibold transition-all"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-[rgba(29,100,120,0.18)] to-[rgba(15,60,80,0.14)] dark:from-[rgba(61,122,138,0.35)] border border-[rgba(61,122,138,0.4)] text-lb-800 dark:text-white font-bold rounded-xl text-xs hover:-translate-y-0.5 transition-all shadow-md"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Grid Content */}
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
                <th className="py-4 px-3 text-center">Gps Sim No</th>
                <th className="py-4 px-3 text-center">TimeZone</th>
                <th className="py-4 px-3 text-center">APN</th>
                <th className="py-4 px-3 text-center">Last Comm Time</th>
                <th className="py-4 px-3 text-center">Status</th>
                <th className="py-4 px-3 text-center">Device Model</th>
                <th className="py-4 px-3 text-center">Licence Issued Date</th>
                <th className="py-4 px-3 text-center">On Board Date</th>
                <th className="py-4 px-3 text-center">Lic Exp Date</th>
                <th className="py-4 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(61,122,138,0.12)]">
              {loading ? (
                <tr>
                  <td colSpan={15} className="py-10 text-center text-xs text-lb-500 font-semibold">
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading vehicles...
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-10 text-center text-xs text-lb-500 font-semibold">
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
                      <td className="py-4 px-3 text-center">{v.gps_sim_no || '-'}</td>
                      <td className="py-4 px-3 text-center">{v.timezone || '-'}</td>
                      <td className="py-4 px-3 text-center">{v.apn || '-'}</td>
                      <td className="py-4 px-3 text-center text-lb-500 whitespace-nowrap">
                        {v.last_comm ? new Date(v.last_comm).toISOString().replace('T', ' ').substring(0, 19) : '-'}
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v.status === 'active' || v.status === 'moving' ? 'bg-[rgba(52,216,181,0.18)] text-[#0a8f78]' : 'bg-[rgba(248,113,113,0.18)] text-[#b91c1c]'}`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-center">{v.model || '-'}</td>
                      <td className="py-4 px-3 text-center whitespace-nowrap">
                        {v.licence_issued_date ? new Date(v.licence_issued_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 px-3 text-center whitespace-nowrap">
                        {v.onboard_date ? new Date(v.onboard_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 px-3 text-center whitespace-nowrap">
                        {v.licence_expire_date ? new Date(v.licence_expire_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 px-3 text-center">
                        <Link to={`/admin/vehicles/${v.id}`} className="text-[#3d7a8a] dark:text-[#8ec4cc] hover:underline font-bold">
                          View
                        </Link>
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

export default VehiclesSearch;
