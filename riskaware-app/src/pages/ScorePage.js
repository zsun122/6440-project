import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../style/Dashboard.css";
import "../style/Chart.css";
import LineChart from "../components/LineChart";

function ScorePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const patientId = location.state?.patientId;

  const [selectedDisease, setSelectedDisease] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [diseaseData, setDiseaseData] = useState([]);
  // const [tableLoading, setTableLoading] = useState(true); progree view?
  const [patientName, setPatientName] = useState("");



  useEffect(() => {
    if (patientId) {
      fetch("https://6440-project-production.up.railway.app/get_scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      })
        .then((res) => res.json())
        .then((data) => {
          const formatted = Object.entries(data).map(([name, scoreDict]) => {
            const sortedDates = Object.keys(scoreDict).sort(); 
            const latestDate = sortedDates[sortedDates.length -1];
            // const latestDate = sortedDates[-1];
            const latestScore = parseFloat(scoreDict[latestDate].toFixed(3));

            const trendData = sortedDates.map(date => ({
              date,
              value: scoreDict[date],
            }));

            let trend = "unchanging";
            // var trend = "unchanging";

            if (sortedDates.length >= 2) {
              const secondlastDate = sortedDates[sortedDates.length -2];
              const secondlatestScore = parseFloat(scoreDict[secondlastDate].toFixed(3));

              if (secondlatestScore > latestScore) {
                trend = "Decreasing"
              } else if (secondlatestScore < latestScore) {
                trend = "Increasing"
              } else {
                trend = "Unchanging";
              }
            }
          
            return {
              name,
              score: latestScore.toFixed(3),
              trend,
              trendData,
            };
          });

          setDiseaseData(formatted);
        })
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      fetch(`https://6440-project-production.up.railway.app/synthea_patient_info?user_id=${patientId}`)
        .then(res => res.json())
        .then(data => {
          setPatientName(data.FIRST || "");
        })
    }
  }, [patientId]);

  const getRecommendations = async () => {
    setLoading(true);
  
    try {
      const heart = parseFloat(diseaseData.find(d => d.name === "Heart Disease")?.score || 0);
      const diabetes = parseFloat(diseaseData.find(d => d.name === "Diabetes")?.score || 0);
      const stroke = parseFloat(diseaseData.find(d => d.name === "Stroke")?.score || 0);
      const cancer = parseFloat(diseaseData.find(d => d.name === "Cancer")?.score || 0);
  
      const requestBody = {heart, diabetes, stroke, cancer };
  
      const response = await fetch("https://6440-project-production.up.railway.app/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
  
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      alert("cannot  get the recommendation.!");
    }
  
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="dashboard-wrapper">
        <div className="dashboard-box">
          <p style={{ textAlign: "center", marginBottom: "20px" }}>
          Based on the health information, here is the current risk assessment for common diseases for{" "}
          <strong>{patientName}</strong>:
            </p> 
          {/* can insert name */}

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
            <thead>
              <tr>
                <th style={thStyle}>Disease</th>
                <th style={thStyle}>Latest Risk Score</th>
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
                      onClick={() => setSelectedDisease(d)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Recommendation section */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <button className="btn" onClick={ getRecommendations} disabled={loading}>
              {loading ? "Loading..." : "Get Personalized Recommendations"}
            </button>
          </div>

          {recommendations.length >0 && (
            <div style={{ background: "#d4eaff", borderRadius: "10px", padding: "15px", marginBottom: "20px" }}>
              <p><strong>Recommendations:</strong></p>
              <ul className="no-bullet">
                {recommendations.map((rec, index) => (
                  <li key={index}>{rec.replace("-", "").replace(/\*\*/g, "").trim()}</li>
                ))}
              </ul>
            </div>
          )}

            <div style={{ textAlign: "center" }}>
            <button className="btn" onClick={() => navigate("/*")}>
              Back to Search Page
            </button>
          </div>
        </div>
      </div>

      {selectedDisease && (
        <LineChart
        disease={selectedDisease.name}
        trendData={selectedDisease.trendData}
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
  borderBottom: "1px solid #ccc",
};


export default ScorePage;
