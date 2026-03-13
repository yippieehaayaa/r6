const PRECISION = 100;

export const toMinorUnits = (amount: number): number =>
  Math.round(amount * PRECISION);

export const toMajorUnits = (amount: number): number => amount / PRECISION;
