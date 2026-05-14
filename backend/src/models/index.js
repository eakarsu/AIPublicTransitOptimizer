const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'transit_optimizer',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

// User Model
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'admin' },
});

// Route Model
const Route = sequelize.define('Route', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  routeNumber: { type: DataTypes.STRING, allowNull: false },
  startPoint: { type: DataTypes.STRING, allowNull: false },
  endPoint: { type: DataTypes.STRING, allowNull: false },
  distance: { type: DataTypes.FLOAT },
  estimatedTime: { type: DataTypes.INTEGER },
  stops: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  type: { type: DataTypes.STRING, defaultValue: 'bus' },
  frequency: { type: DataTypes.STRING },
});

// Ridership Model
const Ridership = sequelize.define('Ridership', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  routeName: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  dailyRiders: { type: DataTypes.INTEGER, allowNull: false },
  peakHourRiders: { type: DataTypes.INTEGER },
  offPeakRiders: { type: DataTypes.INTEGER },
  weekendRiders: { type: DataTypes.INTEGER },
  trend: { type: DataTypes.STRING },
  satisfaction: { type: DataTypes.FLOAT },
  loadFactor: { type: DataTypes.FLOAT },
});

// Schedule Model
const Schedule = sequelize.define('Schedule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  routeName: { type: DataTypes.STRING, allowNull: false },
  dayType: { type: DataTypes.STRING, allowNull: false },
  firstDeparture: { type: DataTypes.STRING, allowNull: false },
  lastDeparture: { type: DataTypes.STRING, allowNull: false },
  peakFrequency: { type: DataTypes.INTEGER },
  offPeakFrequency: { type: DataTypes.INTEGER },
  totalTrips: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  effectiveDate: { type: DataTypes.DATEONLY },
});

// Fare Model
const Fare = sequelize.define('Fare', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  fareType: { type: DataTypes.STRING, allowNull: false },
  basePrice: { type: DataTypes.FLOAT, allowNull: false },
  discountedPrice: { type: DataTypes.FLOAT },
  zone: { type: DataTypes.STRING },
  passengerType: { type: DataTypes.STRING },
  validityPeriod: { type: DataTypes.STRING },
  revenue: { type: DataTypes.FLOAT },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
});

// Accessibility Model
const Accessibility = sequelize.define('Accessibility', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  stationName: { type: DataTypes.STRING, allowNull: false },
  wheelchairAccess: { type: DataTypes.BOOLEAN, defaultValue: false },
  elevatorAvailable: { type: DataTypes.BOOLEAN, defaultValue: false },
  tactilePaving: { type: DataTypes.BOOLEAN, defaultValue: false },
  audioAnnouncements: { type: DataTypes.BOOLEAN, defaultValue: false },
  brailleSignage: { type: DataTypes.BOOLEAN, defaultValue: false },
  lowFloorVehicles: { type: DataTypes.BOOLEAN, defaultValue: false },
  complianceScore: { type: DataTypes.FLOAT },
  lastAuditDate: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.STRING, defaultValue: 'compliant' },
  notes: { type: DataTypes.TEXT },
});

// Fleet Model
const Fleet = sequelize.define('Fleet', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vehicleId: { type: DataTypes.STRING, unique: true, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  make: { type: DataTypes.STRING },
  model: { type: DataTypes.STRING },
  year: { type: DataTypes.INTEGER },
  capacity: { type: DataTypes.INTEGER },
  fuelType: { type: DataTypes.STRING },
  mileage: { type: DataTypes.FLOAT },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  assignedRoute: { type: DataTypes.STRING },
  lastMaintenance: { type: DataTypes.DATEONLY },
  nextMaintenance: { type: DataTypes.DATEONLY },
});

// Budget & Contracts Model
const Budget = sequelize.define('Budget', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  contractType: { type: DataTypes.STRING, allowNull: false },
  vendor: { type: DataTypes.STRING },
  totalAmount: { type: DataTypes.FLOAT, allowNull: false },
  spentAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
  startDate: { type: DataTypes.DATEONLY },
  endDate: { type: DataTypes.DATEONLY },
  department: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  notes: { type: DataTypes.TEXT },
});

// Incidents & Alerts Model
const Incident = sequelize.define('Incident', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  severity: { type: DataTypes.STRING, allowNull: false },
  routeAffected: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  reportedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  resolvedAt: { type: DataTypes.DATE },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'open' },
  assignedTo: { type: DataTypes.STRING },
});

