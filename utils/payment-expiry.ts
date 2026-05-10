// --- Validation & payload -----------------------------------------------

/** Parse MM/YY into numeric month (1-12) and full year (e.g. 2027). */
export const parseExpiryMmYy = (
  expiry: string,
): { month: number; year: number } | null => {
  const trimmed = expiry.trim();
  const match = /^(\d{2})\/(\d{2})$/.exec(trimmed);
  if (!match) return null;
  const mm = Number.parseInt(match[1], 10);
  const yy = Number.parseInt(match[2], 10);
  if (Number.isNaN(mm) || Number.isNaN(yy)) return null;
  if (mm < 1 || mm > 12) return null;
  const year = yy <= 69 ? 2000 + yy : 1900 + yy;
  return { month: mm, year };
};

/** True if expiry (MM/YY) is strictly before the current calendar month. */
export const isExpiryInPast = (
  expiry: string,
  now: Date = new Date(),
): boolean => {
  const parsed = parseExpiryMmYy(expiry);
  if (!parsed) return true;
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (parsed.year < currentYear) return true;
  if (parsed.year > currentYear) return false;
  return parsed.month < currentMonth;
};

export const splitExpiryForPayload = (
  expiry: string,
): { expiryMonth: string; expiryYear: string } | null => {
  const parsed = parseExpiryMmYy(expiry);
  if (!parsed) return null;
  return {
    expiryMonth: String(parsed.month).padStart(2, "0"),
    expiryYear: String(parsed.year).slice(-2),
  };
};

// --- Keystroke mask -------------------------------------------------------

/** Normalize raw expiry keystrokes to MM/YY while typing. */
export const formatExpiryInput = (raw: string): string => {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
};
