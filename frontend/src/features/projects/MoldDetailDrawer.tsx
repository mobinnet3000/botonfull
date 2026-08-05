import { useState, useEffect, useCallback } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  CameraAlt as CameraIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  AccessTime as TimeIcon,
  Balance as BalanceIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import { moldApi } from '../core/services/domain';
import { projectApi } from '../core/services/projects';
import { formatDate, formatNumber, getErrorMessage } from '../core/utils/format';
import { useApp } from '../core/contexts/AppContext';
import type { Mold, PourSeries, StructuralMember, Project } from '../core/types';
import { FileUpload } from '../shared/components/FileUpload';

const schema = z.object({
  breaking_load: z.coerce.number().min(0, 'Breaking load must be positive').nullable(),
  mass: z.coerce.number().min(0, 'Mass must be positive').nullable(),
  status: z.string().optional(),
  priority: z.string().optional(),
  technician: z.coerce.number().nullable().optional(),
  failure_type: z.string().optional(),
  test_notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const MOLD_STATUS_OPTIONS = [
  { value: 'pending', label: '\u062f\u0631 \u0627\u0646\u062a\u0638\u0627\u0631' },
  { value: 'in_progress', label: '\u062f\u0631 \u062d\u0627\u0644 \u0622\u0632\u0645\u0648\u0646' },
  { value: 'completed', label: '\u0622\u0646\u062c\u0627\u0645 \u0634\u062f\u0647' },
  { value: 'rejected', label: '\u0631\u062f \u0634\u062f\u0647' },
  { value: 'overdue', label: '\u062f\u06cc\u0631\u06a9\u0648\u0644\u062f' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: '\u06a9\u0645' },
  { value: 'medium', label: '\u0645\u062a\u0648\u0633\u0637' },
  { value: 'high', label: '\u0632\u06cc\u0627\u062f' },
  { value: 'urgent', label: '\u0641\u0648\u0631\u06cc' },
];

interface MoldDetailDrawerProps {
  mold: Mold;
  projectId: number;
  onClose: () => void;
  onSaved?: (mold: Mold) => void;
}

export function MoldDetailDrawer({ mold, projectId, onClose, onSaved }: MoldDetailDrawerProps) {
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { data: project } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectApi.get(projectId),
    enabled: Boolean(projectId),
    staleTime: 60_000,
  });

  const { data: pourSeries } = useQuery({
    queryKey: ['pour-series', mold.pour_series],
    queryFn: () => pourSeriesApi.get(mold.pour_series || 0),
    enabled: Boolean(mold.pour_series),
    staleTime: 60_000,
  });

  const { data: structuralMember } = useQuery({
    queryKey: ['structural-members', pourSeries?.structural_member],
    queryFn: () => structuralMemberApi.get(pourSeries?.structural_member || 0),
    enabled: Boolean(pourSeries?.structural_member),
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<Mold>) => moldApi.update(mold.id, data),
    onSuccess: (updatedMold) => {
      enqueueSnackbar(t('messages.updated'), { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['molds'] });
      qc.invalidateQueries({ queryKey: ['projects', projectId] });
      onSaved?.(updatedMold);
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
    onSettled: () => setIsSaving(false),
  });

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      breaking_load: mold.breaking_load ?? null,
      mass: mold.mass ?? null,
      status: mold.status || 'pending',
      priority: mold.priority || 'medium',
      technician: mold.technician ?? null,
      failure_type: mold.failure_type || '',
      test_notes: mold.test_notes || '',
    },
  });

  const handleSubmit = useCallback((data: FormValues) => {
    setIsSaving(true);
    mutation.mutate(data as Partial<Mold>);
  }, [mutation]);

  const handleComplete = useCallback(() => {
    methods.setValue('status', 'completed');
    methods.setValue('completed_at', dayjs().toISOString());
    methods.handleSubmit(handleSubmit)();
  }, [methods, handleSubmit]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'overdue': return 'error';
      case 'rejected': return 'error';
      default: return 'default';
    }
  }, []);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'default';
    }
  }, []);

  const remainingDays = dayjs(mold.deadline).diff(dayjs(), 'day');
  const isOverdue = remainingDays < 0 && !mold.is_done;
  const isDueToday = remainingDays === 0 && !mold.is_done;

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" gap={1}>
            <BalanceIcon color="primary" />
            <Typography variant="h6">
              {mold.sample_identifier}
            </Typography>
          </Stack>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <DialogContent dividers>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)}>
            <Stack gap={2}>
              {/* Header Information */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" mb={1}>
                    \u0627\u0639\u0644\u0627\u0645\u0627\u062a \u0642\u0627\u0644\u0628
                  </Typography>
                  <Stack direction="row" gap={1} flexWrap="wrap">
                    <Chip 
                      label={`\u0633\u0646: ${mold.age_in_days}\u0631\u0648\u0632\u0647`} 
                      variant="outlined" 
                      color="primary"
                    />
                    <Chip 
                      label={`\u0645\u0648\u0639\u062f: ${formatDate(mold.deadline)}`} 
                      variant="outlined"
                    />
                    <Chip 
                      label={getStatusLabel(mold.status, mold.is_done, isOverdue, isDueToday)}
                      color={getStatusColor(mold.status || (isOverdue ? 'overdue' : mold.is_done ? 'completed' : 'pending'))}
                      variant="filled"
                    />
                    <Chip 
                      label={`\u0627\u0648\u0644\u0648\u06cc\u062a: ${getPriorityLabel(mold.priority)}`}
                      color={getPriorityColor(mold.priority || 'medium')}
                      variant="outlined"
                    />
                  </Stack>
                  
                  {project && (
                    <Stack direction="row" gap={1} mt={1} flexWrap="wrap">
                      <Chip label={`\u067e\u0631\u0648\u0698\u0647: ${project.project_name}`} variant="outlined" size="small" />
                      {structuralMember && (
                        <Chip label={`\u0639\u0636\u0648: ${structuralMember.name}`} variant="outlined" size="small" />
                      )}
                      {pourSeries && (
                        <Chip label={`\u0631\u06cc\u0632: ${pourSeries.name}`} variant="outlined" size="small" />
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>

              <Divider />

              {/* Test Result Form */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>
                    \u0646\u062a\u0627\u06cc\u062c \u0622\u0632\u0645\u0648\u0646
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="breaking_load"
                        control={methods.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="\u0628\u0627\u0631 \u0634\u06a9\u0633\u062a (kg/cm2)"
                            type="number"
                            fullWidth
                            InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                            error={!!methods.formState.errors.breaking_load}
                            helperText={methods.formState.errors.breaking_load?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="mass"
                        control={methods.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="\u0648\u0632\u0646 (kg)"
                            type="number"
                            fullWidth
                            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="status"
                        control={methods.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            select
                            label="\u0648\u0636\u0639\u06cc\u062a"
                            fullWidth
                          >
                            {MOLD_STATUS_OPTIONS.map((opt) => (
                              <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="priority"
                        control={methods.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            select
                            label="\u0627\u0648\u0644\u0648\u06cc\u062a"
                            fullWidth
                          >
                            {PRIORITY_OPTIONS.map((opt) => (
                              <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name="failure_type"
                        control={methods.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="\u0646\u0648\u0639 \u0634\u06a9\u0633\u062a"
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name="test_notes"
                        control={methods.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="\u06cc\u0627\u062f\u062f\u0627\u0634\u062a\u062a"
                            multiline
                            rows={3}
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Attachments */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>
                    \u0636\u0645\u06cc\u0645\u0647\u0647\u0627
                  </Typography>
                  <Stack direction="row" gap={2} flexWrap="wrap">
                    <FileUpload
                      contentType="mold"
                      objectId={mold.id}
                      label="\u0639\u06a9\u0633 \u0642\u0628\u0644 \u0634\u06a9\u0633\u062a"
                      fileField="pre_break_image"
                    />
                    <FileUpload
                      contentType="mold"
                      objectId={mold.id}
                      label="\u0639\u06a9\u0633 \u0628\u0639\u062f \u0634\u06a9\u0633\u062a"
                      fileField="post_break_image"
                    />
                  </Stack>
                  
                  {/* Display existing images */}
                  <Stack direction="row" gap={2} mt={2} flexWrap="wrap">
                    {mold.pre_break_image && (
                      <Box
                        component="img"
                        src={mold.pre_break_image}
                        alt="Pre-break"
                        sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1 }}
                      />
                    )}
                    {mold.post_break_image && (
                      <Box
                        component="img"
                        src={mold.post_break_image}
                        alt="Post-break"
                        sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1 }}
                      />
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>
                    \u062a\u0627\u0631\u06cc\u062e\u0686 \u0648 \u0633\u06cc\u0631 \u0632\u0645\u0627\u0646\u06cc
                  </Typography>
                  <Stack gap={1}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2">
                        \u062a\u0627\u0631\u06cc\u062e: {formatDate(mold.created_at)}
                      </Typography>
                    </Stack>
                    {mold.completed_at && (
                      <Stack direction="row" alignItems="center" gap={1}>
                        <CheckCircleIcon fontSize="small" color="success" />
                        <Typography variant="body2">
                          \u0622\u0646\u062c\u0627\u0645: {formatDate(mold.completed_at)}
                        </Typography>
                      </Stack>
                    )}
                    <Stack direction="row" alignItems="center" gap={1}>
                      <TimeIcon fontSize="small" color={isOverdue ? 'error' : 'action'} />
                      <Typography variant="body2">
                        {isOverdue 
                          ? `\u062f\u06cc\u0631\u06a9\u0648\u0644\u062f ${Math.abs(remainingDays)}\u0631\u0648\u0632`
                          : isDueToday 
                            ? '\u0627\u0645\u0631\u0648\u0632'
                            : `\u062a\u0627 ${remainingDays}\u0631\u0648\u0632 \u062f\u06cc\u06af\u0644`}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </form>
        </FormProvider>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          \u062c\u0644\u0648
        </Button>
        {!mold.is_done && (
          <Button 
            onClick={handleComplete}
            color="success"
            startIcon={<CheckCircleIcon />}
            disabled={isSaving}
          >
            \u0622\u0646\u062c\u0627\u0645 \u0622\u0632\u0645\u0648\u0646
          </Button>
        )}
        <Button 
          onClick={methods.handleSubmit(handleSubmit)}
          color="primary"
          startIcon={<SaveIcon />}
          disabled={isSaving}
          variant="contained"
        >
          {isSaving ? '\u062f\u0631 \u062d\u0644 \u0630\u062e\u06cc\u0631\u0647...' : '\u0630\u062e\u06cc\u0631\u0647'}
        </Button>
      </DialogActions>

      {/* History Dialog */}
      <Dialog open={showHistory} onClose={() => setShowHistory(false)} maxWidth="sm" fullWidth>
        <DialogTitle>\u062a\u0627\u0631\u06cc\u062e\u0686 \u0642\u0627\u0644\u0628</DialogTitle>
        <DialogContent>
          <Typography>\u0627\u06cc\u0646\u062c\u0627 \u0627\u0632 \u0627\u06cc\u0646 \u0628\u0627\u0632\u0647 \u0646\u0634\u062f\u0647 \u0627\u0633\u062a\u0647 \u0634\u0648\u062f</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>\u0628\u0633\u062a\u0646</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

// Helper functions
function getStatusLabel(status: string, isDone: boolean, isOverdue: boolean, isDueToday: boolean): string {
  if (isDone) return '\u0622\u0646\u062c\u0627\u0645 \u0634\u062f\u0647';
  if (isOverdue) return '\u062f\u06cc\u0631\u06a9\u0648\u0644\u062f';
  if (isDueToday) return '\u0627\u0645\u0631\u0648\u0632';
  return status || '\u062f\u0631 \u0627\u0646\u062a\u0638\u0627\u0631';
}

function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    low: '\u06a9\u0645',
    medium: '\u0645\u062a\u0648\u0633\u0637',
    high: '\u0632\u06cc\u0627\u062f',
    urgent: '\u0641\u0648\u0631\u06cc',
  };
  return labels[priority] || priority;
}

// Export for use in other components
export { getStatusLabel, getPriorityLabel };
