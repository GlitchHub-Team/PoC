FROM timescale/timescaledb:latest-pg16

ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=admin
ENV POSTGRES_DB=sensors_db
ENV PGDATA=/var/lib/postgresql/data

COPY ./schema/tables.sql /docker-entrypoint-initdb.d