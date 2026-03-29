import React, { useState } from 'react';
import useStore from '../../store/useStore';
import {
  todayStr,
  sumMacros,
  pct,
  MEAL_TYPES,
  showToast,
  formatDate,
  getWeekKey,
  DAY_LABELS,
  getWeekDates,
} from '../../utils/helpers';
import FoodSearch from '../Common/FoodSearch';

// ── Calorie ring ──────────────────────────────────────────────
function CalorieRing({ consumed, target }) {
  const radius = 38;
  const stroke = 6;
  const norm = radius - stroke / 2;
  const circ = 2 * Math.PI * norm;
  const progress = Math.min(1, consumed / (target || 1));
  const isOver = consumed > target;

  return (
    <div className="cal-ring-wrap">
      <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="45" cy="45" r={norm} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle
          cx="45"
          cy="45"
          r={norm}
          fill="none"
          stroke={isOver ? 'var(--red)' : 'var(--accent)'}
          strokeWidth={stroke}
          strokeDasharray={`${progress * circ} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
      </svg>
      <div className="cal-ring-label">
        <div className="cal-ring-num" style={{ color: isOver ? 'var(--red)' : 'var(--accent)' }}>
          {consumed}
        </div>
        <div className="cal-ring-sub">kcal</div>
      </div>
    </div>
  );
}

// ── Macro bars ────────────────────────────────────────────────
function MacroBars({ totals, targets }) {
  const rows = [
    { key: 'protein', label: 'Protein', color: 'protein', unit: 'g' },
    { key: 'carbs', label: 'Carbs', color: 'carbs', unit: 'g' },
    { key: 'fat', label: 'Fat', color: 'fat', unit: 'g' },
    { key: 'fibre', label: 'Fibre', color: 'fibre', unit: 'g' },
  ];

  return (
    <div className="macro-bar-wrap">
      {rows.map(({ key, label, color, unit }) => {
        const val = Math.round(totals[key]);
        const target = targets[key];
        const over = val > target;
        return (
          <div key={key} className="macro-row">
            <div className="macro-label">{label}</div>
            <div className="macro-track">
              <div
                className={`macro-fill ${over ? 'over' : color}`}
                style={{ width: `${pct(val, target)}%` }}
              />
            </div>
            <div className="macro-nums">
              <span style={{ color: over ? 'var(--red)' : 'var(--text)' }}>{val}</span>
              <span style={{ color: 'var(--muted)' }}>
                /{target}
                {unit}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Add meal sheet ────────────────────────────────────────────
function AddMealSheet({ date, onClose }) {
  const logMeal = useStore((s) => s.logMeal);
  const recipes = useStore((s) => s.recipes);

  const [mode, setMode] = useState('free'); // 'free' | 'recipe'
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [mealType, setMealType] = useState('Lunch');
  const [recipeSearch, setRecipeSearch] = useState('');

  // Free entry fields
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fibre, setFibre] = useState('');

  const filteredRecipes = recipes.filter((r) =>
    r.name.toLowerCase().includes(recipeSearch.toLowerCase()),
  );

  function handleSaveFree() {
    if (!name.trim() || !calories) return;
    logMeal(date, {
      name: name.trim(),
      mealType,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      fibre: Number(fibre) || 0,
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    });
    showToast('Meal logged ✓');
    onClose();
  }

  function handleSaveRecipe() {
    if (!selectedRecipe) return;
    logMeal(date, {
      name: selectedRecipe.name,
      mealType,
      recipeId: selectedRecipe.id,
      calories: selectedRecipe.calories,
      protein: selectedRecipe.protein,
      carbs: selectedRecipe.carbs,
      fat: selectedRecipe.fat,
      fibre: selectedRecipe.fibre,
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    });
    showToast('Meal logged ✓');
    onClose();
  }

  return (
    <div>
      <div className="section-title" style={{ marginTop: '4px' }}>
        ADD MEAL
      </div>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { id: 'free', label: 'Free entry' },
          { id: 'search', label: 'Search foods' },
          { id: 'recipe', label: 'From recipe' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => {
              setMode(id);
              setSelectedRecipe(null);
            }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              border: `1px solid ${mode === id ? 'var(--accent)' : 'var(--border)'}`,
              background: mode === id ? 'var(--accent)' : 'var(--card)',
              color: mode === id ? '#0d0d0f' : 'var(--muted)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Meal type — always visible */}
      <div style={{ marginBottom: '20px' }}>
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
          Meal type
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {MEAL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setMealType(t)}
              style={{
                padding: '8px 14px',
                borderRadius: '20px',
                border: `1px solid ${mealType === t ? 'var(--accent)' : 'var(--border)'}`,
                background: mealType === t ? 'var(--accent)' : 'var(--card)',
                color: mealType === t ? '#0d0d0f' : 'var(--muted)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Free entry mode */}
      {mode === 'free' && (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}
        >
          <input
            className="input"
            placeholder="Meal name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--muted)',
                  fontWeight: 600,
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                }}
              >
                Calories *
              </div>
              <input
                className="input"
                type="number"
                inputMode="numeric"
                placeholder="kcal"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--muted)',
                  fontWeight: 600,
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                }}
              >
                Protein (g)
              </div>
              <input
                className="input"
                type="number"
                inputMode="decimal"
                placeholder="g"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--muted)',
                  fontWeight: 600,
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                }}
              >
                Carbs (g)
              </div>
              <input
                className="input"
                type="number"
                inputMode="decimal"
                placeholder="g"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--muted)',
                  fontWeight: 600,
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                }}
              >
                Fat (g)
              </div>
              <input
                className="input"
                type="number"
                inputMode="decimal"
                placeholder="g"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--muted)',
                  fontWeight: 600,
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                }}
              >
                Fibre (g)
              </div>
              <input
                className="input"
                type="number"
                inputMode="decimal"
                placeholder="g"
                value={fibre}
                onChange={(e) => setFibre(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Search mode */}
      {mode === 'search' && (
        <div style={{ marginBottom: '20px' }}>
          <FoodSearch
            placeholder="Search foods e.g. chicken breast..."
            onSelect={(food) => {
              setName(food.name);
              setCalories(food.calories);
              setProtein(food.protein);
              setCarbs(food.carbs);
              setFat(food.fat);
              setFibre(food.fibre);
              setMode('free');
            }}
          />
        </div>
      )}

      {/* From recipe mode */}
      {mode === 'recipe' && (
        <div style={{ marginBottom: '20px' }}>
          <input
            className="input"
            placeholder="Search recipes..."
            value={recipeSearch}
            onChange={(e) => setRecipeSearch(e.target.value)}
            style={{ marginBottom: '12px' }}
            autoFocus
          />
          {filteredRecipes.length === 0 && (
            <div
              style={{
                color: 'var(--muted)',
                fontSize: '13px',
                textAlign: 'center',
                padding: '20px 0',
              }}
            >
              {recipes.length === 0
                ? 'No recipes saved yet — add some in the Planner tab'
                : 'No matches'}
            </div>
          )}
          {filteredRecipes.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelectedRecipe(r)}
              style={{
                background: selectedRecipe?.id === r.id ? 'rgba(255,140,66,0.08)' : 'var(--card)',
                border: `1px solid ${selectedRecipe?.id === r.id ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                padding: '14px 16px',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '3px' }}>
                  {r.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  P {r.protein}g · C {r.carbs}g · F {r.fat}g
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '24px',
                    color: 'var(--accent)',
                  }}
                >
                  {r.calories}
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
            </div>
          ))}
        </div>
      )}

      <button
        className="btn-primary"
        onClick={mode === 'free' ? handleSaveFree : handleSaveRecipe}
        disabled={mode === 'recipe' && !selectedRecipe}
        style={{ marginBottom: '10px', opacity: mode === 'recipe' && !selectedRecipe ? 0.4 : 1 }}
      >
        LOG MEAL
      </button>
      <button className="btn-secondary" onClick={onClose}>
        CANCEL
      </button>
    </div>
  );
}

