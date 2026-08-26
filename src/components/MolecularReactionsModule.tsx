import React, { useState, useEffect } from 'react';
import { SimState, SimOutput } from '../types';
import { playClickSound, playBubbleSound } from '../utils/audio';

interface MolecularProps {
  state: SimState;
  output: SimOutput;
}

export const MolecularReactionsModule: React.FC<MolecularProps> = ({
  state,
  output
}) => {
  const [activeStage, setActiveStage] = useState<'both' | 'light_dependent' | 'calvin_cycle'>('both');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [selectedMolecule, setSelectedMolecule] = useState<string | null>(null);

  const totalSteps = 8;

  const stepsData = [
    {
      step: 1,
      stage: 'Light-Dependent (Thylakoid Membrane)',
      stageType: 'light' as const,
      title: 'Photon Absorption & Chlorophyll Excitation',
      summary: 'Photons strike chlorophyll antenna pigments inside Photosystem II (PSII), exciting ground-state electrons to a high-energy level.',
      equation: 'Chlorophyll + hν (Photon) ➔ Chlorophyll* (Excited e⁻)',
      location: 'Thylakoid Membrane • Antenna Complex & P680',
      keyMolecule: 'Chlorophyll a / P680',
      details: 'Chlorophyll molecules contain a porphyrin ring with a central Magnesium (Mg²⁺) ion. When light of suitable wavelength (especially blue 430-450nm or red 650-680nm) is absorbed, an electron is kicked into an excited orbital state.'
    },
    {
      step: 2,
      stage: 'Light-Dependent (Thylakoid Membrane)',
      stageType: 'light' as const,
      title: 'Water Photolysis & Oxygen Gas Release',
      summary: 'To replace the lost electrons in PSII, water molecules are split by the Oxygen-Evolving Complex (Mn₄CaO₅ cluster), releasing O₂ gas into the air.',
      equation: '2H₂O ➔ 4H⁺ (protons) + 4e⁻ + O₂ ↑ (Oxygen gas)',
      location: 'Thylakoid Lumen • Oxygen-Evolving Complex (OEC)',
      keyMolecule: 'Water (H₂O) & Oxygen (O₂)',
      details: 'This crucial reaction is the source of virtually all breathable oxygen on Earth! The 4 electrons replenish PSII reaction centers, while 4 protons accumulate in the thylakoid lumen.'
    },
    {
      step: 3,
      stage: 'Light-Dependent (Thylakoid Membrane)',
      stageType: 'light' as const,
      title: 'Electron Transport Chain & Proton Pumping',
      summary: 'Excited electrons cascade down an electron transport chain (PSII ➔ Plastoquinone ➔ Cytochrome b₆f ➔ Plastocyanin ➔ PSI), actively pumping H⁺ ions across the membrane.',
      equation: 'H⁺ (Stroma) ➔ H⁺ (Lumen Proton Gradient ΔpH)',
      location: 'Cytochrome b₆f Complex & Thylakoid Membrane',
      keyMolecule: 'Cytochrome b₆f & Plastoquinone (PQ)',
      details: 'As electrons pass through the Cytochrome b₆f complex, energy is released and used to pump protons from the stroma into the thylakoid lumen, building a high electrochemical proton gradient (proton-motive force).'
    },
    {
      step: 4,
      stage: 'Light-Dependent (Thylakoid Membrane)',
      stageType: 'light' as const,
      title: 'Chemiosmotic ATP Synthesis (The ATP Turbine)',
      summary: 'Protons accumulated in the lumen rush through the spinning rotor of ATP Synthase into the stroma, generating ATP from ADP and inorganic phosphate.',
      equation: 'ADP + Pᵢ + H⁺ flux ➔ ATP (Chemical Energy Currency)',
      location: 'ATP Synthase Complex (CF₀-CF₁)',
      keyMolecule: 'ATP Synthase & ATP',
      details: 'ATP Synthase functions like a miniature biological rotary turbine. The passage of protons turns the catalytic head, joining ADP and phosphate to form high-energy Adenosine Triphosphate (ATP).'
    },
    {
      step: 5,
      stage: 'Light-Dependent (Thylakoid Membrane)',
      stageType: 'light' as const,
      title: 'Photosystem I & NADPH Synthesis',
      summary: 'Electrons re-energized by photons at PSI (P700) are transferred via Ferredoxin to FNR enzyme, reducing NADP⁺ into high-energy NADPH.',
      equation: 'NADP⁺ + 2e⁻ + H⁺ ➔ NADPH (Electron Carrier)',
      location: 'Photosystem I & Ferredoxin-NADP⁺ Reductase (FNR)',
      keyMolecule: 'NADPH & NADP⁺',
      details: 'NADPH holds high-energy reducing electrons. Together, ATP (energy currency) and NADPH (reducing power) complete Stage 1 and are exported to the stroma to fuel the Calvin cycle.'
    },
    {
      step: 6,
      stage: 'Light-Independent / Calvin Cycle (Stroma)',
      stageType: 'dark' as const,
      title: 'Calvin Cycle Phase 1: Carbon Fixation by Rubisco',
      summary: 'In the stroma, the enzyme Rubisco captures CO₂ gas and joins it to 5-carbon RuBP, immediately forming two 3-carbon molecules (3-PGA).',
      equation: 'CO₂ + 5-Carbon RuBP + Rubisco ➔ 2 × 3-PGA (3-Phosphoglycerate)',
      location: 'Chloroplast Stroma • Rubisco Active Sites',
      keyMolecule: 'Rubisco Enzyme & RuBP',
      details: 'Rubisco (Ribulose-1,5-bisphosphate carboxylase-oxygenase) is the most abundant enzyme on planet Earth. It catalyzes the primary chemical bridge between inorganic carbon gas and organic biological life.'
    },
    {
      step: 7,
      stage: 'Light-Independent / Calvin Cycle (Stroma)',
      stageType: 'dark' as const,
      title: 'Calvin Cycle Phase 2: Reduction & Energy Consumption',
      summary: 'ATP and NADPH produced by the light reactions donate their stored energy and electrons to convert 3-PGA into high-energy G3P (triose phosphate).',
      equation: '3-PGA + ATP + NADPH ➔ G3P + ADP + NADP⁺ + Pᵢ',
      location: 'Chloroplast Stroma Fluid',
      keyMolecule: 'G3P (Glyceraldehyde-3-phosphate)',
      details: 'ATP transfers phosphate groups while NADPH donates electrons (reduction). The biological batteries are discharged back into ADP and NADP⁺, which return to the thylakoid to be recharged by light.'
    },
    {
      step: 8,
      stage: 'Light-Independent / Calvin Cycle (Stroma)',
      stageType: 'dark' as const,
      title: 'Calvin Cycle Phase 3: Glucose Assembly & RuBP Regeneration',
      summary: 'For every 6 turns of the cycle, two G3P sugar molecules exit to synthesize Glucose (C₆H₁₂O₆), while the remaining G3P molecules regenerate RuBP using ATP.',
      equation: '2 × G3P (3C each) ➔ C₆H₁₂O₆ (Glucose 6C Sugar)',
      location: 'Chloroplast Stroma & Cytoplasm',
      keyMolecule: 'Glucose (C₆H₁₂O₆)',
      details: 'Glucose provides long-term energy storage, fuels cellular respiration in plant mitochondria, and polymerizes into starch (storage) and cellulose (cell walls) to build the plant body!'
    }
  ];

  // Auto-play stepper loop
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev >= totalSteps ? 1 : prev + 1));
      playBubbleSound(state.isMuted);
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlaying, totalSteps, state.isMuted]);

  const stepInfo = stepsData[currentStep - 1];

  const handleStep = (stepNum: number) => {
    playClickSound(state.isMuted);
    setCurrentStep(stepNum);
  };

  const handleNext = () => {
    playClickSound(state.isMuted);
    setCurrentStep((prev) => (prev >= totalSteps ? 1 : prev + 1));
  };

  const handlePrev = () => {
    playClickSound(state.isMuted);
    setCurrentStep((prev) => (prev <= 1 ? totalSteps : prev - 1));
  };

  return (
    <div id="molecular_reactions_module" className="bg-white rounded-3xl border border-emerald-100 p-5 sm:p-7 shadow-sm space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-emerald-950 flex items-center gap-2">
            <span>🔬 Molecular Photosynthesis Engine: Chlorophyll, ATP/NADPH &amp; Calvin Cycle</span>
          </h2>
          <p className="text-xs text-emerald-700/80 font-medium">
            Explore how chlorophyll traps photons, charges molecular energy batteries (ATP &amp; NADPH), and fixes CO₂ into glucose.
          </p>
        </div>

        {/* Play / Step Mode Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="autoplay_reactions_btn"
            onClick={() => {
              playClickSound(state.isMuted);
              setIsAutoPlaying(!isAutoPlaying);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
              isAutoPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            <span>{isAutoPlaying ? '⏸️ Pause Auto Walkthrough' : '▶️ Auto-Play Reactions'}</span>
          </button>
        </div>
      </div>

      {/* Stage Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setActiveStage('both');
            playClickSound(state.isMuted);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeStage === 'both'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
          }`}
        >
          🔄 Full 2-Stage Process (Steps 1–8)
        </button>

        <button
          onClick={() => {
            setActiveStage('light_dependent');
            setCurrentStep(1);
            playClickSound(state.isMuted);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeStage === 'light_dependent'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-amber-50 text-amber-950 hover:bg-amber-100'
          }`}
        >
          <span>☀️ Stage 1: Light-Dependent (Thylakoids)</span>
        </button>

        <button
          onClick={() => {
            setActiveStage('calvin_cycle');
            setCurrentStep(6);
            playClickSound(state.isMuted);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeStage === 'calvin_cycle'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-purple-50 text-purple-950 hover:bg-purple-100'
          }`}
        >
          <span>🌱 Stage 2: Calvin Cycle / Stroma (Sugar Synthesis)</span>
        </button>
      </div>

      {/* Interactive Step Timeline Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
          <span>Reaction Progression Steps:</span>
          <span className="font-mono text-emerald-700">Step {currentStep} of {totalSteps}</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {stepsData.map((s) => {
            const isCurrent = currentStep === s.step;
            const isLight = s.stageType === 'light';

            return (
              <button
                key={s.step}
                id={`reaction_step_${s.step}`}
                onClick={() => handleStep(s.step)}
                className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  isCurrent
                    ? isLight
                      ? 'bg-amber-50 border-2 border-amber-500 shadow-md shadow-amber-100'
                      : 'bg-purple-50 border-2 border-purple-500 shadow-md shadow-purple-100'
                    : 'bg-white border-emerald-100 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1">
                  <span className={isLight ? 'text-amber-800' : 'text-purple-800'}>#{s.step}</span>
                  <span>{isLight ? '☀️' : '🍃'}</span>
                </div>
                <div className="text-[11px] font-bold text-emerald-950 line-clamp-2 leading-tight">
                  {s.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage & Step Showcase Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Step Details & Chemical Transformation (7 cols) */}
        <div
          className={`lg:col-span-7 p-6 rounded-3xl border transition-all ${
            stepInfo.stageType === 'light'
              ? 'bg-amber-50/40 border-amber-200'
              : 'bg-purple-50/40 border-purple-200'
          } space-y-4`}
        >
          {/* Step Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                stepInfo.stageType === 'light'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-purple-100 text-purple-900 border border-purple-300'
              }`}
            >
              {stepInfo.stage}
            </span>

            <span className="text-xs font-mono font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
              📍 {stepInfo.location}
            </span>
          </div>

          {/* Step Title & Summary */}
          <div>
            <h3 className="text-lg font-black text-emerald-950 flex items-center gap-2">
              <span>{stepInfo.title}</span>
            </h3>
            <p className="text-xs sm:text-sm text-emerald-900 font-medium leading-relaxed mt-1">
              {stepInfo.summary}
            </p>
          </div>

          {/* Chemical Reaction Equation Banner */}
          <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 shadow-2xs space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Chemical Transformation Equation:
            </div>
            <div className="text-xs sm:text-sm font-mono font-black text-emerald-900">
              {stepInfo.equation}
            </div>
          </div>

          {/* Deep Biological Mechanism Explanation */}
          <div className="p-4 bg-white/90 rounded-2xl border border-emerald-100 text-xs text-emerald-900 leading-relaxed space-y-2">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <span>🧬 Biological Mechanism &amp; Role:</span>
            </div>
            <p>{stepInfo.details}</p>
          </div>

          {/* Step Navigation Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60">
            <button
              onClick={handlePrev}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 shadow-2xs"
            >
              ⬅️ Previous Step
            </button>

            <div className="text-xs font-bold text-emerald-800">
              Step {currentStep} of {totalSteps}
            </div>

            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
            >
              Next Step ➡️
            </button>
          </div>
        </div>

        {/* Right: Live Molecular Energy & Stoichiometric Inventory (5 cols) */}
        <div className="lg:col-span-5 bg-emerald-50/60 p-5 sm:p-6 rounded-3xl border border-emerald-200 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-2.5">
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-950 flex items-center gap-2">
              <span>⚡ Molecular Energy &amp; Battery State</span>
            </h4>
            <span className="text-[11px] font-mono text-emerald-700 font-bold">
              {output.rate}% Active Flux
            </span>
          </div>

          {/* Battery 1: ATP / ADP Chemical Battery */}
          <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <span>🔋 ATP Chemical Energy Battery:</span>
              </span>
              <span className="font-mono font-bold text-amber-700">
                {output.atpProductionRate} nmol/s
              </span>
            </div>

            <div className="w-full bg-emerald-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, output.atpLevel)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-emerald-800">
              <span>ADP + Pᵢ (Discharged)</span>
              <span className="font-bold text-amber-800">ATP (Charged)</span>
            </div>
          </div>

          {/* Battery 2: NADPH / NADP+ Reducing Power */}
          <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-purple-950 flex items-center gap-1.5">
                <span>⚡ NADPH Reducing Power:</span>
              </span>
              <span className="font-mono font-bold text-purple-700">
                {output.nadphProductionRate} nmol/s
              </span>
            </div>

            <div className="w-full bg-emerald-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (output.nadphProductionRate / 120) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-emerald-800">
              <span>NADP⁺ (Discharged)</span>
              <span className="font-bold text-purple-800">NADPH (Charged e⁻)</span>
            </div>
          </div>

          {/* Gas & Sugar Output Rates */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
              <div className="font-bold text-sky-950 flex items-center justify-between">
                <span>O₂ Gas:</span>
                <span className="font-mono text-sky-700">{output.oxygenRate} mL/h</span>
              </div>
              <p className="text-[10px] text-sky-800/80 mt-1">From Photolysis (Step 2)</p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div className="font-bold text-amber-950 flex items-center justify-between">
                <span>Glucose:</span>
                <span className="font-mono text-amber-700">{output.glucoseRate} mg/h</span>
              </div>
              <p className="text-[10px] text-amber-800/80 mt-1">From Calvin Cycle (Step 8)</p>
            </div>
          </div>

          {/* Quick Molecule Inspector Chips */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-bold text-emerald-900">
              Click Molecule to Inspect Chemistry:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Chlorophyll', role: 'Absorbs 430/660nm photons; Mg²⁺ reaction center.' },
                { name: 'ATP Synthase', role: 'Rotary nanomachine powered by H⁺ proton gradient.' },
                { name: 'Rubisco', role: 'Fixes inorganic CO₂ gas into organic 3-PGA.' },
                { name: 'G3P Sugar', role: '3-carbon building block assembled into Glucose.' }
              ].map((m) => (
                <button
                  key={m.name}
                  onClick={() => {
                    playClickSound(state.isMuted);
                    setSelectedMolecule(selectedMolecule === m.name ? null : m.name);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                    selectedMolecule === m.name
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                      : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>

            {selectedMolecule && (
              <div className="p-3 bg-emerald-900 text-emerald-100 rounded-xl text-xs mt-2 border border-emerald-800 animate-fadeIn">
                <div className="font-bold text-amber-300">{selectedMolecule}</div>
                <div>
                  {
                    [
                      { name: 'Chlorophyll', role: 'Absorbs 430/660nm photons; Mg²⁺ reaction center.' },
                      { name: 'ATP Synthase', role: 'Rotary nanomachine powered by H⁺ proton gradient.' },
                      { name: 'Rubisco', role: 'Fixes inorganic CO₂ gas into organic 3-PGA.' },
                      { name: 'G3P Sugar', role: '3-carbon building block assembled into Glucose.' }
                    ].find((m) => m.name === selectedMolecule)?.role
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
