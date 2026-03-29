import React, { useState } from 'react';
import useStore from '../../store/useStore';
import { getWeekKey, getWeekDates, DAY_LABELS, PLAN_SLOTS, showToast } from '../../utils/helpers';
import RecipesView from './RecipesView';
import GroceryView from './GroceryView';

// ── Day totals from plan ──────────────────────────────────────
function getDayTotals(dayPlan, recipes) {
  if (!dayPlan) return null;
  let calories = 0,
    protein = 0,
    carbs = 0,
    fat = 0;
  Object.values(dayPlan).forEach((slot) => {
    const { recipeId, servings } = slot || {};
    const r = recipes.find((r) => r.id === recipeId);
    if (r) {
      const scale = (servings || 1) / (r.servings || 1);
      calories += (Number(r.calories) || 0) * scale;
      protein += (Number(r.protein) || 0) * scale;
      carbs += (Number(r.carbs) || 0) * scale;
      fat += (Number(r.fat) || 0) * scale;
    }
  });
  if (calories === 0 && protein === 0) return null;
  return { calories, protein, carbs, fat };
}

// ── Recipe picker sheet ───────────────────────────────────────
function RecipePicker({ onSelect, onClose }) {
  const recipes = useStore((s) => s.recipes);
  const [search, setSearch] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [servings, setServings] = useState(1);

  function handleConfirm() {
    if (!selectedRecipe) return;
    onSelect(selectedRecipe.id, servings);
  }

  const filtered = recipes.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="section-title" style={{ marginTop: '4px' }}>
        PICK A RECIPE
      </div>
      <input
        className="input"
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: '16px' }}
        autoFocus
      />

      {filtered.length === 0 && (
        <div
          style={{
            color: 'var(--muted)',
            fontSize: '14px',
            textAlign: 'center',
            padding: '24px 0',
          }}
        >
          {recipes.length === 0
            ? 'No recipes saved yet — add some in the Recipes tab'
            : 'No matches'}
        </div>
      )}

      {filtered.map((r) => (
        <div
          key={r.id}
          onClick={() => {
            setSelectedRecipe(r);
            setServings(r.servings || 1);
          }}
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
            <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '3px' }}>{r.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
              {r.calories} kcal · P {r.protein}g · {r.servings} serving{r.servings !== 1 ? 's' : ''}
            </div>
          </div>
          {selectedRecipe?.id === r.id && (
            <div style={{ fontSize: '20px', color: 'var(--accent)' }}>✓</div>
          )}
        </div>
      ))}

      {/* Servings adjuster — shown when a recipe is selected */}
      {selectedRecipe && (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--accent)',
            borderRadius: 'var(--radius)',
            padding: '16px',
            marginTop: '8px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: 'var(--muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            Portions — affects grocery list
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setServings((s) => Math.max(0.5, Math.round((s - 1) * 10) / 10))}
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
              onClick={() => setServings((s) => Math.round((s + 1) * 10) / 10)}
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
          <div
            style={{
              fontSize: '11px',
              color: 'var(--muted)',
              textAlign: 'center',
              marginTop: '10px',
            }}
          >
            {Math.round((selectedRecipe.calories / (selectedRecipe.servings || 1)) * servings)} kcal
            per {servings} portion{servings !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      <button
        className="btn-primary"
        onClick={handleConfirm}
        disabled={!selectedRecipe}
        style={{ marginBottom: '10px', opacity: !selectedRecipe ? 0.4 : 1 }}
      >
        ADD TO PLAN
      </button>
      <button className="btn-secondary" onClick={onClose}>
        CANCEL
      </button>
    </div>
  );
}

