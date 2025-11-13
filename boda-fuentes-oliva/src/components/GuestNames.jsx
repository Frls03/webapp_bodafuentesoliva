import React from 'react';
import '../styles/GuestNames.css';

const GuestNames = ({ guestData, onChangeGuest }) => {
  if (!guestData) {
    return null;
  }

  return (
    <div className="guest-names-container">
      <div className="guest-names-content">
        <div className="guest-names-header">
          <h2 className="guest-welcome">Te damos la bienvenida</h2>
        </div>
        
        <div className="guest-names-display">
          {guestData.names.map((name, index) => (
            <React.Fragment key={index}>
              <span className="guest-name">{name}</span>
              {index < guestData.names.length - 1 && (
                <span className="guest-separator">&</span>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="guest-message">
          <p>{guestData.message}</p>
        </div>

        <div className="decorative-divider">
          <div className="divider-line"></div>
          <div className="divider-icon">❤️</div>
          <div className="divider-line"></div>
        </div>

        {/* Botón opcional para cerrar sesión */}
        <button 
          className="guest-change-btn" 
          onClick={onChangeGuest}
          aria-label="Cambiar invitado"
        >
          ¿No eres tú? Ingresa otra contraseña
        </button>
      </div>
    </div>
  );
};

export default GuestNames;
