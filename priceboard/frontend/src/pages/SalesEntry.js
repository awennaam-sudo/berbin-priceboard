import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api';

const WORKERS = ['Sandra', 'Nii', 'Angela', 'Hannah'];

export default function SalesEntry() {
  const [form, setForm] = useState({ worker: '', amount: '', note: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!form.worker || !form.amount) {
      toast.error('Please select your name and enter amount');
      return;
    }
    setLoading(true);
    try {
      await api.post('/sales', form);
      setSubmitted(true);
      toast.success('Sales recorded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh', background: '#f0faf4',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a6b3c', marginBottom: 8 }}>
            Sales Recorded!
          </h2>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>
            GH₵ {parseFloat(form.amount).toFixed(2)} recorded for {form.worker}
          </p>
          <button
            onClick={() => { setForm({ worker: '', amount: '', note: '' }); setSubmitted(false); }}
            style={{
              background: '#1a6b3c', color: '#fff',
              border: 'none', borderRadius: 10,
              padding: '12px 28px', fontSize: 15, fontWeight: 600,
            }}
          >
            Record Another
          </button>
          <br /><br />
          <a href="/" style={{ color: '#1a6b3c', fontSize: 13 }}>← Back to Price Board</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0faf4' }}>
      <header style={{
        background: '#1a6b3c', color: '#fff',
        padding: '20px', textAlign: 'center',
      }}>
        <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 4, letterSpacing: 1 }}>BERBIN ENTERPRISE</p>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Daily Sales Entry</h1>
        <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
          {new Date().toLocaleDateString('en-GH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </header>

      <div style={{ padding: 20, maxWidth: 420, margin: '0 auto' }}>
        <div style={{
          background: '#fff', borderRadius: 16,
          padding: '28px 24px', marginTop: 24,
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#374151' }}>
            Enter Your Sales
          </h2>

          {/* Worker Selection */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Who are you?</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {WORKERS.map(w => (
                <button
                  key={w}
                  onClick={() => setForm(f => ({ ...f, worker: w }))}
                  style={{
                    padding: '14px',
                    borderRadius: 10,
                    border: form.worker === w ? 'none' : '1.5px solid #e5e7eb',
                    background: form.worker === w ? '#1a6b3c' : '#fff',
                    color: form.worker === w ? '#fff' : '#374151',
                    fontWeight: 600, fontSize: 15,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Total Sales Amount (GH₵)</label>
            <input
              type="number"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
              min="0"
              step="0.01"
              style={{
                width: '100%', padding: '12px',
                border: '1.5px solid #e5e7eb', borderRadius: 10,
                fontSize: 20, fontWeight: 700, color: '#1a6b3c',
                outline: 'none', textAlign: 'center',
              }}
            />
          </div>

          {/* Note */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Note (optional)</label>
            <input
              type="text"
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="e.g. Market day, slow day..."
              style={{
                width: '100%', padding: '10px 12px',
                border: '1.5px solid #e5e7eb', borderRadius: 10,
                fontSize: 14, outline: 'none',
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', background: '#1a6b3c', color: '#fff',
              border: 'none', borderRadius: 10,
              padding: '14px', fontSize: 16, fontWeight: 700,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Submitting...' : 'Submit Sales'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
          <a href="/" style={{ color: '#1a6b3c', textDecoration: 'none' }}>← Back to Price Board</a>
        </p>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: 13, fontWeight: 600, color: '#374151',
  display: 'block', marginBottom: 8,
};
