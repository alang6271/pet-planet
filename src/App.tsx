import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Planets from "@/pages/Planets";
import PetSpace from "@/pages/PetSpace";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/planets" element={<Planets />} />
        <Route path="/pets/:id" element={<PetSpace />} />
      </Routes>
    </Router>
  );
}
