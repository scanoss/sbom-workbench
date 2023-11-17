export type Config = {
  key: string;
  rename?: string;
  properties: string[];
  child?: Config;
  additionalKeys?: {
    name: string;
    properties: string[];
  }[];
};

/**
 * Transforms the data based on the provided configuration.
 * @param data The array of data objects to be transformed.
 * @param config The configuration object defining the transformation rules.
 * @returns Transformed data as an array of objects.
 */
export function transformData(data: any[], config: Config) {
  const groupedData = groupBy(data, config.key);

  return Object.entries(groupedData).map(([groupKey, groupValues]) => {
    const aggregatedData = aggregateProperties(groupValues, config.properties);

    if (config.additionalKeys) {
      config.additionalKeys.forEach((additionalKey) => {
        const keyCombinations = [];

        groupValues.forEach((item) => {
          // Checks if all specified properties are present and not empty.
          if (additionalKey.properties.every((prop) => item[prop])) {
            const combination = additionalKey.properties.reduce((obj, prop) => {
              obj[prop] = item[prop];
              return obj;
            }, {});

            keyCombinations.push(combination);
          }
        });

        aggregatedData[additionalKey.name] = keyCombinations.length > 0 ? keyCombinations : null;
      });
    }

    if (config.child) {
      const childGroupData = groupValues.filter((item) => item.hasOwnProperty(config.child!.key));
      if (childGroupData.length > 0) {
        const childKey = config.child.rename || config.child.key;
        aggregatedData[childKey] = transformData(childGroupData, config.child);
      }
    }

    return { [config.key]: groupKey, ...aggregatedData };
  });
}

/**
 * Groups the data by the specified key.
 * @param data The data to be grouped.
 * @param key The key to group the data by.
 * @returns An object with keys as group identifiers and values as arrays of grouped data.
 */
function groupBy(data: any[], key: string): Record<string, any[]> {
  return data.reduce((accumulator, item) => {
    const keyValue = item[key];
    (accumulator[keyValue] = accumulator[keyValue] || []).push(item);
    return accumulator;
  }, {});
}

/**
 * Aggregates specified properties from a list of items.
 * @param items The list of items to aggregate properties from.
 * @param properties The properties to be aggregated.
 * @returns An object with aggregated properties.
 */
function aggregateProperties(items: any[], properties: string[]): Record<string, any> {
  return items.reduce((accumulator, item) => {
    properties.forEach((prop) => {
      if (item.hasOwnProperty(prop)) {
        accumulator[prop] = item[prop];
      }
    });
    return accumulator;
  }, {});
}
