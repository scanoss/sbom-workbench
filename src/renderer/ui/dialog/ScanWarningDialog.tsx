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

interface StageWarning {
  title: string;
  errors: {
    item: string;
    message: string;
  }[];
}

interface ScanWarningDialogProps {
  open: boolean;
  onClose: () => void;
  warnings: StageWarning[];
}

const ScanWarningDialog: React.FC<ScanWarningDialogProps> = ({ open, onClose, warnings }) => {
  const { t } = useTranslation();
  const totalErrors = warnings.reduce((acc, w) => acc + w.errors.length, 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography component="span" sx={{ fontWeight: 600, fontSize: 16 }}>
            {t('Dialog:Warnings')}
          </Typography>
          <Typography component="span" sx={{ color: '#9E9E9E', fontSize: 12 }}>|</Typography>
          <Typography component="span" color="primary" sx={{ fontSize: 12 }}>
            {totalErrors} {t('Dialog:WarningsFound')}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
          {warnings.map((w, idx) => (
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
                  {w.title}{' '}
                  <Typography component="span" sx={{ fontWeight: 400, fontSize: 11 }}>
                    ({w.errors.length})
                  </Typography>
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0, pl: 1, pt: 0.5, maxHeight: 200, overflowY: 'auto' }}>
                {w.errors.map((err, errIdx) => (
                  <Box key={errIdx} sx={{ mb: 0.5, fontSize: 12, lineHeight: 1.4 }}>
                    <Typography
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: 'inherit',
                        wordBreak: 'break-all',
                      }}
                    >
                      {err.item}
                    </Typography>
                    <Typography sx={{ mt: -0.5,  pl:0.5 }}>
                      <Typography
                        component="span"
                        sx={{ color: '#b60303', mr: 0.5, fontSize: 12, fontWeight: 600 }}
                      >
                        Error:
                      </Typography>
                      <Typography component="span" sx={{ fontSize: 12 }}>
                        {err.message}
                      </Typography>
                    </Typography>
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

export default ScanWarningDialog;
