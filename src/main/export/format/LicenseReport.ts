import { reportService } from '../../services/ReportService';
import { Format } from '../Format';

export class LicenseReport extends Format {
  constructor() {
    super();
    this.extension = '-license-report.html';
  }

  // @override
  public async generate() {
    const data: any = await reportService.getReportIdentified();
    const labels = [];
    const values = [];

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

    for (let i = 0; i < data.licenses.length; i += 1) {
      labels.push(`"${data.licenses[i].label}"`);
      values.push(data.licenses[i].value);
    }


    const row = data.licenses
      .map(
        (d, i) => `<tr style="height:10px">
                    <td><div style="background-color: ${
                      color[i % data.licenses.length]
                    }; width:100%; height:100%;"></div></td>
                    <td style="padding-left: 10%;">${d.label}</td>
                    <td style="padding-left: 5%; text-align:center; vertical-align:middle;">${d.value}</td>
                  </tr>`).join('');

    const html = `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
            integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        <title>Document</title>
    </head>
    
    <style>
        .table td,
        .table thead th {
            padding: 0rem;
            vertical-align: middle;
            border-top: 1px solid #dee2e6;
            text-align: center;        
        }       
    </style>
    
    <body>
        <div style=" display: flex; flex-direction:column ; width: 100%; height: 200px;">  
            <div>
                <h1 style="text-align: center; margin-top:2%; margin-bottom: 4%;">Identified License Report</h1>
            </div>            
            <div style="display: flex; flex-direction: row; justify-content: space-evenly; height: 100px;">
                <div style="display: flex; justify-content: center; width: 40%;">
                    <div>
                        <canvas id="myChart"></canvas>
                    </div>
                </div>
                <div style="width:60%">
                    <table style="width: 60%; height:100px;" class="table">
                        <thead>
                            <tr>
                                <th style="width: 30px;" scope="col">Ref-color</th>
                                <th scope="col" style="padding-left: 10%; text">License Name</th>
                                <th scope="col" style="padding-left: 5%;">Component Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${row}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script>
            const data = {
                labels: [${labels.toString()}],
                datasets: [{
                    label: 'My First dataset',
                    backgroundColor: [${color
                      .toString()
                      .split(',')
                      .map((c) => `"${c}"`)}],
                    borderColor: 'rgb(255, 255, 255)',
                    data: [${values.toString()}],
                }]
            };
    
            const config = {
                type: 'pie',
                data: data,
                options: {
                    elements: {
                        arc: {
                            borderWidth: 1
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            };
        </script>
        <script> 
    
            const myChart = new Chart(
                document.getElementById('myChart'),
                config
            );
        </script>
    </body>
    
    </html>`;

    return html;
  }
}
