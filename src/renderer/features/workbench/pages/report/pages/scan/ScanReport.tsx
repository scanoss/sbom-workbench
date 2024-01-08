import React, { useContext, useEffect, useState } from 'react';

import { reportService } from '@api/services/report.service';
import { cryptographyService } from '@api/services/cryptography.service';
import { vulnerabilityService } from '@api/services/vulnerability.service';
import { useSelector } from 'react-redux';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { useTranslation } from 'react-i18next';
import Loader from '@components/Loader/Loader';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { dialogController } from '../../../../../../controllers/dialog-controller';
import IdentifiedReport from './IdentifiedReport';
import DetectedReport from './DetectedReport';
import { NavigationTabs } from './components/Navigation';
import { ExportButton } from './components/ExportButton';

const ScanReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = useSelector(selectWorkbench);
  const dialogCtrl = useContext(DialogContext) as IDialogContext;
  const { t } = useTranslation();

  const [detectedData, setDetectedData] = useState(null);
  const [identifiedData, setIdentifiedData] = useState(null);

  const isEmpty = identifiedData?.summary.identified.scan === 0
    && identifiedData?.summary.original === 0
    && identifiedData?.licenses.length === 0;

  const setTab = (identified) => {
    if (location.pathname.endsWith('scan')) {
      if (state.tree.hasIdentified || state.tree.hasIgnored || identified.licenses.length > 0) {
        navigate('identified', { replace: true });
      } else {
        navigate('detected', { replace: true });
      }
    }
  };

  const refresh = async () => {
    const dialog = await dialogCtrl.createProgressDialog(t('Dialog:UpdatingReport').toUpperCase());
    dialog.present();
    try {
      const promises = [cryptographyService.update(), vulnerabilityService.update()];
      await Promise.all(promises);
      dialog.finish({ message: t('Dialog:UpdateFinished').toUpperCase() });
    } catch (e: any) {
      dialog.dismiss();
      dialogController.showError(t('Dialog:ErrorUpdatingReport'), e.message);
    } finally {
      dialog.dismiss({ delay: 1500 });
      await getReport();
    }
  };

  const getReport = async () => {
    const summary = await reportService.getSummary();
    const detected = await reportService.detected();
    const identified = await reportService.identified();
    setDetectedData({ ...detected, summary });
    setIdentifiedData({ ...identified, summary });
    return { summary, detected, identified };
  };

  useEffect(() => {
    const init = async () => {
      const { identified } = await getReport();
      setTab(identified);
    };
    init();
  }, []);

  if (!detectedData || !identifiedData) {
    return <Loader message="Loading reports" />;
  }

  return (
    <section id="Report" className="app-page">
      <header className="app-header d-flex space-between align-center">
        <NavigationTabs />
        <ExportButton empty={isEmpty} />
      </header>
      <main className="app-content">
        <Routes>
          <Route path="detected/*" element={detectedData && <DetectedReport data={detectedData} onRefresh={refresh} />} />
          <Route path="identified/*" element={identifiedData && <IdentifiedReport data={identifiedData} onRefresh={refresh} />} />
        </Routes>
      </main>
    </section>
  );
};

export default ScanReport;
