-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER NOT NULL,
  clerk_user_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  tool_invocations JSONB,
  FOREIGN KEY (thread_id) REFERENCES threads(id),
  FOREIGN KEY (clerk_user_id) REFERENCES users(clerk_user_id)
);

-- Create index on thread_id for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);

-- Create index on clerk_user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_clerk_user_id ON messages(clerk_user_id);

-- Modify threads table to include first_message_id
ALTER TABLE threads ADD COLUMN IF NOT EXISTS first_message_id INTEGER;
ALTER TABLE threads ADD CONSTRAINT fk_first_message FOREIGN KEY (first_message_id) REFERENCES messages(id);

-- Create index on first_message_id for faster queries
CREATE INDEX IF NOT EXISTS idx_threads_first_message_id ON threads(first_message_id);