import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { routesAPI, ridershipAPI, schedulesAPI, faresAPI, accessibilityAPI, fleetAPI, budgetsAPI, incidentsAPI, staffAPI, performanceAPI, stopsAPI, maintenanceAPI, feedbackAPI, energyAPI, safetyAPI } from '../services/api';

function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState({});
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    setLoading(true);
    const apis = [
      ['routes', routesAPI], ['ridership', ridershipAPI], ['schedules', schedulesAPI],
      ['fares', faresAPI], ['accessibility', accessibilityAPI], ['fleet', fleetAPI],
      ['budgets', budgetsAPI], ['incidents', incidentsAPI], ['staff', staffAPI],
      ['performance', performanceAPI], ['stops', stopsAPI], ['maintenance', maintenanceAPI],
      ['feedback', feedbackAPI], ['energy', energyAPI], ['safety', safetyAPI],
    ];
    Promise.all(apis.map(([key, api]) => api.getAll().then(r => [key, r.data]).catch(() => [key, []])))
      .then(results => {
        const s = {};
        const d = {};
        results.forEach(([key, data]) => { s[key] = data.length; d[key] = data; });
        setStats(s);
        setAllData(d);

        // Generate smart alerts from data
        const a = [];
        const openIncidents = (d.incidents || []).filter(i => i.status === 'open' || i.status === 'investigating');
        if (openIncidents.length > 0) {
          a.push({ type: 'danger', icon: '🚨', title: `${openIncidents.length} Open Incident${openIncidents.length > 1 ? 's' : ''}`, desc: `${openIncidents.filter(i => i.severity === 'critical' || i.severity === 'high').length} are high/critical severity`, path: '/incidents' });
        }
        const maintenanceDue = (d.maintenance || []).filter(m => m.status === 'scheduled');
        if (maintenanceDue.length > 0) {
          a.push({ type: 'warning', icon: '🔧', title: `${maintenanceDue.length} Scheduled Maintenance`, desc: 'Vehicles awaiting service', path: '/maintenance' });
        }
        const nonCompliant = (d.accessibility || []).filter(ac => ac.status === 'non-compliant');
        if (nonCompliant.length > 0) {
          a.push({ type: 'danger', icon: '♿', title: `${nonCompliant.length} Non-Compliant Station${nonCompliant.length > 1 ? 's' : ''}`, desc: 'Accessibility compliance issues need attention', path: '/accessibility' });
        }
        const openFeedback = (d.feedback || []).filter(f => f.status === 'open');
        if (openFeedback.length > 0) {
          a.push({ type: 'info', icon: '💬', title: `${openFeedback.length} Open Feedback Ticket${openFeedback.length > 1 ? 's' : ''}`, desc: 'Passenger feedback awaiting review', path: '/feedback' });
        }
        const belowTarget = (d.performance || []).filter(p => p.status === 'below-target');
        if (belowTarget.length > 0) {
          a.push({ type: 'warning', icon: '📈', title: `${belowTarget.length} KPI${belowTarget.length > 1 ? 's' : ''} Below Target`, desc: 'Performance metrics need attention', path: '/performance' });
        }
        const retiredVehicles = (d.fleet || []).filter(f => f.status === 'retired');
        const maintenanceVehicles = (d.fleet || []).filter(f => f.status === 'maintenance');
        if (maintenanceVehicles.length > 0) {
          a.push({ type: 'warning', icon: '🚍', title: `${maintenanceVehicles.length} Vehicle${maintenanceVehicles.length > 1 ? 's' : ''} in Maintenance`, desc: `${retiredVehicles.length} retired`, path: '/fleet' });
        }
        const failedSafety = (d.safety || []).filter(s => s.status === 'failed' || s.status === 'action-required');
        if (failedSafety.length > 0) {
          a.push({ type: 'danger', icon: '🛡️', title: `${failedSafety.length} Safety Issue${failedSafety.length > 1 ? 's' : ''}`, desc: 'Failed inspections or action required', path: '/safety' });
        }
        if (a.length === 0) {
          a.push({ type: 'success', icon: '✅', title: 'All Systems Operational', desc: 'No critical alerts at this time', path: '/' });
        }
        setAlerts(a);
        setLoading(false);
      });
  }, []);

  // Compute quick stats
  const activeRoutes = (allData.routes || []).filter(r => r.status === 'active').length;
  const activeVehicles = (allData.fleet || []).filter(f => f.status === 'active').length;
  const activeStaff = (allData.staff || []).filter(s => s.status === 'active').length;
  const totalRiders = (allData.ridership || []).reduce((sum, r) => sum + (Number(r.dailyRiders) || 0), 0);

  const cards = [
    { key: 'route', title: 'Route Planning', desc: 'Optimize transit routes for maximum coverage and efficiency', icon: '🗺️', path: '/routes', count: stats.routes, label: 'Routes' },
    { key: 'ridership', title: 'Ridership Data', desc: 'Analyze passenger patterns and demand forecasting', icon: '📊', path: '/ridership', count: stats.ridership, label: 'Records' },
    { key: 'schedule', title: 'Schedule Optimization', desc: 'AI-powered schedule planning and frequency adjustment', icon: '🕐', path: '/schedules', count: stats.schedules, label: 'Schedules' },
    { key: 'fare', title: 'Fare Modeling', desc: 'Revenue optimization with equity-focused fare structures', icon: '💰', path: '/fares', count: stats.fares, label: 'Fare Types' },
    { key: 'accessibility', title: 'Accessibility Compliance', desc: 'ADA compliance tracking and remediation planning', icon: '♿', path: '/accessibility', count: stats.accessibility, label: 'Stations' },
    { key: 'fleet', title: 'Fleet Allocation', desc: 'Vehicle lifecycle management and route assignment', icon: '🚍', path: '/fleet', count: stats.fleet, label: 'Vehicles' },
    { key: 'budget', title: 'Budget & Contracts', desc: 'Government budgets, multi-year contracts, vendor management', icon: '📋', path: '/budgets', count: stats.budgets, label: 'Contracts' },
    { key: 'incident', title: 'Incidents & Alerts', desc: 'Real-time incident tracking and response management', icon: '🚨', path: '/incidents', count: stats.incidents, label: 'Incidents' },
    { key: 'staff', title: 'Staff Management', desc: 'Workforce scheduling, certifications, and allocation', icon: '👥', path: '/staff', count: stats.staff, label: 'Employees' },
    { key: 'performance', title: 'Performance KPIs', desc: 'Key performance indicators and transit benchmarks', icon: '📈', path: '/performance', count: stats.performance, label: 'Metrics' },
    { key: 'stops', title: 'Stops & Stations', desc: 'Stop infrastructure, amenities, and utilization data', icon: '🚏', path: '/stops', count: stats.stops, label: 'Stops' },
    { key: 'maintenance', title: 'Maintenance Logs', desc: 'Vehicle maintenance scheduling and cost tracking', icon: '🔧', path: '/maintenance', count: stats.maintenance, label: 'Records' },
    { key: 'feedback', title: 'Passenger Feedback', desc: 'Customer complaints, compliments, and suggestions', icon: '💬', path: '/feedback', count: stats.feedback, label: 'Tickets' },
    { key: 'energy', title: 'Energy & Sustainability', desc: 'Green transit metrics, emissions, and efficiency tracking', icon: '🌱', path: '/energy', count: stats.energy, label: 'Metrics' },
    { key: 'safety', title: 'Safety & Compliance', desc: 'Safety inspections, risk assessment, and regulatory compliance', icon: '🛡️', path: '/safety', count: stats.safety, label: 'Inspections' },
  ];

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p style={{ color: '#94a3b8', marginTop: 4 }}>Welcome back, {user.name || 'Administrator'}</p>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <div className="spinner" style={{ margin: '0 auto 12px', width: 32, height: 32, border: '3px solid #334155', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            Loading dashboard data...
          </div>
        )}

        {!loading && (
          <>
            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="quick-stat">
                <div className="quick-stat-label">Active Routes</div>
                <div className="quick-stat-value">{activeRoutes}</div>
                <div className={`quick-stat-change ${activeRoutes > 0 ? 'positive' : 'neutral'}`}>of {stats.routes || 0} total</div>
              </div>
              <div className="quick-stat">
                <div className="quick-stat-label">Active Vehicles</div>
                <div className="quick-stat-value">{activeVehicles}</div>
                <div className={`quick-stat-change ${activeVehicles > 0 ? 'positive' : 'neutral'}`}>of {stats.fleet || 0} total</div>
              </div>
              <div className="quick-stat">
                <div className="quick-stat-label">Active Staff</div>
                <div className="quick-stat-value">{activeStaff}</div>
                <div className={`quick-stat-change ${activeStaff > 0 ? 'positive' : 'neutral'}`}>of {stats.staff || 0} total</div>
              </div>
              <div className="quick-stat">
                <div className="quick-stat-label">Total Daily Riders</div>
                <div className="quick-stat-value">{totalRiders.toLocaleString()}</div>
                <div className="quick-stat-change neutral">across all routes</div>
              </div>
            </div>

            {/* Alerts Section */}
            <div className="dashboard-section">
              <h2>Alerts & Notifications</h2>
              <div className="alerts-list">
                {alerts.map((alert, i) => (
                  <div key={i} className={`alert-item alert-${alert.type}`} onClick={() => navigate(alert.path)}>
                    <div className="alert-icon">{alert.icon}</div>
                    <div className="alert-content">
                      <div className="alert-title">{alert.title}</div>
                      <div className="alert-desc">{alert.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="dashboard-cards">
          {cards.map(card => (
            <div key={card.key} className={`dashboard-card ${card.key}`} onClick={() => navigate(card.path)}>
              <div className="card-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
              <div className="card-stats">
                <div className="stat">
                  <div className="stat-value">{loading ? '...' : (card.count || 0)}</div>
                  <div className="stat-label">{card.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ onLogout, user, active }) {
  const navItems = [
    { key: 'dashboard', path: '/', icon: '📋', label: 'Dashboard' },
    { key: 'routes', path: '/routes', icon: '🗺️', label: 'Route Planning' },
    { key: 'ridership', path: '/ridership', icon: '📊', label: 'Ridership Data' },
    { key: 'schedules', path: '/schedules', icon: '🕐', label: 'Schedules' },
    { key: 'fares', path: '/fares', icon: '💰', label: 'Fare Modeling' },
    { key: 'accessibility', path: '/accessibility', icon: '♿', label: 'Accessibility' },
    { key: 'fleet', path: '/fleet', icon: '🚍', label: 'Fleet Allocation' },
    { key: 'budgets', path: '/budgets', icon: '📋', label: 'Budget & Contracts' },
    { key: 'incidents', path: '/incidents', icon: '🚨', label: 'Incidents' },
    { key: 'staff', path: '/staff', icon: '👥', label: 'Staff Management' },
    { key: 'performance', path: '/performance', icon: '📈', label: 'Performance KPIs' },
    { key: 'stops', path: '/stops', icon: '🚏', label: 'Stops & Stations' },
    { key: 'maintenance', path: '/maintenance', icon: '🔧', label: 'Maintenance' },
    { key: 'feedback', path: '/feedback', icon: '💬', label: 'Feedback' },
    { key: 'energy', path: '/energy', icon: '🌱', label: 'Energy' },
    { key: 'safety', path: '/safety', icon: '🛡️', label: 'Safety' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🚌 Transit AI</h2>
        <div className="sub">Public Transit Optimizer</div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <Link key={item.key} to={item.path} className={active === item.key ? 'active' : ''}>
            <span className="nav-icon">{item.icon}</span> {item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>{user?.name || 'Admin'}</div>
        <button className="btn-logout" onClick={onLogout}>Sign Out</button>
      </div>
    </div>
  );
}

export default Dashboard;
