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

const AppProgress = ({ progress }) => {
  return (
    <section id="AppProgress">
      <p>{progress}%</p>
      <LinearProgress color="secondary" className="progress" variant="determinate" value={progress} />
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

const Notarize = () => {
  const dialogCtrl = useContext<any>(DialogContext);
  const notarizeSBOM = async () => {
    const hash = await ExportFormat.notarizeSBOM(HashType.SHA256);
    shell.openExternal(`https://sbom.info/?Hash=${hash}&type=${HashType.SHA256}&token=gato`);
  };

  return (
    <div className="notarize-container">
      <Button
        variant="contained"
        color="secondary"
        startIcon={<PublishSharpIcon />}
        type="button"
        onClick={notarizeSBOM}
      >
        Post to SBOM ledger
      </Button>
    </div>
  );
};

const Export = ({ progress }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const SPDX = 'spdx';
  const CSV = 'csv';
  const RAW = 'json';
  const WFP = 'wfp';

  const onExportClicked = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onExport = async (extension, state?) => {
    await exportFile({ extension, export: extension, state });
    handleClose();
  };

  const exportFile = async (data) => {
    const defpath = await projectService.workspacePath();
    const projectName = await projectService.getProjectName();
    const path = dialogController.showSaveDialog({
      defaultPath: `${defpath.data}/${projectName.data}/${projectName.data}.${data.extension}`,
    });
    if (path && path !== undefined) {
      if (data.export === SPDX) await ExportFormat.spdx(path, data.state);
      else if (data.export === CSV) await ExportFormat.csv(path);
      else if (data.export === RAW) await ExportFormat.raw(path);
      else if (data.export === WFP) await ExportFormat.wfp(path);
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
        
        <MenuItem disabled={progress < 100} onClick={() => onExport(CSV)}>
          CSV
        </MenuItem>
        <MenuItem disabled={progress === 0} onClick={() => onExport(SPDX, progress < 100)}>
          SPDX
        </MenuItem>
        <MenuItem onClick={() => onExport(WFP)}>WFP</MenuItem>
        <MenuItem onClick={() => onExport(RAW)}>RAW</MenuItem>
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
    history.push('/');
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
            {!report ? <AppProgress progress={state.progress} /> : <Export progress={state.progress} />}
          </div>
        </Toolbar>
      </MaterialAppBar>
    </>
  );
};

AppBar.defaultProps = { exp: false };

export default AppBar;
