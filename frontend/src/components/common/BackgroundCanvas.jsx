import { memo } from 'react';

const BackgroundCanvas = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Orbs */}
      <div className="bg-orb w-[700px] h-[700px] -top-48 right-[3%]" style={{ animationDelay: '0s' }}></div>
      <div className="bg-orb w-[450px] h-[450px] bottom-[8%] -left-24" style={{ animationDelay: '-3s' }}></div>
      <div className="bg-orb w-[320px] h-[320px] top-[38%] right-[18%]" style={{ animationDelay: '-5s' }}></div>
      
      {/* Arcs */}
      <div className="bg-arc w-[760px] h-[760px] -top-48 -right-28" style={{ animationDuration: '32s' }}></div>
      <div className="bg-arc rev w-[450px] h-[450px] -bottom-28 -left-24" style={{ animationDuration: '22s' }}></div>
      <div className="bg-arc w-[230px] h-[230px] top-[52%] right-[12%] opacity-50" style={{ animationDuration: '16s' }}></div>
      
      {/* Streaks */}
      <div className="bg-streak w-[320px] top-[20%] left-[4%]" style={{ animationDelay: '0s' }}></div>
      <div className="bg-streak w-[200px] top-[62%] right-[6%] transform rotate-[15deg]" style={{ animationDelay: '-2s' }}></div>
      <div className="bg-streak w-[260px] top-[40%] left-[28%] transform -rotate-[10deg]" style={{ animationDelay: '-4s' }}></div>
    </div>
  );
};

export default memo(BackgroundCanvas);
