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

function LineChart({ disease, trendData, onClose }) {
  const data = {
    labels: trendData.map(entry => entry.date),
    datasets: [
      {
        label: `${disease} Risk Score`,
        data: trendData.map(entry => entry.value),
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
        tension: 0.2,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const maxScore = Math.max(...trendData.map(entry => entry.value), 0.01);
  const options = {
    responsive: true,
    scales: {
      y: { beginAtZero: true, max: maxScore* 1.1 },
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
