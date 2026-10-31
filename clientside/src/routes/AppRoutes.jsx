import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AuthPage from "../pages/AuthPage";
import ArcadeCustomerManagement from "../pages/ArcadeCustomerManagement";
import ArcadeReceivables from "../pages/ArcadeReceivables";
import ArcadeSparkles from "../pages/ArcadeSparkles";
import Dashboard from "../components/Dashboard";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute adminOnly>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/arcade/customers"
        element={
          <ProtectedRoute adminOnly>
            <ArcadeCustomerManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/arcade/receivables"
        element={
          <ProtectedRoute adminOnly>
            <ArcadeReceivables />
          </ProtectedRoute>
        }
      />
      <Route
        path="/arcade/sparkles"
        element={
          <ProtectedRoute sparklesOnly>
            <ArcadeSparkles />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
