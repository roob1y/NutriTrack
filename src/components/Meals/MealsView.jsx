import React, { useState } from 'react';
import useStore from '../../store/useStore';
import { todayStr, sumMacros, pct, MEAL_TYPES, showToast, formatDate } from '../../utils/helpers';

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
          cx="45" cy="45" r={norm}
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
    { key: 'carbs',   label: 'Carbs',   color: 'carbs',   unit: 'g' },
    { key: 'fat',     label: 'Fat',     color: 'fat',     unit: 'g' },
    { key: 'fibre',   label: 'Fibre',   color: 'fibre',   unit: 'g' },
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
              <span style={{ color: 'var(--muted)' }}>/{target}{unit}</span>
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
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState('Lunch');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fibre, setFibre] = useState('');

  function handleSave() {
    if (!name.trim() || !calories) return;
    logMeal(date, {
      name: name.trim(),
      mealType,
      calories: Number(calories) || 0,
      protein:  Number(protein)  || 0,
      carbs:    Number(carbs)    || 0,
      fat:      Number(fat)      || 0,
      fibre:    Number(fibre)    || 0,
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    });
    showToast('Meal logged ✓');
    onClose();
  }

  return (
    <div>
      <div className="section-title" style={{ marginTop: '4px' }}>ADD MEAL</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <input
          className="input"
          placeholder="Meal name (e.g. Tofu stir fry)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>Calories *</div>
            <input className="input" type="number" inputMode="numeric" placeholder="kcal" value={calories} onChange={(e) => setCalories(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>Protein (g)</div>
            <input className="input" type="number" inputMode="decimal" placeholder="g" value={protein} onChange={(e) => setProtein(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>Carbs (g)</div>
            <input className="input" type="number" inputMode="decimal" placeholder="g" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>Fat (g)</div>
            <input className="input" type="number" inputMode="decimal" placeholder="g" value={fat} onChange={(e) => setFat(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>Fibre (g)</div>
            <input className="input" type="number" inputMode="decimal" placeholder="g" value={fibre} onChange={(e) => setFibre(e.target.value)} />
          </div>
        </div>
      </div>

      <button className="btn-primary" onClick={handleSave} style={{ marginBottom: '10px' }}>
        LOG MEAL
      </button>
      <button className="btn-secondary" onClick={onClose}>CANCEL</button>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────
export default function MealsView() {
  const mealLog = useStore((s) => s.mealLog);
  const targets = useStore((s) => s.targets);
  const deleteMeal = useStore((s) => s.deleteMeal);

  const [date, setDate] = useState(todayStr());
  const [adding, setAdding] = useState(false);
  const [addClosing, setAddClosing] = useState(false);

  const meals = mealLog[date] || [];
  const totals = sumMacros(meals);
  const remaining = targets.calories - totals.calories;

  function closeSheet() {
    setAddClosing(true);
    setTimeout(() => { setAdding(false); setAddClosing(false); }, 280);
  }

  // Date navigation
  function offsetDate(n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    setDate(d.toISOString().slice(0, 10));
  }

  return (
    <div>
      {/* Date navigator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={() => offsetDate(-1)}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '28px', cursor: 'pointer', padding: '0 8px' }}
        >‹</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '1px' }}>
            {date === todayStr() ? 'TODAY' : formatDate(date).toUpperCase()}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{date}</div>
        </div>
        <button
          onClick={() => offsetDate(1)}
          disabled={date >= todayStr()}
          style={{ background: 'none', border: 'none', color: date >= todayStr() ? 'var(--border)' : 'var(--accent)', fontSize: '28px', cursor: date >= todayStr() ? 'default' : 'pointer', padding: '0 8px' }}
        >›</button>
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
              {remaining < 0 ? `${Math.abs(Math.round(remaining))} over` : `${Math.round(remaining)} left`}
            </span>
          </div>
        </div>
      </div>

      {/* Macro bars */}
      <MacroBars totals={totals} targets={targets} />

      {/* Meal entries */}
      <div className="section-title">TODAY'S LOG</div>

      {meals.length === 0 && (
        <div style={{ color: 'var(--muted)', fontSize: '14px', textAlign: 'center', padding: '24px 0', marginBottom: '12px' }}>
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
            <button className="delete-btn" onClick={() => deleteMeal(date, meal.id)}>✕</button>
          </div>
        </div>
      ))}

      <button className="add-meal-btn" onClick={() => setAdding(true)}>
        <span style={{ fontSize: '20px', lineHeight: 1 }}>+</span> Log a meal
      </button>

      {/* Add meal bottom sheet */}
      {adding && (
        <>
          <div
            onClick={closeSheet}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 80 }}
          />
          <div
            className={`bottom-sheet${addClosing ? ' closing' : ''}`}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
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
            <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '12px auto 20px' }} />
            <AddMealSheet date={date} onClose={closeSheet} />
          </div>
        </>
      )}
    </div>
  );
}
