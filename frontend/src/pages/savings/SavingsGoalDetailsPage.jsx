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
    <div role="status" className="motion-safe:animate-pulse">
      <span className="sr-only">Loading savings goal...</span>
      <div aria-hidden="true" className="mb-6 h-7 w-44 rounded bg-gray-200" />
      <div
        aria-hidden="true"
        className="grid gap-5 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] lg:gap-6"
      >
        <div className="h-72 rounded-2xl bg-gray-200 lg:h-96" />
        <div className="h-96 rounded-2xl bg-gray-100" />
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
      className="mb-2 inline-flex min-h-11 items-center gap-2 rounded-md text-[12px] font-medium text-gray-600 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-4"
    >
      <ArrowLeft aria-hidden="true" size={15} /> Savings goals
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
            className="mt-4 min-h-11 rounded-lg bg-black px-4 py-2 text-[12px] font-medium text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const icon = getSavingsGoalIcon(goal.iconId);
  const GoalIcon = icon.icon;
  const currentAmount = Math.max(0, Number(goal.currentAmount) || 0);
  const targetAmount = Math.max(0, Number(goal.targetAmount) || 0);
  const progress =
    targetAmount > 0
      ? Math.min(100, (currentAmount / targetAmount) * 100)
      : 0;
  const progressLabel =
    progress >= 100 ? "Goal reached" : `${Math.floor(progress)}% saved`;
  const remainingAmount = Math.max(0, targetAmount - currentAmount);

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1180px]">
      {backLink}
      <PageHeader
        title={
          <span className="block [overflow-wrap:anywhere]">{goal.name}</span>
        }
      />
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] lg:gap-6">
        <section
          aria-label="Goal balance and transfers"
          className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 lg:sticky lg:top-24"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-[13px] font-semibold text-gray-950">
              Goal balance
            </h2>
            <button
              type="button"
              disabled={saving}
              onClick={() => setEditing(true)}
              aria-label="Edit goal details"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 text-[12px] font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Pencil aria-hidden="true" size={14} strokeWidth={1.7} />
              Edit
            </button>
          </div>

          <div className="flex min-w-0 items-center gap-4 lg:flex-col lg:gap-5 lg:text-center">
            <div
              role="progressbar"
              aria-label="Savings target progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.floor(progress)}
              aria-valuetext={`${Math.floor(progress)}% of your savings target reached`}
              className="relative flex h-20 w-20 shrink-0 items-center justify-center lg:h-28 lg:w-28"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 120 120"
                className="absolute inset-0 h-full w-full -rotate-90"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="56"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="56"
                  fill="none"
                  stroke="#111111"
                  strokeWidth="4"
                  pathLength="100"
                  strokeDasharray={`${progress} 100`}
                  strokeLinecap="round"
                  opacity={progress > 0 ? 1 : 0}
                />
              </svg>
              <span className="flex h-[78%] w-[78%] items-center justify-center overflow-hidden rounded-full bg-[#111111] text-white">
                {goal.imageData ? (
                  <img
                    src={goal.imageData}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <GoalIcon
                    aria-hidden="true"
                    size={30}
                    strokeWidth={1.5}
                    className="lg:h-10 lg:w-10"
                  />
                )}
              </span>
            </div>
            <div className="min-w-0 max-w-full">
              <p className="text-[12px] text-gray-600">Saved so far</p>
              <p className="mt-1 text-[26px] font-semibold leading-tight tracking-[-0.04em] tabular-nums text-gray-950 [overflow-wrap:anywhere] sm:text-[30px] lg:text-[34px]">
                {formatGoalMoney(goal.currentAmount)}
              </p>
              <p className="mt-1.5 text-[12px] leading-5 text-gray-600 [overflow-wrap:anywhere]">
                of {formatGoalMoney(goal.targetAmount)} target
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[12px]">
            <p className="font-semibold text-gray-950">{progressLabel}</p>
            {remainingAmount > 0 && (
              <p className="min-w-0 text-gray-600 [overflow-wrap:anywhere]">
                {formatGoalMoney(remainingAmount)} to go
              </p>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => setDirection("in")}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-black px-2 py-3 text-[12px] font-medium text-white transition-colors hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus
                aria-hidden="true"
                className="shrink-0"
                size={16}
                strokeWidth={1.8}
              />
              Transfer in
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setDirection("out")}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-2 py-3 text-[12px] font-medium text-gray-900 transition-colors hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowUpRight
                aria-hidden="true"
                className="shrink-0"
                size={16}
                strokeWidth={1.8}
              />
              Transfer out
            </button>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-gray-200 pt-4 text-[12px]">
            <span className="flex items-center gap-2 text-gray-600">
              <WalletCards aria-hidden="true" size={15} strokeWidth={1.6} />
              Datong Wallet
            </span>
            <span className="min-w-0 font-semibold tabular-nums text-gray-950 [overflow-wrap:anywhere]">
              {formatGoalMoney(wallet.balance)}
            </span>
          </div>
        </section>

        <div className="min-w-0 rounded-2xl border border-gray-200 bg-white">
          <section
            aria-labelledby="goal-details-title"
            className="px-5 pb-2 pt-5 sm:px-6 sm:pt-6"
          >
            <h2 id="goal-details-title" className="mb-1 text-[14px] font-semibold text-gray-950">
              Goal details
            </h2>
            <dl className="divide-y divide-gray-100">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-3 py-4 text-[12px]">
                <dt className="flex items-center gap-2 text-gray-600">
                  <Target aria-hidden="true" className="shrink-0" size={15} strokeWidth={1.6} />
                  Saving target
                </dt>
                <dd className="min-w-0 text-right font-semibold tabular-nums text-gray-950 [overflow-wrap:anywhere]">
                  {formatGoalMoney(goal.targetAmount)}
                </dd>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-3 py-4 text-[12px]">
                <dt className="flex items-center gap-2 text-gray-600">
                  <CalendarDays aria-hidden="true" className="shrink-0" size={15} strokeWidth={1.6} />
                  Target date
                </dt>
                <dd className="text-right font-medium text-gray-800">
                  {formatDate(goal.targetDate)}
                </dd>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-3 py-4 text-[12px]">
                <dt className="flex items-center gap-2 text-gray-600">
                  <Clock3 aria-hidden="true" className="shrink-0" size={15} strokeWidth={1.6} />
                  Opened
                </dt>
                <dd className="text-right font-medium text-gray-800">
                  {formatDate(goal.createdAt)}
                </dd>
              </div>
            </dl>
          </section>

          <section
            aria-labelledby="goal-activity-title"
            aria-busy={activityLoading}
            className="border-t border-gray-200 px-5 py-5 sm:px-6 sm:py-6"
          >
            <h2 id="goal-activity-title" className="text-[14px] font-semibold text-gray-950">
              Goal activity
            </h2>
            {activityLoading && activityPage === 1 ? (
              <div
                role="status"
                className="mt-5 space-y-4 motion-safe:animate-pulse"
              >
                <span className="sr-only">Loading goal activity...</span>
                {[0, 1, 2].map((item) => (
                  <div key={item} aria-hidden="true" className="h-12 rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : (
              <ul className="mt-2 divide-y divide-gray-100">
                {activity.map((entry) => {
                  const incoming = entry.type === "deposit";
                  return (
                    <li key={entry.id} className="flex items-start gap-2.5 py-4 sm:gap-3">
                      <span
                        aria-hidden="true"
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9 ${
                          incoming
                            ? "bg-black text-white"
                            : "border border-gray-200 bg-white text-gray-700"
                        }`}
                      >
                        {incoming ? (
                          <ArrowDownLeft size={17} strokeWidth={1.6} />
                        ) : (
                          <ArrowUpRight size={17} strokeWidth={1.6} />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-medium leading-5 text-gray-950">
                          {incoming ? "Transfer in" : "Transfer out"}
                          <span className="block text-[11px] font-normal text-gray-600 xl:ml-1.5 xl:inline">
                            {incoming ? "from wallet" : "to wallet"}
                          </span>
                        </p>
                        <p className="mt-1 text-[11px] leading-4 text-gray-600">
                          {formatDate(entry.createdAt, true)}
                        </p>
                      </div>
                      <span
                        aria-label={`${incoming ? "Added" : "Withdrawn"} ${formatGoalMoney(entry.amount)}`}
                        className="min-w-0 max-w-[48%] text-right text-[12px] font-semibold leading-5 tabular-nums text-gray-950 [overflow-wrap:anywhere] sm:text-[13px]"
                      >
                        {incoming ? "+" : "\u2212"}
                        {formatGoalMoney(entry.amount)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            {!activityLoading && !activityError && activity.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-[13px] font-medium text-gray-950">
                  No transfers yet
                </p>
                <p className="mx-auto mt-2 max-w-64 text-[12px] leading-5 text-gray-600">
                  Transfer money from your wallet to start saving toward this goal.
                </p>
              </div>
            )}
            {activityError && (
              <div
                role="alert"
                className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[12px]"
              >
                <p className="min-w-0 text-gray-700 [overflow-wrap:anywhere]">
                  {activityError}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActivityLoading(true);
                    setActivityError("");
                    setActivityRefresh((value) => value + 1);
                  }}
                  className="min-h-11 rounded-md px-1 font-medium text-gray-950 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
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
                className="mt-3 min-h-11 w-full rounded-lg border border-gray-200 px-3 py-3 text-[12px] font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {activityLoading ? "Loading..." : "Load more activity"}
              </button>
            )}
          </section>

          <footer className="flex flex-col gap-3 border-t border-gray-200 px-5 py-5 sm:px-6 xl:flex-row xl:items-center xl:justify-between xl:gap-5">
            <p className="min-w-0 text-[12px] leading-5 text-gray-600">
              Closing this goal returns your savings to Datong Wallet.
            </p>
            <button
              type="button"
              disabled={saving}
              onClick={handleCloseGoal}
              className="min-h-11 shrink-0 rounded-lg border border-gray-300 px-4 py-2.5 text-[12px] font-medium text-gray-700 transition-colors hover:border-black hover:bg-gray-50 hover:text-black focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && !editing && !direction ? "Closing..." : "Close goal"}
            </button>
          </footer>
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
