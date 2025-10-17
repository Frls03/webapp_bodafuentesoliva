import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Invite.css';
import Timeline from '../components/Timeline';

const Invite = () => {
  const navigate = useNavigate();

  const handleBackToSaveTheDate = () => {
    navigate('/home');
  };

  return (
    <div className="invite">
        {/* Módulo 1: Wedding Timeline */}
      <div className="module timeline-module">
        <div className="module-content">
          <Timeline />
        </div>
      </div>

      {/* Módulo 2: Dress Code */}
      <div className="module dress-code-module">
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
            <div className="outfit-item">
              <div className="outfit-placeholder">Outfit mujer 1</div>
            </div>
            <div className="outfit-item">
              <div className="outfit-placeholder">Outfit mujer 2</div>
            </div>
            <div className="outfit-item">
              <div className="outfit-placeholder">Outfit mujer 3</div>
            </div>
            <div className="outfit-item">
              <div className="outfit-placeholder">Outfit hombre 1</div>
            </div>
            <div className="outfit-item">
              <div className="outfit-placeholder">Outfit hombre 2</div>
            </div>
            <div className="outfit-item">
              <div className="outfit-placeholder">Outfit hombre 3</div>
            </div>
          </div>
        </div>
      </div>

      {/* Módulo 3: Details */}
      <div className="module details-module">
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
      <div className="module location-module">
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
            <button className="nav-btn waze-btn">Ver en Waze</button>
            <button className="nav-btn maps-btn">Ver en Maps</button>
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

      {/* Módulo 5: Shared Moments */}
      <div className="module moments-module">
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
            />
            <textarea 
              placeholder="Tu nota o mensaje" 
              className="message-input"
            ></textarea>
          </div>
          
          <div className="action-buttons">
            <button className="action-btn upload-btn">
              <span className="btn-icon">📷</span>
              <span className="btn-text">Sube tu recuerdo</span>
            </button>
            <button className="action-btn message-btn">
              <span className="btn-icon">📝</span>
              <span className="btn-text">Deja tu mensaje</span>
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
      </div>
  );
};

export default Invite;