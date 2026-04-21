import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// AUTH
import Authentication from "./Authentication/Authenticate";

// CITIZEN PAGES
import Dashboard from "./pages/citizens/Dashboard";
import CreateGrievance from "./pages/citizens/CreateGrievance";
import Complaints from "./pages/citizens/Complaints";
import Profile from "./pages/citizens/Profile";

// ADMIN PAGES
import AdminDashboard from "./pages/admin/Dashboard";
import GrievanceReports from "./pages/admin/GrievanceReports";
import AdminNotifications from "./pages/admin/AdminNotifications";

// DEPARTMENT PAGES
import DepartmentDashboard from "./pages/department/Dashboard";
import AssignedComplaints from "./pages/department/AssignedComplaints";
import DepartmentProfile from "./pages/department/DepartmentProfile";

// ── Protected Route — redirects to /login if not authenticated ────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // or a spinner

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>

      {/* AUTH — public */}
      <Route path="/"        element={<Authentication />} />
      <Route path="/login"   element={<Authentication />} />
      <Route path="/signup"  element={<Authentication />} />

      {/* CITIZEN — protected */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={["citizen", "user"]}>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/create" element={
        <ProtectedRoute allowedRoles={["citizen", "user"]}>
          <CreateGrievance />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/complaints" element={
        <ProtectedRoute allowedRoles={["citizen", "user"]}>
          <Complaints />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/profile" element={
        <ProtectedRoute allowedRoles={["citizen", "user"]}>
          <Profile />
        </ProtectedRoute>
      } />

      {/* ADMIN — protected */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/grievances" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <GrievanceReports />
        </ProtectedRoute>
      } />
      <Route path="/admin/notifications" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminNotifications />
        </ProtectedRoute>
      } />

      {/* DEPARTMENT — protected */}
      <Route path="/department" element={
        <ProtectedRoute allowedRoles={["officer"]}>
          <DepartmentDashboard />
        </ProtectedRoute>
      } />
      <Route path="/department/complaints" element={
        <ProtectedRoute allowedRoles={["officer"]}>
          <AssignedComplaints />
        </ProtectedRoute>
      } />
      <Route path="/department/profile" element={
        <ProtectedRoute allowedRoles={["officer"]}>
          <DepartmentProfile />
        </ProtectedRoute>
      } />

    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
