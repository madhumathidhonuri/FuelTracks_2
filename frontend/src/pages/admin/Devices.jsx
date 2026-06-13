import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import api from '../../api/axios';

const Devices = () => {
  // Page states
  const [view, setView] = useState('list'); // 'list' | 'add-device' | 'add-business'
  const [searchQuery, setSearchQuery] = useState('');
  const [devicesList, setDevicesList] = useState([]);
  const [totalDevices, setTotalDevices] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination states
  const [entriesLimit, setEntriesLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Licence state
  const [licenceSummary, setLicenceSummary] = useState({ data: [], totalAvailable: 0 });
  
  // Step 1: Add Device Form State
  const [selectedTier, setSelectedTier] = useState('starter');
  const [quantity, setQuantity] = useState('1');

  // Step 2: Add Business Form State
  const [userType, setUserType] = useState('new'); // 'new' | 'existing'
  
  // New User fields
  const [newUser, setNewUser] = useState({
    username: '',
    mobile: '',
    email: '',
    password: '',
  });

  // Existing User fields
  const [existingUsers, setExistingUsers] = useState([]);
  const [selectedExistingUser, setSelectedExistingUser] = useState('');

  // Grid details / input method
  const [deviceInputType, setDeviceInputType] = useState('details'); // 'details' | 'upload'
  const [deviceRows, setDeviceRows] = useState([]);

  // Fetch devices in main list
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/devices', {
        params: {
          search: searchQuery,
          page: currentPage,
          limit: entriesLimit,
        },
      });
      if (res.data.success) {
        setDevicesList(res.data.data);
        setTotalDevices(res.data.total);
      }
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available licences
  const fetchLicences = async () => {
    try {
      const res = await api.get('/devices/licences/available');
      if (res.data.success) {
        setLicenceSummary(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch available licences:', err);
    }
  };

  // Fetch users list for existing users dropdown
  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setExistingUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchDevices();
    }
  }, [view, searchQuery, currentPage, entriesLimit]);

  useEffect(() => {
    fetchLicences();
  }, []);

  useEffect(() => {
    if (userType === 'existing') {
      fetchUsers();
    }
  }, [userType]);

  // Get current available for selected tier
  const getAvailableCountForTier = (tier) => {
    const item = licenceSummary.data.find((l) => l.tier === tier);
    return item ? item.available : 0;
  };

  // Helper to generate a dummy license key based on selected tier
  const generateLicenceKey = (tier) => {
    const prefix = tier.substring(0, 2).toUpperCase();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `${prefix}${random}`;
  };

  // Handle Step 1 Submit
  const handleDeviceSubmit = () => {
    const qty = parseInt(quantity);

    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity.');
      return;
    }

    // Initialize rows for Step 2
    const rows = [];
    for (let i = 0; i < qty; i++) {
      rows.push({
        licenceId: generateLicenceKey(selectedTier),
        imei: '',
        model: 'A10 (9896)',
        vehicleId: '',
        expanded: false,
        vehicleName: '',
        vehicleType: 'car',
        gpsSimNo: '',
        odoDistance: '',
        serviceEngineer: '',
        salesman: '',
        ticketId: '',
        sensorNo: '',
      });
    }
    setDeviceRows(rows);
    setView('add-business');
  };

  // Toggle row expansion in step 2 grid
  const toggleRowDetails = (index) => {
    setDeviceRows((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, expanded: !row.expanded } : row))
    );
  };

  // Update a field inside a specific row
  const updateRowField = (index, field, value) => {
    setDeviceRows((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
    );
  };

  // Download template CSV
  const handleDownloadTemplate = () => {
    const headers = 'LicenceId,Device Id,Device Type,Vehicle Id,Vehicle Name,Vehicle Type,GPS Sim No,Odo Distance,Service Engineer,Salesman,Ticket Id,Sensor No\n';
    const row = `${generateLicenceKey(selectedTier)},357586700123470,A10 (9896),KA01AB1111,Sample Vehicle,car,+91-9999999999,1000,Eng-01,Sales-02,T-100,S-200`;
    const blob = new Blob([headers + row], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${selectedTier}_onboard_template.csv`);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Parse uploaded CSV
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      if (lines.length <= 1) return;

      const parsed = [];
      const qty = parseInt(quantity) || 1;

      // Parse lines, respect quantity limit set in step 1
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(',');
        if (cols.length < 3) continue;

        parsed.push({
          licenceId: cols[0] || generateLicenceKey(selectedTier),
          imei: cols[1] || '',
          model: cols[2] || 'A10 (9896)',
          vehicleId: cols[3] || '',
          expanded: false,
          vehicleName: cols[4] || '',
          vehicleType: cols[5] || 'car',
          gpsSimNo: cols[6] || '',
          odoDistance: cols[7] || '',
          serviceEngineer: cols[8] || '',
          salesman: cols[9] || '',
          ticketId: cols[10] || '',
          sensorNo: cols[11] || '',
        });

        if (parsed.length >= qty) break;
      }

      // If imported less than quantity, fill remaining with blank rows
      while (parsed.length < qty) {
        parsed.push({
          licenceId: generateLicenceKey(selectedTier),
          imei: '',
          model: 'A10 (9896)',
          vehicleId: '',
          expanded: false,
          vehicleName: '',
          vehicleType: 'car',
          gpsSimNo: '',
          odoDistance: '',
          serviceEngineer: '',
          salesman: '',
          ticketId: '',
          sensorNo: '',
        });
      }

      setDeviceRows(parsed);
      alert(`Successfully imported ${parsed.filter((r) => r.imei).length} devices from file.`);
    };
    reader.readAsText(file);
  };

  // Handle final Submit (Onboard call to backend API)
  const handleOnboardSubmit = async () => {
    // Validate inputs
    if (userType === 'new') {
      if (!newUser.username || !newUser.email || !newUser.mobile || !newUser.password) {
        alert('Please fill out all user details.');
        return;
      }
    } else {
      if (!selectedExistingUser) {
        alert('Please select an existing user.');
        return;
      }
    }

    // Validate devices details grid
    const activeRows = deviceRows.filter((r) => r.imei);
    if (activeRows.length === 0) {
      alert('Please fill in details for at least one device (Device Id / IMEI is required).');
      return;
    }

    // Verify all active rows have a vehicle name / identifier
    for (const r of activeRows) {
      if (!r.imei || r.imei.length < 10) {
        alert(`Please enter a valid Device Id (IMEI) for device.`);
        return;
      }
    }

    // Map payload
    const payload = {
      plan: selectedTier,
      quantity: parseInt(quantity),
      userType: userType,
      newUser: userType === 'new' ? {
        username: newUser.username,
        email: newUser.email,
        mobile: newUser.mobile,
        password: newUser.password,
      } : undefined,
      existingUser: userType === 'existing' ? {
        username: selectedExistingUser,
      } : undefined,
      devices: activeRows.map((r) => ({
        imei: r.imei,
        deviceName: r.vehicleName || `GPS-${r.imei.substring(r.imei.length - 4)}`,
        model: r.model,
        vehicle: {
          vehicleName: r.vehicleName || `VH-${r.imei.substring(r.imei.length - 4)}`,
          registrationNumber: r.vehicleId || '',
          gpsSimNo: r.gpsSimNo || '',
          odoDistance: r.odoDistance ? parseFloat(r.odoDistance) : 0,
          serviceEngineer: r.serviceEngineer || '',
          salesman: r.salesman || '',
          ticketId: r.ticketId || '',
          sensorNo: r.sensorNo || '',
        },
      })),
    };

    try {
      setActionLoading(true);
      const res = await api.post('/devices/onboard', payload);
      if (res.data.success) {
        alert('Devices and vehicles onboarded successfully!');
        setView('list');
        // Reset states
        setSelectedTier('starter');
        setQuantity('1');
        setNewUser({ username: '', mobile: '', email: '', password: '' });
        setSelectedExistingUser('');
        fetchLicences();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Onboarding failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ═══ VIEW 1: DEVICES LIST ═══ */}
      {view === 'list' && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold font-display text-lb-800 dark:text-white">Devices</h2>
              <div className="h-6 w-[1px] bg-[rgba(61,122,138,0.25)]"></div>
              <div className="flex items-center gap-2 text-xs font-semibold text-lb-500 uppercase tracking-wider">
                <Link to="/admin" className="hover:text-lb-700 transition-colors">
                  <i className="fa-solid fa-house"></i>
                </Link>
                <span>&gt;</span>
                <span className="text-lb-400">Devices</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('add-device')}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[rgba(29,100,120,0.18)] to-[rgba(15,60,80,0.14)] dark:from-[rgba(61,122,138,0.35)] dark:to-[rgba(20,42,54,0.25)] border border-[rgba(61,122,138,0.45)] hover:from-[rgba(29,100,120,0.28)] hover:to-[rgba(15,60,80,0.22)] shadow-md text-lb-800 dark:text-white rounded-xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
              >
                <i className="fa-solid fa-plus text-[11px] text-[#3d7a8a] dark:text-white"></i>
                Add Device
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
                  placeholder="Search IMEI or name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3.5 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] dark:text-white w-48 font-medium text-xs"
                />
              </div>
            </div>

            {/* Custom Table Grid */}
            <div className="overflow-x-auto md:overflow-visible">
              <table className="w-full text-left border-collapse rounded-2xl shadow-sm border border-[rgba(61,122,138,0.15)]">
                <thead>
                  <tr className="bg-[rgba(61,122,138,0.08)] dark:bg-[rgba(13,30,38,0.6)] text-lb-800 dark:text-white text-[11px] font-bold uppercase tracking-wider border-b border-[rgba(61,122,138,0.22)]">
                    <th className="py-4 px-4 text-center rounded-tl-2xl w-16">SNo</th>
                    <th className="py-4 px-4">IMEI</th>
                    <th className="py-4 px-4">Device Name</th>
                    <th className="py-4 px-4">Model</th>
                    <th className="py-4 px-4">Plan</th>
                    <th className="py-4 px-4 text-center w-28">Status</th>
                    <th className="py-4 px-4">Assigned Vehicle</th>
                    <th className="py-4 px-4 rounded-tr-2xl">Last Communication</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(61,122,138,0.12)]">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="py-10 text-center text-xs text-lb-500 font-semibold">
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading devices...
                      </td>
                    </tr>
                  ) : devicesList.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-10 text-center text-xs text-lb-500 font-semibold">
                        No devices found
                      </td>
                    </tr>
                  ) : (
                    devicesList.map((d, idx) => (
                      <tr key={d.id || idx} className="hover:bg-[rgba(61,122,138,0.03)] dark:hover:bg-[rgba(255,255,255,0.01)] transition-colors text-xs font-semibold text-lb-800 dark:text-lb-200 border-b border-[rgba(61,122,138,0.1)]">
                        <td className="py-4 px-4 text-center font-bold text-lb-500">
                          {(currentPage - 1) * entriesLimit + idx + 1}
                        </td>
                        <td className="py-4 px-4 font-mono select-all text-[11px]">{d.imei}</td>
                        <td className="py-4 px-4 font-bold">{d.device_name}</td>
                        <td className="py-4 px-4 text-lb-600 dark:text-lb-300">{d.model || '-'}</td>
                        <td className="py-4 px-4 capitalize">{d.plan}</td>
                        <td className="py-4 px-4 text-center">
                          <Badge variant={d.status}>{d.status}</Badge>
                        </td>
                        <td className="py-4 px-4 font-bold text-lb-700 dark:text-lb-300">
                          {d.registration_number || d.vehicle_name || <span className="text-lb-400 font-normal">Unassigned</span>}
                        </td>
                        <td className="py-4 px-4 text-lb-500 font-mono text-[10px] whitespace-nowrap">
                          {d.last_comm ? new Date(d.last_comm).toISOString().replace('T', ' ').substring(0, 19) : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between flex-wrap gap-4 pt-4 text-xs font-semibold text-lb-500">
              <div>
                Showing {devicesList.length > 0 ? (currentPage - 1) * entriesLimit + 1 : 0} to{' '}
                {Math.min(currentPage * entriesLimit, totalDevices)} of {totalDevices} entries
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
                  onClick={() => setCurrentPage((p) => Math.min(Math.ceil(totalDevices / entriesLimit), p + 1))}
                  disabled={currentPage >= Math.ceil(totalDevices / entriesLimit)}
                  className="px-3.5 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[rgba(61,122,138,0.06)] transition-all text-xs"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══ VIEW 2: ADD DEVICE (STEP 1) ═══ */}
      {view === 'add-device' && (
        <div className="animate-fadeIn max-w-3xl mx-auto mt-4">
          {/* Breadcrumbs and Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold font-display text-lb-800 dark:text-white">Add Device</h2>
              <div className="h-6 w-[1px] bg-[rgba(61,122,138,0.25)]"></div>
              <div className="flex items-center gap-2 text-xs font-semibold text-lb-500 uppercase tracking-wider">
                <i
                  className="fa-solid fa-house cursor-pointer hover:text-lb-700 transition-colors"
                  onClick={() => setView('list')}
                ></i>
                <span>&gt;</span>
                <span className="hover:text-lb-700 cursor-pointer" onClick={() => setView('list')}>
                  Devices
                </span>
                <span>&gt;</span>
                <span className="text-lb-400">Add Device</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[24px] !overflow-visible p-8">
            {/* Top Available Licenses Bar */}
            <div className="mb-8 border-b border-[rgba(61,122,138,0.15)] pb-6 flex justify-between items-center">
              <div>
                <h3 className="font-display text-[22px] font-bold text-lb-800 dark:text-white">
                  Step 1: Choose Licence & Quantity
                </h3>
                <p className="text-lb-500 text-xs mt-1">Select the subscription plan tier and enter the number of devices to onboard.</p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-[rgba(52,216,181,0.15)] border border-[rgba(52,216,181,0.3)] text-[#0a8f78] dark:text-[#34d8b5] font-bold text-xs">
                Available Licence: {licenceSummary.totalAvailable}
              </div>
            </div>

            {/* Form Body */}
            <div className="space-y-6 max-w-xl mx-auto">
              {/* Licence Type */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-lb-500 uppercase tracking-wider">
                  Licence Type
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(7,81,134,0.45)]">
                    <i className="fa-solid fa-file-invoice-dollar text-[13px]"></i>
                  </div>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl text-sm focus:outline-none focus:border-[#3d7a8a] dark:text-white font-semibold text-lb-800"
                  >
                    <option value="starter">Starter</option>
                    <option value="basic">Basic</option>
                    <option value="advance">Advance</option>
                    <option value="premium">Premium</option>
                    <option value="premium_plus">Premium Plus</option>
                  </select>
                </div>
              </div>

              {/* Quantity Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-lb-500 uppercase tracking-wider">
                    Number Of {selectedTier.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Devices
                  </label>
                  <span className="text-[10px] font-bold text-emerald-500">
                    Available: {getAvailableCountForTier(selectedTier)}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(7,81,134,0.45)]">
                    <i className="fa-solid fa-cubes text-[13px]"></i>
                  </div>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    className="w-full pl-10 pr-4 py-3 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl text-sm focus:outline-none focus:border-[#3d7a8a] dark:text-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-8 border-t border-[rgba(61,122,138,0.15)]">
                <button
                  onClick={() => setView('list')}
                  className="px-5 py-2.5 bg-gradient-to-r from-gray-500/80 to-gray-600/80 hover:from-gray-500 hover:to-gray-600 text-white font-bold rounded-xl text-xs transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeviceSubmit}
                  className="px-8 py-2.5 bg-gradient-to-r from-[rgba(29,100,120,0.18)] to-[rgba(15,60,80,0.14)] dark:from-[rgba(61,122,138,0.35)] dark:to-[rgba(20,42,54,0.25)] border border-[rgba(61,122,138,0.45)] hover:from-[rgba(29,100,120,0.28)] hover:to-[rgba(15,60,80,0.22)] shadow-md text-lb-800 dark:text-white rounded-xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ VIEW 3: ADD BUSINESS (STEP 2) ═══ */}
      {view === 'add-business' && (
        <div className="animate-fadeIn max-w-7xl mx-auto space-y-6">
          {/* Breadcrumbs and Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold font-display text-lb-800 dark:text-white">Add Business</h2>
              <div className="h-6 w-[1px] bg-[rgba(61,122,138,0.25)]"></div>
              <div className="flex items-center gap-2 text-xs font-semibold text-lb-500 uppercase tracking-wider">
                <i
                  className="fa-solid fa-house cursor-pointer hover:text-lb-700 transition-colors"
                  onClick={() => setView('list')}
                ></i>
                <span>&gt;</span>
                <span className="hover:text-lb-700 cursor-pointer" onClick={() => setView('list')}>
                  Devices
                </span>
                <span>&gt;</span>
                <span className="hover:text-lb-700 cursor-pointer" onClick={() => setView('add-device')}>
                  Add Device
                </span>
                <span>&gt;</span>
                <span className="text-lb-400">Add Business</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[24px] !overflow-visible p-8 space-y-6">
            <div className="border-b border-[rgba(61,122,138,0.15)] pb-4">
              <h3 className="font-display text-lg font-bold text-lb-800 dark:text-white uppercase tracking-wider">
                Business & Account Settings
              </h3>
              <p className="text-lb-500 text-xs mt-1">Specify whether to assign these tracking devices to a new user account or select an existing one.</p>
            </div>

            {/* Toggle New / Existing User */}
            <div className="flex justify-center items-center gap-12 py-4">
              <label className="flex items-center gap-2.5 text-sm font-semibold text-lb-700 dark:text-lb-300 cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="new"
                  checked={userType === 'new'}
                  onChange={() => setUserType('new')}
                  className="w-4 h-4 text-[#3d7a8a] focus:ring-[#3d7a8a] accent-[#3d7a8a]"
                />
                New User
              </label>
              <label className="flex items-center gap-2.5 text-sm font-semibold text-lb-700 dark:text-lb-300 cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="existing"
                  checked={userType === 'existing'}
                  onChange={() => setUserType('existing')}
                  className="w-4 h-4 text-[#3d7a8a] focus:ring-[#3d7a8a] accent-[#3d7a8a]"
                />
                Existing User
              </label>
            </div>

            {/* User Details Grid */}
            {userType === 'new' ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-4 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.3)] p-6 rounded-2xl border border-[rgba(61,122,138,0.12)]">
                <div>
                  <label className="block text-[10px] font-bold text-lb-500 uppercase tracking-wider mb-2">
                    User Name
                  </label>
                  <input
                    type="text"
                    placeholder="User Name"
                    value={newUser.username}
                    onChange={(e) => setNewUser((p) => ({ ...p, username: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-lb-500 uppercase tracking-wider mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    placeholder="Mobile Number"
                    value={newUser.mobile}
                    onChange={(e) => setNewUser((p) => ({ ...p, mobile: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-lb-500 uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-lb-500 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto pb-4 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.3)] p-6 rounded-2xl border border-[rgba(61,122,138,0.12)]">
                <label className="block text-[10px] font-bold text-lb-500 uppercase tracking-wider mb-2 text-center">
                  Select Existing User
                </label>
                <select
                  value={selectedExistingUser}
                  onChange={(e) => setSelectedExistingUser(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white font-semibold text-lb-800"
                >
                  <option value="">Select User</option>
                  {existingUsers.map((u) => (
                    <option key={u.id} value={u.username}>
                      {u.username} ({u.companyName || 'Demo Org'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Separator */}
            <div className="border-t border-[rgba(61,122,138,0.12)] my-6"></div>

            {/* Upload / Grid details Toggle */}
            <div className="flex justify-center items-center gap-12 py-2">
              <label className="flex items-center gap-2.5 text-sm font-semibold text-lb-700 dark:text-lb-300 cursor-pointer">
                <input
                  type="radio"
                  name="deviceInputType"
                  value="upload"
                  checked={deviceInputType === 'upload'}
                  onChange={() => setDeviceInputType('upload')}
                  className="w-4 h-4 text-[#3d7a8a] focus:ring-[#3d7a8a] accent-[#3d7a8a]"
                />
                Upload Devices (CSV/Excel)
              </label>
              <label className="flex items-center gap-2.5 text-sm font-semibold text-lb-700 dark:text-lb-300 cursor-pointer">
                <input
                  type="radio"
                  name="deviceInputType"
                  value="details"
                  checked={deviceInputType === 'details'}
                  onChange={() => setDeviceInputType('details')}
                  className="w-4 h-4 text-[#3d7a8a] focus:ring-[#3d7a8a] accent-[#3d7a8a]"
                />
                Device Specification Grid
              </label>
            </div>

            {/* Method 1: Upload Devices */}
            {deviceInputType === 'upload' && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-8 px-8 max-w-3xl mx-auto animate-fadeIn bg-[rgba(218,241,255,0.15)] dark:bg-[rgba(13,30,38,0.25)] rounded-2xl border border-dashed border-[rgba(61,122,138,0.3)]">
                <button
                  onClick={handleDownloadTemplate}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <i className="fa-solid fa-download mr-1.5"></i> Download Template
                </button>
                
                <div className="flex items-center bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl overflow-hidden shadow-sm">
                  <span className="px-4 py-2.5 text-xs text-lb-500 font-bold bg-[rgba(61,122,138,0.08)] border-r border-[rgba(61,122,138,0.2)]">
                    Select File
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="px-4 py-2 text-xs font-semibold focus:outline-none dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Method 2: Devices Grid */}
            {deviceInputType === 'details' && (
              <div className="px-4 overflow-x-auto md:overflow-visible animate-fadeIn">
                <table className="w-full text-left border-collapse rounded-xl overflow-hidden border border-[rgba(61,122,138,0.15)]">
                  <thead>
                    <tr className="bg-[rgba(61,122,138,0.08)] dark:bg-[rgba(13,30,38,0.6)] text-lb-800 dark:text-white text-[11px] font-bold uppercase tracking-wider border-b border-[rgba(61,122,138,0.22)]">
                      <th className="py-4 px-4 text-center rounded-tl-xl w-12">No</th>
                      <th className="py-4 px-4">LicenceId({selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)})</th>
                      <th className="py-4 px-4">Device IMEI</th>
                      <th className="py-4 px-4">Device Model</th>
                      <th className="py-4 px-4">Vehicle ID (Reg No)</th>
                      <th className="py-4 px-4 text-center rounded-tr-xl w-24">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(61,122,138,0.12)]">
                    {deviceRows.map((row, index) => (
                      <>
                        <tr key={`row-${index}`} className="hover:bg-[rgba(61,122,138,0.03)] dark:hover:bg-[rgba(255,255,255,0.01)] transition-colors text-xs font-semibold text-lb-800 dark:text-lb-200">
                          {/* Row No */}
                          <td className="py-3 px-4 text-center font-bold text-xs text-lb-500">
                            {index + 1}
                          </td>
                          {/* Prepopulated Licence Id */}
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={row.licenceId}
                              disabled
                              className="w-full px-3 py-2 bg-[rgba(61,122,138,0.06)] dark:bg-[rgba(255,255,255,0.03)] border border-[rgba(61,122,138,0.18)] rounded-lg text-xs font-bold text-lb-500 dark:text-lb-400 outline-none cursor-not-allowed"
                            />
                          </td>
                          {/* Device Id (IMEI) */}
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              placeholder="15-digit IMEI"
                              value={row.imei}
                              onChange={(e) => updateRowField(index, 'imei', e.target.value)}
                              className="w-full px-3 py-2 bg-[rgba(218,241,255,0.3)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.2)] rounded-lg text-xs font-medium focus:outline-none focus:border-[#3d7a8a] dark:text-white"
                            />
                          </td>
                          {/* Device Type (Model) */}
                          <td className="py-3 px-4">
                            <select
                              value={row.model}
                              onChange={(e) => updateRowField(index, 'model', e.target.value)}
                              className="w-full px-3 py-2 bg-[rgba(218,241,255,0.3)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.2)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white text-lb-800"
                            >
                              <option value="A10 (9896)">A10 (9896)</option>
                              <option value="TK316">TK316</option>
                              <option value="AIS140">AIS140</option>
                              <option value="GPS Tracker">GPS Tracker</option>
                            </select>
                          </td>
                          {/* Vehicle Id */}
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              placeholder="e.g. MH12AB1234"
                              value={row.vehicleId}
                              onChange={(e) => updateRowField(index, 'vehicleId', e.target.value)}
                              className="w-full px-3 py-2 bg-[rgba(218,241,255,0.3)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.2)] rounded-lg text-xs font-medium focus:outline-none focus:border-[#3d7a8a] dark:text-white"
                            />
                          </td>
                          {/* Action Button Details */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => toggleRowDetails(index)}
                              className={`px-3 py-1.5 text-[10px] font-bold text-white rounded-lg shadow-sm transition-colors ${
                                row.expanded ? 'bg-orange-500 hover:bg-orange-600' : 'bg-emerald-500 hover:bg-emerald-600'
                              }`}
                            >
                              {row.expanded ? 'Hide Details' : 'Set Details'}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded details container */}
                        {row.expanded && (
                          <tr key={`details-${index}`} className="bg-[rgba(61,122,138,0.03)] dark:bg-[rgba(255,255,255,0.01)] border-b border-[rgba(61,122,138,0.1)]">
                            <td colSpan="6" className="py-4 px-6 border-l-2 border-[#3d7a8a]">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Vehicle Name */}
                                <div>
                                  <label className="block text-[10px] font-bold text-lb-500 uppercase tracking-widest mb-1.5">
                                    Vehicle Name
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Vehicle Name"
                                    value={row.vehicleName}
                                    onChange={(e) => updateRowField(index, 'vehicleName', e.target.value)}
                                    className="w-full px-3 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.2)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
                                  />
                                </div>
                                {/* Vehicle Type */}
                                <div>
                                  <label className="block text-[10px] font-bold text-lb-500 uppercase tracking-widest mb-1.5">
                                    Vehicle Type
                                  </label>
                                  <select
                                    value={row.vehicleType}
                                    onChange={(e) => updateRowField(index, 'vehicleType', e.target.value)}
                                    className="w-full px-3 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.2)] rounded-lg text-xs font-bold focus:outline-none focus:border-[#3d7a8a] dark:text-white text-lb-800"
                                  >
                                    <option value="car">Car</option>
                                    <option value="truck">Truck</option>
                                    <option value="bus">Bus</option>
                                    <option value="bike">Bike</option>
                                  </select>
                                </div>
                                {/* GPS Sim No */}
                                <div>
                                  <label className="block text-[10px] font-bold text-lb-500 uppercase tracking-widest mb-1.5">
                                    GPS Sim No
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="GPS Sim No"
                                    value={row.gpsSimNo}
                                    onChange={(e) => updateRowField(index, 'gpsSimNo', e.target.value)}
                                    className="w-full px-3 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.2)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
                                  />
                                </div>
                                {/* Odo Distance */}
                                <div>
                                  <label className="block text-[10px] font-bold text-lb-500 uppercase tracking-widest mb-1.5">
                                    Odo Distance
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="Odo Distance"
                                    value={row.odoDistance}
                                    onChange={(e) => updateRowField(index, 'odoDistance', e.target.value)}
                                    className="w-full px-3 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.2)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
                                  />
                                </div>
                                {/* Service Engineer */}
                                <div>
                                  <label className="block text-[10px] font-bold text-lb-500 uppercase tracking-widest mb-1.5">
                                    Service Engineer
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Service Engineer"
                                    value={row.serviceEngineer}
                                    onChange={(e) => updateRowField(index, 'serviceEngineer', e.target.value)}
                                    className="w-full px-3 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.2)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
                                  />
                                </div>
                                {/* Salesman */}
                                <div>
                                  <label className="block text-[10px] font-bold text-lb-500 uppercase tracking-widest mb-1.5">
                                    Salesman
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Salesman"
                                    value={row.salesman}
                                    onChange={(e) => updateRowField(index, 'salesman', e.target.value)}
                                    className="w-full px-3 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.2)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
                                  />
                                </div>
                                {/* Ticket Id */}
                                <div>
                                  <label className="block text-[10px] font-bold text-lb-500 uppercase tracking-widest mb-1.5">
                                    Ticket Id
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Ticket Id"
                                    value={row.ticketId}
                                    onChange={(e) => updateRowField(index, 'ticketId', e.target.value)}
                                    className="w-full px-3 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.2)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
                                  />
                                </div>
                                {/* Sensor No */}
                                <div>
                                  <label className="block text-[10px] font-bold text-lb-500 uppercase tracking-widest mb-1.5">
                                    Sensor No
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Sensor No"
                                    value={row.sensorNo}
                                    onChange={(e) => updateRowField(index, 'sensorNo', e.target.value)}
                                    className="w-full px-3 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.2)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Form Footer Action */}
            <div className="flex justify-between items-center pt-8 border-t border-[rgba(61,122,138,0.12)]">
              <button
                onClick={() => setView('add-device')}
                className="px-5 py-2.5 bg-gradient-to-r from-gray-500/80 to-gray-600/80 hover:from-gray-500 hover:to-gray-600 text-white font-bold rounded-xl text-xs transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                disabled={actionLoading}
              >
                &larr; Back
              </button>
              <button
                onClick={handleOnboardSubmit}
                className="px-8 py-2.5 bg-gradient-to-r from-[rgba(29,100,120,0.18)] to-[rgba(15,60,80,0.14)] dark:from-[rgba(61,122,138,0.35)] dark:to-[rgba(20,42,54,0.25)] border border-[rgba(61,122,138,0.45)] hover:from-[rgba(29,100,120,0.28)] hover:to-[rgba(15,60,80,0.22)] shadow-md text-lb-800 dark:text-white rounded-xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
                disabled={actionLoading}
              >
                {actionLoading ? 'Submitting...' : 'Submit Onboarding'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;
