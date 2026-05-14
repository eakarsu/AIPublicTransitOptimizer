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
import RiderChatPage from './pages/RiderChatPage';
import DemandForecastPage from './pages/DemandForecastPage';
import EquityReportPage from './pages/EquityReportPage';
import GTFSImportPage from './pages/GTFSImportPage';
import CrowdingPredictionPage from './pages/CrowdingPredictionPage';
import MaintenanceTriagePage from './pages/MaintenanceTriagePage';

// === Batch 07 Gaps & Frontend Mounts ===
import CfDynamicPricing from './pages/CfDynamicPricing';
import CfClimateresponsiveOperations from './pages/CfClimateresponsiveOperations';
import CfEquityImpactSimulation from './pages/CfEquityImpactSimulation';
import CfAutonomousShuttlePlanner from './pages/CfAutonomousShuttlePlanner';
import CfIntermodalTripPlanner from './pages/CfIntermodalTripPlanner';
import CfBehavioralNudging from './pages/CfBehavioralNudging';
import GapNoCrowdingpredictionPeakLoadsByStoptime from './pages/GapNoCrowdingpredictionPeakLoadsByStoptime';
import GapNoMaintenancetriageUptimemaximizingPriori from './pages/GapNoMaintenancetriageUptimemaximizingPriori';
import GapNoAccessibilitycompliancecheckAuditAgains from './pages/GapNoAccessibilitycompliancecheckAuditAgains';
import GapNoStaffingshiftoptimizationPreferenceaware from './pages/GapNoStaffingshiftoptimizationPreferenceaware';
import GapExistingEquityreportIsShallowComparedTo from './pages/GapExistingEquityreportIsShallowComparedTo';
import GapNoRealtimePassengerAlertsannouncementsSm from './pages/GapNoRealtimePassengerAlertsannouncementsSm';
import GapNoFarePaymentMobileTicketingIntegration from './pages/GapNoFarePaymentMobileTicketingIntegration';
import GapNoOperatorSchedulingConflictDetection from './pages/GapNoOperatorSchedulingConflictDetection';
import GapNoServicechangeImpactModelingRouteXDis from './pages/GapNoServicechangeImpactModelingRouteXDis';
import GapNoPublicWebhookopenDataApi from './pages/GapNoPublicWebhookopenDataApi';
import GapNoNotificationsSystemForStaff from './pages/GapNoNotificationsSystemForStaff';
import GapNoAuditLogOfDispatchDecisions from './pages/GapNoAuditLogOfDispatchDecisions';
// === End Batch 07 ===

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
        <Route path="/rider-chat" element={P(RiderChatPage)} />
        <Route path="/demand-forecast" element={P(DemandForecastPage)} />
        <Route path="/equity-report" element={P(EquityReportPage)} />
        <Route path="/gtfs-import" element={P(GTFSImportPage)} />
        <Route path="/crowding-prediction" element={P(CrowdingPredictionPage)} />
        <Route path="/maintenance-triage" element={P(MaintenanceTriagePage)} />
          // === Batch 07 Gaps & Frontend Mounts ===
          <Route path='/cf-dynamic-pricing' element={<CfDynamicPricing />} />
          <Route path='/cf-climateresponsive-operations' element={<CfClimateresponsiveOperations />} />
          <Route path='/cf-equity-impact-simulation' element={<CfEquityImpactSimulation />} />
          <Route path='/cf-autonomous-shuttle-planner' element={<CfAutonomousShuttlePlanner />} />
          <Route path='/cf-intermodal-trip-planner' element={<CfIntermodalTripPlanner />} />
          <Route path='/cf-behavioral-nudging' element={<CfBehavioralNudging />} />
          <Route path='/gap-no-crowdingprediction-peak-loads-by-stoptime' element={<GapNoCrowdingpredictionPeakLoadsByStoptime />} />
          <Route path='/gap-no-maintenancetriage-uptimemaximizing-priori' element={<GapNoMaintenancetriageUptimemaximizingPriori />} />
          <Route path='/gap-no-accessibilitycompliancecheck-audit-agains' element={<GapNoAccessibilitycompliancecheckAuditAgains />} />
          <Route path='/gap-no-staffingshiftoptimization-preferenceaware' element={<GapNoStaffingshiftoptimizationPreferenceaware />} />
          <Route path='/gap-existing-equityreport-is-shallow-compared-to' element={<GapExistingEquityreportIsShallowComparedTo />} />
          <Route path='/gap-no-realtime-passenger-alertsannouncements-sm' element={<GapNoRealtimePassengerAlertsannouncementsSm />} />
          <Route path='/gap-no-fare-payment-mobile-ticketing-integration' element={<GapNoFarePaymentMobileTicketingIntegration />} />
          <Route path='/gap-no-operator-scheduling-conflict-detection' element={<GapNoOperatorSchedulingConflictDetection />} />
          <Route path='/gap-no-servicechange-impact-modeling-route-x-dis' element={<GapNoServicechangeImpactModelingRouteXDis />} />
          <Route path='/gap-no-public-webhookopen-data-api' element={<GapNoPublicWebhookopenDataApi />} />
          <Route path='/gap-no-notifications-system-for-staff' element={<GapNoNotificationsSystemForStaff />} />
          <Route path='/gap-no-audit-log-of-dispatch-decisions' element={<GapNoAuditLogOfDispatchDecisions />} />
          // === End Batch 07 ===
      </Routes>
    </Router>
  );
}

export default App;
