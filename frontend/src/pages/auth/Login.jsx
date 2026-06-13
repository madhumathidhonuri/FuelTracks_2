import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth.api';
import BackgroundCanvas from '../../components/common/BackgroundCanvas';

const Login = () => {
  const [email, setEmail] = useState('admin@fueltracks.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const { accessToken, refreshToken, user } = res.data?.data || res.data || {};
      if (accessToken) {
        login(accessToken, refreshToken, user);
        navigate(user?.role === 'admin' || user?.role === 'superadmin' ? '/admin' : '/dashboard');
      } else {
        setError('Unexpected response from server.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative z-10">
      {/* ═══ BG CANVAS ═══ */}
      <BackgroundCanvas />

      {/* ═══ LOGIN PAGE ═══ */}
      <div id="loginPage" className="fixed inset-0 z-[100] flex items-stretch">
        {/* LEFT HERO */}
        <div className="hidden lg:flex lg:flex-[1.1] relative overflow-hidden flex-col justify-center px-16 py-16">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, rgba(61,122,138,0.08) 0%, rgba(186,226,253,0.05) 100%)' }}></div>

          <svg className="route-svg" viewBox="0 0 600 700" preserveAspectRatio="none">
            <path d="M50,200 Q200,150 350,300 T550,450" stroke="rgba(61,122,138,0.35)" strokeWidth="1.5" fill="none" strokeDasharray="6 4" />
            <path d="M80,400 Q250,350 380,500 T560,600" stroke="rgba(61,122,138,0.18)" strokeWidth="1.5" fill="none" strokeDasharray="4 6" />
            <circle cx="50" cy="200" r="5" fill="rgba(61,122,138,0.5)" />
            <circle cx="350" cy="300" r="5" fill="rgba(61,122,138,0.5)" />
            <circle cx="550" cy="450" r="5" fill="rgba(61,122,138,0.5)" />
            <circle cx="80" cy="400" r="4" fill="rgba(61,122,138,0.3)" />
            <circle cx="380" cy="500" r="4" fill="rgba(61,122,138,0.3)" />
          </svg>

          <div className="relative z-10 flex items-center gap-3 mb-14">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg,rgba(61,122,138,0.2),rgba(15,60,80,0.12))', border: '1px solid rgba(61,122,138,0.35)', color: '#2a6070' }}>
              <i className="fa-solid fa-gas-pump"></i>
            </div>
            <span className="font-display text-xl font-bold text-lb-800">FuelTracks</span>
          </div>

          <div className="relative z-10">
            <h1
              className="font-display font-extrabold leading-[1.1] tracking-tight mb-5 text-lb-900"
              style={{ fontSize: 'clamp(32px,4vw,52px)' }}
            >
              Smart Fleet<br />Management
            </h1>
            <p className="text-base leading-relaxed mb-10 max-w-sm text-lb-700">
              Real-time vehicle tracking, fuel monitoring, and advanced analytics — unified in one elegant platform.
            </p>

            <div className="flex gap-4 flex-wrap mb-12">
              <div className="fstat-float rounded-2xl px-5 py-4"
                style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(16px)', border: '1px solid rgba(61,122,138,0.28)', boxShadow: '0 8px 24px rgba(15,60,80,0.1)' }}>
                <div className="font-display text-[26px] font-bold text-lb-700">247</div>
                <div className="text-[11px] uppercase tracking-widest mt-0.5 text-lb-500">Active Vehicles</div>
              </div>
              <div className="fstat-float rounded-2xl px-5 py-4"
                style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(16px)', border: '1px solid rgba(61,122,138,0.28)', boxShadow: '0 8px 24px rgba(15,60,80,0.1)' }}>
                <div className="font-display text-[26px] font-bold text-lb-700">94.2%</div>
                <div className="text-[11px] uppercase tracking-widest mt-0.5 text-lb-500">Fleet Uptime</div>
              </div>
              <div className="fstat-float rounded-2xl px-5 py-4"
                style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(16px)', border: '1px solid rgba(61,122,138,0.28)', boxShadow: '0 8px 24px rgba(15,60,80,0.1)' }}>
                <div className="font-display text-[26px] font-bold text-lb-700">18.4 km/L</div>
                <div className="text-[11px] uppercase tracking-widest mt-0.5 text-lb-500">Avg Efficiency</div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 right-10 flex gap-3.5 z-10">
            <div className="veh-card-float rounded-[18px] px-4 py-4 text-center"
              style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(18px)', border: '1px solid rgba(61,122,138,0.28)', color: '#2a6070', boxShadow: '0 8px 24px rgba(15,60,80,0.1)' }}>
              <i className="fa-solid fa-truck text-3xl block mb-2"></i>
              <span className="text-[11px] text-lb-500">Freight</span>
            </div>
            <div className="veh-card-float rounded-[18px] px-4 py-4 text-center"
              style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(18px)', border: '1px solid rgba(61,122,138,0.28)', color: '#2a6070', boxShadow: '0 8px 24px rgba(15,60,80,0.1)' }}>
              <i className="fa-solid fa-van-shuttle text-3xl block mb-2"></i>
              <span className="text-[11px] text-lb-500">Delivery</span>
            </div>
            <div className="veh-card-float rounded-[18px] px-4 py-4 text-center"
              style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(18px)', border: '1px solid rgba(61,122,138,0.28)', color: '#2a6070', boxShadow: '0 8px 24px rgba(15,60,80,0.1)' }}>
              <i className="fa-solid fa-car text-3xl block mb-2"></i>
              <span className="text-[11px] text-lb-500">Fleet</span>
            </div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div
          className="flex-1 lg:flex-none lg:w-[480px] lg:min-w-[400px] flex items-center justify-center p-10 relative"
          style={{
            background: 'rgba(240,248,255,0.9)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(61,122,138,0.18)'
          }}
        >
          <div className="login-form-card w-full max-w-[380px] rounded-[28px] px-10 py-11 relative overflow-hidden"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.97), rgba(234,246,255,0.95))', backdropFilter: 'blur(24px)', border: '1px solid rgba(61,122,138,0.22)', boxShadow: '0 32px 100px rgba(15,60,80,0.1), inset 0 1px 0 rgba(61,122,138,0.12)' }}>

            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[18px]"
                style={{ background: 'linear-gradient(135deg,rgba(61,122,138,0.2),rgba(15,60,80,0.12))', border: '1px solid rgba(61,122,138,0.35)', boxShadow: '0 4px 14px rgba(15,60,80,0.12)', color: '#2a6070' }}>
                <i className="fa-solid fa-gas-pump"></i>
              </div>
              <div className="font-display font-bold text-[18px] text-lb-800">FuelTracks</div>
            </div>

            <h2 className="font-display text-[26px] font-bold mb-1.5 text-lb-900">Welcome Back</h2>
            <p className="text-[13px] mb-8 text-lb-600">Sign in to your fleet command center</p>

            <form onSubmit={handleSubmit} className="space-y-[18px]">
              {error && (
                <div className="bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.25)] rounded-xl p-3 flex items-center gap-2.5" style={{ animation: 'shake 0.5s ease-in-out' }}>
                  <i className="fa-solid fa-triangle-exclamation text-[#f87171] text-sm"></i>
                  <p className="text-xs text-[#f87171] font-medium">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-[12px] font-medium uppercase tracking-[0.06em] mb-1.5 text-lb-700">Email Address</label>
                <div className="relative">
                  <i className="fa-solid fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-lb-400"></i>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="ft-input"
                    placeholder="admin@fueltracks.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium uppercase tracking-[0.06em] mb-1.5 text-lb-700">Password</label>
                <div className="relative">
                  <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-lb-400"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="ft-input pr-10"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-lb-400 hover:text-lb-600 transition-colors" tabIndex={-1}>
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[13px] cursor-pointer text-lb-600">
                  <input type="checkbox" defaultChecked className="accent-sky-500" /> Remember me
                </label>
                <a href="#" className="text-[13px] text-lb-500 hover:text-lb-700 hover:underline transition-colors">Forgot password?</a>
              </div>

              <button type="submit" disabled={loading} className="btn-signin">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-circle-notch animate-spin"></i> Signing in...
                  </span>
                ) : (
                  <span>
                    <i className="fa-solid fa-arrow-right-to-bracket mr-2"></i>Sign In to Dashboard
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
