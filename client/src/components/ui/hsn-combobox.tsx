import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

export const HSN_CODES = [
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
  { code: "33030090", description: "Perfumes / Fragrance / Car Perfume" },
];

export function HsnCombobox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
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
    !search || h.code.includes(search) || h.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={wrapRef} className="relative">
      <Input
        className="h-11 text-sm"
        placeholder={placeholder || "HSN code (search or type)..."}
        value={search}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onChange={e => { setSearch(e.target.value); onChange(e.target.value); setOpen(true); }}
      />
      {open && filtered.length > 0 && (
        <div className="absolute left-0 top-full mt-1 z-[9999] bg-white border border-border rounded-lg shadow-2xl max-h-52 overflow-y-auto min-w-[320px] w-full">
          {filtered.map(h => (
            <button
              key={h.code}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-muted/60 transition-colors border-b border-border/30 last:border-0"
              onMouseDown={e => { e.preventDefault(); onChange(h.code); setSearch(h.code); setOpen(false); }}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono font-bold text-xs text-red-600">{h.code}</span>
                <span className="text-xs text-muted-foreground line-clamp-1">{h.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
