export type ViewLevel = 'whole_plant' | 'leaf_cross_section' | 'chloroplast_zoom';

export type LightSpectrum =
  | 'white'
  | 'violet'
  | 'blue'
  | 'cyan'
  | 'green'
  | 'yellow'
  | 'red'
  | 'far_red'
  | 'dark'
  | 'custom';

export interface SimState {
  viewLevel: ViewLevel;
  lightIntensity: number; // 0 - 100 %
  lightSpectrum: LightSpectrum;
  wavelengthNm: number; // 380 - 750 nm
  co2Level: number; // 0 - 1500 ppm
  waterLevel: number; // 0 - 100 % (Soil moisture / root water uptake)
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
  chlAAbsorption: number; // 0 - 100 %
  chlBAbsorption: number; // 0 - 100 %
  carotenoidAbsorption: number; // 0 - 100 %
  parFlux: number; // µmol photons/m²/s
  xylemFlowRate: number; // mL/h root-to-leaf flux
  co2DiffusionRate: number; // µmol CO2/s leaf influx
  atpProductionRate: number; // nmol/s
  nadphProductionRate: number; // nmol/s
  rubiscoActivity: number; // 0 - 100 %
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

