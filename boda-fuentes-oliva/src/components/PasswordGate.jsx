import React, { useState } from 'react';
import '../styles/PasswordGate.css';
import { getGuestByPassword } from '../lib/supabase';
import { validatePassword } from '../utils/validation';

const PasswordGate = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const authStorageKey = 'inviteNewAuth';

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.error);
        setLoading(false);
        return;
      }

      const normalizedPassword = passwordValidation.sanitized.toLowerCase();
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
        setError('Contraseña incorrecta. Por favor, verifica tu invitación.');
        setPassword('');
      }
    } catch (err) {
      setError('Error al validar contraseña. Intenta de nuevo.');
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
              className={`password-input ${error ? 'error' : ''}`}
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

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
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
