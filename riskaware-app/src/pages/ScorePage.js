import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Dashboard.css";
import "../style/Chart.css";
import LineChart from "../components/LineChart";

function ScorePage() {
  const navigate = useNavigate();
  const [selectedDisease, setSelectedDisease] = useState(null);

  // for demo only
  const diseaseData = [
    { name: "Heart Disease", score: 50, trend: "Decreasing" },
    { name: "Cancer", score: 21, trend: "Stable" },
    { name: "Stroke", score: 33, trend: "Increasing" },
    { name: "Diabetes", score: 4, trend: "Decreasing" },
  ];

  return (
    <div className="container">
      <div className="dashboard-wrapper">
        <div className="dashboard-box">
          <p style={{ textAlign: "center", marginBottom: "20px" }}>
            Based on the health information, here is the current risk assessment for common diseases for the patient:
          </p>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
            <thead>
              <tr>
                <th style={thStyle}>Disease</th>
                <th style={thStyle}>Risk Score</th>
                
                {/* will update later for comparision */}

                <th style={thStyle}>Trend</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {diseaseData.map((d, idx) => (
                <tr key={idx}>
                  <td style={tdStyle}>{d.name}</td>
                  <td style={tdStyle}>{d.score}</td>
                  <td style={tdStyle}>{d.trend}</td>
                  <td style={tdButtonStyle}>
                    <button
                      className="btn"
                      style={{ padding: "6px 12px", width: "auto" }}
                      onClick={() => setSelectedDisease(d.name)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ background: "#d4eaff", borderRadius: "10px", padding: "15px", marginBottom: "20px" }}>
            <p><strong>Recommendation:</strong></p>
            <ul>
              <li>drink more water</li>
            </ul>
          </div>

          <div style={{ textAlign: "center" }}>
            <button className="btn" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* chart */}
      {selectedDisease && (
        <LineChart
          disease={selectedDisease}
          onClose={() => setSelectedDisease(null)}
        />
      )}
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "10px",
  borderBottom: "1px solid #ccc",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #ccc",
};

const tdButtonStyle = {
  padding: "10px",
  backgroundColor: "#d4eaff",
  borderBottom: "1px solid #ccc",
};

export default ScorePage;
