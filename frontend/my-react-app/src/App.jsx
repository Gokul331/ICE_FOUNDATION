import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Colleges from './components/Colleges';
import CollegeDetail from './components/CollegeDetail';
import CollegeSuggestion from './components/CollegeSuggestion';
import Profile from './components/Profile';
import ApplicationForm from './components/ApplicationForm';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Contact from './components/Contact';
import './App.css';
import MyApplications from './components/MyApplications';
import ApplicationDetail from './components/ApplicationDetail';

function App() {
  return (
   
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/colleges" element={<Colleges />} />
        <Route path="/colleges/:id" element={<CollegeDetail />} />
        <Route path="/college-suggestion" element={<CollegeSuggestion />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/application-form" element={<ApplicationForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token/" element={<ResetPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/applications/:id" element={<ApplicationDetail />} />
      </Routes>
  
  );
}

export default App;
