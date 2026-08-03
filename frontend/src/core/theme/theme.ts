import { createTheme, type Theme } from '@mui/material/styles';
import { palette, radius, typography } from './designTokens';

export type ColorMode = 'light' | 'dark';
export type Direction = 'rtl' | 'ltr';

export function buildTheme(mode: ColorMode, direction: Direction, lang: string): Theme {
  const tokens = palette[mode];
  const fontFamily = lang === 'fa' ? typography.fontFa : typography.fontEn;

  return createTheme({
    direction,
    palette: {
      mode,
      primary: { main: tokens.primary, contrastText: tokens.onPrimary },
      secondary: { main: tokens.secondary },
      background: { default: tokens.background, paper: tokens.surface },
      text: { primary: tokens.foreground, secondary: tokens.muted },
      divider: tokens.border,
      success: { main: tokens.success },
      warning: { main: tokens.warning },
      error: { main: tokens.error },
      info: { main: tokens.info },
    },
    shape: { borderRadius: radius.md },
    typography: {
      fontFamily,
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      body1: { fontSize: '0.875rem' },
      body2: { fontSize: '0.8125rem' },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        defaultProps: { size: 'medium' },
        styleOverrides: {
          root: { borderRadius: radius.sm },
          containedPrimary: { boxShadow: 'none' },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${tokens.border}`,
            borderRadius: radius.lg,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: { root: { color: tokens.foreground, backgroundColor: tokens.surface } },
      },
      MuiAutocomplete: {
        styleOverrides: { root: { fontSize: '0.875rem' } },
      },
      MuiTextField: {
        styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: radius.sm } } },
      },
      MuiDrawer: {
        styleOverrides: { paper: { backgroundImage: 'none' } },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 600 } },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: { border: 'none', '--DataGrid-rowBorderColor': tokens.border },
          columnHeaders: { backgroundColor: tokens.surfaceAlt },
          cell: { borderBottom: `1px solid ${tokens.border}` },
        },
      },
    },
  });
}