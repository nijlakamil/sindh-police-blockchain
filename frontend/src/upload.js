import React, { useState } from "react";
import axios from "axios";
import { FaSpinner } from "react-icons/fa6";
import { Link } from "react-router-dom";
import sindhpolicelogo from "./sindhpolicelogo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";
import "./upload.css";  // Make sure this is correctly linked

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");

  const handleUpload = async () => {
    if (!file) {
      alert("⚠️ Please select a file first.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post("http://localhost:5000/upload", formData);
      setIpfsHash(response.data.ipfsHash);
    } catch (error) {
      console.error("❌ Upload Error:", error);
      alert("❌ Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="gradient-bg d-flex flex-column align-items-center justify-content-center text-dark p-4">
      {/* Floating Elements for Animation */}
      <div className="floating-element"></div>
      <div className="floating-element"></div>
      <div className="floating-element"></div>
      <div className="floating-element"></div>

      {/* Logo */}
      <img src={sindhpolicelogo} alt="Sindh Police Logo" className="mb-4 animate__animated animate__fadeInDown" style={{ width: "170px", height: "170px" }} />

      {/* Upload Card */}
      <div className="upload-card card p-4 shadow-lg animate__animated animate__fadeInUp">
        <h2 className="text-center text-primary mb-4">Upload Image</h2>

        <div className="mb-3">
          <label className="form-label">Select an image</label>
          <input type="file" className="form-control" onChange={(e) => setFile(e.target.files[0])} />
          <div className="text-muted">{file ? file.name : "No file selected"}</div>
        </div>

        <button onClick={handleUpload} disabled={uploading} className="btn btn-primary w-100">
          {uploading ? <FaSpinner className="spinner-border spinner-border-sm me-2" /> : "Upload"}
        </button>

        {ipfsHash && (
          <div className="alert alert-success mt-3 text-center">
            <p className="fw-bold">✅ Upload Successful!</p>
            <a href={`https://ipfs.io/ipfs/${ipfsHash}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none text-primary fw-bold">
              View Image on IPFS
            </a>
          </div>
        )}

        <Link to="/verify" className="btn btn-outline-secondary w-100 mt-3">Go to Verify Image</Link>
      </div>
    </div>
  );
};

export default Upload;
