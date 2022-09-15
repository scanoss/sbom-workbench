import React, { useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { Card } from '@mui/material';
import obligationsService from '@api/services/obligations.service';
import { projectService } from '@api/services/project.service';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { Link } from 'react-router-dom';
import { ConditionalLink } from '@components/ConditionalLink/ConditionalLink';
import { useSelector } from 'react-redux';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import LicensesChart from '../../components/LicensesChart';
import LicensesTable from '../../components/LicensesTable';
import MatchesForLicense from '../../components/MatchesForLicense';
import MatchesChart from '../../components/MatchesChart';
import LicensesObligations from '../../components/LicensesObligations';
import VulnerabilitiesCard from '../../components/VulnerabilitiesCard';
import { Scanner } from '../../../../../../../main/task/scanner/types';

Chart.register(...registerables);

const DetectedReport = ({ data }) => {
  const { projectScannerConfig } = useSelector(selectWorkbench);

  const [matchedLicenseSelected, setMatchedLicenseSelected] = useState<any>(data.licenses?.[0]);
  const [obligations, setObligations] = useState(null);

  const blocked = !projectScannerConfig?.type?.includes(Scanner.ScannerType.VULNERABILITIES)

  const init = async () => {
    const licenses = data.licenses.map((license) => license.label);
    const obligations = await obligationsService.getObligations(licenses);
    setObligations(obligations);
  };

  const onLicenseSelected = (license: string) => {
    const matchedLicense = data.licenses.find((item) => item?.label === license);
    setMatchedLicenseSelected(matchedLicense);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <section className="report-layout detected">
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

        <Card className="report-item matches">
          <div className="report-title">Matches</div>
          <MatchesChart data={data.summary} />
        </Card>

        {/* <ConditionalLink to="../../vulnerabilities?type=detected" disabled={blocked} className="w-100">
          <Card className={`report-item vulnerabilities ${blocked ? 'blocked' : 'no-blocked'}`}>
            <div className="report-title d-flex space-between align-center">
              <span>Vulnerabilities</span>
              <ArrowForwardOutlinedIcon fontSize="inherit" />
            </div>
            <VulnerabilitiesCard data={data.vulnerabilities} blocked={blocked} />
          </Card>
          </ConditionalLink> */}

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

export default DetectedReport;
