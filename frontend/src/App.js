import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RoutesPage from './pages/RoutesPage';
import RidershipPage from './pages/RidershipPage';
import SchedulesPage from './pages/SchedulesPage';
import FaresPage from './pages/FaresPage';
import AccessibilityPage from './pages/AccessibilityPage';
import FleetPage from './pages/FleetPage';
import BudgetsPage from './pages/BudgetsPage';
import IncidentsPage from './pages/IncidentsPage';
import StaffPage from './pages/StaffPage';
import PerformancePage from './pages/PerformancePage';
import StopsPage from './pages/StopsPage';
import MaintenancePage from './pages/MaintenancePage';
import FeedbackPage from './pages/FeedbackPage';
import EnergyPage from './pages/EnergyPage';
import SafetyPage from './pages/SafetyPage';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  const P = (Component) => isAuthenticated ? <Component onLogout={handleLogout} /> : <Navigate to="/login" />;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        <Route path="/" element={P(Dashboard)} />
        <Route path="/routes" element={P(RoutesPage)} />
        <Route path="/ridership" element={P(RidershipPage)} />
        <Route path="/schedules" element={P(SchedulesPage)} />
        <Route path="/fares" element={P(FaresPage)} />
        <Route path="/accessibility" element={P(AccessibilityPage)} />
        <Route path="/fleet" element={P(FleetPage)} />
        <Route path="/budgets" element={P(BudgetsPage)} />
        <Route path="/incidents" element={P(IncidentsPage)} />
        <Route path="/staff" element={P(StaffPage)} />
        <Route path="/performance" element={P(PerformancePage)} />
        <Route path="/stops" element={P(StopsPage)} />
        <Route path="/maintenance" element={P(MaintenancePage)} />
        <Route path="/feedback" element={P(FeedbackPage)} />
        <Route path="/energy" element={P(EnergyPage)} />
        <Route path="/safety" element={P(SafetyPage)} />
      </Routes>
    </Router>
  );
}

export default App;
