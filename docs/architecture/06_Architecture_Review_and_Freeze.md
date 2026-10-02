# 06 Architecture Review and Freeze

## 1. Review Scope

This record consolidates the final architecture review, resolution passes, and validation matrix. It records documentation and architecture artifact consistency; it does not claim that implementation code or automated runtime tests exist. The SRS, `bounded-context.md`, OpenAPI source/bundle, ERD, diagrams, and `test-case/CAB_Test_Cases.xlsx` remain independent authoritative artifacts for their respective content.

Historical review documents are preserved unchanged in [`docs/archive/architecture-review/`](../archive/architecture-review/).

## 2. Review History

| Review point | Historical finding | Final resolution/status |
|---|---|---|
| Architecture Review V3 | H-1 database wording, H-2 SC-15 capability, and H-3 SC-20 reporting were reviewed. Those paths were already resolved. AR-01 remained HIGH: Service Contract used `recipientAccountId`, ERD used `recipientId`, OpenAPI used `accountId`. Final conclusion: **NOT READY FOR ARCHITECTURE FREEZE**. | Historical result preserved unchanged in [`FINAL_ARCHITECTURE_REVIEW_V3.md`](../archive/architecture-review/FINAL_ARCHITECTURE_REVIEW_V3.md). |
| Freeze/finalization pass | Canonical notification recipient field aligned across contract, ERD notes/rendered artifacts, OpenAPI schema and bundle; SC-15 regression checks passed. | AR-01 **RESOLVED**; `recipientAccountId` is canonical and references Identity & Access `Account.accountId`; it is a reference, not a cross-service FK. |
| Final validation matrix | Rechecked service/context/database counts, ownership, protocols, Kafka, SC-15, SC-20, `CMD-OPS-002`, OpenAPI, ERD, diagrams, and traceability. | All final checks **PASS** or **RESOLVED** as applicable. |

### H-1 — Database technology conflict

All eight service databases use PostgreSQL as specified by SRS §18.7. Encryption, backup, credentials, and deployment tuning do not reopen the engine decision. **Final status: RESOLVED.**

### H-2 — SC-15 Notification architecture gap

Notifications owns persisted Notification records, recipient-scoped listing and mark-read, and persistent `isRead` state in its PostgreSQL database. `QRY-NOT-001` supports the finalized list/read capability. **Final status: RESOLVED.**

### H-3 — SC-20 Reporting architecture gap

Operations & Reporting owns the derived `ReportingView` and `QRY-OPS-005`. It refreshes from owner queries `QRY-OPS-002/003/004`; source records remain with Driver & Fleet, Ride, and Fare & Payment. **Final status: RESOLVED.**

### AR-01 — Notification recipient identifier mismatch

The historical V3 mismatch was `recipientAccountId` vs `recipientId` vs `accountId`. The final contract, OpenAPI schema/bundle, ERD notes and rendered diagrams use canonical `recipientAccountId`. It points to the Account owned by Identity & Access and is not a cross-service FK. **Final status: RESOLVED.**

## 3. Final Architecture Decisions

- Eight bounded contexts map to eight microservices and eight isolated PostgreSQL databases, using database-per-service and single-owner entity ownership.
- Public clients use REST/HTTPS/JSON under `/api/v1` through the API Gateway. Gateway-to-service calls use gRPC. Synchronous service-to-service calls use REST/HTTP. Asynchronous events use Kafka.
- The baseline event set is `EVT-RID-001`, `EVT-RID-002`, `EVT-RID-003`, and `EVT-FP-001`. `EVT-FP-002` remains candidate/inactive. Delivery is at-least-once with event ID deduplication, retries, DLQ, per-key ordering guidance, and outbox recommendation as recorded in Integration Contracts.
- Ride owns Trip lifecycle and `DriverAssignment`; Fare & Payment owns Fare, pricing and Payment; Notifications owns Notification and read state; Operations & Reporting owns intervention/audit records and its derived reporting projection, not source business records.
- Operations intervention uses finalized synchronous `CMD-OPS-002`: Ride validates and changes its Trip; Operations records the required audit. Driver & Fleet and Payment remain Operations dependencies for authorized lookup/reporting.
- Notification's canonical recipient field is `recipientAccountId`, a reference to the IAM-owned Account.
- Detailed command/query/event IDs, routes, request/response/error rules, and security/idempotency requirements are maintained in [04 Integration Contracts](04_Integration_Contracts.md). Implementation structure is maintained in [05 Implementation Architecture](05_Implementation_Architecture.md).

