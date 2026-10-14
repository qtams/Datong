/* =========================================================
   GENERATE DEFAULT USER PASSWORD

   Format:
   DATONG + MM + DD + YYYY

   Example:
   Birthday: 2002-09-12
   Password: DATONG09122002
========================================================= */

export function generateDefaultPassword(birthday) {
  if (!birthday) {
    return "";
  }

  const parts = birthday.split("-");

  if (parts.length !== 3) {
    return "";
  }

  const [year, month, day] = parts;

  if (!year || !month || !day) {
    return "";
  }

  return `DATONG${month}${day}${year}`;
}
