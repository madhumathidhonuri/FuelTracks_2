import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

const TIER_THEMES = {
  starter:      { name: 'Starter',      badgeClass: 'bg-[rgba(52,216,181,0.08)] border border-[rgba(52,216,181,0.25)] text-[#0a8f78] dark:text-[#34d8b5] dark:border-[rgba(52,216,181,0.4)]', textClass: 'text-[#0a8f78] dark:text-[#34d8b5]' },
  basic:        { name: 'Basic',        badgeClass: 'bg-[rgba(61,122,138,0.08)] border border-[rgba(61,122,138,0.22)] text-[#3d7a8a] dark:text-[#8ec4cc] dark:border-[rgba(61,122,138,0.4)]', textClass: 'text-[#3d7a8a] dark:text-[#8ec4cc]' },
  advance:      { name: 'Advance',      badgeClass: 'bg-[rgba(167,139,250,0.08)] border border-[rgba(167,139,250,0.25)] text-[#5b21b6] dark:text-[#c084fc] dark:border-[rgba(167,139,250,0.4)]', textClass: 'text-[#5b21b6] dark:text-[#c084fc]' },
  premium:      { name: 'Premium',      badgeClass: 'bg-[rgba(251,191,36,0.08)] border border-[rgba(251,191,36,0.25)] text-[#92650a] dark:text-[#fbbf24] dark:border-[rgba(251,191,36,0.4)]', textClass: 'text-[#92650a] dark:text-[#fbbf24]' },
  premium_plus: { name: 'Premium Plus', badgeClass: 'bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.25)] text-[#b91c1c] dark:text-[#f87171] dark:border-[rgba(248,113,113,0.4)]', textClass: 'text-[#b91c1c] dark:text-[#f87171]' },
};

const getTierTheme = (tierKey) =>
  TIER_THEMES[(tierKey || '').toLowerCase()] || TIER_THEMES.basic;

const getLicenceId = (plan, imei, id) => {
  const prefix = (plan || 'basic').substring(0, 2).toUpperCase();
  if (imei) {
    return `${prefix}${imei.substring(0, 4)}${imei.substring(imei.length - 8)}`;
  }
  return `${prefix}${id ? id.substring(0, 10).toUpperCase() : 'UNKNOWN'}`;
};

