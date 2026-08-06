import { useState } from 'react';
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Apartment as ProjectIcon,
  Group as ClientsIcon,
  Factory as FactoryIcon,
  Science as SampleIcon,
  Category as SampleTypeIcon,
  Assignment as RequestIcon,
  FactCheck as TestIcon,
  CheckCircle as QcIcon,
  Description as ReportIcon,
  PrecisionManufacturing as EquipmentIcon,
  Build as MaintenanceIcon,
  WaterDrop as CuringIcon,
  Notifications as NotifIcon,
  Folder as FileIcon,
  People as UsersIcon,
  Settings as SettingsIcon,
  History as ActivityIcon,
  Insights as AnalyticsIcon,
  CalendarMonth as CalendarIcon,
  GridOn as MoldIcon,
  ExpandLess,
  ExpandMore,
  Search,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../auth/AuthContext';

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
  children?: NavItem[];
}

const NAV: NavItem[] = [
  { key: 'dashboard', label: 'nav.dashboard', icon: <DashboardIcon />, path: '/' },
  { key: 'projects', label: 'nav.projects', icon: <ProjectIcon />, path: '/projects' },
  { key: 'calendar', label: 'nav.calendar', icon: <CalendarIcon />, path: '/calendar' },
  { key: 'samples', label: 'nav.samples', icon: <SampleIcon />, path: '/samples' },
  { key: 'molds', label: 'قالب‌ها', icon: <MoldIcon />, path: '/molds' },
  { key: 'requests', label: 'nav.requests', icon: <RequestIcon />, path: '/requests' },
  { key: 'tests', label: 'nav.tests', icon: <TestIcon />, path: '/tests' },
  {
    key: 'catalog',
    label: 'Catalog',
    icon: <SampleTypeIcon />,
    path: '/sample-types',
    children: [
      { key: 'sample-types', label: 'nav.sample.types', icon: <SampleTypeIcon />, path: '/sample-types' },
      { key: 'test-types', label: 'nav.test.types', icon: <TestIcon />, path: '/test-types' },
      { key: 'clients', label: 'nav.clients', icon: <ClientsIcon />, path: '/clients' },
      { key: 'factories', label: 'nav.factories', icon: <FactoryIcon />, path: '/factories' },
    ],
  },
  { key: 'quality', label: 'nav.quality', icon: <QcIcon />, path: '/quality' },
  { key: 'reports', label: 'nav.reports', icon: <ReportIcon />, path: '/reports' },
  {
    key: 'laboratory',
    label: 'Laboratory',
    icon: <EquipmentIcon />,
    path: '/equipment',
    children: [
      { key: 'equipment', label: 'nav.equipment', icon: <EquipmentIcon />, path: '/equipment' },
      { key: 'maintenance', label: 'nav.maintenance', icon: <MaintenanceIcon />, path: '/maintenance' },
      { key: 'curing', label: 'nav.curing', icon: <CuringIcon />, path: '/curing' },
    ],
  },
  { key: 'calendar', label: 'nav.calendar', icon: <CalendarIcon />, path: '/calendar' },
  { key: 'analytics', label: 'nav.analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  { key: 'notifications', label: 'nav.notifications', icon: <NotifIcon />, path: '/notifications' },
  { key: 'files', label: 'nav.files', icon: <FileIcon />, path: '/files' },
  { key: 'activity', label: 'nav.activity', icon: <ActivityIcon />, path: '/activity', roles: ['admin'] },
  { key: 'users', label: 'nav.users', icon: <UsersIcon />, path: '/users', roles: ['admin'] },
  { key: 'settings', label: 'nav.settings', icon: <SettingsIcon />, path: '/settings' },
];

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { t, setCommandOpen } = useApp();
  const { role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState<string[]>(['catalog', 'laboratory']);

  const toggleGroup = (key: string) =>
    setOpenGroups((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const renderItem = (item: NavItem): React.ReactNode => {
    if (item.roles && !item.roles.includes(role ?? '')) return null;
    const active = location.pathname === item.path;
    const hasChildren = Boolean(item.children?.length);
    const open = openGroups.includes(item.key);
    return (
      <Box key={item.key}>
        <ListItemButton
          selected={active}
          onClick={() => {
            if (hasChildren) toggleGroup(item.key);
            else {
              navigate(item.path);
              onNavigate?.();
            }
          }}
          sx={{ borderRadius: 1, mb: 0.25, minHeight: 44 }}
        >
          <ListItemIcon sx={{ minWidth: 38, color: active ? 'primary.main' : 'inherit' }}>{item.icon}</ListItemIcon>
          {!collapsed && (
            <>
              <ListItemText
                primary={t(item.label)}
                primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: active ? 700 : 500 }}
              />
              {hasChildren && (open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />)}
            </>
          )}
        </ListItemButton>
        {hasChildren && (
          <Collapse in={open && !collapsed} timeout="auto">
            <List disablePadding sx={{ pl: 2 }}>
              {item.children!.map((child) => renderItem(child))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ gap: 1, minHeight: 64 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1E40AF, #3B82F6)',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          L
        </Box>
        {!collapsed && (
          <Typography variant="h6" fontWeight={700} noWrap>
            {t('app.short')}
          </Typography>
        )}
      </Toolbar>
      <Divider />
      <Box sx={{ overflowY: 'auto', flexGrow: 1, p: 1 }}>
        <List>{NAV.map(renderItem)}</List>
        <ListItemButton onClick={() => setCommandOpen(true)} sx={{ borderRadius: 1, mt: 1 }}>
          <ListItemIcon sx={{ minWidth: 38 }}>
            <Search />
          </ListItemIcon>
          {!collapsed && <ListItemText primary={t('search.placeholder')} />}
        </ListItemButton>
      </Box>
    </Box>
  );
}

export function Sidebar() {
  const { sidebarCollapsed } = useApp();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isMobile) {
    return (
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ '& .MuiDrawer-paper': { width: 260 } }}>
        <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: sidebarCollapsed ? 64 : 250,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: sidebarCollapsed ? 64 : 250, borderRight: 'none', borderLeft: 'none' },
      }}
    >
      <SidebarContent collapsed={sidebarCollapsed} />
    </Drawer>
  );
}