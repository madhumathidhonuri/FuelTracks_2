import { useState } from 'react';
import api from '../../api/axios';

const AddTagsModal = ({ isOpen, onClose, onSuccess }) => {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      setError(true);
      return;
    }
    setError(false);
    try {
      setLoading(true);
      const res = await api.post('/rfid-tags', { quantity: parseInt(quantity) });
      if (res.data.success) {
        setQuantity('');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Failed to create RFID tags batch:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card w-full max-w-[440px] rounded-[28px] overflow-hidden shadow-2xl border border-[rgba(61,122,138,0.3)] p-8 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold font-display text-lb-800 dark:text-white">Add Tags</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lb-500 hover:bg-[rgba(61,122,138,0.1)] hover:text-lb-700 transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-lb-700 dark:text-lb-300 uppercase tracking-wider mb-2">
              Number Of RFID Tags
            </label>
            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-3 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] dark:text-white font-semibold text-sm transition-all"
            />
            {error && (
              <p className="text-red-500 text-xs font-semibold mt-1">Please enter a valid quantity greater than 0</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-transparent border border-[rgba(61,122,138,0.25)] text-lb-600 dark:text-lb-400 font-bold rounded-xl text-xs hover:bg-[rgba(61,122,138,0.06)] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-[rgba(29,100,120,0.18)] to-[rgba(15,60,80,0.14)] dark:from-[rgba(61,122,138,0.35)] border border-[rgba(61,122,138,0.4)] text-lb-800 dark:text-white font-bold rounded-xl text-xs hover:-translate-y-0.5 transition-all shadow-md"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTagsModal;
