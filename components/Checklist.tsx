import React, { useState } from 'react';
import { ChecklistItem } from '../types';
import { CheckCircle2, Circle, ShieldAlert } from 'lucide-react';

const INITIAL_ITEMS: ChecklistItem[] = [
  // Briefing
  { id: '1', category: 'Briefing', text: 'Analisi Meteo locale (Vento, UR, Temp)', checked: false },
  { id: '2', category: 'Briefing', text: 'Definizione LACES (Lookout, Anchor, Comm, Escape, Safety)', checked: false },
  { id: '3', category: 'Briefing', text: 'Verifica DPI e Radio per tutto il personale', checked: false },
  // Ignition
  { id: '4', category: 'Ignition', text: 'Test fuoco (piccola area) per verifica comportamento', checked: false },
  { id: '5', category: 'Ignition', text: 'Comunicazione inizio operazioni a SOUP', checked: false },
  { id: '6', category: 'Ignition', text: 'Mantenimento Anchor Point sicuro', checked: false },
  // Mopup
  { id: '7', category: 'Mopup', text: 'Bonifica perimetrale (blacklining)', checked: false },
  { id: '8', category: 'Mopup', text: 'Verifica assenza fumaioli attivi bordo strada', checked: false },
  { id: '9', category: 'Mopup', text: 'Debriefing finale con la squadra', checked: false },
];

const Checklist: React.FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>(INITIAL_ITEMS);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const getProgress = () => {
    const checked = items.filter(i => i.checked).length;
    return Math.round((checked / items.length) * 100);
  };

  const categories = Array.from(new Set(items.map(i => i.category)));

  return (
    <div className="bg-white rounded-xl shadow-md p-6 h-full max-w-3xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Protocollo Operativo</h2>
           <p className="text-slate-500 text-sm">Checklist standard GAUF</p>
        </div>
        <div className="text-right">
           <span className="text-3xl font-bold text-emerald-600">{getProgress()}%</span>
           <span className="block text-xs text-slate-400 uppercase font-semibold">Completato</span>
        </div>
      </div>

      {/* L.A.C.E.S. Reminder Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-orange-500" />
          L.A.C.E.S. Safety Reminder
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-600">
          <div className="flex gap-2 items-start">
            <span className="font-bold text-slate-900 bg-white border border-slate-200 w-5 h-5 flex items-center justify-center rounded shadow-sm shrink-0">L</span>
            <span className="mt-0.5"><strong>Lookout:</strong> Vedetta sempre attiva e in posizione.</span>
          </div>
          <div className="flex gap-2 items-start">
            <span className="font-bold text-slate-900 bg-white border border-slate-200 w-5 h-5 flex items-center justify-center rounded shadow-sm shrink-0">A</span>
            <span className="mt-0.5"><strong>Anchor:</strong> Punto di ancoraggio sicuro e definito.</span>
          </div>
          <div className="flex gap-2 items-start">
            <span className="font-bold text-slate-900 bg-white border border-slate-200 w-5 h-5 flex items-center justify-center rounded shadow-sm shrink-0">C</span>
            <span className="mt-0.5"><strong>Comm:</strong> Comunicazioni radio chiare e verificate.</span>
          </div>
          <div className="flex gap-2 items-start">
            <span className="font-bold text-slate-900 bg-white border border-slate-200 w-5 h-5 flex items-center justify-center rounded shadow-sm shrink-0">E</span>
            <span className="mt-0.5"><strong>Escape:</strong> Vie di fuga note a tutto il personale.</span>
          </div>
          <div className="flex gap-2 items-start col-span-1 sm:col-span-2">
            <span className="font-bold text-slate-900 bg-white border border-slate-200 w-5 h-5 flex items-center justify-center rounded shadow-sm shrink-0">S</span>
            <span className="mt-0.5"><strong>Safety:</strong> Zone di sicurezza (oasi) accessibili rapidamente.</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map(cat => (
          <div key={cat}>
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 border-b pb-1">{cat}</h3>
            <div className="space-y-2">
              {items.filter(i => i.category === cat).map(item => (
                <div 
                  key={item.id} 
                  onClick={() => toggleItem(item.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition select-none ${
                    item.checked ? 'bg-emerald-50' : 'hover:bg-slate-50'
                  }`}
                >
                  {item.checked ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={`text-sm ${item.checked ? 'text-emerald-800 font-medium line-through decoration-emerald-300' : 'text-slate-700'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <button 
        onClick={() => setItems(INITIAL_ITEMS)}
        className="mt-6 w-full text-slate-400 text-sm hover:text-slate-600 underline"
      >
        Resetta Checklist
      </button>
    </div>
  );
};

export default Checklist;