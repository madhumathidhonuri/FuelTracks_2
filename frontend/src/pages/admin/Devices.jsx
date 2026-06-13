import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';
import api from '../../api/axios';

const Devices = () => {
  // Page states
  const [view, setView] = useState('list'); // 'list' | 'add-device' | 'add-business'
  const [searchQuery, setSearchQuery] = useState('');
  const [devicesList, setDevicesList] = useState([]);
  const [totalDevices, setTotalDevices] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
        params: { search: searchQuery },
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
  }, [view, searchQuery]);

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

  // Render Table Columns for Main List
  const columns = [
    { key: 'imei', label: 'IMEI' },
    { key: 'device_name', label: 'Device Name' },
    { key: 'model', label: 'Model' },
    { key: 'plan', label: 'Plan', render: (v) => <span className="capitalize">{v}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={v}>{v}</Badge> },
    { key: 'registration_number', label: 'Assigned Vehicle' },
    { key: 'last_comm', label: 'Last Communication' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ═══ VIEW 1: DEVICES LIST ═══ */}
      {view === 'list' && (
        <>
          <Card>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h3 className="font-semibold text-sm text-text-primary font-display">Devices</h3>
              <div className="flex items-center gap-4">
                <SearchBar
                  placeholder="Search by IMEI or Name..."
                  onSearch={setSearchQuery}
                  className="w-64"
                />
                <button
                  onClick={() => setView('add-device')}
                  className="px-4 py-2 bg-[#1d6478] text-white rounded-xl text-sm font-semibold hover:bg-[#257c94] transition-colors flex items-center gap-2 shadow-[0_4px_12px_rgba(29,100,120,0.2)]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Device
                </button>
              </div>
            </div>
          </Card>
          
          <Card>
            <Table columns={columns} data={devicesList} emptyMessage="No devices found" loading={loading} />
          </Card>
        </>
      )}

      {/* ═══ VIEW 2: ADD DEVICE (STEP 1) ═══ */}
      {view === 'add-device' && (
        <div className="animate-fadeIn">
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
                  Business
                </span>
                <span>&gt;</span>
                <span className="text-lb-400">Add Device</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[24px] overflow-hidden max-w-5xl mx-auto">
            {/* Top Available Licenses Bar */}
            <div className="px-8 py-5 border-b border-[rgba(61,122,138,0.15)] flex justify-between items-center bg-[rgba(218,241,255,0.25)] dark:bg-[rgba(13,30,38,0.3)]">
              <span className="text-[14px] font-bold text-[#34d8b5] drop-shadow-sm">
                Available Licence : {licenceSummary.totalAvailable}
              </span>
            </div>

            {/* Form Body */}
            <div className="p-8 space-y-8 max-w-2xl mx-auto">
              {/* Licence Type */}
              <div className="grid grid-cols-[1fr_2fr] gap-6 items-center">
                <label className="text-sm font-semibold text-lb-700 dark:text-lb-400 text-right pr-4">
                  Licence Type :
                </label>
                <div>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full px-4 py-3 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl text-sm focus:outline-none focus:border-[#3d7a8a] dark:text-white font-medium"
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
              <div className="grid grid-cols-[1fr_2fr] gap-6 items-start">
                <label className="text-sm font-semibold text-lb-700 dark:text-lb-400 text-right pr-4 pt-3">
                  Number Of {selectedTier.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Devices :
                </label>
                <div className="space-y-1">
                  <div className="flex justify-end pr-2">
                    <span className="text-[11px] font-bold text-emerald-500">
                      Available : {getAvailableCountForTier(selectedTier)}
                    </span>
                  </div>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    className="w-full px-4 py-3 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl text-sm focus:outline-none focus:border-[#3d7a8a] dark:text-white"
                  />
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-center pt-6">
                <button
                  onClick={handleDeviceSubmit}
                  className="px-10 py-3 bg-[#1d6478] hover:bg-[#257c94] text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_rgba(29,100,120,0.3)] transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ VIEW 3: ADD BUSINESS (STEP 2) ═══ */}
      {view === 'add-business' && (
        <div className="animate-fadeIn">
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
                  Business
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

          <div className="glass-card rounded-[24px] overflow-hidden max-w-7xl mx-auto space-y-6 pb-8">
            {/* BUSINESS Section Header */}
            <div className="px-8 py-4 border-b border-[rgba(61,122,138,0.15)] bg-[rgba(218,241,255,0.25)] dark:bg-[rgba(13,30,38,0.3)]">
              <span className="text-[12px] font-bold uppercase tracking-wider text-lb-600 dark:text-lb-400">
                BUSINESS
              </span>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-8 pb-4">
                <div>
                  <label className="block text-[11px] font-bold text-lb-500 uppercase tracking-wider mb-2">
                    User Name
                  </label>
                  <input
                    type="text"
                    placeholder="User Name"
                    value={newUser.username}
                    onChange={(e) => setNewUser((p) => ({ ...p, username: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-lb-500 uppercase tracking-wider mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    placeholder="Mobile Number"
                    value={newUser.mobile}
                    onChange={(e) => setNewUser((p) => ({ ...p, mobile: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-lb-500 uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-lb-500 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto px-8 pb-4">
                <label className="block text-[11px] font-bold text-lb-500 uppercase tracking-wider mb-2 text-center">
                  Select Existing User
                </label>
                <select
                  value={selectedExistingUser}
                  onChange={(e) => setSelectedExistingUser(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white font-medium"
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
            <div className="border-t border-[rgba(61,122,138,0.12)] my-4"></div>

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
                Upload Devices
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
                Device Details
              </label>
            </div>

            {/* Method 1: Upload Devices */}
            {deviceInputType === 'upload' && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-8 px-8 max-w-3xl mx-auto animate-fadeIn">
                <button
                  onClick={handleDownloadTemplate}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
                >
                  Download Template
                </button>
                
                <div className="flex items-center bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-lg overflow-hidden">
                  <span className="px-4 py-2.5 text-xs text-lb-500 font-semibold bg-[rgba(61,122,138,0.08)] border-r border-[rgba(61,122,138,0.2)]">
                    Choose a File
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="px-4 py-2 text-xs font-semibold focus:outline-none dark:text-white"
                  />
                </div>

                <button
                  onClick={() => alert('Excel imported successfully! Preview details inside Grid Toggle.')}
                  className="px-5 py-2.5 bg-[#1d6478] hover:bg-[#257c94] text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
                >
                  Import Excel
                </button>
              </div>
            )}

            {/* Method 2: Devices Grid */}
            {deviceInputType === 'details' && (
              <div className="px-8 overflow-x-auto animate-fadeIn">
                <table className="w-full text-left border-collapse rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-[#5c54c4] text-white text-xs font-bold uppercase tracking-wider">
                      <th className="py-4 px-4 text-center w-12">No</th>
                      <th className="py-4 px-4">LicenceId({selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)})</th>
                      <th className="py-4 px-4">Device Id</th>
                      <th className="py-4 px-4">Device Type</th>
                      <th className="py-4 px-4">Vehicle Id</th>
                      <th className="py-4 px-4 text-center w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(61,122,138,0.12)]">
                    {deviceRows.map((row, index) => (
                      <>
                        <tr key={`row-${index}`} className="hover:bg-[rgba(61,122,138,0.03)] transition-colors">
                          {/* Row No */}
                          <td className="py-3 px-4 text-center font-bold text-xs text-lb-600 dark:text-lb-400">
                            {index + 1}
                          </td>
                          {/* Prepopulated Licence Id */}
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={row.licenceId}
                              disabled
                              className="w-full px-3 py-2 bg-lb-100 dark:bg-[rgba(255,255,255,0.06)] border border-[rgba(61,122,138,0.18)] rounded-lg text-xs font-bold text-lb-600 dark:text-lb-300 outline-none cursor-not-allowed"
                            />
                          </td>
                          {/* Device Id (IMEI) */}
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              placeholder="Device Id"
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
                              className="w-full px-3 py-2 bg-[rgba(218,241,255,0.3)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.2)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
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
                              placeholder="Vehicle Id"
                              value={row.vehicleId}
                              onChange={(e) => updateRowField(index, 'vehicleId', e.target.value)}
                              className="w-full px-3 py-2 bg-[rgba(218,241,255,0.3)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.2)] rounded-lg text-xs font-medium focus:outline-none focus:border-[#3d7a8a] dark:text-white"
                            />
                          </td>
                          {/* Action Button Details */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => toggleRowDetails(index)}
                              className={`px-3.5 py-1.5 text-[10px] font-bold text-white rounded-lg shadow-sm transition-colors ${
                                row.expanded ? 'bg-orange-500 hover:bg-orange-600' : 'bg-emerald-500 hover:bg-emerald-600'
                              }`}
                            >
                              Details
                            </button>
                          </td>
                        </tr>

                        {/* Expanded details container */}
                        {row.expanded && (
                          <tr key={`details-${index}`} className="bg-[rgba(92,84,196,0.03)] dark:bg-[rgba(92,84,196,0.01)]">
                            <td colSpan="6" className="py-4 px-6 border-l-2 border-[#5c54c4]">
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
                                    className="w-full px-3 py-2 bg-white dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.22)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
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
                                    className="w-full px-3 py-2 bg-white dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.22)] rounded-lg text-xs font-bold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
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
                                    className="w-full px-3 py-2 bg-white dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.22)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
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
                                    className="w-full px-3 py-2 bg-white dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.22)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
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
                                    className="w-full px-3 py-2 bg-white dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.22)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
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
                                    className="w-full px-3 py-2 bg-white dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.22)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
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
                                    className="w-full px-3 py-2 bg-white dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.22)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
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
                                    className="w-full px-3 py-2 bg-white dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.22)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
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

            {/* Form Footer Action centered */}
            <div className="flex justify-center items-center gap-4 pt-8 border-t border-[rgba(61,122,138,0.12)]">
              <button
                onClick={() => setView('add-device')}
                className="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white text-xs font-bold rounded-lg transition-colors"
                disabled={actionLoading}
              >
                &larr; Back
              </button>
              <button
                onClick={handleOnboardSubmit}
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md transition-colors"
                disabled={actionLoading}
              >
                {actionLoading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;
