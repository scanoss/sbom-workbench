import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { Chart, registerables } from 'chart.js';
import { Button, Card } from '@mui/material';
import obligationsService from '@api/services/obligations.service';
import { projectService } from '@api/services/project.service';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { ConditionalLink } from '@components/ConditionalLink/ConditionalLink';
import LicensesChart from '../../components/LicensesChart';
import IdentificationProgress from '../../components/IdentificationProgress';
import LicensesTable from '../../components/LicensesTable';
import MatchesForLicense from '../../components/MatchesForLicense';
import LicensesObligations from '../../components/LicensesObligations';
import OssVsOriginalProgressBar from '../../components/OssVsOriginalProgressBar';
import VulnerabilitiesCard from '../../components/VulnerabilitiesCard';

Chart.register(...registerables);

const IdentifiedReport = ({ data }) => {
  const navigate = useNavigate();
  const [obligations, setObligations] = useState(null);
  const [matchedLicenseSelected, setMatchedLicenseSelected] = useState<any>(data.licenses?.[0]);
  const [blocked, setBlocked] = useState<boolean>(false);

  const isEmpty = data.summary.identified.scan === 0 && data.summary.original === 0 && data.licenses.length === 0;

  const init = async () => {
    const licenses = data.licenses.map((license) => license.label);
    const obligations = await obligationsService.getObligations(licenses);
    setObligations(obligations);

    // api key validation TODO: move to store
    const apiKey = await projectService.getApiKey();
    setBlocked(!apiKey);
  };

  const onLicenseSelected = (license: string) => {
    const matchedLicense = data.licenses.find((item) => item?.label === license);
    setMatchedLicenseSelected(matchedLicense);
  };

  useEffect(() => {
    init();
  }, []);

  // empty report
  if (isEmpty) {
    return (
      <>
        <div className="empty-container">
          <div className="report-message">
            <InsertDriveFileOutlinedIcon fontSize="inherit" color="primary" style={{ fontSize: '100px' }} />
            <h2 className="mb-1">Nothing identified yet</h2>
            <h5 className="mt-1 text-center">
              Verify the scanner output before including them in your SBOM in order to confirm detections or even
              include your own manual identifications.
            </h5>
            <Button variant="contained" color="primary" onClick={() => navigate('/workbench/detected')}>
              Start Identification
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <section className="report-layout identified">
        <Card className="report-item identification-progress">
          <div className="report-title">Identification Progress</div>
          <IdentificationProgress data={data.summary} />
        </Card>
        <Card className="report-item oss-original">
          <div className="report-title">OSS vs Original</div>
          <OssVsOriginalProgressBar data={data.summary} />
        </Card>

        <Card className="report-item licenses">
          <div className="report-title">Licenses</div>
          {data.licenses.length > 0 ? (
            <div className="report-full">
              <LicensesChart data={data.licenses} />
              <LicensesTable
                matchedLicenseSelected={matchedLicenseSelected}
                selectLicense={(license) => onLicenseSelected(license)}
                data={data.licenses}
              />
            </div>
          ) : (
            <p className="report-empty">No licenses found</p>
          )}
        </Card>

        <Card className="report-item matches-for-license">
          <div className="report-title">Matches for {matchedLicenseSelected?.label}</div>
          {data.licenses.length > 0 ? (
            <MatchesForLicense data={matchedLicenseSelected} />
          ) : (
            <p className="report-empty">No matches found</p>
          )}
        </Card>

        <ConditionalLink to="../../vulnerabilities?type=identified" disabled={blocked} className="w-100">
          <Card className={`report-item vulnerabilities ${blocked ? 'blocked' : 'no-blocked'}`}>
            <div className="report-title d-flex space-between align-center">
              <span>Vulnerabilities</span>
              <ArrowForwardOutlinedIcon fontSize="inherit" />
            </div>
            <VulnerabilitiesCard data={data.vulnerabilities} blocked={blocked} />
          </Card>
        </ConditionalLink>

        <Card className="report-item licenses-obligation">
          {obligations ? (
            <LicensesObligations data={obligations} />
          ) : (
            <p className="text-center mb-0 mt-0">Loading obligations info...</p>
          )}
        </Card>
      </section>
    </>
  );
};

export default IdentifiedReport;
