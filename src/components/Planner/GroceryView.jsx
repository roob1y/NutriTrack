import React, { useState } from 'react';
import useStore from '../../store/useStore';
import { getWeekKey, getWeekDates, showToast } from '../../utils/helpers';

// ── Category definitions ──────────────────────────────────────
const CATEGORIES = [
  {
    label: 'Vegetables',
    keywords: [
      'carrot',
      'broccoli',
      'spinach',
      'kale',
      'onion',
      'garlic',
      'tomato',
      'pepper',
      'courgette',
      'zucchini',
      'cucumber',
      'lettuce',
      'cabbage',
      'cauliflower',
      'mushroom',
      'potato',
      'sweet potato',
      'aubergine',
      'eggplant',
      'celery',
      'leek',
      'beetroot',
      'pea',
      'corn',
      'asparagus',
      'squash',
      'pumpkin',
    ],
  },
  {
    label: 'Fruits',
    keywords: [
      'apple',
      'banana',
      'orange',
      'lemon',
      'lime',
      'mango',
      'pineapple',
      'strawberry',
      'blueberry',
      'raspberry',
      'grape',
      'melon',
      'watermelon',
      'peach',
      'pear',
      'cherry',
      'avocado',
      'coconut',
      'kiwi',
      'fig',
      'date',
      'berry',
    ],
  },
  {
    label: 'Legumes & Pulses',
    keywords: [
      'lentil',
      'chickpea',
      'black bean',
      'kidney bean',
      'cannellini',
      'butter bean',
      'edamame',
      'soya',
      'soy',
      'mung bean',
      'split pea',
      'dal',
      'dhal',
      'hummus',
    ],
  },
  {
    label: 'Grains & Cereals',
    keywords: [
      'rice',
      'oat',
      'pasta',
      'bread',
      'flour',
      'wheat',
      'quinoa',
      'barley',
      'couscous',
      'noodle',
      'tortilla',
      'wrap',
      'bagel',
      'cereal',
      'granola',
      'cracker',
      'bulgur',
      'semolina',
      'polenta',
    ],
  },
  {
    label: 'Nuts & Seeds',
    keywords: [
      'almond',
      'cashew',
      'walnut',
      'peanut',
      'pistachio',
      'pecan',
      'hazelnut',
      'nut butter',
      'peanut butter',
      'almond butter',
      'chia',
      'flax',
      'hemp',
      'sunflower seed',
      'pumpkin seed',
      'sesame',
      'tahini',
    ],
  },
  {
    label: 'Tofu & Meat Alternatives',
    keywords: [
      'tofu',
      'tempeh',
      'seitan',
      'quorn',
      'beyond',
      'impossible',
      'meat alternative',
      'vegan mince',
      'vegan sausage',
      'vegan burger',
      'jackfruit',
      'textured vegetable protein',
      'tvp',
    ],
  },
  {
    label: 'Dairy & Alternatives',
    keywords: [
      'oat milk',
      'almond milk',
      'soy milk',
      'coconut milk',
      'rice milk',
      'vegan cheese',
      'vegan butter',
      'vegan yogurt',
      'nutritional yeast',
      'milk',
      'cheese',
      'yogurt',
      'butter',
      'cream',
      'egg',
    ],
  },
  {
    label: 'Condiments & Sauces',
    keywords: [
      'soy sauce',
      'tamari',
      'hot sauce',
      'ketchup',
      'mustard',
      'vinegar',
      'miso',
      'sriracha',
      'bbq sauce',
      'worcestershire',
      'fish sauce',
      'oyster sauce',
      'hoisin',
      'teriyaki',
      'mayo',
      'salsa',
      'pesto',
    ],
  },
  {
    label: 'Oils & Fats',
    keywords: [
      'olive oil',
      'coconut oil',
      'vegetable oil',
      'sunflower oil',
      'rapeseed oil',
      'sesame oil',
      'oil',
      'fat',
      'spread',
      'margarine',
    ],
  },
  {
    label: 'Tins & Jars',
    keywords: [
      'tinned',
      'canned',
      'tin of',
      'can of',
      'jar of',
      'passata',
      'chopped tomato',
      'coconut cream',
      'stock',
      'broth',
    ],
  },
  {
    label: 'Herbs & Spices',
    keywords: [
      'salt',
      'pepper',
      'cumin',
      'coriander',
      'turmeric',
      'paprika',
      'chilli',
      'cinnamon',
      'ginger',
      'garlic powder',
      'onion powder',
      'oregano',
      'basil',
      'thyme',
      'rosemary',
      'bay leaf',
      'cardamom',
      'clove',
      'nutmeg',
      'spice',
      'herb',
      'seasoning',
    ],
  },
  {
    label: 'Other',
    keywords: [],
  },
];

