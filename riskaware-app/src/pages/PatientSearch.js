import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Login.css";

function PatientSearch() {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState("");

  const handleSearch = () => {
    if (patientId.trim()) {
      navigate("/dashboard");
    } else {
      alert("Please enter a Patient ID.");
    }
  };

  return (
    <div className="container">
      <div className="login-wrapper">
        <h2>RiskAware Health AI Agent</h2>
        <div className="login-box">
          <h3>Search Patient</h3>
          <label>Patient ID</label>

          
          <input
            type="text"
            placeholder="Enter Patient ID"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          />
          <button className="btn" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

export default PatientSearch;
