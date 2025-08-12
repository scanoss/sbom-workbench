import { useContext, useState } from 'react';

import { exportService } from '@api/services/export.service';
import { ExportFormat, ExportSource, ExportStatusCode, InventoryType, ProjectSource } from '@api/types';
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
import { DialogContext, IDialogContext } from '@context/DialogProvider';

export const ExportButton = ({ empty }) => {
  const { pathname } = useLocation();
  const { path: projectPath, name, projectSource } = useSelector(selectWorkbench);

  const { t } = useTranslation();

  const source: ExportSource = pathname.startsWith('/workbench/report/scan/detected')
    ? ExportSource.DETECTED
    : ExportSource.IDENTIFIED;

  const exportLabels = {
    WFP: {
      label: 'WFP',
      hint: t('Tooltip:ExportHintWFP'),
      sources: [ExportSource.DETECTED],
      disable: projectSource === ProjectSource.IMPORT_SCAN_RESULTS,
    },
    RAW: {
      label: 'RAW',
      hint: t('Tooltip:ExportHintRAW'),
      sources: [ExportSource.DETECTED],
      disable: false,
    },
    CSV: {
      label: 'CSV',
      hint: t('Tooltip:ExportHintCSV'),
      sources: [ExportSource.DETECTED, ExportSource.IDENTIFIED],
      disable: false,
      childrens: [
        {
          label: 'SBOM',
          hint: t('Tooltip:ExportHintCSVSBOM'),
          sources: [ExportSource.DETECTED, ExportSource.IDENTIFIED],
          type: InventoryType.SBOM,
          disable: false,
        },
        {
          label: 'Cryptography',
          hint: t('Tooltip:ExportHintCSVCryptography'),
          sources: [ExportSource.DETECTED, ExportSource.IDENTIFIED],
          type: InventoryType.CRYPTOGRAPHY,
          disable: false,
        },
        {
          label: 'Vulnerability',
          hint: t('Tooltip:ExportCSVVulnerability'),
          sources: [ExportSource.DETECTED, ExportSource.IDENTIFIED],
          type: InventoryType.VULNERABILITY,
          disable: false,
        },
      ],
    },
    BOM: {
      label: 'BOM',
      hint: t('Tooltip:ExportHintBOM'),
      sources: [ExportSource.DETECTED, ExportSource.IDENTIFIED],
      disable: false,
      childrens: [
        {
          label: 'CycloneDX',
          hint: t('Tooltip:ExportHintCycloneDX'),
          sources: [ExportSource.DETECTED, ExportSource.IDENTIFIED],
          disable: false,
          type: InventoryType.CYLONEDX,
        },
        {
          label: 'CycloneDX with vulnerabilities',
          hint: t('Tooltip:ExportHintCycloneDXVulnerabilities'),
          sources: [ExportSource.DETECTED, ExportSource.IDENTIFIED],
          disable: false,
          type: InventoryType.CYCLONEDX_WITH_VULNERABILITIES,
        },
        {
          label: 'SPDX Lite',
          hint: t('Tooltip:ExportHintSPDXLite'),
          sources: [ExportSource.DETECTED, ExportSource.IDENTIFIED],
          disable: false,
          type: InventoryType.SPDXLITE,
        },
      ],
    },
    HTMLSUMMARY: {
      label: 'HTML Summary',
      hint: t('Tooltip:ExportHintHTML'),
      sources: [ExportSource.DETECTED, ExportSource.IDENTIFIED],
      disable: false,
    },
    SETTINGS: {
      label: 'Settings',
      hint: t('Tooltip:ExportHintSettings'),
      sources: [ExportSource.IDENTIFIED],
      fileName: 'settings',
      disable: false,
    },
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [subMenuOpened, setSubMenuOpened] = useState<string>(null);
  const dialogCtrl = useContext(DialogContext) as IDialogContext;

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

  const getDefaultPath = (attributes: Record<string,any>, inventoryType: InventoryType ) => {
    const dirname = localStorage.getItem('last-path-used') || projectPath;
    const prefix = attributes.prefix ? `-${attributes.prefix}-` : '-';
    const defaultFileName = attributes.defaultFileName ? `-${attributes.defaultFileName}-` : '';
    const inventoryTypeStr = inventoryType ? `${inventoryType.toLowerCase()}-` : '';

    return `${dirname}/${name}${prefix}${defaultFileName}${inventoryTypeStr}${source.toLowerCase()}`;
  }

  const exportFile = async (format: ExportFormat, inventoryType: InventoryType) => {
    const attributes = getFormatFilesAttributes(format);
    const path = await dialogController.showSaveDialog({
      defaultPath: getDefaultPath(attributes,inventoryType),
      filters: [{ name: attributes.description, extensions: [attributes.extension] }],
    });

    if (path) {
      localStorage.setItem('last-path-used', window.path.dirname(path));
      const response = await exportService.export({ path, format, source, inventoryType });
      if (response.statusCode !== ExportStatusCode.SUCCESS && response.info.invalidPurls.length > 0) {
        await dialogCtrl.openReportDialog(response.info.invalidPurls);
      }
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
              (format) =>
                exportLabels[format] &&
                !exportLabels[format].disable &&
                exportLabels[format].sources.includes(source) && (
                  <CustomMenuItem format={format} item={exportLabels[format]} />
                )
            )}
          </Menu>
        </>
      )}
    </div>
  );
};
