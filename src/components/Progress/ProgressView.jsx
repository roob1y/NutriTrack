import React from 'react';
import useStore from '../../store/useStore';
import { todayStr, sumMacros, getWeekDates, DAY_LABELS } from '../../utils/helpers';

function WeeklyCalChart({ weekDates, mealLog, target }) {
  const data = weekDates.map((d) => sumMacros(mealLog[d] || []).calories);
  const maxVal = Math.max(...data, target, 1);

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '120px' }}>
      {weekDates.map((d, i) => {
        const val = Math.round(data[i]);
        const heightPct = Math.max((val / maxVal) * 100, val > 0 ? 4 : 0);
        const isToday = d === todayStr();
        const over = val > Number(target);

        return (
          <div
            key={d}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              height: '120px',
              justifyContent: 'flex-end',
            }}
          >
            {val > 0 && (
              <div
                style={{
                  fontSize: '10px',
                  color: isToday ? 'var(--accent)' : 'var(--muted)',
                  fontWeight: 600,
                }}
              >
                {val}
              </div>
            )}
            <div
              style={{
                width: '100%',
                height: `${heightPct}%`,
                background:
                  isToday && over
                    ? '#ff4d6d'
                    : isToday
                      ? '#ff8c42'
                      : over
                        ? 'rgba(255, 77, 109, 0.4)'
                        : '#3a3a45',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.4s ease',
                minHeight: val > 0 ? '4px' : '0',
              }}
            />
            <div
              style={{
                fontSize: '10px',
                color: isToday ? 'var(--accent)' : 'var(--muted)',
                fontWeight: 600,
              }}
            >
              {DAY_LABELS[i]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ProgressView() {
  const mealLog = useStore((s) => s.mealLog);
  const targets = useStore((s) => s.targets);

  const today = todayStr();
  const weekDates = getWeekDates(today);

  const weekTotals = weekDates.map((d) => sumMacros(mealLog[d] || []));
  const daysLogged = weekTotals.filter((t) => t.calories > 0).length;
  const avgCals = daysLogged
    ? Math.round(weekTotals.reduce((a, t) => a + t.calories, 0) / daysLogged)
    : 0;
  const avgProtein = daysLogged
    ? Math.round(weekTotals.reduce((a, t) => a + t.protein, 0) / daysLogged)
    : 0;

  const todayTotals = sumMacros(mealLog[today] || []);
  const daysOnTarget = weekTotals.filter(
    (t) => t.calories > 0 && t.calories <= targets.calories,
  ).length;

  return (
    <div>
      <div className="section-title" style={{ marginTop: '4px' }}>
        THIS WEEK
      </div>

      {/* Bar chart */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div
          style={{
            fontSize: '12px',
            color: 'var(--muted)',
            fontWeight: 600,
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Daily calories vs {targets.calories} kcal goal
        </div>
        <WeeklyCalChart weekDates={weekDates} mealLog={mealLog} target={targets.calories} />
        {/* Target line label */}
        <div
          style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px', textAlign: 'right' }}
        >
          🟠 = today · 🔴 = over goal
        </div>
      </div>

      {/* Stats grid */}
      <div className="macro-grid">
        <div className="stat-card">
          <div className="stat-val">{avgCals}</div>
          <div className="stat-label">Avg kcal/day</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{avgProtein}g</div>
          <div className="stat-label">Avg protein/day</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{daysLogged}</div>
          <div className="stat-label">Days logged</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{daysOnTarget}</div>
          <div className="stat-label">Days on target</div>
        </div>
      </div>

      {/* Today's breakdown */}
      <div className="section-title">TODAY'S MACROS</div>
      <div className="card" style={{ marginBottom: '20px' }}>
        {[
          {
            label: 'Calories',
            val: Math.round(todayTotals.calories),
            unit: 'kcal',
            target: targets.calories,
          },
          {
            label: 'Protein',
            val: Math.round(todayTotals.protein),
            unit: 'g',
            target: targets.protein,
          },
          { label: 'Carbs', val: Math.round(todayTotals.carbs), unit: 'g', target: targets.carbs },
          { label: 'Fat', val: Math.round(todayTotals.fat), unit: 'g', target: targets.fat },
          { label: 'Fibre', val: Math.round(todayTotals.fibre), unit: 'g', target: targets.fibre },
        ].map(({ label, val, unit, target }) => {
          const over = val > Number(target);
          return (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '12px',
                marginBottom: '12px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 500 }}>
                {label}
              </span>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '22px',
                    color: over ? 'var(--red)' : 'var(--accent)',
                  }}
                >
                  {val}
                  {unit}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '4px' }}>
                  / {target}
                  {unit}
                </span>
              </div>
            </div>
          );
        })}
        <div
          style={{
            fontSize: '12px',
            color: 'var(--muted)',
            textAlign: 'center',
            marginTop: '-4px',
          }}
        >
          Last entry:{' '}
          {mealLog[today]?.length
            ? `${mealLog[today].length} meals logged`
            : 'Nothing logged today'}
        </div>
      </div>
    </div>
  );
}
