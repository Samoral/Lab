/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { SimState, ViewLevel } from './types';
import { calculatePhotosynthesis } from './utils/photosynthesisMath';
import { playBubbleSound, playClickSound } from './utils/audio';
import { LabHeader } from './components/LabHeader';
import { PhotosynthesisCanvas } from './components/3d/PhotosynthesisCanvas';
import { RateDashboard } from './components/RateDashboard';
import { LabControls } from './components/LabControls';
import { InteractiveEquation } from './components/InteractiveEquation';
import { InteractiveDiagram } from './components/InteractiveDiagram';
import { GuidedExperiments } from './components/GuidedExperiments';
import { ConceptQuiz } from './components/ConceptQuiz';
import { StructureInspectorModal } from './components/StructureInspectorModal';

export default function App() {
  const [state, setState] = useState<SimState>({
    viewLevel: 'whole_plant',
    lightIntensity: 85,
    lightSpectrum: 'white',
    co2Level: 750,
    waterLevel: 80,
    temperature: 25,
    isPlaying: true,
    simSpeed: 1,
    showParticles: true,
    showLabels: true,
    isMuted: false
  });

  const [activeTab, setActiveTab] = useState<'3d_lab' | 'diagram' | 'experiments' | 'quiz'>('3d_lab');
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  // Compute live biological outputs
  const output = useMemo(() => calculatePhotosynthesis(state), [state]);

  // Periodic ambient bubble sound when running & photosynthesizing
  useEffect(() => {
    if (!state.isPlaying || state.isMuted || output.rate <= 5) return;

    // Interval inversely proportional to rate
    const intervalMs = Math.max(1200, 4500 - (output.rate / 100) * 3000);
    const timer = setInterval(() => {
      playBubbleSound(state.isMuted);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [state.isPlaying, state.isMuted, output.rate]);

  // Handlers
  const handleTogglePlay = () => {
    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
    playClickSound(state.isMuted);
  };

  const handleToggleMute = () => {
    setState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const handleToggleParticles = () => {
    setState((prev) => ({ ...prev, showParticles: !prev.showParticles }));
    playClickSound(state.isMuted);
  };

  const handleToggleLabels = () => {
    setState((prev) => ({ ...prev, showLabels: !prev.showLabels }));
    playClickSound(state.isMuted);
  };

  const handleChangeSpeed = (speed: number) => {
    setState((prev) => ({ ...prev, simSpeed: speed }));
    playClickSound(state.isMuted);
  };

  const handleReset = () => {
    setState({
      viewLevel: 'whole_plant',
      lightIntensity: 85,
      lightSpectrum: 'white',
      co2Level: 750,
      waterLevel: 80,
      temperature: 25,
      isPlaying: true,
      simSpeed: 1,
      showParticles: true,
      showLabels: true,
      isMuted: state.isMuted
    });
    playClickSound(state.isMuted);
  };

  const handleChangeView = (view: ViewLevel) => {
    setState((prev) => ({ ...prev, viewLevel: view }));
    playClickSound(state.isMuted);
  };

  // Helper for applying guided experiment auto-presets
  const handleApplyExperimentHint = (expId: string) => {
    playClickSound(state.isMuted);
    if (expId === 'spectrum_test') {
      setState((prev) => ({
        ...prev,
        lightSpectrum: 'green',
        lightIntensity: 90,
        viewLevel: 'whole_plant'
      }));
    } else if (expId === 'drought_stomata') {
      setState((prev) => ({
        ...prev,
        waterLevel: 5,
        viewLevel: 'leaf_cross_section'
      }));
    } else if (expId === 'temp_sweetspot') {
      setState((prev) => ({
        ...prev,
        temperature: 48,
        lightIntensity: 90,
        viewLevel: 'chloroplast_zoom'
      }));
    } else if (expId === 'max_yield') {
      setState((prev) => ({
        ...prev,
        lightIntensity: 95,
        lightSpectrum: 'white',
        co2Level: 950,
        waterLevel: 85,
        temperature: 26
      }));
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 text-emerald-950 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Top Header & Lab Navigation */}
      <LabHeader
        state={state}
        output={output}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onTogglePlay={handleTogglePlay}
        onToggleMute={handleToggleMute}
        onToggleParticles={handleToggleParticles}
        onToggleLabels={handleToggleLabels}
        onChangeSpeed={handleChangeSpeed}
        onReset={handleReset}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Real-time Rate & Telemetry Dashboard (Always visible for continuous feedback) */}
        <RateDashboard state={state} output={output} />

        {/* Tab 1: Primary 3D Virtual Lab */}
        {activeTab === '3d_lab' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 3D Canvas Viewport */}
            <div className="h-[480px] sm:h-[540px] w-full">
              <PhotosynthesisCanvas
                state={state}
                output={output}
                onSelectHotspot={setSelectedHotspot}
                onChangeView={handleChangeView}
              />
            </div>

            {/* Interactive Chemical Equation */}
            <InteractiveEquation state={state} output={output} />

            {/* Environmental Parameter Controls & Limiting Factor */}
            <LabControls state={state} output={output} onChange={setState} />
          </div>
        )}

        {/* Tab 2: 2D Interactive Flow Diagram */}
        {activeTab === 'diagram' && (
          <div className="space-y-6 animate-fadeIn">
            <InteractiveDiagram state={state} output={output} />
            <InteractiveEquation state={state} output={output} />
          </div>
        )}

        {/* Tab 3: Guided Science Challenges */}
        {activeTab === 'experiments' && (
          <div className="space-y-6 animate-fadeIn">
            <GuidedExperiments
              state={state}
              output={output}
              onApplyExperimentHint={handleApplyExperimentHint}
            />
            {/* Quick 3D Mini Viewport in challenges to see live effect */}
            <div className="h-[380px] w-full">
              <PhotosynthesisCanvas
                state={state}
                output={output}
                onSelectHotspot={setSelectedHotspot}
                onChangeView={handleChangeView}
              />
            </div>
            <LabControls state={state} output={output} onChange={setState} />
          </div>
        )}

        {/* Tab 4: Student Mastery Quiz */}
        {activeTab === 'quiz' && (
          <div className="space-y-6 animate-fadeIn">
            <ConceptQuiz
              isMuted={state.isMuted}
              onJumpToStructure={(struct) => {
                setSelectedHotspot(struct);
                setActiveTab('3d_lab');
              }}
            />
          </div>
        )}
      </main>

      {/* 3D Structure Inspector Modal */}
      <StructureInspectorModal
        hotspotId={selectedHotspot}
        onClose={() => setSelectedHotspot(null)}
        onChangeView={handleChangeView}
      />

      {/* Footer */}
      <footer className="border-t border-emerald-100 bg-white py-4 px-6 text-center text-xs text-emerald-800 font-medium">
        Photosynthesis 3D Lab • Designed for Biology &amp; Science Education • 6CO₂ + 6H₂O + Light ➔ C₆H₁₂O₆ + 6O₂
      </footer>
    </div>
  );
}
