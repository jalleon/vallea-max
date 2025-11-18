'use client';

import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { Box, IconButton, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

interface AppraisalLayoutContextType {
  sidebarOpen: boolean;
  previewOpen: boolean;
  toggleSidebar: () => void;
  togglePreview: () => void;
  setSidebarOpen: (open: boolean) => void;
  setPreviewOpen: (open: boolean) => void;
}

const AppraisalLayoutContext = createContext<AppraisalLayoutContextType>({
  sidebarOpen: true,
  previewOpen: true,
  toggleSidebar: () => {},
  togglePreview: () => {},
  setSidebarOpen: () => {},
  setPreviewOpen: () => {},
});

export const useAppraisalLayout = () => useContext(AppraisalLayoutContext);

interface AppraisalLayoutProps {
  sidebar: ReactNode;
  content: ReactNode;
  preview: ReactNode;
  appraisalId?: string;
}

export default function AppraisalLayout({
  sidebar,
  content,
  preview,
  appraisalId
}: AppraisalLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Load saved preferences from localStorage
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    if (isMobile) return false; // Always closed on mobile
    const saved = localStorage.getItem('appraisal-sidebar-open');
    return saved ? JSON.parse(saved) : true;
  });

  const [previewOpen, setPreviewOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    if (isMobile || isTablet) return false; // Closed on mobile/tablet
    const saved = localStorage.getItem('appraisal-preview-open');
    return saved ? JSON.parse(saved) : true;
  });

  // Preview panel resizable width
  const [previewWidth, setPreviewWidth] = useState(() => {
    if (typeof window === 'undefined') return 400;
    const saved = localStorage.getItem('appraisal-preview-width');
    return saved ? parseInt(saved, 10) : 400;
  });

  const [isResizing, setIsResizing] = useState(false);

  // Save preferences to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('appraisal-sidebar-open', JSON.stringify(sidebarOpen));
    }
  }, [sidebarOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('appraisal-preview-open', JSON.stringify(previewOpen));
    }
  }, [previewOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('appraisal-preview-width', String(previewWidth));
    }
  }, [previewWidth]);

  // Auto-close panels on mobile/tablet
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      setPreviewOpen(false);
    } else if (isTablet) {
      setPreviewOpen(false);
    }
  }, [isMobile, isTablet]);

  const toggleSidebar = () => setSidebarOpen((prev: boolean) => !prev);
  const togglePreview = () => setPreviewOpen((prev: boolean) => !prev);

  // Handle preview panel resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      // Calculate the new width based on distance from right edge of window
      const distanceFromRight = window.innerWidth - e.clientX;

      // Constrain between 300px and 800px
      const constrainedWidth = Math.max(300, Math.min(800, distanceFromRight));
      setPreviewWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B - Toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      // Cmd/Ctrl + P - Toggle preview
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        togglePreview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const contextValue: AppraisalLayoutContextType = {
    sidebarOpen,
    previewOpen,
    toggleSidebar,
    togglePreview,
    setSidebarOpen,
    setPreviewOpen,
  };

  return (
    <AppraisalLayoutContext.Provider value={contextValue}>
      <Box
        sx={{
          display: 'flex',
          height: 'calc(100vh - 64px)', // Subtract header height
          overflow: 'hidden',
          position: 'relative',
          bgcolor: 'background.default'
        }}
      >
        {/* Sidebar - Sections Navigation */}
        {sidebarOpen && (
          <Box
            sx={{
              width: isMobile ? '100%' : 280,
              minWidth: isMobile ? '100%' : 280,
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: isMobile ? 'absolute' : 'relative',
              zIndex: isMobile ? 1200 : 1,
              height: '100%',
              transition: 'width 0.3s ease',
            }}
          >
            {sidebar}
            {/* Toggle button for sidebar (mobile) */}
            {isMobile && (
              <IconButton
                onClick={toggleSidebar}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                size="small"
              >
                <ChevronLeft fontSize="small" />
              </IconButton>
            )}
          </Box>
        )}

        {/* Main Content Area */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0, // Prevent flex item from overflowing
          }}
        >
          {/* Toolbar - Toggle buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              p: 1,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            {!sidebarOpen && (
              <Tooltip title="Show Sidebar (Ctrl+B)" placement="bottom">
                <IconButton
                  onClick={toggleSidebar}
                  size="small"
                  sx={{
                    borderRadius: '8px',
                    border: 1,
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ChevronRight fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {sidebarOpen && !isMobile && (
              <Tooltip title="Hide Sidebar (Ctrl+B)" placement="bottom">
                <IconButton
                  onClick={toggleSidebar}
                  size="small"
                  sx={{
                    borderRadius: '8px',
                    border: 1,
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ChevronLeft fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {!previewOpen && !isMobile && (
              <Tooltip title="Show Preview (Ctrl+P)" placement="bottom">
                <IconButton
                  onClick={togglePreview}
                  size="small"
                  sx={{
                    borderRadius: '8px',
                    border: 1,
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {previewOpen && !isMobile && (
              <Tooltip title="Hide Preview (Ctrl+P)" placement="bottom">
                <IconButton
                  onClick={togglePreview}
                  size="small"
                  sx={{
                    borderRadius: '8px',
                    border: 1,
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <VisibilityOff fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Main content */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
            {content}
          </Box>
        </Box>

        {/* Preview Panel */}
        {previewOpen && !isMobile && (
          <Box
            sx={{
              width: isTablet ? 320 : previewWidth,
              minWidth: isTablet ? 320 : 300,
              maxWidth: isTablet ? 320 : 800,
              borderLeft: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              transition: isResizing ? 'none' : 'width 0.3s ease',
            }}
          >
            {/* Resize Handle */}
            {!isTablet && (
              <Box
                onMouseDown={handleMouseDown}
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 6,
                  cursor: 'ew-resize',
                  bgcolor: 'transparent',
                  zIndex: 10,
                  '&:hover': {
                    bgcolor: 'primary.main',
                    opacity: 0.5,
                  },
                  '&:active': {
                    bgcolor: 'primary.main',
                    opacity: 0.8,
                  },
                  transition: 'background-color 0.2s ease',
                }}
              />
            )}
            {preview}
          </Box>
        )}

        {/* Backdrop for mobile sidebar */}
        {isMobile && sidebarOpen && (
          <Box
            onClick={toggleSidebar}
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1100,
            }}
          />
        )}
      </Box>
    </AppraisalLayoutContext.Provider>
  );
}
