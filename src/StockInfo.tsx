import { useState } from "react";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import { formatPrice, formatDate } from "@/lib/utils";
import type { CashFlowCreate } from "@/lib/types";

export default function CashFlowTab() {
  const { cashFlows, addCashFlow, deleteCashFlow } = usePortfolioStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CashFlowCreate>({
    type: "deposit",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    source: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const totalDeposit = cashFlows.filter((c) => c.type === "deposit").reduce((s, c) => s + c.amount, 0);
  const totalWithdraw = cashFlows.filter((c) => c.type === "withdrawal").reduce((s, c) => s + c.amount, 0);

  const handleSubmit = async () => {
    if (!form.amount) return;
    setSubmitting(true);
    try {
      await addCashFlow(form);
      setShowForm(false);
      setForm({ type: "deposit", amount: 0, date: new Date().toISOString().split("T")[0], source: "", note: "" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 요약 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "총 입금", value: totalDeposit, cls: "" },
          { label: "총 출금", value: totalWithdraw, cls: "text-down" },
          { label: "순 투자금", value: totalDeposit - totalWithdraw, cls: totalDeposit - totalWithdraw >= 0 ? "" : "text-down" },
        ].map((item) => (
          <div key={item.label} className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
            <p className={`text-base font-semibold tabular-nums ${item.cls}`}>{formatPrice(item.value)}</p>
          </div>
        ))}
      </div>

      {/* 추가 버튼 */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-md bg-primary/20 text-primary text-sm hover:bg-primary/30 transition-colors"
        >
          + 입출금 추가
        </button>
      )}

      {/* 입력 폼 */}
      {showForm && (
        <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
          <div className="flex gap-2">
            {(["deposit", "withdrawal"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  form.type === t ? "bg-primary/20 text-primary" : "text-muted-foreground"
                }`}
              >
                {t === "deposit" ? "입금" : "출금"}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">금액</label>
              <input
                type="number" min="0"
                value={form.amount || ""}
                onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">날짜</label>
              <input
                type="date" value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">출처</label>
              <input
                value={form.source}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                placeholder="예: 급여, 보너스"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">메모</label>
              <input
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="선택 입력"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!form.amount || submitting}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
            >
              {submitting ? "저장 중..." : "저장"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 목록 */}
      {cashFlows.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground text-sm">입출금 내역 없음</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-4">날짜</th>
                <th className="pb-2 pr-4">구분</th>
                <th className="pb-2 pr-4 text-right">금액</th>
                <th className="pb-2 pr-4">출처</th>
                <th className="pb-2">메모</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {cashFlows.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-accent/30">
                  <td className="py-3 pr-4 text-muted-foreground">{formatDate(c.date)}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      c.type === "deposit" ? "bg-primary/15 text-primary" : "bg-down/15 text-down"
                    }`}>
                      {c.type === "deposit" ? "입금" : "출금"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">{formatPrice(c.amount)}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{c.source || "-"}</td>
                  <td className="py-3 text-muted-foreground">{c.note || "-"}</td>
                  <td className="py-3 pl-3">
                    <button
                      onClick={() => { if (confirm("삭제하시겠습니까?")) deleteCashFlow(c.id); }}
                      className="text-xs text-muted-foreground hover:text-up transition-colors"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
