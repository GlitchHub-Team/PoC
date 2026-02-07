CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE SCHEMA IF NOT EXISTS tenant_1;
CREATE SCHEMA IF NOT EXISTS tenant_2;

CREATE TABLE tenant_1.heart_rate (
    time        TIMESTAMPTZ       NOT NULL,
    gateway_id  VARCHAR           NOT NULL,
    bpm         INTEGER           NOT NULL CHECK (bpm > 0)
);

CREATE TABLE tenant_1.blood_oxygen (
    time        TIMESTAMPTZ       NOT NULL,
    gateway_id  VARCHAR           NOT NULL,
    spo2        NUMERIC(5,2)      NOT NULL CHECK (spo2 >= 0 AND spo2 <= 100)
);


SELECT create_hypertable('tenant_1.heart_rate', 'time');

SELECT create_hypertable('tenant_1.blood_oxygen', 'time');

CREATE TABLE tenant_2.heart_rate (
    time        TIMESTAMPTZ       NOT NULL,
    gateway_id  VARCHAR           NOT NULL,
    bpm         INTEGER           NOT NULL CHECK (bpm > 0)
);

CREATE TABLE tenant_2.blood_oxygen (
    time        TIMESTAMPTZ       NOT NULL,
    gateway_id  VARCHAR           NOT NULL,
    spo2        NUMERIC(5,2)      NOT NULL CHECK (spo2 >= 0 AND spo2 <= 100)
);


SELECT create_hypertable('tenant_2.heart_rate', 'time');

SELECT create_hypertable('tenant_2.blood_oxygen', 'time');

REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- Creazione tenant_1 e utente
CREATE USER tenant_1_user WITH PASSWORD 'user';
GRANT USAGE ON SCHEMA tenant_1 TO tenant_1_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA tenant_1 TO tenant_1_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA tenant_1
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO tenant_1_user;
ALTER ROLE tenant_1_user SET search_path TO tenant_1, public;

-- Creazione tenant_2 e utente
CREATE USER tenant_2_user WITH PASSWORD 'user';
GRANT USAGE ON SCHEMA tenant_2 TO tenant_2_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA tenant_2 TO tenant_2_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA tenant_2
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO tenant_2_user;
ALTER ROLE tenant_2_user SET search_path TO tenant_2, public;