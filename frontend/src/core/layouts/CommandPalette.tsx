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
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '../services/projects';
import { sampleApi } from '../services/samples';

const COMMANDS = [
  { label: 'داشبورد', path: '/', icon: '🏠' },
  { label: 'پروژه‌ها', path: '/projects', icon: '📁' },
  { label: 'نمونه‌ها', path: '/samples', icon: '🧪' },
  { label: 'آزمون‌ها', path: '/tests', icon: '🔬' },
  { label: 'گزارش‌ها', path: '/reports', icon: '📄' },
  { label: 'تقویم', path: '/calendar', icon: '📅' },
  { label: 'دستگاه‌ها', path: '/equipment', icon: '⚙️' },
];

export function CommandPalette() {
  const { commandOpen, setCommandOpen } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!commandOpen) setQuery('');
  }, [commandOpen]);

  const { data: projects } = useQuery({
    queryKey: ['cmd', 'projects'],
    queryFn: () => projectApi.list({ page_size: 5, search: query || undefined }),
    enabled: commandOpen && query.length > 0,
  });

  const { data: samples } = useQuery({
    queryKey: ['cmd', 'samples'],
    queryFn: () => sampleApi.list({ page_size: 5, search: query || undefined }),
    enabled: commandOpen && query.length > 0,
  });

  const go = (path: string) => {
    setCommandOpen(false);
    navigate(path);
  };

  const filteredCommands = COMMANDS.filter((c) => c.label.includes(query));

  return (
    <Dialog open={commandOpen} onClose={() => setCommandOpen(false)} fullWidth maxWidth="sm">
      <DialogContent sx={{ p: 0 }}>
        <TextField
          autoFocus
          fullWidth
          placeholder="جستجو یا فرمان..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          variant="standard"
          sx={{ px: 2, py: 1 }}
          InputProps={{ disableUnderline: true }}
        />
        <Divider />
        <Box sx={{ maxHeight: 420, overflowY: 'auto' }}>
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
          {projects && projects.results.length > 0 && (
            <>
              <Typography variant="caption" px={2} color="text.secondary">
                پروژه‌ها
              </Typography>
              <List dense>
                {projects.results.map((p) => (
                  <ListItemButton key={p.id} onClick={() => go(`/projects/${p.id}`)}>
                    <ListItemText primary={p.project_name} secondary={p.code} />
                  </ListItemButton>
                ))}
              </List>
            </>
          )}
          {samples && samples.results.length > 0 && (
            <>
              <Typography variant="caption" px={2} color="text.secondary">
                نمونه‌ها
              </Typography>
              <List dense>
                {samples.results.map((s) => (
                  <ListItemButton key={s.id} onClick={() => go(`/samples/${s.id}`)}>
                    <ListItemText primary={s.code} secondary={s.category} />
                  </ListItemButton>
                ))}
              </List>
            </>
          )}
          {query.length > 0 && (!projects?.results.length || !samples?.results.length) && (
            <Typography variant="body2" px={2} py={2} color="text.secondary" textAlign="center">
              نتیجه‌ای یافت نشد
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}