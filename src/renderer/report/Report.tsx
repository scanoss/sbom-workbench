import React, { useContext, useEffect, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useHistory } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { Chart, registerables } from 'chart.js';
import {
  Button,
  Card,
  Fab,
  Fade,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuProps,
  Tooltip,
} from '@material-ui/core';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import GetAppIcon from '@material-ui/icons/GetApp';
import LicensesChart from './components/LicensesChart';
import IdentificationProgress from './components/IdentificationProgress';
import { AppContext, IAppContext } from '../context/AppProvider';
import LicensesTable from './components/LicensesTable';
import MatchesForLicense from './components/MatchesForLicense';
import { report } from '../../api/report-service';
import { dialogController } from '../dialog-controller';
import { ExportFormat } from '../../api/export-service';
import MatchesChart from './components/MatchesChart';
import VulnerabilitiesCard from './components/VulnerabilitiesCard';
import LicensesObligations from './components/LicensesObligations';
import { projectService } from '../../api/project-service';

Chart.register(...registerables);

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
})((props: MenuProps) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    '&:focus': {
      backgroundColor: theme.palette.primary.main,
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white,
      },
    },
  },
}))(MenuItem);

const Report = () => {
  const history = useHistory();
  const { scanBasePath } = useContext(AppContext) as IAppContext;

  const [progress, setProgress] = useState<any>(null);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [crypto, setCrypto] = useState<any[]>([]);
  const [vulnerabilites, setVulnerabilites] = useState<any[]>([]);
  // use state for licenses table
  const [licensesTable, setLicensesTable] = useState<any[]>([]);
  const [matchedLicenseSelected, setMatchedLicenseSelected] = useState<string>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const SPDX = 'spdx';
  const CSV = 'csv';
  const RAW = 'json';
  const WFP = 'wfp';

  const init = async () => {
    const a = await report.getSummary();
    setProgress(a?.data?.summary);
    setLicenses(a?.data?.licenses);
    setVulnerabilites(a?.data?.vulnerabilities);
    setLicensesTable(a?.data?.licenses);
    console.log(a?.data);
  };

  const onLicenseSelected = (license: string) => {
    const matchedLicense = licenses.find((item) => item?.label === license);
    setMatchedLicenseSelected(matchedLicense);
  };

  const onExportClicked = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onCsvClickedExport = async () => {
    await exportFile({ extension: CSV, export: CSV });
    handleClose();
  };

  const onSpdxClickedExport = async () => {
    await exportFile({ extension: SPDX, export: SPDX });
    handleClose();
  };

  const onWfpClickedExport = async () => {
    await exportFile({ extension: 'wfp', export: WFP });
    handleClose();
  };


  const onRawClickedExport = async () => {
    await exportFile({ extension: 'json', export: RAW });
    handleClose();
  };

  const exportFile = async (data) => {
    const defpath = await projectService.workspacePath();
    const projectName = await projectService.getProjectName();
    const path = dialogController.showSaveDialog({
      defaultPath: `${defpath.data}/${projectName.data}/${projectName.data}.${data.extension}`,
    });
    if (path && path !== undefined) {
      if (data.export === SPDX) await ExportFormat.spdx(path);
      else if (data.export === CSV) await ExportFormat.csv(path);
      else if (data.export === RAW) await ExportFormat.raw(path);
      else if (data.export === WFP) await ExportFormat.wfp(path);
    }
  };

  useEffect(init, []);

  return (
    <>
      <section id="Report" className="app-page">
        <header className="app-header">
          {/* <h2 className="header-subtitle back">
            <IconButton onClick={() => history.push('/workbench')} component="span">
              <ArrowBackIcon />
            </IconButton>
            Reports
          </h2> */}
          <h3>REPORTS</h3>
          <div>
            <Button startIcon={<GetAppIcon />} variant="contained" color="primary" onClick={onExportClicked}>
              Export
            </Button>
            <Menu
              id="fade-menu"
              anchorEl={anchorEl}
              keepMounted
              open={open}
              onClose={handleClose}
              TransitionComponent={Fade}
            >
              <MenuItem onClick={onSpdxClickedExport}>SPDX</MenuItem>
              <MenuItem onClick={onCsvClickedExport}>CSV</MenuItem>
              <MenuItem onClick={onWfpClickedExport}>WFP</MenuItem>
              <MenuItem onClick={onRawClickedExport}>RAW</MenuItem>

            </Menu>
          </div>
        </header>

        <main className="app-content">
          <section className="report-layout">
            <Card className="report-item identification-progress">
              <div className="report-title">Identification Progress</div>
              {progress && <IdentificationProgress data={progress} />}
            </Card>

            <Card className="report-item licenses">
              <div className="report-title">Licenses</div>
              <div className="report-second">
                <LicensesChart data={licenses} />
                <LicensesTable
                  matchedLicenseSelected={matchedLicenseSelected || licenses?.[0]}
                  selectLicense={(license) => onLicenseSelected(license)}
                  data={licenses}
                />
              </div>
            </Card>

            <Card className="report-item matches-for-license">
              <div className="report-title">Matches for license</div>
              <MatchesForLicense data={matchedLicenseSelected || licenses?.[0]} />
            </Card>

            <Card className="report-item matches">
              <div className="report-title">Matches</div>
              {progress && <MatchesChart data={progress} />}
            </Card>

            <Card className="report-item vulnerabilites">
              <div className="report-title">Vulnerabilites</div>
              <VulnerabilitiesCard data={vulnerabilites} />
            </Card>

            <Card className="report-item licenses-obligation">
              <LicensesObligations data={licensesTable} />
            </Card>
          </section>
        </main>
      </section>

      <Tooltip title="Identifications">
        <Fab className="btn-export" onClick={() => history.push('/workbench')}>
          <DescriptionOutlinedIcon />
        </Fab>
      </Tooltip>
    </>
  );
};

export default Report;
