const Stepper = ({ steps, currentStep }) => (
  <div className="flex items-center justify-between w-full">
    {steps.map((step, index) => {
      const isCompleted = index < currentStep;
      const isCurrent = index === currentStep;
      return (
        <div key={index} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isCompleted ? 'bg-mint text-white' : isCurrent ? 'bg-accent text-white' : 'bg-lb-50 text-muted border-2 border-[rgba(56,175,249,0.18)]'}`}>
              {isCompleted ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : index + 1}
            </div>
            <span className={`mt-2 text-[10px] font-medium uppercase tracking-wider ${isCurrent ? 'text-accent' : 'text-muted'}`}>{step}</span>
          </div>
          {index < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${isCompleted ? 'bg-mint' : 'bg-[rgba(56,175,249,0.18)]'}`} />}
        </div>
      );
    })}
  </div>
);
export default Stepper;
