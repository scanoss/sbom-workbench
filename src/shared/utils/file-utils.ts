enum Package {
  GITHUB = 'https://github.com',
  STACKOVERFLOW = 'https://stackoverflow.com',
}

const canOpenURL = (file): boolean => {
  return file.url?.startsWith(Package.GITHUB) || file.url?.startsWith(Package.STACKOVERFLOW)
};

const getFileURL = (file): string => {
  if (file.url?.startsWith(Package.GITHUB)) {
    return `${file.url}/blob/master/${file.file}`;
  }

  if (file.url?.startsWith(Package.STACKOVERFLOW)) {
    return file.url;
  }

  return file.file;
};

export {
  canOpenURL,
  getFileURL,
};
