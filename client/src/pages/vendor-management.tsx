import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Search, Building2, Phone, Mail, MapPin, Edit2, Trash2,
  ShoppingCart, Package, CalendarDays, ChevronDown, ChevronUp, X,
  ArrowLeft, LayoutGrid, List, ArrowUpDown, SlidersHorizontal,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Vendor, VendorPurchase, PurchaseItem, PPFMaster, AccessoryMaster, AccessoryCategory, VehicleType } from "@shared/schema";
import { format } from "date-fns";

// ─── HSN Codes (from Auto Gamma GST/HSN reference sheet) ─────────────────────
const HSN_CODES = [
  { code: "998713", description: "PPF Installation / Ceramic Coating / Car Detailing / Paint Correction / Denting & Painting" },
  { code: "998538", description: "Car Wash / Cleaning / Interior Cleaning" },
  { code: "3919",   description: "PPF Film (Supply / Sale)" },
  { code: "3824",   description: "Ceramic Coating Liquid" },
  { code: "3405",   description: "Car Polish / Rubbing Compound" },
  { code: "3402",   description: "Car Shampoo" },
  { code: "6307",   description: "Microfiber Cloth" },
  { code: "9603",   description: "Detailing Brush" },
  { code: "87089900", description: "Seat Covers / Car Mats / Steering Cover / Body Kit / Roof Rails / Door Visor / Spoiler" },
  { code: "94049099", description: "Car Neck Cushion" },
  { code: "85198100", description: "Car Audio System / Music System" },
  { code: "852859",  description: "Android CarPlay System" },
  { code: "852580",  description: "Dash Camera" },
  { code: "8708",    description: "General Motor Vehicle Parts" },
  { code: "851810",  description: "Speaker / Subwoofer / Amplifier" },
  { code: "85122020", description: "LED Headlights / Fog Lamps / LED Light Bar" },
  { code: "94054090", description: "Ambient Light" },
];

