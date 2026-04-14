import { BrowserRouter, Routes, Route } from "react-router-dom";

// AUTH
import Authentication from "./Authentication/Authenticate";

// CITIZEN PAGES
import Dashboard from "./pages/citizens/Dashboard";
import CreateGrievance from "./pages/citizens/CreateGrievance";
import Complaints from "./pages/citizens/Complaints";
import Profile from "./pages/citizens/Profile";

//  DEPARTMENT PAGES
import DepartmentDashboard from "./pages/department/Dashboard";
import AssignedComplaints from "./pages/department/AssignedComplaints";

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

        {/* DEPARTMENT ROUTES */}
        <Route path="/department" element={<DepartmentDashboard />} />
        <Route path="/department/complaints" element={<AssignedComplaints />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;