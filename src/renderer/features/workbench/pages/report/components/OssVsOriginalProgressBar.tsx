import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js';
import { useTranslation } from 'react-i18next';

const OssVsOriginalProgressBar = ({ data }) => {
  const { t } = useTranslation();
  const chartRef = React.createRef<any>();
  const [matchedFiles, setMatchedFiles] = useState<number>(0);
  const totalFiles = data.pending + data.summary.noMatchFiles + data.identified.total + data.original;
  const ossFiles = (data.identified.total * 100) / totalFiles;
  const pendingFiles = (data.pending * 100) / totalFiles;
  const percentage = ossFiles + pendingFiles;

  useEffect(() => {
    setMatchedFiles(data.summary.matchFiles);
    const originalFiles = data.summary.noMatchFiles + data.original;
    const chart = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: [``],
        datasets: [
          {
            label: t('Title:OSS'),
            data: [data.identified.total],
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
          {
            label: t('Title:Original'),
            data: [originalFiles],
            borderWidth: 0,
            backgroundColor: ['#A1A1AA'],
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
            max: totalFiles,
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
      },
      plugins: [
        {
          id: 'line',
          afterDraw: (chart) => {
            const meta = chart.getDatasetMeta(1); // Gets datasets[1]
            if (!meta.hidden) {
              meta.data.forEach((element) => {
                const { x }: any = element.tooltipPosition();
                chart.ctx.beginPath();
                chart.ctx.moveTo(x, 20);
                chart.ctx.strokeStyle = 'black';
                chart.ctx.lineTo(x, 90);
                chart.ctx.stroke();
                chart.ctx.save();
              });
            }
          },
        },
      ],
    });

    return () => chart.destroy();
  }, []);

  return (
    <div id="OssProgress">
      <div className="identification-canvas-container">
        {Number.isNaN(matchedFiles) ? (
          <span className="label-not-found">{t('Title:NoMatchesFound')}</span>
        ) : (
          <>
            <span className="label">{Math.floor(percentage)}%</span>
            <div className="progress-bar">
              <canvas id="OssOriginalProgress" ref={chartRef} />
            </div>
          </>
        )}
      </div>
      <div className="total-files-container">
        <span className="total-files-label">{t('NTotalFiles', { count: totalFiles})}</span>
      </div>
    </div>
  );
};

export default OssVsOriginalProgressBar;
