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
import { dialogController } from '../../../../../../controllers/dialog-controller';
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

  const { detected, identified, isLoading } = useSelector(selectReportState);

  const isEmpty = identified?.summary.identified.scan === 0
    && identified?.summary.original === 0
    && identified?.licenses.length === 0;

  const refresh = async () => {
    const dialog = await dialogCtrl.createProgressDialog(t('Dialog:UpdatingReport').toUpperCase());
    dialog.present();
    try {
      await dispatch(forceUpdate()).unwrap();
      dialog.finish({ message: t('Dialog:UpdateFinished').toUpperCase() });
    } catch (e: any) {
      dialog.dismiss();
      dialogController.showError(t('Dialog:ErrorUpdatingReport'), e.message);
    } finally {
      dialog.dismiss({ delay: 1500 });
      dispatch(getReport());
    }
  };

  const setTab = (identified) => {
    if (location.pathname.endsWith('scan')) {
      if (state.tree.hasIdentified || state.tree.hasIgnored || identified.licenses.length > 0) {
        navigate('identified', { replace: true });
      } else {
        navigate('detected', { replace: true });
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      const { payload } = await dispatch<any>(getReport());
      setTab(payload.identified);
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
          <Route path="detected/*" element={detected && <DetectedReport data={detected} onRefresh={refresh} />} />
          <Route path="identified/*" element={identified && <IdentifiedReport data={identified} onRefresh={refresh} />} />
        </Routes>
      </main>
    </section>
  );
};

export default ScanReport;
