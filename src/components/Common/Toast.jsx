import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ message, type = 'success', onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: 'bg-green-50 border-green-500 text-green-700',
    error: 'bg-red-50 border-red-500 text-red-700',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-700',
    info: 'bg-blue-50 border-blue-500 text-blue-700',
  };

  const icons = {
    success: FaCheckCircle,
    error: FaExclamationCircle,
    warning: FaExclamationCircle,
    info: FaCheckCircle,
  };

  const Icon = icons[type] || FaCheckCircle;

  return (
    <div className={`fixed top-20 right-6 z-50 max-w-md p-4 rounded-lg border-l-4 shadow-lg ${styles[type]}`}>
      <div className="flex items-start space-x-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <p className="text-sm flex-1">{message}</p>
        <button onClick={onClose} className="flex-shrink-0">
          <FaTimes className="w-4 h-4 opacity-50 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
};

export default Toast;