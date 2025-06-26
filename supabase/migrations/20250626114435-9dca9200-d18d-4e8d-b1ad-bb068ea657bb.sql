
-- Create user_profiles table for user management
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  phone_number TEXT,
  status TEXT DEFAULT 'active',
  is_premium BOOLEAN DEFAULT false,
  subscription_plan TEXT DEFAULT 'free',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat_conversations table for AI chat sessions
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_title TEXT NOT NULL DEFAULT 'Diamond Consultation',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat_conversation_messages table for storing chat messages
CREATE TABLE public.chat_conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create api_usage table for tracking API calls and costs
CREATE TABLE public.api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID,
  telegram_id BIGINT,
  api_type TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  cost DECIMAL(10,6) DEFAULT 0,
  request_data JSONB,
  response_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security (we'll keep it simple for admin access)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for admin access (you can tighten these later)
CREATE POLICY "Allow all operations on user_profiles" ON public.user_profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations on chat_conversations" ON public.chat_conversations FOR ALL USING (true);
CREATE POLICY "Allow all operations on chat_conversation_messages" ON public.chat_conversation_messages FOR ALL USING (true);
CREATE POLICY "Allow all operations on api_usage" ON public.api_usage FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_telegram_id ON public.user_profiles(telegram_id);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_conversation_messages(conversation_id);
CREATE INDEX idx_api_usage_created_at ON public.api_usage(created_at);
CREATE INDEX idx_api_usage_telegram_id ON public.api_usage(telegram_id);
