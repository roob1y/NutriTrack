import React, { useState } from 'react';
import useStore from '../../store/useStore';
import { showToast, todayStr } from '../../utils/helpers';

const EMPTY_INGREDIENT = {
  name: '',
  amount: '',
  unit: 'g',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  fibre: '',
};

// ── Ingredient row ────────────────────────────────────────────
function IngredientRow({ ing, onChange, onRemove }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '12px',
        marginBottom: '10px',
      }}
    >
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input
          className="input"
          placeholder="Ingredient name"
          value={ing.name}
          onChange={(e) => onChange('name', e.target.value)}
          style={{ flex: 2 }}
        />
        <input
          className="input"
          placeholder="Amount"
          type="number"
          inputMode="decimal"
          value={ing.amount}
          onChange={(e) => onChange('amount', e.target.value)}
          style={{ flex: 1 }}
        />
        <select
          value={ing.unit}
          onChange={(e) => onChange('unit', e.target.value)}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            padding: '12px 8px',
            width: '60px',
          }}
        >
          {['g', 'ml', 'tbsp', 'tsp', 'cup', 'pc'].map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
        {['calories', 'protein', 'carbs', 'fat', 'fibre'].map((key) => (
          <div key={key}>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--muted)',
                fontWeight: 600,
                textAlign: 'center',
                marginBottom: '4px',
                textTransform: 'uppercase',
              }}
            >
              {key === 'calories' ? 'kcal' : key}
            </div>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={ing[key]}
              onChange={(e) => onChange(key, e.target.value)}
              style={{ padding: '8px', textAlign: 'center', fontSize: '13px' }}
            />
          </div>
        ))}
      </div>
      <button
        onClick={onRemove}
        style={{
          marginTop: '10px',
          background: 'none',
          border: 'none',
          color: 'var(--muted)',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          padding: 0,
        }}
      >
        Remove ingredient
      </button>
    </div>
  );
}

