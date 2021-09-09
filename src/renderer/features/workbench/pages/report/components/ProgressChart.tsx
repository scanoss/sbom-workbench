import React, { useEffect } from 'react';
import { Chart } from 'chart.js'

const ProgressChart = ({ progress }) => {
  const chartRef = React.createRef<any>();
  const data = [
   // progress.totalFiles - progress.includedFiles - progress.scannedFiles },
  ];const dataInv = [];
  if(progress) {;
  data[0] =  { label: 'Included', value: progress.includedFiles };
  data[1] =  { label: 'Filtered', value: progress.filteredFiles };
  data[2] = { label: 'User excluded', value: progress.totalFiles - progress.includedFiles - progress.filteredFiles }


dataInv[0] = { label: 'Pending', value: progress.pendingFiles };
dataInv[1] = { label: 'Identified', value: progress.identifiedFiles };
  dataInv[2] = { label: 'Ignored', value: progress.ignoredFiles };
  }

  useEffect(() => {
    const chart = new Chart(chartRef.current, {
      type: 'pie',
      data: {
        labels: [data.map((d) => d.label), dataInv.map((d) => d.label) ],
        datasets: [
          {
            label: 'Project',
            data: data.map((d) => d.value),
            borderWidth: 0,
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)',
              'rgb(103,86,255)',
              'rgb(97,255,86)', // TODO: estos se tienen q generar automaticamente
            ],
          },
         {
            label:  'Inventory',
            data: dataInv.map((d) => d.value),
            borderWidth: 0,
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)',
              'rgb(103,86,255)',
              'rgb(97,255,86)', // TODO: estos se tienen q generar automaticamente
            ],
          },
        ],
      },
      options: {
        plugins: {
          legend: { position: 'right' },
        },
      },
    });

    return () => chart.destroy();
  }, [data]);

  return <canvas ref={chartRef} />;
};

export default ProgressChart;
