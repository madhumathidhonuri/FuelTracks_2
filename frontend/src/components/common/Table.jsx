const Table = ({ columns, data, loading, emptyMessage = 'No data available', onRowClick }) => {
  if (loading) return (
    <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-[rgba(56,175,249,0.18)]">{columns.map((col) => <th key={col.key} className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-muted">{col.label}</th>)}</tr></thead><tbody>{[1,2,3,4,5].map((i) => <tr key={i} className="border-b border-[rgba(56,175,249,0.1)]">{columns.map((col) => <td key={col.key} className="py-3 px-4"><div className="h-4 bg-lb-50 rounded animate-skeleton w-24" /></td>)}</tr>)}</tbody></table></div>
  );
  if (!data || data.length === 0) return <div className="py-12 text-center"><p className="text-muted text-sm">{emptyMessage}</p></div>;
  return (
    <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-[rgba(56,175,249,0.18)]">{columns.map((col) => <th key={col.key} className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-muted">{col.label}</th>)}</tr></thead><tbody>{data.map((row, idx) => (
      <tr key={row.id || idx} onClick={() => onRowClick?.(row)} className={`border-b border-[rgba(56,175,249,0.1)] transition-colors duration-200 ${onRowClick ? 'cursor-pointer hover:bg-[rgba(218,241,255,0.6)]' : ''}`}>
        {columns.map((col) => <td key={col.key} className="py-3 px-4 text-sm text-text-primary">{col.render ? col.render(row[col.key], row) : row[col.key]}</td>)}
      </tr>
    ))}</tbody></table></div>
  );
};
export default Table;
