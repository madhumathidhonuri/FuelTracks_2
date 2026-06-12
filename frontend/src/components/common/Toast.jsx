import { useEffect, useState } from 'react';
const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const timer = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, duration); return () => clearTimeout(timer); }, [duration, onClose]);
  const types = { success: { bg: 'bg-[#0a8f78]', icon: '✓' }, error: { bg: 'bg-coral', icon: '✕' }, warning: { bg: 'bg-[#92650a]', icon: '!' }, info: { bg: 'bg-accent', icon: 'i' } };
  const { bg, icon } = types[type] || types.info;
  return (
    <div className={`fixed bottom-6 right-6 z-[200] transform transition-all duration-300 ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className={`${bg} text-white px-5 py-3 rounded-xl shadow-[0_10px_32px_rgba(2,120,201,0.2)] flex items-center gap-3 min-w-[280px]`}>
        <span className="w-5 h-5 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-xs font-bold">{icon}</span>
        <span className="text-sm font-medium flex-1">{message}</span>
        <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} className="text-white text-opacity-70 hover:text-opacity-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
      </div>
    </div>
  );
};
export default Toast;
