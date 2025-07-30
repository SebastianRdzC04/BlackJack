CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(254) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP
);

-- Tabla: auth_access_tokens
CREATE TABLE IF NOT EXISTS auth_access_tokens (
  id SERIAL PRIMARY KEY,
  tokenable_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  hash VARCHAR(255) NOT NULL,
  abilities TEXT NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP
);