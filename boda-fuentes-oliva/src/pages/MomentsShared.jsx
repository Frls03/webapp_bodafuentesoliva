import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MomentsShared.css';
import PasswordGate from '../components/PasswordGate';
import CloudinaryUpload from '../components/CloudinaryUpload';
import { saveGuestMessage } from '../lib/supabase';
import { validateName, validateMessage } from '../utils/validation';

const MomentsShared = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guestData, setGuestData] = useState(null);
  const isWeddingDay = true;

  const [senderName, setSenderName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [messageError, setMessageError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('inviteNewAuth');
    const sessionGuest = sessionStorage.getItem('guestData');

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.guest) {
          setGuestData(parsed.guest);
          setIsAuthenticated(true);
          return;
        }
      } catch {
        localStorage.removeItem('inviteNewAuth');
      }
    }

    if (sessionGuest) {
      try {
        const parsed = JSON.parse(sessionGuest);
        setGuestData(parsed);
        setIsAuthenticated(true);
      } catch {
        sessionStorage.removeItem('guestData');
      }
    }
  }, []);

  const handleAuthenticated = (data) => {
    setGuestData(data);
    setIsAuthenticated(true);
    localStorage.setItem('inviteNewAuth', JSON.stringify({ guest: data, lastActive: Date.now() }));
  };

  const handleBack = () => {
    navigate('/invite');
  };

  const handleSendMessage = async () => {
    const nameValidation = validateName(senderName);
    if (!nameValidation.isValid) {
      setMessageError(nameValidation.error);
      return;
    }

    const messageValidation = validateMessage(messageText);
    if (!messageValidation.isValid) {
      setMessageError(messageValidation.error);
      return;
    }

    setSendingMessage(true);
    setMessageError('');

    try {
      const result = await saveGuestMessage(
        guestData.id,
        nameValidation.sanitized,
        messageValidation.sanitized
      );

      if (!result.success) {
        throw new Error('Error al guardar el mensaje');
      }

      setSenderName('');
      setMessageText('');
      setMessageSent(true);
      setTimeout(() => setMessageSent(false), 5000);
    } catch (error) {
      console.error('Error:', error);
      setMessageError('No se pudo enviar el mensaje. Por favor intenta de nuevo.');
    } finally {
      setSendingMessage(false);
    }
  };

  if (!isAuthenticated) {
    return <PasswordGate onAuthenticated={handleAuthenticated} />;
  }

  if (!isWeddingDay) {
    return (
      <div className="moments-locked-page notranslate" translate="no">
        <div className="moments-locked-card">
          <h1>Momentos compartidos</h1>
          <p>Este espacio estará disponible el día de la boda.</p>
          <button type="button" onClick={handleBack} className="moments-back-btn">
            Volver a la invitación
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="moments-page notranslate" translate="no">
      <header className="moments-hero">
        <h1>Momentos compartidos</h1>
        <p>Comparte tus fotos y mensajes del gran día con nosotros.</p>
      </header>

      <section className="moments-content">
        <div className="moments-text">
          <p>Queremos que vivas el momento junto a nosotros.</p>
          <p className="italic-text">
            Después de la ceremonia, captura esos recuerdos especiales y déjanos una nota que siempre recordaremos.
          </p>
        </div>

        <div className="no-phones-section">
          <div className="no-phones-icon">📵</div>
          <div className="no-phones-text">
            <p>Durante la ceremonia, pedimos que no se usen celulares.</p>
            <p>Vivamos ese instante juntos, sin pantallas.</p>
          </div>
        </div>

        <div className="input-fields">
          <input
            type="text"
            placeholder="Tu nombre"
            className="name-input"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
          />
          <textarea
            placeholder="Tu nota o mensaje"
            className="message-input"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          ></textarea>
        </div>

        <CloudinaryUpload />

        {messageSent && (
          <div className="message-success">✅ ¡Mensaje enviado! Gracias por compartir.</div>
        )}
        {messageError && <div className="message-error">⚠️ {messageError}</div>}

        <div className="action-buttons">
          <button
            type="button"
            className="action-btn message-btn"
            onClick={handleSendMessage}
            disabled={sendingMessage}
          >
            {sendingMessage ? 'Enviando...' : 'Enviar mensaje'}
          </button>
          <button type="button" className="action-btn back-btn" onClick={handleBack}>
            Volver a la invitación
          </button>
        </div>
      </section>
    </div>
  );
};

export default MomentsShared;
