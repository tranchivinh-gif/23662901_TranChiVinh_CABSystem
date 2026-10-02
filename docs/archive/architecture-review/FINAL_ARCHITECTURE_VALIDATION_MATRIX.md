# Final Architecture Validation Matrix

Scope: documentation and rendered architecture artifacts only. SRS and implementation code were not changed.

| Item | Expected | Status | Evidence |
|---|---|---|---|
| H-1 database statement | All eight services use PostgreSQL per SRS 18.7 | RESOLVED | `03_Service_Decomposition.md`, 06, 07, ERD |
| H-2 SC-15 | Notifications owns persisted Notification and recipient-scoped list/mark-read with canonical `recipientAccountId` reference | RESOLVED | 03–07, OpenAPI paths/schema/bundle, ERD |
| H-3 SC-20 | Operations owns derived ReportingView and KPI query | RESOLVED | 03–07, Operations OpenAPI/dashboard schema, ERD |
| Services and bounded contexts | Exactly eight each | PASS | 03, 04, 06, 07, `bounded-context.md`, BC diagram |
| Databases | Eight isolated PostgreSQL databases | PASS | SRS 18.7, 06, 07, ERD, microservice diagram |
| Ownership and references | Source data remains with its owner; no cross-service FK/shared DB | PASS | 03–07, ERD source and image |
| Existing special decisions | Payment.fareId same-DB FK; transactionType normal field; CMD-OPS-002 finalized | PASS | 04–07, ERD, OpenAPI, diagram |
| Kafka | EVT-RID-001/002/003 and EVT-FP-001 only; EVT-FP-002 candidate/inactive; Operations no consumer | PASS | 05–07, microservice diagram |
| OpenAPI and contracts | QRY-NOT-001 recipient schema and existing dashboard route QRY-OPS-005 finalized and aligned | PASS | 04/05/07, OpenAPI paths, schemas, bundle and README |
| SC-15 traceability | Test → Notification API → QRY-NOT-001 → Notifications → Notifications PostgreSQL → `recipientAccountId` → persistent `isRead` | PASS | SC-15 test cases, 04–07, OpenAPI source/bundle, ERD |
| SC-20 traceability | Test → dashboard API/QRY-OPS-005 → ReportingView → owner queries → defined KPIs | PASS | SC-20 test cases, 04–07, OpenAPI, ERD |
| Diagrams | Eight services/BCs/databases; notification state and reporting projection depicted; no cross-service FK | PASS | BC map, microservice diagram, ERD |
| AR-01 recipient field | `recipientAccountId` aligned across Service Contract, OpenAPI source/bundle, ERD notes/SVG/PNG; reference only, no cross-service FK | RESOLVED | 04, 05–07, OpenAPI schema/bundle, ERD artifacts |

## Preserved decisions

Eight services, eight bounded contexts, eight PostgreSQL databases, client REST/HTTPS/JSON, Gateway-to-service gRPC, synchronous service-to-service REST/HTTP, and asynchronous Kafka remain intact. No service, BC, database, endpoint, or Kafka event was added for these gaps. `CMD-OPS-002` remains finalized. SRS was not changed.

## Remaining legitimate OPEN/TBD

Notification retention and delivery retry tuning; reporting projection pagination/batch/backoff/retry tuning; lower-level refresh query payload/batch details; fare trigger/timing; Gateway RPC mapping; partial-registration recovery; internal audit persistence detail; and other source-open security/idempotency configuration remain implementation/design details. None leaves SC-15 or SC-20 capability, ownership, source, query, or freshness undefined.

AR-01 is RESOLVED: `recipientAccountId` is canonical across Notification Service Contract, OpenAPI schema/bundle, ERD notes and rendered ERD. SC-15 traceability is PASS. No High/Critical architecture conflict remains in the reviewed baseline.

## Finalization Pass

| Check | Status | Evidence |
|---|---|---|
| AR-01 | RESOLVED | Canonical `recipientAccountId` is aligned in Notification Service Contract, schema, bundle and ERD notes/rendered diagram. |
| SC-15 | PASS | Test → Notification API → QRY-NOT-001 → Notifications → Notifications PostgreSQL → `recipientAccountId` → persistent `isRead`. |
| Architecture freeze | READY | No Critical/High issue or architecture contradiction remains in the reviewed baseline. See `FINAL_ARCHITECTURE_FREEZE_CHECK.md`. |
