import React, { useContext, useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { Card } from '@material-ui/core';
import LicensesChart from '../components/LicensesChart';
import IdentificationProgress from '../components/IdentificationProgress';
import LicensesTable from '../components/LicensesTable';
import MatchesForLicense from '../components/MatchesForLicense';
import { report } from '../../../../../../api/report-service';
import MatchesChart from '../components/MatchesChart';
import VulnerabilitiesCard from '../components/VulnerabilitiesCard';
import LicensesObligations from '../components/LicensesObligations';

Chart.register(...registerables);

const DetectedReport = () => {
  const [progress, setProgress] = useState<any>(null);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [crypto, setCrypto] = useState<any[]>([]);
  const [vulnerabilites, setVulnerabilites] = useState<any[]>([]);
  const [licensesTable, setLicensesTable] = useState<any[]>([]);
  const [matchedLicenseSelected, setMatchedLicenseSelected] = useState<string>(null);

  const init = async () => {
    const { data } = await report.getSummary();
    setProgress(data?.summary);
    setLicenses(data?.licenses);
    setVulnerabilites(data?.vulnerabilities);
    setLicensesTable(data?.licenses);
  };

  const onLicenseSelected = (license: string) => {
    const matchedLicense = licenses.find((item) => item?.label === license);
    setMatchedLicenseSelected(matchedLicense);
  };

  useEffect(init, []);

  return (
    <>
      <section className="report-layout detected">

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
    </>
  );
};

export default DetectedReport;
