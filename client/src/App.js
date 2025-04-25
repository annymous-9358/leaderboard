import React from "react";
import { Routes, Route } from "react-router-dom";

import Leaderboard from "./pages/Leaderboard";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <div className="App">
      <div className="container py-4">
        <Routes>
          <Route path="/" element={<Leaderboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
