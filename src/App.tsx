import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Archive,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Edit3,
  FileCheck2,
  PackageOpen,
  Plus,
  Search,
  ShieldCheck,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { categories, demoItems } from "./data";
import type { WarrantyFormData, WarrantyItem, WarrantyStatus } from "./types";
import { addMonths, formatCurrency, formatDate, getDaysRemaining, getStatus, statusLabel } from "./utils";
import { registerWarrantyTools } from "./webmcp";

const STORAGE_KEY = "garantim-items-v2";
const emptyForm: WarrantyFormData = {
  name: "",
  brand: "",
  model: "",
  category: "Bilgisayar",
  purchaseDate: new Date().toISOString().slice(0, 10),
  warrantyMonths: 24,
  store: "",
  price: 0,
  serialNumber: "",
  notes: "",
};

function loadItems(): WarrantyItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : demoItems;
  } catch {
    return demoItems;
  }
}

function App() {
  const [items, setItems] = useState<WarrantyItem[]>(loadItems);
  const itemsRef = useRef(items);
  const [filters, setFilters] = useState({
    product: "",
    category: "Tümü",
    status: "all" as "all" | WarrantyStatus,
    purchaseDate: "",
    expiryDate: "",
    store: "",
    minPrice: "",
    maxPrice: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WarrantyItem | null>(null);
  const [deleting, setDeleting] = useState<WarrantyItem | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    itemsRef.current = items;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => registerWarrantyTools({
    list: () => itemsRef.current,
    create: (data) => {
      const created: WarrantyItem = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      setItems(current => [created, ...current]);
      return created;
    },
  }), []);

  const counts = useMemo(() => items.reduce((acc, item) => {
    acc[getStatus(item)] += 1;
    return acc;
  }, { active: 0, expiring: 0, expired: 0 }), [items]);

  const filtered = useMemo(() => {
    const normalizedProduct = filters.product.toLocaleLowerCase("tr-TR").trim();
    const normalizedStore = filters.store.toLocaleLowerCase("tr-TR").trim();
    const result = items.filter(item => {
      const expiryDate = addMonths(item.purchaseDate, item.warrantyMonths).toISOString().slice(0, 10);
      const matchesProduct = !normalizedProduct || [item.name, item.brand, item.model]
        .join(" ").toLocaleLowerCase("tr-TR").includes(normalizedProduct);
      const matchesStatus = filters.status === "all" || getStatus(item) === filters.status;
      const matchesCategory = filters.category === "Tümü" || item.category === filters.category;
      const matchesPurchase = !filters.purchaseDate || item.purchaseDate === filters.purchaseDate;
      const matchesExpiry = !filters.expiryDate || expiryDate === filters.expiryDate;
      const matchesStore = !normalizedStore || [item.store, item.serialNumber]
        .join(" ").toLocaleLowerCase("tr-TR").includes(normalizedStore);
      const matchesMinPrice = !filters.minPrice || item.price >= Number(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || item.price <= Number(filters.maxPrice);
      return matchesProduct && matchesStatus && matchesCategory && matchesPurchase && matchesExpiry
        && matchesStore && matchesMinPrice && matchesMaxPrice;
    });
    return [...result].sort((a, b) => getDaysRemaining(a) - getDaysRemaining(b));
  }, [items, filters]);

  const purchaseDateOptions = useMemo(() => [...new Set(items.map(item => item.purchaseDate))].sort(), [items]);
  const expiryDateOptions = useMemo(() => [...new Set(items.map(item =>
    addMonths(item.purchaseDate, item.warrantyMonths).toISOString().slice(0, 10),
  ))].sort(), [items]);

  const setFilter = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) =>
    setFilters(current => ({ ...current, [key]: value }));

  const clearFilters = () => setFilters({
    product: "", category: "Tümü", status: "all", purchaseDate: "", expiryDate: "",
    store: "", minPrice: "", maxPrice: "",
  });

  const hasActiveFilters = filters.product || filters.category !== "Tümü" || filters.status !== "all"
    || filters.purchaseDate || filters.expiryDate || filters.store || filters.minPrice || filters.maxPrice;

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const saveItem = (form: WarrantyFormData) => {
    if (editing) {
      setItems(current => current.map(item => item.id === editing.id ? { ...item, ...form } : item));
      setToast("Garanti kaydı güncellendi.");
    } else {
      setItems(current => [{ ...form, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...current]);
      setToast("Yeni ürün garantiye eklendi.");
    }
    setModalOpen(false);
    setEditing(null);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setItems(current => current.filter(item => item.id !== deleting.id));
    setToast(`${deleting.name} kaydı silindi.`);
    setDeleting(null);
  };

  const totalValue = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Garantim ana sayfa">
          <span className="brand-mark"><ShieldCheck size={24} strokeWidth={2.15} /></span>
          <span className="brand-word">garanti<span>m</span></span>
        </a>
        <button className="primary-button" onClick={openCreate}>
          <Plus size={18} /> Yeni ürün ekle
        </button>
      </header>

      <main id="top">
        <section className="intro-row">
          <div>
            <p className="eyebrow">GARANTİ TAKİP PANELİ</p>
            <h1>Belgeler kaybolmasın,<br /><span>hakların yarım kalmasın.</span></h1>
            <p className="intro-copy">Ürünlerinin garanti sürelerini tek bakışta gör, yaklaşan tarihleri kaçırma.</p>
          </div>
          <div className="deadline-card">
            <div className="deadline-icon"><Clock3 size={22} /></div>
            <div>
              <span>Yaklaşan bitiş</span>
              <strong>{counts.expiring > 0 ? `${counts.expiring} ürün yakında bitiyor` : "Yaklaşan garanti yok"}</strong>
            </div>
            <button onClick={() => setFilter("status", "expiring")}>Görüntüle</button>
          </div>
        </section>

        <section className="stats-grid" aria-label="Garanti özeti">
          <StatCard icon={<Archive />} label="Toplam ürün" value={items.length.toString()} tone="navy" />
          <StatCard icon={<CheckCircle2 />} label="Garantisi devam eden" value={counts.active.toString()} tone="green" />
          <StatCard icon={<AlertTriangle />} label="Yakında bitecek" value={counts.expiring.toString()} tone="amber" />
          <StatCard icon={<CircleDollarSign />} label="Kayıtlı ürün değeri" value={formatCurrency(totalValue)} tone="blue" compact />
        </section>

        <section className="collection-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">ÜRÜN ARŞİVİ</p>
              <h2>Garanti kayıtların</h2>
            </div>
            <div className="table-summary-actions">
              <span className="result-count">{filtered.length} kayıt gösteriliyor</span>
              {hasActiveFilters && <button className="clear-filters" onClick={clearFilters}>Filtreleri temizle</button>}
            </div>
          </div>

          {filtered.length ? (
            <div className="table-scroll" tabIndex={0} aria-label="Garanti kayıtları tablosu">
              <table className="warranty-table">
                <thead>
                  <tr className="column-labels">
                    <th>Ürün</th>
                    <th>Kategori</th>
                    <th>Durum</th>
                    <th>Satın alma</th>
                    <th>Garanti bitişi</th>
                    <th>Mağaza / Seri no</th>
                    <th>Değer</th>
                    <th><span className="sr-only">İşlemler</span></th>
                  </tr>
                  <tr className="column-filters">
                    <th><label className="table-search"><Search size={15} /><input aria-label="Ürün sütununu filtrele" value={filters.product} onChange={e => setFilter("product", e.target.value)} placeholder="Ürün veya marka" /></label></th>
                    <th><select aria-label="Kategori sütununu filtrele" value={filters.category} onChange={e => setFilter("category", e.target.value)}><option>Tümü</option>{categories.map(category => <option key={category}>{category}</option>)}</select></th>
                    <th><select aria-label="Durum sütununu filtrele" value={filters.status} onChange={e => setFilter("status", e.target.value as typeof filters.status)}><option value="all">Tümü</option><option value="active">Devam ediyor</option><option value="expiring">Yakında bitiyor</option><option value="expired">Süresi doldu</option></select></th>
                    <th><select aria-label="Satın alma tarihini filtrele" value={filters.purchaseDate} onChange={e => setFilter("purchaseDate", e.target.value)}><option value="">Tüm tarihler</option>{purchaseDateOptions.map(date => <option key={date} value={date}>{formatDate(date)}</option>)}</select></th>
                    <th><select aria-label="Garanti bitiş tarihini filtrele" value={filters.expiryDate} onChange={e => setFilter("expiryDate", e.target.value)}><option value="">Tüm tarihler</option>{expiryDateOptions.map(date => <option key={date} value={date}>{formatDate(date)}</option>)}</select></th>
                    <th><input aria-label="Mağaza veya seri numarasını filtrele" value={filters.store} onChange={e => setFilter("store", e.target.value)} placeholder="Mağaza veya seri no" /></th>
                    <th><div className="price-filter"><input aria-label="En düşük fiyat" type="number" min="0" value={filters.minPrice} onChange={e => setFilter("minPrice", e.target.value)} placeholder="Min" /><input aria-label="En yüksek fiyat" type="number" min="0" value={filters.maxPrice} onChange={e => setFilter("maxPrice", e.target.value)} placeholder="Maks" /></div></th>
                    <th>{hasActiveFilters && <button className="filter-reset-icon" onClick={clearFilters} aria-label="Tüm filtreleri temizle"><X size={17} /></button>}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => <WarrantyRow key={item.id} item={item} onEdit={() => { setEditing(item); setModalOpen(true); }} onDelete={() => setDeleting(item)} />)}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <PackageOpen size={42} />
              <h3>Eşleşen kayıt bulunamadı</h3>
              <p>Arama veya filtrelerini değiştirerek yeniden deneyebilirsin.</p>
              <button className="secondary-button" onClick={clearFilters}>Filtreleri temizle</button>
            </div>
          )}
        </section>
      </main>

      <footer><ShieldCheck size={16} /> Garantim · Garanti bilgilerin yalnızca bu tarayıcıda saklanır.</footer>

      {modalOpen && <WarrantyModal initial={editing ?? undefined} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={saveItem} />}
      {deleting && <DeleteDialog item={deleting} onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />}
      {toast && <div className="toast" role="status"><CheckCircle2 size={18} /> {toast}</div>}
    </div>
  );
}