// ── Planned meal suggestions ──────────────────────────────────
function PlannedSuggestions({ date, onLog }) {
  const weekPlan = useStore((s) => s.weekPlan);
  const recipes = useStore((s) => s.recipes);
  const mealLog = useStore((s) => s.mealLog);

  const weekKey = getWeekKey(date);
  const weekDates = getWeekDates(date);
  const dayIndex = weekDates.indexOf(date);
  const dayLabel = DAY_LABELS[dayIndex];
  const dayPlan = weekPlan[weekKey]?.[dayLabel] || {};

  const loggedNames = (mealLog[date] || []).map((m) => m.name.toLowerCase());
  const suggestions = Object.entries(dayPlan)
    .flatMap(([slot, entries]) =>
      (entries || []).map((entry) => {
        const recipe = recipes.find((r) => r.id === entry.recipeId);
        if (!recipe) return null;
        if (loggedNames.includes(recipe.name.toLowerCase())) return null;
        return { slot, recipe, servings: entry.servings };
      }),
    )
    .filter(Boolean);
  suggestions.map(({ slot, recipe, servings }, index) => (
    <div
      key={`${slot}-${recipe.id}-${index}`}
      onClick={() => onLog(recipe, slot, servings)}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '14px 16px',
        marginBottom: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
    >
      <div>
        <div
          style={{
            fontSize: '11px',
            color: 'var(--accent)',
            fontWeight: 600,
            textTransform: 'uppercase',
            marginBottom: '3px',
          }}
        >
          {slot}
        </div>
        <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '3px' }}>{recipe.name}</div>
        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
          P {Math.round(recipe.protein * ((servings || 1) / (recipe.servings || 1)))}g · C{' '}
          {Math.round(recipe.carbs * ((servings || 1) / (recipe.servings || 1)))}g · F{' '}
          {Math.round(recipe.fat * ((servings || 1) / (recipe.servings || 1)))}g
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '26px',
            color: 'var(--accent)',
          }}
        >
          {Math.round(recipe.calories * ((servings || 1) / (recipe.servings || 1)))}
        </div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--accent)',
            background: 'rgba(255,140,66,0.1)',
            border: '1px solid rgba(255,140,66,0.3)',
            borderRadius: '20px',
            padding: '3px 10px',
          }}
        >
          Tap to log
        </div>
      </div>
    </div>
  ));
}

