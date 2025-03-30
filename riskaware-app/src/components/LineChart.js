import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import "../style/Chart.css";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

function LineChart({ disease, onClose }) {
  // replace later
  const chartDataMap = {
    "Heart Disease": [30, 45, 55, 50],
    "Cancer": [15, 20, 22, 21],
    "Stroke": [20, 58, 40, 33],
    "Diabetes": [8, 6, 5, 4],
  };

  // for demo
  const data = {
    labels: ["1/10/2025", "1/23/2025", "2/13/2025", "3/13/2025"],
    datasets: [
      {
        label: `${disease} Risk Score`,
        data: chartDataMap[disease] || [],
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
        tension: 0.2,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: { beginAtZero: true },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
          {disease} Risk Score Trend
        </h3>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

export default LineChart;
