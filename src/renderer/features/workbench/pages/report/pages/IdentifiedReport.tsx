import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import { Chart, registerables } from 'chart.js';
import { Button, Card } from '@material-ui/core';
import LicensesChart from '../components/LicensesChart';
import IdentificationProgress from '../components/IdentificationProgress';
import LicensesTable from '../components/LicensesTable';
import MatchesForLicense from '../components/MatchesForLicense';
import { setReport } from '../../../actions';
import { WorkbenchContext, IWorkbenchContext } from '../../../store';
import { ExportFormat } from '../../../../../../api/export-service';
import { HashType } from '../../../../../../main/db/export_formats';

const { shell } = require('electron');

Chart.register(...registerables);

const IdentifiedReport = ({ data }) => {
  const notarizeSBOM = async () => {
    const hash = await ExportFormat.notarizeSBOM(HashType.SHA256);

    const response = await fetch('https://sbom.info/', {
      method: 'POST',
      headers: { 'Content-Type':'application/x-www-form-urlencoded' }, // this line is important, if this content-type is not set it wont work
      body: `hash=${hash}&type=${HashType.SHA256}`,
  });
  console.log(response);
  };

  const history = useHistory();
  const { dispatch } = useContext(WorkbenchContext) as IWorkbenchContext;

  const [matchedLicenseSelected, setMatchedLicenseSelected] = useState<string>(null);

  const isEmpty = data.licenses.length === 0;

  const onLicenseSelected = (license: string) => {
    const matchedLicense = data.licenses.find((item) => item?.label === license);
    setMatchedLicenseSelected(matchedLicense);
  };

  useEffect(() => dispatch(setReport('identified')), []);

  return (
    <>
      {isEmpty ? (
        <>
          <div className="empty-container">
            <div className="report-message">
              <InsertDriveFileOutlinedIcon fontSize="inherit" color="primary" style={{ fontSize: '100px' }} />
              <h2>Nothing identified yet</h2>
              <Button variant="outlined" color="primary" onClick={() => history.push('/workbench/detected')}>
                Start identification
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
            <div>
              <button type="button" onClick={notarizeSBOM}>
                Notarize SBOM
              </button>
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default IdentifiedReport;
