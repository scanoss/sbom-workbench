import React, { useContext, useEffect, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useHistory } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { Chart, registerables } from 'chart.js';
import {
  Button,
  Card,
  Fade,
  Menu,
  MenuItem,
  MenuProps,
  Tooltip,
} from '@material-ui/core';
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
import AppBar from '../workbench/components/AppBar/AppBar';

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
  const [licensesTable, setLicensesTable] = useState<any[]>([]);
  const [matchedLicenseSelected, setMatchedLicenseSelected] = useState<string>(null);

  const init = async () => {
    const a = await report.getSummary();
    setProgress(a?.data?.summary);
    setLicenses(a?.data?.licenses);
    setVulnerabilites(a?.data?.vulnerabilities);
    setLicensesTable(a?.data?.licenses);
    console.log(a?.data.summary);
  };

  const onLicenseSelected = (license: string) => {
    const matchedLicense = licenses.find((item) => item?.label === license);
    setMatchedLicenseSelected(matchedLicense);
  };

  useEffect(init, []);

  return (
    <>
      <AppBar exp />
      <section id="Report" className="app-page">
        <main className="app-content">
          <section className="report-layout">
            <Card className="report-item identification-progress">
              <div className="report-title">Identification Progress</div>
              {progress && <IdentificationProgress data={progress} />}
            </Card>

            <Card className="report-item licenses">
              <div className="report-title">Licenses</div>
              <div id="report-second">
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
    </>
  );
};

export default Report;
