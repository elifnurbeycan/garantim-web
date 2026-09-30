import type { WarrantyFormData, WarrantyItem } from "./types";

type ModelTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown;
};

type ModelContext = {
  registerTool: (tool: ModelTool, options?: { signal?: AbortSignal }) => void | Promise<void>;
};

export function registerWarrantyTools(actions: {
  list: () => WarrantyItem[];
  create: (data: WarrantyFormData) => WarrantyItem;
}) {
  const context = (document as Document & { modelContext?: ModelContext }).modelContext;
  if (!context?.registerTool) return () => undefined;
  const lifecycle = new AbortController();

  const register = (tool: ModelTool) => {
    try {
      void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined);
    } catch {
      // WebMCP is progressive enhancement; the visual interface remains available.
    }
  };

  register({
    name: "list_warranties",
    title: "Garanti kayıtlarını listele",
    description: "Garantim uygulamasındaki mevcut ürün ve garanti kayıtlarını listeler.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: () => ({ items: actions.list() }),
  });

  register({
    name: "create_warranty",
    title: "Garanti kaydı oluştur",
    description: "Yeni bir ürün ve garanti kaydı oluşturur.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        brand: { type: "string" },
        model: { type: "string" },
        category: { type: "string" },
        purchaseDate: { type: "string", format: "date" },
        warrantyMonths: { type: "number", minimum: 1 },
        store: { type: "string" },
        price: { type: "number", minimum: 0 },
        serialNumber: { type: "string" },
        notes: { type: "string" },
      },
      required: ["name", "brand", "category", "purchaseDate", "warrantyMonths"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: (input) => {
      const value = input as Partial<WarrantyFormData>;
      if (!value.name?.trim() || !value.brand?.trim() || !value.category?.trim() || !value.purchaseDate || !value.warrantyMonths) {
        throw new Error("Zorunlu garanti bilgileri eksik.");
      }
      return actions.create({
        name: value.name.trim(),
        brand: value.brand.trim(),
        model: value.model?.trim() ?? "",
        category: value.category.trim(),
        purchaseDate: value.purchaseDate,
        warrantyMonths: Number(value.warrantyMonths),
        store: value.store?.trim() ?? "",
        price: Number(value.price ?? 0),
        serialNumber: value.serialNumber?.trim() ?? "",
        notes: value.notes?.trim() ?? "",
      });
    },
  });

  return () => lifecycle.abort();
}
