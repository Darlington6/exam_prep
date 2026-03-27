import { Link } from 'react-router-dom';

interface AnswerOption {
  letter: string;
  text: string;
  state: 'correct' | 'incorrect' | 'neutral';
}

const options: AnswerOption[] = [
  { letter: 'A', text: 'Nucleus', state: 'incorrect' },
  { letter: 'B', text: 'Mitochondria', state: 'correct' },
  { letter: 'C', text: 'Ribosome', state: 'neutral' },
  { letter: 'D', text: 'Golgi apparatus', state: 'neutral' },
];

function optionClasses(state: AnswerOption['state']): string {
  const base = 'flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-colors';
  if (state === 'correct')
    return `${base} bg-green-50 border-green-400 text-green-800`;
  if (state === 'incorrect')
    return `${base} bg-red-50 border-red-300 text-red-800`;
  return `${base} bg-white border-gray-200 text-gray-700`;
}

function letterBadgeClasses(state: AnswerOption['state']): string {
  const base = 'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0';
  if (state === 'correct') return `${base} bg-green-500 text-white`;
  if (state === 'incorrect') return `${base} bg-red-400 text-white`;
  return `${base} bg-gray-100 text-gray-500`;
}

function QuestionCard() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-w-md w-full">
      {/* Card header */}
      <div className="px-6 pt-6 pb-4">
        <p className="text-xs font-semibold text-blue-600 tracking-widest uppercase mb-3">
          Question 7 of 20 &middot; Biology
        </p>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5">
          <div
            className="bg-blue-600 h-1.5 rounded-full"
            style={{ width: '35%' }}
            role="progressbar"
            aria-valuenow={7}
            aria-valuemin={1}
            aria-valuemax={20}
          />
        </div>

        {/* Question text */}
        <p className="text-gray-900 font-semibold text-base leading-snug mb-5">
          Which organelle is responsible for producing ATP through cellular respiration?
        </p>

        {/* Answer options */}
        <div className="flex flex-col gap-2.5">
          {options.map(({ letter, text, state }) => (
            <div key={letter} className={optionClasses(state)}>
              <span className={letterBadgeClasses(state)}>{letter}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Explanation box */}
      <div className="mx-6 mb-6 mt-2 bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="text-xs font-bold text-green-700 mb-1">Correct</p>
        <p className="text-sm text-green-800 leading-relaxed">
          The mitochondria generates ATP via the electron transport chain during aerobic respiration.
        </p>
      </div>
    </div>
  );
}

export function ExamPreviewSection() {
  return (
    <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

        {/* Left: text content */}
        <div className="flex-1 text-center lg:text-left">
          <p className="text-xs font-semibold text-blue-600 tracking-widest uppercase mb-4">
            Live Preview
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5 leading-tight">
            What a practice question looks like
          </h2>
          <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
            Clear, clean question layout with immediate colour-coded feedback. No clutter, no confusion.
          </p>
          <Link
            to="/register"
            className="inline-block border border-gray-300 text-gray-700 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors bg-white"
          >
            Try a sample exam
          </Link>
        </div>

        {/* Right: question card */}
        <div className="flex-1 flex justify-center lg:justify-end w-full">
          <QuestionCard />
        </div>
      </div>
    </section>
  );
}
