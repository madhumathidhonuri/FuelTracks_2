import Card from './Card';
const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendDirection = 'up', className = '' }) => (
  <Card hover className={`kpi-card ${className}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-label)] mb-2">{title}</p>
        <h3 className="text-2xl font-bold text-[var(--text-primary)] font-display">{value}</h3>
        {subtitle && <p className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</p>}
      </div>
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-input)] border border-[var(--border-glass)] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[var(--accent)]" />
        </div>
      )}
    </div>
    {trend && (
      <div className={`mt-3 flex items-center text-xs font-medium ${trendDirection === 'up' ? 'text-[#0a8f78]' : 'text-[var(--coral)]'}`}>
        <svg className={`w-3 h-3 mr-1 ${trendDirection === 'up' ? '' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        {trend}
      </div>
    )}
  </Card>
);
export default StatCard;
