import React, { useState } from 'react';
import { registerUser, loginUser } from './api';
import { useAuth } from './auth';

export default function AuthPanel() {
  const { saveAuth, logout, user } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      if (isRegister) {
        const res = await registerUser({ name: form.name, email: form.email, password: form.password });
        saveAuth(res.data.user, res.data.token);
      } else {
        const res = await loginUser({ email: form.email, password: form.password });
        saveAuth(res.data.user, res.data.token);
      }
    } catch (err) {
      console.error(err);
      setErr(err.response?.data?.message || 'Auth failed');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm text-slate-300">Hello, <span className="font-semibold text-slate-100">{user.name}</span></div>
        <button onClick={logout} className="text-xs px-3 py-1 bg-slate-800 rounded">Logout</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      {isRegister && (
        <input name="name" value={form.name} onChange={onChange} placeholder="Name" className="rounded px-2 py-1 text-sm bg-slate-900/60 border-slate-700" />
      )}
      <input name="email" value={form.email} onChange={onChange} placeholder="Email" className="rounded px-2 py-1 text-sm bg-slate-900/60 border-slate-700" />
      <input type="password" name="password" value={form.password} onChange={onChange} placeholder="Password" className="rounded px-2 py-1 text-sm bg-slate-900/60 border-slate-700" />
      <button type="submit" disabled={loading} className="px-3 py-1 rounded bg-indigo-500 text-white text-sm">{loading ? '...' : (isRegister ? 'Sign up' : 'Sign in')}</button>
      <button type="button" onClick={() => setIsRegister(v => !v)} className="text-xs text-slate-300 ml-2">{isRegister ? 'Have an account?' : 'Create account'}</button>
      {err && <div className="text-rose-400 text-xs ml-2">{err}</div>}
    </form>
  );
}
