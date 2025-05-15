import { useState, useCallback } from 'react';
import { create } from 'zustand';

// 전역 상태로 토스트 메시지 관리
const useToastStore = create((set) => ({
  toasts: [],
  addToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));
    
    // 지정된 시간 후 자동으로 토스트 제거
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }));
    }, duration);
    
    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));

// 토스트 컴포넌트
export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();
  
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-md p-3 shadow-md transition-all duration-300 ${
            toast.type === 'success' ? 'bg-green-500 text-white' :
            toast.type === 'error' ? 'bg-red-500 text-white' :
            toast.type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{toast.message}</span>
            <button
              className="ml-2 text-white hover:text-gray-200"
              onClick={() => removeToast(toast.id)}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// 훅
export const useToast = () => {
  const { addToast, removeToast } = useToastStore();
  
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    return addToast(message, type, duration);
  }, [addToast]);
  
  return { showToast, removeToast };
}; 