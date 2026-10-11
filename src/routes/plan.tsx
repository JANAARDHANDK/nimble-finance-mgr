import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, Badge, Card, ProgressBar } from "@/components/app-ui";
import { cn } from "@/lib/utils";
import { TOTAL_DAYS, inr, useBudget, useMetrics } from "@/lib/budget-store";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Bills, Subscriptions & Goals — Broke But Functional" },
      { name: "description", content: "Pause subscriptions, track bills and grow savings goals for the month." },
      { property: "og:title", content: "Monthly Commitments — Broke But Functional" },
      { property: "og:description", content: "Pause subscriptions and fund your savings goals." },
    ],
  }),
  component: Plan,
});

function Plan() {
  const [tab, setTab] = useState<"bill" | "sub" | "goals">("sub");
  const m = useMetrics();
  const start = useBudget((s) => s.startBalance);
  const commitments = useBudget((s) => s.commitments);
  const goals = useBudget((s) => s.goals);
  const toggle = useBudget((s) => s.toggleCommitment);
  const contribute = useBudget((s) => s.contributeGoal);
  const frozenFun = useBudget((s) => s.frozenFun);

  return (
    <AppShell title="Plan">
      <Card>
        <p className="text-[11px] font-bold uppercase tracking-wider text-outline">Flexible Cash Left</p>
        <p className="text-[32px] font-extrabold">{inr(m.balance)} <span className="text-xs font-medium text-muted-foreground">/ {inr(start)}</span></p>
        <ProgressBar value={m.cashPct * 100} className="my-2" />
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{inr(m.committed)} committed · {inr(m.saved)} saved</span>
          <span className="font-bold text-warning">{inr(m.safeDaily)}/day safe</span>
        </div>
        {frozenFun && <Badge className="mt-2 bg-warning/15 text-warning">❄️ Fun frozen after plot twist</Badge>}
      </Card>

      <div className="grid grid-cols-3 gap-1 rounded-full bg-surface p-1">
        {([["bill", "Bills"], ["sub", "Subscriptions"], ["goals", "Goals"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={cn("rounded-full py-2 text-xs font-bold transition", tab === id ? "bg-primary text-primary-foreground" : "text-outline")}>{label}</button>
        ))}
      </div>

      {tab !== "goals" &&
        commitments.filter((c) => c.type === tab).map((c) => (
          <Card key={c.id} className={cn("flex items-center gap-3 p-4", c.paused && "opacity-60")}>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs text-outline">{inr(c.amount / TOTAL_DAYS)}/day · {c.note}</p>
            </div>
            <div className="text-right">
              <p className={cn("font-bold", c.paused && "line-through")}>{inr(c.amount)}</p>
              {c.type === "sub" ? (
                <button onClick={() => { toggle(c.id); toast(c.paused ? `${c.name} resumed` : `${c.name} paused · +${inr(c.amount)} back`); }} className={cn("mt-1 rounded-full px-3 py-1 text-[11px] font-bold", c.paused ? "bg-success/15 text-success" : "bg-warning/15 text-warning")}>
                  {c.paused ? "Resume" : "Pause"}
                </button>
              ) : (
                <span className="text-[11px] text-outline">Fixed</span>
              )}
            </div>
          </Card>
        ))}
      {tab === "sub" && (
        <p className="text-center text-xs text-outline">
          Draining {inr(commitments.filter((c) => c.type === "sub" && !c.paused).reduce((a, c) => a + c.amount, 0))}/mo. Pausing returns the money to your balance instantly.
        </p>
      )}

      {tab === "goals" &&
        goals.map((g) => {
          const pct = (g.saved / g.target) * 100;
          return (
            <Card key={g.id} className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{g.emoji} {g.name}</p>
                <p className="text-sm font-bold">{inr(g.target - g.saved)} <span className="text-xs font-normal text-outline">to go</span></p>
              </div>
              <p className="mb-2 text-xs text-outline">{inr(g.saved)} of {inr(g.target)} saved ({Math.round(pct)}%)</p>
              <ProgressBar value={pct} />
              <div className="mt-3 flex gap-2">
                {[100, 200].map((a) => (
                  <button key={a} disabled={g.saved >= g.target || m.balance < a} onClick={() => contribute(g.id, a)} className="rounded-full bg-primary/15 px-3 py-1.5 text-xs font-bold text-primary disabled:opacity-40">+ Add {inr(a)}</button>
                ))}
              </div>
            </Card>
          );
        })}
    </AppShell>
  );
}
