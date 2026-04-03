import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '1rem',
      fontFamily: 'sans-serif',
      background: '#0f0f0f',
      color: '#fff'
    }}>
      <h1 style={{ fontSize: '6rem', margin: 0, opacity: 0.2 }}>404</h1>
      <h2 style={{ margin: 0 }}>Page Not Found</h2>
      <p style={{ opacity: 0.6 }}>The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        style={{
          marginTop: '1rem',
          padding: '0.6rem 1.4rem',
          background: '#6366f1',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 600
        }}
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
