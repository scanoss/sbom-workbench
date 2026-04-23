import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { StageReport, StageReportEntry, StageReportSeverity } from '@api/types';

const SEVERITY = {
  error:   { order: 0, color: '#b60303', prefix: 'Error:',   countKey: 'Dialog:NErrors' },
  warning: { order: 1, color: '#B45309', prefix: 'Warning:', countKey: 'Dialog:NWarnings' },
  info:    { order: 2, color: '#1E6FD9', prefix: 'Info:',    countKey: 'Dialog:NInfo' },
} as const;

const SEVERITY_KEYS: StageReportSeverity[] = ['error', 'warning', 'info'];
const EMPTY_COUNTS: Record<StageReportSeverity, number> = { error: 0, warning: 0, info: 0 };

interface ScanReportDialogProps {
  open: boolean;
  onClose: () => void;
  reports: StageReport[];
}

const severityOf = (entry: StageReportEntry): StageReportSeverity => entry.severity ?? 'error';

const dominantSeverity = (entries: StageReportEntry[]): StageReportSeverity => {
  if (entries.some((e) => severityOf(e) === 'error')) return 'error';
  if (entries.some((e) => severityOf(e) === 'warning')) return 'warning';
  return 'info';
};

const ReportEntryRow: React.FC<{ entry: StageReportEntry }> = ({ entry }) => {
  const { color, prefix } = SEVERITY[severityOf(entry)];

  return (
    <Box
      sx={{
        mb: 1,
        pl: 1,
        borderLeft: '3px solid',
        borderColor: color,
        fontSize: 12,
        lineHeight: 1.4,
      }}
    >
      <Box>
        <Typography component="span" sx={{ color, mr: 0.5, fontSize: 12, fontWeight: 600 }}>
          {prefix}
        </Typography>
        <Typography component="span" sx={{ fontSize: 12 }}>
          {entry.message}
        </Typography>
      </Box>
      <Typography
        sx={{
          fontFamily: 'monospace',
          fontSize: 11,
          color: 'text.secondary',
          wordBreak: 'break-all',
          mt: 0.25,
        }}
      >
        {entry.item}
      </Typography>
    </Box>
  );
};

const StageListItem: React.FC<{
  report: StageReport;
  active: boolean;
  onClick: () => void;
}> = ({ report, active, onClick }) => {
  const severity = dominantSeverity(report.entries);
  const { color } = SEVERITY[severity];

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 0.75,
        pl: 1,
        pr: 1.5,
        cursor: 'pointer',
        borderLeft: '3px solid',
        borderColor: active ? color : 'transparent',
        backgroundColor: active ? 'action.selected' : 'transparent',
        '&:hover': { backgroundColor: active ? 'action.selected' : 'action.hover' },
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: active ? 600 : 500,
          flex: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {report.title}
      </Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>
        {report.entries.length}
      </Typography>
    </Box>
  );
};

const ScanReportDialog: React.FC<ScanReportDialogProps> = ({ open, onClose, reports }) => {
  const { t } = useTranslation();

  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    if (!open) return;
    // Smart-default: jump to first stage with errors; else first stage.
    const firstErrorIdx = reports.findIndex((r) => r.entries.some((e) => severityOf(e) === 'error'));
    setSelectedIdx(firstErrorIdx >= 0 ? firstErrorIdx : 0);
  }, [open, reports]);

  const totals = useMemo(
    () =>
      reports.reduce<Record<StageReportSeverity, number>>((acc, r) => {
        r.entries.forEach((e) => { acc[severityOf(e)] += 1; });
        return acc;
      }, { ...EMPTY_COUNTS }),
    [reports],
  );

  const nonEmptyTotals = SEVERITY_KEYS.filter((k) => totals[k] > 0);

  const selectedReport = reports[selectedIdx];
  const sortedEntries = useMemo(
    () =>
      selectedReport
        ? [...selectedReport.entries].sort(
            (a, b) => SEVERITY[severityOf(a)].order - SEVERITY[severityOf(b)].order,
          )
        : [],
    [selectedReport],
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography component="span" sx={{ fontWeight: 600, fontSize: 16 }}>
            {t('Dialog:ScanSummary')}
          </Typography>
          {nonEmptyTotals.length > 0 && (
            <Typography component="span" sx={{ color: '#9E9E9E', fontSize: 12 }}>|</Typography>
          )}
          {nonEmptyTotals.map((key, i) => (
            <React.Fragment key={key}>
              {i > 0 && <Typography component="span" sx={{ color: '#9E9E9E', fontSize: 12 }}>·</Typography>}
              <Typography component="span" sx={{ fontSize: 12, color: SEVERITY[key].color, fontWeight: 600 }}>
                {t(SEVERITY[key].countKey, { count: totals[key] })}
              </Typography>
            </React.Fragment>
          ))}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', p: 0, height: '60vh', borderTop: '1px solid', borderColor: 'divider' }}>
        <Box
          sx={{
            width: 260,
            flexShrink: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
            overflowY: 'auto',
            py: 0.5,
          }}
        >
          {reports.map((r, i) => (
            <StageListItem key={i} report={r} active={i === selectedIdx} onClick={() => setSelectedIdx(i)} />
          ))}
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1.5 }}>
          {selectedReport && (
            <>
              <Typography sx={{ fontWeight: 600, fontSize: 15, mb: 1 }}>
                {selectedReport.title}
              </Typography>
              {sortedEntries.map((entry, i) => (
                <ReportEntryRow key={i} entry={entry} />
              ))}
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t('Button:OK')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScanReportDialog;
