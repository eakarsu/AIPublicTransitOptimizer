const express = require('express');
const { authenticate } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { queryOpenRouter, parseAIJson } = require('../services/openrouter');
const { Route, Ridership, Schedule, Fare, Accessibility, Fleet, Budget, Incident, Staff, Performance, Stop, Maintenance, Feedback, Energy, Safety, AiAnalysis } = require('../models');
const { body, validationResult } = require('express-validator');

const router = express.Router();

async function persistAI(userId, endpoint, inputData, result) {
  try {
    await AiAnalysis.create({
      userId: userId || null,
      endpoint,
      inputData: inputData || {},
      result: typeof result === 'string' ? result : JSON.stringify(result),
    });
  } catch (err) {
    console.error('Failed to persist AI result:', err.message);
  }
}

// AI Route Optimization
router.post('/optimize-route', authenticate, aiRateLimiter, async (req, res) => {
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
    await persistAI(req.user?.id, req.path, req.body, result.content || '');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Ridership Analysis
router.post('/analyze-ridership', authenticate, aiRateLimiter, async (req, res) => {
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
    await persistAI(req.user?.id, req.path, req.body, result.content || '');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Schedule Optimization
router.post('/optimize-schedule', authenticate, aiRateLimiter, async (req, res) => {
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
    await persistAI(req.user?.id, req.path, req.body, result.content || '');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Fare Modeling
router.post('/model-fares', authenticate, aiRateLimiter, async (req, res) => {
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
    await persistAI(req.user?.id, req.path, req.body, result.content || '');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Accessibility Compliance
router.post('/check-accessibility', authenticate, aiRateLimiter, async (req, res) => {
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
    await persistAI(req.user?.id, req.path, req.body, result.content || '');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Fleet Allocation
router.post('/allocate-fleet', authenticate, aiRateLimiter, async (req, res) => {
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
    await persistAI(req.user?.id, req.path, req.body, result.content || '');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Budget Analysis
router.post('/analyze-budget', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const data = await Budget.findAll();
    const budgetData = data.map(b => `${b.name} (${b.contractType}): vendor=${b.vendor}, total=$${b.totalAmount}, spent=$${b.spentAmount}, dept=${b.department}, ${b.startDate} to ${b.endDate}, status=${b.status}`).join('\n');
    const prompt = `Analyze transit agency budget and contract data.\n\nBudget & Contracts:\n${budgetData}\n\n${req.body.additionalContext ? `Context: ${req.body.additionalContext}` : ''}\n\nProvide:\n1. Budget utilization analysis\n2. Contract performance review\n3. Cost optimization opportunities\n4. Risk assessment for expiring contracts\n5. Budget forecasting recommendations\n6. Vendor performance evaluation`;
    const result = await queryOpenRouter(prompt, 'You are a public transit finance expert specializing in government budgets and procurement.');
    await persistAI(req.user?.id, req.path, req.body, result.content || '');
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// AI Incident Analysis
router.post('/analyze-incidents', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const data = await Incident.findAll();
    const incidentData = data.map(i => `${i.title} (${i.type}): severity=${i.severity}, route=${i.routeAffected}, location=${i.location}, status=${i.status}, assigned=${i.assignedTo}`).join('\n');
    const prompt = `Analyze transit incident data and provide safety recommendations.\n\nIncidents:\n${incidentData}\n\n${req.body.additionalContext ? `Context: ${req.body.additionalContext}` : ''}\n\nProvide:\n1. Incident pattern analysis\n2. High-risk areas identification\n3. Root cause analysis\n4. Prevention strategies\n5. Response time optimization\n6. Resource allocation for incident management`;
    const result = await queryOpenRouter(prompt, 'You are a transit safety and incident management expert.');
    await persistAI(req.user?.id, req.path, req.body, result.content || '');
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// AI Staff Optimization
router.post('/optimize-staff', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const data = await Staff.findAll();
    const staffData = data.map(s => `${s.name} (${s.employeeId}): role=${s.role}, dept=${s.department}, route=${s.assignedRoute}, shift=${s.shiftType}, certs=${s.certifications}, status=${s.status}`).join('\n');
    const prompt = `Analyze transit staff allocation and provide workforce optimization.\n\nStaff:\n${staffData}\n\n${req.body.additionalContext ? `Context: ${req.body.additionalContext}` : ''}\n\nProvide:\n1. Staffing level analysis\n2. Shift optimization recommendations\n3. Training and certification gaps\n4. Workload distribution assessment\n5. Recruitment priorities\n6. Cost-effective scheduling strategies`;
    const result = await queryOpenRouter(prompt, 'You are a transit workforce management expert specializing in staff optimization.');
    await persistAI(req.user?.id, req.path, req.body, result.content || '');
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// AI Performance Analysis
router.post('/analyze-performance', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const data = await Performance.findAll();
    const perfData = data.map(p => `${p.metricName} (${p.category}): current=${p.currentValue}${p.unit}, target=${p.targetValue}${p.unit}, trend=${p.trend}, status=${p.status}`).join('\n');
    const prompt = `Analyze transit performance KPIs and provide improvement recommendations.\n\nPerformance Metrics:\n${perfData}\n\n${req.body.additionalContext ? `Context: ${req.body.additionalContext}` : ''}\n\nProvide:\n1. Overall performance assessment\n2. Underperforming metrics analysis\n3. Benchmark comparisons\n4. Improvement action plans\n5. KPI correlation insights\n6. Strategic recommendations`;
    const result = await queryOpenRouter(prompt, 'You are a transit performance analytics expert specializing in KPI optimization.');
    await persistAI(req.user?.id, req.path, req.body, result.content || '');
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// AI Stops Optimization
router.post('/optimize-stops', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const data = await Stop.findAll();
    const stopData = data.map(s => `${s.name} (${s.stopCode}): type=${s.type}, zone=${s.zone}, shelter=${s.shelterAvailable}, bench=${s.benchAvailable}, display=${s.digitalDisplay}, routes=${s.routesServed}, boardings=${s.dailyBoardings}`).join('\n');
    const prompt = `Analyze transit stop infrastructure and provide optimization recommendations.\n\nStops & Stations:\n${stopData}\n\n${req.body.additionalContext ? `Context: ${req.body.additionalContext}` : ''}\n\nProvide:\n1. Stop utilization analysis\n2. Infrastructure improvement priorities\n3. Stop consolidation/addition recommendations\n4. Amenity upgrade priorities\n5. Passenger experience improvements\n6. Cost-benefit analysis for upgrades`;
    const result = await queryOpenRouter(prompt, 'You are a transit infrastructure planning expert specializing in stop and station optimization.');
    await persistAI(req.user?.id, req.path, req.body, result.content || '');
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// AI Maintenance Planning
router.post('/plan-maintenance', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const data = await Maintenance.findAll();
    const fleet = await Fleet.findAll();
    const maintData = data.map(m => `${m.vehicleId} (${m.type}): desc=${m.description}, scheduled=${m.scheduledDate}, cost=$${m.cost}, priority=${m.priority}, status=${m.status}`).join('\n');
    const fleetData = fleet.map(f => `${f.vehicleId}: mileage=${f.mileage}km, status=${f.status}`).join('\n');
    const prompt = `Optimize vehicle maintenance scheduling and planning.\n\nMaintenance Logs:\n${maintData}\n\nFleet Status:\n${fleetData}\n\n${req.body.additionalContext ? `Context: ${req.body.additionalContext}` : ''}\n\nProvide:\n1. Maintenance schedule optimization\n2. Predictive maintenance recommendations\n3. Cost reduction strategies\n4. Parts inventory optimization\n5. Downtime minimization plan\n6. Lifecycle cost analysis`;
    const result = await queryOpenRouter(prompt, 'You are a fleet maintenance optimization expert specializing in predictive maintenance and lifecycle management.');
    await persistAI(req.user?.id, req.path, req.body, result.content || '');
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// AI Feedback Analysis
router.post('/analyze-feedback', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const data = await Feedback.findAll();
    const fbData = data.map(f => `#${f.ticketNumber} (${f.category}): "${f.subject}", route=${f.routeAffected}, rating=${f.rating}/5, status=${f.status}`).join('\n');
    const prompt = `Analyze passenger feedback and complaints to improve service quality.\n\nFeedback Data:\n${fbData}\n\n${req.body.additionalContext ? `Context: ${req.body.additionalContext}` : ''}\n\nProvide:\n1. Sentiment analysis summary\n2. Common complaint patterns\n3. Route-specific issues\n4. Service improvement priorities\n5. Passenger satisfaction trends\n6. Actionable recommendations`;
    const result = await queryOpenRouter(prompt, 'You are a customer experience expert specializing in public transit passenger satisfaction.');
    await persistAI(req.user?.id, req.path, req.body, result.content || '');
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// AI Energy & Sustainability Analysis
router.post('/analyze-energy', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const data = await Energy.findAll();
    const energyData = data.map(e => `${e.metricName} (${e.category}): current=${e.currentValue}${e.unit}, prev=${e.previousValue}${e.unit}, target=${e.targetValue}${e.unit}, CO2 saved=${e.co2Saved}t, vehicle=${e.vehicleType}`).join('\n');
    const prompt = `Analyze transit energy consumption and sustainability metrics.\n\nEnergy Data:\n${energyData}\n\n${req.body.additionalContext ? `Context: ${req.body.additionalContext}` : ''}\n\nProvide:\n1. Energy efficiency analysis\n2. Carbon footprint assessment\n3. Electrification roadmap recommendations\n4. Cost savings from green initiatives\n5. Sustainability benchmarking\n6. Renewable energy integration opportunities`;
    const result = await queryOpenRouter(prompt, 'You are a transit sustainability expert specializing in energy efficiency and green transportation.');
    await persistAI(req.user?.id, req.path, req.body, result.content || '');
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// AI Safety Analysis
router.post('/analyze-safety', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const data = await Safety.findAll();
    const safetyData = data.map(s => `${s.title} (${s.category}): type=${s.inspectionType}, location=${s.location}, risk=${s.riskLevel}, score=${s.score}%, inspector=${s.inspector}, status=${s.status}`).join('\n');
    const prompt = `Analyze transit safety inspection data and compliance records.\n\nSafety Data:\n${safetyData}\n\n${req.body.additionalContext ? `Context: ${req.body.additionalContext}` : ''}\n\nProvide:\n1. Overall safety compliance assessment\n2. High-risk area identification\n3. Inspection gap analysis\n4. Corrective action priorities\n5. Safety culture recommendations\n6. Regulatory compliance roadmap`;
    const result = await queryOpenRouter(prompt, 'You are a transit safety compliance expert specializing in regulatory requirements and risk management.');
    await persistAI(req.user?.id, req.path, req.body, result.content || '');
    res.json(result);
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// Rider-facing chat: natural language journey recommendations
router.post('/rider-chat', authenticate, aiRateLimiter, [
  body('query').trim().notEmpty().isLength({ max: 500 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { query } = req.body;
    const safeQuery = query.replace(/['"`;]/g, '');

    const [stops, routes, schedules] = await Promise.all([
      Stop.findAll({ limit: 50 }),
      Route.findAll({ where: { status: 'active' }, limit: 30 }),
      Schedule.findAll({ limit: 30 }),
    ]);

    const stopData = stops.map(s => `${s.name} (${s.stopCode}): zone=${s.zone}, routes=${s.routesServed}`).join('\n');
    const routeData = routes.map(r => `Route ${r.routeNumber} - ${r.name}: ${r.startPoint} to ${r.endPoint}, ${r.estimatedTime}min, ${r.stops} stops`).join('\n');
    const scheduleData = schedules.map(s => `${s.routeName} (${s.dayType}): first ${s.firstDeparture}, last ${s.lastDeparture}, every ${s.peakFrequency}min peak`).join('\n');

    const result = await queryOpenRouter(
      `Rider question: "${safeQuery}"\n\nAvailable stops:\n${stopData}\n\nActive routes:\n${routeData}\n\nSchedules:\n${scheduleData}\n\nProvide a helpful journey recommendation with specific stop names, route numbers, and estimated travel times.`,
      'You are a helpful transit assistant helping riders plan their journeys. Be specific about routes, stops, transfers, and timing. Format your response clearly for easy reading.',
      { temperature: 0.5 }
    );

    await persistAI(req.user?.id, '/rider-chat', { query: safeQuery }, result.content || '');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Demand forecasting: queries Ridership history, AI trend and headway recommendations
router.post('/forecast-demand', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const [ridership, schedules, routes] = await Promise.all([
      Ridership.findAll({ order: [['date', 'DESC']], limit: 100 }),
      Schedule.findAll(),
      Route.findAll({ where: { status: 'active' } }),
    ]);

    // Group ridership by route
    const byRoute = {};
    ridership.forEach(r => {
      if (!byRoute[r.routeName]) byRoute[r.routeName] = [];
      byRoute[r.routeName].push({ date: r.date, daily: r.dailyRiders, peak: r.peakHourRiders, trend: r.trend, loadFactor: r.loadFactor });
    });

    const routeSummaries = Object.entries(byRoute).slice(0, 20).map(([name, data]) => {
      const avg = Math.round(data.reduce((s, d) => s + d.daily, 0) / data.length);
      const latest = data[0];
      return `${name}: avg ${avg}/day, latest trend: ${latest?.trend}, load: ${latest?.loadFactor}%`;
    }).join('\n');

    const result = await queryOpenRouter(
      `Analyze ridership demand and provide forecasting with headway recommendations.\n\nRoute demand summaries:\n${routeSummaries}\n\nProvide:\n1. Demand trend analysis per route\n2. 30-day ridership forecast\n3. Recommended headway adjustments (peak/off-peak frequency in minutes)\n4. Routes needing capacity increases\n5. Routes with overcapacity where headways can be extended\n6. Seasonal adjustment recommendations`,
      'You are a transit demand forecasting expert. Provide data-driven forecasts and specific headway recommendations in minutes.',
      { maxTokens: 2500 }
    );

    await persistAI(req.user?.id, '/forecast-demand', { routeCount: Object.keys(byRoute).length }, result.content || '');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Equity analyzer: groups stops by clusters, AI identifies underserved areas
router.get('/equity-report', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const [stops, ridership, routes] = await Promise.all([
      Stop.findAll(),
      Ridership.findAll({ order: [['date', 'DESC']], limit: 50 }),
      Route.findAll(),
    ]);

    // Group stops by geographic zone
    const byZone = {};
    stops.forEach(s => {
      const zone = s.zone || 'unknown';
      if (!byZone[zone]) byZone[zone] = [];
      byZone[zone].push({
        name: s.name,
        code: s.stopCode,
        dailyBoardings: s.dailyBoardings,
        shelter: s.shelterAvailable,
        bench: s.benchAvailable,
        display: s.digitalDisplay,
        routes: s.routesServed,
      });
    });

    const zoneData = Object.entries(byZone).map(([zone, zoneStops]) => {
      const avgBoardings = zoneStops.length ? Math.round(zoneStops.reduce((s, st) => s + (st.dailyBoardings || 0), 0) / zoneStops.length) : 0;
      const shelterPct = zoneStops.length ? Math.round(zoneStops.filter(st => st.shelter).length / zoneStops.length * 100) : 0;
      return `Zone ${zone}: ${zoneStops.length} stops, avg ${avgBoardings} daily boardings, ${shelterPct}% have shelter`;
    }).join('\n');

    const result = await queryOpenRouter(
      `Analyze transit equity across service zones.\n\nZone summary:\n${zoneData}\n\nStop details by zone (sample):\n${JSON.stringify(Object.entries(byZone).slice(0, 3).map(([z, stops]) => ({ zone: z, stops: stops.slice(0, 3) })), null, 2)}\n\nProvide:\n1. Equity analysis across zones\n2. Underserved area identification\n3. Infrastructure disparities\n4. Service frequency equity gaps\n5. Priority investment recommendations\n6. Equity score (1-10) for each zone`,
      'You are a transit equity and social justice expert. Identify service disparities and recommend equitable improvements.'
    );

    await persistAI(req.user?.id, '/equity-report', { zoneCount: Object.keys(byZone).length, stopCount: stops.length }, result.content || '');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Incident pattern analysis
router.post('/incident-patterns', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const [incidents, safety] = await Promise.all([
      Incident.findAll({ order: [['reportedAt', 'DESC']] }),
      Safety.findAll({ order: [['inspectionDate', 'DESC']] }),
    ]);

    const incidentSummary = incidents.reduce((acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + 1;
      return acc;
    }, {});

    const severitySummary = incidents.reduce((acc, i) => {
      acc[i.severity] = (acc[i.severity] || 0) + 1;
      return acc;
    }, {});

    const routeImpacts = incidents.reduce((acc, i) => {
      if (i.routeAffected) acc[i.routeAffected] = (acc[i.routeAffected] || 0) + 1;
      return acc;
    }, {});

    const result = await queryOpenRouter(
      `Analyze transit incident patterns and safety data.\n\nTotal incidents: ${incidents.length}\nBy type: ${JSON.stringify(incidentSummary)}\nBy severity: ${JSON.stringify(severitySummary)}\nMost affected routes: ${JSON.stringify(routeImpacts)}\n\nRecent incidents (sample):\n${incidents.slice(0, 10).map(i => `${i.title} (${i.type}, ${i.severity}): ${i.location}, ${i.status}`).join('\n')}\n\nSafety inspections: ${safety.length} total, ${safety.filter(s => s.status === 'failed').length} failed\n\nProvide:\n1. Incident pattern analysis\n2. High-risk route/location identification\n3. Root cause hypotheses\n4. Prevention strategy recommendations\n5. Response protocol improvements\n6. Safety investment priorities`,
      'You are a transit safety analyst specializing in incident pattern recognition and prevention. Provide actionable safety recommendations.'
    );

    await persistAI(req.user?.id, '/incident-patterns', { totalIncidents: incidents.length }, result.content || '');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Crowding prediction — forecast peak loads by stop/time
router.post('/crowding-prediction', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const { route_id, time_window } = req.body;

    const [ridership, schedules, stops] = await Promise.all([
      Ridership.findAll({ where: route_id ? { routeId: route_id } : {}, limit: 500, order: [['recordedAt', 'DESC']] }).catch(() => []),
      Schedule.findAll({ where: route_id ? { routeId: route_id } : {}, limit: 200 }).catch(() => []),
      Stop.findAll({ limit: 200 }).catch(() => []),
    ]);

    const ridershipSummary = ridership.slice(0, 100).map(r => `route=${r.routeId} stop=${r.stopId || 'n/a'} time=${r.recordedAt} count=${r.boardings || r.passengerCount || '?'}`).join('\n');

    const result = await queryOpenRouter(
      `Predict crowding (passenger load relative to capacity) by stop and time-of-day for the next ${time_window || 'week'}.

Recent ridership samples (most recent 100):
${ridershipSummary || 'None'}

Schedules: ${schedules.length} schedule rows
Stops: ${stops.length} stops

Return JSON only:
{
  "hotspots": [{"stop_id": "string", "route_id": "string", "time_window": "string", "predicted_load_pct": 0, "confidence": "low|medium|high", "rationale": "string"}],
  "peak_periods": [{"window": "string", "expected_demand_index": 0}],
  "operator_actions": ["string"],
  "rider_messaging": ["string"],
  "summary": "string"
}`,
      'You are a transit crowding-forecasting AI. Be conservative; flag uncertainty when data is sparse. Return JSON only.'
    );

    await persistAI(req.user?.id, '/crowding-prediction', { route_id, time_window }, result.content || '');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Maintenance triage — prioritize repairs to maximize uptime
router.post('/maintenance-triage', authenticate, aiRateLimiter, async (req, res) => {
  try {
    const [maintenance, fleet, incidents] = await Promise.all([
      Maintenance.findAll({ order: [['scheduledDate', 'ASC']], limit: 200 }).catch(() => []),
      Fleet.findAll({ limit: 200 }).catch(() => []),
      Incident.findAll({ order: [['reportedAt', 'DESC']], limit: 100 }).catch(() => []),
    ]);

    const maintSummary = maintenance.map(m =>
      `id=${m.id} vehicle=${m.vehicleId || ''} type=${m.type || ''} status=${m.status || ''} priority=${m.priority || ''} sched=${m.scheduledDate || ''} hours=${m.estimatedHours || '?'}`
    ).join('\n');
    const fleetSummary = fleet.map(f =>
      `id=${f.id} type=${f.vehicleType || ''} mileage=${f.mileage || '?'} status=${f.status || ''} last_service=${f.lastServiceDate || 'n/a'}`
    ).join('\n');
    const incidentSummary = incidents.slice(0, 30).map(i => `id=${i.id} type=${i.type} severity=${i.severity} route=${i.routeAffected || ''}`).join('\n');

    const result = await queryOpenRouter(
      `Triage transit-fleet maintenance work to maximize uptime.

Open maintenance (${maintenance.length}):
${maintSummary || 'None'}

Fleet (${fleet.length}):
${fleetSummary || 'None'}

Recent incidents (sample):
${incidentSummary || 'None'}

Return JSON only:
{
  "prioritized": [{"maintenance_id": 0, "rank": 0, "score": 0, "rationale": "string", "suggested_priority": "low|medium|high|critical", "uptime_impact_hours": 0}],
  "deferrable": [{"maintenance_id": 0, "reason": "string"}],
  "fleet_at_risk": [{"vehicle_id": 0, "concern": "string"}],
  "summary": "string"
}`,
      'You are a transit-fleet maintenance triage AI. Optimize for uptime, safety, and cost. Return JSON only.'
    );

    await persistAI(req.user?.id, '/maintenance-triage', {}, result.content || '');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
