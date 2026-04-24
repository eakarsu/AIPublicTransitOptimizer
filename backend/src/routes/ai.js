const express = require('express');
const { authenticate } = require('../middleware/auth');
const { queryOpenRouter } = require('../services/openrouter');
const { Route, Ridership, Schedule, Fare, Accessibility, Fleet, Budget, Incident, Staff, Performance, Stop, Maintenance, Feedback, Energy, Safety } = require('../models');

const router = express.Router();

// AI Route Optimization
router.post('/optimize-route', authenticate, async (req, res) => {
  try {
    const routes = await Route.findAll();
    const routeData = routes.map(r => `${r.name} (${r.routeNumber}): ${r.startPoint} to ${r.endPoint}, ${r.distance}km, ${r.stops} stops, ${r.estimatedTime}min`).join('\n');

    const prompt = `Analyze the following transit routes and provide optimization recommendations. Consider efficiency, coverage, passenger convenience, and cost reduction.

Routes:
${routeData}

${req.body.additionalContext ? `Additional context: ${req.body.additionalContext}` : ''}

Provide:
1. Route efficiency analysis
2. Overlap/redundancy identification
3. Suggested route modifications
4. New route recommendations
5. Estimated impact on ridership and costs`;

    const result = await queryOpenRouter(prompt, 'You are an expert transit route planner. Analyze routes and provide actionable optimization recommendations with specific metrics.');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Ridership Analysis
router.post('/analyze-ridership', authenticate, async (req, res) => {
  try {
    const data = await Ridership.findAll();
    const ridershipData = data.map(r => `${r.routeName}: ${r.dailyRiders} daily, peak: ${r.peakHourRiders}, off-peak: ${r.offPeakRiders}, satisfaction: ${r.satisfaction}/5, load: ${r.loadFactor}%`).join('\n');

    const prompt = `Analyze the following ridership data and provide insights for transit optimization.

Ridership Data:
${ridershipData}

${req.body.additionalContext ? `Additional context: ${req.body.additionalContext}` : ''}

Provide:
1. Ridership trend analysis
2. Peak vs off-peak patterns
3. Underserved routes identification
4. Demand forecasting recommendations
5. Strategies to increase ridership`;

    const result = await queryOpenRouter(prompt, 'You are a transit data analyst specializing in ridership patterns and demand forecasting.');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Schedule Optimization
router.post('/optimize-schedule', authenticate, async (req, res) => {
  try {
    const schedules = await Schedule.findAll();
    const ridership = await Ridership.findAll();
    const scheduleData = schedules.map(s => `${s.routeName} (${s.dayType}): ${s.firstDeparture}-${s.lastDeparture}, peak freq: ${s.peakFrequency}min, off-peak: ${s.offPeakFrequency}min, trips: ${s.totalTrips}`).join('\n');
    const ridershipData = ridership.map(r => `${r.routeName}: ${r.dailyRiders} daily, peak: ${r.peakHourRiders}`).join('\n');

    const prompt = `Optimize the following transit schedules based on ridership patterns.

Current Schedules:
${scheduleData}

Ridership Data:
${ridershipData}

${req.body.additionalContext ? `Additional context: ${req.body.additionalContext}` : ''}

Provide:
1. Schedule efficiency analysis
2. Frequency adjustment recommendations
3. Service span optimization
4. Connection/transfer optimization
5. Resource utilization improvements`;

    const result = await queryOpenRouter(prompt, 'You are a transit schedule optimization expert. Analyze schedules against demand patterns.');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Fare Modeling
router.post('/model-fares', authenticate, async (req, res) => {
  try {
    const fares = await Fare.findAll();
    const ridership = await Ridership.findAll();
    const fareData = fares.map(f => `${f.name} (${f.fareType}): $${f.basePrice}, discounted: $${f.discountedPrice || 'N/A'}, zone: ${f.zone}, passenger: ${f.passengerType}, revenue: $${f.revenue}`).join('\n');
    const ridershipData = ridership.map(r => `${r.routeName}: ${r.dailyRiders} daily riders`).join('\n');

    const prompt = `Analyze the fare structure and provide modeling recommendations for revenue optimization while maintaining equity.

Current Fares:
${fareData}

Ridership Context:
${ridershipData}

${req.body.additionalContext ? `Additional context: ${req.body.additionalContext}` : ''}

Provide:
1. Revenue analysis by fare type
2. Price elasticity assessment
3. Fare structure recommendations
4. Equity impact analysis
5. Revenue optimization strategies
6. Discount program effectiveness`;

    const result = await queryOpenRouter(prompt, 'You are a transit fare policy expert specializing in revenue optimization and fare equity.');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Accessibility Compliance
router.post('/check-accessibility', authenticate, async (req, res) => {
  try {
    const data = await Accessibility.findAll();
    const accessData = data.map(a => `${a.stationName}: wheelchair=${a.wheelchairAccess}, elevator=${a.elevatorAvailable}, tactile=${a.tactilePaving}, audio=${a.audioAnnouncements}, braille=${a.brailleSignage}, lowFloor=${a.lowFloorVehicles}, score=${a.complianceScore}%, status=${a.status}`).join('\n');

    const prompt = `Evaluate the following transit accessibility data against ADA and international accessibility standards.

Accessibility Data:
${accessData}

${req.body.additionalContext ? `Additional context: ${req.body.additionalContext}` : ''}

Provide:
1. Overall compliance assessment
2. Critical gaps identification
3. Priority remediation plan
4. Cost estimation for improvements
5. Timeline recommendations
6. Best practices from leading transit agencies`;

    const result = await queryOpenRouter(prompt, 'You are a transit accessibility compliance expert specializing in ADA requirements and universal design.');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Fleet Allocation
router.post('/allocate-fleet', authenticate, async (req, res) => {
  try {
    const fleet = await Fleet.findAll();
    const routes = await Route.findAll();
    const ridership = await Ridership.findAll();
    const fleetData = fleet.map(f => `${f.vehicleId} (${f.type}): ${f.make} ${f.model} ${f.year}, capacity: ${f.capacity}, fuel: ${f.fuelType}, mileage: ${f.mileage}km, status: ${f.status}, route: ${f.assignedRoute || 'unassigned'}`).join('\n');
    const routeData = routes.map(r => `${r.name}: ${r.distance}km, ${r.stops} stops`).join('\n');
    const ridershipData = ridership.map(r => `${r.routeName}: ${r.dailyRiders} daily, peak: ${r.peakHourRiders}`).join('\n');

    const prompt = `Optimize fleet allocation based on the following data.

Fleet:
${fleetData}

Routes:
${routeData}

Ridership:
${ridershipData}

${req.body.additionalContext ? `Additional context: ${req.body.additionalContext}` : ''}

Provide:
1. Current allocation efficiency analysis
2. Vehicle-route matching optimization
3. Maintenance scheduling recommendations
4. Fleet expansion/retirement plan
5. Fuel efficiency improvements
6. Cost savings opportunities`;

    const result = await queryOpenRouter(prompt, 'You are a transit fleet management expert specializing in vehicle allocation and lifecycle optimization.');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Budget Analysis
router.post('/analyze-budget', authenticate, async (req, res) => {
  try {
    const data = await Budget.findAll();
    const budgetData = data.map(b => `${b.name} (${b.contractType}): vendor=${b.vendor}, total=$${b.totalAmount}, spent=$${b.spentAmount}, dept=${b.department}, ${b.startDate} to ${b.endDate}, status=${b.status}`).join('\n');
    const prompt = `Analyze transit agency budget and contract data.\n\nBudget & Contracts:\n${budgetData}\n\n${req.body.additionalContext ? `Context: ${req.body.additionalContext}` : ''}\n\nProvide:\n1. Budget utilization analysis\n2. Contract performance review\n3. Cost optimization opportunities\n4. Risk assessment for expiring contracts\n5. Budget forecasting recommendations\n6. Vendor performance evaluation`;
    const result = await queryOpenRouter(prompt, 'You are a public transit finance expert specializing in government budgets and procurement.');
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// AI Incident Analysis
router.post('/analyze-incidents', authenticate, async (req, res) => {
  try {
    const data = await Incident.findAll();
    const incidentData = data.map(i => `${i.title} (${i.type}): severity=${i.severity}, route=${i.routeAffected}, location=${i.location}, status=${i.status}, assigned=${i.assignedTo}`).join('\n');
    const prompt = `Analyze transit incident data and provide safety recommendations.\n\nIncidents:\n${incidentData}\n\n${req.body.additionalContext ? `Context: ${req.body.additionalContext}` : ''}\n\nProvide:\n1. Incident pattern analysis\n2. High-risk areas identification\n3. Root cause analysis\n4. Prevention strategies\n5. Response time optimization\n6. Resource allocation for incident management`;
    const result = await queryOpenRouter(prompt, 'You are a transit safety and incident management expert.');
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// AI Staff Optimization
router.post('/optimize-staff', authenticate, async (req, res) => {
  try {
    const data = await Staff.findAll();
    const staffData = data.map(s => `${s.name} (${s.employeeId}): role=${s.role}, dept=${s.department}, route=${s.assignedRoute}, shift=${s.shiftType}, certs=${s.certifications}, status=${s.status}`).join('\n');
    const prompt = `Analyze transit staff allocation and provide workforce optimization.\n\nStaff:\n${staffData}\n\n${req.body.additionalContext ? `Context: ${req.body.additionalContext}` : ''}\n\nProvide:\n1. Staffing level analysis\n2. Shift optimization recommendations\n3. Training and certification gaps\n4. Workload distribution assessment\n5. Recruitment priorities\n6. Cost-effective scheduling strategies`;
    const result = await queryOpenRouter(prompt, 'You are a transit workforce management expert specializing in staff optimization.');
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// AI Performance Analysis
router.post('/analyze-performance', authenticate, async (req, res) => {
  try {
    const data = await Performance.findAll();
    const perfData = data.map(p => `${p.metricName} (${p.category}): current=${p.currentValue}${p.unit}, target=${p.targetValue}${p.unit}, trend=${p.trend}, status=${p.status}`).join('\n');
    const prompt = `Analyze transit performance KPIs and provide improvement recommendations.\n\nPerformance Metrics:\n${perfData}\n\n${req.body.additionalContext ? `Context: ${req.body.additionalContext}` : ''}\n\nProvide:\n1. Overall performance assessment\n2. Underperforming metrics analysis\n3. Benchmark comparisons\n4. Improvement action plans\n5. KPI correlation insights\n6. Strategic recommendations`;
    const result = await queryOpenRouter(prompt, 'You are a transit performance analytics expert specializing in KPI optimization.');
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// AI Stops Optimization
router.post('/optimize-stops', authenticate, async (req, res) => {
  try {
    const data = await Stop.findAll();
    const stopData = data.map(s => `${s.name} (${s.stopCode}): type=${s.type}, zone=${s.zone}, shelter=${s.shelterAvailable}, bench=${s.benchAvailable}, display=${s.digitalDisplay}, routes=${s.routesServed}, boardings=${s.dailyBoardings}`).join('\n');
    const prompt = `Analyze transit stop infrastructure and provide optimization recommendations.\n\nStops & Stations:\n${stopData}\n\n${req.body.additionalContext ? `Context: ${req.body.additionalContext}` : ''}\n\nProvide:\n1. Stop utilization analysis\n2. Infrastructure improvement priorities\n3. Stop consolidation/addition recommendations\n4. Amenity upgrade priorities\n5. Passenger experience improvements\n6. Cost-benefit analysis for upgrades`;
    const result = await queryOpenRouter(prompt, 'You are a transit infrastructure planning expert specializing in stop and station optimization.');
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// AI Maintenance Planning
router.post('/plan-maintenance', authenticate, async (req, res) => {
  try {
    const data = await Maintenance.findAll();
    const fleet = await Fleet.findAll();
    const maintData = data.map(m => `${m.vehicleId} (${m.type}): desc=${m.description}, scheduled=${m.scheduledDate}, cost=$${m.cost}, priority=${m.priority}, status=${m.status}`).join('\n');
    const fleetData = fleet.map(f => `${f.vehicleId}: mileage=${f.mileage}km, status=${f.status}`).join('\n');
    const prompt = `Optimize vehicle maintenance scheduling and planning.\n\nMaintenance Logs:\n${maintData}\n\nFleet Status:\n${fleetData}\n\n${req.body.additionalContext ? `Context: ${req.body.additionalContext}` : ''}\n\nProvide:\n1. Maintenance schedule optimization\n2. Predictive maintenance recommendations\n3. Cost reduction strategies\n4. Parts inventory optimization\n5. Downtime minimization plan\n6. Lifecycle cost analysis`;
    const result = await queryOpenRouter(prompt, 'You are a fleet maintenance optimization expert specializing in predictive maintenance and lifecycle management.');
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// AI Feedback Analysis
router.post('/analyze-feedback', authenticate, async (req, res) => {
  try {
    const data = await Feedback.findAll();
    const fbData = data.map(f => `#${f.ticketNumber} (${f.category}): "${f.subject}", route=${f.routeAffected}, rating=${f.rating}/5, status=${f.status}`).join('\n');
    const prompt = `Analyze passenger feedback and complaints to improve service quality.\n\nFeedback Data:\n${fbData}\n\n${req.body.additionalContext ? `Context: ${req.body.additionalContext}` : ''}\n\nProvide:\n1. Sentiment analysis summary\n2. Common complaint patterns\n3. Route-specific issues\n4. Service improvement priorities\n5. Passenger satisfaction trends\n6. Actionable recommendations`;
    const result = await queryOpenRouter(prompt, 'You are a customer experience expert specializing in public transit passenger satisfaction.');
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// AI Energy & Sustainability Analysis
router.post('/analyze-energy', authenticate, async (req, res) => {
  try {
    const data = await Energy.findAll();
    const energyData = data.map(e => `${e.metricName} (${e.category}): current=${e.currentValue}${e.unit}, prev=${e.previousValue}${e.unit}, target=${e.targetValue}${e.unit}, CO2 saved=${e.co2Saved}t, vehicle=${e.vehicleType}`).join('\n');
    const prompt = `Analyze transit energy consumption and sustainability metrics.\n\nEnergy Data:\n${energyData}\n\n${req.body.additionalContext ? `Context: ${req.body.additionalContext}` : ''}\n\nProvide:\n1. Energy efficiency analysis\n2. Carbon footprint assessment\n3. Electrification roadmap recommendations\n4. Cost savings from green initiatives\n5. Sustainability benchmarking\n6. Renewable energy integration opportunities`;
    const result = await queryOpenRouter(prompt, 'You are a transit sustainability expert specializing in energy efficiency and green transportation.');
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// AI Safety Analysis
router.post('/analyze-safety', authenticate, async (req, res) => {
  try {
    const data = await Safety.findAll();
    const safetyData = data.map(s => `${s.title} (${s.category}): type=${s.inspectionType}, location=${s.location}, risk=${s.riskLevel}, score=${s.score}%, inspector=${s.inspector}, status=${s.status}`).join('\n');
    const prompt = `Analyze transit safety inspection data and compliance records.\n\nSafety Data:\n${safetyData}\n\n${req.body.additionalContext ? `Context: ${req.body.additionalContext}` : ''}\n\nProvide:\n1. Overall safety compliance assessment\n2. High-risk area identification\n3. Inspection gap analysis\n4. Corrective action priorities\n5. Safety culture recommendations\n6. Regulatory compliance roadmap`;
    const result = await queryOpenRouter(prompt, 'You are a transit safety compliance expert specializing in regulatory requirements and risk management.');
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

module.exports = router;
