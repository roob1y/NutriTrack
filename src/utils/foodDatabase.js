const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY;
const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';
const OFF_PROXY = import.meta.env.VITE_OFF_PROXY_URL;
console.log('OFF_PROXY:', import.meta.env.VITE_OFF_PROXY_URL);

// ── Normalise USDA result ─────────────────────────────────────
function normaliseUSDA(food) {
  const nutrients = food.foodNutrients || [];
  console.log(
    'raw food:',
    food.description,
    'servingSize:',
    food.servingSize,
    'servingSizeUnit:',
    food.servingSizeUnit,
  );

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
    servingSize: 100, // USDA nutrients are always per 100g
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
async function searchUSDA(query) {
  const res = await fetch(
    `${USDA_BASE}/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${USDA_API_KEY}`,
  );
  if (!res.ok) throw new Error('USDA search failed');
  const data = await res.json();
  return (data.foods || []).map(normaliseUSDA).filter((f) => f.name && f.calories > 0);
}

// ── Search Open Food Facts ────────────────────────────────────

async function searchOFF(query) {
  const res = await fetch(offUrl, {
    headers: { 'User-Agent': 'NutriTrack - personal health app' },
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return new Response(JSON.stringify({ products: [] }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
  const data = await res.json();
  console.log(
    'OFF results:',
    off.map((r) => r.name),
  );
  return (data.products || []).map(normaliseOFF).filter((f) => f.name && f.calories > 0);
}

// ── Main search — USDA first, OFF fallback ────────────────────
export async function searchFoodDatabase(query) {
  if (!query.trim()) return [];

  const [usdaResults, offResults] = await Promise.allSettled([searchUSDA(query), searchOFF(query)]);

  const usda = usdaResults.status === 'fulfilled' ? usdaResults.value : [];
  const off = offResults.status === 'fulfilled' ? offResults.value : [];

  // Check if USDA results are relevant — do any contain all query words?
  const queryWords = query
    .toLowerCase()
    .split(' ')
    .filter((w) => w.length > 2);
  const usdaRelevant = usda.filter((r) =>
    queryWords.every((word) => r.name.toLowerCase().includes(word)),
  );

  let combined;
  if (usdaRelevant.length === 0 && off.length > 0) {
    // USDA has no relevant results — OFF first
    combined = [...off];
    usda.forEach((r) => {
      if (!combined.some((c) => c.name.toLowerCase() === r.name.toLowerCase())) {
        combined.push(r);
      }
    });
  } else {
    // USDA has relevant results — USDA first
    combined = [...usda];
    off.forEach((r) => {
      if (!combined.some((c) => c.name.toLowerCase() === r.name.toLowerCase())) {
        combined.push(r);
      }
    });
  }

  return combined.slice(0, 10);
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
