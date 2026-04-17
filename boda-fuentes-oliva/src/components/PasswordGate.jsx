import React, { useState } from 'react';
import '../styles/PasswordGate.css';
import { getGuestByPassword } from '../lib/supabase';

const PasswordGate = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [showServiceError, setShowServiceError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const authStorageKey = 'inviteNewAuth';
  const serviceErrorTitle = 'Estamos presentando una falla temporal';
  const serviceErrorText = 'En este momento no pudimos validar tu acceso. Por favor intenta nuevamente más tarde. Gracias por tu paciencia.';

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setShowServiceError(false);
    setLoading(true);

    try {
      const normalizedPassword = password.trim().toLowerCase();
      const guest = await getGuestByPassword(normalizedPassword);

      if (guest) {
        sessionStorage.setItem('guestData', JSON.stringify(guest));
        localStorage.setItem(
          authStorageKey,
          JSON.stringify({ guest, lastActive: Date.now() })
        );
        onAuthenticated(guest);
        setPassword('');
      } else {
        setShowServiceError(true);
        setPassword('');
      }
    } catch (err) {
      setShowServiceError(true);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-gate notranslate" translate="no">
      <div className="password-gate-overlay"></div>
      <div className="password-gate-content">
        <div className="password-gate-header">
          <h1 className="gate-title">¡Nos casamos!</h1>
          <div className="couple-names-gate">
            <span className="bride-name">Majito</span>
            <span className="ampersand">&</span>
            <span className="groom-name">Pablo</span>
          </div>
          <p className="gate-subtitle">Creemos que lo mejor de la felicidad es cuando se comparte con las personas que amas.</p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="password-form">
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              className={`password-input ${showServiceError ? 'error' : ''}`}
              autoComplete="off"
              autoFocus
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          {showServiceError && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>
                <strong>{serviceErrorTitle}</strong>
                <br />
                {serviceErrorText}
              </span>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Verificando...' : 'Ver mi invitación'}
          </button>
        </form>

        <div className="gate-help">
          <p className="help-text">
            ¿No tienes tu contraseña? Revisa el mensaje de WhatsApp que te llegó o contacta a los novios.
          </p>
        </div>

        <div className="decorative-element">
          <div className="heart-divider">
            <div className="line"></div>
            <span className="heart" aria-hidden="true"></span>
            <div className="line"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordGate;
