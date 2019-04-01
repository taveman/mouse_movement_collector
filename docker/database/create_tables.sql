SELECT
    NOT EXISTS(SELECT 1 FROM pg_database WHERE datname = 'statistics') as does_not_exist
\gset
\if :does_not_exist

  CREATE ROLE statistics_user LOGIN PASSWORD 'ProloStop22' VALID UNTIL 'infinity' CREATEDB;

  CREATE DATABASE statistics WITH OWNER = statistics_user;
  \c statistics

  CREATE ROLE statistics_django LOGIN PASSWORD 'ProloStop22' VALID UNTIL 'infinity';
  CREATE SCHEMA IF NOT EXISTS django_statistics AUTHORIZATION statistics_django;
  GRANT CONNECT ON DATABASE statistics TO statistics_django;
  GRANT ALL ON ALL TABLES IN SCHEMA django_statistics TO statistics_django;
  ALTER ROLE statistics_django IN DATABASE statistics SET search_path = django_statistics,public;


  CREATE SCHEMA IF NOT EXISTS statistics_schema AUTHORIZATION statistics_user;

    CREATE TABLE statistics_schema.users (
      id int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
      surname VARCHAR(250),
      age INT,
      gender VARCHAR(1) CONSTRAINT check_gender CHECK (gender = 'M' OR gender = 'F'),
      lefthanded BOOLEAN DEFAULT FALSE,
      grade VARCHAR(10) CONSTRAINT check_grade CHECK (grade IN (
        'first', 'second', 'third', 'fourth', 'fifth', 'magister', 'other'
      )),
      record_date TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc') NOT NULL
    );

    CREATE TABLE statistics_schema.stats (
      id int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
      ip varchar(20) DEFAULT NULL,
      time_slots INT[] NOT NULL,
      marker VARCHAR(240) CONSTRAINT check_marker_unic UNIQUE,
      user_obj INT REFERENCES statistics_schema.users(id) ON DELETE RESTRICT,
      channel VARCHAR(20) CONSTRAINT check_channel CHECK (channel in (
          'wifi', 'cable', 'mobile'
      )),
      vm BOOLEAN DEFAULT FALSE,
      device VARCHAR(100) CONSTRAINT check_device CHECK (device in ('smartphone', 'desktop', 'laptop')),
      os VARCHAR(20) CONSTRAINT check_os CHECK (os in ('windows', 'linux', 'android', 'ios', 'macos')),
      movements jsonb,
      remote_tool VARCHAR(100),
      is_ok BOOLEAN DEFAULT TRUE,
      record_date TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc') NOT NULL
    );

  GRANT ALL ON ALL TABLES IN SCHEMA statistics_schema TO statistics_user;
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA statistics_schema TO statistics_user;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA statistics_schema TO statistics_user;
  GRANT USAGE ON SCHEMA statistics_schema TO statistics_user;
  ALTER ROLE statistics_user IN DATABASE statistics SET search_path = statistics_schema,public;

\else
  \echo 'Database exists'
\endif