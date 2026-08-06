import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
  Alert,
} from '@mui/material';
import { Close, Image as ImageIcon } from '@mui/icons-material';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSnackbar } from 'notistack';
import { moldApi } from '../../core/services/domain';
import type { Mold } from '../../core/types';
import { StatusChip } from '../../shared/components/StatusChip';
import { TextInput, NumberInput, SelectInput } from '../../shared/components/form/FormField';
import { FormActions } from '../../shared/components/form/FormActions';
import { getErrorMessage } from '../../core/api/client';
import { formatJalali } from '../../core/utils/jalali';
import { formatNumber } from '../../core/utils/format';

const schema = z.object({
  breaking_load: z.coerce.number().optional(),
  mass: z.coerce.number().optional(),
  failure_type: z.string().optional(),
  test_notes: z.string().optional(),
  status: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const STATUS_OPTIONS = [
  { value: 'pending', label: 'در انتظار' },
  { value: 'in_progress', label: 'در حال آزمون' },
  { value: 'completed', label: 'انجام شده' },
  { value: 'rejected', label: 'رد شده' },
];

const FAILURE_OPTIONS = [
  'پرت سنجاقی',
  'مخروطی',
  'قطری',
  'موضعی',
  'لایه‌ای',
  'سایر',
].map((v) => ({ value: v, label: v }));

type InferProps = {
  moldId: number;
  onClose: () => void;
  onSaved?: () => void;
};

export function MoldDetailDrawer({ moldId, onClose, onSaved }: InferProps) {
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState(0);

  const { data: mold } = useQuery({
    queryKey: ['molds', moldId],
    queryFn: () => moldApi.get(moldId),
    enabled: Boolean(moldId),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['molds'] });
    qc.invalidateQueries({ queryKey: ['calendar'] });
    qc.invalidateQueries({ queryKey: ['projects'] });
    qc.invalidateQueries({ queryKey: ['samples'] });
    onSaved?.();
  };

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      breaking_load: mold?.breaking_load ?? undefined,
      mass: mold?.mass ?? undefined,
      failure_type: mold?.failure_type ?? '',
      test_notes: mold?.test_notes ?? '',
      status: mold?.status ?? 'pending',
    },
    values: {
      breaking_load: mold?.breaking_load ?? undefined,
      mass: mold?.mass ?? undefined,
      failure_type: mold?.failure_type ?? '',
      test_notes: mold?.test_notes ?? '',
      status: mold?.status ?? 'pending',
    },
  });

  const resultMutation = useMutation({
    mutationFn: (d: FormValues) =>
      moldApi.registerResult(moldId, {
        breaking_load: d.breaking_load ?? null,
        mass: d.mass ?? null,
        failure_type: d.failure_type ?? '',
        test_notes: d.test_notes ?? '',
        status: d.status,
      }),
    onSuccess: () => {
      enqueueSnackbar('نتیجه آزمایش ثبت شد', { variant: 'success' });
      invalidate();
      qc.invalidateQueries({ queryKey: ['molds', moldId] });
    },
    onError: (e) => enqueueSnackbar(getErrorMessage(e), { variant: 'error' }),
  });

  const [imageBusy, setImageBusy] = useState(false);
  const uploadImage = async (which: 'pre_break_image' | 'post_break_image', file?: File | null) => {
    if (!file) return;
    setImageBusy(true);
    try {
      const fd = new FormData();
      fd.append(which, file);
      await moldApi.registerResultForm(moldId, fd);
      enqueueSnackbar('عکس بارگذاری شد', { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['molds', moldId] });
    } catch (e) {
      enqueueSnackbar(getErrorMessage(e), { variant: 'error' });
    } finally {
      setImageBusy(false);
    }
  };

  if (!mold) {
    return (
      <Drawer anchor="left" open onClose={onClose}>
        <Box sx={{ width: 520, p: 3 }}>
          <Typography>در حال بارگذاری قالب...</Typography>
        </Box>
      </Drawer>
    );
  }

  return (
    <Drawer anchor="left" open onClose={onClose} sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 540 } } }}>
      <Stack spacing={0} sx={{ height: '100%' }}>
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            {mold.sample_identifier}
          </Typography>
          <StatusChip value={mold.status} />
          <Chip size="small" label={mold.priority_display || mold.priority} color={mold.priority === 'urgent' ? 'error' : 'default'} />
          <IconButton onClick={onClose} aria-label="close">
            <Close />
          </IconButton>
        </Stack>

        <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ px: 3, pt: 2 }}>
          <Chip size="small" label={`پروژه: ${mold.project_name ?? '—'}`} variant="outlined" />
          <Chip size="small" label={`عضو: ${mold.member_name ?? '—'}`} variant="outlined" />
          <Chip size="small" label={`ریزش: ${mold.pour_name ?? '—'}`} variant="outlined" />
          <Chip size="small" label={`سن: ${mold.age_in_days} روزه`} color="primary" variant="outlined" />
        </Stack>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 1 }} variant="scrollable">
          <Tab label="اطلاعات / تاریخچه" />
          <Tab label="ثبت نتیجه آزمون" />
          <Tab label="تصاویر" />
        </Tabs>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
          {tab === 0 && <GeneralInfo mold={mold} />}
          {tab === 1 && (
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit((d) => resultMutation.mutate(d))}>
                <Stack gap={2}>
                  {!mold.is_done && mold.is_overdue ? (
                    <Alert severity="error">
                      این آزمون دیرکرد دارد. موعد آن {formatJalali(mold.deadline)} بوده است.
                    </Alert>
                  ) : (
                    !mold.is_done && (
                      <Alert severity="info">موعد آزمون: {formatJalali(mold.deadline, true)}</Alert>
                    )
                  )}
                  <Stack direction="row" gap={2}>
                    <NumberInput<FormValues> name="breaking_load" label="بار شکست (kN)" required={mold.status !== 'rejected'} />
                    <NumberInput<FormValues> name="mass" label="وزن (kg)" />
                  </Stack>
                  <Stack direction="row" gap={2}>
                    <SelectInput<FormValues> name="failure_type" label="نوع شکست" options={FAILURE_OPTIONS} />
                    <SelectInput<FormValues> name="status" label="وضعیت نتیجه" options={STATUS_OPTIONS} />
                  </Stack>
                  <TextInput<FormValues> name="test_notes" label="یادداشت آزمون" multiline rows={3} />
                  <FormActions onCancel={onClose} loading={resultMutation.isPending} />
                </Stack>
              </form>
            </FormProvider>
          )}
          {tab === 2 && <ImagesTab mold={mold} busy={imageBusy} onUpload={uploadImage} />}
        </Box>
      </Stack>
    </Drawer>
  );
}

