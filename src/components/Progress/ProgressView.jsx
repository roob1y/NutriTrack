import React, { useState } from 'react';
import useStore from '../../store/useStore';
import { todayStr, sumMacros, getWeekDates, DAY_LABELS } from '../../utils/helpers';

// ── Weekly bar chart ──────────────────────────────────────────
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
                background: over ? '#ff4d6d' : isToday ? '#ff8c42' : '#3a3a45',
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

// ── Multi-week trend chart ────────────────────────────────────
// ── Calorie trend line graph ──────────────────────────────────
function CalorieTrend({ mealLog, target }) {
  const [range, setRange] = useState(28);
  const canvasRef = React.useRef(null);

  const rangeHasData = (rangeVal) => {
    if (rangeVal === 28) return data.length > 0;
    if (rangeVal === 56) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 56);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      return (
        Object.keys(mealLog).some((d) => d < cutoffStr && (mealLog[d] || []).length > 0) ||
        Object.keys(mealLog).filter((d) => (mealLog[d] || []).length > 0).length > data.length
      );
    }
    if (rangeVal === 'all') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 56);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      return Object.keys(mealLog).some((d) => d < cutoffStr && (mealLog[d] || []).length > 0);
    }
    return false;
  };

  const data =
    range === 'all'
      ? Object.keys(mealLog)
          .filter((d) => (mealLog[d] || []).length > 0)
          .sort()
          .map((d) => ({ date: d, calories: Math.round(sumMacros(mealLog[d] || []).calories) }))
      : Array.from({ length: range }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (range - 1 - i));
          return d.toISOString().slice(0, 10);
        })
          .filter((d) => (mealLog[d] || []).length > 0)
          .map((d) => ({ date: d, calories: Math.round(sumMacros(mealLog[d] || []).calories) }));

  const hasData = data.some((d) => d.calories > 0);

  React.useEffect(() => {
    if (!canvasRef.current || !hasData) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = 180 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const w = canvas.offsetWidth;
    const h = 180;
    const padding = { top: 20, right: 16, bottom: 30, left: 44 };

    ctx.clearRect(0, 0, w, h);

    const values = data.map((d) => d.calories);
    const minVal = Math.max(0, Math.min(...values.filter((v) => v > 0)) - 200);
    const maxVal = Math.max(target * 1.2, ...values) + 100;

    const toX = (i) =>
      data.length === 1
        ? padding.left + (w - padding.left - padding.right) / 2
        : padding.left + (i / (data.length - 1)) * (w - padding.left - padding.right);

    const toY = (v) =>
      padding.top + (1 - (v - minVal) / (maxVal - minVal)) * (h - padding.top - padding.bottom);

    // Grid lines
    ctx.strokeStyle = '#2a2a35';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * (h - padding.top - padding.bottom);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      const val = maxVal - (i / 4) * (maxVal - minVal);
      ctx.fillStyle = '#7a7a8c';
      ctx.font = '10px DM Sans';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(val), padding.left - 4, y + 4);
    }

    // Target line
    const targetY = toY(target);
    ctx.strokeStyle = 'rgba(255,140,66,0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding.left, targetY);
    ctx.lineTo(w - padding.right, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    const pointsWithData = data.map((d, i) => ({ i, v: d.calories })).filter((d) => d.v > 0);

    if (pointsWithData.length >= 1) {
      if (pointsWithData.length > 1) {
        ctx.beginPath();
        pointsWithData.forEach(({ i, v }, pi) => {
          pi === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v));
        });
        ctx.lineTo(toX(pointsWithData[pointsWithData.length - 1].i), h - padding.bottom);
        ctx.lineTo(toX(pointsWithData[0].i), h - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,140,66,0.06)';
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = '#ff8c42';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        pointsWithData.forEach(({ i, v }, pi) => {
          pi === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v));
        });
        ctx.stroke();
      }

      pointsWithData.forEach(({ i, v }) => {
        ctx.beginPath();
        ctx.arc(toX(i), toY(v), 4, 0, Math.PI * 2);
        ctx.fillStyle = v > target ? '#ff4d6d' : '#ff8c42';
        ctx.fill();
      });
    }

    // X axis labels
    ctx.fillStyle = '#7a7a8c';
    ctx.font = '10px DM Sans';
    ctx.textAlign = 'center';
    const labelCount = Math.min(5, data.length);
    if (labelCount > 1) {
      const step = Math.floor((data.length - 1) / (labelCount - 1));
      for (let i = 0; i < labelCount; i++) {
        const idx = i * step;
        if (idx >= data.length) continue;
        const date = new Date(data[idx].date);
        ctx.fillText(`${date.getDate()}/${date.getMonth() + 1}`, toX(idx), h - padding.bottom + 14);
      }
    } else if (labelCount === 1) {
      const date = new Date(data[0].date);
      ctx.fillText(`${date.getDate()}/${date.getMonth() + 1}`, toX(0), h - padding.bottom + 14);
    }
  }, [data, target, hasData, range]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: '4 weeks', val: 28 },
          { label: '8 weeks', val: 56 },
          { label: 'All time', val: 'all' },
        ].map(({ label, val }) => {
          const enabled = rangeHasData(val);
          return (
            <button
              key={val}
              onClick={() => enabled && setRange(val)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: `1px solid ${range === val ? 'var(--accent)' : 'var(--border)'}`,
                background: range === val ? 'var(--accent)' : 'var(--card)',
                color: range === val ? '#0d0d0f' : enabled ? 'var(--muted)' : 'var(--border)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
                fontWeight: 600,
                cursor: enabled ? 'pointer' : 'not-allowed',
                opacity: enabled ? 1 : 0.4,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {!hasData ? (
        <div
          style={{
            color: 'var(--muted)',
            fontSize: '13px',
            textAlign: 'center',
            padding: '32px 0',
          }}
        >
          No data yet for this range
        </div>
      ) : (
        <canvas ref={canvasRef} style={{ width: '100%', height: '180px', display: 'block' }} />
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginTop: '10px',
          fontSize: '11px',
          color: 'var(--muted)',
          justifyContent: 'flex-end',
        }}
      >
        <span>— target ({target} kcal)</span>
        <span style={{ color: '#ff4d6d' }}>● over</span>
        <span style={{ color: '#ff8c42' }}>● under</span>
      </div>
    </div>
  );
}

// ── Streak calculation ────────────────────────────────────────
function calcStreak(mealLog) {
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = d.toISOString().slice(0, 10);
    if ((mealLog[dateStr] || []).length > 0) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function calcLongestStreak(mealLog) {
  const dates = Object.keys(mealLog)
    .filter((d) => (mealLog[d] || []).length > 0)
    .sort();

  if (dates.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr - prev) / 86400000;
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

// ── Best macro day calculation ────────────────────────────────
function calcBestMacroDay(mealLog, targets) {
  const dates = Object.keys(mealLog).filter((d) => (mealLog[d] || []).length > 0);
  if (dates.length === 0) return null;

  let bestDate = null;
  let bestScore = Infinity;

  dates.forEach((date) => {
    const totals = sumMacros(mealLog[date] || []);
    // Score = sum of percentage distances from each target
    const score =
      Math.abs(totals.calories - targets.calories) / targets.calories +
      Math.abs(totals.protein - targets.protein) / targets.protein +
      Math.abs(totals.carbs - targets.carbs) / targets.carbs +
      Math.abs(totals.fat - targets.fat) / targets.fat +
      Math.abs(totals.fibre - targets.fibre) / targets.fibre;

    if (score < bestScore) {
      bestScore = score;
      bestDate = date;
    }
  });

  if (!bestDate) return null;

  const totals = sumMacros(mealLog[bestDate] || []);
  return { date: bestDate, totals };
}

// ── Main view ─────────────────────────────────────────────────
export default function ProgressView() {
  const mealLog = useStore((s) => s.mealLog) || {};
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

  const currentStreak = calcStreak(mealLog);
  const longestStreak = calcLongestStreak(mealLog);
  const bestDay = calcBestMacroDay(mealLog, targets);

  return (
    <div>
      <div className="section-title" style={{ marginTop: '4px' }}>
        THIS WEEK
      </div>

      {/* This week bar chart */}
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

      {/* Streak stats */}
      <div className="macro-grid">
        <div className="stat-card">
          <div className="stat-val">{currentStreak}</div>
          <div className="stat-label">Current streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{longestStreak}</div>
          <div className="stat-label">Longest streak</div>
        </div>
      </div>

      {/* 4-week trend */}
      <div className="section-title">CALORIE TREND</div>
      <div className="card" style={{ marginBottom: '20px' }}>
        <CalorieTrend mealLog={mealLog} target={targets.calories} />
      </div>

      {/* Best macro day */}
      <div className="section-title">BEST MACRO DAY</div>
      <div className="card" style={{ marginBottom: '20px' }}>
        {bestDay ? (
          <>
            <div
              style={{
                fontSize: '13px',
                color: 'var(--accent)',
                fontWeight: 600,
                marginBottom: '12px',
              }}
            >
              {new Date(bestDay.date).toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '26px',
                    color: 'var(--accent)',
                  }}
                >
                  {Math.round(bestDay.totals.calories)}
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
                    {Math.round(bestDay.totals[key])}g
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
          </>
        ) : (
          <div
            style={{
              color: 'var(--muted)',
              fontSize: '13px',
              textAlign: 'center',
              padding: '16px 0',
            }}
          >
            No data yet — start logging meals to see your best day
          </div>
        )}
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
          {mealLog[today]?.length
            ? `${mealLog[today].length} meals logged`
            : 'Nothing logged today'}
        </div>
      </div>
    </div>
  );
}
