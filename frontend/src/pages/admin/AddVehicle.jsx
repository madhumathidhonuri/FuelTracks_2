import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api from '../../api/axios';

const AddVehicle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  
  const [form, setForm] = useState({
    name: '',
    vehicleNumber: '',
    type: 'truck',
    make: '',
    model: '',
    deviceId: '',
    organization_id: '',
    gps_sim_no: '',
    apn: '',
    odometer: '',
  });

  // Fetch organizations list
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await api.get('/organizations');
        if (res.data.success) {
          setOrganizations(res.data.data);
          // Set initial default organization
          if (res.data.data.length > 0) {
            setForm((prev) => ({ ...prev, organization_id: res.data.data[0].id }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch organizations:', err);
      }
    };
    fetchOrgs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.organization_id) {
      alert('Please select or assign an organization for this vehicle.');
      setLoading(false);
      return;
    }

    const payload = {
      vehicle_name: form.name,
      registration_number: form.vehicleNumber,
      vehicle_type: form.type,
      make: form.make,
      model: form.model,
      device_id: form.deviceId || undefined,
      organization_id: form.organization_id,
      gps_sim_no: form.gps_sim_no || undefined,
      apn: form.apn || undefined,
      odometer: form.odometer ? parseFloat(form.odometer) : 0,
      status: 'active',
      onboard_date: new Date(),
    };

    try {
      const res = await api.post('/vehicles', payload);
      if (res.data.success) {
        alert('Vehicle registered successfully!');
        navigate('/admin/vehicles');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to register vehicle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn mt-4">
      <div className="glass-card rounded-[24px] p-8">
        <div className="mb-8 border-b border-[rgba(61,122,138,0.15)] pb-6">
          <h3 className="font-display text-[24px] font-bold text-lb-800 dark:text-white text-center">
            Add New Vehicle
          </h3>
          <p className="text-center text-lb-500 text-[13px] mt-2">
            Enter the vehicle details to register and track it on the fleet platform.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Selection (Mandatory for Superadmins/Platform Admins) */}
          <div className="p-5 rounded-[20px] bg-[rgba(218,241,255,0.3)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)]">
            <label className="input-label">Assign Organization</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(7,81,134,0.45)]">
                <i className="fa-solid fa-building text-[12px]"></i>
              </div>
              <select
                value={form.organization_id}
                onChange={(e) => setForm({ ...form, organization_id: e.target.value })}
                className="input-field !pl-10 appearance-none bg-no-repeat w-full"
                style={{
                  backgroundImage:
                    'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%233d7a8a%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                  backgroundPosition: 'right 16px top 50%',
                  backgroundSize: '10px auto',
                }}
                required
              >
                <option value="">Select Organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Vehicle Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Truck Alpha-1"
              required
            />
            <Input
              label="Vehicle Registration Number"
              value={form.vehicleNumber}
              onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
              placeholder="e.g. MH12AB1234"
              required
            />
          </div>

          <div className="p-5 rounded-[20px] bg-[rgba(218,241,255,0.3)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)]">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-lb-500 mb-4">
              Vehicle Specifications
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="input-label">Vehicle Type</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(7,81,134,0.45)]">
                    <i className="fa-solid fa-truck-moving text-[12px]"></i>
                  </div>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="input-field !pl-10 appearance-none bg-no-repeat w-full"
                    style={{
                      backgroundImage:
                        'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%233d7a8a%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                      backgroundPosition: 'right 16px top 50%',
                      backgroundSize: '10px auto',
                    }}
                  >
                    {['truck', 'bus', 'car', 'van', 'motorcycle'].map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Input
                label="Make (Brand)"
                value={form.make}
                onChange={(e) => setForm({ ...form, make: e.target.value })}
                placeholder="Tata"
              />
              <Input
                label="Model"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="Accura"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Input
              label="GPS Sim No (optional)"
              value={form.gps_sim_no}
              onChange={(e) => setForm({ ...form, gps_sim_no: e.target.value })}
              placeholder="e.g. +91 99999 99999"
            />
            <Input
              label="Odo Distance (km)"
              type="number"
              value={form.odometer}
              onChange={(e) => setForm({ ...form, odometer: e.target.value })}
              placeholder="0"
            />
            <Input
              label="APN Link (optional)"
              value={form.apn}
              onChange={(e) => setForm({ ...form, apn: e.target.value })}
              placeholder="e.g. internet"
            />
          </div>

          <div className="grid grid-cols-1 gap-5">
            <Input
              label="Device IMEI (optional)"
              value={form.deviceId}
              onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
              placeholder="Enter 15-digit device IMEI to assign immediately"
            />
          </div>

          <div className="flex justify-between items-center pt-8 mt-4 border-t border-[rgba(61,122,138,0.15)]">
            <Button variant="ghost" type="button" onClick={() => navigate('/admin/vehicles')}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              icon={() => <i className="fa-solid fa-plus mr-2"></i>}
            >
              Add Vehicle
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle;
