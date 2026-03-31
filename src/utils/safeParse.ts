export const safeParseInt = (value: string | null | undefined, defaultValue: number = 0): number => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const safeParseIntWithMin = (value: string | null | undefined, min: number, defaultValue: number = min): number => {
  const parsed = safeParseInt(value, defaultValue);
  return Math.max(min, parsed);
};
