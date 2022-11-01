/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect } from 'react';
import { Button, Card, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { report } from '@api/services/report.service';
import MatchesChart from '../../../../report/components/MatchesChart';
import VulnerabilitiesCard from '../../../../report/components/VulnerabilitiesCard';
import LicensesChart from '../../../../report/components/LicensesChart';
import LicensesTable from '../../../../report/components/LicensesTable';

const ScanResults = ({ name }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [licenses, setLicenses] = useState<any[]>([]);
  const [vulnerabilites, setVulnerabilites] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [displayed, setDisplayed] = useState<any>(localStorage.getItem(name) === 'true' || !localStorage.getItem(name));

  const init = async () => {
    const a = await report.getSummary();
    setProgress(a?.data?.summary);
    setLicenses(a?.data?.licenses);
    setVulnerabilites(a?.data?.vulnerabilities);
  };

  const handleDisplayed = () => {
    setDisplayed(!displayed);
    localStorage.setItem(name, !displayed);
  };

  useEffect(() => { init() }, []);
  return (
    <div>
      {displayed ? (
        <section className="scan-results-home">
          <header className="d-flex space-between align-center">
            <div className="div-scan-title">
              <h1 className="header-title">Scan Results</h1>
            </div>
            <Button variant="outlined" color="primary" onClick={() => navigate('/report')}>
             {t('Button:MoreDetails')}
            </Button>
          </header>
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
        </section>
      ) : null}
      <div
        onClick={() => {
          handleDisplayed();
        }}
        className="btn-close"
      >
        <div className="btn-slide-container">{displayed ? <ExpandLess /> : <ExpandMore />}</div>
      </div>
    </div>
  );
};

export default ScanResults;
