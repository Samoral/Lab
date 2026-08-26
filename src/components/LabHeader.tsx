import React from 'react';
import { SimState, SimOutput } from '../types';
import { playClickSound } from '../utils/audio';

interface HeaderProps {
  state: SimState;
  output: SimOutput;
  activeTab: '3d_lab' | 'diagram' | 'experiments' | 'quiz';
  onSelectTab: (tab: '3d_lab' | 'diagram' | 'experiments' | 'quiz') => void;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onToggleParticles: () => void;
  onToggleLabels: () => void;
  onChangeSpeed: (speed: number) => void;
  onReset: () => void;
}

export const LabHeader: React.FC<HeaderProps> = ({
  state,
  output,
  activeTab,
  onSelectTab,
  onTogglePlay,
  onToggleMute,
  onToggleParticles,
  onToggleLabels,
  onChangeSpeed,
  onReset
}) => {
  return (
    <header className="bg-white/95 border-b-2 border-emerald-100 sticky top-0 z-30 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Brand Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-200 shrink-0">
            Ph
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-emerald-900 tracking-tight">
                Photosynthesis <span className="text-emerald-500 italic">Lab v2.0</span>
              </h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 hidden sm:inline">
                Virtual Bio-Station
              </span>
            </div>
            <p className="text-xs text-emerald-700/80 font-medium">
              Interactive 3D plant animations, molecular chloroplast flows &amp; science challenges
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-emerald-50 p-1.5 rounded-2xl border border-emerald-200/80 self-start md:self-auto overflow-x-auto max-w-full">
          <button
            id="tab_3d_lab"
            onClick={() => {
              playClickSound(state.isMuted);
              onSelectTab('3d_lab');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === '3d_lab'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/70'
            }`}
          >
            <span>🌿 3D Virtual Lab</span>
          </button>

          <button
            id="tab_diagram"
            onClick={() => {
              playClickSound(state.isMuted);
              onSelectTab('diagram');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'diagram'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/70'
            }`}
          >
            <span>🗺️ Flow Diagram</span>
          </button>

          <button
            id="tab_experiments"
            onClick={() => {
              playClickSound(state.isMuted);
              onSelectTab('experiments');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'experiments'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/70'
            }`}
          >
            <span>🧪 Challenges</span>
          </button>

          <button
            id="tab_quiz"
            onClick={() => {
              playClickSound(state.isMuted);
              onSelectTab('quiz');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'quiz'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/70'
            }`}
          >
            <span>📝 Quiz</span>
          </button>
        </nav>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Play/Pause Button */}
          <button
            id="toggle_play_btn"
            onClick={onTogglePlay}
            title={state.isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
              state.isPlaying
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
            }`}
          >
            <span>{state.isPlaying ? '⏸️ Running' : '▶️ Paused'}</span>
          </button>

          {/* Speed Selector */}
          <button
            id="toggle_speed_btn"
            onClick={() => {
              const next = state.simSpeed === 1 ? 2 : state.simSpeed === 2 ? 0.5 : 1;
              onChangeSpeed(next);
            }}
            className="px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:border-emerald-300 transition-colors shadow-xs"
            title="Toggle simulation speed"
          >
            {state.simSpeed}x
          </button>

          {/* Particle System Toggle */}
          <button
            id="toggle_particles_btn"
            onClick={onToggleParticles}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              state.showParticles
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                : 'bg-white border-emerald-200 text-slate-400 line-through'
            }`}
            title="Toggle animated particles"
          >
            ✨ Particles
          </button>

          {/* Audio Mute Toggle */}
          <button
            id="toggle_mute_btn"
            onClick={onToggleMute}
            className="p-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:border-emerald-300 transition-colors shadow-xs"
            title={state.isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {state.isMuted ? '🔇' : '🔊'}
          </button>

          {/* Reset Chamber */}
          <button
            id="reset_chamber_btn"
            onClick={onReset}
            className="p-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-700 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors shadow-xs"
            title="Reset chamber to default parameters"
          >
            🔄
          </button>
        </div>
      </div>
    </header>
  );
};
