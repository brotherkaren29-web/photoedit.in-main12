import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdsenseLoader from "./components/AdsenseLoader";
import Home from "./pages/Home";
import Editor from "./pages/Editor";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Disclaimer from "./pages/Disclaimer";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <AdsenseLoader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
