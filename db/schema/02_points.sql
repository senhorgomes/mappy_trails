DROP TABLE IF EXISTS points CASCADE;
CREATE TABLE points (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  latitude Decimal(8,6) NOT NULL,
  longitude Decimal(9,6) NOT NULL,
  owner_id INTEGER REFERENCES users(id),
  img TEXT NOT NULL
);

