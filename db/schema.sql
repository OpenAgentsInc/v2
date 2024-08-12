-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  image VARCHAR(255),
  credits DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create threads table
CREATE TABLE IF NOT EXISTS threads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  clerk_user_id VARCHAR(255) NOT NULL,
  metadata JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER NOT NULL,
  clerk_user_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tool_invocations JSONB,
  finish_reason VARCHAR(50),
  total_tokens INTEGER,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  model_id VARCHAR(255),
  cost_in_cents DECIMAL(10, 2)
);

-- Add foreign key constraints
ALTER TABLE threads ADD CONSTRAINT fk_threads_user_id FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE threads ADD CONSTRAINT fk_threads_clerk_user_id FOREIGN KEY (clerk_user_id) REFERENCES users(clerk_user_id);
ALTER TABLE messages ADD CONSTRAINT fk_messages_thread_id FOREIGN KEY (thread_id) REFERENCES threads(id);
ALTER TABLE messages ADD CONSTRAINT fk_messages_clerk_user_id FOREIGN KEY (clerk_user_id) REFERENCES users(clerk_user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_threads_user_id ON threads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_clerk_user_id ON threads(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_clerk_user_id ON messages(clerk_user_id);
