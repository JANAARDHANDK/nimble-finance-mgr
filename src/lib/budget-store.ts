import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Category = "food" | "travel" | "fun" | "shop" | "bills" | "surprise";
export type Expense = { id: string; amount: number; category: Category; kind: "need" | "want"; note: string; day: number };
export type Commitment = { id: string; name: string; amount: number; type: "bill" | "sub"; paused: boolean; note: string };
export type Goal = { id: string; name: string; emoji: string; target: number; saved: number };
export type LogItem = { id: string; day: number; text: string; delta: number };

export const TOTAL_DAYS = 30;
export const DEFAULT_START = 10000;

const uid = () => Math.random().toString(36).slice(2, 10);

const defaultCommitments = (): Commitment[] => [
  { id: "rent", name: "PG Room Rent", amount: 3000, type: "bill", paused: false, note: "Fixed commitment" },
  { id: "wifi", name: "PG Wi-Fi Share", amount: 299, type: "bill", paused: false, note: "Split expense" },
  { id: "spotify", name: "Spotify Student", amount: 119, type: "sub", paused: false, note: "Music" },
  { id: "cult", name: "Cult.fit Gym Pass", amount: 124, type: "sub", paused: false, note: "Low usage flag" },
  { id: "jio", name: "Jio 5G Add-on", amount: 498, type: "sub", paused: false, note: "Auto-renews Day 20" },
];
const defaultGoals = (): Goal[] => [
  { id: "emergency", name: "Emergency Cushion", emoji: "🛡️", target: 1500, saved: 0 },
  { id: "goa", name: "Goa Trip", emoji: "🌴", target: 2000, saved: 0 },
];

export const PLOT_TWISTS = [
  { title: "Phone screen cracked", amount: 1800, emoji: "📱" },
  { title: "Friend's birthday treat", amount: 650, emoji: "🎂" },
  { title: "Laptop charger died", amount: 1200, emoji: "🔌" },
  { title: "Surge-priced cab at 2 AM", amount: 480, emoji: "🚕" },
  { title: "Doctor visit + meds", amount: 900, emoji: "💊" },
  { title: "Lost your metro card", amount: 250, emoji: "🚇" },
];

type State = {
  startBalance: number;
  day: number;
  expenses: Expense[];
  commitments: Commitment[];
  goals: Goal[];
  log: LogItem[];
  streak: number;
  onboarded: boolean;
  pendingTwist: { title: string; amount: number; emoji: string } | null;
  frozenFun: boolean;
};
type Actions = {
  addExpense: (e: Omit<Expense, "id" | "day">) => void;
  removeExpense: (id: string) => void;
  toggleCommitment: (id: string) => void;
  contributeGoal: (id: string, amount: number) => void;
  nextDay: () => void;
  rollPlotTwist: () => void;
  resolveTwist: (mode: "balance" | "savings" | "cut") => void;
  dismissTwist: () => void;
  skipPurchase: () => void;
  setup: (start: number, goals: Goal[]) => void;
  resetMonth: () => void;
};

const initial = (start = DEFAULT_START, goals = defaultGoals()): State => ({
  startBalance: start,
  day: 1,
  expenses: [],
  commitments: defaultCommitments(),
  goals,
  log: [],
  streak: 0,
  onboarded: false,
  pendingTwist: null,
  frozenFun: false,
});

export const useBudget = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial(),
      addExpense: (e) =>
        set((s) => ({
          expenses: [{ ...e, id: uid(), day: s.day }, ...s.expenses],
          log: [{ id: uid(), day: s.day, text: e.note, delta: -e.amount }, ...s.log],
        })),
      removeExpense: (id) => set((s) => ({ expenses: s.expenses.filter((x) => x.id !== id) })),
      toggleCommitment: (id) =>
        set((s) => ({ commitments: s.commitments.map((c) => (c.id === id ? { ...c, paused: !c.paused } : c)) })),
      contributeGoal: (id, amount) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, saved: Math.min(g.target, g.saved + amount) } : g)) })),
      nextDay: () => set((s) => ({ day: Math.min(TOTAL_DAYS, s.day + 1) })),
      rollPlotTwist: () => set({ pendingTwist: PLOT_TWISTS[Math.floor(Math.random() * PLOT_TWISTS.length)] }),
      dismissTwist: () => set({ pendingTwist: null }),
      resolveTwist: (mode) => {
        const t = get().pendingTwist;
        if (!t) return;
        const s = get();
        if (mode === "savings") {
          let left = t.amount;
          const goals = s.goals.map((g) => {
            const take = Math.min(g.saved, left);
            left -= take;
            return { ...g, saved: g.saved - take };
          });
          set({ goals, pendingTwist: null });
          if (left > 0) get().addExpense({ amount: left, category: "surprise", kind: "need", note: `Plot twist: ${t.title}` });
          else set((st) => ({ log: [{ id: uid(), day: st.day, text: `Plot twist from savings: ${t.title}`, delta: 0 }, ...st.log] }));
          return;
        }
        if (mode === "cut") {
          set((st) => ({ frozenFun: true, commitments: st.commitments.map((c) => (c.type === "sub" ? { ...c, paused: true } : c)) }));
        }
        set({ pendingTwist: null });
        get().addExpense({ amount: t.amount, category: "surprise", kind: "need", note: `Plot twist: ${t.title}` });
      },
      skipPurchase: () => set((s) => ({ streak: s.streak + 5 })),
      setup: (start, goals) => set({ ...initial(start, goals), onboarded: true }),
      resetMonth: () => set((s) => ({ ...initial(s.startBalance, s.goals.map((g) => ({ ...g, saved: 0 }))), onboarded: true })),
    }),
    { name: "bbf-budget-v1", skipHydration: true },
  ),
);

