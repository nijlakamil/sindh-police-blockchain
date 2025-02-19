import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Upload from "./upload";
import Verify from "./verify";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Upload />} />
        <Route path="/verify" element={<Verify />} />
      </Routes>
    </Router>
  );
};

export default App;
