import React, { useState, useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { KeepAwake } from '@capacitor-community/keep-awake';
import MealsView from './components/Meals/MealsView';
import PlannerView from './components/Planner/PlannerView';
import ProgressView from './components/Progress/ProgressView';
import SettingsView from './components/Settings/SettingsView';

export default function App() {
  const [currentView, setCurrentView] = useState('log');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsClosing, setSettingsClosing] = useState(false);

  // ── Android back button ───────────────────────────────────
  useEffect(() => {
    const handler = CapApp.addListener('backButton', () => {
      if (settingsOpen) {
        closeSettings();
        return;
      }
      if (currentView !== 'log') {
        setCurrentView('log');
        return;
      }
      // On root view — minimise app rather than exit
      CapApp.minimizeApp();
    });
    return () => {
      handler.then((h) => h.remove());
    };
  }, [currentView, settingsOpen]);

  // ── Keep screen awake on Log and Planner ─────────────────
  useEffect(() => {
    const shouldKeepAwake = currentView === 'log' || currentView === 'planner';
    if (shouldKeepAwake) {
      KeepAwake.keepAwake().catch(() => {});
    } else {
      KeepAwake.allowSleep().catch(() => {});
    }
    return () => {
      KeepAwake.allowSleep().catch(() => {});
    };
  }, [currentView]);

  function closeSettings() {
    setSettingsClosing(true);
    setTimeout(() => {
      setSettingsOpen(false);
      setSettingsClosing(false);
    }, 280);
  }

  const views = [
    { id: 'log', label: 'Log' },
    { id: 'planner', label: 'Planner' },
    { id: 'progress', label: 'Progress' },
  ];

  return (
    <>
      <header>
        <div className="logo">
          <span style={{ color: 'var(--accent)' }}>Nutri</span>
          <span style={{ color: 'var(--text)' }}>TRACK</span>
        </div>
        <div className="header-right">
          <div className="date-badge">
            {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="nav">
        {views.map(({ id, label }) => (
          <button
            key={id}
            className={`nav-btn${currentView === id ? ' active' : ''}`}
            onClick={() => setCurrentView(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="view active">
        {currentView === 'log' && <MealsView />}
        {currentView === 'planner' && <PlannerView />}
        {currentView === 'progress' && <ProgressView />}
      </div>

      {settingsOpen && (
        <>
          <div
            onClick={closeSettings}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 80 }}
          />
          <div
            className={`bottom-sheet${settingsClosing ? ' closing' : ''}`}
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
            <SettingsView onClose={closeSettings} />
          </div>
        </>
      )}
    </>
  );
}
