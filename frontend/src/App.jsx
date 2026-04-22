import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// AUTH
import Authentication from "./Authentication/Authenticate";

// CITIZEN
import Dashboard from "./pages/citizens/Dashboard";
import CreateGrievance from "./pages/citizens/CreateGrievance";
import Complaints from "./pages/citizens/Complaints";
import Profile from "./pages/citizens/Profile";

// ADMIN
import AdminDashboard from "./pages/admin/Dashboard";
import GrievanceReports from "./pages/admin/GrievanceReports";
import AdminNotifications from "./pages/admin/AdminNotifications";

// DEPARTMENT
import DepartmentDashboard from "./pages/department/Dashboard";
import AssignedComplaints from "./pages/department/AssignedComplaints";
import DepartmentProfile from "./pages/department/DepartmentProfile";

// OFFICER
import OfficerDashboard from "./pages/officer/Dashboard";
import OfficerTasks from "./pages/officer/Tasks";
import OfficerProfile from "./pages/officer/Profile";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* AUTH */}
      <Route path="/"       element={<Authentication />} />
      <Route path="/login"  element={<Authentication />} />
      <Route path="/signup" element={<Authentication />} />

      {/* CITIZEN */}
      <Route path="/dashboard"            element={<ProtectedRoute allowedRoles={["user"]}><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/create"     element={<ProtectedRoute allowedRoles={["user"]}><CreateGrievance /></ProtectedRoute>} />
      <Route path="/dashboard/complaints" element={<ProtectedRoute allowedRoles={["user"]}><Complaints /></ProtectedRoute>} />
      <Route path="/dashboard/profile"    element={<ProtectedRoute allowedRoles={["user"]}><Profile /></ProtectedRoute>} />

      {/* ADMIN */}
      <Route path="/admin"                element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/grievances"     element={<ProtectedRoute allowedRoles={["admin"]}><GrievanceReports /></ProtectedRoute>} />
      <Route path="/admin/notifications"  element={<ProtectedRoute allowedRoles={["admin"]}><AdminNotifications /></ProtectedRoute>} />

      {/* DEPARTMENT */}
      <Route path="/department"             element={<ProtectedRoute allowedRoles={["department"]}><DepartmentDashboard /></ProtectedRoute>} />
      <Route path="/department/complaints"  element={<ProtectedRoute allowedRoles={["department"]}><AssignedComplaints /></ProtectedRoute>} />
      <Route path="/department/profile"     element={<ProtectedRoute allowedRoles={["department"]}><DepartmentProfile /></ProtectedRoute>} />

      {/* OFFICER */}
      <Route path="/officer"          element={<ProtectedRoute allowedRoles={["officer"]}><OfficerDashboard /></ProtectedRoute>} />
      <Route path="/officer/tasks"    element={<ProtectedRoute allowedRoles={["officer"]}><OfficerTasks /></ProtectedRoute>} />
      <Route path="/officer/profile"  element={<ProtectedRoute allowedRoles={["officer"]}><OfficerProfile /></ProtectedRoute>} />
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
