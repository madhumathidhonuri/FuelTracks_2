const variants = {
  default: 'bg-lb-100 text-[rgba(7,81,134,0.7)]',
  moving: 'bg-[rgba(52,216,181,0.18)] text-[#0a8f78]',
  idle: 'bg-[rgba(251,191,36,0.18)] text-[#92650a]',
  stopped: 'bg-[rgba(248,113,113,0.18)] text-[#b91c1c]',
  active: 'bg-[rgba(52,216,181,0.18)] text-[#0a8f78]',
  inactive: 'bg-[rgba(248,113,113,0.18)] text-[#b91c1c]',
  warning: 'bg-[rgba(251,191,36,0.18)] text-[#92650a]',
  info: 'bg-sky2-100 text-accent-dark',
  primary: 'bg-accent text-white',
};
const Badge = ({ children, variant = 'default', className = '' }) => (
  <span className={`badge ${variants[variant]} ${className}`}>{children}</span>
);
export default Badge;
