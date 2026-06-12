import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../hooks/useNotifications';

const Topbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      className="sticky top-0 z-40 flex items-center gap-4 px-7 py-3.5 topbar-grad"
      style={{
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(61,122,138,0.25)',
        boxShadow: '0 2px 16px rgba(15,60,80,0.1)'
      }}
    >
      {/* Search Input */}
      <div className="relative flex-1 max-w-[360px]">
        <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-lb-400"></i>
        <input
          type="text"
          placeholder="Search vehicles, drivers, routes…"
          className="w-full py-2 pl-9 pr-4 rounded-full text-[13px] outline-none transition-all duration-300 text-lb-700"
          style={{
            background: 'rgba(255,255,255,0.65)',
            border: '1px solid rgba(61,122,138,0.32)'
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 ml-auto">
        {/* Fleet Online Status */}
        <div
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium text-lb-700"
          style={{
            background: 'rgba(52,216,181,0.15)',
            border: '1px solid rgba(52,216,181,0.35)'
          }}
        >
          <div className="status-dot"></div> Fleet Online
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="topbar-btn w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer relative"
          >
            <i className="fa-solid fa-bell text-[14px] text-lb-600"></i>
            {unreadCount > 0 && (
              <div className="notif-badge">{unreadCount}</div>
            )}
          </button>
          
          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-2xl border border-[rgba(61,122,138,0.25)] shadow-xl overflow-hidden z-50 bg-white dark:bg-[#0d1e26]"
              id="notifications-dropdown"
            >
              <div className="p-4 border-b border-[rgba(61,122,138,0.15)] flex items-center justify-between">
                <h3 className="font-semibold text-sm text-lb-800 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-lb-500 hover:text-lb-700 hover:underline font-medium">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <i className="fa-solid fa-bell-slash text-lb-400 opacity-40 text-2xl mb-2"></i>
                    <p className="text-sm text-lb-600 dark:text-lb-500">No notifications</p>
                    <p className="text-[11px] text-lb-500 opacity-60 mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-4 border-b border-[rgba(61,122,138,0.1)] cursor-pointer hover:bg-[rgba(61,122,138,0.06)] transition-colors ${
                        !n.read ? 'bg-[rgba(52,216,181,0.05)]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-lb-400 opacity-40' : 'bg-mint'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-lb-800 dark:text-white">{n.title}</p>
                          <p className="text-xs text-lb-600 dark:text-lb-500 mt-0.5 truncate">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Expand/Fullscreen */}
        <div
          onClick={toggleFullscreen}
          className="topbar-btn w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer"
          title="Toggle Fullscreen"
        >
          <i className="fa-solid fa-expand text-[14px] text-lb-600"></i>
        </div>

        {/* Theme Toggle */}
        <div
          id="themeToggleBtn"
          onClick={toggleTheme}
          className="topbar-btn w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer transition-all duration-300"
          style={{ marginRight: '2px' }}
          title="Toggle Theme"
        >
          <i id="themeIcon" className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'} text-[14px] text-lb-600`}></i>
        </div>

        {/* Profile Info / Settings Dropdown Trigger */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="topbar-profile w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
            title="Profile & Settings"
          >
            <i className="fa-solid fa-user text-[15px] text-lb-700"></i>
          </div>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[rgba(61,122,138,0.25)] shadow-xl overflow-hidden z-50 bg-white dark:bg-[#0d1e26]" id="profile-dropdown">
              <div className="p-4 border-b border-[rgba(61,122,138,0.15)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3d7a8a] to-[#1b4a5e] flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-lb-800 dark:text-white truncate">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-lb-500 truncate">{user?.email || 'admin@fueltracks.io'}</p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <button
                  onClick={() => {
                    navigate(user?.role === 'admin' ? '/admin/settings' : '/settings');
                    setShowProfile(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-lb-700 dark:text-lb-600 hover:bg-[rgba(61,122,138,0.1)] transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-gear text-lb-400"></i>
                  Settings
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-[12px] font-medium transition-all duration-200 cursor-pointer"
          style={{
            background: 'rgba(248,113,113,0.12)',
            border: '1px solid rgba(248,113,113,0.3)',
            color: '#b91c1c',
            fontFamily: "'Inter', sans-serif"
          }}
        >
          <i className="fa-solid fa-right-from-bracket"></i> Logout
        </button>
      </div>
    </div>
  );
};

export default Topbar;
