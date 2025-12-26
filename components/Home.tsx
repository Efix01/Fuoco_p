
import React from 'react';
import { View } from '../types';
import { Flame, Map as MapIcon, ClipboardList, GraduationCap, Users, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import CfvaLogo from './CfvaLogo';

interface HomeProps {
  onNavigate: (view: View) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <CfvaLogo className="w-64 h-64 opacity-50 transform rotate-12 filter grayscale" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
           <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider shadow-sm">
                Regione Autonoma della Sardegna
              </span>
              <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                GAUF Certified
              </span>
           </div>
           
           <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20">
                <CfvaLogo className="w-full h-full drop-shadow-2xl" />
              </div>
              <div>
                  <h1 className="text-3xl md:text-5xl font-black leading-none tracking-tight">
                    CFVA
                  </h1>
                  <h2 className="text-xl md:text-2xl font-bold text-orange-500 uppercase tracking-widest">
                    Fuoco Prescritto
                  </h2>
              </div>
           </div>

           <p className="text-slate-300 text-lg mb-8 leading-relaxed font-light border-l-4 border-orange-500 pl-4">
             Piattaforma tattica integrata per la gestione del fuoco tecnico. 
             <strong className="text-white font-semibold"> Analisi AI Antigravity</strong>, cartografia operativa e protocolli di sicurezza per il Corpo Forestale.
           </p>

           <div className="flex flex-wrap gap-4">
             <button 
               onClick={() => onNavigate(View.PLANNER)}
               className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-orange-900/40 active:scale-95"
             >
               <Flame className="w-5 h-5" />
               Nuova Prescrizione
             </button>
             <button 
               onClick={() => onNavigate(View.MAP)}
               className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg active:scale-95"
             >
               <MapIcon className="w-5 h-5" />
               Cartografia
             </button>
           </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Planner */}
        <div 
          onClick={() => onNavigate(View.PLANNER)}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-orange-300 transition cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4 group-hover:bg-orange-500 transition-colors">
            <Flame className="w-6 h-6 text-orange-600 group-hover:text-white" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Pianificatore AI</h3>
          <p className="text-sm text-slate-500">Calcolo ROS, lunghezza di fiamma e analisi CPS.</p>
        </div>

        {/* Card 2: Map */}
        <div 
          onClick={() => onNavigate(View.MAP)}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
            <MapIcon className="w-6 h-6 text-blue-600 group-hover:text-white" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Mappa Tattica</h3>
          <p className="text-sm text-slate-500">Misurazione perimetri, livelli GAUF e geolocalizzazione.</p>
        </div>

        {/* Card 3: Checklist */}
        <div 
          onClick={() => onNavigate(View.CHECKLIST)}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-500 transition-colors">
            <ClipboardList className="w-6 h-6 text-emerald-600 group-hover:text-white" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Protocollo LACES</h3>
          <p className="text-sm text-slate-500">Checklist operativa per la sicurezza di squadra.</p>
        </div>

        {/* Card 4: Training */}
        <div 
          onClick={() => onNavigate(View.TRAINING)}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-purple-300 transition cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors">
            <GraduationCap className="w-6 h-6 text-purple-600 group-hover:text-white" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Academy & AI</h3>
          <p className="text-sm text-slate-500">Simulatore con Istruttore virtuale e Video Veo.</p>
        </div>

      </div>

      {/* Info Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between">
           <div>
              <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-1">Stato Sistema</h4>
              <p className="text-emerald-600 font-bold flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 Operativo / Connesso
              </p>
           </div>
           <Activity className="w-8 h-8 text-slate-300" />
        </div>
        
        <div 
          onClick={() => onNavigate(View.OPERATORS)}
          className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition"
        >
           <div>
              <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-1">Registro GAUF</h4>
              <p className="text-slate-600 font-medium text-sm flex items-center gap-1">
                 Gestione personale e ore <ArrowRight className="w-4 h-4" />
              </p>
           </div>
           <Users className="w-8 h-8 text-slate-400" />
        </div>
      </div>
    </div>
  );
};

export default Home;
