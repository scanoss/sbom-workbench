import React, { useEffect } from 'react';
import { Chart } from 'chart.js';

const LicensesChart = ({ data }) => {
  const chartRef = React.createRef<any>();

  useEffect(() => {
    const chart = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            label: '',
            data: data.map((d) => d.value),
            borderWidth: 0,
            backgroundColor: ['#22C55E', '#F97316'],
            barThickness: 50,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: false,
              drawBorder: false,
            },
          },
          x: {
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
            }
          }
        },
      },
    });

    return () => chart.destroy();
  }, [data]);

  return (
    <div className="IdentificationProgress">
      <div className="report-titles-container">
        <span className="report-titles">Identification Progress</span>
      </div>
      <div>
        <canvas ref={chartRef} />
        <div className="licenses-scroll" />
      </div>
      <canvas ref={chartRef} />
    </div>
  )
};

export default LicensesChart;
