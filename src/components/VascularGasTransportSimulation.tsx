import React from 'react';
import { SimState, SimOutput } from '../types';
import { playClickSound, playWaterDropSound } from '../utils/audio';

interface TransportProps {
  state: SimState;
  output: SimOutput;
  onChange: (updater: (prev: SimState) => SimState) => void;
}

export const VascularGasTransportSimulation: React.FC<TransportProps> = ({
  state,
  output,
  onChange
}) => {
  const handleWaterChange = (val: number) => {
    if (Math.abs(val - state.waterLevel) > 8) {
      playWaterDropSound(state.isMuted);
    }
    onChange((prev) => ({ ...prev, waterLevel: val }));
  };

  const handleCO2Change = (val: number) => {
    onChange((prev) => ({ ...prev, co2Level: val }));
  };

  const handlePreset = (preset: 'normal' | 'drought' | 'enriched' | 'suffocated') => {
    playClickSound(state.isMuted);
    onChange((prev) => {
      switch (preset) {
        case 'normal':
          return { ...prev, waterLevel: 75, co2Level: 420 };
        case 'drought':
          return { ...prev, waterLevel: 6, co2Level: 600 };
        case 'enriched':
          return { ...prev, waterLevel: 85, co2Level: 1100 };
        case 'suffocated':
          return { ...prev, waterLevel: 80, co2Level: 50 };
        default:
          return prev;
      }
    });
  };

  return (
    <div id="vascular_gas_transport_module" className="bg-white rounded-3xl border border-emerald-100 p-5 sm:p-7 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-emerald-950 flex items-center gap-2">
            <span>💧 Plant Vascular Transport &amp; Stomatal Gas Exchange</span>
          </h2>
          <p className="text-xs text-emerald-700/80 font-medium">
            Control root water uptake and stomatal CO₂ availability to see how internal plant transport directly correlates with glucose &amp; oxygen yields.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handlePreset('normal')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 shadow-2xs"
          >
            🌿 Standard
          </button>
          <button
            onClick={() => handlePreset('drought')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 shadow-2xs"
          >
            🌵 Drought Deficit
          </button>
          <button
            onClick={() => handlePreset('enriched')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 shadow-2xs"
          >
            🚀 CO₂ Enriched Greenhouse
          </button>
          <button
            onClick={() => handlePreset('suffocated')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100 shadow-2xs"
          >
            💨 CO₂ Deprived
          </button>
        </div>
      </div>

      {/* Dual Interactive Input Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Input 1: Root Water Uptake & Soil Moisture */}
        <div className="bg-sky-50/50 p-5 rounded-2xl border border-sky-100 space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
              <span>💧 Root Water Uptake &amp; Soil Moisture</span>
            </label>
            <span className="font-mono text-xs font-bold text-sky-800 bg-white px-3 py-1 rounded-full border border-sky-200 shadow-2xs">
              {state.waterLevel}% Moisture
            </span>
          </div>

          <input
            id="slider_vascular_water"
            type="range"
            min={0}
            max={100}
            value={state.waterLevel}
            onChange={(e) => handleWaterChange(Number(e.target.value))}
            className="w-full accent-sky-500 h-2.5 bg-sky-100 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-[11px] font-mono text-sky-800 font-medium">
            <span>0% (Wilting Point)</span>
            <span>50% (Field Capacity)</span>
            <span>100% (Saturated)</span>
          </div>

          {/* Real-time Xylem Hydrodynamics */}
          <div className="p-3 bg-white rounded-xl border border-sky-200 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sky-900 font-bold">Xylem Transpiration Stream:</span>
              <span className="font-mono font-bold text-sky-700">{output.xylemFlowRate} mL/h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sky-900 font-bold">Guard Cell Turgor Pressure:</span>
              <span
                className={`font-mono font-bold ${
                  output.stomataOpen > 50
                    ? 'text-emerald-700'
                    : output.stomataOpen > 15
                    ? 'text-amber-700'
                    : 'text-rose-600'
                }`}
              >
                {output.stomataOpen}% ({output.stomataOpen > 50 ? 'Turgid & Open' : 'Flaccid & Closed'})
              </span>
            </div>
          </div>
        </div>

        {/* Input 2: Atmospheric CO2 at Stomata */}
        <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100 space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
              <span>💨 Atmospheric CO₂ Concentration</span>
            </label>
            <span className="font-mono text-xs font-bold text-purple-800 bg-white px-3 py-1 rounded-full border border-purple-200 shadow-2xs">
              {state.co2Level} ppm
            </span>
          </div>

          <input
            id="slider_vascular_co2"
            type="range"
            min={0}
            max={1500}
            step={25}
            value={state.co2Level}
            onChange={(e) => handleCO2Change(Number(e.target.value))}
            className="w-full accent-purple-500 h-2.5 bg-purple-100 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-[11px] font-mono text-purple-800 font-medium">
            <span>0 ppm (Depleted)</span>
            <span>420 ppm (Ambient Earth)</span>
            <span>1500 ppm (Supercharged)</span>
          </div>

          {/* Real-time Gas Conductance */}
          <div className="p-3 bg-white rounded-xl border border-purple-200 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-purple-900 font-bold">Stomatal CO₂ Influx:</span>
              <span className="font-mono font-bold text-purple-700">
                {output.co2DiffusionRate} µmol/s
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-900 font-bold">Rubisco Carboxylation Rate:</span>
              <span className="font-mono font-bold text-purple-700">
                {output.rubiscoActivity}% Max
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Internal Transport Diagram: Root Xylem Highway + Stomata Gateway */}
      <div className="bg-emerald-50/40 rounded-3xl border border-emerald-200 p-5 sm:p-6 space-y-5">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-950 flex items-center justify-between">
          <span>🌿 Anatomical Internal Transport Pathways</span>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
            Synthesis Yield: {output.rate}% Speed
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pathway 1: Water Uptake through Roots to Thylakoids */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-sky-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-sky-950 font-black text-xs sm:text-sm border-b border-sky-100 pb-2">
              <span>💧 1. The Water Highway (Osmosis ➔ Xylem ➔ Photolysis)</span>
            </div>

            <ol className="space-y-2 text-xs text-sky-950 list-decimal list-inside leading-relaxed font-medium">
              <li className="p-2 bg-sky-50/60 rounded-xl border border-sky-100">
                <strong>Root Hair Osmosis:</strong> Soil water enters epidermal root hairs through aquaporin channels via osmotic potential gradient.
              </li>
              <li className="p-2 bg-sky-50/60 rounded-xl border border-sky-100">
                <strong>Xylem Capillary Ascent:</strong> Cohesion-tension forces pull water columns upward through hollow tracheids and vessel elements.
              </li>
              <li className="p-2 bg-sky-50/60 rounded-xl border border-sky-100">
                <strong>Mesophyll Delivery &amp; Photolysis:</strong> Veins distribute water to leaf palisade cells where Photosystem II splits it:
                <div className="font-mono font-bold text-sky-700 mt-0.5">
                  2H₂O ➔ 4H⁺ + 4e⁻ + O₂ ↑ ({output.oxygenRate} mL/h generated)
                </div>
              </li>
            </ol>
          </div>

          {/* Pathway 2: CO2 Diffusion through Stomata to Stroma */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-purple-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-purple-950 font-black text-xs sm:text-sm border-b border-purple-100 pb-2">
              <span>💨 2. The CO₂ Pathway (Stomata ➔ Air Space ➔ Rubisco)</span>
            </div>

            <ol className="space-y-2 text-xs text-purple-950 list-decimal list-inside leading-relaxed font-medium">
              <li className="p-2 bg-purple-50/60 rounded-xl border border-purple-100">
                <strong>Stomatal Guard Pore Opening:</strong> When leaf cells are hydrated ({state.waterLevel}%), potassium ions enter guard cells, swelling them to open the pore ({output.stomataOpen}% open).
              </li>
              <li className="p-2 bg-purple-50/60 rounded-xl border border-purple-100">
                <strong>Intercellular Gas Diffusion:</strong> CO₂ diffuses through the sub-stomatal cavity across moist mesophyll cell walls into the cytoplasm.
              </li>
              <li className="p-2 bg-purple-50/60 rounded-xl border border-purple-100">
                <strong>Chloroplast Stroma Fixation:</strong> CO₂ enters the stroma where the enzyme <strong>Rubisco</strong> fixes it to produce:
                <div className="font-mono font-bold text-purple-700 mt-0.5">
                  6CO₂ + Energy ➔ C₆H₁₂O₆ ({output.glucoseRate} mg/h Glucose synthesized)
                </div>
              </li>
            </ol>
          </div>
        </div>

        {/* Input vs Output Correlation Matrix */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 space-y-3">
          <div className="text-xs font-black uppercase tracking-wider text-emerald-950">
            📊 Input-to-Output Biological Correlation Metrics:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
              <div className="text-sky-900 font-medium">Water Uptake Level</div>
              <div className="text-lg font-black font-mono text-sky-700 mt-0.5">{state.waterLevel}%</div>
              <div className="text-[10px] text-sky-800 font-bold mt-1">
                ➔ Drives {output.oxygenRate} mL/h O₂
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
              <div className="text-purple-900 font-medium">Available CO₂ Gas</div>
              <div className="text-lg font-black font-mono text-purple-700 mt-0.5">{state.co2Level} ppm</div>
              <div className="text-[10px] text-purple-800 font-bold mt-1">
                ➔ Drives {output.glucoseRate} mg/h Sugar
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-emerald-900 font-medium">Stomatal Aperture</div>
              <div className="text-lg font-black font-mono text-emerald-700 mt-0.5">{output.stomataOpen}%</div>
              <div className="text-[10px] text-emerald-800 font-bold mt-1">
                {output.stomataOpen > 50 ? 'Full Conductance' : 'Throttled Conductance'}
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div className="text-amber-900 font-medium">Overall Rate</div>
              <div className="text-lg font-black font-mono text-amber-700 mt-0.5">{output.rate}%</div>
              <div className="text-[10px] text-amber-800 font-bold mt-1">
                Limiting: {output.limitingFactor}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
