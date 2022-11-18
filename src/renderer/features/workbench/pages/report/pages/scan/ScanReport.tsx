import React, { useEffect, useState } from 'react';
import { Button, createStyles, Fade, Menu, MenuItem, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { reportService } from '@api/services/report.service';
import { useSelector } from 'react-redux';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { ExportFormat, ExportSource, IProject } from '@api/types';
import { exportService } from '@api/services/export.service';
import AppConfig from '@config/AppConfigModule';
import GetAppIcon from '@mui/icons-material/GetApp';
import { getFormatFilesAttributes } from '@shared/utils/file-utils';
import { useTranslation } from 'react-i18next';
import { dialogController } from '../../../../../../controllers/dialog-controller';
import IdentifiedReport from './IdentifiedReport';
import DetectedReport from './DetectedReport';
import VulnerabilitiesReport from '../vulnerabilities/VulnerabilitiesReport';

const useStyles = makeStyles({
  tooltip: {
    textAlign: 'center',
    fontSize: '.75rem',
    maxWidth: 140,
  },
});

const Nav = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <section className="nav">
      <NavLink to="detected" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} tabIndex={-1}>
        <Tooltip
          title={t('Tooltip:SBOMDetectedHelp')}
          classes={{ tooltip: classes.tooltip }}
        >
          <Button size="large">{t('Button:Detected')}</Button>
        </Tooltip>
      </NavLink>
      <NavLink to="identified" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} tabIndex={-1}>
        <Tooltip
          title={t('Tooltip:SBOMIdentifiedHelp')}
          classes={{ tooltip: classes.tooltip }}
        >
          <Button size="large">{t('Button:Identified')}</Button>
        </Tooltip>
      </NavLink>
    </section>
  );
};

const Export = ({ empty }) => {
  const { pathname } = useLocation();
  const { path: projectPath, name } = useSelector(selectWorkbench);
  const { t } = useTranslation();

  const source: ExportSource = pathname.startsWith('/workbench/report/scan/detected')
    ? ExportSource.DETECTED
    : ExportSource.IDENTIFIED;

  const exportLabels = {
    WFP: {
      label: 'WFP',
      hint: t('Tooltip:ExportHintWFP'),
      sources: [ExportSource.DETECTED],
    },
    RAW: {
      label: 'RAW',
      hint: t('Tooltip:ExportHintRAW'),
      sources: [ExportSource.DETECTED],
    },
    CSV: {
      label: 'CSV',
      hint: t('Tooltip:ExportHintCSV'),
      sources: [ExportSource.DETECTED, ExportSource.IDENTIFIED],
    },
    SPDXLITEJSON: {
      label: 'SPDX Lite',
      hint: t('Tooltip:ExportHintSPDXLite'),
      sources: [ExportSource.DETECTED, ExportSource.IDENTIFIED],
    },
    HTMLSUMMARY: {
      label: 'HTML Summary',
      hint: t('Tooltip:ExportHintHTML'),
      sources: [ExportSource.IDENTIFIED],
    },
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const onExportClicked = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onExport = async (format: ExportFormat) => {
    await exportFile(format);
    handleClose();
  };

  const exportFile = async (format: ExportFormat) => {
    const dirname = localStorage.getItem('last-path-used') || projectPath;
    const attributes = getFormatFilesAttributes(format);
    const path = await dialogController.showSaveDialog({
      defaultPath: `${dirname}/${name}${attributes.prefix ? `-${attributes.prefix}` : ''}.${attributes.extension}`,
      filters: [{ name: attributes.description, extensions: [attributes.extension] }],
    });

    if (path) {
      localStorage.setItem('last-path-used', window.path.dirname(path));
      await exportService.export({ path, format, source });
    }
  };

  return (
    <div>
      {!AppConfig.FF_EXPORT_FORMAT_OPTIONS ||
        (AppConfig.FF_EXPORT_FORMAT_OPTIONS.length === 0 && (
          <Button
            startIcon={<GetAppIcon />}
            aria-controls="customized-menu"
            aria-haspopup="true"
            variant="contained"
            color="primary"
            disabled
          >
            {t('Button:Export')}
          </Button>
        ))}

      {AppConfig.FF_EXPORT_FORMAT_OPTIONS && AppConfig.FF_EXPORT_FORMAT_OPTIONS.length === 1 && (
        <Button
          startIcon={<GetAppIcon />}
          aria-controls="customized-menu"
          aria-haspopup="true"
          variant="contained"
          color="primary"
          onClick={() => onExport(AppConfig.FF_EXPORT_FORMAT_OPTIONS[0] as ExportFormat)}
          disabled={!exportLabels[AppConfig.FF_EXPORT_FORMAT_OPTIONS[0]].sources.includes(source)}
        >
          {t('Button:ExportWithLabel', { label: exportLabels[AppConfig.FF_EXPORT_FORMAT_OPTIONS[0]].label})}
        </Button>
      )}

      {AppConfig.FF_EXPORT_FORMAT_OPTIONS && AppConfig.FF_EXPORT_FORMAT_OPTIONS.length > 1 && (
        <>
          <Button
            startIcon={<GetAppIcon />}
            disabled={empty && source === ExportSource.IDENTIFIED}
            aria-controls="customized-menu"
            aria-haspopup="true"
            variant="contained"
            color="primary"
            onClick={onExportClicked}
          >
            {t('Button:Export')}
          </Button>
          <Menu anchorEl={anchorEl} keepMounted open={open} onClose={handleClose} TransitionComponent={Fade}>
            {AppConfig.FF_EXPORT_FORMAT_OPTIONS.map(
              (format) =>
                exportLabels[format] &&
                exportLabels[format].sources.includes(source) && (
                  <Tooltip key={format} title={exportLabels[format].hint} placement="left" arrow>
                    <MenuItem onClick={() => onExport(format as ExportFormat)}>{exportLabels[format].label}</MenuItem>
                  </Tooltip>
                )
            )}
          </Menu>
        </>
      )}
    </div>
  );
};

const ScanReport = () => {
  const navigate = useNavigate();
  const state = useSelector(selectWorkbench);

  const [detectedData, setDetectedData] = useState(null);
  const [identifiedData, setIdentifiedData] = useState(null);

  const isEmpty =
    identifiedData?.summary.identified.scan === 0 &&
    identifiedData?.summary.original === 0 &&
    identifiedData?.licenses.length === 0;

  const setTab = (identified) => {
    if (state.tree.hasIdentified || state.tree.hasIgnored || identified.licenses.length > 0) {
      navigate('identified', { replace: true });
    }
  };

  useEffect(() => {
    const init = async () => {
      const summary = await reportService.getSummary();
      const detected = await reportService.detected();
      const identified = await reportService.identified();
      setDetectedData({ ...detected, summary });
      setIdentifiedData({ ...identified, summary });
      setTab(identified);
    };
    init();
  }, []);

  return (
    <>
      <section id="Report" className="app-page">
        <header className="app-header d-flex space-between align-center">
          <Nav />
          <Export empty={isEmpty} />
        </header>
        <main className="app-content">
          <Routes>
            <Route path="detected" element={detectedData && <DetectedReport data={detectedData} />} />
            <Route path="identified" element={identifiedData && <IdentifiedReport data={identifiedData} />} />
            <Route path="" element={<Navigate to="detected" />} />
          </Routes>
        </main>
      </section>
    </>
  );
};

export default ScanReport;
