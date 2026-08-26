import React from 'react';
import { SimState, SimOutput } from '../types';
import { SPECTRUM_EFFICIENCY } from '../utils/photosynthesisMath';

interface RateDashboardProps {
  state: SimState;
  output: SimOutput;
}

export const RateDashboard: React.FC<RateDashboardProps> = ({ state, output }) => {
  const spec = SPECTRUM_EFFICIENCY[state.lightSpectrum];

  return (
    <div id="rate_dashboard_panel" className="bg-white rounded-3xl border border-emerald-100 p-5 sm:p-6 shadow-sm space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-300" />
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-950">
            Real-Time Biological Telemetry
          </h2>
        </div>
        <div className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
          Chamber: {state.temperature}°C • {state.co2Level} ppm CO₂
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Overall Photosynthetic Rate */}
        <div className="bg-emerald-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-100 flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-xs text-emerald-900 font-bold mb-1">
            <span>Photosynthesis Rate</span>
            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-mono font-bold text-xs border border-emerald-200">
              {output.rate}%
            </span>
          </div>

          <div className="w-full bg-white h-3 rounded-full overflow-hidden my-3 border border-emerald-200">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                output.rate > 75
                  ? 'bg-emerald-500'
                  : output.rate > 35
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${output.rate}%` }}
            />
          </div>

          <div className="text-xs text-emerald-700/90 flex items-center justify-between font-medium">
            <span>Status:</span>
            <span
              className={`font-bold ${
                output.rate > 75
                  ? 'text-emerald-700'
                  : output.rate > 35
                  ? 'text-amber-700'
                  : 'text-rose-600'
              }`}
            >
              {output.rate > 80 ? 'Peak Efficiency' : output.rate > 40 ? 'Moderate' : 'Throttled'}
            </span>
          </div>
        </div>

        {/* Metric 2: Oxygen Production Rate */}
        <div className="bg-sky-50/50 p-4 sm:p-5 rounded-2xl border border-sky-100 flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-xs text-sky-900 font-bold mb-1">
            <span>O₂ Gas Generation</span>
            <span className="bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full font-mono font-bold text-xs border border-sky-200">
              {output.oxygenRate} mL/h
            </span>
          </div>

          <div className="flex items-center gap-2.5 my-2">
            <div className="text-2xl sm:text-3xl font-black font-mono text-sky-600">
              {output.oxygenRate}
            </div>
            <div className="text-[11px] text-sky-800 font-medium leading-tight">
              milliliters of O₂
              <br />
              released / hr
            </div>
          </div>

          <div className="text-xs text-sky-700/80 font-medium">
            Derived from H₂O photolysis
          </div>
        </div>

        {/* Metric 3: Glucose Sugar Synthesis */}
        <div className="bg-amber-50/50 p-4 sm:p-5 rounded-2xl border border-amber-100 flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-xs text-amber-950 font-bold mb-1">
            <span>Glucose (C₆H₁₂O₆)</span>
            <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-mono font-bold text-xs border border-amber-200">
              {output.glucoseRate} mg/h
            </span>
          </div>

          <div className="flex items-center gap-2.5 my-2">
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-600">
              {output.glucoseRate}
            </div>
            <div className="text-[11px] text-amber-900 font-medium leading-tight">
              milligrams of Sugar
              <br />
              produced / hr
            </div>
          </div>

          <div className="text-xs text-amber-700/80 font-medium">
            Synthesized by Calvin Cycle
          </div>
        </div>

        {/* Metric 4: Stomata Conductance & Water Status */}
        <div className="bg-blue-50/50 p-4 sm:p-5 rounded-2xl border border-blue-100 flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-xs text-blue-950 font-bold mb-1">
            <span>Stomata Opening</span>
            <span
              className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-mono font-bold text-xs border border-blue-200"
            >
              {output.stomataOpen}%
            </span>
          </div>

          <div className="w-full bg-white h-3 rounded-full overflow-hidden my-3 border border-blue-200">
            <div
              className="h-full bg-blue-500 transition-all duration-300 rounded-full"
              style={{ width: `${output.stomataOpen}%` }}
            />
          </div>

          <div className="text-xs text-blue-800/90 flex items-center justify-between font-medium">
            <span>Spectrum Efficiency:</span>
            <span className="font-mono text-amber-600 font-bold">
              {Math.round(spec.efficiency * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
