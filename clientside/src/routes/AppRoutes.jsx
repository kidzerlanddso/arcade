import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import AuthPage from "../pages/AuthPage";
import ProfilePage from "../pages/profilePage";
import MyProfilePage from "../pages/MyProfilePage";
import Dashboard from "../components/Dashboard";

import NewProfile from "../components/NewProfile";
import MembershipRequest from "../components/membershiprequest";
import NewBook from "../components/NewBook";
import EditBook from "../components/EditBook";
import DeleteBook from "../components/DeleteBook";

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
        path="/profile/edit/:id"
        element={
          <ProtectedRoute>
            <EditBook />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/delete/:id"
        element={
          <ProtectedRoute>
            <DeleteBook />
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
        path="/books/new"
        element={
          <ProtectedRoute>
            <NewBook />
          </ProtectedRoute>
        }
      />

      <Route
        path="/books/edit/:id"
        element={
          <ProtectedRoute>
            <EditBook />
          </ProtectedRoute>
        }
      />

      <Route
        path="/books/delete/:id"
        element={
          <ProtectedRoute>
            <DeleteBook />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
