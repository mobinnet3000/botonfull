import { Global, css } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import type { ColorMode } from './theme';

export function GlobalStyles({ mode }: { mode: ColorMode }) {
  return (
    <>
      <CssBaseline />
      <Global
        styles={css`
          @font-face {
            font-family: 'Vazirmatn';
            src: url('/fonts/Vazirmatn-Regular.ttf') format('truetype');
            font-weight: 400;
            font-display: swap;
          }
          html,
          body,
          #root {
            height: 100%;
          }
          body {
            margin: 0;
            background-color: ${mode === 'dark' ? '#0B1220' : '#F8FAFC'};
            -webkit-font-smoothing: antialiased;
          }
          * {
            box-sizing: border-box;
          }
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-thumb {
            background: ${mode === 'dark' ? '#2E3D5C' : '#CBD5E1'};
            border-radius: 8px;
          }
          .fadeIn {
            animation: fadeIn 0.25s ease-out;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(4px);
            }
            to {
              opacity: 1;
              transform: none;
            }
          }
          @media (prefers-reduced-motion: reduce) {
            * {
              animation: none !important;
              transition: none !important;
            }
          }
        `}
      />
    </>
  );
}