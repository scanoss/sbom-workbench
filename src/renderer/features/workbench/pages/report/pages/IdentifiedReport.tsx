import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import { Chart, registerables } from 'chart.js';
import { Button, Card } from '@material-ui/core';
import LicensesChart from '../components/LicensesChart';
import IdentificationProgress from '../components/IdentificationProgress';
import LicensesTable from '../components/LicensesTable';
import MatchesForLicense from '../components/MatchesForLicense';
import { setHistoryCrumb } from '../../../actions';
import { WorkbenchContext, IWorkbenchContext } from '../../../store';

const { shell } = require('electron');

Chart.register(...registerables);

const IdentifiedReport = ({ data }) => {
  const history = useHistory();
  const { state, dispatch } = useContext(WorkbenchContext) as IWorkbenchContext;

  const [matchedLicenseSelected, setMatchedLicenseSelected] = useState<string>(null);

  const isEmpty = state.progress === 0;

  const onLicenseSelected = (license: string) => {
    const matchedLicense = data.licenses.find((item) => item?.label === license);
    setMatchedLicenseSelected(matchedLicense);
  };

  useEffect(() => dispatch(setHistoryCrumb({ report: 'identified' })), []);

  return (
    <>
      {isEmpty ? (
        <>
          <div className="empty-container">
            <div className="report-message">
              <InsertDriveFileOutlinedIcon fontSize="inherit" color="primary" style={{ fontSize: '100px' }} />
              <h2>Nothing identified yet.</h2>
              <Button variant="contained" color="primary" onClick={() => history.push('/workbench/detected')}>
                Start Identification
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <section className="report-layout identified">
            <Card className="report-item identification-progress">
              <div className="report-title">Identification Progress</div>
              <IdentificationProgress data={data.summary} />
            </Card>
            <Card className="report-item licenses">
              <div className="report-title">Licenses</div>
              {data.licenses.length > 0 ? (
                <div id="report-second">
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
          </section>
        </>
      )}
    </>
  );
};

export default IdentifiedReport;
