
import React, { useState } from 'react';
import { BurnParameters, SimulationResult, User } from '../types';
import { supabase } from '../services/supabase';
import { Flame, Printer, Send, FileText, Calendar, MapPin, User as UserIcon, ShieldCheck, Check, CheckCircle2, Loader2, CloudUpload, Gauge, Wind, Droplets, Thermometer, Mountain, Compass, BrainCircuit } from 'lucide-react';

interface TacticalReportProps {
  params: BurnParameters;
  result: SimulationResult;
  user: User;
  gpsCoords: { lat: number; lng: number } | null;
}

const TacticalReport: React.FC<TacticalReportProps> = ({ params, result, user, gpsCoords }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const today = new Date().toLocaleDateString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const handlePrint = () => window.print();

  const handleSaveToArchive = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('gauf_last_params', JSON.stringify(params));
      localStorage.setItem('gauf_last_result', JSON.stringify(result));
      if (gpsCoords) localStorage.setItem('gauf_last_coords', JSON.stringify(gpsCoords));

      const reportData = {
        analyst_name: user.name,
        badge_id: user.badgeId,
        date: new Date().toISOString(),
        params: params,
        result: result,
        gps_coords: gpsCoords,
        unit: user.unit,
        risk_level: result.riskAssessment
      };

      const { error } = await supabase.from('reports').insert([reportData]);
      if (error) console.warn("Cloud save failed, local only.", error);

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } catch (e) {
      console.error('Save error:', e);
      alert('Errore archiviazione.');
    } finally {
      setIsSaving(false);
    }
  };

  const getRiskColor = (risk: string) => {
    const r = risk.toLowerCase();
    if (r.includes('low') || r.includes('basso')) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (r.includes('moderate') || r.includes('moderato')) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (r.includes('high') || r.includes('alto')) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const riskColorClass = getRiskColor(result.riskAssessment);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 font-sans">

      {/* Action Bar (Hidden Print) */}
      <div className="bg-slate-900 p-4 rounded-3xl shadow-2xl flex justify-between items-center print:hidden relative overflow-hidden ring-1 ring-white/10">
        <div className="flex items-center gap-3 pl-2">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <FileText className="text-orange-500 w-5 h-5" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Report Tattico</p>
            <p className="text-slate-400 text-[10px] font-mono mt-1">GAUF-OS • OFFICIAL</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isSaved && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full animate-in fade-in slide-in-from-right-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Archiviato</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSaveToArchive}
              disabled={isSaved || isSaving}
              className={`transition-all px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${isSaved
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20'
                }`}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isSaved ? <Check className="w-4 h-4" /> : <CloudUpload className="w-4 h-4" />}
              {isSaving ? '...' : isSaved ? 'SALVATO' : 'ARCHIVIA'}
            </button>

            <button
              onClick={handlePrint}
              className="bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-100 transition-all hover:scale-105"
            >
              <Printer className="w-4 h-4" /> STAMPA
            </button>
          </div>
        </div>
      </div>

      {/* DOCUMENTO UFFICIALE */}
      <div id="tactical-document" className="bg-white shadow-2xl p-12 rounded-[2rem] border border-slate-200 print:shadow-none print:border-none print:p-0 relative overflow-hidden">

        {/* Watermark Sfondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
          <Flame className="w-[500px] h-[500px]" />
        </div>

        {/* 1. Header Istituzionale */}
        <div className="flex justify-between items-end border-b-4 border-slate-900 pb-8 mb-10">
          <div className="flex gap-5 items-center">
            <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl">
              <Flame className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-1">
                Corpo Forestale
              </h1>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">
                Regione Autonoma della Sardegna
              </h2>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-slate-100 px-3 py-1 rounded mb-2 inline-block">
              <p className="text-[10px] font-black text-slate-500 uppercase">Gruppo Analisi Utilizzo Fuoco</p>
            </div>
            <p className="text-xl font-mono font-black text-slate-900">REP-{new Date().getTime().toString().slice(-6)}</p>
          </div>
        </div>

        {/* 2. Meta Info Grid */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-10 flex flex-wrap gap-8 justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Data Operativa</p>
            <p className="text-sm font-bold text-slate-900">{today}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><UserIcon className="w-3 h-3" /> Analista</p>
            <p className="text-sm font-bold text-slate-900">{user.name}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Qualifica</p>
            <p className="text-sm font-bold text-slate-900">{user.rank}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Localizzazione</p>
            <p className="text-sm font-bold text-slate-900 font-mono">
              {gpsCoords ? `${gpsCoords.lat.toFixed(4)}N, ${gpsCoords.lng.toFixed(4)}E` : 'N/A'}
            </p>
          </div>
        </div>

        {/* 3. Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left Column: Input Data */}
          <div className="lg:col-span-4 space-y-8 border-r border-slate-100 pr-0 lg:pr-8">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-orange-500 pb-2 mb-6">Parametri Ambientali</h3>

            {/* Meteo Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-sky-600">
                <Wind className="w-4 h-4" />
                <span className="text-xs font-black uppercase">Meteo & Vento</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Temp / UR</span>
                  <span className="text-sm font-bold text-slate-800">{params.temperature}°C / {params.humidity}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Vento</span>
                  <span className="text-sm font-bold text-slate-800">{params.windSpeed} km/h {params.windDirection}</span>
                </div>
              </div>
            </div>

            {/* Fuel Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-emerald-600">
                <Mountain className="w-4 h-4" />
                <span className="text-xs font-black uppercase">Combustibile & Topo</span>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Modello</span>
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded inline-block">{params.fuelType}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Pendenza</span>
                    <span className="text-sm font-bold text-slate-800">{params.slope}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Esposizione</span>
                    <span className="text-sm font-bold text-slate-800">{params.exposure}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Analysis */}
          <div className="lg:col-span-8">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-orange-500 pb-2 mb-6">Analisi Comportamento Fuoco (Fire Behavior)</h3>

            {/* Risk Meter */}
            <div className={`rounded-2xl p-6 border mb-8 flex items-center justify-between ${riskColorClass}`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <Gauge className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase opacity-70 mb-1">Livello di Rischio</p>
                  <p className="text-2xl font-black uppercase tracking-tight">{result.riskAssessment}</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black uppercase opacity-70 mb-1">Indice Intensità</p>
                <p className="text-lg font-bold">{result.intensity || 'N/A'}</p>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-900 text-white p-5 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Flame className="w-16 h-16" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Lunghezza Fiamma (FL)</p>
                <p className="text-4xl font-black">{result.flameLength}</p>
                <p className="text-[10px] text-slate-500 mt-1">Metri stimati</p>
              </div>
              <div className="bg-slate-900 text-white p-5 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Wind className="w-16 h-16" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Velocità Avanzamento (ROS)</p>
                <p className="text-4xl font-black">{result.ros}</p>
                <p className="text-[10px] text-slate-500 mt-1">Metri / minuto</p>
              </div>
            </div>

            {/* Reasoning */}
            <div className="bg-white border-l-4 border-slate-300 pl-6 py-2">
              <h4 className="text-sm font-black text-slate-800 uppercase mb-2 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-slate-400" />
                Prescrizione Tattica
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed font-medium italic">
                "{result.tacticalAdvice}"
              </p>
              {result.reasoningPath && (
                <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                  <p className="text-[10px] text-slate-400 uppercase font-black mb-2">Percorso Logico</p>
                  <p className="text-xs font-mono text-slate-500">{result.reasoningPath}</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer Signatures */}
        <div className="mt-24 grid grid-cols-2 gap-20 print:mt-16">
          <div className="border-t-2 border-slate-300 pt-4">
            <p className="text-[10px] font-black text-slate-400 uppercase">Firma Analista GAUF</p>
            <div className="h-12 flex items-end">
              <span className="font-script text-2xl text-slate-800 opacity-50">Firmato digitalmente</span>
            </div>
          </div>
          <div className="border-t-2 border-slate-300 pt-4">
            <p className="text-[10px] font-black text-slate-400 uppercase">Firma D.O.S.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TacticalReport;
