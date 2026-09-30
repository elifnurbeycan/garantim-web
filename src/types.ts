export type WarrantyItem = {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  purchaseDate: string;
  warrantyMonths: number;
  store: string;
  price: number;
  serialNumber: string;
  notes: string;
  createdAt: string;
};

export type WarrantyFormData = Omit<WarrantyItem, "id" | "createdAt">;

export type WarrantyStatus = "active" | "expiring" | "expired";
