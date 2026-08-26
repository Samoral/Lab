import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { SimState, SimOutput, GuidedExperiment } from '../types';
import { GUIDED_EXPERIMENTS } from '../data/labData';
import { playSuccessChime, playClickSound } from '../utils/audio';

interface ExperimentsProps {
  state: SimState;
  output: SimOutput;
  onApplyExperimentHint: (expId: string) => void;
}

export const GuidedExperiments: React.FC<ExperimentsProps> = ({
  state,
  output,
  onApplyExperimentHint
}) => {
  const [activeExpId, setActiveExpId] = useState<string>('spectrum_test');
  const [completedExps, setCompletedExps] = useState<Record<string, boolean>>({});

  const currentExp = GUIDED_EXPERIMENTS.find((e) => e.id === activeExpId) || GUIDED_EXPERIMENTS[0];
  const isCompleted = !!completedExps[currentExp.id];

  // Check if current experiment condition is satisfied
  useEffect(() => {
    if (!completedExps[currentExp.id]) {
      const satisfied = currentExp.targetCondition(state, output);
      if (satisfied) {
        setCompletedExps((prev) => ({ ...prev, [currentExp.id]: true }));
        playSuccessChime(state.isMuted);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  }, [state, output, currentExp, completedExps]);

  const handleSelectExp = (id: string) => {
    setActiveExpId(id);
    playClickSound(state.isMuted);
  };

  const completedCount = Object.values(completedExps).filter(Boolean).length;

  return (
    <div id="guided_experiments_panel" className="bg-white rounded-3xl border border-emerald-100 p-5 sm:p-8 shadow-sm space-y-6">
      {/* Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-emerald-950 flex items-center gap-2">
            <span>🧪 Guided Student Science Challenges</span>
          </h2>
          <p className="text-xs text-emerald-700/80 font-medium">
            Formulate hypotheses, tweak the environmental chamber, and observe biological principles in action!
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 self-start sm:self-auto">
          <span className="text-xs text-emerald-900 font-bold">Challenges Solved:</span>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {completedCount} / {GUIDED_EXPERIMENTS.length}
          </span>
        </div>
      </div>

      {/* Challenge Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {GUIDED_EXPERIMENTS.map((exp) => {
          const isSelected = exp.id === activeExpId;
          const isDone = !!completedExps[exp.id];
          return (
            <button
              key={exp.id}
              id={`challenge_tab_${exp.id}`}
              onClick={() => handleSelectExp(exp.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-50 border-2 border-emerald-500 shadow-md shadow-emerald-100'
                  : 'bg-white border-emerald-100 hover:border-emerald-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-700">
                    {exp.category}
                  </span>
                  {isDone && <span className="text-emerald-600 font-black text-xs">✓ Done</span>}
                </div>
                <div className="text-xs font-black text-emerald-950 line-clamp-1">{exp.title}</div>
              </div>
              <div className="text-xs text-emerald-700/90 mt-2 font-mono font-bold">{exp.badge}</div>
            </button>
          );
        })}
      </div>

      {/* Active Challenge Card */}
      <div className="bg-emerald-50/40 p-5 sm:p-6 rounded-3xl border border-emerald-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-3">
          <div>
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">
              {currentExp.category}
            </span>
            <h3 className="text-base sm:text-lg font-black text-emerald-950 mt-0.5">{currentExp.title}</h3>
          </div>

          {isCompleted ? (
            <div className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
              <span>🎉 Challenge Completed!</span>
              <span className="text-sm">{currentExp.badge}</span>
            </div>
          ) : (
            <div className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Experiment In Progress</span>
            </div>
          )}
        </div>

        {/* Question & Goal */}
        <div className="space-y-2.5 text-xs">
          <div className="p-4 bg-white rounded-2xl border border-emerald-100 text-emerald-950 shadow-2xs">
            <strong className="text-amber-700 font-black block mb-1 text-xs uppercase tracking-wider">
              Scientific Question:
            </strong>
            <p className="font-medium text-emerald-900 leading-relaxed">{currentExp.question}</p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-emerald-100 text-emerald-950 shadow-2xs">
            <strong className="text-emerald-700 font-black block mb-1 text-xs uppercase tracking-wider">
              Your Goal:
            </strong>
            <p className="font-medium text-emerald-900 leading-relaxed">{currentExp.goal}</p>
          </div>
        </div>

        {/* Live Evaluation & Explanation */}
        {isCompleted ? (
          <div className="p-5 bg-emerald-900 rounded-3xl text-white shadow-xl text-xs space-y-2">
            <div className="font-black text-emerald-300 flex items-center gap-2 text-sm uppercase tracking-wider">
              <span>🌟 Discovery Unlocked:</span>
            </div>
            <p className="leading-relaxed text-emerald-100/90 font-medium">{currentExp.explanation}</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-emerald-100 shadow-2xs text-xs">
            <div className="text-emerald-800">
              <strong className="text-emerald-950 font-bold">Hint: </strong>
              <span className="font-medium">{currentExp.hint}</span>
            </div>

            <button
              id={`btn_apply_hint_${currentExp.id}`}
              onClick={() => onApplyExperimentHint(currentExp.id)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-md shadow-emerald-200 shrink-0"
            >
              🪄 Auto-Set Test Chamber
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
