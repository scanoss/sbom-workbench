class ComponentHelper {
  public summaryByPurl(data: any[]) {
    const summary = data.reduce((acc, curr) => {
      if (acc[curr.purl] === undefined) {
        acc[curr.purl] = {
          identified: curr.identified,
          ignored: curr.ignored,
          pending: curr.pending,
        };
      }
      return acc;
    }, {});
    return summary;
  }
}

export const componentHelper = new ComponentHelper();
