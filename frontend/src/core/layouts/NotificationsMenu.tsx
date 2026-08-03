import { useState } from 'react';
import { Badge, Box, Button, Divider, IconButton, List, ListItemButton, ListItemText, Menu, Popover, Stack, Tooltip, Typography } from '@mui/material';
import { Notifications as NotifIcon, DoneAll } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../services/platform';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/format';

export function NotificationBell({ unread }: { unread: number }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications', 'popover'],
    queryFn: () => notificationApi.list({ page_size: 8 }),
    enabled: Boolean(anchor),
  });

  const readAll = useMutation({
    mutationFn: () => notificationApi.readAll(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const navigate = useNavigate();

  return (
    <>
      <Tooltip title="اعلان‌ها">
        <IconButton onClick={(e) => setAnchor(e.currentTarget)}>
          <Badge badgeContent={unread} color="error" max={99}>
            <NotifIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} PaperProps={{ sx: { width: 360, maxHeight: 480 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" px={2} py={1}>
          <Typography variant="subtitle1">اعلان‌ها</Typography>
          <Button size="small" startIcon={<DoneAll />} onClick={() => readAll.mutate()}>
            خواندن همه
          </Button>
        </Stack>
        <Divider />
        <List sx={{ py: 0 }}>
          {(data?.results ?? []).length === 0 && (
            <ListItemButton>
              <ListItemText primary="اعلانی وجود ندارد" />
            </ListItemButton>
          )}
          {(data?.results ?? []).map((n) => (
            <ListItemButton
              key={n.id}
              sx={{ alignItems: 'flex-start', bgcolor: n.is_read ? 'transparent' : 'action.hover' }}
              onClick={() => {
                setAnchor(null);
                if (n.link) navigate(n.link);
                else navigate('/notifications');
              }}
            >
              <ListItemText
                primary={n.title}
                secondary={
                  <Stack>
                    <span>{n.message}</span>
                    <Box component="span" color="text.disabled" fontSize={12}>
                      {formatDate(n.created_at, true)}
                    </Box>
                  </Stack>
                }
              />
            </ListItemButton>
          ))}
        </List>
        <Divider />
        <Box p={1}>
          <Button fullWidth onClick={() => { setAnchor(null); navigate('/notifications'); }}>
            مشاهده همه
          </Button>
        </Box>
      </Menu>
    </>
  );
}