// ── Main view ─────────────────────────────────────────────────
export default function MealsView() {
  const mealLog = useStore((s) => s.mealLog);
  const targets = useStore((s) => s.targets);
  const deleteMeal = useStore((s) => s.deleteMeal);
  const logMeal = useStore((s) => s.logMeal);

  const [date, setDate] = useState(todayStr());
  const [adding, setAdding] = useState(false);
  const [addClosing, setAddClosing] = useState(false);

  const meals = mealLog[date] || [];
  const totals = sumMacros(meals);
  const remaining = targets.calories - totals.calories;
  const isToday = date === todayStr();

  function closeSheet() {
    setAddClosing(true);
    setTimeout(() => {
      setAdding(false);
      setAddClosing(false);
    }, 280);
  }

  function offsetDate(n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    setDate(d.toISOString().slice(0, 10));
  }

  function handleLogPlanned(recipe, slot, servings) {
    const scale = (servings || 1) / (recipe.servings || 1);
    logMeal(date, {
      name: recipe.name,
      mealType: slot,
      recipeId: recipe.id,
      calories: Math.round(recipe.calories * scale),
      protein: Math.round(recipe.protein * scale * 10) / 10,
      carbs: Math.round(recipe.carbs * scale * 10) / 10,
      fat: Math.round(recipe.fat * scale * 10) / 10,
      fibre: Math.round(recipe.fibre * scale * 10) / 10,
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    });
    showToast(`${recipe.name} logged ✓`);
  }

  return (
    <div>
      {/* Date navigator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={() => offsetDate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent)',
            fontSize: '28px',
            cursor: 'pointer',
            padding: '0 8px',
          }}
        >
          ‹
        </button>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '20px',
              letterSpacing: '1px',
            }}
          >
            {isToday ? 'TODAY' : formatDate(date).toUpperCase()}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{date}</div>
        </div>
        <button
          onClick={() => offsetDate(1)}
          disabled={date >= todayStr()}
          style={{
            background: 'none',
            border: 'none',
            color: date >= todayStr() ? 'var(--border)' : 'var(--accent)',
            fontSize: '28px',
            cursor: date >= todayStr() ? 'default' : 'pointer',
            padding: '0 8px',
          }}
        >
          ›
        </button>
      </div>

      {/* Calorie summary */}
      <div className="calorie-summary">
        <CalorieRing consumed={Math.round(totals.calories)} target={targets.calories} />
        <div className="cal-detail">
          <div className="cal-detail-row">
            <span className="cal-detail-label">Goal</span>
            <span className="cal-detail-val">{targets.calories} kcal</span>
          </div>
          <div className="cal-detail-row">
            <span className="cal-detail-label">Eaten</span>
            <span className="cal-detail-val accent">{Math.round(totals.calories)} kcal</span>
          </div>
          <div className="cal-detail-row">
            <span className="cal-detail-label">Remaining</span>
            <span className={`cal-detail-val ${remaining < 0 ? 'red' : ''}`}>
              {remaining < 0
                ? `${Math.abs(Math.round(remaining))} over`
                : `${Math.round(remaining)} left`}
            </span>
          </div>
        </div>
      </div>

      {/* Macro bars */}
      <MacroBars totals={totals} targets={targets} />

      {/* Planned suggestions — today only */}
      {isToday && <PlannedSuggestions date={date} onLog={handleLogPlanned} />}

      {/* Logged meals */}
      <div className="section-title">TODAY'S LOG</div>

      {meals.length === 0 && (
        <div
          style={{
            color: 'var(--muted)',
            fontSize: '14px',
            textAlign: 'center',
            padding: '24px 0',
            marginBottom: '12px',
          }}
        >
          No meals logged yet
        </div>
      )}

      {meals.map((meal) => (
        <div key={meal.id} className="meal-entry">
          <div className="meal-entry-info">
            <div className="meal-entry-name">{meal.name}</div>
            <div className="meal-entry-macros">
              P {meal.protein}g · C {meal.carbs}g · F {meal.fat}g · Fibre {meal.fibre}g
            </div>
            <span className="meal-tag">{meal.mealType}</span>
            {meal.time && <span className="meal-tag">{meal.time}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="meal-entry-cals">{meal.calories}</div>
            <button className="delete-btn" onClick={() => deleteMeal(date, meal.id)}>
              ✕
            </button>
          </div>
        </div>
      ))}

      <button className="add-meal-btn" onClick={() => setAdding(true)}>
        <span style={{ fontSize: '20px', lineHeight: 1 }}>+</span> Log a meal
      </button>

      {/* Add meal sheet */}
      {adding && (
        <>
          <div
            onClick={closeSheet}
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
              maxHeight: '92vh',
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
            <AddMealSheet date={date} onClose={closeSheet} />
          </div>
        </>
      )}
    </div>
  );
}
