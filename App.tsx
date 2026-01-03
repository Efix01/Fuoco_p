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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-200">
        <div className="w-20 h-20 mb-6 animate-pulse">
          <CfvaLogo className="w-full h-full" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-white">CFVA</h1>
          <p className="text-xs font-medium text-orange-500 uppercase tracking-widest">Fuoco Prescritto</p>
        </div>
        <div className="mt-8 flex gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"></div>
        </div>
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

  // Render main application UI
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8">
            <CfvaLogo className="w-full h-full" />
          </div>
          <div>
            <h1 className="text-sm font-black leading-none">CFVA</h1>
            <p className="text-[8px] font-bold text-orange-500 uppercase tracking-widest">Fuoco Prescritto</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-40
        w-72 h-screen bg-slate-900 text-slate-100 flex flex-col p-6 shadow-2xl transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="mb-10 flex items-center gap-4 px-2">
          <div className="w-12 h-12 bg-white/5 rounded-xl p-1.5 border border-white/10 shadow-inner">
            <CfvaLogo className="w-full h-full drop-shadow-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-black leading-none tracking-tighter">CFVA</h1>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em]">Fuoco Prescritto</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem view={View.HOME} icon={LayoutDashboard} />
          <NavItem view={View.PLANNER} icon={Flame} />
          <NavItem view={View.MAP} icon={MapIcon} />
          <NavItem view={View.REPORT} icon={FileText} disabled={!lastResult} />
          <NavItem view={View.CHECKLIST} icon={ClipboardList} />
          <NavItem view={View.TRAINING} icon={GraduationCap} />
          <NavItem view={View.OPERATORS} icon={Users} />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 mb-4 group hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                {currentUser.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 font-mono uppercase truncate">{currentUser.badgeId}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 mt-2 bg-slate-700/50 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg text-xs font-bold transition group-hover:bg-slate-700"
            >
              <LogOut className="w-3.5 h-3.5" />
              CHIUDI SESSIONE
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-h-screen relative overflow-x-hidden pt-4 md:pt-0">
        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          {currentView === View.HOME && <Home onNavigate={setCurrentView} onLogout={handleLogout} />}
          {currentView === View.PLANNER && <Planner onResultGenerated={handleAnalysisComplete} initialParams={lastParams} initialResult={lastResult} />}
          {currentView === View.MAP && <MapEditor />}
          {currentView === View.REPORT && lastResult && <TacticalReport params={lastParams!} result={lastResult!} />}
          {currentView === View.CHECKLIST && <Checklist />}
          {currentView === View.TRAINING && <TrainingChat />}
          {currentView === View.OPERATORS && <OperatorLog onNavigate={setCurrentView} />}
        </div>
      </main>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 md:hidden animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
