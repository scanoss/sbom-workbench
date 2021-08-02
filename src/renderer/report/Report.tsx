import React, { useContext, useEffect, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { AppContext, IAppContext } from '../context/AppProvider';
import { useHistory } from 'react-router-dom';
import { Chart, registerables } from 'chart.js'
import LicensesChart from './components/LicensesChart';
Chart.register(...registerables);

const LICENSES_DATA = [
  {label: 'MIT', value: 15},
  {label: 'Apache 2.0', value: 7},
  {label: 'GNU (General Public License)', value: 5},
  {label: 'Mozilla Public License', value: 3},
  {label: 'Eclipse Public License', value: 2},
];

const PROGRESS_DATA = { identified: 4312, pending: 15749 };

const Report = () => {
  const history = useHistory();
  const { scanBasePath } = useContext(AppContext) as IAppContext;

  const [progress, setProgress] = useState<any>(null);
  const [licenses, setLicenses] = useState<any[]>([]);

  const init = () => {
    setProgress(PROGRESS_DATA);
    setLicenses(LICENSES_DATA);
  }

  useEffect( init, []);

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
          <section className='report-layout'>
            <div className="report-item">
              <LicensesChart
                data={licenses}
              />
            </div>
          </section>

        </main>
      </section>
    </>
  );
}

export default Report;
