import { useMemo, useState } from 'react';
import {\n  Box,\n  Button,\n  IconButton,\n  Menu,\n  MenuItem,\n  Paper,\n  TextField,\n  Toolbar,\n  Tooltip,\n  Typography,\n} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridFilterModel,
  type GridPaginationModel,
  type GridRowSelectionModel,
  type GridSortModel,
  gridFilteredSortedRowIdsSelector,
  useGridApiRef,
} from '@mui/x-data-grid';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  ViewColumn as ViewColumnIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { rowsToCsv, downloadBlob } from '../../core/utils/format';
import { useApp } from '../../core/contexts/AppContext';

export interface DataTableProps<T extends { id: number }> {
  columns: GridColDef<T>[];
  rows: T[];
  rowCount?: number;
  loading?: boolean;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSortModelChange?: (model: GridSortModel) => void;
  onFilterModelChange?: (model: GridFilterModel) => void;
  onRowClick?: (row: T) => void;
  onRefresh?: () => void;
  onSelectionModelChange?: (ids: GridRowSelectionModel) => void;
  selectionModel?: GridRowSelectionModel;
  toolbarActions?: React.ReactNode;
  bulkActions?: React.ReactNode;
  exportFileName?: string;
  checkboxSelection?: boolean;
  pageSizeOptions?: number[];
  minHeight?: number;
}

export function DataTable<T extends { id: number }>({
  columns,
  rows,
  rowCount,
  loading,
  page = 1,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  searchValue,
  onSearchChange,
  onSortModelChange,
  onFilterModelChange,
  onRowClick,
  onRefresh,
  onSelectionModelChange,
  selectionModel,
  toolbarActions,
  bulkActions,
  exportFileName = 'export',
  checkboxSelection,
  pageSizeOptions = [10, 20, 50, 100],
  minHeight = 420,
}: DataTableProps<T>) {
  const { t } = useApp();
  const apiRef = useGridApiRef();
  const [columnsAnchor, setColumnsAnchor] = useState<null | HTMLElement>(null);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [density, setDensity] = useState<'compact' | 'standard' | 'comfortable'>('compact');

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenColumns.has(String(c.field))),
    [columns, hiddenColumns],
  );

  const handleExport = () => {
    const allColumns = columns.map((c) => ({ field: String(c.field), headerName: String(c.headerName ?? c.field) }));
    const allRows = gridFilteredSortedRowIdsSelector(apiRef)
      .map((id) => (rows as { id: number }[]).find((r) => r.id === id))
      .filter(Boolean) as Record<string, unknown>[];
    downloadBlob(rowsToCsv(allRows, allColumns), `${exportFileName}.csv`);
  };

  const toggleColumn = (field: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  return (
    <Paper variant="outlined" sx={{ width: '100%', minHeight }}>
      <Toolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
        {onSearchChange && (
          <TextField
            size="small"
            placeholder={t('common.search')}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} /> }}
            sx={{ minWidth: 220 }}
          />
        )}
        <Box sx={{ flexGrow: 1 }} />
        {toolbarActions}
        <Tooltip title={t('common.refresh')}>
          <IconButton onClick={onRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('common.csv')}>
          <IconButton onClick={handleExport}>
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('common.print')}>
          <IconButton onClick={() => window.print()}>
            <PrintIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Columns">
          <IconButton onClick={(e) => setColumnsAnchor(e.currentTarget)}>
            <ViewColumnIcon />
          </IconButton>
        </Tooltip>
        <Menu anchorEl={columnsAnchor} open={Boolean(columnsAnchor)} onClose={() => setColumnsAnchor(null)}>
          {columns.map((col) => (
            <MenuItem key={String(col.field)} onClick={() => toggleColumn(String(col.field))}>
              {hiddenColumns.has(String(col.field)) ? '☐ ' : '☑ '}
              {String(col.headerName ?? col.field)}
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
      <Box sx={{ display: 'flex', gap: 1, px: 2, pb: 1, alignItems: 'center' }}>
        {bulkActions}
        <Typography variant="caption" color="text.secondary">
          {rowCount !== undefined ? `${rowCount} ${t('common.filtered')}` : `${rows.length} rows`}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          size="small"
          color="inherit"
          onClick={() => setDensity((d) => (d === 'compact' ? 'standard' : d === 'standard' ? 'comfortable' : 'compact'))}
        >
          Density
        </Button>
      </Box>
      <DataGrid
        apiRef={apiRef}
        columns={visibleColumns as GridColDef<any>[]}
        rows={rows as any[]}
        loading={loading}
        rowCount={rowCount ?? rows.length}
        paginationMode={onPageChange ? 'server' : 'client'}
        pageSizeOptions={pageSizeOptions}
        paginationModel={{ page: Math.max(0, page - 1), pageSize }}
        onPaginationModelChange={(model: GridPaginationModel) => {
          onPageChange?.(model.page + 1);
          onPageSizeChange?.(model.pageSize);
        }}
        sortingMode={onSortModelChange ? 'server' : 'client'}
        onSortModelChange={onSortModelChange}
        filterMode={onFilterModelChange ? 'server' : 'client'}
        onFilterModelChange={onFilterModelChange}
        checkboxSelection={checkboxSelection}
        onRowSelectionModelChange={onSelectionModelChange}
        rowSelectionModel={selectionModel}
        onRowClick={onRowClick ? (params) => onRowClick(params.row as T) : undefined}
        density={density}
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-columnHeaders': { position: 'sticky', top: 0, zIndex: 1 },
          '& .MuiDataGrid-main': { minHeight: 380 },
        }}
      />
    </Paper>
  );
}
