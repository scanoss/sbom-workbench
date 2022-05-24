export class ResultAdapter {
  public adapt(result: any) {
    const response = result.reduce((acc, curr) => {
      if (!acc[curr.resultId]) {
        const aux = {
          id: curr.id,
          file_path: curr.file_path,
          url: curr.url,
          lines: curr.lines,
          oss_lines: curr.oss_lines,
          matched: curr.matched,
          file: curr.file,
          type: curr.type,
          md5_file: curr.md5_file,
          url_hash: curr.url_hash,
          purl: curr.purl,
          version: curr.version,
          latest: curr.latest,
          identified: curr.identified,
          ignored: curr.ignored,
          file_url: curr.file_url,
          license: [],
        };
        aux.license.push(curr.spdxid);
        acc[curr.resultId] = aux;
      } else {
        acc[curr.resultId].license.push(curr.spdxid);
      }
      return acc;
    }, {});

    return Object.values(response);
  }
}
