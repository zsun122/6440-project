import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../style/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const patientId = location.state?.patientId;

  const [patientData, setPatientData] = useState(null);

  useEffect(() => {
    if (patientId) {
      fetch(`https://6440-project-production.up.railway.app/synthea_patient_info?user_id=${patientId}`)
        .then((res) => res.json())
        .then((data) => setPatientData(data))
        .catch((err) => console.error("Error fetching patient data:", err));
    }
  }, [patientId]);

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
            <p><strong>Patient_id:</strong> {patientId || "N/A"}</p>

            <p><strong>First Name:</strong> {patientData?.FIRST ? patientData.FIRST.replace(/\d/g, '') : "N/A"}</p>

            <p><strong>Middle Name:</strong> {patientData?.MIDDLE ? patientData.MIDDLE.replace(/\d/g, '') : "N/A"}</p>

            <p><strong>Last Name:</strong> {patientData?.LAST ? patientData.LAST.replace(/\d/g, '') : "N/A"}</p>

            {/* year - month - day*/}
            <p><strong>Birth Date:</strong> {patientData?.BIRTHDATE || "N/A"}</p>

          <p><strong>Age:</strong> {patientData?.AGE ?? "N/A"}</p>

            {/* 8532 - female, 8507 - male*/}
            <p><strong>Gender:</strong> {patientData?.GENDER === "M"? "Male": patientData?.GENDER === "F"? "Female": "N/A"}</p>

            {/* race source value*/}
            <p><strong>Race:</strong> {patientData?.RACE || "N/A"}</p>

            <p><strong>State:</strong> {patientData?.STATE || "N/A"}</p>

            {/* <p><strong>Cancer Genetic Risk:</strong> {patientData?.CANCER_GENETIC_RISK || "N/A"}</p>

            <p><strong>Cancer History:</strong> {patientData?.CANCER_HISTORY || "N/A"}</p> */}

            {/* <p><strong>Medical History:</strong></p>
            <p><strong>Family History:</strong></p>
            <p><strong>Physical Exam:</strong></p> */}

            {/* <p><strong>Last Updated:</strong></p> */}
          </div>

          <div className="action-buttons">
            <button className="btn" onClick={() => navigate("/score", { state: { patientId } })}>
              Evaluate risk score
            </button>
            <button className="btn" onClick={() => navigate("/update", { state: { patientId } })}>
              Update information
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
