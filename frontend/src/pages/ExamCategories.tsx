import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { categoriesApi, type Category } from '../api/client';
import { SearchBar } from '../components/categories/SearchBar';
import { FilterChips, type FilterChip } from '../components/categories/FilterChips';
import { SortDropdown, type SortOption } from '../components/categories/SortDropdown';
import '../styles/ExamCategories.css';

interface DisplayCategory extends Category {
  icon: string;
  color: string;
  description: string;
}

// The original predefined categories — always visible regardless of DB content
const PREDEFINED: DisplayCategory[] = [
  {
    id: 'science',
    name: 'Science',
    description: 'Biology, Physics, Chemistry, and more',
    icon: '🔬',
    color: '#667eea',
    count: 0,
  },
  {
    id: 'humanities',
    name: 'Humanities',
    description: 'History, Literature, Philosophy, and more',
    icon: '📚',
    color: '#f59e0b',
    count: 0,
  },
  {
    id: 'languages',
    name: 'Languages',
    description: 'English, French, and other languages',
    icon: '🗣️',
    color: '#10b981',
    count: 0,
  },
  {
    id: 'business',
    name: 'Business & Economics',
    description: 'Business, Economics, Accounting',
    icon: '💼',
    color: '#ef4444',
    count: 0,
  },
  {
    id: 'professional',
    name: 'Professional Certifications',
    description: 'IT certifications, Professional exams',
    icon: '🎯',
    color: '#8b5cf6',
    count: 0,
  },
  {
    id: 'general',
    name: 'General Knowledge',
    description: 'Current affairs, General knowledge',
    icon: '🌐',
    color: '#06b6d4',
    count: 0,
  },
];

// Icon/color fallback table for new categories coming from the DB
const CATEGORY_STYLES: Record<string, { icon: string; color: string }> = {
  mathematics: { icon: '🔢', color: '#667eea' },
  math:        { icon: '🔢', color: '#667eea' },
  geography:   { icon: '🌍', color: '#10b981' },
  history:     { icon: '🏛️', color: '#f59e0b' },
  physics:     { icon: '⚡', color: '#8b5cf6' },
  chemistry:   { icon: '⚗️', color: '#ef4444' },
  biology:     { icon: '🧬', color: '#14b8a6' },
  english:     { icon: '✍️', color: '#f97316' },
  literature:  { icon: '📖', color: '#ec4899' },
  economics:   { icon: '📈', color: '#0ea5e9' },
  computer:    { icon: '💻', color: '#6366f1' },
};
const DEFAULT_STYLE = { icon: '📚', color: '#8b5cf6' };

function getCategoryStyle(id: string) {
  if (CATEGORY_STYLES[id]) return CATEGORY_STYLES[id];
  for (const key of Object.keys(CATEGORY_STYLES)) {
    if (id.includes(key) || key.includes(id)) return CATEGORY_STYLES[key];
  }
  return DEFAULT_STYLE;
}

/**
 * Merge strategy:
 *  1. Start with all predefined categories (always visible).
 *  2. For each predefined category found in the API results, update its count.
 *  3. Append any API categories that are NOT already in the predefined list.
 * This means predefined categories are never removed, and new DB categories are always added.
 */
function mergeCategories(apiCategories: Category[]): DisplayCategory[] {
  const apiMap = new Map(apiCategories.map((c) => [c.id, c]));

  // Update counts for predefined categories
  const merged: DisplayCategory[] = PREDEFINED.map((pre) => {
    const fromApi = apiMap.get(pre.id);
    return fromApi ? { ...pre, count: fromApi.count } : pre;
  });

  // Append DB-only categories not in the predefined list
  const predefinedIds = new Set(PREDEFINED.map((p) => p.id));
  for (const cat of apiCategories) {
    if (!predefinedIds.has(cat.id)) {
      merged.push({
        ...cat,
        ...getCategoryStyle(cat.id),
        description: `${cat.count} ${cat.count === 1 ? 'exam' : 'exams'} available`,
      });
    }
  }

  return merged;
}

export function ExamCategories() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [categories, setCategories] = useState<DisplayCategory[]>(PREDEFINED);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortOption, setSortOption] = useState<SortOption>('default');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await categoriesApi.getAll();
        setCategories(mergeCategories(data.categories));
      } catch {
        // On error, still show predefined categories so the page is usable
        setError('Could not load live exam counts. Showing all categories.');
        setCategories(PREDEFINED);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter chips are derived from the merged category list
  const filterChips: FilterChip[] = useMemo(
    () => [{ value: 'all', label: 'All' }, ...categories.map((c) => ({ value: c.id, label: c.name }))],
    [categories]
  );

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    let result = categories.filter((cat) => {
      if (activeFilter !== 'all' && cat.id !== activeFilter) return false;
      if (q && !cat.name.toLowerCase().includes(q) && !cat.description.toLowerCase().includes(q)) return false;
      return true;
    });

    if (sortOption === 'az') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortOption === 'za') result = [...result].sort((a, b) => b.name.localeCompare(a.name));

    return result;
  }, [searchQuery, activeFilter, sortOption, categories]);

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/exams/category/${categoryId}`);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="exam-categories-container">
      <header className="categories-header">
        <div className="header-content">
          <div className="header-left">
            <button className="btn-back" onClick={handleBack}>
              ← Back
            </button>
            <h1>Choose Your Category</h1>
          </div>
          <div className="header-actions">
            {user?.role === 'admin' && (
              <button className="btn-admin" onClick={() => navigate('/admin')}>
                Admin Dashboard
              </button>
            )}
            <button className="btn-logout" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="categories-main">
        <p className="categories-subtitle">Select a category to view available exams</p>

        {/* Discovery toolbar */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <SortDropdown value={sortOption} onChange={setSortOption} />
          </div>
          <FilterChips chips={filterChips} active={activeFilter} onChange={setActiveFilter} />
        </div>

        {error && (
          <p className="text-sm text-amber-600 mb-4">{error}</p>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-gray-500">Loading categories…</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4">
              {filteredCategories.length === categories.length
                ? `${categories.length} ${categories.length === 1 ? 'category' : 'categories'}`
                : `${filteredCategories.length} of ${categories.length} categories`}
            </p>

            {filteredCategories.length > 0 ? (
              <div className="categories-grid">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="category-card"
                    onClick={() => handleCategoryClick(category.id)}
                    style={{ borderColor: category.color }}
                  >
                    <div className="category-icon" style={{ background: category.color }}>
                      {category.icon}
                    </div>
                    <h3 className="category-name">{category.name}</h3>
                    <p className="category-description">{category.description}</p>
                    {category.count > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        {category.count} {category.count === 1 ? 'exam' : 'exams'} available
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No categories found</h3>
                <p className="text-sm text-gray-400">Try a different search or filter</p>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setActiveFilter('all'); setSortOption('default'); }}
                  className="mt-5 text-sm text-blue-600 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
