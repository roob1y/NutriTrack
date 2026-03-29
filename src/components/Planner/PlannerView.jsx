import React, { useState } from 'react';
import useStore from '../../store/useStore';
import { getWeekKey, getWeekDates, DAY_LABELS, PLAN_SLOTS, showToast } from '../../utils/helpers';
import RecipesView from './RecipesView';

// ── Day totals from plan ──────────────────────────────────────
function getDayTotals(dayPlan, recipes) {
  if (!dayPlan) return null;
  let calories = 0,
    protein = 0,
    carbs = 0,
    fat = 0;
  Object.values(dayPlan).forEach((recipeId) => {
    const r = recipes.find((r) => r.id === recipeId);
    if (r) {
      calories += Number(r.calories) || 0;
      protein += Number(r.protein) || 0;
      carbs += Number(r.carbs) || 0;
      fat += Number(r.fat) || 0;
    }
  });
  if (calories === 0 && protein === 0) return null;
  return { calories, protein, carbs, fat };
}

// ── Recipe picker sheet ───────────────────────────────────────
function RecipePicker({ onSelect, onClose }) {
  const recipes = useStore((s) => s.recipes);
  const [search, setSearch] = useState('');

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
          onClick={() => onSelect(r.id)}
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '14px 16px',
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '3px' }}>{r.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
              P {r.protein}g · C {r.carbs}g · F {r.fat}g
            </div>
          </div>
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '26px',
              color: 'var(--accent)',
            }}
          >
            {r.calories}
          </div>
        </div>
      ))}
      <button className="btn-secondary" onClick={onClose} style={{ marginTop: '8px' }}>
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

  const [weekOffset, setWeekOffset] = useState(0);
  const [picking, setPicking] = useState(null); // { day, slot }
  const [pickClosing, setPickClosing] = useState(false);

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

  function handleSelect(recipeId) {
    setPlanSlot(weekKey, picking.day, picking.slot, recipeId);
    showToast('Added to plan ✓');
    closePicker();
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
              {totals && (
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '20px',
                    color: 'var(--accent)',
                  }}
                >
                  {Math.round(totals.calories)} kcal
                </div>
              )}
            </div>

            {/* Slots */}
            <div style={{ padding: '10px 16px 14px' }}>
              {PLAN_SLOTS.map((slot) => {
                const recipeId = dayPlan[slot];
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
                            {recipe.calories} kcal · P {recipe.protein}g
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
    </div>
  );
}
