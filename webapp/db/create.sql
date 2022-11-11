CREATE TABLE IF NOT EXISTS people(
  _id serial PRIMARY KEY,
  uuid UUID NOT NULL DEFAULT gen_random_uuid(),
  name varchar NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS posts(
  _id serial PRIMARY KEY,
  uuid UUID NOT NULL DEFAULT gen_random_uuid(),
  author varchar REFERENCES people(name),
  title varchar NOT NULL,
  text varchar NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  tags varchar[],
  permissions varchar NOT NULL CHECK (permissions in ( 'public', 'protected', 'private' ))
);

CREATE TABLE IF NOT EXISTS connections(
  _id serial PRIMARY KEY,
  host varchar NOT NULL UNIQUE,
  token varchar NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  status varchar NOT NULL CHECK (status in ('unconfirmed', 'follower', 'following', 'mutual', 'blocked'))
);

CREATE TABLE IF NOT EXISTS notifications(
  _id serial PRIMARY KEY,
  uuid UUID NOT NULL DEFAULT gen_random_uuid(),
  text varchar NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  seen boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS dms(
  _id serial PRIMARY KEY,
  uuid UUID NOT NULL DEFAULT gen_random_uuid(),
  text varchar NOT NULL,
  host varchar NOT NULL,
  author varchar NOT NULL,
  seen boolean NOT NULL DEFAULT false
);
