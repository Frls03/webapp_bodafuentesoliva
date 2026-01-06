import React, { useState } from 'react';
import { submitSaveTheDateRSVP } from '../lib/supabase';
import { validateName } from '../utils/validation';
import '../styles/SaveTheDateRSVP.css';

const SaveTheDateRSVP = () => {
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSubmit = async (willAttend) => {
    if (isSubmitting) return;

    // Validar nombre
    const nameValidation = validateName(fullName);
    if (!nameValidation.isValid) {
      alert(nameValidation.error);
      return;
    }

    setIsSubmitting(true);

    const result = await submitSaveTheDateRSVP(nameValidation.sanitized, willAttend);

    if (result.success) {
      setSubmitted(true);
      setResponse(willAttend);
    } else {
      alert('Hubo un error al enviar tu respuesta. Por favor intenta de nuevo.');
    }

    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="std-rsvp-container">
        <div className="std-rsvp-box">
          <div className="std-rsvp-success">
            {response ? (
              <>
                <div className="std-success-icon">✓</div>
                <p className="std-success-text">¡Gracias por confirmar!</p>
                <p className="std-success-subtext">Nos vemos el 3 de mayo</p>
              </>
            ) : (
              <>
                <div className="std-success-icon declined">✗</div>
                <p className="std-success-text">Gracias por avisar</p>
                <p className="std-success-subtext">Esperamos verte en otra ocasión</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="std-rsvp-container">
      <div className="std-rsvp-box">
        <h4 className="std-rsvp-title">
          <span className="std-rsvp-title-main">¿Nos acompañas?</span>
        </h4>
        <p className="std-rsvp-subtitle">Confirma tu asistencia llenando los datos, (el proceso es individual)</p>
        
        <input
          type="text"
          className="std-rsvp-input"
          placeholder="Tu nombre completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={isSubmitting}
        />

        <div className="std-rsvp-buttons">
          <button
            className="std-rsvp-btn yes"
            onClick={() => handleSubmit(true)}
            disabled={!fullName.trim() || isSubmitting}
          >
            Sí asistiré
          </button>
          <button
            className="std-rsvp-btn no"
            onClick={() => handleSubmit(false)}
            disabled={!fullName.trim() || isSubmitting}
          >
            No podré
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveTheDateRSVP;
