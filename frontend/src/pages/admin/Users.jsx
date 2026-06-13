import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const Users = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesLimit, setEntriesLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Modal / Dropdown States
  const [activeMenu, setActiveMenu] = useState(null); // row index
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit user fields
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    mobile: '',
    role: 'user',
    is_active: true,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users', {
        params: {
          page: currentPage,
          limit: entriesLimit,
          search: searchQuery,
        },
      });
      if (res.data.success) {
        setUsers(res.data.data);
        setTotalUsers(res.data.total);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, entriesLimit, searchQuery]);

  // Export to CSV helper
  const handleExportCSV = () => {
    const headers = 'ID,User Name,User Groups,Code\n';
    const rows = users
      .map((u, i) => `${i + 1},${u.username},${u.organizationName || 'VAM_GROUP'},VAM`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'users_list.csv');
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Toggle user active status
  const handleToggleStatus = async (user) => {
    try {
      const updatedStatus = !user.isActive;
      const res = await api.put(`/users/${user.id}`, { is_active: updatedStatus });
      if (res.data.success) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update user status.');
    }
    setActiveMenu(null);
  };

  // Delete User
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.username}?`)) {
      setActiveMenu(null);
      return;
    }
    try {
      const res = await api.delete(`/users/${user.id}`);
      if (res.data.success) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete user.');
    }
    setActiveMenu(null);
  };

  const handleSwitchLogin = async (targetUser) => {
    try {
      const res = await api.post(`/users/${targetUser.id}/switch`);
      if (res.data.success) {
        const { accessToken, refreshToken, user: userData } = res.data.data;
        login(accessToken, refreshToken, userData);
        alert(`Successfully switched login to ${targetUser.username}.`);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to switch login.');
    }
    setActiveMenu(null);
  };

  // Open Edit User Modal
  const openEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      mobile: user.mobile || '',
      role: user.role || 'user',
      is_active: user.isActive,
    });
    setEditError('');
    setEditSuccess(false);
    setShowEditModal(true);
    setActiveMenu(null);
  };

  // Handle Edit User Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess(false);
    try {
      const res = await api.put(`/users/${selectedUser.id}`, editForm);
      if (res.data.success) {
        setEditSuccess(true);
        fetchUsers();
        setTimeout(() => {
          setShowEditModal(false);
          setEditSuccess(false);
        }, 1000);
      } else {
        setEditError(res.data.message || 'Failed to update user.');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.errors
        ? err.response.data.errors.map((e) => e.message).join(', ')
        : err.response?.data?.message || 'Failed to update user.';
      setEditError(errMsg);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Breadcrumbs */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold font-display text-lb-800 dark:text-white">User List</h2>
          <div className="h-6 w-[1px] bg-[rgba(61,122,138,0.25)]"></div>
          <div className="flex items-center gap-2 text-xs font-semibold text-lb-500 uppercase tracking-wider">
            <Link to="/admin" className="hover:text-lb-700 transition-colors">
              <i className="fa-solid fa-house"></i>
            </Link>
            <span>&gt;</span>
            <span className="text-lb-400">User List</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin/users/add"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[rgba(29,100,120,0.18)] to-[rgba(15,60,80,0.14)] dark:from-[rgba(61,122,138,0.35)] dark:to-[rgba(20,42,54,0.25)] border border-[rgba(61,122,138,0.45)] hover:from-[rgba(29,100,120,0.28)] hover:to-[rgba(15,60,80,0.22)] shadow-md text-lb-800 dark:text-white rounded-xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-plus text-[11px] text-[#3d7a8a] dark:text-white"></i>
            Add User
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
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] dark:text-white w-48 font-medium text-xs"
            />
          </div>
        </div>

        {/* User Table grid with custom matched headers */}
        <div className="overflow-x-auto md:overflow-visible">
          <table className="w-full text-left border-collapse rounded-2xl shadow-sm border border-[rgba(61,122,138,0.15)]">
            <thead>
              <tr className="bg-[rgba(61,122,138,0.08)] dark:bg-[rgba(13,30,38,0.6)] text-lb-800 dark:text-white text-xs font-bold uppercase tracking-wider border-b border-[rgba(61,122,138,0.22)]">
                <th className="py-4 px-4 text-center w-16 rounded-tl-2xl">ID</th>
                <th className="py-4 px-4">User Name</th>
                <th className="py-4 px-4">User Groups</th>
                <th className="py-4 px-4 w-32">Code</th>
                <th className="py-4 px-4 text-center w-36 rounded-tr-2xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(61,122,138,0.12)]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-xs text-lb-500 font-semibold">
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-xs text-lb-500 font-semibold">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-[rgba(61,122,138,0.03)] dark:hover:bg-[rgba(255,255,255,0.01)] transition-colors text-xs font-semibold text-lb-800 dark:text-lb-200 border-b border-[rgba(61,122,138,0.1)]">
                    {/* Row Index */}
                    <td className="py-4 px-4 text-center font-bold text-lb-500">
                      {(currentPage - 1) * entriesLimit + idx + 1}
                    </td>
                    {/* User Name */}
                    <td className="py-4 px-4 font-bold">{user.username}</td>
                    {/* User Groups (Linked Organization Name) */}
                    <td className="py-4 px-4">{user.organizationName || 'VAM_GROUP'}</td>
                    {/* Code */}
                    <td className="py-4 px-4 text-lb-500">VAM</td>
                    {/* Actions Dropdown */}
                    <td className="py-4 px-4 text-center relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === idx ? null : idx)}
                        className="px-3.5 py-1.5 bg-[rgba(218,241,255,0.6)] dark:bg-[rgba(13,30,38,0.5)] hover:bg-[rgba(218,241,255,0.9)] dark:hover:bg-[rgba(61,122,138,0.25)] border border-[rgba(61,122,138,0.3)] text-lb-800 dark:text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 justify-center mx-auto"
                      >
                        Action <i className="fa-solid fa-caret-down text-[10px] text-lb-500"></i>
                      </button>

                      {/* Floating matching premium dropdown */}
                      {activeMenu === idx && (
                        <div
                          ref={menuRef}
                          className="absolute right-4 mt-1.5 w-44 rounded-xl shadow-xl border border-[rgba(61,122,138,0.22)] bg-white dark:bg-[#0d1e26] z-50 overflow-hidden divide-y divide-[rgba(61,122,138,0.12)] text-left"
                          style={{ top: '80%', transform: 'translateX(-10px)' }}
                        >
                          {/* View User */}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowViewModal(true);
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-lb-800 dark:text-lb-200 hover:bg-[rgba(52,216,181,0.15)] text-[11px] font-bold transition-colors flex items-center gap-2"
                          >
                            <i className="fa-solid fa-eye text-[#2ecc71]"></i>
                            View User
                          </button>
                          {/* Edit User */}
                          <button
                            onClick={() => openEditUser(user)}
                            className="w-full text-left px-4 py-2.5 text-lb-800 dark:text-lb-200 hover:bg-[rgba(61,122,138,0.15)] text-[11px] font-bold transition-colors flex items-center gap-2"
                          >
                            <i className="fa-solid fa-user-pen text-[#3498db]"></i>
                            Edit User
                          </button>
                          {/* Edit Notification */}
                          <button
                            onClick={() => {
                              navigate(`/admin/users/add`);
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-lb-800 dark:text-lb-200 hover:bg-[rgba(52,216,181,0.15)] text-[11px] font-bold transition-colors flex items-center gap-2"
                          >
                            <i className="fa-solid fa-bell text-[#2ecc71]"></i>
                            Edit Notification
                          </button>
                          {/* Edit Reports */}
                          <button
                            onClick={() => {
                              navigate(`/admin/audit/users`);
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-lb-800 dark:text-lb-200 hover:bg-[rgba(61,122,138,0.15)] text-[11px] font-bold transition-colors flex items-center gap-2"
                          >
                            <i className="fa-solid fa-chart-line text-[#3498db]"></i>
                            Edit Reports
                          </button>
                          {/* Edit Reports Beta */}
                          <button
                            onClick={() => {
                              navigate(`/admin/audit/users`);
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-lb-800 dark:text-lb-200 hover:bg-[rgba(61,122,138,0.15)] text-[11px] font-bold transition-colors flex items-center gap-2"
                          >
                            <i className="fa-solid fa-chart-line text-[#3498db]"></i>
                            Edit Reports <span className="bg-[#3498db] text-white dark:bg-white dark:text-[#3498db] text-[8px] font-extrabold px-1 rounded-sm ml-auto">Beta</span>
                          </button>
                          {/* Audit Report */}
                          <button
                            onClick={() => {
                              navigate(`/admin/audit/users`);
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-lb-800 dark:text-lb-200 hover:bg-[rgba(251,191,36,0.15)] text-[11px] font-bold transition-colors flex items-center gap-2"
                          >
                            <i className="fa-solid fa-file-invoice text-[#e67e22]"></i>
                            Audit Report
                          </button>
                          {/* Switch Login */}
                          <button
                            onClick={() => handleSwitchLogin(user)}
                            className="w-full text-left px-4 py-2.5 text-lb-800 dark:text-lb-200 hover:bg-[rgba(251,191,36,0.15)] text-[11px] font-bold transition-colors flex items-center gap-2"
                          >
                            <i className="fa-solid fa-right-to-bracket text-[#e67e22]"></i>
                            Switch Login
                          </button>
                          {/* Disable / Enable */}
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className="w-full text-left px-4 py-2.5 text-lb-800 dark:text-lb-200 hover:bg-[rgba(251,191,36,0.15)] text-[11px] font-bold transition-colors flex items-center gap-2"
                          >
                            <i className={`fa-solid ${user.isActive ? 'fa-toggle-on' : 'fa-toggle-off'} text-[#e67e22]`}></i>
                            {user.isActive ? 'Disable' : 'Enable'}
                          </button>
                          {/* Delete User */}
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="w-full text-left px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-[11px] font-bold transition-colors flex items-center gap-2"
                          >
                            <i className="fa-solid fa-trash text-[#e74c3c]"></i>
                            Delete User
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
            Showing {users.length > 0 ? (currentPage - 1) * entriesLimit + 1 : 0} to{' '}
            {Math.min(currentPage * entriesLimit, totalUsers)} of {totalUsers} entries
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
              onClick={() => setCurrentPage((p) => Math.min(Math.ceil(totalUsers / entriesLimit), p + 1))}
              disabled={currentPage >= Math.ceil(totalUsers / entriesLimit)}
              className="px-3.5 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[rgba(61,122,138,0.06)] transition-all text-xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ═══ MODAL 1: VIEW USER ═══ */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card rounded-[24px] max-w-lg w-full overflow-hidden p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[rgba(61,122,138,0.15)] pb-4">
              <h3 className="text-lg font-bold font-display text-lb-800 dark:text-white">User Specifications</h3>
              <button onClick={() => setShowViewModal(false)} className="text-lb-400 hover:text-lb-700 text-lg">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-lb-600 dark:text-lb-300">
              <div className="p-3 bg-[rgba(218,241,255,0.25)] rounded-xl border border-[rgba(61,122,138,0.12)]">
                <span className="block text-[10px] text-lb-400 uppercase tracking-wider mb-1">User Name</span>
                <span className="font-bold text-lb-800 dark:text-white text-sm">{selectedUser.username}</span>
              </div>
              <div className="p-3 bg-[rgba(218,241,255,0.25)] rounded-xl border border-[rgba(61,122,138,0.12)]">
                <span className="block text-[10px] text-lb-400 uppercase tracking-wider mb-1">Email Address</span>
                <span className="font-bold text-lb-800 dark:text-white text-sm">{selectedUser.email}</span>
              </div>
              <div className="p-3 bg-[rgba(218,241,255,0.25)] rounded-xl border border-[rgba(61,122,138,0.12)]">
                <span className="block text-[10px] text-lb-400 uppercase tracking-wider mb-1">Mobile Number</span>
                <span className="font-bold text-lb-800 dark:text-white text-sm">{selectedUser.mobile || 'Not Set'}</span>
              </div>
              <div className="p-3 bg-[rgba(218,241,255,0.25)] rounded-xl border border-[rgba(61,122,138,0.12)]">
                <span className="block text-[10px] text-lb-400 uppercase tracking-wider mb-1">Assigned Group</span>
                <span className="font-bold text-lb-800 dark:text-white text-sm">{selectedUser.organizationName || 'None'}</span>
              </div>
              <div className="p-3 bg-[rgba(218,241,255,0.25)] rounded-xl border border-[rgba(61,122,138,0.12)] col-span-2">
                <span className="block text-[10px] text-lb-400 uppercase tracking-wider mb-1">Status / Role</span>
                <div className="flex gap-2.5 mt-1">
                  <Badge variant={selectedUser.role}>{selectedUser.role}</Badge>
                  <Badge variant={selectedUser.isActive ? 'active' : 'inactive'}>
                    {selectedUser.isActive ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-[rgba(61,122,138,0.15)]">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-5 py-2.5 bg-gradient-to-r from-gray-500/80 to-gray-600/80 hover:from-gray-500 hover:to-gray-600 text-white font-bold rounded-xl text-xs transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL 2: EDIT USER ═══ */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card rounded-[28px] max-w-lg w-full overflow-hidden shadow-2xl">
            
            {/* Modal Header */}
            <div className="relative px-7 pt-7 pb-5 border-b border-[rgba(61,122,138,0.15)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[rgba(61,122,138,0.3)] to-[rgba(29,100,120,0.15)] border border-[rgba(61,122,138,0.35)] flex items-center justify-center shadow-sm">
                  <i className="fa-solid fa-user-pen text-[#3d7a8a] text-sm"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-lb-800 dark:text-white">Edit User</h3>
                  <p className="text-[10px] text-lb-400 font-semibold mt-0.5">@{selectedUser.username}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowEditModal(false); }}
                disabled={editLoading}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-xl bg-[rgba(61,122,138,0.08)] hover:bg-[rgba(61,122,138,0.18)] text-lb-500 hover:text-lb-800 dark:text-lb-400 dark:hover:text-white transition-all text-sm disabled:opacity-40"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleEditSubmit} className="px-7 py-6 space-y-5">

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
                  <span>User updated successfully!</span>
                </div>
              )}

              {/* Username */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-lb-500 dark:text-lb-400 uppercase tracking-wider mb-2">
                  <i className="fa-solid fa-at text-[#3d7a8a] text-[9px]"></i>
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm((p) => ({ ...p, username: e.target.value }))}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] focus:ring-2 focus:ring-[rgba(61,122,138,0.15)] dark:text-white transition-all shadow-sm text-xs font-semibold text-lb-800"
                    required
                    minLength={3}
                    pattern="[a-zA-Z0-9_]+"
                    title="Only letters, numbers and underscores allowed"
                  />
                  <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-[#3d7a8a] text-[10px] opacity-60"></i>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-lb-500 dark:text-lb-400 uppercase tracking-wider mb-2">
                  <i className="fa-solid fa-envelope text-[#3d7a8a] text-[9px]"></i>
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] focus:ring-2 focus:ring-[rgba(61,122,138,0.15)] dark:text-white transition-all shadow-sm text-xs font-semibold text-lb-800"
                    required
                  />
                  <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-[#3d7a8a] text-[10px] opacity-60"></i>
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-lb-500 dark:text-lb-400 uppercase tracking-wider mb-2">
                  <i className="fa-solid fa-phone text-[#3d7a8a] text-[9px]"></i>
                  Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editForm.mobile}
                    onChange={(e) => setEditForm((p) => ({ ...p, mobile: e.target.value }))}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] focus:ring-2 focus:ring-[rgba(61,122,138,0.15)] dark:text-white transition-all shadow-sm text-xs font-semibold text-lb-800"
                    pattern="[0-9]{10}"
                    title="Enter a valid 10-digit mobile number"
                  />
                  <i className="fa-solid fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-[#3d7a8a] text-[10px] opacity-60"></i>
                </div>
              </div>

              {/* Role + Status side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-lb-500 dark:text-lb-400 uppercase tracking-wider mb-2">
                    <i className="fa-solid fa-shield-halved text-[#3d7a8a] text-[9px]"></i>
                    Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] focus:ring-2 focus:ring-[rgba(61,122,138,0.15)] text-xs font-semibold dark:text-white text-lb-800 transition-all shadow-sm"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-lb-500 dark:text-lb-400 uppercase tracking-wider mb-2">
                    <i className="fa-solid fa-circle-dot text-[#3d7a8a] text-[9px]"></i>
                    Status
                  </label>
                  <select
                    value={String(editForm.is_active)}
                    onChange={(e) => setEditForm((p) => ({ ...p, is_active: e.target.value === 'true' }))}
                    className="w-full px-3 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] focus:ring-2 focus:ring-[rgba(61,122,138,0.15)] text-xs font-semibold dark:text-white text-lb-800 transition-all shadow-sm"
                  >
                    <option value="true">Active</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-2 border-t border-[rgba(61,122,138,0.12)] mt-2">
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
                  className="px-6 py-2.5 bg-gradient-to-r from-[#1d6478] to-[#0f3c50] hover:from-[#206070] hover:to-[#0d3448] text-white font-bold rounded-xl text-xs transition-all duration-200 hover:-translate-y-0.5 shadow-md flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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

export default Users;
