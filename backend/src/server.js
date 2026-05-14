require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const routeRoutes = require('./routes/routes');
const ridershipRoutes = require('./routes/ridership');
const scheduleRoutes = require('./routes/schedules');
const fareRoutes = require('./routes/fares');
const accessibilityRoutes = require('./routes/accessibility');
const fleetRoutes = require('./routes/fleet');
const budgetRoutes = require('./routes/budgets');
const incidentRoutes = require('./routes/incidents');
const staffRoutes = require('./routes/staff');
const performanceRoutes = require('./routes/performance');
const stopRoutes = require('./routes/stops');
const maintenanceRoutes = require('./routes/maintenance');
const feedbackRoutes = require('./routes/feedback');
const energyRoutes = require('./routes/energy');
const safetyRoutes = require('./routes/safety');
const aiRoutes = require('./routes/ai');
const gtfsRoutes = require('./routes/gtfs');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/ridership', ridershipRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/fares', fareRoutes);
app.use('/api/accessibility', accessibilityRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/gtfs', gtfsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    await sequelize.sync({ alter: false });
    console.log('Models synchronized.');

    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

start();

// AI feature mount: dynamic-pricing
app.use('/api/ai/dynamic-pricing', require('./routes/ai-dynamic-pricing'));
// === Batch 07 Gaps & Frontend Mounts ===
app.use('/api/gap-no-crowdingprediction-peak-loads-by-stoptime', require('./routes/gap-no-crowdingprediction-peak-loads-by-stoptime'));
app.use('/api/gap-no-maintenancetriage-uptimemaximizing-priori', require('./routes/gap-no-maintenancetriage-uptimemaximizing-priori'));
app.use('/api/gap-no-accessibilitycompliancecheck-audit-agains', require('./routes/gap-no-accessibilitycompliancecheck-audit-agains'));
app.use('/api/gap-no-staffingshiftoptimization-preferenceaware', require('./routes/gap-no-staffingshiftoptimization-preferenceaware'));
app.use('/api/gap-existing-equityreport-is-shallow-compared-to', require('./routes/gap-existing-equityreport-is-shallow-compared-to'));
app.use('/api/gap-no-realtime-passenger-alertsannouncements-sm', require('./routes/gap-no-realtime-passenger-alertsannouncements-sm'));
app.use('/api/gap-no-fare-payment-mobile-ticketing-integration', require('./routes/gap-no-fare-payment-mobile-ticketing-integration'));
app.use('/api/gap-no-operator-scheduling-conflict-detection', require('./routes/gap-no-operator-scheduling-conflict-detection'));
app.use('/api/gap-no-servicechange-impact-modeling-route-x-dis', require('./routes/gap-no-servicechange-impact-modeling-route-x-dis'));
app.use('/api/gap-no-public-webhookopen-data-api', require('./routes/gap-no-public-webhookopen-data-api'));
app.use('/api/gap-no-notifications-system-for-staff', require('./routes/gap-no-notifications-system-for-staff'));
app.use('/api/gap-no-audit-log-of-dispatch-decisions', require('./routes/gap-no-audit-log-of-dispatch-decisions'));
// === End Batch 07 ===
