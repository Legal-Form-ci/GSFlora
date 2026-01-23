-- Add new roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'educator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'censor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'founder';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'principal_teacher';

-- Create conversations table for messaging
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  type TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation participants
CREATE TABLE public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('grade', 'message', 'announcement', 'assignment', 'quiz', 'attendance', 'system')),
  title TEXT NOT NULL,
  content TEXT,
  reference_id UUID,
  reference_type TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Enable realtime for messages and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- RLS Policies for conversations
CREATE POLICY "Users can view their conversations"
ON public.conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for conversation_participants
CREATE POLICY "Users can view participants of their conversations"
ON public.conversation_participants FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp2
    WHERE cp2.conversation_id = conversation_participants.conversation_id AND cp2.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add participants to conversations"
ON public.conversation_participants FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own participation"
ON public.conversation_participants FOR UPDATE
USING (user_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages"
ON public.messages FOR UPDATE
USING (sender_id = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Admins can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (is_admin(auth.uid()) OR has_role(auth.uid(), 'teacher'::app_role));

-- Create indexes for performance
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_conversation_participants_user ON public.conversation_participants(user_id);

-- Function to update conversation updated_at
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update conversation timestamp on new message
CREATE TRIGGER update_conversation_on_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_timestamp();