export function getDaysInMonth(year, month) {
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

export function parseTargetDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (
    year < 1 || month < 1 || month > 12 ||
    day < 1 || day > getDaysInMonth(year, month)
  ) return null;
  return { year, month, day };
}

export function updateTargetDateParts(parts, changes) {
  const next = { ...parts, ...changes };
  return { ...next, day: Math.min(next.day, getDaysInMonth(next.year, next.month)) };
}

export function targetDateValue({ year, month, day }) {
  return [String(year).padStart(4, "0"), String(month).padStart(2, "0"), String(day).padStart(2, "0")].join("-");
}
