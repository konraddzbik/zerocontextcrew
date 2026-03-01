import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { BedtimeProvider } from './components/BedtimeContext';
import LoginPage from './pages/LoginPage';
import StoryPickerPage from './pages/StoryPickerPage';
import StoryReaderPage from './pages/StoryReaderPage';
import SummaryPage from './pages/SummaryPage';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BedtimeProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/pick" element={<ProtectedRoute><StoryPickerPage /></ProtectedRoute>} />
            <Route path="/story" element={<ProtectedRoute><StoryReaderPage /></ProtectedRoute>} />
            <Route path="/summary" element={<ProtectedRoute><SummaryPage /></ProtectedRoute>} />
          </Routes>
        </BedtimeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
