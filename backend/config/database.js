const { Pool } = require('pg');
const mongoose = require('mongoose');
const Redis = require('ioredis');

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'littor',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/littor', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));

const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255),
        phone VARCHAR(20) UNIQUE NOT NULL,
        birth_date VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS profiles (
        id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        bio TEXT,
        photos TEXT[],
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS verification_codes (
        phone VARCHAR(20) PRIMARY KEY,
        code VARCHAR(10) NOT NULL,
        expires_at BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS account_sessions (
        device_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (device_id, user_id)
      );

      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_account_sessions_device ON account_sessions(device_id);

      CREATE TABLE IF NOT EXISTS signal_identity_keys (
        user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        identity_key JSONB NOT NULL,
        registration_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS signal_pre_keys (
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        key_id INTEGER NOT NULL,
        key_pair JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, key_id)
      );

      CREATE TABLE IF NOT EXISTS signal_signed_pre_keys (
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        key_id INTEGER NOT NULL,
        key_pair JSONB NOT NULL,
        signature BYTEA NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, key_id)
      );

      CREATE TABLE IF NOT EXISTS signal_sessions (
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id VARCHAR(255) NOT NULL,
        record TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, recipient_id)
      );

      CREATE INDEX IF NOT EXISTS idx_signal_sessions_user ON signal_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_signal_sessions_recipient ON signal_sessions(recipient_id);
    `);
    console.log('PostgreSQL tables initialized');
  } catch (error) {
    console.error('PostgreSQL init error:', error);
    throw error;
  }
};

module.exports = {
  pool,
  mongoose,
  redis,
  connectMongoDB,
  initDatabase
};
