import { useCallback, useEffect, useState } from "react";

import {
  ArrowLeft,
  AtSign,
  BadgeCheck,
  CalendarDays,
  Check,
  CircleDashed,
  Clock3,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import PageHeader from "../../components/PageHeader";

import { getMemberVerification } from "../../data/membersData";

import { getMember } from "../../services/membersApi";

/* =========================================================
   INITIALS
========================================================= */

function getInitials(fullname) {
  if (!fullname) {
    return "M";
  }

  return fullname
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

/* =========================================================
   DATE
========================================================= */

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-PH", {
    month: "long",

    day: "numeric",

    year: "numeric",

    hour: "numeric",

    minute: "2-digit",
  }).format(date);
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
          <Icon size={15} strokeWidth={1.6} />
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-gray-400">
            {label}
          </p>

          <p className="mt-1 break-words text-[11px] font-medium leading-5 text-gray-800">
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REQUIREMENT
========================================================= */

function RequirementItem({ label, completed, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-3.5 last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full

            ${
              completed
                ? "bg-emerald-50 text-emerald-700"
                : "bg-gray-100 text-gray-400"
            }
          `}
        >
          {completed ? (
            <Check size={14} strokeWidth={2} />
          ) : (
            <CircleDashed size={14} strokeWidth={1.6} />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-medium text-gray-800">{label}</p>

          <p className="mt-0.5 truncate text-[9px] text-gray-400">
            {value || "Not completed"}
          </p>
        </div>
      </div>

      <span
        className={`
          shrink-0
          rounded-md
          border
          px-2
          py-1
          text-[9px]
          font-medium

          ${
            completed
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-gray-200 bg-gray-50 text-gray-500"
          }
        `}
      >
        {completed ? "Complete" : "Missing"}
      </span>
    </div>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function MemberDetailsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1600px] animate-pulse">
      <div className="mb-6 h-[90px] max-w-[500px] rounded-xl bg-gray-200" />

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="h-[460px] rounded-xl border border-gray-200 bg-white" />

        <div className="h-[460px] rounded-xl border border-gray-200 bg-white" />
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

function MemberDetailsPage({ loading = false }) {
  const navigate = useNavigate();

  const { memberId } = useParams();

  const [member, setMember] = useState(null);

  const [dataLoading, setDataLoading] = useState(true);

  const [error, setError] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  /* =======================================================
     LOAD REAL MEMBER
  ======================================================= */

  const loadMember = useCallback(
    async ({ silent = false } = {}) => {
      if (!memberId) {
        setError("Member not found.");

        setDataLoading(false);

        return;
      }

      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setDataLoading(true);
        }

        setError("");

        const data = await getMember(memberId);

        setMember(data || null);
      } catch (loadError) {
        console.error("Unable to load member:", loadError);

        setMember(null);

        setError(
          loadError.status === 404
            ? "Member not found."
            : loadError.message || "Unable to load member.",
        );
      } finally {
        setDataLoading(false);

        setRefreshing(false);
      }
    },
    [memberId],
  );

  useEffect(() => {
    loadMember();
  }, [loadMember]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading || dataLoading) {
    return <MemberDetailsSkeleton />;
  }

  /* =======================================================
     NOT FOUND / ERROR
  ======================================================= */

  if (!member) {
    return (
      <div className="mx-auto w-full max-w-[1600px]">
        <PageHeader
          breadcrumbs={[
            {
              label: "Home",

              href: "/",
            },

            {
              label: "Members",

              href: "/members",
            },

            {
              label: "Member not found",
            },
          ]}
          title="Member not found"
          description={
            error || "The member record you requested could not be found."
          }
          actions={
            <button
              type="button"
              onClick={() => navigate("/members")}
              className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-[10px] font-medium text-gray-600 hover:bg-gray-50 hover:text-black"
            >
              <ArrowLeft size={13} />
              Back to members
            </button>
          }
        />
      </div>
    );
  }

  /* =======================================================
     VERIFICATION
  ======================================================= */

  const verification = getMemberVerification(member);

  const requirementValues = {
    fullname: member.fullname,

    nickname: member.nickname,

    username: member.username ? `@${member.username}` : "",

    password_set: member.password_set ? "Password configured" : "",

    mobile_number: member.mobile_number,

    location: member.location,

    email: member.email,
  };

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* =================================================
          HEADER
      ================================================= */}

      <PageHeader
        breadcrumbs={[
          {
            label: "Home",
            href: "/",
          },

          {
            label: "Admin",
          },

          {
            label: "Members",

            href: "/members",
          },

          {
            label: member.member_id,
          },
        ]}
        title="Member details"
        description="Review real member information and verification requirements."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                loadMember({
                  silent: true,
                })
              }
              disabled={refreshing}
              className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-[10px] font-medium text-gray-600 hover:bg-gray-50 hover:text-black disabled:opacity-50"
            >
              <RefreshCw
                size={13}
                strokeWidth={1.7}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => navigate("/members")}
              className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-[10px] font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-black"
            >
              <ArrowLeft size={13} strokeWidth={1.7} />
              Back to members
            </button>
          </div>
        }
      />

      {/* =================================================
          HERO
      ================================================= */}

      <section className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-black text-[14px] font-semibold text-white">
              {getInitials(member.fullname)}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-[17px] font-semibold tracking-[-0.03em] text-gray-950">
                  {member.fullname || "Unnamed member"}
                </h2>

                <span
                  className={`
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-md
                    border
                    px-2
                    py-1
                    text-[9px]
                    font-medium

                    ${
                      verification.verified
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }
                  `}
                >
                  {verification.verified ? (
                    <BadgeCheck size={11} />
                  ) : (
                    <CircleDashed size={11} />
                  )}

                  {verification.status}
                </span>
              </div>

              <p className="mt-1 text-[10px] text-gray-400">
                {member.username ? `@${member.username}` : "No username"}

                {" · "}

                {member.member_id}
              </p>

              <p className="mt-1 text-[9px] text-gray-400">
                Registered {formatDateTime(member.registered_at)}
              </p>
            </div>
          </div>

          {/* SCORE */}

          <div className="min-w-[220px] rounded-xl bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium text-gray-500">
                Verification
              </p>

              <p className="text-[11px] font-semibold text-gray-900">
                {verification.completed}/{verification.total}
              </p>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all ${
                  verification.verified ? "bg-emerald-600" : "bg-black"
                }`}
                style={{
                  width: `${verification.percentage}%`,
                }}
              />
            </div>

            <p className="mt-2 text-[9px] text-gray-400">
              {verification.percentage}% complete
            </p>
          </div>
        </div>
      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
        {/* LEFT */}

        <div className="space-y-4">
          {/* MEMBER INFORMATION */}

          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-[13px] font-semibold text-gray-950">
                Member information
              </h3>

              <p className="mt-1 text-[10px] text-gray-400">
                Read-only account information.
              </p>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-2">
              <DetailItem
                icon={UserRound}
                label="Full name"
                value={member.fullname}
              />

              <DetailItem
                icon={UserRound}
                label="Nickname"
                value={member.nickname}
              />

              <DetailItem
                icon={AtSign}
                label="Username"
                value={member.username ? `@${member.username}` : "—"}
              />

              <DetailItem
                icon={KeyRound}
                label="Password"
                value={
                  member.password_set ? "Password configured" : "Not configured"
                }
              />

              <DetailItem
                icon={Phone}
                label="Mobile number"
                value={member.mobile_number}
              />

              <DetailItem
                icon={MapPin}
                label="Location"
                value={member.location}
              />

              <DetailItem
                icon={Mail}
                label="Email address"
                value={member.email}
              />

              <DetailItem
                icon={ShieldCheck}
                label="Authentication provider"
                value={member.provider_label}
              />

              <DetailItem icon={ShieldCheck} label="Role" value={member.role} />

              <DetailItem
                icon={BadgeCheck}
                label="Firebase email verification"
                value={member.email_verified ? "Verified" : "Not verified"}
              />
            </div>
          </section>

          {/* ACTIVITY */}

          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-[13px] font-semibold text-gray-950">
                Account activity
              </h3>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-3">
              <DetailItem
                icon={CalendarDays}
                label="Registered"
                value={formatDateTime(member.registered_at)}
              />

              <DetailItem
                icon={Clock3}
                label="Last login"
                value={formatDateTime(member.last_login_at)}
              />

              <DetailItem
                icon={BadgeCheck}
                label="Verified"
                value={
                  verification.verified
                    ? formatDateTime(member.verified_at)
                    : "Not yet verified"
                }
              />
            </div>
          </section>
        </div>

        {/* =================================================
            REQUIREMENTS
        ================================================= */}

        <aside className="self-start overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={15}
                strokeWidth={1.7}
                className="text-gray-700"
              />

              <h3 className="text-[13px] font-semibold text-gray-950">
                Verification requirements
              </h3>
            </div>

            <p className="mt-1.5 text-[10px] leading-5 text-gray-400">
              Verification is automatic once all system requirements are
              complete.
            </p>
          </div>

          <div>
            {verification.requirements.map((requirement) => (
              <RequirementItem
                key={requirement.key}
                label={requirement.label}
                completed={requirement.completed}
                value={requirementValues[requirement.key]}
              />
            ))}
          </div>

          <div
            className={`
              border-t
              px-5
              py-4

              ${
                verification.verified
                  ? "border-emerald-100 bg-emerald-50/60"
                  : "border-gray-100 bg-gray-50"
              }
            `}
          >
            {verification.verified ? (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <BadgeCheck size={15} strokeWidth={1.8} />
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-emerald-800">
                    Member verified
                  </p>

                  <p className="mt-1 text-[9px] leading-4 text-emerald-700/70">
                    All required account information has been completed.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[10px] font-medium text-gray-700">
                  {verification.total - verification.completed} requirement
                  {verification.total - verification.completed !== 1
                    ? "s"
                    : ""}{" "}
                  remaining
                </p>

                <p className="mt-1 text-[9px] leading-4 text-gray-400">
                  The member will become verified automatically after completing
                  all missing requirements.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default MemberDetailsPage;
