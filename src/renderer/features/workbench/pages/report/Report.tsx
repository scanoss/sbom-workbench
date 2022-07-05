import { Button, Tooltip, createStyles, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { reportService } from '@api/services/report.service';
import { useSelector } from 'react-redux';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import DetectedReport from './pages/DetectedReport';
import IdentifiedReport from './pages/IdentifiedReport';

const useStyles = makeStyles(() =>
  createStyles({
    tooltip: {
      textAlign: 'center',
      fontSize: '.75rem',
      maxWidth: 140,
    },
  })
);

const Nav = () => {
  const classes = useStyles();

  return (
    <section className="nav">
      <NavLink
        to="detected"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        tabIndex={-1}
      >
        <Tooltip
          title="Potential Bill of Materials based on automatic detection"
          classes={{ tooltip: classes.tooltip }}
        >
          <Button size="large">Detected</Button>
        </Tooltip>
      </NavLink>
      <NavLink
        to="identified"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        tabIndex={-1}
      >
        <Tooltip
          title="Actual Bill of Materials based on confirmed identifications"
          classes={{ tooltip: classes.tooltip }}
        >
          <Button size="large">Identified</Button>
        </Tooltip>
      </NavLink>
    </section>
  );
};

const Reports = () => {
  const navigate = useNavigate();
  const state = useSelector(selectWorkbench);

  const [detectedData, setDetectedData] = useState(null);
  const [identifiedData, setIdentifiedData] = useState(null);

  const setTab = (identified) => {
    if (state.tree.hasIdentified || state.tree.hasIgnored || identified.licenses.length > 0) {
      navigate('identified', { replace: true });
    }
  };

  useEffect(() => {
    const init = async () => {
      const summary = await reportService.getSummary();
      const detected = await reportService.detected();
      const identified = await reportService.identified();
      setDetectedData({ ...detected, summary });
      setIdentifiedData({ ...identified, summary });
      setTab(identified);
    };
    init();
  }, []);

  return (
    <>
      <section id="Report" className="app-page">
        <header className="app-header">
          <Nav />
        </header>
        <main className="app-content">
          <Routes>
            <Route path="detected" element={detectedData && <DetectedReport data={detectedData} />} />
            <Route path="identified" element={identifiedData && <IdentifiedReport data={identifiedData} />} />
            <Route path="" element={<Navigate to="detected" />} />
          </Routes>
        </main>
      </section>
    </>
  );
};

export default Reports;
