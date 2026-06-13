import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-14 items-center rounded-full transition-all duration-300 focus:outline-none flex-shrink-0 ${
      checked
        ? 'bg-[#3d7a8a] border border-[#2a6070] shadow-[0_0_8px_rgba(61,122,138,0.4)]'
        : 'bg-[rgba(61,122,138,0.2)] border border-[rgba(61,122,138,0.3)]'
    }`}
  >
    <span className={`absolute text-[9px] font-extrabold select-none transition-all duration-300 ${checked ? 'left-2.5 text-white' : 'right-2.5 text-lb-500'}`}>
      {checked ? 'YES' : 'NO'}
    </span>
    <span
      className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white transition-transform duration-300 shadow ${checked ? 'translate-x-8' : 'translate-x-1'}`}
    />
  </button>
);

const EditOrganization = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Section Refs for Auto-scroll
  const generalRef = useRef(null);
  const alertsRef = useRef(null);
  const fuelsRef = useRef(null);
  const smsRef = useRef(null);
  const whatsappRef = useRef(null);
  const telegramRef = useRef(null);
  const rfidRef = useRef(null);
  const geofencesRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    description: '',
    fleet_os_email: '',
    show_geofences: false,
    
    // Alert Configuration
    parking_alert: false,
    idle_alert: false,
    overspeed_alert: false,
    unauthorised_movement_alert: false,
    sos_alert: false,
    harsh_breaking_alert: false,
    daily_summary_enabled: false,
    trip_planned_time: false,
    towing_alert: true,
    tamper_alert: true,

    parking_duration: 10,
    idle_duration: 10,
    overspeed_duration: 0,
    no_data_duration: '',
    power_cut_off_alarm_duration: 0,
    route_deviation_meters: 500,

    // Fuel Configuration
    daily_diesel_summary: false,
    ongoing_fuel_alerts: false,
    fuel_alarm: false,
    excess_consumption_filter: false,
    instant_fuel_alerts: false,
    verified_fuel_fill_theft_alert: true,
    fuel_level_below: false,
    fuel_notification_alert: 'Always',
    geofence_fuel_alert: 'Both',

    // SMS Configuration
    sms_sender: '',
    sms_provider: '',
    sms_pattern: '',
    sms_escalation: false,

    // WhatsApp, Telegram, RFID Configuration
    whatsapp_enabled: false,
    telegram_enabled: false,
    rfid_enabled: false,

    // Geofence Configuration
    school_geofence: false,
    geofence_immobilizer: false,
    send_geofence_sms: '',
    geofence: '',
  });

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        setLoadingData(true);
        const res = await api.get(`/organizations/${id}`);
        if (res.data.success) {
          const org = res.data.data;
          setForm({
            name: org.name || '',
            email: org.email || '',
            mobile: org.mobile || '',
            description: org.description || '',
            fleet_os_email: org.fleet_os_email || '',
            show_geofences: org.show_geofences ?? false,
            parking_alert: org.parking_alert ?? false,
            idle_alert: org.idle_alert ?? false,
            overspeed_alert: org.overspeed_alert ?? false,
            unauthorised_movement_alert: org.unauthorised_movement_alert ?? false,
            sos_alert: org.sos_alert ?? false,
            harsh_breaking_alert: org.harsh_breaking_alert ?? false,
            daily_summary_enabled: org.daily_summary_enabled ?? false,
            trip_planned_time: org.trip_planned_time ?? false,
            towing_alert: org.towing_alert ?? true,
            tamper_alert: org.tamper_alert ?? true,
            parking_duration: org.parking_duration ?? 10,
            idle_duration: org.idle_duration ?? 10,
            overspeed_duration: org.overspeed_duration ?? 0,
            no_data_duration: org.no_data_duration || '',
            power_cut_off_alarm_duration: org.power_cut_off_alarm_duration ?? 0,
            route_deviation_meters: org.route_deviation_meters ?? 500,
            daily_diesel_summary: org.daily_diesel_summary ?? false,
            ongoing_fuel_alerts: org.ongoing_fuel_alerts ?? false,
            fuel_alarm: org.fuel_alarm ?? false,
            excess_consumption_filter: org.excess_consumption_filter ?? false,
            instant_fuel_alerts: org.instant_fuel_alerts ?? false,
            verified_fuel_fill_theft_alert: org.verified_fuel_fill_theft_alert ?? true,
            fuel_level_below: org.fuel_level_below ?? false,
            fuel_notification_alert: org.fuel_notification_alert || 'Always',
            geofence_fuel_alert: org.geofence_fuel_alert || 'Both',
            sms_sender: org.sms_sender || '',
            sms_provider: org.sms_provider || '',
            sms_pattern: org.sms_pattern || '',
            sms_escalation: org.sms_escalation ?? false,
            whatsapp_enabled: org.whatsapp_enabled ?? false,
            telegram_enabled: org.telegram_enabled ?? false,
            rfid_enabled: org.rfid_enabled ?? false,
            school_geofence: org.school_geofence ?? false,
            geofence_immobilizer: org.geofence_immobilizer ?? false,
            send_geofence_sms: org.send_geofence_sms || '',
            geofence: org.geofence || '',
          });
        }
      } catch (err) {
        console.error('Failed to load organization:', err);
        alert('Failed to load organization details.');
        navigate('/admin/organizations');
      } finally {
        setLoadingData(false);
      }
    };

    fetchOrg();
  }, [id, navigate]);

  useEffect(() => {
    if (loadingData) return;
    const tab = searchParams.get('tab');
    if (tab === 'alerts' && alertsRef.current) {
      alertsRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'sms' && smsRef.current) {
      smsRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'general' && generalRef.current) {
      generalRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [searchParams, loadingData]);

  const handleToggleChange = (field, checked) => {
    setForm((prev) => ({ ...prev, [field]: checked }));
  };

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.name.trim()) {
      alert('Organization Name is required.');
      setLoading(false);
      return;
    }
    if (!form.email.trim()) {
      alert('Email is required.');
      setLoading(false);
      return;
    }
    if (!form.mobile.trim()) {
      alert('Mobile Number is required.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.put(`/organizations/${id}`, form);
      if (res.data.success) {
        alert('Organization updated successfully!');
        navigate('/admin/organizations');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update organization.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-lb-500 font-semibold text-xs">
        <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading organization details...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Breadcrumbs */}
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold font-display text-lb-800 dark:text-white">Edit Organization</h2>
        <div className="h-6 w-[1px] bg-[rgba(61,122,138,0.25)]"></div>
        <div className="flex items-center gap-2 text-xs font-semibold text-lb-500 uppercase tracking-wider">
          <Link to="/admin" className="hover:text-lb-700 transition-colors">
            <i className="fa-solid fa-house"></i>
          </Link>
          <span>&gt;</span>
          <Link to="/admin/organizations" className="hover:text-lb-700 transition-colors">Organization</Link>
          <span>&gt;</span>
          <span className="text-lb-400">Edit Organization</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ═══ 1. GENERAL SECTION ═══ */}
        <div ref={generalRef} className="glass-card rounded-[24px] p-6 space-y-4">
          <h3 className="text-[#3d7a8a] dark:text-lb-300 font-bold text-sm mb-4 border-b border-[rgba(61,122,138,0.12)] pb-2 flex items-center gap-2 font-display">
            <i className="fa-solid fa-circle-info text-xs"></i> General
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">
                Organization Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Organization Name"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] focus:ring-2 focus:ring-[rgba(61,122,138,0.1)] text-xs font-medium dark:text-white transition-all shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] focus:ring-2 focus:ring-[rgba(61,122,138,0.1)] text-xs font-medium dark:text-white transition-all shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">
                Mobile Number<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Mobile Number"
                value={form.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] focus:ring-2 focus:ring-[rgba(61,122,138,0.1)] text-xs font-medium dark:text-white transition-all shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">
                Description
              </label>
              <input
                type="text"
                placeholder="Description"
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] focus:ring-2 focus:ring-[rgba(61,122,138,0.1)] text-xs font-medium dark:text-white transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">
                FleetOS Email
              </label>
              <input
                type="email"
                placeholder="FleetOS Email"
                value={form.fleet_os_email}
                onChange={(e) => handleInputChange('fleet_os_email', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] focus:ring-2 focus:ring-[rgba(61,122,138,0.1)] text-xs font-medium dark:text-white transition-all shadow-sm"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl self-end">
              <span className="text-xs font-bold text-lb-700 dark:text-lb-300">Show Geofences (In Web)</span>
              <Toggle checked={form.show_geofences} onChange={(val) => handleToggleChange('show_geofences', val)} />
            </div>
          </div>
        </div>

        {/* ═══ 2. ALERT CONFIGURATION ═══ */}
        <div ref={alertsRef} className="glass-card rounded-[24px] p-6 space-y-4">
          <h3 className="text-[#3d7a8a] dark:text-lb-300 font-bold text-sm mb-4 border-b border-[rgba(61,122,138,0.12)] pb-2 flex items-center gap-2 font-display">
            <i className="fa-solid fa-bell text-xs"></i> Alert Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl">
              <span className="text-xs font-bold text-lb-700 dark:text-lb-300">Parking Alert</span>
              <Toggle checked={form.parking_alert} onChange={(val) => handleToggleChange('parking_alert', val)} />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl">
              <span className="text-xs font-bold text-lb-700 dark:text-lb-300">Idle Alert</span>
              <Toggle checked={form.idle_alert} onChange={(val) => handleToggleChange('idle_alert', val)} />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl">
              <span className="text-xs font-bold text-lb-700 dark:text-lb-300">OverSpeed Alert</span>
              <Toggle checked={form.overspeed_alert} onChange={(val) => handleToggleChange('overspeed_alert', val)} />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl">
              <span className="text-xs font-bold text-lb-700 dark:text-lb-300">Unauthorised Movement Alert</span>
              <Toggle checked={form.unauthorised_movement_alert} onChange={(val) => handleToggleChange('unauthorised_movement_alert', val)} />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl">
              <span className="text-xs font-bold text-lb-700 dark:text-lb-300">SOS Alert</span>
              <Toggle checked={form.sos_alert} onChange={(val) => handleToggleChange('sos_alert', val)} />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl">
              <span className="text-xs font-bold text-lb-700 dark:text-lb-300">Harsh Breaking Alert</span>
              <Toggle checked={form.harsh_breaking_alert} onChange={(val) => handleToggleChange('harsh_breaking_alert', val)} />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl">
              <span className="text-xs font-bold text-lb-700 dark:text-lb-300">Daily Summary</span>
              <Toggle checked={form.daily_summary_enabled} onChange={(val) => handleToggleChange('daily_summary_enabled', val)} />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl">
              <span className="text-xs font-bold text-lb-700 dark:text-lb-300">Trip Planned Time</span>
              <Toggle checked={form.trip_planned_time} onChange={(val) => handleToggleChange('trip_planned_time', val)} />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl">
              <span className="text-xs font-bold text-lb-700 dark:text-lb-300">Towing Alert</span>
              <Toggle checked={form.towing_alert} onChange={(val) => handleToggleChange('towing_alert', val)} />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl">
              <span className="text-xs font-bold text-lb-700 dark:text-lb-300">Tamper Alert</span>
              <Toggle checked={form.tamper_alert} onChange={(val) => handleToggleChange('tamper_alert', val)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">Park Duration (Mins)</label>
              <input
                type="number"
                placeholder="Park Duration (Mins)"
                value={form.parking_duration}
                onChange={(e) => handleInputChange('parking_duration', parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">Idle Duration (Mins)</label>
              <input
                type="number"
                placeholder="Idle Duration (Mins)"
                value={form.idle_duration}
                onChange={(e) => handleInputChange('idle_duration', parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">OverSpeed Alert Duration (Mins)</label>
              <input
                type="number"
                placeholder="OverSpeed Alert Duration (Mins)"
                value={form.overspeed_duration}
                onChange={(e) => handleInputChange('overspeed_duration', parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">No Data Duration</label>
              <select
                value={form.no_data_duration}
                onChange={(e) => handleInputChange('no_data_duration', e.target.value)}
                className="w-full px-3 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm font-semibold text-lb-800"
              >
                <option value="">-- Select --</option>
                <option value="10">10 Mins</option>
                <option value="30">30 Mins</option>
                <option value="60">1 Hour</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">Power Cut Off Alarm Duration (Mins)</label>
              <input
                type="number"
                placeholder="Power Cut Off Alarm Duration (Mins)"
                value={form.power_cut_off_alarm_duration}
                onChange={(e) => handleInputChange('power_cut_off_alarm_duration', parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">Route Deviation (Meters)</label>
              <select
                value={form.route_deviation_meters}
                onChange={(e) => handleInputChange('route_deviation_meters', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm font-semibold text-lb-800"
              >
                <option value="">-- Select --</option>
                <option value="100">100 Meters</option>
                <option value="300">300 Meters</option>
                <option value="500">500 Meters</option>
                <option value="1000">1000 Meters</option>
              </select>
            </div>
          </div>
        </div>

        {/* ═══ 3. FUEL ALERTS CONFIGURATION ═══ */}
        <div ref={fuelsRef} className="glass-card rounded-[24px] p-6 space-y-4">
          <h3 className="text-[#3d7a8a] dark:text-lb-300 font-bold text-sm mb-4 border-b border-[rgba(61,122,138,0.12)] pb-2 flex items-center gap-2 font-display">
            <i className="fa-solid fa-gas-pump text-xs"></i> Fuel Alerts Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl">
              <span className="text-xs font-bold text-lb-700 dark:text-lb-300">Daily Diesel Summary</span>
              <Toggle checked={form.daily_diesel_summary} onChange={(val) => handleToggleChange('daily_diesel_summary', val)} />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl">
              <span className="text-xs font-bold text-lb-700 dark:text-lb-300">Ongoing Fuel Alerts</span>
              <Toggle checked={form.ongoing_fuel_alerts} onChange={(val) => handleToggleChange('ongoing_fuel_alerts', val)} />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl">
              <span className="text-xs font-bold text-lb-700 dark:text-lb-300">Fuel Alarm</span>
              <Toggle checked={form.fuel_alarm} onChange={(val) => handleToggleChange('fuel_alarm', val)} />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl">
              <span className="text-xs font-bold text-lb-700 dark:text-lb-300">Excess Consumption Filter</span>
              <Toggle checked={form.excess_consumption_filter} onChange={(val) => handleToggleChange('excess_consumption_filter', val)} />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl">
              <span className="text-xs font-bold text-lb-700 dark:text-lb-300">Instant Fuel Alerts</span>
              <Toggle checked={form.instant_fuel_alerts} onChange={(val) => handleToggleChange('instant_fuel_alerts', val)} />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl">
              <span className="text-xs font-bold text-lb-700 dark:text-lb-300">Verified Fuel Fill/Theft Alert</span>
              <Toggle checked={form.verified_fuel_fill_theft_alert} onChange={(val) => handleToggleChange('verified_fuel_fill_theft_alert', val)} />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl">
              <span className="text-xs font-bold text-lb-700 dark:text-lb-300">Fuel Level Below</span>
              <Toggle checked={form.fuel_level_below} onChange={(val) => handleToggleChange('fuel_level_below', val)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">Fuel Notification Alert</label>
              <select
                value={form.fuel_notification_alert}
                onChange={(e) => handleInputChange('fuel_notification_alert', e.target.value)}
                className="w-full px-3 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm font-semibold text-lb-800"
              >
                <option value="Always">Always</option>
                <option value="Periodic">Periodic</option>
                <option value="Never">Never</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">GeoFence Fuel Alert</label>
              <select
                value={form.geofence_fuel_alert}
                onChange={(e) => handleInputChange('geofence_fuel_alert', e.target.value)}
                className="w-full px-3 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm font-semibold text-lb-800"
              >
                <option value="Both">Both</option>
                <option value="Inside Only">Inside Only</option>
                <option value="Outside Only">Outside Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* ═══ 4. SMS ALERTS CONFIGURATION ═══ */}
        <div ref={smsRef} className="glass-card rounded-[24px] p-6 space-y-4">
          <h3 className="text-[#3d7a8a] dark:text-lb-300 font-bold text-sm mb-4 border-b border-[rgba(61,122,138,0.12)] pb-2 flex items-center gap-2 font-display">
            <i className="fa-solid fa-message text-xs"></i> SMS Alerts Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-4">
            <div>
              <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">SMS Sender</label>
              <input
                type="text"
                placeholder="SMS Sender"
                value={form.sms_sender}
                onChange={(e) => handleInputChange('sms_sender', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">SMS Provider</label>
              <select
                value={form.sms_provider}
                onChange={(e) => handleInputChange('sms_provider', e.target.value)}
                className="w-full px-3 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm font-semibold text-lb-800"
              >
                <option value="">SMS Provider</option>
                <option value="twilio">Twilio</option>
                <option value="infobip">Infobip</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">SMS Pattern</label>
              <select
                value={form.sms_pattern}
                onChange={(e) => handleInputChange('sms_pattern', e.target.value)}
                className="w-full px-3 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm font-semibold text-lb-800"
              >
                <option value="">-- Select --</option>
                <option value="standard">Standard</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl max-w-xs">
            <span className="text-xs font-bold text-lb-700 dark:text-lb-300">SMS Escalation</span>
            <Toggle checked={form.sms_escalation} onChange={(val) => handleToggleChange('sms_escalation', val)} />
          </div>
        </div>

        {/* ═══ 5. WHATSAPP CONFIGURATION ═══ */}
        <div ref={whatsappRef} className="glass-card rounded-[24px] p-6 space-y-4">
          <h3 className="text-[#3d7a8a] dark:text-lb-300 font-bold text-sm mb-4 border-b border-[rgba(61,122,138,0.12)] pb-2 flex items-center gap-2 font-display">
            <i className="fa-brands fa-whatsapp text-xs text-[#0a8f78] dark:text-[#34d8b5]"></i> Whats App Configuration
          </h3>
          <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl max-w-xs">
            <span className="text-xs font-bold text-lb-700 dark:text-lb-300">Whats App Notification</span>
            <Toggle checked={form.whatsapp_enabled} onChange={(val) => handleToggleChange('whatsapp_enabled', val)} />
          </div>
        </div>

        {/* ═══ 6. TELEGRAM CONFIGURATION ═══ */}
        <div ref={telegramRef} className="glass-card rounded-[24px] p-6 space-y-4">
          <h3 className="text-[#3d7a8a] dark:text-lb-300 font-bold text-sm mb-4 border-b border-[rgba(61,122,138,0.12)] pb-2 flex items-center gap-2 font-display">
            <i className="fa-brands fa-telegram text-xs text-[#3498db]"></i> Telegram Configuration
          </h3>
          <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl max-w-xs">
            <span className="text-xs font-bold text-lb-700 dark:text-lb-300">Telegram Notification</span>
            <Toggle checked={form.telegram_enabled} onChange={(val) => handleToggleChange('telegram_enabled', val)} />
          </div>
        </div>

        {/* ═══ 7. RFID CONFIGURATION ═══ */}
        <div ref={rfidRef} className="glass-card rounded-[24px] p-6 space-y-4">
          <h3 className="text-[#3d7a8a] dark:text-lb-300 font-bold text-sm mb-4 border-b border-[rgba(61,122,138,0.12)] pb-2 flex items-center gap-2 font-display">
            <i className="fa-solid fa-address-card text-xs"></i> RFID Configuration
          </h3>
          <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl max-w-xs">
            <span className="text-xs font-bold text-lb-700 dark:text-lb-300">IS RFID</span>
            <Toggle checked={form.rfid_enabled} onChange={(val) => handleToggleChange('rfid_enabled', val)} />
          </div>
        </div>

        {/* ═══ 8. GEOFENCE CONFIGURATION ═══ */}
        <div ref={geofencesRef} className="glass-card rounded-[24px] p-6 space-y-4">
          <h3 className="text-[#3d7a8a] dark:text-lb-300 font-bold text-sm mb-4 border-b border-[rgba(61,122,138,0.12)] pb-2 flex items-center gap-2 font-display">
            <i className="fa-solid fa-map-location-dot text-xs"></i> Geofence Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl">
              <span className="text-xs font-bold text-lb-700 dark:text-lb-300">School Geofence</span>
              <Toggle checked={form.school_geofence} onChange={(val) => handleToggleChange('school_geofence', val)} />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[rgba(218,241,255,0.2)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] rounded-2xl">
              <span className="text-xs font-bold text-lb-700 dark:text-lb-300">Geofence Immobilizer</span>
              <Toggle checked={form.geofence_immobilizer} onChange={(val) => handleToggleChange('geofence_immobilizer', val)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">Send Geofence SMS</label>
              <select
                value={form.send_geofence_sms}
                onChange={(e) => handleInputChange('send_geofence_sms', e.target.value)}
                className="w-full px-3 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm font-semibold text-lb-800"
              >
                <option value="">-- Select --</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-lb-700 dark:text-lb-300 mb-1.5 uppercase tracking-wider">Geofence</label>
              <select
                value={form.geofence}
                onChange={(e) => handleInputChange('geofence', e.target.value)}
                className="w-full px-3 py-2.5 bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.25)] rounded-xl focus:outline-none focus:border-[#3d7a8a] text-xs font-medium dark:text-white transition-all shadow-sm font-semibold text-lb-800"
              >
                <option value="">-- Select --</option>
                <option value="Option 1">Option 1</option>
                <option value="Option 2">Option 2</option>
              </select>
            </div>
          </div>
        </div>

        {/* Center Save Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-3 bg-gradient-to-r from-[rgba(29,100,120,0.18)] to-[rgba(15,60,80,0.14)] dark:from-[rgba(61,122,138,0.35)] dark:to-[rgba(20,42,54,0.25)] border border-[rgba(61,122,138,0.45)] hover:from-[rgba(29,100,120,0.28)] hover:to-[rgba(15,60,80,0.22)] shadow-md hover:shadow-lg text-lb-800 dark:text-white rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Organization'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditOrganization;
