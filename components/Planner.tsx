
import React, { useState, useRef } from 'react';
import { BurnParameters, FuelType, Aspect, SimulationResult } from '../types';
import { analyzeBurnConditions, analyzeBurnImage, getWeatherFromLocation, checkApiKey } from '../services/gemini';
// Added 'Activity' to the imports from lucide-react
import { Flame, Wind, Mountain, Thermometer, Loader2, Camera, MapPin, Droplets, BrainCircuit, ShieldAlert, Lightbulb, GraduationCap, Waves, Compass, RotateCcw, Activity } from 'lucide-react';

interface PlannerProps {
  onResultGenerated: (params: BurnParameters, result: SimulationResult) => void;
  initialParams: BurnParameters;
  initialResult: SimulationResult | null;
}

const Planner: React.FC<PlannerProps> = ({ onResultGenerated, initialParams, initialResult }) => {
  const [loading, setLoading] = useState(false);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [fetchingWeather, setFetchingWeather] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(initialResult);
  const [params, setParams] = useState<BurnParameters>(initialParams);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      await checkApiKey();
      const data = await analyzeBurnConditions(params);
      setResult(data);
      onResultGenerated(params, data);
    } catch (e: any) {
      alert(`Errore: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm("Ripristinare i parametri di default e cancellare l'analisi corrente?")) {
      setParams(initialParams);
      setResult(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20 animate-in fade-in duration-700">

      {/* TOOLBAR SUPERIORE */}
      <div className="lg:col-span-12">
        <div className="bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-white/5 flex flex-wrap gap-2 items-center">
          <div className="flex-1 flex gap-2">
            <button
              onClick={async () => {
                setFetchingWeather(true);
                navigator.geolocation.getCurrentPosition(async (pos) => {
                  try {
                    const w = await getWeatherFromLocation(pos.coords.latitude, pos.coords.longitude);
                    setParams(p => ({ ...p, ...w }));
                  } finally {
                    setFetchingWeather(false);
                  }
                });
              }}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              {fetchingWeather ? <Loader2 className="animate-spin w-4 h-4" /> : <MapPin className="w-4 h-4" />}
              SINCRONIZZA METEO GPS
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              {analyzingPhoto ? <Loader2 className="animate-spin w-4 h-4" /> : <Camera className="w-4 h-4" />}
              SCANNER FOTOGRAFICO AI
            </button>
          </div>

          <button
            onClick={handleReset}
            className="bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            RESET
          </button>

          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setAnalyzingPhoto(true);
            const reader = new FileReader();
            reader.onloadend = async () => {
              try {
                const res = await analyzeBurnImage(reader.result as string);
                setParams(p => ({ ...p, ...res }));
              } finally {
                setAnalyzingPhoto(false);
              }
            };
            reader.readAsDataURL(file);
          }} />
        </div>
      </div>

      {/* PARAMETRI DI INPUT */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-5 md:p-8 space-y-8">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Configurazione Tattica</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1"><Thermometer className="w-3 h-3" /> Temp. Aria</label>
              <div className="relative">
                <input type="number" value={params.temperature} onChange={e => setParams({ ...params, temperature: +e.target.value })} className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 w-full font-black text-lg outline-none focus:ring-2 focus:ring-orange-500 transition" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">°C</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1"><Droplets className="w-3 h-3" /> UR Aria</label>
              <div className="relative">
                <input type="number" value={params.humidity} onChange={e => setParams({ ...params, humidity: +e.target.value })} className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 w-full font-black text-lg outline-none focus:ring-2 focus:ring-blue-500 transition" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1"><Wind className="w-3 h-3" /> Vento</label>
              <div className="relative">
                <input type="number" value={params.windSpeed} onChange={e => setParams({ ...params, windSpeed: +e.target.value })} className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 w-full font-black text-lg outline-none focus:ring-2 focus:ring-slate-400 transition" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase">km/h</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1"><Compass className="w-3 h-3" /> Dir. Vento</label>
              <select value={params.windDirection} onChange={e => setParams({ ...params, windDirection: e.target.value as Aspect })} className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 w-full font-black text-base outline-none focus:ring-2 focus:ring-slate-400 transition appearance-none">
                {Object.values(Aspect).map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1"><Waves className="w-3 h-3" /> Umidità Combustibile (Dead Fuel 1h)</label>
            <input type="range" min="3" max="25" step="1" value={params.fuelMoisture} onChange={e => setParams({ ...params, fuelMoisture: +e.target.value })} className="w-full accent-orange-500" />
            <div className="flex justify-between text-[10px] font-black text-slate-400">
              <span>3% (CRITICO)</span>
              <span className="text-orange-600 text-sm">{params.fuelMoisture}%</span>
              <span>25% (ESTINZIONE)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1"><Mountain className="w-3 h-3" /> Pendenza</label>
              <div className="relative">
                <input type="number" value={params.slope} onChange={e => setParams({ ...params, slope: +e.target.value })} className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 w-full font-black text-lg outline-none focus:ring-2 focus:ring-emerald-500 transition" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1"><Compass className="w-3 h-3" /> Esposizione (CPS)</label>
              <select value={params.exposure} onChange={e => setParams({ ...params, exposure: e.target.value as Aspect })} className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 w-full font-black text-base outline-none focus:ring-2 focus:ring-emerald-500 transition appearance-none">
                {Object.values(Aspect).map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">Modello Combustibile</label>
            <select value={params.fuelType} onChange={e => setParams({ ...params, fuelType: e.target.value as FuelType })} className="bg-slate-900 text-white border border-slate-800 rounded-2xl px-4 py-4 w-full font-bold outline-none focus:ring-2 focus:ring-orange-500 transition">
              {Object.values(FuelType).map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-2xl font-black text-xl shadow-2xl shadow-orange-500/30 flex items-center justify-center gap-4 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-8 h-8" /> : <Flame className="w-8 h-8" />}
            {loading ? "ELABORAZIONE CPS..." : "GENERA ANALISI TATTICA"}
          </button>
        </div>
      </div>

      {/* RISULTATI AI */}
      <div className="lg:col-span-7 space-y-6">
        {result ? (
          <div className="animate-in slide-in-from-right-12 duration-700 space-y-6">

            {/* PANEL: METRICHE */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity className="w-48 h-48 text-white" />
              </div>

              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-orange-500 font-black text-xs uppercase tracking-[0.3em] mb-1">Dati Previsti (Antigravity AI)</h3>
                  <h2 className="text-white text-3xl font-black tracking-tighter uppercase">Comportamento Incendio</h2>
                </div>
                <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-[10px] font-black border border-red-500/30 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> RISCHIO: {result.riskAssessment.toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white/5 backdrop-blur-md p-5 md:p-6 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Avanzamento (ROS)</p>
                  <p className="text-3xl md:text-4xl font-black text-white">{result.ros}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-5 md:p-6 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Lungh. Fiamma</p>
                  <p className="text-3xl md:text-4xl font-black text-white">{result.flameLength}</p>
                </div>
              </div>
            </div>

            {/* PANEL: TACTICAL ADVICE */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 space-y-8">
              <div className="flex gap-8">
                <div className="flex-1 space-y-4">
                  <h3 className="text-orange-600 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> Strategia Suggerita
                  </h3>
                  <p className="text-slate-800 text-lg font-medium leading-relaxed italic">
                    "{result.tacticalAdvice}"
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl">
                <h3 className="text-emerald-700 font-black text-[10px] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" /> Training Pill GAUF
                </h3>
                <p className="text-emerald-900 text-sm leading-relaxed font-semibold">
                  {result.trainingTip}
                </p>
              </div>

              {/* PANEL: REASONING (CPS LOGIC) */}
              {result.reasoningPath && (
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4" /> Percorso Logico Antigravity (Campbell System)
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-3xl space-y-3">
                    {result.reasoningPath.split('. ').map((step, i) => (
                      <div key={i} className="flex gap-3 items-start group">
                        <span className="text-blue-500 font-black text-sm group-hover:scale-125 transition-transform">0{i + 1}.</span>
                        <p className="text-slate-600 text-[11px] font-mono leading-relaxed">{step}.</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[600px] border-4 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center bg-slate-50/50">
            <div className="bg-white p-10 rounded-full shadow-2xl mb-8 animate-bounce-slow">
              <Compass className="w-20 h-20 text-slate-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-4">In attesa di parametri tattici</h2>
            <p className="text-slate-500 max-w-sm leading-relaxed text-sm">
              Il sistema richiede dati ambientali certi per calcolare l'infiammabilità relativa tramite logica CPS. Usa lo <strong>Scanner AI</strong> per accelerare il processo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Planner;
