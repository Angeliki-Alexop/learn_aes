import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Train from "./pages/Train";
import LearnMore from "./pages/LearnMore";
import StepByStep from "./pages/StepByStep";
import Test from "./pages/Test";
// import Incremental from './pages/Incremental';
import "./styles/styles.css";
function App() {
  return (
    <Router basename="/learn_aes">
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Navbar />
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/step-by-step" replace />} />
            <Route path="/train" element={<Train />} />
            <Route path="/step-by-step" element={<StepByStep />} />
            <Route path="/LearnMore" element={<LearnMore />} />
            <Route path="/test" element={<Test />} />
            {/* <Route path="/incremental" element={<Incremental />} /> */}
          </Routes>
        </Box>
        <Footer />
      </Box>
    </Router>
  );
}
export default App;
