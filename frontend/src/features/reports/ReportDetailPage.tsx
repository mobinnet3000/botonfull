import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,

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
import { ArrowBack, Download, Print } from '@mui/icons-material';
import { useState } from 'react';
import { reportApi } from '../../core/services/reports';
import { formatDate } from '../../core/utils/format';
import { useApp } from '../../core/contexts/AppContext';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { StatusChip } from '../../shared/components/StatusChip';
import { QrCodeBlock, BarcodeBlock } from '../../shared/components/Codes';
import { PdfViewer } from '../../shared/components/PdfViewer';
import { downloadFile } from '../../core/api/client';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import { useAuth } from '../../core/auth/AuthContext';
import { canWrite } from '../../core/auth/roles';

export default function ReportDetailPage() {
  const { id } = useParams();
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const { role } = useAuth();
  const [tab, setTab] = useState(0);
  usePageTitle(t('nav.reports'));

  const { data: report, isLoading } = useQuery({
    queryKey: ['reports', id],
    queryFn: () => reportApi.get(Number(id)),
    enabled: Boolean(id),
  });

  const statusMutation = useMutation({
    mutationFn: (status: 'reviewed' | 'approved' | 'rejected') => {
      if (status === 'approved') return reportApi.approve(Number(id));
      if (status === 'reviewed') return reportApi.review(Number(id));
      return reportApi.reject(Number(id));
    },
    onSuccess: () => {
      enqueueSnackbar(t('messages.updated'), { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['reports', id] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });

  const canApprove = canWrite(role, 'reports');

  if (isLoading || !report) return <Typography>در حال بارگذاری...</Typography>;

  const downloadPdf = async () => {
    try {
      await downloadFile(reportApi.pdf(report.id), `${report.report_number}.pdf`);
    } catch (err) {
      enqueueSnackbar(getErrorMessage(err), { variant: 'error' });
    }
  };

  return (
    <Box className="fadeIn">
      <Stack direction="row" alignItems="center" gap={1} mb={2} flexWrap="wrap">
        <IconButton onClick={() => window.history.back()}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          {report.title}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <StatusChip value={report.status} />
        <Chip label={`نسخه ${report.version}`} size="small" />
        <Button size="small" variant="outlined" startIcon={<Download />} onClick={downloadPdf}>
          PDF
        </Button>
        <Button size="small" variant="outlined" startIcon={<Print />} onClick={() => window.print()}>
          چاپ
        </Button>
        {canApprove && report.status === 'draft' && (
          <Button size="small" color="primary" variant="contained" onClick={() => statusMutation.mutate('reviewed')}>
            بازبینی
          </Button>
        )}
        {canApprove && report.status === 'reviewed' && (
          <>
            <Button size="small" color="success" variant="contained" onClick={() => statusMutation.mutate('approved')}>
              تأیید
            </Button>
            <Button size="small" color="error" variant="outlined" onClick={() => statusMutation.mutate('rejected')}>
              رد
            </Button>
          </>
        )}
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="PDF" />
        <Tab label="اطلاعات" />
        <Tab label="نسخه‌ها" />
        <Tab label="کدها" />
      </Tabs>

      {tab === 0 && (
        <Card variant="outlined">
          <CardContent>
            <PdfViewer url={reportApi.pdf(report.id)} title={`${report.report_number}.pdf`} />
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>
                  اطلاعات گزارش
                </Typography>
                <Stack gap={1}>
                  {[
                    ['شماره گزارش', report.report_number],
                    ['پروژه', report.project_name],
                    ['نمونه', report.sample_code ?? '—'],
                    ['وضعیت', report.status_display],
                    ['نسخه', report.version],
                    ['ایجادکننده', report.created_by_username ?? '—'],
                    ['تأییدکننده', report.approved_by_username ?? '—'],
                    ['زمان تأیید', formatDate(report.approved_at, true)],
                    ['توضیحات', report.description || '—'],
                  ].map(([k, v]) => (
                    <Stack key={k as string} direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        {k}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {v}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} mb={1}>
                  امضای دیجیتال
                </Typography>
                {report.digital_signature && Object.keys(report.digital_signature).length ? (
                  <Stack gap={0.5}>
                    {Object.entries(report.digital_signature).map(([k, v]) => (
                      <Typography key={k} variant="body2">
                        {k}: {String(v)}
                      </Typography>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    امضا نشده است.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 2 && (
        <Card variant="outlined">
          <CardContent>
            <List>
              {(report.revisions ?? []).map((rev) => (
                <ListItem key={rev.id} divider>
                  <ListItemText
                    primary={`نسخه ${rev.version}`}
                    secondary={`${rev.changed_by_username ?? '—'} • ${formatDate(rev.created_at, true)}${rev.notes ? ` • ${rev.notes}` : ''}`}
                  />
                </ListItem>
              ))}
              {(report.revisions ?? []).length === 0 && (
                <Typography color="text.secondary">نسخه‌ای ثبت نشده است.</Typography>
              )}
            </List>
          </CardContent>
        </Card>
      )}

      {tab === 3 && (
        <Stack direction="row" gap={4} justifyContent="center" py={4}>
          <QrCodeBlock value={report.qr_verify_token} label="QR تائید" />
          <BarcodeBlock value={report.report_number} label="بارکد گزارش" />
        </Stack>
      )}
    </Box>
  );
}

