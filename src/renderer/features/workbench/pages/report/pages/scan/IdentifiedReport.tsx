import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Chart, registerables } from 'chart.js';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { Button, Card } from '@mui/material';
import obligationsService from '@api/services/obligations.service';
import { ConditionalLink } from '@components/ConditionalLink/ConditionalLink';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import LicensesChart from '../../components/LicensesChart';
import IdentificationProgress from '../../components/IdentificationProgress';
import LicensesTable from '../../components/LicensesTable';
import MatchesForLicense from '../../components/MatchesForLicense';
import LicensesObligations from '../../components/LicensesObligations';
import OssVsOriginalProgressBar from '../../components/OssVsOriginalProgressBar';
import VulnerabilitiesCard from '../../components/VulnerabilitiesCard';
import { Scanner } from '../../../../../../../main/task/scanner/types';

Chart.register(...registerables);

const IdentifiedReport = ({ data }) => {
  const { projectScannerConfig } = useSelector(selectWorkbench);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [obligations, setObligations] = useState(null);
  const [matchedLicenseSelected, setMatchedLicenseSelected] = useState<any>(data.licenses?.[0]);
  const blocked = !projectScannerConfig?.type?.includes(Scanner.ScannerType.VULNERABILITIES)

  const isEmpty = data.summary.identified.scan === 0 && data.summary.original === 0 && data.licenses.length === 0;

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

  // empty report
  if (isEmpty) {
    return (
      <>
        <div className="empty-container">
          <div className="report-message">
            <InsertDriveFileOutlinedIcon fontSize="inherit" color="primary" style={{ fontSize: '100px' }} />
            <h2 className="mb-1">{t('NothingIdentifiedYet')}</h2>
            <h5 className="mt-1 text-center">{t('NothingIdentifiedYetSubtitle')}</h5>
            <Button variant="contained" color="primary" onClick={() => navigate('/workbench/detected')}>
              {t('Button:StartIdentification')}
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
          <div className="report-title">{t('Title:IdentificationProgress')}</div>
          <IdentificationProgress data={data.summary} />
        </Card>
        <Card className="report-item oss-original">
          <div className="report-title">{t('Title:OSSvsOriginal')}</div>
          <OssVsOriginalProgressBar data={data.summary} />
        </Card>

        <Card className="report-item licenses">
          <div className="report-title">{t('Title:Licenses')}</div>
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
            <p className="report-empty">{t('NoLicensesFound')}</p>
          )}
        </Card>

        <Card className="report-item matches-for-license">
          <div className="report-title">{t('Title:MatchesForLabel', { label: matchedLicenseSelected?.label })}</div>
          {data.licenses.length > 0 ? (
            <MatchesForLicense data={matchedLicenseSelected} />
          ) : (
            <p className="report-empty">{t('Title:NoMatchesFound')}</p>
          )}
        </Card>

        <ConditionalLink to="../../vulnerabilities?type=identified" disabled={blocked} className="w-100">
          <Card className={`report-item vulnerabilities ${blocked ? 'blocked' : 'no-blocked'}`}>
            <div className="report-title d-flex space-between align-center">
              <span>{t('Title:Vulnerabilities')}</span>
              <ArrowForwardOutlinedIcon fontSize="inherit" />
            </div>
            <VulnerabilitiesCard data={data.vulnerabilities} blocked={blocked} />
          </Card>
        </ConditionalLink>

        <Card className="report-item licenses-obligation">
          {obligations ? (
            <LicensesObligations data={obligations} />
          ) : (
            <p className="text-center mb-0 mt-0">{t('LoadingObligationsInfo')}</p>
          )}
        </Card>
      </section>
    </>
  );
};

export default IdentifiedReport;
