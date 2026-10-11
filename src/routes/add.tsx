import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Icon } from "@/components/app-ui";
import { cn } from "@/lib/utils";
import { computeMetrics, inr, useBudget, useMetrics, type Category } from "@/lib/budget-store";

export const Route = createFileRoute("/add")({
  head: () => ({
    meta: [
      { title: "Add Expense — Broke But Functional" },
      { name: "description", content: "Log a spend and instantly see how your safe daily allowance changes." },
      { property: "og:title", content: "Add Expense — Broke But Functional" },
      { property: "og:description", content: "Log a spend and see your new daily allowance." },
    ],
  }),
  component: AddExpense,
});

const CATS: { id: Category; label: string; emoji: string }[] = [
  { id: "food", label: "Food", emoji: "🍔" },
  { id: "travel", label: "Travel", emoji: "🚇" },
  { id: "fun", label: "Fun", emoji: "🎉" },
  { id: "shop", label: "Shop", emoji: "🛍️" },
  { id: "bills", label: "Bills", emoji: "📄" },
];

function AddExpense() {
  const [amt, setAmt] = useState("");
  const [kind, setKind] = useState<"need" | "want">("need");
  const [cat, setCat] = useState<Category>("food");
  const [note, setNote] = useState("");
  const add = useBudget((s) => s.addExpense);
  const navigate = useNavigate();
  const n = Number(amt) || 0;
  const m = useMetrics();
  const after = useMetrics(n);

  const press = (k: string) => {
    if (k === "del") return setAmt((a) => a.slice(0, -1));
    if (k === "." && amt.includes(".")) return;
    if (amt.replace(".", "").length >= 6) return;
    setAmt((a) => (a === "0" && k !== "." ? k : a + k));
  };
  const save = () => {
    if (n <= 0) return;
    add({ amount: n, kind, category: cat, note: note.trim() || `${CATS.find((c) => c.id === cat)!.label} ${kind === "want" ? "treat" : "spend"}` });
    navigate({ to: "/" });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background px-4 pb-6 pt-4">
      <div className="flex items-center justify-between">
        <button aria-label="Back" onClick={() => navigate({ to: "/" })} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface-high"><Icon name="close" /></button>
        <p className="font-semibold">Add Expense</p>
        <span className="w-11" />
      </div>
      <p className="mt-4 text-center text-5xl font-extrabold tracking-tight">
        <span className="text-outline">₹</span>{amt || "0"}
      </p>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What was it? (e.g. Chai & Samosa)" className="mx-auto mt-3 w-full rounded-full bg-surface px-4 py-2.5 text-center text-sm outline-none placeholder:text-outline focus:ring-2 focus:ring-primary" />
      <div className="mt-4 grid grid-cols-2 gap-2">
        {(["need", "want"] as const).map((k) => (
          <button key={k} onClick={() => setKind(k)} className={cn("rounded-2xl border-2 py-2.5 transition", kind === k ? (k === "need" ? "border-success bg-success/10" : "border-warning bg-warning/10") : "border-transparent bg-surface")}>
            <p className="font-bold capitalize">{k}</p>
            <p className="text-[11px] font-bold text-outline">{k === "need" ? "SURVIVAL" : "TREAT"}</p>
          </button>
        ))}
      </div>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        {CATS.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition", cat === c.id ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground")}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>
      <div className={cn("mt-3 rounded-2xl p-3", after.balance < 0 ? "bg-destructive/15" : "bg-surface")}>
        <p className="text-xs text-outline">Daily allowance {n > 0 ? "drops" : ""}</p>
        <p className="font-bold">
          {inr(m.safeDaily)} → <span className={after.safeDaily < m.safeDaily * 0.8 ? "text-destructive" : "text-warning"}>{inr(after.safeDaily)}/day</span>
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {m.daysLeft} days left. Risk after this: <b>{computeMetrics.length ? after.risk : ""}</b> · Health {after.health}
        </p>
      </div>
      <div className="mt-auto grid grid-cols-3 gap-2 pt-4">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"].map((k) => (
          <button key={k} onClick={() => press(k)} className="flex h-14 items-center justify-center rounded-2xl bg-surface text-[26px] font-semibold active:bg-surface-highest">
            {k === "del" ? <Icon name="backspace" /> : k}
          </button>
        ))}
      </div>
      <button disabled={n <= 0} onClick={save} className="mt-3 rounded-full bg-gradient-cta py-4 font-bold text-primary-foreground shadow-glow disabled:opacity-40">
        Save Expense ({inr(n)})
      </button>
    </div>
  );
}
