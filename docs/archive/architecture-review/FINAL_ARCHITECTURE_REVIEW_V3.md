    # FINAL ARCHITECTURE REVIEW V3

    ## 1. Executive Summary

    **Kết luận: NOT READY FOR ARCHITECTURE FREEZE.** H-1 (PostgreSQL), H-2 (SC-15) và H-3 (SC-20) đều có architecture path đã chốt trong các tài liệu chính. Baseline 8 BC = 8 services = 8 PostgreSQL databases, ownership, giao tiếp, Kafka và Operations intervention nhìn chung nhất quán.

    Còn một **HIGH contract/schema inconsistency** ở trường định danh recipient của Notification: Service Contract định nghĩa `recipientAccountId`, ERD dùng `recipientId`, còn OpenAPI request/response schema dùng `accountId`. Tên trường không đồng nhất giữa contract, data model và public API làm consumer không có một field name chuẩn để triển khai; theo tiêu chí review, đây là contract/API contradiction cần giải quyết trước freeze. Không có Critical issue nào khác được xác định trong phạm vi tài liệu hiện có.

    Review bao gồm các tài liệu Markdown chính, SRS, source và bundled OpenAPI, tất cả OpenAPI paths/schemas, SVG và PNG được liệt kê, README và 20 sheet của `CAB_Test_Cases.xlsx`. Workspace không có source implementation hoặc test automation để xác minh runtime behavior; kết luận vì vậy xác nhận architecture/documentation path, không xác nhận triển khai đã chạy.

    ## 2. Architecture Baseline

    | Baseline | Kết quả | Evidence |
    |---|---|---|
    | 8 bounded contexts | PASS | `03_Service_Decomposition.md` service/BC tables; `bounded-context.md` §13; BC diagram `bounded-context-cab.png` |
    | 8 services, mapping 1:1 | PASS | `04_Service_Contract.md` §3; `06_Microservice_Architecture.md` §2; architecture SVG/PNG |
    | 8 isolated PostgreSQL DBs | PASS | SRS §18.7; 06 §7; 07 §9; ERD source/notes and architecture diagram |
    | No shared DB/direct cross-service DB access | PASS | 04 §2.3; 05 §2; 06 §7; 07 §9 |
    | No added BC/service/database/event | PASS | Catalogs and diagrams retain baseline; EVT-FP-002 is explicitly inactive candidate |

    Logical decomposition language in 03 that schema/protocol/deployment are not defined belongs to that document's logical-design scope; it does not contradict PostgreSQL selected by SRS §18.7 and later architecture documents.

    ## 3. H-1 Database Review

    **RESOLVED.** SRS §18.7 states PostgreSQL is the only database engine. 03 §11.2, 06 §7, 07 §9, the ERD notes and the microservice diagram consistently assign one PostgreSQL database to each service. 07 lists eight separate owner databases and migration locations (07 §9, lines 216–225). No real remaining statement that physical storage or database technology is undecided was found. Open items for encryption, credentials, backup configuration and deployment tuning do not reopen the database-engine choice.

    No conflicting “physical storage undecided”, “database technology TBD”, or “database choice open” statement found. H-1 has no identified blocker.

    ## 4. H-2 SC-15 Notification Review

    **Capability path: RESOLVED. Identifier schema consistency: FAIL (HIGH, see issue AR-01).**

    - Workbook contains the `SC-15 - Notification` sheet. README maps UC-21 to Notifications; the architecture maps the required list/read behavior to `QRY-NOT-001`.
    - `04_Service_Contract.md` §4.6.4 (lines 467–468) finalizes recipient-scoped, paginated listing and mark-read under one QRY; owned/missing behavior is 404. §4.6.8–9 (491–499) confirms persisted read state and implementation-only retention/retry tuning.
    - `05_API_IPC_Event_Contract.md` lines 209–211 and 604 finalizes QRY-NOT-001, idempotent mark-read and Notifications PostgreSQL persistence. Recipient and Trip IDs are references, not cross-service FKs.
    - Source OpenAPI paths `api-document/paths/notifications/notifications.yaml` lines 1–74 and bundled OpenAPI lines 1442–1497 declare both list and mark-read as `FINALIZED`; list is authenticated-recipient scoped; mark-read sets persistent `isRead=true`, returns the updated record, and returns 404 for missing/non-owned records. PATCH is idempotent.
    - `api-document/schemas/notification/Notification.yaml` requires `notificationId`, `accountId`, `notificationType`, `tripId`, `title`, `content`, `isRead`, `createdAt`. `cab-erd-database-per-service.svg` names the persisted recipient field `recipientId`; 04 §4.6.1 names it `recipientAccountId`.
    - Persistence, type/content, creation time and persistent `isRead` are present in the Notifications DB model/diagram. No `readAt` is required. Owner boundaries are correct; no cross-service FK appears.

    The functional chain and ownership are present, but the recipient field must have one canonical name across contract, OpenAPI, schema and ERD before freezing.

    ## 5. H-3 SC-20 Reporting Review

    **RESOLVED.** Workbook includes `SC-20 - System KPI`. Existing `GET /operations/dashboard` is `QRY-OPS-005`, `FINALIZED` in source and bundled OpenAPI (`api-document/paths/operations/operations.yaml` lines 75–140; bundle line 1704 onward). 04 §4.8 and 05 lines 246, 254–258 and 289 define Operations-owned projection and existing source queries. 06 §7.1 and 07 lines 229–233 agree:

    - Operations owns dashboard query and `ReportingView` in Operations PostgreSQL; source transactional data remains with Fleet, Ride and Fare & Payment.
    - Projection refresh uses QRY-OPS-002 (Fleet), QRY-OPS-003 (Ride), QRY-OPS-004 (Fare & Payment), via owner REST queries. Operations neither accesses owner DBs nor consumes Kafka for reporting.
    - Refresh is every minute; response includes `refreshedAt`; snapshot older than five minutes sets `isStale=true`.
    - Default window is trailing 30 days UTC; optional UTC boundaries are supported.
    - Revenue sums Paid amounts by payment status update time. Completion and cancellation use terminal trips in-window: Completed / (Completed + Canceled + Failed), and Canceled / same denominator. Empty denominator returns 0.
    - Driver metrics include accepted and completed assignments; payment metrics group count and amount by method/status; rates are percentages (0–100).

    `ReportingView` schema (viewId, viewType, periodStart/end, metricValues JSONB, refreshedAt) and source references are represented in 06/07 and ERD source/notes. No service, event or contract ID was added for SC-20.

    ## 6. Bounded Context Review

    PASS. The eight names in `bounded-context.md` §13 match the eight service boundaries in 03/04/06/07. `Operations & Reporting` is a supporting BC and its projection does not transfer source ownership. No ninth BC or service found. The BC diagram is a static artifact; its visible context set matches the textual baseline.

    ## 7. Service Ownership Review

    | Entity | Owner Service | Database | Status |
    |---|---|---|---|
    | Account | Identity & Access | Identity PostgreSQL | PASS |
    | Customer | Customer Management | Customer PostgreSQL | PASS |
    | Driver | Driver & Fleet Management | Fleet PostgreSQL | PASS |
    | Vehicle | Driver & Fleet Management | Fleet PostgreSQL | PASS |
    | VehicleType | Driver & Fleet Management | Fleet PostgreSQL | PASS |
    | TripRequest | Ride | Ride PostgreSQL | PASS |
    | Trip | Ride | Ride PostgreSQL | PASS |
    | DriverAssignment | Ride | Ride PostgreSQL | PASS |
    | Fare | Fare & Payment | Fare & Payment PostgreSQL | PASS |
    | PricingRule | Fare & Payment | Fare & Payment PostgreSQL | PASS |
    | Payment | Fare & Payment | Fare & Payment PostgreSQL | PASS |
    | Notification | Notifications | Notifications PostgreSQL | PASS, recipient field naming issue AR-01 |
    | Rating | Rating & Review | Rating PostgreSQL | PASS |
    | Review | Rating & Review | Rating PostgreSQL | PASS |
    | ReportingView | Operations & Reporting | Operations PostgreSQL | PASS, derived projection only |
    | Audit/Support Note | Operations & Reporting | Operations PostgreSQL | PASS |
    | Transaction | Fare & Payment | Fare & Payment PostgreSQL | PASS |

    Evidence: `03_Service_Decomposition.md` ownership tables and §11.2; `04_Service_Contract.md` §§3, 8, 10–11; `06_Microservice_Architecture.md` §§7–7.1; `07_Source_Code_Architecture.md` §9 and ERD notes. No multiple owner or cross-service FK found.

    ## 8. Database Architecture Review

    PASS with AR-01 schema naming caveat. Eight independently owned PostgreSQL databases are documented. Service credentials and migrations are service-specific. Diagram shows eight DBs; ERD separates same-database FK from cross-service REF. `Payment.fareId` is an in-owner-database FK to Fare. `Transaction.transactionType` is a normal field, not a relationship (`cab-erd-database-per-service.md` lines 6–10). No cross-service DB access is specified.

    ## 9. Communication Architecture Review

    PASS. 05 §1 and §5; 06 diagram and decisions; 07 §23.7 consistently define Client → Gateway via REST/HTTPS/JSON, Gateway → target service via gRPC, synchronous service-to-service calls via REST/HTTP, and asynchronous messaging via Kafka. No direct client-to-service or client-to-DB path is present. No service-to-other-service DB path is present. Exact Gateway gRPC method/message mapping remains TBD, but public REST boundary and downstream transport are decided.

    ## 10. API Gateway Review

    PASS by architecture. Gateway is the sole public ingress in 06/07 and the architecture diagram. Responsibilities include authentication/authorization enforcement, routing, rate limiting, request/correlation IDs, idempotency handling as contracted, and REST-to-gRPC transport. 07 §23.7 marks Gateway database access prohibited; no business ownership or domain logic is assigned to Gateway. No bypass route is documented.

    ## 11. Kafka/Event Review

    PASS. Baseline publication is EVT-RID-001, EVT-RID-002, EVT-RID-003 and EVT-FP-001. Notifications consumes these four routes; Operations has no Kafka consumer. EVT-FP-002 remains candidate/inactive (`05` event catalog and §5.29; `06` §12.8; `07` event mapping). Event envelope fields include eventId/type/version, occurredAt, producer, correlationId and payload (05 §5.20); at-least-once, consumer deduplication, retry/DLQ and ordering/recovery/outbox guidance appear in 05 §§5.20–5.25 and 07. No SC-20 reporting event has been added.

    ## 12. Operations Intervention Review

    PASS. `CMD-OPS-002` is `FINALIZED` in 05 and OpenAPI (`api-document/paths/operations/operations.yaml` lines 180–220). Flow is Client → Gateway → Operations → Ride by synchronous REST/HTTP from Operations to Ride. Supervisor only; Staff receives 403; required reason and second confirmation; Operations records audit; Ride validates and changes Trip. 06 §12.12 and 07 §8 affirm Operations does not own Trip, access Ride DB or consume Kafka for intervention. Internal audit persistence representation remains open implementation detail.

    ## 13. Fare & Payment Review

    PASS. Fare, Pricing Rule, Payment and Transaction are owned by Fare & Payment in 03/04/06/07. Ride stores/references finalized fare information but does not own canonical Fare. ERD notes confirm `Payment.fareId` same-database FK and `transactionType` plain field. CMD-RID-004 / CMD-FP-001 / CMD-FP-002 are synchronous Ride→Fare interactions; EVT-FP-002 is not activated. Exact fare trigger/timing remains an OPEN decision in 05 §5.29; it is listed below as an explicit open design item, not misreported as finalized detail.

    ## 14. OpenAPI Review

    PASS for required finalized paths except the recipient schema field mismatch AR-01.

    - Notifications list and mark-read are both present and finalized as QRY-NOT-001 in source and bundle. `isRead` is persistent and mark-read idempotent.
    - Dashboard route exists and is finalized as QRY-OPS-005; schema includes required KPI/freshness fields.
    - Intervention route is finalized CMD-OPS-002 with Supervisor role and forbidden response.
    - Auth, customer, driver, vehicle, trip, payment and rating operation groups are present in `openapi.yaml` and referenced paths/schemas. README maps the established public routes to use cases. No finalized notification/dashboard/intervention endpoint is marked OPEN/TBD.
    - Source OpenAPI is modular under `api-document/`; bundled artifact contains matching notification and operations contract IDs and statuses.

    ## 15. ERD Review

    PASS for ownership and database boundaries; schema name caveat AR-01. `cab-erd-database-per-service.md` defines eight isolated PostgreSQL DBs and FK/REF rules. SVG depicts Notifications `isRead`, Operations `ReportingView` in the existing Operations DB, and QRY-OPS-002/003/004 refresh without direct DB access. PNG artifacts are present alongside the corresponding SVGs. Payment/Fare and transaction details match ownership. SRS earlier conceptual entity/ERD material is not itself a conflicting microservice deployment diagram; SRS §18.7 supplies the explicit database technology baseline.

    ## 16. Diagram Review

    PASS with AR-01 field-name alignment caveat. `bounded-context-cab.png` represents the eight contexts. `cab-microservice-architecture.svg/.png` depicts the public Gateway, REST/HTTPS/JSON ingress, gRPC downstream, eight service databases labeled PostgreSQL, Kafka four-event baseline, Operations → Ride CMD-OPS-002 and no Operations Kafka consumer. ERD SVG/PNG depicts isolated ownership, local FK vs cross-service reference, Notification persistent read state and Operations projection. Textual SVG labels agree with the requested dependencies, including Ride → Fare/Notifications/Rating, Customer and Fleet → Rating, Driver & Fleet → Operations, and Operations → Ride.

    ## 17. SC-01 to SC-20 Traceability

    Workbook inspection confirms 20 corresponding SC sheets. Mapping below follows the documented scenario intent and public/internal architecture path; workbook remains the test expectation source. SC-06/08 are internal Ride/Fleet paths rather than standalone public operations.

    | Requirement/Test | API | Contract | Service | DB | Status |
    |---|---|---|---|---|---|
    | SC-01 Customer Account | auth register/login; customer profile operations | IAM create/auth; customer commands | Identity & Access; Customer Management | Identity; Customer PostgreSQL | PASS |
    | SC-02 Driver Account | driver registration/profile | IAM; Driver & Fleet commands | Identity & Access; Driver & Fleet | Identity; Fleet PostgreSQL | PASS |
    | SC-03 Vehicle | `/vehicles` CRUD | Fleet vehicle operations | Driver & Fleet | Fleet PostgreSQL | PASS |
    | SC-04 Driver Availability | `PATCH /drivers/{id}/availability` | Fleet availability command | Driver & Fleet | Fleet PostgreSQL | PASS |
    | SC-05 Trip Request | `POST /trip-requests` | Ride trip request command | Ride | Ride PostgreSQL | PASS |
    | SC-06 Driver Matching | internal matching; no separate client endpoint | Ride ↔ Fleet owner query | Ride; Driver & Fleet | Ride; Fleet PostgreSQL | PASS |
    | SC-07 Assignment & Response | assignment get/accept/reject | Ride assignment operations | Ride | Ride PostgreSQL | PASS |
    | SC-08 No Driver Found | trip request result/status + notification | Ride matching; EVT-RID-001 | Ride; Notifications | Ride; Notifications PostgreSQL | PASS |
    | SC-09 Trip Status Control | `PATCH /trips/{id}/status` | Ride lifecycle command | Ride | Ride PostgreSQL | PASS |
    | SC-10 Trip Tracking | trip GET/track and real-time ticket/events | Ride query/realtime contract | Ride | Ride PostgreSQL; latest location in Fleet PostgreSQL | PASS |
    | SC-11 Driver Location | driver location update; trip location read | Fleet location; Ride location query | Driver & Fleet; Ride | Fleet; Ride PostgreSQL | PASS |
    | SC-12 Trip Fare | fare quote / trip fare read | CMD-RID-004, CMD-FP-001/002, fare query | Fare & Payment (Ride references) | Fare & Payment PostgreSQL | PASS; trigger timing OPEN |
    | SC-13 Cash Payment | `POST /payments`, payment GET | Fare & Payment payment command/query | Fare & Payment | Fare & Payment PostgreSQL | PASS |
    | SC-14 Electronic Payment | payment create/retry/webhook | payment/provider outcome; EVT-FP-001 | Fare & Payment; Notifications | Fare & Payment; Notifications PostgreSQL | PASS |
    | SC-15 Notification | GET list; PATCH mark-read | QRY-NOT-001 | Notifications | Notifications PostgreSQL, persistent `isRead` | PASS capability; AR-01 schema name |
    | SC-16 Trip Rating | `POST /trips/{id}/rating` | Rating create; Ride completion query | Rating & Review; Ride | Rating; Ride PostgreSQL | PASS |
    | SC-17 Operations CRUD | customer/driver/vehicle operations endpoints | owner CRUD contracts | Customer; Driver & Fleet | respective owner PostgreSQL DBs | PASS |
    | SC-18 Operations Trip Lookup | trip list/get/track | QRY-OPS-003 / Ride query | Operations via Ride owner | Ride; Operations only derived records | PASS |
    | SC-19 Payment Transactions | payment GET; `/operations/transactions` | QRY-OPS-001/004 and payment queries | Fare & Payment; Operations query | Fare & Payment; Operations PostgreSQL as applicable | PASS |
    | SC-20 System KPI | GET `/operations/dashboard` | QRY-OPS-005; source QRY-OPS-002/003/004 | Operations & Reporting | Operations PostgreSQL ReportingView | PASS |

    No test sheet was found without a documented architecture route at this level. The workbook is a business test specification; it does not by itself prove automated tests or runtime behavior exist.

    ## 18. Cross-Document Consistency

    | Topic | Result | Evidence |
    |---|---|---|
    | BC/service/database counts | Consistent | 03, 04, 06, 07, BC/microservice diagrams |
    | Database engine/ownership | Consistent | SRS §18.7; 03 §11.2; 06 §7; 07 §9; ERD |
    | SC-15 capability/ownership | Consistent except recipient field label | 04 §4.6; 05 QRY-NOT-001; OpenAPI schema; ERD |
    | SC-20 query/projection/KPIs | Consistent | 04 §4.8; 05 QRY-OPS-002..005; 06 §7.1; 07 §9; OpenAPI; ERD |
    | Communication/Gateway | Consistent | 05, 06, 07, architecture diagram |
    | Kafka and intervention | Consistent | 05, 06, 07, architecture diagram |
    | Fare/payment ownership | Consistent | 03–07, ERD |
    | Notification recipient attribute name | **Mismatch** | `recipientAccountId` vs `recipientId` vs `accountId`; AR-01 |

    ## 19. Remaining OPEN/TBD

    These entries are explicitly present in source material and are not silently treated as closed:

    - Gateway gRPC RPC method/message mapping where existing contracts are insufficient (05 §5.29; 06 §14/decisions; 07 handoff).
    - Exact Ride→Fare calculation/finalization trigger and timing (05 §5.29; 04 §12). EVT-FP-002 remains inactive candidate.
    - Partial registration failure recovery/compensation (05 §5.29; 06 registration flow).
    - Idempotency key format/retention; event and DLQ retention durations; schema registry choice; timeout/retry tuning (05 §5.29; 07 §9+).
    - Notification retention and delivery retry tuning (04 §12; 05 §5.29; 07 open items). These do not reopen list/read/persistent `isRead` capability.
    - Reporting projection pagination, batch/backoff/retry tuning (05 §5.29; 07 handoff). These do not reopen source contracts, ownership, formulas or freshness baseline.
    - Internal persistence representation for intervention audit (05 §5.29; 07 handoff); required audit content/flow is finalized.
    - Encryption-at-rest mechanism/key lifecycle and lower-level runtime/toolchain details (07 §9/decision list).
    - Exact lower-level payload constraints/status taxonomy for some service contracts (05 §5.29).

    No unresolved database technology choice, required SC-15/SC-20 capability, or active Kafka event selection was found. The open Fare trigger/timing item should be closed in detailed design before implementing the lifecycle, but source currently states synchronous Ride→Fare baseline and explicitly keeps the async consumer inactive.

    ## 20. Issues by Severity

    | ID | Severity | Issue | Evidence | Impact | Required Action |
    |---|---|---|---|---|---|
    | AR-01 | HIGH | Notification recipient identifier field name differs across canonical contract, ERD and API schema: `recipientAccountId`, `recipientId`, `accountId`. | 04_Service_Contract.md §4.6.1 line 454; cab-erd-database-per-service.svg lines 16/44 and ERD notes line 7; api-document/schemas/notification/Notification.yaml lines 3–17. | The ownership semantics are clear, but contract consumers cannot rely on a single stable serialized/persisted field name; it is a contract/API contradiction under the stated freeze criteria. | Select the already-intended recipient reference field name and align 04, ERD SVG/PNG, OpenAPI schema and bundled OpenAPI. No new service/event/contract needed. |

    No other Critical or High issue identified. Implementation files are absent, so runtime controls are architecture recommendations, not verified implementation facts.

    ## 21. Final Validation Matrix

    | Area | Status | Evidence |
    |---|---|---|
    | 8 BC | PASS | `bounded-context.md` §13; 03/06/07 |
    | 8 Services | PASS | 04 §3; 06/07 service lists |
    | 8 PostgreSQL DB | PASS | SRS §18.7; 06 §7; 07 §9; diagram/ERD |
    | Ownership | PASS | 03/04/06/07 ownership matrices; ERD refs |
    | Gateway | PASS | 06/07 and architecture diagram |
    | REST/gRPC | PASS | 05, 06, 07 |
    | Kafka | PASS | Four baseline events, at-least-once, candidate EVT-FP-002 inactive |
    | SC-15 | FAIL | Capability passes; recipient schema inconsistency AR-01 |
    | SC-20 | PASS | QRY-OPS-005, ReportingView and KPI chain documented |
    | Operations Intervention | PASS | CMD-OPS-002 finalized in 05/OpenAPI; owner flow in 06/07 |
    | OpenAPI | FAIL | Required routes/statuses present; Notification schema mismatch AR-01 |
    | ERD | FAIL | Ownership/db structure passes; recipient field not aligned with API/contract AR-01 |
    | Diagrams | FAIL | Ownership/protocol/flow pass; recipient field name is inconsistent with contract/API AR-01 |
    | Traceability | FAIL | SC-01–20 paths present; SC-15 API/data field mismatch remains |

    ## 22. Final Status

    # NOT READY FOR ARCHITECTURE FREEZE

    ## 23. Freeze Recommendation

    Before freeze, resolve **AR-01** by choosing one canonical recipient-reference field name and aligning the Service Contract, ERD source and rendered artifacts, OpenAPI schema and bundled OpenAPI. Then recheck SC-15 schema alignment and diagram rendering. The existing eight-service, eight-database baseline and the SC-20 reporting path otherwise have sufficient architecture definition to freeze. Remaining operational tuning items listed in §19 may proceed to detailed design/implementation without adding services, BCs, databases, events or contract IDs.
