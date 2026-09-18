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
