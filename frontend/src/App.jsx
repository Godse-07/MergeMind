import { Route, Routes } from "react-router";
import HomePage from "./HomePage";
import Loginpage from "./pages/Loginpage";
import SignupPage from "./pages/SignupPage";
import GithubConnectPage from "./pages/GithubConnectPage";
import DashboardPage from "./pages/DashboardPage";
import ConnectRepository from "./pages/ConnectRepository";
import RepositoryPage from "./pages/RepositoryPage";
import PrAnalysisPage from "./pages/PrAnalysisPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Docs from "./pages/Docs";
import Forgetpasswordpage from "./pages/Forgetpasswordpage";
import OTPPage from "./pages/OTPPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SettingsPage from "./pages/SettingsPage";
import SignupOTPPage from "./pages/SignupOTPPage";

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-50 flex flex-col">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/connect-github"
          element={
            <ProtectedRoute>
              <GithubConnectPage />
            </ProtectedRoute>
          }
        />
        <Route path="/signup-otp" element={<SignupOTPPage />} />
        <Route path="/forgot-password" element={<Forgetpasswordpage />} />
        <Route path="/otp" element={<OTPPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/connect-repository"
          element={
            <ProtectedRoute>
              <ConnectRepository />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repository/:repoName"
          element={
            <ProtectedRoute>
              <RepositoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repository/:repoName/pr/:prNumber"
          element={
            <ProtectedRoute>
              <PrAnalysisPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/docs"
          element={
            <ProtectedRoute>
              <Docs />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
