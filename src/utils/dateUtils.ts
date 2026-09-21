// Utility to calculate N-th business day of a month (excluding weekends: Sat/Sun)
export const getNthBusinessDay = (year: number, month: number, n: number = 4): string => {
  let businessDayCount = 0;
  const date = new Date(year, month - 1, 1);

  while (date.getMonth() === month - 1) {
    const dayOfWeek = date.getDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDayCount++;
      if (businessDayCount === n) {
        break;
      }
    }
    date.setDate(date.getDate() + 1);
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Calculate fixed day date (e.g. 27th of month)
export const getFixedDayOfMonth = (year: number, month: number, day: number = 27): string => {
  const yyyy = year;
  const mm = String(month).padStart(2, '0');
  // Handle months with fewer days (e.g., Feb)
  const maxDays = new Date(year, month, 0).getDate();
  const validDay = Math.min(day, maxDays);
  const dd = String(validDay).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Safely adds N months to a date string (YYYY-MM-DD) without day overflow/rollover into subsequent months.
 * For example:
 * - addMonthsToDate('2026-01-31', 1) => '2026-02-28'
 * - addMonthsToDate('2026-01-31', 2) => '2026-03-31'
 */
export const addMonthsToDate = (dateStr: string, monthsToAdd: number): string => {
  if (!dateStr || !dateStr.includes('-')) {
    dateStr = new Date().toISOString().split('T')[0];
  }
  const parts = dateStr.split('-');
  let year = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10); // 1-12
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    const today = new Date();
    year = today.getFullYear();
    month = today.getMonth() + 1;
  }

  month += monthsToAdd;

  year += Math.floor((month - 1) / 12);
  month = ((month - 1) % 12) + 1;
  if (month <= 0) {
    month += 12;
  }

  const maxDays = new Date(year, month, 0).getDate();
  const validDay = Math.min(day || 1, maxDays);

  const yyyy = String(year).padStart(4, '0');
  const mm = String(month).padStart(2, '0');
  const dd = String(validDay).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
};

