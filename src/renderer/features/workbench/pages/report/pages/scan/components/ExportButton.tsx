import react, { useState } from 'react';

import { exportService } from '@api/services/export.service';
import { ExportSource, ExportFormat } from '@api/types';
import AppConfig from '@config/AppConfigModule';
import { getFormatFilesAttributes } from '@shared/utils/file-utils';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dialogController } from 'renderer/controllers/dialog-controller';
import { Button, Fade, Menu, MenuItem, Tooltip } from '@mui/material';

import GetAppIcon from '@mui/icons-material/GetApp';

export const ExportButton = ({ empty }) => {
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
      {!AppConfig.FF_EXPORT_FORMAT_OPTIONS
        || (AppConfig.FF_EXPORT_FORMAT_OPTIONS.length === 0 && (
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
          {t('Button:ExportWithLabel', { label: exportLabels[AppConfig.FF_EXPORT_FORMAT_OPTIONS[0]].label })}
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
              (format) => exportLabels[format]
                && exportLabels[format].sources.includes(source) && (
                  <Tooltip key={format} title={exportLabels[format].hint} placement="left" arrow>
                    <MenuItem onClick={() => onExport(format as ExportFormat)}>{exportLabels[format].label}</MenuItem>
                  </Tooltip>
              ),
            )}
          </Menu>
        </>
      )}
    </div>
  );
};
