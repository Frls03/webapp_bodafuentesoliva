import React, { useState, useEffect } from 'react';
import { adminLogin, getAttendanceStats } from '../lib/supabase';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

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
    setStats(data);
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

  if (!stats) {
    return <div className="admin-loading">Cargando estadísticas...</div>;
  }

  const confirmedGuests = stats.guests.filter(g => g.attendance_confirmed === true);
  const pendingGuests = stats.guests.filter(g => !g.attendance_confirmed);
  const declined = stats.guests.filter(g => g.attendance_confirmed === false);

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Panel de Administración</h1>
        <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
      </div>

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

        {declined.length > 0 && (
          <>
            <h2>❌ No Asistirán ({declined.length})</h2>
            <div className="guests-list">
              {declined.map((guest) => (
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
    </div>
  );
};

export default AdminPanel;
