'use client';

import { ToastContainer } from 'react-toastify';
import { useTheme } from '@/lib/useTheme';
import 'react-toastify/dist/ReactToastify.css';

export default function DynamicToastContainer() {
  const theme = useTheme();

  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme}
    />
  );
}
