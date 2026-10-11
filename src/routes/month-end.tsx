import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, Card, HealthRing } from "@/components/app-ui";
import { TOTAL_DAYS, inr, useBudget, useMetrics } from "@/lib/budget-store";

export const Route = createFileRoute("/month-end")({
  head: () => ({
    meta: [
      { title: "Month-End Report — Broke But Functional" },
      { name: "description", content: "Your 30-day survival report: final balance, score and plot twists." },
      { property: "og:title", content: "Month-End Report — Broke But Functional" },
      { property: "og:description", content: "Did your ₹10k survive the month?" },
    ],
  }),
  component: MonthEnd,
});

function MonthEnd() {
  const m = useMetrics();
  const day = useBudget((s) => s.day);
  const start = useBudget((s) => s.startBalance);
  const log = useBudget((s) => s.log);
  const goals = useBudget((s) => s.goals);
  const reset = useBudget((s) => s.resetMonth);
  const navigate = useNavigate();
  const won = m.balance >= 0;
  const hit = goals.filter((g) => g.saved >= g.target).length;

  return (
    <AppShell title="Report">
      <Card className="text-center">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-top" />
        <p className="text-[11px] font-bold uppercase tracking-wider text-success">Day {day} of {TOTAL_DAYS} {day >= TOTAL_DAYS ? "• Survival Unlocked" : "• Preview"}</p>
        <h1 className="mt-2 text-2xl font-extrabold">{won ? "Broke But Functional Champion 🏆" : "Broke. Not Functional. 💀"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{won ? `Survived on ${inr(start)} without an emergency UPI bail-out.` : "Parents have been notified. (Not really.)"}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-surface-low p-3"><p className="text-xs text-outline">Final Balance</p><p className={won ? "text-2xl font-bold text-success" : "text-2xl font-bold text-destructive"}>{inr(m.balance)}</p></div>
          <div className="flex flex-col items-center rounded-xl bg-surface-low p-2"><HealthRing score={m.health} size={64} /><p className="text-xs text-outline">Survival Score</p></div>
        </div>
        <p className="mt-3 text-sm">{hit} of {goals.length} goals hit · {inr(m.saved)} saved</p>
      </Card>
      <Card>
        <p className="mb-2 font-semibold">Wins & Plot Twists</p>
        {log.length === 0 && <p className="text-sm text-outline">Nothing logged yet.</p>}
        <ul className="divide-y">
          {log.slice(0, 10).map((l) => (
            <li key={l.id} className="flex justify-between py-2 text-sm"><span>Day {l.day} · {l.text}</span><span className="font-bold text-destructive">{l.delta ? inr(l.delta) : "—"}</span></li>
          ))}
        </ul>
      </Card>
      <button onClick={() => { reset(); navigate({ to: "/" }); }} className="rounded-full bg-gradient-cta py-4 font-bold text-primary-foreground shadow-glow">Start Month 2 (New {inr(start)} Budget)</button>
      <button onClick={() => navigate({ to: "/setup" })} className="py-2 text-sm text-outline">Change starting balance</button>
    </AppShell>
  );
}
