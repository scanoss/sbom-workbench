import React, { useContext, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { useTranslation } from 'react-i18next';
import Loader from '@components/Loader/Loader';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { forceUpdate, getReport } from '@store/report-store/reportThunks';
import { selectReportState } from '@store/report-store/reportSlice';
import { AppDispatch } from '@store/store';
import IdentifiedReport from './IdentifiedReport';
import DetectedReport from './DetectedReport';
import { NavigationTabs } from './components/Navigation';
import { ExportButton } from './components/ExportButton';

const ScanReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const dialogCtrl = useContext(DialogContext) as IDialogContext;
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector(selectWorkbench);

  const { detected, identified, summary } = useSelector(selectReportState);

  const isEmpty = summary?.identified.scan === 0
    && summary?.original === 0
    && identified?.licenses.length === 0;

  const refresh = async () => {
    const dialog = await dialogCtrl.createProgressDialog(t('Dialog:UpdatingReport').toUpperCase());
    dialog.present();
    try {
      const results = await dispatch(forceUpdate()).unwrap();
      for (const result of results) {
        if (result.status === 'rejected') throw Error(result.reason);
      }

      dialog.finish({ message: t('Dialog:UpdateFinished').toUpperCase() });
    } catch (e: any) {
      dialog.dismiss();
      dialogCtrl.openAlertDialog(e);
    } finally {
      dialog.dismiss({ delay: 1500 });
      dispatch(getReport());
    }
  };

  const setTab = (identified, detected) => {
    if (
      state.tree.hasIdentified ||
      state.tree.hasIgnored ||
      identified.licenses.length > 0 ||
      identified.cryptographies?.local > 0
    ) {
      navigate('identified', { replace: true });
    } else {
      navigate('detected', { replace: true });
    }
  };

  useEffect(() => {
    const init = async () => {
      if (location.pathname.endsWith('scan')) { // only reload if user click in main item (avoid reload on back navigation)
        const { payload } = await dispatch<any>(getReport());
        if (payload) {
          setTab(payload.identified, payload.detected);
        }
      }
    };
    init();
  }, []);

  if (!detected || !identified) {
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
          <Route path="detected/*" element={detected && <DetectedReport data={detected} summary={summary} onRefresh={refresh} />} />
          <Route path="identified/*" element={identified && <IdentifiedReport data={identified} summary={summary} onRefresh={refresh} />} />
        </Routes>
      </main>
    </section>
  );
};

export default ScanReport;
