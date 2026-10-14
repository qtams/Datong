import { useCallback, useEffect, useMemo, useState } from "react";

import {
  BadgeCheck,
  ChevronDown,
  CircleDashed,
  Eye,
  RefreshCw,
  Search,
  UsersRound,
  UserRoundPlus,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import PageHeader from "../../components/PageHeader";

import {
  MEMBER_STATUS_OPTIONS,
  getMemberVerification,
} from "../../data/membersData";

import { getMembers } from "../../services/membersApi";

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
    month: "short",

    day: "numeric",

    year: "numeric",

    hour: "numeric",

    minute: "2-digit",
  }).format(date);
}

/* =========================================================
   VERIFICATION BADGE
========================================================= */

function VerificationBadge({ member }) {
  const verification = getMemberVerification(member);

  if (verification.verified) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-medium text-emerald-700">
        <BadgeCheck size={11} strokeWidth={1.8} />
        Verified
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[9px] font-medium text-amber-700">
      <CircleDashed size={11} strokeWidth={1.8} />
      {verification.completed}/{verification.total}
    </span>
  );
}

/* =========================================================
   PROVIDER
========================================================= */

function ProviderBadge({ provider }) {
  return (
    <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] font-medium text-gray-500">
      {provider || "Firebase"}
    </span>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function MembersSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1600px] animate-pulse">
      <div className="mb-6">
        <div className="mb-3 h-2.5 w-32 rounded bg-gray-200" />

        <div className="h-7 w-32 rounded-md bg-gray-200" />

        <div className="mt-3 h-3 w-[320px] max-w-full rounded bg-gray-200" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-[130px] rounded-xl border border-gray-200 bg-white"
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="h-[68px] border-b border-gray-100 bg-gray-50" />

        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-[70px] border-b border-gray-100 last:border-0"
          />
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

function MembersPage({ loading = false }) {
  if (loading) {
    return <MembersSkeleton />;
  }

  return <MembersContent />;
}

/* =========================================================
   CONTENT
========================================================= */

