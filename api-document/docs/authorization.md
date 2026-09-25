# Phan quyen (Baseline 1.1.0)

| Role | Main scope |
|---|---|
| Customer | Own profile, own trips, payment, rating |
| Driver | Own profile/vehicle, availability/location, assigned trips |
| OperationsStaff | CRUD Customer/Driver/Vehicle; approve/reject Driver; monitor trips; add/read support notes; transaction lookup |
| OperationsSupervisor | All Staff rights plus audited trip cancel/close interventions with reason and second confirmation |
| Leadership | Read-only dashboard |

Every endpoint checks both role and resource ownership. Operations roles cannot edit payment history, finalized fare, or driver location. Sensitive actions are audited with actor, role, action, entity, reason, before/after, timestamp, and correlation ID. Logical delete applies to Customer/Driver/Vehicle.
