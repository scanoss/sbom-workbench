import React, { useState, useEffect } from 'react';
import ClearIcon from '@material-ui/icons/Clear';
import { Button, Card, IconButton } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import MatchesChart from '../../../../report/components/MatchesChart';
import VulnerabilitiesCard from '../../../../report/components/VulnerabilitiesCard';
import LicensesChart from '../../../../report/components/LicensesChart';
import LicensesTable from '../../../../report/components/LicensesTable';
import { report } from '../../../../../api/report-service';

const ScanResults = ({ show }) => {
  const history = useHistory();
  const [licenses, setLicenses] = useState<any[]>([]);
  const [vulnerabilites, setVulnerabilites] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);

  const init = async () => {
    const a = await report.getSummary();
    setProgress(a?.data?.summary);
    setLicenses(a?.data?.licenses);
    setVulnerabilites(a?.data?.vulnerabilities);
    console.log(a?.data);
  };

  useEffect(init, []);

  return (
    <section className="scan-results-home">
      <div className="div-scan-title">
        <h1 className="header-title">Scan Results</h1>
      </div>
      <div className="div-charts-home">
        <Card id="licenses" className="report-item licenses">
          <div className="report-title-home">LICENSES</div>
          <div id="report-second">
            <LicensesChart data={licenses} />
            <LicensesTable
              matchedLicenseSelected={null}
              selectLicense={(license) => console.log(license)}
              data={licenses}
            />
          </div>
        </Card>
        <Card className="report-item matches">
          <div className="report-title-home">MATCHES</div>
          {progress && <MatchesChart data={progress} />}
        </Card>
        <Card className="report-item vulnerabilites">
          <div className="report-title-home">VULNERABILITIES</div>
          <VulnerabilitiesCard data={vulnerabilites} />
        </Card>
      </div>
      <Button style={{ marginTop: '2vh' }} variant="outlined" color="primary" onClick={() => history.push('/report')}>
        More Details{' '}
      </Button>
      <IconButton style={{ marginTop: '1vh' }} onClick={() => show()} component="span">
        <ClearIcon />
      </IconButton>
    </section>
  );
};

export default ScanResults;
