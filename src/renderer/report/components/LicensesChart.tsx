import React, { useEffect } from 'react';
import { Chart } from 'chart.js';

const LicensesChart = ({ data }) => {
  const chartRef = React.createRef<any>();

  useEffect(() => {
    const chart = new Chart(chartRef.current, {
      type: 'doughnut',
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            label: 'example',
            data: data.map((d) => d.value),
            borderWidth: 0,
            backgroundColor: [
              '#E8B34B',
              '#E22C2C',
              '#5754D0',
              '#9F69C0',
              '#FE7F10', // TODO: estos se tienen q generar automaticamente
            ],
            cutout: '70%',
          },
        ],
      },
      options: {
        plugins: {
          legend: { display: false },
        },
      },
    });

    return () => chart.destroy();
  }, [data]);

  return (
    <div className="LicensesChart">
      <div className="report-titles-container">
        <span className="report-titles">Licenses</span>
      </div>
      <div>
        <canvas ref={chartRef} />
        <div className="licenses-scroll" />
      </div>
    </div>
  );
};

export default LicensesChart;
