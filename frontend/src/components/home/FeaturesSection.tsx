import { type ReactNode } from 'react';

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

function CheckboxIcon() {
  return (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
    </svg>
  );
}

function TrendingIcon() {
  return (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function DevicesIcon() {
  return (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

const features: Feature[] = [
  {
    icon: <CheckboxIcon />,
    title: 'Adaptive questions',
    description:
      "Questions get harder as you improve, so you're always challenged at the right level.",
  },
  {
    icon: <GlobeIcon />,
    title: 'Instant explanations',
    description:
      'Every answer includes a clear explanation so you learn from every mistake, not just the score.',
  },
  {
    icon: <TrendingIcon />,
    title: 'Progress tracking',
    description:
      'Visual dashboards show your score trends, weak topics, and time-per-question over time.',
  },
  {
    icon: <ClockIcon />,
    title: 'Timed mock exams',
    description:
      'Simulate real exam conditions with a countdown timer and exam-style question layout.',
  },
  {
    icon: <ListIcon />,
    title: '500+ subjects',
    description:
      'Covering Maths, Sciences, History, Languages, and more — from GCSE to university level.',
  },
  {
    icon: <DevicesIcon />,
    title: 'Works on any device',
    description:
      'Fully responsive — practice on your phone, tablet, or desktop without losing your place.',
  },
];

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
      <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-blue-600 tracking-widest uppercase mb-3">
            Why Exam Prep
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to pass
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base leading-relaxed">
            From timed mock exams to detailed answer explanations — we cover
            every step of your revision.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
