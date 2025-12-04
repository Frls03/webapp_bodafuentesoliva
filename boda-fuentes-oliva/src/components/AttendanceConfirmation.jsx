import React, { useState } from 'react';
import { confirmAttendance } from '../lib/supabase';
import { validateNotes, validateAttendanceCount } from '../utils/validation';
import '../styles/AttendanceConfirmation.css';

const AttendanceConfirmation = ({ guestData, onConfirmed }) => {
  const maxAllowed = guestData.max_attendees || guestData.names.length;
  
  const [willAttend, setWillAttend] = useState(guestData.attendance_confirmed || null);
  const [attendeeCount, setAttendeeCount] = useState(guestData.attendance_count || maxAllowed);
  const [notes, setNotes] = useState(guestData.attendance_notes || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const notesValidation = validateNotes(notes);
    if (!notesValidation.isValid) {
      setMessage(`❌ ${notesValidation.error}`);
      setLoading(false);
      return;
    }

    const countValidation = validateAttendanceCount(attendeeCount);
    if (!countValidation.isValid) {
      setMessage(`❌ ${countValidation.error}`);
      setLoading(false);
      return;
    }

    const result = await confirmAttendance(guestData.id, {
      confirmed: willAttend,
      count: willAttend ? countValidation.sanitized : 0,
      notes: notesValidation.sanitized
    });

    if (result.success) {
      setMessage('✅ ¡Confirmación guardada exitosamente!');
      if (onConfirmed) {
        onConfirmed(result.data);
      }
      const updatedGuest = { ...guestData, ...result.data };
      sessionStorage.setItem('guestData', JSON.stringify(updatedGuest));
    } else {
      setMessage('❌ Error al guardar. Intenta de nuevo.');
    }

    setLoading(false);
  };

  return (
    <div className="attendance-confirmation">
      <h2 className="attendance-title">Confirma tu asistencia</h2>
      
      <form onSubmit={handleSubmit} className="attendance-form">
        <div className="attendance-question">
          <div className="attendance-buttons">
            <button
              type="button"
              className={`attendance-btn ${willAttend === true ? 'active yes' : ''}`}
              onClick={() => setWillAttend(true)}
            >
              ✅ Sí, asistiré
            </button>
            <button
              type="button"
              className={`attendance-btn ${willAttend === false ? 'active no' : ''}`}
              onClick={() => setWillAttend(false)}
            >
              ❌ No podré asistir
            </button>
          </div>
        </div>

        {willAttend === true && (
          <div className="attendee-count">
            <label htmlFor="count">¿Cuántas personas asistirán?</label>
            <select
              id="count"
              value={attendeeCount}
              onChange={(e) => setAttendeeCount(parseInt(e.target.value))}
              className="count-select"
            >
              {[...Array(maxAllowed)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i === 0 ? 'persona' : 'personas'}
                </option>
              ))}
            </select>
            {maxAllowed > guestData.names.length && (
              <p className="plus-one-note">
                ℹ️ Tienes permitido traer un acompañante (+1)
              </p>
            )}
          </div>
        )}

        <div className="attendance-notes">
          <label htmlFor="notes">Notas adicionales (opcional)</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Alergias, preferencias alimentarias, etc."
            className="notes-textarea"
            rows="3"
          />
        </div>

        {message && (
          <div className={`attendance-message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          className="submit-attendance-btn"
          disabled={loading || willAttend === null}
        >
          {loading ? 'Guardando...' : 'Confirmar Asistencia'}
        </button>

        {guestData.attendance_confirmed && (
          <p className="already-confirmed">
            Ya confirmaste tu asistencia el {new Date(guestData.confirmed_at).toLocaleDateString('es-ES')}
          </p>
        )}
      </form>
    </div>
  );
};

export default AttendanceConfirmation;
