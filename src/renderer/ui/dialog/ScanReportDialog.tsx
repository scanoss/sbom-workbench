import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';

interface StageReport {
  title: string;
  severity?: 'error' | 'info';
  entries: {
    item: string;
    message: string;
  }[];
}

interface ScanReportDialogProps {
  open: boolean;
  onClose: () => void;
  reports: StageReport[];
}

const ScanReportDialog: React.FC<ScanReportDialogProps> = ({ open, onClose, reports }) => {
  const { t } = useTranslation();
  const totalEntries = reports.reduce((acc, r) => acc + r.entries.length, 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography component="span" sx={{ fontWeight: 600, fontSize: 16 }}>
            {t('Dialog:Warnings')}
          </Typography>
          <Typography component="span" sx={{ color: '#9E9E9E', fontSize: 12 }}>|</Typography>
          <Typography component="span" color="primary" sx={{ fontSize: 12 }}>
            {totalEntries} {t('Dialog:WarningsFound')}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
          {reports.map((r, idx) => (
            <Accordion
              key={idx}
              defaultExpanded
              disableGutters
              sx={{
                backgroundColor: 'transparent',
                boxShadow: 'none',
                '&:before': { display: 'none' },
                '&.Mui-expanded': { margin: 0 },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#9E9E9E' }} />}
                sx={{
                  minHeight: 'unset',
                  padding: 0,
                  borderBottom: '1px solid #424242',
                  '& .MuiAccordionSummary-content': { margin: '4px 0' },
                  '&.Mui-expanded': { minHeight: 'unset' },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {r.title}{' '}
                  <Typography component="span" sx={{ fontWeight: 400, fontSize: 11 }}>
                    ({r.entries.length})
                  </Typography>
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0, pl: 1, pt: 0.5, maxHeight: 200, overflowY: 'auto' }}>
                {r.entries.map((entry, entryIdx) => (
                  <Box key={entryIdx} sx={{ mb: 1, fontSize: 12, lineHeight: 1.4 }}>
                    {r.severity === 'info' ? (
                      <>
                        <Typography
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: 12,
                            wordBreak: 'break-all',
                          }}
                        >
                          {entry.item}
                        </Typography>
                        <Typography
                          sx={{
                            pl: 1,
                            ml: 0.25,
                            mt: 0.25,
                            borderLeft: '2px solid',
                            borderColor: 'divider',
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            color: 'text.secondary',
                          }}
                        >
                          {entry.message}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: 'inherit',
                            wordBreak: 'break-all',
                          }}
                        >
                          {entry.item}
                        </Typography>
                        <Box sx={{ pl: 0.5 }}>
                          <Typography
                            component="span"
                            sx={{ color: '#b60303', mr: 0.5, fontSize: 12, fontWeight: 600 }}
                          >
                            Error:
                          </Typography>
                          <Typography component="span" sx={{ fontSize: 12 }}>
                            {entry.message}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t('Button:OK')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScanReportDialog;
