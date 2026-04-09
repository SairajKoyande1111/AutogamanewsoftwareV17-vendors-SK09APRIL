import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Search, Building2, Phone, Mail, MapPin, Edit2, Trash2,
  ShoppingCart, Package, CalendarDays, ChevronDown, ChevronUp, X,
  LayoutGrid, List, ArrowUpDown, SlidersHorizontal
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Vendor, VendorPurchase, PurchaseItem, PPFMaster, AccessoryMaster, AccessoryCategory, VehicleType } from "@shared/schema";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  ordered: "bg-yellow-100 text-yellow-800 border-yellow-200",
  received: "bg-green-100 text-green-800 border-green-200",
  partial: "bg-blue-100 text-blue-800 border-blue-200",
};
const STATUS_LABELS: Record<string, string> = {
  ordered: "Ordered",
  received: "Received",
  partial: "Partial",
};
const VENDOR_CATEGORIES = ["PPF", "Accessory"];

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  try { return format(new Date(dateStr), "dd MMM yyyy"); } catch { return dateStr; }
}
function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// ─── Vendor Form ───────────────────────────────────────────────────────────
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
            onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} placeholder="Contact name" />
        </div>
        <div className="space-y-1">
          <Label>Phone</Label>
          <Input data-testid="input-vendor-phone" value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 XXXXXXXXXX" />
        </div>
        <div className="space-y-1">
          <Label>Email</Label>
          <Input data-testid="input-vendor-email" type="email" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="vendor@email.com" />
        </div>
        <div className="space-y-1">
          <Label>Type</Label>
          <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
            <SelectTrigger data-testid="select-vendor-category"><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {VENDOR_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Address</Label>
          <Input data-testid="input-vendor-address" value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Full address" />
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Notes</Label>
          <Textarea data-testid="input-vendor-notes" value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." rows={2} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button data-testid="button-save-vendor" type="submit" disabled={isPending}>
          {isPending ? "Saving..." : vendor ? "Update Vendor" : "Add Vendor"}
        </Button>
      </div>
    </form>
  );
}

// ─── Smart Item Row ────────────────────────────────────────────────────────
interface ItemRowProps {
  item: PurchaseItem; idx: number;
  ppfMasters: PPFMaster[]; accessories: AccessoryMaster[]; categories: AccessoryCategory[];
  vehicleTypes: VehicleType[];
  onChange: (idx: number, item: PurchaseItem) => void; onRemove: (idx: number) => void;
}

const NEW_PPF_VALUE = "__new_ppf__";
const NEW_CATEGORY_VALUE = "__new_category__";
const NEW_ACCESSORY_VALUE = "__new_accessory__";

