import {
  Button,
  Divider,
  IconButton,
  LinearProgress,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';

import { useEffect, useState } from 'react';
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
import { useSelector } from 'react-redux';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { useTranslation } from 'react-i18next';

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
  const { wfp } = useSelector(selectWorkbench);
  const { t } = useTranslation();

  return (
    <section id="AppMenu">
      <NavLink
        to="/workbench/detected"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        tabIndex={-1}
      >
        <Tooltip title={t('Tooltip:DetectedComponents')} enterDelay={650}>
          <Button color="inherit">
            <GavelIcon />
          </Button>
        </Tooltip>
      </NavLink>

      <NavLink
        to="/workbench/search"
        className={({ isActive }) => `nav-link ${wfp ? 'disabled' : ''} ${isActive ? 'active' : ''}`}
        tabIndex={-1}
      >
        <Tooltip title={t('Tooltip:SearchKeywords')} enterDelay={650}>
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
        <Tooltip title={t('Tooltip:IdentifiedComponents')} enterDelay={650}>
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
        <Tooltip title={t('Tooltip:Reports')} enterDelay={650}>
          <Button color="inherit">
            <InsertChartOutlinedTwoToneIcon />
          </Button>
        </Tooltip>
      </NavLink>
    </section>
  );
};

const AppProgress = ({ summary, progress }) => {
  const { t } = useTranslation();

  return (
    <section id="AppProgress">
      <Tooltip
        arrow
        title={
          <div id="ProgressTooltip">
            <header>
              <Typography className="title d-flex space-between">
                <span>{t('Tooltip:TotalFiles')}</span>
                <span>{summary?.summary.totalFiles}</span>
              </Typography>
              <hr />
              <Typography className="subtitle d-flex space-between">
                <span>{t('Tooltip:Detected')}</span>
                <span>{summary?.summary.matchFiles}</span>
              </Typography>

              <Typography className="subtitle d-flex space-between">
                <span>{t('Tooltip:NotDetected')}</span>
                <span>{summary?.summary.noMatchFiles}</span>
              </Typography>

              <Typography className="subtitle d-flex space-between">
                <span>{t('Tooltip:Ignored')}</span>
                <span>{summary?.summary.filterFiles}</span>
              </Typography>
            </header>

            <header>
              <Typography className="title d-flex space-between mt-4">
                <span>{t('Tooltip:Progress')}</span>
                <span>{summary?.identified.scan + summary?.original}/{summary?.summary.matchFiles} ({Math.trunc(progress)}%)</span>
              </Typography>
              <hr />
            </header>

            <section className="d-flex space-between mx-1 ml-1 mr-1 mb-1">
              <div className="mr-4">
                <Typography className="has-status-bullet pending">{summary?.pending}</Typography>
                <p className="m-0 text-uppercase">{t('Title:Pending')}</p>
              </div>

              <div className="mr-3">
                <Typography className="has-status-bullet identified">{summary?.identified.scan}</Typography>
                <p className="m-0 text-uppercase">{t('Title:Identified')}</p>
              </div>

              <div>
                <Typography className="has-status-bullet ignored">{summary?.original}</Typography>
                <p className="m-0 text-uppercase">{t('Title:Originals')}</p>
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
  const { t } = useTranslation();

  const max = 15;

  // FIXME: create app.routes.ts and set data for each route
  const routes = [
    { path: '/workbench/detected/file', title: t('Title:Matches') },
    { path: '/workbench/detected', title: t('Title:DetectedComponents') },
    { path: '/workbench/identified', title: t('Title:IdentifiedComponents') },
    { path: '/workbench/report', title: t('Title:Reports') },
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

const AppBar = ({ exp }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const state = useSelector(selectWorkbench);

  const onBackPressed = () =>  navigate('/workspace');

  return (
    <>
      <MaterialAppBar id="AppBar" elevation={1}>
        <Toolbar>
          <div className="slot start">
            <Tooltip title={t('Tooltip:BackToProjects')}>
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
            <AppProgress summary={state.summary} progress={state.progress} />
          </div>
        </Toolbar>
      </MaterialAppBar>
    </>
  );
};

AppBar.defaultProps = { exp: false };

export default AppBar;
