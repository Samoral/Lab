import { SimState, SimOutput, LightSpectrum } from '../types';

/**
 * Calculates biological outputs for photosynthesis simulation based on inputs.
 * Incorporates:
 * - Wavelength Absorption curves for Chlorophyll a, Chlorophyll b, and Carotenoids
 * - Light Intensity (PAR Photon flux)
 * - CO2 Leaf gas exchange and stomata conductance
 * - Water root uptake, xylem flow rate, and photolysis
 * - Temperature kinetics (Arrhenius Q10 + thermal Rubisco denaturation)
 */

export interface SpectrumMeta {
  name: string;
  wavelength: string;
  defaultWavelength: number;
  efficiency: number;
  colorHex: string;
  beamRgb: [number, number, number];
  description: string;
}

export const SPECTRUM_EFFICIENCY: Record<LightSpectrum, SpectrumMeta> = {
  white: {
    name: 'Full Sunlight (PAR 400-700nm)',
    wavelength: '400 - 700 nm',
    defaultWavelength: 550,
    efficiency: 1.0,
    colorHex: '#FBBF24',
    beamRgb: [1, 0.95, 0.8],
    description: 'Balanced natural solar spectrum containing all photosynthetic wavelengths.'
  },
  violet: {
    name: 'Violet Light',
    wavelength: '405 nm',
    defaultWavelength: 405,
    efficiency: 0.82,
    colorHex: '#8B5CF6',
    beamRgb: [0.55, 0.2, 1.0],
    description: 'High energy photons, efficiently absorbed by Chlorophyll a and carotenoids.'
  },
  blue: {
    name: 'Blue Light (Peak Absorption)',
    wavelength: '445 nm',
    defaultWavelength: 445,
    efficiency: 0.98,
    colorHex: '#3B82F6',
    beamRgb: [0.15, 0.45, 1.0],
    description: 'Major peak absorption for both Chlorophyll a & b; strongly drives light reactions.'
  },
  cyan: {
    name: 'Cyan Light',
    wavelength: '490 nm',
    defaultWavelength: 490,
    efficiency: 0.65,
    colorHex: '#06B6D4',
    beamRgb: [0.1, 0.8, 0.9],
    description: 'Intermediate absorption captured by accessory carotenoid pigments.'
  },
  green: {
    name: 'Green Light (Reflected / Window)',
    wavelength: '530 nm',
    defaultWavelength: 530,
    efficiency: 0.18,
    colorHex: '#10B981',
    beamRgb: [0.1, 0.95, 0.3],
    description: 'Poorly absorbed by chlorophylls and mostly reflected, giving leaves their green color!'
  },
  yellow: {
    name: 'Yellow-Orange Light',
    wavelength: '585 nm',
    defaultWavelength: 585,
    efficiency: 0.52,
    colorHex: '#F59E0B',
    beamRgb: [0.95, 0.7, 0.1],
    description: 'Moderate absorption by Chlorophyll b transitioning towards the red peak.'
  },
  red: {
    name: 'Red Light (Peak Absorption)',
    wavelength: '660 nm',
    defaultWavelength: 660,
    efficiency: 0.94,
    colorHex: '#EF4444',
    beamRgb: [1.0, 0.15, 0.15],
    description: 'Optimal quantum yield for Photosystem II and I reaction centers (P680 & P700).'
  },
  far_red: {
    name: 'Far-Red Light',
    wavelength: '725 nm',
    defaultWavelength: 725,
    efficiency: 0.28,
    colorHex: '#991B1B',
    beamRgb: [0.7, 0.05, 0.05],
    description: 'Beyond main absorption band; triggers shade avoidance but yields low energy.'
  },
  dark: {
    name: 'Complete Darkness',
    wavelength: '0 nm',
    defaultWavelength: 0,
    efficiency: 0.0,
    colorHex: '#334155',
    beamRgb: [0.05, 0.05, 0.1],
    description: 'No photons available. Light reactions cease completely; only respiration occurs.'
  },
  custom: {
    name: 'Monochromatic Tunable Light',
    wavelength: 'Custom λ',
    defaultWavelength: 450,
    efficiency: 0.9,
    colorHex: '#6366F1',
    beamRgb: [0.4, 0.4, 1.0],
    description: 'Precise wavelength selected by the user on the continuous spectrum.'
  }
};

/**
 * Calculates Gaussian peak absorption value
 */
function gaussian(x: number, peak: number, width: number, height: number): number {
  return height * Math.exp(-Math.pow(x - peak, 2) / (2 * Math.pow(width, 2)));
}

/**
 * Computes pigment absorption curves for any wavelength in nm (380 - 750 nm)
 */
