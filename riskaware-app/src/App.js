import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ScorePage from "./pages/ScorePage";
import UpdateInfo from "./pages/UpdateInfo";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/score" element={<ScorePage />} />
      <Route path="/update" element={<UpdateInfo />} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;
