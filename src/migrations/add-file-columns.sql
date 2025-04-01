
-- Check if file_url column exists in messages table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'messages' 
    AND column_name = 'file_url'
  ) THEN
    -- Add file_url column
    ALTER TABLE messages ADD COLUMN file_url TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'messages' 
    AND column_name = 'file_type'
  ) THEN
    -- Add file_type column
    ALTER TABLE messages ADD COLUMN file_type TEXT;
  END IF;
END $$;
