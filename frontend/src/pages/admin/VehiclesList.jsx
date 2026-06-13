import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const VehiclesList = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [entriesLimit, setEntriesLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modal / Dropdown States
  const [activeMenu, setActiveMenu] = useState(null); // row index
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [devices, setDevices] = useState([]);
  const menuRef = useRef(null);

  const [editForm, setEditForm] = useState({
    vehicle_name: '',
    registration_number: '',
    vehicle_identifier: '',
    vehicle_type: 'car',
    make: '',
    model: '',
    gps_sim_no: '',
    odometer: '',
    apn: '',
    device_id: '',
    organization_id: '',
    status: 'active',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

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
      console.error('Fetch vehicles error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgs = async () => {
    try {
      const res = await api.get('/organizations');
      if (res.data.success) {
        setOrganizations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await api.get('/devices', { params: { limit: 1000 } });
      if (res.data.success) {
        setDevices(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [currentPage, entriesLimit, searchVal]);

  useEffect(() => {
    fetchOrgs();
    fetchDevices();
  }, []);

  const handleExportCSV = () => {
    const headers = 'LicenceID,VehicleID,VehicleName,OrgName,DeviceID,ServerName,LastCommTime,GPSSimNo,LicenceIssuedDate,OnboardDate,LicenceExpireDate\n';
    const rows = vehicles
      .map((v) => {
        const licenceId = v.licence_key || `LIC-${(v.id || '').substring(0, 8).toUpperCase()}`;
        return `"${licenceId}","${v.vehicle_identifier || v.id || ''}","${v.vehicle_name || ''}","${v.organization_name || ''}","${v.imei || ''}","137.184.248.156","${v.last_comm || v.last_location_update || ''}","${v.gps_sim_no || ''}","${v.licence_issued_date || ''}","${v.onboard_date || ''}","${v.licence_expire_date || ''}"`;
      })
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'vehicles_list.csv');
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const openEditVehicle = (v) => {
    setSelectedVehicle(v);
    setEditForm({
      vehicle_name: v.vehicle_name || '',
      registration_number: v.registration_number || '',
      vehicle_identifier: v.vehicle_identifier || '',
      vehicle_type: v.vehicle_type || 'car',
      make: v.make || '',
      model: v.model || '',
      gps_sim_no: v.gps_sim_no || '',
      odometer: v.odometer || '',
      apn: v.apn || '',
      device_id: v.device_id || '',
      organization_id: v.organization_id || '',
      status: v.status || 'active',
    });
    setEditError('');
    setEditSuccess(false);
    setShowEditModal(true);
    setActiveMenu(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess(false);
    try {
      const payload = {
        ...editForm,
        odometer: editForm.odometer ? parseFloat(editForm.odometer) : 0,
        device_id: editForm.device_id || null,
        organization_id: editForm.organization_id || null,
      };
      const res = await api.put(`/vehicles/${selectedVehicle.id}`, payload);
      if (res.data.success) {
        setEditSuccess(true);
        fetchVehicles();
        setTimeout(() => {
          setShowEditModal(false);
          setEditSuccess(false);
        }, 1000);
      } else {
        setEditError(res.data.message || 'Failed to update vehicle.');
      }
    } catch (err) {
      console.error(err);
      setEditError(err.response?.data?.message || 'Failed to update vehicle.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteVehicle = async (v) => {
    if (!window.confirm(`Are you sure you want to delete vehicle ${v.vehicle_name || v.registration_number}?`)) {
      setActiveMenu(null);
      return;
    }
    try {
      const res = await api.delete(`/vehicles/${v.id}`);
      if (res.data.success) {
        fetchVehicles();
      } else {
        alert(res.data.message || 'Failed to delete vehicle.');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete vehicle.');
    }
    setActiveMenu(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold font-display text-lb-800 dark:text-white">Vehicles List</h2>
          <div className="h-6 w-[1px] bg-[rgba(61,122,138,0.25)]"></div>
          <div className="flex items-center gap-2 text-xs font-semibold text-lb-500 uppercase tracking-wider">
            <Link to="/admin" className="hover:text-lb-700 transition-colors">
              <i className="fa-solid fa-house"></i>
            </Link>
            <span>&gt;</span>
            <span className="text-lb-400">Vehicles</span>
            <span>&gt;</span>
            <span className="text-lb-400">Vehicles List</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin/vehicles/add"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[rgba(29,100,120,0.18)] to-[rgba(15,60,80,0.14)] dark:from-[rgba(61,122,138,0.35)] dark:to-[rgba(20,42,54,0.25)] border border-[rgba(61,122,138,0.45)] hover:from-[rgba(29,100,120,0.28)] hover:to-[rgba(15,60,80,0.22)] shadow-md text-lb-800 dark:text-white rounded-xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-plus text-[11px] text-[#3d7a8a] dark:text-white"></i>
            Add Vehicle
          </Link>
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

      {/* List Panel */}
      <div className="glass-card rounded-[24px] !overflow-visible p-6 space-y-6">
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
        <div className="overflow-x-auto md:overflow-visible">
          <table className="w-full text-left border-collapse rounded-2xl shadow-sm border border-[rgba(61,122,138,0.15)]">
            <thead>
              <tr className="bg-[rgba(61,122,138,0.08)] dark:bg-[rgba(13,30,38,0.6)] text-lb-800 dark:text-white text-[11px] font-bold uppercase tracking-wider border-b border-[rgba(61,122,138,0.22)]">
                <th className="py-4 px-3 text-center rounded-tl-2xl">Licence ID</th>
                <th className="py-4 px-3 text-center">Vehicle ID</th>
                <th className="py-4 px-3 text-center">Vehicle Name</th>
                <th className="py-4 px-3 text-center">Org Name</th>
                <th className="py-4 px-3 text-center">Device ID</th>
                <th className="py-4 px-3 text-center">Server Name</th>
                <th className="py-4 px-3 text-center">Last Comm Time</th>
                <th className="py-4 px-3 text-center">GPS Sim No</th>
                <th className="py-4 px-3 text-center">Licence Issued Date</th>
                <th className="py-4 px-3 text-center">Onboard Date</th>
                <th className="py-4 px-3 text-center">Licence Expire Date</th>
                <th className="py-4 px-3 text-center rounded-tr-2xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(61,122,138,0.12)]">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-xs text-lb-500 font-semibold">
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading vehicles...
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-xs text-lb-500 font-semibold">
                    No vehicles found
                  </td>
                </tr>
              ) : (
                vehicles.map((v, idx) => {
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
                      <td className="py-4 px-3 text-center whitespace-nowrap">
                        {v.licence_issued_date ? new Date(v.licence_issued_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 px-3 text-center whitespace-nowrap">
                        {v.onboard_date ? new Date(v.onboard_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 px-3 text-center whitespace-nowrap">
                        {v.licence_expire_date ? new Date(v.licence_expire_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 px-3 text-center relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === idx ? null : idx)}
                          className="px-3.5 py-1.5 bg-[rgba(218,241,255,0.6)] dark:bg-[rgba(13,30,38,0.5)] hover:bg-[rgba(218,241,255,0.9)] dark:hover:bg-[rgba(61,122,138,0.25)] border border-[rgba(61,122,138,0.3)] text-lb-800 dark:text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 justify-center mx-auto"
                        >
                          Action <i className="fa-solid fa-caret-down text-[10px] text-lb-500"></i>
                        </button>

                        {activeMenu === idx && (
                          <div
                            ref={menuRef}
                            className="absolute right-4 mt-1.5 w-44 rounded-xl shadow-xl border border-[rgba(61,122,138,0.22)] bg-white dark:bg-[#0d1e26] z-50 overflow-hidden divide-y divide-[rgba(61,122,138,0.12)] text-left"
                            style={{ top: '80%', transform: 'translateX(-10px)' }}
                          >
                            <button
                              onClick={() => {
                                navigate(`/admin/vehicles/${v.id}`);
                                setActiveMenu(null);
                              }}
                              className="w-full text-left px-4 py-2.5 text-lb-800 dark:text-lb-200 hover:bg-[rgba(52,216,181,0.15)] text-[11px] font-bold transition-colors flex items-center gap-2"
                            >
                              <i className="fa-solid fa-eye text-[#2ecc71]"></i>
                              View Status
                            </button>
                            <button
                              onClick={() => openEditVehicle(v)}
                              className="w-full text-left px-4 py-2.5 text-lb-800 dark:text-lb-200 hover:bg-[rgba(61,122,138,0.15)] text-[11px] font-bold transition-colors flex items-center gap-2"
                            >
                              <i className="fa-solid fa-pen-to-square text-[#3498db]"></i>
                              Edit Vehicle
                            </button>
                            <button
                              onClick={() => handleDeleteVehicle(v)}
                              className="w-full text-left px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-[11px] font-bold transition-colors flex items-center gap-2"
                            >
                              <i className="fa-solid fa-trash text-[#e74c3c]"></i>
                              Delete Vehicle
                            </button>
                          </div>
                        )}
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

      {/* Edit Vehicle Modal */}
      {showEditModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card rounded-[28px] max-w-2xl w-full overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="relative px-7 pt-7 pb-5 border-b border-[rgba(61,122,138,0.15)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[rgba(61,122,138,0.3)] to-[rgba(29,100,120,0.15)] border border-[rgba(61,122,138,0.35)] flex items-center justify-center shadow-sm">
                  <i className="fa-solid fa-car text-[#3d7a8a] text-sm"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-lb-800 dark:text-white">Edit Vehicle</h3>
                  <p className="text-[10px] text-lb-400 font-semibold mt-0.5">{selectedVehicle.vehicle_name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-xl bg-[rgba(61,122,138,0.08)] hover:bg-[rgba(61,122,138,0.18)] text-lb-500 hover:text-lb-800 dark:text-lb-400 dark:hover:text-white transition-all text-sm disabled:opacity-40"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="px-7 py-6 space-y-4 text-xs font-semibold max-h-[70vh] overflow-y-auto pr-1">
              {/* Error Banner */}
              {editError && (
                <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 dark:bg-red-950/25 border border-red-200 dark:border-red-800/40 rounded-2xl text-xs font-semibold text-red-600 dark:text-red-400">
                  <i className="fa-solid fa-circle-exclamation text-sm flex-shrink-0"></i>
                  <span>{editError}</span>
                </div>
              )}
              {/* Success Banner */}
              {editSuccess && (
                <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <i className="fa-solid fa-circle-check text-sm flex-shrink-0"></i>
                  <span>Vehicle updated successfully!</span>
                </div>
              )}              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-lb-400 uppercase tracking-wider mb-1.5">Vehicle Name</label>
                  <input
                    type="text"
                    value={editForm.vehicle_name}
                    onChange={(e) => setEditForm((p) => ({ ...p, vehicle_name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] dark:text-white transition-all shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-lb-400 uppercase tracking-wider mb-1.5">Registration Number</label>
                  <input
                    type="text"
                    value={editForm.registration_number}
                    onChange={(e) => setEditForm((p) => ({ ...p, registration_number: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] dark:text-white transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-lb-400 uppercase tracking-wider mb-1.5">Vehicle Identifier</label>
                  <input
                    type="text"
                    value={editForm.vehicle_identifier}
                    onChange={(e) => setEditForm((p) => ({ ...p, vehicle_identifier: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] dark:text-white transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-lb-400 uppercase tracking-wider mb-1.5">Vehicle Type</label>
                  <select
                    value={editForm.vehicle_type}
                    onChange={(e) => setEditForm((p) => ({ ...p, vehicle_type: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs dark:text-white transition-all shadow-sm font-semibold text-lb-800"
                  >
                    <option value="car">Car</option>
                    <option value="truck">Truck</option>
                    <option value="bus">Bus</option>
                    <option value="van">Van</option>
                    <option value="motorcycle">Motorcycle</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-lb-400 uppercase tracking-wider mb-1.5">Make (Brand)</label>
                  <input
                    type="text"
                    value={editForm.make}
                    onChange={(e) => setEditForm((p) => ({ ...p, make: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] dark:text-white transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-lb-400 uppercase tracking-wider mb-1.5">Model</label>
                  <input
                    type="text"
                    value={editForm.model}
                    onChange={(e) => setEditForm((p) => ({ ...p, model: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] dark:text-white transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-lb-400 uppercase tracking-wider mb-1.5">GPS Sim No</label>
                  <input
                    type="text"
                    value={editForm.gps_sim_no}
                    onChange={(e) => setEditForm((p) => ({ ...p, gps_sim_no: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] dark:text-white transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-lb-400 uppercase tracking-wider mb-1.5">Odo Distance (km)</label>
                  <input
                    type="number"
                    value={editForm.odometer}
                    onChange={(e) => setEditForm((p) => ({ ...p, odometer: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] dark:text-white transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-lb-400 uppercase tracking-wider mb-1.5">APN Link</label>
                  <input
                    type="text"
                    value={editForm.apn}
                    onChange={(e) => setEditForm((p) => ({ ...p, apn: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] dark:text-white transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-lb-400 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs dark:text-white transition-all shadow-sm font-semibold text-lb-800"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-lb-400 uppercase tracking-wider mb-1.5">Assigned Organization</label>
                  <select
                    value={editForm.organization_id}
                    onChange={(e) => setEditForm((p) => ({ ...p, organization_id: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs dark:text-white transition-all shadow-sm font-semibold text-lb-800"
                  >
                    <option value="">Select Organization</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-lb-400 uppercase tracking-wider mb-1.5">Assign Device (IMEI)</label>
                  <select
                    value={editForm.device_id}
                    onChange={(e) => setEditForm((p) => ({ ...p, device_id: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs dark:text-white transition-all shadow-sm font-semibold text-lb-800"
                  >
                    <option value="">No Device</option>
                    {devices.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.device_name} ({d.imei})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[rgba(61,122,138,0.15)]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={editLoading}
                  className="px-5 py-2.5 bg-[rgba(61,122,138,0.08)] hover:bg-[rgba(61,122,138,0.15)] dark:bg-[rgba(255,255,255,0.05)] dark:hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(61,122,138,0.2)] text-lb-700 dark:text-lb-300 font-bold rounded-xl text-xs transition-all duration-200 hover:-translate-y-0.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading || editSuccess}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#1d6478] to-[#0f3c50] hover:from-[#206070] hover:to-[#0d3448] text-white font-bold rounded-xl text-xs transition-all duration-200 hover:-translate-y-0.5 shadow-md flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {editLoading ? (
                    <><i className="fa-solid fa-spinner fa-spin text-[10px]"></i> Saving...</>
                  ) : editSuccess ? (
                    <><i className="fa-solid fa-check text-[10px]"></i> Saved!</>
                  ) : (
                    <><i className="fa-solid fa-floppy-disk text-[10px]"></i> Save Changes</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesList;
