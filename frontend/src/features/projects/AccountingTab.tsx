import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalanceWallet,
  Payment,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { projectApi } from '../../core/services/projects';
import { transactionApi } from '../../core/services/calendar';
import type { Transaction, TransactionType } from '../../core/types';
import { KpiCard } from '../../shared/components/KpiCard';
import { FormDrawer } from '../../shared/components/FormDrawer';
import { TransactionForm } from './TransactionForm';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import { formatJalali } from '../../core/utils/jalali';
import { formatNumber } from '../../core/utils/format';

export function AccountingTab({ projectId }: { projectId: number }) {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [editor, setEditor] = useState<{ open: boolean; record: Transaction | null }>({ open: false, record: null });

  const { data: accounting } = useQuery({
    queryKey: ['projects', projectId, 'accounting'],
    queryFn: () => projectApi.accounting(projectId),
    staleTime: 20_000,
  });
  const { data: txPage } = useQuery({
    queryKey: ['transactions', projectId, typeFilter, catFilter, search],
    queryFn: () =>
      transactionApi.list({
        page_size: 200,
        project: projectId,
        search: search || undefined,
        type: typeFilter || undefined,
        category: catFilter || undefined,
      }),
    staleTime: 15_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => transactionApi.remove(id),
    onSuccess: () => {
      enqueueSnackbar('تراکنش حذف شد', { variant: 'success' });
      invalidate();
    },
    onError: (e) => enqueueSnackbar(getErrorMessage(e), { variant: 'error' }),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['transactions'] });
    qc.invalidateQueries({ queryKey: ['projects', projectId, 'accounting'] });
    qc.invalidateQueries({ queryKey: ['projects', projectId] });
  };

  const summary = accounting?.summary;
  const running = accounting?.running_balance ?? [];
  const categoryChart = useMemo(
    () =>
      Object.entries(accounting?.categories ?? {}).map(([name, v]) => ({
        name: name === 'other' ? 'سایر' : name,
        درآمد: v.income,
        هزینه: v.expense,
      })),
    [accounting],
  );
  const monthlyChart = useMemo(
    () =>
      Object.entries(accounting?.monthly ?? {})
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, v]) => ({ name: month, درآمد: v.income, هزینه: v.expense })),
    [accounting],
  );

  const filtered = (txPage?.results ?? []).filter(
    (t) =>
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      (t.notes ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Stack gap={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard title="درآمد (وصول شده)" value={formatNumber(summary?.total_income)} icon={<TrendingUp />} color="#16A34A" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard title="هزینه‌ها" value={formatNumber(summary?.total_expense)} icon={<TrendingDown />} color="#DC2626" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard title="مطالبات" value={formatNumber(summary?.receivables)} icon={<Payment />} color="#D97706" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <KpiCard
            title="تراز / سود"
            value={formatNumber(summary?.balance)}
            icon={<AccountBalanceWallet />}
            color={(summary?.balance ?? 0) >= 0 ? '#16A34A' : '#DC2626'}
          />
        </Grid>
      </Grid>

      {(categoryChart.length > 0 || monthlyChart.length > 0) && (
        <Grid container spacing={2}>
          {categoryChart.length > 0 && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>درآمد و هزینه بر اساس دسته‌بندی</Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={categoryChart}>
                      <XAxis dataKey="name" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="درآمد" fill="#16A34A" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="هزینه" fill="#DC2626" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
          {monthlyChart.length > 0 && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>روند ماهانه</Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthlyChart}>
                      <XAxis dataKey="name" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="درآمد" fill="#0284C7" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="هزینه" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" mb={2}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ flexGrow: 1 }}>
              تاریخچه تراکنش‌ها
            </Typography>
            <TextField
              size="small"
              placeholder="جستجو..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            />
            <TextField select size="small" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} sx={{ minWidth: 120 }}>
              <MenuItem value="">همه انواع</MenuItem>
              <MenuItem value="income">درآمد</MenuItem>
              <MenuItem value="expense">هزینه</MenuItem>
            </TextField>
            <TextField select size="small" value={catFilter} onChange={(e) => setCatFilter(e.target.value)} sx={{ minWidth: 130 }}>
              <MenuItem value="">همه دسته‌ها</MenuItem>
              {CATEGORIES.map((c) => (
                <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
              ))}
            </TextField>
            <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setEditor({ open: true, record: null })}>
              تراکنش جدید
            </Button>
          </Stack>

          {filtered.length === 0 && <Typography color="text.secondary" textAlign="center" py={3}>تراکنشی ثبت نشده است</Typography>}

          <Stack gap={0.5}>
            {filtered.map((tx) => (
              <Box key={tx.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 1, borderBottom: '1px solid', borderColor: 'divider', flexWrap: 'wrap', '&:hover': { bgcolor: 'action.hover' } }}>
                <Box sx={{ width: 4, height: 32, borderRadius: 1, bgcolor: tx.type === 'income' ? '#16A34A' : '#DC2626' }} />
                <Box sx={{ flexGrow: 1, minWidth: 180 }}>
                  <Typography variant="body2" fontWeight={600}>{tx.description}</Typography>
                  <Stack direction="row" gap={0.5} flexWrap="wrap">
                    <Chip size="small" variant="outlined" label={tx.category_display ?? tx.category} />
                    <Chip size="small" variant="outlined" label={tx.method_display ?? tx.method} />
                    <Typography variant="caption" color="text.secondary">{formatJalali(tx.date, true)}</Typography>
                    {tx.type === 'income' && !tx.is_settled && <Chip size="small" color="warning" label="مطالبه" />}
                  </Stack>
                </Box>
                <Typography variant="body2" fontWeight={700} color={tx.type === 'income' ? '#16A34A' : '#DC2626'}>
                  {tx.type === 'income' ? '+' : '−'} {formatNumber(tx.amount)}
                </Typography>
                <IconButton size="small" onClick={() => setEditor({ open: true, record: tx })}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => deleteMutation.mutate(tx.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {running.length > 0 && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>تراز تجمعی</Typography>
            <Stack gap={0.5}>
              {running.map((row) => (
                <Stack key={row.id} direction="row" justifyContent="space-between" sx={{ py: 0.5, borderBottom: '1px dashed', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">{formatJalali(row.date, true)}</Typography>
                  <Typography variant="body2" fontWeight={600} color={row.balance >= 0 ? '#16A34A' : '#DC2626'}>
                    {formatNumber(row.balance)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      <FormDrawer open={editor.open} title={editor.record ? 'ویرایش تراکنش' : 'تراکنش جدید'} onClose={() => setEditor({ open: false, record: null })}>
        {editor.open && (
          <TransactionForm
            projectId={projectId}
            record={editor.record}
            onClose={() => setEditor({ open: false, record: null })}
            onSaved={invalidate}
          />
        )}
      </FormDrawer>
    </Stack>
  );
}

const CATEGORIES = [
  { value: 'labor', label: 'نیروی کار' },
  { value: 'material', label: 'مواد و مصالح' },
  { value: 'equipment', label: 'تجهیزات' },
  { value: 'transport', label: 'حمل‌ونقل' },
  { value: 'testing', label: 'آزمایشگاهی' },
  { value: 'consulting', label: 'مشاوره' },
  { value: 'other', label: 'سایر' },
];

export const TRANSACTION_CATEGORIES = CATEGORIES;
export type { Transaction, TransactionType };