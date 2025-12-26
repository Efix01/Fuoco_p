
import React, { useState } from 'react';
import { BurnParameters, SimulationResult, User } from '../types';
import { supabase } from '../services/supabase';
import { Flame, Printer, Send, FileText, Calendar, MapPin, User as UserIcon, ShieldCheck, Save, Check, CheckCircle2, Loader2, CloudUpload } from 'lucide-react';

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

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToArchive = async () => {
    setIsSaving(true);
    try {
      // 1. Salvataggio locale per persistenza sessione
      localStorage.setItem('gauf_last_params', JSON.stringify(params));
      localStorage.setItem('gauf_last_result', JSON.stringify(result));
      if (gpsCoords) {
        localStorage.setItem('gauf_last_coords', JSON.stringify(gpsCoords));
      }

      // 2. Salvataggio Cloud su Supabase
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

      const { error } = await supabase
        .from('reports')
        .insert([reportData]);

      if (error) {
        console.warn("Database cloud non disponibile, salvataggio solo locale.", error);
        // Non blocchiamo l'utente se il cloud fallisce, il locale è già fatto
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);

    } catch (e) {
      console.error('Errore nel salvataggio:', e);
      alert('Errore durante l\'archiviazione. Verifica la connessione.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">

      {/* Action Bar (Hidden on Print) */}
      <div className="bg-slate-900 p-4 rounded-2xl shadow-xl flex justify-between items-center print:hidden relative overflow-hidden">
        <div className="flex items-center gap-3">
          <FileText className="text-orange-500 w-6 h-6 animate-pulse-slow" />
          <p className="text-white font-bold text-sm">Report Tattico GAUF</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Feedback Visivo Accanto ai Pulsanti */}
          {isSaved && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full animate-in fade-in slide-in-from-right-4 duration-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Archiviato</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSaveToArchive}
              disabled={isSaved || isSaving}
              className={`transition-all duration-300 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 ${isSaved
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20 hover:shadow-emerald-500/40'
                }`}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isSaved ? <Check className="w-4 h-4" /> : <CloudUpload className="w-4 h-4" />}
              {isSaving ? 'SALVATAGGIO...' : isSaved ? 'DATI SALVATI' : 'ARCHIVIA ANALISI'}
            </button>

            <button
              onClick={handlePrint}
              className="bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-100 transition-all duration-300 shadow-sm hover:scale-105 hover:shadow-lg active:scale-95"
            >
              <Printer className="w-4 h-4" />
              STAMPA / PDF
            </button>

            <button
              onClick={() => alert('Invio in corso alla SOUP Cagliari via canale radio/dati...')}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/20 hover:scale-105 hover:shadow-blue-500/40 active:scale-95"
            >
              <Send className="w-4 h-4" />
              INVIA A SOUP
            </button>
          </div>
        </div>
      </div>

      {/* DOCUMENT PAGE */}
      <div id="tactical-document" className="bg-white shadow-2xl p-10 rounded-lg border border-slate-200 print:shadow-none print:border-none print:p-0">

        {/* Document Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
          <div className="flex gap-4 items-center">
            <div className="p-3 bg-slate-950 rounded-xl">
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-1">
                CORPO FORESTALE E DI VIGILANZA AMBIENTALE
              </h1>
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest">
                G.A.U.F. - GRUPPO ANALISI E UTILIZZO DEL FUOCO
              </h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase">Documento ID</p>
            <p className="text-sm font-mono font-bold text-slate-800">CFVA-GAUF-{new Date().getTime().toString().slice(-6)}</p>
          </div>
        </div>

        {/* Tactical Header */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><Calendar className="w-3 h-3" /> Data e Ora</p>
              <p className="text-sm font-bold text-slate-900">{today}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><UserIcon className="w-3 h-3" /> Analista Responsabile</p>
              <p className="text-sm font-bold text-slate-900">{user.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Qualifica / Matricola</p>
              <p className="text-sm font-bold text-slate-900">{user.rank} / {user.badgeId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><MapPin className="w-3 h-3" /> Area Operativa (GPS)</p>
              <p className="text-sm font-bold text-slate-900">
                {gpsCoords
                  ? `${gpsCoords.lat.toFixed(5)}, ${gpsCoords.lng.toFixed(5)}`
                  : user.unit}
              </p>
            </div>
          </div>
        </div>

        {/* Section: Field Parameters */}
        <div className="mb-10">
          <h3 className="text-xs font-black text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-widest flex items-center gap-2">
            01. Parametri Ambientali e Combustibile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Meteo Attuale</p>
                <ul className="text-sm space-y-1 font-semibold text-slate-700">
                  <li>Temperatura: {params.temperature}°C</li>
                  <li>Umidità Aria: {params.humidity}%</li>
                  <li>Vento: {params.windSpeed} km/h {params.windDirection}</li>
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Stato Combustibile</p>
                <ul className="text-sm space-y-1 font-semibold text-slate-700">
                  <li>Modello: {params.fuelType}</li>
                  <li>Umidità (Dead Fuel): {params.fuelMoisture}%</li>
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Topografia & CPS</p>
                <ul className="text-sm space-y-1 font-semibold text-slate-700">
                  <li>Pendenza: {params.slope}%</li>
                  <li>Esposizione: {params.exposure}</li>
                  <li className="text-orange-600">CPS Aspect: {params.exposure.toUpperCase()}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Analysis Results */}
        <div className="mb-10">
          <h3 className="text-xs font-black text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-widest flex items-center gap-2">
            02. Analisi di Comportamento Previsto
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Avanzamento (ROS)</p>
              <p className="text-3xl font-black">{result.ros}</p>
            </div>
            <div className="bg-slate-900 text-white p-6 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Lunghezza di Fiamma</p>
              <p className="text-3xl font-black">{result.flameLength}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
              <p className="text-[10px] font-black text-orange-600 uppercase mb-1">Valutazione del Rischio Operativo</p>
              <p className="text-sm font-bold text-slate-800 uppercase">{result.riskAssessment}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Prescrizione Tattica AI (Logica CPS)</p>
              <p className="text-sm leading-relaxed text-slate-700 font-medium">
                {result.tacticalAdvice}
              </p>
            </div>
          </div>
        </div>

        {/* Section: Reasoning and Training */}
        <div className="mb-10">
          <h3 className="text-xs font-black text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-widest flex items-center gap-2">
            03. Note Tecniche e Percorso Logico
          </h3>
          <div className="text-xs text-slate-600 leading-relaxed font-mono whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
            {result.reasoningPath}
          </div>
        </div>

        {/* Footer: Signatures */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">
          <div className="text-center border-t border-slate-400 pt-4">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-8">L'Analista GAUF</p>
            <div className="h-10"></div>
            <p className="text-xs font-bold font-mono">(Firma Digitale CFVA)</p>
          </div>
          <div className="text-center border-t border-slate-400 pt-4">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-8">Visto: Il D.O.S. (Direttore Operazioni Spegnimento)</p>
            <div className="h-10"></div>
            <p className="text-xs font-bold font-mono">__________________________</p>
          </div>
        </div>

        {/* Regulatory Footer */}
        <div className="mt-12 pt-8 border-t border-slate-200 text-center">
          <p className="text-[8px] text-slate-400 uppercase font-bold tracking-[0.2em]">
            SISTEMA INTEGRATO CFVA SARDEGNA - GAUF TACTICAL OS • GENEREATED VIA GEMINI PRO 3.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default TacticalReport;
