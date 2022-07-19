export class CsvAdapter{
  public adapt(data: any) {
    const response = data.reduce((acc, curr) => {
      const key = `${curr.fileId}${curr.version?curr.version:'-'}${curr.purl}`;
      if (!acc[key]) {
        const aux = {
          inventoryId: curr.inventoryId,
          fileId: curr.fileId,
          usage: curr.usage,
          notes: curr.notes,
          identified_license: [],
          detected_license: [],
          purl: curr.purl,
          version: curr.version,
          path: curr.path,
          identified_component: curr.identified_component,
          detected_component: curr.detected_component,
        };
        aux.detected_license.push(curr.detected_license ? curr.detected_license : 'n/a');
        aux.identified_license.push(curr?.identified_license ? curr.identified_license : 'n/a');
        acc[key] = aux;
      } else {
        acc[key].detected_license.push(curr.detected_license ? curr.detected_license : 'n/a');
        acc[key].identified_license.push(curr.identified_license ? curr.identified_license : 'n/a');
      }
      return acc;
    }, {});
    return Object.values(response);
  }
}
