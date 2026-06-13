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

  useEffect(() => {
    fetchGroups();
  }, [currentPage, entriesLimit, searchQuery]);

  const handleDeleteGroup = async (group) => {
    if (!window.confirm(`Are you sure you want to delete group ${group.name}?`)) {
      setActiveMenu(null);
      return;
    }
    try {
      const res = await api.delete(`/groups/${group.id}`);
      if (res.data.success) {
        alert('Group deleted successfully.');
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
                            onClick={() => {
                              alert(`Edit function for group: ${group.name}`);
                              setActiveMenu(null);
                            }}
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
    </div>
  );
};

export default Groups;