/* ---------- Derived metrics (pure; used by every screen) ---------- */
export type Snapshot = Pick<State, "startBalance" | "day" | "expenses" | "commitments" | "goals">;

export function computeMetrics(s: Snapshot, extraSpend = 0) {
  const committed = s.commitments.filter((c) => !c.paused).reduce((a, c) => a + c.amount, 0);
  const saved = s.goals.reduce((a, g) => a + g.saved, 0);
  const expenseTotal = s.expenses.reduce((a, e) => a + e.amount, 0) + extraSpend;
  const spent = committed + expenseTotal;
  const balance = s.startBalance - spent - saved;
  const daysLeft = TOTAL_DAYS - s.day + 1;
  const safeDaily = Math.max(0, Math.floor(balance / daysLeft));
  const spentToday = s.expenses.filter((e) => e.day === s.day).reduce((a, e) => a + e.amount, 0) + extraSpend;
  // average variable burn so far (excluding today's partial if day 1)
  const avgDaily = expenseTotal / Math.max(1, s.day);
  const projectedEnd = Math.round(balance - avgDaily * (TOTAL_DAYS - s.day));
  const bustDay = avgDaily > 0 && projectedEnd < 0 ? Math.min(TOTAL_DAYS, s.day + Math.floor(Math.max(0, balance) / avgDaily)) : null;
  const cashPct = Math.max(0, balance / s.startBalance);
  const timePct = daysLeft / TOTAL_DAYS;
  const needs = s.expenses.filter((e) => e.kind === "need").reduce((a, e) => a + e.amount, 0);
  const wants = s.expenses.filter((e) => e.kind === "want").reduce((a, e) => a + e.amount, 0);
  const wantShare = needs + wants > 0 ? wants / (needs + wants) : 0;

  let health = 60 + (projectedEnd / s.startBalance) * 120 + (cashPct - timePct * 0.6) * 40 - Math.max(0, wantShare - 0.3) * 60;
  if (balance <= 0) health = Math.min(health, 5);
  health = Math.round(Math.max(0, Math.min(100, health)));

  const risk: "Low" | "Medium" | "High" | "Critical" =
    balance <= 0 || health < 25 ? "Critical" : health < 45 ? "High" : health < 70 ? "Medium" : "Low";
  const vibe = { Low: "Stable & Chill", Medium: "Tight but Okay", High: "Danger Zone", Critical: "Flatline" }[risk];

  return { committed, saved, expenseTotal, spent, balance, daysLeft, safeDaily, spentToday, avgDaily, projectedEnd, bustDay, cashPct, timePct, needs, wants, wantShare, health, risk, vibe };
}
export type Metrics = ReturnType<typeof computeMetrics>;

export function useMetrics(extraSpend = 0) {
  const startBalance = useBudget((s) => s.startBalance);
  const day = useBudget((s) => s.day);
  const expenses = useBudget((s) => s.expenses);
  const commitments = useBudget((s) => s.commitments);
  const goals = useBudget((s) => s.goals);
  return computeMetrics({ startBalance, day, expenses, commitments, goals }, extraSpend);
}

export const inr = (n: number) => (n < 0 ? "-" : "") + "₹" + Math.abs(Math.round(n)).toLocaleString("en-IN");
export const signedInr = (n: number) => (n >= 0 ? "+" : "-") + "₹" + Math.abs(Math.round(n)).toLocaleString("en-IN");

/** Balance trajectory: actual past points + projection */
export function trajectory(s: Snapshot, extraSpend = 0) {
  const m = computeMetrics(s, extraSpend);
  const pts: { day: number; v: number }[] = [];
  const fixed = m.committed + m.saved;
  let run = s.startBalance - fixed;
  for (let d = 1; d <= s.day; d++) {
    run -= s.expenses.filter((e) => e.day === d).reduce((a, e) => a + e.amount, 0);
    if (d === s.day) run -= extraSpend;
    pts.push({ day: d, v: run });
  }
  const proj: { day: number; v: number }[] = [{ day: s.day, v: m.balance }];
  for (let d = s.day + 1; d <= TOTAL_DAYS; d++) proj.push({ day: d, v: m.balance - m.avgDaily * (d - s.day) });
  return { actual: pts, projected: proj, max: s.startBalance };
}
