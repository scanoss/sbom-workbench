import {
  Toolbar,
  IconButton,
  Typography,
  Button,
  LinearProgress,
  Divider,
  Tooltip,
  Fade,
  Menu,
  MenuItem,
  withStyles,
  styled,
  Box,
} from '@material-ui/core';

import React, { useContext, useEffect, useState } from 'react';
import HomeOutlinedIcon from '@material-ui/icons/HomeOutlined';
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import InsertChartOutlinedTwoToneIcon from '@material-ui/icons/InsertChartOutlinedTwoTone';
import GavelIcon from '@material-ui/icons/Gavel';
// eslint-disable-next-line import/no-named-default
import { default as MaterialAppBar } from '@material-ui/core/AppBar';
import { NavLink, useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined';
import GetAppIcon from '@material-ui/icons/GetApp';
import { reset } from '../../actions';
import { WorkbenchContext, IWorkbenchContext } from '../../store';
import { ExportFormat } from '../../../../../api/export-service';
import { projectService } from '../../../../../api/project-service';
import { dialogController } from '../../../../dialog-controller';
import { FormatVersion, IProject } from '../../../../../api/types';
import { workspace } from '../../../../../main/workspace/Workspace';
import { workspaceService } from '../../../../../api/workspace-service';

const Navigation = () => {
  const history = useHistory();

  return (
    <section id="Navigation">
      <IconButton onClick={() => history.goBack()}>
        <ArrowBackIcon />
      </IconButton>
      <IconButton onClick={() => history.goForward()}>
        <ArrowForwardIcon />
      </IconButton>
    </section>
  );
};

const AppMenu = () => {
  const history = useHistory();

  return (
    <section id="AppMenu">
      <NavLink to="/workbench/detected" activeClassName="active" tabIndex={-1}>
        <Tooltip title="Detected components">
          <Button color="inherit">
            <GavelIcon />
          </Button>
        </Tooltip>
      </NavLink>
      <NavLink to="/workbench/identified" activeClassName="active" tabIndex={-1}>
        <Tooltip title="Identified components">
          <Button color="inherit">
            <CheckCircleOutlineOutlinedIcon />
          </Button>
        </Tooltip>
      </NavLink>
      <NavLink to="/workbench/report" activeClassName="active" tabIndex={-1}>
        <Tooltip title="Reports">
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
                <span>{summary?.detectedFiles}</span>
              </Typography>
              <hr />
            </header>

            <section className="d-flex space-between mt-1">
              <div className="mr-4">
                <Typography className="has-status-bullet pending">{summary?.pendingFiles}</Typography>
                <p className="m-0">PENDING</p>
              </div>

              <div className="mr-3">
                <Typography className="has-status-bullet identified">{summary?.identifiedFiles}</Typography>
                <p className="m-0">IDENTIFIED</p>
              </div>

              <div>
                <Typography className="has-status-bullet ignored">{summary?.ignoredFiles}</Typography>
                <p className="m-0">IGNORED</p>
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const onExportClicked = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onExport = async (format: FormatVersion) => {
    await exportFile(format);
    handleClose();
  };

  const exportFile = async (format: FormatVersion) => {
    const data: IProject = await workspaceService.getProjectDTO();
    const path = dialogController.showSaveDialog({
      defaultPath: `${data.work_root}/${data.name}`,
    });
    if (path && path !== undefined) {
      await ExportFormat.export(path, format);
    }
  };

  return (
    <div>
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
      <Menu
        style={{ marginTop: '35px' }}
        id="fade-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        <MenuItem disabled={state.progress === 0} onClick={() => onExport(FormatVersion.CSV)}>
          CSV
        </MenuItem>
        {/* <MenuItem disabled={state.progress === 0} onClick={() => onExport(FormatVersion.SPDX20)}>
          SPDX 2.0
        </MenuItem> */}
        {/* <MenuItem disabled={state.progress === 0} onClick={() => onExport(FormatVersion.SPDXLITE)}>
          SPDX Lite
        </MenuItem> */}
        <MenuItem disabled={state.progress === 0} onClick={() => onExport(FormatVersion.SPDXLITEJSON)}>
          SPDX Lite
        </MenuItem>
        <MenuItem onClick={() => onExport(FormatVersion.WFP)}>WFP</MenuItem>
        <MenuItem onClick={() => onExport(FormatVersion.RAW)}>RAW</MenuItem>
      </Menu>
    </div>
  );
};

const AppBar = ({ exp }) => {
  const history = useHistory();
  const { pathname } = useLocation();
  const { state, dispatch } = useContext(WorkbenchContext) as IWorkbenchContext;
  const report = pathname.startsWith('/workbench/report');

  const onBackPressed = () => {
    dispatch(reset());
    history.push('/workspace');
  };

  return (
    <>
      <MaterialAppBar id="AppBar" elevation={1}>
        <Toolbar>
          <div className="slot start">
            <Tooltip title="Back to projects">
              <IconButton onClick={onBackPressed} edge="start" color="inherit" aria-label="menu">
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
