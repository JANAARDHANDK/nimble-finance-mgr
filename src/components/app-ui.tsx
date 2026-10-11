import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TOTAL_DAYS, inr, trajectory, useBudget, useMetrics, computeMetrics, type Snapshot } from "@/lib/budget-store";

export const BRAND_IMG =
  "https://lh3.googleusercontent.com/aida/AEtjO1W0nhllHW7GPDiIYzj3csNkOKP4GiZfWiZiCldpbs0z6WU9HDr_D6qqkDbFy33GKeWK3tjiAuDWBPhaoRav-Bc-cO3mFYgku_XK8w7ZGQ9JWyCsqNE4w0Lso2J5NNCgmN1wEcxuIg3WWTk2AcQYTPK3JLjdqPrE-TsSQeehgqDriFi47NhyjHkm_Aik3oCAIjplFE0MYrjOEKUa-vnhYWS-k4onmUdB11CAhUW2fu2WrlVgqoxPKqzJcamG";
export const PROFILE_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBvmRixnB7eIyh2D5WSiaFp-EuZl5QCqif3TKRQw4KLNhBS-VXByZPTnEQXNphNIdhMzta0fiO96K9A8fRsgi_EuChn9wpe5reYIXoZAk3RohscW6JjcrNTJppverfelL78G9PuIt3orNPJNeVxOrnjnxrkSsjA9JY_QfY_mUlh1nZnEbwDgZ5x4PvdXHkSYli7CakI4E9eXutBe6b577jmcl-oTmTL4raRy4fCeF_PBpSog3BThT41eg";

export function Icon({ name, className, fill }: { name: string; className?: string; fill?: boolean }) {
  return <span className={cn("material-symbols-outlined", fill && "icon-fill", className)}>{name}</span>;
}

export const riskTone = (r: string) =>
  r === "Low" ? "text-success bg-success/15" : r === "Medium" ? "text-warning bg-warning/15" : "text-destructive bg-destructive/15";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("relative overflow-hidden rounded-2xl bg-surface p-5", className)}>{children}</div>;
}

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider", className)}>{children}</span>;
}

function Header({ title }: { title: string }) {
  const day = useBudget((s) => s.day);
  const nextDay = useBudget((s) => s.nextDay);
  const m = useMetrics();
  const navigate = useNavigate();
  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-md items-center justify-between gap-2 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={BRAND_IMG} alt="Broke But Functional" className="h-8 w-auto" />
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-semibold tracking-tight">Broke But Functional</span>
            <span className="text-[11px] font-bold text-outline">{title}</span>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => (day >= TOTAL_DAYS ? navigate({ to: "/month-end" }) : nextDay())}
            className="flex items-center gap-1 rounded-full bg-surface-high px-3 py-1.5 text-[11px] font-bold text-primary transition hover:bg-surface-highest"
          >
            {day >= TOTAL_DAYS ? "Finish" : "Next Day"} <Icon name="arrow_forward" className="text-[14px]" />
          </button>
          <img src={PROFILE_IMG} alt="Profile" className="ml-1 h-8 w-8 rounded-full object-cover ring-1 ring-primary/30" />
        </div>
      </div>
      <div className="flex justify-center pb-2">
        <div className="flex items-center gap-1.5 rounded-full bg-surface-high/80 px-3 py-1 text-[11px] font-bold">
          <span className="text-success">Day {day} of {TOTAL_DAYS}</span>
          <span className="text-outline">•</span>
          <span className="text-warning">⚡ {inr(m.safeDaily)}/day</span>
        </div>
      </div>
    </header>
  );
}

const NAV = [
  { to: "/", label: "Home", icon: "home" },
  { to: "/simulate", label: "Simulate", icon: "science" },
  { to: "/plan", label: "Plan", icon: "account_balance_wallet" },
  { to: "/insights", label: "Insights", icon: "insights" },
] as const;

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-md items-center justify-around px-2 pb-2">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeOptions={{ exact: true }}
            className="flex flex-col items-center gap-0.5 rounded-2xl px-4 py-1.5 text-outline transition data-[status=active]:bg-primary/15 data-[status=active]:text-primary"
          >
            <Icon name={n.icon} className="text-[24px]" />
            <span className="text-[11px] font-bold">{n.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header title={title} />
      <main className="mx-auto flex max-w-md flex-col gap-3 px-4 pb-28 pt-28">{children}</main>
      <BottomNav />
      <PlotTwistSheet />
    </div>
  );
}

