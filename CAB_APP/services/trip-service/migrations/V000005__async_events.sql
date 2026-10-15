
ALTER TABLE outbox_events ADD COLUMN publication_sequence bigint GENERATED ALWAYS AS IDENTITY;
CREATE UNIQUE INDEX outbox_publication_sequence ON outbox_events(publication_sequence);
CREATE INDEX outbox_aggregate_sequence ON outbox_events(aggregate_id,publication_sequence) WHERE status<>'Published';
CREATE TABLE kafka_inbox (
 event_id uuid PRIMARY KEY,
 source_topic text NOT NULL,
 source_partition integer NOT NULL CHECK(source_partition>=0),
 source_offset bigint NOT NULL CHECK(source_offset>=0),
 envelope jsonb NOT NULL,
 request_hash bytea NOT NULL CHECK(octet_length(request_hash)=32),
 status varchar(64) NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending','Done','DeadLetter')),
 attempt_count integer NOT NULL DEFAULT 0 CHECK(attempt_count BETWEEN 0 AND 4),
 next_attempt_at timestamptz NOT NULL DEFAULT now(),
 safe_error_code text,
 received_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX kafka_inbox_pending ON kafka_inbox(next_attempt_at,received_at) WHERE status='Pending';
CREATE TABLE kafka_dead_letters (
 event_id uuid PRIMARY KEY,
 aggregate_id uuid NOT NULL,
 correlation_id uuid NOT NULL,
 original_envelope jsonb NOT NULL,
 exception_code text NOT NULL,
 consumer_name text NOT NULL,
 attempt_count integer NOT NULL CHECK(attempt_count BETWEEN 0 AND 4),
 source_topic text NOT NULL,
 source_partition integer NOT NULL,
 source_offset bigint NOT NULL,
 failed_at timestamptz NOT NULL DEFAULT now(),
 published_at timestamptz
);

CREATE FUNCTION enqueue_trip_audit() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 INSERT INTO outbox_events(event_id,event_type,aggregate_id,correlation_id,payload)
 VALUES(NEW.audit_id,'TripAuditRecorded',NEW.trip_id,NEW.correlation_id,
 jsonb_build_object('actorId',NEW.actor_id,'action',NEW.command,'before',NEW.before_state,'after',NEW.after_state,'tripId',NEW.trip_id));
 RETURN NEW;
END $$;
CREATE TRIGGER trip_audit_outbox AFTER INSERT ON trip_audit_events FOR EACH ROW EXECUTE FUNCTION enqueue_trip_audit();
