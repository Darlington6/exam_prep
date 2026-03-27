interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: '500+', label: 'Practice exams' },
  { value: '40k', label: 'Students' },
  { value: '94%', label: 'Pass rate' },
  { value: '12', label: 'Subject areas' },
];

export function StatsSection() {
  return (
    <section className="bg-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        {stats.map(({ value, label }) => (
          <div key={label}>
            <p className="text-3xl sm:text-4xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
