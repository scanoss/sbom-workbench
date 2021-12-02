class LogicResultService {
  public async getResultsByids(ids: number[], project: any) {
    try {
      const results: Array<any> = await project.scans_db.results.getSummaryByids(ids);
      const response = {};
      results.forEach((element: any) => {
        if (response[element.path] === undefined) {
          response[element.path] =
            element.identified === 1 ? 'identified' : element.ignored === 1 ? 'ignored' : 'pending';
        }
      });

      return response;
    } catch (e) {
      return e;
    }
  }
}
export const logicResultService = new LogicResultService();
