import React, { useContext, useEffect, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useHistory } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { Card } from '@material-ui/core';
import LicensesChart from './components/LicensesChart';
import CryptoChart from './components/CryptoChart';
import ProgressChart from './components/ProgressChart';
import { AppContext, IAppContext } from '../context/AppProvider';
import { report } from '../../api/report-service';

Chart.register(...registerables);


const Report = () => {
  const history = useHistory();
  const { scanBasePath } = useContext(AppContext) as IAppContext;

  const [summary, setSummary] = useState<any>(null);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [crypto, setCrypto] = useState<any[]>([]);


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
            <Card className="report-item">
              <LicensesChart data={licenses} />
            </Card>
            <Card className="report-item">
              <CryptoChart data={crypto} />
            </Card>
            <Card className="report-item">
              <ProgressChart progress={summary} />
            </Card>
          </section>
        </main>
      </section>
    </>
  );
};

export default Report;

