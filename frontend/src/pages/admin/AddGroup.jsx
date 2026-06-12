import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const AddGroup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  
  return (
    <div className="max-w-3xl mx-auto animate-fadeIn mt-4">
      <div className="glass-card rounded-[24px] p-8">
        <div className="mb-8 border-b border-[rgba(61,122,138,0.15)] pb-6">
          <h3 className="font-display text-[24px] font-bold text-lb-800 dark:text-white text-center">
            Create New Group
          </h3>
          <p className="text-center text-lb-500 text-[13px] mt-2">Organize vehicles into logical groups for better fleet management.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setLoading(true); setTimeout(() => { setLoading(false); navigate('/admin/groups'); }, 1000); }} className="space-y-6">
          <div className="grid grid-cols-1 gap-5">
            <Input label="Group Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. North Fleet" required />
            <div>
              <label className="input-label">Description</label>
              <textarea 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                placeholder="Brief description of the group's purpose" 
                rows={4} 
                className="input-field resize-none leading-relaxed" 
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-8 mt-4 border-t border-[rgba(61,122,138,0.15)]">
            <Button variant="ghost" type="button" onClick={() => navigate('/admin/groups')}>Cancel</Button>
            <Button type="submit" loading={loading} icon={() => <i className="fa-solid fa-layer-group mr-2"></i>}>Create Group</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddGroup;
