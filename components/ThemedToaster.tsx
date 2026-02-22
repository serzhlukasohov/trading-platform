'use client';

import { Toaster } from 'sonner';
import { useTheme } from './ThemeProvider';

const ThemedToaster = () => {
  const { theme } = useTheme();
  return <Toaster position="top-right" theme={theme} />;
};

export default ThemedToaster;
