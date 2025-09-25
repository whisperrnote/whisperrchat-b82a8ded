-- Enable realtime for messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add the messages table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable realtime for conversations table
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- Add the conversations table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Enable realtime for conversation_members table
ALTER TABLE public.conversation_members REPLICA IDENTITY FULL;

-- Add the conversation_members table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_members;