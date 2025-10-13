export const safeString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);
  if (value === null || value === undefined) return '';
  return JSON.stringify(value);
};

export const hasOutput = (val: unknown): val is Record<string, unknown> => {
  return val != null && typeof val === 'object';
};
