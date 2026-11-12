import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Loader2, Eye } from 'lucide-react';
import Logo from './Logo';
import { authErrorMessage } from '../services/firebase';

const inputCls = 'w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500';

// Pantalla de ingreso: profe o alumno, iniciar sesión o crear cuenta (el alumno con su código).
export default function AuthScreen({ data }) {
  const { status, auth, enterDemo, error } = data;
  const inviteFromUrl = (() => {
    try { return new URLSearchParams(window.location.search).get('invite') || ''; } catch (e) { return ''; }
  })();

  const [role, setRole] = useState(inviteFromUrl ? 'student' : 'coach');
  const [isSignUp, setIsSignUp] = useState(Boolean(inviteFromUrl));
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', code: inviteFromUrl });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-400 text-sm">
        <Logo variant="full" />
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
        <span>Conectando…</span>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      if (status === 'needsProfile') {
        await auth.completeCoachProfile({ name: form.name, phone: form.phone });
      } else if (!isSignUp) {
        await auth.signIn(form.email, form.password);
      } else if (role === 'coach') {
        await auth.signUpCoach(form);
      } else {
        await auth.signUpStudent(form);
        if (inviteFromUrl) window.history.replaceState({}, '', window.location.pathname);
      }
    } catch (err) {
      setMessage({ kind: 'error', text: authErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (!form.email) { setMessage({ kind: 'error', text: 'Escribí tu email y tocá de nuevo "Olvidé mi contraseña".' }); return; }
    try {
      await auth.resetPassword(form.email);
      setMessage({ kind: 'ok', text: 'Te mandamos un email para crear una contraseña nueva.' });
    } catch (err) {
      setMessage({ kind: 'error', text: authErrorMessage(err) });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5">
        <div className="flex justify-center"><Logo variant="full" /></div>

        <form onSubmit={submit} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          {status === 'needsProfile' ? (
            <>
              <h1 className="text-lg font-black text-white">Completá tu cuenta de profe</h1>
              <p className="text-xs text-slate-400">
                Tu usuario no está vinculado a ningún espacio. Si sos alumno, pedile a tu profe un código de invitación y
                creá la cuenta con ese código.
              </p>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800" role="tablist" aria-label="Tipo de cuenta">
                {[['coach', 'Soy profe', ShieldCheck], ['student', 'Soy alumno', UserCheck]].map(([id, label, Icon]) => (
                  <button key={id} type="button" role="tab" aria-selected={role === id} onClick={() => setRole(id)}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-colors ${role === id ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
                    <Icon className="w-4 h-4" aria-hidden="true" />{label}
                  </button>
                ))}
              </div>
              <h1 className="text-lg font-black text-white">{isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
            </>
          )}

          {(status === 'needsProfile' || (isSignUp && role === 'coach')) && (
            <>
              <label className="block text-xs text-slate-300 font-semibold">Nombre y apellido
                <input className={`${inputCls} mt-1`} value={form.name} onChange={set('name')} required autoComplete="name" />
              </label>
              <label className="block text-xs text-slate-300 font-semibold">WhatsApp
                <input className={`${inputCls} mt-1`} value={form.phone} onChange={set('phone')} inputMode="tel" placeholder="+54 9 ..." autoComplete="tel" />
              </label>
            </>
          )}

          {status !== 'needsProfile' && (
            <>
              <label className="block text-xs text-slate-300 font-semibold">Email
                <input className={`${inputCls} mt-1`} type="email" value={form.email} onChange={set('email')} required autoComplete="email" />
              </label>
              <label className="block text-xs text-slate-300 font-semibold">Contraseña
                <input className={`${inputCls} mt-1`} type="password" value={form.password} onChange={set('password')} required minLength={6}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'} />
              </label>
              {isSignUp && role === 'student' && (
                <label className="block text-xs text-slate-300 font-semibold">Código de invitación de tu profe
                  <input className={`${inputCls} mt-1 font-mono uppercase tracking-widest`} value={form.code} onChange={set('code')} required
                    minLength={8} maxLength={8} placeholder="ABCD2345" autoCapitalize="characters" />
                </label>
              )}
            </>
          )}

          {(message || error) && (
            <p role={message?.kind === 'ok' ? 'status' : 'alert'} className={`text-xs font-semibold ${message?.kind === 'ok' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {message?.text || error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-volt w-full py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 disabled:opacity-60">
            {busy && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            {status === 'needsProfile' ? 'Crear mi espacio de profe' : isSignUp ? 'Crear cuenta' : 'Entrar'}
          </button>

          {status !== 'needsProfile' && (
            <div className="flex items-center justify-between text-xs">
              <button type="button" onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }} className="text-emerald-400 font-bold hover:underline">
                {isSignUp ? 'Ya tengo cuenta' : role === 'student' ? 'Tengo un código de invitación' : 'Crear cuenta de profe'}
              </button>
              {!isSignUp && (
                <button type="button" onClick={forgot} className="text-slate-400 hover:text-white">Olvidé mi contraseña</button>
              )}
            </div>
          )}
          {status === 'needsProfile' && (
            <button type="button" onClick={() => auth.signOut()} className="w-full text-xs text-slate-400 hover:text-white">Salir y usar otra cuenta</button>
          )}
        </form>

        <button type="button" onClick={enterDemo} className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-emerald-400">
          <Eye className="w-4 h-4" aria-hidden="true" /> Ver la demo con datos de ejemplo
        </button>
      </div>
    </div>
  );
}
