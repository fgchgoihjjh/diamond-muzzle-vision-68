
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all operations on user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow all operations on chat_conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Allow all operations on chat_conversation_messages" ON public.chat_conversation_messages;
DROP POLICY IF EXISTS "Allow all operations on api_usage" ON public.api_usage;

-- Create secure RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Admin policies for user_profiles (will need to implement admin role check later)
CREATE POLICY "Service role can manage all profiles" ON public.user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Create secure RLS policies for chat_conversations
CREATE POLICY "Users can view their own conversations" ON public.chat_conversations
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create conversations" ON public.chat_conversations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own conversations" ON public.chat_conversations
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create secure RLS policies for chat_conversation_messages
CREATE POLICY "Users can view messages in their conversations" ON public.chat_conversation_messages
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create messages" ON public.chat_conversation_messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create secure RLS policies for api_usage
CREATE POLICY "Users can view their own API usage" ON public.api_usage
  FOR SELECT USING (auth.uid()::text = client_id::text);

CREATE POLICY "Service can insert API usage" ON public.api_usage
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- Add user_id column to chat tables to properly associate with users
ALTER TABLE public.chat_conversations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.api_usage ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing policies to use user_id for proper user isolation
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can view their own API usage" ON public.api_usage;

CREATE POLICY "Users can view their own conversations" ON public.chat_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON public.chat_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own API usage" ON public.api_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON public.api_usage(user_id);
