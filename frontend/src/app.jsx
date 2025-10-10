import { Route, Routes } from "react-router";
import HomePage from "./HomePage";
import Loginpage from "./pages/Loginpage";
import SignupPage from "./pages/SignupPage";
import GithubConnectPage from "./pages/GithubConnectPage";
import DashboardPage from "./pages/DashboardPage";

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-50 flex flex-col">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/connect-github" element={<GithubConnectPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </div>
  );
};

export default App;