## 4. Final Validation Matrix

| Area | Status | Evidence |
|---|---|---|
| 8 bounded contexts | PASS | `bounded-context.md`; System Architecture mapping |
| 8 services | PASS | System Architecture service mapping and definitions |
| PostgreSQL per service | PASS | SRS §18.7; System Architecture; ERD |
| Entity ownership and references | PASS | System Architecture ownership; ERD; no shared business DB or cross-service FK |
| Gateway | PASS | System Architecture runtime topology and security boundary |
| REST/gRPC | PASS | Public REST/HTTPS/JSON; Gateway downstream gRPC; service sync REST/HTTP |
| Kafka | PASS | Four baseline events; `EVT-FP-002` candidate/inactive |
| SC-15 | PASS | Test → notification API → `QRY-NOT-001` → Notifications PostgreSQL → `recipientAccountId` → persistent `isRead` |
| SC-20 | PASS | Test → dashboard API/`QRY-OPS-005` → Operations `ReportingView` → owner queries and defined KPIs |
| Operations intervention | PASS | Finalized `CMD-OPS-002`; Ride owner action and Operations audit |
| OpenAPI | PASS | Source and bundled schemas/routes aligned with canonical recipient field |
| ERD | PASS | Ownership, PostgreSQL-per-service, reference/FK distinction and canonical field |
| Diagrams | PASS | Eight contexts/services/databases, protocols, projection, intervention and references |
| SC-01–SC-20 traceability | PASS | Existing test workbook and contract/API/service/data ownership mapping |
| Contract IDs | PASS | `CMD-*`, `QRY-*`, and `EVT-*` catalogs retained in Integration Contracts |

Traceability remains available as SRS/use case → bounded context → service → owned entity → contract → OpenAPI operation (where public) → test case. Internal-only flows remain traced to their owner contracts and service boundaries. OpenAPI remains a separate source; it is not copied wholesale into Markdown.

## 5. Architecture Freeze

# READY FOR ARCHITECTURE FREEZE

The finalization pass resolves AR-01. No unresolved architecture blocker remains in the reviewed baseline. This is the final decision and supersedes the historical V3 conclusion without rewriting that record.

## 6. Remaining OPEN/TBD

The following remain detailed-design or implementation work and do not block the frozen architecture:

- Gateway gRPC method/message mapping where the existing contracts do not define RPC schemas.
- Exact Ride-to-Fare calculation/finalization trigger and timing; asynchronous `EVT-FP-002` remains inactive unless formally changed.
- Lower-level service payload constraints and status taxonomy where not specified by owner contracts.
- Partial registration failure recovery/compensation without assuming a distributed transaction.
- Internal persistence representation for the finalized Operations intervention audit facts.
- Notification retention and delivery retry tuning; reporting projection pagination, batch, backoff, and retry tuning.
- Idempotency key format/retention; event and DLQ retention; timeout/retry tuning; schema-registry selection.
- Encryption-at-rest mechanism and key lifecycle; deployment/runtime/toolchain details.

These items must be resolved within existing service boundaries, ownership, protocols, and contracts unless a formal architecture change is approved.

## 7. Freeze Rule

Reopen architecture review only when a change affects a bounded context or service boundary, entity ownership, database-per-service, communication protocol, baseline business event set, or public API semantics. Implementation details that preserve those decisions do not require a new Architecture Review.
