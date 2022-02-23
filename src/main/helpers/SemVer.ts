/**
 * @brief Compare two SemVer versions
 * @param value to create resulting array
 * @param filter filter to be applied over the data
 * @returns   0 if the versions are equal
 *            1 if v1 is greater than v2
 *            -1 if v1 is less than v2
 */

export function SemVerCompareVersion(ver1: string, ver2: string): number {
  const v1 = ver1.split('.').map((num) => parseInt(num, 10));
  const v2 = ver2.split('.').map((num) => parseInt(num, 10));

  for (let i = 0; i < v1.length; i += 1) {
    if (v1[i] > v2[i]) return 1;
    if (v1[i] < v2[i]) return -1;
  }
  return 0;
}
