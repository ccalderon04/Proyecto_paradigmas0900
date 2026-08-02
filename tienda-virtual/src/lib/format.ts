export const parseMoney = (value: string | number): number =>
    typeof value === "number" ? value : parseFloat(value);

export const formatMoney = (value: string | number): string =>
    `L. ${parseMoney(value).toFixed(2)}`;

export const formatPresentacion = (cantidad: string | null, uMedida: string | null): string => {
    if (!uMedida) return "N/A";
    if (!cantidad) return uMedida;
    return `${parseFloat(cantidad)}${uMedida}`;
};