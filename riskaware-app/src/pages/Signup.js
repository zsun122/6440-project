import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/Login.css";

function Signup() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="login-wrapper">
        <h2>RiskAware Health AI Agent</h2>
        <div className="login-box">
          <h3>Sign Up</h3>
          <label>username</label>
          <input type="text" placeholder="Choose a username" />
          <label>email</label>
          <input type="email" placeholder="Enter your email" />
          <label>password</label>
          <input type="password" placeholder="Create a password" />
          <button className="btn">Create Account</button>
          <button className="btn" onClick={() => navigate("/")}>Already have an account?</button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
