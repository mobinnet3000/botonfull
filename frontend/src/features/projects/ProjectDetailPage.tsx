import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useState } from 'react';
import { projectApi } from '../../core/services/projects';
import { sampleApi } from '../../core/services/samples';
import { useApp } from '../../core/contexts/AppContext';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { formatDate, formatNumber } from '../../core/utils/format';
import { StatusChip } from '../../shared/components/StatusChip';
import { FileUpload } from '../../shared/components/FileUpload';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { t } = useApp();
  const [tab, setTab] = useState(0);
  usePageTitle(t('nav.project.detail'));

  const { data: project, isLoading } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectApi.get(Number(id)),
    enabled: Boolean(id),
  });
  const { data: samples } = useQuery({
    queryKey: ['projects', id, 'samples'],
    queryFn: () => sampleApi.list({ page_size: 100 }),
    enabled: Boolean(id),
  });
  const projectSamples = (samples?.results ?? []).filter((s) => s.project === Number(id));

  if (isLoading || !project) return <Typography>در حال بارگذاری...</Typography>;

  return (
    <Box className="fadeIn">
      <Stack direction="row" alignItems="center" gap={1} mb={2}>
        <IconButton onClick={() => window.history.back()}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          {project.project_name}
        </Typography>
        <Chip size="small" label={project.code} variant="outlined" />
        <Box sx={{ flexGrow: 1 }} />
        <StatusChip value={project.status} />
        <StatusChip value={project.priority} />
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable">
        <Tab label="اطلاعات" />
        <Tab label="نمونه‌ها" />
        <Tab label="تراکنش‌ها" />
        <Tab label="فایل‌ها" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>
                  مشخصات پروژه
                </Typography>
                <Grid container spacing={2}>
                  {[
                    ['شماره پرونده', project.file_number],
                    ['پیمانکار', project.contractor_name || '—'],
                    ['مشاور', project.consultant_name || '—'],
                    ['مهندس مسئول', project.responsible_engineer || '—'],
                    ['کارفرما', project.client_name],
                    ['تلفن کارفرما', project.client_phone_number],
                    ['ناظر', project.supervisor_name],
                    ['تلفن ناظر', project.supervisor_phone_number],
                    ['درخواست‌دهنده', project.requester_name],
                    ['تلفن درخواست‌دهنده', project.requester_phone_number],
                    ['منطقه شهرداری', project.municipality_zone],
                    ['کاربری پروژه', project.project_usage_type],
                    ['طبقات', project.floor_count],
                    ['سطح زیربنا', `${project.occupied_area} m²`],
                    ['مبلغ قرارداد', formatNumber(project.contract_price)],
                    ['تاریخ شروع', formatDate(project.start_date)],
                    ['تاریخ پایان', formatDate(project.end_date)],
                    ['نوع آزمون', project.test_type],
                    ['تاریخ ایجاد', formatDate(project.created_at, true)],
                  ].map(([k, v]) => (
                    <Grid size={{ xs: 6, sm: 4 }} key={k as string}>
                      <Typography variant="caption" color="text.secondary">
                        {k}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {v}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">آدرس</Typography>
                <Typography variant="body2">{project.address}</Typography>
                {project.description && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" color="text.secondary">توضیحات</Typography>
                    <Typography variant="body2">{project.description}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack gap={2}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} mb={1}>
                    مالی
                  </Typography>
                  <Stack gap={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <span>درآمد</span>
                      <span style={{ color: '#16A34A', fontWeight: 700 }}>{formatNumber(project.total_income)}</span>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <span>هزینه</span>
                      <span style={{ color: '#DC2626', fontWeight: 700 }}>{formatNumber(project.total_expense)}</span>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <span>تراز</span>
                      <span style={{ fontWeight: 700 }}>{formatNumber(project.balance)}</span>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} mb={1}>
                    نمونه‌ها
                  </Typography>
                  <List dense>
                    {projectSamples.slice(0, 8).map((s) => (
                      <ListItem key={s.id}>
                        <ListItemText primary={s.code} secondary={s.category} />
                        <StatusChip value={s.status} />
                      </ListItem>
                    ))}
                    {projectSamples.length === 0 && (
                      <Typography color="text.secondary">نمونه‌ای ثبت نشده است</Typography>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Card variant="outlined">
          <CardContent>
            <List>
              {projectSamples.map((s) => (
                <ListItem key={s.id}>
                  <ListItemText primary={`${s.code} — ${s.category}`} secondary={`${formatDate(s.date)} • ${s.sampling_volume} m³`} />
                  <StatusChip value={s.status} />
                </ListItem>
              ))}
              {projectSamples.length === 0 && <Typography color="text.secondary">نمونه‌ای ثبت نشده است</Typography>}
            </List>
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card variant="outlined">
          <CardContent>
            <List>
              {(project.transactions ?? []).map((tx) => (
                <ListItem key={tx.id}>
                  <ListItemText primary={`${tx.type === 'income' ? 'درآمد' : 'هزینه'} — ${tx.description}`} secondary={formatDate(tx.date)} />
                  <Typography fontWeight={700} color={tx.type === 'income' ? '#16A34A' : '#DC2626'}>
                    {formatNumber(tx.amount)}
                  </Typography>
                </ListItem>
              ))}
              {(project.transactions ?? []).length === 0 && <Typography color="text.secondary">تراکنشی ثبت نشده است</Typography>}
            </List>
          </CardContent>
        </Card>
      )}

      {tab === 3 && (
        <Card variant="outlined">
          <CardContent>
            <FileUpload contentType="project" objectId={project.id} />
          </CardContent>
        </Card>
      )}
    </Box>
  );
}