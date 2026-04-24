require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const bcrypt = require('bcryptjs');
const { sequelize, User, Route, Ridership, Schedule, Fare, Accessibility, Fleet, Budget, Incident, Staff, Performance, Stop, Maintenance, Feedback, Energy, Safety } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    await sequelize.sync({ force: true });
    console.log('Tables created.');

    // Seed Users
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.bulkCreate([
      { email: 'admin@transit.gov', password: hashedPassword, name: 'Transit Admin', role: 'admin' },
      { email: 'planner@transit.gov', password: hashedPassword, name: 'Route Planner', role: 'planner' },
    ]);
    console.log('Users seeded.');

    // Seed Routes (15 items)
    await Route.bulkCreate([
      { name: 'Downtown Express', routeNumber: 'RT-001', startPoint: 'Central Station', endPoint: 'Financial District', distance: 8.5, estimatedTime: 25, stops: 6, status: 'active', type: 'bus', frequency: '10 min' },
      { name: 'Airport Shuttle', routeNumber: 'RT-002', startPoint: 'Central Station', endPoint: 'International Airport', distance: 22.3, estimatedTime: 45, stops: 4, status: 'active', type: 'express', frequency: '15 min' },
      { name: 'University Loop', routeNumber: 'RT-003', startPoint: 'University Campus', endPoint: 'Student Housing', distance: 5.2, estimatedTime: 18, stops: 8, status: 'active', type: 'bus', frequency: '8 min' },
      { name: 'Suburban Connector', routeNumber: 'RT-004', startPoint: 'Oakville Terminal', endPoint: 'Central Station', distance: 15.7, estimatedTime: 40, stops: 12, status: 'active', type: 'bus', frequency: '20 min' },
      { name: 'Waterfront Line', routeNumber: 'RT-005', startPoint: 'Marina Bay', endPoint: 'Harbor Point', distance: 6.8, estimatedTime: 22, stops: 7, status: 'active', type: 'tram', frequency: '12 min' },
      { name: 'Hospital Circulator', routeNumber: 'RT-006', startPoint: 'City Medical Center', endPoint: 'Regional Hospital', distance: 4.1, estimatedTime: 15, stops: 5, status: 'active', type: 'bus', frequency: '10 min' },
      { name: 'Industrial Park Express', routeNumber: 'RT-007', startPoint: 'Central Station', endPoint: 'Industrial Zone', distance: 18.4, estimatedTime: 35, stops: 3, status: 'active', type: 'express', frequency: '25 min' },
      { name: 'Night Owl Service', routeNumber: 'RT-008', startPoint: 'Entertainment District', endPoint: 'Residential North', distance: 12.0, estimatedTime: 30, stops: 9, status: 'active', type: 'bus', frequency: '30 min' },
      { name: 'Metro Blue Line', routeNumber: 'RT-009', startPoint: 'Westside Terminal', endPoint: 'Eastside Mall', distance: 19.5, estimatedTime: 38, stops: 14, status: 'active', type: 'metro', frequency: '6 min' },
      { name: 'Crosstown Route', routeNumber: 'RT-010', startPoint: 'North Station', endPoint: 'South Terminal', distance: 16.2, estimatedTime: 42, stops: 15, status: 'active', type: 'bus', frequency: '15 min' },
      { name: 'School Special', routeNumber: 'RT-011', startPoint: 'Residential East', endPoint: 'School District Hub', distance: 7.3, estimatedTime: 20, stops: 10, status: 'active', type: 'bus', frequency: '30 min' },
      { name: 'Shopping Center Link', routeNumber: 'RT-012', startPoint: 'Downtown Mall', endPoint: 'Outlet Village', distance: 9.8, estimatedTime: 28, stops: 6, status: 'active', type: 'bus', frequency: '20 min' },
      { name: 'Park & Ride Express', routeNumber: 'RT-013', startPoint: 'P&R Lot A', endPoint: 'City Center', distance: 11.5, estimatedTime: 22, stops: 2, status: 'active', type: 'express', frequency: '10 min' },
      { name: 'Senior Community Route', routeNumber: 'RT-014', startPoint: 'Senior Living Center', endPoint: 'Community Hospital', distance: 3.9, estimatedTime: 12, stops: 4, status: 'active', type: 'minibus', frequency: '15 min' },
      { name: 'Tech Campus Shuttle', routeNumber: 'RT-015', startPoint: 'Tech Park Station', endPoint: 'Innovation Hub', distance: 6.1, estimatedTime: 16, stops: 5, status: 'active', type: 'shuttle', frequency: '8 min' },
    ]);
    console.log('Routes seeded.');

    // Seed Ridership (15 items)
    await Ridership.bulkCreate([
      { routeName: 'Downtown Express', date: '2024-03-01', dailyRiders: 4500, peakHourRiders: 1800, offPeakRiders: 2700, weekendRiders: 2100, trend: 'increasing', satisfaction: 4.2, loadFactor: 85 },
      { routeName: 'Airport Shuttle', date: '2024-03-01', dailyRiders: 3200, peakHourRiders: 1400, offPeakRiders: 1800, weekendRiders: 3500, trend: 'stable', satisfaction: 4.5, loadFactor: 72 },
      { routeName: 'University Loop', date: '2024-03-01', dailyRiders: 5800, peakHourRiders: 2800, offPeakRiders: 3000, weekendRiders: 1200, trend: 'increasing', satisfaction: 3.8, loadFactor: 92 },
      { routeName: 'Suburban Connector', date: '2024-03-01', dailyRiders: 2800, peakHourRiders: 1600, offPeakRiders: 1200, weekendRiders: 900, trend: 'decreasing', satisfaction: 3.5, loadFactor: 65 },
      { routeName: 'Waterfront Line', date: '2024-03-01', dailyRiders: 3600, peakHourRiders: 1200, offPeakRiders: 2400, weekendRiders: 4200, trend: 'increasing', satisfaction: 4.6, loadFactor: 78 },
      { routeName: 'Hospital Circulator', date: '2024-03-01', dailyRiders: 2200, peakHourRiders: 900, offPeakRiders: 1300, weekendRiders: 1800, trend: 'stable', satisfaction: 4.1, loadFactor: 70 },
      { routeName: 'Industrial Park Express', date: '2024-03-01', dailyRiders: 1800, peakHourRiders: 1200, offPeakRiders: 600, weekendRiders: 200, trend: 'stable', satisfaction: 3.9, loadFactor: 55 },
      { routeName: 'Night Owl Service', date: '2024-03-01', dailyRiders: 800, peakHourRiders: 400, offPeakRiders: 400, weekendRiders: 1500, trend: 'increasing', satisfaction: 3.6, loadFactor: 45 },
      { routeName: 'Metro Blue Line', date: '2024-03-01', dailyRiders: 12000, peakHourRiders: 5500, offPeakRiders: 6500, weekendRiders: 8000, trend: 'increasing', satisfaction: 4.3, loadFactor: 88 },
      { routeName: 'Crosstown Route', date: '2024-03-01', dailyRiders: 3100, peakHourRiders: 1500, offPeakRiders: 1600, weekendRiders: 1800, trend: 'stable', satisfaction: 3.7, loadFactor: 68 },
      { routeName: 'School Special', date: '2024-03-01', dailyRiders: 1500, peakHourRiders: 1200, offPeakRiders: 300, weekendRiders: 0, trend: 'stable', satisfaction: 4.0, loadFactor: 80 },
      { routeName: 'Shopping Center Link', date: '2024-03-01', dailyRiders: 2400, peakHourRiders: 800, offPeakRiders: 1600, weekendRiders: 3800, trend: 'increasing', satisfaction: 4.1, loadFactor: 62 },
      { routeName: 'Park & Ride Express', date: '2024-03-01', dailyRiders: 3800, peakHourRiders: 2200, offPeakRiders: 1600, weekendRiders: 500, trend: 'increasing', satisfaction: 4.4, loadFactor: 82 },
      { routeName: 'Senior Community Route', date: '2024-03-01', dailyRiders: 600, peakHourRiders: 200, offPeakRiders: 400, weekendRiders: 300, trend: 'stable', satisfaction: 4.7, loadFactor: 40 },
      { routeName: 'Tech Campus Shuttle', date: '2024-03-01', dailyRiders: 4200, peakHourRiders: 2000, offPeakRiders: 2200, weekendRiders: 600, trend: 'increasing', satisfaction: 4.3, loadFactor: 75 },
    ]);
    console.log('Ridership seeded.');

    // Seed Schedules (15 items)
    await Schedule.bulkCreate([
      { routeName: 'Downtown Express', dayType: 'Weekday', firstDeparture: '05:30', lastDeparture: '23:00', peakFrequency: 10, offPeakFrequency: 15, totalTrips: 72, status: 'active', effectiveDate: '2024-01-15' },
      { routeName: 'Airport Shuttle', dayType: 'Daily', firstDeparture: '04:00', lastDeparture: '00:30', peakFrequency: 15, offPeakFrequency: 20, totalTrips: 56, status: 'active', effectiveDate: '2024-01-15' },
      { routeName: 'University Loop', dayType: 'Weekday', firstDeparture: '06:30', lastDeparture: '22:00', peakFrequency: 8, offPeakFrequency: 12, totalTrips: 80, status: 'active', effectiveDate: '2024-01-15' },
      { routeName: 'Suburban Connector', dayType: 'Weekday', firstDeparture: '05:00', lastDeparture: '22:30', peakFrequency: 20, offPeakFrequency: 30, totalTrips: 42, status: 'active', effectiveDate: '2024-01-15' },
      { routeName: 'Waterfront Line', dayType: 'Daily', firstDeparture: '06:00', lastDeparture: '23:30', peakFrequency: 12, offPeakFrequency: 15, totalTrips: 65, status: 'active', effectiveDate: '2024-01-15' },
      { routeName: 'Hospital Circulator', dayType: 'Daily', firstDeparture: '05:30', lastDeparture: '22:00', peakFrequency: 10, offPeakFrequency: 15, totalTrips: 66, status: 'active', effectiveDate: '2024-01-15' },
      { routeName: 'Industrial Park Express', dayType: 'Weekday', firstDeparture: '05:00', lastDeparture: '20:00', peakFrequency: 25, offPeakFrequency: 40, totalTrips: 28, status: 'active', effectiveDate: '2024-01-15' },
      { routeName: 'Night Owl Service', dayType: 'Fri-Sat', firstDeparture: '22:00', lastDeparture: '04:00', peakFrequency: 30, offPeakFrequency: 30, totalTrips: 12, status: 'active', effectiveDate: '2024-01-15' },
      { routeName: 'Metro Blue Line', dayType: 'Daily', firstDeparture: '05:00', lastDeparture: '00:00', peakFrequency: 6, offPeakFrequency: 10, totalTrips: 120, status: 'active', effectiveDate: '2024-01-15' },
      { routeName: 'Crosstown Route', dayType: 'Weekday', firstDeparture: '05:30', lastDeparture: '22:30', peakFrequency: 15, offPeakFrequency: 20, totalTrips: 52, status: 'active', effectiveDate: '2024-01-15' },
      { routeName: 'School Special', dayType: 'School Days', firstDeparture: '06:30', lastDeparture: '16:30', peakFrequency: 30, offPeakFrequency: 60, totalTrips: 14, status: 'active', effectiveDate: '2024-01-15' },
      { routeName: 'Shopping Center Link', dayType: 'Daily', firstDeparture: '08:00', lastDeparture: '21:00', peakFrequency: 20, offPeakFrequency: 25, totalTrips: 34, status: 'active', effectiveDate: '2024-01-15' },
      { routeName: 'Park & Ride Express', dayType: 'Weekday', firstDeparture: '06:00', lastDeparture: '20:00', peakFrequency: 10, offPeakFrequency: 20, totalTrips: 48, status: 'active', effectiveDate: '2024-01-15' },
      { routeName: 'Senior Community Route', dayType: 'Weekday', firstDeparture: '07:00', lastDeparture: '18:00', peakFrequency: 15, offPeakFrequency: 20, totalTrips: 36, status: 'active', effectiveDate: '2024-01-15' },
      { routeName: 'Tech Campus Shuttle', dayType: 'Weekday', firstDeparture: '06:00', lastDeparture: '21:00', peakFrequency: 8, offPeakFrequency: 15, totalTrips: 62, status: 'active', effectiveDate: '2024-01-15' },
    ]);
    console.log('Schedules seeded.');

    // Seed Fares (15 items)
    await Fare.bulkCreate([
      { name: 'Standard Adult', fareType: 'single', basePrice: 2.50, discountedPrice: null, zone: 'Zone 1', passengerType: 'adult', validityPeriod: '2 hours', revenue: 125000, status: 'active' },
      { name: 'Student Pass', fareType: 'monthly', basePrice: 45.00, discountedPrice: 35.00, zone: 'All Zones', passengerType: 'student', validityPeriod: '30 days', revenue: 89000, status: 'active' },
      { name: 'Senior Discount', fareType: 'single', basePrice: 1.25, discountedPrice: null, zone: 'Zone 1', passengerType: 'senior', validityPeriod: '2 hours', revenue: 32000, status: 'active' },
      { name: 'Day Pass', fareType: 'daily', basePrice: 7.00, discountedPrice: 5.50, zone: 'All Zones', passengerType: 'adult', validityPeriod: '24 hours', revenue: 156000, status: 'active' },
      { name: 'Weekly Pass', fareType: 'weekly', basePrice: 25.00, discountedPrice: 20.00, zone: 'Zone 1-2', passengerType: 'adult', validityPeriod: '7 days', revenue: 210000, status: 'active' },
      { name: 'Monthly Unlimited', fareType: 'monthly', basePrice: 85.00, discountedPrice: null, zone: 'All Zones', passengerType: 'adult', validityPeriod: '30 days', revenue: 425000, status: 'active' },
      { name: 'Airport Express', fareType: 'single', basePrice: 12.00, discountedPrice: 9.00, zone: 'Express', passengerType: 'adult', validityPeriod: 'one-way', revenue: 98000, status: 'active' },
      { name: 'Family Day Pass', fareType: 'daily', basePrice: 15.00, discountedPrice: null, zone: 'All Zones', passengerType: 'family', validityPeriod: '24 hours', revenue: 45000, status: 'active' },
      { name: 'Off-Peak Single', fareType: 'single', basePrice: 1.75, discountedPrice: null, zone: 'Zone 1', passengerType: 'adult', validityPeriod: '2 hours', revenue: 67000, status: 'active' },
      { name: 'Zone 2 Extension', fareType: 'single', basePrice: 1.50, discountedPrice: null, zone: 'Zone 2', passengerType: 'adult', validityPeriod: 'add-on', revenue: 38000, status: 'active' },
      { name: 'Annual Pass', fareType: 'annual', basePrice: 900.00, discountedPrice: 750.00, zone: 'All Zones', passengerType: 'adult', validityPeriod: '365 days', revenue: 540000, status: 'active' },
      { name: 'Disability Free', fareType: 'single', basePrice: 0.00, discountedPrice: null, zone: 'All Zones', passengerType: 'disabled', validityPeriod: 'unlimited', revenue: 0, status: 'active' },
      { name: 'Child Fare', fareType: 'single', basePrice: 1.00, discountedPrice: null, zone: 'Zone 1', passengerType: 'child', validityPeriod: '2 hours', revenue: 22000, status: 'active' },
      { name: 'Corporate Monthly', fareType: 'monthly', basePrice: 75.00, discountedPrice: 60.00, zone: 'All Zones', passengerType: 'corporate', validityPeriod: '30 days', revenue: 380000, status: 'active' },
      { name: 'Tourist 3-Day', fareType: 'multi-day', basePrice: 18.00, discountedPrice: null, zone: 'All Zones', passengerType: 'tourist', validityPeriod: '72 hours', revenue: 72000, status: 'active' },
    ]);
    console.log('Fares seeded.');

    // Seed Accessibility (15 items)
    await Accessibility.bulkCreate([
      { stationName: 'Central Station', wheelchairAccess: true, elevatorAvailable: true, tactilePaving: true, audioAnnouncements: true, brailleSignage: true, lowFloorVehicles: true, complianceScore: 98, lastAuditDate: '2024-01-10', status: 'compliant', notes: 'Fully ADA compliant, recently renovated' },
      { stationName: 'Financial District', wheelchairAccess: true, elevatorAvailable: true, tactilePaving: true, audioAnnouncements: true, brailleSignage: false, lowFloorVehicles: true, complianceScore: 88, lastAuditDate: '2024-01-12', status: 'compliant', notes: 'Braille signage installation scheduled Q2' },
      { stationName: 'University Campus', wheelchairAccess: true, elevatorAvailable: false, tactilePaving: true, audioAnnouncements: true, brailleSignage: true, lowFloorVehicles: true, complianceScore: 82, lastAuditDate: '2024-01-15', status: 'partial', notes: 'Elevator installation in progress' },
      { stationName: 'Oakville Terminal', wheelchairAccess: true, elevatorAvailable: true, tactilePaving: false, audioAnnouncements: true, brailleSignage: false, lowFloorVehicles: true, complianceScore: 75, lastAuditDate: '2024-01-18', status: 'partial', notes: 'Tactile paving and braille pending' },
      { stationName: 'Marina Bay', wheelchairAccess: true, elevatorAvailable: true, tactilePaving: true, audioAnnouncements: true, brailleSignage: true, lowFloorVehicles: true, complianceScore: 96, lastAuditDate: '2024-01-20', status: 'compliant', notes: 'Modern station, full compliance' },
      { stationName: 'City Medical Center', wheelchairAccess: true, elevatorAvailable: true, tactilePaving: true, audioAnnouncements: true, brailleSignage: true, lowFloorVehicles: true, complianceScore: 100, lastAuditDate: '2024-01-22', status: 'compliant', notes: 'Hospital station - highest priority compliance' },
      { stationName: 'Industrial Zone', wheelchairAccess: false, elevatorAvailable: false, tactilePaving: false, audioAnnouncements: true, brailleSignage: false, lowFloorVehicles: false, complianceScore: 35, lastAuditDate: '2024-01-25', status: 'non-compliant', notes: 'Major renovation required - budget allocated' },
      { stationName: 'Entertainment District', wheelchairAccess: true, elevatorAvailable: false, tactilePaving: true, audioAnnouncements: true, brailleSignage: true, lowFloorVehicles: true, complianceScore: 80, lastAuditDate: '2024-01-28', status: 'partial', notes: 'Elevator retrofit planned for next fiscal year' },
      { stationName: 'Westside Terminal', wheelchairAccess: true, elevatorAvailable: true, tactilePaving: true, audioAnnouncements: true, brailleSignage: true, lowFloorVehicles: true, complianceScore: 95, lastAuditDate: '2024-02-01', status: 'compliant', notes: 'Recently upgraded terminal' },
      { stationName: 'Eastside Mall', wheelchairAccess: true, elevatorAvailable: true, tactilePaving: true, audioAnnouncements: false, brailleSignage: true, lowFloorVehicles: true, complianceScore: 85, lastAuditDate: '2024-02-03', status: 'compliant', notes: 'Audio system upgrade in progress' },
      { stationName: 'North Station', wheelchairAccess: true, elevatorAvailable: true, tactilePaving: false, audioAnnouncements: true, brailleSignage: false, lowFloorVehicles: true, complianceScore: 72, lastAuditDate: '2024-02-05', status: 'partial', notes: 'Older station, renovation planned' },
      { stationName: 'South Terminal', wheelchairAccess: true, elevatorAvailable: true, tactilePaving: true, audioAnnouncements: true, brailleSignage: true, lowFloorVehicles: true, complianceScore: 94, lastAuditDate: '2024-02-07', status: 'compliant', notes: 'High-traffic terminal, well maintained' },
      { stationName: 'School District Hub', wheelchairAccess: true, elevatorAvailable: false, tactilePaving: true, audioAnnouncements: true, brailleSignage: true, lowFloorVehicles: true, complianceScore: 78, lastAuditDate: '2024-02-10', status: 'partial', notes: 'Elevator needed for students with mobility needs' },
      { stationName: 'P&R Lot A', wheelchairAccess: true, elevatorAvailable: false, tactilePaving: false, audioAnnouncements: false, brailleSignage: false, lowFloorVehicles: true, complianceScore: 50, lastAuditDate: '2024-02-12', status: 'non-compliant', notes: 'Surface lot - needs significant improvements' },
      { stationName: 'Tech Park Station', wheelchairAccess: true, elevatorAvailable: true, tactilePaving: true, audioAnnouncements: true, brailleSignage: true, lowFloorVehicles: true, complianceScore: 99, lastAuditDate: '2024-02-15', status: 'compliant', notes: 'State-of-the-art accessible station' },
    ]);
    console.log('Accessibility seeded.');

    // Seed Fleet (15 items)
    await Fleet.bulkCreate([
      { vehicleId: 'BUS-001', type: 'Standard Bus', make: 'New Flyer', model: 'Xcelsior XD40', year: 2022, capacity: 40, fuelType: 'diesel', mileage: 45000, status: 'active', assignedRoute: 'Downtown Express', lastMaintenance: '2024-02-15', nextMaintenance: '2024-05-15' },
      { vehicleId: 'BUS-002', type: 'Articulated Bus', make: 'New Flyer', model: 'Xcelsior XD60', year: 2023, capacity: 60, fuelType: 'CNG', mileage: 22000, status: 'active', assignedRoute: 'Metro Blue Line', lastMaintenance: '2024-02-20', nextMaintenance: '2024-05-20' },
      { vehicleId: 'BUS-003', type: 'Electric Bus', make: 'BYD', model: 'K9', year: 2023, capacity: 35, fuelType: 'electric', mileage: 18000, status: 'active', assignedRoute: 'University Loop', lastMaintenance: '2024-03-01', nextMaintenance: '2024-06-01' },
      { vehicleId: 'BUS-004', type: 'Standard Bus', make: 'Gillig', model: 'Low Floor 35', year: 2020, capacity: 35, fuelType: 'diesel', mileage: 89000, status: 'active', assignedRoute: 'Suburban Connector', lastMaintenance: '2024-01-10', nextMaintenance: '2024-04-10' },
      { vehicleId: 'BUS-005', type: 'Minibus', make: 'Ford', model: 'E-450 Shuttle', year: 2021, capacity: 16, fuelType: 'gasoline', mileage: 52000, status: 'active', assignedRoute: 'Senior Community Route', lastMaintenance: '2024-02-28', nextMaintenance: '2024-05-28' },
      { vehicleId: 'TRM-001', type: 'Light Rail', make: 'Siemens', model: 'S200', year: 2019, capacity: 150, fuelType: 'electric', mileage: 120000, status: 'active', assignedRoute: 'Waterfront Line', lastMaintenance: '2024-02-01', nextMaintenance: '2024-04-01' },
      { vehicleId: 'BUS-006', type: 'Electric Bus', make: 'Proterra', model: 'ZX5', year: 2024, capacity: 40, fuelType: 'electric', mileage: 5000, status: 'active', assignedRoute: 'Tech Campus Shuttle', lastMaintenance: '2024-03-05', nextMaintenance: '2024-06-05' },
      { vehicleId: 'BUS-007', type: 'Standard Bus', make: 'New Flyer', model: 'Xcelsior XD40', year: 2021, capacity: 40, fuelType: 'diesel', mileage: 67000, status: 'maintenance', assignedRoute: null, lastMaintenance: '2024-03-10', nextMaintenance: '2024-03-25' },
      { vehicleId: 'BUS-008', type: 'Coach Bus', make: 'MCI', model: 'D4500CT', year: 2022, capacity: 55, fuelType: 'diesel', mileage: 38000, status: 'active', assignedRoute: 'Airport Shuttle', lastMaintenance: '2024-02-18', nextMaintenance: '2024-05-18' },
      { vehicleId: 'BUS-009', type: 'Standard Bus', make: 'Gillig', model: 'Low Floor 40', year: 2019, capacity: 40, fuelType: 'CNG', mileage: 105000, status: 'active', assignedRoute: 'Crosstown Route', lastMaintenance: '2024-01-28', nextMaintenance: '2024-04-28' },
      { vehicleId: 'BUS-010', type: 'Electric Bus', make: 'BYD', model: 'K7M', year: 2024, capacity: 30, fuelType: 'electric', mileage: 3000, status: 'active', assignedRoute: 'Hospital Circulator', lastMaintenance: '2024-03-08', nextMaintenance: '2024-06-08' },
      { vehicleId: 'BUS-011', type: 'Standard Bus', make: 'New Flyer', model: 'Xcelsior XD40', year: 2020, capacity: 40, fuelType: 'diesel', mileage: 92000, status: 'retired', assignedRoute: null, lastMaintenance: '2024-01-05', nextMaintenance: null },
      { vehicleId: 'BUS-012', type: 'Articulated Bus', make: 'Nova Bus', model: 'LFS Artic', year: 2022, capacity: 58, fuelType: 'hybrid', mileage: 41000, status: 'active', assignedRoute: 'Park & Ride Express', lastMaintenance: '2024-02-22', nextMaintenance: '2024-05-22' },
      { vehicleId: 'BUS-013', type: 'School Bus', make: 'Blue Bird', model: 'Vision', year: 2021, capacity: 48, fuelType: 'diesel', mileage: 35000, status: 'active', assignedRoute: 'School Special', lastMaintenance: '2024-02-10', nextMaintenance: '2024-05-10' },
      { vehicleId: 'BUS-014', type: 'Standard Bus', make: 'Gillig', model: 'Low Floor 35', year: 2023, capacity: 35, fuelType: 'CNG', mileage: 15000, status: 'active', assignedRoute: 'Shopping Center Link', lastMaintenance: '2024-03-02', nextMaintenance: '2024-06-02' },
    ]);
    console.log('Fleet seeded.');

    // Seed Budgets (15 items)
    await Budget.bulkCreate([
      { name: 'Bus Fleet Renewal 2024', contractType: 'procurement', vendor: 'New Flyer Industries', totalAmount: 12500000, spentAmount: 8750000, startDate: '2023-01-01', endDate: '2025-12-31', department: 'Fleet Operations', status: 'active', notes: 'Multi-year bus procurement contract' },
      { name: 'Fare System Upgrade', contractType: 'technology', vendor: 'Cubic Transportation', totalAmount: 3200000, spentAmount: 1600000, startDate: '2024-03-01', endDate: '2025-09-30', department: 'IT', status: 'active', notes: 'Contactless payment integration' },
      { name: 'Station Renovation Program', contractType: 'construction', vendor: 'Metro Builders Inc', totalAmount: 8900000, spentAmount: 4450000, startDate: '2023-06-01', endDate: '2026-06-30', department: 'Infrastructure', status: 'active', notes: 'ADA compliance upgrades at 12 stations' },
      { name: 'Fuel Supply Agreement', contractType: 'supply', vendor: 'CityFuel Corp', totalAmount: 2100000, spentAmount: 1890000, startDate: '2024-01-01', endDate: '2024-12-31', department: 'Fleet Operations', status: 'active', notes: 'Diesel and CNG supply' },
      { name: 'Security Services', contractType: 'service', vendor: 'TransitGuard LLC', totalAmount: 1800000, spentAmount: 900000, startDate: '2024-01-01', endDate: '2025-12-31', department: 'Safety', status: 'active', notes: 'Station and vehicle security patrols' },
      { name: 'Electric Bus Pilot', contractType: 'procurement', vendor: 'BYD Auto', totalAmount: 5400000, spentAmount: 5400000, startDate: '2023-03-01', endDate: '2024-03-31', department: 'Fleet Operations', status: 'completed', notes: '10 electric buses delivered' },
      { name: 'Route Planning Software', contractType: 'technology', vendor: 'TransitTech Solutions', totalAmount: 450000, spentAmount: 225000, startDate: '2024-06-01', endDate: '2026-05-31', department: 'Planning', status: 'active', notes: 'AI-powered route optimization platform' },
      { name: 'Employee Training Program', contractType: 'service', vendor: 'Transit Academy', totalAmount: 320000, spentAmount: 160000, startDate: '2024-01-01', endDate: '2024-12-31', department: 'HR', status: 'active', notes: 'Driver certification and safety training' },
      { name: 'Maintenance Facility Upgrade', contractType: 'construction', vendor: 'Industrial Build Co', totalAmount: 6700000, spentAmount: 2010000, startDate: '2024-02-01', endDate: '2025-08-31', department: 'Infrastructure', status: 'active', notes: 'New electric bus charging depot' },
      { name: 'Marketing Campaign', contractType: 'service', vendor: 'CityMedia Agency', totalAmount: 280000, spentAmount: 196000, startDate: '2024-01-01', endDate: '2024-12-31', department: 'Marketing', status: 'active', notes: 'Ridership growth campaign' },
      { name: 'Insurance Coverage', contractType: 'insurance', vendor: 'TransitInsure Group', totalAmount: 1500000, spentAmount: 1500000, startDate: '2024-01-01', endDate: '2024-12-31', department: 'Finance', status: 'active', notes: 'Fleet and liability insurance' },
      { name: 'Accessibility Retrofit', contractType: 'construction', vendor: 'AccessBuild Inc', totalAmount: 2300000, spentAmount: 690000, startDate: '2024-04-01', endDate: '2025-12-31', department: 'Infrastructure', status: 'active', notes: 'Elevator and ramp installations' },
      { name: 'Data Analytics Platform', contractType: 'technology', vendor: 'DataStream Analytics', totalAmount: 380000, spentAmount: 190000, startDate: '2024-01-01', endDate: '2025-12-31', department: 'IT', status: 'active', notes: 'Real-time ridership analytics' },
      { name: 'Cleaning Services', contractType: 'service', vendor: 'CleanTransit Co', totalAmount: 960000, spentAmount: 640000, startDate: '2024-01-01', endDate: '2024-12-31', department: 'Operations', status: 'active', notes: 'Vehicle and station cleaning' },
      { name: 'Signal Priority System', contractType: 'technology', vendor: 'TrafficTech Systems', totalAmount: 1200000, spentAmount: 360000, startDate: '2024-05-01', endDate: '2025-10-31', department: 'Engineering', status: 'active', notes: 'Transit signal priority at 40 intersections' },
    ]);
    console.log('Budgets seeded.');

    // Seed Incidents (15 items)
    await Incident.bulkCreate([
      { title: 'Bus breakdown on RT-001', type: 'mechanical', severity: 'medium', routeAffected: 'Downtown Express', location: 'Main St & 5th Ave', reportedAt: '2024-03-15 08:30:00', resolvedAt: '2024-03-15 10:15:00', description: 'Engine overheating caused service disruption', status: 'resolved', assignedTo: 'Mike Chen' },
      { title: 'Passenger slip at Central Station', type: 'safety', severity: 'high', routeAffected: 'Metro Blue Line', location: 'Central Station Platform 2', reportedAt: '2024-03-14 16:45:00', resolvedAt: '2024-03-14 17:30:00', description: 'Wet floor caused passenger fall, minor injury', status: 'resolved', assignedTo: 'Sarah Johnson' },
      { title: 'Signal failure at Westside', type: 'infrastructure', severity: 'high', routeAffected: 'Metro Blue Line', location: 'Westside Terminal', reportedAt: '2024-03-16 06:00:00', description: 'Track signal malfunction causing delays', status: 'open', assignedTo: 'Tom Wilson' },
      { title: 'Fare gate malfunction', type: 'equipment', severity: 'low', routeAffected: 'All Lines', location: 'Financial District Station', reportedAt: '2024-03-15 12:00:00', resolvedAt: '2024-03-15 14:00:00', description: 'Three fare gates not accepting tap payments', status: 'resolved', assignedTo: 'Lisa Park' },
      { title: 'Route detour - road construction', type: 'external', severity: 'medium', routeAffected: 'Suburban Connector', location: 'Oak Boulevard', reportedAt: '2024-03-10 07:00:00', description: 'City road work requires 2-week detour', status: 'open', assignedTo: 'James Brown' },
      { title: 'Vandalism at Marina Bay stop', type: 'security', severity: 'medium', routeAffected: 'Waterfront Line', location: 'Marina Bay Station', reportedAt: '2024-03-13 22:00:00', resolvedAt: '2024-03-14 08:00:00', description: 'Shelter glass broken, graffiti on walls', status: 'resolved', assignedTo: 'Security Team' },
      { title: 'AC failure on BUS-004', type: 'mechanical', severity: 'medium', routeAffected: 'Suburban Connector', location: 'In service', reportedAt: '2024-03-16 14:00:00', description: 'Air conditioning not working, passenger complaints', status: 'open', assignedTo: 'Fleet Maintenance' },
      { title: 'Near-miss pedestrian incident', type: 'safety', severity: 'critical', routeAffected: 'University Loop', location: 'Campus Dr & University Ave', reportedAt: '2024-03-12 08:15:00', resolvedAt: '2024-03-12 09:00:00', description: 'Bus narrowly avoided pedestrian jaywalking', status: 'resolved', assignedTo: 'Safety Committee' },
      { title: 'Power outage at depot', type: 'infrastructure', severity: 'high', routeAffected: 'Multiple Routes', location: 'Main Bus Depot', reportedAt: '2024-03-11 03:00:00', resolvedAt: '2024-03-11 06:30:00', description: 'Overnight power failure affected morning departures', status: 'resolved', assignedTo: 'Facilities Team' },
      { title: 'Wheelchair ramp stuck', type: 'equipment', severity: 'high', routeAffected: 'Hospital Circulator', location: 'BUS-010 in service', reportedAt: '2024-03-16 10:30:00', description: 'Wheelchair ramp jammed, ADA compliance issue', status: 'open', assignedTo: 'Fleet Maintenance' },
      { title: 'Driver medical emergency', type: 'safety', severity: 'critical', routeAffected: 'Crosstown Route', location: 'North Station', reportedAt: '2024-03-09 11:00:00', resolvedAt: '2024-03-09 11:45:00', description: 'Driver experienced chest pains, replaced immediately', status: 'resolved', assignedTo: 'Operations Manager' },
      { title: 'Flooding at South Terminal', type: 'weather', severity: 'high', routeAffected: 'Crosstown Route', location: 'South Terminal underpass', reportedAt: '2024-03-08 06:00:00', resolvedAt: '2024-03-08 18:00:00', description: 'Heavy rain caused flooding, station closed temporarily', status: 'resolved', assignedTo: 'Infrastructure Team' },
      { title: 'Suspicious package report', type: 'security', severity: 'critical', routeAffected: 'Metro Blue Line', location: 'Eastside Mall Station', reportedAt: '2024-03-07 15:30:00', resolvedAt: '2024-03-07 17:00:00', description: 'Unattended bag reported, station evacuated, all clear', status: 'resolved', assignedTo: 'Security & Police' },
      { title: 'GPS system failure', type: 'technology', severity: 'medium', routeAffected: 'All Routes', location: 'System-wide', reportedAt: '2024-03-16 05:00:00', description: 'Real-time tracking unavailable for passengers', status: 'open', assignedTo: 'IT Department' },
      { title: 'Overcrowding on RT-003', type: 'operational', severity: 'medium', routeAffected: 'University Loop', location: 'University Campus stop', reportedAt: '2024-03-15 08:00:00', description: 'Peak hour overcrowding exceeding capacity limits', status: 'open', assignedTo: 'Route Planner' },
    ]);
    console.log('Incidents seeded.');

    // Seed Staff (15 items)
    await Staff.bulkCreate([
      { employeeId: 'EMP-001', name: 'Robert Martinez', role: 'Bus Driver', department: 'Operations', assignedRoute: 'Downtown Express', hireDate: '2018-03-15', certifications: 'CDL-B, Defensive Driving', shiftType: 'Morning', phone: '555-0101', status: 'active' },
      { employeeId: 'EMP-002', name: 'Jennifer Lee', role: 'Bus Driver', department: 'Operations', assignedRoute: 'Metro Blue Line', hireDate: '2019-07-22', certifications: 'CDL-B, Hazmat', shiftType: 'Afternoon', phone: '555-0102', status: 'active' },
      { employeeId: 'EMP-003', name: 'David Thompson', role: 'Maintenance Technician', department: 'Fleet Maintenance', assignedRoute: null, hireDate: '2017-01-10', certifications: 'ASE Master, EV Certified', shiftType: 'Day', phone: '555-0103', status: 'active' },
      { employeeId: 'EMP-004', name: 'Maria Garcia', role: 'Station Attendant', department: 'Customer Service', assignedRoute: 'Central Station', hireDate: '2020-05-18', certifications: 'First Aid, AED', shiftType: 'Rotating', phone: '555-0104', status: 'active' },
      { employeeId: 'EMP-005', name: 'James Wilson', role: 'Route Supervisor', department: 'Operations', assignedRoute: 'Multiple Routes', hireDate: '2015-09-01', certifications: 'CDL-B, Management', shiftType: 'Day', phone: '555-0105', status: 'active' },
      { employeeId: 'EMP-006', name: 'Sarah Kim', role: 'Dispatcher', department: 'Operations', assignedRoute: null, hireDate: '2021-02-14', certifications: 'CAD Certified', shiftType: 'Night', phone: '555-0106', status: 'active' },
      { employeeId: 'EMP-007', name: 'Michael Brown', role: 'Bus Driver', department: 'Operations', assignedRoute: 'Airport Shuttle', hireDate: '2016-11-30', certifications: 'CDL-B, Passenger Endorsement', shiftType: 'Split', phone: '555-0107', status: 'active' },
      { employeeId: 'EMP-008', name: 'Emily Davis', role: 'Safety Inspector', department: 'Safety', assignedRoute: null, hireDate: '2019-04-05', certifications: 'OSHA, Transit Safety', shiftType: 'Day', phone: '555-0108', status: 'active' },
      { employeeId: 'EMP-009', name: 'Carlos Rodriguez', role: 'Maintenance Technician', department: 'Fleet Maintenance', assignedRoute: null, hireDate: '2020-08-12', certifications: 'ASE, Brake Specialist', shiftType: 'Evening', phone: '555-0109', status: 'active' },
      { employeeId: 'EMP-010', name: 'Amanda White', role: 'Bus Driver', department: 'Operations', assignedRoute: 'University Loop', hireDate: '2022-01-20', certifications: 'CDL-B', shiftType: 'Morning', phone: '555-0110', status: 'active' },
      { employeeId: 'EMP-011', name: 'Kevin Johnson', role: 'IT Specialist', department: 'IT', assignedRoute: null, hireDate: '2021-06-15', certifications: 'CCNA, AWS', shiftType: 'Day', phone: '555-0111', status: 'active' },
      { employeeId: 'EMP-012', name: 'Linda Chen', role: 'Financial Analyst', department: 'Finance', assignedRoute: null, hireDate: '2018-10-01', certifications: 'CPA', shiftType: 'Day', phone: '555-0112', status: 'active' },
      { employeeId: 'EMP-013', name: 'Patrick O\'Brien', role: 'Bus Driver', department: 'Operations', assignedRoute: 'Waterfront Line', hireDate: '2017-05-20', certifications: 'CDL-B, Tram Operation', shiftType: 'Afternoon', phone: '555-0113', status: 'on-leave' },
      { employeeId: 'EMP-014', name: 'Rachel Green', role: 'Customer Relations', department: 'Customer Service', assignedRoute: null, hireDate: '2023-03-01', certifications: 'Conflict Resolution', shiftType: 'Day', phone: '555-0114', status: 'active' },
      { employeeId: 'EMP-015', name: 'Thomas Anderson', role: 'Facilities Manager', department: 'Infrastructure', assignedRoute: null, hireDate: '2016-02-28', certifications: 'PMP, LEED', shiftType: 'Day', phone: '555-0115', status: 'active' },
    ]);
    console.log('Staff seeded.');

    // Seed Performance KPIs (15 items)
    await Performance.bulkCreate([
      { metricName: 'On-Time Performance', category: 'Service Quality', currentValue: 87.5, targetValue: 92, unit: '%', period: 'Q1 2024', trend: 'improving', lastUpdated: '2024-03-15', status: 'below-target', notes: 'Weather impacts in January' },
      { metricName: 'Ridership Growth', category: 'Demand', currentValue: 3.2, targetValue: 5, unit: '%', period: 'YoY 2024', trend: 'improving', lastUpdated: '2024-03-15', status: 'below-target', notes: 'Recovering from pandemic lows' },
      { metricName: 'Customer Satisfaction', category: 'Service Quality', currentValue: 4.1, targetValue: 4.5, unit: '/5', period: 'Q1 2024', trend: 'stable', lastUpdated: '2024-03-15', status: 'on-track', notes: 'Survey of 2,500 passengers' },
      { metricName: 'Cost per Revenue Mile', category: 'Financial', currentValue: 8.45, targetValue: 7.50, unit: '$', period: 'Q1 2024', trend: 'worsening', lastUpdated: '2024-03-15', status: 'below-target', notes: 'Fuel cost increase impact' },
      { metricName: 'Fleet Availability', category: 'Operations', currentValue: 91.2, targetValue: 95, unit: '%', period: 'March 2024', trend: 'stable', lastUpdated: '2024-03-15', status: 'below-target', notes: '3 buses in extended maintenance' },
      { metricName: 'Farebox Recovery Ratio', category: 'Financial', currentValue: 34.5, targetValue: 40, unit: '%', period: 'Q1 2024', trend: 'improving', lastUpdated: '2024-03-15', status: 'below-target', notes: 'New fare products helping' },
      { metricName: 'Mean Distance Between Failures', category: 'Fleet', currentValue: 12500, targetValue: 15000, unit: 'km', period: 'Q1 2024', trend: 'improving', lastUpdated: '2024-03-15', status: 'on-track', notes: 'New buses improving average' },
      { metricName: 'Accidents per 100k Miles', category: 'Safety', currentValue: 1.8, targetValue: 1.5, unit: 'incidents', period: 'Q1 2024', trend: 'worsening', lastUpdated: '2024-03-15', status: 'below-target', notes: 'Two incidents in February' },
      { metricName: 'Passenger Complaints Rate', category: 'Service Quality', currentValue: 4.2, targetValue: 3.0, unit: 'per 100k trips', period: 'Q1 2024', trend: 'improving', lastUpdated: '2024-03-15', status: 'below-target', notes: 'New complaint system launched' },
      { metricName: 'ADA Compliance Rate', category: 'Accessibility', currentValue: 82, targetValue: 100, unit: '%', period: 'Q1 2024', trend: 'improving', lastUpdated: '2024-03-15', status: 'on-track', notes: 'Retrofit program underway' },
      { metricName: 'Employee Turnover', category: 'HR', currentValue: 12, targetValue: 8, unit: '%', period: 'Annual 2024', trend: 'stable', lastUpdated: '2024-03-15', status: 'below-target', notes: 'Driver shortage ongoing' },
      { metricName: 'Average Headway Adherence', category: 'Operations', currentValue: 78, targetValue: 85, unit: '%', period: 'Q1 2024', trend: 'improving', lastUpdated: '2024-03-15', status: 'below-target', notes: 'Signal priority helping' },
      { metricName: 'Energy Efficiency', category: 'Sustainability', currentValue: 2.8, targetValue: 2.5, unit: 'kWh/km', period: 'Q1 2024', trend: 'improving', lastUpdated: '2024-03-15', status: 'on-track', notes: 'Electric fleet growing' },
      { metricName: 'Revenue per Passenger', category: 'Financial', currentValue: 1.85, targetValue: 2.10, unit: '$', period: 'Q1 2024', trend: 'stable', lastUpdated: '2024-03-15', status: 'below-target', notes: 'High discount ridership' },
      { metricName: 'Service Coverage', category: 'Planning', currentValue: 76, targetValue: 85, unit: '%', period: 'Q1 2024', trend: 'stable', lastUpdated: '2024-03-15', status: 'on-track', notes: 'New route added in March' },
    ]);
    console.log('Performance seeded.');

    // Seed Stops (15 items)
    await Stop.bulkCreate([
      { name: 'Central Station', stopCode: 'STP-001', type: 'terminal', latitude: 40.7128, longitude: -74.0060, zone: 'Zone 1', shelterAvailable: true, benchAvailable: true, digitalDisplay: true, routesServed: 'RT-001, RT-002, RT-004', dailyBoardings: 8500, status: 'active' },
      { name: 'University Campus', stopCode: 'STP-002', type: 'station', latitude: 40.7282, longitude: -73.9942, zone: 'Zone 1', shelterAvailable: true, benchAvailable: true, digitalDisplay: true, routesServed: 'RT-003', dailyBoardings: 5200, status: 'active' },
      { name: 'Financial District', stopCode: 'STP-003', type: 'station', latitude: 40.7074, longitude: -74.0113, zone: 'Zone 1', shelterAvailable: true, benchAvailable: true, digitalDisplay: true, routesServed: 'RT-001', dailyBoardings: 4800, status: 'active' },
      { name: 'Marina Bay', stopCode: 'STP-004', type: 'station', latitude: 40.6892, longitude: -74.0445, zone: 'Zone 2', shelterAvailable: true, benchAvailable: true, digitalDisplay: true, routesServed: 'RT-005', dailyBoardings: 3600, status: 'active' },
      { name: 'Oak Street & Main', stopCode: 'STP-005', type: 'stop', latitude: 40.7350, longitude: -73.9900, zone: 'Zone 1', shelterAvailable: true, benchAvailable: true, digitalDisplay: false, routesServed: 'RT-004', dailyBoardings: 1200, status: 'active' },
      { name: 'Elm Avenue', stopCode: 'STP-006', type: 'stop', latitude: 40.7400, longitude: -73.9850, zone: 'Zone 2', shelterAvailable: false, benchAvailable: true, digitalDisplay: false, routesServed: 'RT-004, RT-010', dailyBoardings: 800, status: 'active' },
      { name: 'Tech Park Station', stopCode: 'STP-007', type: 'station', latitude: 40.7500, longitude: -73.9700, zone: 'Zone 2', shelterAvailable: true, benchAvailable: true, digitalDisplay: true, routesServed: 'RT-015', dailyBoardings: 4200, status: 'active' },
      { name: 'Hospital Entrance', stopCode: 'STP-008', type: 'stop', latitude: 40.7150, longitude: -74.0020, zone: 'Zone 1', shelterAvailable: true, benchAvailable: true, digitalDisplay: true, routesServed: 'RT-006', dailyBoardings: 2200, status: 'active' },
      { name: 'Westside Terminal', stopCode: 'STP-009', type: 'terminal', latitude: 40.7580, longitude: -73.9855, zone: 'Zone 2', shelterAvailable: true, benchAvailable: true, digitalDisplay: true, routesServed: 'RT-009', dailyBoardings: 6200, status: 'active' },
      { name: 'Industrial Zone Gate', stopCode: 'STP-010', type: 'stop', latitude: 40.6800, longitude: -74.0200, zone: 'Zone 3', shelterAvailable: false, benchAvailable: false, digitalDisplay: false, routesServed: 'RT-007', dailyBoardings: 650, status: 'active' },
      { name: 'Shopping Mall Entrance', stopCode: 'STP-011', type: 'stop', latitude: 40.7220, longitude: -73.9980, zone: 'Zone 1', shelterAvailable: true, benchAvailable: true, digitalDisplay: true, routesServed: 'RT-012', dailyBoardings: 2800, status: 'active' },
      { name: 'Park & Ride Lot A', stopCode: 'STP-012', type: 'park-ride', latitude: 40.7600, longitude: -74.0100, zone: 'Zone 3', shelterAvailable: true, benchAvailable: true, digitalDisplay: true, routesServed: 'RT-013', dailyBoardings: 3800, status: 'active' },
      { name: 'Riverside Drive', stopCode: 'STP-013', type: 'stop', latitude: 40.7300, longitude: -74.0050, zone: 'Zone 2', shelterAvailable: false, benchAvailable: true, digitalDisplay: false, routesServed: 'RT-005, RT-010', dailyBoardings: 950, status: 'active' },
      { name: 'North Station', stopCode: 'STP-014', type: 'station', latitude: 40.7650, longitude: -73.9750, zone: 'Zone 2', shelterAvailable: true, benchAvailable: true, digitalDisplay: true, routesServed: 'RT-010', dailyBoardings: 3100, status: 'active' },
      { name: 'Senior Center Stop', stopCode: 'STP-015', type: 'stop', latitude: 40.7100, longitude: -74.0080, zone: 'Zone 1', shelterAvailable: true, benchAvailable: true, digitalDisplay: false, routesServed: 'RT-014', dailyBoardings: 420, status: 'active' },
    ]);
    console.log('Stops seeded.');

    // Seed Maintenance (15 items)
    await Maintenance.bulkCreate([
      { vehicleId: 'BUS-001', type: 'preventive', description: 'Regular 30,000 km service - oil change, filter replacement, brake inspection', scheduledDate: '2024-02-15', completedDate: '2024-02-15', cost: 850, technician: 'David Thompson', partsUsed: 'Oil filter, air filter, brake pads', mileageAtService: 45000, status: 'completed', priority: 'normal' },
      { vehicleId: 'BUS-002', type: 'corrective', description: 'Transmission fluid leak repair', scheduledDate: '2024-02-20', completedDate: '2024-02-22', cost: 2200, technician: 'Carlos Rodriguez', partsUsed: 'Transmission gasket, fluid', mileageAtService: 22000, status: 'completed', priority: 'high' },
      { vehicleId: 'BUS-003', type: 'preventive', description: 'Battery health check and calibration for electric bus', scheduledDate: '2024-03-01', completedDate: '2024-03-01', cost: 450, technician: 'David Thompson', partsUsed: 'Diagnostic software update', mileageAtService: 18000, status: 'completed', priority: 'normal' },
      { vehicleId: 'BUS-007', type: 'corrective', description: 'Engine overhaul - excessive oil consumption', scheduledDate: '2024-03-10', cost: 8500, technician: 'Carlos Rodriguez', partsUsed: 'Piston rings, gaskets, bearings', mileageAtService: 67000, status: 'in-progress', priority: 'critical' },
      { vehicleId: 'BUS-004', type: 'preventive', description: '60,000 km major service', scheduledDate: '2024-04-10', cost: 1200, technician: 'David Thompson', partsUsed: 'Pending', mileageAtService: 89000, status: 'scheduled', priority: 'normal' },
      { vehicleId: 'TRM-001', type: 'inspection', description: 'Annual track vehicle safety inspection', scheduledDate: '2024-04-01', cost: 3500, technician: 'External Inspector', partsUsed: 'N/A', mileageAtService: 120000, status: 'scheduled', priority: 'high' },
      { vehicleId: 'BUS-008', type: 'preventive', description: 'AC system service and refrigerant recharge', scheduledDate: '2024-03-15', completedDate: '2024-03-15', cost: 680, technician: 'Carlos Rodriguez', partsUsed: 'Refrigerant, AC filter', mileageAtService: 38000, status: 'completed', priority: 'normal' },
      { vehicleId: 'BUS-009', type: 'corrective', description: 'Suspension repair - driver reported handling issues', scheduledDate: '2024-03-18', cost: 1800, technician: 'David Thompson', partsUsed: 'Shock absorbers, bushings', mileageAtService: 105000, status: 'scheduled', priority: 'high' },
      { vehicleId: 'BUS-010', type: 'warranty', description: 'Battery module replacement under manufacturer warranty', scheduledDate: '2024-03-20', cost: 0, technician: 'BYD Service Team', partsUsed: 'Battery module #3', mileageAtService: 3000, status: 'scheduled', priority: 'high' },
      { vehicleId: 'BUS-005', type: 'preventive', description: 'Brake system overhaul', scheduledDate: '2024-03-12', completedDate: '2024-03-12', cost: 920, technician: 'Carlos Rodriguez', partsUsed: 'Brake rotors, pads, fluid', mileageAtService: 52000, status: 'completed', priority: 'normal' },
      { vehicleId: 'BUS-012', type: 'preventive', description: 'Articulation joint inspection and lubrication', scheduledDate: '2024-03-25', cost: 600, technician: 'David Thompson', partsUsed: 'Lubricant, seals', mileageAtService: 41000, status: 'scheduled', priority: 'normal' },
      { vehicleId: 'BUS-006', type: 'corrective', description: 'Charging port connector replacement', scheduledDate: '2024-03-08', completedDate: '2024-03-09', cost: 1500, technician: 'David Thompson', partsUsed: 'CCS connector assembly', mileageAtService: 5000, status: 'completed', priority: 'high' },
      { vehicleId: 'BUS-013', type: 'inspection', description: 'Annual school bus safety certification', scheduledDate: '2024-04-05', cost: 500, technician: 'State Inspector', partsUsed: 'N/A', mileageAtService: 35000, status: 'scheduled', priority: 'high' },
      { vehicleId: 'BUS-014', type: 'preventive', description: 'CNG fuel system inspection and valve check', scheduledDate: '2024-03-22', cost: 750, technician: 'Carlos Rodriguez', partsUsed: 'CNG valves, seals', mileageAtService: 15000, status: 'scheduled', priority: 'normal' },
      { vehicleId: 'BUS-011', type: 'decommission', description: 'Final inspection before retirement - asset disposal', scheduledDate: '2024-03-30', cost: 200, technician: 'David Thompson', partsUsed: 'N/A', mileageAtService: 92000, status: 'scheduled', priority: 'low' },
    ]);
    console.log('Maintenance seeded.');

    // Seed Feedback (15 items)
    await Feedback.bulkCreate([
      { ticketNumber: 'FB-001', category: 'delay', subject: 'Bus 30 minutes late on RT-004', description: 'Morning commute bus was extremely late, no updates on the app', routeAffected: 'Suburban Connector', passengerName: 'John Smith', passengerEmail: 'john@email.com', rating: 1, submittedAt: '2024-03-15 09:00:00', status: 'open', resolution: null },
      { ticketNumber: 'FB-002', category: 'cleanliness', subject: 'Dirty seats on RT-001', description: 'Seats were stained and floor was sticky on morning bus', routeAffected: 'Downtown Express', passengerName: 'Mary Johnson', passengerEmail: 'mary@email.com', rating: 2, submittedAt: '2024-03-14 18:00:00', status: 'resolved', resolution: 'Deep cleaning scheduled and completed' },
      { ticketNumber: 'FB-003', category: 'compliment', subject: 'Excellent driver on Airport Shuttle', description: 'Driver was very helpful with luggage and gave clear announcements', routeAffected: 'Airport Shuttle', passengerName: 'David Lee', passengerEmail: 'david@email.com', rating: 5, submittedAt: '2024-03-14 15:00:00', status: 'closed', resolution: 'Commendation sent to driver' },
      { ticketNumber: 'FB-004', category: 'safety', subject: 'Driver running red light', description: 'Bus driver ran a red light at Main & 3rd intersection', routeAffected: 'Crosstown Route', passengerName: 'Lisa Park', passengerEmail: 'lisa@email.com', rating: 1, submittedAt: '2024-03-13 17:30:00', status: 'investigating', resolution: null },
      { ticketNumber: 'FB-005', category: 'accessibility', subject: 'Wheelchair ramp not working', description: 'Had to wait for next bus because ramp was broken', routeAffected: 'Hospital Circulator', passengerName: 'Robert Garcia', passengerEmail: 'robert@email.com', rating: 1, submittedAt: '2024-03-12 10:00:00', status: 'resolved', resolution: 'Vehicle pulled for immediate repair' },
      { ticketNumber: 'FB-006', category: 'suggestion', subject: 'Add more evening service on RT-005', description: 'The waterfront line should run later on weekends for restaurant visitors', routeAffected: 'Waterfront Line', passengerName: 'Sarah Chen', passengerEmail: 'sarah@email.com', rating: 3, submittedAt: '2024-03-11 22:00:00', status: 'under-review', resolution: null },
      { ticketNumber: 'FB-007', category: 'fare', subject: 'Charged twice on tap card', description: 'My card was charged twice when boarding, need a refund', routeAffected: 'Metro Blue Line', passengerName: 'Tom Wilson', passengerEmail: 'tom@email.com', rating: 2, submittedAt: '2024-03-10 08:30:00', status: 'resolved', resolution: 'Refund processed to card' },
      { ticketNumber: 'FB-008', category: 'overcrowding', subject: 'University bus too crowded', description: 'Cannot board the 8am bus, always full. Need larger buses or more frequent service', routeAffected: 'University Loop', passengerName: 'Emily White', passengerEmail: 'emily@email.com', rating: 2, submittedAt: '2024-03-10 08:15:00', status: 'open', resolution: null },
      { ticketNumber: 'FB-009', category: 'app', subject: 'Real-time tracking inaccurate', description: 'App showed bus arriving in 2 min but it was actually 15 min away', routeAffected: 'Downtown Express', passengerName: 'Chris Brown', passengerEmail: 'chris@email.com', rating: 2, submittedAt: '2024-03-09 07:45:00', status: 'open', resolution: null },
      { ticketNumber: 'FB-010', category: 'compliment', subject: 'New electric buses are great', description: 'Love the quiet, smooth ride on the new electric buses. Keep adding more!', routeAffected: 'Tech Campus Shuttle', passengerName: 'Amy Zhang', passengerEmail: 'amy@email.com', rating: 5, submittedAt: '2024-03-08 16:00:00', status: 'closed', resolution: 'Shared with fleet planning team' },
      { ticketNumber: 'FB-011', category: 'driver', subject: 'Rude driver on RT-010', description: 'Driver closed doors on elderly passenger and drove off', routeAffected: 'Crosstown Route', passengerName: 'Frank Miller', passengerEmail: 'frank@email.com', rating: 1, submittedAt: '2024-03-07 14:00:00', status: 'investigating', resolution: null },
      { ticketNumber: 'FB-012', category: 'shelter', subject: 'No shelter at Elm Avenue stop', description: 'Please add a shelter - standing in rain/sun is terrible', routeAffected: 'Suburban Connector', passengerName: 'Grace Kim', passengerEmail: 'grace@email.com', rating: 3, submittedAt: '2024-03-06 11:00:00', status: 'under-review', resolution: null },
      { ticketNumber: 'FB-013', category: 'schedule', subject: 'Weekend service too infrequent', description: 'Waiting 30+ minutes on weekends is unacceptable', routeAffected: 'Night Owl Service', passengerName: 'Mike Ross', passengerEmail: 'mike@email.com', rating: 2, submittedAt: '2024-03-05 20:00:00', status: 'open', resolution: null },
      { ticketNumber: 'FB-014', category: 'compliment', subject: 'Great new signage at stations', description: 'The new wayfinding signs make it so much easier to navigate', routeAffected: 'Metro Blue Line', passengerName: 'Nina Patel', passengerEmail: 'nina@email.com', rating: 5, submittedAt: '2024-03-04 12:00:00', status: 'closed', resolution: 'Shared with infrastructure team' },
      { ticketNumber: 'FB-015', category: 'temperature', subject: 'AC broken on bus', description: 'Bus was extremely hot inside, AC clearly not working', routeAffected: 'Suburban Connector', passengerName: 'Oscar Torres', passengerEmail: 'oscar@email.com', rating: 1, submittedAt: '2024-03-03 15:30:00', status: 'resolved', resolution: 'AC repaired on BUS-004' },
    ]);
    console.log('Feedback seeded.');

    // Seed Energy (15 items)
    await Energy.bulkCreate([
      { metricName: 'Total Fleet Fuel Consumption', category: 'fuel', currentValue: 125000, previousValue: 132000, unit: ' gallons', targetValue: 110000, period: 'Q1 2024', vehicleType: 'All', co2Saved: 28, status: 'on-track', notes: 'Electric fleet reducing total consumption' },
      { metricName: 'Electric Bus Energy Use', category: 'electricity', currentValue: 45000, previousValue: 38000, unit: ' kWh', targetValue: 60000, period: 'Q1 2024', vehicleType: 'Electric', co2Saved: 85, status: 'on-track', notes: 'Growing as fleet electrifies' },
      { metricName: 'Diesel Consumption', category: 'fuel', currentValue: 85000, previousValue: 95000, unit: ' gallons', targetValue: 70000, period: 'Q1 2024', vehicleType: 'Diesel', co2Saved: 0, status: 'on-track', notes: 'Declining with bus replacements' },
      { metricName: 'CNG Consumption', category: 'fuel', currentValue: 32000, previousValue: 30000, unit: ' therms', targetValue: 35000, period: 'Q1 2024', vehicleType: 'CNG', co2Saved: 42, status: 'on-track', notes: 'Cleaner than diesel alternative' },
      { metricName: 'CO2 Emissions Total', category: 'emissions', currentValue: 1850, previousValue: 2100, unit: ' tons', targetValue: 1500, period: 'Q1 2024', vehicleType: 'All', co2Saved: 250, status: 'on-track', notes: '12% reduction year-over-year' },
      { metricName: 'Solar Panel Generation', category: 'renewable', currentValue: 12000, previousValue: 8000, unit: ' kWh', targetValue: 20000, period: 'Q1 2024', vehicleType: 'Facilities', co2Saved: 15, status: 'on-track', notes: 'New panels at main depot' },
      { metricName: 'Fleet Average MPG', category: 'efficiency', currentValue: 5.2, previousValue: 4.8, unit: ' mpg', targetValue: 6.0, period: 'Q1 2024', vehicleType: 'Diesel/CNG', co2Saved: 0, status: 'on-track', notes: 'Newer vehicles improving average' },
      { metricName: 'Electric Bus Range', category: 'efficiency', currentValue: 250, previousValue: 245, unit: ' km', targetValue: 300, period: 'Q1 2024', vehicleType: 'Electric', co2Saved: 0, status: 'on-track', notes: 'Battery performance good' },
      { metricName: 'Idle Time Reduction', category: 'efficiency', currentValue: 18, previousValue: 25, unit: '%', targetValue: 10, period: 'Q1 2024', vehicleType: 'All', co2Saved: 35, status: 'on-track', notes: 'Auto-shutoff policy working' },
      { metricName: 'Water Usage at Wash Facility', category: 'water', currentValue: 45000, previousValue: 52000, unit: ' gallons', targetValue: 35000, period: 'Q1 2024', vehicleType: 'Facilities', co2Saved: 0, status: 'on-track', notes: 'Water recycling system installed' },
      { metricName: 'Recycled Materials Rate', category: 'waste', currentValue: 62, previousValue: 55, unit: '%', targetValue: 75, period: 'Q1 2024', vehicleType: 'Facilities', co2Saved: 8, status: 'on-track', notes: 'New recycling program at depots' },
      { metricName: 'EV Charging Station Utilization', category: 'infrastructure', currentValue: 72, previousValue: 60, unit: '%', targetValue: 85, period: 'Q1 2024', vehicleType: 'Electric', co2Saved: 0, status: 'on-track', notes: '8 chargers operational' },
      { metricName: 'Green Roof Coverage', category: 'facilities', currentValue: 2500, previousValue: 1800, unit: ' sqft', targetValue: 5000, period: 'Q1 2024', vehicleType: 'Facilities', co2Saved: 3, status: 'on-track', notes: 'Station green roof program' },
      { metricName: 'Passenger Miles per Gallon', category: 'efficiency', currentValue: 120, previousValue: 105, unit: ' pmpg', targetValue: 150, period: 'Q1 2024', vehicleType: 'All', co2Saved: 0, status: 'on-track', notes: 'Higher ridership improving efficiency' },
      { metricName: 'LED Lighting Conversion', category: 'facilities', currentValue: 78, previousValue: 65, unit: '%', targetValue: 100, period: 'Q1 2024', vehicleType: 'Facilities', co2Saved: 12, status: 'on-track', notes: 'Station and vehicle lighting upgrade' },
    ]);
    console.log('Energy seeded.');

    // Seed Safety (15 items)
    await Safety.bulkCreate([
      { title: 'Annual Vehicle Safety Inspection', category: 'vehicle', inspectionType: 'annual', location: 'Main Depot', inspector: 'Emily Davis', inspectionDate: '2024-02-15', nextInspection: '2025-02-15', findings: 'All vehicles passed with minor recommendations', riskLevel: 'low', correctiveAction: 'Replace worn wiper blades on 3 units', status: 'passed', score: 95 },
      { title: 'Station Fire Safety Audit', category: 'station', inspectionType: 'quarterly', location: 'Central Station', inspector: 'Fire Marshal Office', inspectionDate: '2024-03-01', nextInspection: '2024-06-01', findings: 'Fire extinguishers need recertification in 2 areas', riskLevel: 'medium', correctiveAction: 'Schedule extinguisher service within 30 days', status: 'conditional', score: 82 },
      { title: 'Driver Safety Performance Review', category: 'personnel', inspectionType: 'monthly', location: 'Operations Center', inspector: 'James Wilson', inspectionDate: '2024-03-10', nextInspection: '2024-04-10', findings: '2 drivers require additional defensive driving training', riskLevel: 'medium', correctiveAction: 'Enroll drivers in refresher course', status: 'action-required', score: 78 },
      { title: 'Elevator Safety Certification', category: 'infrastructure', inspectionType: 'annual', location: 'Westside Terminal', inspector: 'State Elevator Board', inspectionDate: '2024-01-20', nextInspection: '2025-01-20', findings: 'All elevators certified, no deficiencies', riskLevel: 'low', correctiveAction: 'None required', status: 'passed', score: 100 },
      { title: 'CCTV System Functionality Check', category: 'security', inspectionType: 'monthly', location: 'All Stations', inspector: 'Kevin Johnson', inspectionDate: '2024-03-05', nextInspection: '2024-04-05', findings: '3 cameras non-functional at Industrial Zone station', riskLevel: 'high', correctiveAction: 'Replace cameras and check cabling', status: 'failed', score: 60 },
      { title: 'Emergency Evacuation Drill', category: 'emergency', inspectionType: 'semi-annual', location: 'Metro Blue Line Tunnel', inspector: 'Safety Committee', inspectionDate: '2024-02-28', nextInspection: '2024-08-28', findings: 'Evacuation completed in 8 min, target was 6 min', riskLevel: 'medium', correctiveAction: 'Improve signage and staff positioning', status: 'conditional', score: 75 },
      { title: 'Track Condition Assessment', category: 'infrastructure', inspectionType: 'quarterly', location: 'Waterfront Line', inspector: 'Track Engineering Team', inspectionDate: '2024-03-12', nextInspection: '2024-06-12', findings: 'Minor rail wear detected at 2 curves', riskLevel: 'low', correctiveAction: 'Schedule rail grinding in Q2', status: 'passed', score: 88 },
      { title: 'Hazardous Materials Storage', category: 'environmental', inspectionType: 'annual', location: 'Main Depot', inspector: 'EPA Inspector', inspectionDate: '2024-01-15', nextInspection: '2025-01-15', findings: 'Secondary containment adequate, labeling updated', riskLevel: 'low', correctiveAction: 'Update MSDS binder', status: 'passed', score: 92 },
      { title: 'Bus Stop Safety Assessment', category: 'infrastructure', inspectionType: 'annual', location: 'All Bus Stops', inspector: 'Emily Davis', inspectionDate: '2024-02-20', nextInspection: '2025-02-20', findings: '5 stops need better lighting, 2 need ADA ramp repairs', riskLevel: 'high', correctiveAction: 'Lighting upgrade and ramp repair prioritized', status: 'action-required', score: 68 },
      { title: 'CNG Fueling Station Inspection', category: 'fuel', inspectionType: 'quarterly', location: 'Main Depot CNG Station', inspector: 'Gas Safety Board', inspectionDate: '2024-03-08', nextInspection: '2024-06-08', findings: 'Pressure relief valve needs replacement', riskLevel: 'high', correctiveAction: 'Valve replacement ordered, interim safety measures in place', status: 'conditional', score: 70 },
      { title: 'Workplace Ergonomics Review', category: 'personnel', inspectionType: 'annual', location: 'Driver Seats & Workstations', inspector: 'Occupational Health', inspectionDate: '2024-01-25', nextInspection: '2025-01-25', findings: '4 driver seats need replacement due to poor lumbar support', riskLevel: 'medium', correctiveAction: 'Order replacement seats', status: 'action-required', score: 76 },
      { title: 'Electrical System Audit', category: 'infrastructure', inspectionType: 'annual', location: 'Eastside Mall Station', inspector: 'Licensed Electrician', inspectionDate: '2024-02-10', nextInspection: '2025-02-10', findings: 'Panel meets code, recommended circuit labeling update', riskLevel: 'low', correctiveAction: 'Label circuits by Q2', status: 'passed', score: 90 },
      { title: 'Passenger Platform Gap Review', category: 'station', inspectionType: 'semi-annual', location: 'All Metro Stations', inspector: 'Infrastructure Team', inspectionDate: '2024-03-14', nextInspection: '2024-09-14', findings: 'Gap measurements within tolerance at all stations', riskLevel: 'low', correctiveAction: 'Continue monitoring', status: 'passed', score: 96 },
      { title: 'Drug & Alcohol Testing Compliance', category: 'personnel', inspectionType: 'quarterly', location: 'All Drivers', inspector: 'HR Department', inspectionDate: '2024-03-01', nextInspection: '2024-06-01', findings: '100% compliance with FTA testing requirements', riskLevel: 'low', correctiveAction: 'None required', status: 'passed', score: 100 },
      { title: 'Cybersecurity Assessment', category: 'technology', inspectionType: 'annual', location: 'IT Infrastructure', inspector: 'SecureTransit Consulting', inspectionDate: '2024-02-05', nextInspection: '2025-02-05', findings: 'Firewall rules need updating, 2 unpatched systems found', riskLevel: 'high', correctiveAction: 'Emergency patching and firewall review completed', status: 'action-required', score: 65 },
    ]);
    console.log('Safety seeded.');

    console.log('\nSeeding completed successfully!');
    console.log('Login credentials:');
    console.log('  Email: admin@transit.gov');
    console.log('  Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