const Billing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'all'); // 'all' | 'renew' | 'pre-renewed' | 'expired'
  const [searchQuery, setSearchQuery] = useState('');
  const [licenceIdSearch, setLicenceIdSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && urlTab !== tab) {
      setTab(urlTab);
    }
  }, [searchParams]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      // Combine queries if needed or search specifically
      const combinedSearch = licenceIdSearch || searchQuery;
      const res = await api.get('/devices/licences/billing-overview', {
        params: {
          page,
          limit,
          search: combinedSearch,
          tab
        }
      });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [tab, page, limit, searchQuery, licenceIdSearch]);

  // Reset checkboxes when tab changes
  useEffect(() => {
    setSelectedIds([]);
  }, [tab]);

  // Export to CSV function
  const handleExportCSV = () => {
    if (!data || !data.licences || data.licences.length === 0) return;

    const headers = [
      'Licence ID', 'Vehicle ID', 'Vehicle Name', 'Type', 'Device ID',
      'Organization', 'Device Model', 'Dealer Name', 'Gps Sim No',
      'Licence Issued Date', 'Licence Onboard Date', 'Licence Expire Date', 'Status'
    ];

    const rows = data.licences.map(lic => {
      const lid = getLicenceId(lic.plan_type, lic.imei, lic.id);
      const isExpired = new Date(lic.licence_expire_date) < new Date();
      const status = lic.device_status === 'pre-renewed' ? 'Pre-Renewed' : isExpired ? 'Expired' : 'Active';
      return [
        lid,
        lic.registration_number || '-',
        lic.vehicle_name || '-',
        lic.plan_type || 'basic',
        lic.imei || '-',
        lic.organization_name || '-',
        lic.device_model || 'GPS Tracker',
        lic.dealer_name || 'FUELVIEW1',
        lic.gps_sim_no || '-',
        lic.licence_issued_date ? new Date(lic.licence_issued_date).toLocaleDateString('en-IN') : '-',
        lic.onboard_date ? new Date(lic.onboard_date).toLocaleDateString('en-IN') : '-',
        lic.licence_expire_date ? new Date(lic.licence_expire_date).toLocaleDateString('en-IN') : '-',
        status
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `licence_billing_report_${tab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Renew a single licence
  const handleRenewSingle = async (id) => {
    if (window.confirm('Are you sure you want to renew this licence? This will extend its validity.')) {
      try {
        setActionLoading(true);
        const res = await api.post('/devices/licences/renew', { deviceIds: id });
        if (res.data.success) {
          alert('Licence renewed successfully!');
          fetchBillingData();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Renewal failed');
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Cancel pre-renewal
  const handleCancelPreRenew = async (id) => {
    if (window.confirm('Are you sure you want to cancel the pre-renewal for this licence?')) {
      try {
        setActionLoading(true);
        const res = await api.post('/devices/licences/cancel-pre-renew', { deviceId: id });
        if (res.data.success) {
          alert('Pre-renewal cancelled successfully!');
          fetchBillingData();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Cancellation failed');
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Bulk renew selected expired licences
  const handleBulkRenew = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to renew ${selectedIds.length} selected expired licence(s)?`)) {
      try {
        setActionLoading(true);
        const res = await api.post('/devices/licences/renew', { deviceIds: selectedIds });
        if (res.data.success) {
          alert('Selected licences renewed successfully!');
          setSelectedIds([]);
          fetchBillingData();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Bulk renewal failed');
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Toggle selection for bulk renew
  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle select all on current page
  const handleSelectAll = (checked, list) => {
    if (checked) {
      setSelectedIds(list.map(l => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const {
    totalSummary = { starter: 0, basic: 0, advance: 0, premium: 0, premium_plus: 0 },
    availableSummary = { starter: 0, basic: 0, advance: 0, premium: 0, premium_plus: 0 },
    licences = [],
    total = 0
  } = data || {};

  return (
    <div className="space-y-7 animate-fadeIn text-lb-800 dark:text-white">
      {/* Header and Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold font-display text-lb-800 dark:text-white">Billing & Licence Management</h2>
          <div className="h-6 w-[1px] bg-[rgba(61,122,138,0.25)]"></div>
          <div className="flex items-center gap-2 text-xs font-semibold text-lb-500 uppercase tracking-wider">
            <Link to="/admin" className="hover:text-lb-700 transition-colors">
              <i className="fa-solid fa-house"></i>
            </Link>
            <span>&gt;</span>
            <span className="text-lb-400">Billing</span>
          </div>
        </div>

        {/* Top Right Licence ID Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search Licence ID..."
            value={licenceIdSearch}
            onChange={(e) => {
              setLicenceIdSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.22)] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] text-lb-800 dark:text-white shadow-sm transition-all"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-lb-400 dark:text-lb-300">
            <i className="fa-solid fa-search text-[11px]" />
          </div>
        </div>
      </div>

      {/* Tabs Navigator and Warning Text Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-[rgba(61,122,138,0.06)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.12)]">
          {[
            { key: 'all', label: 'Licences', icon: 'fa-id-card' },
            { key: 'renew', label: 'Renew', icon: 'fa-rotate' },
            { key: 'pre-renewed', label: 'Pre-Renewed', icon: 'fa-clock' },
            { key: 'expired', label: 'Expired', icon: 'fa-circle-xmark' },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => {
                setTab(key);
                setSearchParams({ tab: key });
                setPage(1);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                tab === key
                  ? 'bg-white dark:bg-[#0d1e26] text-lb-800 dark:text-white shadow-md scale-[1.02]'
                  : 'text-lb-500 dark:text-lb-400 hover:text-lb-800 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
              }`}
            >
              <i className={`fa-solid ${icon} text-[11.5px]`} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {tab === 'renew' && (
          <span className="text-[11px] font-bold text-red-500 dark:text-red-400 select-none bg-red-50 dark:bg-red-950/25 px-3.5 py-1.5 rounded-xl border border-red-200/40 shadow-sm self-end sm:self-auto animate-pulse">
            * Expiring in 30 days
          </span>
        )}
      </div>

      {/* Summary Counters (Total & Available Licences) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Total Licences Panel */}
        <div className="kpi-card rounded-[22px] p-5">
          <div className="flex items-center gap-2 pb-3.5 mb-4 border-b border-[rgba(61,122,138,0.1)]">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[rgba(56,175,249,0.12)] text-[#1b6fad] dark:text-[#38aff9] border border-[rgba(56,175,249,0.22)] dark:border-[rgba(56,175,249,0.4)]">
              <i className="fa-solid fa-layer-group text-[12px]" />
            </div>
            <h4 className="font-display font-bold text-[13px] text-lb-800 dark:text-white uppercase tracking-[0.06em]">Total Licence</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-center">
            {Object.entries(TIER_THEMES).map(([tierKey, theme]) => (
              <div key={tierKey} className={`rounded-xl p-3 ${theme.badgeClass}`}>
                <span className="block text-[8.5px] font-extrabold uppercase tracking-wide mb-1">
                  {theme.name}
                </span>
                <span className="font-display text-[22px] font-extrabold block leading-none">
                  {totalSummary[tierKey] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Available Licences Panel */}
        <div className="kpi-card rounded-[22px] p-5">
          <div className="flex items-center gap-2 pb-3.5 mb-4 border-b border-[rgba(61,122,138,0.1)]">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[rgba(52,216,181,0.12)] text-[#0a8f78] dark:text-[#34d8b5] border border-[rgba(52,216,181,0.22)] dark:border-[rgba(52,216,181,0.4)]">
              <i className="fa-solid fa-circle-check text-[12px]" />
            </div>
            <h4 className="font-display font-bold text-[13px] text-lb-800 dark:text-white uppercase tracking-[0.06em]">Available Licence</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-center">
            {Object.entries(TIER_THEMES).map(([tierKey, theme]) => (
              <div key={tierKey} className={`rounded-xl p-3 ${theme.badgeClass}`}>
                <span className="block text-[8.5px] font-extrabold uppercase tracking-wide mb-1">
                  {theme.name}
                </span>
                <span className="font-display text-[22px] font-extrabold block leading-none">
                  {availableSummary[tierKey] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Licences Data Table Card */}
      <div className="glass-card rounded-[24px] p-6">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-5 border-b border-[rgba(61,122,138,0.12)]">
          {/* Entries selector */}
          <div className="flex items-center gap-2 text-xs font-semibold text-lb-600 dark:text-lb-400">
            <span>Show</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-bold text-lb-700 dark:text-white cursor-pointer"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>entries</span>
          </div>

          {/* Quick filters / Export actions */}
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            {/* Search filter input */}
            <div className="relative flex-1 sm:w-56">
              <input
                type="text"
                placeholder="Search table..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-3.5 pr-8 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.22)] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#3d7a8a] dark:text-white"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-lb-400 dark:text-lb-300">
                <i className="fa-solid fa-search text-[10px]" />
              </div>
            </div>

            {/* Export Excel button */}
            <button
              onClick={handleExportCSV}
              title="Export Excel"
              disabled={licences.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[rgba(52,216,181,0.15)] to-[rgba(52,216,181,0.08)] border border-[rgba(52,216,181,0.35)] text-[#0a8f78] dark:text-[#34d8b5] hover:bg-[rgba(52,216,181,0.2)] rounded-xl text-xs font-bold shadow-md transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <i className="fa-solid fa-file-excel text-[13px]" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Table Body Area */}
        <div className="overflow-x-auto relative">
          <table className="w-full text-left border-collapse rounded-2xl shadow-sm border border-[rgba(61,122,138,0.15)]">
            <thead>
              <tr className="bg-[rgba(61,122,138,0.08)] dark:bg-[rgba(13,30,38,0.6)] text-lb-800 dark:text-white text-[10.5px] font-extrabold uppercase tracking-wider border-b border-[rgba(61,122,138,0.22)]">
                {tab === 'expired' && (
                  <th className="py-4 px-3.5 text-center w-12 border-r border-[rgba(61,122,138,0.12)]">
                    <input
                      type="checkbox"
                      className="accent-[#38aff9] cursor-pointer"
                      checked={licences.length > 0 && selectedIds.length === licences.length}
                      onChange={(e) => handleSelectAll(e.target.checked, licences)}
                    />
                  </th>
                )}
                <th className="py-4 px-3.5 whitespace-nowrap">Licence ID</th>
                <th className="py-4 px-3.5 whitespace-nowrap">Vehicle ID</th>
                <th className="py-4 px-3.5 whitespace-nowrap">Vehicle Name</th>
                <th className="py-4 px-3.5 whitespace-nowrap">Type</th>
                <th className="py-4 px-3.5 whitespace-nowrap">Device ID</th>
                <th className="py-4 px-3.5 whitespace-nowrap">Organization</th>
                <th className="py-4 px-3.5 whitespace-nowrap">Device Model</th>
                {tab !== 'expired' && <th className="py-4 px-3.5 whitespace-nowrap">Dealer Name</th>}
                <th className="py-4 px-3.5 whitespace-nowrap">Gps Sim No</th>
                <th className="py-4 px-3.5 whitespace-nowrap">Licence Issued Date</th>
                <th className="py-4 px-3.5 whitespace-nowrap">Licence Onboard Date</th>
                <th className="py-4 px-3.5 whitespace-nowrap">Licence Expire Date</th>
                
                {tab === 'renew' && <th className="py-4 px-3.5 whitespace-nowrap">Left to Renewal</th>}
                
                {tab === 'all' && <th className="py-4 px-3.5 text-center whitespace-nowrap">Status</th>}
                {(tab === 'renew' || tab === 'pre-renewed') && <th className="py-4 px-3.5 text-center whitespace-nowrap">Action</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-[rgba(61,122,138,0.12)] text-xs font-semibold text-lb-800 dark:text-lb-200">
              {loading ? (
                <tr>
                  <td colSpan="15" className="py-12 text-center text-lb-500 font-bold dark:text-lb-400">
                    <i className="fa-solid fa-spinner fa-spin mr-2" /> Fetching licences...
                  </td>
                </tr>
              ) : licences.length === 0 ? (
                <tr>
                  <td colSpan="15" className="py-14 text-center text-lb-400 dark:text-lb-500">
                    No matching licences found
                  </td>
                </tr>
              ) : (
                licences.map((lic) => {
                  const licId = getLicenceId(lic.plan_type, lic.imei, lic.id);
                  const isExpired = new Date(lic.licence_expire_date) < new Date();
                  const theme = getTierTheme(lic.plan_type);

                  // Computed status label
                  const computedStatus = lic.device_status === 'pre-renewed' ? 'Pre-Renewed' : isExpired ? 'Expired' : 'Active';

                  // Calculated days left
                  const daysLeft = Math.ceil((new Date(lic.licence_expire_date) - Date.now()) / 86400000);

                  return (
                    <tr key={lic.id} className="hover:bg-[rgba(61,122,138,0.03)] dark:hover:bg-[rgba(255,255,255,0.01)] transition-colors border-b border-[rgba(61,122,138,0.1)]">
                      {tab === 'expired' && (
                        <td className="py-3 px-3.5 text-center border-r border-[rgba(61,122,138,0.1)]">
                          <input
                            type="checkbox"
                            className="accent-[#38aff9] cursor-pointer"
                            checked={selectedIds.includes(lic.id)}
                            onChange={() => handleToggleSelect(lic.id)}
                          />
                        </td>
                      )}
                      
                      <td className="py-3 px-3.5 font-bold font-mono text-[11px] text-[#2a6070] dark:text-[#8ec4cc] select-all">
                        {licId}
                      </td>
                      <td className="py-3 px-3.5 text-lb-600 dark:text-lb-300 truncate">{lic.registration_number || '-'}</td>
                      <td className="py-3 px-3.5 font-bold text-lb-700 dark:text-white truncate">{lic.vehicle_name || '-'}</td>
                      <td className="py-3 px-3.5">
                        <span className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider ${theme.badgeClass}`}>
                          {theme.name}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[11px] select-all text-lb-500 dark:text-lb-400">{lic.imei || '-'}</td>
                      <td className="py-3 px-3.5 text-lb-700 dark:text-white font-bold truncate">{lic.organization_name || '-'}</td>
                      <td className="py-3 px-3.5 text-lb-500 dark:text-lb-400 font-medium truncate">{lic.device_model || 'GPS Tracker'}</td>
                      {tab !== 'expired' && (
                        <td className="py-3 px-3.5 font-medium text-lb-500 dark:text-lb-400">{lic.dealer_name || 'FUELVIEW1'}</td>
                      )}
                      <td className="py-3 px-3.5 text-lb-500 dark:text-lb-400 font-semibold">{lic.gps_sim_no || '-'}</td>
                      <td className="py-3 px-3.5 text-lb-500 dark:text-lb-400 whitespace-nowrap">
                        {lic.licence_issued_date ? new Date(lic.licence_issued_date).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td className="py-3 px-3.5 text-lb-500 dark:text-lb-400 whitespace-nowrap">
                        {lic.onboard_date ? new Date(lic.onboard_date).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td className={`py-3 px-3.5 font-bold whitespace-nowrap ${isExpired ? 'text-red-500 dark:text-red-400' : 'text-[#1b6fad] dark:text-[#38aff9]'}`}>
                        {lic.licence_expire_date ? new Date(lic.licence_expire_date).toLocaleDateString('en-IN') : '-'}
                      </td>

                      {/* Tab Renew specific: Left to renewal */}
                      {tab === 'renew' && (
                        <td className="py-3 px-3.5 font-extrabold text-[11.5px] whitespace-nowrap"
                          style={{ color: daysLeft <= 0 ? '#ef4444' : daysLeft <= 7 ? '#f97316' : '#92650a' }}>
                          {daysLeft}-Days
                        </td>
                      )}

                      {/* Tab Action columns */}
                      {tab === 'all' && (
                        <td className="py-3 px-3.5 text-center">
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            computedStatus === 'Pre-Renewed'
                              ? 'bg-[rgba(56,175,249,0.12)] text-[#38aff9] border-[rgba(56,175,249,0.25)]'
                              : isExpired
                              ? 'bg-[rgba(248,113,113,0.12)] text-[#ef4444] dark:text-red-400 border-[rgba(248,113,113,0.25)]'
                              : 'bg-[rgba(52,216,181,0.12)] text-[#0a8f78] dark:text-[#34d8b5] border-[rgba(52,216,181,0.25)] dark:border-[rgba(52,216,181,0.4)]'
                          }`}>
                            {computedStatus}
                          </span>
                        </td>
                      )}

                      {tab === 'renew' && (
                        <td className="py-3 px-3.5 text-center">
                          <button
                            onClick={() => handleRenewSingle(lic.id)}
                            disabled={actionLoading}
                            className="px-3.5 py-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-lg font-bold text-[10px] shadow-sm transition-colors uppercase tracking-wider"
                          >
                            Renew
                          </button>
                        </td>
                      )}

                      {tab === 'pre-renewed' && (
                        <td className="py-3 px-3.5 text-center">
                          <button
                            onClick={() => handleCancelPreRenew(lic.id)}
                            disabled={actionLoading}
                            className="px-3.5 py-1.5 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-lg font-bold text-[10px] shadow-sm transition-colors uppercase tracking-wider"
                          >
                            Cancel
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-[rgba(61,122,138,0.12)]">
          {/* Selected Count for Renew (Expired tab) */}
          {tab === 'expired' && (
            <button
              onClick={handleBulkRenew}
              disabled={selectedIds.length === 0 || actionLoading}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[rgba(29,100,120,0.18)] to-[rgba(15,60,80,0.14)] dark:from-[rgba(61,122,138,0.35)] dark:to-[rgba(20,42,54,0.25)] border border-[rgba(61,122,138,0.45)] hover:from-[rgba(29,100,120,0.28)] hover:to-[rgba(15,60,80,0.22)] text-lb-800 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <i className="fa-solid fa-arrows-rotate text-[11px]" />
              <span>Renew ({selectedIds.length} Selected)</span>
            </button>
          )}

          <div className="text-xs font-semibold text-lb-500 dark:text-lb-400">
            Showing {licences.length > 0 ? (page - 1) * limit + 1 : 0} to{' '}
            {Math.min(page * limit, total)} of {total} entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3.5 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[rgba(61,122,138,0.06)] dark:hover:bg-[rgba(61,122,138,0.18)] transition-all text-xs font-bold text-lb-600 dark:text-lb-300"
            >
              Previous
            </button>
            <span className="px-3.5 py-2 bg-gradient-to-r from-[rgba(29,100,120,0.18)] to-[rgba(15,60,80,0.14)] dark:from-[rgba(61,122,138,0.35)] dark:to-[rgba(20,42,54,0.25)] border border-[rgba(61,122,138,0.4)] text-lb-800 dark:text-white font-extrabold rounded-xl font-display text-xs">
              {page}
            </span>
            <button
              onClick={() => setPage(p => Math.min(Math.ceil(total / limit), p + 1))}
              disabled={page >= Math.ceil(total / limit)}
              className="px-3.5 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[rgba(61,122,138,0.06)] dark:hover:bg-[rgba(61,122,138,0.18)] transition-all text-xs font-bold text-lb-600 dark:text-lb-300"
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Billing;