// ── Week plan ─────────────────────────────────────────────────
function WeekPlan() {
  const weekPlan = useStore((s) => s.weekPlan);
  const recipes = useStore((s) => s.recipes);
  const setPlanSlot = useStore((s) => s.setPlanSlot);
  const clearPlanSlot = useStore((s) => s.clearPlanSlot);
  const copyWeekPlan = useStore((s) => s.copyWeekPlan);
  const logMeal = useStore((s) => s.logMeal);
  const targets = useStore((s) => s.targets);

  const [weekOffset, setWeekOffset] = useState(0);
  const [picking, setPicking] = useState(null); // { day, slot }
  const [pickClosing, setPickClosing] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [actionsClosing, setActionsClosing] = useState(false);

  // Compute week key from offset
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const weekDates = getWeekDates(baseDate.toISOString().slice(0, 10));
  const weekKey = getWeekKey(baseDate.toISOString().slice(0, 10));

  const weekStart = new Date(weekDates[0]);
  const weekEnd = new Date(weekDates[6]);
  const weekLabel =
    weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) +
    ' — ' +
    weekEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  function closePicker() {
    setPickClosing(true);
    setTimeout(() => {
      setPicking(null);
      setPickClosing(false);
    }, 280);
  }

  function handleSelect(recipeId, servings) {
    setPlanSlot(weekKey, picking.day, picking.slot, recipeId, servings);
    showToast('Added to plan ✓');
    closePicker();
  }

  function closeActions() {
    setActionsClosing(true);
    setTimeout(() => {
      setActionsOpen(false);
      setActionsClosing(false);
    }, 280);
  }

  function handleCopyToNextWeek() {
    const nextBase = new Date(baseDate);
    nextBase.setDate(nextBase.getDate() + 7);
    const nextWeekKey = getWeekKey(nextBase.toISOString().slice(0, 10));
    const nextWeekHasPlan = weekPlan[nextWeekKey] && Object.keys(weekPlan[nextWeekKey]).length > 0;

    if (nextWeekHasPlan) {
      if (!window.confirm('Next week already has meals planned. Overwrite it?')) return;
    }

    copyWeekPlan(weekKey, nextWeekKey);
    showToast('Plan copied to next week ✓');
    closeActions();
  }

  function handleLogTodaysPlan() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayLabel = DAY_LABELS[(new Date().getDay() + 6) % 7];
    const todayPlan = currentPlan[todayLabel] || {};
    const slots = Object.entries(todayPlan);

    if (slots.length === 0) {
      showToast('Nothing planned for today');
      closeActions();
      return;
    }

    let logged = 0;
    slots.forEach(([slot, slotData]) => {
      const { recipeId, servings } = slotData || {};
      const recipe = recipes.find((r) => r.id === recipeId);
      if (!recipe) return;
      const scale = (servings || 1) / (recipe.servings || 1);
      logMeal(todayStr, {
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
      logged++;
    });

    showToast(`${logged} meal${logged !== 1 ? 's' : ''} logged ✓`);
    closeActions();
  }

  const currentPlan = weekPlan[weekKey] || {};

  return (
    <div>
      {/* Week navigator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
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
              fontSize: '18px',
              letterSpacing: '1px',
            }}
          >
            {weekOffset === 0
              ? 'THIS WEEK'
              : weekOffset === 1
                ? 'NEXT WEEK'
                : weekOffset === -1
                  ? 'LAST WEEK'
                  : weekLabel.toUpperCase()}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{weekLabel}</div>
        </div>
        <button
          onClick={() => setWeekOffset((o) => o + 1)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent)',
            fontSize: '28px',
            cursor: 'pointer',
            padding: '0 8px',
          }}
        >
          ›
        </button>
      </div>

      {/* Week actions button */}
      <button
        onClick={() => setActionsOpen(true)}
        style={{
          width: '100%',
          padding: '12px',
          background: 'none',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          color: 'var(--muted)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        Week actions
      </button>

      {/* Day cards */}
      {weekDates.map((dateStr, di) => {
        const dayLabel = DAY_LABELS[di];
        const dayPlan = currentPlan[dayLabel] || {};
        const totals = getDayTotals(dayPlan, recipes);
        const hasAny = Object.keys(dayPlan).length > 0;
        const dateObj = new Date(dateStr);
        const isToday = dateStr === new Date().toISOString().slice(0, 10);

        return (
          <div
            key={dateStr}
            style={{
              background: 'var(--card)',
              border: `1px solid ${isToday ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              marginBottom: '12px',
              overflow: 'hidden',
            }}
          >
            {/* Day header */}
            <div
              style={{
                padding: '14px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '18px',
                    letterSpacing: '1px',
                    color: isToday ? 'var(--accent)' : 'var(--text)',
                  }}
                >
                  {dayLabel}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '8px' }}>
                  {dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              {totals ? (
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: '20px',
                      color: totals.calories > targets.calories ? '#ff4d6d' : 'var(--accent)',
                    }}
                  >
                    {Math.round(totals.calories)} kcal
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: totals.calories > targets.calories ? '#ff4d6d' : 'var(--muted)',
                    }}
                  >
                    {totals.calories > targets.calories
                      ? `${Math.round(totals.calories - targets.calories)} over`
                      : `${Math.round(targets.calories - totals.calories)} left`}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                  No meals planned
                </div>
              )}
            </div>

            {/* Slots */}
            <div style={{ padding: '10px 16px 14px' }}>
              {PLAN_SLOTS.map((slot) => {
                const slotData = dayPlan[slot] || {};
                const recipeId = slotData.recipeId;
                const recipe = recipes.find((r) => r.id === recipeId);
                return (
                  <div
                    key={slot}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '8px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--muted)',
                        fontWeight: 600,
                        width: '70px',
                        flexShrink: 0,
                        textTransform: 'uppercase',
                      }}
                    >
                      {slot}
                    </div>
                    {recipe ? (
                      <div
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>{recipe.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                            {Math.round(
                              (recipe.calories / (recipe.servings || 1)) * (slotData.servings || 1),
                            )}{' '}
                            kcal · {slotData.servings} serving{slotData.servings !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <button
                          className="delete-btn"
                          onClick={() => clearPlanSlot(weekKey, dayLabel, slot)}
                          style={{ fontSize: '14px' }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setPicking({ day: dayLabel, slot })}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: 'none',
                          border: '1px dashed var(--border)',
                          borderRadius: '8px',
                          color: 'var(--muted)',
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        + Add recipe
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Week actions sheet */}
      {actionsOpen && (
        <>
          <div
            onClick={closeActions}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 80 }}
          />
          <div
            className={`bottom-sheet${actionsClosing ? ' closing' : ''}`}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'var(--surface)',
              borderTop: '1px solid var(--border)',
              borderRadius: '20px 20px 0 0',
              zIndex: 90,
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
                margin: '12px auto 24px',
              }}
            />
            <div className="section-title" style={{ marginTop: '4px' }}>
              WEEK ACTIONS
            </div>

            {/* Log today's plan */}
            <div
              onClick={handleLogTodaysPlan}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '16px',
                marginBottom: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div style={{ fontSize: '28px' }}>📋</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '3px' }}>
                  Log today's plan
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  Instantly log all meals planned for today
                </div>
              </div>
            </div>

            {/* Jump to current week */}
            {weekOffset !== 0 && (
              <div
                onClick={() => {
                  setWeekOffset(0);
                  closeActions();
                }}
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '16px',
                  marginBottom: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div style={{ fontSize: '28px' }}>📍</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '3px' }}>
                    Go to current week
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    Jump back to this week's plan
                  </div>
                </div>
              </div>
            )}

            {/* Copy to next week */}
            <div
              onClick={handleCopyToNextWeek}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '16px',
                marginBottom: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div style={{ fontSize: '28px' }}>📅</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '3px' }}>
                  Copy to next week
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  Duplicate this week's meal plan to next week
                </div>
              </div>
            </div>

            <button className="btn-secondary" onClick={closeActions} style={{ marginTop: '8px' }}>
              CANCEL
            </button>
          </div>
        </>
      )}

      {/* Recipe picker sheet */}
      {picking && (
        <>
          <div
            onClick={closePicker}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 80 }}
          />
          <div
            className={`bottom-sheet${pickClosing ? ' closing' : ''}`}
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
            <RecipePicker onSelect={handleSelect} onClose={closePicker} />
          </div>
        </>
      )}
    </div>
  );
}

// ── Main planner view ─────────────────────────────────────────
export default function PlannerView() {
  const [subView, setSubView] = useState('plan');

  return (
    <div>
      {/* Sub nav */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { id: 'plan', label: 'Week Plan' },
          { id: 'recipes', label: 'Recipes' },
          { id: 'grocery', label: 'Grocery' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSubView(id)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              border: `1px solid ${subView === id ? 'var(--accent)' : 'var(--border)'}`,
              background: subView === id ? 'var(--accent)' : 'var(--card)',
              color: subView === id ? '#0d0d0f' : 'var(--muted)',
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

      {subView === 'plan' && <WeekPlan />}
      {subView === 'recipes' && <RecipesView />}
      {subView === 'grocery' && <GroceryView />}
    </div>
  );
}
