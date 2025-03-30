import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Dashboard.css";

function UpdateInfo() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientId: "",
    birthDate: "",
    gender: "",
    race: "",
    medicalHistory: "",
    familyHistory: "",
    physicalExam: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Info:", formData);
    navigate("/dashboard");
  };

  return (
    <div className="container">
      <div className="dashboard-wrapper">
        <div className="dashboard-box">
          <h3>Update Patient Information</h3>

          {/* Cancel */}
          <button
            className="btn"
            style={{ position: "absolute", top: "20px", right: "20px", width: "auto", padding: "6px 14px" }}
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>

          {/* Update Form, */}
          <form onSubmit={handleSubmit} className="update-form">
            <div className="form-group">
              <label>Patient ID</label>
              <input type="text"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Birth Date</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="8507">Male</option>
                <option value="8532">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label>Race</label>
              <input
                type="text"
                name="race"
                value={formData.race}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Medical History</label>
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Family History</label>
              <textarea
                name="familyHistory"
                value={formData.familyHistory}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Physical Exam</label>
              <textarea
                name="physicalExam"
                value={formData.physicalExam}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn" style={{ marginTop: "20px" }}>
              Save Information
          </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateInfo;
