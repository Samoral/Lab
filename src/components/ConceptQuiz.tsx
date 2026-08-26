import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { QUIZ_QUESTIONS } from '../data/labData';
import { playClickSound, playSuccessChime } from '../utils/audio';

interface QuizProps {
  isMuted: boolean;
  onJumpToStructure?: (structureId: string) => void;
}

export const ConceptQuiz: React.FC<QuizProps> = ({ isMuted, onJumpToStructure }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
    playClickSound(isMuted);
  };

  const handleCheckAnswers = () => {
    setShowResults(true);
    const correctCount = QUIZ_QUESTIONS.filter((q) => selectedAnswers[q.id] === q.correctIndex).length;
    if (correctCount >= 4) {
      playSuccessChime(isMuted);
      if (correctCount === QUIZ_QUESTIONS.length) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 }
        });
      }
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
    playClickSound(isMuted);
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const score = QUIZ_QUESTIONS.filter((q) => selectedAnswers[q.id] === q.correctIndex).length;

  return (
    <div id="concept_quiz_panel" className="bg-white rounded-3xl border border-emerald-100 p-5 sm:p-8 shadow-sm space-y-6">
      {/* Quiz Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-emerald-950 flex items-center gap-2">
            <span>📝 Photosynthesis Mastery Quiz</span>
          </h2>
          <p className="text-xs text-emerald-700/80 font-medium">
            Test your understanding of light reactions, stomatal gas exchange, and the Calvin cycle!
          </p>
        </div>

        {showResults ? (
          <div className="flex items-center gap-3">
            <div className="text-xs font-bold font-mono px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Score: {score} / {QUIZ_QUESTIONS.length} ({Math.round((score / QUIZ_QUESTIONS.length) * 100)}%)
            </div>
            <button
              onClick={handleResetQuiz}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-800 transition-colors shadow-xs"
            >
              🔄 Try Again
            </button>
          </div>
        ) : (
          <div className="text-xs text-emerald-800 font-mono font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Answered: {answeredCount} / {QUIZ_QUESTIONS.length}
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-5">
        {QUIZ_QUESTIONS.map((q, qIndex) => {
          const userAnswer = selectedAnswers[q.id];
          const isAnswered = userAnswer !== undefined;
          const isCorrect = isAnswered && userAnswer === q.correctIndex;

          return (
            <div
              key={q.id}
              className="bg-emerald-50/40 p-4 sm:p-5 rounded-3xl border border-emerald-100 space-y-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-black text-emerald-950 leading-snug">
                  <span className="text-emerald-600 font-mono mr-1.5">{qIndex + 1}.</span>
                  {q.question}
                </h3>
                {showResults && (
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {q.options.map((opt, optIdx) => {
                  const isSelected = userAnswer === optIdx;
                  let btnStyle = 'bg-white border border-emerald-100 text-emerald-950 hover:bg-emerald-50 hover:border-emerald-300';

                  if (showResults) {
                    if (optIdx === q.correctIndex) {
                      btnStyle = 'bg-emerald-100 border-2 border-emerald-500 text-emerald-950 font-bold';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'bg-rose-50 border-2 border-rose-400 text-rose-950 line-through';
                    }
                  } else if (isSelected) {
                    btnStyle = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-bold shadow-xs';
                  }

                  return (
                    <button
                      key={optIdx}
                      id={`quiz_q${q.id}_opt${optIdx}`}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      disabled={showResults}
                      className={`p-3 rounded-2xl border text-left transition-all ${btnStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full border border-emerald-300 flex items-center justify-center text-[11px] font-mono font-bold bg-white text-emerald-800 shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="font-medium">{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Card upon submit */}
              {showResults && (
                <div className="p-4 rounded-2xl bg-emerald-900 text-white text-xs space-y-1 shadow-md">
                  <div className="font-black text-emerald-300 uppercase tracking-wider text-[11px]">
                    💡 Scientific Explanation:
                  </div>
                  <p className="leading-relaxed text-emerald-100/90 font-medium">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quiz Action Submit Footer */}
      {!showResults && (
        <div className="flex items-center justify-end pt-2">
          <button
            id="btn_submit_quiz"
            onClick={handleCheckAnswers}
            disabled={answeredCount === 0}
            className="px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md shadow-emerald-200 transition-all"
          >
            📊 Check My Answers ({answeredCount}/{QUIZ_QUESTIONS.length})
          </button>
        </div>
      )}
    </div>
  );
};
