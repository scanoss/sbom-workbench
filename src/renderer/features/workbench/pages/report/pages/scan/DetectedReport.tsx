import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { Card, Chip, IconButton, Tab, Tabs, Tooltip } from '@mui/material';
import obligationsService from '@api/services/obligations.service';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ConditionalLink } from '@components/ConditionalLink/ConditionalLink';
import { useSelector } from 'react-redux';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { useTranslation } from 'react-i18next';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { reportService } from '@api/services/report.service';
import LicensesChart from '../../components/LicensesChart';
import LicensesTable from '../../components/LicensesTable';
import MatchesForLicense from '../../components/MatchesForLicense';
import MatchesChart from '../../components/MatchesChart';
import LicensesObligations from '../../components/LicensesObligations';
import VulnerabilitiesCard from '../../components/VulnerabilitiesCard';
import { Scanner } from '../../../../../../../main/task/scanner/types';
import DependenciesCard from '../../components/DependenciesCard';
import CryptographyCard from '../../components/CryptographyCard';
import { Component, ComponentReportResponse } from '@api/types';
import { ReportComponent } from '../../../../../../../main/services/ReportService';

Chart.register(...registerables);

const DetectedReport = ({ data, summary, onRefresh }) => {
  const { projectScannerConfig, loaded } = useSelector(selectWorkbench);
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

  const init = async () => {
    setIsLoading(true);
    const licenses = data.licenses.map((license) => license.label);

    obligations.current = await obligationsService.getObligations(licenses);
    if (!isMounted.current || !loaded) return;
    setObligationsFiltered(obligations.current);

    await onLicenseClear();
  };

  const onLicenseSelected = async (license: string) => {
    if (!loaded) return;
    const matchedLicense = data.licenses.find((item) => item.label === license);
    try {
      const detected = await reportService.getDetectedComponents(license);
      if (!isMounted.current || !loaded) return;
      setComponentsMatched(detected.components);
      setComponentsDeclared(detected.declaredComponents);
      setObligationsFiltered(
        obligations.current.filter((item) => item.label === license || item.incompatibles?.includes(license)),
      );
      setLicenseSelected(matchedLicense);
    } catch (e) {
      if (!isMounted.current || !loaded) return;
      throw e;
    }
  };

  const onLicenseClear = async () => {
    if (!loaded) return;
    try {
      const detected = await reportService.getDetectedComponents();
      if (!isMounted.current || !loaded) return;
      setComponentsDeclared(detected.declaredComponents);
      setObligationsFiltered(obligations.current);
      setComponentsMatched(detected.components);
      setLicenseSelected(null);
    } catch (e) {
      if (!isMounted.current || !loaded) return;
      throw e;
    }
  };

  useEffect(() => {
    setIsLoading(false);
  }, [componentsMatched]);

  useEffect(() => {
    if (location) {
      const last = location.pathname.split('/').pop();
      setTab(last);
    }
  }, [location]);

  useEffect(() => {
    console.log("DetectedReport useEffect, init");
    init();
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <section className="report-layout detected">
      <Card className="report-item licenses">
        <div className="report-title">
          {t('Title:Licenses')} ({data.licenses.length})
        </div>
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

      <Card className="report-item matches">
        <div className="report-title">{t('Title:Matches')}</div>
        <MatchesChart data={summary} />
      </Card>

      <Card className={`report-item dependencies more-details ${layers.current.has(Scanner.PipelineStage.DEPENDENCIES) ? 'no-blocked' : 'blocked'}`}>
        <ConditionalLink to="declared" replace className="w-100 no-underline" disabled={false}>
          <div className="report-title d-flex space-between align-center">
            <span>{t('Title:Dependencies')}</span>
          </div>
          { layers.current.has(Scanner.PipelineStage.DEPENDENCIES)
            ? <DependenciesCard data={data.dependencies} />
            : <p className="text-center mb-5 mt-5">{t('NotScanned')}</p>}
        </ConditionalLink>
      </Card>

      <Card className={`report-item vulnerabilities ${layers.current.has(Scanner.PipelineStage.VULNERABILITIES) ? 'no-blocked' : 'blocked'}`}>
        <ConditionalLink to="../../vulnerabilities?type=detected" className="w-100 no-underline" disabled={false}>
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
        <ConditionalLink to="../../cryptographies?type=detected" className="w-100 no-underline" disabled={false}>
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
          <Tab value="matches" label={`${t('Title:DeclaredMatchedTab')} (${componentsMatched.length})`} component={Link} to="matches" replace />
          { layers.current.has(Scanner.PipelineStage.DEPENDENCIES)
          && <Tab value="declared" label={`${t('Title:DeclaredDependenciesTab')} (${componentsDeclared.length})`} component={Link} to="declared" replace />}
          <Tab value="obligations" label={`${t('Title:ObligationsTab')} (${obligationsFiltered.length})`} component={Link} to="obligations" replace />
          <Tab value="detected" hidden /> {/* fallback value */}
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
          <Route path="matches" element={<MatchesForLicense components={componentsMatched} mode="detected" loading={isLoading} />} />
          <Route path="declared" element={<MatchesForLicense components={componentsDeclared} mode="detected" loading={isLoading} />} />
          <Route path="obligations" element={<LicensesObligations data={obligationsFiltered} />} />
          <Route path="" element={<Navigate to="matches" replace />} />
        </Routes>
      </Card>

    </section>
  );
};

export default DetectedReport;
