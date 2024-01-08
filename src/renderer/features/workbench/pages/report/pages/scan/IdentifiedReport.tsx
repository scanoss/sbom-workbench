import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Chart, registerables } from 'chart.js';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { Button, Card, Chip, IconButton, Tab, Tabs, Tooltip } from '@mui/material';
import obligationsService from '@api/services/obligations.service';
import { ConditionalLink } from '@components/ConditionalLink/ConditionalLink';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Component, LicenseEntry } from 'main/services/ReportService';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import CloseIcon from '@mui/icons-material/Close';
import LicensesChart from '../../components/LicensesChart';
import IdentificationProgress from '../../components/IdentificationProgress';
import LicensesTable from '../../components/LicensesTable';
import MatchesForLicense from '../../components/MatchesForLicense';
import LicensesObligations from '../../components/LicensesObligations';
import OssVsOriginalProgressBar from '../../components/OssVsOriginalProgressBar';
import VulnerabilitiesCard from '../../components/VulnerabilitiesCard';
import { Scanner } from '../../../../../../../main/task/scanner/types';
import CryptographyDataTable from '../../components/CryptographyDataTable';
import DependenciesCard from '../../components/DependenciesCard';
import DependenciesDataTable from '../../components/DependenciesDataTable';

Chart.register(...registerables);

const IdentifiedReport = ({ data, onRefresh }: { data: any, onRefresh: () => void }) => {
  const { projectScannerConfig } = useSelector(selectWorkbench);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();

  const [tab, setTab] = useState<string>('matches');

  const layers = useRef<Set<Scanner.ScannerType>>(new Set(projectScannerConfig?.type));
  const obligations = useRef<any[]>([]);

  const [licenseSelected, setLicenseSelected] = useState<any>(null);

  const [componentsMatched, setComponentsMatched] = useState<Component[]>([]); // detected
  const [componentsDeclared, setComponentsDeclared] = useState<Component[]>([]);
  const [obligationsFiltered, setObligationsFiltered] = useState<any[]>([]);

  const isEmpty = data.summary.identified.scan === 0 && data.summary.original === 0 && data.licenses.length === 0;

  const init = async () => {
    const licenses = data.licenses.map((license) => license.label);
    obligations.current = await obligationsService.getObligations(licenses);
    setObligationsFiltered(obligations.current);
    onLicenseClear();
  };

  const onLicenseSelected = (license: string) => {
    const matchedLicense = data.licenses.find((item) => item.label === license);

    const filtered = matchedLicense.components.map((item) => ({ ...item, license: matchedLicense.label }));
    setComponentsMatched(filtered.filter((item) => item.source === 'detected'));
    setComponentsDeclared(filtered.filter((item) => item.source === 'declared'));
    setObligationsFiltered(obligations.current.filter((item) => item.label === license || item.incompatibles?.includes(license)));
    setLicenseSelected(matchedLicense);
  };

  const onLicenseClear = () => {
    const items = data.licenses?.map((license: any) => license.components.map((item) => ({ ...item, license: license.label }))).flat();
    setComponentsMatched(items.filter((item) => item.source === 'detected'));
    setComponentsDeclared(items.filter((item) => item.source === 'declared'));
    setObligationsFiltered(obligations.current);

    setLicenseSelected(null);
  };

  useEffect(() => {
    if (location) {
      const last = location.pathname.split('/').pop();
      setTab(last);
    }
  }, [location]);

  useEffect(() => {
    init();
  }, []);

  // empty report
  if (isEmpty) {
    return (
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
    );
  }

  return (
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

      <Card onClick={(e) => setTab('declared')} className={`report-item dependencies more-details ${layers.current.has(Scanner.ScannerType.DEPENDENCIES) ? 'no-blocked' : 'blocked'}`}>
        <div className="report-title d-flex space-between align-center">
          <span>{t('Title:IdentifiedDependencies')}</span>
        </div>
        { layers.current.has(Scanner.ScannerType.DEPENDENCIES)
          ? <DependenciesCard data={data.dependencies} />
          : <p className="text-center mb-5 mt-5">{t('NoDependenciesScanned')}</p>}
      </Card>

      <Card className={`report-item vulnerabilities ${layers.current.has(Scanner.ScannerType.VULNERABILITIES) ? 'no-blocked' : 'blocked'}`}>
        <ConditionalLink to="../../vulnerabilities?type=identified" disabled={false} className="w-100 no-underline">
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

      <nav className="tabs-navigator">
        <Tabs value={tab}>
          <Tab value="matches" label={`${t('Title:IdentifiedMatchedTab')} (${componentsMatched.length})`} component={Link} to="matches" replace />
          { layers.current.has(Scanner.ScannerType.DEPENDENCIES)
          && <Tab value="declared" label={`${t('Title:IdentifiedDependenciesTab')} (${componentsDeclared.length})`} component={Link} to="declared" replace />}
          <Tab value="obligations" label={`${t('Title:ObligationsTab')} (${obligationsFiltered.length})`} component={Link} to="obligations" replace />
          <Tab value="identified" hidden /> {/* fallback value */}
        </Tabs>

        <div className="d-flex align-center">
          { licenseSelected
            && (
              <Chip
                size="small"
                icon={<FilterAltOutlinedIcon />}
                label={licenseSelected.label}
                onDelete={(e) => onLicenseClear()}
              />
            )}

          <Tooltip title={t('Tooltip:RefreshReportButtonLabel')} classes={{ tooltip: 'tooltip' }}>
            <IconButton onClick={onRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </div>
      </nav>

      <Card className="report-item report-item-detail matches-for-license pt-1 mt-0">
        <Routes>
          <Route path="matches" element={<MatchesForLicense components={componentsMatched} showCrypto={layers.current.has(Scanner.ScannerType.CRYPTOGRAPHY)} mode="detected" />} />
          <Route path="declared" element={<MatchesForLicense components={componentsDeclared} showCrypto={layers.current.has(Scanner.ScannerType.CRYPTOGRAPHY)} mode="detected" />} />
          <Route path="obligations" element={<LicensesObligations data={obligationsFiltered} />} />
          <Route path="" element={<Navigate to="matches" replace />} />
        </Routes>
      </Card>

    </section>
  );
};

export default IdentifiedReport;
