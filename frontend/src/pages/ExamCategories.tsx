import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ExamCategories.css';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  subCategories: string[];
}

const categories: Category[] = [
  {
    id: 'science',
    name: 'Science',
    description: 'Biology, Physics, Chemistry, and more',
    icon: '🔬',
    color: '#667eea',
    subCategories: ['Biology', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science']
  },
  {
    id: 'humanities',
    name: 'Humanities',
    description: 'History, Literature, Philosophy, and more',
    icon: '📚',
    color: '#f59e0b',
    subCategories: ['History', 'Literature', 'Philosophy', 'Geography', 'Social Studies']
  },
  {
    id: 'languages',
    name: 'Languages',
    description: 'English, French, and other languages',
    icon: '🗣️',
    color: '#10b981',
    subCategories: ['English', 'French', 'Spanish', 'Swahili', 'Kinyarwanda']
  },
  {
    id: 'business',
    name: 'Business & Economics',
    description: 'Business, Economics, Accounting',
    icon: '💼',
    color: '#ef4444',
    subCategories: ['Business Studies', 'Economics', 'Accounting', 'Entrepreneurship']
  },
  {
    id: 'professional',
    name: 'Professional Certifications',
    description: 'IT certifications, Professional exams',
    icon: '🎯',
    color: '#8b5cf6',
    subCategories: ['IT Certifications', 'Medical Exams', 'Law Exams', 'Engineering']
  },
  {
    id: 'general',
    name: 'General Knowledge',
    description: 'Current affairs, General knowledge',
    icon: '🌍',
    color: '#06b6d4',
    subCategories: ['Current Affairs', 'General Knowledge', 'Civics', 'Mixed Topics']
  }
];

export function ExamCategories() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
        <p className="categories-subtitle">
          Select a category to view available exams
        </p>

        <div className="categories-grid">
          {categories.map((category) => (
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
              <div className="category-tags">
                {category.subCategories.slice(0, 3).map((sub, index) => (
                  <span key={index} className="category-tag">
                    {sub}
                  </span>
                ))}
                {category.subCategories.length > 3 && (
                  <span className="category-tag">+{category.subCategories.length - 3} more</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
