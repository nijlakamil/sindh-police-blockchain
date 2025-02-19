import React, { useState } from "react";
import axios from "axios";
import { FaSpinner } from "react-icons/fa6";
import { Link } from "react-router-dom";
import sindhpolicelogo from "./sindhpolicelogo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";
import "./verify.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://sindh-police-blockchain-production.up.railway.app";

const Verify = () => {
  const [file, setFile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState("");

  // Function to compute SHA-256 hash of the uploaded file
  const computeFileHash = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setVerificationResult("");

    if (selectedFile) {
      setVerifying(true);
      try {
        // Compute the file hash
        const fileHash = await computeFileHash(selectedFile);
        console.log("Computed File Hash:", fileHash);

        // Send the hash to the backend for verification
        const response = await axios.post(`${API_BASE_URL}/verify`, { fileHash });

        // Handle verification response
        if (response.data.match) {
          setVerificationResult("✅ Image is authentic and matches the stored hash.");
        } else {
          setVerificationResult("❌ Image does NOT match the stored version.");
        }
      } catch (error) {
        console.error("Verification Error:", error);
        setVerificationResult("⚠️ Unable to verify. Please try again.");
      } finally {
        setVerifying(false);
      }
    }
  };

  return (
    <div className="gradient-bg d-flex flex-column align-items-center justify-content-center min-vh-100 text-dark p-4">
      <img src={sindhpolicelogo} alt="Sindh Police Logo" className="mb-4 animate__animated animate__fadeInDown" style={{ width: "170px", height: "170px" }} />

      <div className="verify-card card p-4 shadow-lg animate__animated animate__fadeInUp">
        <h2 className="text-center text-danger mb-4">Verify Image</h2>

        <div className="mb-3">
          <label className="form-label">Select an image</label>
          <input type="file" className="form-control" onChange={handleFileChange} />
          <div className="text-muted">{file ? file.name : "No file selected"}</div>
        </div>

        {verifying && (
          <div className="text-center text-warning mt-2">
            <FaSpinner className="spinner-border spinner-border-sm me-2" /> Verifying...
          </div>
        )}

        {verificationResult && (
          <div className={`alert mt-3 text-center ${verificationResult.includes("✅") ? "alert-success" : "alert-danger"}`}>
            {verificationResult}
          </div>
        )}

        <Link to="/" className="btn btn-outline-secondary w-100 mt-3">
          Go to Upload Image
        </Link>
      </div>
    </div>
  );
};

export default Verify;
