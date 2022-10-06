import React, { useEffect, useState } from 'react';
import { Button, Tooltip } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTranslation } from 'react-i18next';
import { Chart } from 'chart.js';

import { projectService } from '@api/services/project.service';
import { exportService } from '@api/services/export.service';
import { HashType } from '@api/types';

const LicensesChart = ({ data }) => {
  const chartRef = React.createRef<any>();
  const { t } = useTranslation();

  const [percentage, setPercentage] = useState<number>(0);
  const [token, setToken] = useState<string>('');

  const notarizeSBOM = async () => {
    const hash = await exportService.notarizeSBOM(HashType.SHA256);
    window.shell.openExternal(`https://sbom.info/?hash=${hash}&type=${HashType.SHA256}&token=${token}`);
  };

  const readToken = async () => {
    const TOKEN = await projectService.getToken();
    setToken(TOKEN || '');
  };
  useEffect(() => {
    const percentage = Math.floor(((data?.identified.scan + data?.original) * 100) / data.summary.matchFiles);
    setPercentage(percentage);

    readToken();

    const chart = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: [``],
        datasets: [
          {
            label: t('Title:Identified'),
            data: [data?.identified.scan + data?.original],
            borderWidth: 0,
            backgroundColor: ['#22C55E'],
            barThickness: 34,
          },
          {
            label: t('Title:Pending'),
            data: [data.pending],
            borderWidth: 0,
            backgroundColor: ['#F97316'],
            barThickness: 34,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          y: {
            stacked: true,
            beginAtZero: true,
            grid: {
              display: false,
              drawBorder: false,
            },
            display: false,
          },
          x: {
            max: data.summary.matchFiles === 0 ? 1 : data.summary.matchFiles,
            stacked: true,
            beginAtZero: true,
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
            labels: {
              boxWidth: 0,
            },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [data]);

  return (
    <div id="IdentificationProgress">
      <div className="identification-canvas-container">
        {Number.isNaN(percentage) ? (
          <span className="label-not-found">{t('Title:NoMatchesFound')}</span>
        ) : (
          <>
            <span className="label">{percentage}%</span>
            <div className="progress-bar">
              <canvas ref={chartRef} />
            </div>
          </>
        )}
      </div>
      <div className="total-files-container">
        <span className="total-files-label">
          {t('NDetectedFiles', { count: data.summary.matchFiles })}
        </span>
      </div>
      <div className={token ? 'notarize-container' : 'hide'}>
        {percentage < 100 || !token.length ? (
          <>
            <Tooltip title={t('Tooltip:IdentificationProgressIsNot100')}>
              <span>
                <Button
                  disabled
                  variant="contained"
                  color="secondary"
                  endIcon={<OpenInNewIcon />}
                  type="button"
                  onClick={notarizeSBOM}
                >
                 {t('Button:PostToSbomLedger')}
                </Button>
              </span>
            </Tooltip>
          </>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            endIcon={<OpenInNewIcon />}
            type="button"
            onClick={notarizeSBOM}
          >
            {t('Button:PostToSbomLedger')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default LicensesChart;
