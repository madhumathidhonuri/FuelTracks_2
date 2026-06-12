import { useEffect } from 'react';
import { createPortal } from 'react-dom';
const Modal = ({ isOpen, onClose, title, children, size = 'md', showClose = true }) => {
  useEffect(() => { document.body.style.overflow = isOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [isOpen]);
  useEffect(() => { const handleEsc = (e) => { if (e.key === 'Escape') onClose(); }; if (isOpen) document.addEventListener('keydown', handleEsc); return () => document.removeEventListener('keydown', handleEsc); }, [isOpen, onClose]);
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[rgba(7,81,134,0.3)] dark:bg-[rgba(5,15,20,0.55)] backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className={`relative bg-white dark:bg-[#0d1e26] border border-[rgba(56,175,249,0.12)] dark:border-[rgba(61,122,138,0.35)] rounded-2xl shadow-[0_32px_100px_rgba(15,60,80,0.25)] w-full ${sizes[size]} animate-slideUp`}>
        {(title || showClose) && (
          <div className="flex items-center justify-between p-5 border-b border-[rgba(56,175,249,0.18)] dark:border-[rgba(61,122,138,0.3)]">
            {title && <h3 className="text-lg font-semibold text-text-primary font-display">{title}</h3>}
            {showClose && <button onClick={onClose} className="w-8 h-8 rounded-full bg-lb-50 hover:bg-[rgba(56,175,249,0.1)] flex items-center justify-center transition-colors"><svg className="w-4 h-4 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>, document.body
  );
};
export default Modal;
