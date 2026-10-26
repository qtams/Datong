import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Check,
  Plus,
  Target,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import PageHeader from "../../components/PageHeader";
import SavingsGoalModal from "../../components/modals/SavingsGoalModal";
import { useAuth } from "../../auth/AuthContext";

import {
  getSavingsGoalIcon,
} from "../../data/savingsGoalIcons";

import {
  createSavingsGoal,
  getCashAccount,
  getSavingsGoals,
} from "../../services/memberFinanceApi";

const MAX_GOALS = 6;
const MotionLink = motion.create(Link);

function formatPeso(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits:
      Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(
    Number.isFinite(amount) ? amount : 0,
  );
}

function GoalProgressRing({
  goal,
  sizeClass = "h-32 w-32 sm:h-36 sm:w-36",
}) {
  const iconItem = getSavingsGoalIcon(
    goal.iconId,
  );

  const Icon = iconItem.icon;

  const target = Math.max(
    0,
    Number(goal.targetAmount || 0),
  );

  const current = Math.max(
    0,
    Number(goal.currentAmount || 0),
  );

  const progress =
    target > 0
      ? Math.min(100, (current / target) * 100)
      : 0;

  const completed = progress >= 100;

  return (
    <div
      className={`relative rounded-full p-[5px] ${sizeClass}`}
      style={{
        background: `conic-gradient(#111111 ${progress * 3.6}deg, #e5e7eb 0deg)`,
      }}
    >
      <div
        className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[5px] border-white"
        style={{
          background: iconItem.background,
          color: iconItem.color,
        }}
      >
        {goal.imageData ? (
          <img
            src={goal.imageData}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <Icon
            size={44}
            strokeWidth={1.4}
            className="sm:h-12 sm:w-12"
          />
        )}
      </div>

      {completed && (
        <span className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black text-white ring-4 ring-white">
          <Check
            size={14}
            strokeWidth={2.5}
          />
        </span>
      )}
    </div>
  );
}

function GoalCard({ goal }) {
  const target = Number(
    goal.targetAmount || 0,
  );

  const current = Number(
    goal.currentAmount || 0,
  );

  const progress =
    target > 0
      ? Math.min(
          100,
          Math.round((current / target) * 100),
        )
      : 0;

  return (
    <MotionLink
      to={`/savings-goals/${goal.id}`}
      whileTap={{ scale: 0.98 }}
      className="group flex min-w-0 flex-col items-center rounded-3xl px-2 py-4 text-center outline-none transition-colors hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 sm:px-4 sm:py-5"
    >
      <GoalProgressRing goal={goal} />

      <p className="mt-4 max-w-full truncate text-[13px] font-semibold tracking-[-0.02em] text-gray-950 sm:text-[14px]">
        {goal.name}
      </p>

      <p className="mt-1 text-[15px] font-semibold tracking-[-0.025em] text-gray-950 sm:text-[16px]">
        {formatPeso(current)}
      </p>

      <span className="sr-only">
        View goal. {progress}% complete
      </span>
    </MotionLink>
  );
}

function AddGoalCard({ onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="group flex min-w-0 flex-col items-center rounded-3xl px-2 py-4 text-center outline-none transition-colors hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 sm:px-4 sm:py-5"
    >
      <span className="flex h-32 w-32 items-center justify-center rounded-full border border-dashed border-gray-300 bg-gray-50 text-gray-900 transition-colors group-hover:border-gray-900 group-hover:bg-white sm:h-36 sm:w-36">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.16)]">
          <Plus
            size={22}
            strokeWidth={1.8}
          />
        </span>
      </span>

      <span className="mt-4 text-[13px] font-semibold text-gray-950 sm:text-[14px]">
        Open new goal
      </span>

      <span className="mt-1 text-[9px] text-gray-400">
        Choose an icon and target
      </span>
    </motion.button>
  );
}

function SavingsGoalsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1180px] animate-pulse">
      <div className="h-6 w-40 rounded bg-gray-200" />
      <div className="mt-3 h-3 w-72 max-w-full rounded bg-gray-200" />

      <div className="mt-6 h-48 rounded-[28px] bg-gray-200" />

      <div className="mt-8 flex items-center justify-between">
        <div className="h-4 w-28 rounded bg-gray-200" />
        <div className="h-3 w-16 rounded bg-gray-200" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="rounded-3xl border border-gray-100 bg-white px-4 py-6"
            >
              <div className="mx-auto h-32 w-32 rounded-full bg-gray-200" />
              <div className="mx-auto mt-5 h-3 w-24 rounded bg-gray-200" />
              <div className="mx-auto mt-3 h-4 w-20 rounded bg-gray-200" />
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function SavingsGoalsContent({
  loading = false,
}) {
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [goalsError, setGoalsError] = useState("");
  const [reloadCounter, setReloadCounter] = useState(0);
  const mutationPending = useRef(false);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [walletBalance, setWalletBalance] =
    useState(0);

  const [walletLoading, setWalletLoading] =
    useState(false);

  const [walletError, setWalletError] =
    useState("");

  const [goalSaving, setGoalSaving] =
    useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getSavingsGoals({ signal: controller.signal })
      .then((savedGoals) => {
        if (!controller.signal.aborted) {
          setGoals(savedGoals);
          setGoalsError("");
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setGoalsError(error?.message || "Unable to load your savings goals.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setGoalsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [reloadCounter]);

  const handleReloadGoals = () => {
    setGoalsLoading(true);
    setGoalsError("");
    setReloadCounter((counter) => counter + 1);
  };

  useEffect(() => {
    if (!modalOpen) {
      return undefined;
    }

    let active = true;

    const loadWalletBalance = async () => {
      setWalletLoading(true);
      setWalletError("");

      try {
        const cashAccount =
          await getCashAccount();

        if (!active) {
          return;
        }

        setWalletBalance(
          Math.max(
            0,
            Number(cashAccount?.balance || 0),
          ),
        );
      } catch (error) {
        if (!active) {
          return;
        }

        console.error(
          "Unable to load Datong Wallet balance:",
          error,
        );

        setWalletError(
          "Wallet balance is unavailable right now.",
        );
      } finally {
        if (active) {
          setWalletLoading(false);
        }
      }
    };

    loadWalletBalance();

    return () => {
      active = false;
    };
  }, [modalOpen]);

  const summary = useMemo(() => {
    const current = goals.reduce(
      (total, goal) =>
        total +
        Number(goal.currentAmount || 0),
      0,
    );

    const target = goals.reduce(
      (total, goal) =>
        total +
        Number(goal.targetAmount || 0),
      0,
    );

    const completed = goals.filter(
      (goal) =>
        Number(goal.targetAmount || 0) > 0 &&
        Number(goal.currentAmount || 0) >=
          Number(goal.targetAmount || 0),
    ).length;

    const progress =
      target > 0
        ? Math.min(
            100,
            Math.round((current / target) * 100),
          )
        : 0;

    return {
      current,
      target,
      completed,
      progress,
    };
  }, [goals]);

  const atLimit =
    goals.length >= MAX_GOALS;

  const handleOpenCreate = () => {
    if (mutationPending.current) {
      return;
    }

    if (atLimit) {
      toast(
        "You can create up to 6 savings goals.",
      );
      return;
    }

    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (mutationPending.current) {
      return;
    }

    setModalOpen(false);
  };

  const handleSaveGoal = async (values) => {
    if (mutationPending.current) {
      return;
    }

    if (
      goals.length >= MAX_GOALS
    ) {
      toast.error(
        "You already have 6 savings goals.",
      );
      return;
    }

    mutationPending.current = true;
    setGoalSaving(true);

    try {
      const result = await createSavingsGoal(values);

      setWalletBalance(Number(result.wallet.balance));
      setGoals((current) => [...current, result.goal]);

      toast.success("Savings goal opened and wallet updated.");

      setModalOpen(false);
    } catch (error) {
      console.error(
        "Unable to save savings goal:",
        error,
      );

      toast.error(
        error?.message ||
          "Unable to update your savings goal.",
      );

      if (error?.status === 409 || error?.status === 404) {
        setModalOpen(false);
        handleReloadGoals();
      }
    } finally {
      mutationPending.current = false;
      setGoalSaving(false);
    }
  };

  if (loading || goalsLoading) {
    return <SavingsGoalsSkeleton />;
  }

  if (goalsError) {
    return (
      <div className="mx-auto w-full max-w-[1180px]">
        <PageHeader title="Savings goals" />
        <div role="alert" className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-[12px] font-medium text-gray-900">Unable to load savings goals</p>
          <p className="mt-2 text-[11px] text-gray-500">{goalsError}</p>
          <button type="button" onClick={handleReloadGoals} className="mt-4 rounded-lg bg-black px-4 py-2 text-[11px] text-white focus-visible:outline-2 focus-visible:outline-offset-2">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1180px]">
      <PageHeader
        title="Savings goals"
        description="Create focused savings targets and keep every goal moving forward."
        breadcrumbs={[
          {
            label: "Dashboard",
            href: "/",
          },
          {
            label: "Savings goals",
          },
        ]}
        actions={
          <button
            type="button"
            disabled={atLimit || goalSaving}
            onClick={handleOpenCreate}
            className="hidden h-10 items-center gap-2 rounded-lg bg-black px-4 text-[10px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
          >
            <Plus
              size={14}
              strokeWidth={1.8}
            />
            New goal
          </button>
        }
      />

      <section className="relative overflow-hidden rounded-[28px] bg-[#111111] px-5 py-6 text-white sm:px-7 sm:py-7">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/[0.05] blur-2xl"
        />

        <div className="relative grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <p className="text-[10px] font-medium text-white/55">
              Total current savings
            </p>

            <p className="mt-2 text-[34px] font-semibold tracking-[-0.045em] text-white sm:text-[42px]">
              {formatPeso(summary.current)}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[9px] text-white/70">
                {goals.length} of {MAX_GOALS} goals
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[9px] text-white/70">
                {summary.completed} completed
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-4 text-[9px] text-white/55">
              <span>
                Overall progress
              </span>

              <span className="font-semibold tabular-nums text-white">
                {summary.progress}%
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white transition-[width] duration-300"
                style={{
                  width: `${summary.progress}%`,
                }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-4 text-[9px] text-white/45">
              <span>
                Saved {formatPeso(summary.current)}
              </span>

              <span>
                Target {formatPeso(summary.target)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-gray-950">
              Your goals
            </h2>

            <p className="mt-1 text-[10px] text-gray-400">
              {goals.length > 0
                ? "Open a goal to view activity and move money."
                : "Start with the goal that matters most."}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] text-gray-400">
            <Target
              size={12}
              strokeWidth={1.5}
            />
            Maximum of {MAX_GOALS}
          </div>
        </div>

        <div className="mt-4 rounded-[28px] border border-gray-100 bg-white p-2 sm:p-4">
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-2 lg:grid-cols-4 xl:grid-cols-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
              />
            ))}

            {!atLimit && (
              <AddGoalCard
                onClick={handleOpenCreate}
              />
            )}
          </div>

          {atLimit && (
            <div className="mx-3 mt-2 flex items-center justify-center rounded-2xl bg-gray-50 px-4 py-3 text-center text-[9px] text-gray-500">
              All six goal slots are in use. Edit or delete a goal to create another.
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {modalOpen && (
          <SavingsGoalModal
            key="new-goal"
            open={modalOpen}
            walletBalance={walletBalance}
            walletLoading={walletLoading}
            walletError={walletError}
            saving={goalSaving}
            onClose={handleCloseModal}
            onSave={handleSaveGoal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SavingsGoalsPage({ loading = false }) {
  const { user } = useAuth();

  return <SavingsGoalsContent key={user?.id} loading={loading} />;
}

export default SavingsGoalsPage;
