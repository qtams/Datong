import { Eye, ShieldCheck, UserRound, WalletCards } from "lucide-react";

import { USER_ROLE_OPTIONS } from "../../data/usersData";

import ResponsiveSelect from "./ResponsiveSelect";

/* =========================================================
   ROLE ICONS
========================================================= */

const ROLE_ICONS = {
  Admin: ShieldCheck,
  Finance: WalletCards,
  Staff: UserRound,
  Viewer: Eye,
};

/* =========================================================
   ROLE OPTIONS
========================================================= */

const ROLE_OPTIONS = USER_ROLE_OPTIONS.map((role) => ({
  ...role,

  icon: ROLE_ICONS[role.value] || ShieldCheck,
}));

/* =========================================================
   ROLE SELECT
========================================================= */

function RoleSelect({
  value,
  onChange,
  error,
  label = "Role",
  required = true,
  disabled = false,
}) {
  return (
    <ResponsiveSelect
      label={label}
      value={value}
      options={ROLE_OPTIONS}
      onChange={onChange}
      error={error}
      required={required}
      disabled={disabled}
      placeholder="Select role"
      sheetDescription="Choose the user's workspace access level."
    />
  );
}

export default RoleSelect;
