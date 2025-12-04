import React, { useState, useEffect } from 'react';
import { getAllMessages } from '../lib/supabase';
import { exportMessagesToPDF } from '../utils/pdfExport';
import '../styles/MessagesView.css';

const MessagesView = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    const data = await getAllMessages();
    setMessages(data);
    setLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="messages-loading">Cargando mensajes...</div>;
  }

  if (messages.length === 0) {
    return (
      <div className="messages-empty">
        <p>📭 Aún no hay mensajes de invitados</p>
      </div>
    );
  }

  return (
    <div className="messages-wrapper">
      <div className="messages-container">
        <div className="messages-header">
          <div className="messages-title-section">
            <h2>Mensajes de Invitados</h2>
            <span className="messages-count">{messages.length} mensaje{messages.length !== 1 ? 's' : ''}</span>
          </div>
          <button onClick={() => exportMessagesToPDF(messages)} className="export-pdf-btn">
            📄 Descargar PDF
          </button>
        </div>

        <div className="messages-scroll-hint">
          👉 Desliza horizontalmente para ver más 👈
        </div>

        <div className="messages-list">
          {messages.map((msg) => (
            <div key={msg.id} className="message-card">
              <div className="message-header">
                <div className="message-from">
                  <strong>{msg.sender_name}</strong>
                  {msg.guests && (
                    <span className="message-guest-info">
                      · Invitado: {msg.guests.names ? msg.guests.names.join(', ') : 'N/A'}
                    </span>
                  )}
                </div>
                <div className="message-date">{formatDate(msg.created_at)}</div>
              </div>
              <div className="message-content">
                <p>{msg.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessagesView;
