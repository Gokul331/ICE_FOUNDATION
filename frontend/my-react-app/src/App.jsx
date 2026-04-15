import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Colleges from './components/Colleges';
import CollegeDetail from './components/CollegeDetail';
import CollegeSuggestion from './components/CollegeSuggestion';
import Profile from './components/Profile';
import Login from './components/Login';
import Register from './components/Register';
import Contact from './components/Contact';
import './App.css';

function App() {
  return (
   
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/colleges" element={<Colleges />} />
        <Route path="/colleges/:id" element={<CollegeDetail />} />
        <Route path="/college-suggestion" element={<CollegeSuggestion />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
  
  );
}

export default App;
