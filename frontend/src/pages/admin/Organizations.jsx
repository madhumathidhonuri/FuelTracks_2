import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const Organizations = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesLimit, setEntriesLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrgs, setTotalOrgs] = useState(0);

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

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/organizations', {
        params: {
          page: currentPage,
          limit: entriesLimit,
          search: searchQuery,
        },
      });
      if (res.data.success) {
        setOrganizations(res.data.data);
        setTotalOrgs(res.data.total || res.data.data.length);
      }
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, [currentPage, entriesLimit, searchQuery]);

  const handleDeleteOrg = async (org) => {
    if (!window.confirm(`Are you sure you want to delete organization ${org.name}? This will delete all users and vehicles assigned to it.`)) {
      setActiveMenu(null);
      return;
    }
    try {
      const res = await api.delete(`/organizations/${org.id}`);
      if (res.data.success) {
        alert('Organization deleted successfully.');
        fetchOrgs();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete organization.');
    }
    setActiveMenu(null);
  };

  const handleExportCSV = () => {
    const headers = 'SNO,Organization Name,Email,Mobile\n';
    const rows = organizations
      .map((o, i) => `${i + 1},${o.name},${o.email},${o.mobile || o.phone || ''}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'organizations_list.csv');
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Breadcrumbs */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold font-display text-lb-800 dark:text-white">Organization List</h2>
          <div className="h-6 w-[1px] bg-[rgba(61,122,138,0.25)]"></div>
          <div className="flex items-center gap-2 text-xs font-semibold text-lb-500 uppercase tracking-wider">
            <Link to="/admin" className="hover:text-lb-700 transition-colors">
              <i className="fa-solid fa-house"></i>
            </Link>
            <span>&gt;</span>
            <span className="text-lb-400">Organization List</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin/organizations/add"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[rgba(29,100,120,0.18)] to-[rgba(15,60,80,0.14)] dark:from-[rgba(61,122,138,0.35)] dark:to-[rgba(20,42,54,0.25)] border border-[rgba(61,122,138,0.45)] hover:from-[rgba(29,100,120,0.28)] hover:to-[rgba(15,60,80,0.22)] shadow-md text-lb-800 dark:text-white rounded-xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-plus text-[11px] text-[#3d7a8a] dark:text-white"></i>
            Add Organization
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
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] dark:text-white w-48 font-medium text-xs"
            />
          </div>
        </div>

        {/* Organizations Table Grid */}
        <div className="overflow-x-auto md:overflow-visible">
          <table className="w-full text-left border-collapse rounded-2xl shadow-sm border border-[rgba(61,122,138,0.15)]">
            <thead>
              <tr className="bg-[rgba(61,122,138,0.08)] dark:bg-[rgba(13,30,38,0.6)] text-lb-800 dark:text-white text-xs font-bold uppercase tracking-wider border-b border-[rgba(61,122,138,0.22)]">
                <th className="py-4 px-4 text-center w-16 rounded-tl-2xl">SNO</th>
                <th className="py-4 px-4 text-center">Organization Name</th>
                <th className="py-4 px-4 text-center w-36 rounded-tr-2xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(61,122,138,0.12)]">
              {loading ? (
                <tr>
                  <td colSpan="3" className="py-10 text-center text-xs text-lb-500 font-semibold">
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading organizations...
                  </td>
                </tr>
              ) : organizations.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-10 text-center text-xs text-lb-500 font-semibold">
                    No organizations found
                  </td>
                </tr>
              ) : (
                organizations.map((org, idx) => (
                  <tr key={org.id} className="hover:bg-[rgba(61,122,138,0.03)] dark:hover:bg-[rgba(255,255,255,0.01)] transition-colors text-xs font-semibold text-lb-800 dark:text-lb-200 border-b border-[rgba(61,122,138,0.1)]">
                    {/* Row Index */}
                    <td className="py-4 px-4 text-center font-bold text-lb-500">
                      {(currentPage - 1) * entriesLimit + idx + 1}
                    </td>
                    {/* Organization Name */}
                    <td className="py-4 px-4 text-center uppercase tracking-wide font-display font-medium text-lb-800 dark:text-white">{org.name}</td>
                    {/* Actions dropdown */}
                    <td className="py-4 px-4 text-center relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === idx ? null : idx)}
                        className="px-3.5 py-1.5 bg-[rgba(218,241,255,0.6)] dark:bg-[rgba(13,30,38,0.5)] hover:bg-[rgba(218,241,255,0.9)] dark:hover:bg-[rgba(61,122,138,0.25)] border border-[rgba(61,122,138,0.3)] text-lb-800 dark:text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 justify-center mx-auto"
                      >
                        Actions <i className="fa-solid fa-caret-down text-[10px] text-lb-500"></i>
                      </button>

                      {activeMenu === idx && (
                        <div
                          ref={menuRef}
                          className="absolute right-4 mt-1.5 w-44 rounded-xl shadow-xl border border-[rgba(61,122,138,0.22)] bg-white dark:bg-[#0d1e26] z-50 overflow-hidden divide-y divide-[rgba(61,122,138,0.12)] text-left"
                          style={{ top: '80%', transform: 'translateX(-10px)' }}
                        >
                          {/* Edit Organization (Green hover) */}
                          <button
                            onClick={() => {
                              navigate(`/admin/organizations/edit/${org.id}?tab=general`);
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-lb-800 dark:text-lb-200 hover:bg-[rgba(52,216,181,0.15)] text-[11px] font-bold transition-colors flex items-center gap-2"
                          >
                            <i className="fa-solid fa-pen-to-square text-[#2ecc71]"></i>
                            Edit Organization
                          </button>
                          {/* Edit Alerts (Blue hover) */}
                          <button
                            onClick={() => {
                              navigate(`/admin/organizations/edit/${org.id}?tab=alerts`);
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-lb-800 dark:text-lb-200 hover:bg-[rgba(61,122,138,0.15)] text-[11px] font-bold transition-colors flex items-center gap-2"
                          >
                            <i className="fa-solid fa-bell text-[#3498db]"></i>
                            Edit Alerts
                          </button>
                          {/* Site Notification (Orange hover) */}
                          <button
                            onClick={() => {
                              navigate(`/admin/organizations/edit/${org.id}?tab=sms`);
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-lb-800 dark:text-lb-200 hover:bg-[rgba(251,191,36,0.15)] text-[11px] font-bold transition-colors flex items-center gap-2"
                          >
                            <i className="fa-solid fa-message text-[#e67e22]"></i>
                            Site Notification
                          </button>
                          {/* Organization Track (Blue hover) */}
                          <button
                            onClick={() => {
                              navigate(`/track?organizationId=${org.id}`);
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-lb-800 dark:text-lb-200 hover:bg-[rgba(125,203,252,0.15)] text-[11px] font-bold transition-colors flex items-center gap-2"
                          >
                            <i className="fa-solid fa-location-crosshairs text-[#3498db]"></i>
                            Organization Track
                          </button>
                          {/* Delete Organization (Red hover) */}
                          <button
                            onClick={() => handleDeleteOrg(org)}
                            className="w-full text-left px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-[11px] font-bold transition-colors flex items-center gap-2"
                          >
                            <i className="fa-solid fa-trash text-[#e74c3c]"></i>
                            Delete Organization
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
            Showing {organizations.length > 0 ? (currentPage - 1) * entriesLimit + 1 : 0} to{' '}
            {Math.min(currentPage * entriesLimit, totalOrgs)} of {totalOrgs} entries
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
              onClick={() => setCurrentPage((p) => Math.min(Math.ceil(totalOrgs / entriesLimit), p + 1))}
              disabled={currentPage >= Math.ceil(totalOrgs / entriesLimit)}
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

export default Organizations;
