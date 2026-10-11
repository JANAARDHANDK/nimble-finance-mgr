import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Badge, Card, HealthRing, Icon, TrajectoryChart, riskTone, useSnapshot } from "@/components/app-ui";
import { TOTAL_DAYS, inr, signedInr, useBudget, useMetrics } from "@/lib/budget-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Broke But Functional — Survive the month on ₹10k" },
      { name: "description", content: "Track your ₹10,000 monthly allowance, safe daily spend, risk level and health score." },
      { property: "og:title", content: "Broke But Functional — Survive the month on ₹10k" },
      { property: "og:description", content: "Your budget survival dashboard: balance, safe daily allowance and forecast." },
    ],
  }),
  component: Home,
});

const CAT_EMOJI: Record<string, string> = { food: "🍔", travel: "🚇", fun: "🎉", shop: "🛍️", bills: "📄", surprise: "⚡" };

function Home() {
  const m = useMetrics();
  const snap = useSnapshot();
  const expenses = useBudget((s) => s.expenses);
  const roll = useBudget((s) => s.rollPlotTwist);
  const removeExpense = useBudget((s) => s.removeExpense);
  const ahead = Math.round(m.balance - (snap.startBalance - m.committed) * m.timePct);
  const status = m.risk === "Low" ? "SURVIVING" : m.risk === "Medium" ? "HANGING ON" : "SOS";

  return (
    <AppShell title="Home">
      <div className="flex items-center justify-between rounded-2xl bg-surface-high px-3 py-2.5">
        <p className="truncate text-xs text-muted-foreground">
          <span className="font-bold text-foreground">Day {snap.day}:</span>{" "}
          {m.risk === "Low" ? "Your wallet is tired, but you're still in the game." : m.risk === "Medium" ? "Careful. Maggi season is approaching." : "Wallet on life support. Slow down."}
        </p>
        <Badge className={riskTone(m.risk)}>{status}</Badge>
      </div>

      <Card className="flex flex-col gap-4 shadow-xl">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-top" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-outline">Remaining Allowance</p>
            <p className="mt-0.5 text-[32px] font-extrabold leading-tight tracking-tight">
              {inr(m.balance)} <span className="text-xs font-medium text-muted-foreground">/ {inr(snap.startBalance)}</span>
            </p>
          </div>
          <div className="flex flex-col items-end">
            <Badge className={ahead >= 0 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}>
              <Icon name={ahead >= 0 ? "trending_up" : "trending_down"} className="text-[13px]" />
              {signedInr(ahead)} {ahead >= 0 ? "AHEAD" : "BEHIND"}
            </Badge>
            <span className="mt-1 text-xs text-outline">{m.daysLeft} days left</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 rounded-xl bg-surface-low/70 p-3">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Survival Pace</span>
            <span className="font-bold text-success">{Math.round(((snap.day - 1) / TOTAL_DAYS) * 100)}% Days Passed • {(m.cashPct * 100).toFixed(1)}% Cash Left</span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-surface-highest">
            <div className="absolute inset-y-0 z-10 w-0.5 bg-outline" style={{ left: `${((snap.day - 1) / TOTAL_DAYS) * 100}%` }} />
            <div className="h-full rounded-full bg-gradient-pace transition-all duration-500" style={{ width: `${m.cashPct * 100}%` }} />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[36px] font-bold leading-none text-warning">{inr(m.safeDaily)}<span className="text-sm font-medium text-muted-foreground"> / day safe</span></p>
            <p className="mt-2 max-w-[240px] text-xs text-muted-foreground">Spend under this and survive till Day 30 without eating plain Maggi or begging for UPI loans.</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-outline">Spent today</p>
            <p className={m.spentToday > m.safeDaily ? "font-bold text-destructive" : "font-bold"}>{inr(m.spentToday)}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <Link to="/add" className="flex flex-col items-center gap-1 rounded-2xl bg-gradient-cta py-4 font-bold text-primary-foreground shadow-glow">
          <Icon name="add_circle" fill className="text-[26px]" /><span className="text-xs">Log Spend</span>
        </Link>
        <Link to="/simulate" className="flex flex-col items-center gap-1 rounded-2xl bg-surface-high py-4 font-bold text-primary">
          <Icon name="science" className="text-[26px]" /><span className="text-xs">Simulate</span>
        </Link>
        <button onClick={roll} className="flex flex-col items-center gap-1 rounded-2xl bg-destructive/15 py-4 font-bold text-destructive">
          <Icon name="bolt" fill className="text-[26px]" /><span className="text-xs">Plot Twist</span>
        </button>
      </div>

      <Card className="flex items-center gap-4">
        <HealthRing score={m.health} />
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-outline">Financial Health</p>
          <p className="text-lg font-semibold">{m.vibe}</p>
          <Badge className={`mt-1 ${riskTone(m.risk)}`}>{m.risk} Risk</Badge>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <p className="font-semibold">Day 30 Forecast</p>
          <Badge className={m.projectedEnd >= 0 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}>
            {m.projectedEnd >= 0 ? `Est. Surplus ${signedInr(m.projectedEnd)}` : m.bustDay ? `Broke on Day ${m.bustDay}` : `Deficit ${inr(m.projectedEnd)}`}
          </Badge>
        </div>
        <TrajectoryChart snap={snap} />
        <p className="text-xs italic text-muted-foreground">
          {m.projectedEnd >= 0
            ? `"At this burn rate, you land on Day 30 with ${inr(m.projectedEnd)} to spare. Don't blow it on shots."`
            : `"At this burn rate you run dry before payday. Time for dal-chawal week."`}
        </p>
      </Card>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <p className="font-semibold">Recent Spending</p>
          <Link to="/insights" className="text-xs font-bold text-primary">See insights</Link>
        </div>
        {expenses.length === 0 && <p className="py-4 text-center text-sm text-outline">No spends yet. Suspiciously disciplined. 👀</p>}
        <ul className="flex flex-col divide-y">
          {expenses.slice(0, 6).map((e) => (
            <li key={e.id} className="group flex items-center gap-3 py-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-high text-lg">{CAT_EMOJI[e.category]}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{e.note}</p>
                <p className="text-xs text-outline">{e.kind === "need" ? "Need" : "Want"} · Day {e.day}</p>
              </div>
              <span className="font-bold text-destructive">-{inr(e.amount)}</span>
              <button aria-label="Delete" onClick={() => removeExpense(e.id)} className="text-outline hover:text-destructive"><Icon name="close" className="text-[18px]" /></button>
            </li>
          ))}
        </ul>
      </Card>
    </AppShell>
  );
}
