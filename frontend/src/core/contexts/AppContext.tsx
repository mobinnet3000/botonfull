/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ColorMode, Direction } from '../theme/theme';
import type { Lang } from '../i18n';
import { getDict, translate } from '../i18n';

interface AppContextValue {
  mode: ColorMode;
  direction: Direction;
  lang: Lang;
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  toggleMode: () => void;
  setLang: (lang: Lang) => void;
  toggleSidebar: () => void;
  setCommandOpen: (open: boolean) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE = {
  mode: 'nboton_mode',
  lang: 'nboton_lang',
  sidebar: 'nboton_sidebar',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ColorMode>(() =>
    (localStorage.getItem(STORAGE.mode) as ColorMode) || 'light',
  );
  const [lang, setLangState] = useState<Lang>(() =>
    (localStorage.getItem(STORAGE.lang) as Lang) || 'fa',
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem(STORAGE.sidebar) === '1',
  );
  const [commandOpen, setCommandOpen] = useState(false);

  const direction: Direction = lang === 'fa' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem(STORAGE.mode, mode);
    document.documentElement.setAttribute('data-mode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(STORAGE.lang, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = direction;
  }, [lang, direction]);

  useEffect(() => {
    localStorage.setItem(STORAGE.sidebar, sidebarCollapsed ? '1' : '0');
  }, [sidebarCollapsed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
      if (e.key === 'Escape') setCommandOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const dict = useMemo(() => getDict(lang), [lang]);
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(dict, key, params),
    [dict],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      mode,
      direction,
      lang,
      sidebarCollapsed,
      commandOpen,
      toggleMode: () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
      setLang: setLangState,
      toggleSidebar: () => setSidebarCollapsed((s) => !s),
      setCommandOpen,
      t,
    }),
    [mode, direction, lang, sidebarCollapsed, commandOpen, t],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}