function StatCard({ icon, label, value, tone, compact = false }: { icon: React.ReactNode; label: string; value: string; tone: string; compact?: boolean }) {
  return <article className="stat-card">
    <span className={`stat-icon ${tone}`}>{icon}</span>
    <div><span>{label}</span><strong className={compact ? "compact-value" : ""}>{value}</strong></div>
  </article>;
}

function WarrantyRow({ item, onEdit, onDelete }: { item: WarrantyItem; onEdit: () => void; onDelete: () => void }) {
  const status = getStatus(item);
  const days = getDaysRemaining(item);
  const endDate = addMonths(item.purchaseDate, item.warrantyMonths);
  const remainingText = status === "expired" ? `${Math.abs(days)} gün önce sona erdi`
    : status === "expiring" ? `Son ${days} gün` : `${days} gün kaldı`;
  return <tr>
    <td><div className="table-product"><div className="product-monogram">{item.brand.slice(0, 1).toLocaleUpperCase("tr-TR")}</div><div><strong>{item.name}</strong><span>{item.brand} {item.model}</span></div></div></td>
    <td><span className="category-tag">{item.category}</span></td>
    <td><span className={`status-pill ${status}`}>{statusLabel(status)}</span></td>
    <td><span className="cell-primary">{formatDate(item.purchaseDate)}</span><small>{item.warrantyMonths} ay garanti</small></td>
    <td><span className="cell-primary">{formatDate(endDate)}</span><small className={`remaining ${status}`}>{remainingText}</small></td>
    <td><span className="store-line"><Store size={15} />{item.store || "Belirtilmedi"}</span><small><FileCheck2 size={13} />{item.serialNumber || "Seri no yok"}</small></td>
    <td><strong className="table-price">{formatCurrency(item.price)}</strong></td>
    <td><div className="row-actions"><button className="icon-button" onClick={onEdit} aria-label={`${item.name} kaydını düzenle`}><Edit3 size={17} /></button><button className="icon-button danger" onClick={onDelete} aria-label={`${item.name} kaydını sil`}><Trash2 size={17} /></button></div></td>
  </tr>;
}

