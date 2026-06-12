import { forwardRef } from 'react';
const Card = forwardRef(({ children, className = '', hover = false, padding = true, ...props }, ref) => (
  <div ref={ref} className={`glass-card relative overflow-hidden ${padding ? 'p-5' : ''} ${hover ? 'hover:-translate-y-1 transition-transform duration-300' : ''} ${className}`} {...props}>
    <div className="card-shine" />
    {children}
  </div>
));
Card.displayName = 'Card';
export default Card;
