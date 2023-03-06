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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const [matchedLicenseSelected, setMatchedLicenseSelected] = useState<any>(data.licenses?.[0]);
  const [obligations, setObligations] = useState(null);

  const vulnerabilitiesDisabled = !projectScannerConfig?.type?.includes(Scanner.ScannerType.VULNERABILITIES)

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

        <Card className="report-item matches">
          <div className="report-title">{t('Title:Matches')}</div>
          <MatchesChart data={data.summary} />
        </Card>

        <ConditionalLink to="../../vulnerabilities?type=detected" disabled={vulnerabilitiesDisabled} className="w-100">
          <Card className={`report-item vulnerabilities ${vulnerabilitiesDisabled ? 'blocked' : 'no-blocked'}`}>
            <div className="report-title d-flex space-between align-center">
              <span>{t('Title:Vulnerabilities')}</span>
              <div className="action">
                <span className="mr-1">{t('Button:MoreDetails')}</span>
                <ArrowForwardOutlinedIcon fontSize="inherit" />
              </div>
            </div>
            { !vulnerabilitiesDisabled
              ? <VulnerabilitiesCard data={data.vulnerabilities}/>
              : <p className="text-center mb-5 mt-5">{t('NoVulnerabilitiesScanned')}</p>
            }
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

export default DetectedReport;
