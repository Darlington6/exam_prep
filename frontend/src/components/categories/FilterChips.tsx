export interface FilterChip {
  value: string;
  label: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  active: string;
  onChange: (value: string) => void;
}

export function FilterChips({ chips, active, onChange }: FilterChipsProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      role="group"
      aria-label="Filter by subject"
    >
      {chips.map(({ value, label }) => {
        const isActive = value === active;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            aria-pressed={isActive}
            className={[
              'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border',
              isActive
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600',
            ].join(' ')}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
