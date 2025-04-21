import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Login.css";

function PatientSearch() {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState("");
  const [patientIds, setPatientIds] = useState([]);

  useEffect(() => {
    fetch("https://6440-project-production.up.railway.app/synthea_patient_ids")
      .then((res) => res.json())
      .then((data) => setPatientIds(data))
      .catch((err) => console.error("Error fetching patient IDs:", err));
  }, []);

  const handleSearch = () => {
    if (patientId) {
      navigate("/dashboard", { state: { patientId } });
    } else {
      alert("Please select a Patient ID.");
    }
  };

  return (
    <div className="container">
      <div className="login-wrapper">
        <h2>RiskAware Health AI Agent</h2>
        <div className="login-box">
          <h3>Search Patient</h3>
          <label>Patient ID</label>
          <select value={patientId} onChange={(e) => setPatientId(e.target.value)}>
            <option value="">-- Select a Patient ID --</option>
            {patientIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>

          <button className="btn" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

export default PatientSearch;
