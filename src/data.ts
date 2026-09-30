import type { WarrantyItem } from "./types";

const today = new Date();
const isoMonthsAgo = (months: number) => {
  const date = new Date(today.getFullYear(), today.getMonth() - months, 12);
  return date.toISOString().slice(0, 10);
};

export const demoItems: WarrantyItem[] = [
  {
    id: "demo-1",
    name: "Dizüstü Bilgisayar",
    brand: "Lenovo",
    model: "IdeaPad Slim 5",
    category: "Bilgisayar",
    purchaseDate: isoMonthsAgo(8),
    warrantyMonths: 24,
    store: "Teknoloji Mağazası",
    price: 32999,
    serialNumber: "PF4X-82XD",
    notes: "Fatura e-posta arşivinde.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-2",
    name: "Kahve Makinesi",
    brand: "Philips",
    model: "LatteGo 3200",
    category: "Mutfak",
    purchaseDate: isoMonthsAgo(22),
    warrantyMonths: 24,
    store: "Ev Dünyası",
    price: 18450,
    serialNumber: "EP3246-70",
    notes: "Son bakım haziran ayında yapıldı.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-3",
    name: "Kablosuz Kulaklık",
    brand: "Sony",
    model: "WH-1000XM5",
    category: "Ses Sistemi",
    purchaseDate: isoMonthsAgo(25),
    warrantyMonths: 24,
    store: "Online Mağaza",
    price: 11999,
    serialNumber: "S01-98342",
    notes: "Garanti süresi doldu.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-4",
    name: "Robot Süpürge",
    brand: "Roborock",
    model: "Q8 Max",
    category: "Ev Aleti",
    purchaseDate: isoMonthsAgo(4),
    warrantyMonths: 24,
    store: "Teknoloji Mağazası",
    price: 22490,
    serialNumber: "RR-Q8-2401",
    notes: "Yedek fırça kutuda saklanıyor.",
    createdAt: new Date().toISOString(),
  },
];

export const categories = [
  "Bilgisayar",
  "Telefon",
  "Mutfak",
  "Ev Aleti",
  "Ses Sistemi",
  "Kişisel Bakım",
  "Diğer",
];
