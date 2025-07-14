import { toast, ToastOptions } from 'react-toastify';
import type { Theme } from '@/theme/useTheme';

// Estilos para tema claro
const lightThemeOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'dark',
  style: {
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    color: '#ffffff',
  },
};

// Estilos para tema escuro
const darkThemeOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'light',
  style: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    color: '#1f2937',
  },
};

// Função para obter as opções baseadas no tema
const getThemeOptions = (theme: Theme): ToastOptions => {
  return theme === 'dark' ? darkThemeOptions : lightThemeOptions;
};

// Função para detectar o tema atual
const getCurrentTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark'; // SSR fallback
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    const themeOptions = getThemeOptions(getCurrentTheme());
    toast.success(message, { 
      ...themeOptions, 
      style: {
        ...themeOptions.style,
        borderLeft: '4px solid #10b981',
      },
      ...options 
    });
  },

  error: (message: string, options?: ToastOptions) => {
    const themeOptions = getThemeOptions(getCurrentTheme());
    toast.error(message, { 
      ...themeOptions, 
      style: {
        ...themeOptions.style,
        borderLeft: '4px solid #ef4444',
      },
      ...options 
    });
  },

  info: (message: string, options?: ToastOptions) => {
    const themeOptions = getThemeOptions(getCurrentTheme());
    toast.info(message, { 
      ...themeOptions, 
      style: {
        ...themeOptions.style,
        borderLeft: '4px solid #3b82f6',
      },
      ...options 
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    const themeOptions = getThemeOptions(getCurrentTheme());
    toast.warning(message, { 
      ...themeOptions, 
      style: {
        ...themeOptions.style,
        borderLeft: '4px solid #f59e0b',
      },
      ...options 
    });
  },

  loading: (message: string, options?: ToastOptions) => {
    const themeOptions = getThemeOptions(getCurrentTheme());
    return toast.loading(message, { 
      ...themeOptions, 
      autoClose: false,
      ...options 
    });
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      pending: string;
      success: string;
      error: string;
    },
    options?: ToastOptions
  ) => {
    const themeOptions = getThemeOptions(getCurrentTheme());
    return toast.promise(promise, messages, { 
      ...themeOptions, 
      ...options 
    });
  },

  update: (toastId: string | number, options: ToastOptions) => {
    const themeOptions = getThemeOptions(getCurrentTheme());
    toast.update(toastId, {
      ...themeOptions,
      ...options,
    });
  },

  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },
};
