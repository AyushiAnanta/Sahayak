import { BrowserRouter, Routes, Route } from "react-router-dom";

// AUTH
import Authentication from "./Authentication/Authenticate";

// CITIZEN PAGES
import Dashboard from "./pages/citizens/Dashboard";
import CreateGrievance from "./pages/citizens/CreateGrievance";
import Complaints from "./pages/citizens/Complaints";

// OPTIONAL (if still using)
import Profile from "./pages/citizens/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route path="/" element={<Authentication />} />
        <Route path="/login" element={<Authentication />} />
        <Route path="/signup" element={<Authentication />} />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* CITIZEN ROUTES */}
        <Route path="/dashboard/create" element={<CreateGrievance />} />
        <Route path="/dashboard/complaints" element={<Complaints />} />

        {/* OPTIONAL */}
        <Route path="/dashboard/profile" element={<Profile />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;