import { useDropzone } from 'react-dropzone';
import { Box, Button, LinearProgress, Stack, Typography } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useState } from 'react';
import { fileApi } from '../../core/services/platform';
import type { FileContentType } from '../../core/types';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';
import { useApp } from '../../core/contexts/AppContext';

interface FileUploadProps {
  contentType: FileContentType;
  objectId: number;
  onUploaded?: () => void;
  multiple?: boolean;
}

export function FileUpload({ contentType, objectId, onUploaded, multiple = true }: FileUploadProps) {
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const onDrop = async (accepted: File[]) => {
    if (!accepted.length) return;
    setUploading(true);
    setProgress(10);
    try {
      for (const file of accepted) {
        const form = new FormData();
        form.append('file', file);
        form.append('content_type', contentType);
        form.append('object_id', String(objectId));
        form.append('original_name', file.name);
        await fileApi.upload(form);
        setProgress((p) => Math.min(100, p + 30));
      }
      enqueueSnackbar(t('messages.created'), { variant: 'success' });
      onUploaded?.();
    } catch (err) {
      enqueueSnackbar(getErrorMessage(err), { variant: 'error' });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'divider',
        borderRadius: 2,
        p: 3,
        textAlign: 'center',
        cursor: 'pointer',
        bgcolor: isDragActive ? 'action.hover' : 'transparent',
      }}
    >
      <input {...getInputProps()} />
      <Stack alignItems="center" gap={1}>
        <CloudUpload color="primary" fontSize="large" />
        <Typography variant="body2">کشیدن و رها کردن فایل یا انتخاب</Typography>
        <Button size="small" variant="outlined">
          انتخاب فایل
        </Button>
        {uploading && <LinearProgress variant="determinate" value={progress} sx={{ width: '100%' }} />}
      </Stack>
    </Box>
  );
}