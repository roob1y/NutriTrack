import React, { useState } from 'react';
import useStore from '../../store/useStore';
import { showToast } from '../../utils/helpers';

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

  const [name, setName] = useState(existing?.name || '');
  const [servings, setServings] = useState(existing?.servings || 1);
  const [method, setMethod] = useState(existing?.method || '');
  const [ingredients, setIngredients] = useState(
    existing?.ingredients?.length ? existing.ingredients : [{ ...EMPTY_INGREDIENT }],
  );

  // Auto-sum macros from ingredients
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
      updateRecipe(existing.id, recipe);
      showToast('Recipe updated ✓');
    } else {
      addRecipe(recipe);
      showToast('Recipe saved ✓');
    }
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
            Servings
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
    </div>
  );
}

// ── Recipe detail view ────────────────────────────────────────
function RecipeDetail({ recipe, onBack, onEdit, onLogMeal }) {
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
          {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''} ·{' '}
          {recipe.ingredients?.length || 0} ingredients
        </div>
      </div>

      {/* Macro summary */}
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
            {recipe.calories}
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
              {recipe[key]}g
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
                    {ing.amount}
                    {ing.unit} · {ing.calories} kcal
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'right' }}>
                  P {ing.protein}g · C {ing.carbs}g · F {ing.fat}g
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

      <button className="btn-primary" onClick={onLogMeal} style={{ marginBottom: '10px' }}>
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
  const logMeal = useStore((s) => s.logMeal);

  const [adding, setAdding] = useState(false);
  const [addClosing, setAddClosing] = useState(false);
  const [selected, setSelected] = useState(null); // recipe being viewed
  const [editing, setEditing] = useState(null); // recipe being edited

  function closeForm() {
    setAddClosing(true);
    setTimeout(() => {
      setAdding(false);
      setEditing(null);
      setAddClosing(false);
    }, 280);
  }

  function handleLogMeal(recipe) {
    const today = new Date().toISOString().slice(0, 10);
    logMeal(today, {
      name: recipe.name,
      mealType: 'Meal',
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      fibre: recipe.fibre,
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    });
    showToast(`${recipe.name} logged ✓`);
    setSelected(null);
  }

  // Recipe detail view
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
        onLogMeal={() => handleLogMeal(selected)}
      />
    );
  }

  return (
    <div>
      <div className="section-title" style={{ marginTop: '4px' }}>
        MY RECIPES
      </div>

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

      {recipes.map((recipe) => (
        <div key={recipe.id} className="recipe-card" onClick={() => setSelected(recipe)}>
          <div className="recipe-card-header">
            <div>
              <div className="recipe-card-name">{recipe.name}</div>
              <div className="recipe-card-meta">
                P {recipe.protein}g · C {recipe.carbs}g · F {recipe.fat}g ·{' '}
                {recipe.ingredients?.length || 0} ingredients
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="recipe-card-cals">{recipe.calories}</div>
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

      {/* Add / edit recipe sheet */}
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
