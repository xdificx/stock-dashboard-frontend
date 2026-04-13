import { useState } from "react";
import { Calendar } from "lucide-react";

interface Props {
  onApply: (start: string, end: string) => void;
  onReset: () => void;
  isCustom: boolean;
}

export default function PeriodSelector({ onApply, onReset, isCustom }: Props) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState(new Date().toISOString().split("T")[0]);
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    if (!start || !end) return;
    onApply(start, end);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border transition-colors ${
          isCustom
            ? "border-primary text-primary bg-primary/10"
            : "border-border text-muted-foreground hover:text-foreground"
        }`}
      >
        <Calendar size={12} />
        Period
        {isCustom && (
          <span
            onClick={(e) => { e.stopPropagation(); onReset(); }}
            className="ml-1 hover:text-up"
          >
            x
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg p-4 shadow-xl w-64 space-y-3">
          <p className="text-sm font-medium">Custom Period</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Start</label>
              <input
                type="date" value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">End</label>
              <input
                type="date" value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApply}
              disabled={!start || !end}
              className="flex-1 py-1.5 rounded bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50"
            >
              Apply
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
