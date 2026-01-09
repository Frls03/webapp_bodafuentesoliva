import React, { useState, useEffect } from 'react';
import SaveTheDateRSVP from '../components/SaveTheDateRSVP';
import '../styles/SaveTheDate.css';

const SaveTheDate = () => {
  // Countdown state and effect
  const calculateTimeLeft = () => {
    const difference = +new Date('2026-05-03T00:00:00') - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="save-the-date">
      {/* SECCIÓN 1: Header con fecha y nombres */}
      <section className="std-section-1">
        <div className="std-header-text">
          <div className="std-save-arc" aria-label="Save the Date">
            <svg viewBox="0 0 600 240" aria-hidden="true">
              <defs>
                <path
                  id="std-arc-path"
                  d="M30 210 Q300 30 570 210"
                  fill="none"
                />
              </defs>
              <text className="std-save-text">
                <textPath href="#std-arc-path" startOffset="50%" textAnchor="middle">
                  SAVE THE DATE
                </textPath>
              </text>
            </svg>
          </div>
          <h2 className="std-main-date">03<span className="slash">|</span>05<span className="slash">|</span>2026</h2>
          <h3 className="std-names">Fuentes Oliva</h3>
        </div>
        
        {/* Imagen sin recortes */}
        <div className="std-image-container-1">
          <img src="/images/foto inicial.jpg" alt="Pareja" />
        </div>
      </section>

      {/* SECCIÓN 2: Información de la boda */}
      <section className="std-section-2">
        <div className="std-info-container">
          <h2 className="std-subtitle">Nuestro Para Siempre</h2>
          <h2 className="std-subtitle">Inicia Ahora</h2>
          
          <div className="std-date-display">
            <span className="std-day-label">DOMINGO</span>
            <span className="std-day-number">03</span>
            <span className="std-month-label">15:00Hrs</span>
          </div>

          <div className="std-month-large">MAYO</div>

          <div className="std-invitation-text">
            <p>Nos encantaría que seas parte de este momento tan especial para nosotros </p>
              <p>¡Falta poco!</p>
          </div>

          <div className="std-location">
            <img src="/icons/rama-de-olivo.png" alt="Rama de olivo" className="std-location-icon top" />
            <p className="std-location-title">Ubicación</p>
            <p className="std-location-address">
              Casa Blanca Glamping<br />
              km 38.5 ruta nacional 10, saliendo de<br />
              Antigua Guatemala a 5 min
            </p>
            <img src="/icons/rama-de-olivo.png" alt="Rama de olivo" className="std-location-icon bottom" />
          </div>
        </div>
      </section>

      {/* Imagen extra bajo el bloque verde */}
      <div className="std-image-custom">
        <img src="/images/foto extra.jpg" alt="Foto extra" />
      </div>

      {/* SECCIÓN 3: Countdown y formulario */}
      <section className="std-section-3">
        {/* Countdown */}
        <div className="std-countdown">
          {timeLeft && Object.keys(timeLeft).length > 0 ? (
            <div className="std-countdown-grid">
              <div className="std-countdown-item">
                <div className="std-count-number">{timeLeft.days}</div>
                <div className="std-count-label">Días</div>
              </div>
              <div className="std-countdown-item">
                <div className="std-count-number">{String(timeLeft.hours).padStart(2, '0')}</div>
                <div className="std-count-label">Horas</div>
              </div>
              <div className="std-countdown-item">
                <div className="std-count-number">{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div className="std-count-label">Min</div>
              </div>
              <div className="std-countdown-item">
                <div className="std-count-number">{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div className="std-count-label">Seg</div>
              </div>
            </div>
          ) : (
            <div className="std-countdown-ended">¡Es el día!</div>
          )}
        </div>

        {/* Formulario de confirmación */}
        <div className="std-rsvp-container">
          <SaveTheDateRSVP />
        </div>
      </section>
      
      <footer className="page-footer">
        <p>© {new Date().getFullYear()} LFDevStudio. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default SaveTheDate;