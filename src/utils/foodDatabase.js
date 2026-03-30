const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY;
const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';
const OFF_PROXY = import.meta.env.VITE_OFF_PROXY_URL;

const CACHE_KEY = 'nutritrack_food_cache';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

// ── Cache helpers ─────────────────────────────────────────────
function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full — clear old entries
    localStorage.removeItem(CACHE_KEY);
  }
}

function getCached(query) {
  try {
    const cache = readCache();
    const key = query.toLowerCase().trim();
    const entry = cache[key];
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      // Expired — remove it
      delete cache[key];
      writeCache(cache);
      return null;
    }
    // Refresh timestamp on access
    cache[key].timestamp = Date.now();
    writeCache(cache);
    return entry.results;
  } catch {
    return null;
  }
}
// ── Normalise USDA result ─────────────────────────────────────
function normaliseUSDA(food) {
  const nutrients = food.foodNutrients || [];

  function getNutrient(...ids) {
    for (const id of ids) {
      const n = nutrients.find((n) => n.nutrientId === id || n.nutrientNumber === String(id));
      if (n && (n.value || n.amount)) return Math.round((n.value || n.amount) * 10) / 10;
    }
    return 0;
  }

  return {
    name: food.description || food.lowercaseDescription || '',
    brand: food.brandOwner || food.brandName || '',
    calories: getNutrient(1008, '208'),
    protein: getNutrient(1003, '203'),
    carbs: getNutrient(1005, '205'),
    fat: getNutrient(1004, '204'),
    fibre: getNutrient(1079, '291'),
    servingSize: 100,
    servingUnit: 'g',
    source: 'USDA',
  };
}

// ── Normalise Open Food Facts result ─────────────────────────
function normaliseOFF(product) {
  const n = product.nutriments || {};
  return {
    name: product.product_name || product.product_name_en || '',
    brand: product.brands || '',
    calories: Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
    protein: Math.round((n.proteins_100g || 0) * 10) / 10,
    carbs: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
    fat: Math.round((n.fat_100g || 0) * 10) / 10,
    fibre: Math.round((n.fiber_100g || 0) * 10) / 10,
    servingSize: 100,
    servingUnit: 'g',
    source: 'Open Food Facts',
  };
}

// ── Search USDA ───────────────────────────────────────────────
export async function searchUSDA(query) {
  const cacheKey = `usda_${query}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await fetch(
    `${USDA_BASE}/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${USDA_API_KEY}`,
  );
  if (!res.ok) throw new Error('USDA search failed');
  const data = await res.json();
  const results = (data.foods || []).map(normaliseUSDA).filter((f) => f.name && f.calories > 0);

  setCached(cacheKey, results);
  return results;
}

// ── Search Open Food Facts ────────────────────────────────────
export async function searchOFF(query) {
  const cacheKey = `off_${query}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${OFF_PROXY}?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('OFF search failed');
  const data = await res.json();
  const results = (data.products || []).map(normaliseOFF).filter((f) => f.name && f.calories > 0);

  setCached(cacheKey, results);
  return results;
}

// ── Scale macros to a given amount ───────────────────────────
export function scaleMacros(food, amount) {
  const scale = amount / (food.servingSize || 100);
  return {
    calories: Math.round(food.calories * scale),
    protein: Math.round(food.protein * scale * 10) / 10,
    carbs: Math.round(food.carbs * scale * 10) / 10,
    fat: Math.round(food.fat * scale * 10) / 10,
    fibre: Math.round(food.fibre * scale * 10) / 10,
  };
}
