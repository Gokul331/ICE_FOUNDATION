import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Auth from './Auth';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { from, course } = location.state || {};

  const handleLoginSuccess = () => {
    // Redirect to the original destination if available
    if (from) {
      navigate(from, { state: { course } });
    } else {
      navigate('/');
    }
  };

  return <Auth initialTab="login" onLoginSuccess={handleLoginSuccess} />;
}

export default Login;
