import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, Stack, Typography } from '@mui/material';
import { apiClient } from '../../core/api/client';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

function usePdfData(url: string) {
  return useQuery({
    queryKey: ['pdf', url],
    queryFn: async () => {
      const res = await apiClient.get(url, { responseType: 'arraybuffer' });
      return res.data as ArrayBuffer;
    },
    enabled: Boolean(url),
    staleTime: 60_000,
  });
}

export function PdfViewer({ url, title }: { url: string; title?: string }) {
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const { data, isLoading, isError } = usePdfData(url);

  return (
    <Box>
      {title && (
        <Typography variant="subtitle1" mb={1}>
          {title}
        </Typography>
      )}
      {isLoading && <Typography color="text.secondary">در حال بارگذاری PDF...</Typography>}
      {isError && <Typography color="error">خطا در بارگذاری PDF</Typography>}
      {data && (
        <Document
          file={{ data }}
          onLoadSuccess={({ numPages }) => setPages(numPages)}
          loading={<Typography color="text.secondary">در حال بارگذاری PDF...</Typography>}
          error={<Typography color="error">خطا در بارگذاری PDF</Typography>}
        >
          <Page pageNumber={page} width={720} />
        </Document>
      )}
      {pages > 1 && (
        <Stack direction="row" gap={1} mt={1} alignItems="center">
          <Button disabled={page <= 1} onClick={() => setPage((p: number) => p - 1)}>
            قبلی
          </Button>
          <Typography variant="body2">
            {page} / {pages || '—'}
          </Typography>
          <Button disabled={page >= pages} onClick={() => setPage((p: number) => p + 1)}>
            بعدی
          </Button>
        </Stack>
      )}
    </Box>
  );
}