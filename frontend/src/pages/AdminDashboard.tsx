import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { ExamList } from '../components/admin/ExamList';
import { ExamForm } from '../components/admin/ExamForm';
import { ExternalAPIFetch } from '../components/admin/ExternalAPIFetch';
import { Navbar } from '../components/Navbar';
import '../styles/AdminDashboard.css';

type TabView = 'exams' | 'create-exam' | 'fetch-api';

export function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabView>('exams');
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [managingExamId, setManagingExamId] = useState<string | null>(null);

  // If not admin, redirect to regular dashboard
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoToExams = () => {
    setActiveTab('exams');
    setEditingExamId(null);
    setManagingExamId(null);
  };

  const handleCreateNew = () => {
    setEditingExamId(null);
    setManagingExamId(null);
    setActiveTab('create-exam');
  };

  const handleEditExam = (examId: string) => {
    setEditingExamId(examId);
    setManagingExamId(null);
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
      <Navbar backTo="/dashboard" backLabel="Dashboard" />
      <header className="admin-header">
        <h1>Dashboard</h1>
        <p>Manage exams and questions</p>
      </header>

      <nav className="admin-nav">
        <button
          className={activeTab === 'exams' && !managingExamId ? 'active' : ''}
          onClick={handleGoToExams}
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
          onClick={() => { setActiveTab('fetch-api'); setManagingExamId(null); }}
        >
          Fetch from API
        </button>
        {managingExamId && (
          <span className="nav-breadcrumb">› Manage Questions</span>
        )}
      </nav>

      <main className="admin-content">
        {activeTab === 'exams' && (
          <ExamList
            onEdit={handleEditExam}
            onCreate={handleCreateNew}
            managingExamId={managingExamId}
            onManageQuestions={setManagingExamId}
            onCloseQuestions={() => setManagingExamId(null)}
          />
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
