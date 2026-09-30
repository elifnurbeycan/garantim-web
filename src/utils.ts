import type { WarrantyItem, WarrantyStatus } from "./types";

export const addMonths = (dateValue: string, months: number) => {
  const date = new Date(`${dateValue}T12:00:00`);
  date.setMonth(date.getMonth() + months);
  return date;
};

export const getDaysRemaining = (item: WarrantyItem) => {
  const end = addMonths(item.purchaseDate, item.warrantyMonths);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - now.getTime()) / 86_400_000);
};

export const getStatus = (item: WarrantyItem): WarrantyStatus => {
  const days = getDaysRemaining(item);
  if (days < 0) return "expired";
  if (days <= 60) return "expiring";
  return "active";
};

export const formatDate = (date: Date | string) =>
  new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(typeof date === "string" ? new Date(`${date}T12:00:00`) : date);

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);

export const statusLabel = (status: WarrantyStatus) => ({
  active: "Garanti devam ediyor",
  expiring: "Yakında bitiyor",
  expired: "Garanti süresi doldu",
}[status]);
