import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import {
  Button,
  Card, IconButton, Tab, Tabs, Tooltip,
} from '@mui/material';
import obligationsService from '@api/services/obligations.service';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ConditionalLink } from '@components/ConditionalLink/ConditionalLink';
import { useSelector } from 'react-redux';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import LicensesChart from '../../components/LicensesChart';
import LicensesTable from '../../components/LicensesTable';
import MatchesForLicense from '../../components/MatchesForLicense';
import MatchesChart from '../../components/MatchesChart';
import LicensesObligations from '../../components/LicensesObligations';
import VulnerabilitiesCard from '../../components/VulnerabilitiesCard';
import { Scanner } from '../../../../../../../main/task/scanner/types';
import CryptographyDataTable from '../../components/CryptographyDataTable';
import DependenciesCard from '../../components/DependenciesCard';
import DependenciesDataTable from '../../components/DependenciesDataTable';
import ObligationsDataTable from '../../components/ObligationsDataTable';

Chart.register(...registerables);

const DetectedReport = ({ data, onRefresh }) => {
  const { projectScannerConfig } = useSelector(selectWorkbench);
  const { t } = useTranslation();

  const [tab, setTab] = useState<string>('matches');

  const layers = useRef<Set<Scanner.ScannerType>>(new Set(projectScannerConfig?.type));

  const [components, setComponents] = useState<any[]>([]);
  const [licenseSelected, setLicenseSelected] = useState<any>(null);
  const [obligations, setObligations] = useState(null);

  const init = async () => {
    const licenses = data.licenses.map((license) => license.label);
    const obligations = await obligationsService.getObligations(licenses);
    setObligations(obligations);
    onLicenseClear();
  };

  const onLicenseSelected = (license: string) => {
    const matchedLicense = data.licenses.find((item) => item.label === license);
    setTab('matches');

    setComponents(matchedLicense.components.map((item) => ({ ...item, license: matchedLicense.label })));
    setLicenseSelected(matchedLicense);
  };

  const onLicenseClear = () => {
    setComponents(data.licenses?.map((license: any) => license.components.map((item) => ({ ...item, license: license.label }))).flat());
    setLicenseSelected(null);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <section className="report-layout detected">
      <Card className="report-item licenses">
        <div className="report-title">{t('Title:Licenses')} ({data.licenses.length})</div>
        {data.licenses.length > 0 ? (
          <div className="report-full">
            <LicensesChart data={data.licenses} />
            <LicensesTable
              matchedLicenseSelected={licenseSelected}
              selectLicense={(license) => onLicenseSelected(license)}
              data={data.licenses}
            />
          </div>
        ) : (
          <p className="report-empty">{t('NoLicensesFound')}</p>
        )}
      </Card>

      <Card className="report-item matches">
        <div className="report-title">{t('Title:Matches')}</div>
        <MatchesChart data={data.summary} />
      </Card>

      <Card onClick={(e) => setTab('dependencies')} className={`report-item dependencies more-details ${layers.current.has(Scanner.ScannerType.DEPENDENCIES) ? 'no-blocked' : 'blocked'}`}>
        <div className="report-title d-flex space-between align-center">
          <span>{t('Title:DeclaredDependencies')}</span>
        </div>
        { layers.current.has(Scanner.ScannerType.DEPENDENCIES)
          ? <DependenciesCard data={data.dependencies} />
          : <p className="text-center mb-5 mt-5">{t('NoDependenciesScanned')}</p>}
      </Card>

      <Card className={`report-item vulnerabilities ${layers.current.has(Scanner.ScannerType.VULNERABILITIES) ? 'no-blocked' : 'blocked'}`}>
        <ConditionalLink to="../../vulnerabilities?type=detected" disabled={false} className="w-100">
          <div className="report-title d-flex space-between align-center">
            <span>{t('Title:Vulnerabilities')}</span>
            <div className="action">
              <ArrowForwardOutlinedIcon fontSize="inherit" />
            </div>
          </div>
          { layers.current.has(Scanner.ScannerType.VULNERABILITIES)
            ? <VulnerabilitiesCard data={data.vulnerabilities} />
            : <p className="text-center mb-5 mt-5">{t('NoVulnerabilitiesScanned')}</p>}
        </ConditionalLink>
      </Card>

      <div className="tabs-navigator">
        <Tabs value={tab} onChange={(e, value) => setTab(value)}>
          <Tab value="matches" label={t('Title:MatchedTab')} />
          { layers.current.has(Scanner.ScannerType.DEPENDENCIES) && <Tab value="dependencies" label={t('Title:DeclaredDependenciesTab')} />}
          <Tab value="obligations" label={t('Title:ObligationsTab')} />
        </Tabs>

        <Tooltip title={t('Tooltip:RefreshReportButtonLabel')} classes={{ tooltip: 'tooltip' }}>
          <IconButton onClick={onRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </div>

      {tab === 'matches' && (
        <Card className="report-item matches-for-license">
          <div className="report-title d-flex align-center">
            { licenseSelected
              ? (
                <>
                  <div className="mb-1 mt-1">{t('Title:MatchesForLabel', { label: licenseSelected.label, count: licenseSelected.components.length })}</div>
                  <IconButton className="ml-1" onClick={(e) => onLicenseClear()} size="small">
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                </>
              )
              : <div className="mb-1 mt-1">{t('Title:MatchesForProject', { count: components.length })}</div>}
          </div>
          {data.licenses.length > 0 ? (
            <MatchesForLicense components={components} showCrypto={layers.current.has(Scanner.ScannerType.CRYPTOGRAPHY)}/>
          ) : (
            <p className="report-empty">{t('Title:NoMatchesFound')}</p>
          )}
        </Card>
      )}

      {tab === 'dependencies' && (
        <Card className="report-item dependencies-table pt-1 mt-0">
          <DependenciesDataTable data={data.dependencies} />
        </Card>
      )}

      {tab === 'obligations' && (
        <Card className="report-item licenses-obligation pt-1 mt-0">
          <LicensesObligations data={obligations} />
        </Card>
      )}

      {tab === 'cryptography' && (
        <Card className="report-item cryptography pt-1 mt-0">
          <CryptographyDataTable data={data.crypto} />
        </Card>
      )}

    </section>
  );
};

export default DetectedReport;
