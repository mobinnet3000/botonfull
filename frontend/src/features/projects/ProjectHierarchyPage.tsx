import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Typography,
  TextField,
} from '@mui/material';
import {
  ArrowBack,
  Settings as SettingsIcon,
  Add as AddIcon,
  Science as MemberIcon,
  LocalShipping as PourIcon,
  Description as ReportIcon,
  Download as ExportIcon,
  ChevronRight,
} from '@mui/icons-material';
import { projectApi } from '../../core/services/projects';
import { formatDate, formatNumber, downloadBlob, rowsToCsv } from '../../core/utils/format';
import { useApp } from '../../core/contexts/AppContext';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { StatusChip } from '../../shared/components/StatusChip';
import { AppBreadcrumbs } from '../../shared/components/AppBreadcrumbs';
import { FormDrawer } from '../../shared/components/FormDrawer';
import { FileUpload } from '../../shared/components/FileUpload';
import { HierarchyTree, type HierarchyNode } from '../../shared/components/HierarchyTree';
import { projectSettings } from './projectSettings';
import { ProjectSettingsForm } from './ProjectSettingsForm';
import { StructuralMemberDialog } from './StructuralMemberDialog';
import { PourSeriesDialog } from './PourSeriesDialog';
import { ProjectReportDialog, type ReportScope } from './ProjectReportDialog';
import { AccountingTab } from './AccountingTab';
import { MoldDetailDrawer } from '../molds/MoldDetailDrawer';
import {
  summarizeSeries,
  projectMolds,
  projectMembers,
  memberMolds,
  moldMember,
  moldAgeLabel,
} from './projectHelpers';
import type { Project, StructuralMember, Mold, PourSeries } from '../../core/types';

type Tab = 'tree' | 'members' | 'tests' | 'accounting' | 'files';

const MEMBER_TYPE_LABELS: Record<string, string> = {
  foundation: 'فنداسیون',
  column: 'ستون',
  beam: 'تیر',
  wall: 'دیوار',
  slab: 'سقف',
  stair: 'پله',
  other: 'سایر',
};

