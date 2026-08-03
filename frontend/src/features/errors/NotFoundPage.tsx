import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../core/contexts/AppContext';
import { usePageTitle } from '../../core/hooks/usePageTitle';

export default function NotFoundPage() {
  const { t } = useApp();
  const navigate = useNavigate();
  usePageTitle('404');
  return (
    <Box sx={{ textAlign: 'center', py: 12 }}>
      <Typography variant="h2" fontWeight={800} color="primary">
        404
      </Typography>
      <Typography variant="h5" mt={1}>
        {t('error.notFound.title')}
      </Typography>
      <Typography color="text.secondary" mt={1}>
        {t('error.notFound.text')}
      </Typography>
      <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/')}>
        بازگشت به داشبورد
      </Button>
    </Box>
  );
}