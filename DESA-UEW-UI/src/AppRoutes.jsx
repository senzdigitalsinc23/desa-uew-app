import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import FoundationPage from './pages/FoundationPage';
import SeekPage from './pages/SeekPage';
import DesaHubPage from './pages/DesaHubPage';
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRegions from './pages/admin/AdminRegions';
import AdminPrograms from './pages/admin/AdminPrograms';
import AdminCenters from './pages/admin/AdminCenters';
import AdminHotels from './pages/admin/AdminHotels';
import AdminHealth from './pages/admin/AdminHealth';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminHubAbout from './pages/admin/AdminHubAbout';
import AdminHubLeadership from './pages/admin/AdminHubLeadership';
import AdminHubConstitution from './pages/admin/AdminHubConstitution';
import AdminHubArchives from './pages/admin/AdminHubArchives';
import AdminHubAssets from './pages/admin/AdminHubAssets';
import AdminHubActivities from './pages/admin/AdminHubActivities';
import AdminHubCommittee from './pages/admin/AdminHubCommittee';
import AdminHubGallery from './pages/admin/AdminHubGallery';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F4F7FB]"><p className="text-sm text-slate-500 font-semibold">Loading...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRoutes() {
  const { user, loading } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<FoundationPage />} />
      <Route path="/seek" element={<SeekPage />} />
      <Route path="/hub" element={<DesaHubPage />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/admin" replace />} />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="regions" element={<AdminRegions />} />
                <Route path="programs" element={<AdminPrograms />} />
                <Route path="centers" element={<AdminCenters />} />
                <Route path="hotels" element={<AdminHotels />} />
                <Route path="health" element={<AdminHealth />} />
                <Route path="restaurants" element={<AdminRestaurants />} />
                <Route path="hub-about" element={<AdminHubAbout />} />
                <Route path="hub-leadership" element={<AdminHubLeadership />} />
                <Route path="hub-constitution" element={<AdminHubConstitution />} />
                <Route path="hub-archives" element={<AdminHubArchives />} />
                <Route path="hub-assets" element={<AdminHubAssets />} />
                <Route path="hub-activities" element={<AdminHubActivities />} />
                <Route path="hub-committee" element={<AdminHubCommittee />} />
                <Route path="hub-gallery" element={<AdminHubGallery />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
