-- Create robust database schema for WhisperrChat
-- Supporting multiple auth methods, anonymity, and end-to-end encryption

-- User authentication methods enum
CREATE TYPE auth_method AS ENUM ('email_password', 'passkey', 'wallet_connect');

-- User roles enum
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');

-- Message types enum  
CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'voice', 'video', 'system');

-- Chat types enum
CREATE TYPE chat_type AS ENUM ('direct', 'group', 'channel');

-- Device types enum
CREATE TYPE device_type AS ENUM ('web', 'mobile', 'desktop');

-- 1. User Profiles Table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Pseudonymous identity for anonymity
    anonymous_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    -- Privacy settings
    visibility_mode TEXT DEFAULT 'friends' CHECK (visibility_mode IN ('public', 'friends', 'anonymous')),
    allow_contact_discovery BOOLEAN DEFAULT false,
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Authentication Methods Table
CREATE TABLE public.user_auth_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    method auth_method NOT NULL,
    -- Store method-specific data (hashed/encrypted)
    method_data JSONB NOT NULL DEFAULT '{}',
    is_primary BOOLEAN DEFAULT false,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, method)
);

-- 3. User Roles Table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'user',
    granted_by UUID REFERENCES public.user_profiles(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 4. Encryption Keys Table (for E2E encryption)
CREATE TABLE public.user_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    device_id UUID NOT NULL,
    -- Public key for this device
    public_key TEXT NOT NULL,
    -- Encrypted private key bundle
    encrypted_private_key TEXT NOT NULL,
    key_version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, device_id)
);

-- 5. User Devices Table
CREATE TABLE public.user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    device_type device_type NOT NULL,
    device_name TEXT,
    device_fingerprint TEXT NOT NULL,
    push_token TEXT,
    is_trusted BOOLEAN DEFAULT false,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, device_fingerprint)
);

-- 6. Chats Table
CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type chat_type NOT NULL DEFAULT 'direct',
    name TEXT, -- For groups/channels
    description TEXT,
    avatar_url TEXT,
    -- Encryption settings
    encryption_enabled BOOLEAN DEFAULT true,
    -- Group settings
    max_members INTEGER DEFAULT 1000,
    is_public BOOLEAN DEFAULT false,
    invite_link TEXT UNIQUE,
    -- Metadata
    created_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Chat Members Table
CREATE TABLE public.chat_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    -- Permissions
    can_send_messages BOOLEAN DEFAULT true,
    can_add_members BOOLEAN DEFAULT false,
    can_edit_info BOOLEAN DEFAULT false,
    -- Status
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    muted_until TIMESTAMP WITH TIME ZONE,
    UNIQUE(chat_id, user_id)
);

-- 8. Messages Table (encrypted)
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    -- Message content (encrypted)
    encrypted_content TEXT NOT NULL,
    -- Message metadata
    type message_type DEFAULT 'text',
    reply_to_id UUID REFERENCES public.messages(id),
    -- Encryption metadata
    encryption_key_id UUID REFERENCES public.user_keys(id),
    sender_key_fingerprint TEXT,
    -- File attachments
    file_url TEXT,
    file_name TEXT,
    file_size BIGINT,
    file_mime_type TEXT,
    -- Status
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Message Recipients (for tracking delivery/read status)
CREATE TABLE public.message_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    -- Recipient-specific encrypted content key
    encrypted_message_key TEXT NOT NULL,
    -- Status
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, recipient_id)
);

-- 10. Contacts/Friends Table
CREATE TABLE public.user_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    -- Contact info
    display_name TEXT, -- Custom name for this contact
    is_blocked BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, contact_id),
    CHECK (user_id != contact_id)
);

-- 11. Blockchain Integration Table
CREATE TABLE public.blockchain_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    transaction_hash TEXT UNIQUE NOT NULL,
    transaction_type TEXT NOT NULL,
    -- Transaction data
    network TEXT NOT NULL DEFAULT 'ethereum',
    contract_address TEXT,
    gas_used BIGINT,
    gas_price BIGINT,
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    block_number BIGINT,
    confirmations INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_anonymous_id ON public.user_profiles(anonymous_id);
CREATE INDEX idx_user_profiles_last_seen ON public.user_profiles(last_seen);
CREATE INDEX idx_messages_chat_id_created_at ON public.messages(chat_id, created_at DESC);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_chat_members_user_id ON public.chat_members(user_id);
CREATE INDEX idx_chat_members_chat_id ON public.chat_members(chat_id);
CREATE INDEX idx_message_recipients_recipient_id ON public.message_recipients(recipient_id);
CREATE INDEX idx_user_contacts_user_id ON public.user_contacts(user_id);
CREATE INDEX idx_user_keys_user_id_active ON public.user_keys(user_id, is_active);
CREATE INDEX idx_blockchain_transactions_user_id ON public.blockchain_transactions(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_auth_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for User Profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Profile visibility policies (anonymous discovery)
CREATE POLICY "Public profiles are viewable" ON public.user_profiles
    FOR SELECT USING (
        visibility_mode = 'public' AND 
        auth.uid() IS NOT NULL
    );

-- RLS Policies for Authentication Methods
CREATE POLICY "Users can manage their own auth methods" ON public.user_auth_methods
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for User Keys (E2E encryption)
CREATE POLICY "Users can manage their own keys" ON public.user_keys
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for User Devices
CREATE POLICY "Users can manage their own devices" ON public.user_devices
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for Chats
CREATE POLICY "Users can view chats they're members of" ON public.chats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_members 
            WHERE chat_id = chats.id AND user_id = auth.uid()
        ) OR is_public = true
    );

CREATE POLICY "Users can create chats" ON public.chats
    FOR INSERT WITH CHECK (created_by = auth.uid());

-- RLS Policies for Chat Members
CREATE POLICY "Users can view members of their chats" ON public.chat_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_members cm2 
            WHERE cm2.chat_id = chat_members.chat_id AND cm2.user_id = auth.uid()
        )
    );

CREATE POLICY "Chat admins can manage members" ON public.chat_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.chat_members 
            WHERE chat_id = chat_members.chat_id 
            AND user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

-- RLS Policies for Messages
CREATE POLICY "Users can view messages in their chats" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_members 
            WHERE chat_id = messages.chat_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to their chats" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.chat_members 
            WHERE chat_id = messages.chat_id 
            AND user_id = auth.uid() 
            AND can_send_messages = true
        )
    );

-- RLS Policies for Message Recipients
CREATE POLICY "Recipients can view their message keys" ON public.message_recipients
    FOR SELECT USING (recipient_id = auth.uid());

-- RLS Policies for User Contacts
CREATE POLICY "Users can manage their own contacts" ON public.user_contacts
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for Blockchain Transactions
CREATE POLICY "Users can view their own transactions" ON public.blockchain_transactions
    FOR SELECT USING (user_id = auth.uid());

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chats_updated_at
    BEFORE UPDATE ON public.chats
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_contacts_updated_at
    BEFORE UPDATE ON public.user_contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name, anonymous_id)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'Anonymous User'),
        gen_random_uuid()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();