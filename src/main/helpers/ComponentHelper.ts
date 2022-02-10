class ComponentHelper {
  public addSummary(components: any, summary: any) {
    const sum = summary.reduce((acc, curr) => {
      if (!acc[curr.id]) {
        acc[curr.id] = {
          identified: curr.identified,
          ignored: curr.ignored,
          pending: curr.pending,
        };
      }
      return acc;
    }, {});
    components.forEach((comp) => {
      if (sum[comp.compid]) {
        comp.summary = sum[comp.compid];
      }
    });
    return components;
  }

  public processComponent(data: any) {
    const results: any = [];

    for (let i = 0; i < data.length; i += 1) {
      const transformation: any = {};
      const preLicense: any = {};
      transformation.compid = data[i].compid;
      transformation.licenses = [];
      transformation.name = data[i].comp_name;
      transformation.purl = data[i].purl;
      transformation.url = data[i].comp_url;
      transformation.version = data[i].version;
      transformation.vendor = data[i].vendor;
      if (data[i].filesCount) transformation.filesCount = data[i].filesCount;

      if (data[i].license_id) {
        preLicense.id = data[i].license_id;
        preLicense.name = data[i].license_name;
        preLicense.spdxid = data[i].license_spdxid;
        transformation.licenses.push(preLicense);
      }
      results.push(transformation);
      let countMerged = 0;
      for (let j = i + 1; j < data.length; j += 1) {
        if (data[i].compid < data[j].compid) break;

        if (data[i].compid === data[j].compid) {
          this.mergeComponents(results[results.length - 1], data[j]);
          countMerged += 1;
        }
      }
      i += countMerged;
    }
    return results;
  }

  // merge component b into a
  private mergeComponents(a: any, b: any) {
    const preLicense: any = {};
    preLicense.id = b.license_id;
    preLicense.name = b.license_name;
    preLicense.spdxid = b.license_spdxid;
    a.licenses.push(preLicense);
  }
}

export const componentHelper = new ComponentHelper();
