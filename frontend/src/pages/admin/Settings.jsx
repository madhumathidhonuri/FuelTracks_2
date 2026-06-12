import { useState } from 'react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const tabs = ['general', 'notifications', 'security', 'api'];

  return (
    <div className="space-y-6 animate-fadeIn"><Card>
      <h3 className="font-semibold text-lg text-text-primary font-display mb-6">System Settings</h3>
      <div className="flex gap-2 mb-6 border-b border-[rgba(56,175,249,0.12)] pb-4">{tabs.map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider capitalize transition-colors ${activeTab === tab ? 'bg-accent text-white' : 'bg-lb-50 text-muted hover:bg-[rgba(56,175,249,0.06)]'}`}>{tab}</button>))}</div>
      {activeTab === 'general' && (<div className="space-y-4 max-w-xl">
        <Input label="Organization Name" defaultValue="FuelTracks" />
        <Input label="Support Email" type="email" defaultValue="support@fueltracks.com" />
        <div className="flex items-center justify-between p-4 rounded-xl bg-lb-50"><div><p className="text-sm font-medium text-text-primary">Dark Mode</p><p className="text-xs text-muted">Enable dark theme for all users</p></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" /><div className="w-11 h-6 bg-lb-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" /></label></div>
        <div className="flex pt-4"><Button loading={loading}>Save Changes</Button></div>
      </div>)}
      {activeTab === 'security' && (<div className="space-y-4 max-w-xl"><Input label="Current Password" type="password" placeholder="Enter current password" /><Input label="New Password" type="password" placeholder="Min. 8 characters" /><Input label="Confirm Password" type="password" placeholder="Re-enter new password" /><div className="flex pt-4"><Button loading={loading}>Update Password</Button></div></div>)}
      {activeTab === 'notifications' && (<div className="space-y-4 max-w-xl">{[{ label: 'Email Alerts', desc: 'Receive email for critical alerts', enabled: true }, { label: 'SMS Alerts', desc: 'Receive SMS for overspeed alerts', enabled: false }, { label: 'Push Notifications', desc: 'Browser push notifications', enabled: true }].map((item) => (<div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-lb-50"><div><p className="text-sm font-medium text-text-primary">{item.label}</p><p className="text-xs text-muted">{item.desc}</p></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" /><div className="w-11 h-6 bg-lb-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" /></label></div>))}<div className="flex pt-4"><Button loading={loading}>Save Preferences</Button></div></div>)}
      {activeTab === 'api' && (<div className="space-y-4 max-w-xl"><div className="p-4 rounded-xl bg-lb-50"><div className="flex items-center justify-between mb-2"><p className="text-sm font-medium text-text-primary">API Key</p><button className="text-xs text-accent hover:underline">Regenerate</button></div><div className="flex items-center gap-2"><code className="flex-1 px-3 py-2 bg-white rounded-lg text-xs font-mono text-muted border border-[rgba(56,175,249,0.12)]">ft_live_••••••••••••••••••••••••</code><button className="px-3 py-2 bg-accent text-white rounded-lg text-xs">Copy</button></div></div><div className="p-4 rounded-xl bg-lb-50"><p className="text-sm font-medium text-text-primary mb-1">Webhook URL</p><input placeholder="https://your-app.com/webhook" className="w-full px-4 py-2.5 bg-white border border-[rgba(56,175,249,0.25)] rounded-xl text-sm" /></div></div>)}
    </Card></div>
  );
};
export default Settings;
