import { useState, useEffect } from 'react';
import api from '../../api/axios';

const ViewTags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rfid-tags');
      if (res.data.success) {
        setTags(res.data.data);
      }
    } catch (err) {
      console.error('Fetch RFID tags error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold font-display text-lb-800 dark:text-white">RFID Tags List</h2>
          <div className="h-6 w-[1px] bg-[rgba(61,122,138,0.25)]"></div>
          <div className="flex items-center gap-2 text-xs font-semibold text-lb-500 uppercase tracking-wider">
            <span className="text-lb-400">Vehicles</span>
            <span>&gt;</span>
            <span className="text-lb-400">View Tags</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="glass-card rounded-[24px] p-6 space-y-6">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse rounded-2xl overflow-hidden shadow-sm border border-[rgba(61,122,138,0.15)]">
            <thead>
              <tr className="bg-[rgba(61,122,138,0.08)] dark:bg-[rgba(13,30,38,0.6)] text-lb-800 dark:text-white text-xs font-bold uppercase tracking-wider border-b border-[rgba(61,122,138,0.22)]">
                <th className="py-4 px-4 text-center">Batch ID</th>
                <th className="py-4 px-4 text-center">Number Of RFID Tags</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-center">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(61,122,138,0.12)]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-xs text-lb-500 font-semibold">
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading tag batches...
                  </td>
                </tr>
              ) : tags.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-xs text-lb-500 font-semibold">
                    No RFID tag allocations found
                  </td>
                </tr>
              ) : (
                tags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-[rgba(61,122,138,0.03)] dark:hover:bg-[rgba(255,255,255,0.01)] transition-colors text-xs font-semibold text-lb-800 dark:text-lb-200 border-b border-[rgba(61,122,138,0.1)]">
                    <td className="py-4 px-4 text-center font-display font-medium text-lb-500">{tag.id}</td>
                    <td className="py-4 px-4 text-center font-bold text-lb-800 dark:text-white">{tag.quantity}</td>
                    <td className="py-4 px-4 text-center font-semibold">
                      <span className="px-2.5 py-0.5 rounded bg-[rgba(52,216,181,0.18)] text-[#0a8f78] text-[10px] uppercase font-bold">
                        {tag.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-lb-500 whitespace-nowrap">
                      {tag.created_at ? new Date(tag.created_at).toISOString().replace('T', ' ').substring(0, 19) : ''}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewTags;
