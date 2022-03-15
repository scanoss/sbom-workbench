import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import { Chart, registerables } from 'chart.js';
import { Button, Card } from '@material-ui/core';
import LicensesChart from '../components/LicensesChart';
import IdentificationProgress from '../components/IdentificationProgress';
import LicensesTable from '../components/LicensesTable';
import MatchesForLicense from '../components/MatchesForLicense';
import { WorkbenchContext, IWorkbenchContext } from '../../../store';
import LicensesObligations from '../components/LicensesObligations';
import obligationsService from '../../../../../../api/services/obligations.service';
import OssVsOriginalProgressBar from '../components/OssVsOriginalProgressBar';

Chart.register(...registerables);

const MAX_LICENSES = 4;

const IdentifiedReport = ({ data }) => {
  const history = useHistory();
  const { state, dispatch } = useContext(WorkbenchContext) as IWorkbenchContext;
  const [obligations, setObligations] = useState(null);

  const [matchedLicenseSelected, setMatchedLicenseSelected] = useState<string>(null);
  const isEmpty = data.summary.identifiedFiles === 0 && data.summary.ignoredFiles === 0;

  const init = async () => {
    const licenses = data.licenses.map((license) => license.label);
    const obligations = await obligationsService.getObligations(licenses);
    setObligations(obligations);
  };

  const onLicenseSelected = (license: string) => {
    const matchedLicense = data.licenses.find((item) => item?.label === license);
    setMatchedLicenseSelected(matchedLicense);
  };

  useEffect(init, []);

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
            <Card className="report-item identification-progress">
              <div className="report-title">OSS vs Original</div>
              <OssVsOriginalProgressBar data={data.summary} />
            </Card>
            <Card className={data.licenses.length <= MAX_LICENSES ? 'report-item licenses' : 'report-item long-license-list'}>
              <div className="report-title">Licenses</div>
              {data.licenses.length > 0 ? (
                <div className={data.licenses.length <= MAX_LICENSES ? 'report-second' : 'license-long-list-container'}>
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
            <Card
              className={
                data.licenses.length <= MAX_LICENSES ? 'report-item matches-for-license' : 'report-item-long matches-for-licenses'
              }
            >
              <div className="report-title">Matches for license</div>
              {data.licenses.length > 0 ? (
                <MatchesForLicense data={matchedLicenseSelected || data.licenses?.[0]} />
              ) : (
                <p className="report-empty">No matches found</p>
              )}
            </Card>

            <Card className="report-item licenses-obligation">
              {obligations ? (
                <LicensesObligations data={obligations} />
              ) : (
                <p className="text-center mb-0 mt-0">Loading obligations info...</p>
              )}
            </Card>
          </section>
        </>
      )}
    </>
  );
};

export default IdentifiedReport;
