import { useEffect, useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Apartment as ProjectIcon,
  Science as SampleIcon,
  FactCheck as TestIcon,
  Description as ReportIcon,
  CalendarMonth as CalendarIcon,
  PrecisionManufacturing as EquipmentIcon,
  Group as ClientIcon,
  GridOn as MoldIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '../services/projects';
import { sampleApi } from '../services/samples';
import { reportApi } from '../services/reports';
import { clientApi } from '../services/catalog';
import { equipmentApi } from '../services/domain';

const COMMANDS = [
  { label: 'داشبورد', path: '/', icon: <DashboardIcon /> },
  { label: 'پروژه‌ها', path: '/projects', icon: <ProjectIcon /> },
  { label: 'نمونه‌ها', path: '/samples', icon: <SampleIcon /> },
  { label: 'قالب‌ها', path: '/molds', icon: <MoldIcon /> },
  { label: 'آزمون‌ها', path: '/tests', icon: <TestIcon /> },
  { label: 'گزارش‌ها', path: '/reports', icon: <ReportIcon /> },
  { label: 'تقویم', path: '/calendar', icon: <CalendarIcon /> },
  { label: 'دستگاه‌ها', path: '/equipment', icon: <EquipmentIcon /> },
];

export function CommandPalette() {
  const { commandOpen, setCommandOpen } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!commandOpen) setQuery('');
  }, [commandOpen]);

  const search = query.trim();

  const { data: projects } = useQuery({
    queryKey: ['cmd', 'projects', search],
    queryFn: () => projectApi.list({ page_size: 5, search: search || undefined }),
    enabled: commandOpen && search.length > 0,
  });
  const { data: samples } = useQuery({
    queryKey: ['cmd', 'samples', search],
    queryFn: () => sampleApi.list({ page_size: 5, search: search || undefined }),
    enabled: commandOpen && search.length > 0,
  });
  const { data: reports } = useQuery({
    queryKey: ['cmd', 'reports', search],
    queryFn: () => reportApi.list({ page_size: 5, search: search || undefined }),
    enabled: commandOpen && search.length > 0,
  });
  const { data: clients } = useQuery({
    queryKey: ['cmd', 'clients', search],
    queryFn: () => clientApi.list({ page_size: 5, search: search || undefined }),
    enabled: commandOpen && search.length > 0,
  });
  const { data: equipment } = useQuery({
    queryKey: ['cmd', 'equipment', search],
    queryFn: () => equipmentApi.list({ page_size: 5, search: search || undefined }),
    enabled: commandOpen && search.length > 0,
  });

  const go = (path: string) => {
    setCommandOpen(false);
    navigate(path);
  };

  const filteredCommands = COMMANDS.filter((c) => c.label.includes(search));
  const hasResults =
    (projects?.results.length ?? 0) +
      (samples?.results.length ?? 0) +
      (reports?.results.length ?? 0) +
      (clients?.results.length ?? 0) +
      (equipment?.results.length ?? 0) >
    0;

  return (
    <Dialog open={commandOpen} onClose={() => setCommandOpen(false)} fullWidth maxWidth="sm">
      <DialogContent sx={{ p: 0 }}>
        <TextField
          autoFocus
          fullWidth
          placeholder="جستجوی جهانی... (پروژه، نمونه، قالب، گزارش، مشتری)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          variant="standard"
          sx={{ px: 2, py: 1 }}
          InputProps={{ disableUnderline: true }}
        />
        <Divider />
        <Box sx={{ maxHeight: 460, overflowY: 'auto' }}>
          <Typography variant="caption" px={2} pt={1} color="text.secondary">
            صفحات
          </Typography>
          <List dense>
            {filteredCommands.map((c) => (
              <ListItemButton key={c.path} onClick={() => go(c.path)}>
                <ListItemIcon>{c.icon}</ListItemIcon>
                <ListItemText primary={c.label} />
              </ListItemButton>
            ))}
          </List>
          {samples && samples.results.length > 0 && (
            <>
              <Typography variant="caption" px={2} color="text.secondary">
                نمونه‌ها
              </Typography>
              <List dense>
                {samples.results.map((s) => (
                  <ListItemButton key={s.id} onClick={() => go(`/samples/${s.id}`)}>
                    <ListItemIcon>
                      <SampleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={s.code} secondary={`${s.category} • ${s.barcode}`} />
                  </ListItemButton>
                ))}
              </List>
            </>
          )}
          {projects && projects.results.length > 0 && (
            <>
              <Typography variant="caption" px={2} color="text.secondary">
                پروژه‌ها
              </Typography>
              <List dense>
                {projects.results.map((p) => (
                  <ListItemButton key={p.id} onClick={() => go(`/projects/${p.id}`)}>
                    <ListItemIcon>
                      <ProjectIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={p.project_name} secondary={p.code} />
                  </ListItemButton>
                ))}
              </List>
            </>
          )}
          {reports && reports.results.length > 0 && (
            <>
              <Typography variant="caption" px={2} color="text.secondary">
                گزارش‌ها
              </Typography>
              <List dense>
                {reports.results.map((r) => (
                  <ListItemButton key={r.id} onClick={() => go(`/reports/${r.id}`)}>
                    <ListItemIcon>
                      <ReportIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={r.report_number} secondary={r.title} />
                  </ListItemButton>
                ))}
              </List>
            </>
          )}
          {clients && clients.results.length > 0 && (
            <>
              <Typography variant="caption" px={2} color="text.secondary">
                مشتری‌ها
              </Typography>
              <List dense>
                {clients.results.map((c) => (
                  <ListItemButton key={c.id} onClick={() => go('/clients')}>
                    <ListItemIcon>
                      <ClientIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={c.name} secondary={c.phone_number} />
                  </ListItemButton>
                ))}
              </List>
            </>
          )}
          {equipment && equipment.results.length > 0 && (
            <>
              <Typography variant="caption" px={2} color="text.secondary">
                دستگاه‌ها
              </Typography>
              <List dense>
                {equipment.results.map((e) => (
                  <ListItemButton key={e.id} onClick={() => go('/equipment')}>
                    <ListItemIcon>
                      <EquipmentIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={e.name} secondary={e.code} />
                  </ListItemButton>
                ))}
              </List>
            </>
          )}
          {search.length > 0 && !hasResults && (
            <Typography variant="body2" px={2} py={2} color="text.secondary" textAlign="center">
              نتیجه‌ای یافت نشد
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}