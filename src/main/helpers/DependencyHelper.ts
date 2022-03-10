/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */

class DependencyHelper {
  public dependecyModelAdapter(dependency: any) {
    const dep = dependency.filesList.map((file) => {
      file.dependenciesList.map((depList) => (depList.licensesList = depList.licensesList.map((lic) => lic.spdxId)));
      return file;
    });
    return dep;
  }
}

export const dependencyHelper = new DependencyHelper();
