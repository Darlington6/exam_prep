export type SortOption = 'default' | 'az' | 'za';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const options: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'az', label: 'A → Z' },
  { value: 'za', label: 'Z → A' },
];

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <label htmlFor="sort-select" className="text-sm text-gray-500 whitespace-nowrap">
        Sort by:
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
