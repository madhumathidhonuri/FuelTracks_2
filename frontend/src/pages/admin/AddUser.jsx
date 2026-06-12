import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const AddUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'user' });
  
  return (
    <div className="max-w-3xl mx-auto animate-fadeIn mt-4">
      <div className="glass-card rounded-[24px] p-8">
        <div className="mb-8 border-b border-[rgba(61,122,138,0.15)] pb-6">
          <h3 className="font-display text-[24px] font-bold text-lb-800 dark:text-white text-center">
            Add New User
          </h3>
          <p className="text-center text-lb-500 text-[13px] mt-2">Create an account for a new fleet manager or driver.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setLoading(true); setTimeout(() => { setLoading(false); navigate('/admin/users'); }, 1000); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required />
            <Input label="Email Address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" required />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 characters" required />
          </div>

          <div className="p-5 rounded-[20px] bg-[rgba(218,241,255,0.3)] dark:bg-[rgba(13,30,38,0.4)] border border-[rgba(61,122,138,0.15)] max-w-sm">
             <label className="input-label">Role Assignment</label>
             <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(7,81,134,0.45)]">
                  <i className="fa-solid fa-user-shield text-[12px]"></i>
                </div>
                <select 
                  value={form.role} 
                  onChange={(e) => setForm({ ...form, role: e.target.value })} 
                  className="input-field !pl-10 appearance-none bg-no-repeat"
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%233d7a8a%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundPosition: 'right 16px top 50%', backgroundSize: '10px auto' }}
                >
                  {['user', 'admin'].map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
             </div>
          </div>

          <div className="flex justify-between items-center pt-8 mt-4 border-t border-[rgba(61,122,138,0.15)]">
            <Button variant="ghost" type="button" onClick={() => navigate('/admin/users')}>Cancel</Button>
            <Button type="submit" loading={loading} icon={() => <i className="fa-solid fa-user-plus mr-2"></i>}>Create User</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddUser;

