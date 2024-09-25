import react, { useState } from 'react';

import { exportService } from '@api/services/export.service';
import { ExportSource, ExportFormat, InventoryType } from '@api/types';
import AppConfig from '@config/AppConfigModule';
import { getFormatFilesAttributes } from '@shared/utils/file-utils';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { dialogController } from 'renderer/controllers/dialog-controller';
import { Button, Collapse, Fade, List, Menu, MenuItem, Tooltip } from '@mui/material';

import GetAppIcon from '@mui/icons-material/GetApp';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

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
      childrens: [
        {
          label: 'SBOM',
          hint: t('Tooltip:ExportHintCSVSBOM'),
          sources: [ExportSource.DETECTED, ExportSource.IDENTIFIED],
          type: InventoryType.SBOM,
        },
        {
          label: 'Cryptography',
          hint: t('Tooltip:ExportHintCSVCryptography'),
          sources: [ExportSource.DETECTED, ExportSource.IDENTIFIED],
          type: InventoryType.CRYPTOGRAPHY,
        },
      ],
    },
    CYCLONEDX: {
      label: 'Cyclone DX',
      hint: t('Tooltip:ExportHintCycloneDX'),
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
      sources: [ExportSource.DETECTED, ExportSource.IDENTIFIED],
    },
    SCANOSS_JSON: {
      label: 'SCANOSS json',
      hint: t('Tooltip:ExportHintSCANOSSJSON'),
      sources: [ExportSource.IDENTIFIED],
      fileName: 'scanoss',
    },

  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [subMenuOpened, setSubMenuOpened] = useState<string>(null);

  const onExportClicked = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onExport = async (format: ExportFormat, inventoryType: InventoryType = null) => {
    await exportFile(format, inventoryType);
    handleClose();
  };

  const exportFile = async (format: ExportFormat, inventoryType: InventoryType) => {
    const dirname = localStorage.getItem('last-path-used') || projectPath;
    const attributes = getFormatFilesAttributes(format);
    const path = await dialogController.showSaveDialog({
      defaultPath: `${dirname}/${name}${attributes.prefix ? `-${attributes.prefix}` : ''}${attributes.defaultFileName ? `-${attributes.defaultFileName}` : ''}.${attributes.extension}`,
      filters: [{ name: attributes.description, extensions: [attributes.extension] }],
    });

    if (path) {
      localStorage.setItem('last-path-used', window.path.dirname(path));
      await exportService.export({ path, format, source, inventoryType });
    }
  };

  const CustomMenuItem = ({ format, item, depth = 1 }) => {
    const onClickHandler = (e) => {
      if (!item.childrens) {
        onExport(format as ExportFormat, item.type);
      } else {
        setSubMenuOpened(subMenuOpened === format ? null : format);
      }
    };

    return (
      <>
        <Tooltip key={item.label} title={item.hint} placement="left" arrow>
          <MenuItem onClick={onClickHandler} sx={{ pl: 1 + depth }} className="d-flex space-between">
            <span>{item.label}</span>
            {item.childrens && (subMenuOpened === format ? <ExpandLess /> : <ExpandMore />)}
          </MenuItem>
        </Tooltip>
        {item.childrens && (
        <Collapse in={subMenuOpened === format} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.childrens.map((children) => (
              <CustomMenuItem format={format} item={children} depth={depth + 1} />
            ))}
          </List>
        </Collapse>
        )}
      </>
    );
  };

  return (
    <div id="ExportButton">
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
                <CustomMenuItem format={format} item={exportLabels[format]} />
              ),
            )}
          </Menu>
        </>
      )}
    </div>
  );
};
