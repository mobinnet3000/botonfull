import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Button, Card, CardContent, Chip, Divider, List, ListItem, ListItemText, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { notificationApi } from '../../core/services/platform';
import { useApp } from '../../core/contexts/AppContext';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { formatDate } from '../../core/utils/format';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../../core/api/client';

export default function NotificationsPage() {
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  usePageTitle(t('nav.notifications'));
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const { data } = useQuery({
    queryKey: ['notifications', 'page', filter],
    queryFn: () => notificationApi.list({ page_size: 100, is_read: filter === 'all' ? undefined : filter === 'read' }),
  });

  const readMutation = useMutation({
    mutationFn: (id: number) => notificationApi.read(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });

  const readAll = useMutation({
    mutationFn: () => notificationApi.readAll(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <Box className="fadeIn">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Typography variant="h5" fontWeight={700}>
          {t('nav.notifications')}
        </Typography>
        <Stack direction="row" gap={1} alignItems="center">
          <ToggleButtonGroup size="small" value={filter} exclusive onChange={(_, v) => v && setFilter(v)}>
            <ToggleButton value="all">همه</ToggleButton>
            <ToggleButton value="unread">خوانده نشده</ToggleButton>
            <ToggleButton value="read">خوانده شده</ToggleButton>
          </ToggleButtonGroup>
          <Button size="small" onClick={() => readAll.mutate()}>
            خواندن همه
          </Button>
        </Stack>
      </Stack>

      <Card variant="outlined">
        <CardContent>
          <List>
            {(data?.results ?? []).length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={4}>
                اعلانی وجود ندارد
              </Typography>
            )}
            {(data?.results ?? []).map((n) => (
              <Box key={n.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{ bgcolor: n.is_read ? 'transparent' : 'action.hover', borderRadius: 1 }}
                  secondaryAction={
                    !n.is_read && (
                      <Button size="small" onClick={() => readMutation.mutate(n.id)}>
                        خوانده شد
                      </Button>
                    )
                  }
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" gap={1} alignItems="center">
                        <Chip size="small" label={n.ntype_display} variant="outlined" />
                        <span>{n.title}</span>
                      </Stack>
                    }
                    secondary={
                      <Stack gap={0.5} mt={0.5}>
                        <span>{n.message}</span>
                        <Box component="span" color="text.disabled" fontSize={12}>
                          {formatDate(n.created_at, true)}
                        </Box>
                      </Stack>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </Box>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}