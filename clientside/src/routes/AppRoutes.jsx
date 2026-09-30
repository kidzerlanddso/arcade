import { Navigate, Route, Routes } from "react-router-dom";
import DonationsPage from "../pages/DonationsPage";
import ProtectedRoute from "../components/ProtectedRoute";
import AuthPage from "../pages/AuthPage";
import ProfilePage from "../pages/profilePage";
import MyProfilePage from "../pages/MyProfilePage";
import Dashboard from "../components/Dashboard";
import MessageAlumniPage from "../pages/MessageAlumniPage";
import EventsPage from "../pages/EventsPage";
import About from "../pages/about";
import EventDetailsPage from "../pages/EventDetailsPage";
import DynamicData from "../components/DynamicData";
import AdminList from "../components/adminlist";

import NewProfile from "../components/NewProfile";
import MembershipRequest from "../components/membershiprequest";
import AlumniProfilePage from "../pages/AlumniProfilePage";
import AnnouncementsPage from "../pages/AnnouncementsPage";
import TeacherProfilesPage from "../pages/TeacherProfilesPage";
import StatsPage from "../pages/StatsPage";
import SpotlightDetailsPage from "../pages/SpotlightDetailsPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donations"
        element={
          <ProtectedRoute>
            <DonationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <EventsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        }
      />
      <Route
        path="/announcements"
        element={
          <ProtectedRoute>
            <AnnouncementsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers"
        element={
          <ProtectedRoute>
            <TeacherProfilesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/spotlights"
        element={
          <ProtectedRoute>
            <SpotlightDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/spotlights/:spotlightId"
        element={
          <ProtectedRoute>
            <SpotlightDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:eventId"
        element={
          <ProtectedRoute>
            <EventDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/data/dynamicdata"
        element={
          <ProtectedRoute>
            <DynamicData />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dynamicdata"
        element={
          <ProtectedRoute>
            <DynamicData />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stats"
        element={
          <ProtectedRoute>
            <StatsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/me"
        element={
          <ProtectedRoute>
            <MyProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/new"
        element={
          <ProtectedRoute>
            <NewProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/membership-request"
        element={
          <ProtectedRoute>
            <MembershipRequest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/view/:id"
        element={
          <ProtectedRoute>
            <AlumniProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