// ── Add / edit recipe form ────────────────────────────────────
function RecipeForm({ existing, onClose }) {
  const addRecipe = useStore((s) => s.addRecipe);
  const updateRecipe = useStore((s) => s.updateRecipe);
  const updateMealMacrosFromRecipe = useStore((s) => s.updateMealMacrosFromRecipe);
  const mealLog = useStore((s) => s.mealLog);

  const [name, setName] = useState(existing?.name || '');
  const [servings, setServings] = useState(existing?.servings || 1);
  const [method, setMethod] = useState(existing?.method || '');
  const [ingredients, setIngredients] = useState(
    existing?.ingredients?.length ? existing.ingredients : [{ ...EMPTY_INGREDIENT }],
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingSave, setPendingSave] = useState(null);

  function sumField(field) {
    return ingredients.reduce((a, i) => a + (Number(i[field]) || 0), 0);
  }

  const totals = {
    calories: Math.round(sumField('calories')),
    protein: Math.round(sumField('protein') * 10) / 10,
    carbs: Math.round(sumField('carbs') * 10) / 10,
    fat: Math.round(sumField('fat') * 10) / 10,
    fibre: Math.round(sumField('fibre') * 10) / 10,
  };

  function updateIngredient(i, field, val) {
    setIngredients((prev) => prev.map((ing, idx) => (idx === i ? { ...ing, [field]: val } : ing)));
  }

  function addIngredient() {
    setIngredients((prev) => [...prev, { ...EMPTY_INGREDIENT }]);
  }

  function removeIngredient(i) {
    setIngredients((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSave() {
    if (!name.trim()) return;
    const recipe = {
      name: name.trim(),
      servings: Number(servings) || 1,
      method,
      ingredients,
      ...totals,
    };

    if (existing) {
      // Check if this recipe was logged today
      const today = todayStr();
      const todayLog = mealLog[today] || [];
      const loggedToday = todayLog.some((m) => m.recipeId === existing.id);

      if (loggedToday) {
        setPendingSave(recipe);
        setShowConfirm(true);
        return;
      }

      updateRecipe(existing.id, recipe);
      showToast('Recipe updated ✓');
      onClose();
    } else {
      addRecipe(recipe);
      showToast('Recipe saved ✓');
      onClose();
    }
  }

  function confirmUpdate(updateToday) {
    updateRecipe(existing.id, pendingSave);
    if (updateToday) {
      const today = todayStr();
      const { calories, protein, carbs, fat, fibre } = pendingSave;
      updateMealMacrosFromRecipe(today, existing.id, { calories, protein, carbs, fat, fibre });
      showToast("Recipe and today's log updated ✓");
    } else {
      showToast('Recipe updated ✓');
    }
    setShowConfirm(false);
    onClose();
  }

  return (
    <div>
      <div className="section-title" style={{ marginTop: '4px' }}>
        {existing ? 'EDIT RECIPE' : 'NEW RECIPE'}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <div style={{ flex: 2 }}>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--muted)',
              fontWeight: 600,
              marginBottom: '6px',
              textTransform: 'uppercase',
            }}
          >
            Recipe name *
          </div>
          <input
            className="input"
            placeholder="e.g. Tofu stir fry"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--muted)',
              fontWeight: 600,
              marginBottom: '6px',
              textTransform: 'uppercase',
            }}
          >
            Base portions (how many this recipe makes)
          </div>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
          />
        </div>
      </div>

      {/* Macro summary */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '14px 16px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '26px',
              color: 'var(--accent)',
            }}
          >
            {totals.calories}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: 'var(--muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            kcal
          </div>
        </div>
        {['protein', 'carbs', 'fat', 'fibre'].map((key) => (
          <div key={key} style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '22px',
                color: 'var(--text)',
              }}
            >
              {totals[key]}g
            </div>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--muted)',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              {key}
            </div>
          </div>
        ))}
      </div>

      {/* Ingredients */}
      <div
        style={{
          fontSize: '11px',
          color: 'var(--muted)',
          fontWeight: 600,
          marginBottom: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        Ingredients
      </div>
      {ingredients.map((ing, i) => (
        <IngredientRow
          key={i}
          ing={ing}
          onChange={(field, val) => updateIngredient(i, field, val)}
          onRemove={() => removeIngredient(i)}
        />
      ))}
      <button onClick={addIngredient} className="add-meal-btn" style={{ marginBottom: '20px' }}>
        <span style={{ fontSize: '18px' }}>+</span> Add ingredient
      </button>

      {/* Method */}
      <div
        style={{
          fontSize: '11px',
          color: 'var(--muted)',
          fontWeight: 600,
          marginBottom: '6px',
          textTransform: 'uppercase',
        }}
      >
        Method (optional)
      </div>
      <textarea
        className="input"
        placeholder="How to make it..."
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        style={{ resize: 'none', height: '100px', marginBottom: '20px' }}
      />

      <button className="btn-primary" onClick={handleSave} style={{ marginBottom: '10px' }}>
        {existing ? 'SAVE CHANGES' : 'SAVE RECIPE'}
      </button>
      <button className="btn-secondary" onClick={onClose}>
        CANCEL
      </button>

      {/* Today's log update confirmation */}
      {showConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius) var(--radius) 0 0',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
            }}
          >
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '22px',
                letterSpacing: '1.5px',
                marginBottom: '8px',
              }}
            >
              UPDATE TODAY'S LOG?
            </div>
            <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '24px' }}>
              You logged <strong style={{ color: 'var(--text)' }}>{existing?.name}</strong> today.
              Do you want to update today's log entry with the new macros?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => confirmUpdate(true)}
                style={{
                  padding: '14px',
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: '18px',
                  letterSpacing: '1px',
                  color: '#0d0d0f',
                  cursor: 'pointer',
                }}
              >
                YES, UPDATE TODAY'S LOG
              </button>
              <button
                onClick={() => confirmUpdate(false)}
                style={{
                  padding: '14px',
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: '18px',
                  letterSpacing: '1px',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                }}
              >
                NO, KEEP TODAY AS IS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Recipe detail view ────────────────────────────────────────
