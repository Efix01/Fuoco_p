import React, { useState } from 'react';
import { Flame, ShieldCheck, Lock, User as UserIcon, Loader2, AlertCircle, Mail, Briefcase, Badge, MapPin, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../services/supabase';

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Nuova variabile di stato per la visibilità della password

  // Registration fields
  const [fullName, setFullName] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const [rank, setRank] = useState('');
  const [unit, setUnit] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        // REGISTRAZIONE
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              badge_id: badgeId,
              rank: rank,
              unit: unit
            }
          }
        });

        if (authError) throw authError;

        if (data.user && !data.session) {
          setMessage('Registrazione completata! Controlla la tua email per confermare l\'account.');
          setIsSignUp(false); // Torna al login
        } else if (data.user && data.session) {
          onLogin(data.user);
        }
      } else {
        // LOGIN
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        if (data.user) {
          onLogin(data.user);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Errore durante l\'operazione. Controlla i dati inseriti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
        <Flame className="w-96 h-96 text-orange-500 transform rotate-12" />
      </div>
      <div className="absolute bottom-0 left-0 p-20 opacity-5 pointer-events-none">
        <ShieldCheck className="w-64 h-64 text-emerald-500" />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-slate-800 p-8 text-center border-b-4 border-orange-500">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-900 mb-4 shadow-inner">
              <Flame className="w-12 h-12 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">CFVA-Fuoco Prescritto</h1>
            <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-semibold">
              {isSignUp ? 'Registrazione Operatore' : 'Accesso Operativo Supabase'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center gap-2 text-sm animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl flex items-center gap-2 text-sm animate-in slide-in-from-top-2">
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                {message}
              </div>
            )}

            <div className="space-y-4">
              {isSignUp && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Nome Completo</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Mario Rossi"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Matricola</label>
                      <div className="relative">
                        <Badge className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={badgeId}
                          onChange={(e) => setBadgeId(e.target.value)}
                          placeholder="GAUF-123"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Grado</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={rank}
                          onChange={(e) => setRank(e.target.value)}
                          placeholder="Agente / DOS"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Unità</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          placeholder="Nuoro"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Email Istituzionale</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome.cognome@forestas.it"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"} // Tipo dinamico in base allo stato
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'REGISTRATI' : 'AUTENTICAZIONE SICURA'}</span>
                  <ShieldCheck className="w-4 h-4 opacity-50 group-hover:opacity-100 transition" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setMessage(null);
                }}
                className="text-slate-500 text-xs font-bold hover:text-orange-500 transition uppercase tracking-wide"
              >
                {isSignUp
                  ? "Hai già un account? Accedi"
                  : "Non hai un account? Registrati"}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center mt-8 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          GAUF Cloud Infrastructure • Powered by Supabase
        </p>
      </div>
    </div>
  );
};

export default Login;
