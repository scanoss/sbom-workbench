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
}

export const componentHelper = new ComponentHelper();
