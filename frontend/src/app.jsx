import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router";
import HomePage from "./HomePage";
import Loginpage from "./pages/Loginpage";
import SignupPage from "./pages/SignupPage";
import { currUser } from "./lib/api";
import GithubConnectPage from "./pages/GithubConnectPage";

const App = () => {
  const [user, setUser] = useState(null);

  const curruserData = async () => {
    try {
      const res = await currUser();
      setUser(res.user);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    curruserData();
  }, []);

  useEffect(() => {
    if (user) {
      console.log("Curr user github connected or not: " + user.githubConnected);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/connect-github" element={<GithubConnectPage />} />
      </Routes>
    </div>
  );
};

export default App;
