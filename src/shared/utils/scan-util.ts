import { Component, ComponentGroup } from '../../api/types';
import React from 'react';

export function mapFiles(files: any[]): any[] {
  return files.map((file) => mapFile(file));
}

export function mapFile(file: any): any[] {
  const getStatus = (file) => (file.ignored === 1 ? 'ignored' : file.identified === 1 ? 'identified' : 'pending');

  return {
    ...file,
    status: getStatus(file),
  };
}

export function sortComponents(components: Component[]) {
  components.sort(
    (a, b) =>
      b.summary?.pending +
      b.summary?.ignored +
      b.summary?.identified -
      (a.summary?.pending + a.summary?.ignored + a.summary?.identified)
  );
}

export default {
  mapFiles,
};
