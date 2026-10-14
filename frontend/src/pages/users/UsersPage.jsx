import { useEffect, useMemo, useState } from "react";

import {
  AtSign,
  Cake,
  ChevronDown,
  Mail,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";

import toast from "react-hot-toast";

import PageHeader from "../../components/PageHeader";

import UserFormModal from "../../components/modals/UserFormModal";

import { UsersSkeleton } from "../../components/SkeletonLoader";

import { USER_ROLES } from "../../data/usersData";

import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../../services/usersApi";

import { confirmDelete } from "../../utils/sweetAlert";

/* =========================================================
   INITIALS
========================================================= */

function getInitials(fullname) {
  if (!fullname) {
    return "U";
  }

  return fullname
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase();
}

/* =========================================================
   DATE FORMATTERS
========================================================= */

function formatCreatedDate(value) {
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
  }).format(date);
}

function formatBirthday(value) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatLastLogin(value) {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Never";
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
   ROLE BADGE
========================================================= */

function RoleBadge({ role }) {
  const isAdmin = role === "Admin";

  return (
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
          isAdmin
            ? "border-black bg-black text-white"
            : "border-gray-200 bg-gray-50 text-gray-600"
        }
      `}
    >
      <ShieldCheck size={10} strokeWidth={1.7} />

      {role}
    </span>
  );
}

/* =========================================================
   USERS PAGE
========================================================= */

function UsersPage({ loading = false }) {
  if (loading) {
    return <UsersSkeleton />;
  }

  return <UsersContent />;
}

/* =========================================================
   USERS CONTENT
========================================================= */

function UsersContent() {
  const [users, setUsers] = useState([]);

  const [usersLoading, setUsersLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [savingUser, setSavingUser] = useState(false);

  /* =======================================================
     LOAD USERS
  ======================================================= */

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        setUsersLoading(true);

        const data = await getUsers();

        if (active) {
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Unable to load users:", error);

        if (active) {
          toast.error(error.message || "Unable to load users.");
        }
      } finally {
        if (active) {
          setUsersLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      active = false;
    };
  }, []);

  /* =======================================================
     FILTER USERS
  ======================================================= */

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      const searchable = [
        user.fullname,
        user.nickname,
        user.username,
        user.email,
        user.role,
        user.birthday,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !keyword || searchable.includes(keyword);

      const matchesRole = roleFilter === "All" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  /* =======================================================
     STATS
  ======================================================= */

  const adminCount = useMemo(
    () => users.filter((user) => user.role === "Admin").length,
    [users],
  );

  const loggedInCount = useMemo(
    () => users.filter((user) => Boolean(user.last_login)).length,
    [users],
  );

  /* =======================================================
     ADD USER
  ======================================================= */

  const handleAddUser = () => {
    setSelectedUser(null);

    setModalOpen(true);
  };

  /* =======================================================
     EDIT USER
  ======================================================= */

  const handleEditUser = (user) => {
    setSelectedUser(user);

    setModalOpen(true);
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const handleCloseModal = () => {
    if (savingUser) {
      return;
    }

    setModalOpen(false);

    setSelectedUser(null);
  };

  /* =======================================================
     CREATE / UPDATE
  ======================================================= */

  const handleSaveUser = async (values) => {
    if (savingUser) {
      return false;
    }

    setSavingUser(true);

    try {
      /* ===============================================
           UPDATE
        =============================================== */

      if (selectedUser) {
        const response = await updateUser(selectedUser.id, values);

        const updatedUser = response?.data;

        if (updatedUser) {
          setUsers((current) =>
            current.map((user) =>
              user.id === updatedUser.id ? updatedUser : user,
            ),
          );
        }

        setModalOpen(false);

        setSelectedUser(null);

        toast.success(response?.message || "User updated successfully.");

        return true;
      }

      /* ===============================================
           CREATE
        =============================================== */

      const response = await createUser(values);

      const newUser = response?.data;

      if (newUser) {
        setUsers((current) => [newUser, ...current]);
      }

      setModalOpen(false);

      setSelectedUser(null);

      toast.success(response?.message || "User created successfully.");

      return true;
    } catch (error) {
      console.error("Unable to save user:", error);

      toast.error(error.message || "Unable to save user.");

      return false;
    } finally {
      setSavingUser(false);
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDeleteUser = async (user) => {
    const confirmed = await confirmDelete({
      title: "Delete user?",

      text: `Are you sure you want to delete ${user.fullname}? This action cannot be undone.`,

      confirmText: "Delete user",

      cancelText: "Cancel",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteUser(user.id);

      setUsers((current) => current.filter((item) => item.id !== user.id));

      toast.success("User deleted successfully.");
    } catch (error) {
      console.error("Unable to delete user:", error);

      toast.error(error.message || "Unable to delete user.");
    }
  };

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const handleClearFilters = () => {
    setSearch("");

    setRoleFilter("All");
  };

  /* =======================================================
     API LOADING
  ======================================================= */

  if (usersLoading) {
    return <UsersSkeleton />;
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1600px]">
        {/* =================================================
            PAGE HEADER
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
              label: "Users",
            },
          ]}
          title="Users"
          description="Manage users, login credentials and workspace access."
          actions={
            <button
              type="button"
              onClick={handleAddUser}
              className="
                flex
                h-9
                items-center
                gap-2
                rounded-lg
                bg-black
                px-3.5
                text-[11px]
                font-medium
                text-white
                transition-colors
                hover:bg-gray-800
              "
            >
              <UserPlus size={14} strokeWidth={1.7} />
              Add user
            </button>
          }
        />

        {/* =================================================
            STATS
        ================================================= */}

        <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* TOTAL USERS */}

          <article className="rounded-xl border border-black bg-black p-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-medium text-white/50">
                  Total users
                </p>

                <p className="mt-3 text-[25px] font-semibold tracking-[-0.04em]">
                  {users.length}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                <UsersRound size={16} strokeWidth={1.5} />
              </div>
            </div>

            <p className="mt-4 text-[9px] text-white/40">
              Registered workspace users
            </p>
          </article>

          {/* ADMINS */}

          <article className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-medium text-gray-400">
                  Administrators
                </p>

                <p className="mt-3 text-[25px] font-semibold tracking-[-0.04em] text-gray-950">
                  {adminCount}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <ShieldCheck size={16} strokeWidth={1.5} />
              </div>
            </div>

            <p className="mt-4 text-[9px] text-gray-400">
              Users with admin access
            </p>
          </article>

          {/* LOGGED IN */}

          <article className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-medium text-gray-400">
                  Logged in
                </p>

                <p className="mt-3 text-[25px] font-semibold tracking-[-0.04em] text-gray-950">
                  {loggedInCount}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <UsersRound size={16} strokeWidth={1.5} />
              </div>
            </div>

            <p className="mt-4 text-[9px] text-gray-400">
              Users who have logged in before
            </p>
          </article>
        </section>

        {/* =================================================
            TABLE
        ================================================= */}

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {/* TOOLBAR */}

          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            {/* SEARCH */}

            <div className="relative w-full sm:max-w-[360px]">
              <Search
                size={14}
                strokeWidth={1.6}
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, username or email..."
                className="
                  h-9
                  w-full
                  rounded-lg
                  border
                  border-gray-200
                  bg-gray-50
                  pl-9
                  pr-9
                  text-[11px]
                  text-gray-800
                  outline-none
                  transition-all
                  placeholder:text-gray-400
                  focus:border-gray-300
                  focus:bg-white
                  focus:ring-2
                  focus:ring-gray-100
                "
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="
                    absolute
                    right-2
                    top-1/2
                    flex
                    h-6
                    w-6
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-md
                    text-gray-400
                    hover:bg-gray-100
                    hover:text-gray-800
                  "
                >
                  <X size={12} strokeWidth={1.6} />
                </button>
              )}
            </div>

            {/* ROLE FILTER */}

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                  className="
                    h-9
                    appearance-none
                    rounded-lg
                    border
                    border-gray-200
                    bg-white
                    pl-3
                    pr-8
                    text-[11px]
                    font-medium
                    text-gray-600
                    outline-none
                    hover:border-gray-300
                    focus:border-gray-400
                  "
                >
                  <option value="All">All roles</option>

                  {USER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={12}
                  strokeWidth={1.6}
                  className="
                    pointer-events-none
                    absolute
                    right-2.5
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                />
              </div>

              {(search || roleFilter !== "All") && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="
                    h-9
                    rounded-lg
                    border
                    border-gray-200
                    bg-white
                    px-3
                    text-[10px]
                    font-medium
                    text-gray-500
                    hover:bg-gray-50
                    hover:text-black
                  "
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* =================================================
              DESKTOP TABLE
          ================================================= */}

          {filteredUsers.length > 0 && (
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1180px] border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60 text-left">
                    <th className="px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                      User
                    </th>

                    <th className="px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                      Username
                    </th>

                    <th className="px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                      Email
                    </th>

                    <th className="px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                      Birthday
                    </th>

                    <th className="px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                      Role
                    </th>

                    <th className="px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                      Created
                    </th>

                    <th className="px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                      Last login
                    </th>

                    <th className="w-[100px] px-5 py-3 text-right text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="
                          border-b
                          border-gray-100
                          transition-colors
                          last:border-0
                          hover:bg-gray-50/60
                        "
                    >
                      {/* USER */}

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
                            {getInitials(user.fullname)}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[190px] truncate text-[11px] font-medium text-gray-900">
                              {user.fullname}
                            </p>

                            <p className="mt-0.5 text-[9px] text-gray-400">
                              {user.nickname ? user.nickname : "No nickname"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* USERNAME */}

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 text-[10px] text-gray-600">
                          <AtSign
                            size={12}
                            strokeWidth={1.5}
                            className="shrink-0 text-gray-300"
                          />

                          <span className="max-w-[150px] truncate font-medium">
                            {user.username || "—"}
                          </span>
                        </div>
                      </td>

                      {/* EMAIL */}

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          <Mail
                            size={12}
                            strokeWidth={1.5}
                            className="shrink-0 text-gray-300"
                          />

                          <span className="max-w-[200px] truncate">
                            {user.email}
                          </span>
                        </div>
                      </td>

                      {/* BIRTHDAY */}

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          <Cake
                            size={12}
                            strokeWidth={1.5}
                            className="shrink-0 text-gray-300"
                          />

                          {formatBirthday(user.birthday)}
                        </div>
                      </td>

                      {/* ROLE */}

                      <td className="px-5 py-3.5">
                        <RoleBadge role={user.role} />
                      </td>

                      {/* CREATED */}

                      <td className="px-5 py-3.5 text-[10px] text-gray-500">
                        {formatCreatedDate(user.created_at)}
                      </td>

                      {/* LAST LOGIN */}

                      <td className="px-5 py-3.5 text-[10px] text-gray-500">
                        {formatLastLogin(user.last_login)}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditUser(user)}
                            aria-label={`Edit ${user.fullname}`}
                            className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                text-gray-400
                                transition-colors
                                hover:bg-gray-100
                                hover:text-gray-900
                              "
                          >
                            <Pencil size={13} strokeWidth={1.6} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            aria-label={`Delete ${user.fullname}`}
                            className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                text-gray-400
                                transition-colors
                                hover:bg-red-50
                                hover:text-red-500
                              "
                          >
                            <Trash2 size={13} strokeWidth={1.6} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* =================================================
              MOBILE
          ================================================= */}

          {filteredUsers.length > 0 && (
            <div className="divide-y divide-gray-100 md:hidden">
              {filteredUsers.map((user) => (
                <article key={user.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
                        {getInitials(user.fullname)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium text-gray-900">
                          {user.fullname}
                        </p>

                        <div className="mt-1 flex items-center gap-1 text-[9px] text-gray-500">
                          <AtSign size={9} />

                          <span className="truncate font-medium">
                            {user.username || "—"}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-[9px] text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <RoleBadge role={user.role} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3">
                    <div>
                      <p className="text-[8px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                        Birthday
                      </p>

                      <p className="mt-1 text-[10px] text-gray-600">
                        {formatBirthday(user.birthday)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[8px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                        Created
                      </p>

                      <p className="mt-1 text-[10px] text-gray-600">
                        {formatCreatedDate(user.created_at)}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-[8px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                        Last login
                      </p>

                      <p className="mt-1 text-[10px] text-gray-600">
                        {formatLastLogin(user.last_login)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditUser(user)}
                      className="
                          flex
                          h-8
                          items-center
                          gap-1.5
                          rounded-lg
                          border
                          border-gray-200
                          bg-white
                          px-3
                          text-[10px]
                          font-medium
                          text-gray-600
                          hover:bg-gray-50
                          hover:text-black
                        "
                    >
                      <Pencil size={12} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteUser(user)}
                      className="
                          flex
                          h-8
                          items-center
                          gap-1.5
                          rounded-lg
                          border
                          border-red-100
                          bg-white
                          px-3
                          text-[10px]
                          font-medium
                          text-red-500
                          hover:bg-red-50
                        "
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {filteredUsers.length === 0 && (
            <div className="flex min-h-[300px] items-center justify-center p-6">
              <div className="max-w-[280px] text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                  <UsersRound size={18} />
                </div>

                <p className="mt-3 text-[12px] font-semibold text-gray-900">
                  No users found
                </p>

                <p className="mt-1 text-[10px] leading-4 text-gray-400">
                  No users match your current search or role filter.
                </p>
              </div>
            </div>
          )}

          {/* =================================================
              FOOTER
          ================================================= */}

          {filteredUsers.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/40 px-5 py-3">
              <p className="text-[9px] text-gray-400">
                Showing{" "}
                <span className="font-medium text-gray-600">
                  {filteredUsers.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-600">
                  {users.length}
                </span>{" "}
                users
              </p>

              <p className="hidden text-[9px] text-gray-400 sm:block">
                Datong user management
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ===================================================
          USER FORM
      =================================================== */}

      <UserFormModal
        open={modalOpen}
        user={selectedUser}
        onClose={handleCloseModal}
        onSubmit={handleSaveUser}
      />
    </>
  );
}

export default UsersPage;
