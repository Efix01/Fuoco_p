
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Map as MapIcon, Trash2, Crosshair, Loader2, BrainCircuit, Search, Info, Ruler, Layers, Globe, Mountain } from 'lucide-react';
import { analyzeTerrainGrounding } from '../services/gemini';

const DEFAULT_CENTER = { lat: 40.1209, lng: 9.0129 };

// Definizione dei Layer disponibili
const MAP_LAYERS = {
  standard: {
    name: 'Standard OS',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap',
    icon: MapIcon
  },
  satellite: {
    name: 'Satellite Operativo',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri World Imagery',
    icon: Globe
  },
  topo: {
    name: 'Topografica GAUF',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap',
    icon: Mountain
  }
};

const MapEditor: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);

  const [layersOpen, setLayersOpen] = useState(false);

  const [activeLayer, setActiveLayer] = useState<keyof typeof MAP_LAYERS>('standard');
  const [points, setPoints] = useState<{ lat: number, lng: number }[]>([]);
  const [areaHa, setAreaHa] = useState<number>(0);
  const [analyzingTerrain, setAnalyzingTerrain] = useState(false);
  const [terrainReport, setTerrainReport] = useState<string | null>(null);

  const calculateArea = (coords: { lat: number, lng: number }[]) => {
    if (coords.length < 3) return 0;
    let area = 0;
    const radius = 6378137;
    for (let i = 0; i < coords.length; i++) {
      const p1 = coords[i];
      const p2 = coords[(i + 1) % coords.length];
      area += (p2.lng * Math.PI / 180 - p1.lng * Math.PI / 180) *
        (2 + Math.sin(p1.lat * Math.PI / 180) + Math.sin(p2.lat * Math.PI / 180));
    }
    area = area * radius * radius / 2;
    return Math.abs(area) / 10000;
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      tap: false
    }).setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 9);

    // Fix per rendering: invalida le dimensioni dopo un breve delay per assicurarsi che il contenitore abbia dimensioni
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // Inizializza con il layer standard
    baseLayerRef.current = L.tileLayer(MAP_LAYERS.standard.url, {
      attribution: MAP_LAYERS.standard.attribution
    }).addTo(map);

    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      setPoints(prev => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }]);
    });

    mapInstanceRef.current = map;
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  // Cambio dinamico del layer
  useEffect(() => {
    if (!mapInstanceRef.current || !baseLayerRef.current) return;

    const newLayer = MAP_LAYERS[activeLayer];
    baseLayerRef.current.setUrl(newLayer.url);

    // Se è satellite, rimuoviamo i filtri CSS pesanti per vedere i colori naturali della vegetazione
    if (mapContainerRef.current) {
      if (activeLayer === 'satellite') {
        mapContainerRef.current.style.filter = 'grayscale(0) contrast(1)';
      } else {
        mapContainerRef.current.style.filter = 'grayscale(0.3) contrast(1.1)';
      }
    }
  }, [activeLayer]);

  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;

    markersLayerRef.current.clearLayers();
    if (polygonLayerRef.current) {
      polygonLayerRef.current.remove();
      polygonLayerRef.current = null;
    }

    points.forEach((p, idx) => {
      L.circleMarker([p.lat, p.lng], {
        radius: idx === 0 ? 8 : 5,
        fillColor: idx === 0 ? '#ef4444' : '#f97316',
        color: '#fff',
        weight: 2,
        fillOpacity: 1
      }).addTo(markersLayerRef.current!);
    });

    if (points.length >= 3) {
      const latLngs = points.map(p => [p.lat, p.lng] as [number, number]);
      polygonLayerRef.current = L.polygon(latLngs, {
        color: '#f97316',
        fillColor: '#f97316',
        fillOpacity: 0.2,
        weight: 3,
        dashArray: '5, 10'
      }).addTo(mapInstanceRef.current);

      setAreaHa(calculateArea(points));
    } else {
      setAreaHa(0);
    }
  }, [points]);

  const handleTerrainScan = async () => {
    if (points.length === 0) return;
    setAnalyzingTerrain(true);
    setTerrainReport(null);
    try {
      const context = `Area di intervento di circa ${areaHa.toFixed(2)} ettari. Coordinate vertice principale: ${points[0].lat}, ${points[0].lng}`;
      const report = await analyzeTerrainGrounding(points[0].lat, points[0].lng);
      setTerrainReport(`${context}. \n\n${report}`);
    } catch (e) {
      setTerrainReport("Errore analisi spaziale. Verifica connessione.");
    } finally {
      setAnalyzingTerrain(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[60dvh] bg-slate-950 md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-800 relative">

      {/* Overlay: Header Info (Compact Mobile) */}
      <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none flex justify-between items-start gap-2">
        <div className="bg-slate-900/90 backdrop-blur-xl p-2 md:p-4 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl pointer-events-auto flex items-center gap-2 md:gap-4 shrink-0">
          <div className="bg-orange-500 p-2 md:p-3 rounded-xl md:rounded-2xl shadow-lg shadow-orange-500/20">
            <MapIcon className="w-4 h-4 md:w-6 md:h-6 text-white" />
          </div>
          <div className="hidden md:block">
            <h2 className="font-black text-white text-sm uppercase tracking-wider">Mappa Operativa</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Sistema Topografico Attivo</p>
            </div>
          </div>
        </div>

        {points.length > 0 && (
          <div className="bg-white p-2 md:p-4 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 pointer-events-auto flex items-center gap-2 md:gap-4 animate-in slide-in-from-right-4 shrink-0">
            <div className="bg-slate-100 p-1.5 md:p-2.5 rounded-xl md:rounded-2xl">
              <Ruler className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
            </div>
            <div className="pr-2 md:pr-4">
              <p className="hidden md:block text-[10px] font-black text-slate-400 uppercase">Superficie Calcolata</p>
              <p className="text-sm md:text-xl font-black text-slate-900 leading-none">
                {areaHa.toFixed(2)} <span className="text-[10px] md:text-sm text-slate-500">Ha</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="flex-1 z-0 grayscale-[0.3] contrast-[1.1] transition-all duration-500" />

      {/* Floating Panel: AI Report */}
      {terrainReport && (
        <div className="absolute bottom-20 md:bottom-24 left-4 md:left-6 right-4 md:right-6 z-[1000] bg-slate-900/95 backdrop-blur-2xl border border-blue-500/30 p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-8">
          <div className="flex justify-between items-center mb-2 md:mb-4">
            <span className="text-[10px] md:text-xs font-black text-blue-400 uppercase flex items-center gap-2 tracking-widest">
              <BrainCircuit className="w-3 h-3 md:w-4 md:h-4" /> Risposta Grounding
            </span>
            <button onClick={() => setTerrainReport(null)} className="bg-white/10 hover:bg-white/20 text-white p-1 md:p-1.5 rounded-full transition">✕</button>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium max-h-32 overflow-y-auto">{terrainReport}</p>
        </div>
      )}

      {/* Selettore Livelli (Collapsible on Mobile) */}
      <div className="absolute bottom-20 md:bottom-24 right-4 md:right-6 z-[1000] flex flex-col gap-2 pointer-events-auto items-end">
        {/* Toggle Button for Mobile */}
        <button
          onClick={() => setLayersOpen(!layersOpen)}
          className="md:hidden bg-slate-900/90 backdrop-blur-xl p-3 rounded-xl border border-white/10 shadow-xl text-slate-400 active:text-white transition"
        >
          <Layers className="w-5 h-5" />
        </button>

        <div className={`bg-slate-900/90 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-1 transition-all origin-bottom-right ${layersOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 h-0 w-0 overflow-hidden md:h-auto md:w-auto md:scale-100 md:opacity-100'
          }`}>
          {Object.entries(MAP_LAYERS).map(([key, layer]) => {
            const Icon = layer.icon;
            const isActive = activeLayer === key;
            return (
              <button
                key={key}
                onClick={() => { setActiveLayer(key as any); setLayersOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isActive
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                title={layer.name}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className={`text-[10px] font-black uppercase tracking-tighter whitespace-nowrap ${isActive ? 'block' : 'hidden md:block'}`}>
                  {layer.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Bar (Bottom - Compact) */}
      <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 z-[1000] flex justify-between items-center pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={() => mapInstanceRef.current?.locate({ setView: true, maxZoom: 16 })}
            className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-xl hover:bg-slate-50 transition active:scale-90 group"
          >
            <Crosshair className="w-5 h-5 md:w-6 md:h-6 text-slate-800 group-hover:text-blue-600 transition-colors" />
          </button>
          <button
            onClick={() => setPoints([])}
            className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition active:scale-90"
          >
            <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="pointer-events-auto">
          <button
            onClick={handleTerrainScan}
            disabled={points.length === 0 || analyzingTerrain}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:opacity-50 text-white px-4 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-black flex items-center gap-2 md:gap-3 transition-all shadow-2xl shadow-blue-500/40 active:scale-95"
          >
            {analyzingTerrain ? <Loader2 className="animate-spin w-4 h-4 md:w-5 md:h-5" /> : <Search className="w-4 h-4 md:w-5 md:h-5" />}
            <span className="hidden md:inline">AI TERRAIN SCAN</span>
            <span className="md:hidden">SCAN</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapEditor;
