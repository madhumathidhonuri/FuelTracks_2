import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ user }) => {
  const location = useLocation();

  const userLinks = [
    { path: '/dashboard',  icon: 'fa-gauge-high',         label: 'Dashboard'     },
    { path: '/track',      icon: 'fa-location-dot',       label: 'Live Tracking' },
    { path: '/history',    icon: 'fa-clock-rotate-left',  label: 'History'       },
    { path: '/reports',    icon: 'fa-chart-line',         label: 'Reports'       },
    { path: '/statistics', icon: 'fa-chart-bar',          label: 'Statistics'    },
    { path: '/analytics',  icon: 'fa-chart-pie',          label: 'Analytics'     },
    { path: '/sensors',    icon: 'fa-heart-pulse',        label: 'Sensors'       },
  ];

  const adminLinks = [
    { path: '/admin',                  icon: 'fa-screwdriver-wrench',   label: 'Overview'       },
    { path: '/admin/organizations',    icon: 'fa-sitemap',              label: 'Organizations'  },
    { path: '/admin/devices',          icon: 'fa-tablet-screen-button', label: 'Devices'        },
    { path: '/admin/vehicles',         icon: 'fa-truck',                label: 'Vehicles'       },
    { path: '/admin/groups',           icon: 'fa-users-gear',           label: 'Groups'         },
    { path: '/admin/users',            icon: 'fa-users',                label: 'Users'          },
    { path: '/admin/settings',         icon: 'fa-gear',                 label: 'Settings'       },
  ];

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const renderLink = (link) => (
    <NavLink
      key={link.path}
      to={link.path}
      end={link.path === '/admin'}
      className={({ isActive }) =>
        `nav-item group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer relative overflow-hidden
         text-[13px] font-medium mb-0.5 transition-all duration-200 ${
          isActive
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
  const fullName  = user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Administrator';
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
        <div className="nav-section">Overview</div>
        {userLinks.map(renderLink)}

        {isAdmin && (
          <>
            <div className="nav-section" style={{ marginTop: '12px' }}>Administration</div>
            {adminLinks.map(renderLink)}
          </>
        )}
      </nav>

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
