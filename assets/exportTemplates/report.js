/* eslint-disable no-undef */

'use_strict';

const identifiedData = '#DATA';
const auxSummaryData = '#SUMMARY';
const auxData = Array.from(JSON.parse(identifiedData));
const summaryData = JSON.parse(auxSummaryData);


const percentage = Math.floor((original + summaryData.identifiedFiles * 100) / summaryData.scannedFiles);

const ossFilesPercentage = Math.floor((summaryData.identifiedFiles * 100) / summaryData.totalFiles);

const originalFilesPercentage = Math.floor(
  ((summaryData.totalFiles - summaryData.identifiedFiles) * 100) / summaryData.totalFiles
);

const labels = [];
const values = [];
const rowDataTable = {};

function rowData() {
  auxData.forEach((d) => {
    if (rowDataTable[d.label] === undefined) {
      rowDataTable[d.label] = {
        components: {},
        componentCount: 0,
      };
    }

    d.components.forEach((component) => {
      if (rowDataTable[d.label].components[component.name] === undefined) {
        rowDataTable[d.label].components[component.name] = {
          versions: [],
          vendor: component.vendor,
          purl: component.purl,
        };
      }
      rowDataTable[d.label].components[component.name].versions.push(component.version);
      rowDataTable[d.label].components[component.name].versions.sort();
    });
    rowDataTable[d.label].componentCount += d.components.length;
  });
}

rowData();

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

function insertLicenseRow() {
  const bodyLicenseTable = document.querySelector('#body-license-table');
  let counter = 0;
  Object.keys(rowDataTable).forEach((key) => {
    const tr = document.createElement('tr');
    const tdColor = document.createElement('td');
    const licenseRefContainer = document.createElement('div');
    licenseRefContainer.classList.add('license-ref-container');
    const colourRefLicenseContainer = document.createElement('div');
    colourRefLicenseContainer.classList.add('colour-ref-license-container');
    const colourRefLicense = document.createElement('div');
    colourRefLicense.classList.add('colour-ref-license');
    colourRefLicense.style.backgroundColor = color[counter % auxData.length];
    colourRefLicenseContainer.appendChild(colourRefLicense);
    const licenseLabel = document.createElement('div');
    licenseLabel.classList.add('license-label');
    const licenseName = document.createElement('div');
    licenseName.classList.add('license-name');
    const licenseNameP = document.createElement('p');
    licenseNameP.innerText = key;
    licenseName.appendChild(licenseNameP);
    licenseLabel.appendChild(licenseName);

    licenseRefContainer.appendChild(colourRefLicenseContainer);
    licenseRefContainer.appendChild(licenseLabel);

    tdColor.appendChild(licenseRefContainer);
    tr.appendChild(tdColor);

    // count components
    const tdCount = document.createElement('td');
    tdCount.classList.add('width-license-count');

    const textCount = document.createTextNode(`${rowDataTable[key].componentCount}`);
    tdCount.appendChild(textCount);
    tr.appendChild(tdCount);

    bodyLicenseTable.appendChild(tr);

    counter += 1;
  });
}

insertLicenseRow();

function dropDown(id) {
  const nodes = document.getElementsByClassName(id);
  for (let i = 0; i < nodes.length; i += 1) {
    if (nodes[i].classList.contains('hide')) {
      nodes[i].classList.remove('hide');
      nodes[i].classList.add('show');
    } else {
      nodes[i].classList.remove('show');
      nodes[i].classList.add('hide');
    }
  }
}

function addButtonListener() {
  const btn = document.querySelectorAll('.button-solid');

  btn.forEach((button) => {
    button.addEventListener('click', (event) => {
      dropDown(event.target.id);
    });
  });
}

