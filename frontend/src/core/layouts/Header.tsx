import { AppBar, Toolbar, IconButton, Box, Menu, MenuItem, Avatar, Badge, Tooltip, Typography, Divider } from '@mui/material';
import {
  Menu as MenuIcon,
  DarkMode,
  LightMode,
  Logout,
  Person,
  Translate,
  Search,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../auth/AuthContext';
import { ROLE_LABELS } from '../auth/roles';
import { NotificationBell } from './NotificationsMenu';
import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '../services/platform';

export function Header() {
  const { t, mode, toggleMode, lang, setLang, toggleSidebar, setCommandOpen } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenu, setUserMenu] = useState<null | HTMLElement>(null);

  const { data: notifData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationApi.list({ page_size: 1 }),
    enabled: Boolean(user),
    refetchInterval: 30_000,
  });
  const unread = notifData?.count ?? 0;

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 1, minHeight: 56 }}>
        <IconButton onClick={toggleSidebar} edge="start">
          <MenuIcon />
        </IconButton>
        <Tooltip title={t('commandPalette')}>
          <IconButton onClick={() => setCommandOpen(true)}>
            <Search />
          </IconButton>
        </Tooltip>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title={t('auth.login')}>
          <IconButton onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}>
            <Translate />
          </IconButton>
        </Tooltip>
        <Tooltip title={mode === 'dark' ? 'روشن' : 'تیره'}>
          <IconButton onClick={toggleMode}>
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Tooltip>
        <NotificationBell unread={unread} />
        <Box>
          <Tooltip title="حساب کاربری">
            <IconButton onClick={(e) => setUserMenu(e.currentTarget)}>
              <Badge color="primary" variant="dot">
                <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main' }}>
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={userMenu} open={Boolean(userMenu)} onClose={() => setUserMenu(null)}>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2">{user?.username}</Typography>
              <Typography variant="caption" color="text.secondary">
                {user ? ROLE_LABELS[user.role] ?? user.role : ''}
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                navigate('/profile');
                setUserMenu(null);
              }}
            >
              <Person fontSize="small" sx={{ mr: 1 }} /> {t('nav.profile')}
            </MenuItem>
            <MenuItem
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              <Logout fontSize="small" sx={{ mr: 1 }} /> {t('auth.logout')}
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}