/* eslint-disable no-undef */

'use_strict';

const identifiedData = '#DATA';
const auxData = Array.from(JSON.parse(identifiedData));

const labels = [];
const values = [];

for (let i = 0; i < auxData.length; i += 1) {
  labels.push(auxData[i].label);
  values.push(auxData[i].value);
}

const color = [
  '#E8B34B',
  '#E22C2C',
  '#5754D0',
  '#9F69C0',
  '#FE7F10',
  '#E56399',
  '#E637BF',
  '#474647',
  '#153243',
  '#2DE1C2',
  '#F05365',
  '#A2D729',
  '#3C91E6',
  '#FA824C',
  '#C94277',
  '#E56B6F',
  '#F71735',
  '#011627',
  '#724E91',
  '#7D451B',
  '#9BE564',
];

insertLicenses();
function insertLicenses() {
  const bodyLicenseTable = document.querySelector('#body-license-table');

  const row = auxData
    .map(
      (d, i) => `<tr style="height:10px">
                        <td class="colour-ref-container"><div style="width: 20%;  height: 20px; background-color:${
                          color[i % auxData.length]
                        };" ></div></td>
                        <td style="width: 40%;">${d.label}</td>
                        <td style="width: 40%;">${d.value}</td>
                   </tr>`
    )
    .join('');

  bodyLicenseTable.innerHTML = row;
}

pieChart();
function pieChart() {
  const data = {
    labels,
    datasets: [
      {
        label: 'My First dataset',
        backgroundColor: color,
        borderColor: 'rgb(255, 255, 255)',
        data: values,
      },
    ],
  };
  const config = {
    type: 'pie',
    data,
    options: {
      elements: {
        arc: {
          borderWidth: 1,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  };
  const myChart = new Chart(document.getElementById('myChart'), config);
}
