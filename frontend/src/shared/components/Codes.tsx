import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { Box, Stack, Typography } from '@mui/material';

export function QrCodeBlock({ value, label }: { value: string; label?: string }) {
  return (
    <Stack alignItems="center" gap={1}>
      {label && <Typography variant="caption">{label}</Typography>}
      <Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <QRCodeSVG value={value} size={128} />
      </Box>
      <Typography variant="caption" fontFamily="monospace">
        {value}
      </Typography>
    </Stack>
  );
}

export function BarcodeBlock({ value, label }: { value: string; label?: string }) {
  return (
    <Stack alignItems="center" gap={1}>
      {label && <Typography variant="caption">{label}</Typography>}
      <Barcode value={value} height={48} width={1.4} fontSize={12} displayValue />
    </Stack>
  );
}