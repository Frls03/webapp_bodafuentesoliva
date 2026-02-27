import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/InviteNew.css';
import PasswordGate from '../components/PasswordGate';
import AttendanceConfirmation from '../components/AttendanceConfirmation';

const InviteNew = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guestData, setGuestData] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const authStorageKey = 'inviteNewAuth';
  const inactivityMs = 3 * 60 * 1000;
  const isWeddingDay = true;

  const scheduleEvents = [
    {
      time: '2:30 p.m.',
      title: 'CEREMONIA',
      location: 'Casa Blanca Glamping, Milpas Altas',
      icon: '/icons/anillos1.png',
      showButton: true,
    },
    {
      time: '4:00 p.m.',
      title: 'CÓCTEL',
      location: 'Casa Blanca Glamping, Milpas Altas',
      icon: '/icons/cocktail.png',
      showButton: false,
    },
    {
      time: '5:00 p.m.',
      title: 'ENTRADA DE NOVIOS',
      icon: '/icons/entrada.png',
      showButton: false,
    },
    {
      time: '5:20 p.m.',
      title: 'BRINDIS',
      icon: '/icons/brindis1.png',
      showButton: false,
    },
    {
      time: '5:25 p.m.',
      title: 'CENA',
      icon: '/icons/cena1.png',
      showButton: false,
    },
    {
      time: '6:00 p.m.',
      title: 'FOTOS CON LOS NOVIOS',
      icon: '/icons/camara1.png',
      showButton: false,
    },
    {
      time: '6:30 p.m.',
      title: 'PARTY',
      icon: '/icons/party.png',
      showButton: false,
    },
  ];

  // Función para formatear nombres con comas y "y"
  const formatGuestNames = (names) => {
    if (!names || names.length === 0) return '';

    const cleanedNames = names
      .map((name) => String(name).trim().replace(/\s+/g, ' '))
      .filter((name) => name.length > 0);

    if (cleanedNames.length === 0) return '';
    if (cleanedNames.length === 1) return cleanedNames[0];
    if (cleanedNames.length === 2) {
      return `${cleanedNames[0]} y ${cleanedNames[1]}`
        .replace(/\s+,/g, ',')
        .replace(/\s*,\s*/g, ', ')
        .replace(/\s+y\s+/gi, ' y ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Para 3 o más nombress"
    const allButLast = cleanedNames.slice(0, -1).join(', ');
    const last = cleanedNames[cleanedNames.length - 1];
    return `${allButLast} y ${last}`
      .replace(/\s+,/g, ',')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s+y\s+/gi, ' y ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Countdown para la boda (3 de mayo 2026)
  const calculateTimeLeft = () => {
    const difference = +new Date('2026-05-03T14:30:00') - +new Date();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(authStorageKey);

    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      const lastActive = Number(parsed?.lastActive || 0);
      const isFresh = lastActive && Date.now() - lastActive < inactivityMs;

      if (isFresh && parsed?.guest) {
        setGuestData(parsed.guest);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem(authStorageKey);
      }
    } catch {
      localStorage.removeItem(authStorageKey);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !guestData) return;

    const updateLastActive = () => {
      localStorage.setItem(
        authStorageKey,
        JSON.stringify({ guest: guestData, lastActive: Date.now() })
      );
    };

    updateLastActive();

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((event) => window.addEventListener(event, updateLastActive));

    const inactivityCheck = setInterval(() => {
      const stored = localStorage.getItem(authStorageKey);
      if (!stored) return;

      try {
        const parsed = JSON.parse(stored);
        const lastActive = Number(parsed?.lastActive || 0);
        if (!lastActive || Date.now() - lastActive >= inactivityMs) {
          localStorage.removeItem(authStorageKey);
          setIsAuthenticated(false);
          setGuestData(null);
        }
      } catch {
        localStorage.removeItem(authStorageKey);
        setIsAuthenticated(false);
        setGuestData(null);
      }
    }, 5000);

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, updateLastActive));
      clearInterval(inactivityCheck);
    };
  }, [isAuthenticated, guestData]);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('.module-animate'));
    if (elements.length === 0) return undefined;

    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    elements.forEach((el) => {
      el.classList.remove('is-visible');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleAuthenticated = (data) => {
    setGuestData(data);
    setIsAuthenticated(true);
    localStorage.setItem(
      authStorageKey,
      JSON.stringify({ guest: data, lastActive: Date.now() })
    );
  };

  const handleChangeGuest = () => {
    setIsAuthenticated(false);
    setGuestData(null);
    localStorage.removeItem(authStorageKey);
  };

  const handleOpenMoments = () => {
    navigate('/moments');
  };

  const handleOpenWaze = () => {
    const address = 'Casa Blanca Glamping, Km 38.5 ruta nacional 10';
    const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
    window.open(wazeUrl, '_blank', 'noopener,noreferrer');
  };

  if (!isAuthenticated) {
    return <PasswordGate onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="invite-new notranslate" translate="no">
      {/* MÓDULO 1: Hero con nombres */}
      <section
        className="hero-section module-animate"
        style={{ backgroundImage: 'url(/images/regalos1.jpeg)', animationDelay: '0.05s' }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content hero-animate">
          <h1 className="hero-title"><span>¡</span><span>NOS CASAMOS</span><span>!</span></h1>
          <h2 className="hero-names">{formatGuestNames(guestData?.names || [])}</h2>
          <p className="hero-message">
            Nuestro amor tiene una fecha
            especial y queremos celebrar
            contigo
          </p>
          <p className="hero-date">03 . 05 . 2026</p>
        </div>
        <button className="change-guest-btn" onClick={handleChangeGuest}>
          ¿No eres tú?
        </button>
      </section>

      {/* MÓDULO 2: Countdown */}
      <section className="countdown-section module-animate" style={{ animationDelay: '0.1s' }}>
        <div className="countdown-background"></div>
        <div className="countdown-card">
          <h2 className="countdown-title">FALTAN:</h2>
          <div className="countdown-timer">
            <div className="countdown-unit">
              <span className="countdown-number">{timeLeft.days}</span>
              <span className="countdown-label">DÍAS</span>
            </div>
            <div className="countdown-unit">
              <span className="countdown-number">{timeLeft.hours}</span>
              <span className="countdown-label">HORAS</span>
            </div>
            <div className="countdown-unit">
              <span className="countdown-number">{timeLeft.minutes}</span>
              <span className="countdown-label">MINUTOS</span>
            </div>
            <div className="countdown-unit">
              <span className="countdown-number">{timeLeft.seconds}</span>
              <span className="countdown-label">SEGUNDOS</span>
            </div>
          </div>
        </div>
      </section>

      {/* MÓDULO 3: Cronograma */}
      <section className="schedule-section module-animate" style={{ animationDelay: '0.15s' }}>
        <div className="schedule-background" style={{ backgroundImage: 'url(/images/invi1.jpeg)' }}></div>
        <div className="schedule-content">
          <h2 className="schedule-title">Cronograma</h2>
          <div className="schedule-timeline">
            <div className="schedule-line"></div>
            {scheduleEvents.map((event) => (
              <div className="schedule-item" key={`${event.title}-${event.time}`}>
                <div className="schedule-icon">
                  <img
                    src={event.icon}
                    alt={event.title}
                    className={`schedule-icon-img${event.icon.includes('camara1') ? ' icon-camera' : ''}`}
                  />
                </div>
                <div className="schedule-details">
                  <h3 className="schedule-item-title">{event.title}</h3>
                  <p className="schedule-item-time">{event.time}</p>
                  {event.location ? (
                    <p className="schedule-item-location">{event.location}</p>
                  ) : null}
                  {event.showButton ? (
                    <button className="schedule-item-button" onClick={handleOpenWaze}>
                      CÓMO LLEGAR
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MÓDULO 4: Poster con 3 fotos */}
      <section className="photos-section module-animate" style={{ animationDelay: '0.2s' }}>
        <div className="photos-grid">
          <div className="photo-frame">
            <img src="/images/mosaico1.jpg" alt="Pareja 1" />
          </div>
          <div className="photo-frame">
            <img src="/images/mosaico2.jpg" alt="Pareja 2" />
          </div>
          <div className="photo-frame">
            <img src="/images/invi2.jpeg" alt="Pareja 3" />
          </div>
        </div>
      </section>


            {/* MÓDULO 5: Regalos */}
      <section className="gifts-section module-animate" style={{ animationDelay: '0.25s' }}>
        <div className="gifts-background" style={{ backgroundImage: 'url(/images/mosaico3.jpg)' }}></div>
        <div className="gifts-content">
            <img className="gifts-icon" src="/icons/regalos.png" alt="" aria-hidden="true" />
          <div className="gifts-options">
            <a
              className="gifts-link-button"
              href="https://www.cemaco.com/list/bodafuentesoliva"
              target="_blank"
              rel="noreferrer"
            >
              LISTA DE REGALOS
            </a>
          </div>
          <p className="gifts-message">
            Gracias por acompanarnos en este dia tan especial. Si deseas hacernos un obsequio, esta es nuestra mesa de regalos.
          </p>
          <p className="gifts-note">
            Ayudanos dejando tu regalo en el establecimiento, nosotros pasaremos por ellos.
          </p>
        </div>
      </section>

      {/* MÓDULO 6: Dress Code */}
      <section className="dresscode-section module-animate" style={{ animationDelay: '0.3s' }}>
        <h2 className="dresscode-title">DRESS CODE</h2>
        <p className="dresscode-subtitle">ELEGANTE</p>
        
        <div className="dresscode-guidelines">
          <p className="dresscode-women">MUJERES: VESTIDO LARGO</p>
          <p className="dresscode-men">HOMBRES: TRAJE Y CORBATA</p>
        </div>

        <div className="color-palette">
          <div className="color-circle" style={{ backgroundColor: '#b52217' }}></div>
          <div className="color-circle" style={{ backgroundColor: '#ff5757' }}></div>
          <div className="color-circle" style={{ backgroundColor: '#5ce1e6' }}></div>
          <div className="color-circle" style={{ backgroundColor: '#5170ff' }}></div>
          <div className="color-circle" style={{ backgroundColor: '#884a22' }}></div>
          <div className="color-circle" style={{ backgroundColor: '#d6641a' }}></div>
          <div className="color-circle" style={{ backgroundColor: '#d61a69' }}></div>
          <div className="color-circle" style={{ backgroundColor: '#ffc721' }}></div>
        </div>

        <p className="dresscode-note">
          Los colores blanco y similares (como perla, beige o champagne) están reservados solo para la novia
        </p>
        <a
          className="dresscode-link"
          href="https://pin.it/47xY85C5k"
          target="_blank"
          rel="noreferrer"
        >
          Inspo Outfit
        </a>
      </section>



      {/* MÓDULO 7: Confirmación de asistencia */}
      <section className="confirmation-section module-animate" style={{ animationDelay: '0.35s' }}>
        <div className="confirmation-card">
          <p className="confirmation-cta">CONFIRMA TU ASISTENCIA</p>
          
          <AttendanceConfirmation guestData={guestData} />

          <p className="confirmation-note">
            Nos encantan los niños, pero con mucho cariño informamos que esta será una celebración solo de adultos.
          </p>
        </div>
      </section>

      <section className="moments-lock-section module-animate" style={{ animationDelay: '0.4s' }}>
        <div className="moments-lock-card">
          <h2 className="moments-lock-title">Momentos compartidos</h2>
          <p className="moments-lock-text">
            Queremos que vivas el momento junto a nosotros. Aquí podrás compartir tus fotos y mensajes del gran día.
          </p>
          <p className="moments-lock-note">El día de la boda se habilitará el botón.</p>
          <button
            type="button"
            className="moments-lock-button"
            onClick={handleOpenMoments}
            disabled={!isWeddingDay}
          >
            ABRIR MOMENTOS COMPARTIDOS
          </button>
        </div>
      </section>
    </div>
  );
};

export default InviteNew;
