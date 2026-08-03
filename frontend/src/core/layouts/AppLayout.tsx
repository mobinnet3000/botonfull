import { Box, Stack } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';

export function AppLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 1.5, md: 3 }, width: '100%', maxWidth: '100%' }}>
          <Outlet />
        </Box>
      </Box>
      <CommandPalette />
    </Box>
  );
}