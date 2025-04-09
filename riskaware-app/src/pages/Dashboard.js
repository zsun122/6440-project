import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="container">

      <div className="dashboard-wrapper">
        <div className="dashboard-box">
          <h3>Patient information</h3>

          <button
            className="btn"
            style={{ position: "absolute", top: "20px", right: "20px", width: "auto", padding: "6px 14px" }}
            onClick={() => navigate("/")}
          >
            Logout
          </button>

          <div className="patient-info">
            <p><strong>Patient_id:</strong></p>

            {/* year - month - day*/}
            <p><strong>Birth Date:</strong></p>

            {/* 8532 - female, 8507 - male*/}
            <p><strong>Gender:</strong></p>

            {/* race source value*/}
            <p><strong>Race:</strong></p>

            <p><strong>Medical History:</strong></p>
            <p><strong>Family History:</strong> </p>
            <p><strong>Physical Exam:</strong> </p>

            {/* sample-person : updatedate*/}
            <p><strong>Last Updated:</strong> </p>
          </div>

          <div className="action-buttons">
            <button className="btn" onClick={() => navigate("/score")}>Evaluate risk score</button>
            <button className="btn" onClick={() => navigate("/update")}>Update information</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
