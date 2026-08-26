import React from 'react';
import { SimState, SimOutput, LightSpectrum } from '../types';
import { SPECTRUM_EFFICIENCY } from '../utils/photosynthesisMath';
import { playClickSound, playWaterDropSound } from '../utils/audio';

interface ControlsProps {
  state: SimState;
  output: SimOutput;
  onChange: (updater: (prev: SimState) => SimState) => void;
}

export const LabControls: React.FC<ControlsProps> = ({ state, output, onChange }) => {
  const handlePreset = (presetName: string) => {
    playClickSound(state.isMuted);
    onChange((prev) => {
      switch (presetName) {
        case 'optimal':
          return {
            ...prev,
            lightIntensity: 90,
            lightSpectrum: 'white',
            co2Level: 900,
            waterLevel: 80,
            temperature: 26
          };
        case 'drought':
          return {
            ...prev,
            lightIntensity: 95,
            lightSpectrum: 'white',
            co2Level: 500,
            waterLevel: 8,
            temperature: 34
          };
        case 'green_light':
          return {
            ...prev,
            lightIntensity: 85,
            lightSpectrum: 'green',
            co2Level: 700,
            waterLevel: 75,
            temperature: 25
          };
        case 'night':
          return {
            ...prev,
            lightIntensity: 0,
            lightSpectrum: 'dark',
            co2Level: 450,
            waterLevel: 60,
            temperature: 16
          };
        case 'heatwave':
          return {
            ...prev,
            lightIntensity: 100,
            lightSpectrum: 'white',
            co2Level: 800,
            waterLevel: 40,
            temperature: 46
          };
        default:
          return prev;
      }
    });
  };

  return (
    <div id="lab_controls_panel" className="bg-white rounded-3xl border border-emerald-100 p-5 sm:p-6 shadow-sm space-y-6">
      {/* Header with Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-emerald-950 flex items-center gap-2">
            <span>🔬 Environmental Chamber Controls</span>
          </h2>
          <p className="text-xs text-emerald-700/80 font-medium">
            Adjust real-time physical variables to see their direct biological impact
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-emerald-900 font-bold mr-0.5">Presets:</span>
          <button
            id="preset_optimal_btn"
            onClick={() => handlePreset('optimal')}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs shadow-emerald-200 transition-all"
          >
            ☀️ Optimal
          </button>
          <button
            id="preset_drought_btn"
            onClick={() => handlePreset('drought')}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs shadow-amber-200 transition-all"
          >
            🌵 Drought
          </button>
          <button
            id="preset_green_btn"
            onClick={() => handlePreset('green_light')}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs shadow-emerald-300 transition-all"
          >
            🟢 Green Only
          </button>
          <button
            id="preset_night_btn"
            onClick={() => handlePreset('night')}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-900 text-white shadow-xs transition-all"
          >
            🌙 Night
          </button>
          <button
            id="preset_heat_btn"
            onClick={() => handlePreset('heatwave')}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-xs shadow-rose-200 transition-all"
          >
            🔥 Heatwave
          </button>
        </div>
      </div>

      {/* Primary Variable Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Variable 1: Light Intensity & Spectrum */}
        <div className="bg-emerald-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-100 space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>☀️ Light Intensity</span>
            </label>
            <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
              {state.lightIntensity}%
            </span>
          </div>

          <input
            id="slider_light_intensity"
            type="range"
            min={0}
            max={100}
            value={state.lightIntensity}
            onChange={(e) => {
              const val = Number(e.target.value);
              onChange((prev) => ({ ...prev, lightIntensity: val }));
            }}
            className="w-full accent-amber-500 h-2.5 bg-emerald-100 rounded-lg cursor-pointer border border-emerald-200"
          />

          {/* Light Spectrum Selector */}
          <div className="pt-1">
            <div className="text-xs font-bold text-emerald-900 mb-1.5 flex items-center justify-between">
              <span>Wavelength / Light Color:</span>
              <span className="text-[11px] text-emerald-700 font-mono font-medium">
                {SPECTRUM_EFFICIENCY[state.lightSpectrum].wavelength}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 text-xs">
              {(['white', 'blue', 'red', 'green', 'dark'] as LightSpectrum[]).map((specKey) => {
                const spec = SPECTRUM_EFFICIENCY[specKey];
                const isSelected = state.lightSpectrum === specKey;
                return (
                  <button
                    key={specKey}
                    id={`spectrum_btn_${specKey}`}
                    onClick={() => {
                      playClickSound(state.isMuted);
                      onChange((prev) => ({ ...prev, lightSpectrum: specKey }));
                    }}
                    className={`py-2 px-1 text-center rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-white text-emerald-950 font-bold border-2 border-emerald-500 shadow-sm'
                        : 'bg-white/80 text-emerald-800 border-emerald-200 hover:bg-white'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full mx-auto mb-1 border border-slate-300 shadow-2xs"
                      style={{ backgroundColor: spec.colorHex }}
                    />
                    <span className="capitalize text-[11px] block truncate font-medium">{specKey}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Variable 2: Carbon Dioxide (CO2) Concentration */}
        <div className="bg-emerald-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-100 space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>💨 Carbon Dioxide (CO₂)</span>
            </label>
            <span className="font-mono text-xs font-bold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
              {state.co2Level} ppm
            </span>
          </div>

          <input
            id="slider_co2_level"
            type="range"
            min={0}
            max={1200}
            step={25}
            value={state.co2Level}
            onChange={(e) => {
              const val = Number(e.target.value);
              onChange((prev) => ({ ...prev, co2Level: val }));
            }}
            className="w-full accent-purple-500 h-2.5 bg-emerald-100 rounded-lg cursor-pointer border border-emerald-200"
          />

          <div className="flex items-center justify-between text-[11px] text-emerald-700/80 font-mono font-medium">
            <span>0 ppm (Starved)</span>
            <span>420 ppm (Atmosphere)</span>
            <span>1200 ppm (Saturated)</span>
          </div>

          <p className="text-xs text-emerald-800/90 pt-1 leading-relaxed">
            CO₂ diffuses through stomata into chloroplast stroma where the enzyme <strong>Rubisco</strong> fixes carbon into sugars.
          </p>
        </div>

        {/* Variable 3: Water Supply & Soil Moisture */}
        <div className="bg-emerald-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-100 space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>💧 Water Supply &amp; Moisture</span>
            </label>
            <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-200">
              {state.waterLevel}%
            </span>
          </div>

          <input
            id="slider_water_level"
            type="range"
            min={0}
            max={100}
            value={state.waterLevel}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (Math.abs(val - state.waterLevel) > 10) {
                playWaterDropSound(state.isMuted);
              }
              onChange((prev) => ({ ...prev, waterLevel: val }));
            }}
            className="w-full accent-sky-500 h-2.5 bg-emerald-100 rounded-lg cursor-pointer border border-emerald-200"
          />

          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-emerald-800">Stomata Guard Pore State:</span>
            <span
              className={`font-bold font-mono ${
                output.stomataOpen > 50
                  ? 'text-emerald-700'
                  : output.stomataOpen > 15
                  ? 'text-amber-700'
                  : 'text-rose-600'
              }`}
            >
              {output.stomataOpen}% Open ({output.stomataOpen > 50 ? 'Turgid' : 'Flaccid/Closed'})
            </span>
          </div>

          <p className="text-xs text-emerald-800/90 leading-relaxed">
            {state.waterLevel < 20 ? (
              <span className="text-rose-700 font-semibold">
                ⚠️ Severe water stress! Guard cells lose turgor pressure and clamp stomata shut to prevent desiccation.
              </span>
            ) : (
              <span>Supplies electrons for Photolysis (2H₂O ➔ 4H⁺ + 4e⁻ + O₂) and maintains leaf cell turgor.</span>
            )}
          </p>
        </div>

        {/* Variable 4: Ambient Temperature */}
        <div className="bg-emerald-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-100 space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>🌡️ Temperature (°C)</span>
            </label>
            <span className="font-mono text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
              {state.temperature} °C ({Math.round(state.temperature * 1.8 + 32)}°F)
            </span>
          </div>

          <input
            id="slider_temperature"
            type="range"
            min={5}
            max={50}
            step={1}
            value={state.temperature}
            onChange={(e) => {
              const val = Number(e.target.value);
              onChange((prev) => ({ ...prev, temperature: val }));
            }}
            className="w-full accent-rose-500 h-2.5 bg-emerald-100 rounded-lg cursor-pointer border border-emerald-200"
          />

          <div className="flex items-center justify-between text-[11px] text-emerald-700/80 font-mono font-medium">
            <span>5°C (Chilled)</span>
            <span className="text-emerald-700 font-bold">25-28°C (Optimal)</span>
            <span>50°C (Denaturing)</span>
          </div>

          <p className="text-xs text-emerald-800/90 leading-relaxed">
            {state.temperature > 40 ? (
              <span className="text-rose-700 font-semibold">
                🔥 Thermal denaturation! Rubisco and ATP synthase enzymes lose their 3D shape, destroying catalytic activity.
              </span>
            ) : state.temperature < 15 ? (
              <span className="text-blue-700 font-semibold">
                ❄️ Cold temperatures reduce kinetic energy; substrate molecules collide with enzyme active sites very slowly.
              </span>
            ) : (
              <span>Optimal kinetic temperature zone: enzyme active sites achieve maximum turnover rate.</span>
            )}
          </p>
        </div>
      </div>

      {/* Limiting Factor Diagnosis Banner (Liebig's Law of the Minimum) */}
      <div
        id="limiting_factor_alert"
        className={`p-4 sm:p-5 rounded-3xl transition-all shadow-md ${
          output.limitingFactor === 'None (Optimal)'
            ? 'bg-emerald-900 text-white'
            : 'bg-emerald-900 text-white'
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">
            {output.limitingFactor === 'None (Optimal)' ? '🌟' : '⚠️'}
          </span>
          <div className="space-y-1 text-xs sm:text-sm">
            <div className="font-black uppercase tracking-wider flex flex-wrap items-center gap-2">
              <span className="text-emerald-300">Liebig's Law Bottleneck:</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-800 border border-emerald-700 font-mono text-white font-bold">
                {output.limitingFactor}
              </span>
            </div>
            <p className="text-emerald-100/90 leading-relaxed font-medium">{output.limitingFactorExplanation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
