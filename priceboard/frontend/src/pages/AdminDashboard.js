import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';

const CATEGORIES = [
  { value: 'frozen_foods', label: '🧊 Frozen Foods' },
  { value: 'grains',       label: '🌾 Grains' },
  { value: 'vegetables',   label: '🥦 Vegetables' },
];

const UNITS = ['kg', 'bag', 'crate', 'piece', 'dozen', 'litre', 'carton', 'bunch'];
const EMPTY_FORM = { name: '', category: 'frozen_foods', price: '', unit: 'kg', in_stock: true };

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const username = localStorage.getItem('pb_user') || 'Admin';

  async function fetchProducts() {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProducts(); }, []);

  function handleLogout() {
    localStorage.removeItem('pb_token');
    localStorage.removeItem('pb_user');
    navigate('/admin/login');
  }

  async function handleSave() {
    if (!form.name.trim() || !form.price) {
      toast.error('Name and price are required');
      return;
    }
    try {
      if (editing) {
        await api.put(`/products/${editing}`, form);
        toast.success('Price updated!');
      } else {
        await api.post('/products', form);
        toast.success('Product added!');
      }
      setForm(EMPTY_FORM);
      setEditing(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product removed');
      fetchProducts();
    } catch {
      toast.error('Delete failed');
    }
  }

  function startEdit(product) {
    setEditing(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      unit: product.unit,
      in_stock: product.in_stock === 1 || product.in_stock === true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const grouped = products.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: '100vh', background: '#f0faf4' }}>
      <header style={{
        background: '#1a6b3c', color: '#fff',
        padding: '16px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>🌿 Price Board Admin</h1>
          <p style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>Logged in as {username}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="/" target="_blank" rel="noreferrer" style={{
            background: '#fff', color: '#1a6b3c',
            padding: '7px 14px', borderRadius: 8,
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}>
            View Board
          </a>
          <a href="/admin/sales" style={{
            background: '#fff', color: '#1a6b3c',
            padding: '7px 14px', borderRadius: 8,
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}>
            📊 Sales
          </a>
          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.15)', color: '#fff',
            border: 'none', padding: '7px 14px',
            borderRadius: 8, fontSize: 13, fontWeight: 600,
          }}>
            Logout
          </button>
        </div>
      </header>

      <main style={{ padding: 16, maxWidth: 700, margin: '0 auto' }}>
        <div style={{
          background: '#fff', borderRadius: 14,
          padding: '20px', marginTop: 20,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1a6b3c' }}>
            {editing ? '✏️ Edit Product' : '➕ Add New Product'}
          </h2>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Product Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Tilapia Fish, Basmati Rice..." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Unit</label>
              <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} style={inputStyle}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Price (GH₵)</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="0.00" min="0" step="0.01" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 20 }}>
              <input type="checkbox" id="in_stock" checked={form.in_stock}
                onChange={e => setForm(f => ({ ...f, in_stock: e.target.checked }))}
                style={{ width: 16, height: 16, accentColor: '#1a6b3c' }} />
              <label htmlFor="in_stock" style={{ fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>In Stock</label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={handleSave} style={{
              background: '#1a6b3c', color: '#fff', border: 'none',
              borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 14,
            }}>
              {editing ? 'Save Changes' : 'Add Product'}
            </button>
            {editing && (
              <button onClick={() => { setForm(EMPTY_FORM); setEditing(null); }} style={{
                background: '#f3f4f6', color: '#374151', border: 'none',
                borderRadius: 8, padding: '10px 20px', fontWeight: 600, fontSize: 14,
              }}>
                Cancel
              </button>
            )}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#374151' }}>
            All Products ({products.length})
          </h2>
          {loading ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>Loading...</p>
          ) : products.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>No products yet. Add your first product above!</p>
          ) : (
            Object.entries(grouped).map(([category, items]) => {
              const catMeta = { frozen_foods: '🧊 Frozen Foods', grains: '🌾 Grains', vegetables: '🥦 Vegetables' };
              return (
                <div key={category} style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                    {catMeta[category]}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {items.map(p => (
                      <div key={p.id} style={{
                        background: '#fff', borderRadius: 10, padding: '12px 14px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)', opacity: p.in_stock ? 1 : 0.6,
                      }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 14 }}>
                            {p.name}
                            {!p.in_stock && <span style={{ marginLeft: 8, fontSize: 11, color: '#dc2626', background: '#fee2e2', padding: '1px 6px', borderRadius: 4 }}>Out of stock</span>}
                          </p>
                          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>GH₵ {parseFloat(p.price).toFixed(2)} / {p.unit}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => startEdit(p)} style={{ background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 13, fontWeight: 600 }}>Edit</button>
                          <button onClick={() => handleDelete(p.id, p.name)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 13, fontWeight: 600 }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

const labelStyle = { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 };
const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' };
