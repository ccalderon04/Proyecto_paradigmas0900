// src/lib/format.ts
export const parseMoney = (value: string | number): number =>
    typeof value === "number" ? value : parseFloat(value);

export const formatMoney = (value: string | number): string =>
    parseMoney(value).toFixed(2);