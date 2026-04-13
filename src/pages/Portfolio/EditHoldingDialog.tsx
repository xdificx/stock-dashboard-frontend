import { useState } from "react";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import type { Holding } from "@/lib/types";

interface Props {
  holding: Holding;
  onClose: () => void;
}

export default function EditHoldingDialog({ holding, onClose }: Props) {
  const { updateHoldingQty, updateHoldingAvg, deleteHolding } = usePortfolioStore();
  const [tab, setTab] = useState<"qty" | "avg">("qty");
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!value) return;
    setSubmitting(true);
    try {
      if (tab === "qty") await updateHoldingQty(holding.ticker, parseFloat(value));
      else await updateHoldingAvg(holding.ticker, parseFloat(value));
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete all records for ${holding.name}?`)) return;
    await deleteHolding(holding.ticker);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card border border-border rounded-lg w-80 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Edit: {holding.name}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">x</button>
        </div>
        <div className="flex gap-2 border-b border-border pb-2">
          {(["qty", "avg"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setValue(""); }}
              className={`text-sm px-2 py-1 rounded transition-colors ${
                tab === t ? "text-primary bg-primary/10" : "text-muted-foreground"
              }`}
            >
              {t === "qty" ? "Quantity" : "Avg Price"}
            </button>
          ))}
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Current {tab === "qty" ? `qty: ${holding.qty}` : `avg: ${holding.avg_price.toLocaleString()}`}
          </p>
          <input
            type="number" min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`New ${tab === "qty" ? "quantity" : "avg price"}`}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!value || submitting}
            className="flex-1 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-md bg-up/20 text-up text-sm hover:bg-up/30 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
