import React, { useState } from 'react';
import { SimState, SimOutput } from '../types';
import { playClickSound } from '../utils/audio';

interface EquationProps {
  state: SimState;
  output: SimOutput;
}

interface MoleculeDetail {
  title: string;
  chemicalFormula: string;
  type: 'Reactant (Input)' | 'Catalyst / Energy' | 'Product (Output)';
  sourceOrDestination: string;
  studentExplanation: string;
  stoichiometry: string;
}

const MOLECULE_DETAILS: Record<string, MoleculeDetail> = {
  co2: {
    title: 'Carbon Dioxide',
    chemicalFormula: '6 CO₂',
    type: 'Reactant (Input)',
    sourceOrDestination: 'Enters from air through Stomata pores on the leaf',
    studentExplanation: 'Provides the essential Carbon (C) and Oxygen (O) building blocks to synthesize glucose sugar during the Calvin Cycle in the stroma.',
    stoichiometry: '6 molecules of CO₂ are required to build 1 molecule of glucose (6 Carbons).'
  },
  water: {
    title: 'Water',
    chemicalFormula: '6 H₂O',
    type: 'Reactant (Input)',
    sourceOrDestination: 'Absorbed by root hairs from soil, transported up xylem',
    studentExplanation: 'Water is split apart (photolysis) inside the thylakoid. Its Hydrogen ions and electrons feed the solar batteries (ATP/NADPH), while its oxygen atoms are discarded as O₂.',
    stoichiometry: '6 water molecules supply 12 Hydrogens to build glucose and release 6 Oxygen molecules (O₂).'
  },
  light: {
    title: 'Light Radiant Energy',
    chemicalFormula: 'Photons (hv)',
    type: 'Catalyst / Energy',
    sourceOrDestination: 'Sunlight or artificial grow lamp (absorbed by Chlorophyll)',
    studentExplanation: 'Photons hit chlorophyll pigments, exciting electrons to high energy states that power the entire photosynthetic apparatus.',
    stoichiometry: 'Blue and Red light are absorbed with >90% efficiency; Green light is mostly reflected.'
  },
  glucose: {
    title: 'Glucose Sugar',
    chemicalFormula: 'C₆H₁₂O₆',
    type: 'Product (Output)',
    sourceOrDestination: 'Synthesized in chloroplast stroma, transported through phloem',
    studentExplanation: 'The primary chemical energy storage molecule! Plants use glucose for cellular respiration (ATP for growth), or convert it into starch for storage and cellulose for cell walls.',
    stoichiometry: '1 glucose molecule stores approximately 2,870 kilojoules of usable chemical energy.'
  },
  oxygen: {
    title: 'Oxygen Gas',
    chemicalFormula: '6 O₂',
    type: 'Product (Output)',
    sourceOrDestination: 'Diffuses out of stomata into Earth’s atmosphere',
    studentExplanation: 'A byproduct of water photolysis! Plants release oxygen through their stomata, supporting aerobic life (including humans and animals) across our planet.',
    stoichiometry: '6 molecules of oxygen gas are produced for every 1 glucose created.'
  }
};

