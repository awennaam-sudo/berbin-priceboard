import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin() {
    if (!form.username || !form.password) {
      toast.error('Enter username and password');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('pb_token', data.token);
      localStorage.setItem('pb_user', data.username);
      toast.success(`Welcome, ${data.username}`);
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#f0faf4',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16,
        padding: '40px 32px', width: '100%', maxWidth: 380,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🌿</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a6b3c' }}>Admin Login</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Price Board Management</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="admin"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              background: '#1a6b3c', color: '#fff',
              border: 'none', borderRadius: 10,
              padding: '12px', fontSize: 15,
              fontWeight: 600, marginTop: 4,
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
          <a href="/" style={{ color: '#1a6b3c', textDecoration: 'none' }}>
            ← Back to Price Board
          </a>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: '1.5px solid #d1fae5', borderRadius: 8,
  fontSize: 14, outline: 'none',
  transition: 'border-color 0.15s',
};
