import {
  Button,
  Divider,
  Fade,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';

import React, { useContext, useEffect, useState } from 'react';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import InsertChartOutlinedTwoToneIcon from '@mui/icons-material/InsertChartOutlinedTwoTone';
import GavelIcon from '@mui/icons-material/Gavel';
import SearchIcon from '@mui/icons-material/Search';

// eslint-disable-next-line import/no-named-default
import { default as MaterialAppBar } from '@mui/material/AppBar';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import GetAppIcon from '@mui/icons-material/GetApp';
import { useSelector } from 'react-redux';
import { exportService } from '@api/services/export.service';
import { ExportFormat, ExportSource, IProject } from '@api/types';
import { workspaceService } from '@api/services/workspace.service';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import { dialogController } from '../../../../controllers/dialog-controller';
import AppConfig from '../../../../../config/AppConfigModule';

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <section id="Navigation">
      <IconButton onClick={() => navigate(-1)} size="large">
        <ArrowBackIcon />
      </IconButton>
      <IconButton onClick={() => navigate(1)} size="large">
        <ArrowForwardIcon />
      </IconButton>
    </section>
  );
};

const AppMenu = () => {
  return (
    <section id="AppMenu">
      <NavLink
        to="/workbench/detected"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        tabIndex={-1}
      >
        <Tooltip title="Detected components" enterDelay={650}>
          <Button color="inherit">
            <GavelIcon />
          </Button>
        </Tooltip>
      </NavLink>
      <NavLink
        to="/workbench/search"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        tabIndex={-1}
      >
        <Tooltip title="Search keywords" enterDelay={650}>
          <Button color="inherit">
            <SearchIcon />
          </Button>
        </Tooltip>
      </NavLink>
      <NavLink
        to="/workbench/identified"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        tabIndex={-1}
      >
        <Tooltip title="Identified components" enterDelay={650}>
          <Button color="inherit">
            <CheckCircleOutlineOutlinedIcon />
          </Button>
        </Tooltip>
      </NavLink>
      <NavLink
        to="/workbench/report"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        tabIndex={-1}
      >
        <Tooltip title="Reports" enterDelay={650}>
          <Button color="inherit">
            <InsertChartOutlinedTwoToneIcon />
          </Button>
        </Tooltip>
      </NavLink>
    </section>
  );
};

const AppProgress = ({ summary, progress }) => {
  return (
    <section id="AppProgress">
      <Tooltip
        arrow
        title={
          <div id="ProgressTooltip">
            <header>
              <Typography className="title d-flex space-between">
                <span>Detected files</span>
                <span>{summary?.summary.matchFiles}</span>
              </Typography>
              <hr />
            </header>

            <section className="d-flex space-between mt-1">
              <div className="mr-4">
                <Typography className="has-status-bullet pending">{summary?.pending}</Typography>
                <p className="m-0">PENDING</p>
              </div>

              <div className="mr-3">
                <Typography className="has-status-bullet identified">{summary?.identified.scan}</Typography>
                <p className="m-0">IDENTIFIED</p>
              </div>

              <div>
                <Typography className="has-status-bullet ignored">{summary?.original}</Typography>
                <p className="m-0">ORIGINAL</p>
              </div>
            </section>
          </div>
        }
      >
        <div className="progress-container ">
          <p>{Math.trunc(progress)}%</p>
          <LinearProgress color="secondary" className="progress" variant="determinate" value={Math.trunc(progress)} />
        </div>
      </Tooltip>
    </section>
  );
};

const AppTitle = ({ title }) => {
  const curLoc = useLocation();
  const [section, setSection] = useState('');

  const max = 15;

  // FIXME: create app.routes.ts and set data for each route
  const routes = [
    { path: '/workbench/detected/file', title: 'Matches' },
    { path: '/workbench/detected', title: 'Detected components' },
    { path: '/workbench/identified', title: 'Identified components' },
    { path: '/workbench/report', title: 'Reports' },
  ];

  useEffect(() => {
    const curTitle = routes.find((item) => curLoc.pathname.startsWith(item.path));
    if (curTitle && curTitle.title) {
      setSection(curTitle.title);
    }
  }, [curLoc]);

  return (
    <section id="AppTitle">
      {title && (
        <>
          <span>
            {title.length > max ? (
              <>
                <Tooltip title={title}>
                  <span>{title.substring(0, max - 3)}...</span>
                </Tooltip>
              </>
            ) : (
              title
            )}
          </span>
        </>
      )}
      <ChevronRightOutlinedIcon fontSize="small" />
      <Typography variant="h6" className="title-main">
        {section}
      </Typography>
    </section>
  );
};

