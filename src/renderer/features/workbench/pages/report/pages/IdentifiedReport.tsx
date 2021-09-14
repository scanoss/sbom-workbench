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
import LicensesChart from '../components/LicensesChart';
import IdentificationProgress from '../components/IdentificationProgress';
import LicensesTable from '../components/LicensesTable';
import MatchesForLicense from '../components/MatchesForLicense';
import { report } from '../../../../../../api/report-service';

Chart.register(...registerables);

const IdentifiedReport = ({ data }) => {
  const [matchedLicenseSelected, setMatchedLicenseSelected] = useState<string>(null);

  const onLicenseSelected = (license: string) => {
    const matchedLicense = data.licenses.find((item) => item?.label === license);
    setMatchedLicenseSelected(matchedLicense);
  };

  return (
    <>
      <section className="report-layout identified">
        <Card className="report-item identification-progress">
          <div className="report-title">Identification Progress</div>
          <IdentificationProgress data={data.summary} />
        </Card>

        <Card className="report-item licenses">
          <div className="report-title">Licenses</div>
          <div id="report-second">
            <LicensesChart data={data.licenses} />
            <LicensesTable
              matchedLicenseSelected={matchedLicenseSelected || data.licenses?.[0]}
              selectLicense={(license) => onLicenseSelected(license)}
              data={data.licenses}
            />
          </div>
        </Card>

        <Card className="report-item matches-for-license">
          <div className="report-title">Matches for license</div>
          <MatchesForLicense data={matchedLicenseSelected || data.licenses?.[0]} />
        </Card>
      </section>
    </>
  );
};

export default IdentifiedReport;
