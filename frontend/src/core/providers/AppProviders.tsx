import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SnackbarProvider } from 'notistack';
import { useMemo, type ReactNode } from 'react';
import { buildTheme } from '../theme/theme';
import { GlobalStyles } from '../theme/GlobalStyles';
import { AppProvider, useApp } from '../contexts/AppContext';
import { AuthProvider } from '../auth/AuthContext';
import 'dayjs/locale/fa';
import dayjs from 'dayjs';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 15_000,
    },
  },
});

function EmotionCache({ children }: { children: ReactNode }) {
  const { direction } = useApp();
  const cache = useMemo(
    () =>
      createCache({
        key: direction === 'rtl' ? 'muirtl' : 'mui',
        stylisPlugins: direction === 'rtl' ? [prefixer, rtlPlugin] : [prefixer],
      }),
    [direction],
  );
  return <CacheProvider value={cache}>{children}</CacheProvider>;
}

function Themed({ children }: { children: ReactNode }) {
  const { mode, direction, lang } = useApp();
  const theme = useMemo(() => buildTheme(mode, direction, lang), [mode, direction, lang]);
  dayjs.locale(lang === 'fa' ? 'fa' : 'en');
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles mode={mode} />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={lang === 'fa' ? 'fa' : 'en'}>
        <SnackbarProvider
          maxSnack={4}
          autoHideDuration={3500}
          anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'rtl' ? 'left' : 'right' }}
        >
          {children}
        </SnackbarProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <EmotionCache>
          <Themed>
            <AuthProvider>{children}</AuthProvider>
          </Themed>
        </EmotionCache>
      </AppProvider>
    </QueryClientProvider>
  );
}