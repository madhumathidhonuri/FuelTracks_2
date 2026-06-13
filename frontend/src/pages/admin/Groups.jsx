import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const Groups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesLimit, setEntriesLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalGroups, setTotalGroups] = useState(0);

  // Dropdown States
  const [activeMenu, setActiveMenu] = useState(null); // row index
  const menuRef = useRef(null);

  // Edit Group Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editSelectedVehicles, setEditSelectedVehicles] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

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

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await api.get('/groups', {
        params: {
          page: currentPage,
          limit: entriesLimit,
          search: searchQuery,
        },
      });
      if (res.data.success) {
        setGroups(res.data.data);
        setTotalGroups(res.data.total || res.data.data.length);
      }
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllVehicles = async () => {
    try {
      // Fetch all vehicles without pagination limit for the edit modal
      const res = await api.get('/vehicles', { params: { limit: 9999, page: 1 } });
      if (res.data.success) {
        setAllVehicles(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [currentPage, entriesLimit, searchQuery]);

  useEffect(() => {
    fetchAllVehicles();
  }, []);

  const handleDeleteGroup = async (group) => {
    if (!window.confirm(`Are you sure you want to delete group ${group.name}?`)) {
      setActiveMenu(null);
      return;
    }
    try {
      const res = await api.delete(`/groups/${group.id}`);
      if (res.data.success) {
        fetchGroups();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete group.');
    }
    setActiveMenu(null);
  };

  const handleExportCSV = () => {
    const headers = 'ID,Group Name,Vehicle Count\n';
    const rows = groups
      .map((g, i) => `${i + 1},${g.name},${g.vehicles?.length || 0}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'groups_list.csv');
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const openEditGroup = (group) => {
    setSelectedGroup(group);
    setEditGroupName(group.name);
    setEditSelectedVehicles(group.vehicles ? group.vehicles.map((v) => v.id) : []);
    setModalSearchQuery('');
    setEditError('');
    setShowEditModal(true);
    setActiveMenu(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editGroupName.trim()) {
      setEditError('Please enter a group name.');
      return;
    }
    setEditLoading(true);
    setEditError('');
    try {
      const payload = {
        name: editGroupName.trim(),
        vehicle_ids: editSelectedVehicles,
      };
      const res = await api.put(`/groups/${selectedGroup.id}`, payload);
      if (res.data.success) {
        setShowEditModal(false);
        fetchGroups();
      } else {
        setEditError(res.data.message || 'Failed to update group.');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.errors
        ? err.response.data.errors.map((e) => e.message).join(', ')
        : err.response?.data?.message || 'Failed to update group.';
      setEditError(errMsg);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditVehicleToggle = (vehicleId) => {
    setEditSelectedVehicles((prev) =>
      prev.includes(vehicleId) ? prev.filter((id) => id !== vehicleId) : [...prev, vehicleId]
    );
  };

  const handleEditSelectAll = (checked) => {
    if (checked) {
      setEditSelectedVehicles(allVehicles.map((v) => v.id));
    } else {
      setEditSelectedVehicles([]);
    }
  };

  const filteredModalVehicles = allVehicles.filter((v) => {
    const name = v.vehicle_name || v.vehicleName || '';
    const reg = v.registration_number || v.registrationNumber || '';
    return `${name} ${reg}`.toLowerCase().includes(modalSearchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Breadcrumbs */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold font-display text-lb-800 dark:text-white">Group List</h2>
          <div className="h-6 w-[1px] bg-[rgba(61,122,138,0.25)]"></div>
          <div className="flex items-center gap-2 text-xs font-semibold text-lb-500 uppercase tracking-wider">
            <Link to="/admin" className="hover:text-lb-700 transition-colors">
              <i className="fa-solid fa-house"></i>
            </Link>
            <span>&gt;</span>
            <span className="text-lb-400">Group List</span>
          </div>
        </div>

        {/* Action button to add group / export */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin/groups/add"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[rgba(29,100,120,0.18)] to-[rgba(15,60,80,0.14)] dark:from-[rgba(61,122,138,0.35)] dark:to-[rgba(20,42,54,0.25)] border border-[rgba(61,122,138,0.45)] hover:from-[rgba(29,100,120,0.28)] hover:to-[rgba(15,60,80,0.22)] shadow-md text-lb-800 dark:text-white rounded-xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-plus text-[11px] text-[#3d7a8a] dark:text-white"></i>
            Add Group
          </Link>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[rgba(52,216,181,0.15)] to-[rgba(52,216,181,0.08)] border border-[rgba(52,216,181,0.35)] text-[#0a8f78] dark:text-[#34d8b5] hover:bg-[rgba(52,216,181,0.2)] rounded-xl text-xs font-bold shadow-md transition-all duration-200 hover:-translate-y-0.5"
            title="Export Excel"
          >
            <i className="fa-solid fa-file-excel text-[13px]"></i>
            Export Excel
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[24px] !overflow-visible p-6 space-y-6">
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
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] dark:text-white w-48 font-medium text-xs"
            />
          </div>
        </div>

        {/* Groups Table Grid */}
        <div className="overflow-x-auto md:overflow-visible">
          <table className="w-full text-left border-collapse rounded-2xl shadow-sm border border-[rgba(61,122,138,0.15)]">
            <thead>
              <tr className="bg-[rgba(61,122,138,0.08)] dark:bg-[rgba(13,30,38,0.6)] text-lb-800 dark:text-white text-xs font-bold uppercase tracking-wider border-b border-[rgba(61,122,138,0.22)]">
                <th className="py-4 px-4 text-center w-16 rounded-tl-2xl">ID</th>
                <th className="py-4 px-4">Group Name</th>
                <th className="py-4 px-4">Vehicle Id</th>
                <th className="py-4 px-4">Vehicle Name</th>
                <th className="py-4 px-4 text-center w-36">Vehicle Count</th>
                <th className="py-4 px-4 text-center w-32 rounded-tr-2xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(61,122,138,0.12)]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-xs text-lb-500 font-semibold">
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading groups...
                  </td>
                </tr>
              ) : groups.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-xs text-lb-500 font-semibold">
                    No groups found
                  </td>
                </tr>
              ) : (
                groups.map((group, idx) => (
                  <tr key={group.id} className="hover:bg-[rgba(61,122,138,0.03)] dark:hover:bg-[rgba(255,255,255,0.01)] transition-colors text-xs font-semibold text-lb-800 dark:text-lb-200 border-b border-[rgba(61,122,138,0.1)]">
                    {/* Row Index */}
                    <td className="py-4 px-4 text-center font-bold text-lb-500">
                      {(currentPage - 1) * entriesLimit + idx + 1}
                    </td>
                    {/* Group Name */}
                    <td className="py-4 px-4 font-bold">{group.name}</td>
                    {/* Vehicle Id List Stacked */}
                    <td className="py-4 px-4">
                      {group.vehicles && group.vehicles.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {group.vehicles.map((v, i) => (
                            <div key={v.id || i} className="py-0.5 border-b border-[rgba(61,122,138,0.08)] last:border-0">
                              {v.registrationNumber || 'N/A'}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-lb-400 font-medium">None</span>
                      )}
                    </td>
                    {/* Vehicle Name List Stacked */}
                    <td className="py-4 px-4">
                      {group.vehicles && group.vehicles.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {group.vehicles.map((v, i) => (
                            <div key={v.id || i} className="py-0.5 border-b border-[rgba(61,122,138,0.08)] last:border-0 font-medium">
                              {v.vehicleName || 'N/A'}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-lb-400 font-medium">None</span>
                      )}
                    </td>
                    {/* Vehicle Count */}
                    <td className="py-4 px-4 text-center font-bold text-lb-600 dark:text-lb-400">
                      {group.vehicles?.length || 0}
                    </td>
                    {/* Actions dropdown */}
                    <td className="py-4 px-4 text-center relative">
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
                            onClick={() => openEditGroup(group)}
                            className="w-full text-left px-4 py-2.5 text-lb-800 dark:text-lb-200 hover:bg-[rgba(61,122,138,0.15)] text-[11px] font-bold transition-colors flex items-center gap-2"
                          >
                            <i className="fa-solid fa-pen-to-square text-[#3498db]"></i>
                            Edit Group
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group)}
                            className="w-full text-left px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-[11px] font-bold transition-colors flex items-center gap-2"
                          >
                            <i className="fa-solid fa-trash text-[#e74c3c]"></i>
                            Delete Group
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Entries Counter and Pagination */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-4 text-xs font-semibold text-lb-500">
          <div>
            Showing {groups.length > 0 ? (currentPage - 1) * entriesLimit + 1 : 0} to{' '}
            {Math.min(currentPage * entriesLimit, totalGroups)} of {totalGroups} entries
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
              onClick={() => setCurrentPage((p) => Math.min(Math.ceil(totalGroups / entriesLimit), p + 1))}
              disabled={currentPage >= Math.ceil(totalGroups / entriesLimit)}
              className="px-3.5 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[rgba(61,122,138,0.06)] transition-all text-xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Group Modal */}
      {showEditModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card rounded-[24px] max-w-2xl w-full overflow-hidden p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[rgba(61,122,138,0.15)] pb-4">
              <h3 className="text-lg font-bold font-display text-lb-800 dark:text-white">Edit Group Settings</h3>
              <button onClick={() => setShowEditModal(false)} className="text-lb-400 hover:text-lb-700 text-lg" disabled={editLoading}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            {editError && (
              <div className="px-4 py-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation"></i>
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-[10px] text-lb-400 uppercase tracking-wider mb-1.5">Group Name</label>
                <input
                  type="text"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] dark:text-white transition-all shadow-sm"
                  required
                />
              </div>

              {/* Vehicles Selection checklist */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between gap-4 flex-wrap border-t border-[rgba(61,122,138,0.15)] pt-4">
                  <label className="flex items-center gap-2 font-bold text-lb-600 dark:text-lb-400 cursor-pointer uppercase tracking-wider text-[10px]">
                    <input
                      type="checkbox"
                      checked={allVehicles.length > 0 && editSelectedVehicles.length === allVehicles.length}
                      onChange={(e) => handleEditSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded text-[#3d7a8a] focus:ring-[#3d7a8a] border-[rgba(61,122,138,0.25)] bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] accent-[#3d7a8a]"
                    />
                    Select all Vehicles
                  </label>
                  <input
                    type="text"
                    placeholder="Filter vehicles..."
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    className="px-3.5 py-1.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] dark:text-white w-48 font-medium text-[11px] shadow-sm"
                  />
                </div>

                <div className="max-h-[30vh] overflow-y-auto pr-1">
                  <h4 className="text-[#3d7a8a] dark:text-lb-300 font-bold text-[10px] uppercase tracking-wider mb-2">Vehicles Checklist:</h4>
                  {allVehicles.length === 0 ? (
                    <div className="text-[10px] text-lb-400 font-semibold py-2">
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading vehicles...
                    </div>
                  ) : filteredModalVehicles.length === 0 ? (
                    <div className="text-[10px] text-lb-400 font-semibold py-2">
                      No vehicles found.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredModalVehicles.map((v) => {
                        const label = `${v.vehicle_name || v.vehicleName || ''} ${v.registration_number || v.registrationNumber || ''}`.trim().toUpperCase();
                        return (
                          <label
                            key={v.id}
                            className="flex items-center gap-2 text-[11px] font-semibold text-lb-700 dark:text-lb-300 cursor-pointer hover:text-lb-900 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={editSelectedVehicles.includes(v.id)}
                              onChange={() => handleEditVehicleToggle(v.id)}
                              className="w-4 h-4 rounded text-[#3d7a8a] focus:ring-[#3d7a8a] border-[rgba(61,122,138,0.25)] bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] accent-[#3d7a8a]"
                            />
                            {label}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[rgba(61,122,138,0.15)]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={editLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-gray-500/80 to-gray-600/80 hover:from-gray-500 hover:to-gray-600 text-white font-bold rounded-xl text-xs transition-all duration-200 hover:-translate-y-0.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-[rgba(29,100,120,0.18)] to-[rgba(15,60,80,0.14)] dark:from-[rgba(61,122,138,0.35)] dark:to-[rgba(20,42,54,0.25)] border border-[rgba(61,122,138,0.45)] hover:from-[rgba(29,100,120,0.28)] hover:to-[rgba(15,60,80,0.22)] shadow-md text-lb-800 dark:text-white rounded-xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {editLoading ? <><i className="fa-solid fa-spinner fa-spin text-[10px]"></i> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
