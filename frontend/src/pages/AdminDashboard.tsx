import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { ExamList } from '../components/admin/ExamList';
import { ExamForm } from '../components/admin/ExamForm';
import { ExternalAPIFetch } from '../components/admin/ExternalAPIFetch';
import '../styles/AdminDashboard.css';

type TabView = 'exams' | 'create-exam' | 'fetch-api';

export function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabView>('exams');
  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  // If not admin, redirect to regular dashboard
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleCreateNew = () => {
    setEditingExamId(null);
    setActiveTab('create-exam');
  };

  const handleEditExam = (examId: string) => {
    setEditingExamId(examId);
    setActiveTab('create-exam');
  };

  const handleFormSuccess = () => {
    setActiveTab('exams');
    setEditingExamId(null);
  };

  const handleFormCancel = () => {
    setActiveTab('exams');
    setEditingExamId(null);
  };

  const handleFetchSuccess = () => {
    setActiveTab('exams');
  };

  const handleFetchCancel = () => {
    setActiveTab('exams');
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage exams and questions</p>
      </header>

      <nav className="admin-nav">
        <button
          className={activeTab === 'exams' ? 'active' : ''}
          onClick={() => setActiveTab('exams')}
        >
          All Exams
        </button>
        <button
          className={activeTab === 'create-exam' ? 'active' : ''}
          onClick={handleCreateNew}
        >
          Create New Exam
        </button>
        <button
          className={activeTab === 'fetch-api' ? 'active' : ''}
          onClick={() => setActiveTab('fetch-api')}
        >
          Fetch from API
        </button>
      </nav>

      <main className="admin-content">
        {activeTab === 'exams' && (
          <ExamList onEdit={handleEditExam} onCreate={handleCreateNew} />
        )}
        {activeTab === 'create-exam' && (
          <ExamForm
            examId={editingExamId}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}
        {activeTab === 'fetch-api' && (
          <ExternalAPIFetch
            onSuccess={handleFetchSuccess}
            onCancel={handleFetchCancel}
          />
        )}
      </main>
    </div>
  );
}
