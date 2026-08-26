import React from 'react';
import { HOTSPOTS } from '../data/labData';
import { ViewLevel } from '../types';

interface InspectorProps {
  hotspotId: string | null;
  onClose: () => void;
  onChangeView: (view: ViewLevel) => void;
}

export const StructureInspectorModal: React.FC<InspectorProps> = ({
  hotspotId,
  onClose,
  onChangeView
}) => {
  if (!hotspotId) return null;
  const hotspot = HOTSPOTS[hotspotId];
  if (!hotspot) return null;

  return (
    <div
      id="structure_inspector_modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white border-2 border-emerald-100 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 relative text-emerald-950"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-emerald-100 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 font-bold">
              3D Structure Micro-Inspection
            </span>
            <h2 className="text-xl font-black text-emerald-950 mt-0.5">{hotspot.name}</h2>
          </div>
          <button
            id="close_inspector_btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center transition-colors font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 text-xs leading-relaxed">
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-1">
            <div className="text-emerald-900 font-black text-sm">{hotspot.title}</div>
            <p className="text-emerald-800/90 font-medium">{hotspot.description}</p>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 space-y-1">
            <strong className="text-amber-800 font-bold uppercase text-[11px] block">
              Primary Role in Photosynthesis:
            </strong>
            <p className="text-amber-950/90 font-medium">{hotspot.role}</p>
          </div>

          <div className="p-4 bg-emerald-900 rounded-2xl text-white space-y-1 shadow-md">
            <strong className="text-emerald-300 font-bold text-[11px] uppercase tracking-wider block">
              🌱 Did You Know?
            </strong>
            <p className="text-emerald-100/90 font-medium">{hotspot.funFact}</p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              onChangeView(hotspot.view);
              onClose();
            }}
            className="text-xs text-emerald-700 hover:text-emerald-950 font-bold underline underline-offset-4"
          >
            Focus 3D View on this structure →
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md shadow-emerald-200"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
