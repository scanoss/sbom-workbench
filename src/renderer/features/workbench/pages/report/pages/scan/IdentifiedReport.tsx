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
import { ReportComponent } from 'main/services/ReportService';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { reportService } from '@api/services/report.service';
import { projectService } from '@api/services/project.service';
import LicensesChart from '../../components/LicensesChart';
import IdentificationProgress from '../../components/IdentificationProgress';
import LicensesTable from '../../components/LicensesTable';
import MatchesForLicense from '../../components/MatchesForLicense';
import LicensesObligations from '../../components/LicensesObligations';
import OssVsOriginalProgressBar from '../../components/OssVsOriginalProgressBar';
import VulnerabilitiesCard from '../../components/VulnerabilitiesCard';
import { Scanner } from '../../../../../../../main/task/scanner/types';
import DependenciesCard from '../../components/DependenciesCard';
import CryptographyCard from '../../components/CryptographyCard';

Chart.register(...registerables);

const IdentifiedReport = ({ data, summary, onRefresh }: { data: any, summary: any, onRefresh: () => void }) => {
  const { projectScannerConfig, loaded } = useSelector(selectWorkbench);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();

  const [tab, setTab] = useState<string>('matches');

  const isMounted = useRef(true);
  const layers = useRef<Set<Scanner.PipelineStage>>(new Set(projectScannerConfig?.pipelineStages));
  const obligations = useRef<any[]>([]);

  const [licenseSelected, setLicenseSelected] = useState<any>(null);

  const [componentsMatched, setComponentsMatched] = useState<ReportComponent[]>([]); // detected
  const [componentsDeclared, setComponentsDeclared] = useState<ReportComponent[]>([]);
  const [obligationsFiltered, setObligationsFiltered] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isEmpty = summary?.identified.scan === 0 && summary?.original === 0 && data.licenses.length === 0;

  const init = async () => {
    setIsLoading(true);
    const licenses = data.licenses.map((license) => license.label);

    obligations.current = await obligationsService.getObligations(licenses);
    if (!isMounted.current || !loaded) return;
    setObligationsFiltered(obligations.current);

    onLicenseClear();
  };

  const onLicenseSelected = async (license: string) => {
    if (!loaded) return;
    const matchedLicense = data.licenses.find((item) => item.label === license);

    try {
      const identified = await reportService.getIdentifiedComponents(license);
      if (!isMounted.current || !loaded) return;

      setComponentsMatched(identified.components);
      setComponentsDeclared(identified.declaredComponents);
      setObligationsFiltered(obligations.current.filter((item) => item.label === license || item.incompatibles?.includes(license)));
      setLicenseSelected(matchedLicense);
    } catch (e) {
      if (!isMounted.current || !loaded) return;
      throw e;
    }
  };

  const onLicenseClear = async () => {
    if (!loaded) return;
    try {
      const identified = await reportService.getIdentifiedComponents();
      if (!isMounted.current || !loaded) return;
      setComponentsMatched(identified.components);
      setComponentsDeclared(identified.declaredComponents);
      setObligationsFiltered(obligations.current);
      setLicenseSelected(null);
    } catch (e) {
      if (!isMounted.current || !loaded) return;
      throw e;
    }
  };

  useEffect(() => {
    if (location) {
      const last = location.pathname.split('/').pop();
      setTab(last);
    }
  }, [location]);

  useEffect(() => {
    setIsLoading(false);
  }, [componentsMatched]);

  useEffect(() => {
    init();
    return () => {
      isMounted.current = false;
    };
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
        <IdentificationProgress data={summary} />
      </Card>

      <Card className="report-item oss-original">
        <div className="report-title">{t('Title:OSSvsOriginal')}</div>
        <OssVsOriginalProgressBar data={summary} />
      </Card>

      <Card className="report-item licenses">
        <div className="report-title">{t('Title:Licenses')} ({data.licenses.length})</div>
        {data.licenses.length > 0 ? (
          <div className="report-full">
            <LicensesChart data={data.licenses} />
            <LicensesTable
              matchedLicenseSelected={licenseSelected}
              selectLicense={async (license) => onLicenseSelected(license)}
              data={data.licenses}
            />
          </div>
        ) : (
          <p className="report-empty">{t('NoLicensesFound')}</p>
        )}
      </Card>

      <Card className={`report-item dependencies more-details ${layers.current.has(Scanner.PipelineStage.DEPENDENCIES) ? 'no-blocked' : 'blocked'}`}>
        <ConditionalLink to="declared" replace className="w-100 no-underline" disabled={false}>
          <div className="report-title d-flex space-between align-center">
            <span>{t('Title:IdentifiedDependencies')}</span>
          </div>
          { layers.current.has(Scanner.PipelineStage.DEPENDENCIES)
            ? <DependenciesCard data={data.dependencies} />
            : <p className="text-center mb-5 mt-5">{t('NotScanned')}</p>}
        </ConditionalLink>
      </Card>

      <Card className={`report-item vulnerabilities ${layers.current.has(Scanner.PipelineStage.VULNERABILITIES) ? 'no-blocked' : 'blocked'}`}>
        <ConditionalLink to="../../vulnerabilities?type=identified" disabled={false} className="w-100 no-underline">
          <div className="report-title d-flex space-between align-center">
            <span>{t('Title:Vulnerabilities')}</span>
            <div className="action">
              <ArrowForwardOutlinedIcon fontSize="inherit" />
            </div>
          </div>
          { layers.current.has(Scanner.PipelineStage.VULNERABILITIES)
            ? <VulnerabilitiesCard data={data.vulnerabilities} />
            : <p className="text-center mb-5 mt-5">{t('NotScanned')}</p>}
        </ConditionalLink>
      </Card>

      <Card className={`report-item cryptography ${layers.current.has(Scanner.PipelineStage.CRYPTOGRAPHY) ? 'no-blocked' : 'blocked'}`}>
        <ConditionalLink to="../../cryptographies?type=identified" className="w-100 no-underline" disabled={false}>
          <div className="report-title d-flex space-between align-center">
            <span>{t('Title:Cryptography')}</span>
            <div className="action">
              <ArrowForwardOutlinedIcon fontSize="inherit" />
            </div>
          </div>
          { layers.current.has(Scanner.PipelineStage.CRYPTOGRAPHY)
            ? <CryptographyCard data={data.cryptographies} />
            : <p className="text-center mb-5 mt-5">{t('NotScanned')}</p>}
        </ConditionalLink>
      </Card>

      <nav className="tabs-navigator">
        <Tabs value={tab}>
          <Tab value="matches" label={`${t('Title:IdentifiedMatchedTab')} (${componentsMatched.length})`} component={Link} to="matches" replace />
          { layers.current.has(Scanner.PipelineStage.DEPENDENCIES)
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
          <Route path="matches" element={<MatchesForLicense components={componentsMatched} mode="identified" loading={isLoading} />} />
          <Route path="declared" element={<MatchesForLicense components={componentsDeclared} mode="identified" loading={isLoading} />} />
          <Route path="obligations" element={<LicensesObligations data={obligationsFiltered} />} />
          <Route path="" element={<Navigate to="matches" replace />} />
        </Routes>
      </Card>

    </section>
  );
};

export default IdentifiedReport;
