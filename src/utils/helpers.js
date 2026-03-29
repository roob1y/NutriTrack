export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/**
 * Returns ISO week key 'YYYY-WW' for a given date string (or today).
 */
export function getWeekKey(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  // Shift so Monday = day 0
  const day = (d.getDay() + 6) % 7;
  const thursday = new Date(d);
  thursday.setDate(d.getDate() - day + 3);
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((thursday - yearStart) / 86400000 + 1) / 7);
  return `${thursday.getFullYear()}-${String(weekNum).padStart(2, '0')}`;
}

/**
 * Returns array of 7 date strings Mon–Sun for the week containing dateStr.
 */
export function getWeekDates(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  const day = (d.getDay() + 6) % 7; // Mon = 0
  const monday = new Date(d);
  monday.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date.toISOString().slice(0, 10);
  });
}

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const PLAN_SLOTS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-workout', 'Post-workout'];

export function sumMacros(meals = []) {
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (Number(m.calories) || 0),
      protein: acc.protein + (Number(m.protein) || 0),
      carbs: acc.carbs + (Number(m.carbs) || 0),
      fat: acc.fat + (Number(m.fat) || 0),
      fibre: acc.fibre + (Number(m.fibre) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 },
  );
}

export function pct(value, target) {
  if (!target) return 0;
  return Math.min(100, Math.round((value / target) * 100));
}

export function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}
