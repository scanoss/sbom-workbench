import React, { useEffect } from 'react';
import { Chart } from 'chart.js';
import { colorsForLicense } from '../../../../../../utils/utils';

const LicensesChart = ({ data }) => {
  const chartRef = React.createRef<any>();

  // const counter = {
  //   id: 'counter',
  //   beforeDraw(chart, args, options) {
  //     const {chartArea: { top, left, bottom, right, width, height },
  //     } = chart;
  //     chartRef.save();
  //     chartRef.fillStyle = 'blue';
  //     chartRef.fillRect(200, 200, 10, 10);
  //     // x0 = starting point  on the horizontal level
  //     // y0 = starting point  on the vertical level
  //     // x1 = lenght of the shape in pixel on the horizontal level
  //     // y1 = lenght of the shape in pixel on the vertical level
  //   },
  // };

  // const licenseCounter = 9;

  // const licenseCounterStructure = (
  //   <div className="main-license-counter">
  //     <div className="number-license-counter">{licenseCounter}</div>
  //     <div className="number-license-label">Licenses found</div>
  //   </div>
  // );

  // const image = new Image();
  // image.src = 'https://www.chartjs.org/img/chartjs-logo.svg';

  // const plugin = {
  //   id: 'custom_canvas_background_image',
  //   beforeDraw: (chart) => {
  //     if (image.complete) {
  //       const { ctx } = chart;
  //       const { top, left, width, height } = chart.chartArea;
  //       const x = left + width / 2 - image.width / 2;
  //       const y = top + height / 2 - image.height / 2;
  //       ctx.drawImage(image, x, y);
  //     } else {
  //       image.onload = () => chart.draw();
  //     }
  //   },
  // };

  useEffect(() => {
    const chart = new Chart(chartRef.current, {
      type: 'doughnut',
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            data: data.map((d) => d.value),
            borderWidth: 0,
            backgroundColor: colorsForLicense,
            cutout: 75,
          },
        ],
      },
      options: {
        plugins: {
          legend: { display: false },
        },
      },
      // plugins: [plugin],
    });

    return () => chart.destroy();
  }, [data]);

  return (
    <div id="LicensesChart">
      <div>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default LicensesChart;
