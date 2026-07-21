export function parseBackendDateTime(value: string): number {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const utcValue = /[zZ]|[+-]\d{2}:\d{2}$/.test(normalized)
    ? normalized
    : `${normalized}Z`;

  return new Date(utcValue).getTime();
}