export default function ProjectHierarchyPage() {
  const { id } = useParams();
  const { t } = useApp();
  usePageTitle(t('nav.project.detail'));
  const projectId = Number(id);

  const [tab, setTab] = useState<Tab>('tree');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [pourFor, setPourFor] = useState<number | null>(null);
  const [reportScope, setReportScope] = useState<{ scope: ReportScope; label: string; memberId?: number } | null>(null);
  const [moldId, setMoldId] = useState<number | null>(null);

  const { data: project, isLoading } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectApi.get(projectId),
    enabled: Boolean(projectId),
    staleTime: 15_000,
  });

  const settings = useMemo(() => projectSettings(project?.settings), [project]);
  const members = useMemo(() => (project ? projectMembers(project) : []), [project]);
  const allMolds = useMemo(() => (project ? projectMolds(project) : []), [project]);
  const pourCount = useMemo(
    () => members.reduce((sum, m) => sum + (m.pour_series ?? []).length, 0),
    [members],
  );

  const hierarchy = useMemo<HierarchyNode | null>(() => {
    if (!project) return null;
    return {
      id: `project-${project.id}`,
      label: project.project_name,
      chipColor: 'info',
      chipLabel: 'پروژه',
      children: members.map((member) => ({
        id: `member-${member.id}`,
        label: member.name,
        chipColor: 'primary',
        chipLabel: 'عضو سازه‌ای',
        onClick: () => {
          setTab('members');
        },
        children: (member.pour_series ?? []).map((series) => {
          const s = summarizeSeries(series);
          return {
            id: `pour-${series.id}`,
            label: series.name || `ریزش ${series.id}`,
            chipColor: s.overdue > 0 ? 'error' : s.dueToday > 0 ? 'warning' : 'secondary',
            chipLabel: `[${s.total} قالب] [${s.tested} انجام] [${s.dueToday} امروز]${s.overdue ? ` [${s.overdue} دیر]` : ''}`,
            secondary: `بعدی: ${s.nextDueLabel}`,
          };
        }),
      })),
    };
  }, [project, members]);

  if (isLoading || !project || !hierarchy) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">در حال بارگذاری پروژه...</Typography>
        </CardContent>
      </Card>
    );
  }

  const defaultPourName = `${settings.pour_name_prefix || 'Truck'} #${pourCount + 1}`;

  const exportCsv = () => {
    const rows = allMolds.map((m) => ({
      sample_identifier: m.sample_identifier,
      age_in_days: m.age_in_days,
      deadline: formatDate(m.deadline),
      breaking_load: m.breaking_load ?? '',
      done: m.is_done ? 'بله' : 'خیر',
    }));
    downloadBlob(
      rowsToCsv(rows as Record<string, unknown>[], [
        { field: 'sample_identifier', headerName: 'شناسه قالب' },
        { field: 'age_in_days', headerName: 'سن (روز)' },
        { field: 'deadline', headerName: 'موعد' },
        { field: 'breaking_load', headerName: 'بار شکست' },
        { field: 'done', headerName: 'انجام شده' },
      ]),
      `project-${project.code}-molds.csv`,
    );
  };

  return (
    <Box className="fadeIn">
      <AppBreadcrumbs
        crumbs={[{ label: t('nav.projects'), path: '/projects' }, { label: project.project_name }]}
      />
      <Stack direction="row" alignItems="center" gap={1} mb={2} flexWrap="wrap">
        <IconButton onClick={() => window.history.back()} aria-label="back">
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          {project.project_name}
        </Typography>
        <Chip size="small" label={project.code} variant="outlined" />
        <StatusChip value={project.status} />
        <Box sx={{ flexGrow: 1 }} />
        <ProjectActions
          settingsOpen={() => setSettingsOpen(true)}
          addMember={() => setMemberOpen(true)}
          addPour={() => setPourFor(members[0]?.id ?? null)}
          report={(scope) => setReportScope({ scope, label: scopeLabel(scope) })}
          onExport={exportCsv}
        />
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable">
        <Tab value="tree" label="ساختار و ریزها" />
        <Tab value="members" label={`اعضای سازه‌ای (${members.length})`} />
        <Tab value="tests" label={`قالب‌ها و آزمون‌ها (${allMolds.length})`} />
        <Tab value="accounting" label="حسابداری پروژه" />
        <Tab value="files" label="فایل‌ها" />
      </Tabs>

      {tab === 'tree' && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              ساختار درختی پروژه — عضو سازه‌ای / ریز بتن
            </Typography>
            <HierarchyTree root={hierarchy} />
          </CardContent>
        </Card>
      )}

      {tab === 'members' && (
        <MembersTab
          members={members}
          onAddMember={() => setMemberOpen(true)}
          onAddPour={(memberId) => setPourFor(memberId)}
          onMoldClick={(mid) => setMoldId(mid)}
        />
      )}

      {tab === 'tests' && (
        <TestsTab project={project} molds={allMolds} onMoldClick={(mid) => setMoldId(mid)} />
      )}

      {tab === 'accounting' && <AccountingTab projectId={project.id} />}

      {tab === 'files' && (
        <Card variant="outlined">
          <CardContent>
            <FileUpload contentType="project" objectId={project.id} />
          </CardContent>
        </Card>
      )}

      <FormDrawer open={settingsOpen} title="تنظیمات پروژه" onClose={() => setSettingsOpen(false)}>
        <ProjectSettingsForm
          projectId={project.id}
          initial={settings}
          onClose={() => setSettingsOpen(false)}
        />
      </FormDrawer>

      <FormDrawer open={memberOpen} title="ایجاد عضو سازه‌ای" onClose={() => setMemberOpen(false)}>
        <StructuralMemberDialog projectId={project.id} onClose={() => setMemberOpen(false)} />
      </FormDrawer>

      <FormDrawer
        open={pourFor !== null}
        title="ایجاد ریز بتن و قالب‌ها"
        onClose={() => setPourFor(null)}
      >
        {pourFor !== null && (
          <PourSeriesDialog
            projectId={project.id}
            memberId={pourFor}
            members={members}
            settings={settings}
            defaultName={defaultPourName}
            onClose={() => setPourFor(null)}
          />
        )}
      </FormDrawer>

      <FormDrawer open={reportScope !== null} title="گزارش جدید" onClose={() => setReportScope(null)}>
        {reportScope && (
          <ProjectReportDialog
            projectId={project.id}
            projectName={project.project_name}
            scope={reportScope.scope}
            scopeLabel={reportScope.label}
            memberId={reportScope.memberId}
            onClose={() => setReportScope(null)}
          />
        )}
      </FormDrawer>

      {moldId !== null && <MoldDetailDrawer moldId={moldId} onClose={() => setMoldId(null)} />}
    </Box>
  );
}

function scopeLabel(scope: ReportScope): string {
  switch (scope) {
    case 'project':
      return 'کل پروژه';
    case 'member':
      return 'عضو سازه‌ای';
    case 'series':
      return 'ریزش بتن';
    case 'mold':
      return 'قالب';
    case 'test':
      return 'آزمون';
  }
}

