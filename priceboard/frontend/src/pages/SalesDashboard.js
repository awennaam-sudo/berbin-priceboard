import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';

const WORKERS = ['Sandra', 'Nii', 'Angela', 'Hannah'];
const COLORS = { Sandra: '#1a6b3c', Nii: '#1e40af', Angela: '#92400e', Hannah: '#7c3aed' };

function formatPrice(p) {
  return `GH₵ ${parseFloat(p || 0).toFixed(2)}`;
}

function formatTime(d) {
  return new Date(d).toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' });
}

export default function SalesDashboard() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function fetchData() {
    try {
      const [todayRes, historyRes] = await Promise.all([
        api.get('/sales/today'),
        api.get('/sales'),
      ]);
      setData(todayRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f0faf4' }}>
      <header style={{
        background: '#1a6b3c', color: '#fff',
        padding: '16px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>📊 Sales Dashboard</h1>
          <p style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
            {new Date().toLocaleDateString('en-GH', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate('/admin')}
            style={{
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: 'none', padding: '7px 14px',
              borderRadius: 8, fontSize: 13, fontWeight: 600,
            }}
          >
            Price Board
          </button>
          <button
            onClick={() => { localStorage.removeItem('pb_token'); navigate('/admin/login'); }}
            style={{
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: 'none', padding: '7px 14px',
              borderRadius: 8, fontSize: 13, fontWeight: 600,
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ padding: 16, maxWidth: 700, margin: '0 auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Loading...</p>
        ) : (
          <>
            {/* Grand Total */}
            <div style={{
              background: '#1a6b3c', color: '#fff',
              borderRadius: 16, padding: '20px 24px',
              marginTop: 20, textAlign: 'center',
            }}>
              <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>TODAY'S TOTAL SALES</p>
              <p style={{ fontSize: 36, fontWeight: 700 }}>
                {formatPrice(data?.grandTotal || 0)}
              </p>
              <p style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>Auto-refreshes every 30s</p>
            </div>

            {/* Worker Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
              {data?.summary?.map(w => (
                <div key={w.worker} style={{
                  background: '#fff', borderRadius: 14,
                  padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                  borderTop: `4px solid ${COLORS[w.worker] || '#1a6b3c'}`,
                }}>
                  <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{w.worker}</p>
                  <p style={{
                    fontSize: 22, fontWeight: 700,
                    color: COLORS[w.worker] || '#1a6b3c',
                  }}>
                    {formatPrice(w.total)}
                  </p>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                    {w.entries.length} entr{w.entries.length !== 1 ? 'ies' : 'y'} today
                  </p>
                  {w.entries.map(e => (
                    <div key={e.id} style={{
                      marginTop: 8, paddingTop: 8,
                      borderTop: '1px solid #f3f4f6',
                      fontSize: 12, color: '#6b7280',
                    }}>
                      <span style={{ fontWeight: 600, color: '#374151' }}>
                        {formatPrice(e.amount)}
                      </span>
                      {' · '}{formatTime(e.date)}
                      {e.note && <span> · {e.note}</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* History */}
            <div style={{ marginTop: 28 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#374151' }}>
                Full History
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {history.slice(0, 30).map(e => (
                  <div key={e.id} style={{
                    background: '#fff', borderRadius: 10,
                    padding: '12px 14px',
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: COLORS[e.worker] || '#1a6b3c',
                      }} />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{e.worker}</p>
                        <p style={{ fontSize: 12, color: '#9ca3af' }}>
                          {new Date(e.date).toLocaleDateString('en-GH', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })} · {formatTime(e.date)}
                          {e.note && ` · ${e.note}`}
                        </p>
                      </div>
                    </div>
                    <p style={{ fontWeight: 700, color: '#1a6b3c', fontSize: 15 }}>
                      {formatPrice(e.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
