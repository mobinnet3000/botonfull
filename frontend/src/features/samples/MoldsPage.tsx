import { useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  Select,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { moldApi, structuralMemberApi, pourSeriesApi } from '../../core/services/domain';
import { projectApi } from '../../core/services/projects';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import { MoldDetailDrawer } from '../molds/MoldDetailDrawer';
import { formatJalali } from '../../core/utils/jalali';
import { StatusChip } from '../../shared/components/StatusChip';
import type { Mold } from '../../core/types';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'در انتظار' },
  { value: 'in_progress', label: 'در حال آزمون' },
  { value: 'completed', label: 'انجام شده' },
  { value: 'rejected', label: 'رد شده' },
];
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'کم' },
  { value: 'medium', label: 'متوسط' },
  { value: 'high', label: 'زیاد' },
  { value: 'urgent', label: 'فوری' },
];

interface Filters {
  status: string;
  priority: string;
  project: string;
  member: string;
  pour: string;
  is_overdue: string;
  is_done: string;
  search: string;
  due_from: string;
  due_to: string;
}

const EMPTY_FILTERS: Filters = {
  status: '', priority: '', project: '', member: '', pour: '',
  is_overdue: '', is_done: '', search: '', due_from: '', due_to: '',
};

export default function MoldsPage() {
  usePageTitle('صف کار قالب‌ها');
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [groupBy, setGroupBy] = useState<'none' | 'project' | 'member' | 'status'>('none');
  const [sortBy, setSortBy] = useState<'deadline' | 'age' | 'priority'>('deadline');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [moldId, setMoldId] = useState<number | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const applied = useMemo(() => {
    const p: Record<string, string> = {
      page_size: '500',
      ordering: sortBy === 'deadline' ? 'deadline' : sortBy === 'age' ? 'age_in_days' : '-priority',
    };
    if (filters.status) p.status = filters.status;
    if (filters.priority) p.priority = filters.priority;
    if (filters.project) p.project = filters.project;
    if (filters.member) p.member = filters.member;
    if (filters.pour) p.pour = filters.pour;
    if (filters.is_overdue) p.is_overdue = filters.is_overdue;
    if (filters.is_done) p.is_done = filters.is_done;
    if (filters.search) p.search = filters.search;
    if (filters.due_from) p.deadline_gte = filters.due_from;
    if (filters.due_to) p.deadline_lte = filters.due_to;
    return p;
  }, [filters, sortBy]);

  const { data: moldsData } = useQuery({
    queryKey: ['molds', 'queue', applied],
    queryFn: () => moldApi.list(applied),
    staleTime: 15_000,
  });
  const molds = useMemo(() => moldsData?.results ?? [], [moldsData]);

  const { data: projectsData } = useQuery({ queryKey: ['projects-for-filter'], queryFn: () => projectApi.list({ page_size: 200 }), staleTime: 60_000 });
  const projects = projectsData?.results ?? [];

  const { data: membersData } = useQuery({
    queryKey: ['members-for-filter', filters.project],
    queryFn: () => structuralMemberApi.list({ page_size: 300, ...(filters.project ? { project: filters.project } : {}) }),
    enabled: Boolean(filters.project),
    staleTime: 30_000,
  });
  const members = membersData?.results ?? [];

  const { data: poursData } = useQuery({
    queryKey: ['pours-for-filter', filters.member],
    queryFn: () => pourSeriesApi.list({ page_size: 300, ...(filters.member ? { structural_member: filters.member } : {}) }),
    enabled: Boolean(filters.member),
    staleTime: 30_000,
  });
  const pours = poursData?.results ?? [];

  const technicians = useMemo(() => {
    const m = new Map<string, number>();
    for (const x of molds) {
      if (x.technician && x.technician_username) m.set(x.technician_username, x.technician);
    }
    return [...m.entries()].map(([label, value]) => ({ value: String(value), label }));
  }, [molds]);

  const rowVirtualizer = useVirtualizer({
    count: molds.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 66,
    overscan: 10,
  });

  const set = (k: keyof Filters, v: string) => setFilters((f) => ({ ...f, [k]: v }));

  const groups = useMemo(() => {
    if (groupBy === 'none') return [{ key: 'همه قالب‌ها', items: molds }];
    const g = new Map<string, Mold[]>();
    for (const m of molds) {
      const key = groupBy === 'project' ? m.project_name ?? 'بدون پروژه' : groupBy === 'member' ? m.member_name ?? 'بدون عضو' : m.status_display ?? m.status;
      g.set(key, [...(g.get(key) ?? []), m]);
    }
    return [...g.entries()].map(([key, items]) => ({ key, items }));
  }, [molds, groupBy]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['molds'] });
    qc.invalidateQueries({ queryKey: ['calendar'] });
    qc.invalidateQueries({ queryKey: ['projects'] });
  };

  const bulkMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: number[]; status?: string }) => moldApi.bulkUpdate({ ids, ...(status ? { status } : {}) }),
    onSuccess: () => {
      enqueueSnackbar('قالب‌ها به‌روزرسانی شدند', { variant: 'success' });
      setSelected(new Set());
      invalidate();
    },
    onError: (e) => enqueueSnackbar(getErrorMessage(e), { variant: 'error' }),
  });

  const assignMutation = useMutation({
    mutationFn: ({ ids, technician }: { ids: number[]; technician: number }) => moldApi.assign({ ids, technician }),
    onSuccess: () => {
      enqueueSnackbar('تکنسین تعیین شد', { variant: 'success' });
      setSelected(new Set());
      invalidate();
    },
    onError: (e) => enqueueSnackbar(getErrorMessage(e), { variant: 'error' }),
  });

  const toggle = (id: number) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const toggleAll = () => {
    if (selected.size === molds.length) setSelected(new Set());
    else setSelected(new Set(molds.map((m) => m.id)));
  };

  return (
    <Box className="fadeIn">
      <Stack direction="row" alignItems="center" gap={1} mb={2} flexWrap="wrap">
        <Typography variant="h5" fontWeight={700} sx={{ flexGrow: 1 }}>
          صف کار قالب‌ها
        </Typography>
        <Chip label={`${moldsData?.count ?? molds.length} قالب`} color="primary" />
        {selected.size > 0 && <Chip label={`${selected.size} انتخاب`} color="secondary" onDelete={() => setSelected(new Set())} />}
      </Stack>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField size="small" fullWidth placeholder="جستجو: مشخصه، پروژه، عضو، ریز..."
                value={filters.search}
                onChange={(e) => set('search', e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }} />
            </Grid>
            <Grid size={{ xs: 6, md: 1.5 }}>
              <TextField select size="small" fullWidth label="وضعیت" value={filters.status} onChange={(e) => set('status', e.target.value)}>
                <MenuItem value="">همه</MenuItem>
                {STATUS_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, md: 1.5 }}>
              <TextField select size="small" fullWidth label="اولویت" value={filters.priority} onChange={(e) => set('priority', e.target.value)}>
                <MenuItem value="">همه</MenuItem>
                {PRIORITY_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField select size="small" fullWidth label="پروژه" value={filters.project} onChange={(e) => { set('project', e.target.value); set('member', ''); set('pour', ''); }}>
                <MenuItem value="">همه</MenuItem>
                {projects.map((p) => <MenuItem key={p.id} value={String(p.id)}>{p.project_name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField select size="small" fullWidth label="عضو سازه‌ای" value={filters.member} onChange={(e) => { set('member', e.target.value); set('pour', ''); }}>
                <MenuItem value="">همه</MenuItem>
                {members.map((m) => <MenuItem key={m.id} value={String(m.id)}>{m.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField select size="small" fullWidth label="ریز" value={filters.pour} onChange={(e) => set('pour', e.target.value)}>
                <MenuItem value="">همه</MenuItem>
                {pours.map((p) => <MenuItem key={p.id} value={String(p.id)}>{p.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, md: 1.5 }}>
              <TextField select size="small" fullWidth label="دیرکرد" value={filters.is_overdue} onChange={(e) => set('is_overdue', e.target.value)}>
                <MenuItem value="">همه</MenuItem>
                <MenuItem value="true">دیرکرد دارد</MenuItem>
                <MenuItem value="false">بدون دیرکرد</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, md: 1.5 }}>
              <TextField select size="small" fullWidth label="آزمایش" value={filters.is_done} onChange={(e) => set('is_done', e.target.value)}>
                <MenuItem value="">همه</MenuItem>
                <MenuItem value="true">انجام شده</MenuItem>
                <MenuItem value="false">انجام نشده</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField size="small" fullWidth type="date" label="موعد از" value={filters.due_from} onChange={(e) => set('due_from', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField size="small" fullWidth type="date" label="موعد تا" value={filters.due_to} onChange={(e) => set('due_to', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction="row" gap={1} alignItems="center">
                <Button size="small" color="inherit" onClick={() => setFilters(EMPTY_FILTERS)}>پاک‌کردن</Button>
                <TextField select size="small" label="گروه‌بندی" value={groupBy} onChange={(e) => setGroupBy(e.target.value as typeof groupBy)} sx={{ minWidth: 120 }}>
                  <MenuItem value="none">بدون گروه</MenuItem>
                  <MenuItem value="project">پروژه</MenuItem>
                  <MenuItem value="member">عضو</MenuItem>
                  <MenuItem value="status">وضعیت</MenuItem>
                </TextField>
                <TextField select size="small" label="مرتب‌سازی" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} sx={{ minWidth: 110 }}>
                  <MenuItem value="deadline">موعد</MenuItem>
                  <MenuItem value="age">سن</MenuItem>
                  <MenuItem value="priority">اولویت</MenuItem>
                </TextField>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                <Checkbox size="small" checked={selected.size > 0 && selected.size === molds.length} indeterminate={selected.size > 0 && selected.size < molds.length} onChange={toggleAll} />
                <Typography variant="caption">انتخاب همه</Typography>
                <Select size="small" value="" displayEmpty disabled={selected.size === 0} onChange={(e) => e.target.value && bulkMutation.mutate({ ids: [...selected], status: e.target.value })} sx={{ minWidth: 150 }}>
                  <MenuItem disabled value=""><em>وضعیت گروهی...</em></MenuItem>
                  {STATUS_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
                <Select size="small" value="" displayEmpty disabled={selected.size === 0} onChange={(e) => { const v = e.target.value; if (v) assignMutation.mutate({ ids: [...selected], technician: Number(v) }); }} sx={{ minWidth: 160 }}>
                  <MenuItem disabled value=""><em>تعیین تکنسین...</em></MenuItem>
                  {technicians.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {molds.length === 0 && (
        <Card variant="outlined"><CardContent><Typography color="text.secondary" textAlign="center" py={4}>قالبی یافت نشد</Typography></CardContent></Card>
      )}

      {groups.map((group) => (
        <Card key={group.key} variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>
              {group.key} ({group.items.length})
            </Typography>
            {groupBy === 'none' ? (
              <Box ref={parentRef} sx={{ height: Math.min(group.items.length * 66, 520), overflowY: 'auto' }}>
                <Box sx={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
                  {rowVirtualizer.getVirtualItems().map((vi) => {
                    const m = group.items[vi.index];
                    if (!m) return null;
                    return <MoldRow key={m.id} m={m} selected={selected.has(m.id)} onToggle={() => toggle(m.id)} onOpen={() => setMoldId(m.id)} />;
                  })}
                </Box>
              </Box>
            ) : (
              <Stack gap={0.5}>
                {group.items.map((m) => (
                  <MoldRow key={m.id} m={m} selected={selected.has(m.id)} onToggle={() => toggle(m.id)} onOpen={() => setMoldId(m.id)} />
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      ))}

      {moldId !== null && (
        <MoldDetailDrawer moldId={moldId} onClose={() => setMoldId(null)} onSaved={() => invalidate()} />
      )}
    </Box>
  );
}

function MoldRow({ m, selected, onToggle, onOpen }: { m: Mold; selected: boolean; onToggle: () => void; onOpen: () => void }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1,
        py: 0.75,
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        '&:hover': { bgcolor: 'action.hover' },
        flexWrap: 'wrap',
      }}
    >
      <Checkbox size="small" checked={selected} onChange={onToggle} />
      <Chip size="small" label={m.sample_identifier} color="primary" variant="outlined" onClick={onOpen} sx={{ cursor: 'pointer', minWidth: 110 }} />
      <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 160 }}>
        {m.project_name ?? '—'} / {m.member_name ?? '—'} / {m.pour_name ?? '—'}
      </Typography>
      <Chip size="small" label={`${m.age_in_days} روزه`} variant="outlined" />
      <Box sx={{ minWidth: 110 }}><StatusChip value={m.status} label={m.status_display ?? m.status} /></Box>
      <Typography variant="caption" sx={{ minWidth: 85 }}>{m.is_done ? 'انجام شد' : formatJalali(m.deadline)}</Typography>
      <Typography variant="caption" fontWeight={700} sx={{ minWidth: 80 }} color={m.is_overdue ? 'error.main' : 'text.secondary'}>
        {m.is_done ? '—' : m.is_overdue ? `دیر ${Math.abs(m.remaining_days ?? 0)}` : m.remaining_days === 0 ? 'امروز' : `${m.remaining_days} روز`}
      </Typography>
      <Typography variant="caption" sx={{ minWidth: 80 }}>{m.technician_username ?? '—'}</Typography>
      <Typography variant="caption" fontWeight={700} color={m.breaking_load ? 'success.main' : 'text.disabled'} sx={{ minWidth: 60 }}>
        {m.breaking_load ?? '—'}
      </Typography>
      <Button size="small" variant="outlined" onClick={onOpen}>نتیجه</Button>
    </Box>
  );
}