function ProjectActions({
  settingsOpen,
  addMember,
  addPour,
  report,
  onExport,
}: {
  settingsOpen: () => void;
  addMember: () => void;
  addPour: () => void;
  report: (scope: ReportScope) => void;
  onExport: () => void;
}) {
  const [menu, setMenu] = useState<null | HTMLElement>(null);
  return (
    <Stack direction="row" gap={1} flexWrap="wrap">
      <Button size="small" variant="outlined" startIcon={<SettingsIcon />} onClick={settingsOpen}>
        تنظیمات
      </Button>
      <Button size="small" variant="contained" startIcon={<MemberIcon />} onClick={addMember}>
        عضو سازه‌ای
      </Button>
      <Button size="small" variant="contained" color="secondary" startIcon={<PourIcon />} onClick={addPour}>
        ریز بتن
      </Button>
      <Button size="small" variant="outlined" startIcon={<ReportIcon />} onClick={(e) => setMenu(e.currentTarget)}>
        گزارش
      </Button>
      <Menu anchorEl={menu} open={Boolean(menu)} onClose={() => setMenu(null)}>
        <MenuItem onClick={() => { setMenu(null); report('project'); }}>گزارش کل پروژه</MenuItem>
        <MenuItem onClick={() => { setMenu(null); report('member'); }}>گزارش عضو سازه‌ای</MenuItem>
        <MenuItem onClick={() => { setMenu(null); report('series'); }}>گزارش ریز</MenuItem>
        <MenuItem onClick={() => { setMenu(null); report('mold'); }}>گزارش قالب</MenuItem>
        <MenuItem onClick={() => { setMenu(null); report('test'); }}>گزارش آزمون</MenuItem>
      </Menu>
      <Button size="small" variant="outlined" startIcon={<ExportIcon />} onClick={onExport}>
        خروجی
      </Button>
    </Stack>
  );
}