function WarrantyModal({ initial, onClose, onSave }: { initial?: WarrantyItem; onClose: () => void; onSave: (form: WarrantyFormData) => void }) {
  const [form, setForm] = useState<WarrantyFormData>(initial ? {
    name: initial.name, brand: initial.brand, model: initial.model, category: initial.category,
    purchaseDate: initial.purchaseDate, warrantyMonths: initial.warrantyMonths, store: initial.store,
    price: initial.price, serialNumber: initial.serialNumber, notes: initial.notes,
  } : emptyForm);
  const set = <K extends keyof WarrantyFormData>(key: K, value: WarrantyFormData[K]) => setForm(current => ({ ...current, [key]: value }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.brand.trim() || !form.purchaseDate) return;
    onSave({ ...form, name: form.name.trim(), brand: form.brand.trim(), model: form.model.trim(), store: form.store.trim(), serialNumber: form.serialNumber.trim(), notes: form.notes.trim() });
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-header">
        <div><p className="eyebrow">{initial ? "KAYDI GÜNCELLE" : "YENİ GARANTİ"}</p><h2 id="modal-title">{initial ? "Ürün bilgilerini düzenle" : "Yeni ürün ekle"}</h2></div>
        <button className="icon-button" onClick={onClose} aria-label="Pencereyi kapat"><X size={20} /></button>
      </div>
      <form onSubmit={submit}>
        <div className="form-grid">
          <FormField label="Ürün adı *"><input required value={form.name} onChange={e => set("name", e.target.value)} placeholder="Örn. Dizüstü bilgisayar" /></FormField>
          <FormField label="Marka *"><input required value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="Örn. Lenovo" /></FormField>
          <FormField label="Model"><input value={form.model} onChange={e => set("model", e.target.value)} placeholder="Örn. IdeaPad Slim 5" /></FormField>
          <FormField label="Kategori"><select value={form.category} onChange={e => set("category", e.target.value)}>{categories.map(category => <option key={category}>{category}</option>)}</select></FormField>
          <FormField label="Satın alma tarihi *"><input required type="date" value={form.purchaseDate} onChange={e => set("purchaseDate", e.target.value)} /></FormField>
          <FormField label="Garanti süresi"><select value={form.warrantyMonths} onChange={e => set("warrantyMonths", Number(e.target.value))}><option value={6}>6 ay</option><option value={12}>12 ay</option><option value={24}>24 ay</option><option value={36}>36 ay</option><option value={60}>60 ay</option></select></FormField>
          <FormField label="Satın alınan mağaza"><input value={form.store} onChange={e => set("store", e.target.value)} placeholder="Örn. Teknoloji Mağazası" /></FormField>
          <FormField label="Fiyat (₺)"><input min="0" type="number" value={form.price || ""} onChange={e => set("price", Number(e.target.value))} placeholder="0" /></FormField>
          <FormField label="Seri numarası" wide><input value={form.serialNumber} onChange={e => set("serialNumber", e.target.value)} placeholder="Ürün üzerindeki seri numarası" /></FormField>
          <FormField label="Notlar" wide><textarea rows={3} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Fatura konumu, servis bilgisi veya hatırlatmalar..." /></FormField>
        </div>
        <div className="expiry-preview"><CalendarDays size={18} /><span>Hesaplanan garanti bitişi</span><strong>{formatDate(addMonths(form.purchaseDate, form.warrantyMonths))}</strong></div>
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Vazgeç</button><button className="primary-button" type="submit"><ShieldCheck size={18} /> {initial ? "Değişiklikleri kaydet" : "Garantiye ekle"}</button></div>
      </form>
    </section>
  </div>;
}

function FormField({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={`form-field ${wide ? "wide" : ""}`}><span>{label}</span>{children}</label>;
}

function DeleteDialog({ item, onCancel, onConfirm }: { item: WarrantyItem; onCancel: () => void; onConfirm: () => void }) {
  return <div className="modal-backdrop">
    <section className="delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
      <span className="delete-icon"><Trash2 size={24} /></span>
      <h2 id="delete-title">Garanti kaydı silinsin mi?</h2>
      <p><strong>{item.name}</strong> kaydı ve ilişkili bilgiler kalıcı olarak silinecek.</p>
      <div className="modal-actions"><button className="secondary-button" onClick={onCancel}>Vazgeç</button><button className="delete-button" onClick={onConfirm}>Kaydı sil</button></div>
    </section>
  </div>;
}

export default App;
