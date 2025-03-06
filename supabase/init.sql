
-- Create storage bucket for post media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('messages', 'messages', true)
ON CONFLICT (id) DO NOTHING;
