import React, { useState, useRef } from 'react';
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
  Object.values(dayPlan).forEach((entries) => {
    (entries || []).forEach(({ recipeId, servings }) => {
      const r = recipes.find((r) => r.id === recipeId);
      if (r) {
        const scale = (servings || 1) / (r.servings || 1);
        calories += (Number(r.calories) || 0) * scale;
        protein += (Number(r.protein) || 0) * scale;
        carbs += (Number(r.carbs) || 0) * scale;
        fat += (Number(r.fat) || 0) * scale;
      }
    });
  });
  if (calories === 0 && protein === 0) return null;
  return { calories, protein, carbs, fat };
}

// ── Recipe picker sheet ───────────────────────────────────────
function RecipePicker({ onSelect, onClose, startDay }) {
  const recipes = useStore((s) => s.recipes);
  const [search, setSearch] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [servings, setServings] = useState(1);
  const [isMealPrep, setIsMealPrep] = useState(false);
  const [prepDays, setPrepDays] = useState(2);

  function handleConfirm() {
    if (!selectedRecipe) return;
    onSelect(
      selectedRecipe.id,
      parseFloat(servings) || 1,
      isMealPrep ? Math.max(2, parseInt(prepDays) || 2) : 1,
    );
  }

  const filtered = recipes.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="section-title" style={{ marginTop: '4px' }}>
        ADD RECIPE TO SLOT
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
              {r.calories} kcal · P {r.protein}g · {r.servings} base portion
              {r.servings !== 1 ? 's' : ''}
            </div>
          </div>
          {selectedRecipe?.id === r.id && (
            <div style={{ fontSize: '20px', color: 'var(--accent)' }}>✓</div>
          )}
        </div>
      ))}

      {selectedRecipe && (
        <>
          {/* Portions adjuster */}
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius)',
              padding: '16px',
              marginTop: '8px',
              marginBottom: '12px',
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
                onClick={() =>
                  setServings((s) =>
                    Math.max(0.5, Math.round(((parseFloat(s) || 1) - 1) * 10) / 10),
                  )
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
            <div
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                textAlign: 'center',
                marginTop: '10px',
              }}
            >
              {Math.round(
                (selectedRecipe.calories / (selectedRecipe.servings || 1)) *
                  (parseFloat(servings) || 1),
              )}{' '}
              kcal per {servings} portion{servings !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Meal prep toggle */}
          <div
            style={{
              background: isMealPrep ? 'rgba(255,140,66,0.08)' : 'var(--card)',
              border: `1px solid ${isMealPrep ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              padding: '14px 16px',
              marginBottom: '16px',
              cursor: 'pointer',
            }}
            onClick={() => setIsMealPrep((v) => !v)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>
                  Part of a meal prep?
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  Add this to the same slot across multiple days
                </div>
              </div>
              <div
                style={{
                  width: '44px',
                  height: '26px',
                  borderRadius: '13px',
                  background: isMealPrep ? 'var(--accent)' : 'var(--border)',
                  position: 'relative',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '3px',
                    left: isMealPrep ? '21px' : '3px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'left 0.2s',
                  }}
                />
              </div>
            </div>

            {/* Days input — shown when toggled on */}
            {isMealPrep && (
              <div
                style={{
                  marginTop: '14px',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '14px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--muted)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  How many days? (min 2)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => setPrepDays((d) => Math.max(2, (parseInt(d) || 2) - 1))}
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
                    inputMode="numeric"
                    value={prepDays}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (e.target.value === '') {
                        setPrepDays('');
                        return;
                      }
                      if (!isNaN(val)) setPrepDays(Math.max(2, val));
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
                    onClick={() => setPrepDays((d) => (parseInt(d) || 2) + 1)}
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
                    marginTop: '8px',
                  }}
                >
                  Starting {startDay} for {prepDays} days
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <button
        className="btn-primary"
        onClick={handleConfirm}
        disabled={!selectedRecipe}
        style={{ marginBottom: '10px', opacity: !selectedRecipe ? 0.4 : 1 }}
      >
        {isMealPrep ? `ADD TO ${prepDays} DAYS` : 'ADD TO SLOT'}
      </button>
      <button className="btn-secondary" onClick={onClose}>
        CANCEL
      </button>
    </div>
  );
}

function EditPortionsSheet({ recipe, currentServings, onConfirm, onClose }) {
  const [servings, setServings] = useState(currentServings || 1);

  return (
    <div>
      <div className="section-title" style={{ marginTop: '4px' }}>
        EDIT PORTIONS
      </div>
      <div
        style={{ fontWeight: 600, fontSize: '16px', marginBottom: '20px', color: 'var(--muted)' }}
      >
        {recipe.name}
      </div>
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--accent)',
          borderRadius: 'var(--radius)',
          padding: '16px',
          marginBottom: '20px',
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
        <div
          style={{
            fontSize: '11px',
            color: 'var(--muted)',
            textAlign: 'center',
            marginTop: '10px',
          }}
        >
          {Math.round((recipe.calories / (recipe.servings || 1)) * (parseFloat(servings) || 1))}{' '}
          kcal per {servings} portion{servings !== 1 ? 's' : ''}
        </div>
      </div>
      <button
        className="btn-primary"
        onClick={() => onConfirm(parseFloat(servings) || 1)}
        style={{ marginBottom: '10px' }}
      >
        UPDATE PORTIONS
      </button>
      <button className="btn-secondary" onClick={onClose}>
        CANCEL
      </button>
    </div>
  );
}

function CopyDaySheet({ fromDay, weekDates, onCopy, onClose }) {
  const [targetDay, setTargetDay] = useState(null);

  return (
    <div>
      <div className="section-title" style={{ marginTop: '4px' }}>
        COPY {fromDay.toUpperCase()}
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>
        Pick a day to copy {fromDay}'s meals into. Existing meals on the target day will be kept and
        merged.
      </p>
      {DAY_LABELS.filter((d) => d !== fromDay).map((day) => {
        const dateStr = weekDates[DAY_LABELS.indexOf(day)];
        const dateObj = new Date(dateStr);
        return (
          <div
            key={day}
            onClick={() => setTargetDay(day)}
            style={{
              background: targetDay === day ? 'rgba(255,140,66,0.08)' : 'var(--card)',
              border: `1px solid ${targetDay === day ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              padding: '14px 16px',
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '18px',
                letterSpacing: '1px',
              }}
            >
              {day}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
              {dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </div>
          </div>
        );
      })}
      <button
        className="btn-primary"
        onClick={() => targetDay && onCopy(targetDay)}
        disabled={!targetDay}
        style={{ marginBottom: '10px', marginTop: '8px', opacity: !targetDay ? 0.4 : 1 }}
      >
        COPY TO {targetDay ? targetDay.toUpperCase() : '...'}
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
  const targets = useStore((s) => s.targets);
  const addToSlot = useStore((s) => s.addToSlot);
  const removeFromSlot = useStore((s) => s.removeFromSlot);
  const updateSlotEntry = useStore((s) => s.updateSlotEntry);
  const clearSlot = useStore((s) => s.clearSlot);
  const copyDay = useStore((s) => s.copyDay);
  const copyWeekPlan = useStore((s) => s.copyWeekPlan);
  const logMeal = useStore((s) => s.logMeal);

  const [weekOffset, setWeekOffset] = useState(0);
  const [picking, setPicking] = useState(null);
  const [pickClosing, setPickClosing] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [actionsClosing, setActionsClosing] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editClosing, setEditClosing] = useState(false);
  const [copyDayOpen, setCopyDayOpen] = useState(null);
  const [copyDayClosing, setCopyDayClosing] = useState(false);
  const longPressTimer = useRef(null);

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

  function handleLongPress(dayLabel) {
    const dayPlan = currentPlan[dayLabel] || {};
    if (Object.keys(dayPlan).length === 0) {
      showToast('No meals planned on this day');
      return;
    }
    setCopyDayOpen(dayLabel);
  }
  function closeEdit() {
    setEditClosing(true);
    setTimeout(() => {
      setEditing(null);
      setEditClosing(false);
    }, 280);
  }

  function closePicker() {
    setPickClosing(true);
    setTimeout(() => {
      setPicking(null);
      setPickClosing(false);
    }, 280);
  }

  function closeCopyDay() {
    setCopyDayClosing(true);
    setTimeout(() => {
      setCopyDayOpen(null);
      setCopyDayClosing(false);
    }, 280);
  }

  function handleCopyDay(targetDay) {
    copyDay(weekKey, copyDayOpen, targetDay);
    showToast(`${copyDayOpen} copied to ${targetDay} ✓`);
    closeCopyDay();
  }

  function handleSelect(recipeId, servings, days) {
    const startIndex = DAY_LABELS.indexOf(picking.day);
    for (let i = 0; i < days; i++) {
      const dayIndex = (startIndex + i) % 7;
      const dayLabel = DAY_LABELS[dayIndex];
      addToSlot(weekKey, dayLabel, picking.slot, recipeId, servings);
    }
    showToast(days > 1 ? `Added to ${days} days ✓` : 'Added to plan ✓');
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
        const totals = getDayTotals(dayPlan, recipes, targets);
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
              userSelect: 'none',
            }}
            onMouseDown={() => {
              longPressTimer.current = setTimeout(() => handleLongPress(dayLabel), 600);
            }}
            onMouseUp={() => clearTimeout(longPressTimer.current)}
            onMouseLeave={() => clearTimeout(longPressTimer.current)}
            onTouchStart={() => {
              longPressTimer.current = setTimeout(() => handleLongPress(dayLabel), 600);
            }}
            onTouchEnd={() => clearTimeout(longPressTimer.current)}
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
                const entries = dayPlan[slot] || [];
                return (
                  <div key={slot} style={{ marginBottom: '10px' }}>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--muted)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        marginBottom: '6px',
                      }}
                    >
                      {slot}
                    </div>
                    {entries.map((entry) => {
                      const recipe = recipes.find((r) => r.id === entry.recipeId);
                      if (!recipe) return null;
                      return (
                        <div
                          key={entry.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '6px',
                          }}
                        >
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
                                  (recipe.calories / (recipe.servings || 1)) *
                                    (entry.servings || 1),
                                )}{' '}
                                kcal · {entry.servings} portion{entry.servings !== 1 ? 's' : ''}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                onClick={() => setEditing({ day: dayLabel, slot, entry, recipe })}
                                style={{
                                  background: 'none',
                                  border: '1px solid var(--border)',
                                  borderRadius: '6px',
                                  color: 'var(--muted)',
                                  fontSize: '13px',
                                  padding: '4px 8px',
                                  cursor: 'pointer',
                                }}
                              >
                                ✎
                              </button>
                              <button
                                className="delete-btn"
                                onClick={() => removeFromSlot(weekKey, dayLabel, slot, entry.id)}
                                style={{ fontSize: '14px' }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <button
                      onClick={() => setPicking({ day: dayLabel, slot })}
                      style={{
                        width: '100%',
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
      {/* Copy Day sheet */}
      {copyDayOpen && (
        <>
          <div
            onClick={closeCopyDay}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 80 }}
          />
          <div
            className={`bottom-sheet${copyDayClosing ? ' closing' : ''}`}
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
            <CopyDaySheet
              fromDay={copyDayOpen}
              weekDates={weekDates}
              onCopy={handleCopyDay}
              onClose={closeCopyDay}
            />
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
            <RecipePicker onSelect={handleSelect} onClose={closePicker} startDay={picking?.day} />
          </div>
        </>
      )}
      {/* Edit portions sheet */}
      {editing && (
        <>
          <div
            onClick={closeEdit}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 80 }}
          />
          <div
            className={`bottom-sheet${editClosing ? ' closing' : ''}`}
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
                margin: '12px auto 20px',
              }}
            />
            <EditPortionsSheet
              recipe={editing.recipe}
              currentServings={editing.entry.servings}
              onConfirm={(newServings) => {
                updateSlotEntry(weekKey, editing.day, editing.slot, editing.entry.id, newServings);
                showToast('Portions updated ✓');
                closeEdit();
              }}
              onClose={closeEdit}
            />
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
