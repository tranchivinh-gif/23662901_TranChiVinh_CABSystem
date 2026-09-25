# Trip real-time channel

## Ticket and connection

1. An authenticated participant requests `POST /api/v1/trips/{tripId}/realtime-ticket`. The server checks trip ownership/assignment or operations authorization.
2. Server returns a one-time ticket and WebSocket URL. Ticket expires after 60 seconds and is scoped to the trip and permitted event set. Never put the long-lived bearer token in a WebSocket URL.
3. Client connects to the returned `wss://...` URL and presents the one-time ticket using the agreed WebSocket subprotocol. Reject expired, reused, or unauthorized tickets.
4. Reconnect automatically. While reconnecting, fetch `GET /api/v1/trips/{tripId}/driver-location` every 10 seconds.

## Update cadence and events

Driver app posts latest location every 5 seconds while approaching pickup and every 10–15 seconds during the trip, plus immediately on trip status change. Ride service recalculates ETA with a configured external routing provider. Provider selection, key management, quotas, cost, and availability are deployment dependencies.

Server publishes `trip.location.updated`, `trip.eta.updated`, and `trip.status.updated`; payload is `TripLiveUpdate` (`tripId`, `status`, optional coordinates, optional `etaMinutes`, `updatedAt`, `stale`). Position and ETA are estimates. If no position arrives for 30 seconds, set `stale=true` and retain last update timestamp. Stop location delivery on cancellation/completion.

Target: p95 delivery within 10 seconds from server receipt of a driver location update to authorized client. This is measured in the coursework test environment and is not a guaranteed ETA accuracy or production SLA.
