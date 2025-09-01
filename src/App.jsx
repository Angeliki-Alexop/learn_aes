import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Train from "./pages/Train";
import LearnMore from "./pages/LearnMore";
import About from "./pages/About";
import StepByStep from "./pages/StepByStep";
// import Incremental from './pages/Incremental';
import "./styles/styles.css";
function App() {
  return (
    <Router basename="/learn_aes">
      <Navbar />
      <Routes>
        <Route path="/" element={<Train />} />
        <Route path="/step-by-step" element={<StepByStep />} />
        <Route path="/LearnMore" element={<LearnMore />} />
        <Route path="/About" element={<About />} />
        {/* <Route path="/incremental" element={<Incremental />} /> */}
      </Routes>
    </Router>
  );
}
export default App;
