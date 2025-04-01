
-- Function to get notifications for a user with actor profiles
CREATE OR REPLACE FUNCTION public.get_notifications(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  actor_id UUID,
  type TEXT,
  post_id UUID,
  read BOOLEAN,
  created_at TIMESTAMPTZ,
  actor_profile JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.user_id,
    n.actor_id,
    n.type,
    n.post_id,
    n.read,
    n.created_at,
    json_build_object(
      'id', p.id,
      'full_name', p.full_name,
      'username', p.username,
      'profile_picture', p.profile_picture
    ) AS actor_profile
  FROM 
    public.notifications n
  JOIN 
    public.profiles p ON n.actor_id = p.id
  WHERE 
    n.user_id = p_user_id
  ORDER BY 
    n.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get a single notification by ID
CREATE OR REPLACE FUNCTION public.get_notification_by_id(p_notification_id UUID)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  actor_id UUID,
  type TEXT,
  post_id UUID,
  read BOOLEAN,
  created_at TIMESTAMPTZ,
  actor_profile JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.user_id,
    n.actor_id,
    n.type,
    n.post_id,
    n.read,
    n.created_at,
    json_build_object(
      'id', p.id,
      'full_name', p.full_name,
      'username', p.username,
      'profile_picture', p.profile_picture
    ) AS actor_profile
  FROM 
    public.notifications n
  JOIN 
    public.profiles p ON n.actor_id = p.id
  WHERE 
    n.id = p_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark a notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_as_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifications
  SET read = true
  WHERE id = p_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_as_read(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifications
  SET read = true
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_actor_id UUID,
  p_type TEXT,
  p_post_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.notifications (user_id, actor_id, type, post_id, read)
  VALUES (p_user_id, p_actor_id, p_type, p_post_id, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get messages between two users
CREATE OR REPLACE FUNCTION public.get_messages_between_users(
  p_user_id_1 UUID,
  p_user_id_2 UUID
)
RETURNS TABLE(
  id UUID,
  sender_id UUID,
  receiver_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  read BOOLEAN,
  reply_to_id UUID,
  file_url TEXT,
  file_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.sender_id,
    m.receiver_id,
    m.content,
    m.created_at,
    m.read,
    m.reply_to_id,
    m.file_url,
    m.file_type
  FROM 
    public.messages m
  WHERE 
    (m.sender_id = p_user_id_1 AND m.receiver_id = p_user_id_2) OR
    (m.sender_id = p_user_id_2 AND m.receiver_id = p_user_id_1)
  ORDER BY 
    m.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get latest message between two users
CREATE OR REPLACE FUNCTION public.get_latest_message(
  p_user_id_1 UUID,
  p_user_id_2 UUID
)
RETURNS TABLE(
  id UUID,
  sender_id UUID,
  receiver_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  read BOOLEAN,
  reply_to_id UUID,
  file_url TEXT,
  file_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.sender_id,
    m.receiver_id,
    m.content,
    m.created_at,
    m.read,
    m.reply_to_id,
    m.file_url,
    m.file_type
  FROM 
    public.messages m
  WHERE 
    (m.sender_id = p_user_id_1 AND m.receiver_id = p_user_id_2) OR
    (m.sender_id = p_user_id_2 AND m.receiver_id = p_user_id_1)
  ORDER BY 
    m.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send a message
CREATE OR REPLACE FUNCTION public.send_message(
  p_sender_id UUID,
  p_receiver_id UUID,
  p_content TEXT,
  p_reply_to_id UUID DEFAULT NULL,
  p_file_url TEXT DEFAULT NULL,
  p_file_type TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  sender_id UUID,
  receiver_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  read BOOLEAN,
  reply_to_id UUID,
  file_url TEXT,
  file_type TEXT
) AS $$
DECLARE
  v_id UUID;
  v_created_at TIMESTAMPTZ;
BEGIN
  -- Insert the message
  INSERT INTO public.messages (
    sender_id,
    receiver_id,
    content,
    read,
    reply_to_id,
    file_url,
    file_type
  ) VALUES (
    p_sender_id,
    p_receiver_id,
    p_content,
    false,
    p_reply_to_id,
    p_file_url,
    p_file_type
  )
  RETURNING id, created_at INTO v_id, v_created_at;
  
  -- Return the created message
  RETURN QUERY
  SELECT 
    m.id,
    m.sender_id,
    m.receiver_id,
    m.content,
    m.created_at,
    m.read,
    m.reply_to_id,
    m.file_url,
    m.file_type
  FROM 
    public.messages m
  WHERE 
    m.id = v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