const VENDOR_CATEGORIES = ["PPF", "Accessory"];
const NEW_PPF_VALUE = "__new_ppf__";
const NEW_ACCESSORY_VALUE = "__new_acc__";
const NEW_CATEGORY_VALUE = "__new_cat__";

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  try { return format(new Date(dateStr), "dd MMM yyyy"); } catch { return dateStr; }
}
function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// ─── HSN Combobox ─────────────────────────────────────────────────────────────
function HsnCombobox({ value, onChange, idx }: { value: string; onChange: (v: string) => void; idx: number }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSearch(value); }, [value]);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = HSN_CODES.filter(h =>
    h.code.includes(search) || h.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={wrapRef} className="relative">
      <Input
        data-testid={`input-hsn-${idx}`}
        className="h-8 text-xs"
        placeholder="HSN code (search or type)..."
        value={search}
        onFocus={() => setOpen(true)}
        onChange={e => { setSearch(e.target.value); onChange(e.target.value); setOpen(true); }}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1 left-0 w-80 bg-popover border border-border rounded-lg shadow-xl max-h-52 overflow-y-auto">
          {filtered.map(h => (
            <button
              key={h.code}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-muted/60 transition-colors border-b border-border/30 last:border-0"
              onMouseDown={e => { e.preventDefault(); onChange(h.code); setSearch(h.code); setOpen(false); }}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono font-bold text-xs text-primary">{h.code}</span>
                <span className="text-xs text-muted-foreground line-clamp-1">{h.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Vendor Form ──────────────────────────────────────────────────────────────
interface VendorFormProps { vendor?: Vendor | null; onClose: () => void; }

function VendorForm({ vendor, onClose }: VendorFormProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: vendor?.name ?? "", contactPerson: vendor?.contactPerson ?? "",
    phone: vendor?.phone ?? "", email: vendor?.email ?? "",
    address: vendor?.address ?? "", category: vendor?.category ?? "",
    notes: vendor?.notes ?? "",
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => apiRequest("POST", "/api/vendors", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/vendors"] }); toast({ title: "Vendor added" }); onClose(); },
  });
  const updateMutation = useMutation({
    mutationFn: (data: typeof form) => apiRequest("PATCH", `/api/vendors/${vendor!.id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/vendors"] }); toast({ title: "Vendor updated" }); onClose(); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (vendor) updateMutation.mutate(form); else createMutation.mutate(form);
  };
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1">
          <Label>Vendor Name *</Label>
          <Input data-testid="input-vendor-name" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Garware Films Ltd" required />
        </div>
        <div className="space-y-1">
          <Label>Contact Person</Label>
          <Input data-testid="input-vendor-contact" value={form.contactPerson}
            onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} placeholder="Full name" />
        </div>
        <div className="space-y-1">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
            <SelectTrigger data-testid="select-vendor-category"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {VENDOR_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Phone</Label>
          <Input data-testid="input-vendor-phone" value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" />
        </div>
        <div className="space-y-1">
          <Label>Email</Label>
          <Input data-testid="input-vendor-email" type="email" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="vendor@example.com" />
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Address</Label>
          <Input data-testid="input-vendor-address" value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Full address" />
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Notes</Label>
          <Textarea data-testid="input-vendor-notes" value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Additional notes..." />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button data-testid="button-save-vendor" type="submit" disabled={isPending}>
          {isPending ? "Saving..." : vendor ? "Update Vendor" : "Add Vendor"}
        </Button>
      </div>
    </form>
  );
}

// ─── Item Row ─────────────────────────────────────────────────────────────────
interface ItemRowProps {
  idx: number;
  item: PurchaseItem & { hsnCode?: string };
  ppfMasters: PPFMaster[];
  accessories: AccessoryMaster[];
  categories: AccessoryCategory[];
  vehicleTypes: VehicleType[];
  onChange: (idx: number, item: any) => void;
  onRemove: (idx: number) => void;
}

function ItemRow({ idx, item, ppfMasters, accessories, categories, vehicleTypes, onChange, onRemove }: ItemRowProps) {
  const [isNewPPF, setIsNewPPF] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [isNewAccessory, setIsNewAccessory] = useState(false);
  const [showVehiclePricing, setShowVehiclePricing] = useState(false);

  const filteredAccessories = accessories.filter(a =>
    (a.category || "").toLowerCase() === (item.categoryName || "").toLowerCase()
  );

  const handlePPFSelect = (val: string) => {
    if (val === NEW_PPF_VALUE) { setIsNewPPF(true); onChange(idx, { ...item, name: "", rollName: "", ppfPricing: [] }); }
    else { setIsNewPPF(false); onChange(idx, { ...item, name: val }); }
  };
  const handleCategorySelect = (val: string) => {
    if (val === NEW_CATEGORY_VALUE) { setIsNewCategory(true); onChange(idx, { ...item, categoryName: "", name: "" }); }
    else { setIsNewCategory(false); onChange(idx, { ...item, categoryName: val, name: "" }); }
  };
  const handleAccessorySelect = (val: string) => {
    if (val === NEW_ACCESSORY_VALUE) { setIsNewAccessory(true); onChange(idx, { ...item, name: "" }); }
    else { setIsNewAccessory(false); onChange(idx, { ...item, name: val }); }
  };

  const addVehiclePricingRow = () => {
    const pricing = Array.isArray(item.ppfPricing) ? item.ppfPricing : [];
    onChange(idx, { ...item, ppfPricing: [...pricing, { vehicleType: "", warranty: "", price: 0 }] });
  };
  const updateVehiclePricingRow = (pi: number, field: string, val: string | number) => {
    const pricing = [...((item.ppfPricing as any[]) || [])];
    pricing[pi] = { ...pricing[pi], [field]: val };
    onChange(idx, { ...item, ppfPricing: pricing });
  };
  const removeVehiclePricingRow = (pi: number) => {
    const pricing = ((item.ppfPricing as any[]) || []).filter((_: any, i: number) => i !== pi);
    onChange(idx, { ...item, ppfPricing: pricing });
  };

  return (
    <div className="rounded-lg border border-border/60 bg-card p-3 space-y-2">
      {/* Row 1: Type selector + Name selector + Remove button */}
      <div className="flex items-center gap-2">
        <Select
          value={item.itemType}
          onValueChange={v => { setIsNewPPF(false); setIsNewCategory(false); setIsNewAccessory(false); onChange(idx, { ...item, itemType: v as "PPF" | "Accessory", name: "", categoryName: "" }); }}
        >
          <SelectTrigger data-testid={`select-item-type-${idx}`} className="h-8 text-xs w-28 flex-shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PPF">PPF</SelectItem>
            <SelectItem value="Accessory">Accessory</SelectItem>
          </SelectContent>
        </Select>

        {item.itemType === "PPF" && (
          isNewPPF ? (
            <div className="flex flex-1 gap-1">
              <Input
                data-testid={`input-new-ppf-name-${idx}`}
                className="h-8 text-xs flex-1"
                placeholder="New PPF brand name..."
                value={item.name}
                autoFocus
                onChange={e => onChange(idx, { ...item, name: e.target.value })}
              />
              <button
                type="button"
                onClick={() => { setIsNewPPF(false); onChange(idx, { ...item, name: "" }); }}
                className="h-8 w-8 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-destructive flex-shrink-0 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Select value={item.name} onValueChange={handlePPFSelect}>
              <SelectTrigger data-testid={`select-ppf-brand-${idx}`} className="h-8 text-xs flex-1">
                <SelectValue placeholder="Select PPF brand..." />
              </SelectTrigger>
              <SelectContent>
                {ppfMasters.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                <SelectItem value={NEW_PPF_VALUE} className="text-primary font-medium">
                  <span className="flex items-center gap-1"><Plus className="h-3 w-3" /> Add new brand</span>
                </SelectItem>
              </SelectContent>
            </Select>
          )
        )}

        {item.itemType === "Accessory" && (
          <div className="flex flex-1 gap-2">
            {isNewCategory ? (
              <Input
                data-testid={`input-new-category-${idx}`}
                className="h-8 text-xs flex-1"
                placeholder="New category name..."
                value={item.categoryName}
                autoFocus
                onChange={e => onChange(idx, { ...item, categoryName: e.target.value })}
              />
            ) : (
              <Select value={item.categoryName} onValueChange={handleCategorySelect}>
                <SelectTrigger data-testid={`select-category-${idx}`} className="h-8 text-xs flex-1">
                  <SelectValue placeholder="Category..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                  <SelectItem value={NEW_CATEGORY_VALUE} className="text-primary font-medium">
                    <span className="flex items-center gap-1"><Plus className="h-3 w-3" /> New category</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
            {isNewAccessory || isNewCategory ? (
              <Input
                data-testid={`input-new-accessory-name-${idx}`}
                className="h-8 text-xs flex-1"
                placeholder="Accessory name..."
                value={item.name}
                onChange={e => onChange(idx, { ...item, name: e.target.value })}
              />
            ) : (
              <Select value={item.name} onValueChange={handleAccessorySelect} disabled={!item.categoryName}>
                <SelectTrigger data-testid={`select-acc-item-${idx}`} className="h-8 text-xs flex-1">
                  <SelectValue placeholder={item.categoryName ? "Accessory..." : "Pick category first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredAccessories.map(a => <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>)}
                  {item.categoryName && (
                    <SelectItem value={NEW_ACCESSORY_VALUE} className="text-primary font-medium">
                      <span className="flex items-center gap-1"><Plus className="h-3 w-3" /> New accessory</span>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => onRemove(idx)}
          className="h-8 w-8 flex items-center justify-center rounded border border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors flex-shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Row 2: PPF Roll Name */}
      {item.itemType === "PPF" && item.name && (
        <Input
          data-testid={`input-roll-name-${idx}`}
          className="h-8 text-xs"
          placeholder="Roll name (e.g. Roll A, Batch #001)..."
          value={(item as any).rollName || ""}
          onChange={e => onChange(idx, { ...item, rollName: e.target.value })}
        />
      )}

      {/* Row 3: HSN | Qty | Unit | Unit Price | Subtotal */}
      <div className="grid grid-cols-[1fr_72px_80px_100px_auto] gap-2 items-center">
        <HsnCombobox value={(item as any).hsnCode || ""} onChange={v => onChange(idx, { ...item, hsnCode: v })} idx={idx} />
        <Input
          data-testid={`input-item-qty-${idx}`}
          className="h-8 text-xs text-center"
          type="number"
          min={0}
          placeholder="Qty"
          value={item.quantity}
          onChange={e => onChange(idx, { ...item, quantity: Number(e.target.value) })}
        />
        <Select value={item.unit} onValueChange={v => onChange(idx, { ...item, unit: v })}>
          <SelectTrigger data-testid={`select-item-unit-${idx}`} className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["sqft", "pcs", "roll", "ltr", "kg", "set", "box"].map(u => (
              <SelectItem key={u} value={u}>{u}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          data-testid={`input-item-price-${idx}`}
          className="h-8 text-xs"
          type="number"
          min={0}
          placeholder="₹ Rate"
          value={item.unitPrice}
          onChange={e => onChange(idx, { ...item, unitPrice: Number(e.target.value) })}
        />
        <span className="text-xs font-semibold text-primary whitespace-nowrap min-w-[60px] text-right">
          {formatCurrency(item.quantity * item.unitPrice)}
        </span>
      </div>

      {/* Vehicle type pricing (new PPF brand only) */}
      {item.itemType === "PPF" && isNewPPF && item.name && (
        <div className="border-t border-dashed border-border/60 pt-2">
          <button
            type="button"
            onClick={() => setShowVehiclePricing(v => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showVehiclePricing ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {showVehiclePricing ? "Hide" : "Add"} vehicle-type pricing (optional)
          </button>
          {showVehiclePricing && (
            <div className="space-y-1.5 mt-2">
              {((item.ppfPricing as any[]) || []).map((row: any, pi: number) => (
                <div key={pi} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-1.5 items-center">
                  <Select value={row.vehicleType} onValueChange={v => updateVehiclePricingRow(pi, "vehicleType", v)}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Vehicle type" /></SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map(vt => <SelectItem key={vt.id} value={vt.name}>{vt.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={row.warranty} onValueChange={v => updateVehiclePricingRow(pi, "warranty", v)}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Warranty" /></SelectTrigger>
                    <SelectContent>
                      {["1 Year", "2 Years", "3 Years", "5 Years", "Lifetime"].map(w => (
                        <SelectItem key={w} value={w}>{w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input className="h-7 text-xs" type="number" placeholder="₹ Price"
                    value={row.price} onChange={e => updateVehiclePricingRow(pi, "price", Number(e.target.value))} />
                  <button type="button" onClick={() => removeVehiclePricingRow(pi)}
                    className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <Button type="button" size="sm" variant="outline" className="h-6 text-xs" onClick={addVehiclePricingRow}>
                <Plus className="h-3 w-3 mr-1" /> Add vehicle type
              </Button>
            </div>
          )}
        </div>
      )}

      {(isNewCategory || isNewAccessory) && (
        <p className="text-xs text-primary">{isNewCategory ? "New category & accessory" : "New accessory"} will be auto-created in Masters.</p>
      )}
      {isNewPPF && item.name && (
        <p className="text-xs text-primary">New PPF brand will be auto-created in Masters.</p>
      )}
    </div>
  );
}

// ─── Purchase Form ────────────────────────────────────────────────────────────
interface PurchaseFormProps {
  vendorId: string;
  vendorName: string;
  purchase?: VendorPurchase | null;
  onClose: () => void;
}

function PurchaseForm({ vendorId, vendorName, purchase, onClose }: PurchaseFormProps) {
  const { toast } = useToast();
  const [receivedDate, setReceivedDate] = useState(purchase?.receivedDate ?? "");
  const [notes, setNotes] = useState(purchase?.notes ?? "");

  const emptyItem = (): any => ({
    itemType: "PPF", categoryName: "", name: "", rollName: "", ppfPricing: [], hsnCode: "", quantity: 1, unit: "sqft", unitPrice: 0,
  });

  const [items, setItems] = useState<any[]>(
    purchase?.items?.length
      ? purchase.items.map((i: any) => ({ itemType: "PPF", categoryName: "", rollName: "", ppfPricing: [], hsnCode: "", ...i }))
      : [emptyItem()]
  );

  const { data: ppfMasters = [] } = useQuery<PPFMaster[]>({ queryKey: ["/api/masters/ppf"] });
  const { data: categories = [] } = useQuery<AccessoryCategory[]>({ queryKey: ["/api/masters/accessory-categories"] });
  const { data: accessories = [] } = useQuery<AccessoryMaster[]>({ queryKey: ["/api/masters/accessories"] });
  const { data: vehicleTypes = [] } = useQuery<VehicleType[]>({ queryKey: ["/api/masters/vehicle-types"] });

  const addItem = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, updated: any) => setItems(prev => prev.map((item, i) => i === idx ? updated : item));

  const total = items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);

  const invalidateMasters = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/masters/ppf"] });
    queryClient.invalidateQueries({ queryKey: ["/api/masters/accessories"] });
    queryClient.invalidateQueries({ queryKey: ["/api/masters/accessory-categories"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/vendor-purchases", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-purchases"] });
      invalidateMasters();
      toast({ title: "Purchase recorded" });
      onClose();
    },
  });
  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/vendor-purchases/${purchase!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-purchases"] });
      invalidateMasters();
      toast({ title: "Purchase updated" });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(i => i.name.trim());
    if (!validItems.length) {
      toast({ title: "Error", description: "Add at least one item", variant: "destructive" });
      return;
    }
    const payload = {
      vendorId,
      vendorName,
      items: validItems,
      status: "received",
      purchaseDate: new Date().toISOString().split("T")[0],
      receivedDate,
      notes,
      totalAmount: total,
    };
    if (purchase) updateMutation.mutate(payload); else createMutation.mutate(payload);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Items list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Items</h3>
            <p className="text-xs text-muted-foreground">Each PPF line = one roll. Add multiple rows for multiple rolls/items.</p>
          </div>
          <Button data-testid="button-add-item" type="button" size="sm" variant="outline" onClick={addItem}>
            <Plus className="h-3 w-3 mr-1" /> Add Item
          </Button>
        </div>

        {/* Column hint */}
        <div className="hidden sm:grid grid-cols-[1fr_72px_80px_100px_auto] gap-2 px-3 text-xs text-muted-foreground font-medium">
          <span>HSN Code</span>
          <span className="text-center">Qty</span>
          <span>Unit</span>
          <span>Rate (₹)</span>
          <span className="text-right min-w-[60px]">Amount</span>
        </div>

        <div className="space-y-2">
          {items.map((item, idx) => (
            <ItemRow
              key={idx}
              idx={idx}
              item={item}
              ppfMasters={ppfMasters}
              accessories={accessories}
              categories={categories}
              vehicleTypes={vehicleTypes}
              onChange={updateItem}
              onRemove={removeItem}
            />
          ))}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-border/60">
          <span className="text-sm text-muted-foreground">{items.filter(i => i.name).length} item(s)</span>
          <span className="text-base font-bold text-primary">Total: {formatCurrency(total)}</span>
        </div>
      </div>

      {/* Received date + Notes */}
      <div className="grid grid-cols-2 gap-4 pt-1 border-t border-border/40">
        <div className="space-y-1">
          <Label>Received Date</Label>
          <Input
            data-testid="input-received-date"
            type="date"
            value={receivedDate}
            onChange={e => setReceivedDate(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Notes</Label>
          <Input
            data-testid="input-purchase-notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Delivery in 3 days..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button data-testid="button-save-purchase" type="submit" disabled={isPending}>
          {isPending ? "Saving..." : purchase ? "Update Purchase" : "Record Purchase"}
        </Button>
      </div>
    </form>
  );
}

// ─── Full-Screen Purchase Panel ───────────────────────────────────────────────
interface PurchasePanelProps {
  vendor: Vendor;
  purchase?: VendorPurchase;
  onBack: () => void;
}

function PurchasePanel({ vendor, purchase, onBack }: PurchasePanelProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sticky header bar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-background/95 backdrop-blur-sm flex-shrink-0">
        <button
          type="button"
          data-testid="button-back-to-vendors"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="font-semibold text-foreground text-sm">{vendor.name}</span>
            {vendor.category && <span className="text-xs text-muted-foreground ml-2">{vendor.category}</span>}
          </div>
        </div>
        {(vendor.phone || vendor.contactPerson) && (
          <>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
              {vendor.contactPerson && <span>{vendor.contactPerson}</span>}
              {vendor.phone && <span className="font-mono">{vendor.phone}</span>}
            </div>
          </>
        )}
        <div className="ml-auto">
          <span className="text-sm font-medium text-muted-foreground">
            {purchase ? "Edit Purchase" : "New Purchase"}
          </span>
        </div>
      </div>

      {/* Scrollable form area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6">
          <PurchaseForm
            vendorId={vendor.id!}
            vendorName={vendor.name}
            purchase={purchase}
            onClose={onBack}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Vendor Card ──────────────────────────────────────────────────────────────
interface VendorCardProps {
  vendor: Vendor;
  purchases: VendorPurchase[];
  onEdit: () => void;
  onDelete: () => void;
  onAddPurchase: () => void;
  onEditPurchase: (p: VendorPurchase) => void;
  listView?: boolean;
}

function VendorCard({ vendor, purchases, onEdit, onDelete, onAddPurchase, onEditPurchase, listView }: VendorCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();
  const vendorPurchases = purchases.filter(p => p.vendorId === vendor.id);
  const totalSpend = vendorPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

  const deletePurchaseMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/vendor-purchases/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-purchases"] });
      toast({ title: "Purchase deleted" });
    },
  });

  if (listView) {
    return (
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border/40 hover:bg-muted/20 transition-colors">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Building2 className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p data-testid={`text-vendor-name-${vendor.id}`} className="font-semibold text-foreground text-sm">{vendor.name}</p>
          {vendor.category && <span className="text-xs text-muted-foreground">{vendor.category}</span>}
        </div>
        <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground min-w-[120px]">
          {vendor.contactPerson && <><Building2 className="h-3 w-3" /><span>{vendor.contactPerson}</span></>}
        </div>
        <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground min-w-[110px]">
          {vendor.phone && <><Phone className="h-3 w-3" /><span>{vendor.phone}</span></>}
        </div>
        <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground min-w-[130px]">
          {vendor.email && <><Mail className="h-3 w-3" /><span className="truncate max-w-[120px]">{vendor.email}</span></>}
        </div>
        <div className="text-right min-w-[100px]">
          <p data-testid={`text-vendor-spend-${vendor.id}`} className="text-sm font-semibold text-primary">{formatCurrency(totalSpend)}</p>
          <p className="text-xs text-muted-foreground">{vendorPurchases.length} purchase{vendorPurchases.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button data-testid={`button-add-purchase-${vendor.id}`} size="sm" variant="outline" onClick={onAddPurchase} className="h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" /> Purchase
          </Button>
          <Button data-testid={`button-edit-vendor-${vendor.id}`} size="icon" variant="ghost" className="h-7 w-7" onClick={onEdit}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button data-testid={`button-delete-vendor-${vendor.id}`} size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border border-border/60">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 data-testid={`text-vendor-name-${vendor.id}`} className="font-semibold text-foreground leading-tight">{vendor.name}</h3>
              {vendor.category && <span className="text-xs text-muted-foreground">{vendor.category}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button data-testid={`button-add-purchase-${vendor.id}`} size="sm" variant="outline" onClick={onAddPurchase} className="h-8 text-xs">
              <Plus className="h-3 w-3 mr-1" /> Purchase
            </Button>
            <Button data-testid={`button-edit-vendor-${vendor.id}`} size="icon" variant="ghost" className="h-8 w-8" onClick={onEdit}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button data-testid={`button-delete-vendor-${vendor.id}`} size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {vendor.contactPerson && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              <span data-testid={`text-vendor-contact-${vendor.id}`}>{vendor.contactPerson}</span>
            </div>
          )}
          {vendor.phone && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span data-testid={`text-vendor-phone-${vendor.id}`}>{vendor.phone}</span>
            </div>
          )}
          {vendor.email && (
            <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
              <Mail className="h-3.5 w-3.5" />
              <span data-testid={`text-vendor-email-${vendor.id}`}>{vendor.email}</span>
            </div>
          )}
          {vendor.address && (
            <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
              <MapPin className="h-3.5 w-3.5" />
              <span data-testid={`text-vendor-address-${vendor.id}`} className="line-clamp-1">{vendor.address}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{vendorPurchases.length} purchase{vendorPurchases.length !== 1 ? "s" : ""}</span>
            <span data-testid={`text-vendor-spend-${vendor.id}`} className="font-semibold text-primary">{formatCurrency(totalSpend)}</span>
          </div>
          {vendorPurchases.length > 0 && (
            <button
              data-testid={`button-toggle-purchases-${vendor.id}`}
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {expanded ? "Hide" : "View"} purchases
            </button>
          )}
        </div>

        {expanded && vendorPurchases.length > 0 && (
          <div className="space-y-2 pt-1">
            {vendorPurchases.map(p => (
              <div key={p.id} data-testid={`card-purchase-${p.id}`}
                className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {p.receivedDate ? `Received: ${formatDate(p.receivedDate)}` : "Not yet received"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-primary">{formatCurrency(p.totalAmount)}</span>
                    <Button data-testid={`button-edit-purchase-${p.id}`} size="icon" variant="ghost" className="h-7 w-7"
                      onClick={() => onEditPurchase(p)}>
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button data-testid={`button-delete-purchase-${p.id}`} size="icon" variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deletePurchaseMutation.mutate(p.id!)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-0.5">
                  {p.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 flex-wrap">
                        {item.itemType && <span className="text-primary font-medium">[{item.itemType}]</span>}
                        {item.categoryName && item.categoryName !== "PPF" && <span>{item.categoryName} › </span>}
                        <span>{item.name}</span>
                        <span>× {item.quantity} {item.unit}</span>
                        {item.hsnCode && <span className="font-mono text-muted-foreground/60">HSN:{item.hsnCode}</span>}
                      </span>
                      <span className="flex-shrink-0 font-medium">{formatCurrency(item.quantity * item.unitPrice)}</span>
                    </div>
                  ))}
                </div>
                {p.notes && <p className="text-xs text-muted-foreground italic">{p.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Layout Toggle ────────────────────────────────────────────────────────────
function LayoutToggle({ value, onChange }: { value: "grid" | "list"; onChange: (v: "grid" | "list") => void }) {
  return (
    <div className="flex items-center border border-border/60 rounded-lg overflow-hidden">
      <button data-testid="button-layout-grid" onClick={() => onChange("grid")}
        className={`p-2 transition-colors ${value === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}>
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button data-testid="button-layout-list" onClick={() => onChange("list")}
        className={`p-2 transition-colors ${value === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}>
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VendorManagementPage() {
  const { toast } = useToast();
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [purchaseView, setPurchaseView] = useState<{ vendor: Vendor; purchase?: VendorPurchase } | null>(null);

  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorSort, setVendorSort] = useState("name-asc");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [vendorLayout, setVendorLayout] = useState<"grid" | "list">("grid");

  const [purchaseSearch, setPurchaseSearch] = useState("");
  const [purchaseSort, setPurchaseSort] = useState("date-desc");
  const [purchaseVendorFilter, setPurchaseVendorFilter] = useState("all");
  const [purchaseLayout, setPurchaseLayout] = useState<"grid" | "list">("list");

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<Vendor[]>({ queryKey: ["/api/vendors"] });
  const { data: purchases = [], isLoading: purchasesLoading } = useQuery<VendorPurchase[]>({ queryKey: ["/api/vendor-purchases"] });

  const deleteVendorMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/vendors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-purchases"] });
      toast({ title: "Vendor deleted" });
    },
  });
  const deletePurchaseMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/vendor-purchases/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-purchases"] });
      toast({ title: "Purchase deleted" });
    },
  });

  const totalSpend = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const thisMonth = purchases.filter(p => {
    const d = new Date(p.purchaseDate || p.createdAt || "");
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const filteredVendors = vendors
    .filter(v => {
      const matchesSearch =
        v.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
        (v.contactPerson || "").toLowerCase().includes(vendorSearch.toLowerCase()) ||
        (v.category || "").toLowerCase().includes(vendorSearch.toLowerCase());
      const matchesFilter = vendorFilter === "all" || (v.category || "").toLowerCase() === vendorFilter.toLowerCase();
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const aPurchases = purchases.filter(p => p.vendorId === a.id);
      const bPurchases = purchases.filter(p => p.vendorId === b.id);
      const aSpend = aPurchases.reduce((s, p) => s + (p.totalAmount || 0), 0);
      const bSpend = bPurchases.reduce((s, p) => s + (p.totalAmount || 0), 0);
      switch (vendorSort) {
        case "name-asc": return a.name.localeCompare(b.name);
        case "name-desc": return b.name.localeCompare(a.name);
        case "spend-desc": return bSpend - aSpend;
        case "spend-asc": return aSpend - bSpend;
        case "purchases-desc": return bPurchases.length - aPurchases.length;
        default: return 0;
      }
    });

  const filteredPurchases = purchases
    .filter(p => {
      const matchesSearch =
        (p.vendorName || "").toLowerCase().includes(purchaseSearch.toLowerCase()) ||
        p.items.some((i: any) => i.name.toLowerCase().includes(purchaseSearch.toLowerCase()));
      const matchesVendor = purchaseVendorFilter === "all" || p.vendorId === purchaseVendorFilter;
      return matchesSearch && matchesVendor;
    })
    .sort((a, b) => {
      switch (purchaseSort) {
        case "date-desc": return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
        case "date-asc": return new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
        case "amount-desc": return (b.totalAmount || 0) - (a.totalAmount || 0);
        case "amount-asc": return (a.totalAmount || 0) - (b.totalAmount || 0);
        case "vendor-asc": return (a.vendorName || "").localeCompare(b.vendorName || "");
        default: return 0;
      }
    });

  const filteredTotal = filteredPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const uniqueVendors = vendors.filter((v, i, arr) => arr.findIndex(x => x.id === v.id) === i);

  // ── Full-screen Purchase Panel ───────────────────────────────────────────
  if (purchaseView) {
    return (
      <Layout>
        <div className="h-full flex flex-col overflow-hidden">
          <PurchasePanel
            vendor={purchaseView.vendor}
            purchase={purchaseView.purchase}
            onBack={() => setPurchaseView(null)}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Vendor Management</h1>
            <p className="text-muted-foreground mt-1">Track vendors, purchases, and inventory</p>
          </div>
          <Button data-testid="button-add-vendor" onClick={() => setIsAddVendorOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Vendor
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Vendors</p>
                <p data-testid="stat-total-vendors" className="text-2xl font-bold">{vendors.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spend</p>
                <p data-testid="stat-total-spend" className="text-2xl font-bold text-green-600">{formatCurrency(totalSpend)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p data-testid="stat-this-month" className="text-2xl font-bold text-blue-600">{thisMonth}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="vendors">
          <TabsList>
            <TabsTrigger value="vendors" data-testid="tab-vendors">Vendors</TabsTrigger>
            <TabsTrigger value="purchases" data-testid="tab-purchases">All Purchases</TabsTrigger>
          </TabsList>

          {/* ── Vendors Tab ─────────────────────────────────────────────── */}
          <TabsContent value="vendors" className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input data-testid="input-search-vendor" className="pl-9" placeholder="Search vendors..."
                  value={vendorSearch} onChange={e => setVendorSearch(e.target.value)} />
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <Select value={vendorFilter} onValueChange={setVendorFilter}>
                <SelectTrigger data-testid="select-vendor-filter" className="h-9 w-36 text-sm">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {VENDOR_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <ArrowUpDown className="h-4 w-4" />
              </div>
              <Select value={vendorSort} onValueChange={setVendorSort}>
                <SelectTrigger data-testid="select-vendor-sort" className="h-9 w-44 text-sm">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name A → Z</SelectItem>
                  <SelectItem value="name-desc">Name Z → A</SelectItem>
                  <SelectItem value="spend-desc">Spend: High → Low</SelectItem>
                  <SelectItem value="spend-asc">Spend: Low → High</SelectItem>
                  <SelectItem value="purchases-desc">Most Purchases</SelectItem>
                </SelectContent>
              </Select>
              <div className="ml-auto">
                <LayoutToggle value={vendorLayout} onChange={setVendorLayout} />
              </div>
            </div>

            {(vendorSearch || vendorFilter !== "all") && (
              <p className="text-xs text-muted-foreground">{filteredVendors.length} of {vendors.length} vendor{vendors.length !== 1 ? "s" : ""}</p>
            )}

            {vendorsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">{vendorSearch || vendorFilter !== "all" ? "No vendors match your filters" : "No vendors yet"}</p>
                {!vendorSearch && vendorFilter === "all" && <p className="text-sm mt-1">Click "Add Vendor" to get started</p>}
              </div>
            ) : vendorLayout === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredVendors.map(vendor => (
                  <VendorCard key={vendor.id} vendor={vendor} purchases={purchases}
                    onEdit={() => setEditingVendor(vendor)}
                    onDelete={() => deleteVendorMutation.mutate(vendor.id!)}
                    onAddPurchase={() => setPurchaseView({ vendor })}
                    onEditPurchase={(p) => setPurchaseView({ vendor, purchase: p })} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border/60 overflow-hidden">
                <div className="hidden md:grid grid-cols-[2fr_1.5fr_1.5fr_1.5fr_auto] gap-4 px-4 py-2 bg-muted/50 border-b border-border/60 text-xs font-medium text-muted-foreground">
                  <span>Vendor</span><span>Contact</span><span>Phone</span><span className="hidden lg:block">Email</span><span className="text-right">Spend</span>
                </div>
                {filteredVendors.map(vendor => (
                  <VendorCard key={vendor.id} vendor={vendor} purchases={purchases}
                    onEdit={() => setEditingVendor(vendor)}
                    onDelete={() => deleteVendorMutation.mutate(vendor.id!)}
                    onAddPurchase={() => setPurchaseView({ vendor })}
                    onEditPurchase={(p) => setPurchaseView({ vendor, purchase: p })}
                    listView />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── All Purchases Tab ────────────────────────────────────────── */}
          <TabsContent value="purchases" className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input data-testid="input-search-purchase" className="pl-9" placeholder="Search purchases..."
                  value={purchaseSearch} onChange={e => setPurchaseSearch(e.target.value)} />
              </div>
              <Select value={purchaseVendorFilter} onValueChange={setPurchaseVendorFilter}>
                <SelectTrigger data-testid="select-purchase-vendor-filter" className="h-9 w-44 text-sm">
                  <SelectValue placeholder="Filter by vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {uniqueVendors.map(v => <SelectItem key={v.id} value={v.id!}>{v.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <ArrowUpDown className="h-4 w-4" />
              </div>
              <Select value={purchaseSort} onValueChange={setPurchaseSort}>
                <SelectTrigger data-testid="select-purchase-sort" className="h-9 w-44 text-sm">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date: Newest First</SelectItem>
                  <SelectItem value="date-asc">Date: Oldest First</SelectItem>
                  <SelectItem value="amount-desc">Amount: High → Low</SelectItem>
                  <SelectItem value="amount-asc">Amount: Low → High</SelectItem>
                  <SelectItem value="vendor-asc">Vendor A → Z</SelectItem>
                </SelectContent>
              </Select>
              <div className="ml-auto">
                <LayoutToggle value={purchaseLayout} onChange={setPurchaseLayout} />
              </div>
            </div>

            {(purchaseSearch || purchaseVendorFilter !== "all") && (
              <p className="text-xs text-muted-foreground">{filteredPurchases.length} of {purchases.length} purchase{purchases.length !== 1 ? "s" : ""}</p>
            )}

            {purchasesLoading ? (
              <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
            ) : filteredPurchases.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">{purchaseSearch || purchaseVendorFilter !== "all" ? "No purchases match your filters" : "No purchases recorded yet"}</p>
                {!purchaseSearch && purchaseVendorFilter === "all" && (
                  <p className="text-sm mt-1">Add a vendor and record purchases from their card</p>
                )}
              </div>
            ) : purchaseLayout === "grid" ? (
              <div className="space-y-2">
                {filteredPurchases.map(p => {
                  const vendor = vendors.find(v => v.id === p.vendorId);
                  return (
                    <div key={p.id} data-testid={`card-purchase-grid-${p.id}`}
                      className="rounded-lg border border-border/60 bg-card p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">{p.vendorName || "—"}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.receivedDate ? `Received: ${formatDate(p.receivedDate)}` : "Not yet received"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-primary">{formatCurrency(p.totalAmount)}</span>
                          {vendor && (
                            <Button data-testid={`button-edit-purchase-tab-${p.id}`} size="icon" variant="ghost" className="h-7 w-7"
                              onClick={() => setPurchaseView({ vendor, purchase: p })}>
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button data-testid={`button-delete-purchase-tab-${p.id}`} size="icon" variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => deletePurchaseMutation.mutate(p.id!)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1 border-t border-border/40 pt-2">
                        {p.items.map((item: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              {item.itemType && <span className="text-primary font-medium text-[10px] bg-primary/10 px-1 rounded">{item.itemType}</span>}
                              {item.categoryName && item.categoryName !== "PPF" && <span>{item.categoryName} › </span>}
                              <span>{item.name}</span>
                              <span className="text-muted-foreground/70">×{item.quantity} {item.unit}</span>
                              {item.hsnCode && <span className="font-mono text-muted-foreground/50">#{item.hsnCode}</span>}
                            </span>
                            <span className="font-medium">{formatCurrency(item.quantity * item.unitPrice)}</span>
                          </div>
                        ))}
                      </div>
                      {p.notes && <p className="text-xs text-muted-foreground italic">{p.notes}</p>}
                    </div>
                  );
                })}
                <div className="flex justify-between items-center pt-2 border-t border-border/60">
                  <span className="text-sm text-muted-foreground">{filteredPurchases.length} purchase{filteredPurchases.length !== 1 ? "s" : ""}</span>
                  <span className="text-sm font-bold text-primary">Total: {formatCurrency(filteredTotal)}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border/60 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border/60">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vendor</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Items</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Received</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredPurchases.map(p => {
                      const vendor = vendors.find(v => v.id === p.vendorId);
                      return (
                        <tr data-testid={`row-purchase-${p.id}`} key={p.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-medium">{p.vendorName || "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            <div className="space-y-0.5">
                              {p.items.map((item: any, i: number) => (
                                <div key={i} className="flex items-center gap-1 text-xs">
                                  {item.itemType && (
                                    <span className="text-primary font-medium text-[10px] bg-primary/10 px-1 rounded">{item.itemType}</span>
                                  )}
                                  {item.categoryName && item.categoryName !== "PPF" && <span>{item.categoryName} › </span>}
                                  <span>{item.name}</span>
                                  <span>×{item.quantity} {item.unit}</span>
                                  {item.hsnCode && <span className="font-mono text-muted-foreground/50">#{item.hsnCode}</span>}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{p.receivedDate ? formatDate(p.receivedDate) : "—"}</td>
                          <td className="px-4 py-3 text-right font-semibold text-primary">{formatCurrency(p.totalAmount)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              {vendor && (
                                <Button data-testid={`button-edit-purchase-row-${p.id}`} size="icon" variant="ghost" className="h-7 w-7"
                                  onClick={() => setPurchaseView({ vendor, purchase: p })}>
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button data-testid={`button-delete-purchase-row-${p.id}`} size="icon" variant="ghost"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => deletePurchaseMutation.mutate(p.id!)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-muted/30 border-t border-border/60">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-sm font-medium text-muted-foreground">
                        {filteredPurchases.length} purchase{filteredPurchases.length !== 1 ? "s" : ""}
                      </td>
                      <td colSpan={2} className="px-4 py-3 text-right font-bold text-primary">{formatCurrency(filteredTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add New Vendor</DialogTitle></DialogHeader>
          <VendorForm onClose={() => setIsAddVendorOpen(false)} />
        </DialogContent>
      </Dialog>

      {editingVendor && (
        <Dialog open onOpenChange={() => setEditingVendor(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Edit Vendor</DialogTitle></DialogHeader>
            <VendorForm vendor={editingVendor} onClose={() => setEditingVendor(null)} />
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
}