function categorise(name) {
  const lower = name.toLowerCase();
  for (const cat of CATEGORIES) {
    if (
      cat.keywords.some((kw) => {
        const regex = new RegExp(`\\b${kw}s?\\b`);
        return regex.test(lower);
      })
    ) {
      return cat.label;
    }
  }
  return 'Other';
}
// ── Generate grocery list from week plan ─────────────────────
function generateFromPlan(weekPlan, recipes, weekKey) {
  const plan = weekPlan[weekKey] || {};
  const aggregated = {};

  Object.values(plan).forEach((daySlots) => {
    Object.values(daySlots).forEach((recipeId) => {
      const recipe = recipes.find((r) => r.id === recipeId);
      if (!recipe?.ingredients) return;
      recipe.ingredients.forEach((ing) => {
        if (!ing.name) return;
        const key = ing.name.toLowerCase().trim();
        if (aggregated[key]) {
          // Same unit — add amounts, otherwise just note it exists
          if (aggregated[key].unit === ing.unit) {
            aggregated[key].amount =
              (Number(aggregated[key].amount) || 0) + (Number(ing.amount) || 0);
          }
        } else {
          aggregated[key] = {
            id: Date.now().toString() + Math.random(),
            name: ing.name,
            amount: Number(ing.amount) || 0,
            unit: ing.unit || '',
            checked: false,
            category: categorise(ing.name),
          };
        }
      });
    });
  });

  return Object.values(aggregated);
}

// ── Add item form ─────────────────────────────────────────────
function AddItemForm({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('g');

  function handleAdd() {
    if (!name.trim()) return;
    onAdd({
      id: Date.now().toString(),
      name: name.trim(),
      amount: Number(amount) || 0,
      unit,
      checked: false,
      category: categorise(name),
    });
    showToast('Item added ✓');
    onClose();
  }

  return (
    <div>
      <div className="section-title" style={{ marginTop: '4px' }}>
        ADD ITEM
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <input
          className="input"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            className="input"
            type="number"
            inputMode="decimal"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ flex: 1 }}
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              padding: '12px 8px',
              width: '80px',
            }}
          >
            {['g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'cup', 'pc'].map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>
      <button className="btn-primary" onClick={handleAdd} style={{ marginBottom: '10px' }}>
        ADD TO LIST
      </button>
      <button className="btn-secondary" onClick={onClose}>
        CANCEL
      </button>
    </div>
  );
}

