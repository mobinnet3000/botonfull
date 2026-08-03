import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Card, CardContent, Chip, Dialog, DialogContent, IconButton, ImageList, ImageListItem, ImageListItemBar, Stack, Typography } from '@mui/material';
import { Delete, Download, Preview } from '@mui/icons-material';
import { fileApi } from '../../core/services/platform';
import { useApp } from '../../core/contexts/AppContext';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { FileUpload } from '../../shared/components/FileUpload';
import { formatDate } from '../../core/utils/format';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { getErrorMessage, downloadFile } from '../../core/api/client';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import type { AppFile } from '../../core/types';

const IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const PDF_TYPES = ['pdf'];
const VIDEO_TYPES = ['mp4', 'mov'];

function FilePreview({ file }: { file: AppFile }) {
  const { url, file_type } = file;
  if (IMAGE_TYPES.includes(file_type)) {
    return (
      <DialogContent sx={{ p: 0 }}>
        <Box component="img" src={url} alt={file.original_name} sx={{ maxWidth: '100%', maxHeight: '80vh', display: 'block' }} />
      </DialogContent>
    );
  }
  if (PDF_TYPES.includes(file_type)) {
    return (
      <DialogContent sx={{ p: 0, height: '80vh' }}>
        <iframe src={url} title={file.original_name} style={{ width: '100%', height: '100%', border: 'none' }} />
      </DialogContent>
    );
  }
  if (VIDEO_TYPES.includes(file_type)) {
    return (
      <DialogContent sx={{ p: 0 }}>
        <Box component="video" src={url} controls sx={{ width: '100%', maxHeight: '80vh' }} />
      </DialogContent>
    );
  }
  return (
    <DialogContent>
      <Typography>پیش‌نمایش برای این نوع فایل پشتیبانی نمی‌شود.</Typography>
    </DialogContent>
  );
}

export default function FilesPage() {
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  usePageTitle(t('nav.files'));
  const [preview, setPreview] = useState<AppFile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppFile | null>(null);
  const contentType = 'sample' as const;
  const objectId = 1;

  const { data } = useQuery({ queryKey: ['files'], queryFn: () => fileApi.list({ page_size: 100 }) });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fileApi.remove(id),
    onSuccess: () => {
      enqueueSnackbar(t('messages.deleted'), { variant: 'success' });
      setDeleteTarget(null);
      qc.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });

  return (
    <Box className="fadeIn">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>
          {t('nav.files')}
        </Typography>
      </Stack>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} gap={2} alignItems={{ md: 'flex-start' }}>
            <Box sx={{ flexGrow: 1 }}>
              <FileUpload contentType={contentType} objectId={objectId} onUploaded={() => qc.invalidateQueries({ queryKey: ['files'] })} />
            </Box>
          </Stack>
          <Stack direction="row" gap={2} mt={2}>
            <Typography variant="body2" color="text.secondary">
              نوع: {contentType} — شناسه: {objectId}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <ImageList cols={4} gap={12}>
        {(data?.results ?? []).map((file) => (
          <ImageListItem key={file.id}>
            {IMAGE_TYPES.includes(file.file_type) ? (
              <Box
                component="img"
                src={file.url}
                alt={file.original_name}
                loading="lazy"
                sx={{ height: 160, width: '100%', objectFit: 'cover', borderRadius: 1 }}
              />
            ) : (
              <Box sx={{ height: 160, display: 'grid', placeItems: 'center', bgcolor: 'action.hover', borderRadius: 1 }}>
                <Chip label={file.file_type.toUpperCase()} />
              </Box>
            )}
            <ImageListItemBar
              title={file.original_name}
              subtitle={`${formatDate(file.created_at)} • ${file.content_type}`}
              actionIcon={
                <Stack direction="row">
                  <IconButton onClick={() => setPreview(file)} color="inherit" size="small">
                    <Preview />
                  </IconButton>
                  <IconButton onClick={() => downloadFile(file.url, file.original_name)} color="inherit" size="small">
                    <Download />
                  </IconButton>
                  <IconButton onClick={() => setDeleteTarget(file)} color="error" size="small">
                    <Delete />
                  </IconButton>
                </Stack>
              }
            />
          </ImageListItem>
        ))}
      </ImageList>

      <Dialog open={Boolean(preview)} onClose={() => setPreview(null)} maxWidth="lg">
        {preview && <FilePreview file={preview} />}
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}

