import React, { useContext, useEffect, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useHistory } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { Card } from '@material-ui/core';
import LicensesChart from './components/LicensesChart';
import IdentificationProgress from './components/IdentificationProgress';
import { AppContext, IAppContext } from '../context/AppProvider';
import LicensesTable from './components/LicensesTable';
import MatchesForLicense from './components/MatchesForLicense';
import { report } from '../../api/report-service';
import MatchesForLicenseTable from './components/MatchesForLicense';

Chart.register(...registerables);

const Report = () => {
  const history = useHistory();
  const { scanBasePath } = useContext(AppContext) as IAppContext;

  const [progress, setProgress] = useState<any>(null);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [crypto, setCrypto] = useState<any[]>([]);
  const [licenseSelected, setLicenseSelected] = useState<string>();

  const init = async () => {
    const a = await report.getSummary();
    console.log(a);
    setProgress(a.data.summary);
    setLicenses(a.data.licenses);
    console.log(a);
  };

  const onLicenseSelected = (license: string) => {
    console.log(license);
    const matchedLicense = licenses.find(({item}) => item?.label === licenseSelected);
    setLicenseSelected(matchedLicense);
  };

  useEffect(init, []);

  return (
    <>
      <section id="Report" className="app-page">
        <header className="app-header">
          <div>
            <h2 className="header-subtitle back">
              <IconButton onClick={() => history.push('/workbench')} component="span">
                <ArrowBackIcon />
              </IconButton>
              Reports
            </h2>
          </div>
        </header>

        <main className="app-content">
          <section className="report-layout">
            <Card className="report-item identification-progress">
              {progress && <IdentificationProgress data={progress} />}
            </Card>
            <Card className="report-item licenses">
              <div className="b">
                <div className="report-titles-container">
                  <span className="report-titles">Licenses</span>
                </div>
                <div className="report-second">
                  <LicensesChart data={licenses} />
                  <LicensesTable selectLicense={(license) => onLicenseSelected(license)} data={licenses} />
                </div>
              </div>
            </Card>
            <Card className="report-item matches-for-license">
              <div className="report-titles-container">
                <span className="report-titles">Matches for license</span>
              </div>
              <MatchesForLicense data={licenseSelected} />
            </Card>
            <Card className="report-item matches">
              <div className="d">d</div>
            </Card>
            <Card className="report-item vulnerabilites">
              <div className="e">e</div>
            </Card>
            <Card className="report-item licenses-obligation">
              <div className="e">f</div>
            </Card>
          </section>
        </main>
      </section>
    </>
  );
};

export default Report;
