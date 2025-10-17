import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navigation.css';

const Navigation = ({ showInviteLink = true }) => {
  const location = useLocation();
  
  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/home" className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`}>
          Save The Date
        </Link>
        {showInviteLink && (
          <Link to="/invite" className={`nav-link ${location.pathname === '/invite' ? 'active' : ''}`}>
            Invitación
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
