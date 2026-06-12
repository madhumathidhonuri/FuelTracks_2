import { forwardRef } from 'react';
const Input = forwardRef(({ label, error, icon: Icon, className = '', type = 'text', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="input-label">{label}</label>}
    <div className="relative">
      {Icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(7,81,134,0.45)]"><Icon className="w-4 h-4" /></div>}
      <input ref={ref} type={type} className={`input-field ${Icon ? '!pl-10' : ''} ${error ? 'input-error' : ''} ${className}`} {...props} />
    </div>
    {error && <p className="text-xs text-coral mt-1">{error}</p>}
  </div>
));
Input.displayName = 'Input';
export default Input;
