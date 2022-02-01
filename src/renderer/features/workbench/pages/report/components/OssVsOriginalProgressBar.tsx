import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js';

const OssVsOriginalProgressBar = ({ data }) => {
  const chartRef = React.createRef<any>();
  const [matchedFiles, setMatchedFiles] = useState<number>(0);

  // FIXME: Refactor on useEffect of bar chart
  useEffect(() => {
    setMatchedFiles(data.totalFiles);
    const ossFiles = Math.round((data.identifiedFiles * 100) / data.scannedFiles);
    const originalFiles = Math.round((data.ignoredFiles * 100) / data.scannedFiles);
    const pendingFiles = Math.round((data.pendingFiles * 100) / data.scannedFiles);

    const canvas = document.getElementById('OssOriginalProgress') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    const tooltipPlugin = Chart.registry.getPlugin('tooltip');
    tooltipPlugin.positioners.custom = function (elements, eventPosition) {
      return {
        x: eventPosition.x,
        y: eventPosition.y,
      };
    };

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [``],
        datasets: [
          {
            label: 'OSS',
            data: [ossFiles],
            borderWidth: 0,
            backgroundColor: ['#22C55E'],
            barThickness: 34,
          },
          {
            label: 'Pending',
            data: [pendingFiles],
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
            const percentage = ossFiles + pendingFiles;
            const meta = chart.getDatasetMeta(1); // Gets datasats[1]
            if (!meta.hidden) {
              meta.data.forEach((element) => {
                const { x }: any = element.tooltipPosition();
                chart.ctx.beginPath();
                chart.ctx.moveTo(x, 30);
                chart.ctx.strokeStyle = 'black';
                chart.ctx.lineTo(x, 90);
                chart.ctx.stroke();
                chart.ctx.fillText(`${percentage}%`, percentage < 95 ? x + 10 : x - 35, 85);
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
      <div className="oss-canvas-container">
        {Number.isNaN(matchedFiles) ? (
          <span className="label-not-found">No matches found</span>
        ) : (
          <>
            <div className="progress-bar">
              <canvas id="OssOriginalProgress" ref={chartRef} />
            </div>
          </>
        )}
      </div>
      <div className="total-files-container">
        <span className="total-files-label">
          <strong>{data.scannedFiles}</strong> total files
        </span>
      </div>
    </div>
  );
};

export default OssVsOriginalProgressBar;
