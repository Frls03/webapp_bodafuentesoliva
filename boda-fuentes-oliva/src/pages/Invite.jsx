import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Invite.css';
import '../styles/ScrollAnimations.css';
import Timeline from '../components/Timeline';
import GuestNames from '../components/GuestNames';
import PasswordGate from '../components/PasswordGate';
import CloudinaryUpload from '../components/CloudinaryUpload';
import AttendanceConfirmation from '../components/AttendanceConfirmation';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { saveGuestMessage } from '../lib/supabase';
import { validateName, validateMessage } from '../utils/validation';

const Invite = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guestData, setGuestData] = useState(null);

  const [guestNamesVisible, setGuestNamesVisible] = useState(true);
  const [timelineVisible, setTimelineVisible] = useState(true);
  const [dressCodeVisible, setDressCodeVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [locationVisible, setLocationVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [momentsVisible, setMomentsVisible] = useState(false);

  const [senderName, setSenderName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [messageError, setMessageError] = useState('');

  const outfit1Anim = useScrollAnimation({ threshold: 0.3 }, true);
  const outfit2Anim = useScrollAnimation({ threshold: 0.3 }, true);
  const outfit3Anim = useScrollAnimation({ threshold: 0.3 }, true);
  const outfit4Anim = useScrollAnimation({ threshold: 0.3 }, true);
  const outfit5Anim = useScrollAnimation({ threshold: 0.3 }, true);
  const outfit6Anim = useScrollAnimation({ threshold: 0.3 }, true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;

      const guestNamesSection = document.querySelector('.guest-names-module');
      const timelineSection = document.querySelector('.timeline-module');
      const dressCodeSection = document.querySelector('.dress-code-module');
      const detailsSection = document.querySelector('.details-module');
      const locationSection = document.querySelector('.location-module');
      const confirmationSection = document.querySelector('.confirmation-module');
      const momentsSection = document.querySelector('.moments-module');

      if (!guestNamesSection || !timelineSection || !dressCodeSection || !detailsSection || !locationSection || !confirmationSection || !momentsSection) return;

      // Calcular las posiciones de inicio y fin de cada módulo
      const getModuleZone = (element) => {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollPosition;
        const elementBottom = elementTop + rect.height;
        return {
          start: elementTop - windowHeight * 0.8, // Empieza a aparecer cuando falta 80% de pantalla
          end: elementBottom - windowHeight * 0.2, // Empieza a desaparecer cuando pasa 20% de pantalla
          center: elementTop + (rect.height / 2) - scrollPosition
        };
      };

      const guestNamesZone = getModuleZone(guestNamesSection);
      const timelineZone = getModuleZone(timelineSection);
      const dressCodeZone = getModuleZone(dressCodeSection);
      const detailsZone = getModuleZone(detailsSection);
      const locationZone = getModuleZone(locationSection);
      const confirmationZone = getModuleZone(confirmationSection);
      const momentsZone = getModuleZone(momentsSection);

      // Determinar visibilidad basado en las zonas
      // Guest Names: visible al inicio hasta que timeline aparece
      setGuestNamesVisible(scrollPosition < timelineZone.start);

      // Timeline: visible en su zona
      setTimelineVisible(
        scrollPosition >= timelineZone.start - windowHeight * 0.3 && 
        scrollPosition < timelineZone.end
      );

      // Dress Code: visible en su zona
      setDressCodeVisible(
        scrollPosition >= dressCodeZone.start && 
        scrollPosition < dressCodeZone.end
      );

      // Details: visible en su zona
      setDetailsVisible(
        scrollPosition >= detailsZone.start && 
        scrollPosition < detailsZone.end
      );

      setLocationVisible(
        scrollPosition >= locationZone.start && 
        scrollPosition < locationZone.end
      );

      setConfirmationVisible(
        scrollPosition >= confirmationZone.start && 
        scrollPosition < confirmationZone.end
      );

      setMomentsVisible(scrollPosition >= momentsZone.start);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const savedGuest = sessionStorage.getItem('guestData');
    if (savedGuest) {
      try {
        const parsedGuest = JSON.parse(savedGuest);
        setGuestData(parsedGuest);
        setIsAuthenticated(true);
      } catch (e) {
        sessionStorage.removeItem('guestData');
      }
    }
  }, []);

  const handleAuthenticated = (guest) => {
    setGuestData(guest);
    setIsAuthenticated(true);
  };

  const handleChangeGuest = () => {
    setGuestData(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('guestData');
  };

  const handleBackToSaveTheDate = () => {
    navigate('/home');
  };

  const handleSendMessage = async () => {
    // Validar nombre del remitente
    const nameValidation = validateName(senderName);
    if (!nameValidation.isValid) {
      setMessageError(nameValidation.error);
      return;
    }

    // Validar mensaje
    const messageValidation = validateMessage(messageText);
    if (!messageValidation.isValid) {
      setMessageError(messageValidation.error);
      return;
    }

    setSendingMessage(true);
    setMessageError('');

    try {
      // Usar valores sanitizados
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

  const handleOpenWaze = () => {
    const address = "Casa Blanca Glamping, Km 38.5 ruta nacional 10";
    const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
    window.open(wazeUrl, '_blank');
  };

  const handleOpenMaps = () => {
    const address = "Casa Blanca Glamping, Km 38.5 ruta nacional 10";
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
  };

  const showConfirmationModule = true;

  if (!isAuthenticated) {
    return <PasswordGate onAuthenticated={handleAuthenticated} />;
  }

  // Una vez autenticado, mostrar toda la invitación
  return (
    <div className="invite">
      {/* Módulo 0: Nombres de Invitados */}
      <div 
        className={`module guest-names-module module-animate ${guestNamesVisible ? 'visible' : 'hidden'}`}
      >
        <div className="module-content">
          <GuestNames guestData={guestData} onChangeGuest={handleChangeGuest} />
        </div>
      </div>

      {/* Módulo 1: Wedding Timeline */}
      <div 
        className={`module timeline-module module-animate ${timelineVisible ? 'visible' : 'hidden'}`}
      >
        <div className="module-content">
          <Timeline />
        </div>
      </div>

      {/* Módulo 2: Dress Code */}
      <div 
        className={`module dress-code-module module-animate ${dressCodeVisible ? 'visible' : 'hidden'}`}
      >
        <div className="module-content">
          <div className="module-header">
            <h1 className="module-title">DRESS CODE</h1>
          </div>
          
          <div className="dress-code-text">
            <p>Los colores que elegimos fueron los siguientes, esto con la idea de que puedan hacer un match perfecto con nosotros en este día tan especial</p>
          </div>
          
          <div className="color-palette">
            <div className="color-swatch color-1"></div>
            <div className="color-swatch color-2"></div>
            <div className="color-swatch color-3"></div>
            <div className="color-swatch color-4"></div>
          </div>
          
          <div className="outfit-ideas-text">
            <p>Les compartimos unas ideas de como pueden ser sus outfits para acompañarnos</p>
          </div>
          
          <div className="outfit-grid">
            <div 
              ref={outfit1Anim.ref}
              className={`outfit-item outfit-image-animate ${dressCodeVisible && outfit1Anim.isVisible ? 'visible' : 'hidden'}`}
            >
              <div className="outfit-placeholder">Outfit mujer 1</div>
            </div>
            <div 
              ref={outfit2Anim.ref}
              className={`outfit-item outfit-image-animate ${dressCodeVisible && outfit2Anim.isVisible ? 'visible' : 'hidden'}`}
            >
              <div className="outfit-placeholder">Outfit mujer 2</div>
            </div>
            <div 
              ref={outfit3Anim.ref}
              className={`outfit-item outfit-image-animate ${dressCodeVisible && outfit3Anim.isVisible ? 'visible' : 'hidden'}`}
            >
              <div className="outfit-placeholder">Outfit mujer 3</div>
            </div>
            <div 
              ref={outfit4Anim.ref}
              className={`outfit-item outfit-image-animate ${dressCodeVisible && outfit4Anim.isVisible ? 'visible' : 'hidden'}`}
            >
              <div className="outfit-placeholder">Outfit hombre 1</div>
            </div>
            <div 
              ref={outfit5Anim.ref}
              className={`outfit-item outfit-image-animate ${dressCodeVisible && outfit5Anim.isVisible ? 'visible' : 'hidden'}`}
            >
              <div className="outfit-placeholder">Outfit hombre 2</div>
            </div>
            <div 
              ref={outfit6Anim.ref}
              className={`outfit-item outfit-image-animate ${dressCodeVisible && outfit6Anim.isVisible ? 'visible' : 'hidden'}`}
            >
              <div className="outfit-placeholder">Outfit hombre 3</div>
            </div>
          </div>
        </div>
      </div>

      {/* Módulo 3: Details */}
      <div 
        className={`module details-module module-animate ${detailsVisible ? 'visible' : 'hidden'}`}
      >
        <div className="module-content">
          <div className="module-header">
            <h1 className="module-title">DETAILS</h1>
          </div>
          
          <div className="details-text">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin posuere, ipsum non suscipit tincidunt, mauris nisl congue nisl,</p>
          </div>
          
          <div className="details-separator"></div>
          
          <div className="details-image">
            <div className="hands-image">
            </div>
          </div>
          
          <div className="details-text">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin posuere, ipsum non suscipit tincidunt, mauris nisl congue nisl, non hendrerit arcu tellus id nisi. Sed pretium ex ac massa vestibulum, sed mollis ipsum placerat</p>
          </div>
        </div>
      </div>

      {/* Módulo 4: Location */}
      <div 
        className={`module location-module module-animate ${locationVisible ? 'visible' : 'hidden'}`}
      >
        <div className="module-content">
          <div className="module-header">
            <h1 className="module-title">Un día, un lugar, un recuerdo eterno</h1>
          </div>
          
          <div className="event-details">
            <div className="detail-item">
              <span className="detail-label">Lugar:</span>
              <span className="detail-value">Casa Blanca Glamping</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Dirección:</span>
              <span className="detail-value">Km 38.5 ruta nacional 10</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Fecha:</span>
              <span className="detail-value">03 de mayo de 2026</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Hora:</span>
              <span className="detail-value">14:00 hrs</span>
            </div>
          </div>
          
          <div className="navigation-buttons">
            <button className="nav-btn waze-btn" onClick={handleOpenWaze}>Ver en Waze</button>
            <button className="nav-btn maps-btn" onClick={handleOpenMaps}>Ver en Maps</button>
          </div>
          
          <div className="practical-advice">
            <div className="advice-item">
              <div className="advice-icon">🌳</div>
              <div className="advice-text">El evento es al aire libre, considera llevar algo para cubrirte.</div>
            </div>
            <div className="advice-item">
              <div className="advice-icon">👟</div>
              <div className="advice-text">Sugerimos calzado cómodo extra.</div>
            </div>
            <div className="advice-item">
              <div className="advice-icon">🚗</div>
              <div className="advice-text">Contamos con espacio para parqueo.</div>
            </div>
          </div>
          
          <div className="location-image">
            <div className="couple-shadow-image">
              <div className="shadow-detail"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Módulo 5: Confirma tu Asistencia */}
      {showConfirmationModule && (
        <div 
          className={`module confirmation-module module-animate ${confirmationVisible ? 'visible' : 'hidden'}`}
        >
          <div className="module-content compact">
            <AttendanceConfirmation guestData={guestData} />
          </div>
        </div>
      )}

      {/* Módulo 6: Shared Moments */}
      <div 
        className={`module moments-module module-animate ${momentsVisible ? 'visible' : 'hidden'}`}
      >
        <div className="module-content">
          <div className="module-header">
            <h1 className="module-title">Momentos compartidos</h1>
          </div>
          
          <div className="moments-text">
            <p>Queremos que vivas el momento junto a nosotros.</p>
            <p className="italic-text">Después de la ceremonia, captura esos recuerdos especiales y déjanos una nota que siempre recordaremos.</p>
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
          
          {/* Componente de upload de Cloudinary */}
          <CloudinaryUpload />
          
          {messageSent && (
            <div className="message-success">
              ✅ ¡Mensaje enviado! Gracias por compartir.
            </div>
          )}
          {messageError && (
            <div className="message-error">
              ⚠️ {messageError}
            </div>
          )}
          
          <div className="action-buttons">
            <button 
              className="action-btn message-btn"
              onClick={handleSendMessage}
              disabled={sendingMessage || !senderName.trim() || !messageText.trim()}
            >
              <span className="btn-icon">📝</span>
              <span className="btn-text">
                {sendingMessage ? 'Enviando...' : 'Deja tu mensaje'}
              </span>
            </button>
          </div>
          
          <div className="closing-message">
            <p>Gracias por ayudarnos a recordar el amor que vivimos este día.</p>
          </div>
        </div>
      </div>

      {/* Botón de regreso */}
      <div className="back-button-container">
        <button className="btn btn-secondary" onClick={handleBackToSaveTheDate}>
          Volver al Save The Date
        </button>
      </div>
      
      <footer className="page-footer">
        <p>© {new Date().getFullYear()} LFDevStudio. Todos los derechos reservados.</p>
      </footer>
      </div>
  );
};

export default Invite;