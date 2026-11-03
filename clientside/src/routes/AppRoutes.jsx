import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

const AuthPage = lazy(() => import("../pages/AuthPage"));
const ArcadeCustomerManagement = lazy(
  () => import("../pages/ArcadeCustomerManagement"),
);
const ArcadeReceivables = lazy(() => import("../pages/ArcadeReceivables"));
const ArcadePayables = lazy(() => import("../pages/ArcadePayables"));
const ArcadeSparkles = lazy(() => import("../pages/ArcadeSparkles"));
const Dashboard = lazy(() => import("../components/Dashboard"));

function AppRoutes() {
  return (
    <Suspense
      fallback={
        <main className="app-loading" role="status">
          Loading page…
        </main>
      }
    >
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
          path="/arcade/customers/:customerId"
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
          path="/arcade/payables"
          element={
            <ProtectedRoute adminOnly>
              <ArcadePayables />
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
    </Suspense>
  );
}

export default AppRoutes;