function GeneralInfo({ mold }: { mold: Mold }) {
  const rows: [string, string][] = [
    ['سن قالب', `${mold.age_in_days} روزه`],
    ['موعد آزمون', formatJalali(mold.deadline, true)],
    ['انجام شده', formatJalali(mold.completed_at, true)],
    ['بار شکست', mold.breaking_load ? formatNumber(mold.breaking_load) : '—'],
    ['وزن', mold.mass ? `${formatNumber(mold.mass)} kg` : '—'],
    ['تکنسین', mold.technician_username ?? '—'],
    ['نوع شکست', mold.failure_type || '—'],
  ];
  return (
    <Stack gap={1.5}>
      <Stack gap={0.75}>
        {rows.map(([k, v]) => (
          <Stack key={k} direction="row" justifyContent="space-between" sx={{ borderBottom: '1px dashed', borderColor: 'divider', pb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">{k}</Typography>
            <Typography variant="body2" fontWeight={600}>{v}</Typography>
          </Stack>
        ))}
      </Stack>
      <Divider />
      <Typography variant="subtitle2" fontWeight={700}>یادداشت آزمون</Typography>
      <Typography variant="body2">{mold.test_notes || '—'}</Typography>
      <Divider />
      <Typography variant="subtitle2" fontWeight={700}>تاریخچه</Typography>
      <Stack gap={1}>
        <TimelineRow label="قالب ایجاد شد" date={mold.created_at} />
        <TimelineRow label="موعد آزمون" date={mold.deadline} />
        {mold.completed_at && <TimelineRow label="نتیجه ثبت شد" date={mold.completed_at} accent="success" />}
      </Stack>
    </Stack>
  );
}

function TimelineRow({ label, date, accent }: { label: string; date?: string | null; accent?: 'success' }) {
  return (
    <Stack direction="row" alignItems="center" gap={1.5}>
      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: accent === 'success' ? 'success.main' : 'primary.main' }} />
      <Typography variant="body2" sx={{ flexGrow: 1 }}>{label}</Typography>
      <Typography variant="body2" color="text.secondary">{formatJalali(date, true)}</Typography>
    </Stack>
  );
}

function ImagesTab({
  mold,
  busy,
  onUpload,
}: {
  mold: Mold;
  busy: boolean;
  onUpload: (which: 'pre_break_image' | 'post_break_image', file?: File | null) => void;
}) {
  return (
    <Stack gap={2}>
      <ImageUploader label="عکس قبل از شکست" url={mold.pre_break_image} disabled={busy} onChange={(f) => onUpload('pre_break_image', f)} />
      <ImageUploader label="عکس بعد از شکست" url={mold.post_break_image} disabled={busy} onChange={(f) => onUpload('post_break_image', f)} />
    </Stack>
  );
}

function ImageUploader({
  label,
  url,
  disabled,
  onChange,
}: {
  label: string;
  url: string | null;
  disabled: boolean;
  onChange: (file?: File | null) => void;
}) {
  const [preview, setPreview] = useState(url);
  return (
    <Box>
      <Typography variant="subtitle2" mb={1}>{label}</Typography>
      {preview ? (
        <Box mb={1} sx={{ position: 'relative', display: 'inline-block' }}>
          <Box
            component="img"
            src={preview}
            alt={label}
            sx={{ width: 260, height: 180, objectFit: 'cover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
          />
        </Box>
      ) : (
        <Alert icon={<ImageIcon />} severity="info" sx={{ mb: 1 }}>عکسی ثبت نشده است</Alert>
      )}
      <label>
        <input
          type="file"
          accept="image/*"
          disabled={disabled}
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setPreview(URL.createObjectURL(file));
              onChange(file);
            }
          }}
        />
        <Chip label="تغییر عکس" clickable component="span" disabled={disabled} sx={{ cursor: 'pointer' }} />
      </label>
    </Box>
  );
}