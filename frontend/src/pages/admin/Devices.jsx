import { useState } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Stepper from '../../components/common/Stepper';

const Devices = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnboard, setShowOnboard] = useState(false);
  const [onboardStep, setOnboardStep] = useState(0);
  const data = [{ id: 1, imei: '357815090534838', model: 'TK316', status: 'active', assignedTo: 'VH-001', lastSeen: '2 min ago' }, { id: 2, imei: '357815090534839', model: 'TK316', status: 'active', assignedTo: 'VH-002', lastSeen: '5 min ago' }];
  const columns = [{ key: 'imei', label: 'IMEI' }, { key: 'model', label: 'Model' }, { key: 'status', label: 'Status', render: (v) => <Badge variant={v}>{v}</Badge> }, { key: 'assignedTo', label: 'Assigned To' }, { key: 'lastSeen', label: 'Last Seen' }, { key: 'actions', label: 'Actions', render: () => <button onClick={() => setShowOnboard(true)} className="px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors">Onboard</button> }];

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card><div className="flex items-center justify-between flex-wrap gap-4"><h3 className="font-semibold text-sm text-text-primary font-display">Devices</h3><div className="flex items-center gap-4"><SearchBar placeholder="Search by IMEI..." onSearch={setSearchQuery} className="w-64" /><button onClick={() => setShowOnboard(true)} className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Onboard Device</button></div></div></Card>
      <Card><Table columns={columns} data={data} emptyMessage="No devices found" /></Card>
      <Modal isOpen={showOnboard} onClose={() => { setShowOnboard(false); setOnboardStep(0); }} title="Onboard Device" size="lg">
        <div className="mb-6"><Stepper steps={['Device', 'Plan', 'Vehicle']} currentStep={onboardStep} /></div>
        {onboardStep === 0 && (<div className="space-y-4"><p className="text-sm text-muted">Enter the device IMEI and details</p><input placeholder="Device IMEI" className="w-full px-4 py-3 bg-lb-50 border border-[rgba(56,175,249,0.25)] rounded-xl text-sm focus:outline-none focus:border-accent" /><input placeholder="Device Model" className="w-full px-4 py-3 bg-lb-50 border border-[rgba(56,175,249,0.25)] rounded-xl text-sm focus:outline-none focus:border-accent" /><div className="flex justify-end pt-4"><button onClick={() => setOnboardStep(1)} className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold">Next →</button></div></div>)}
        {onboardStep === 1 && (<div className="space-y-4"><p className="text-sm text-muted">Select subscription plan</p>{['Starter', 'Professional', 'Enterprise'].map((plan) => <button key={plan} className="w-full p-4 rounded-xl border border-[rgba(56,175,249,0.18)] hover:border-accent text-left"><span className="text-sm font-medium text-text-primary">{plan}</span></button>)}<div className="flex justify-between pt-4"><button onClick={() => setOnboardStep(0)} className="px-4 py-2 bg-lb-50 rounded-xl text-sm">← Back</button><button onClick={() => setOnboardStep(2)} className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold">Next →</button></div></div>)}
        {onboardStep === 2 && (<div className="space-y-4"><p className="text-sm text-muted">Link device to a vehicle</p><select className="w-full px-4 py-3 bg-lb-50 border border-[rgba(56,175,249,0.25)] rounded-xl text-sm"><option>Select vehicle</option></select><div className="flex justify-between pt-4"><button onClick={() => setOnboardStep(1)} className="px-4 py-2 bg-lb-50 rounded-xl text-sm">← Back</button><button onClick={() => { setShowOnboard(false); setOnboardStep(0); }} className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold">Complete Onboard</button></div></div>)}
      </Modal>
    </div>
  );
};
export default Devices;
