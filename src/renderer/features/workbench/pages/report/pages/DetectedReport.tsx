import React, { useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { Card } from '@mui/material';
import LicensesChart from '../components/LicensesChart';
import LicensesTable from '../components/LicensesTable';
import MatchesForLicense from '../components/MatchesForLicense';
import MatchesChart from '../components/MatchesChart';
import LicensesObligations from '../components/LicensesObligations';

Chart.register(...registerables);

const DetectedReport = ({ data }) => {
  const [matchedLicenseSelected, setMatchedLicenseSelected] = useState<string>(null);

  const onLicenseSelected = (license: string) => {
    const matchedLicense = data.licenses.find((item) => item?.label === license);
    setMatchedLicenseSelected(matchedLicense);
  };

  if (!data.licenses) {
    return '';
  }

  return (
    <>
      <section className="report-layout detected">
        <Card className={data.licenses.length < 4 ? 'report-item licenses' : 'report-item long-license-list'}>
          <div className="report-title">Licenses</div>
          {data.licenses.length > 0 ? (
            <div className={data.licenses.length < 4 ? 'report-second' : 'license-long-list-container'}>
              <LicensesChart data={data.licenses} />
              <LicensesTable
                matchedLicenseSelected={matchedLicenseSelected || data.licenses?.[0]}
                selectLicense={(license) => onLicenseSelected(license)}
                data={data.licenses}
              />
            </div>
          ) : (
            <p className="report-empty">No licenses found</p>
          )}
        </Card>

        <Card className="report-item matches-for-license">
          <div className="report-title">Matches for license</div>
          {data.licenses.length > 0 ? (
            <MatchesForLicense data={matchedLicenseSelected || data.licenses?.[0]} />
          ) : (
            <p className="report-empty">No matches found</p>
          )}
        </Card>

        <Card className="report-item matches">
          <div className="report-title">Matches</div>
          <MatchesChart data={data.summary} />
        </Card>

        {/*
        <Card className="report-item vulnerabilites">
          <div className="report-title">Vulnerabilites</div>
          <VulnerabilitiesCard data={data.vulnerabilities} />
        </Card>
        */}

        <Card className="report-item licenses-obligation">
          <LicensesObligations data={data.licenses} />
        </Card>
      </section>
    </>
  );
};

export default DetectedReport;