// ── Main grocery view ─────────────────────────────────────────
export default function GroceryView() {
  const groceryList = useStore((s) => s.groceryList);
  const setGroceryList = useStore((s) => s.setGroceryList);
  const toggleGroceryItem = useStore((s) => s.toggleGroceryItem);
  const deleteGroceryItem = useStore((s) => s.deleteGroceryItem);
  const clearCheckedGrocery = useStore((s) => s.clearCheckedGrocery);
  const weekPlan = useStore((s) => s.weekPlan);
  const recipes = useStore((s) => s.recipes);

  const [adding, setAdding] = useState(false);
  const [addClosing, setAddClosing] = useState(false);

  const weekKey = getWeekKey();
  const checkedCount = groceryList.filter((i) => i.checked).length;

  function handleGenerate() {
    const generated = generateFromPlan(weekPlan, recipes, weekKey);
    if (generated.length === 0) {
      showToast("No ingredients found in this week's plan");
      return;
    }
    // Merge with existing — don't duplicate
    const existingNames = groceryList.map((i) => i.name.toLowerCase().trim());
    const newItems = generated.filter((i) => !existingNames.includes(i.name.toLowerCase().trim()));
    setGroceryList([...groceryList, ...newItems]);
    showToast(`${newItems.length} items added ✓`);
  }

  function handleAddItem(item) {
    setGroceryList([...groceryList, item]);
  }

  function closeAddSheet() {
    setAddClosing(true);
    setTimeout(() => {
      setAdding(false);
      setAddClosing(false);
    }, 280);
  }

  // Group by category
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = groceryList.filter((i) => i.category === cat.label);
    if (items.length > 0) acc[cat.label] = items;
    return acc;
  }, {});

  const totalItems = groceryList.length;

  return (
    <div>
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div className="section-title" style={{ marginBottom: 0 }}>
          GROCERY LIST
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {checkedCount > 0 && (
            <button
              onClick={clearCheckedGrocery}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'none',
                color: 'var(--muted)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Clear checked ({checkedCount})
            </button>
          )}
        </div>
      </div>

      {/* Generate from plan button */}
      <button
        onClick={handleGenerate}
        style={{
          width: '100%',
          padding: '14px',
          background: 'rgba(255,140,66,0.08)',
          border: '1px solid rgba(255,140,66,0.3)',
          borderRadius: 'var(--radius)',
          color: 'var(--accent)',
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '18px',
          letterSpacing: '1px',
          cursor: 'pointer',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        ⟳ GENERATE FROM THIS WEEK'S PLAN
      </button>

      {/* Empty state */}
      {totalItems === 0 && (
        <div
          style={{
            color: 'var(--muted)',
            fontSize: '14px',
            textAlign: 'center',
            padding: '32px 0',
          }}
        >
          Your grocery list is empty — generate from your week plan or add items manually
        </div>
      )}

      {/* Grouped items */}
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} style={{ marginBottom: '20px' }}>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--muted)',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              marginBottom: '8px',
              paddingBottom: '6px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            {category}
          </div>
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}
          >
            {items.map((item, i) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div
                  onClick={() => toggleGroceryItem(item.id)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    border: `1px solid ${item.checked ? 'var(--accent)' : 'var(--border)'}`,
                    background: item.checked ? 'var(--accent)' : 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    fontSize: '14px',
                    color: '#0d0d0f',
                    transition: 'all 0.15s',
                  }}
                >
                  {item.checked ? '✓' : ''}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '15px',
                      textDecoration: item.checked ? 'line-through' : 'none',
                      color: item.checked ? 'var(--muted)' : 'var(--text)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {item.name}
                  </div>
                  {item.amount > 0 && (
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {item.amount}
                      {item.unit}
                    </div>
                  )}
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deleteGroceryItem(item.id)}
                  style={{ fontSize: '14px' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add item button */}
      <button className="add-meal-btn" onClick={() => setAdding(true)}>
        <span style={{ fontSize: '20px', lineHeight: 1 }}>+</span> Add item manually
      </button>

      {/* Add item sheet */}
      {adding && (
        <>
          <div
            onClick={closeAddSheet}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 80 }}
          />
          <div
            className={`bottom-sheet${addClosing ? ' closing' : ''}`}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'var(--surface)',
              borderTop: '1px solid var(--border)',
              borderRadius: '20px 20px 0 0',
              zIndex: 90,
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '0 20px 40px',
              maxWidth: '480px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '4px',
                background: 'var(--border)',
                borderRadius: '2px',
                margin: '12px auto 20px',
              }}
            />
            <AddItemForm onAdd={handleAddItem} onClose={closeAddSheet} />
          </div>
        </>
      )}
    </div>
  );
}
