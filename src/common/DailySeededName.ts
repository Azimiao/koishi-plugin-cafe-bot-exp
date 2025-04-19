export function DailySeededName(uid) {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const beijing = new Date(utc + 8 * 60 * 60000);

  const dateStr = beijing.toISOString().slice(0, 10); // 'YYYY-MM-DD'
  
  const year = beijing.getFullYear();
  const month = beijing.getMonth() + 1;
  const day = beijing.getDate();
  const pad = n => n.toString().padStart(2, '0');

  const fullStr = `${uid}_${year}-${pad(month)}-${pad(day)}`;
  return fullStr;
}