import { Document, Page, pdfjs } from 'react-pdf';
import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { TOKEN_KEY } from '../../core/api/client';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

export function PdfViewer({ url, title }: { url: string; title?: string }) {
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const token = localStorage.getItem(TOKEN_KEY);

  return (
    <Box>
      {title && (
        <Typography variant="subtitle1" mb={1}>
          {title}
        </Typography>
      )}
      <Document
        file={{ url, httpHeaders: token ? { Authorization: `Token ${token}` } : {} }}
        onLoadSuccess={({ numPages }) => setPages(numPages)}
        loading={<Typography>در حال بارگذاری PDF...</Typography>}
        error={<Typography color="error">خطا در بارگذاری PDF</Typography>}
      >
        <Page pageNumber={page} width={720} />
      </Document>
      <Stack direction="row" gap={1} mt={1} alignItems="center">
        <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          قبلی
        </Button>
        <Typography variant="body2">
          {page} / {pages || '—'}
        </Typography>
        <Button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
          بعدی
        </Button>
      </Stack>
    </Box>
  );
}