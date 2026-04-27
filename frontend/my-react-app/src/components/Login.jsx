import { useNavigate, useLocation } from 'react-router-dom';
import Auth from './Auth';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { from, course, college, quotaType } = location.state || {};

  const handleLoginSuccess = () => {
    // If we were trying to access a page that requires login
    if (from) {
      // If coming from college detail with a specific course, go to application form
      if (course && college) {
        navigate('/application-form', { state: { college, course, quotaType: quotaType || 'management' } });
      } else {
        navigate(from);
      }
    } else {
      navigate('/');
    }
  };

  return <Auth initialTab="login" onLoginSuccess={handleLoginSuccess} />;
}

export default Login;