const Export = ({ state }) => {
  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const exportLabels = {
    CSV: { label: 'CSV', showNoProgress: false, hint: 'Export Comma Separate Value identification report' },
    SPDXLITEJSON: { label: 'SPDX Lite', showOnNoneProgress: false, hint: 'Export an SPDX compliant SBOM report' },
    WFP: { label: 'WFP', showNoProgress: true, hint: 'Export the Winnowing Fingerprint data of the scanned project' },
    RAW: { label: 'RAW', showNoProgress: true, hint: 'Export the raw JSON responses from the SCANOSS Platform' },
    HTMLSUMMARY: {
      label: 'HTML Summary',
      showNoProgress: true,
      hint: 'Export a HTML summary of the Identification report',
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
    if (state.progress === 0 && !exportLabels[format].showNoProgress) {
      await dialogCtrl.openAlertDialog(
        'Warning: you need to accept the results before export in order to confirm the scanner output. '
      );
    }

    await exportFile(format);
    handleClose();
  };

  const exportFile = async (format: ExportFormat) => {
    const data: IProject = await workspaceService.getProjectDTO();
    const path = await dialogController.showSaveDialog({
      defaultPath: `${data.work_root}/${data.name}`,
    });
    if (path) {
      await exportService.export({ path, format, source: ExportSource.IDENTIFIED });
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
            Export
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
          disabled={state.progress === 0 && !exportLabels[AppConfig.FF_EXPORT_FORMAT_OPTIONS[0]].showNoProgress}
        >
          Export {exportLabels[AppConfig.FF_EXPORT_FORMAT_OPTIONS[0]].label}
        </Button>
      )}

      {AppConfig.FF_EXPORT_FORMAT_OPTIONS && AppConfig.FF_EXPORT_FORMAT_OPTIONS.length > 1 && (
        <>
          <Button
            startIcon={<GetAppIcon />}
            aria-controls="customized-menu"
            aria-haspopup="true"
            variant="contained"
            color="primary"
            onClick={onExportClicked}
          >
            Export
          </Button>
          <Menu anchorEl={anchorEl} keepMounted open={open} onClose={handleClose} TransitionComponent={Fade}>
            {AppConfig.FF_EXPORT_FORMAT_OPTIONS.map(
              (format) =>
                exportLabels[format] && (
                  <Tooltip key={format} title={exportLabels[format].hint} placement="left" arrow>
                    <MenuItem
                      /* disabled={state.progress === 0 && !exportLabels[format].showNoProgress} */
                      onClick={() => onExport(format as ExportFormat)}
                    >
                      {exportLabels[format].label}
                    </MenuItem>
                  </Tooltip>
                )
            )}
          </Menu>
        </>
      )}
    </div>
  );
};

const AppBar = ({ exp }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const state = useSelector(selectWorkbench);
  const report = pathname.startsWith('/workbench/report');

  const onBackPressed = () => {
    navigate('/workspace');
  };

  return (
    <>
      <MaterialAppBar id="AppBar" elevation={1}>
        <Toolbar>
          <div className="slot start">
            <Tooltip title="Back to projects">
              <IconButton onClick={onBackPressed} edge="start" color="inherit" aria-label="menu" size="large">
                <HomeOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem />
            <Navigation />
            <Divider orientation="vertical" flexItem />
            <AppMenu />
          </div>

          <AppTitle title={state.name} />

          <div className="slot end">
            {!report ? <AppProgress summary={state.summary} progress={state.progress} /> : <Export state={state} />}
          </div>
        </Toolbar>
      </MaterialAppBar>
    </>
  );
};

AppBar.defaultProps = { exp: false };

export default AppBar;
