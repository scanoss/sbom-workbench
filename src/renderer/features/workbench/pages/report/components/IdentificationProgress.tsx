import React, { useContext, useEffect, useState } from 'react';
import { Chart } from 'chart.js';
import { Button, Tooltip } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { shell } from 'electron';
import { ExportFormat } from '../../../../../../api/export-service';
import { HashType } from '../../../../../../api/types';
import { userSettingService } from '../../../../../../api/userSetting-service';


const LicensesChart = ({ data }) => {
  const chartRef = React.createRef<any>();
  const [percentage, setPercentage] = useState<number>(0);
  const [token, setToken] = useState<string>('');

  const notarizeSBOM = async () => {
    const hash = await ExportFormat.notarizeSBOM(HashType.SHA256);
    shell.openExternal(`https://sbom.info/?hash=${hash}&type=${HashType.SHA256}&token=${token}`);
  };

  const readToken = async () => {
    const { TOKEN } = await userSettingService.get();
    setToken(TOKEN || '');
  };
  useEffect(() => {
    const percentage = Math.floor(((data?.identifiedFiles + data?.ignoredFiles) * 100) / data.detectedFiles);
    const pending = 100 - percentage;
    setPercentage(percentage);

    readToken();

    const tooltipPlugin = Chart.registry.getPlugin('tooltip');
    tooltipPlugin.positioners.custom = function (elements, eventPosition) {
      return {
        x: eventPosition.x,
        y: eventPosition.y,
      };
    };

    const chart = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: [`${percentage}%`],
        datasets: [
          {
            label: '',
            data: [percentage],
            borderWidth: 0,
            backgroundColor: ['#22C55E'],
            barThickness: 34,
          },
          {
            label: 'Identified',
            data: [pending],
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
          tooltip: {
            position: 'custom',
            callbacks: {
              title() {
                return `Pending files\n${data?.pendingFiles}`;
              },
              label() {
                return ``;
              },
            },
            displayColors: false,
          },
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
          <span className="label-not-found">No matches found</span>
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
          <strong>{data.totalFiles}</strong> total files
        </span>
      </div>
      <div className={token ? 'notarize-container' : 'hide'}>
        {percentage < 100 || !token.length ? (
          <>
            <Tooltip title="Identification progress is not 100% or your token is not defined">
              <span>
                <Button
                  disabled
                  variant="contained"
                  color="secondary"
                  endIcon={<OpenInNewIcon />}
                  type="button"
                  onClick={notarizeSBOM}
                >
                  Post to SBOM ledger
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
            Post to SBOM ledger
          </Button>
        )}
      </div>
    </div>
  );
};

export default LicensesChart;
