import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';

const CATEGORY_META = {
  frozen_foods: { label: 'Frozen Foods', emoji: '🧊', color: '#1e40af', bg: '#dbeafe' },
  grains:       { label: 'Grains',       emoji: '🌾', color: '#92400e', bg: '#fef3c7' },
  vegetables:   { label: 'Vegetables',   emoji: '🥦', color: '#1a6b3c', bg: '#e8f5ee' },
};

function formatPrice(price) {
  return `GH₵ ${parseFloat(price).toFixed(2)}`;
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-GH', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function PriceBoard() {
  const [products, setProducts] = useState([]);
  const [lastFetched, setLastFetched] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
      setLastFetched(new Date());
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 30000);
    return () => clearInterval(interval);
  }, [fetchProducts]);

  const categories = ['all', 'frozen_foods', 'grains', 'vegetables'];
  const filtered = activeCategory === 'all' ? products : products.filter(p => p.category === activeCategory);
  const grouped = filtered.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  const lastUpdate = products.length > 0
    ? products.reduce((latest, p) =>
        new Date(p.updated_at) > new Date(latest) ? p.updated_at : latest,
        products[0].updated_at)
    : null;

  return (
    <div style={{ minHeight: '100vh', background: '#f0faf4' }}>
      <header style={{ background: '#1a6b3c', color: '#fff', padding: '24px 20px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, opacity: 0.75, marginBottom: 4, letterSpacing: 1 }}>PRICE BOARD</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Today's Prices</h1>
        {lastUpdate && <p style={{ fontSize: 12, opacity: 0.7 }}>Last updated: {formatTime(lastUpdate)}</p>}
        {lastFetched && <p style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>Live · refreshes every 30s</p>}
      </header>

      <div style={{ display: 'flex', gap: 8, padding: '16px 16px 0', overflowX: 'auto', justifyContent: 'center', flexWrap: 'wrap' }}>
        {categories.map(cat => {
          const meta = cat === 'all' ? null : CATEGORY_META[cat];
          const active = activeCategory === cat;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '7px 16px', borderRadius: 20,
              border: active ? 'none' : '1px solid #d1fae5',
              background: active ? '#1a6b3c' : '#fff',
              color: active ? '#fff' : '#1a6b3c',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: active ? '0 2px 8px rgba(26,107,60,0.25)' : 'none',
            }}>
              {meta ? `${meta.emoji} ${meta.label}` : '🗂 All Items'}
            </button>
          );
        })}
      </div>

      <main style={{ padding: 16, maxWidth: 700, margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Loading prices...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>No prices listed yet.</div>
        ) : (
          Object.entries(grouped).map(([category, items]) => {
            const meta = CATEGORY_META[category];
            return (
              <section key={category} style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ background: meta.bg, color: meta.color, borderRadius: 8, padding: '4px 12px', fontSize: 13, fontWeight: 700 }}>
                    {meta.emoji} {meta.label}
                  </span>
                  <span style={{ color: '#9ca3af', fontSize: 12 }}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map(product => (
                    <div key={product.id} style={{
                      background: '#fff', borderRadius: 12, padding: '14px 16px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.07)', opacity: product.in_stock ? 1 : 0.5,
                    }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 15 }}>{product.name}</p>
                        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                          per {product.unit}
                          {!product.in_stock && <span style={{ marginLeft: 8, color: '#dc2626', background: '#fee2e2', borderRadius: 4, padding: '1px 6px', fontSize: 11 }}>Out of stock</span>}
                        </p>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: '#1a6b3c', background: '#e8f5ee', padding: '6px 12px', borderRadius: 8 }}>
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '24px 16px', color: '#9ca3af', fontSize: 12 }}>
        <a href="/sales" style={{
          display: 'inline-block', background: '#1a6b3c', color: '#fff',
          padding: '12px 32px', borderRadius: 12, fontWeight: 700, fontSize: 15,
          textDecoration: 'none', marginBottom: 16,
          boxShadow: '0 2px 8px rgba(26,107,60,0.25)',
        }}>
          💰 Enter Daily Sales
        </a>
        <br />
        <a href="/admin/login" style={{ color: '#9ca3af', textDecoration: 'none' }}>Admin</a>
      </footer>
    </div>
  );
}
