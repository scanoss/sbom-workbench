import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js';

const OssVsOriginalProgressBar = ({ data }) => {
  const chartRef = React.createRef<any>();
  const [matchedFiles, setMatchedFiles] = useState<number>(0);
  const totalFiles = data.scannedFiles === 0 ? data.totalFiles : data.scannedFiles;
  const ossFiles = (data.identifiedFiles * 100) / totalFiles;
  const pendingFiles = (data.pendingFiles * 100) / totalFiles;
  const percentage = ossFiles + pendingFiles;

  useEffect(() => {
    setMatchedFiles(data.totalFiles);
    const originalFiles = totalFiles - (data.identifiedFiles + data.pendingFiles);

    const chart = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: [``],
        datasets: [
          {
            label: 'OSS',
            data: [data.identifiedFiles],
            borderWidth: 0,
            backgroundColor: ['#22C55E'],
            barThickness: 34,
          },
          {
            label: 'Pending',
            data: [data.pendingFiles],
            borderWidth: 0,
            backgroundColor: ['#F97316'],
            barThickness: 34,
          },
          {
            label: 'Original',
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
          <span className="label-not-found">No matches found</span>
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
        <span className="total-files-label">
          <strong>{data.scannedFiles}</strong> scanned files
        </span>
      </div>
    </div>
  );
};

export default OssVsOriginalProgressBar;