function MembersContent() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);

  const [dataLoading, setDataLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [providerFilter, setProviderFilter] = useState("All");

  /* =======================================================
     LOAD REAL MEMBERS
  ======================================================= */

  const loadMembers = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setDataLoading(true);
      }

      setError("");

      const data = await getMembers();

      setMembers(Array.isArray(data) ? data : []);
    } catch (loadError) {
      console.error("Unable to load members:", loadError);

      setError(loadError.message || "Unable to load members.");

      toast.error(loadError.message || "Unable to load members.");
    } finally {
      setDataLoading(false);

      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  /* =======================================================
     VERIFICATION
  ======================================================= */

  const membersWithStatus = useMemo(
    () =>
      members.map((member) => ({
        ...member,

        verification: getMemberVerification(member),
      })),
    [members],
  );

  /* =======================================================
     PROVIDERS
  ======================================================= */

  const providerOptions = useMemo(
    () =>
      [
        ...new Set(
          membersWithStatus
            .map((member) => member.provider_label)
            .filter(Boolean),
        ),
      ].sort((first, second) => first.localeCompare(second)),
    [membersWithStatus],
  );

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredMembers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return membersWithStatus.filter((member) => {
      const searchable = [
        member.member_id,

        member.fullname,

        member.nickname,

        member.username,

        member.email,

        member.mobile_number,

        member.location,

        member.provider_label,

        member.role,

        member.verification.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !keyword || searchable.includes(keyword);

      const matchesStatus =
        statusFilter === "All" || member.verification.status === statusFilter;

      const matchesProvider =
        providerFilter === "All" || member.provider_label === providerFilter;

      return matchesSearch && matchesStatus && matchesProvider;
    });
  }, [membersWithStatus, search, statusFilter, providerFilter]);

  /* =======================================================
     STATS
  ======================================================= */

  const verifiedCount = useMemo(
    () =>
      membersWithStatus.filter((member) => member.verification.verified).length,
    [membersWithStatus],
  );

  const incompleteCount = membersWithStatus.length - verifiedCount;

  /* =======================================================
     CLEAR
  ======================================================= */

  const clearFilters = () => {
    setSearch("");

    setStatusFilter("All");

    setProviderFilter("All");
  };

  const filtersActive =
    Boolean(search) || statusFilter !== "All" || providerFilter !== "All";

  /* =======================================================
     VIEW
  ======================================================= */

  const handleViewMember = (member) => {
    navigate(`/members/${member.member_id}`);
  };

  /* =======================================================
     INITIAL LOADING
  ======================================================= */

  if (dataLoading) {
    return <MembersSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* HEADER */}

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
          },
        ]}
        title="Members"
        description="View real registered members and verification progress."
        actions={
          <button
            type="button"
            onClick={() =>
              loadMembers({
                silent: true,
              })
            }
            disabled={refreshing}
            className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-[10px] font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              strokeWidth={1.7}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        }
      />

      {/* ERROR */}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[10px] text-red-700">
          {error}
        </div>
      )}

      {/* STATS */}

      <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* TOTAL */}

        <article className="rounded-xl border border-black bg-black p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-medium text-white/50">
                Total members
              </p>

              <p className="mt-3 text-[25px] font-semibold tracking-[-0.04em]">
                {membersWithStatus.length}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <UsersRound size={16} strokeWidth={1.5} />
            </div>
          </div>

          <p className="mt-4 text-[9px] text-white/40">
            Registered Firebase members
          </p>
        </article>

        {/* VERIFIED */}

        <article className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-medium text-gray-400">Verified</p>

              <p className="mt-3 text-[25px] font-semibold tracking-[-0.04em] text-gray-950">
                {verifiedCount}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <BadgeCheck size={17} strokeWidth={1.6} />
            </div>
          </div>

          <p className="mt-4 text-[9px] text-gray-400">
            Completed all system requirements
          </p>
        </article>

        {/* INCOMPLETE */}

        <article className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-medium text-gray-400">
                Incomplete
              </p>

              <p className="mt-3 text-[25px] font-semibold tracking-[-0.04em] text-gray-950">
                {incompleteCount}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <CircleDashed size={17} strokeWidth={1.6} />
            </div>
          </div>

          <p className="mt-4 text-[9px] text-gray-400">
            Still completing member requirements
          </p>
        </article>
      </section>

      {/* TABLE */}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* TOOLBAR */}

        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 xl:flex-row xl:items-center xl:justify-between">
          {/* SEARCH */}

          <div className="relative w-full xl:max-w-[380px]">
            <Search
              size={14}
              strokeWidth={1.6}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search member..."
              className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-9 text-[11px] text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={12} strokeWidth={1.6} />
              </button>
            )}
          </div>

          {/* FILTERS */}

          <div className="flex flex-wrap items-center gap-2">
            {/* STATUS */}

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-9 appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-[11px] text-gray-600 outline-none"
              >
                <option value="All">All verification</option>

                {MEMBER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={12}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            {/* PROVIDER */}

            <div className="relative">
              <select
                value={providerFilter}
                onChange={(event) => setProviderFilter(event.target.value)}
                className="h-9 appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-[11px] text-gray-600 outline-none"
              >
                <option value="All">All providers</option>

                {providerOptions.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={12}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            {filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-[10px] font-medium text-gray-500 hover:bg-gray-50 hover:text-black"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* DESKTOP */}

        {filteredMembers.length > 0 && (
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-5 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Member
                  </th>

                  <th className="px-5 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Contact
                  </th>

                  <th className="px-5 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Verification
                  </th>

                  <th className="px-5 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Provider
                  </th>

                  <th className="px-5 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Registered
                  </th>

                  <th className="px-5 py-3 text-right text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50/60"
                  >
                    {/* MEMBER */}

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
                          {getInitials(member.fullname)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-medium text-gray-900">
                            {member.fullname || "Unnamed member"}
                          </p>

                          <p className="mt-1 text-[9px] text-gray-400">
                            {member.username
                              ? `@${member.username}`
                              : "No username"}

                            {" · "}

                            {member.member_id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CONTACT */}

                    <td className="px-5 py-3.5">
                      <p className="max-w-[210px] truncate text-[10px] text-gray-600">
                        {member.email || "—"}
                      </p>

                      <p className="mt-1 text-[9px] text-gray-400">
                        {member.mobile_number || "No mobile number"}
                      </p>
                    </td>

                    {/* VERIFICATION */}

                    <td className="px-5 py-3.5">
                      <VerificationBadge member={member} />

                      <p className="mt-1.5 text-[9px] text-gray-400">
                        {member.verification.percentage}% complete
                      </p>
                    </td>

                    {/* PROVIDER */}

                    <td className="px-5 py-3.5">
                      <ProviderBadge provider={member.provider_label} />
                    </td>

                    {/* DATE */}

                    <td className="whitespace-nowrap px-5 py-3.5 text-[10px] text-gray-500">
                      {formatDateTime(member.registered_at)}
                    </td>

                    {/* ACTION */}

                    <td className="px-5 py-3.5">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleViewMember(member)}
                          className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-[10px] font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-black"
                        >
                          <Eye size={12} strokeWidth={1.7} />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MOBILE */}

        {filteredMembers.length > 0 && (
          <div className="divide-y divide-gray-100 md:hidden">
            {filteredMembers.map((member) => (
              <article key={member.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
                    {getInitials(member.fullname)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-semibold text-gray-900">
                          {member.fullname || "Unnamed member"}
                        </p>

                        <p className="mt-1 truncate text-[9px] text-gray-400">
                          {member.username
                            ? `@${member.username}`
                            : "No username"}
                        </p>
                      </div>

                      <VerificationBadge member={member} />
                    </div>

                    <p className="mt-3 truncate text-[10px] text-gray-500">
                      {member.email || "No email"}
                    </p>

                    <div className="mt-3 flex items-end justify-between gap-3">
                      <div>
                        <ProviderBadge provider={member.provider_label} />

                        <p className="mt-2 text-[9px] text-gray-400">
                          {member.verification.completed}/
                          {member.verification.total} requirements
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleViewMember(member)}
                        className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[10px] font-medium text-gray-600 hover:bg-gray-50 hover:text-black"
                      >
                        <Eye size={12} strokeWidth={1.7} />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* EMPTY */}

        {filteredMembers.length === 0 && (
          <div className="flex min-h-[320px] items-center justify-center p-6">
            <div className="max-w-[300px] text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                <UserRoundPlus size={18} strokeWidth={1.5} />
              </div>

              <p className="mt-4 text-[12px] font-semibold text-gray-900">
                No members found
              </p>

              <p className="mt-1.5 text-[10px] leading-5 text-gray-400">
                {members.length === 0
                  ? "There are no registered members in the database yet."
                  : "No members match your current search or filters."}
              </p>
            </div>
          </div>
        )}

        {/* FOOTER */}

        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/40 px-4 py-3">
          <p className="text-[9px] text-gray-400">
            Showing {filteredMembers.length} of {membersWithStatus.length}{" "}
            members
          </p>

          <p className="hidden text-[9px] text-gray-400 sm:block">
            Live Laravel data
          </p>
        </div>
      </section>
    </div>
  );
}

export default MembersPage;
