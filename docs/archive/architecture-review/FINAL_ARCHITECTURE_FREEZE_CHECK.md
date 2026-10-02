# FINAL ARCHITECTURE FREEZE CHECK

## 1. AR-01 Resolution

| Location | Before | After | Status |
|---|---|---|---|
| Service Contract | `recipientAccountId` | `recipientAccountId` | PASS |
| ERD notes and source | `recipientId` | `recipientAccountId` → Identity & Access `Account.accountId`, marked REF | PASS |
| OpenAPI Notification schema | `accountId` | `recipientAccountId` | PASS |
| OpenAPI paths | Schema reference; no inline recipient field | References the canonical Notification schema | PASS |
| OpenAPI bundle | `accountId` in Notification schema | `recipientAccountId` | PASS |
| ERD SVG/PNG | `recipientId` | `recipientAccountId`; cross-service reference is explicitly not an FK | PASS |
| README / architecture notes / validation matrix | Generic or inconsistent Notification recipient label | `recipientAccountId` documented as an Account reference | PASS |

`recipientAccountId` points to Account owned by Identity & Access. It is a business reference across service boundaries, not a cross-service foreign key. Notifications remains the sole owner of Notification; Identity & Access remains the sole owner of Account.

`accountId` fields remaining in the repository's Account, Customer, and Driver schemas describe those entities' own Account identifiers. They are not Notification recipient fields. The event-contract names `recipientAccountReferences` and `recipientAccountReference` describe event payload references and remain unchanged; they are not the persisted Notification field. The older `FINAL_ARCHITECTURE_REVIEW_V3.md` retains its original, dated AR-01 finding as review history; this finalization pass supersedes that finding after the source artifacts were corrected.

## 2. Notification Consistency

| Item | Status |
|---|---|
| Ownership: Notification → Notifications Service | PASS |
| Account ownership: Account → Identity & Access | PASS |
| Database: Notifications PostgreSQL | PASS |
| Cross-service recipient reference; no cross-service FK | PASS |
| Canonical recipient field: `recipientAccountId` | PASS |
| QRY-NOT-001 | PASS — FINALIZED |
| List: authenticated recipient-scoped, paginated | PASS — FINALIZED |
| Mark-read: idempotent; not found/non-owned returns 404 | PASS — FINALIZED |
| Persistent `isRead` | PASS |
| SC-15 traceability | PASS — Test → Notification API → QRY-NOT-001 → Notifications Service → Notifications PostgreSQL → `recipientAccountId` → persistent `isRead` |

Source and bundled OpenAPI were parsed and compared. Both `GET /notifications` and `PATCH /notifications/{notificationId}/read` retain QRY-NOT-001 and `FINALIZED`; the bundle's Notification schema requires and exposes `recipientAccountId` and no longer exposes `accountId` for the recipient.

## 3. Regression Check

| Area | Status |
|---|---|
| 8 BC | PASS |
| 8 Services | PASS |
| 8 PostgreSQL | PASS |
| Ownership | PASS |
| Gateway | PASS |
| REST/gRPC | PASS |
| Kafka | PASS — EVT-RID-001/002/003 and EVT-FP-001 remain baseline; EVT-FP-002 remains candidate/inactive |
| SC-15 | PASS |
| SC-20 | PASS — QRY-OPS-005 and Operations-owned ReportingView unchanged |
| CMD-OPS-002 | PASS — FINALIZED |
| OpenAPI | PASS |
| ERD | PASS |
| Diagrams | PASS |
| Traceability | PASS |

No service, bounded context, database, event, Contract ID, ownership rule, communication protocol, or reporting design was added or changed. SRS was not changed.

## 4. Remaining OPEN/TBD

**Architecture blockers: None identified in this finalization scope.** Remaining OPEN/TBD work is deferred and must preserve the frozen boundaries and interaction model.

| Item | Classification | Freeze impact |
|---|---|---|
| Gateway gRPC method/message mapping | Detailed Design | Define mappings for existing public operations; no new business contract or boundary implied. |
| Exact Ride-to-Fare calculation/finalization trigger and timing | Detailed Design | Finalize sequencing within existing Ride ↔ Fare synchronous contract; EVT-FP-002 remains inactive unless formally changed. |
| Lower-level service payload/status constraints | Detailed Design | Complete owner contracts without changing ownership or public API semantics. |
| Partial registration recovery/compensation | Detailed Design | Define recovery across existing Identity/profile-owner calls; do not infer a distributed transaction. |
| Audit persistence representation | Detailed Design | Persist finalized CMD-OPS-002 audit facts in Operations-owned storage. |
| Notification retention and delivery retry tuning | Implementation | Does not reopen QRY-NOT-001, recipient scope, or persistent read state. |
| Reporting pagination/batch/backoff/retry tuning | Implementation | Does not change QRY-OPS-002/003/004 sources, QRY-OPS-005, KPI formulas, or freshness baseline. |
| Idempotency-key format/retention and event/DLQ retention | Implementation | Set operational values within existing idempotency, at-least-once, retry and DLQ design. |
| Timeout/retry tuning, schema-registry choice, encryption-at-rest/key lifecycle, runtime/toolchain details | Implementation / Security Design | Select deployment controls without changing the frozen service and communication architecture. |

## 5. Final Decision

# READY FOR ARCHITECTURE FREEZE

Architecture baseline is now frozen. Remaining OPEN/TBD items are deferred to Detailed Design and Implementation and must not alter the frozen service boundaries, ownership, database-per-service model, communication model, or baseline event architecture without a formal architecture change.
