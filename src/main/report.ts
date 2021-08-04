import { Filter } from '@material-ui/icons';
import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { defaultProject } from './workspace/ProjectTree';

interface licenseEntry {
  label: string;
  components: any[];
  value: number;
  incompatibles: string[];
}
interface cryptoEntry {
  label: string;
  components: any[];
  value: number;
  strength: number;
}

interface inventoryProgress {
  totalFiles: number;
  scannedFiles: number;
  excludedFiles: number;
  detectedComponents: number;
  acceptedComponents: number;
}

ipcMain.handle(IpcEvents.REPORT_SUMMARY, async (event, arg: string) => {
  let success: boolean;
  let licenses: licenseEntry[];
  let crypto: cryptoEntry[];
  let inventory: inventoryProgress;
  licenses = [];
  crypto = [{ label: 'None', components: [], value: 0 }];
  let tempSummary: any;
  console.log('POR ACA????');
  tempSummary = await defaultProject.scans_db.inventories.getCurrentSummary();
  console.log(JSON.stringify(tempSummary));
  const projectSummary = defaultProject.filesSummary;
  // total, filter, include
  const summary = {
    totalFiles: 0,
    includedFiles: 0,
    filteredFiles: 0,
    scannedFiles: 0,
    pendingFiles: 0,
    identifiedFiles: 0,
    ignoredFiles: 0,
  };
  summary.totalFiles = projectSummary.total;
  summary.includedFiles = projectSummary.include;
  summary.filteredFiles = projectSummary.filter;
  summary.scannedFiles = tempSummary[0].identified + tempSummary[0].ignored + tempSummary[0].pending;
  summary.pendingFiles = tempSummary[0].pending;
  summary.identifiedFiles = tempSummary[0].identified;
  summary.ignoredFiles = tempSummary[0].ignored;

  //  console.log(JSON.stringify(summary));

  try {
    const a = defaultProject.results;
    for (const [key, results] of Object.entries(a)) {
      for (const result of results) {
        if (result.id != 'none') {
          if (result.licenses != undefined && result.licenses[0] != undefined) {
            if (!licenses.some((l) => l.label === result.licenses[0].name)) {
              const newLicense = { label: '', components: [], value: 1 };
              newLicense.label = result.licenses[0].name;
              newLicense.components.push(result.component);
              licenses.push(newLicense);
            } else {
              const index = licenses.findIndex((l) => l.label === result.licenses[0].name);
              if (index >= 0) {
                if (!licenses[index].components.some((c) => c.component) === result.component)
                  licenses[index].components.push(result.component);
                licenses[index].value = licenses[index].components.length;
              }
            }
          }
          // Crypto
          if (result.cryptography != undefined && result.cryptography[0] != undefined) {
            if (!crypto.some((l) => l.label === result.cryptography[0].algorithm)) {
              const newCrypto = { label: '', components: [], value: 1 };
              newCrypto.label = result.cryptography[0].algorithm;
              newCrypto.components.push(result.component);
              crypto.push(newCrypto);
            } else {
              const index = crypto.findIndex((l) => l.label === result.cryptography[0].algorithm);
              if (index >= 0) {
                if (!crypto[index].components.some((c) => c.component) === result.component)
                  crypto[index].components.push(result.component);
                crypto[index].value = crypto[index].components.length;
              }
            }
          } else {
            const index = crypto.findIndex((l) => l.label === 'None');
            crypto[index].components.push(result.component);
            crypto[index].value = crypto[index].components.length;
            //  }
          }
        }
      }
    }
    // console.log("SALIENDO")
    //  console.log(JSON.stringify({ licenses: licenses, crypto: crypto, summary: summary }).toString());
    return {
      status: 'ok',
      message: 'SPDX export successfully',
      data: { licenses, crypto, summary },
    };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.REPORT_INVENTORY_PROGRESS, async (event, arg: string) => {
  let success: boolean;

  let inventory: inventoryProgress;
  try {
    const tempSummary = await defaultProject.scans_db.inventories.getCurrentSummary();
    const projectSummary = defaultProject.filesSummary;
    // total, filter, include
    const summary = {
      totalFiles: 0,
      includedFiles: 0,
      filteredFiles: 0,
      scannedFiles: 0,
      pendingFiles: 0,
      identifiedFiles: 0,
      ignoredFiles: 0,
    };
    summary.totalFiles = projectSummary.total;
    summary.includedFiles = projectSummary.include;
    summary.filteredFiles = projectSummary.filter;
    summary.scannedFiles = tempSummary[0].identified + tempSummary[0].ignored + tempSummary[0].pending;
    summary.pendingFiles = tempSummary[0].pending;
    summary.identifiedFiles = tempSummary[0].identified;
    summary.ignoredFiles = tempSummary[0].ignored;

    return {
      status: 'ok',
      message: 'SPDX export successfully',
      data: summary,
    };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});
