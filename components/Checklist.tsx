import React, { useState } from 'react';
import { ChecklistItem } from '../types';
import { CheckCircle2, Circle, ShieldAlert, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

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
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Briefing');

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const completedCount = items.filter(i => i.checked).length;
  const totalCount = items.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  const categories = Array.from(new Set(items.map(i => i.category)));

  // Calcola raggio e circonferenza per il cerchio SVG
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressPercentage / 100) * circumference;

  const getProgressColor = () => {
    if (progressPercentage < 30) return 'text-red-500';
    if (progressPercentage < 70) return 'text-orange-500';
    return 'text-emerald-500';
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl p-6 md:p-8 h-full max-w-4xl mx-auto border border-slate-100 flex flex-col relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-red-500 to-emerald-500" />

      {/* Header Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase mb-2">Protocollo Operativo</h2>
          <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-orange-500" />
            Standard GAUF Safety Check
          </p>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              className="text-slate-100"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="48"
              cy="48"
            />
            <circle
              className={`transition-all duration-1000 ease-out ${getProgressColor()}`}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="48"
              cy="48"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className={`text-xl font-black ${getProgressColor()}`}>{progressPercentage}%</span>
          </div>
        </div>
      </div>

      {/* L.A.C.E.S. Sticky Banner */}
      <div className="bg-slate-900 rounded-2xl p-5 mb-8 text-white shadow-xl shadow-slate-900/10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-4 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          Safety First: L.A.C.E.S.
        </h3>
        <div className="flex justify-between items-center px-2">
          {['Lookout', 'Anchor', 'Comm', 'Escape', 'Safety'].map((word, i) => (
            <div key={i} className="text-center group cursor-default">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-black text-sm mb-1 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                {word[0]}
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase hidden md:block group-hover:text-orange-400 transition-colors">{word}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {categories.map(cat => {
          const catItems = items.filter(i => i.category === cat);
          const isAllChecked = catItems.every(i => i.checked);
          const isExpanded = expandedCategory === cat;

          return (
            <div key={cat} className={`border transition-all duration-300 rounded-2xl overflow-hidden ${isAllChecked ? 'border-emerald-500/30 bg-emerald-50/30' : 'border-slate-200 bg-white'}`}>
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border ${isAllChecked ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                    {isAllChecked ? <CheckCircle2 className="w-4 h-4" /> : catItems.length}
                  </div>
                  <span className={`text-sm font-black uppercase tracking-wider ${isAllChecked ? 'text-emerald-700' : 'text-slate-700'}`}>
                    {cat}
                  </span>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
                  {catItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border-l-4 group ${item.checked
                          ? 'bg-emerald-100/50 border-emerald-500 shadow-sm'
                          : 'bg-slate-50 border-transparent hover:bg-slate-100'
                        }`}
                    >
                      <div className={`mt-0.5 transform transition-all duration-300 ${item.checked ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {item.checked ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 " />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
                        )}
                      </div>
                      <span className={`text-sm font-medium leading-relaxed ${item.checked ? 'text-emerald-900 line-through opacity-60' : 'text-slate-700'}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => {
          if (confirm('Resettare l\'intera checklist?')) setItems(INITIAL_ITEMS);
        }}
        className="mt-8 mx-auto flex items-center gap-2 text-slate-400 text-xs font-bold hover:text-red-500 transition-colors px-4 py-2 rounded-full hover:bg-red-50"
      >
        <RotateCcw className="w-3 h-3" />
        RESETTA PROTOCOLLO
      </button>
    </div>
  );
};

export default Checklist;