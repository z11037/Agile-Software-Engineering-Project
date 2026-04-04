import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ReviewPage from './pages/ReviewPage';
import QuizPage from './pages/QuizPage';
import ProgressPage from './pages/ProgressPage';
import SpeakingPage from './pages/SpeakingPage';
import WritingPage from './pages/WritingPage';
import ListeningPage from './pages/ListeningPage';
import ImageQuizPage from './pages/ImageQuizPage';
import CampusChangshaGuidePage from './pages/CampusChangshaGuidePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/review"
              element={
                <ProtectedRoute>
                  <ReviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <ProgressPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/speaking"
              element={
                <ProtectedRoute>
                  <SpeakingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/listening"
              element={
                <ProtectedRoute>
                  <ListeningPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/writing"
              element={
                <ProtectedRoute>
                  <WritingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/image-quiz"
              element={
                <ProtectedRoute>
                  <ImageQuizPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campus-guide"
              element={
                <ProtectedRoute>
                  <CampusChangshaGuidePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
