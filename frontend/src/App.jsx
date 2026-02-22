import { BrowserRouter, Routes, Route } from "react-router-dom";
import Authentication from "./Authentication/Authenticate";
import Dashboard from "./User/Dashboard";
import GrievanceForm from "./components/GrievanceForm";
import Status from "./User/Status";
import Profile from "./User/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login / Signup */}
        <Route path="/" element={<Authentication />} />
        <Route path="/login" element={<Authentication />} />
        <Route path="/signup" element={<Authentication />} />

        {/* Dashboard with Nested Routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<GrievanceForm />} />       
          <Route path="grievance" element={<GrievanceForm />} />
          <Route path="status" element={<Status />} />
          <Route path="profile" element={<Profile />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
