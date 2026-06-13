import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AddGroup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    name: '',
    selected_vehicles: [],
  });

  // Fetch all vehicles on load
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await api.get('/vehicles');
        if (res.data.success) {
          setVehicles(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch vehicles:', err);
      }
    };
    fetchVehicles();
  }, []);

  const handleSelectAll = (checked) => {
    if (checked) {
      setForm((prev) => ({
        ...prev,
        selected_vehicles: vehicles.map((v) => v.id),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        selected_vehicles: [],
      }));
    }
  };

  const handleVehicleToggle = (vehicleId) => {
    setForm((prev) => {
      const selected = prev.selected_vehicles.includes(vehicleId)
        ? prev.selected_vehicles.filter((id) => id !== vehicleId)
        : [...prev.selected_vehicles, vehicleId];
      return { ...prev, selected_vehicles: selected };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Please enter a group name.');
      return;
    }

    setLoading(true);

    const payload = {
      name: form.name,
      vehicle_ids: form.selected_vehicles,
    };

    try {
      const res = await api.post('/groups', payload);
      if (res.data.success) {
        alert('Group created successfully!');
        navigate('/admin/groups');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const name = v.vehicleName || v.vehicle_name || '';
    const reg = v.registrationNumber || v.registration_number || '';
    return `${name} ${reg}`.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Breadcrumbs */}
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold font-display text-lb-800 dark:text-white">Add Group</h2>
        <div className="h-6 w-[1px] bg-[rgba(61,122,138,0.25)]"></div>
        <div className="flex items-center gap-2 text-xs font-semibold text-lb-500 uppercase tracking-wider">
          <Link to="/admin" className="hover:text-lb-700 transition-colors">
            <i className="fa-solid fa-house"></i>
          </Link>
          <span>&gt;</span>
          <Link to="/admin/groups" className="hover:text-lb-700 transition-colors">Groups</Link>
          <span>&gt;</span>
          <span className="text-lb-400">Add Group</span>
        </div>
      </div>

      <div className="glass-card rounded-[24px] p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name & Submit Block */}
          <div className="flex items-end gap-4 max-w-lg mb-6">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">
                <span className="inline-flex items-center gap-1.5">
                  Group Name
                  <span className="relative group cursor-pointer inline-flex items-center text-orange-500">
                    <i className="fa-solid fa-circle-info text-[11px]"></i>
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-44 bg-gray-800 text-white text-[9px] p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 text-center font-normal shadow-md">
                      Unique name for the vehicle group
                    </span>
                  </span>
                </span>
              </label>
              <input
                type="text"
                placeholder="Group Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-[rgba(29,100,120,0.18)] to-[rgba(15,60,80,0.14)] dark:from-[rgba(61,122,138,0.35)] dark:to-[rgba(20,42,54,0.25)] border border-[rgba(61,122,138,0.45)] hover:from-[rgba(29,100,120,0.28)] hover:to-[rgba(15,60,80,0.22)] shadow-md text-lb-800 dark:text-white rounded-xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 h-[38px] flex items-center justify-center min-w-[90px]"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-[rgba(61,122,138,0.15)] pt-6"></div>

          {/* Vehicles Checklist Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap text-xs">
            <label className="flex items-center gap-2 font-bold text-lb-600 dark:text-lb-400 cursor-pointer uppercase tracking-wider">
              <input
                type="checkbox"
                checked={vehicles.length > 0 && form.selected_vehicles.length === vehicles.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded text-[#3d7a8a] focus:ring-[#3d7a8a] border-[rgba(61,122,138,0.25)] bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] accent-[#3d7a8a]"
              />
              Select all Vehicles
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3.5 py-2 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] dark:text-white w-48 font-medium text-xs shadow-sm"
              />
              <button
                type="button"
                className="px-3.5 py-2 bg-gradient-to-r from-[rgba(29,100,120,0.18)] to-[rgba(15,60,80,0.14)] dark:from-[rgba(61,122,138,0.35)] dark:to-[rgba(20,42,54,0.25)] border border-[rgba(61,122,138,0.45)] text-lb-800 dark:text-white rounded-xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
              >
                <i className="fa-solid fa-magnifying-glass text-xs"></i>
              </button>
            </div>
          </div>

          {/* Select Vehicles Checklist */}
          <div className="space-y-4 pt-2">
            <h3 className="text-[#3d7a8a] dark:text-lb-300 font-bold text-xs uppercase tracking-wider">Select the Vehicles:</h3>
            
            {vehicles.length === 0 ? (
              <div className="text-xs text-lb-400 font-semibold py-4">
                <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading vehicles...
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-xs text-lb-400 font-semibold py-4">
                No vehicles match the search criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {filteredVehicles.map((v) => {
                  const label = `${v.vehicleName || v.vehicle_name || ''} ${v.registrationNumber || v.registration_number || ''}`.trim().toUpperCase();
                  return (
                    <label
                      key={v.id}
                      className="flex items-center gap-2.5 text-xs font-semibold text-lb-700 dark:text-lb-300 cursor-pointer hover:text-lb-900 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={form.selected_vehicles.includes(v.id)}
                        onChange={() => handleVehicleToggle(v.id)}
                        className="w-4.5 h-4.5 rounded text-[#3d7a8a] focus:ring-[#3d7a8a] border-[rgba(61,122,138,0.25)] bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] accent-[#3d7a8a]"
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGroup;
