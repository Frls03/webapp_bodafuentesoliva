import React, { useState, useEffect } from 'react';
import { adminLogin, getAttendanceStats, getSaveTheDateStats } from '../lib/supabase';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [saveTheDateStats, setSaveTheDateStats] = useState(null);
  const [activeTab, setActiveTab] = useState('invitation'); // 'invitation' o 'savethedate'

  useEffect(() => {
    // Verificar si ya está autenticado
    const adminSession = sessionStorage.getItem('adminSession');
    if (adminSession) {
      setIsAuthenticated(true);
      loadStats();
    }
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const data = await getAttendanceStats();
    const stdData = await getSaveTheDateStats();
    setStats(data);
    setSaveTheDateStats(stdData);
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const admin = await adminLogin(username, password);

    if (admin) {
      sessionStorage.setItem('adminSession', JSON.stringify(admin));
      setIsAuthenticated(true);
      await loadStats();
    } else {
      setError('Credenciales incorrectas');
    }

    setLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminSession');
    setIsAuthenticated(false);
    setStats(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <h1>Panel de Administración</h1>
          <p>Acceso exclusivo para los novios</p>
          
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            {error && <div className="admin-error">{error}</div>}
            
            <button type="submit" disabled={loading}>
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!stats || !saveTheDateStats) {
    return <div className="admin-loading">Cargando estadísticas...</div>;
  }

  const confirmedGuests = stats.guests.filter(g => g.attendance_confirmed === true);
  const declinedGuests = stats.guests.filter(g => g.attendance_confirmed === false);
  const pendingGuests = stats.guests.filter(g => g.attendance_confirmed === null);

  const confirmedSTD = saveTheDateStats.responses.filter(r => r.will_attend === true);
  const declinedSTD = saveTheDateStats.responses.filter(r => r.will_attend === false);

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Panel de Administración</h1>
        <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
      </div>

      {/* Pestañas de navegación */}
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'invitation' ? 'active' : ''}`}
          onClick={() => setActiveTab('invitation')}
        >
          📨 Invitación
        </button>
        <button 
          className={`tab-btn ${activeTab === 'savethedate' ? 'active' : ''}`}
          onClick={() => setActiveTab('savethedate')}
        >
          📅 Save The Date
        </button>
      </div>

      {/* Contenido de Invitación */}
      {activeTab === 'invitation' && (
        <>
          <div className="admin-stats">
            <div className="stat-card">
              <h3>Total Invitados</h3>
              <div className="stat-number">{stats.total}</div>
            </div>
            <div className="stat-card success">
              <h3>Confirmados</h3>
              <div className="stat-number">{stats.confirmed}</div>
            </div>
            <div className="stat-card warning">
              <h3>Pendientes</h3>
              <div className="stat-number">{stats.pending}</div>
            </div>
            <div className="stat-card info">
              <h3>Total Asistentes</h3>
          <div className="stat-number">{stats.totalAttendees}</div>
        </div>
      </div>

      <div className="guests-section">
        <h2>✅ Confirmados ({confirmedGuests.length})</h2>
        <div className="guests-list">
          {confirmedGuests.map((guest) => (
            <div key={guest.id} className="guest-card confirmed">
              <div className="guest-names">{guest.names.join(', ')}</div>
              <div className="guest-info">
                <span className="guest-count">👥 {guest.attendance_count} personas</span>
                <span className="guest-date">
                  {new Date(guest.confirmed_at).toLocaleDateString('es-ES')}
                </span>
              </div>
              {guest.attendance_notes && (
                <div className="guest-notes">💬 {guest.attendance_notes}</div>
              )}
              <div className="guest-password">🔑 {guest.password}</div>
            </div>
          ))}
        </div>

        {declinedGuests.length > 0 && (
          <>
            <h2>❌ No Asistirán ({declinedGuests.length})</h2>
            <div className="guests-list">
              {declinedGuests.map((guest) => (
                <div key={guest.id} className="guest-card declined">
                  <div className="guest-names">{guest.names.join(', ')}</div>
                  {guest.attendance_notes && (
                    <div className="guest-notes">💬 {guest.attendance_notes}</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <h2>⏳ Pendientes ({pendingGuests.length})</h2>
        <div className="guests-list">
          {pendingGuests.map((guest) => (
            <div key={guest.id} className="guest-card pending">
              <div className="guest-names">{guest.names.join(', ')}</div>
              <div className="guest-password">🔑 {guest.password}</div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={loadStats} className="refresh-btn">
        🔄 Actualizar Datos
      </button>
        </>
      )}

      {/* Contenido de Save The Date */}
      {activeTab === 'savethedate' && (
        <>
          <div className="admin-stats">
            <div className="stat-card">
              <h3>Total Respuestas</h3>
              <div className="stat-number">{saveTheDateStats.total}</div>
            </div>
            <div className="stat-card success">
              <h3>Asistirán</h3>
              <div className="stat-number">{saveTheDateStats.confirmed}</div>
            </div>
            <div className="stat-card danger">
              <h3>No Asistirán</h3>
              <div className="stat-number">{saveTheDateStats.declined}</div>
            </div>
          </div>

          <div className="guests-section">
            <h2>✅ Asistirán ({confirmedSTD.length})</h2>
            <div className="guests-list">
              {confirmedSTD.map((response) => (
                <div key={response.id} className="guest-card confirmed">
                  <div className="guest-names">{response.full_name}</div>
                  <div className="guest-date">
                    {new Date(response.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </div>

            {declinedSTD.length > 0 && (
              <>
                <h2>❌ No Asistirán ({declinedSTD.length})</h2>
                <div className="guests-list">
                  {declinedSTD.map((response) => (
                    <div key={response.id} className="guest-card declined">
                      <div className="guest-names">{response.full_name}</div>
                      <div className="guest-date">
                        {new Date(response.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <button onClick={loadStats} className="refresh-btn">
            🔄 Actualizar Datos
          </button>
        </>
      )}
      
      <footer className="page-footer">
        <p>© {new Date().getFullYear()} LFDevStudio. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default AdminPanel;
