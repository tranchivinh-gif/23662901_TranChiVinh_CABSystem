# CAB SYSTEM — GLOBAL AGENT INSTRUCTIONS

## 1. PROJECT ROLE

This repository contains the CAB System project.

The implementation MUST follow:

1. Existing SRS / requirements
2. Existing approved architecture
3. Existing bounded contexts and service boundaries
4. Existing API / gRPC / event contracts
5. BA implementation plan
6. Project grading rubric
7. The approved technology stack defined below

Do NOT redesign the architecture during implementation.

---

# 2. APPROVED TECHNOLOGY STACK

The following technology stack is FINAL and APPROVED.

## Backend

- Language: JavaScript
- Runtime: Node.js
- Package Manager: npm
- Framework: Express.js

## Database

- Database: PostgreSQL
- ORM: Prisma
- Migration: Prisma Migrate

## Communication

- API Gateway: Express.js
- Gateway → Service: gRPC
- gRPC libraries:
  - @grpc/grpc-js
  - @grpc/proto-loader
- Service → Service synchronous communication: REST/HTTP
- Asynchronous communication: Kafka
- Kafka client: KafkaJS
- Protocol: Protocol Buffers

## Authentication & Security

- Authentication: JWT
- Password hashing: Argon2
- Validation: express-validator
- Security headers: Helmet
- CORS: cors
- Rate limiting: express-rate-limit

## Logging

- Pino

## Testing

- Jest
- Supertest
- Postman

## API Documentation

- OpenAPI

## Infrastructure

- Docker
- Docker Compose

## CI/CD

- GitHub Actions

## Code Quality

- ESLint

---

# 3. FORBIDDEN TECHNOLOGIES

Do NOT introduce these technologies unless an explicit approved architecture change requires them:

- TypeScript
- NestJS
- MongoDB
- Sequelize
- TypeORM
- Redis
- RabbitMQ
- Kubernetes
- Jenkins
- Prometheus
- Grafana
- Elasticsearch
- Terraform
- AWS
- Service Mesh
- Distributed Tracing

Do not add technology merely because it is considered a "best practice".

Prefer the simplest implementation that satisfies the architecture and rubric.

---

# 4. SERVICE BOUNDARIES

The system contains these services:

1. identity-access-service
2. customer-service
3. driver-fleet-service
4. ride-service
5. fare-payment-service
6. notification-service
7. rating-review-service
8. operations-reporting-service

Do NOT create additional business services.

Do NOT merge existing services.

Do NOT change bounded contexts.

---

# 5. DATABASE OWNERSHIP

Use Database-per-Service.

Each service owns its own PostgreSQL database.

A service MUST NOT directly access another service's database.

Cross-service data access MUST use the approved communication mechanisms.

---

# 6. COMMUNICATION RULES

External clients MUST communicate through API Gateway.

Client
→ API Gateway
→ backend service

Do NOT expose backend services as direct public APIs unless the approved architecture explicitly requires it.

Gateway → Service uses gRPC.

Service → Service synchronous communication uses REST/HTTP.

Asynchronous communication uses Kafka/KafkaJS.

Do not replace synchronous communication with Kafka unless the existing architecture explicitly defines an event.

---

# 7. SECURITY REQUIREMENTS

Implementation MUST address:

- authentication
- authorization
- password hashing
- input validation
- SQL injection prevention
- XSS prevention
- JWT signature validation
- role-based access control
- rate limiting
- payment idempotency/replay protection
- sensitive-data protection

Never store passwords as plaintext.

Never trust client-provided roles or identity claims.

Never construct SQL queries from raw user input.

---

# 8. ENVIRONMENT AND SECRETS

Never commit real secrets.

Use:

.env

for local development.

Commit only:

.env.example

Use .gitignore to exclude:

.env
node_modules/
coverage/
logs/
other generated secrets/artifacts

---

# 9. IMPLEMENTATION PRINCIPLES

Prefer:

- simple code
- clear folder structure
- small modules
- explicit dependencies
- readable JavaScript
- meaningful error handling
- consistent API responses
- testable business logic

Avoid unnecessary abstraction.

Avoid premature optimization.

Avoid over-engineering.

---

# 10. CHANGE CONTROL

Before changing architecture, service boundaries, API contracts, protobuf contracts, event contracts, database ownership, or requirements:

STOP and document the issue.

Do not silently make architectural decisions.

---

# 11. GRADING RUBRIC

The implementation MUST satisfy all 30 project grading criteria.

Every implementation decision should be traceable to one or more rubric criteria.

No criterion should be marked PASS without actual evidence.

---

# 12. FINAL RULE

The goal is:

BUILD THE EXISTING CAB SYSTEM CORRECTLY AND PASS THE RUBRIC.

Do not build a different system.
Do not redesign the system.
Do not add unnecessary technologies.
