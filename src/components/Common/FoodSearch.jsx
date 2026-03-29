import React, { useState, useRef } from 'react';
import { searchFoodDatabase, scaleMacros } from '../../utils/foodDatabase';

export default function FoodSearch({ onSelect, placeholder = 'Search food database...' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState(100);
  const debounceRef = useRef(null);

  function handleSearch(val) {
    setQuery(val);
    setSelected(null);
    setError(null);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchFoodDatabase(val);
        setResults(res);
        if (res.length === 0) setError('No results found — try a different search term');
      } catch {
        setError('Search failed — check your connection');
      } finally {
        setLoading(false);
      }
    }, 500);
  }

  function handleSelect(food) {
    setSelected(food);
    setAmount(food.servingSize || 100);
    setResults([]);
  }

  function handleConfirm() {
    if (!selected) return;
    const scaled = scaleMacros(selected, amount);
    onSelect({
      name: selected.name,
      amount,
      unit: selected.servingUnit || 'g',
      ...scaled,
      source: selected.source,
    });
    setQuery('');
    setSelected(null);
    setResults([]);
  }

  const scaled = selected ? scaleMacros(selected, amount) : null;

  return (
    <div>
      {/* Search input */}
      {!selected && (
        <div style={{ position: 'relative' }}>
          <input
            className="input"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ marginBottom: '8px' }}
          />
          {loading && (
            <div style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center', padding: '8px 0' }}>
              Searching...
            </div>
          )}
          {error && (
            <div style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center', padding: '8px 0' }}>
              {error}
            </div>
          )}
          {results.map((food, i) => (
            <div
              key={i}
              onClick={() => handleSelect(food)}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '12px 14px',
                marginBottom: '6px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{food.name}</div>
                  {food.brand && <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{food.brand}</div>}
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                    P {food.protein}g · C {food.carbs}g · F {food.fat}g · per {food.servingSize}{food.servingUnit}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', color: 'var(--accent)' }}>
                    {food.calories}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600 }}>kcal</div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>{food.source}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected food — amount adjuster */}
      {selected && scaled && (
        <div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>{selected.name}</div>
                {selected.brand && <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{selected.brand}</div>}
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{selected.source}</div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '18px', padding: 0 }}
              >✕</button>
            </div>

            {/* Amount input */}
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
              Amount ({selected.servingUnit || 'g'})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <button
                onClick={() => setAmount((a) => Math.max(1, (parseFloat(a) || 100) - 10))}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '18px', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >−</button>
              <input
                className="input"
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '') { setAmount(''); return; }
                  const val = parseFloat(raw);
                  if (!isNaN(val) && val > 0) setAmount(val);
                }}
                style={{ flex: 1, textAlign: 'center', fontSize: '20px', padding: '8px' }}
              />
              <button
                onClick={() => setAmount((a) => (parseFloat(a) || 100) + 10)}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '18px', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >+</button>
            </div>

            {/* Scaled macros */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px', color: 'var(--accent)' }}>{scaled.calories}</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>kcal</div>
              </div>
              {['protein', 'carbs', 'fat', 'fibre'].map((key) => (
                <div key={key} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', color: 'var(--text)' }}>{scaled[key]}g</div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>{key}</div>
                </div>
              ))}
            </div>
          </div>

          <button className="btn-primary" onClick={handleConfirm} style={{ marginBottom: '8px' }}>
            USE THIS FOOD
          </button>
          <button
            onClick={() => setSelected(null)}
            style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: 'var(--muted)', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            Search again
          </button>
        </div>
      )}
    </div>
  );
}