function ItemRow({ item, idx, ppfMasters, accessories, categories, vehicleTypes, onChange, onRemove }: ItemRowProps) {
  const [isNewPPF, setIsNewPPF] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [isNewAccessory, setIsNewAccessory] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  const filteredAccessories = item.categoryName
    ? accessories.filter(a => a.category === item.categoryName)
    : accessories;

  const ppfPricing: any[] = (item as any).ppfPricing || [];

  const handleTypeChange = (newType: "PPF" | "Accessory") => {
    setIsNewPPF(false);
    setIsNewCategory(false);
    setIsNewAccessory(false);
    setShowPricing(false);
    onChange(idx, { ...item, itemType: newType, categoryName: "", name: "", rollName: "", ppfPricing: [], unit: newType === "PPF" ? "sqft" : "pcs", unitPrice: 0, quantity: 1 });
  };

  const handlePPFSelect = (value: string) => {
    if (value === NEW_PPF_VALUE) {
      setIsNewPPF(true);
      setShowPricing(false);
      onChange(idx, { ...item, name: "", rollName: "", ppfPricing: [] });
    } else {
      setIsNewPPF(false);
      setShowPricing(false);
      onChange(idx, { ...item, name: value, ppfPricing: [] });
    }
  };

  const addVehiclePricing = (typeName: string) => {
    if (ppfPricing.some((p: any) => p.vehicleType === typeName)) return;
    const updated = [...ppfPricing, { vehicleType: typeName, options: [{ warrantyName: "", price: 0 }] }];
    onChange(idx, { ...item, ppfPricing: updated } as any);
  };

  const removeVehiclePricing = (typeIndex: number) => {
    const updated = ppfPricing.filter((_: any, i: number) => i !== typeIndex);
    onChange(idx, { ...item, ppfPricing: updated } as any);
  };

  const addOption = (typeIndex: number) => {
    const updated = ppfPricing.map((p: any, i: number) =>
      i === typeIndex ? { ...p, options: [...p.options, { warrantyName: "", price: 0 }] } : p
    );
    onChange(idx, { ...item, ppfPricing: updated } as any);
  };

  const removeOption = (typeIndex: number, optIndex: number) => {
    const updated = ppfPricing.map((p: any, i: number) =>
      i === typeIndex ? { ...p, options: p.options.filter((_: any, oi: number) => oi !== optIndex) } : p
    );
    onChange(idx, { ...item, ppfPricing: updated } as any);
  };

  const updateOption = (typeIndex: number, optIndex: number, field: string, value: any) => {
    const updated = ppfPricing.map((p: any, i: number) =>
      i === typeIndex ? {
        ...p,
        options: p.options.map((opt: any, oi: number) => oi === optIndex ? { ...opt, [field]: value } : opt)
      } : p
    );
    onChange(idx, { ...item, ppfPricing: updated } as any);
  };

  const handleCategorySelect = (value: string) => {
    if (value === NEW_CATEGORY_VALUE) {
      setIsNewCategory(true);
      setIsNewAccessory(false);
      onChange(idx, { ...item, categoryName: "", name: "" });
    } else {
      setIsNewCategory(false);
      setIsNewAccessory(false);
      onChange(idx, { ...item, categoryName: value, name: "" });
    }
  };

  const handleAccessorySelect = (value: string) => {
    if (value === NEW_ACCESSORY_VALUE) {
      setIsNewAccessory(true);
      onChange(idx, { ...item, name: "" });
    } else {
      setIsNewAccessory(false);
      const acc = accessories.find(a => a.name === value);
      onChange(idx, { ...item, name: value, unitPrice: acc?.price ?? item.unitPrice });
    }
  };

  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground w-5">{idx + 1}.</span>
          <Select value={item.itemType} onValueChange={v => handleTypeChange(v as any)}>
            <SelectTrigger data-testid={`select-item-type-${idx}`} className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PPF">PPF</SelectItem>
              <SelectItem value="Accessory">Accessory</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <button data-testid={`button-remove-item-${idx}`} type="button" onClick={() => onRemove(idx)}
          className="text-muted-foreground hover:text-destructive transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {item.itemType === "PPF" && (
        <div className="space-y-2">
          {/* PPF Brand */}
          <div className="space-y-1">
            <Label className="text-xs">PPF Brand / Film *</Label>
            {isNewPPF ? (
              <div className="flex gap-1">
                <Input
                  data-testid={`input-new-ppf-name-${idx}`}
                  className="h-8 text-xs flex-1"
                  placeholder="Enter new PPF brand name..."
                  value={item.name}
                  autoFocus
                  onChange={e => onChange(idx, { ...item, name: e.target.value })}
                />
                <button type="button" onClick={() => { setIsNewPPF(false); setShowPricing(false); onChange(idx, { ...item, name: "", ppfPricing: [] }); }}
                  className="h-8 w-8 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Select value={item.name || ""} onValueChange={handlePPFSelect}>
                <SelectTrigger data-testid={`select-ppf-brand-${idx}`} className="h-8 text-xs">
                  <SelectValue placeholder="Select PPF brand..." />
                </SelectTrigger>
                <SelectContent>
                  {ppfMasters.map(ppf => (
                    <SelectItem key={ppf.id} value={ppf.name}>{ppf.name}</SelectItem>
                  ))}
                  <SelectItem value={NEW_PPF_VALUE} className="text-primary font-medium">
                    <span className="flex items-center gap-1"><Plus className="h-3 w-3" /> Add new PPF brand</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Roll Name + Qty + Price in grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Roll Name *</Label>
              <Input data-testid={`input-roll-name-${idx}`} className="h-8 text-xs"
                placeholder="e.g. Roll 1, Front Roll"
                value={(item as any).rollName || ""}
                onChange={e => onChange(idx, { ...item, rollName: e.target.value } as any)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Stock (sqft)</Label>
              <Input data-testid={`input-item-qty-${idx}`} className="h-8 text-xs" type="number" min={0}
                placeholder="0" value={item.quantity}
                onChange={e => onChange(idx, { ...item, quantity: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Unit Price (₹)</Label>
              <Input data-testid={`input-item-price-${idx}`} className="h-8 text-xs" type="number" min={0}
                placeholder="0" value={item.unitPrice}
                onChange={e => onChange(idx, { ...item, unitPrice: Number(e.target.value) })} />
            </div>
          </div>

          {/* Vehicle Type Pricing — only for new PPF brands */}
          {isNewPPF && (
            <div className="border border-dashed border-primary/40 rounded-lg p-2 space-y-2 bg-primary/5">
              <button type="button"
                onClick={() => setShowPricing(p => !p)}
                className="w-full flex items-center justify-between text-xs font-semibold text-primary">
                <span>Vehicle Type Pricing (optional)</span>
                {showPricing ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {showPricing && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <Select onValueChange={addVehiclePricing}>
                      <SelectTrigger className="h-7 text-xs flex-1">
                        <SelectValue placeholder="+ Add vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicleTypes.map(vt => (
                          <SelectItem key={vt.id} value={vt.name}
                            disabled={ppfPricing.some((p: any) => p.vehicleType === vt.name)}>
                            {vt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {ppfPricing.map((vp: any, typeIdx: number) => (
                    <div key={vp.vehicleType} className="rounded border border-border/60 bg-background p-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-primary">{vp.vehicleType}</span>
                        <button type="button" onClick={() => removeVehiclePricing(typeIdx)}
                          className="text-muted-foreground hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      {vp.options.map((opt: any, optIdx: number) => (
                        <div key={optIdx} className="grid grid-cols-[1fr,80px,24px] gap-1 items-center">
                          <Input className="h-7 text-xs" placeholder="Warranty (e.g. TPU 5Y Gloss)"
                            value={opt.warrantyName}
                            onChange={e => updateOption(typeIdx, optIdx, "warrantyName", e.target.value)} />
                          <Input className="h-7 text-xs text-right" type="number" placeholder="₹"
                            value={opt.price}
                            onChange={e => updateOption(typeIdx, optIdx, "price", Number(e.target.value))} />
                          <button type="button" onClick={() => removeOption(typeIdx, optIdx)}
                            className="text-muted-foreground hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addOption(typeIdx)}
                        className="text-xs text-primary flex items-center gap-1 hover:underline">
                        <Plus className="h-3 w-3" /> Add warranty option
                      </button>
                    </div>
                  ))}
                  <p className="text-[10px] text-muted-foreground">Pricing can also be set later in Masters.</p>
                </div>
              )}
            </div>
          )}

          {isNewPPF && (
            <p className="text-xs text-primary">New PPF brand + roll will be added to Masters automatically.</p>
          )}
        </div>
      )}

      {item.itemType === "Accessory" && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Category *</Label>
            {isNewCategory ? (
              <div className="flex gap-1">
                <Input
                  data-testid={`input-new-category-name-${idx}`}
                  className="h-8 text-xs flex-1"
                  placeholder="New category name..."
                  value={item.categoryName ?? ""}
                  autoFocus
                  onChange={e => onChange(idx, { ...item, categoryName: e.target.value, name: "" })}
                />
                <button type="button" onClick={() => { setIsNewCategory(false); onChange(idx, { ...item, categoryName: "", name: "" }); }}
                  className="h-8 w-8 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Select value={item.categoryName ?? ""} onValueChange={handleCategorySelect}>
                <SelectTrigger data-testid={`select-acc-category-${idx}`} className="h-8 text-xs">
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                  <SelectItem value={NEW_CATEGORY_VALUE} className="text-primary font-medium">
                    <span className="flex items-center gap-1"><Plus className="h-3 w-3" /> Add new category</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Accessory *</Label>
            {isNewAccessory || isNewCategory ? (
              <div className="flex gap-1">
                <Input
                  data-testid={`input-new-accessory-name-${idx}`}
                  className="h-8 text-xs flex-1"
                  placeholder="New accessory name..."
                  value={item.name}
                  autoFocus={isNewAccessory}
                  onChange={e => onChange(idx, { ...item, name: e.target.value })}
                />
                {isNewAccessory && (
                  <button type="button" onClick={() => { setIsNewAccessory(false); onChange(idx, { ...item, name: "" }); }}
                    className="h-8 w-8 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <Select value={item.name} onValueChange={handleAccessorySelect} disabled={!item.categoryName}>
                <SelectTrigger data-testid={`select-acc-item-${idx}`} className="h-8 text-xs">
                  <SelectValue placeholder={item.categoryName ? "Select accessory..." : "Pick category first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredAccessories.map(a => (
                    <SelectItem key={a.id} value={a.name}>
                      {a.name}
                      <span className="text-muted-foreground ml-1">— ₹{a.price}</span>
                    </SelectItem>
                  ))}
                  {item.categoryName && (
                    <SelectItem value={NEW_ACCESSORY_VALUE} className="text-primary font-medium">
                      <span className="flex items-center gap-1"><Plus className="h-3 w-3" /> Add new accessory</span>
                    </SelectItem>
                  )}
                  {filteredAccessories.length === 0 && item.categoryName && (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">No existing accessories — add new above</div>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
          {(isNewCategory || isNewAccessory) && (
            <div className="col-span-2">
              <p className="text-xs text-primary">
                {isNewCategory ? "New category & accessory" : "New accessory"} will be automatically added to Masters.
              </p>
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-xs">Quantity</Label>
            <Input data-testid={`input-item-qty-${idx}`} className="h-8 text-xs" type="number" min={0}
              placeholder="0" value={item.quantity}
              onChange={e => onChange(idx, { ...item, quantity: Number(e.target.value) })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Unit Price (₹)</Label>
            <Input data-testid={`input-item-price-${idx}`} className="h-8 text-xs" type="number" min={0}
              placeholder="0" value={item.unitPrice}
              onChange={e => onChange(idx, { ...item, unitPrice: Number(e.target.value) })} />
          </div>
        </div>
      )}

      {item.name && (
        <div className="text-xs text-right text-muted-foreground">
          Subtotal: <span className="font-semibold text-primary">{formatCurrency(item.quantity * item.unitPrice)}</span>
        </div>
      )}
    </div>
  );
}

// ─── Purchase Form ─────────────────────────────────────────────────────────
interface PurchaseFormProps {
  vendorId: string; vendorName: string;
  purchase?: VendorPurchase | null; onClose: () => void;
}

function PurchaseForm({ vendorId, vendorName, purchase, onClose }: PurchaseFormProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<"ordered" | "received" | "partial">(purchase?.status ?? "ordered");
  const [purchaseDate, setPurchaseDate] = useState(purchase?.purchaseDate ?? new Date().toISOString().split("T")[0]);
  const [receivedDate, setReceivedDate] = useState(purchase?.receivedDate ?? "");
  const [notes, setNotes] = useState(purchase?.notes ?? "");
  const emptyPPFItem = (): PurchaseItem => ({ itemType: "PPF", categoryName: "", name: "", rollName: "", ppfPricing: [], quantity: 1, unit: "sqft", unitPrice: 0 } as any);

  const [items, setItems] = useState<PurchaseItem[]>(
    purchase?.items?.length
      ? purchase.items.map(i => ({ itemType: "PPF" as const, categoryName: "", rollName: "", ppfPricing: [], ...i }))
      : [emptyPPFItem()]
  );

  const { data: ppfMasters = [] } = useQuery<PPFMaster[]>({ queryKey: ["/api/masters/ppf"] });
  const { data: categories = [] } = useQuery<AccessoryCategory[]>({ queryKey: ["/api/masters/accessory-categories"] });
  const { data: accessories = [] } = useQuery<AccessoryMaster[]>({ queryKey: ["/api/masters/accessories"] });
  const { data: vehicleTypes = [] } = useQuery<VehicleType[]>({ queryKey: ["/api/masters/vehicle-types"] });

  const addItem = () => setItems(prev => [...prev, emptyPPFItem()]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, updated: PurchaseItem) =>
    setItems(prev => prev.map((item, i) => i === idx ? updated : item));

  const total = items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);

  const invalidateMastersCaches = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/masters/ppf"] });
    queryClient.invalidateQueries({ queryKey: ["/api/masters/accessories"] });
    queryClient.invalidateQueries({ queryKey: ["/api/masters/accessory-categories"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/vendor-purchases", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-purchases"] });
      invalidateMastersCaches();
      toast({ title: "Purchase recorded" }); onClose();
    },
  });
  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/vendor-purchases/${purchase!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-purchases"] });
      invalidateMastersCaches();
      toast({ title: "Purchase updated" }); onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(i => i.name.trim());
    if (!validItems.length) {
      toast({ title: "Error", description: "Add at least one item", variant: "destructive" }); return;
    }
    const payload = { vendorId, vendorName, items: validItems, status, purchaseDate, receivedDate, notes };
    if (purchase) updateMutation.mutate(payload); else createMutation.mutate(payload);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Purchase Date *</Label>
          <Input data-testid="input-purchase-date" type="date" value={purchaseDate}
            onChange={e => setPurchaseDate(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label>Status</Label>
          <Select value={status} onValueChange={v => setStatus(v as any)}>
            <SelectTrigger data-testid="select-purchase-status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(status === "received" || status === "partial") && (
          <div className="space-y-1">
            <Label>Received Date</Label>
            <Input data-testid="input-received-date" type="date" value={receivedDate}
              onChange={e => setReceivedDate(e.target.value)} />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Items</Label>
          <Button data-testid="button-add-item" type="button" size="sm" variant="outline" onClick={addItem}>
            <Plus className="h-3 w-3 mr-1" /> Add Item
          </Button>
        </div>
        <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <ItemRow key={idx} idx={idx} item={item}
              ppfMasters={ppfMasters} accessories={accessories} categories={categories}
              vehicleTypes={vehicleTypes}
              onChange={updateItem} onRemove={removeItem} />
          ))}
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border/50">
          <span className="text-sm text-muted-foreground">{items.filter(i => i.name).length} item(s)</span>
          <span className="text-sm font-bold text-primary">Total: {formatCurrency(total)}</span>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Notes</Label>
        <Textarea data-testid="input-purchase-notes" value={notes}
          onChange={e => setNotes(e.target.value)} placeholder="e.g. Delivery in 3 days, partial shipment..." rows={2} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button data-testid="button-save-purchase" type="submit" disabled={isPending}>
          {isPending ? "Saving..." : purchase ? "Update Purchase" : "Record Purchase"}
        </Button>
      </div>
    </form>
  );
}

// ─── Vendor Card ───────────────────────────────────────────────────────────
interface VendorCardProps {
  vendor: Vendor; purchases: VendorPurchase[];
  onEdit: () => void; onDelete: () => void; onAddPurchase: () => void;
  listView?: boolean;
}

function VendorCard({ vendor, purchases, onEdit, onDelete, onAddPurchase, listView }: VendorCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<VendorPurchase | null>(null);
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
      <>
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
        {editingPurchase && (
          <Dialog open onOpenChange={() => setEditingPurchase(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Edit Purchase — {vendor.name}</DialogTitle></DialogHeader>
              <PurchaseForm vendorId={vendor.id!} vendorName={vendor.name}
                purchase={editingPurchase} onClose={() => setEditingPurchase(null)} />
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  return (
    <>
      <Card className="overflow-hidden border border-border/60">
        <CardHeader className="pb-3 pt-4 px-4">
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
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
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
              <button data-testid={`button-toggle-purchases-${vendor.id}`} onClick={() => setExpanded(e => !e)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">{formatDate(p.purchaseDate)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[p.status]}`}>
                        {STATUS_LABELS[p.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-primary">{formatCurrency(p.totalAmount)}</span>
                      <Button data-testid={`button-edit-purchase-${p.id}`} size="icon" variant="ghost" className="h-7 w-7"
                        onClick={() => setEditingPurchase(p)}><Edit2 className="h-3 w-3" /></Button>
                      <Button data-testid={`button-delete-purchase-${p.id}`} size="icon" variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deletePurchaseMutation.mutate(p.id!)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  {p.receivedDate && <p className="text-xs text-muted-foreground">Received: {formatDate(p.receivedDate)}</p>}
                  <div className="space-y-0.5">
                    {p.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {item.itemType && <span className="text-primary font-medium">[{item.itemType}]</span>}{" "}
                          {item.categoryName && item.categoryName !== "PPF" && <span className="text-muted-foreground">{item.categoryName} › </span>}
                          {item.name} × {item.quantity} {item.unit}
                        </span>
                        <span>{formatCurrency(item.quantity * item.unitPrice)}</span>
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

      {editingPurchase && (
        <Dialog open onOpenChange={() => setEditingPurchase(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Purchase — {vendor.name}</DialogTitle>
            </DialogHeader>
            <PurchaseForm vendorId={vendor.id!} vendorName={vendor.name}
              purchase={editingPurchase} onClose={() => setEditingPurchase(null)} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// ─── Purchase Card (for grid view in All Purchases) ─────────────────────────
function PurchaseGridCard({ p, onEdit, onDelete }: { p: VendorPurchase; onEdit: () => void; onDelete: () => void }) {
  return (
    <Card data-testid={`card-purchase-grid-${p.id}`} className="border border-border/60">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm text-foreground">{p.vendorName || "—"}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{formatDate(p.purchaseDate)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[p.status]}`}>
              {STATUS_LABELS[p.status]}
            </span>
            <Button data-testid={`button-edit-purchase-tab-${p.id}`} size="icon" variant="ghost" className="h-7 w-7" onClick={onEdit}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button data-testid={`button-delete-purchase-tab-${p.id}`} size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="space-y-1 border-t border-border/40 pt-2">
          {p.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                {item.itemType && (
                  <span className="text-primary font-medium text-[10px] bg-primary/10 px-1 rounded">{item.itemType}</span>
                )}
                {item.categoryName && item.categoryName !== "PPF" && <span>{item.categoryName} › </span>}
                <span>{item.name}</span>
                <span className="text-muted-foreground/70">×{item.quantity} {item.unit}</span>
              </span>
              <span className="font-medium">{formatCurrency(item.quantity * item.unitPrice)}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          <span className="text-xs text-muted-foreground">
            {p.receivedDate ? `Received: ${formatDate(p.receivedDate)}` : "—"}
          </span>
          <span className="text-sm font-bold text-primary">{formatCurrency(p.totalAmount)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Layout Toggle ──────────────────────────────────────────────────────────
function LayoutToggle({ value, onChange }: { value: "grid" | "list"; onChange: (v: "grid" | "list") => void }) {
  return (
    <div className="flex items-center border border-border/60 rounded-lg overflow-hidden">
      <button
        data-testid="button-layout-grid"
        onClick={() => onChange("grid")}
        className={`p-2 transition-colors ${value === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        data-testid="button-layout-list"
        onClick={() => onChange("list")}
        className={`p-2 transition-colors ${value === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function VendorManagementPage() {
  const { toast } = useToast();
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [addingPurchaseFor, setAddingPurchaseFor] = useState<Vendor | null>(null);

  // Vendor tab controls
  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorSort, setVendorSort] = useState("name-asc");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [vendorLayout, setVendorLayout] = useState<"grid" | "list">("grid");

  // Purchases tab controls
  const [purchaseSearch, setPurchaseSearch] = useState("");
  const [purchaseSort, setPurchaseSort] = useState("date-desc");
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState("all");
  const [purchaseVendorFilter, setPurchaseVendorFilter] = useState("all");
  const [purchaseLayout, setPurchaseLayout] = useState<"grid" | "list">("list");
  const [editingPurchaseInTab, setEditingPurchaseInTab] = useState<VendorPurchase | null>(null);

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

  const deletePurchaseInTabMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/vendor-purchases/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-purchases"] });
      toast({ title: "Purchase deleted" });
    },
  });

  const totalSpend = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const pendingCount = purchases.filter(p => p.status === "ordered" || p.status === "partial").length;

  // ── Vendor filtering / sorting ──────────────────────────────────────────
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

  // ── Purchase filtering / sorting ─────────────────────────────────────────
  const filteredPurchases = purchases
    .filter(p => {
      const matchesSearch =
        (p.vendorName || "").toLowerCase().includes(purchaseSearch.toLowerCase()) ||
        p.items.some(i => i.name.toLowerCase().includes(purchaseSearch.toLowerCase()));
      const matchesStatus = purchaseStatusFilter === "all" || p.status === purchaseStatusFilter;
      const matchesVendor = purchaseVendorFilter === "all" || p.vendorId === purchaseVendorFilter;
      return matchesSearch && matchesStatus && matchesVendor;
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

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Vendor Management</h1>
            <p className="text-muted-foreground mt-1">Track vendors, purchases, and delivery status</p>
          </div>
          <Button data-testid="button-add-vendor" onClick={() => setIsAddVendorOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Vendor
          </Button>
        </div>

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
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Deliveries</p>
                <p data-testid="stat-pending-deliveries" className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
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

            {vendorSearch || vendorFilter !== "all" ? (
              <p className="text-xs text-muted-foreground">{filteredVendors.length} of {vendors.length} vendor{vendors.length !== 1 ? "s" : ""}</p>
            ) : null}

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
                    onAddPurchase={() => setAddingPurchaseFor(vendor)} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border/60 overflow-hidden">
                <div className="hidden md:grid grid-cols-[2fr_1.5fr_1.5fr_1.5fr_auto] gap-4 px-4 py-2 bg-muted/50 border-b border-border/60 text-xs font-medium text-muted-foreground">
                  <span>Vendor</span>
                  <span>Contact</span>
                  <span>Phone</span>
                  <span className="hidden lg:block">Email</span>
                  <span className="text-right">Spend</span>
                </div>
                {filteredVendors.map(vendor => (
                  <VendorCard key={vendor.id} vendor={vendor} purchases={purchases}
                    onEdit={() => setEditingVendor(vendor)}
                    onDelete={() => deleteVendorMutation.mutate(vendor.id!)}
                    onAddPurchase={() => setAddingPurchaseFor(vendor)}
                    listView />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── All Purchases Tab ──────────────────────────────────────── */}
          <TabsContent value="purchases" className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input data-testid="input-search-purchase" className="pl-9" placeholder="Search purchases..."
                  value={purchaseSearch} onChange={e => setPurchaseSearch(e.target.value)} />
              </div>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <Select value={purchaseStatusFilter} onValueChange={setPurchaseStatusFilter}>
                <SelectTrigger data-testid="select-purchase-status-filter" className="h-9 w-36 text-sm">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>

              <Select value={purchaseVendorFilter} onValueChange={setPurchaseVendorFilter}>
                <SelectTrigger data-testid="select-purchase-vendor-filter" className="h-9 w-44 text-sm">
                  <SelectValue placeholder="Filter by vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {uniqueVendors.map(v => (
                    <SelectItem key={v.id} value={v.id!}>{v.name}</SelectItem>
                  ))}
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

            {(purchaseSearch || purchaseStatusFilter !== "all" || purchaseVendorFilter !== "all") ? (
              <p className="text-xs text-muted-foreground">{filteredPurchases.length} of {purchases.length} purchase{purchases.length !== 1 ? "s" : ""}</p>
            ) : null}

            {purchasesLoading ? (
              <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
            ) : filteredPurchases.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">{purchaseSearch || purchaseStatusFilter !== "all" || purchaseVendorFilter !== "all" ? "No purchases match your filters" : "No purchases recorded yet"}</p>
                {!purchaseSearch && purchaseStatusFilter === "all" && purchaseVendorFilter === "all" && (
                  <p className="text-sm mt-1">Add a vendor and record purchases from their card</p>
                )}
              </div>
            ) : purchaseLayout === "grid" ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredPurchases.map(p => (
                    <PurchaseGridCard key={p.id} p={p}
                      onEdit={() => setEditingPurchaseInTab(p)}
                      onDelete={() => deletePurchaseInTabMutation.mutate(p.id!)} />
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border/60">
                  <span className="text-sm text-muted-foreground">{filteredPurchases.length} purchase{filteredPurchases.length !== 1 ? "s" : ""}</span>
                  <span className="text-sm font-bold text-primary">Total: {formatCurrency(filteredTotal)}</span>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-border/60 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border/60">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vendor</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Items</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Received</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredPurchases.map(p => (
                      <tr data-testid={`row-purchase-${p.id}`} key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium">{p.vendorName || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(p.purchaseDate)}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <div className="space-y-0.5">
                            {p.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-1 text-xs">
                                {item.itemType && (
                                  <span className="text-primary font-medium text-[10px] bg-primary/10 px-1 rounded">
                                    {item.itemType}
                                  </span>
                                )}
                                {item.categoryName && item.categoryName !== "PPF" && <span className="text-muted-foreground">{item.categoryName} › </span>}
                                <span>{item.name}</span>
                                <span className="text-muted-foreground">×{item.quantity} {item.unit}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.receivedDate ? formatDate(p.receivedDate) : "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[p.status]}`}>
                            {STATUS_LABELS[p.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-primary">{formatCurrency(p.totalAmount)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button data-testid={`button-edit-purchase-row-${p.id}`} size="icon" variant="ghost" className="h-7 w-7"
                              onClick={() => setEditingPurchaseInTab(p)}>
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button data-testid={`button-delete-purchase-row-${p.id}`} size="icon" variant="ghost"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => deletePurchaseInTabMutation.mutate(p.id!)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/30 border-t border-border/60">
                    <tr>
                      <td colSpan={6} className="px-4 py-3 text-sm font-medium text-muted-foreground">
                        {filteredPurchases.length} purchase{filteredPurchases.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-primary">{formatCurrency(filteredTotal)}</td>
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

      {addingPurchaseFor && (
        <Dialog open onOpenChange={() => setAddingPurchaseFor(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Purchase — {addingPurchaseFor.name}</DialogTitle>
            </DialogHeader>
            <PurchaseForm vendorId={addingPurchaseFor.id!} vendorName={addingPurchaseFor.name}
              onClose={() => setAddingPurchaseFor(null)} />
          </DialogContent>
        </Dialog>
      )}

      {editingPurchaseInTab && (
        <Dialog open onOpenChange={() => setEditingPurchaseInTab(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Purchase — {editingPurchaseInTab.vendorName}</DialogTitle>
            </DialogHeader>
            <PurchaseForm
              vendorId={editingPurchaseInTab.vendorId}
              vendorName={editingPurchaseInTab.vendorName || ""}
              purchase={editingPurchaseInTab}
              onClose={() => setEditingPurchaseInTab(null)} />
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
}
