import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js';

const MatchesChart = ({ data }) => {
  const chartRef = React.createRef<any>();
  const [percentage, setPercentage] = useState<number>(0);

  useEffect(() => {
    const percentage = Math.floor(((data?.detectedFiles) * 100) / data?.includedFiles);
    const noMatches = 100 - percentage;
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
            data: [100 - percentage],
            borderWidth: 0,
            backgroundColor: ['#A5B4FC'],
            barThickness: 42,
          },
        ],
      },
      options: {
        responsive: true,
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
                return `${data?.detectedFiles} of ${data?.includedFiles} files scanned`;
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
      {
        Number.isNaN(percentage) ? (
          <p className="report-empty">No matches found</p>
        ) : (
          <>
          <div className="matches-canvas-container">
          <div className="label-match-container">
            <span className="label-match">{percentage}%</span>
            <span className="label-match-sublabel">Match</span>
          </div>
          <canvas ref={chartRef} />
          <div className="label-nomatch-container">
            <span className="label-nomatch">{100 - percentage}%</span>
            <span className="label-nomatch-sublabel">No Match</span>
          </div>
          </div>
          <div className="total-files-container">
        <span className="total-files-label">Scanned Files: {data?.includedFiles}</span>
      </div>
          </>
        )
      }
    </div>
  );
};

export default MatchesChart;
