import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SaveTheDateRSVP from '../components/SaveTheDateRSVP';
import '../styles/SaveTheDate.css';

const SaveTheDate = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [heroVisible, setHeroVisible] = useState(true);
  const [showInviteButton, setShowInviteButton] = useState(() => {
    // Puedes cambiar esto a false para ocultar los botones
    return true;
  });

  const handleViewInvite = () => {
    navigate('/invite');
  };

  const [additionalVisible, setAdditionalVisible] = useState(false);
  const [messageVisible, setMessageVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Ajustar threshold según el tamaño de la pantalla
      const isDesktop = window.innerWidth >= 1024;
      
      // Obtener el elemento de mensaje para calcular su posición
      const messageSection = document.querySelector('.message-section');
      if (!messageSection) return;
      
      const messageSectionRect = messageSection.getBoundingClientRect();
      const messageMidpoint = messageSectionRect.top + (messageSectionRect.height / 2);
      
      // El threshold es cuando el punto medio de la ventana alcanza la mitad del módulo de mensaje
      const viewportMidpoint = window.innerHeight / 2;
      
      // Determinar visibilidad basado en la posición del scroll
      if (messageMidpoint < viewportMidpoint) {
        setHeroVisible(false);
        setMessageVisible(false);
        // Pequeño retraso para la animación del módulo adicional
        setTimeout(() => setAdditionalVisible(true), 500);
      } else {
        setAdditionalVisible(false);
        // Pequeño retraso para la animación del hero y mensaje
        setTimeout(() => {
          setHeroVisible(true);
          setMessageVisible(true);
        }, 500);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      {/* Sección principal con imagen de fondo */}
      <div className={`hero-section ${heroVisible ? 'visible' : 'hidden'}`}>
        <div className="hero-background">
          <div className="background-image"></div>
        </div>
      </div>
      
      {/* Sección de mensaje */}
      <div className={`message-section ${messageVisible ? 'visible' : 'hidden'}`}>
        <div className="container">
          <div className="story-message">
            <h2 className="story-text">
              HERE BEGINS <span className="allura">the</span> REST
            </h2>
            <h2 className="story-text story-cursive">
              OF OUR <span className="allura">story</span>
            </h2>
            <div className="story-line"></div>
          </div>
          
          {showInviteButton && (
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handleViewInvite}>
                Ver Invitación
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Módulo adicional con scroll animado */}
      <div className={`additional-module ${additionalVisible ? 'visible' : 'hidden'}`}>
        <div className="module-content">
          <div className="module-header">
            <h2 className="module-title">Lorem Ipsum</h2>
          </div>
          
          <div className="module-text">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin posuere, 
              ipsum non suscipit tincidunt, mauris nisl congue nisl, non hendrerit 
              arcu tellus id nisi. Sed pretium ex ac massa vestibulum, sed mollis 
              ipsum placerat.
            </p>
          </div>
          
          <div className="module-highlight">
            <h3 className="highlight-title">Save The Date</h3>
            <div className="highlight-date">03/05/2026</div>
          </div>

          <div className="countdown">
            {timeLeft && Object.keys(timeLeft).length > 0 ? (
              <div className="countdown-grid">
                <div className="countdown-item">
                  <div className="count-number">{timeLeft.days}</div>
                  <div className="count-label">Días</div>
                </div>
                <div className="countdown-item">
                  <div className="count-number">{String(timeLeft.hours).padStart(2, '0')}</div>
                  <div className="count-label">Horas</div>
                </div>
                <div className="countdown-item">
                  <div className="count-number">{String(timeLeft.minutes).padStart(2, '0')}</div>
                  <div className="count-label">Min</div>
                </div>
                <div className="countdown-item">
                  <div className="count-number">{String(timeLeft.seconds).padStart(2, '0')}</div>
                  <div className="count-label">Seg</div>
                </div>
              </div>
            ) : (
              <div className="countdown-ended">¡Es el día!</div>
            )}
          </div>

          {/* Módulo de confirmación para Save The Date */}
          <SaveTheDateRSVP />

          {/* Centro: botón Ver Invitación dentro del módulo adicional */}
          {showInviteButton && (
            <div className="module-cta" style={{ marginTop: '30px', textAlign: 'center' }}>
              <button className="btn btn-primary" onClick={handleViewInvite}>
                Ver Invitación
              </button>
            </div>
          )}

        </div>
      </div>
      
      <footer className="page-footer">
        <p>© {new Date().getFullYear()} LFDevStudio. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default SaveTheDate;