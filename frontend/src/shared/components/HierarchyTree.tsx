import { Box, Collapse, Chip, Typography, IconButton } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ChevronRight as ExpandLessIcon } from '@mui/icons-material';
import { useState, type ReactNode } from 'react';

export interface HierarchyNode {
  id: string;
  label: string;
  secondary?: string;
  chipColor?: string;
  chipLabel?: string;
  icon?: ReactNode;
  onClick?: () => void;
  children?: HierarchyNode[];
}

interface HierarchyTreeProps {
  root: HierarchyNode;
}

type ChipColor = 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

export function HierarchyTree({ root }: HierarchyTreeProps) {
  return (
    <Box sx={{ '& ul': { listStyle: 'none', m: 0, p: 0 } }}>
      <TreeNode node={root} depth={0} />
    </Box>
  );
}

function TreeNode({ node, depth }: { node: HierarchyNode; depth: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const chipColor = (node.chipColor as ChipColor) ?? 'default';

  return (
    <Box component="li" sx={{ marginInlineStart: depth ? `${depth * 18}px` : 0 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 0.75,
          px: 1,
          borderRadius: 1,
          cursor: node.onClick ? 'pointer' : 'default',
          '&:hover': { bgcolor: 'action.hover' },
        }}
        onClick={(e) => {
          if (node.onClick) {
            e.stopPropagation();
            node.onClick();
          }
        }}
      >
        {hasChildren ? (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            aria-label={expanded ? 'collapse' : 'expand'}
            sx={{ p: 0.25 }}
          >
            {expanded ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
          </IconButton>
        ) : (
          <Box sx={{ width: 24 }} />
        )}
        {node.icon}
        {node.chipLabel && (
          <Chip
            size="small"
            label={node.chipLabel}
            color={chipColor}
            variant="outlined"
            sx={{ fontSize: '0.72rem', fontWeight: 600 }}
          />
        )}
        <Typography variant="body2" sx={{ flexGrow: 1 }}>
          {node.label}
        </Typography>
        {node.secondary && (
          <Typography variant="caption" color="text.secondary">
            {node.secondary}
          </Typography>
        )}
      </Box>
      {hasChildren && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box component="ul" sx={{ borderInlineStart: '1px dashed', borderColor: 'divider', ml: 1.75, pl: 1 }}>
            {node.children!.map((child) => (
              <TreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}