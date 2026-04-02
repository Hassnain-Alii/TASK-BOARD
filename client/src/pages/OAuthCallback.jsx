import { useEffect,  } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/taskApi';

// This page handles the redirect from Google OAuth
// URL: /auth/callback?token=XXXXX
const OAuthCallback = () => {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (!token) { navigate('/login'); return; }

    localStorage.setItem('token', token);

    api.get('/auth/me')
      .then(() => {
        // Trigger a re-render of AuthContext by reloading user
        navigate('/board');
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/login?err=oauth_failed');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4 animate-fadeIn">
        <div className="w-12 h-12 border-4 border-white/20 border-t-primary rounded-full animate-spin mx-auto"/>
        <p className="text-slate-400 text-sm">Signing you in with Google...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
