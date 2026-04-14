import { BrowserRouter, Routes, Route } from "react-router-dom";

// AUTH
import Authentication from "./Authentication/Authenticate";

// CITIZEN PAGES
import Dashboard from "./pages/citizens/Dashboard";
import CreateGrievance from "./pages/citizens/CreateGrievance";
import Complaints from "./pages/citizens/Complaints";

// OPTIONAL (if still using)
import Status from "./User/Status";
import Profile from "./User/Profile";

import ManageUsers          from "./pages/admin/ManageUsers";
import GrievanceReports     from "./pages/admin/GrievanceReports";
import CommunicateDepartments from "./pages/admin/ManageDepartments";
import AdminDashboard       from "./pages/admin/Dashboard";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route path="/" element={<Authentication />} />
        <Route path="/login" element={<Authentication />} />
        <Route path="/signup" element={<Authentication />} />

        {/* CITIZEN ROUTES */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/create" element={<CreateGrievance />} />
        <Route path="/dashboard/complaints" element={<Complaints />} />
        <Route path="/dashboard/profile" element={<Profile />} />

        {/* Admin Routes */}
        <Route path="/admin"              element={<AdminDashboard />} />
        <Route path="/admin/users"        element={<ManageUsers />} />
        <Route path="/admin/grievances"   element={<GrievanceReports />} />
        <Route path="/admin/communicate"  element={<CommunicateDepartments />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;