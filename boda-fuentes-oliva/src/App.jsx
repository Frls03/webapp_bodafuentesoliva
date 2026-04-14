import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
// import Invite from './pages/Invite'; // Plantilla anterior (comentada)
import InviteNew from './pages/InviteNew'; // Nueva página de invitación
import InviteBel from './pages/InviteBel';
import MomentsShared from './pages/MomentsShared';
import AdminPanel from './pages/AdminPanel';
import './App.css';

function App() {
  const location = useLocation();
  const isInvitePage = ['/invite', '/invite-bel', '/home', '/savethedate', '/'].includes(location.pathname);
  const isAdminPage = location.pathname === '/admin';
  
  // Puedes cambiar esto a false para ocultar el enlace de invitación
  const showInviteLink = false;

  return (
    <div className="app">
      {/* Solo mostrar navegación en Save The Date */}
      {!isInvitePage && !isAdminPage && <Navigation showInviteLink={showInviteLink} />}
      
      <main className={`main-content ${isInvitePage ? 'invite-page' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/invite" replace />} />
          <Route path="/home" element={<Navigate to="/invite" replace />} />
          <Route path="/savethedate" element={<Navigate to="/invite" replace />} />
          {/* <Route path="/invite" element={<Invite />} /> */} {/* Plantilla anterior */}
          <Route path="/invite" element={<InviteNew />} /> {/* Nueva invitación */}
          <Route path="/invite-bel" element={<InviteBel />} />
          <Route path="/moments" element={<MomentsShared />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
