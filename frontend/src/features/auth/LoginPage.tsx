import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { useApp } from '../../core/contexts/AppContext';
import { getErrorMessage } from '../../core/api/client';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { t } = useApp();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  usePageTitle(t('auth.loginTitle'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'نام کاربری یا رمز عبور اشتباه است'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, background: 'linear-gradient(135deg,#0B1220,#1E40AF 70%,#3B82F6)' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card sx={{ width: { xs: '100%', sm: 420 } }}>
          <CardContent sx={{ p: 4 }}>
            <Stack alignItems="center" gap={1} mb={3}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg,#1E40AF,#3B82F6)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 22,
                }}
              >
                L
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {t('auth.loginTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('auth.loginSubtitle')}
              </Typography>
            </Stack>
            <form onSubmit={handleSubmit}>
              <Stack gap={2}>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField
                  label={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  required
                  fullWidth
                />
                <TextField
                  label={t('auth.password')}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                />
                <Button type="submit" variant="contained" size="large" disabled={loading}>
                  {t('auth.login')}
                </Button>
              </Stack>
            </form>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
              {t('app.name')}
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}