import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Colleges from './components/Colleges';
import CollegeDetail from './components/CollegeDetail';
import ApplicationForm from './components/ApplicationForm';
import Contact from './components/Contact';
import './App.css';
import MyApplications from './components/MyApplications';
import ApplicationDetail from './components/ApplicationDetail';
import Courses from './components/Courses';

function App() {
  return (

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/colleges" element={<Colleges />} />
      <Route path="/colleges/:id" element={<CollegeDetail />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/application-form" element={<ApplicationForm />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/my-applications" element={<MyApplications />} />
      <Route path="/applications/:id" element={<ApplicationDetail />} />
    </Routes>

  );
}

export default App;
