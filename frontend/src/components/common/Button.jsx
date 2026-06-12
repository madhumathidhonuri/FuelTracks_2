import { forwardRef } from 'react';
const Button = forwardRef(({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false, icon: Icon,
  iconPosition = 'left', className = '', ...props
}, ref) => {
  const variants = { primary: 'btn-primary', secondary: 'btn-secondary', danger: 'btn-danger', ghost: 'btn-ghost', outline: 'btn-outline' };
  const sizes = { sm: 'btn-sm', md: 'btn-md', lg: 'btn-lg' };
  return (
    <button ref={ref} className={`btn ${variants[variant]} ${sizes[size]} ${loading ? 'btn-loading' : ''} ${className}`} disabled={disabled || loading} {...props}>
      {loading && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
      {Icon && iconPosition === 'left' && !loading && <Icon className="w-4 h-4 mr-2" />}
      {children}
      {Icon && iconPosition === 'right' && !loading && <Icon className="w-4 h-4 ml-2" />}
    </button>
  );
});
Button.displayName = 'Button';
export default Button;
