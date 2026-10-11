import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Badge, Card, HealthRing, ProgressBar, TrajectoryChart, riskTone, useSnapshot } from "@/components/app-ui";
import { TOTAL_DAYS, inr, signedInr, useBudget, useMetrics } from "@/lib/budget-store";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Spending Insights — Broke But Functional" },
      { name: "description", content: "Spending breakdown, needs vs wants and your 30-day balance forecast." },
      { property: "og:title", content: "Spending Insights — Broke But Functional" },
      { property: "og:description", content: "Where your ₹10k went, and where it's going." },
    ],
  }),
  component: Insights,
});

const LABELS: Record<string, string> = { food: "Food", travel: "Transport", fun: "Fun & Treats", shop: "Shopping", bills: "Bills", surprise: "Plot Twists", fixed: "Rent & Subs" };

function Insights() {
  const m = useMetrics();
  const snap = useSnapshot();
  const expenses = useBudget((s) => s.expenses);
  const byCat: Record<string, number> = { fixed: m.committed };
  expenses.forEach((e) => (byCat[e.category] = (byCat[e.category] ?? 0) + e.amount));
  const rows = Object.entries(byCat).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const total = rows.reduce((a, [, v]) => a + v, 0) || 1;
  const wantPct = Math.round(m.wantShare * 100);

  return (
    <AppShell title="Insights">
      <Card className="flex items-center gap-4">
        <HealthRing score={m.health} />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-outline">Day {snap.day} of {TOTAL_DAYS}</p>
          <p className="text-2xl font-extrabold">{inr(m.spent)} <span className="text-xs font-medium text-muted-foreground">spent of {inr(snap.startBalance)}</span></p>
          <Badge className={riskTone(m.risk)}>{m.vibe}</Badge>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <p className="font-semibold">Spending Breakdown</p>
        {rows.map(([k, v], i) => (
          <div key={k}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{LABELS[k]} ({Math.round((v / total) * 100)}%){i === 0 && <span className="ml-1 text-[11px] font-bold text-destructive">TOP DRAIN</span>}</span>
              <span className="font-bold">{inr(v)}</span>
            </div>
            <ProgressBar value={(v / total) * 100} />
          </div>
        ))}
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-semibold">Needs vs Wants</p>
          <Badge className={wantPct < 30 ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}>{wantPct < 30 ? "Disciplined 🎯" : "Treat Mode 🍩"}</Badge>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full bg-surface-highest">
          <div className="bg-success transition-all" style={{ width: `${100 - wantPct}%` }} />
          <div className="bg-warning transition-all" style={{ width: `${wantPct}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-surface-low p-3"><p className="text-xs text-outline">Needs</p><p className="font-bold">{100 - wantPct}% · {inr(m.needs)}</p></div>
          <div className="rounded-xl bg-surface-low p-3"><p className="text-xs text-outline">Wants (safe &lt;30%)</p><p className="font-bold">{wantPct}% · {inr(m.wants)}</p></div>
        </div>
      </Card>

      <Card>
        <p className="font-semibold">30-Day Balance Forecast</p>
        <p className="text-xs text-outline">Runway projection from current burn rate</p>
        <TrajectoryChart snap={snap} />
        <div className="flex justify-between text-sm">
          <span>Projected Day 30 finish:</span>
          <span className={m.projectedEnd >= 0 ? "font-bold text-success" : "font-bold text-destructive"}>{signedInr(m.projectedEnd)} {m.projectedEnd >= 0 ? "✅" : "⚠️"}</span>
        </div>
      </Card>
      <Link to="/month-end" className="text-center text-xs font-bold text-primary">Preview month-end report →</Link>
    </AppShell>
  );
}
