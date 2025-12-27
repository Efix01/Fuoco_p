
export enum FuelType {
  MACCHIA_BASSA = "Macchia Bassa (0.5m)",
  MACCHIA_ALTA = "Macchia Alta (1.5m+)",
  SOTTOBOSCO_PINETA = "Sottobosco Pineta",
  ERBA_SECCA = "Erba Secca",
  BOSCO = "Bosco (Fustaia/Ceduo)"
}

export enum Aspect {
  N = "Nord",
  NE = "Nord-Est",
  E = "Est",
  SE = "Sud-Est",
  S = "Sud",
  SW = "Sud-Ovest",
  W = "Ovest",
  NW = "Nord-Ovest"
}

export enum View {
  HOME = 'Dashboard',
  PLANNER = 'Pianificatore',
  REPORT = 'Report Tattico',
  TRAINING = 'Training Simulator',
  CHECKLIST = 'Protocollo',
  MAP = 'Mappa Operativa',
  OPERATORS = 'Registro Ore'
}

export interface User {
  id: string;
  badgeId: string;
  name: string;
  rank: string;
  unit: string;
  isAuthenticated: boolean;
}

export interface BurnParameters {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: Aspect;
  slope: number;
  fuelMoisture: number;
  fuelType: FuelType;
  exposure: Aspect; // Esposizione del versante per CPS
  description: string;
}

export interface SimulationResult {
  ros: string;
  flameLength: string;
  intensity: string;
  riskAssessment: string;
  trainingTip: string;
  tacticalAdvice: string;
  reasoningPath?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  category: 'Briefing' | 'Ignition' | 'Mopup';
}

export interface Operator {
  id: string;
  name: string;
  role: 'Operatore' | 'Capo Squadra' | 'DOS' | 'Autista';
  total_hours: number;
  last_activity: string | null;
}

export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  prompt: string;
  thumbnailUrl: string;
  status: 'idle' | 'generating' | 'completed' | 'error';
  progress: number;
  videoUri?: string;
}
