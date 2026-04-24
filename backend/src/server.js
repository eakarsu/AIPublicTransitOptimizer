require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
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

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    await sequelize.sync({ alter: true });
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
