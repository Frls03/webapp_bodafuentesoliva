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
  const inactivityMs = 2 * 60 * 1000;
  const isWeddingDay = true;

  const scheduleEvents = [
    {
      time: '2:00 p.m.',
      title: 'RECEPCIÓN',
      location: 'Casa Blanca Glamping, Milpas Altas',
      icon: '/icons/arco.png',
      showButton: true,
    },
    {
      time: '2:45 p.m.',
      title: 'CEREMONIA',
      location: 'Casa Blanca Glamping, Milpas Altas',
      icon: '/icons/anillos.png',
      showButton: true,
    },
    {
      time: '3:20 p.m.',
      title: 'FOTOS CON LOS NOVIOS',
      icon: '/icons/camara.png',
      showButton: false,
    },
    {
      time: '3:45 p.m.',
      title: 'BRINDIS',
      icon: '/icons/brindis.png',
      showButton: false,
    },
    {
      time: '4:00 p.m.',
      title: 'PRIMER BAILE',
      icon: '/icons/baile.png',
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
    const difference = +new Date('2026-05-03T17:00:00') - +new Date();
    
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

  if (!isAuthenticated) {
    return <PasswordGate onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="invite-new notranslate" translate="no">
      {/* MÓDULO 1: Hero con nombres */}
      <section className="hero-section" style={{ backgroundImage: 'url(/images/AJ1_2147.jpg)' }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title"><span>¡</span><span>NOS CASAMOS</span><span>!</span></h1>
          <h2 className="hero-names">{formatGuestNames(guestData?.names || [])}</h2>
          <p className="hero-date">03 . 05 . 2026</p>
        </div>
        <button className="change-guest-btn" onClick={handleChangeGuest}>
          ¿No eres tú?
        </button>
      </section>

      {/* MÓDULO 2: Countdown */}
      <section className="countdown-section">
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

          <div className="countdown-message">
            <p>Nuestra historia se construye con momentos y este es el más importante de nuestra vida.</p>
            <p className="countdown-invitation">
              TE INVITAMOS A COMPARTIR CON NOSOTROS EL INICIO DE ESTA NUEVA ETAPA JUNTOS.
            </p>
          </div>

          <div className="wedding-date-display">
            <div className="date-day-label">DOMINGO</div>
            <div className="date-day-number">03</div>
            <div className="date-month-label">MAYO</div>
          </div>
        </div>
      </section>

      {/* MÓDULO 3: Cronograma */}
      <section className="schedule-section">
        <div className="schedule-background" style={{ backgroundImage: 'url(/images/JOK_5880.jpg)' }}></div>
        <div className="schedule-content">
          <h2 className="schedule-title">Cronograma</h2>
          <div className="schedule-timeline">
            <div className="schedule-line"></div>
            {scheduleEvents.map((event) => (
              <div className="schedule-item" key={`${event.title}-${event.time}`}>
                <div className="schedule-icon">
                  <img src={event.icon} alt={event.title} />
                </div>
                <div className="schedule-details">
                  <h3 className="schedule-item-title">{event.title}</h3>
                  <p className="schedule-item-time">{event.time}</p>
                  {event.location ? (
                    <p className="schedule-item-location">{event.location}</p>
                  ) : null}
                  {event.showButton ? (
                    <button className="schedule-item-button">CÓMO LLEGAR</button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MÓDULO 4: Poster con 3 fotos */}
      <section className="photos-section">
        <div className="photos-grid">
          <div className="photo-frame">
            <img src="/images/foto inicial.jpg" alt="Pareja 1" />
          </div>
          <div className="photo-frame">
            <img src="/images/foto extra.jpg" alt="Pareja 2" />
          </div>
          <div className="photo-frame">
            <img src="/images/JOK_5880.jpg" alt="Pareja 3" />
          </div>
        </div>
      </section>

      {/* MÓDULO 5: Dress Code */}
      <section className="dresscode-section">
        <h2 className="dresscode-title">DRESS CODE</h2>
        <p className="dresscode-subtitle">ELEGANTE</p>
        
        <div className="dresscode-guidelines">
          <p className="dresscode-women">MUJERES: VESTIDO LARGO</p>
          <p className="dresscode-men">HOMBRES: TRAJE Y CORBATA</p>
        </div>

        <div className="color-palette">
          <div className="color-circle" style={{ backgroundColor: '#000000' }}></div>
          <div className="color-circle" style={{ backgroundColor: '#4A2C2A' }}></div>
          <div className="color-circle" style={{ backgroundColor: '#6B4423' }}></div>
          <div className="color-circle" style={{ backgroundColor: '#8B4513' }}></div>
          <div className="color-circle" style={{ backgroundColor: '#A0522D' }}></div>
          <div className="color-circle" style={{ backgroundColor: '#4A5D6F' }}></div>
          <div className="color-circle" style={{ backgroundColor: '#8B9467' }}></div>
          <div className="color-circle" style={{ backgroundColor: '#A8A878' }}></div>
        </div>

        <p className="dresscode-note">
          Los colores blanco y similares (como perla, beige o champagne) están reservados solo para la novia
        </p>
      </section>

      {/* MÓDULO 6: Regalos */}
      <section className="gifts-section">
        <div className="gifts-background" style={{ backgroundImage: 'url(/images/foto%20extra.jpg)' }}></div>
        <div className="gifts-content">
          <h2 className="gifts-title">REGALOS</h2>
          <p className="gifts-message">
            Tu presencia es lo más importante para nosotros en este día y si desean enviarnos un obsequio, te brindamos las siguientes opciones:
          </p>
          <p className="gifts-link-text"></p>
          <div className="gifts-options">
            <a
              className="gifts-link-button"
              href="https://www.cemaco.com/?utnm_source=Google_Ads&utm_medium=Search&utm_campaign=2023_Cemaco_Brand-Search&utm_content=CemacoAds_Brand-Search-Ads&gad_source=1&gad_campaignid=12955798310&gbraid=0AAAAADhhIfz-T1ooun0LbH3DS4ou1cYW_&gclid=Cj0KCQiA7rDMBhCjARIsAGDBuEDHnwTeRbbJj5wCOQOFUbeIn5OdwcqYaEUjLlKofYZtoS8yYWVHJqAaAmOjEALw_wcB"
              target="_blank"
              rel="noreferrer"
            >
              VER REGALOS
            </a>
          </div>
        </div>
      </section>

      {/* MÓDULO 7: Confirmación de asistencia */}
      <section className="confirmation-section">
        <div className="confirmation-card">
          <p className="confirmation-cta">CONFIRMA TU ASISTENCIA</p>
          
          <AttendanceConfirmation guestData={guestData} />

          <p className="confirmation-note">
            Nos encantan los niños, pero con mucho cariño informamos que esta será una celebración solo de adultos.
          </p>
        </div>
      </section>

      <section className="moments-lock-section">
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