export const InteractiveEquation: React.FC<EquationProps> = ({ state, output }) => {
  const [selectedMolecule, setSelectedMolecule] = useState<string>('co2');

  const handleSelect = (key: string) => {
    setSelectedMolecule(key);
    playClickSound(state.isMuted);
  };

  const activeDetail = MOLECULE_DETAILS[selectedMolecule];

  return (
    <div id="interactive_equation_panel" className="bg-white rounded-3xl border border-emerald-100 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-emerald-100 pb-3">
        <h2 className="text-xs sm:text-sm font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          Interactive Chemical Equation &amp; Stoichiometry
        </h2>
        <span className="text-xs text-emerald-700/80 font-medium">
          Click any molecule to inspect
        </span>
      </div>

      {/* Main Chemical Equation Bar */}
      <div className="bg-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-100 flex flex-wrap items-center justify-center gap-2 md:gap-3.5 text-sm md:text-base font-mono font-bold select-none overflow-x-auto">
        {/* Reactant 1: 6 CO2 */}
        <button
          id="btn_eq_co2"
          onClick={() => handleSelect('co2')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex flex-col items-center border-2 ${
            selectedMolecule === 'co2'
              ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-200 scale-105'
              : 'bg-white border-purple-200 text-purple-950 hover:border-purple-400'
          }`}
        >
          <span className="text-base md:text-lg font-black">6 CO₂</span>
          <span className={`text-[10px] font-sans font-semibold ${selectedMolecule === 'co2' ? 'text-purple-100' : 'text-purple-700'}`}>
            Carbon Dioxide
          </span>
        </button>

        <span className="text-emerald-800 font-sans text-2xl font-bold">+</span>

        {/* Reactant 2: 6 H2O */}
        <button
          id="btn_eq_water"
          onClick={() => handleSelect('water')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex flex-col items-center border-2 ${
            selectedMolecule === 'water'
              ? 'bg-sky-500 border-sky-500 text-white shadow-md shadow-sky-200 scale-105'
              : 'bg-white border-sky-200 text-sky-950 hover:border-sky-400'
          }`}
        >
          <span className="text-base md:text-lg font-black">6 H₂O</span>
          <span className={`text-[10px] font-sans font-semibold ${selectedMolecule === 'water' ? 'text-sky-100' : 'text-sky-700'}`}>
            Water
          </span>
        </button>

        <span className="text-emerald-800 font-sans text-2xl font-bold">+</span>

        {/* Energy: Light Energy */}
        <button
          id="btn_eq_light"
          onClick={() => handleSelect('light')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex flex-col items-center border-2 ${
            selectedMolecule === 'light'
              ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-200 scale-105'
              : 'bg-white border-amber-200 text-amber-950 hover:border-amber-400'
          }`}
        >
          <span className="text-base md:text-lg font-black">Light Energy</span>
          <span className={`text-[10px] font-sans font-semibold ${selectedMolecule === 'light' ? 'text-amber-100' : 'text-amber-700'}`}>
            Photons
          </span>
        </button>

        {/* Arrow with Chlorophyll */}
        <div className="flex flex-col items-center px-1 text-emerald-700 font-black">
          <span className="text-[10px] font-sans tracking-wider uppercase">Chlorophyll</span>
          <span className="text-2xl">➔</span>
        </div>

        {/* Product 1: Glucose */}
        <button
          id="btn_eq_glucose"
          onClick={() => handleSelect('glucose')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex flex-col items-center border-2 ${
            selectedMolecule === 'glucose'
              ? 'bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-200 scale-105'
              : 'bg-white border-amber-200 text-amber-950 hover:border-amber-400'
          }`}
        >
          <span className="text-base md:text-lg font-black">C₆H₁₂O₆</span>
          <span className={`text-[10px] font-sans font-semibold ${selectedMolecule === 'glucose' ? 'text-amber-100' : 'text-amber-700'}`}>
            Glucose Sugar
          </span>
        </button>

        <span className="text-emerald-800 font-sans text-2xl font-bold">+</span>

        {/* Product 2: 6 O2 */}
        <button
          id="btn_eq_oxygen"
          onClick={() => handleSelect('oxygen')}
          className={`px-4 py-2.5 rounded-2xl transition-all flex flex-col items-center border-2 ${
            selectedMolecule === 'oxygen'
              ? 'bg-cyan-600 border-cyan-600 text-white shadow-md shadow-cyan-200 scale-105'
              : 'bg-white border-cyan-200 text-cyan-950 hover:border-cyan-400'
          }`}
        >
          <span className="text-base md:text-lg font-black">6 O₂</span>
          <span className={`text-[10px] font-sans font-semibold ${selectedMolecule === 'oxygen' ? 'text-cyan-100' : 'text-cyan-700'}`}>
            Oxygen Gas
          </span>
        </button>
      </div>

      {/* Selected Molecule Deep Dive Card */}
      {activeDetail && (
        <div className="p-4 sm:p-5 bg-emerald-900 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-black text-white text-base">{activeDetail.title}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-800 text-emerald-200 border border-emerald-700">
                {activeDetail.type}
              </span>
              <span className="font-mono text-emerald-300 font-black text-sm">{activeDetail.chemicalFormula}</span>
            </div>
            <p className="text-emerald-100/90 leading-relaxed font-medium">{activeDetail.studentExplanation}</p>
            <p className="text-emerald-300/80 text-xs">
              <strong className="text-white">Origin / Destination:</strong> {activeDetail.sourceOrDestination}
            </p>
          </div>

          <div className="w-full md:w-auto bg-emerald-950/80 p-3.5 rounded-2xl border border-emerald-800 text-white font-mono text-xs shrink-0">
            <div className="text-emerald-400 text-[10px] font-sans font-bold uppercase tracking-wider">Current Live Output:</div>
            {selectedMolecule === 'oxygen' ? (
              <div className="text-cyan-300 font-black text-base mt-0.5">
                {output.oxygenRate} mL O₂ / hr
              </div>
            ) : selectedMolecule === 'glucose' ? (
              <div className="text-amber-300 font-black text-base mt-0.5">
                {output.glucoseRate} mg Sugar / hr
              </div>
            ) : (
              <div className="text-emerald-300 font-black text-base mt-0.5">
                {output.rate}% Reaction Rate
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
