import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Stack, IconButton } from '@mui/material';
import { NavigateNext, ChevronRight, Home } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export interface Crumb {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

export function AppBreadcrumbs({ crumbs, trailing }: { crumbs?: Crumb[]; trailing?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const resolved: Crumb[] = crumbs ?? defaultCrumbs(location.pathname);

  return (
    <Stack direction="row" alignItems="center" gap={0.5} sx={{ px: 3, py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
      <IconButton size="small" onClick={() => navigate('/')} sx={{ p: 0.5 }}>
        <Home fontSize="small" />
      </IconButton>
      <MuiBreadcrumbs
        separator={<NavigateNext fontSize="small" sx={{ opacity: 0.5 }} />}
        aria-label="breadcrumb"
        sx={{ flexGrow: 1 }}
      >
        {resolved.map((crumb, i) => {
          const isLast = i === resolved.length - 1 && !trailing;
          if (isLast || !crumb.path) {
            return (
              <Typography key={i} variant="body2" color="text.primary" fontWeight={600}>
                {crumb.label}
              </Typography>
            );
          }
          return (
            <Link
              key={i}
              component="button"
              underline="hover"
              color="inherit"
              sx={{ fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
              onClick={() => navigate(crumb.path!)}
            >
              {crumb.icon}
              {crumb.label}
            </Link>
          );
        })}
        {trailing && (
          <Typography variant="body2" color="text.primary" fontWeight={600}>
            {trailing}
          </Typography>
        )}
      </MuiBreadcrumbs>
      <ChevronRight fontSize="small" sx={{ opacity: 0.3, display: { xs: 'none', sm: 'inline-flex' } }} />
    </Stack>
  );
}

function defaultCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);
  const result: Crumb[] = [];
  let acc = '';
  for (const seg of segments) {
    acc += `/${seg}`;
    result.push({ label: seg, path: acc });
  }
  return result;
}