export function ProgressBar({ value, className, barClass }: { value: number; className?: string; barClass?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-highest", className)}>
      <div className={cn("h-full rounded-full bg-gradient-pace transition-all duration-500", barClass)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function HealthRing({ score, size = 84 }: { score: number; size?: number }) {
  const r = size / 2 - 7;
  const c = 2 * Math.PI * r;
  const tone = score >= 70 ? "stroke-success" : score >= 45 ? "stroke-warning" : "stroke-destructive";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={7} className="fill-none stroke-surface-highest" />
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={7} strokeLinecap="round" className={cn("fill-none transition-all duration-700", tone)} strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold">{score}</span>
    </div>
  );
}

export function TrajectoryChart({ snap, extraSpend = 0, compare = false }: { snap: Snapshot; extraSpend?: number; compare?: boolean }) {
  const W = 320, H = 130, P = 6;
  const base = trajectory(snap);
  const sim = compare ? trajectory(snap, extraSpend) : null;
  const all = [...base.actual, ...base.projected, ...(sim?.projected ?? [])].map((p) => p.v);
  const max = Math.max(snap.startBalance, ...all);
  const min = Math.min(0, ...all);
  const x = (d: number) => P + ((d - 1) / (TOTAL_DAYS - 1)) * (W - 2 * P);
  const y = (v: number) => P + (1 - (v - min) / (max - min || 1)) * (H - 2 * P);
  const path = (pts: { day: number; v: number }[]) => pts.map((p, i) => `${i ? "L" : "M"}${x(p.day).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-36 w-full">
      <line x1={P} x2={W - P} y1={y(0)} y2={y(0)} className="stroke-destructive/60" strokeDasharray="4 4" />
      <line x1={x(snap.day)} x2={x(snap.day)} y1={P} y2={H - P} className="stroke-outline/40" />
      <path d={path(base.actual)} className="fill-none stroke-success" strokeWidth={2.5} strokeLinecap="round" />
      <path d={path(base.projected)} className="fill-none stroke-primary" strokeWidth={2} strokeDasharray="5 4" />
      {sim && <path d={path(sim.projected)} className="fill-none stroke-destructive" strokeWidth={2} strokeDasharray="5 4" />}
      <circle cx={x(snap.day)} cy={y(computeMetrics(snap, compare ? extraSpend : 0).balance)} r={4} className="fill-warning" />
    </svg>
  );
}

export function useSnapshot(): Snapshot {
  const startBalance = useBudget((s) => s.startBalance);
  const day = useBudget((s) => s.day);
  const expenses = useBudget((s) => s.expenses);
  const commitments = useBudget((s) => s.commitments);
  const goals = useBudget((s) => s.goals);
  return { startBalance, day, expenses, commitments, goals };
}

export function PlotTwistSheet() {
  const twist = useBudget((s) => s.pendingTwist);
  const resolve = useBudget((s) => s.resolveTwist);
  const dismiss = useBudget((s) => s.dismissTwist);
  const snap = useSnapshot();
  const [mode, setMode] = useState<"balance" | "savings" | "cut">("balance");
  if (!twist) return null;
  const m = computeMetrics(snap);
  const after = computeMetrics(snap, twist.amount);
  const subs = snap.commitments.filter((c) => c.type === "sub" && !c.paused).reduce((a, c) => a + c.amount, 0);
  const cutDaily = Math.max(0, Math.floor((m.balance - twist.amount + subs) / m.daysLeft));
  const options = [
    { id: "balance" as const, title: "Pay from balance", desc: `⚠️ Daily allowance drops from ${inr(m.safeDaily)} to ${inr(after.safeDaily)} for the next ${m.daysLeft} days.` },
    { id: "savings" as const, title: "Dip into savings", desc: m.saved > 0 ? `📉 Takes up to ${inr(Math.min(m.saved, twist.amount))} from your goals (${inr(m.saved)} saved).` : "📉 No savings yet — rest comes from balance." },
    { id: "cut" as const, title: "Cut other spending", desc: `✂️ Pauses all subscriptions this month. Daily becomes ${inr(cutDaily)}.` },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-t-3xl bg-surface p-5 pb-8 animate-in slide-in-from-bottom">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-surface-highest" />
        <Badge className="bg-destructive/15 text-destructive">⚡ Plot Twist</Badge>
        <h2 className="mt-2 text-2xl font-extrabold">{twist.emoji} {twist.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Day {snap.day} of {TOTAL_DAYS} • Life happened. Pick how your wallet absorbs the hit.</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-surface-low p-3"><p className="text-[11px] text-outline">Surprise Hit</p><p className="text-lg font-bold text-destructive">{inr(twist.amount)}</p></div>
          <div className="rounded-xl bg-surface-low p-3"><p className="text-[11px] text-outline">Wallet Left</p><p className="text-lg font-bold">{inr(m.balance)}</p></div>
          <div className="rounded-xl bg-surface-low p-3"><p className="text-[11px] text-outline">Safe Daily</p><p className="text-lg font-bold text-warning">{inr(m.safeDaily)}</p></div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {options.map((o) => (
            <button key={o.id} onClick={() => setMode(o.id)} className={cn("rounded-2xl border-2 p-3 text-left transition", mode === o.id ? "border-primary bg-primary/10" : "border-transparent bg-surface-low")}>
              <p className="font-semibold">{o.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{o.desc}</p>
            </button>
          ))}
        </div>
        <button onClick={() => resolve(mode)} className="mt-4 w-full rounded-full bg-gradient-danger py-3.5 font-bold text-foreground">Absorb This Hit</button>
        <button onClick={dismiss} className="mt-2 w-full py-2 text-sm text-outline">Need 10 mins to think</button>
      </div>
    </div>
  );
}
