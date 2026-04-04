import { useEffect } from 'react';
import { FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const Toast = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div className={`
      fixed top-5 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-5 z-50 flex items-center gap-3 w-[min(90vw,350px)] px-4 py-3.5
      rounded-xl border shadow-xl animate-fadeIn
      ${isSuccess
        ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
        : 'bg-red-950/90 border-red-500/40 text-red-200'}
      backdrop-blur-glass
    `}>
      <div className={`shrink-0 ${isSuccess ? 'text-emerald-400' : 'text-red-400'}`}>
        {isSuccess ? <FiCheckCircle size={18}/> : <FiAlertCircle size={18}/>}
      </div>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={onClose} className="shrink-0 text-current/60 hover:text-current transition-colors">
        <FiX size={15}/>
      </button>
    </div>
  );
};

export default Toast;
