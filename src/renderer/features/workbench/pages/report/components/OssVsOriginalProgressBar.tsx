import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js';

const OssVsOriginalProgressBar = ({ data }) => {
  const chartRef = React.createRef<any>();
  const [matchedFiles, setMatchedFiles] = useState<number>(0);
  const [ossFiles, setOssFiles] = useState<number>(0);
  const [originalFiles, setoriginalFiles] = useState<number>(0);

  useEffect(() => {
    setMatchedFiles(data.totalFiles);
    const ossFiles = Math.floor((data.identifiedFiles * 100) / data.totalFiles);
    setOssFiles(ossFiles);
    const originalFiles = Math.floor((data.totalFiles - data.identifiedFiles) * 100 / data.totalFiles);
    setoriginalFiles(originalFiles);

    console.log(data.identifiedFiles);
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
        labels: [`${data.totalFiles}%`],
        datasets: [
          {
            label: 'OSS',
            data: [ossFiles],
            borderWidth: 0,
            backgroundColor: ['#22C55E'],
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
        plugins: {
          tooltip: {
            position: 'custom',
            callbacks: {
              title() {
                return `OSS Files ${data.identifiedFiles}\nOriginal Files ${data.totalFiles - data.identifiedFiles}`;
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
  }, []);

  return (
    <div id="IdentificationProgress">
      <div className="identification-canvas-container">
        {Number.isNaN(matchedFiles) ? (
          <span className="label-not-found">No matches found</span>
        ) : (
          <>
            <span className="label">{ossFiles}%</span>
            <div className="progress-bar-oss-original ">
              <canvas ref={chartRef} />
            </div>
            <span className="label-original">{originalFiles}%</span>
          </>
        )}
      </div>
      <div className="total-files-container">
        <span className="total-files-label">
          <strong>{data.totalFiles}</strong> total files
        </span>
      </div>
    </div>
  );
};

export default OssVsOriginalProgressBar;
