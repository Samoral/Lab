import React, { useState } from 'react';
import { SimState, SimOutput } from '../types';
import { playClickSound } from '../utils/audio';

interface DiagramProps {
  state: SimState;
  output: SimOutput;
}

type StageKey = 'light_dependent' | 'calvin_cycle' | 'atp_transport' | 'gas_exchange';

export const InteractiveDiagram: React.FC<DiagramProps> = ({ state, output }) => {
  const [activeStage, setActiveStage] = useState<StageKey>('light_dependent');

  const handleSelect = (stage: StageKey) => {
    setActiveStage(stage);
    playClickSound(state.isMuted);
  };

  return (
    <div id="interactive_diagram_view" className="bg-white rounded-3xl border border-emerald-100 p-5 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-emerald-950 flex items-center gap-2">
            <span>🗺️ The Two-Stage Chloroplast Factory Diagram</span>
          </h2>
          <p className="text-xs text-emerald-700/80 font-medium">
            Interactive visual flow showing how Light Reactions and the Calvin Cycle work together in harmony
          </p>
        </div>

        {/* Stage Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-emerald-50 p-1.5 rounded-2xl border border-emerald-200/80">
          <button
            id="tab_diag_light"
            onClick={() => handleSelect('light_dependent')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeStage === 'light_dependent'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/70'
            }`}
          >
            ☀️ 1. Light Reactions
          </button>
          <button
            id="tab_diag_calvin"
            onClick={() => handleSelect('calvin_cycle')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeStage === 'calvin_cycle'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/70'
            }`}
          >
            🔄 2. Calvin Cycle
          </button>
          <button
            id="tab_diag_atp"
            onClick={() => handleSelect('atp_transport')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeStage === 'atp_transport'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/70'
            }`}
          >
            ⚡ ATP &amp; NADPH Batteries
          </button>
        </div>
      </div>

      {/* Main Visual Schema Graphic */}
      <div className="relative bg-emerald-50/40 rounded-3xl border border-emerald-100 p-6 overflow-hidden">
        {/* Outer Chloroplast Boundary Simulation */}
        <div className="absolute top-3 left-5 text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-black">
          Inside Chloroplast Organelle
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center pt-3">
          {/* Stage 1: Thylakoid Light-Dependent Reactions */}
          <div
            onClick={() => handleSelect('light_dependent')}
            className={`p-5 sm:p-6 rounded-3xl border-2 transition-all cursor-pointer relative ${
              activeStage === 'light_dependent'
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200 shadow-md'
                : 'bg-white border-emerald-100 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                THYLAKOID MEMBRANE
              </span>
              <span className="text-xs text-amber-600 font-black">Stage 1</span>
            </div>

            <h3 className="text-base font-black text-emerald-950 mb-1.5">Light-Dependent Reactions</h3>
            <p className="text-xs text-emerald-800/90 mb-4 leading-relaxed font-medium">
              Photons hit Chlorophyll pigments embedded in the thylakoid disk, exciting electrons and splitting water.
            </p>

            {/* Inputs & Outputs Pill Flow */}
            <div className="space-y-2 text-xs font-mono font-medium">
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-sky-700 font-sans font-bold">💧 Input: Water (H₂O)</span>
                <span className="text-amber-700 font-sans font-bold">☀️ Sunlight (photons)</span>
              </div>
              <div className="text-center text-amber-600 font-bold text-xs">↓ Photolysis &amp; Electron Transport ↓</div>
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-cyan-700 font-sans font-bold">💨 Released: Oxygen (O₂)</span>
                <span className="text-emerald-700 font-sans font-bold">⚡ Yields: ATP + NADPH</span>
              </div>
            </div>

            {/* Live Indicator */}
            <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs font-medium">
              <span className="text-emerald-800 font-sans">Light Reaction Activity:</span>
              <span className="font-mono text-amber-600 font-bold">{state.lightIntensity}%</span>
            </div>
          </div>

          {/* Center Energy Carrier Arrows (ATP/NADPH bridge) */}
          <div
            onClick={() => handleSelect('calvin_cycle')}
            className={`p-5 sm:p-6 rounded-3xl border-2 transition-all cursor-pointer relative ${
              activeStage === 'calvin_cycle'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200 shadow-md'
                : 'bg-white border-emerald-100 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                STROMA FLUID
              </span>
              <span className="text-xs text-emerald-600 font-black">Stage 2</span>
            </div>

            <h3 className="text-base font-black text-emerald-950 mb-1.5">Calvin Cycle (Light-Independent)</h3>
            <p className="text-xs text-emerald-800/90 mb-4 leading-relaxed font-medium">
              Enzymes (like Rubisco) use the chemical batteries (ATP and NADPH) to capture CO₂ and assemble glucose sugar.
            </p>

            {/* Inputs & Outputs */}
            <div className="space-y-2 text-xs font-mono font-medium">
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-purple-800 font-sans font-bold">💨 Input: Carbon Dioxide (CO₂)</span>
                <span className="text-amber-700 font-sans font-bold">⚡ Uses: ATP + NADPH</span>
              </div>
              <div className="text-center text-emerald-600 font-bold text-xs">↓ Carbon Fixation (Rubisco) ↓</div>
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-amber-800 font-sans font-black">🍬 Created: Glucose (C₆H₁₂O₆)</span>
                <span className="text-emerald-700 font-sans font-bold">🔄 Recycles: ADP + NADP⁺</span>
              </div>
            </div>

            {/* Live Indicator */}
            <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs font-medium">
              <span className="text-emerald-800 font-sans">Calvin Cycle Yield:</span>
              <span className="font-mono text-emerald-700 font-bold">{output.glucoseRate} mg/h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explanatory Deep-Dive Box based on Active Stage */}
      <div className="p-5 sm:p-6 bg-emerald-900 rounded-3xl text-white shadow-xl text-xs leading-relaxed space-y-2">
        {activeStage === 'light_dependent' && (
          <div>
            <h4 className="font-black text-amber-300 text-sm mb-1 uppercase tracking-wider">
              ☀️ In-Depth: The Light-Dependent Reactions
            </h4>
            <p className="text-emerald-100/90 font-medium">
              Occurs in the <strong>thylakoid membrane</strong>. Chlorophyll molecules absorb incoming light photons. This energy excites electrons within Photosystem II and I, pulling electrons from water molecules (<code className="text-sky-300 font-mono font-bold">H₂O → 2H⁺ + ½O₂ + 2e⁻</code>). The resulting proton gradient drives <strong>ATP Synthase</strong> to create ATP, while electrons convert <code className="text-amber-300 font-mono font-bold">NADP⁺</code> into high-energy <code className="text-amber-300 font-mono font-bold">NADPH</code>. Oxygen is released as a vital byproduct.
            </p>
          </div>
        )}

        {activeStage === 'calvin_cycle' && (
          <div>
            <h4 className="font-black text-emerald-300 text-sm mb-1 uppercase tracking-wider">
              🔄 In-Depth: The Calvin Cycle (Light-Independent)
            </h4>
            <p className="text-emerald-100/90 font-medium">
              Occurs in the fluid <strong>stroma</strong> of the chloroplast. The cycle doesn’t directly require light, but depends on the ATP and NADPH created by the light reactions. The primary enzyme, <strong>Rubisco</strong>, fixes inorganic <code className="text-purple-300 font-mono font-bold">CO₂</code> onto a 5-carbon sugar (RuBP). Through reduction and regeneration phases, this produces <strong>G3P</strong>, which pairs up to form <strong>Glucose (<code className="text-amber-300 font-mono font-bold">C₆H₁₂O₆</code>)</strong>.
            </p>
          </div>
        )}

        {activeStage === 'atp_transport' && (
          <div>
            <h4 className="font-black text-purple-300 text-sm mb-1 uppercase tracking-wider">
              ⚡ In-Depth: The ATP &amp; NADPH Chemical Shuttle
            </h4>
            <p className="text-emerald-100/90 font-medium">
              Think of ATP and NADPH as rechargeable biological batteries. The light reactions in the thylakoid "charge" ADP and NADP⁺ using solar photons. These loaded batteries travel into the stroma to power the chemical assembly of glucose. Once discharged (returning to ADP and NADP⁺), they diffuse right back to the thylakoid to be recharged!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
