import React, { useContext, useEffect, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useHistory } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { Button, Card, Fab, Tooltip } from '@material-ui/core';
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

Chart.register(...registerables);

const Report = () => {
  const history = useHistory();
  const { scanBasePath } = useContext(AppContext) as IAppContext;

  const [progress, setProgress] = useState<any>(null);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [crypto, setCrypto] = useState<any[]>([]);
  const [matchedLicenseSelected, setMatchedLicenseSelected] = useState<string>(null);

  const init = async () => {
    const a = await report.getSummary();
    setProgress(a.data.summary);
    setLicenses(a.data.licenses);
  };

  const onLicenseSelected = (license: string) => {
    const matchedLicense = licenses.find((item) => item?.label === license);
    setMatchedLicenseSelected(matchedLicense);
  };

  const onDownloadClickedExport = async () => {
    const spdxPath = dialogController.showOpenDialog({ properties: ['openDirectory'] });
    if (spdxPath) {
      await ExportFormat.spdx(spdxPath);
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
          <Button startIcon={<GetAppIcon />} variant="contained" color="primary" onClick={onDownloadClickedExport}>
            Download
          </Button>
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
            </Card>

            <Card className="report-item vulnerabilites">
              <div className="report-title">Vulnerabilites</div>
            </Card>

            <Card className="report-item licenses-obligation">
              <div className="report-title">License obligations</div>
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
