import React from 'react';
import { SimState, SimOutput, LightSpectrum } from '../types';
import {
  SPECTRUM_EFFICIENCY,
  getPigmentAbsorptions,
  wavelengthToHex
} from '../utils/photosynthesisMath';
import { playClickSound } from '../utils/audio';

interface SpectrumProps {
  state: SimState;
  output: SimOutput;
  onChange: (updater: (prev: SimState) => SimState) => void;
}

export const LightSpectrumAnalyzer: React.FC<SpectrumProps> = ({
  state,
  output,
  onChange
}) => {
  const currentWavelength =
    state.lightSpectrum === 'custom'
      ? state.wavelengthNm || 450
      : SPECTRUM_EFFICIENCY[state.lightSpectrum].defaultWavelength || 550;

  const currentPigments = getPigmentAbsorptions(currentWavelength);
  const colorHex =
    state.lightSpectrum === 'custom'
      ? wavelengthToHex(currentWavelength)
      : SPECTRUM_EFFICIENCY[state.lightSpectrum].colorHex;

  // Generate SVG absorption spectrum paths (380nm to 750nm)
  const wavelengths = Array.from({ length: 75 }, (_, i) => 380 + i * 5);
  const svgWidth = 600;
  const svgHeight = 220;
  const padding = { top: 20, right: 25, bottom: 35, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const getX = (wl: number) => padding.left + ((wl - 380) / (750 - 380)) * graphWidth;
  const getY = (val: number) => padding.top + graphHeight - (val / 100) * graphHeight;

  const chlAPath = wavelengths.map((wl, i) => {
    const { chlA } = getPigmentAbsorptions(wl);
    return `${i === 0 ? 'M' : 'L'} ${getX(wl).toFixed(1)} ${getY(chlA).toFixed(1)}`;
  }).join(' ');

  const chlBPath = wavelengths.map((wl, i) => {
    const { chlB } = getPigmentAbsorptions(wl);
    return `${i === 0 ? 'M' : 'L'} ${getX(wl).toFixed(1)} ${getY(chlB).toFixed(1)}`;
  }).join(' ');

  const carotPath = wavelengths.map((wl, i) => {
    const { carotenoids } = getPigmentAbsorptions(wl);
    return `${i === 0 ? 'M' : 'L'} ${getX(wl).toFixed(1)} ${getY(carotenoids).toFixed(1)}`;
  }).join(' ');

  const handleSelectSpectrum = (specKey: LightSpectrum) => {
    playClickSound(state.isMuted);
    const spec = SPECTRUM_EFFICIENCY[specKey];
    onChange((prev) => ({
      ...prev,
      lightSpectrum: specKey,
      wavelengthNm: spec.defaultWavelength
    }));
  };

  const handleCustomWavelength = (wl: number) => {
    onChange((prev) => ({
      ...prev,
      lightSpectrum: 'custom',
      wavelengthNm: wl
    }));
  };

  const cursorX = getX(Math.max(380, Math.min(750, currentWavelength)));

  return (
    <div id="spectrum_analyzer_module" className="bg-white rounded-3xl border border-emerald-100 p-5 sm:p-7 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-emerald-950 flex items-center gap-2">
            <span>🌈 Light Spectrum &amp; Chlorophyll Absorption Analyzer</span>
          </h2>
          <p className="text-xs text-emerald-700/80 font-medium">
            Discover why leaves absorb blue and red light while reflecting green, directly dictating sugar and oxygen synthesis.
          </p>
        </div>

        {/* Live Quantum Yield Pill */}
        <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 self-start sm:self-auto">
          <span className="text-xs text-emerald-900 font-bold">Relative Quantum Yield:</span>
          <span className="text-xs font-mono font-black text-emerald-700 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
            {output.chlorophyllAbsorption}%
          </span>
        </div>
      </div>

      {/* Discrete Spectrum Preset Badges */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
          <span>Select Wavelength Band / Color:</span>
          <span className="text-[11px] font-mono text-emerald-700">
            Current: {state.lightSpectrum === 'custom' ? `${currentWavelength} nm (Custom)` : SPECTRUM_EFFICIENCY[state.lightSpectrum].name}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {(
            [
              'white',
              'violet',
              'blue',
              'cyan',
              'green',
              'yellow',
              'red',
              'far_red',
              'dark'
            ] as LightSpectrum[]
          ).map((specKey) => {
            const spec = SPECTRUM_EFFICIENCY[specKey];
            const isSelected = state.lightSpectrum === specKey;

            return (
              <button
                key={specKey}
                id={`spectrum_tab_${specKey}`}
                onClick={() => handleSelectSpectrum(specKey)}
                className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                  isSelected
                    ? 'bg-emerald-50 border-2 border-emerald-500 shadow-md shadow-emerald-100 font-bold'
                    : 'bg-white border-emerald-100 hover:border-emerald-300'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs mb-1"
                  style={{ backgroundColor: spec.colorHex }}
                />
                <span className="text-xs capitalize text-emerald-950 font-bold line-clamp-1">
                  {specKey.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-emerald-700 font-mono">
                  {spec.defaultWavelength > 0 ? `${spec.defaultWavelength} nm` : '0 nm'}
                </span>
                <span className="text-[10px] font-bold mt-1 text-emerald-800 bg-white px-1.5 py-0.5 rounded-md border border-emerald-100">
                  {Math.round(spec.efficiency * 100)}% Eff.
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Continuous Wavelength Slider */}
      <div className="bg-emerald-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full border border-slate-400 shadow-sm"
              style={{ backgroundColor: colorHex }}
            />
            <label className="text-xs font-black text-emerald-950 uppercase tracking-wider">
              Continuous Monochromatic Wavelength Tuner:
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black text-emerald-950 bg-white px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
              λ = {currentWavelength} nm
            </span>
            <span className="text-xs text-emerald-700 font-medium">
              ({currentWavelength < 430 ? 'Violet' : currentWavelength < 490 ? 'Blue' : currentWavelength < 560 ? 'Green' : currentWavelength < 600 ? 'Yellow' : currentWavelength < 700 ? 'Red' : 'Far-Red'})
            </span>
          </div>
        </div>

        {/* Visible Light Rainbow Spectrum Bar & Slider */}
        <div className="relative py-1">
          <div
            className="w-full h-4 rounded-xl border border-emerald-300 shadow-inner mb-2"
            style={{
              background:
                'linear-gradient(to right, #4c1d95, #6d28d9, #2563eb, #06b6d4, #10b981, #84cc16, #eab308, #f97316, #ef4444, #991b1b)'
            }}
          />
          <input
            id="slider_continuous_wavelength"
            type="range"
            min={380}
            max={750}
            value={currentWavelength}
            onChange={(e) => handleCustomWavelength(Number(e.target.value))}
            className="w-full accent-emerald-600 h-2 bg-emerald-100 rounded-lg cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-emerald-700 font-medium">
          <span>380 nm (UV/Violet)</span>
          <span>450 nm (Blue Peak)</span>
          <span>530 nm (Green Trough)</span>
          <span>660 nm (Red Peak)</span>
          <span>750 nm (Far-Red)</span>
        </div>
      </div>

      {/* SVG Interactive Absorption Spectrum Graph */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-4 sm:p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs font-black uppercase tracking-wider text-emerald-950">
            Spectrophotometer Pigment Absorption Curves:
          </div>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-700">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <span>Chlorophyll a</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-lime-700">
              <span className="w-3 h-3 rounded-full bg-lime-500" />
              <span>Chlorophyll b</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-amber-700">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Carotenoids</span>
            </div>
          </div>
        </div>

        {/* SVG Canvas */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full min-w-[500px] h-auto bg-emerald-50/40 rounded-2xl border border-emerald-100"
          >
            {/* Grid Lines */}
            {[0, 25, 50, 75, 100].map((v) => (
              <g key={v}>
                <line
                  x1={padding.left}
                  y1={getY(v)}
                  x2={svgWidth - padding.right}
                  y2={getY(v)}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={getY(v) + 4}
                  textAnchor="end"
                  fontSize="10"
                  className="fill-emerald-800 font-mono font-medium"
                >
                  {v}%
                </text>
              </g>
            ))}

            {/* Wavelength Grid vertical marks */}
            {[400, 450, 500, 550, 600, 650, 700].map((wl) => (
              <g key={wl}>
                <line
                  x1={getX(wl)}
                  y1={padding.top}
                  x2={getX(wl)}
                  y2={svgHeight - padding.bottom}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={getX(wl)}
                  y={svgHeight - padding.bottom + 16}
                  textAnchor="middle"
                  fontSize="10"
                  className="fill-emerald-800 font-mono font-medium"
                >
                  {wl}nm
                </text>
              </g>
            ))}

            {/* Green Reflection Gap shading (500nm - 560nm) */}
            <rect
              x={getX(500)}
              y={padding.top}
              width={getX(560) - getX(500)}
              height={graphHeight}
              fill="#10b981"
              fillOpacity="0.08"
            />
            <text
              x={getX(530)}
              y={padding.top + 18}
              textAnchor="middle"
              fontSize="9"
              className="fill-emerald-700 font-bold"
            >
              "Green Window" (Reflected)
            </text>

            {/* Pigment Absorption Paths */}
            {/* Carotenoids */}
            <path
              d={carotPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Chlorophyll b */}
            <path
              d={chlBPath}
              fill="none"
              stroke="#84cc16"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Chlorophyll a */}
            <path
              d={chlAPath}
              fill="none"
              stroke="#059669"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Current Wavelength Scanner Cursor Line */}
            {state.lightSpectrum !== 'dark' && (
              <g>
                <line
                  x1={cursorX}
                  y1={padding.top}
                  x2={cursorX}
                  y2={svgHeight - padding.bottom}
                  stroke={colorHex}
                  strokeWidth="3"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={cursorX}
                  cy={getY(currentPigments.chlA)}
                  r="5"
                  fill="#059669"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <circle
                  cx={cursorX}
                  cy={getY(currentPigments.chlB)}
                  r="5"
                  fill="#84cc16"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        </div>

        {/* Real-time Spectrum Readout Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200">
            <div className="font-bold text-emerald-950 flex items-center justify-between">
              <span>Chlorophyll a Absorption:</span>
              <span className="font-mono text-emerald-700 font-black">{output.chlAAbsorption}%</span>
            </div>
            <p className="text-[11px] text-emerald-800/80 mt-1">
              Primary reaction center pigment (P680 &amp; P700). High in Blue (430nm) &amp; Red (662nm).
            </p>
          </div>

          <div className="p-3.5 bg-lime-50/80 rounded-2xl border border-lime-200">
            <div className="font-bold text-lime-950 flex items-center justify-between">
              <span>Chlorophyll b Absorption:</span>
              <span className="font-mono text-lime-700 font-black">{output.chlBAbsorption}%</span>
            </div>
            <p className="text-[11px] text-lime-800/80 mt-1">
              Accessory light-harvesting antenna. Expands absorption spectrum to 455nm and 642nm.
            </p>
          </div>

          <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200">
            <div className="font-bold text-amber-950 flex items-center justify-between">
              <span>Carotenoids Absorption:</span>
              <span className="font-mono text-amber-700 font-black">{output.carotenoidAbsorption}%</span>
            </div>
            <p className="text-[11px] text-amber-800/80 mt-1">
              Photoprotective pigments absorbing blue-green light (400-500nm) and dissipating excess energy.
            </p>
          </div>

          <div className="p-3.5 bg-sky-50/80 rounded-2xl border border-sky-200">
            <div className="font-bold text-sky-950 flex items-center justify-between">
              <span>Resulting Output Flux:</span>
              <span className="font-mono text-sky-700 font-black">{output.oxygenRate} mL O₂/h</span>
            </div>
            <p className="text-[11px] text-sky-800/80 mt-1">
              Synthesizing <strong>{output.glucoseRate} mg/h Glucose</strong> under current photon wavelength.
            </p>
          </div>
        </div>
      </div>

      {/* Scientific Explanation Note */}
      <div className="p-5 bg-emerald-900 rounded-3xl text-white shadow-xl text-xs space-y-2">
        <h4 className="font-black text-amber-300 text-sm uppercase tracking-wider flex items-center gap-2">
          <span>🔬 Key Takeaway: The Biological Action Spectrum</span>
        </h4>
        <p className="text-emerald-100/90 leading-relaxed font-medium">
          Photosynthesis does not treat all colors of light equally. <strong>Blue light (~430–450 nm)</strong> and <strong>Red light (~650–680 nm)</strong> excite chlorophyll electrons with optimal resonance, driving high rates of water photolysis and glucose synthesis. In contrast, <strong>Green light (~520–550 nm)</strong> cannot be efficiently absorbed by chlorophyll and is transmitted or reflected back to our eyes — which is why healthy plant leaves appear vibrant green!
        </p>
      </div>
    </div>
  );
};
