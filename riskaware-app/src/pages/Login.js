import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/Login.css";

function Login() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="login-wrapper">
        <h2>RiskAware Health AI Agent</h2>
        <div className="login-box">
          <h3>Login</h3>
          <label>username</label>
          <input type="text" placeholder="Type your username" />
          <label>password</label>
          <input type="password" placeholder="Type your password" />
          <button className="btn" onClick={() => navigate("/dashboard")}>Login</button>
          <button className="btn" onClick={() => navigate("/signup")}>Sign up</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
