import { Link } from 'react-router-dom';

export function HeroSection() {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-gradient-to-b from-blue-50 to-white pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">

        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wide">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" aria-hidden="true" />
          TRUSTED BY 40,000+ STUDENTS
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Ace your exams with{' '}
          <span className="text-blue-600">smarter</span>
          {' '}practice
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Adaptive practice tests, instant feedback, and progress tracking —
          built for high school and university students.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto bg-gray-900 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-800 transition-colors text-sm"
          >
            Start practising free
          </Link>
          <button
            type="button"
            onClick={scrollToFeatures}
            className="w-full sm:w-auto border border-gray-300 text-gray-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-sm bg-white"
          >
            See how it works
          </button>
        </div>
      </div>
    </section>
  );
}
