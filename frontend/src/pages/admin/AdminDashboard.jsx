import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/statistics/admin-overview');
        if (res.data.success) setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-[rgba(61,122,138,0.08)] rounded-[20px] border border-[rgba(61,122,138,0.12)]" />
          ))}
        </div>
        <div className="h-36 bg-[rgba(61,122,138,0.08)] rounded-[22px] border border-[rgba(61,122,138,0.12)]" />
        {[0, 1].map(i => (
          <div key={i} className="h-72 bg-[rgba(61,122,138,0.08)] rounded-[22px] border border-[rgba(61,122,138,0.12)]" />
        ))}
      </div>
    );
  }

  const {
    usersCount = 0,
    groupsCount = 0,
    vehiclesCount = 0,
    licenceTiers = [],
    expiredLicences = [],
    expiringLicences = [],
  } = data || {};

  const totalTier = licenceTiers.find(t => t.tier === 'total') || { total: 0, used: 0, available: 0 };

  /* ── KPI data ── */
  const kpiItems = [
    {
      label: 'Total Users',
      value: usersCount,
      icon: 'fa-users',
      iconClass: 'bg-[rgba(61,122,138,0.14)] border border-[rgba(61,122,138,0.25)] text-[#3d7a8a] dark:text-[#8ec4cc] dark:border-[rgba(61,122,138,0.4)]',
      link: '/admin/users'
    },
    {
      label: 'Total Groups',
      value: groupsCount,
      icon: 'fa-layer-group',
      iconClass: 'bg-[rgba(52,216,181,0.14)] border border-[rgba(52,216,181,0.3)] text-[#0a8f78] dark:text-[#34d8b5] dark:border-[rgba(52,216,181,0.4)]',
      link: '/admin/groups'
    },
    {
      label: 'Total Vehicles',
      value: vehiclesCount,
      icon: 'fa-truck',
      iconClass: 'bg-[rgba(251,191,36,0.14)] border border-[rgba(251,191,36,0.3)] text-[#92650a] dark:text-[#fbbf24] dark:border-[rgba(251,191,36,0.4)]',
      link: '/admin/vehicles'
    },
    {
      label: 'Total Licences',
      value: totalTier.total,
      icon: 'fa-id-card',
      iconClass: 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 dark:border-indigo-900/35',
      link: '/admin/billing?tab=all'
    },
    {
      label: 'Available Licences',
      value: totalTier.available,
      icon: 'fa-circle-check',
      iconClass: 'bg-[rgba(52,216,181,0.14)] border border-[rgba(52,216,181,0.3)] text-[#0a8f78] dark:text-[#34d8b5] dark:border-[rgba(52,216,181,0.4)]',
      link: '/admin/billing?tab=all'
    },
  ];

  /* ── Licence Card ── */
  const LicenceCard = ({ lic, variant }) => {
    const expired = variant === 'expired';
    const daysLeft = expired
      ? null
      : Math.ceil((new Date(lic.expireDate) - Date.now()) / 86400000);
    const pct = lic.totalCount > 0
      ? Math.min(100, Math.round((lic.usedCount / lic.totalCount) * 100))
      : 0;

    const barColor = pct >= 90 ? '#f87171' : pct >= 70 ? '#fbbf24' : '#34d8b5';

    const expiryLabel = expired
      ? `Expired · ${new Date(lic.expireDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
      : daysLeft <= 0
        ? 'Expires Today!'
        : `Expires in ${daysLeft}d · ${new Date(lic.expireDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;

    return (
      <div className={`rounded-[18px] p-4 border transition-all duration-200 hover:-translate-y-0.5 shadow-sm ${
        expired 
          ? 'bg-red-500/10 border-red-500/20 dark:bg-red-950/20 dark:border-red-900/30' 
          : daysLeft <= 7 
          ? 'bg-red-500/5 border-red-500/15 dark:bg-red-950/10 dark:border-red-900/20' 
          : 'bg-yellow-500/10 border-yellow-500/20 dark:bg-yellow-950/20 dark:border-yellow-900/30'
      }`}>
        {/* Row 1 – name + tier badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-[10px] flex-shrink-0 flex items-center justify-center text-[14px] border ${
              expired 
                ? 'bg-red-500/15 border-red-500/25 text-red-600 dark:text-red-400' 
                : daysLeft <= 7 
                ? 'bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400' 
                : 'bg-yellow-500/15 border-yellow-500/25 text-yellow-600 dark:text-yellow-400'
            }`}>
              <i className={`fa-solid ${expired ? 'fa-circle-xmark' : 'fa-triangle-exclamation'}`} />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-lb-800 dark:text-white truncate leading-tight">
                {lic.organizationName}
              </div>
              <div className="text-[10px] text-lb-500 dark:text-lb-450 truncate mt-0.5">{lic.organizationEmail}</div>
            </div>
          </div>
          <span className={`flex-shrink-0 text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded-lg tracking-wide border ${
            expired 
              ? 'bg-red-500/15 border-red-500/25 text-red-600 dark:text-red-400' 
              : daysLeft <= 7 
              ? 'bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400' 
              : 'bg-yellow-500/15 border-yellow-500/25 text-yellow-600 dark:text-yellow-400'
          }`}>
            {lic.tier}
          </span>
        </div>

        {/* Row 2 – contact + location */}
        <div className="space-y-1 mb-3 text-lb-600 dark:text-lb-300">
          {lic.organizationPhone && (
            <div className="flex items-center gap-1.5 text-[11px]">
              <i className="fa-solid fa-phone w-3 text-[9px] text-lb-400 dark:text-lb-450" />
              <span className="font-semibold">{lic.organizationPhone}</span>
            </div>
          )}
          {(lic.organizationCity || lic.organizationState) && (
            <div className="flex items-center gap-1.5 text-[11px]">
              <i className="fa-solid fa-location-dot w-3 text-[9px] text-lb-400 dark:text-lb-450" />
              <span className="font-semibold truncate">
                {[lic.organizationCity, lic.organizationState].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
          {lic.organizationAddress && (
            <div className="flex items-center gap-1.5 text-[11px] text-lb-500 dark:text-lb-400">
              <i className="fa-solid fa-map-pin w-3 text-[9px] text-lb-400 dark:text-lb-450 flex-shrink-0" />
              <span className="truncate" title={lic.organizationAddress}>{lic.organizationAddress}</span>
            </div>
          )}
        </div>

        {/* Row 3 – usage bar */}
        <div className="pt-2.5 border-t border-[rgba(61,122,138,0.12)]">
          <div className="flex justify-between items-center text-[10px] font-semibold mb-1.5">
            <span className="text-lb-500 dark:text-lb-400">Device Usage</span>
            <span style={{ color: barColor }} className="font-bold">
              {lic.usedCount}/{lic.totalCount} ({pct}%)
            </span>
          </div>
          <div className="fuel-bar-bg dark:bg-white/10">
            <div
              className="fuel-bar-fill transition-all duration-700"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)` }}
            />
          </div>
          <div className={`mt-2 text-[10.5px] font-bold ${
            expired ? 'text-red-500 dark:text-red-400' : daysLeft <= 7 ? 'text-red-500 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
          }`}>
            <i className={`fa-solid ${expired ? 'fa-calendar-xmark' : 'fa-calendar-day'} mr-1 opacity-70`} />
            {expiryLabel}
          </div>
        </div>
      </div>
    );
  };

  /* ── Section wrapper ── */
  const Section = ({ title, dot, count, countColor, countBg, countBorder, actionLink, actionLabel, children, emptyIcon, emptyMsg, emptySubMsg }) => (
    <div className="glass-card rounded-[22px] p-6 transition-all duration-300">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-[rgba(61,122,138,0.12)]">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block animate-pulse" style={{ background: dot }} />
          <h3 className="font-semibold text-[15px] text-lb-800 dark:text-white font-display">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          {actionLink && count > 0 && (
            <Link
              to={actionLink}
              className="text-[11.5px] font-bold px-3 py-1 bg-gradient-to-r from-[rgba(29,100,120,0.12)] to-[rgba(15,60,80,0.08)] border border-[rgba(61,122,138,0.25)] rounded-lg text-lb-700 dark:text-lb-300 hover:from-[rgba(29,100,120,0.18)] hover:to-[rgba(15,60,80,0.12)] transition-all flex items-center gap-1 shadow-sm"
            >
              <i className="fa-solid fa-arrows-rotate text-[10px] opacity-75" />
              <span>{actionLabel}</span>
            </Link>
          )}
          <span
            className="text-[11px] font-bold px-3 py-1 rounded-full border text-xs"
            style={{ background: countBg, color: countColor, borderColor: countBorder }}
          >
            {count} {count === 1 ? 'organisation' : 'organisations'}
          </span>
        </div>
      </div>

      {count === 0 ? (
        <div className="py-12 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-[16px] flex items-center justify-center text-2xl bg-[rgba(52,216,181,0.1)] border border-[rgba(52,216,181,0.2)] text-[#34d8b5]">
            <i className={`fa-solid ${emptyIcon}`} />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-semibold text-lb-700 dark:text-lb-300">{emptyMsg}</p>
            <p className="text-[11px] text-lb-500 dark:text-lb-400 mt-0.5">{emptySubMsg}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{children}</div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn text-lb-800 dark:text-white">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-lb-500 dark:text-lb-400 uppercase tracking-[0.06em] select-none">
        <i className="fa-solid fa-gauge-high text-lb-400 dark:text-lb-300" />
        <span>Dashboard</span>
        <span className="text-lb-300">/</span>
        <span className="text-lb-700 dark:text-white">Overview</span>
      </div>

      {/* ── Welcome banner ── */}
      <div className="kpi-card rounded-[22px] px-7 py-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-[22px] font-bold text-lb-800 dark:text-white leading-tight">
            Welcome back, Admin 👋
          </h2>
          <p className="text-[12px] text-lb-500 dark:text-lb-400 mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold text-lb-700 dark:text-white flex-shrink-0"
          style={{ background: 'rgba(52,216,181,0.15)', border: '1px solid rgba(52,216,181,0.35)' }}>
          <span className="status-dot" />
          System Online
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {kpiItems.map(({ label, value, icon, iconClass, link }) => (
          <Link
            key={label}
            to={link}
            className="kpi-card rounded-[20px] p-5 transition-all duration-300 hover:-translate-y-1 block hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-3.5">
              <div className={`w-[42px] h-[42px] rounded-xl flex items-center justify-center text-[17px] ${iconClass}`}>
                <i className={`fa-solid ${icon}`} />
              </div>
              <div className="text-[10px] font-bold text-lb-400 dark:text-lb-450 hover:text-lb-700 dark:hover:text-white transition-colors">
                View <i className="fa-solid fa-chevron-right text-[8px] ml-0.5" />
              </div>
            </div>
            <div className="font-display text-[32px] font-bold leading-none mb-1 text-lb-700 dark:text-white">{value}</div>
            <div className="text-[12px] uppercase tracking-[0.06em] text-lb-500 dark:text-lb-400 truncate">{label}</div>
          </Link>
        ))}
      </div>

      {/* ── Licences Overview ── */}
      <div className="glass-card rounded-[22px] p-6 transition-all duration-300">
        {/* Panel header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[rgba(61,122,138,0.12)]">
          <div className="flex items-center gap-2 text-[15px] font-semibold text-lb-700 dark:text-white">
            <i className="fa-solid fa-id-card text-lb-500 dark:text-lb-400 text-[14px]" />
            Licences Overview
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/billing?tab=all"
              className="text-[11px] font-bold px-3 py-1.5 bg-gradient-to-r from-[rgba(29,100,120,0.15)] to-[rgba(15,60,80,0.1)] border border-[rgba(61,122,138,0.3)] text-lb-800 dark:text-white hover:bg-lb-100 rounded-lg shadow-sm transition-all flex items-center gap-1.5 hover:-translate-y-0.5"
            >
              <i className="fa-solid fa-gears text-[10px]" />
              Manage Licences
            </Link>
            <a
              href="https://fueltracks.online"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-lb-500 hover:text-lb-700 hover:underline transition-colors flex items-center gap-1"
            >
              <i className="fa-solid fa-globe text-[10px]" />
              fueltracks.online
            </a>
          </div>
        </div>

        {/* Tier grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {licenceTiers.map((tier) => {
            const isTotal = tier.tier === 'total';
            return (
              <div
                key={tier.tier}
                className={`rounded-[16px] p-4 transition-all duration-200 hover:-translate-y-0.5 cursor-default ${
                  isTotal 
                    ? 'bg-gradient-to-br from-[rgba(56,175,249,0.15)] to-[rgba(56,175,249,0.04)] dark:from-[rgba(56,175,249,0.25)] dark:to-[rgba(56,175,249,0.06)] border border-[rgba(56,175,249,0.35)] shadow-sm' 
                    : 'bg-[rgba(240,248,255,0.5)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)]'
                }`}
              >
                <div className="text-center">
                  <span
                    className={`block text-[9px] font-bold uppercase tracking-wider mb-2 truncate ${
                      isTotal ? 'text-[#1b6fad] dark:text-[#38aff9]' : 'text-[#5a9baa] dark:text-lb-400'
                    }`}
                    title={tier.displayName}
                  >
                    {tier.displayName}
                  </span>
                  <span
                    className={`font-display text-[26px] font-extrabold block mb-2.5 leading-none ${
                      isTotal ? 'text-[#38aff9]' : 'text-[#3d7a8a] dark:text-[#8ec4cc]'
                    }`}
                  >
                    {tier.total}
                  </span>
                  <div
                    className="grid grid-cols-2 gap-0.5 text-[9px] pt-2 border-t border-[rgba(61,122,138,0.12)]"
                  >
                    <div className="border-r border-[rgba(61,122,138,0.12)] pr-1">
                      <span className="block text-[8px] uppercase tracking-wide text-lb-400 font-medium">Used</span>
                      <span className="font-bold text-lb-700 dark:text-lb-300 block mt-0.5">{tier.used}</span>
                    </div>
                    <div className="pl-1">
                      <span className="block text-[8px] uppercase tracking-wide text-lb-400 font-medium">Avail</span>
                      <span className="font-bold block mt-0.5 text-[#34d8b5]">{tier.available}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Expired Licences ── */}
      <Section
        title="Expired Licences — Needs Renewal"
        dot="#f87171"
        count={expiredLicences.length}
        countColor="#b91c1c"
        countBg="rgba(248,113,113,0.12)"
        countBorder="rgba(248,113,113,0.25)"
        actionLink="/admin/billing?tab=expired"
        actionLabel="Bulk Renew"
        emptyIcon="fa-circle-check"
        emptyMsg="All licences are active"
        emptySubMsg="No expired licences at this time"
      >
        {expiredLicences.map(lic => (
          <LicenceCard key={lic.id} lic={lic} variant="expired" />
        ))}
      </Section>

      {/* ── Expiring Licences ── */}
      <Section
        title="Licences Expiring — Next 30 Days"
        dot="#fbbf24"
        count={expiringLicences.length}
        countColor="#92650a"
        countBg="rgba(251,191,36,0.12)"
        countBorder="rgba(251,191,36,0.25)"
        actionLink="/admin/billing?tab=renew"
        actionLabel="Renew Early"
        emptyIcon="fa-circle-check"
        emptyMsg="No upcoming expirations"
        emptySubMsg="No licences expiring in the next 30 days"
      >
        {expiringLicences.map(lic => (
          <LicenceCard key={lic.id} lic={lic} variant="expiring" />
        ))}
      </Section>

    </div>
  );
};

export default AdminDashboard;
