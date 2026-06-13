import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AddTagsModal from './AddTagsModal';


const Sidebar = ({ user }) => {
  const location = useLocation();
  const [auditOpen, setAuditOpen] = useState(location.pathname.startsWith('/admin/audit'));
  const [archivedAuditOpen, setArchivedAuditOpen] = useState(location.pathname.startsWith('/admin/archived-audit'));
  const [vehiclesOpen, setVehiclesOpen] = useState(
    location.pathname.startsWith('/admin/vehicles-search') ||
    location.pathname.startsWith('/admin/vehicles-list') ||
    location.pathname.startsWith('/admin/view-vehicles') ||
    location.pathname.startsWith('/admin/vehicle-statuses') ||
    location.pathname.startsWith('/admin/view-tags')
  );
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(
    location.pathname.startsWith('/track') || location.pathname.startsWith('/history')
  );
  const [reportsOpen, setReportsOpen] = useState(
    location.pathname.startsWith('/reports')
  );
  const [analyticsOpen, setAnalyticsOpen] = useState(
    location.pathname.startsWith('/analytics')
  );
  const [statisticsOpen, setStatisticsOpen] = useState(
    location.pathname.startsWith('/statistics')
  );
  const [sensorsOpen, setSensorsOpen] = useState(
    location.pathname.startsWith('/sensors')
  );
  const [protocolReportOpen, setProtocolReportOpen] = useState(
    location.pathname.startsWith('/sensors/protocol-report')
  );
  const [performanceOpen, setPerformanceOpen] = useState(
    location.pathname.startsWith('/performance')
  );



  const userLinks = [
    { path: '/dashboard', icon: 'fa-gauge-high', label: 'Dashboard' },
  ];

  const adminLinks = [
    { path: '/admin', icon: 'fa-screwdriver-wrench', label: 'Overview' },
    { path: '/admin/billing', icon: 'fa-credit-card', label: 'Billing' },
    { path: '/admin/organizations', icon: 'fa-sitemap', label: 'Organizations' },
    { path: '/admin/devices', icon: 'fa-tablet-screen-button', label: 'Devices' },
    { path: '/admin/groups', icon: 'fa-users-gear', label: 'Groups' },
    { path: '/admin/users', icon: 'fa-users', label: 'Users' },
    { path: '/admin/settings', icon: 'fa-gear', label: 'Settings' },
  ];


  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const renderLink = (link) => (
    <NavLink
      key={link.path}
      to={link.path}
      end={link.path === '/admin'}
      className={({ isActive }) =>
        `nav-item group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer relative overflow-hidden
         text-[13px] font-medium mb-0.5 transition-all duration-200 ${isActive
          ? 'nav-item active text-lb-800 font-semibold'
          : 'text-lb-600 hover:bg-[rgba(61,122,138,0.09)] hover:text-lb-800'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Icon container */}
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[12px] transition-all duration-200"
            style={isActive ? {
              background: 'rgba(61,122,138,0.18)',
              boxShadow: '0 2px 8px rgba(15,60,80,0.12)',
            } : {}}
          >
            <i className={`fa-solid ${link.icon}`} />
          </div>
          <span>{link.label}</span>
        </>
      )}
    </NavLink>
  );

  const initials = ((user?.name || user?.first_name || 'A')[0] || 'A').toUpperCase();
  const fullName = user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Administrator';
  const roleLabel = user?.role === 'admin' || user?.role === 'superadmin' ? 'Fleet Manager' : 'Operator';

  return (
    <aside
      className="w-[220px] min-h-screen fixed left-0 top-0 bottom-0 flex flex-col z-50 py-5 sidebar"
      style={{
        background: 'rgba(240,248,255,0.96)',
        backdropFilter: 'blur(28px) saturate(1.1)',
        borderRight: '1px solid rgba(61,122,138,0.14)',
        boxShadow: '4px 0 28px rgba(15,60,80,0.06)',
        color: '#0f2d3d',
      }}
      id="sidebar"
    >
      {/* ── Brand header ── */}
      <div
        className="flex items-center gap-2.5 px-5 pb-5 mb-2"
        style={{ borderBottom: '1px solid rgba(61,122,138,0.12)' }}
      >
        {/* Logo icon */}
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[16px] flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(61,122,138,0.22), rgba(15,60,80,0.14))',
            border: '1px solid rgba(61,122,138,0.35)',
            color: '#2a6070',
            boxShadow: '0 4px 12px rgba(15,60,80,0.1)',
          }}
        >
          <i className="fa-solid fa-gas-pump" />
        </div>

        <div>
          <div className="font-display text-[16px] font-bold text-lb-800 leading-tight">FuelTracks</div>
          <div className="text-[9px] uppercase tracking-widest text-lb-400 font-semibold">Fleet Platform</div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {!isAdmin && <div className="nav-section">Overview</div>}
        {!isAdmin && (
          <>
            {userLinks.slice(0, 1).map(renderLink)}
            
            {/* Collapsible Tracking Link */}
            <div>
              <button
                onClick={() => setTrackingOpen(!trackingOpen)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer relative overflow-hidden text-[13.5px] font-medium mb-0.5 transition-all duration-200 ${
                  location.pathname.startsWith('/track') || location.pathname.startsWith('/history')
                    ? 'text-lb-800 font-semibold'
                    : 'text-lb-600 hover:bg-[rgba(61,122,138,0.09)] hover:text-lb-800'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[12px] transition-all duration-200"
                  style={(location.pathname.startsWith('/track') || location.pathname.startsWith('/history')) ? {
                    background: 'rgba(61,122,138,0.18)',
                    boxShadow: '0 2px 8px rgba(15,60,80,0.12)',
                  } : {}}
                >
                  <i className="fa-solid fa-location-crosshairs" />
                </div>
                <span>Tracking</span>
                <i className={`fa-solid fa-chevron-down ml-auto text-[10px] transition-transform duration-200 ${trackingOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {trackingOpen && (
                <div className="pl-4 space-y-0.5 mt-0.5 border-l border-[rgba(61,122,138,0.15)] ml-[21px]">
                  {[
                    { path: '/track', label: 'Single Track' },
                    { path: '/track?mode=multi', label: 'Multi Track' },
                    { path: '/history', label: 'History' },
                  ].map((sub) => (
                    <NavLink
                      key={sub.label}
                      to={sub.path}
                      className={({ isActive }) =>
                        `block px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                          isActive
                            ? 'bg-[rgba(61,122,138,0.12)] text-[#2a6070] font-semibold shadow-sm'
                            : 'text-lb-600 hover:bg-[rgba(61,122,138,0.06)] hover:text-lb-800'
                        }`
                      }
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {/* Collapsible Reports Link */}
            <div>
              <button
                onClick={() => setReportsOpen(!reportsOpen)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer relative overflow-hidden text-[13.5px] font-medium mb-0.5 transition-all duration-200 ${
                  location.pathname.startsWith('/reports')
                    ? 'text-lb-800 font-semibold'
                    : 'text-lb-600 hover:bg-[rgba(61,122,138,0.09)] hover:text-lb-800'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[12px] transition-all duration-200"
                  style={location.pathname.startsWith('/reports') ? {
                    background: 'rgba(61,122,138,0.18)',
                    boxShadow: '0 2px 8px rgba(15,60,80,0.12)',
                  } : {}}
                >
                  <i className="fa-solid fa-chart-line" />
                </div>
                <span>Reports</span>
                <i className={`fa-solid fa-chevron-down ml-auto text-[10px] transition-transform duration-200 ${reportsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {reportsOpen && (
                <div className="pl-4 space-y-0.5 mt-0.5 border-l border-[rgba(61,122,138,0.15)] ml-[21px]">
                  {[
                    { path: '/reports/dashboard', label: 'Dashboard' },
                    { path: '/reports/vehicles-consolidated', label: 'Vehicles Consolidated' },
                    { path: '/reports/consolidated-site-location', label: 'Consolidated Site & Location' },
                    { path: '/reports/consolidated-overspeed', label: 'Consolidated Overspeed' },
                    { path: '/reports/consolidated-stoppage', label: 'Consolidated Stoppage' },
                    { path: '/reports/consolidated-site-report', label: 'Consolidated Site Report' },
                    { path: '/reports/tollgate-report', label: 'Tollgate Report' },
                    { path: '/reports/non-moving-vehicles', label: 'Non Moving Vehicles' },
                    { path: '/reports/travel-summary-report', label: 'Travel Summary Report' },
                    { path: '/reports/consolidated-primary-engine', label: 'Consolidated Primary Engine' },
                    { path: '/reports/site-stoppage-alert-report', label: 'Site Stoppage Alert Report' },
                    { path: '/reports/consolidated-alarm-report', label: 'Consolidated Alarm Report' },
                  ].map((sub) => (
                    <NavLink
                      key={sub.label}
                      to={sub.path}
                      className={({ isActive }) =>
                        `block px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                          isActive
                            ? 'bg-[rgba(61,122,138,0.12)] text-[#2a6070] font-semibold shadow-sm'
                            : 'text-lb-600 hover:bg-[rgba(61,122,138,0.06)] hover:text-lb-800'
                        }`
                      }
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
            {/* Collapsible Statistics Link */}
            <div>
              <button
                onClick={() => setStatisticsOpen(!statisticsOpen)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer relative overflow-hidden text-[13.5px] font-medium mb-0.5 transition-all duration-200 ${
                  location.pathname.startsWith('/statistics')
                    ? 'text-lb-800 font-semibold'
                    : 'text-lb-600 hover:bg-[rgba(61,122,138,0.09)] hover:text-lb-800'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[12px] transition-all duration-200"
                  style={location.pathname.startsWith('/statistics') ? {
                    background: 'rgba(61,122,138,0.18)',
                    boxShadow: '0 2px 8px rgba(15,60,80,0.12)',
                  } : {}}
                >
                  <i className="fa-solid fa-chart-bar" />
                </div>
                <span>Statistics</span>
                <i className={`fa-solid fa-chevron-down ml-auto text-[10px] transition-transform duration-200 ${statisticsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {statisticsOpen && (
                <div className="pl-4 space-y-0.5 mt-0.5 border-l border-[rgba(61,122,138,0.15)] ml-[21px]">
                  {[
                    { path: '/statistics/vehiclewise-performance', label: 'Vehiclewise Performance' },
                    { path: '/statistics/monthly-dist', label: 'Monthly Dist' },
                  ].map((sub) => (
                    <NavLink
                      key={sub.label}
                      to={sub.path}
                      className={({ isActive }) =>
                        `block px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                          isActive
                            ? 'bg-[rgba(61,122,138,0.12)] text-[#2a6070] font-semibold shadow-sm'
                            : 'text-lb-600 hover:bg-[rgba(61,122,138,0.06)] hover:text-lb-800'
                        }`
                      }
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {/* Collapsible Analytics Link */}
            <div>
              <button
                onClick={() => setAnalyticsOpen(!analyticsOpen)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer relative overflow-hidden text-[13.5px] font-medium mb-0.5 transition-all duration-200 ${
                  location.pathname.startsWith('/analytics')
                    ? 'text-lb-800 font-semibold'
                    : 'text-lb-600 hover:bg-[rgba(61,122,138,0.09)] hover:text-lb-800'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[12px] transition-all duration-200"
                  style={location.pathname.startsWith('/analytics') ? {
                    background: 'rgba(61,122,138,0.18)',
                    boxShadow: '0 2px 8px rgba(15,60,80,0.12)',
                  } : {}}
                >
                  <i className="fa-solid fa-chart-pie" />
                </div>
                <span>Analytics</span>
                <i className={`fa-solid fa-chevron-down ml-auto text-[10px] transition-transform duration-200 ${analyticsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {analyticsOpen && (
                <div className="pl-4 space-y-0.5 mt-0.5 border-l border-[rgba(61,122,138,0.15)] ml-[21px]">
                  {[
                    { path: '/analytics/movement', label: 'Movement' },
                    { path: '/analytics/overspeed', label: 'Overspeed' },
                    { path: '/analytics/parked', label: 'Parked' },
                    { path: '/analytics/idle', label: 'Idle' },
                    { path: '/analytics/ignition', label: 'Ignition' },
                    { path: '/analytics/site-trip', label: 'Site Trip' },
                    { path: '/analytics/trip-summary', label: 'Trip Summary' },
                    { path: '/analytics/alarm', label: 'Alarm' },
                    { path: '/analytics/stoppage', label: 'Stoppage' },
                    { path: '/analytics/no-data', label: 'No Data' },
                    { path: '/analytics/route-deviation', label: 'Route Deviation' },
                  ].map((sub) => (
                    <NavLink
                      key={sub.label}
                      to={sub.path}
                      className={({ isActive }) =>
                        `block px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                          isActive
                            ? 'bg-[rgba(61,122,138,0.12)] text-[#2a6070] font-semibold shadow-sm'
                            : 'text-lb-600 hover:bg-[rgba(61,122,138,0.06)] hover:text-lb-800'
                        }`
                      }
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {/* Collapsible Sensors Link */}
            <div>
              <button
                onClick={() => setSensorsOpen(!sensorsOpen)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer relative overflow-hidden text-[13.5px] font-medium mb-0.5 transition-all duration-200 ${
                  location.pathname.startsWith('/sensors')
                    ? 'text-lb-800 font-semibold'
                    : 'text-lb-600 hover:bg-[rgba(61,122,138,0.09)] hover:text-lb-800'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[12px] transition-all duration-200"
                  style={location.pathname.startsWith('/sensors') ? {
                    background: 'rgba(61,122,138,0.18)',
                    boxShadow: '0 2px 8px rgba(15,60,80,0.12)',
                  } : {}}
                >
                  <i className="fa-solid fa-heart-pulse" />
                </div>
                <span>Sensors</span>
                <i className={`fa-solid fa-chevron-down ml-auto text-[10px] transition-transform duration-200 ${sensorsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {sensorsOpen && (
                <div className="pl-4 space-y-0.5 mt-0.5 border-l border-[rgba(61,122,138,0.15)] ml-[21px]">
                  {[
                    { path: '/sensors/idle-wastage', label: 'Idle Wastage' },
                    { path: '/sensors/engine-on', label: 'Engine On' },
                  ].map((sub) => (
                    <NavLink
                      key={sub.label}
                      to={sub.path}
                      className={({ isActive }) =>
                        `block px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                          isActive
                            ? 'bg-[rgba(61,122,138,0.12)] text-[#2a6070] font-semibold shadow-sm'
                            : 'text-lb-600 hover:bg-[rgba(61,122,138,0.06)] hover:text-lb-800'
                        }`
                      }
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                  
                  {/* Nested Collapsible Protocol Report */}
                  <div>
                    <button
                      onClick={() => setProtocolReportOpen(!protocolReportOpen)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                        location.pathname.startsWith('/sensors/protocol-report')
                          ? 'bg-[rgba(61,122,138,0.12)] text-[#2a6070] font-semibold shadow-sm'
                          : 'text-lb-600 hover:bg-[rgba(61,122,138,0.06)] hover:text-lb-800'
                      }`}
                    >
                      <span>Protocol Report</span>
                      <i className={`fa-solid fa-chevron-down text-[9px] transition-transform duration-200 ${protocolReportOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {protocolReportOpen && (
                      <div className="pl-3 mt-0.5 space-y-0.5 border-l border-[rgba(61,122,138,0.15)] ml-2">
                        {[
                          { path: '/sensors/protocol-report/device-data', label: 'Device Data' },
                          { path: '/sensors/protocol-report/data-consumption', label: 'Data Consumption' },
                        ].map((sub) => (
                          <NavLink
                            key={sub.label}
                            to={sub.path}
                            className={({ isActive }) =>
                              `block px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                                isActive
                                  ? 'bg-[rgba(61,122,138,0.12)] text-[#2a6070] font-semibold shadow-sm'
                                  : 'text-lb-500 hover:bg-[rgba(61,122,138,0.06)] hover:text-lb-800'
                              }`
                            }
                          >
                            {sub.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Collapsible Performance Link */}
            <div>
              <button
                onClick={() => setPerformanceOpen(!performanceOpen)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer relative overflow-hidden text-[13.5px] font-medium mb-0.5 transition-all duration-200 ${
                  location.pathname.startsWith('/performance')
                    ? 'text-lb-800 font-semibold'
                    : 'text-lb-600 hover:bg-[rgba(61,122,138,0.09)] hover:text-lb-800'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[12px] transition-all duration-200"
                  style={location.pathname.startsWith('/performance') ? {
                    background: 'rgba(61,122,138,0.18)',
                    boxShadow: '0 2px 8px rgba(15,60,80,0.12)',
                  } : {}}
                >
                  <i className="fa-solid fa-chart-simple" />
                </div>
                <span>Performance</span>
                <i className={`fa-solid fa-chevron-down ml-auto text-[10px] transition-transform duration-200 ${performanceOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {performanceOpen && (
                <div className="pl-4 space-y-0.5 mt-0.5 border-l border-[rgba(61,122,138,0.15)] ml-[21px]">
                  {[
                    { path: '/performance/daily', label: 'Daily Performance' },
                    { path: '/performance/monthly', label: 'Monthly Performance' },
                  ].map((sub) => (
                    <NavLink
                      key={sub.label}
                      to={sub.path}
                      className={({ isActive }) =>
                        `block px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                          isActive
                            ? 'bg-[rgba(61,122,138,0.12)] text-[#2a6070] font-semibold shadow-sm'
                            : 'text-lb-600 hover:bg-[rgba(61,122,138,0.06)] hover:text-lb-800'
                        }`
                      }
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {isAdmin && (
          <>
            <div className="nav-section" style={{ marginTop: '12px' }}>Administration</div>
            {adminLinks.slice(0, 5).map(renderLink)}


            {/* Collapsible Audit Link */}
            <div>
              <button
                onClick={() => setAuditOpen(!auditOpen)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer relative overflow-hidden text-[13.5px] font-medium mb-0.5 transition-all duration-200 ${location.pathname.startsWith('/admin/audit')
                    ? 'text-lb-800 font-semibold'
                    : 'text-lb-600 hover:bg-[rgba(61,122,138,0.09)] hover:text-lb-800'
                  }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[12px] transition-all duration-200"
                  style={location.pathname.startsWith('/admin/audit') ? {
                    background: 'rgba(61,122,138,0.18)',
                    boxShadow: '0 2px 8px rgba(15,60,80,0.12)',
                  } : {}}
                >
                  <i className="fa-solid fa-shield-halved" />
                </div>
                <span>Audit</span>
                <i className={`fa-solid fa-chevron-down ml-auto text-[10px] transition-transform duration-200 ${auditOpen ? 'rotate-180' : ''}`} />
              </button>

              {auditOpen && (
                <div className="pl-4 space-y-0.5 mt-0.5 border-l border-[rgba(61,122,138,0.15)] ml-[21px]">
                  {[
                    { path: '/admin/audit/dealer', label: 'Auditing' },
                    { path: '/admin/audit/users', label: 'Users' },
                    { path: '/admin/audit/vehicles', label: 'Vehicles' },
                    { path: '/admin/audit/calibrate', label: 'Calibrate' },
                    { path: '/admin/audit/renewals', label: 'Renewal Details' },
                    { path: '/admin/audit/groups', label: 'Groups' },
                    { path: '/admin/audit/organizations', label: 'Organizations' },
                  ].map((sub) => (
                    <NavLink
                      key={sub.path}
                      to={sub.path}
                      className={({ isActive }) =>
                        `block px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${isActive
                          ? 'bg-[rgba(61,122,138,0.12)] text-[#2a6070] font-semibold shadow-sm'
                          : 'text-lb-600 hover:bg-[rgba(61,122,138,0.06)] hover:text-lb-800'
                        }`
                      }
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {/* Collapsible Archived Audit Link */}
            <div>
              <button
                onClick={() => setArchivedAuditOpen(!archivedAuditOpen)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer relative overflow-hidden text-[13.5px] font-medium mb-0.5 transition-all duration-200 ${location.pathname.startsWith('/admin/archived-audit')
                    ? 'text-lb-800 font-semibold'
                    : 'text-lb-600 hover:bg-[rgba(61,122,138,0.09)] hover:text-lb-800'
                  }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[12px] transition-all duration-200"
                  style={location.pathname.startsWith('/admin/archived-audit') ? {
                    background: 'rgba(61,122,138,0.18)',
                    boxShadow: '0 2px 8px rgba(15,60,80,0.12)',
                  } : {}}
                >
                  <i className="fa-solid fa-box-archive" />
                </div>
                <span>Archived Audit</span>
                <i className={`fa-solid fa-chevron-down ml-auto text-[10px] transition-transform duration-200 ${archivedAuditOpen ? 'rotate-180' : ''}`} />
              </button>

              {archivedAuditOpen && (
                <div className="pl-4 space-y-0.5 mt-0.5 border-l border-[rgba(61,122,138,0.15)] ml-[21px]">
                  {[
                    { path: '/admin/archived-audit/auditing', label: 'Auditing' },
                    { path: '/admin/archived-audit/users', label: 'Users' },
                    { path: '/admin/archived-audit/vehicles', label: 'Vehicles' },
                    { path: '/admin/archived-audit/manual_calibrate', label: 'Manual Calibrate' },
                    { path: '/admin/archived-audit/auto_calibrate', label: 'Auto Calibrate' },
                    { path: '/admin/archived-audit/groups', label: 'Groups' },
                    { path: '/admin/archived-audit/organizations', label: 'Organizations' },
                  ].map((sub) => (
                    <NavLink
                      key={sub.path}
                      to={sub.path}
                      className={({ isActive }) =>
                        `block px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${isActive
                          ? 'bg-[rgba(61,122,138,0.12)] text-[#2a6070] font-semibold shadow-sm'
                          : 'text-lb-600 hover:bg-[rgba(61,122,138,0.06)] hover:text-lb-800'
                        }`
                      }
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>


            {/* Collapsible Vehicles Link */}
            <div>
              <button
                onClick={() => setVehiclesOpen(!vehiclesOpen)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer relative overflow-hidden text-[13.5px] font-medium mb-0.5 transition-all duration-200 ${location.pathname.startsWith('/admin/vehicles-') ||
                    location.pathname.startsWith('/admin/view-vehicles') ||
                    location.pathname.startsWith('/admin/vehicle-statuses') ||
                    location.pathname.startsWith('/admin/view-tags')
                    ? 'text-lb-800 font-semibold'
                    : 'text-lb-600 hover:bg-[rgba(61,122,138,0.09)] hover:text-lb-800'
                  }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[12px] transition-all duration-200"
                  style={
                    location.pathname.startsWith('/admin/vehicles-') ||
                      location.pathname.startsWith('/admin/view-vehicles') ||
                      location.pathname.startsWith('/admin/vehicle-statuses') ||
                      location.pathname.startsWith('/admin/view-tags')
                      ? {
                        background: 'rgba(61,122,138,0.18)',
                        boxShadow: '0 2px 8px rgba(15,60,80,0.12)',
                      }
                      : {}
                  }
                >
                  <i className="fa-solid fa-truck" />
                </div>
                <span>Vehicles</span>
                <i className={`fa-solid fa-chevron-down ml-auto text-[10px] transition-transform duration-200 ${vehiclesOpen ? 'rotate-180' : ''}`} />
              </button>

              {vehiclesOpen && (
                <div className="pl-4 space-y-0.5 mt-0.5 border-l border-[rgba(61,122,138,0.15)] ml-[21px]">
                  {[
                    { path: '/admin/vehicles-search', label: 'Vehicles Search' },
                    { path: '/admin/vehicles-list', label: 'Vehicles List' },
                    { path: '/admin/view-vehicles', label: 'View Vehicles' },
                    { path: '/admin/vehicle-statuses', label: 'Vehicle Statuses' },
                    { label: 'Add Tags', isModalTrigger: true },
                    { path: '/admin/view-tags', label: 'View Tags' },
                  ].map((sub, index) => {
                    if (sub.isModalTrigger) {
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setIsTagModalOpen(true)}
                          className="w-full text-left block px-3 py-1.5 rounded-lg text-[12px] font-medium text-lb-600 hover:bg-[rgba(61,122,138,0.06)] hover:text-lb-800 transition-colors"
                        >
                          {sub.label}
                        </button>
                      );
                    }
                    return (
                      <NavLink
                        key={sub.path}
                        to={sub.path}
                        className={({ isActive }) =>
                          `block px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${isActive
                            ? 'bg-[rgba(61,122,138,0.12)] text-[#2a6070] font-semibold shadow-sm'
                            : 'text-lb-600 hover:bg-[rgba(61,122,138,0.06)] hover:text-lb-800'
                          }`
                        }
                      >
                        {sub.label}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>

            {adminLinks.slice(5).map(renderLink)}
          </>
        )}
      </nav>

      <AddTagsModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        onSuccess={() => {
          // If on the tags list page, reload so the new tags appear
          if (location.pathname === '/admin/view-tags') {
            window.location.reload();
          }
        }}
      />


      {/* ── Profile footer ── */}
      <div
        className="px-4 pt-4 mx-3 mt-2"
        style={{ borderTop: '1px solid rgba(61,122,138,0.12)' }}
      >
        <div
          className="flex items-center gap-2.5 p-2.5 rounded-xl transition-all duration-200 cursor-default hover:bg-[rgba(61,122,138,0.07)]"
        >
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #3d7a8a, #1b4a5e)',
              boxShadow: '0 2px 8px rgba(15,60,80,0.2)',
              border: '2px solid rgba(61,122,138,0.3)',
            }}
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-semibold text-lb-800 truncate">{fullName}</div>
            <div className="text-[10px] text-lb-500 capitalize">{roleLabel}</div>
          </div>

          {/* Online dot */}
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: '#34d8b5', boxShadow: '0 0 6px rgba(52,216,181,0.7)' }}
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