function MembersTab({
  members,
  onAddMember,
  onAddPour,
  onMoldClick,
}: {
  members: StructuralMember[];
  onAddMember: () => void;
  onAddPour: (memberId: number) => void;
  onMoldClick: (moldId: number) => void;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(members[0]?.id ?? null);
  const selected = members.find((m) => m.id === selectedId) ?? null;

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1" fontWeight={700}>
                اعضای سازه‌ای
              </Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={onAddMember}>
                جدید
              </Button>
            </Stack>
            <Stack gap={0.5}>
              {members.length === 0 && (
                <Typography color="text.secondary" variant="body2">
                  عضوی ثبت نشده است
                </Typography>
              )}
              {members.map((m) => {
                const molds = memberMolds(m);
                return (
                  <Box
                    key={m.id}
                    onClick={() => setSelectedId(m.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      borderRadius: 1,
                      cursor: 'pointer',
                      bgcolor: selectedId === m.id ? 'action.selected' : 'transparent',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <ChevronRight fontSize="small" color="primary" />
                    <Typography variant="body2" sx={{ flexGrow: 1 }} fontWeight={selectedId === m.id ? 700 : 500}>
                      {m.name}
                    </Typography>
                    <Chip size="small" label={`${molds.length} قالب`} variant="outlined" />
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        {!selected ? (
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" textAlign="center" py={4}>
                یک عضو سازه‌ای انتخاب کنید
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <MemberDetail
            member={selected}
            onAddPour={() => onAddPour(selected.id)}
            onMoldClick={onMoldClick}
          />
        )}
      </Grid>
    </Grid>
  );
}

function MemberDetail({
  member,
  onAddPour,
  onMoldClick,
}: {
  member: StructuralMember;
  onAddPour: () => void;
  onMoldClick: (moldId: number) => void;
}) {
  const molds = memberMolds(member);
  const tested = molds.filter((m) => m.is_done).length;
  const pours = member.pour_series ?? [];

  return (
    <Stack gap={2}>
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
            <Typography variant="subtitle1" fontWeight={700} sx={{ flexGrow: 1 }}>
              {member.name}
            </Typography>
            <Chip size="small" label={MEMBER_TYPE_LABELS[member.member_type] ?? member.member_type} variant="outlined" />
            <Chip size="small" label={`${pours.length} ریز`} variant="outlined" />
            <Chip size="small" label={`${molds.length} قالب`} variant="outlined" />
            <Chip
              size="small"
              label={`${tested} انجام شده`}
              color={tested === molds.length && molds.length ? 'success' : 'default'}
              variant="outlined"
            />
          </Stack>
          {member.description && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              {member.description}
            </Typography>
          )}
          <Button size="small" variant="contained" startIcon={<PourIcon />} onClick={onAddPour} sx={{ mt: 1.5 }}>
            ریز جدید
          </Button>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            ریزهای بتن و قالب‌ها
          </Typography>
          {pours.length === 0 && <Typography color="text.secondary" variant="body2">ریزی ثبت نشده است</Typography>}
          {pours.map((series) => (
            <PourBlock key={series.id} series={series} onMoldClick={onMoldClick} />
          ))}
        </CardContent>
      </Card>
    </Stack>
  );
}

function PourBlock({ series, onMoldClick }: { series: PourSeries; onMoldClick: (moldId: number) => void }) {
  const s = summarizeSeries(series);
  return (
    <Box sx={{ py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" mb={1}>
        <Typography variant="body2" fontWeight={600} sx={{ minWidth: 140 }}>
          {series.name || `ریزش ${series.id}`}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatDate(series.pour_date)}
        </Typography>
        <Chip size="small" label={`${s.total} قالب`} />
        <Chip size="small" label={`${s.tested} انجام`} color={s.tested ? 'success' : 'default'} />
        {s.overdue > 0 && <Chip size="small" label={`${s.overdue} دیرکرد`} color="error" />}
        {s.dueToday > 0 && <Chip size="small" label={`${s.dueToday} امروز`} color="warning" />}
        <Typography variant="caption" color="text.secondary">
          آزمون بعدی: {s.nextDueLabel}
        </Typography>
      </Stack>
      <Stack direction="row" gap={0.5} flexWrap="wrap">
        {(series.molds ?? []).map((m) => (
          <Chip
            key={m.id}
            size="small"
            variant="outlined"
            label={`${moldAgeLabel(m.age_in_days)}${m.is_done ? ' ✓' : ''}`}
            color={m.is_done ? 'success' : m.is_overdue ? 'error' : 'warning'}
            title={`${m.sample_identifier} — ${formatDate(m.deadline)}`}
            onClick={() => onMoldClick(m.id)}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Stack>
    </Box>
  );
}

function TestsTab({
  project,
  molds,
  onMoldClick,
}: {
  project: Project;
  molds: Mold[];
  onMoldClick: (moldId: number) => void;
}) {
  const [sortBy, setSortBy] = useState<'deadline' | 'age' | 'status' | 'member' | 'done'>('deadline');

  const sorted = useMemo(() => {
    const arr = [...molds];
    const memberOf = (m: Mold) => moldMember(project, m.id).member;
    switch (sortBy) {
      case 'deadline':
        arr.sort((a, b) => Number(new Date(a.deadline)) - Number(new Date(b.deadline)));
        break;
      case 'age':
        arr.sort((a, b) => a.age_in_days - b.age_in_days);
        break;
      case 'status':
        arr.sort((a, b) => Number(a.is_done) - Number(b.is_done));
        break;
      case 'member':
        arr.sort((a, b) => ((memberOf(a)?.name ?? '') > (memberOf(b)?.name ?? '') ? 1 : -1));
        break;
      case 'done':
        arr.sort((a, b) => Number(b.breaking_load ?? 0) - Number(a.breaking_load ?? 0));
        break;
    }
    return arr;
  }, [molds, sortBy, project]);

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
          <Typography variant="subtitle1" fontWeight={700}>
            همه قالب‌های پروژه ({molds.length})
          </Typography>
          <TextField
            select
            size="small"
            label="مرتب‌سازی"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="deadline">موعد</MenuItem>
            <MenuItem value="age">سن</MenuItem>
            <MenuItem value="status">وضعیت</MenuItem>
            <MenuItem value="member">عضو سازه‌ای</MenuItem>
            <MenuItem value="done">نتیجه</MenuItem>
          </TextField>
        </Stack>
        <Stack gap={0.5}>
          {sorted.length === 0 && <Typography color="text.secondary" textAlign="center" py={3}>قالبی ثبت نشده است</Typography>}
          {sorted.map((m) => {
            const ctx = moldMember(project, m.id);
            return (
              <Box
                key={m.id}
                onClick={() => onMoldClick(m.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1,
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  flexWrap: 'wrap',
                }}
              >
                <Chip size="small" label={m.sample_identifier} color="primary" variant="outlined" />
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                  {ctx.member?.name ?? '—'} / {ctx.series?.name ?? '—'}
                </Typography>
                <Chip size="small" label={moldAgeLabel(m.age_in_days)} />
                <Typography variant="body2">
                  موعد: {formatDate(m.deadline)}
                </Typography>
                <StatusChip value={m.status} label={m.status_display ?? m.status} />
                {m.breaking_load !== null && m.breaking_load !== undefined && (
                  <Chip size="small" label={`بار شکست: ${formatNumber(m.breaking_load)}`} color="success" />
                )}
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}