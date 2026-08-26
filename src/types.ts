export type ViewLevel = 'whole_plant' | 'leaf_cross_section' | 'chloroplast_zoom';

export type LightSpectrum = 'white' | 'blue' | 'red' | 'green' | 'dark';

export interface SimState {
  viewLevel: ViewLevel;
  lightIntensity: number; // 0 - 100 %
  lightSpectrum: LightSpectrum;
  co2Level: number; // 0 - 1200 ppm
  waterLevel: number; // 0 - 100 %
  temperature: number; // 5 - 50 °C
  isPlaying: boolean;
  simSpeed: number; // 0.5x, 1x, 2x
  showParticles: boolean;
  showLabels: boolean;
  isMuted: boolean;
}

export interface SimOutput {
  rate: number; // 0 - 100 %
  oxygenRate: number; // mL/h
  glucoseRate: number; // mg/h
  atpLevel: number; // 0 - 100 %
  stomataOpen: number; // 0 - 100 %
  limitingFactor: 'Light' | 'CO2' | 'Water' | 'Temperature' | 'None (Optimal)';
  limitingFactorExplanation: string;
  chlorophyllAbsorption: number; // 0 - 100 %
}

export interface HotspotInfo {
  id: string;
  name: string;
  view: ViewLevel;
  position: [number, number, number];
  title: string;
  description: string;
  role: string;
  funFact: string;
}

export interface GuidedExperiment {
  id: string;
  title: string;
  category: string;
  question: string;
  goal: string;
  hint: string;
  targetCondition: (state: SimState, output: SimOutput) => boolean;
  explanation: string;
  badge: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  relatedStructure: string;
}
