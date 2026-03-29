import React, { useState } from 'react';
import useStore from '../../store/useStore';

function TargetEditor({ onClose }) {
  const targets = useStore((s) => s.targets);
  const setTargets = useStore((s) => s.setTargets);
  const [form, setForm] = useState({ ...targets });

  function handleSave() {
    setTargets({
      calories: Number(form.calories) || 1800,
      protein: Number(form.protein) || 140,
      carbs: Number(form.carbs) || 200,
      fat: Number(form.fat) || 55,
      fibre: Number(form.fibre) || 35,
    });
    onClose();
  }

  const fields = [
    { key: 'calories', label: 'Daily Calories', unit: 'kcal' },
    { key: 'protein', label: 'Protein', unit: 'g' },
    { key: 'carbs', label: 'Carbohydrates', unit: 'g' },
    { key: 'fat', label: 'Fat', unit: 'g' },
    { key: 'fibre', label: 'Fibre', unit: 'g' },
  ];

  return (
    <div>
      <div className="section-title" style={{ marginTop: '4px' }}>
        DAILY TARGETS
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
        Set your daily nutrition goals.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
        {fields.map(({ key, label, unit }) => (
          <div key={key}>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                fontWeight: 600,
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {label} ({unit})
            </div>
            <input
              className="input"
              type="number"
              inputMode="numeric"
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <button className="btn-primary" onClick={handleSave} style={{ marginBottom: '10px' }}>
        SAVE TARGETS
      </button>
      <button className="btn-secondary" onClick={onClose}>
        CANCEL
      </button>
    </div>
  );
}

export default function SettingsView({ onClose }) {
  const targets = useStore((s) => s.targets);
  const resetAll = useStore((s) => s.resetAll);
  const [editing, setEditing] = useState(false);
  const [editClosing, setEditClosing] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  function closeEditor() {
    setEditClosing(true);
    setTimeout(() => {
      setEditing(false);
      setEditClosing(false);
    }, 280);
  }

  function handleReset() {
    resetAll();
    setShowResetModal(false);
    window.location.reload();
  }

  if (editing) {
    return <TargetEditor onClose={closeEditor} />;
  }

  return (
    <div>
      <div className="section-title" style={{ marginTop: '4px' }}>
        SETTINGS
      </div>

      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          marginBottom: '20px',
        }}
      >
        <div className="settings-row" onClick={() => setEditing(true)}>
          <div>
            <div className="settings-row-label">Daily Targets</div>
            <div className="settings-row-sub">
              {targets.calories} kcal · {targets.protein}g protein · {targets.carbs}g carbs ·{' '}
              {targets.fat}g fat
            </div>
          </div>
          <div className="settings-row-arrow">›</div>
        </div>
        <div
          className="settings-row"
          onClick={() => setShowResetModal(true)}
          style={{ borderBottom: 'none' }}
        >
          <div>
            <div className="settings-row-label" style={{ color: 'var(--red)' }}>
              Reset All Data
            </div>
            <div className="settings-row-sub">Clear all logs, recipes and settings</div>
          </div>
          <div style={{ color: 'var(--red)', fontSize: '18px' }}>›</div>
        </div>
      </div>

      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '16px',
        }}
      >
        <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text)' }}>NutriTrack v1.0</strong>
          <br />
          Nutrition tracking made easy
        </div>
      </div>

      {showResetModal && (
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
                fontSize: '24px',
                letterSpacing: '1.5px',
                marginBottom: '8px',
              }}
            >
              RESET ALL DATA?
            </div>
            <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '24px' }}>
              This will permanently delete all your meal logs, recipes, meal plans and settings.
              This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowResetModal(false)}
                style={{
                  flex: 1,
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
                NO THANKS
              </button>
              <button
                onClick={handleReset}
                style={{
                  flex: 1,
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
                YES, RESET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
