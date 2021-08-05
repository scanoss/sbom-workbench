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

Chart.register(...registerables);

const LICENSES_DATA = [
  { label: 'MIT', value: 15 },
  { label: 'Apache 2.0', value: 7 },
  { label: 'GNU (General Public License)', value: 5 },
  { label: 'Mozilla Public License', value: 3 },
  { label: 'Eclipse Public License', value: 2 },
  { label: 'Apache 2.0', value: 7 },
  { label: 'GNU (General Public License)', value: 5 },
  { label: 'Mozilla Public License', value: 3 },
  { label: 'Eclipse Public License', value: 2 },
];

const BAR_DATA = [{ label: '90%', value: 15 }];

const PROGRESS_DATA = { identified: 10, pending: 15 };

const Report = () => {
  const history = useHistory();
  const { scanBasePath } = useContext(AppContext) as IAppContext;

  const [summary, setSummary] = useState<any>(null);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [crypto, setCrypto] = useState<any[]>([]);

  const init = () => {
    setProgress(PROGRESS_DATA);
    setLicenses(LICENSES_DATA);
  };


  const init = async () => {
    const a = await report.getSummary();
    setLicenses(a.data.licenses);
    setCrypto(a.data.crypto);
    setSummary(a.data.summary);
    console.log(a);
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
                  <LicensesChart data={LICENSES_DATA} />
                  <LicensesTable data={LICENSES_DATA} />
                </div>
              </div>
            </Card>
            <Card className="report-item matches-for-license">
              <MatchesForLicense />
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

