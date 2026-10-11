import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, Badge, Card, TrajectoryChart, riskTone, useSnapshot } from "@/components/app-ui";
import { cn } from "@/lib/utils";
import { inr, signedInr, useBudget, useMetrics, type Category } from "@/lib/budget-store";

export const Route = createFileRoute("/simulate")({
  head: () => ({
    meta: [
      { title: "Simulate a Purchase — Broke But Functional" },
      { name: "description", content: "Test a purchase before you make it and see its consequences on your month." },
      { property: "og:title", content: "Simulate a Purchase — Broke But Functional" },
      { property: "og:description", content: "The Consequence Engine: test bad financial ideas safely." },
    ],
  }),
  component: Simulate,
});

const PRESETS: { emoji: string; name: string; price: number; cat: Category }[] = [
  { emoji: "🎧", name: "ANC Headphones", price: 1500, cat: "shop" },
  { emoji: "🚗", name: "Weekend Trip", price: 2000, cat: "fun" },
  { emoji: "👟", name: "New Shoes", price: 1200, cat: "shop" },
  { emoji: "🍕", name: "Pizza Night", price: 450, cat: "food" },
];

function Simulate() {
  const [name, setName] = useState("ANC Headphones");
  const [price, setPrice] = useState(1500);
  const snap = useSnapshot();
  const before = useMetrics();
  const after = useMetrics(price);
  const add = useBudget((s) => s.addExpense);
  const skip = useBudget((s) => s.skipPurchase);
  const streak = useBudget((s) => s.streak);
  const navigate = useNavigate();

  const Row = ({ label, b, a, bad }: { label: string; b: string; a: string; bad?: boolean }) => (
    <div className="flex items-center justify-between rounded-xl bg-surface-low p-3">
      <span className="text-xs text-outline">{label}</span>
      <span className="text-sm font-bold">
        <span className="text-muted-foreground">{b}</span> ➔ <span className={bad ? "text-destructive" : "text-success"}>{a}</span>
      </span>
    </div>
  );

  return (
    <AppShell title="Simulate">
      <div>
        <h1 className="text-2xl font-bold">The Consequence Engine 🔮</h1>
        <p className="text-sm text-muted-foreground">Test your bad financial ideas before they hit your UPI.</p>
      </div>
      <Card className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <button key={p.name} onClick={() => { setName(p.name); setPrice(p.price); }} className={cn("rounded-2xl border-2 p-3 text-left transition", name === p.name ? "border-primary bg-primary/10" : "border-transparent bg-surface-low")}>
              <span className="text-xl">{p.emoji}</span>
              <p className="text-sm font-semibold">{p.name}</p>
              <p className="text-xs text-outline">{inr(p.price)}</p>
            </button>
          ))}
        </div>
        <label className="text-xs text-outline">What do you want to buy?</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl bg-surface-low px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary" />
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-outline">₹</span>
          <input type="number" min={0} value={price || ""} onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))} className="w-full rounded-xl bg-surface-low px-3 py-2.5 text-2xl font-bold outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <input type="range" min={0} max={Math.max(5000, before.balance)} step={50} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="accent-primary" />
      </Card>

      <Card className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Before ➔ After</p>
          <Badge className={riskTone(after.risk)}>{after.risk} Risk</Badge>
        </div>
        <Row label="Remaining wallet" b={inr(before.balance)} a={inr(after.balance)} bad={price > 0} />
        <Row label="Safe daily burn" b={inr(before.safeDaily)} a={inr(after.safeDaily)} bad={after.safeDaily < before.safeDaily} />
        <Row label="Month-end" b={signedInr(before.projectedEnd)} a={after.projectedEnd >= 0 ? signedInr(after.projectedEnd) : after.bustDay ? `Bust Day ${after.bustDay} 💥` : inr(after.projectedEnd)} bad={after.projectedEnd < 0} />
        <Row label="Health score" b={String(before.health)} a={String(after.health)} bad={after.health < before.health} />
        <TrajectoryChart snap={snap} extraSpend={price} compare />
        <p className="text-xs text-muted-foreground">
          {after.balance < 0 ? "You literally can't afford this. Wallet goes negative." : `Your daily budget becomes ${inr(after.safeDaily)} for ${before.daysLeft} days.`}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => { skip(); toast.success(`Skipped! Streak now ${streak + 5} 🔥`); navigate({ to: "/" }); }} className="rounded-full bg-success py-3.5 font-bold text-background">Skip it (+5 streak)</button>
        <button disabled={price <= 0} onClick={() => { add({ amount: price, kind: "want", category: PRESETS.find((p) => p.name === name)?.cat ?? "shop", note: name || "Impulse buy" }); toast(`Bought ${name}. Wallet felt that.`); navigate({ to: "/" }); }} className="rounded-full bg-surface-high py-3.5 font-bold text-destructive disabled:opacity-40">Do it anyway</button>
      </div>
    </AppShell>
  );
}
