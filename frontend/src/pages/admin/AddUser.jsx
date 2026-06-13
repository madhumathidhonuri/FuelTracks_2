import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AddUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    alternate_email: '',
    zoho: '',
    company_name: '',
    enable_debugs: 'Disable',
    user_mode: 'virtual', // default checked in screenshot
    selected_groups: [],
    role: 'user',
  });

  // Fetch organizations list on load
  useEffect(() => {
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
    fetchOrgs();
  }, []);

  const handleSelectAll = (checked) => {
    if (checked) {
      setForm((prev) => ({
        ...prev,
        selected_groups: organizations.map((org) => org.id),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        selected_groups: [],
      }));
    }
  };

  const handleGroupToggle = (orgId) => {
    setForm((prev) => {
      const selected = prev.selected_groups.includes(orgId)
        ? prev.selected_groups.filter((id) => id !== orgId)
        : [...prev.selected_groups, orgId];
      return { ...prev, selected_groups: selected };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate mobile (needs to be 10 digit string matching Joi schema pattern)
    const sanitizedMobile = form.phone.replace(/[^0-9]/g, '');
    if (sanitizedMobile.length !== 10) {
      alert('Please enter a valid 10-digit mobile number.');
      setLoading(false);
      return;
    }

    // Validate username (Joi schema pattern: alphanumeric and underscores only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(form.username)) {
      alert('Username can only contain letters, numbers, and underscores (no spaces).');
      setLoading(false);
      return;
    }

    if (!form.zoho) {
      alert('Zoho ID is required.');
      setLoading(false);
      return;
    }

    const payload = {
      username: form.username,
      email: form.email,
      mobile: sanitizedMobile,
      password: form.password,
      role: form.role,
      organization_id: form.selected_groups[0] || null, // Primary org association
      company_name: form.company_name,
      user_mode: form.user_mode,
      alternate_email: form.alternate_email || null,
      zoho: form.zoho,
      enable_debugs: form.enable_debugs,
      selected_groups: form.selected_groups,
    };

    try {
      const res = await api.post('/users', payload);
      if (res.data.success) {
        alert('User created successfully!');
        navigate('/admin/users');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrgs = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Breadcrumbs */}
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold font-display text-lb-800 dark:text-white">Add User</h2>
        <div className="h-6 w-[1px] bg-[rgba(61,122,138,0.25)]"></div>
        <div className="flex items-center gap-2 text-xs font-semibold text-lb-500 uppercase tracking-wider">
          <Link to="/admin" className="hover:text-lb-700 transition-colors">
            <i className="fa-solid fa-house"></i>
          </Link>
          <span>&gt;</span>
          <Link to="/admin/users" className="hover:text-lb-700 transition-colors">User List</Link>
          <span>&gt;</span>
          <span className="text-lb-400">Add User</span>
        </div>
      </div>

      <div className="glass-card rounded-[24px] p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {/* Column 1 */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">
                  <span className="inline-flex items-center gap-1.5">
                    User Name<span className="text-red-500">*</span>
                    <span className="relative group cursor-pointer inline-flex items-center text-orange-500">
                      <i className="fa-solid fa-circle-info text-[11px]"></i>
                      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-44 bg-gray-800 text-white text-[9px] p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 text-center font-normal shadow-md">
                        Alphanumeric username (no spaces)
                      </span>
                    </span>
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="User Name"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">
                  Email<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">
                  Alternate Email
                </label>
                <input
                  type="email"
                  placeholder="Alternate Email"
                  value={form.alternate_email}
                  onChange={(e) => setForm({ ...form, alternate_email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Company Name"
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">
                  Mobile Number<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Mobile Number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">
                  Password<span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">
                  Zoho<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Zoho"
                  value={form.zoho}
                  onChange={(e) => setForm({ ...form, zoho: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">
                  Enable Debugs
                </label>
                <select
                  value={form.enable_debugs}
                  onChange={(e) => setForm({ ...form, enable_debugs: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm font-semibold text-lb-800"
                >
                  <option value="Disable">Disable</option>
                  <option value="Enable">Enable</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm font-semibold text-lb-800"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* User Mode */}
          <div className="pt-2">
            <span className="text-[#3d7a8a] dark:text-lb-300 font-bold text-xs uppercase tracking-wider">User Mode :</span>
            <div className="flex items-center gap-6 mt-2">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-lb-700 dark:text-lb-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.user_mode === 'asset'}
                  onChange={() => setForm({ ...form, user_mode: 'asset' })}
                  className="w-4.5 h-4.5 rounded text-[#3d7a8a] focus:ring-[#3d7a8a] border-[rgba(61,122,138,0.25)] bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] accent-[#3d7a8a]"
                />
                Asset User
              </label>
              <label className="flex items-center gap-2.5 text-xs font-semibold text-lb-700 dark:text-lb-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.user_mode === 'virtual'}
                  onChange={() => setForm({ ...form, user_mode: 'virtual' })}
                  className="w-4.5 h-4.5 rounded text-[#3d7a8a] focus:ring-[#3d7a8a] border-[rgba(61,122,138,0.25)] bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] accent-[#3d7a8a]"
                />
                Virtual Account
              </label>
            </div>
          </div>

          {/* Center Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-3 bg-gradient-to-r from-[rgba(29,100,120,0.18)] to-[rgba(15,60,80,0.14)] dark:from-[rgba(61,122,138,0.35)] dark:to-[rgba(20,42,54,0.25)] border border-[rgba(61,122,138,0.45)] hover:from-[rgba(29,100,120,0.28)] hover:to-[rgba(15,60,80,0.22)] shadow-md hover:shadow-lg text-lb-800 dark:text-white rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Save User'}
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-[rgba(61,122,138,0.15)] pt-6"></div>

          {/* Groups Checklist Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap text-xs">
            <label className="flex items-center gap-2 font-bold text-lb-600 dark:text-lb-400 cursor-pointer uppercase tracking-wider">
              <input
                type="checkbox"
                checked={organizations.length > 0 && form.selected_groups.length === organizations.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded text-[#3d7a8a] focus:ring-[#3d7a8a] border-[rgba(61,122,138,0.25)] bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] accent-[#3d7a8a]"
              />
              Select All Groups
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3.5 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] dark:text-white w-48 font-medium text-xs shadow-sm"
              />
              <button
                type="button"
                className="px-3.5 py-2 bg-gradient-to-r from-[rgba(29,100,120,0.18)] to-[rgba(15,60,80,0.14)] dark:from-[rgba(61,122,138,0.35)] dark:to-[rgba(20,42,54,0.25)] border border-[rgba(61,122,138,0.45)] text-lb-800 dark:text-white rounded-xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
              >
                <i className="fa-solid fa-magnifying-glass text-xs"></i>
              </button>
            </div>
          </div>

          {/* Select Groups checklist */}
          <div className="space-y-4 pt-2">
            <h3 className="text-[#3d7a8a] dark:text-lb-300 font-bold text-xs uppercase tracking-wider">Select the Groups:</h3>
            
            {organizations.length === 0 ? (
              <div className="text-xs text-lb-400 font-semibold py-4">
                <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading groups...
              </div>
            ) : filteredOrgs.length === 0 ? (
              <div className="text-xs text-lb-400 font-semibold py-4">
                No groups match the search criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {filteredOrgs.map((org) => (
                  <label
                    key={org.id}
                    className="flex items-center gap-2.5 text-xs font-semibold text-lb-700 dark:text-lb-300 cursor-pointer hover:text-lb-900 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={form.selected_groups.includes(org.id)}
                      onChange={() => handleGroupToggle(org.id)}
                      className="w-4.5 h-4.5 rounded text-[#3d7a8a] focus:ring-[#3d7a8a] border-[rgba(61,122,138,0.25)] bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] accent-[#3d7a8a]"
                    />
                    {org.name.toUpperCase()}
                  </label>
                ))}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
