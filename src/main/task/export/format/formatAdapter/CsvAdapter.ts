export class CsvAdapter{
  public adapt(data: any) {
    console.log(data);
    const response = data.reduce((acc, curr) => {
      if (!acc[curr.fileId]) {
        const aux = {
          inventoryId: curr.inventoryId,
          fileId: curr.fileId,
          usage: curr.usage,
          notes: curr.notes,
          identified_license: curr.identified_license,
          detected_license: [],
          purl: curr.purl,
          version: curr.version,
          path: curr.path,
          identified_component: curr.identified_component,
          detected_component: curr.detected_component,
        };
        aux.detected_license.push(curr.detected_license);
        acc[curr.fileId] = aux;
      } else
        acc[curr.fileId].detected_license.push(curr.detected_license);
      return acc;
    }, {});
    return Object.values(response);
  }
}
