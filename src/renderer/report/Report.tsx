import React, { useContext, useEffect, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useHistory } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { Card } from '@material-ui/core';
import LicensesChart from './components/LicensesChart';
import { AppContext, IAppContext } from '../context/AppProvider';
import { report } from '../../api/report-service';

Chart.register(...registerables);

const LICENSES_DATA = [
  { label: 'MIT', value: 15 },
  { label: 'Apache 2.0', value: 7 },
  { label: 'GNU (General Public License)', value: 5 },
  { label: 'Mozilla Public License', value: 3 },
  { label: 'Eclipse Public License', value: 2 },
];

const PROGRESS_DATA = { identified: 4312, pending: 15749 };

const Report = () => {
  const history = useHistory();
  const { scanBasePath } = useContext(AppContext) as IAppContext;

  const [progress, setProgress] = useState<any>(null);
  const [licenses, setLicenses] = useState<any[]>([]);

  const init = async () => {
    const a = await report.getLicensesUsage();
    console.log (a);
    setProgress(PROGRESS_DATA);
    setLicenses(a.data);
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
            <Card className="report-item">
              <LicensesChart data={licenses} />
            </Card>
            <Card className="report-item">Match licenses</Card>
          </section>
        </main>
      </section>
    </>
  );
};

export default Report;
export { LICENSES_DATA };
