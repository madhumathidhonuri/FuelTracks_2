import { useState } from 'react';
import { format } from 'date-fns';
const DateRangePicker = ({ onChange, className = '' }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const presets = [{ label: 'Today', days: 0 }, { label: 'Yesterday', days: 1 }, { label: 'Last 7 days', days: 7 }, { label: 'Last 30 days', days: 30 }];
  const handleChange = (type, value) => {
    if (type === 'start') { setStartDate(value); if (endDate) onChange?.({ startDate: value, endDate }); }
    else { setEndDate(value); if (startDate) onChange?.({ startDate, endDate: value }); }
  };
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">{presets.map((preset) => (
        <button key={preset.label} onClick={() => { const end = new Date(); const start = new Date(); start.setDate(start.getDate() - preset.days); const s = format(start, 'yyyy-MM-dd'); const e = format(end, 'yyyy-MM-dd'); setStartDate(s); setEndDate(e); onChange?.({ startDate: s, endDate: e }); }} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-lb-50 text-text-primary hover:bg-sky2-50 border border-[rgba(56,175,249,0.15)] transition-colors">{preset.label}</button>
      ))}</div>
      <input type="date" value={startDate} onChange={(e) => handleChange('start', e.target.value)} className="px-3 py-2 bg-lb-50 border border-[rgba(56,175,249,0.25)] rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent" />
      <span className="text-muted text-xs">to</span>
      <input type="date" value={endDate} onChange={(e) => handleChange('end', e.target.value)} className="px-3 py-2 bg-lb-50 border border-[rgba(56,175,249,0.25)] rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent" />
    </div>
  );
};
export default DateRangePicker;
