const express = require('express');
const multer = require('multer');
const { parse } = require('csv-parse');
const { authenticate } = require('../middleware/auth');
const { Stop, Route } = require('../models');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function parseCSV(buffer) {
  return new Promise((resolve, reject) => {
    const records = [];
    parse(buffer.toString(), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })
      .on('data', record => records.push(record))
      .on('error', reject)
      .on('end', () => resolve(records));
  });
}

// POST /api/gtfs/import - import stops.txt and/or routes.txt
router.post('/import', authenticate, upload.fields([
  { name: 'stops', maxCount: 1 },
  { name: 'routes', maxCount: 1 },
]), async (req, res) => {
  try {
    const results = { stopsImported: 0, routesImported: 0, errors: [] };

    // Import stops.txt
    if (req.files?.stops) {
      try {
        const records = await parseCSV(req.files.stops[0].buffer);
        let count = 0;
        for (const r of records) {
          try {
            await Stop.upsert({
              stopCode: r.stop_id,
              name: r.stop_name || r.stop_id,
              latitude: parseFloat(r.stop_lat) || null,
              longitude: parseFloat(r.stop_lon) || null,
              zone: r.zone_id || null,
              type: r.location_type === '1' ? 'station' : 'stop',
              status: 'active',
            });
            count++;
          } catch (err) {
            results.errors.push(`Stop ${r.stop_id}: ${err.message}`);
          }
        }
        results.stopsImported = count;
      } catch (err) {
        results.errors.push(`Failed to parse stops.txt: ${err.message}`);
      }
    }

    // Import routes.txt
    if (req.files?.routes) {
      try {
        const records = await parseCSV(req.files.routes[0].buffer);
        let count = 0;
        const routeTypeMap = { '0': 'tram', '1': 'subway', '2': 'rail', '3': 'bus', '4': 'ferry', '5': 'cable', '6': 'gondola', '7': 'funicular' };
        for (const r of records) {
          try {
            await Route.upsert({
              routeNumber: r.route_short_name || r.route_id,
              name: r.route_long_name || r.route_short_name || r.route_id,
              type: routeTypeMap[r.route_type] || 'bus',
              startPoint: r.route_long_name?.split(' to ')[0] || 'Unknown',
              endPoint: r.route_long_name?.split(' to ')[1] || 'Unknown',
              status: 'active',
            });
            count++;
          } catch (err) {
            results.errors.push(`Route ${r.route_id}: ${err.message}`);
          }
        }
        results.routesImported = count;
      } catch (err) {
        results.errors.push(`Failed to parse routes.txt: ${err.message}`);
      }
    }

    if (!req.files?.stops && !req.files?.routes) {
      return res.status(400).json({ error: 'No files uploaded. Upload stops.txt and/or routes.txt files with fields named "stops" and "routes".' });
    }

    res.json({
      message: 'GTFS import completed',
      ...results,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
