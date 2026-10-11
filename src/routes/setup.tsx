import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BRAND_IMG } from "@/components/app-ui";
import { cn } from "@/lib/utils";
import { DEFAULT_START, TOTAL_DAYS, inr, useBudget } from "@/lib/budget-store";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Set Your Starting Balance — Broke But Functional" },
      { name: "description", content: "Set your 30-day starting balance and choose savings goals." },
      { property: "og:title", content: "Get Started — Broke But Functional" },
      { property: "og:description", content: "Set your monthly ammo and lock away goals." },
    ],
  }),
  component: Setup,
});

const GOALS = [
  { id: "emergency", name: "Emergency Fund", emoji: "🛡️", target: 1500 },
  { id: "goa", name: "Goa Trip", emoji: "🌴", target: 2000 },
  { id: "phone", name: "New Phone", emoji: "📱", target: 1000 },
];

function Setup() {
  const [amount, setAmount] = useState(DEFAULT_START);
  const [picked, setPicked] = useState<string[]>(["emergency", "goa"]);
  const setup = useBudget((s) => s.setup);
  const navigate = useNavigate();
  const locked = GOALS.filter((g) => picked.includes(g.id)).reduce((a, g) => a + g.target, 0);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-4 bg-background px-4 py-6">
      <img src={BRAND_IMG} alt="Broke But Functional" className="h-10 w-auto self-start" />
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-outline">Getting Started</p>
        <h1 className="text-2xl font-extrabold">Set Your 30-Day Starting Balance</h1>
        <p className="text-sm text-muted-foreground">How much cash do you have to survive this month without an SOS UPI call to parents?</p>
      </div>
      <div className="rounded-2xl bg-surface p-5">
        <div className="flex items-center gap-1 text-4xl font-extrabold"><span className="text-outline">₹</span>
          <input type="number" value={amount || ""} onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))} className="w-full bg-transparent outline-none" />
        </div>
        <div className="mt-3 flex gap-2">
          {[8000, 10000, 15000].map((v) => (
            <button key={v} onClick={() => setAmount(v)} className={cn("flex-1 rounded-full py-2 text-sm font-bold", amount === v ? "bg-primary text-primary-foreground" : "bg-surface-high")}>{inr(v)}</button>
          ))}
        </div>
        <p className="mt-3 text-xs text-outline">Daily burn room: <b className="text-warning">{inr(amount / TOTAL_DAYS)}/day</b> before commitments.</p>
      </div>
      <p className="font-semibold">Choose your goals to lock away</p>
      {GOALS.map((g) => (
        <button key={g.id} onClick={() => setPicked((p) => (p.includes(g.id) ? p.filter((x) => x !== g.id) : [...p, g.id]))} className={cn("flex items-center gap-3 rounded-2xl border-2 p-3 text-left", picked.includes(g.id) ? "border-primary bg-primary/10" : "border-transparent bg-surface")}>
          <span className="text-2xl">{g.emoji}</span>
          <span className="flex-1 font-semibold">{g.name}</span>
          <span className="font-bold">{inr(g.target)}</span>
        </button>
      ))}
      <p className="text-xs text-outline">Goal targets: {inr(locked)} ({amount ? Math.round((locked / amount) * 100) : 0}% of balance). You fund them as you go.</p>
      <button disabled={amount <= 0} onClick={() => { setup(amount, GOALS.filter((g) => picked.includes(g.id)).map((g) => ({ ...g, saved: 0 }))); navigate({ to: "/" }); }} className="mt-auto rounded-full bg-gradient-cta py-4 font-bold text-primary-foreground shadow-glow disabled:opacity-40">Start Surviving</button>
    </div>
  );
}