function RecipeDetail({ recipe, onBack, onEdit, onLogMeal }) {
  const [servings, setServings] = useState(recipe.servings || 1);
  const scale = servings / (recipe.servings || 1);

  const scaled = {
    calories: Math.round(recipe.calories * scale),
    protein: Math.round(recipe.protein * scale * 10) / 10,
    carbs: Math.round(recipe.carbs * scale * 10) / 10,
    fat: Math.round(recipe.fat * scale * 10) / 10,
    fibre: Math.round(recipe.fibre * scale * 10) / 10,
  };

  return (
    <div>
      <button className="back-btn" onClick={onBack}>
        ← BACK TO RECIPES
      </button>
      <div style={{ marginBottom: '20px' }}>
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '32px',
            letterSpacing: '2px',
            marginBottom: '4px',
          }}
        >
          {recipe.name.toUpperCase()}
        </h2>
        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
          {recipe.ingredients?.length || 0} ingredients
        </div>
      </div>

      {/* Servings adjuster */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '16px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            color: 'var(--muted)',
            fontWeight: 600,
            textTransform: 'uppercase',
            marginBottom: '12px',
            letterSpacing: '0.5px',
          }}
        >
          Portions
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() =>
              setServings((s) => Math.max(0.5, Math.round(((parseFloat(s) || 1) - 1) * 10) / 10))
            }
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)',
              fontSize: '20px',
              width: '44px',
              height: '44px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            −
          </button>
          <input
            className="input"
            type="number"
            inputMode="decimal"
            value={servings}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === '' || raw === '.') {
                setServings(raw);
                return;
              }
              const val = parseFloat(raw);
              if (!isNaN(val) && val > 0) setServings(val);
            }}
            style={{
              flex: 1,
              textAlign: 'center',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '28px',
              color: 'var(--accent)',
              padding: '8px',
            }}
          />
          <button
            onClick={() => setServings((s) => Math.round(((parseFloat(s) || 1) + 1) * 10) / 10)}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)',
              fontSize: '20px',
              width: '44px',
              height: '44px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Macro summary — scaled */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '30px',
              color: 'var(--accent)',
            }}
          >
            {scaled.calories}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: 'var(--muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            kcal
          </div>
        </div>
        {['protein', 'carbs', 'fat', 'fibre'].map((key) => (
          <div key={key} style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '24px',
                color: 'var(--text)',
              }}
            >
              {scaled[key]}g
            </div>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--muted)',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              {key}
            </div>
          </div>
        ))}
      </div>

      {/* Ingredients — scaled amounts */}
      {recipe.ingredients?.length > 0 && (
        <>
          <div className="section-title">INGREDIENTS</div>
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              marginBottom: '20px',
            }}
          >
            {recipe.ingredients.map((ing, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 16px',
                  borderBottom:
                    i < recipe.ingredients.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{ing.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {Math.round(ing.amount * scale * 10) / 10}
                    {ing.unit} · {Math.round(ing.calories * scale)} kcal
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'right' }}>
                  P {Math.round(ing.protein * scale * 10) / 10}g · C{' '}
                  {Math.round(ing.carbs * scale * 10) / 10}g · F{' '}
                  {Math.round(ing.fat * scale * 10) / 10}g
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Method */}
      {recipe.method && (
        <>
          <div className="section-title">METHOD</div>
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '16px',
              marginBottom: '20px',
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'var(--text)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {recipe.method}
          </div>
        </>
      )}

      <button
        className="btn-primary"
        onClick={() => onLogMeal(recipe, servings)}
        style={{ marginBottom: '10px' }}
      >
        LOG AS MEAL TODAY
      </button>
      <button className="btn-secondary" onClick={onEdit}>
        EDIT RECIPE
      </button>
    </div>
  );
}