// Staff Management Model
const Staff = sequelize.define('Staff', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employeeId: { type: DataTypes.STRING, unique: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false },
  department: { type: DataTypes.STRING },
  assignedRoute: { type: DataTypes.STRING },
  hireDate: { type: DataTypes.DATEONLY },
  certifications: { type: DataTypes.STRING },
  shiftType: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
});

// Performance KPIs Model
const Performance = sequelize.define('Performance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  metricName: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  currentValue: { type: DataTypes.FLOAT, allowNull: false },
  targetValue: { type: DataTypes.FLOAT },
  unit: { type: DataTypes.STRING },
  period: { type: DataTypes.STRING },
  trend: { type: DataTypes.STRING },
  lastUpdated: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.STRING, defaultValue: 'on-track' },
  notes: { type: DataTypes.TEXT },
});

// Stops & Stations Model
const Stop = sequelize.define('Stop', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  stopCode: { type: DataTypes.STRING, unique: true },
  type: { type: DataTypes.STRING, allowNull: false },
  latitude: { type: DataTypes.FLOAT },
  longitude: { type: DataTypes.FLOAT },
  zone: { type: DataTypes.STRING },
  shelterAvailable: { type: DataTypes.BOOLEAN, defaultValue: false },
  benchAvailable: { type: DataTypes.BOOLEAN, defaultValue: false },
  digitalDisplay: { type: DataTypes.BOOLEAN, defaultValue: false },
  routesServed: { type: DataTypes.STRING },
  dailyBoardings: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
});

// Maintenance Logs Model
const Maintenance = sequelize.define('Maintenance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vehicleId: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  scheduledDate: { type: DataTypes.DATEONLY },
  completedDate: { type: DataTypes.DATEONLY },
  cost: { type: DataTypes.FLOAT },
  technician: { type: DataTypes.STRING },
  partsUsed: { type: DataTypes.TEXT },
  mileageAtService: { type: DataTypes.FLOAT },
  status: { type: DataTypes.STRING, defaultValue: 'scheduled' },
  priority: { type: DataTypes.STRING, defaultValue: 'normal' },
});

// Passenger Feedback Model
const Feedback = sequelize.define('Feedback', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ticketNumber: { type: DataTypes.STRING, unique: true },
  category: { type: DataTypes.STRING, allowNull: false },
  subject: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  routeAffected: { type: DataTypes.STRING },
  passengerName: { type: DataTypes.STRING },
  passengerEmail: { type: DataTypes.STRING },
  rating: { type: DataTypes.INTEGER },
  submittedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.STRING, defaultValue: 'open' },
  resolution: { type: DataTypes.TEXT },
});

// Energy & Sustainability Model
const Energy = sequelize.define('Energy', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  metricName: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  currentValue: { type: DataTypes.FLOAT, allowNull: false },
  previousValue: { type: DataTypes.FLOAT },
  unit: { type: DataTypes.STRING },
  targetValue: { type: DataTypes.FLOAT },
  period: { type: DataTypes.STRING },
  vehicleType: { type: DataTypes.STRING },
  co2Saved: { type: DataTypes.FLOAT },
  status: { type: DataTypes.STRING, defaultValue: 'on-track' },
  notes: { type: DataTypes.TEXT },
});

// Safety & Compliance Model
const Safety = sequelize.define('Safety', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  inspectionType: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  inspector: { type: DataTypes.STRING },
  inspectionDate: { type: DataTypes.DATEONLY },
  nextInspection: { type: DataTypes.DATEONLY },
  findings: { type: DataTypes.TEXT },
  riskLevel: { type: DataTypes.STRING, defaultValue: 'low' },
  correctiveAction: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'passed' },
  score: { type: DataTypes.FLOAT },
});

// AiAnalysis Model
const AiAnalysis = sequelize.define('AiAnalysis', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: true },
  endpoint: { type: DataTypes.STRING(200), allowNull: false },
  inputData: { type: DataTypes.JSONB },
  result: { type: DataTypes.TEXT },
});

module.exports = {
  sequelize,
  User,
  Route,
  Ridership,
  Schedule,
  Fare,
  Accessibility,
  Fleet,
  Budget,
  Incident,
  Staff,
  Performance,
  Stop,
  Maintenance,
  Feedback,
  Energy,
  Safety,
  AiAnalysis,
};