export function getPigmentAbsorptions(wavelengthNm: number) {
  if (wavelengthNm <= 0) {
    return { chlA: 0, chlB: 0, carotenoids: 0, combined: 0 };
  }

  // Chlorophyll a: Soret band at 430nm, Q band at 662nm
  const chlA_blue = gaussian(wavelengthNm, 430, 22, 96);
  const chlA_red = gaussian(wavelengthNm, 662, 18, 92);
  const chlA_green = gaussian(wavelengthNm, 530, 45, 8);
  const chlA = Math.min(100, Math.round(chlA_blue + chlA_red + chlA_green));

  // Chlorophyll b: Soret band at 455nm, Q band at 642nm
  const chlB_blue = gaussian(wavelengthNm, 455, 20, 94);
  const chlB_red = gaussian(wavelengthNm, 642, 16, 86);
  const chlB_green = gaussian(wavelengthNm, 545, 40, 10);
  const chlB = Math.min(100, Math.round(chlB_blue + chlB_red + chlB_green));

  // Carotenoids (beta-carotene & lutein): 400 - 500nm
  const carot = Math.min(100, Math.round(gaussian(wavelengthNm, 450, 28, 88) + gaussian(wavelengthNm, 480, 20, 75)));

  // Combined action efficiency (0 to 1)
  const combined = Math.min(1.0, (chlA * 0.45 + chlB * 0.40 + carot * 0.15) / 95);

  return {
    chlA,
    chlB,
    carotenoids: carot,
    combined
  };
}

/**
 * Converts a wavelength in nanometers to an approximate RGB hex color
 */
export function wavelengthToHex(wavelength: number): string {
  if (wavelength < 380 || wavelength > 750) return '#475569';

  let r = 0;
  let g = 0;
  let b = 0;

  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380);
    g = 0.0;
    b = 1.0;
  } else if (wavelength >= 440 && wavelength < 490) {
    r = 0.0;
    g = (wavelength - 440) / (490 - 440);
    b = 1.0;
  } else if (wavelength >= 490 && wavelength < 510) {
    r = 0.0;
    g = 1.0;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1.0;
    b = 0.0;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1.0;
    g = -(wavelength - 645) / (645 - 580);
    b = 0.0;
  } else if (wavelength >= 645 && wavelength <= 750) {
    r = 1.0;
    g = 0.0;
    b = 0.0;
  }

  // Intensity factor at eye sensitivity edges
  let factor = 1.0;
  if (wavelength < 420) {
    factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
  } else if (wavelength > 700) {
    factor = 0.3 + 0.7 * (750 - wavelength) / (750 - 700);
  }

  const red = Math.round(Math.max(0, Math.min(255, r * factor * 255)));
  const green = Math.round(Math.max(0, Math.min(255, g * factor * 255)));
  const blue = Math.round(Math.max(0, Math.min(255, b * factor * 255)));

  return `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1).toUpperCase()}`;
}

