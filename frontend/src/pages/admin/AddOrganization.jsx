import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Stepper from '../../components/common/Stepper';

const AddOrganization = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', plan: 'professional' });
  const handleChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));
  const plans = [
    { id: 'starter', name: 'Starter', price: '₹2,999/mo', vehicles: 10, users: 3 },
    { id: 'professional', name: 'Professional', price: '₹5,999/mo', vehicles: 50, users: 10 },
    { id: 'enterprise', name: 'Enterprise', price: '₹12,999/mo', vehicles: 200, users: 50 }
  ];

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn mt-4">
      <div className="glass-card rounded-[24px] p-8">
        <div className="mb-10">
          <h3 className="font-display text-[24px] font-bold text-lb-800 dark:text-white mb-8 text-center">
            Add New Organization
          </h3>
          <div className="max-w-lg mx-auto">
            <Stepper steps={['Basic Info', 'Plan Selection', 'Review & Create']} currentStep={step} />
          </div>
        </div>

        {step === 0 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Organization Name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Enter organization name" />
              <Input label="Email Address" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="org@company.com" />
              <Input label="Phone Number" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+91 98765 43210" />
              <Input label="City" value={form.city} onChange={(e) => handleChange('city', e.target.value)} placeholder="Mumbai" />
            </div>
            <Input label="Address" value={form.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="Office address" />
            
            <div className="flex justify-between items-center pt-8 mt-4 border-t border-[rgba(61,122,138,0.15)]">
              <Button variant="ghost" onClick={() => navigate('/admin/organizations')}>Cancel</Button>
              <Button onClick={() => setStep(1)}>Next Step &rarr;</Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-lb-500 mb-2">Select Subscription Plan</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handleChange('plan', plan.id)}
                  className={`relative p-5 rounded-[20px] transition-all duration-300 text-left overflow-hidden ${
                    form.plan === plan.id 
                      ? 'bg-[rgba(52,216,181,0.08)] border-2 border-[#34d8b5] shadow-[0_8px_24px_rgba(52,216,181,0.15)]' 
                      : 'bg-[rgba(218,241,255,0.3)] dark:bg-[rgba(13,30,38,0.5)] border border-[rgba(61,122,138,0.2)] hover:border-[#3d7a8a] hover:-translate-y-1'
                  }`}
                >
                  {form.plan === plan.id && (
                    <div className="absolute top-0 right-0 bg-[#34d8b5] text-[#0a8f78] text-[10px] font-bold px-2 py-1 rounded-bl-[10px]">
                      SELECTED
                    </div>
                  )}
                  <h5 className="font-bold text-[15px] text-lb-800 dark:text-white">{plan.name}</h5>
                  <p className="text-[22px] font-bold text-[#3d7a8a] dark:text-[#5a9baa] font-display mt-2 mb-4">{plan.price}</p>
                  <div className="space-y-2 text-[12px] text-lb-600 dark:text-lb-400 font-medium">
                    <p className="flex items-center gap-2"><i className="fa-solid fa-truck text-[#34d8b5]"></i> Up to {plan.vehicles} vehicles</p>
                    <p className="flex items-center gap-2"><i className="fa-solid fa-users text-[#34d8b5]"></i> Up to {plan.users} users</p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex justify-between items-center pt-8 mt-4 border-t border-[rgba(61,122,138,0.15)]">
              <Button variant="outline" onClick={() => setStep(0)}>&larr; Back</Button>
              <Button onClick={() => setStep(2)}>Next Step &rarr;</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-lb-500 mb-2">Review Organization Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Organization Name', value: form.name || 'Not provided', icon: 'fa-building' },
                { label: 'Email Address', value: form.email || 'Not provided', icon: 'fa-envelope' },
                { label: 'Phone Number', value: form.phone || 'Not provided', icon: 'fa-phone' },
                { label: 'City', value: form.city || 'Not provided', icon: 'fa-city' },
                { label: 'Selected Plan', value: form.plan.charAt(0).toUpperCase() + form.plan.slice(1), icon: 'fa-cube', highlight: true }
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4 p-4 rounded-2xl bg-[rgba(218,241,255,0.4)] dark:bg-[rgba(13,30,38,0.6)] border border-[rgba(61,122,138,0.15)]">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[14px] ${item.highlight ? 'bg-[#3d7a8a] text-white shadow-lg' : 'bg-[rgba(61,122,138,0.15)] text-[#3d7a8a] dark:text-[#5a9baa]'}`}>
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-lb-500 mb-0.5">{item.label}</div>
                    <div className={`text-[14px] font-semibold ${item.highlight ? 'text-[#3d7a8a] dark:text-[#5a9baa]' : 'text-lb-800 dark:text-white'}`}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-8 mt-4 border-t border-[rgba(61,122,138,0.15)]">
              <Button variant="outline" onClick={() => setStep(1)}>&larr; Back</Button>
              <Button 
                onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); navigate('/admin/organizations'); }, 1000); }} 
                loading={loading}
                icon={() => <i className="fa-solid fa-check mr-2"></i>}
              >
                Create Organization
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AddOrganization;

