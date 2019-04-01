FROM postgres:10

COPY --chown=postgres:postgres ["/docker/database/config.sql", "/docker/database/create_tables.sql", "/docker-entrypoint-initdb.d/"]

RUN chmod a+r /docker-entrypoint-initdb.d/*

VOLUME  ["/var/lib/postgresql/data"]
