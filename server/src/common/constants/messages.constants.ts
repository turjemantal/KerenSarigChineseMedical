const HEB_MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

function formatHebrewDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${day} ב${HEB_MONTHS[month - 1]} ${year}`;
}

export const otpParams = (code: string): string[] => [code];

export const bookingParams = (name: string, date: string, time: string): string[] =>
  [name.split(' ')[0], formatHebrewDate(date), time];

export const reminderParams = (time: string): string[] => [time];