// ── Main recipes view ─────────────────────────────────────────
export default function RecipesView() {
  const recipes = useStore((s) => s.recipes);
  const deleteRecipe = useStore((s) => s.deleteRecipe);
  const addRecipe = useStore((s) => s.addRecipe);
  const logMeal = useStore((s) => s.logMeal);

  const [adding, setAdding] = useState(false);
  const [addClosing, setAddClosing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    minCalories: '',
    maxCalories: '',
    minProtein: '',
    maxProtein: '',
    minCarbs: '',
    maxCarbs: '',
    minFat: '',
    maxFat: '',
  });

  function closeForm() {
    setAddClosing(true);
    setTimeout(() => {
      setAdding(false);
      setEditing(null);
      setAddClosing(false);
    }, 280);
  }

  function handleLogMeal(recipe, servings) {
    const today = new Date().toISOString().slice(0, 10);
    const scale = (servings || 1) / (recipe.servings || 1);
    logMeal(today, {
      name: recipe.name,
      mealType: 'Meal',
      recipeId: recipe.id,
      calories: Math.round(recipe.calories * scale),
      protein: Math.round(recipe.protein * scale * 10) / 10,
      carbs: Math.round(recipe.carbs * scale * 10) / 10,
      fat: Math.round(recipe.fat * scale * 10) / 10,
      fibre: Math.round(recipe.fibre * scale * 10) / 10,
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    });
    showToast(`${recipe.name} logged ✓`);
    setSelected(null);
  }

  const activeFilterCount = Object.values(filters).filter((v) => v !== '').length;

  const filtered = recipes.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.minCalories && r.calories < Number(filters.minCalories)) return false;
    if (filters.maxCalories && r.calories > Number(filters.maxCalories)) return false;
    if (filters.minProtein && r.protein < Number(filters.minProtein)) return false;
    if (filters.maxProtein && r.protein > Number(filters.maxProtein)) return false;
    if (filters.minCarbs && r.carbs < Number(filters.minCarbs)) return false;
    if (filters.maxCarbs && r.carbs > Number(filters.maxCarbs)) return false;
    if (filters.minFat && r.fat < Number(filters.minFat)) return false;
    if (filters.maxFat && r.fat > Number(filters.maxFat)) return false;
    return true;
  });

  if (selected) {
    return (
      <RecipeDetail
        recipe={selected}
        onBack={() => setSelected(null)}
        onEdit={() => {
          setEditing(selected);
          setSelected(null);
          setAdding(true);
        }}
        onLogMeal={handleLogMeal}
      />
    );
  }

  return (
    <div>
      <div className="section-title" style={{ marginTop: '4px' }}>
        MY RECIPES
      </div>

      {/* Search + filter row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          className="input"
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          style={{
            flexShrink: 0,
            padding: '12px 14px',
            background: activeFilterCount > 0 ? 'var(--accent)' : 'var(--card)',
            border: `1px solid ${activeFilterCount > 0 ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: '8px',
            color: activeFilterCount > 0 ? '#0d0d0f' : 'var(--muted)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>
      </div>

      {/* Macro filters */}
      {filtersOpen && (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '16px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: 'var(--muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '14px',
            }}
          >
            Filter by macro range
          </div>
          {[
            { label: 'Calories', minKey: 'minCalories', maxKey: 'maxCalories', unit: 'kcal' },
            { label: 'Protein', minKey: 'minProtein', maxKey: 'maxProtein', unit: 'g' },
            { label: 'Carbs', minKey: 'minCarbs', maxKey: 'maxCarbs', unit: 'g' },
            { label: 'Fat', minKey: 'minFat', maxKey: 'maxFat', unit: 'g' },
          ].map(({ label, minKey, maxKey, unit }) => (
            <div key={label} style={{ marginBottom: '12px' }}>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--muted)',
                  fontWeight: 600,
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                }}
              >
                {label} ({unit})
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  className="input"
                  type="number"
                  inputMode="numeric"
                  placeholder="Min"
                  value={filters[minKey]}
                  onChange={(e) => setFilters((f) => ({ ...f, [minKey]: e.target.value }))}
                  style={{ flex: 1 }}
                />
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>–</span>
                <input
                  className="input"
                  type="number"
                  inputMode="numeric"
                  placeholder="Max"
                  value={filters[maxKey]}
                  onChange={(e) => setFilters((f) => ({ ...f, [maxKey]: e.target.value }))}
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          ))}
          {activeFilterCount > 0 && (
            <button
              onClick={() =>
                setFilters({
                  minCalories: '',
                  maxCalories: '',
                  minProtein: '',
                  maxProtein: '',
                  minCarbs: '',
                  maxCarbs: '',
                  minFat: '',
                  maxFat: '',
                })
              }
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--red)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
                marginTop: '4px',
              }}
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {recipes.length === 0 && (
        <div
          style={{
            color: 'var(--muted)',
            fontSize: '14px',
            textAlign: 'center',
            padding: '32px 0',
          }}
        >
          No recipes yet — add your first one below
        </div>
      )}

      {recipes.length > 0 && filtered.length === 0 && (
        <div
          style={{
            color: 'var(--muted)',
            fontSize: '14px',
            textAlign: 'center',
            padding: '32px 0',
          }}
        >
          No recipes match your search or filters
        </div>
      )}

      {filtered.map((recipe) => (
        <div key={recipe.id} className="recipe-card" onClick={() => setSelected(recipe)}>
          <div className="recipe-card-header">
            <div>
              <div className="recipe-card-name">{recipe.name}</div>
              <div className="recipe-card-meta">
                P {recipe.protein}g · C {recipe.carbs}g · F {recipe.fat}g ·{' '}
                {recipe.ingredients?.length || 0} ingredients
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ textAlign: 'right' }}>
                <div className="recipe-card-cals">{recipe.calories}</div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--muted)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    marginTop: '-4px',
                  }}
                >
                  kcal
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addRecipe({ ...recipe, name: `${recipe.name} (copy)` });
                  showToast('Recipe duplicated ✓');
                }}
                style={{
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--muted)',
                  padding: '6px 8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ⧉
              </button>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteRecipe(recipe.id);
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      ))}

      <button className="add-meal-btn" onClick={() => setAdding(true)}>
        <span style={{ fontSize: '20px', lineHeight: 1 }}>+</span> New recipe
      </button>

      {(adding || editing) && (
        <>
          <div
            onClick={closeForm}
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
              maxHeight: '95vh',
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
            <RecipeForm existing={editing} onClose={closeForm} />
          </div>
        </>
      )}
    </div>
  );
}
