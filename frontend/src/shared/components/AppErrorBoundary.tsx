import { Component, type ReactNode } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useApp } from '../../core/contexts/AppContext';

export class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <Box sx={{ display: 'grid', placeItems: 'center', height: '100vh', p: 3 }}>
          <Box textAlign="center">
            <Typography variant="h4" color="error" gutterBottom>
              خطای غیرمنتظره
            </Typography>
            <Typography color="text.secondary" mb={2}>
              {this.state.error.message}
            </Typography>
            <Button variant="contained" onClick={() => window.location.reload()}>
              بارگذاری مجدد
            </Button>
          </Box>
        </Box>
      );
    }
    return this.props.children;
  }
}