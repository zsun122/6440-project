import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../style/Dashboard.css";

function UpdateInfo() {
  const navigate = useNavigate();
  const location = useLocation();
  const patientId = location.state?.patientId;

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    birthDate: "",
    gender: "",
    race: "",
    state: "",
    // cancerGeneticRisk: "",
    // cancerHistory: "",
  });

  const statesList = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
    "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
    "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
    "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
    "West Virginia", "Wisconsin", "Wyoming"
  ];

  useEffect(() => {
    if (patientId) {
      fetch(`http://localhost:5000/synthea_patient_info?user_id=${patientId}`)
        .then((res) => res.json())
        .then((data) => {
          const clean = (str) => str?.replace(/[^a-zA-Z\s\-']/g, "") || "";

          setFormData({
            firstName: clean(data?.FIRST || ""),
            middleName: clean(data?.MIDDLE || ""),
            lastName: clean(data?.LAST || ""),
            birthDate: data?.BIRTHDATE || "",
            gender: data?.GENDER || "",
            race: data?.RACE || "",
            state: data?.STATE || "",
            // cancerGeneticRisk: data?.CANCER_GENETIC_RISK || "",
            // cancerHistory: data?.CANCER_HISTORY || "",
          });
        })
    }
  }, [patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let cleanedValue;

    // const isName = name === "firstName" || name === "middleName" || name === "lastName";
    
    cleanedValue = value.replace(/[^a-zA-Z\s\-']/g, "");
    setFormData((prev) => ({ ...prev, [name]: cleanedValue }));
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
  
    fetch("http://localhost:5000/update_patient_info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, ...formData }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          alert(data.message);
          navigate("/dashboard", { state: { patientId } });
        } else {
          alert("Update failed.");
        }
      })
  };
  

  return (
    <div className="container">
      <div className="dashboard-wrapper">
        <div className="dashboard-box">
          <h3>Update Patient Information</h3>

          <button
            className="btn"
            style={{ position: "absolute", top: "20px", right: "20px", width: "auto", padding: "6px 14px" }}
            onClick={() => navigate("/dashboard", { state: { patientId } })}
          >
            Cancel
          </button>

          <form onSubmit={handleSubmit} className="update-form">
            <div className="form-group">
              <label>Patient ID</label>
              <input type="text" value={patientId} disabled />
            </div>

            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Middle Name</label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Birth Date</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label>Race</label>
              <input
                type="text"
                name="race"
                value={formData.race}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <select name="state" value={formData.state} onChange={handleChange}>
                <option value="">Select State</option>
                {statesList.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* <div className="form-group">
              <label>Cancer Genetic Risk</label>
              <input
                type="text"
                name="cancerGeneticRisk"
                value={formData.cancerGeneticRisk}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Cancer History</label>
              <input
                type="text"
                name="cancerHistory"
                value={formData.cancerHistory}
                onChange={handleChange}
              />
            </div> */}

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
