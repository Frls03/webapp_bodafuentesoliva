import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import SaveTheDate from './pages/SaveTheDate';
import Invite from './pages/Invite';
import PasswordProtection from './components/PasswordProtection';
import './App.css';

function App() {
  const location = useLocation();
  const isInvitePage = location.pathname === '/invite';

  return (
    <div className="app">
      {/* Solo mostrar navegación en Save The Date */}
      {!isInvitePage && <Navigation />}
      
      <main className={`main-content ${isInvitePage ? 'invite-page' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<SaveTheDate />} />
          <Route path="/savethedate" element={<SaveTheDate />} />
          <Route 
            path="/invite" 
            element={
              <PasswordProtection>
                <Invite />
              </PasswordProtection>
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
