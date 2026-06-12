const ExportButtons = ({ onExport, className = '' }) => {
  const formats = [{ label: 'CSV', format: 'csv' }, { label: 'Excel', format: 'xlsx' }, { label: 'PDF', format: 'pdf' }];
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs text-muted mr-1">Export:</span>
      {formats.map(({ label, format }) => (
        <button key={format} onClick={() => onExport?.(format)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-lb-50 text-text-primary hover:bg-sky2-50 border border-[rgba(56,175,249,0.15)] transition-colors flex items-center">
          <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          {label}
        </button>
      ))}
    </div>
  );
};
export default ExportButtons;
