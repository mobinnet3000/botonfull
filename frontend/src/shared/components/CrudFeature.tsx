import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useMemo, useState, type ReactNode } from 'react';
import { Add, Delete, Edit } from '@mui/icons-material';
import { Button, IconButton, Stack, Tooltip } from '@mui/material';
import type { GridColDef, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { PageHeader } from './PageHeader';
import { DataTable } from './DataTable';
import { FormDrawer } from './FormDrawer';
import { ConfirmDialog } from './ConfirmDialog';
import { SkeletonTable } from './Loading';
import { ErrorState } from './States';
import type { ListParams } from '../../core/services/core';
import type { Paginated } from '../../core/types';
import { useApp } from '../../core/contexts/AppContext';
import { getErrorMessage } from '../../core/api/client';

export interface CrudFeatureProps<T extends { id: number }> {
  queryKey: string[];
  title: string;
  subtitle?: string;
  fetcher: (params?: ListParams) => Promise<Paginated<T>>;
  removeFn?: (id: number) => Promise<unknown>;
  columns: GridColDef<T>[];
  renderForm?: (props: { record: T | null; onClose: () => void }) => ReactNode;
  onRowClick?: (row: T) => void;
  toolbarExtra?: ReactNode;
  createEnabled?: boolean;
  updateEnabled?: boolean;
  deleteEnabled?: boolean;
}

export function CrudFeature<T extends { id: number }>({
  queryKey,
  title,
  subtitle,
  fetcher,
  removeFn,
  columns,
  renderForm,
  onRowClick,
  toolbarExtra,
  createEnabled = true,
  updateEnabled = true,
  deleteEnabled = true,
}: CrudFeatureProps<T>) {
  const { t } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState<string>();
  const [selection, setSelection] = useState<GridRowSelectionModel>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);

  const params = useMemo<ListParams>(
    () => ({ page, page_size: pageSize, search: search || undefined, ordering }),
    [page, pageSize, search, ordering],
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => fetcher(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => (removeFn ? removeFn(id) : Promise.reject(new Error('no delete'))),
    onSuccess: () => {
      enqueueSnackbar(t('messages.deleted'), { variant: 'success' });
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => enqueueSnackbar(getErrorMessage(err), { variant: 'error' }),
  });

  const anyWrite = createEnabled || updateEnabled || (deleteEnabled && Boolean(removeFn));

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <Stack direction="row" gap={1}>
            {toolbarExtra}
            {anyWrite && renderForm && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                {t('common.add')}
              </Button>
            )}
          </Stack>
        }
      />
      {isLoading ? (
        <SkeletonTable />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable<T>
          columns={columns}
          rows={data?.results ?? []}
          rowCount={data?.count}
          loading={isLoading}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          searchValue={search}
          onSearchChange={setSearch}
          onSortModelChange={(m: GridSortModel) => {
            setOrdering(m.length ? (m[0].sort === 'desc' ? `-${m[0].field}` : m[0].field) : undefined);
          }}
          onRowClick={onRowClick}
          onRefresh={() => refetch()}
          onSelectionModelChange={setSelection}
          selectionModel={selection}
          exportFileName={queryKey[0]}
          checkboxSelection={anyWrite}
          toolbarActions={
            anyWrite && (
              <>
                <Tooltip title={t('common.edit')}>
                  <span>
                    <IconButton
                      disabled={selection.length !== 1 || !updateEnabled}
                      onClick={() => {
                        const record = data?.results.find((r) => r.id === Number(selection[0]));
                        if (record) {
                          setEditing(record);
                          setFormOpen(true);
                        }
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={t('common.delete')}>
                  <span>
                    <IconButton
                      disabled={selection.length !== 1 || !deleteEnabled || !removeFn}
                      color="error"
                      onClick={() => {
                        const record = data?.results.find((r) => r.id === Number(selection[0]));
                        if (record) setDeleteTarget(record);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            )
          }
        />
      )}

      {renderForm && (
        <FormDrawer
          open={formOpen}
          title={editing ? `${t('common.edit')} ${title}` : `${t('common.add')} ${title}`}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        >
          {renderForm({
            record: editing,
            onClose: () => {
              setFormOpen(false);
              setEditing(null);
            },
          })}
        </FormDrawer>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </>
  );
}