export function calculatePhotosynthesis(state: SimState): SimOutput {
  const { lightIntensity, lightSpectrum, wavelengthNm, co2Level, waterLevel, temperature } = state;

  let specEfficiency = 1.0;
  let chlAAbs = 88;
  let chlBAbs = 85;
  let carotAbs = 70;

  if (lightSpectrum === 'white') {
    specEfficiency = 1.0;
    chlAAbs = 85;
    chlBAbs = 82;
    carotAbs = 75;
  } else if (lightSpectrum === 'dark') {
    specEfficiency = 0.0;
    chlAAbs = 0;
    chlBAbs = 0;
    carotAbs = 0;
  } else if (lightSpectrum === 'custom') {
    const pigments = getPigmentAbsorptions(wavelengthNm || 450);
    specEfficiency = Math.max(0.05, pigments.combined);
    chlAAbs = pigments.chlA;
    chlBAbs = pigments.chlB;
    carotAbs = pigments.carotenoids;
  } else {
    const spec = SPECTRUM_EFFICIENCY[lightSpectrum];
    const pigments = getPigmentAbsorptions(spec.defaultWavelength);
    specEfficiency = spec.efficiency;
    chlAAbs = pigments.chlA;
    chlBAbs = pigments.chlB;
    carotAbs = pigments.carotenoids;
  }

  const effectiveLight = (lightIntensity / 100) * specEfficiency;

  // Stomata aperture: Regulated by root water turgor and light stimulus
  let stomataOpen = 0;
  if (waterLevel > 8) {
    const waterTurgorFactor = Math.min(1, (waterLevel - 8) / 42); // 0 to 1 as water goes 8% -> 50%
    const lightTrigger = effectiveLight > 0.04 ? 1.0 : 0.22; // Blue/White light stimulates H+-ATPase in guard cells
    stomataOpen = Math.min(100, Math.round(waterTurgorFactor * lightTrigger * 100));
  }

  // Factor 1: Light Availability Factor (0 - 1)
  const lightFactor = effectiveLight / (effectiveLight + 0.20);

  // Factor 2: CO2 Availability Factor (0 - 1)
  // Internal sub-stomatal CO2 concentration (Ci) depends on atmospheric CO2 and stomatal conductance
  const internalCO2 = (co2Level / 1200) * (stomataOpen / 100);
  const co2Factor = internalCO2 / (internalCO2 + 0.16);

  // Factor 3: Water Availability Factor (0 - 1)
  const waterFactor = waterLevel < 12 ? (waterLevel / 12) * 0.35 : Math.min(1, 0.35 + ((waterLevel - 12) / 88) * 0.65);

  // Factor 4: Temperature Factor (0 - 1)
  let tempFactor = 0;
  if (temperature >= 5 && temperature <= 50) {
    if (temperature < 28) {
      tempFactor = Math.max(0.04, Math.pow((temperature - 4) / 24, 1.45));
    } else {
      const overTemp = temperature - 28;
      tempFactor = Math.max(0, 1 - Math.pow(overTemp / 17, 2));
    }
  }

  // Factor limiting diagnosis
  const factors = [
    {
      name: 'Light' as const,
      value: lightFactor,
      explanation:
        lightIntensity < 20
          ? 'Light intensity is extremely low. Insufficient photon energy to excite chlorophyll reaction centers.'
          : lightSpectrum === 'green'
          ? 'Green light wavelength (530nm) is reflected by chlorophyll instead of absorbed. Switch to Blue (445nm) or Red (660nm) light.'
          : 'Photosynthesis is light-limited. Increase photon intensity on the leaf surface.'
    },
    {
      name: 'CO2' as const,
      value: co2Factor,
      explanation:
        stomataOpen < 20
          ? 'CO₂ cannot diffuse into the mesophyll because stomata guard cells are closed due to water stress.'
          : 'Low ambient CO₂ in the chamber limits Rubisco carbon fixation during the Calvin cycle.'
    },
    {
      name: 'Water' as const,
      value: waterFactor,
      explanation:
        'Severe water deficit. Roots cannot supply water to the xylem, halting photolysis and causing stomata to clamp shut.'
    },
    {
      name: 'Temperature' as const,
      value: tempFactor,
      explanation:
        temperature < 18
          ? 'Enzyme kinetics are slow due to low kinetic energy. Warm the chamber to 25°C.'
          : 'High heat (>38°C) is causing thermal denaturation of the Rubisco enzyme and membrane disruption.'
    }
  ];

  factors.sort((a, b) => a.value - b.value);
  const lowest = factors[0];

  let limitingFactor: SimOutput['limitingFactor'] = lowest.name;
  let limitingFactorExplanation = lowest.explanation;

  let rawRate = lightFactor * 0.35 + co2Factor * 0.35 + waterFactor * 0.15 + tempFactor * 0.15;
  rawRate = Math.min(rawRate, lowest.value * 1.08);

  const rate = Math.round(Math.max(0, Math.min(100, rawRate * 100)));

  if (rate >= 88) {
    limitingFactor = 'None (Optimal)';
    limitingFactorExplanation =
      'Conditions are optimal! Chlorophyll absorption, water photolysis, and the Calvin cycle are firing at maximum speed.';
  }

  // Derived quantitative metrics
  const oxygenRate = Number(((rate / 100) * 45.0).toFixed(1)); // mL/h
  const glucoseRate = Number(((rate / 100) * 19.5).toFixed(1)); // mg/h
  const atpLevel = Math.round(effectiveLight * 100 * (waterLevel > 8 ? 1 : 0.2));
  const chlorophyllAbsorption = Math.round(specEfficiency * 100);
  const parFlux = Math.round((lightIntensity / 100) * 1800 * specEfficiency); // µmol/m²/s
  const xylemFlowRate = Number(((waterLevel / 100) * (stomataOpen / 100) * 32.0 + 1.2).toFixed(1)); // mL/h
  const co2DiffusionRate = Number(((co2Level / 1000) * (stomataOpen / 100) * 18.5).toFixed(1)); // µmol/s
  const atpProductionRate = Math.round((effectiveLight * 100) * (waterLevel > 10 ? 1 : 0.15) * 12.4); // nmol/s
  const nadphProductionRate = Math.round(atpProductionRate * 0.67); // nmol/s (stoichiometric 3 ATP : 2 NADPH)
  const rubiscoActivity = Math.round(tempFactor * (internalCO2 / (internalCO2 + 0.2)) * 100);

  return {
    rate,
    oxygenRate,
    glucoseRate,
    atpLevel,
    stomataOpen,
    limitingFactor,
    limitingFactorExplanation,
    chlorophyllAbsorption,
    chlAAbsorption: chlAAbs,
    chlBAbsorption: chlBAbs,
    carotenoidAbsorption: carotAbs,
    parFlux,
    xylemFlowRate,
    co2DiffusionRate,
    atpProductionRate,
    nadphProductionRate,
    rubiscoActivity
  };
}

