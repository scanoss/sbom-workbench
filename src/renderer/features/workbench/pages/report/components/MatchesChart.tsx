import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js';
import { useTranslation } from 'react-i18next';

const MatchesChart = ({ data }) => {
  const { t } = useTranslation();
  const chartRef = React.createRef<any>();
  const [percentage, setPercentage] = useState<number>(0);

  useEffect(() => {
    const percentage = Math.floor((data?.summary.matchFiles * 100) / (data.summary.noMatchFiles + data.summary.matchFiles));
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
            barThickness: 30,
          },
          {
            label: 'Identified',
            data: [100 - percentage],
            borderWidth: 0,
            backgroundColor: ['#A5B4FC'],
            barThickness: 30,
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
                return `${data.summary.matchFiles} of ${data.summary.noMatchFiles + data.summary.matchFiles} files scanned`;
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
      {Number.isNaN(percentage) ? (
        <p className="report-empty">{t('Title:NoMatchesFound')}</p>
      ) : (
        <>
          <div className="matches-canvas-container">
            <div className="label-match-container">
              <span className="label-match">{percentage}%</span>
              <span className="label-match-sublabel">{t('Match')}</span>
            </div>
            <canvas ref={chartRef} />
            <div className="label-nomatch-container">
              <span className="label-nomatch">{100 - percentage}%</span>
              <span className="label-nomatch-sublabel">{t('NoMatch')}</span>
            </div>
          </div>
          <div className="total-files-container">
            <span className="total-files-label">
              {t('NScannedFiles', {
                countScanned: (data.summary.noMatchFiles + data.summary.matchFiles),
                totalFiles: data.summary.totalFiles
              })}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default MatchesChart;
