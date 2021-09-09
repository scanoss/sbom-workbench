import React, { useEffect } from 'react';
import { Chart } from 'chart.js'

const CryptoChart = ({ data }) => {
  const chartRef = React.createRef<any>();

  useEffect( () => {
      const chart = new Chart(chartRef.current, {
        type: 'bar',
        data: {
          labels: data.map(d => d.label),
          datasets: [{
            label: 'example',
            data: data.map(d => d.value),
            borderWidth: 0,
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)',
              'rgb(103,86,255)',
              'rgb(97,255,86)', // TODO: estos se tienen q generar automaticamente
            ],
          }]
        },
        options: {
          plugins: {
            legend: { position: 'right'}
          }
        }
      });

      return () => chart.destroy();

  }, [data]);

  return (
    <canvas ref={chartRef} />
  );
};

export default CryptoChart;
