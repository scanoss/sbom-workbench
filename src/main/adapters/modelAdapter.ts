export function toEntity<T>(object: any): T {
  return JSON.parse(JSON.stringify(object));
}
