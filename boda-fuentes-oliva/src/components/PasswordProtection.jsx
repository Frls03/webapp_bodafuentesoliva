import React, { useState } from 'react';
import '../styles/PasswordProtection.css';

const PasswordProtection = ({ onPasswordCorrect, children }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Contraseña por defecto - puedes cambiarla
  const correctPassword = 'boda2025';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsAuthenticated(true);
      onPasswordCorrect && onPasswordCorrect();
    } else {
      setError('Contraseña incorrecta. Inténtalo de nuevo.');
      setPassword('');
    }
  };

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="password-overlay">
      <div className="password-modal">
        <div className="password-header">
          <h2>🔒 Acceso Restringido</h2>
          <p>Ingresa la contraseña para ver la invitación</p>
        </div>
        
        <form onSubmit={handleSubmit} className="password-form">
          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="password-input"
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="password-btn">
            Acceder
          </button>
        </form>
        
        <div className="password-hint">
          <small>💡 Pista: Es el año de la boda</small>
        </div>
      </div>
    </div>
  );
};

export default PasswordProtection;
