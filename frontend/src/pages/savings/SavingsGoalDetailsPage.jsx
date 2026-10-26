import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Pencil,
  Plus,
  Target,
  WalletCards,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import { useAuth } from "../../auth/AuthContext";
import PageHeader from "../../components/PageHeader";
import SavingsGoalModal from "../../components/modals/SavingsGoalModal";
import SavingsGoalTransferModal from "../../components/modals/SavingsGoalTransferModal";
import { getSavingsGoalIcon } from "../../data/savingsGoalIcons";
import {
  deleteSavingsGoal,
  getCashAccount,
  getSavingsGoal,
  getSavingsGoalEntries,
  transferSavingsGoal,
  updateSavingsGoal,
} from "../../services/memberFinanceApi";
import { formatGoalMoney } from "../../utils/moneyInput";
import { confirmDelete } from "../../utils/sweetAlert";

function formatDate(value, includeTime = false) {
  if (!value) return "No target date";
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(includeTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(date);
}

function GoalDetailsSkeleton() {
  return (
    <div aria-label="Loading savings goal" className="animate-pulse">
      <div className="mb-6 h-7 w-44 rounded bg-gray-200" />
      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="h-[465px] rounded-[28px] bg-gray-200" />
        <div className="h-[465px] rounded-[24px] bg-gray-100" />
      </div>
    </div>
  );
}

function GoalDetailsContent({ goalId, loading }) {
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [goalLoading, setGoalLoading] = useState(true);
  const [goalError, setGoalError] = useState("");
  const [reloadCounter, setReloadCounter] = useState(0);
  const [editing, setEditing] = useState(false);
  const [direction, setDirection] = useState(null);
  const [saving, setSaving] = useState(false);
  const pending = useRef(false);
  const [activity, setActivity] = useState([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityRefresh, setActivityRefresh] = useState(0);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState("");
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      getSavingsGoal(goalId, { signal: controller.signal }),
      getCashAccount({ signal: controller.signal }),
    ])
      .then(([savedGoal, savedWallet]) => {
        if (!controller.signal.aborted) {
          setGoal(savedGoal);
          setWallet(savedWallet);
          setGoalError("");
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setGoalError(
            error?.status === 404
              ? "This savings goal is no longer available."
              : error?.message || "Unable to load this goal.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setGoalLoading(false);
      });
    return () => controller.abort();
  }, [goalId, reloadCounter]);

  useEffect(() => {
    const controller = new AbortController();
    getSavingsGoalEntries(goalId, {
      page: activityPage,
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) return;
        setActivity((previous) =>
          activityPage === 1
            ? result.entries
            : Array.from(
                new Map(
                  [...previous, ...result.entries].map((entry) => [
                    entry.id,
                    entry,
                  ]),
                ).values(),
              ),
        );
        setHasMore(result.hasMore);
        setActivityError("");
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setActivityError(error?.message || "Unable to load goal activity.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setActivityLoading(false);
      });
    return () => controller.abort();
  }, [goalId, activityPage, activityRefresh]);

  const refreshGoal = () => {
    setGoalLoading(true);
    setGoalError("");
    setReloadCounter((value) => value + 1);
  };
  const refreshActivity = () => {
    setActivityLoading(true);
    setActivityError("");
    setActivityPage(1);
    setActivityRefresh((value) => value + 1);
  };
  const recoverConflict = (error) => {
    if (error?.status === 409 || error?.status === 404) {
      setEditing(false);
      setDirection(null);
      refreshGoal();
      refreshActivity();
    }
  };

  const handleTransfer = async (values) => {
    if (pending.current) return;
    pending.current = true;
    setSaving(true);
    try {
      const result = await transferSavingsGoal(goal.id, values);
      setGoal(result.goal);
      setWallet(result.wallet);
      setDirection(null);
      refreshActivity();
      toast.success(
        values.direction === "in"
          ? "Money added to your goal."
          : "Money returned to Datong Wallet.",
      );
    } catch (error) {
      recoverConflict(error);
      if (error?.status === 409 || error?.status === 404)
        toast.error(error.message);
      throw error;
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };

  const handleSaveDetails = async (values) => {
    if (pending.current) return;
    pending.current = true;
    setSaving(true);
    try {
      const result = await updateSavingsGoal(goal.id, values, goal.version);
      setGoal(result.goal);
      setWallet(result.wallet);
      setEditing(false);
      toast.success("Goal details updated.");
    } catch (error) {
      recoverConflict(error);
      toast.error(error?.message || "Unable to update this goal.");
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };

  const handleCloseGoal = async () => {
    if (pending.current) return;
    pending.current = true;
    setSaving(true);
    try {
      const confirmed = await confirmDelete({
        title: "Close this savings goal?",
        text: `Your saved ${formatGoalMoney(goal.currentAmount)} will return to Datong Wallet. This goal will be removed from your active goals.`,
        confirmText: "Close goal",
      });
      if (!confirmed) return;
      await deleteSavingsGoal(goal.id, goal.version);
      toast.success("Goal closed. Your saved money is back in Datong Wallet.");
      navigate("/savings-goals", { replace: true });
    } catch (error) {
      recoverConflict(error);
      toast.error(error?.message || "Unable to close this goal.");
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };

  const backLink = (
    <Link
      to="/savings-goals"
      className="mb-4 inline-flex min-h-9 items-center gap-2 rounded-md text-[11px] font-medium text-gray-500 hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <ArrowLeft size={15} /> Savings goals
    </Link>
  );
  if (loading || goalLoading)
    return (
      <div className="mx-auto w-full max-w-[1180px]">
        {backLink}
        <GoalDetailsSkeleton />
      </div>
    );
  if (goalError || !goal || !wallet) {
    return (
      <div className="mx-auto w-full max-w-[1180px]">
        {backLink}
        <PageHeader title="Savings goal" />
        <div
          role="alert"
          className="rounded-xl border border-gray-200 bg-white p-5"
        >
          <p className="text-[12px] text-gray-600">
            {goalError || "Unable to load this goal."}
          </p>
          <button
            type="button"
            onClick={refreshGoal}
            className="mt-4 rounded-lg bg-black px-4 py-2 text-[11px] text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const icon = getSavingsGoalIcon(goal.iconId);
  const GoalIcon = icon.icon;
  const progress = Math.min(
    100,
    (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100,
  );

  return (
    <div className="mx-auto w-full max-w-[1180px]">
      {backLink}
      <PageHeader title={goal.name} />
      <div className="grid items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-8">
        <section
          aria-label="Goal balance and transfers"
          className="rounded-[28px] bg-[#c6dfe1] px-5 pb-6 pt-5 sm:px-7 sm:pt-7 lg:sticky lg:top-24"
        >
          <div className="relative mx-auto flex aspect-square w-full max-w-[300px] items-center justify-center">
            <svg
              aria-hidden="true"
              viewBox="0 0 320 320"
              className="absolute inset-0 h-full w-full -rotate-90"
            >
              <circle
                cx="160"
                cy="160"
                r="153"
                fill="none"
                stroke="#afd0d3"
                strokeWidth="4"
              />
              <circle
                cx="160"
                cy="160"
                r="153"
                fill="none"
                stroke="#537e84"
                strokeWidth="4"
                pathLength="100"
                strokeDasharray={`${progress} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="relative flex max-w-[85%] flex-col items-center text-center">
              <div className="relative">
                <span
                  className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full"
                  style={{ background: icon.background, color: icon.color }}
                >
                  {goal.imageData ? (
                    <img
                      src={goal.imageData}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <GoalIcon size={30} strokeWidth={1.5} />
                  )}
                </span>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setEditing(true)}
                  aria-label="Edit goal details"
                  title="Edit goal details"
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#c6dfe1] bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
                >
                  <Pencil size={12} strokeWidth={1.7} />
                </button>
              </div>
              <p className="mt-4 max-w-full break-all text-[28px] font-semibold leading-tight tracking-[-0.04em] text-gray-950 sm:text-[30px]">
                {formatGoalMoney(goal.currentAmount)}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-700">
                <Target size={12} /> Target:{" "}
                {formatGoalMoney(goal.targetAmount)}
              </p>
              <span className="sr-only">
                {Math.round(progress)}% of your savings target reached.
              </span>
            </div>
          </div>

          <div className="mt-5 flex justify-center gap-12">
            <button
              type="button"
              disabled={saving}
              onClick={() => setDirection("in")}
              className="group flex flex-col items-center gap-2 rounded-xl px-2 py-1 text-[11px] font-medium text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-40"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#20252b] text-[#89e7ec] transition-transform group-hover:scale-105">
                <Plus size={24} strokeWidth={1.6} />
              </span>
              Transfer in
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setDirection("out")}
              className="group flex flex-col items-center gap-2 rounded-xl px-2 py-1 text-[11px] font-medium text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-40"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b3d0d3] text-[#25343b] transition-transform group-hover:scale-105">
                <ArrowUpRight size={23} strokeWidth={1.6} />
              </span>
              Transfer out
            </button>
          </div>
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#a7c8cc]/60 pt-4 text-[10px] text-[#3f5c62]">
            <span className="flex items-center gap-1.5">
              <WalletCards size={13} /> Datong Wallet
            </span>
            <span className="font-semibold tabular-nums">
              {formatGoalMoney(wallet.balance)}
            </span>
          </div>
        </section>

        <div className="min-w-0 overflow-hidden rounded-[24px] border border-gray-100 bg-white">
          <section aria-label="Goal details" className="px-5 pb-6 pt-2 sm:px-6">
            <dl className="divide-y divide-gray-100">
              <div className="flex items-center justify-between gap-4 py-4 text-[12px]">
                <dt className="flex items-center gap-2.5 text-gray-500">
                  <Target size={16} strokeWidth={1.6} />
                  Saving target
                </dt>
                <dd className="font-semibold tabular-nums text-gray-900">
                  {formatGoalMoney(goal.targetAmount)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-4 text-[12px]">
                <dt className="flex items-center gap-2.5 text-gray-500">
                  <CalendarDays size={16} strokeWidth={1.6} />
                  Target date
                </dt>
                <dd className="text-right font-medium text-gray-800">
                  {formatDate(goal.targetDate)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-4 text-[12px]">
                <dt className="flex items-center gap-2.5 text-gray-500">
                  <Clock3 size={16} strokeWidth={1.6} />
                  Opened
                </dt>
                <dd className="text-right font-medium text-gray-800">
                  {formatDate(goal.createdAt)}
                </dd>
              </div>
            </dl>
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                disabled={saving}
                onClick={handleCloseGoal}
                className="min-h-10 rounded-full border border-gray-400 px-5 py-2 text-[11px] font-medium text-gray-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
              >
                {saving && !editing && !direction
                  ? "Closing..."
                  : "Close this savings goal"}
              </button>
            </div>
          </section>

          <section
            aria-label="Goal activity"
            className="border-t border-gray-100 px-5 py-5 sm:px-6"
          >
            <h2 className="text-[13px] font-semibold text-gray-900">
              Goal activity
            </h2>
            {activityLoading && activityPage === 1 ? (
              <div
                aria-label="Loading goal activity"
                className="mt-5 space-y-4 animate-pulse"
              >
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-10 rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : (
              <ul className="mt-2 divide-y divide-gray-100">
                {activity.map((entry) => {
                  const incoming = entry.type === "deposit";
                  return (
                    <li key={entry.id} className="flex items-center gap-3 py-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-700">
                        {incoming ? (
                          <ArrowDownLeft size={17} strokeWidth={1.6} />
                        ) : (
                          <ArrowUpRight size={17} strokeWidth={1.6} />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-gray-900">
                          {incoming ? "Transfer in" : "Transfer out"}
                          <span className="ml-1.5 font-normal text-gray-400">
                            {incoming ? "from wallet" : "to wallet"}
                          </span>
                        </p>
                        <p className="mt-1 text-[10px] text-gray-400">
                          {formatDate(entry.createdAt, true)}
                        </p>
                      </div>
                      <span className="shrink-0 text-right text-[12px] font-semibold tabular-nums text-gray-800">
                        {incoming ? "+" : "−"}
                        {formatGoalMoney(entry.amount)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            {!activityLoading && !activityError && activity.length === 0 && (
              <p className="py-8 text-center text-[11px] leading-5 text-gray-400">
                No transfers yet. Add money from your wallet to start this goal.
              </p>
            )}
            {activityError && (
              <div role="alert" className="mt-3 text-[11px] text-red-600">
                {activityError}
                <button
                  type="button"
                  onClick={() => {
                    setActivityLoading(true);
                    setActivityError("");
                    setActivityRefresh((value) => value + 1);
                  }}
                  className="ml-2 rounded px-1 py-2 font-medium underline"
                >
                  Try again
                </button>
              </div>
            )}
            {hasMore && !activityError && (
              <button
                type="button"
                disabled={activityLoading}
                onClick={() => {
                  setActivityLoading(true);
                  setActivityPage((value) => value + 1);
                }}
                className="mt-3 w-full rounded-lg py-3 text-[11px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                {activityLoading ? "Loading..." : "Load more activity"}
              </button>
            )}
          </section>
        </div>
      </div>

      <AnimatePresence>
        {editing && (
          <SavingsGoalModal
            key={`edit-${goal.id}`}
            open
            goal={goal}
            detailsOnly
            walletBalance={wallet.balance}
            saving={saving}
            onClose={() => {
              if (!pending.current) setEditing(false);
            }}
            onSave={handleSaveDetails}
          />
        )}
        {direction && (
          <SavingsGoalTransferModal
            key={direction}
            goal={goal}
            walletBalance={wallet.balance}
            direction={direction}
            saving={saving}
            onClose={() => {
              if (!pending.current) setDirection(null);
            }}
            onTransfer={handleTransfer}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SavingsGoalDetailsPage({ loading = false }) {
  const { user } = useAuth();
  const { goalId } = useParams();
  return (
    <GoalDetailsContent
      key={`${user?.id}:${goalId}`}
      goalId={goalId}
      loading={loading}
    />
  );
}
