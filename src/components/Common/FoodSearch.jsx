import React, { useState, useRef } from 'react';
import { searchUSDA, searchOFF, scaleMacros } from '../../utils/foodDatabase';

export default React.memo(function FoodSearch({
  onSelect,
  placeholder = 'Search food database...',
}) {
  const [query, setQuery] = useState('');
  const [state, setState] = useState({
    results: [],
    loading: false,
    error: null,
  });
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState(100);
  const debounceRef = useRef(null);

  const { results, loading, error } = state;

  async function handleSearch(val) {
    setQuery(val);
    clearTimeout(debounceRef.current);
    setState({ results: [], loading: false, error: null });
    setSelected(null);

    if (!val.trim() || val.trim().length < 3) return;

    debounceRef.current = setTimeout(async () => {
      setState((prev) => ({ ...prev, loading: true }));

      try {
        const [usdaRes, offRes] = await Promise.all([
          searchUSDA(val).catch(() => []),
          searchOFF(val).catch(() => []),
        ]);

        const combined = [...usdaRes];
        offRes.forEach((r) => {
          if (!combined.some((c) => c.name.toLowerCase() === r.name.toLowerCase())) {
            combined.push(r);
          }
        });

        const queryWords = val
          .toLowerCase()
          .split(' ')
          .filter((w) => w.length > 2);

        const sorted = combined
          .map((r) => {
            const nameLower = r.name.toLowerCase();
            let score = 0;
            queryWords.forEach((word) => {
              if (nameLower.includes(word)) score += 2;
              if (nameLower.startsWith(word)) score += 1;
            });
            if (r.source === 'USDA' && score > 0) score += 0.5;
            return { ...r, score };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);

        setState({
          query: val,
          results: sorted,
          loading: false,
          error: sorted.length === 0 ? 'No results found — try a different search term' : null,
        });
      } catch {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Search failed — check your connection',
        }));
      }
    }, 800);
  }

  function handleSelect(food) {
    setSelected(food);
    setAmount(food.servingSize || 100);
    setState((prev) => ({ ...prev, results: [] }));
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
    setState({ query: '', results: [], loading: false, error: null });
    setSelected(null);
  }

  const scaled = selected ? scaleMacros(selected, amount) : null;

  return (
    <div>
      {!selected && (
        <div>
          <input
            className="input"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ marginBottom: '8px' }}
          />
          {loading && (
            <div
              style={{
                fontSize: '12px',
                color: 'var(--muted)',
                textAlign: 'center',
                padding: '8px 0',
              }}
            >
              Searching...
            </div>
          )}
          {error && (
            <div
              style={{
                fontSize: '12px',
                color: 'var(--muted)',
                textAlign: 'center',
                padding: '8px 0',
              }}
            >
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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>
                    {food.name}
                  </div>
                  {food.brand && (
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{food.brand}</div>
                  )}
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                    P {food.protein}g · C {food.carbs}g · F {food.fat}g · per {food.servingSize}
                    {food.servingUnit}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: '22px',
                      color: 'var(--accent)',
                    }}
                  >
                    {food.calories}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600 }}>
                    kcal
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
                    {food.source}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && scaled && (
        <div>
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius)',
              padding: '16px',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>
                  {selected.name}
                </div>
                {selected.brand && (
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{selected.brand}</div>
                )}
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                  {selected.source}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                fontWeight: 600,
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Amount ({selected.servingUnit || 'g'})
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}
            >
              <button
                onClick={() => setAmount((a) => Math.max(1, (parseFloat(a) || 100) - 10))}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '18px',
                  width: '40px',
                  height: '40px',
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
                value={amount}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '') {
                    setAmount('');
                    return;
                  }
                  const val = parseFloat(raw);
                  if (!isNaN(val) && val > 0) setAmount(val);
                }}
                style={{ flex: 1, textAlign: 'center', fontSize: '20px', padding: '8px' }}
              />
              <button
                onClick={() => setAmount((a) => (parseFloat(a) || 100) + 10)}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '18px',
                  width: '40px',
                  height: '40px',
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

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '24px',
                    color: 'var(--accent)',
                  }}
                >
                  {scaled.calories}
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
                      fontSize: '20px',
                      color: 'var(--text)',
                    }}
                  >
                    {scaled[key]}g
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
          </div>

          <button className="btn-primary" onClick={handleConfirm} style={{ marginBottom: '8px' }}>
            USE THIS FOOD
          </button>
          <button
            onClick={() => setSelected(null)}
            style={{
              width: '100%',
              padding: '10px',
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Search again
          </button>
        </div>
      )}
    </div>
  );
});
