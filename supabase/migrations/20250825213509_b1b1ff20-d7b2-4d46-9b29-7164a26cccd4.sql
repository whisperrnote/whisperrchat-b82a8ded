-- Fix security linter issues

-- Fix function search_path for security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix function search_path for security  
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name, anonymous_id)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'Anonymous User'),
        gen_random_uuid()
    );
    RETURN NEW;
END;
$$;

-- Add missing RLS policies for tables that might need them

-- Additional policies for user_roles (admin access)
CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Policy for users to view roles granted to them
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid());

-- Additional policies for blockchain_transactions
CREATE POLICY "Users can create their own transactions" ON public.blockchain_transactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy for chat updates (for admins/moderators)
CREATE POLICY "Chat admins can update chat info" ON public.chats
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.chat_members 
            WHERE chat_id = chats.id 
            AND user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

-- Policy for message updates (sender can edit)
CREATE POLICY "Senders can update their own messages" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid());

-- Policy for message recipients insert
CREATE POLICY "System can create message recipients" ON public.message_recipients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.messages 
            WHERE id = message_recipients.message_id 
            AND sender_id = auth.uid()
        )
    );

-- Enable realtime for key tables
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.chats REPLICA IDENTITY FULL;
ALTER TABLE public.chat_members REPLICA IDENTITY FULL;
ALTER TABLE public.user_profiles REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;