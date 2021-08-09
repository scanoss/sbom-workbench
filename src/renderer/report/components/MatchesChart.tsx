import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js';

const MatchesChart = ({ data }) => {
  const chartRef = React.createRef<any>();
  const [percentage, setPercentage] = useState<number>(0);

  useEffect(() => {
    const percentage = Math.floor(((data?.identifiedFiles + data?.ignoredFiles) * 100) / data.detectedFiles);
    const pending = 100 - percentage;
    setPercentage(percentage);

    const chart = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: [`${percentage}%`],
        datasets: [
          {
            label: '',
            data: [percentage],
            borderWidth: 0,
            backgroundColor: ['#6366F1'],
            barThickness: 42,
          },
          {
            label: 'Identified',
            data: [pending],
            borderWidth: 0,
            backgroundColor: ['#A5B4FC'],
            barThickness: 42,
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
            callbacks: {
              label() {
                return ``;
              },
              title() {
                return `${data?.pendingFiles} Files`;
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
    <div id="MatchesChart">
      <div className="matches-canvas-container">
        <div className="label-match-container">
          <span className="label-match">{percentage}%</span>
          <span className="label-match-sublabel">Match</span>
        </div>
        <div className="progress-bar">
          <canvas ref={chartRef} />
        </div>
        <div className="label-nomatch-container">
          <span className="label-nomatch">{percentage}%</span>
          <span className="label-nomatch-sublabel">No Match</span>
        </div>
      </div>
      <div className="total-files-container">
        <span className="total-files-label">Total Files: {data.totalFiles}</span>
      </div>
    </div>
  );
};

export default MatchesChart;
