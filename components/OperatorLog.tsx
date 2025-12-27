
import React, { useState, useEffect } from 'react';
import { Operator } from '../types';
import { supabase } from '../services/supabase';
import { Users, Clock, Plus, Medal, TrendingUp, Save, UserPlus, Trash2, Loader2, AlertCircle } from 'lucide-react';

const OperatorLog: React.FC = () => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedOp, setSelectedOp] = useState<string | null>(null);
  const [hoursToAdd, setHoursToAdd] = useState<number>(4);
  const [newOpName, setNewOpName] = useState('');
  const [creating, setCreating] = useState(false);

  // Fetch Operators from Supabase
  const fetchOperators = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('operators')
        .select('*')
        .order('total_hours', { ascending: false });

      if (error) throw error;

      setOperators((data as any[]) || []);
    } catch (err: any) {
      console.error("Errore fetch operatori:", err);
      setError("Impossibile caricare il registro operatori.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  const handleAddHours = async (id: string, currentHours: number) => {
    const today = new Date().toISOString().split('T')[0];
    const newTotal = currentHours + hoursToAdd;

    try {
      const { error } = await supabase
        .from('operators')
        .update({ total_hours: newTotal, last_activity: today })
        .eq('id', id);

      if (error) throw error;

      // Aggiornamento ottimistico
      setOperators(prev => prev.map(op =>
        op.id === id ? { ...op, total_hours: newTotal, last_activity: today } : op
      ));
      setSelectedOp(null);
    } catch (err) {
      alert("Errore nell'aggiornamento ore.");
    }
  };

  const handleCreateOperator = async () => {
    if (!newOpName.trim()) return;
    setCreating(true);

    const newOp = {
      // id: generato da Supabase o UUID locale nel mock
      name: newOpName,
      role: 'Operatore',
      total_hours: 0,
      last_activity: null
    };

    try {
      const { data, error } = await supabase
        .from('operators')
        .insert([newOp])
        .select();

      if (error) throw error;

      if (data) {
        setOperators(prev => [...prev, ...data]);
      } else {
        // Fallback per mock che potrebbe non ritornare dati nel formato select()
        fetchOperators();
      }
      setNewOpName('');
    } catch (err) {
      alert("Errore creazione operatore.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler rimuovere questo operatore dal database?')) return;

    try {
      const { error } = await supabase
        .from('operators')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOperators(prev => prev.filter(op => op.id !== id));
    } catch (err) {
      alert("Errore eliminazione operatore.");
    }
  };

  const getLevelBadge = (hours: number) => {
    if (hours >= 100) return { label: 'Master', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    if (hours >= 50) return { label: 'Senior', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    if (hours >= 20) return { label: 'Advanced', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    return { label: 'Junior', color: 'bg-slate-100 text-slate-600 border-slate-200' };
  };

  const getTotalTeamHours = () => operators.reduce((acc, curr) => acc + (curr.total_hours || 0), 0);


  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Totale Ore Squadra</h3>
          </div>
          <p className="text-4xl font-bold">{getTotalTeamHours()} <span className="text-lg text-slate-500 font-normal">h</span></p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Operativi</h3>
          </div>
          <p className="text-4xl font-bold text-slate-800">{operators.length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100 flex flex-col justify-center">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nuovo Operatore..."
              value={newOpName}
              onChange={(e) => setNewOpName(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleCreateOperator}
              disabled={!newOpName || creating}
              className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Operators List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 min-h-[300px]">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Medal className="w-5 h-5 text-slate-500" />
            Registro Personale
          </h3>
          <span className="text-xs text-slate-400 font-mono">DB: {supabase['auth'] && !supabase['auth']['signInWithPassword'] ? 'MOCK' : 'SUPABASE'}</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-xs font-medium uppercase tracking-wider">Sincronizzazione Cloud...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 flex flex-col items-center">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p>{error}</p>
            <button onClick={fetchOperators} className="mt-4 text-sm underline hover:text-red-700">Riprova</button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {operators.map(op => {
              const badge = getLevelBadge(op.total_hours);
              const isSelected = selectedOp === op.id;

              return (
                <div key={op.id} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                    {/* User Info */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 uppercase">
                        {op.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{op.name}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                          {op.role}
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          Ultimo: {op.last_activity || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Level Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.color} w-full sm:w-auto text-center`}>
                      {badge.label}
                    </div>

                    {/* Hours & Actions */}
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="block text-2xl font-bold text-slate-800">{op.total_hours}h</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Accumulate</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                            <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden">
                              <button
                                onClick={() => setHoursToAdd(Math.max(1, hoursToAdd - 1))}
                                className="px-2 py-1 hover:bg-slate-100 text-slate-600 border-r"
                              >-</button>
                              <span className="px-3 text-sm font-bold w-12 text-center">{hoursToAdd}h</span>
                              <button
                                onClick={() => setHoursToAdd(hoursToAdd + 1)}
                                className="px-2 py-1 hover:bg-slate-100 text-slate-600 border-l"
                              >+</button>
                            </div>
                            <button
                              onClick={() => handleAddHours(op.id, op.total_hours)}
                              className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm"
                              title="Conferma"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedOp(null)}
                              className="p-2 text-slate-400 hover:text-slate-600"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setSelectedOp(op.id);
                                setHoursToAdd(4); // Reset default to 4h
                              }}
                              className="flex items-center gap-1 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-sm"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Ore</span>
                            </button>
                            <button
                              onClick={() => handleDelete(op.id)}
                              className="p-2 text-slate-300 hover:text-red-500 transition"
                              title="Elimina"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}

            {operators.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Nessun operatore registrato.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatorLog;
