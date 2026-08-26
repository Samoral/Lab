import { SimState, SimOutput, LightSpectrum } from '../types';

/**
 * Calculates biological outputs for photosynthesis simulation based on inputs.
 * Uses realistic response curves:
 * - Light: Rectangular hyperbola with spectral coefficient
 * - CO2: Michaelis-Menten saturation curve
 * - Water: Regulates stomata aperture & photolysis availability
 * - Temperature: Bell curve (Arrhenius activation + thermal enzyme denaturation)
 */

export const SPECTRUM_EFFICIENCY: Record<LightSpectrum, { name: string; wavelength: string; efficiency: number; colorHex: string; beamRgb: [number, number, number] }> = {
  white: { name: 'Full Sunlight (PAR)', wavelength: '400 - 700 nm', efficiency: 1.0, colorHex: '#FBBF24', beamRgb: [1, 0.95, 0.8] },
  blue: { name: 'Blue Light (Peak Absorption)', wavelength: '430 - 450 nm', efficiency: 0.95, colorHex: '#3B82F6', beamRgb: [0.2, 0.5, 1.0] },
  red: { name: 'Red Light (Peak Absorption)', wavelength: '650 - 680 nm', efficiency: 0.92, colorHex: '#EF4444', beamRgb: [1.0, 0.2, 0.2] },
  green: { name: 'Green Light (Reflected)', wavelength: '520 - 550 nm', efficiency: 0.18, colorHex: '#10B981', beamRgb: [0.1, 0.9, 0.3] },
  dark: { name: 'Complete Darkness', wavelength: '0 nm', efficiency: 0.0, colorHex: '#475569', beamRgb: [0.05, 0.05, 0.1] }
};

export function calculatePhotosynthesis(state: SimState): SimOutput {
  const { lightIntensity, lightSpectrum, co2Level, waterLevel, temperature } = state;

  const spec = SPECTRUM_EFFICIENCY[lightSpectrum];
  const effectiveLight = (lightIntensity / 100) * spec.efficiency;

  // Stomata aperture: Controlled by water turgor pressure and light trigger
  // In low water (<20%), guard cells become flaccid and stomata close to prevent drought death
  let stomataOpen = 0;
  if (waterLevel > 10) {
    const waterFactor = Math.min(1, (waterLevel - 10) / 40); // 0 to 1 as water goes 10->50%
    const lightTrigger = effectiveLight > 0.05 ? 1 : 0.2; // Stomata open wider in light
    stomataOpen = Math.min(100, Math.round(waterFactor * lightTrigger * 100));
  }

  // Factor 1: Light Availability Factor (0 - 1)
  // Michaelis-Menten saturation: Km ≈ 0.25
  const lightFactor = effectiveLight / (effectiveLight + 0.22);

  // Factor 2: CO2 Availability Factor (0 - 1)
  // Depends on ambient CO2 and stomatal opening
  const internalCO2 = (co2Level / 1200) * (stomataOpen / 100);
  const co2Factor = internalCO2 / (internalCO2 + 0.18);

  // Factor 3: Water Availability Factor (0 - 1)
  // Photolysis requires water directly, plus turgor for cell health
  const waterFactor = waterLevel < 15 ? (waterLevel / 15) * 0.4 : Math.min(1, 0.4 + ((waterLevel - 15) / 85) * 0.6);

  // Factor 4: Temperature Factor (0 - 1)
  // Optimum is ~25-30°C. Below 10°C, molecular collisions are slow. Above 38°C, Rubisco denatures.
  let tempFactor = 0;
  if (temperature >= 5 && temperature <= 50) {
    if (temperature < 28) {
      // Rising phase (Q10 enzyme kinetics)
      tempFactor = Math.max(0.05, Math.pow((temperature - 4) / 24, 1.4));
    } else {
      // Denaturation phase (rapid drop)
      const overTemp = temperature - 28;
      tempFactor = Math.max(0, 1 - Math.pow(overTemp / 18, 2));
    }
  }

  // Overall Rate: Liebig's Law of the Minimum with smooth synergy
  // The overall rate is primarily capped by the lowest factor
  const factors = [
    { name: 'Light' as const, value: lightFactor, explanation: 'Photosynthesis is limited by low light or inefficient spectrum. Increase light intensity or switch to Blue/Red/White light.' },
    { name: 'CO2' as const, value: co2Factor, explanation: 'Photosynthesis is limited by low CO2 concentration in the leaf air spaces. Increase CO2 or check stomata opening.' },
    { name: 'Water' as const, value: waterFactor, explanation: 'Photosynthesis is limited by water scarcity. Stomata close to prevent drying out, cutting off CO2 & photolysis.' },
    { name: 'Temperature' as const, value: tempFactor, explanation: temperature < 18 ? 'Enzyme activity is sluggish due to cold temperature. Warm the chamber to 25°C.' : 'Enzymes (like Rubisco) are denaturing due to extreme heat! Cool down to 25-30°C.' }
  ];

  // Find lowest factor
  factors.sort((a, b) => a.value - b.value);
  const lowest = factors[0];

  let limitingFactor: SimOutput['limitingFactor'] = lowest.name;
  let limitingFactorExplanation = lowest.explanation;

  // Harmonized rate percentage (0 - 100%)
  let rawRate = (lightFactor * 0.35 + co2Factor * 0.35 + waterFactor * 0.15 + tempFactor * 0.15);
  // Strictly clamp by minimum bottleneck
  rawRate = Math.min(rawRate, lowest.value * 1.05);

  const rate = Math.round(Math.max(0, Math.min(100, rawRate * 100)));

  if (rate >= 88) {
    limitingFactor = 'None (Optimal)';
    limitingFactorExplanation = 'Conditions are optimal! The plant is photosynthesizing at peak efficiency, generating maximum Oxygen and Glucose.';
  }

  // Realistic quantitative outputs
  const oxygenRate = Number(((rate / 100) * 42.5).toFixed(1)); // mL of O2 per hour
  const glucoseRate = Number(((rate / 100) * 18.2).toFixed(1)); // mg of Glucose per hour
  const atpLevel = Math.round(effectiveLight * 100 * (waterLevel > 10 ? 1 : 0.2));
  const chlorophyllAbsorption = Math.round(spec.efficiency * 100);

  return {
    rate,
    oxygenRate,
    glucoseRate,
    atpLevel,
    stomataOpen,
    limitingFactor,
    limitingFactorExplanation,
    chlorophyllAbsorption
  };
}
