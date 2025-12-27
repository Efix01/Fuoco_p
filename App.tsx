import React, { useState, useEffect } from 'react';
import { View, User, BurnParameters, SimulationResult, Aspect, FuelType } from './types';
import Home from './components/Home';
import Planner from './components/Planner';
import TacticalReport from './components/TacticalReport';
import TrainingChat from './components/TrainingChat';
import Checklist from './components/Checklist';
import MapEditor from './components/MapEditor';
import OperatorLog from './components/OperatorLog';
import CfvaLogo from './components/CfvaLogo';
import Login from './components/Login'; // Import Login
import { supabase } from './services/supabase'; // Import Supabase
import { Flame, ClipboardList, GraduationCap, Menu, X, Map as MapIcon, Users, LayoutDashboard, Shield, FileText, Lock, AlertTriangle, Radio, LocateFixed, Satellite, LogOut } from 'lucide-react';
import Welcome from './components/Welcome'; // Import Welcome

const INITIAL_PARAMS: BurnParameters = {
  temperature: 25,
  humidity: 40,
  windSpeed: 10,
  windDirection: Aspect.NW,
  slope: 10,
  fuelMoisture: 10,
  fuelType: FuelType.MACCHIA_BASSA,
  exposure: Aspect.S,
  description: ''
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true); // State for Splash Screen

  const [currentUser, setCurrentUser] = useState<User>({
    id: '',
    badgeId: '',
    name: '',
    rank: '',
    unit: '',
    isAuthenticated: false
  });

  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [gpsActive, setGpsActive] = useState(false);

  // Stato condiviso per il report caricato da localStorage se disponibile
  const [lastParams, setLastParams] = useState<BurnParameters>(() => {
    const saved = localStorage.getItem('gauf_last_params');
    return saved ? JSON.parse(saved) : INITIAL_PARAMS;
  });

  const [lastResult, setLastResult] = useState<SimulationResult | null>(() => {
    const saved = localStorage.getItem('gauf_last_result');
    return saved ? JSON.parse(saved) : null;
  });

  // Auth Effect
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        updateUserFromSession(session.user);
      }
      setLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        updateUserFromSession(session.user);
      } else {
        // Reset user if logged out
        setCurrentUser({
          id: '',
          badgeId: '',
          name: '',
          rank: '',
          unit: '',
          isAuthenticated: false
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateUserFromSession = (user: any) => {
    const metadata = user.user_metadata || {};
    setCurrentUser({
      id: user.id,
      badgeId: metadata.badge_id || 'N/A',
      name: metadata.full_name || user.email?.split('@')[0] || 'Utente',
      rank: metadata.rank || 'Operatore',
      unit: metadata.unit || 'CFVA',
      isAuthenticated: true
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setCurrentUser({
      id: '',
      badgeId: '',
      name: '',
      rank: '',
      unit: '',
      isAuthenticated: false
    });
    setCurrentView(View.HOME);
    setMobileMenuOpen(false);
  };

  // GPS Tracking per SOS
  useEffect(() => {
    if (currentUser.isAuthenticated && navigator.geolocation) {
      setGpsActive(true);
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          console.warn("GPS Signal Lost", err);
          setGpsActive(false);
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [currentUser.isAuthenticated]);

  const handleAnalysisComplete = (params: BurnParameters, result: SimulationResult) => {
    setLastParams(params);
    setLastResult(result);
  };

  const NavItem = ({ view, icon: Icon, disabled = false }: { view: View; icon: any; disabled?: boolean }) => (
    <button
      onClick={() => {
        if (!disabled) {
          setCurrentView(view);
          setMobileMenuOpen(false);
        }
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition w-full group relative ${currentView === view
        ? 'bg-orange-500 text-white shadow-lg'
        : disabled
          ? 'opacity-50 cursor-not-allowed text-slate-500 hover:bg-slate-800/50'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
    >
      <Icon className={`w-5 h-5 ${currentView === view ? 'text-white' : disabled ? 'text-slate-600' : 'text-slate-400 group-hover:text-white'}`} />
      <span className="font-medium text-sm flex-1 text-left">{view}</span>

      {disabled && view === View.REPORT && (
        <Lock className="w-3 h-3 text-slate-600" />
      )}

      {!disabled && view === View.REPORT && currentView !== View.REPORT && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }




  // Show Welcome screen first, unless user is already deeply engaged (but let's keep it for "app launch feel")
  if (showWelcome) {
    return <Welcome onEnter={() => setShowWelcome(false)} />;
  }

  if (!currentUser.isAuthenticated) {
    return <Login onLogin={(user) => updateUserFromSession(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row animate-in fade-in duration-700 font-sans">

      {/* SOS MODAL OVERLAY */}
      {sosActive && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-red-600 w-full max-w-lg rounded-3xl p-8 text-white shadow-2xl border-4 border-red-500 animate-pulse-slow relative">
            <button
              onClick={() => setSosActive(false)}
              className="absolute top-4 right-4 bg-red-800 hover:bg-red-900 p-2 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-8">
              <div className="bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-widest mb-1">MAYDAY</h2>
              <p className="font-bold opacity-80 text-sm tracking-wide">PROTOCOLLO SICUREZZA GAUF ATTIVO</p>
            </div>

            <div className="bg-black/20 rounded-2xl p-6 mb-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/20 pb-2">
                <span className="uppercase text-xs font-bold opacity-60 flex items-center gap-2"><LocateFixed className="w-4 h-4" /> GPS Tracking</span>
                <span className="font-mono text-xl font-bold flex items-center gap-2">
                  {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'Ricerca Satelliti...'}
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/20 pb-2">
                <span className="uppercase text-xs font-bold opacity-60 flex items-center gap-2"><Radio className="w-4 h-4" /> Canale Radio</span>
                <span className="font-mono text-xl font-bold">SOUP CA - CH 16</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="uppercase text-xs font-bold opacity-60">Orario Zulu</span>
                <span className="font-mono text-xl font-bold">{new Date().toISOString().split('T')[1].slice(0, 5)} Z</span>
              </div>
            </div>

            <button
              onClick={() => alert("Coordinate inviate alla SOUP Cagliari!")}
              className="w-full bg-white text-red-600 font-black py-4 rounded-xl text-lg uppercase tracking-wider hover:bg-slate-100 transition shadow-xl flex items-center justify-center gap-2"
            >
              <Satellite className="w-6 h-6" />
              Invia Posizione a SOUP
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col shadow-2xl`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div onClick={() => setCurrentView(View.HOME)} className="cursor-pointer group flex items-center gap-3">
            <CfvaLogo className="w-10 h-10 drop-shadow-md" />
            <div>
              <h1 className="text-sm font-black text-white leading-tight">
                CORPO FORESTALE
              </h1>
              <p className="text-[9px] text-orange-500 font-bold uppercase tracking-widest">Regione Sardegna</p>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3 bg-slate-800/30">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 shadow-inner overflow-hidden">
            {/* Avatar placeholder o icona utente */}
            <div className="font-bold text-slate-400">{currentUser.name.charAt(0)}</div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
            <p className="text-[10px] text-slate-400 truncate uppercase tracking-tight">{currentUser.rank}</p>
          </div>
        </div>

        <div className="px-4 py-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-200 py-2 rounded-lg transition border border-slate-700 hover:border-red-800 group"
          >
            <LogOut className="w-4 h-4 group-hover:scale-110 transition" />
            <span className="text-xs font-bold uppercase tracking-wider">Disconnetti</span>
          </button>
        </div>

        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          <p className="px-4 pt-2 pb-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">Pianificazione</p>
          <NavItem view={View.HOME} icon={LayoutDashboard} />
          <NavItem view={View.PLANNER} icon={Flame} />
          <NavItem view={View.MAP} icon={MapIcon} />

          <div className="h-4"></div>
          <p className="px-4 pt-2 pb-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">Operatività</p>
          <NavItem view={View.REPORT} icon={FileText} disabled={!lastResult} />
          <NavItem view={View.CHECKLIST} icon={ClipboardList} />
          <NavItem view={View.OPERATORS} icon={Users} />

          <div className="h-4"></div>
          <p className="px-4 pt-2 pb-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">Academy</p>
          <NavItem view={View.TRAINING} icon={GraduationCap} />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
            <p className="text-[10px] text-slate-500 leading-relaxed italic">
              Accesso Operativo Certificato<br />
              Badge: <strong className="text-slate-400">{currentUser.badgeId}</strong>
              <br />
              <span className="text-slate-500 mt-2 block font-medium opacity-70">Creator App. Efisio Pala</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {/* TOP RIGHT GPS/SOS BUTTON - ALWAYS VISIBLE */}
        <div className="absolute top-4 right-4 md:top-6 md:right-8 z-50">
          <button
            onClick={() => setSosActive(true)}
            className={`flex items-center gap-2 pl-3 pr-4 py-2 rounded-full font-black text-xs uppercase tracking-wider transition-all shadow-xl hover:scale-105 active:scale-95 border-2 ${gpsActive
              ? 'bg-white text-red-600 border-red-600 hover:bg-red-600 hover:text-white hover:border-red-700'
              : 'bg-slate-800 text-slate-400 border-slate-600'
              }`}
          >
            <div className={`w-2 h-2 rounded-full ${gpsActive ? 'bg-red-600 animate-pulse' : 'bg-slate-500'}`}></div>
            GPS REC / SOS
          </button>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b p-4 flex justify-between items-center shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <CfvaLogo className="w-8 h-8" />
            <h1 className="font-bold text-slate-800 text-sm leading-tight">
              CFVA <br /><span className="text-orange-600 text-xs">Fuoco Prescritto</span>
            </h1>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="text-slate-600 p-2">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-slate-100/50 relative">
          <div className={`flex-1 flex flex-col max-w-7xl mx-auto w-full h-full ${currentView === View.MAP ? 'p-0 overflow-hidden' : 'p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto'
            }`}>
            {currentView !== View.HOME && (
              <header className="mb-8 hidden md:block flex-shrink-0 animate-in slide-in-from-top-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">GAUF SYSTEM</span>
                  <span className="text-[10px] text-slate-400 font-mono">{new Date().toLocaleDateString()}</span>
                </div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">{currentView}</h2>
                <p className="text-slate-500 mt-1 text-sm font-medium">Strumento certificato per operazioni CFVA Sardegna.</p>
              </header>
            )}

            <div className="flex-1 min-h-0">
              {currentView === View.HOME && <Home onNavigate={setCurrentView} onLogout={handleLogout} />}
              {currentView === View.PLANNER && (
                <Planner
                  onResultGenerated={(p, r) => handleAnalysisComplete(p, r)}
                  initialParams={lastParams}
                  initialResult={lastResult}
                />
              )}
              {currentView === View.REPORT && lastResult && (
                <TacticalReport
                  params={lastParams}
                  result={lastResult}
                  user={currentUser}
                  gpsCoords={coords}
                />
              )}
              {currentView === View.CHECKLIST && <Checklist />}
              {currentView === View.TRAINING && <TrainingChat />}
              {currentView === View.MAP && <MapEditor />}
              {currentView === View.OPERATORS && <OperatorLog user={currentUser} />}
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 bg-slate-900/95 backdrop-blur-xl text-white py-4 px-6 rounded-2xl flex justify-between items-center shadow-2xl z-50 border border-white/10">
        <button
          onClick={() => setCurrentView(View.HOME)}
          className={`flex flex-col items-center gap-1 transition ${currentView === View.HOME ? 'text-orange-500 scale-110' : 'text-slate-400 opacity-60'}`}
        >
          <LayoutDashboard className="w-6 h-6" />
        </button>

        <button
          onClick={() => setCurrentView(View.PLANNER)}
          className={`flex flex-col items-center gap-1 transition ${currentView === View.PLANNER ? 'text-orange-500 scale-110' : 'text-slate-400 opacity-60'}`}
        >
          <Flame className="w-6 h-6" />
        </button>

        {/* CENTER ACTION BUTTON */}
        <div className="bg-orange-600 rounded-full p-3 -mt-10 shadow-lg shadow-orange-500/40 border-4 border-slate-100 flex items-center justify-center">
          <button
            onClick={() => setCurrentView(View.MAP)}
            className={`transition ${currentView === View.MAP ? 'text-white' : 'text-white/90'}`}
          >
            <MapIcon className="w-6 h-6" />
          </button>
        </div>

        <button
          onClick={() => setCurrentView(View.REPORT)}
          disabled={!lastResult}
          className={`flex flex-col items-center gap-1 transition ${currentView === View.REPORT ? 'text-orange-500 scale-110' : !lastResult ? 'text-slate-600 cursor-not-allowed hidden' : 'text-slate-400 opacity-60'}`}
        >
          <FileText className="w-6 h-6" />
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 text-slate-400 opacity-60"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default App;
