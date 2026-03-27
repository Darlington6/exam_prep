import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { categoriesApi, type Category } from '../api/client';
import { Footer } from '../components/Footer';
import type { SortOption } from '../components/categories/SortDropdown';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DisplayCategory extends Category {
  icon: string;
  color: string;
  description: string;
}

// ─── Static data — predefined categories always rendered ──────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// Icon background Tailwind class per category slug
const iconBgMap: Record<string, string> = {
  science:      'bg-indigo-50',
  mathematics:  'bg-amber-50',
  math:         'bg-amber-50',
  geography:    'bg-green-50',
  humanities:   'bg-orange-50',
  languages:    'bg-sky-50',
  business:     'bg-rose-50',
  professional: 'bg-violet-50',
  general:      'bg-teal-50',
  history:      'bg-orange-50',
  physics:      'bg-indigo-50',
  chemistry:    'bg-red-50',
  biology:      'bg-teal-50',
  english:      'bg-sky-50',
  literature:   'bg-pink-50',
  economics:    'bg-cyan-50',
  computer:     'bg-violet-50',
};
const getIconBg = (slug: string) => iconBgMap[slug] ?? 'bg-slate-50';

/**
 * Merge strategy:
 *  1. Start with all predefined categories (always visible).
 *  2. For each predefined category found in the API results, update its count.
 *  3. Append any API categories NOT already in the predefined list.
 */
function mergeCategories(apiCategories: Category[]): DisplayCategory[] {
  const apiMap = new Map(apiCategories.map((c) => [c.id, c]));

  const merged: DisplayCategory[] = PREDEFINED.map((pre) => {
    const fromApi = apiMap.get(pre.id);
    return fromApi ? { ...pre, count: fromApi.count } : pre;
  });

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

// ─── Component ────────────────────────────────────────────────────────────────

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
        setError('Could not load live exam counts. Showing all categories.');
        setCategories(PREDEFINED);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Categories that have at least one exam — used for filter chips + main grid
  const activeCategories = useMemo(
    () => categories.filter((c) => c.count > 0),
    [categories],
  );

  // Categories with no exams — shown as dimmed placeholder rows
  const emptyCategories = useMemo(
    () => categories.filter((c) => c.count === 0),
    [categories],
  );

  // Active categories after applying search query + chip filter + sort
  const filteredActiveCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let result = activeCategories.filter((cat) => {
      if (activeFilter !== 'all' && cat.id !== activeFilter) return false;
      if (q && !cat.name.toLowerCase().includes(q) && !cat.description.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sortOption === 'az') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortOption === 'za') result = [...result].sort((a, b) => b.name.localeCompare(a.name));
    return result;
  }, [searchQuery, activeFilter, sortOption, activeCategories]);

  // Empty categories filtered by search (chip filter doesn't apply to empty ones)
  const filteredEmptyCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return emptyCategories;
    return emptyCategories.filter((cat) =>
      cat.name.toLowerCase().includes(q) || cat.description.toLowerCase().includes(q)
    );
  }, [searchQuery, emptyCategories]);

  // True only when both active AND empty grids yield nothing
  const noResultsAtAll = filteredActiveCategories.length === 0 && filteredEmptyCategories.length === 0;

  const handleCategoryClick = (categoryId: string) => navigate(`/exams/category/${categoryId}`);
  const handleBack = () => navigate('/dashboard');

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col">

      {/* ── Sticky navbar ── */}
      <nav className="bg-white border-b border-slate-200 px-8 h-16 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>
          <div className="w-px h-5 bg-slate-200" />
          <span className="text-base font-semibold text-slate-900">Browse Categories</span>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              Admin Dashboard
            </button>
          )}
          <button
            onClick={logout}
            className="text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900 px-3 py-1.5 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ── Page content ── */}
      <div className="max-w-6xl mx-auto px-8">

        {/* Page header */}
        <div className="pt-8 mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Choose Your Category</h1>
          <p className="text-sm text-slate-500">Select a category to view available exams</p>
        </div>

        {/* Controls row: search + sort */}
        <div className="flex items-center gap-3 flex-wrap mb-4 sm:flex-row flex-col">
          <div className="relative flex-1 max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search categories or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 caret-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm text-slate-500">Sort by:</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
            >
              <option value="default">Default</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
            </select>
          </div>
        </div>

        {/* Filter chips — only categories with exams */}
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
            Filter by category
          </p>
          <div className="flex gap-2 flex-wrap">
            {/* "All" chip */}
            <button
              onClick={() => setActiveFilter('all')}
              className={`text-sm font-medium px-4 py-1.5 rounded-full border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeFilter === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              All
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {activeCategories.length}
              </span>
            </button>

            {/* One chip per category that has exams */}
            {activeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`text-sm font-medium px-4 py-1.5 rounded-full border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === cat.id
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                {cat.name}
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  activeFilter === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error banner */}
        {error && <p className="text-sm text-amber-600 mb-4">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-slate-500">Loading categories…</p>
          </div>
        ) : (
          <>
            {/* Count + live badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-400 font-medium">
                {activeCategories.length}{' '}
                {activeCategories.length === 1 ? 'category' : 'categories'} with exams
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Live from database
              </span>
            </div>

            {/* ── Active categories grid ── */}
            {filteredActiveCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {filteredActiveCategories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className="bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer flex flex-col gap-3 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${getIconBg(category.id)}`}>
                        {category.icon}
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                        {category.count} exam{category.count !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="text-base font-semibold text-slate-900">{category.name}</div>
                    <div className="text-sm text-slate-500 leading-relaxed">{category.description}</div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                      <span className="text-xs text-slate-500">
                        <span className="text-indigo-600 font-semibold">{category.count}</span>{' '}
                        exam{category.count !== 1 ? 's' : ''} available
                      </span>
                      <span className="text-sm text-slate-300 group-hover:text-indigo-500 transition-colors">→</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : noResultsAtAll ? (
              <div className="flex flex-col items-center justify-center py-16 text-center mb-8">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No categories found</h3>
                <p className="text-sm text-slate-400">Try a different search or filter</p>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setActiveFilter('all'); setSortOption('default'); }}
                  className="mt-5 text-sm text-indigo-600 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : null}

            {/* ── Empty categories section (no exams yet) ── */}
            {filteredEmptyCategories.length > 0 && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                  No exams yet
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
                  {filteredEmptyCategories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className="bg-white border border-dashed border-slate-200 rounded-2xl px-5 py-4 flex items-center gap-3 cursor-pointer hover:border-indigo-200 hover:shadow-sm transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-base grayscale group-hover:grayscale-0 transition-all">
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-400 group-hover:text-slate-700 transition-colors">{category.name}</div>
                        <div className="text-xs text-slate-300 mt-0.5 group-hover:text-slate-400 transition-colors">No exams added yet</div>
                      </div>
                      <span className="text-slate-200 group-hover:text-indigo-400 transition-colors text-sm">→</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