function insertLicenseDetailRow() {
  const bodyLicenseTable = document.querySelector('#body-license-detail-table');

  let counter = 0;
  Object.keys(rowDataTable).forEach((key) => {
    const tr = document.createElement('tr');
    const tdColor = document.createElement('td');
    const licenseRefContainer = document.createElement('div');
    licenseRefContainer.classList.add('license-ref-container');
    const colourRefLicenseContainer = document.createElement('div');
    colourRefLicenseContainer.classList.add('colour-ref-license-container');
    const colourRefLicense = document.createElement('div');
    colourRefLicense.classList.add('colour-ref-license');
    colourRefLicense.style.backgroundColor = color[counter % auxData.length];
    colourRefLicenseContainer.appendChild(colourRefLicense);
    const licenseLabel = document.createElement('div');
    licenseLabel.classList.add('license-label');
    const label = document.createElement('div');
    label.classList.add('label');
    const labelP = document.createElement('p');
    labelP.innerText = 'License';
    label.appendChild(labelP);
    licenseLabel.appendChild(label);
    const licenseName = document.createElement('div');
    licenseName.classList.add('license-name');
    const licenseNameP = document.createElement('p');
    licenseNameP.innerText = key;
    licenseName.appendChild(licenseNameP);
    licenseLabel.appendChild(licenseName);

    licenseRefContainer.appendChild(colourRefLicenseContainer);
    licenseRefContainer.appendChild(licenseLabel);

    tdColor.appendChild(licenseRefContainer);
    tr.appendChild(tdColor);

    // count components
    const tdCount = document.createElement('td');
    tdCount.classList.add('width-license-count');
    const btn = `<button class="button-solid" id="${counter}">${rowDataTable[key].componentCount} component found &#8711;</button>`;

    tdCount.innerHTML = btn;
    tr.appendChild(tdCount);
    bodyLicenseTable.appendChild(tr);
    let rows = '';
    for (const [compName, value] of Object.entries(rowDataTable[key].components)) {
      const version =
        value.versions.length > 1
          ? `${value.versions.toString().replace(/,/g, ' , ')} &#10;&#13; (${value.versions.length} versions)`
          : value.versions.toString();
      rows += `<tr class="component-row">
                    <td colspan="2" class="${counter} hide">
                      <div class="component-license-detail">
                        <div class="comp-detail-container">
                          <div class="comp-label">
                            <p>Component</p>
                          </div>  
                        <div class="comp-info">
                            <p>${compName}</p>
                          </div>
                        </div>
                         <div class="comp-detail-container"> 
                         <div class="comp-label">
                          <p>Purl</p>
                         </div>  
                         <div class="comp-info">
                          <p>${value.purl}</p>
                        </div>
                        </div>
                        <div class="comp-detail-container">
                          <div class="comp-label">
                            <p>Versions</p>
                          </div>  
                          <div class="comp-info">
                            <p>${version}</p>    
                          </div>
                        </div>          
                        </div>
                     
                    </td>
                </tr>`;
    }

    bodyLicenseTable.innerHTML += rows;

    counter += 1;
  });
  addButtonListener();
}
insertLicenseDetailRow();

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

pieChart();

function progressBar() {
  const oss = document.querySelector('#oss');
  oss.innerText = `${summaryData.identifiedFiles} OSS Files`;

  const original = document.querySelector('#original');
  original.innerText = `${summaryData.totalFiles - summaryData.identifiedFiles} Original Files`;

  const totalFiles = document.querySelector('#total-files');
  totalFiles.innerText = `Total files : ${summaryData.totalFiles}`;

  document.querySelector('.oss-percentage').innerHTML = `${ossFilesPercentage}%`;
  document.querySelector('.original-percentage').innerHTML = `${originalFilesPercentage}%`;

  const chart = new Chart(document.getElementById('progress-bar'), {
    type: 'bar',
    data: {
      labels: [`${percentage}%`],
      datasets: [
        {
          label: '',
          data: [ossFilesPercentage],
          borderWidth: 0,
          backgroundColor: ['#22C55E'],
          barThickness: 34,
        },
        {
          label: 'Identified',
          data: [originalFilesPercentage],
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
              return `Pending files\n${summaryData?.pendingFiles}`;
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
}

progressBar();

document.getElementById('drop-down-license-detail-btn').addEventListener('click', () => {
  const aux = document.querySelector('.drop-down-license-detail');
  if (aux.classList.contains('hide')) {
    aux.classList.remove('hide');
    aux.classList.add('show-license-detail');
  } else {
    aux.classList.remove('show-license-detail');
    aux.classList.add('hide');
  }
});
