# Audit Note — AIPublicTransitOptimizer

Source: `/Users/erolakarsu/projects/_AUDIT/reports/batch_07.md` section #7.

## Original Recommendations

### Gaps — AI Counterparts
- `/crowding-prediction` (added)
- `/maintenance-triage` (added)
- `/accessibility-compliance-check`
- `/staffing-shift-optimization`

### Gaps — Non-AI Features
- Real-time alerts/announcements
- Passenger feedback sentiment (separate from existing `/analyze-feedback`)
- Fare payment / mobile ticketing integration
- Driver scheduling conflict detection
- Service-change impact modeling

### Custom Feature Suggestions
1. Dynamic pricing
2. Climate-responsive operations
3. Equity impact simulation
4. Autonomous shuttle planner
5. Intermodal trip planner
6. Behavioral nudging (A/B messaging)

## Implemented (Mechanical)
- `POST /api/ai/crowding-prediction` — added in `backend/src/routes/ai.js`. Joins `Ridership`+`Schedule`+`Stop`, returns hotspots by stop/time, peak periods, operator actions, rider messaging. Persists via existing `persistAI`.
- `POST /api/ai/maintenance-triage` — added in `backend/src/routes/ai.js`. Joins `Maintenance`+`Fleet`+`Incident`, returns ranked work order list, deferrable items, fleet-at-risk units. Persists via existing `persistAI`.

Both follow existing `queryOpenRouter`/`authenticate`/`aiRateLimiter`/`persistAI` style.

## Backlog (deferred)

### NEEDS-CREDS / NEW-DEPS
- Real-time alerts/announcements (Pub/Sub, push, SMS).
- Fare payment / mobile ticketing (Apple/Google Pay, transit fare APIs).
- Weather/AQ integrations.

### NEEDS-PRODUCT-DECISION
- `/accessibility-compliance-check` — needs ADA rule corpus and route geometry inputs.
- `/staffing-shift-optimization` — needs collective-bargaining constraints data model.
- Service-change impact simulator (operations-research model).

### TOO-RISKY
- Dynamic pricing (commercial + equity sensitivities).
- Climate-responsive auto-rerouting (safety-critical real-time control).

## Apply pass 3 (frontend)

LEFT-AS-IS — frontend already fully wired. `frontend/src/pages/CrowdingPredictionPage.js` and `frontend/src/pages/MaintenanceTriagePage.js` cover the two pass-2 endpoints (`POST /api/ai/crowding-prediction`, `POST /api/ai/maintenance-triage`) via `aiAPI.crowdingPrediction()` / `aiAPI.maintenanceTriage()` in `services/api.js` (JWT bearer wired in interceptor). Both routes registered in `App.js` (`/crowding-prediction`, `/maintenance-triage`) and reachable from sidebar. Idempotence rule applied — no changes.

## Apply pass 4 (mechanical backlog)

NO-OP — every remaining backlog item is already categorised in the original audit note as NEEDS-CREDS / NEW-DEPS (real-time alerts, fare payment, weather/AQ integrations), NEEDS-PRODUCT-DECISION (`/accessibility-compliance-check`, `/staffing-shift-optimization`, service-change impact simulator), or TOO-RISKY (dynamic pricing, climate-responsive auto-rerouting). Per the pass-4 rules, all of these are explicitly out of scope for mechanical apply. Nothing left to add mechanically. Idempotence rule applied — no changes.
