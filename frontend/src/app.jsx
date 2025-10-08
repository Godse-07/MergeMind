import React from "react";
import { Route, Routes } from "react-router";
import DemoPage from "./pages/DemoPage";
import HomePage from "./HomePage";
import Loginpage from "./pages/Loginpage";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route
          path="/"
          element={
            <HomePage />
          }
        />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/login" element={<Loginpage />}/>
      </Routes>
    </div>
  );
};

export default App;
