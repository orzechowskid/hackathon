CREATE TABLE IF NOT EXISTS meta(
  schema_version integer NOT NULL
);

DELETE FROM meta;
INSERT INTO meta(schema_version) VALUES(1);

/* schema v1 */

CREATE TABLE IF NOT EXISTS people(
  _id integer PRIMARY KEY generated always AS identity,
  uuid UUID NOT NULL DEFAULT gen_random_uuid(),
  name varchar NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS posts(
  _id integer PRIMARY KEY generated always AS identity,
  uuid UUID NOT NULL DEFAULT gen_random_uuid(),
  author varchar REFERENCES people(name),
  text varchar NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  permissions varchar NOT NULL CHECK (permissions in ( 'public', 'protected', 'private' )),
  original_host varchar,
  original_author varchar,
  original_uuid UUID,
  original_created_at timestamptz,
  score integer NOT NULL DEFAULT 0,
  share_count integer NOT NULL default 0,
  deleted boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS connections(
  host varchar NOT NULL UNIQUE,
  token varchar NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  status varchar NOT NULL CHECK (status in ('unconfirmed', 'follower', 'following', 'mutual', 'blocked')),
  PRIMARY KEY (host, token)
);

CREATE TABLE IF NOT EXISTS notifications(
  _id integer PRIMARY KEY generated always AS identity,
  uuid UUID NOT NULL DEFAULT gen_random_uuid(),
  text varchar NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  seen boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS dms(
  _id integer PRIMARY KEY generated always AS identity,
  uuid UUID NOT NULL DEFAULT gen_random_uuid(),
  text varchar NOT NULL,
  host varchar NOT NULL,
  author varchar NOT NULL,
  seen boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS upvotes(
  host varchar NOT NULL,
  upvoted boolean NOT NULL default false,
  uuid UUID NOT NULL,
  PRIMARY KEY (host, uuid)
);
